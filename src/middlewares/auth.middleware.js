const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

/**
 * Middleware to verify JWT token and protect routes
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const authenticateJWT = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No token provided',
        statusCode: 401
      });
    }

    // Extract token from header
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed. Invalid token format',
        statusCode: 401
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find user by ID
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication failed. User not found',
          statusCode: 401
        });
      }

      // Attach user to request object
      req.user = user;
      
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Authentication failed. Token expired',
          statusCode: 401
        });
      }
      
      return res.status(401).json({
        success: false,
        message: 'Authentication failed. Invalid token',
        statusCode: 401
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication',
      error: error.message,
      statusCode: 500
    });
  }
};

module.exports = { authenticateJWT };
