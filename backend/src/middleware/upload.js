const multer = require('multer');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (!file.mimetype.match(/^image\/(jpeg|png|gif|webp)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// For post images
const uploadPostImage = upload.single('image');

const uploadMiddleware = (req, res, next) => {
  uploadPostImage(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          error: 'File size too large. Maximum size is 5MB'
        });
      }
      return res.status(400).json({
        error: err.message
      });
    } else if (err) {
      return res.status(400).json({
        error: err.message
      });
    }
    next();
  });
};

module.exports = uploadMiddleware; 