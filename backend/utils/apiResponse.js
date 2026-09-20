/**
 * Standardized API Response Helpers
 */

/**
 * Sends a standardized success JSON response
 * @param {import('express').Response} res
 * @param {*} data
 * @param {string} [message='Operation successful']
 * @param {number} [statusCode=200]
 * @param {object} [meta=null]
 */
const successResponse = (res, data = null, message = 'Operation successful', statusCode = 200, meta = null) => {
  const responsePayload = {
    success: true,
    statusCode,
    message,
    data,
  };

  if (meta) {
    responsePayload.meta = meta;
  }

  return res.status(statusCode).json(responsePayload);
};

/**
 * Sends a standardized error JSON response
 * @param {import('express').Response} res
 * @param {string} [message='An unexpected error occurred']
 * @param {number} [statusCode=500]
 * @param {*} [errors=null]
 */
const errorResponse = (res, message = 'An unexpected error occurred', statusCode = 500, errors = null) => {
  const responsePayload = {
    success: false,
    statusCode,
    message,
  };

  if (errors) {
    responsePayload.errors = errors;
  }

  return res.status(statusCode).json(responsePayload);
};

module.exports = {
  successResponse,
  errorResponse,
};
