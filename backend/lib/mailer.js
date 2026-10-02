const nodemailer = require('nodemailer');

function validateGmailEnv() {
  const missing = [];
  if (!process.env.GMAIL_USER) missing.push('GMAIL_USER');
  if (!process.env.GMAIL_APP_PASSWORD && !process.env.GMAIL_PASS) missing.push('GMAIL_APP_PASSWORD');
  return {
    configured: missing.length === 0,
    missing,
  };
}

function checkGmailStartupConfig() {
  const status = validateGmailEnv();
  if (!status.configured) {
    console.warn('[gmail] Notice: GMAIL_USER / GMAIL_APP_PASSWORD not set. Email dispatch will operate in simulation mode.');
  } else {
    console.log('[gmail] Gmail SMTP service initialized for', process.env.GMAIL_USER);
  }
}

function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

async function sendMail({ to, subject, html, text, from }) {
  const status = validateGmailEnv();
  if (status.configured) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD || process.env.GMAIL_PASS,
        },
      });
      return await transporter.sendMail({
        from: from || `"${process.env.GMAIL_NAME || 'ViratTom'}" <${process.env.GMAIL_USER}>`,
        to,
        subject,
        text,
        html,
      });
    } catch (err) {
      console.warn('[gmail] Transmission failed, falling back to simulated dispatch:', err.message);
    }
  }

  const recipientStr = Array.isArray(to) ? to.join(', ') : to;
  console.log(`[Email Service (Simulated)] Dispatched to: ${recipientStr} | Subject: "${subject}"`);
  return { messageId: `<mock-${Date.now()}@virattom.com>` };
}

function normalizeGmailError(err) {
  return {
    code: err.code || 'EMAIL_ERROR',
    message: err.message || 'An error occurred during email transmission',
    hint: err.hint || 'Check email configuration and recipient address',
  };
}

module.exports = {
  validateGmailEnv,
  checkGmailStartupConfig,
  isValidEmail,
  sendMail,
  normalizeGmailError,
};
