const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const { bucket, getPublicUrl } = require('../config/storage');

const storage = multer.diskStorage({
  destination: 'uploads/profiles/',
  filename: (req, file, cb) => {
    cb(null, `profile-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Register
router.post('/register', upload.single('profilePhoto'), async (req, res) => {
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
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    // Create token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.status(200).json({ token, user: { ...user._doc, password: undefined } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;