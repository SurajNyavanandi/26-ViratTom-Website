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
  addClientFeedback,
  getAdminProjects,
  updateAdminProject,
  createAdminProject,
  deleteAdminProject,
} = require('../controllers/siteController');
const { handleAssistantChat } = require('../controllers/assistantController');

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);

router.get('/projects', getProjects);
router.post('/lead', submitLead);
router.post('/lead/request-email-otp', requestEmailOtpHandler);
router.post('/lead/verify-email-otp', verifyEmailOtpHandler);
router.post('/verify-otp', verifyOtp);
router.post('/resume', generateResume);
router.post('/chat', handleAssistantChat);

router.post('/client/check-phone', checkClientPhone);
router.post('/client/login', loginClient);
router.get('/client/project', getClientProject);
router.post('/client/confirm-advance', confirmAdvancePayment);
router.post('/client/feedback', addClientFeedback);

router.post('/admin/login', loginAdmin);
router.get('/admin/leads', getLeads);
router.get('/admin/projects', getAdminProjects);
router.put('/admin/projects/:id', updateAdminProject);
router.post('/admin/projects', createAdminProject);
router.delete('/admin/projects/:id', deleteAdminProject);

module.exports = router;
