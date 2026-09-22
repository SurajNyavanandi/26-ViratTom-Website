const express = require('express');
const router = express.Router();
const healthRoutes = require('./healthRoutes');
const authRoutes = require('./authRoutes');
const {
  getProjects,
  submitLead,
  verifyOtp,
  generateResume,
  loginAdmin,
  getLeads,
  requestEmailOtpHandler,
  verifyEmailOtpHandler,
  checkClientPhone,
  loginClient,
  getClientProject,
  confirmAdvancePayment,
  createRazorpayOrder,
  verifyRazorpayPayment,
  addClientFeedback,
  getAdminProjects,
  updateAdminProject,
  createAdminProject,
  deleteAdminProject,
} = require('../controllers/siteController');
const { handleAssistantChat } = require('../controllers/assistantController');
const { protectAdmin, protectClient } = require('../middleware/authMiddleware');

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);

router.get('/projects', getProjects);
router.post('/lead', submitLead);
router.post('/lead/request-email-otp', requestEmailOtpHandler);
router.post('/lead/verify-email-otp', verifyEmailOtpHandler);
router.post('/verify-otp', verifyOtp);
router.post('/resume', generateResume);
router.post('/chat', handleAssistantChat);

// Client portal authentication & authorized operations
router.post('/client/check-phone', checkClientPhone);
router.post('/client/login', loginClient);
router.get('/client/project', protectClient, getClientProject);
router.post('/client/razorpay/create-order', protectClient, createRazorpayOrder);
router.post('/client/create-razorpay-order', protectClient, createRazorpayOrder);
router.post('/client/razorpay/verify', protectClient, verifyRazorpayPayment);
router.post('/client/verify-razorpay-payment', protectClient, verifyRazorpayPayment);
router.post('/client/confirm-advance', protectClient, confirmAdvancePayment);
router.post('/client/feedback', protectClient, addClientFeedback);

// Admin portal authentication & authorized operations
router.post('/admin/login', loginAdmin);
router.get('/admin/leads', protectAdmin, getLeads);
router.get('/admin/projects', protectAdmin, getAdminProjects);
router.put('/admin/projects/:id', protectAdmin, updateAdminProject);
router.post('/admin/projects', protectAdmin, createAdminProject);
router.delete('/admin/projects/:id', protectAdmin, deleteAdminProject);

module.exports = router;
