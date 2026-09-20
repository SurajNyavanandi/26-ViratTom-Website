const express = require('express');
const router = express.Router();
const { getHealthStatus } = require('../controllers/healthController');

/**
 * @route   GET /api/health
 * @desc    Get API health status, server uptime, and database connectivity
 * @access  Public
 */
router.get('/', getHealthStatus);

module.exports = router;
