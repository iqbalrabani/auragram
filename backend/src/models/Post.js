const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  caption: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.id; // Remove the duplicate id field
      return ret;
    }
  },
  toObject: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.id; // Remove the duplicate id field
      return ret;
    }
  }
});

// Add virtual for commentCount
postSchema.virtual('commentCount', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'post',
  count: true // Count documents instead of listing them
});

module.exports = mongoose.model('Post', postSchema);