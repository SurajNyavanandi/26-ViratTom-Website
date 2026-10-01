const { errorResponse } = require('./apiResponse');
const { logApiError } = require('./diagnosticLogger');

/**
 * Async handler wrapper to forward errors to next()
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Global Express Error Handling Middleware
 * Intercepts all Express route failures and prints zero-guesswork diagnostic log
 */
const errorHandler = (err, req, res, _next) => {
  const statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
  const message = err.message || 'Internal Server Error';

  // Print full diagnostic banner if 5xx or unexpected error
  if (statusCode >= 500 || process.env.NODE_ENV !== 'production') {
    logApiError(req, err);
  }

  return errorResponse(
    res,
    message,
    statusCode,
    process.env.NODE_ENV === 'development' ? { stack: err.stack } : null
  );
};

/**
 * 404 Not Found Middleware
 */
const notFoundHandler = (req, res, next) => {
  const error = new Error(`Resource Not Found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

module.exports = {
  asyncHandler,
  errorHandler,
  notFoundHandler,
};

