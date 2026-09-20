const express = require('express');
const router = express.Router();
const healthRoutes = require('./healthRoutes');
const authRoutes = require('./authRoutes');

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);

module.exports = router;
