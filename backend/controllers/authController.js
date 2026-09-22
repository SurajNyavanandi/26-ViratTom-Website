const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { asyncHandler } = require('../utils/errorHandler');

// Resilient memory store for offline operation
const inMemoryUsers = new Map();

/**
 * Register User
 * POST /api/auth/register
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return errorResponse(res, 'Please provide name, email, and password', 400);
  }

  const normalizedEmail = email.toLowerCase().trim();

  // If MongoDB is connected, use Mongoose
  if (mongoose.connection.readyState === 1) {
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return errorResponse(res, 'An account with this email already exists', 400);
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
    });

    const token = user.getSignedJwtToken();

    return successResponse(
      res,
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      },
      'User registered successfully',
      201
    );
  }

  // Resilient memory fallback
  if (inMemoryUsers.has(normalizedEmail)) {
    return errorResponse(res, 'An account with this email already exists', 400);
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const userId = 'usr_' + Date.now();

  const memUser = {
    _id: userId,
    id: userId,
    name,
    email: normalizedEmail,
    password: hashedPassword,
    role: 'user',
  };
  inMemoryUsers.set(normalizedEmail, memUser);

  const token = jwt.sign(
    { id: userId, role: 'user', name, email: normalizedEmail },
    process.env.JWT_SECRET || 'virat-tom-secure-jwt-secret-key-2026',
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );

  return successResponse(
    res,
    {
      user: {
        id: userId,
        name,
        email: normalizedEmail,
        role: 'user',
      },
      token,
    },
    'User registered successfully',
    201
  );
});

/**
 * Login User
 * POST /api/auth/login
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return errorResponse(res, 'Please provide email and password', 400);
  }

  const normalizedEmail = email.toLowerCase().trim();

  // If MongoDB is connected, use Mongoose
  if (mongoose.connection.readyState === 1) {
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    const token = user.getSignedJwtToken();

    return successResponse(
      res,
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      },
      'User logged in successfully',
      200
    );
  }

  // Resilient memory fallback
  const memUser = inMemoryUsers.get(normalizedEmail);
  if (!memUser) {
    return errorResponse(res, 'Invalid credentials', 401);
  }

  const isMatch = await bcrypt.compare(password, memUser.password);
  if (!isMatch) {
    return errorResponse(res, 'Invalid credentials', 401);
  }

  const token = jwt.sign(
    { id: memUser.id, role: memUser.role, name: memUser.name, email: memUser.email },
    process.env.JWT_SECRET || 'virat-tom-secure-jwt-secret-key-2026',
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );

  return successResponse(
    res,
    {
      user: {
        id: memUser.id,
        name: memUser.name,
        email: memUser.email,
        role: memUser.role,
      },
      token,
    },
    'User logged in successfully',
    200
  );
});

/**
 * Get Current Logged-in User
 * GET /api/auth/me
 */
const getMe = asyncHandler(async (req, res) => {
  return successResponse(res, { user: req.user }, 'Current user retrieved', 200);
});

module.exports = {
  register,
  login,
  getMe,
};
