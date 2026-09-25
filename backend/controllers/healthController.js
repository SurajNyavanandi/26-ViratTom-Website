const mongoose = require('mongoose');
const { successResponse } = require('../utils/apiResponse');
const { asyncHandler } = require('../utils/errorHandler');

/**
 * Health Check Controller
 */
const getHealthStatus = asyncHandler(async (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  const dbLabel = isDbConnected ? 'Connected' : 'Fallback-Memory';
  const corsLabel = process.env.CORS_ORIGIN || 'virattom.com,*run.app,localhost';
  const authLabel = process.env.JWT_SECRET && process.env.ADMIN_EMAIL ? 'Configured' : 'Configured (Default-Key)';
  const port = process.env.PORT || 3000;

  console.log(`[System Status] DB: ${dbLabel} | CORS: ${corsLabel} | API: Ready (:${port}) | Auth: ${authLabel}`);

  const healthData = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    database: {
      status: dbLabel,
      connected: isDbConnected,
    },
    cors: corsLabel,
    auth: authLabel,
  };

  return successResponse(res, healthData, 'OK', 200);
});

module.exports = {
  getHealthStatus,
};
