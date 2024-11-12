const router = require('express').Router();
const Comment = require('../models/Comment');
const auth = require('../middleware/auth');

// Add comment
router.post('/:postId', auth, async (req, res) => {
  try {
    const comment = new Comment({
      post: req.params.postId,
      user: req.user.id,
      content: req.body.content
    });

    await comment.save();
    await comment.populate('user', '-password');
    res.json(comment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get comments for a post
router.get('/:postId', auth, async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate('user', '-password')
      .sort('-createdAt');
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;