const express = require('express');
const router = express.Router();
const healthRoutes = require('./healthRoutes');
const authRoutes = require('./authRoutes');
const outreachRoutes = require('./outreachRoutes');
const {
  handleSendFresherEmail,
  handleSendExperiencedEmail,
  handleFresherWhatsApp,
  handleExperiencedWhatsApp,
} = require('../controllers/outreachController');
const {
  getProjects,
  submitLead,
  verifyOtp,
  generateResume,
  getResumeStats,
  trackResumeDownload,
  loginAdmin,
  requestAdminForgotPassword,
  resetAdminPassword,
  changeAdminPassword,
  getLeads,
  requestEmailOtpHandler,
  verifyEmailOtpHandler,
  checkClientPhone,
  loginClient,
  getClientProject,
  confirmAdvancePayment,
  createRazorpayOrder,
  verifyRazorpayPayment,
  handleRazorpayWebhook,
  addClientFeedback,
  getAdminProjects,
  updateAdminProject,
  createAdminProject,
  deleteAdminProject,
} = require('../controllers/siteController');
const { handleAssistantChat } = require('../controllers/assistantController');
const { protectAdmin, protectClient } = require('../middleware/authMiddleware');
const { dispatchAlert } = require('../services/alertService');

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);

router.get('/projects', getProjects);
router.post('/lead', submitLead);
router.post('/lead/request-email-otp', requestEmailOtpHandler);
router.post('/lead/verify-email-otp', verifyEmailOtpHandler);
router.post('/verify-otp', verifyOtp);
router.post('/resume', generateResume);
router.get('/resume/stats', getResumeStats);
router.post('/resume/track-download', trackResumeDownload);
router.post('/chat', handleAssistantChat);

// Recruiter Outreach & Direct Dispatch Services
router.use('/outreach', outreachRoutes);
router.post('/send-fresher-email', handleSendFresherEmail);
router.post('/send-experienced-email', handleSendExperiencedEmail);
router.post('/send-fresher-whatsapp', handleFresherWhatsApp);
router.post('/send-experienced-whatsapp', handleExperiencedWhatsApp);

// Razorpay Webhooks (Automated asynchronous reconciliation)
router.post('/payment/razorpay-webhook', handleRazorpayWebhook);
router.post('/razorpay/webhook', handleRazorpayWebhook);

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
router.post('/admin/forgot-password', requestAdminForgotPassword);
router.post('/admin/reset-password', resetAdminPassword);
router.post('/admin/change-password', protectAdmin, changeAdminPassword);
router.get('/admin/leads', protectAdmin, getLeads);
router.get('/admin/projects', protectAdmin, getAdminProjects);
router.put('/admin/projects/:id', protectAdmin, updateAdminProject);
router.post('/admin/projects', protectAdmin, createAdminProject);
router.delete('/admin/projects/:id', protectAdmin, deleteAdminProject);

// Admin trigger test alert
router.post('/admin/test-alert', protectAdmin, async (req, res) => {
  const { channel = 'all', message = 'Test alert from ViratTom Control Center' } = req.body || {};
  await dispatchAlert({
    type: 'ADMIN_TEST',
    title: '🔔 System Test Alert',
    message,
    meta: { triggeredBy: req.user?.email || 'admin', channel, status: 'Active' },
  });
  return res.json({ success: true, message: 'Test alert sent across configured webhooks.' });
});

module.exports = router;
