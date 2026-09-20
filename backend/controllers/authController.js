const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { asyncHandler } = require('../utils/errorHandler');

/**
 * Register User
 * POST /api/auth/register
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return errorResponse(res, 'Please provide name, email, and password', 400);
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    return errorResponse(res, 'An account with this email already exists', 400);
  }

  const user = await User.create({
    name,
    email,
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

  const user = await User.findOne({ email }).select('+password');
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
