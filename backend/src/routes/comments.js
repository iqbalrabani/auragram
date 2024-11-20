const router = require('express').Router();
const Comment = require('../models/Comment');
const auth = require('../middleware/auth');

// Add comment
router.post('/:postId', auth, async (req, res) => {
  try {
    // DANGEROUS: Directly accepting and storing raw HTML/JavaScript
    let content = req.body.content;
    
    // DANGEROUS: Allow script tags to be executed
    if (!content.includes('<script>')) {
      // If no script tag, wrap content in a div to ensure HTML rendering
      content = `<div>${content}</div>`;
    }
    
    const comment = new Comment({
      post: req.params.postId,
      user: req.user.id,
      content: req.body.content
    });

    await comment.save();
    await comment.populate('user', '-password');
    res.status(201).json(comment);
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
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:commentId', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Check if the user owns the comment
    // if (comment.user.toString() !== req.user.id) {
    //   return res.status(403).json({ error: 'Not authorized to delete this comment' });
    // }

    await comment.deleteOne();
    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;