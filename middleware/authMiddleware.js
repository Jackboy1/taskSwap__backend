import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
  // Extract the token from the Authorization header
  const authHeader = req.header('Authorization');
  let token;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1]; // Extract token after 'Bearer '
  }

  // Check if token is provided
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    // Verify the token using the secret from .env
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id }; // Attach user ID to request object
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

export default authMiddleware;

// The middleware parse and verify the token.
// The JWT_SECRET must match the one used to sign the token in authController.js