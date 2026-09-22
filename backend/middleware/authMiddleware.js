const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
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
    if (mongoose.connection.readyState === 1) {
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return errorResponse(res, 'User not found', 401);
      }
    } else {
      req.user = {
        _id: decoded.id,
        id: decoded.id,
        role: decoded.role || 'user',
        name: decoded.name || 'User',
        email: decoded.email || 'user@virattom.com',
      };
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

/**
 * Protect Admin routes
 */
const protectAdmin = (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, error: 'Admin authorization token required' });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'virat-tom-secure-jwt-secret-key-2026'
    );
    if (decoded.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Forbidden: Admin role required' });
    }
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ success: false, error: 'Session expired or invalid token' });
  }
};

/**
 * Protect Client portal routes
 */
const protectClient = (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, error: 'Client authorization token required' });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'virat-tom-secure-jwt-secret-key-2026'
    );
    if (decoded.role !== 'client') {
      return res.status(403).json({ success: false, error: 'Forbidden: Client access required' });
    }
    req.client = decoded;
    next();
  } catch {
    return res.status(401).json({ success: false, error: 'Session expired or invalid token' });
  }
};

module.exports = {
  protect,
  authorize,
  protectAdmin,
  protectClient,
};

