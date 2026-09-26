const express = require('express');
const router = express.Router();
const {
  handleSendFresherEmail,
  handleSendExperiencedEmail,
  handleFresherWhatsApp,
  handleExperiencedWhatsApp,
  handleDownloadResume,
} = require('../controllers/outreachController');

router.post('/send-fresher-email', handleSendFresherEmail);
router.post('/send-experienced-email', handleSendExperiencedEmail);
router.post('/send-fresher-whatsapp', handleFresherWhatsApp);
router.post('/send-experienced-whatsapp', handleExperiencedWhatsApp);
router.get('/resume', handleDownloadResume);

module.exports = router;
