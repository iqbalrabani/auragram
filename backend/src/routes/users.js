const router = require('express').Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { bucket, getPublicUrl } = require('../config/storage');
const uploadMiddleware = require('../middleware/upload');
const bcrypt = require('bcryptjs');

// Get user profile
router.get('/:username', auth, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user profile
router.put('/update', auth, uploadMiddleware, async (req, res) => {
  try {
    const { username, displayName, bio, deletePhoto } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if username exists (if username is being changed)
    if (username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ error: 'Username already exists' });
      }
    }

    // Handle profile photo deletion
    if (deletePhoto === 'true') {
      if (user.profilePhoto && 
          user.profilePhoto.includes('storage.googleapis.com') && 
          user.profilePhoto !== process.env.REACT_APP_DEFAULT_PP) {
        const fileName = user.profilePhoto.split('/').pop();
        try {
          await bucket.file(`profiles/${fileName}`).delete();
        } catch (error) {
          console.error('Error deleting from cloud storage:', error);
        }
      }
      user.profilePhoto = process.env.REACT_APP_DEFAULT_PP;
    }
    // Handle new photo upload
    else if (req.file) {
      const blobName = `profiles/${Date.now()}-${path.basename(req.file.originalname)}`;
      const blob = bucket.file(blobName);
      const blobStream = blob.createWriteStream({
        metadata: {
          contentType: req.file.mimetype
        }
      });

      return new Promise((resolve, reject) => {
        blobStream.on('error', (err) => {
          console.error('Upload error:', err);
          reject(new Error('Unable to upload image'));
        });

        blobStream.on('finish', async () => {
          try {
            await blob.makePublic();
            const publicUrl = getPublicUrl(blobName);
            
            if (user.profilePhoto && user.profilePhoto.includes('storage.googleapis.com')) {
              const oldFileName = user.profilePhoto.split('/').pop();
              try {
                await bucket.file(`profiles/${oldFileName}`).delete();
              } catch (error) {
                console.error('Error deleting old photo:', error);
              }
            }

            user.profilePhoto = publicUrl;
            user.username = username || user.username;
            user.displayName = displayName || user.displayName;
            user.bio = bio !== undefined ? bio : user.bio;

            const savedUser = await user.save();
            resolve(res.json({ ...savedUser._doc, password: undefined }));
          } catch (error) {
            reject(error);
          }
        });

        blobStream.end(req.file.buffer);
      });
    }

    // Update other fields
    user.username = username || user.username;
    user.displayName = displayName || user.displayName;
    user.bio = bio !== undefined ? bio : user.bio;

    const savedUser = await user.save();
    res.json({ ...savedUser._doc, password: undefined });
  } catch (error) {
    // Mongoose duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    console.error('Route error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Change password
router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

module.exports = router; 