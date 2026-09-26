const path = require('path');
const fs = require('fs');
const {
  sendFresherEmail,
  sendExperiencedEmail,
  generateFresherWhatsApp,
  generateExperiencedWhatsApp,
  getResumePath,
} = require('../services/outreachService');

const handleSendFresherEmail = async (req, res) => {
  try {
    const { emails } = req.body || {};

    if (!emails || (Array.isArray(emails) && emails.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Emails are required',
      });
    }

    const resumePath = getResumePath();
    if (!resumePath) {
      return res.status(404).json({
        success: false,
        message: 'Resume file not found',
      });
    }

    const results = await sendFresherEmail({ emails });
    const hasFailures = results.some((r) => r.success === false);

    return res.json({
      success: !hasFailures,
      message: 'Fresher emails sent successfully',
      results,
    });
  } catch (error) {
    console.error('[Outreach Controller Error] send-fresher-email:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to send fresher email',
    });
  }
};

const handleSendExperiencedEmail = async (req, res) => {
  try {
    const { emails } = req.body || {};

    if (!emails || (Array.isArray(emails) && emails.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Emails are required',
      });
    }

    const resumePath = getResumePath();
    if (!resumePath) {
      return res.status(404).json({
        success: false,
        message: 'Resume file not found',
      });
    }

    const results = await sendExperiencedEmail({ emails });
    const hasFailures = results.some((r) => r.success === false);

    return res.json({
      success: !hasFailures,
      message: 'Experienced emails sent successfully',
      results,
    });
  } catch (error) {
    console.error('[Outreach Controller Error] send-experienced-email:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to send experienced email',
    });
  }
};

const handleFresherWhatsApp = async (req, res) => {
  try {
    const { number } = req.body || {};

    if (!number) {
      return res.status(400).json({
        success: false,
        message: 'Number is required',
      });
    }

    const result = generateFresherWhatsApp(number);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate fresher WhatsApp link',
    });
  }
};

const handleExperiencedWhatsApp = async (req, res) => {
  try {
    const { number } = req.body || {};

    if (!number) {
      return res.status(400).json({
        success: false,
        message: 'Number is required',
      });
    }

    const result = generateExperiencedWhatsApp(number);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate experienced WhatsApp link',
    });
  }
};

const handleDownloadResume = (req, res) => {
  const resumePath = getResumePath();
  if (!resumePath || !fs.existsSync(resumePath)) {
    return res.status(404).json({ success: false, message: 'Resume file not found' });
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="SurajNyavanandi-Resume.pdf"');
  return fs.createReadStream(resumePath).pipe(res);
};

module.exports = {
  handleSendFresherEmail,
  handleSendExperiencedEmail,
  handleFresherWhatsApp,
  handleExperiencedWhatsApp,
  handleDownloadResume,
};
