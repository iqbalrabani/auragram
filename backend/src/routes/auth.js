const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const path = require('path');
const { bucket, getPublicUrl } = require('../config/storage');
const rateLimiter = require('../services/rateLimiter');
const uploadMiddleware = require('../middleware/upload');

// Register
router.post('/register', uploadMiddleware, async (req, res) => {
  try {
    const { username, displayName, password, bio } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let profilePhotoUrl = getPublicUrl('profiles/default-profile.jpg');

    if (req.file) {
      const blob = bucket.file(`profiles/${Date.now()}-${req.file.originalname}`);
      const blobStream = blob.createWriteStream();

      await new Promise((resolve, reject) => {
        blobStream.on('error', reject);
        blobStream.on('finish', async () => {
          await blob.makePublic();
          profilePhotoUrl = getPublicUrl(blob.name);
          resolve();
        });
        blobStream.end(req.file.buffer);
      });
    }

    const user = new User({
      username,
      displayName,
      password: hashedPassword,
      bio,
      profilePhoto: profilePhotoUrl
    });

    await user.save();
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.status(201).json({ token, user: { ...user._doc, password: undefined } });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const ip = req.ip;

    // Check if the IP is locked
    if (rateLimiter.isLocked(ip)) {
      const timeLeft = rateLimiter.getLockTimeRemaining(ip);
      return res.status(423).json({
        error: `Too many failed attempts from your IP. Please try again in ${timeLeft} minutes.`
      });
    }

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      // Don't increment counter for non-existent users to prevent user enumeration
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      const attemptsLeft = rateLimiter.recordFailedAttempt(ip);

      if (attemptsLeft <= 0) {
        return res.status(423).json({
          error: 'Too many failed attempts. Your IP has been temporarily blocked.'
        });
      }

      return res.status(400).json({
        error: `Invalid password. ${attemptsLeft} attempts remaining before temporary IP block.`
      });
    }

    // Reset attempts on successful login
    rateLimiter.resetAttempts(ip);

    // Create token and complete login
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.status(200).json({ token, user: { ...user._doc, password: undefined } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;