const mongoose = require('mongoose');
const { successResponse } = require('../utils/apiResponse');
const { asyncHandler } = require('../utils/errorHandler');

/**
 * Health Check Controller
 */
const getHealthStatus = asyncHandler(async (req, res) => {
  const dbState = mongoose.connection.readyState;

  const healthData = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    database: {
      connected: dbState === 1,
    },
  };

  return successResponse(res, healthData, 'OK', 200);
});

module.exports = {
  getHealthStatus,
};
