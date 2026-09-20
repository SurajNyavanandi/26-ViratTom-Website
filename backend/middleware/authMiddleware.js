const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { errorResponse } = require('../utils/apiResponse');

/**
 * Protect routes - verifies Bearer JWT token
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return errorResponse(res, 'Not authorized to access this route', 401);
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'virat-tom-secure-jwt-secret-key-2026'
    );
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return errorResponse(res, 'User not found', 401);
    }
    next();
  } catch {
    return errorResponse(res, 'Invalid or expired token', 401);
  }
};

/**
 * Grant access to specific roles (e.g. 'admin')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return errorResponse(
        res,
        `User role '${req.user ? req.user.role : 'none'}' is not authorized`,
        403
      );
    }
    next();
  };
};

module.exports = {
  protect,
  authorize,
};
