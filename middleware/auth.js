const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    // Use a fallback secret if JWT_SECRET is not set
    const JWT_SECRET = process.env.JWT_SECRET || 'your-default-secret-key-startraders-2024';

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Find user by ID from token
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token - user not found'
      });
    }

    // Add user info to request object
    req.user = {
      userId: user._id,
      email: user.email,
      username: user.username || user.email
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Authentication error'
      });
    }
  }
};

// Admin authentication middleware
const authenticateAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Admin access token required'
      });
    }

    const JWT_SECRET = process.env.JWT_SECRET || 'your-default-secret-key-startraders-2024';
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin token'
      });
    }

    // Check if user is admin (you can customize this logic)
    if (!user.isAdmin && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    req.user = {
      userId: user._id,
      email: user.email,
      username: user.username || user.email,
      isAdmin: true
    };

    next();
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    return res.status(401).json({
      success: false,
      message: 'Admin authentication failed'
    });
  }
};

module.exports = {
  authenticateToken,
  authenticateAdmin
};