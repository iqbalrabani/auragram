const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log('Token:', token);
    console.log('Decoded:', decoded);
    next();
  } catch (error) {
    res.status(401).json({ 
      error: error.message,
      stack: error.stack,
      token: req.header('Authorization')
    });
  }
};

module.exports = auth;