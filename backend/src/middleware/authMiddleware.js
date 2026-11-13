// Provides JWT creation and verification functions.
const jwt = require('jsonwebtoken');
// Loads JWT_SECRET and other environment settings.
require('dotenv').config();

// Requires a valid Bearer token and stores its decoded user data on req.user.
exports.authenticate = (req, res, next) => {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  const token = header.split(' ')[1];
  try {
    // Verification checks the signature and expiration before trusting the payload.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    // Give expired tokens a more useful message than other invalid tokens.
    const msg = err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token';
    return res.status(401).json({ message: msg });
  }
};
