const router = require('express').Router();
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { bucket, getPublicUrl } = require('../config/storage');
const uploadMiddleware = require('../middleware/upload');

// Create post
router.post('/', auth, uploadMiddleware, async (req, res) => {
  try {
    const { caption } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'Image is required' });
    }

    // Upload to Cloud Storage
    const originalExtension = path.extname(req.file.originalname);
    const blobName = `posts/${Date.now()}${originalExtension}`;
    const blob = bucket.file(blobName);
    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: req.file.mimetype
      }
    });

    blobStream.on('error', (err) => {
      console.error('Upload error:', err);
      res.status(500).json({ error: 'Unable to upload image' });
    });

    blobStream.on('finish', async () => {
      try {
        // Make the file public
        await blob.makePublic();
        
        // Get the public URL
        const publicUrl = getPublicUrl(blobName);
        
        // Create post with Cloud Storage URL
        const post = new Post({
          user: req.user.id,
          image: publicUrl,
          caption
        });

        const savedPost = await post.save();
        await savedPost.populate('user', '-password');
        
        console.log('Saved post:', savedPost); // Add this for debugging
        res.status(201).json(savedPost);
      } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Failed to save post' });
      }
    });

    blobStream.end(req.file.buffer);
  } catch (error) {
    console.error('Route error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all posts
router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('user', '-password')
      .populate('commentCount')
      .sort('-createdAt');
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single post
router.get('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('user', '-password')
      .populate('commentCount');
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete post
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Remove authorization check to allow anyone to delete any post
    await Comment.deleteMany({ post: req.params.id });
    await post.deleteOne();
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Edit post
router.put('/:id', auth, async (req, res) => {
  try {
    const { caption } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if the user is the owner of the post
    if (post.user.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to edit this post' });
    }

    post.caption = caption;
    await post.save();

    // Populate user info before sending response
    await post.populate('user', '-password');
    res.json(post);
  } catch (error) {
    console.error('Edit post error:', error);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

module.exports = router;