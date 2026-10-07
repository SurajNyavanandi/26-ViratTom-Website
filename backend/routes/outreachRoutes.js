const express = require('express');
const router = express.Router();
const {
  handleSendFresherEmail,
  handleSendExperiencedEmail,
  handleFresherWhatsApp,
  handleExperiencedWhatsApp,
  handleDownloadResume,
} = require('../controllers/outreachController');
const { protectAdmin } = require('../middleware/authMiddleware');

router.post('/send-fresher-email', protectAdmin, handleSendFresherEmail);
router.post('/send-experienced-email', protectAdmin, handleSendExperiencedEmail);
router.post('/send-fresher-whatsapp', protectAdmin, handleFresherWhatsApp);
router.post('/send-experienced-whatsapp', protectAdmin, handleExperiencedWhatsApp);
router.get('/resume-pdf', handleDownloadResume);
router.get('/download-resume', handleDownloadResume);

// Conditional handler for /resume: only download if explicitly requested as PDF
router.all('/resume', (req, res, next) => {
  if (
    req.query.download === 'true' ||
    req.query.format === 'pdf' ||
    (req.headers.accept && req.headers.accept.includes('application/pdf'))
  ) {
    return handleDownloadResume(req, res);
  }
  return next();
});

module.exports = router;
