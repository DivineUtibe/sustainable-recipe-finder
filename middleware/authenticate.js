const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  // Check for token in Authorization header or cookies
  const authHeader = req.header('Authorization');
  const token = authHeader
    ? authHeader.split(' ')[1] // Extract token after 'Bearer '
    : req.cookies?.accessToken; // Fallback to cookies if no Authorization header

  if (!token) {
    return res.status(401).json({ message: 'Access Denied. Please log in.' });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET); // Verify token
    console.log('JWT Verified:', verified); // Debug log
    
    // Ensure userId exists in the decoded token
    if (!verified.userId) {
      return res.status(400).json({ message: 'Invalid token structure, userId not found' });
    }

    req.user = { userId: verified.userId }; // Attach the userId to req.user
    console.log('Authenticated User:', req.user); // Debug log
    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token. Please log in again.', error: err.message });
  }
};

module.exports = authenticate;