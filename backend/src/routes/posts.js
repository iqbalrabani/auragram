const router = require('express').Router();
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: 'uploads/posts/',
  filename: (req, file, cb) => {
    cb(null, `post-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage });

// Create post
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const { caption } = req.body;
    
    const post = new Post({
      user: req.user.id,
      caption,
      image: `/uploads/posts/${req.file.filename}`
    });

    await post.save();
    await post.populate('user', '-password');
    
    res.status(201).json(post);
  } catch (error) {
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

//auth in param (sec code)
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }


    // Identification and Authentication Failures - All users can delete any post

    
    // // Check if the user owns the post
    // if (post.user.toString() !== req.user.id) {
    //   return res.status(403).json({ error: 'Not authorized to delete this post' });
    // }

    // Delete the image file
    const imagePath = path.join(__dirname, '../../', post.image);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    // Delete all comments associated with the post
    await Comment.deleteMany({ post: req.params.id });

    await post.deleteOne();
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;