const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    const JWT_SECRET = "466f7d73f414f7c8a7ee956fb371dd21a68ed20de5e4b2eb6512990df1343be0";
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate' });
  }
};

module.exports = auth;


