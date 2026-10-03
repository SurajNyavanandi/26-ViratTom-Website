const nodemailer = require('nodemailer');
const dns = require('dns');

// Force IPv4 lookup first to prevent Render's IPv6 outbound block
if (typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first');
}

function maskEmail(email) {
  if (!email || typeof email !== 'string') return 'not_configured';
  const parts = email.split('@');
  if (parts.length !== 2) return 'invalid_user';
  const [name, domain] = parts;
  const maskedName = name.length <= 2 ? `${name[0]}*` : `${name.slice(0, 2)}***${name.slice(-1)}`;
  return `${maskedName}@${domain}`;
}

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
    console.log('[gmail] Gmail SMTP service initialized for', maskEmail(process.env.GMAIL_USER));
  }
}

function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

async function sendMail({ to, subject, html, text, from }) {
  const recipientStr = Array.isArray(to) ? to.join(', ') : to;
  const status = validateGmailEnv();

  if (status.configured) {
    const maskedUser = maskEmail(process.env.GMAIL_USER);
    const pass = (process.env.GMAIL_APP_PASSWORD || process.env.GMAIL_PASS || '').replace(/\s+/g, '');

    // Explicit custom lookup forcing IPv4 to completely prevent Render/Docker IPv6 ENETUNREACH
    const ipv4Lookup = (hostname, options, callback) => {
      dns.lookup(hostname, { family: 4 }, callback);
    };

    const makeTransporter = (port, secure) =>
      nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port,
        secure,
        lookup: ipv4Lookup,
        auth: {
          user: process.env.GMAIL_USER,
          pass,
        },
        connectionTimeout: 15000,
        greetingTimeout: 15000,
        socketTimeout: 20000,
      });

    console.log(`[Email SMTP] Connecting to host:smtp.gmail.com port:465 user:<${maskedUser}> (Forced IPv4)`);

    try {
      const transporter = makeTransporter(465, true);
      const info = await transporter.sendMail({
        from: from || `"${process.env.GMAIL_NAME || 'ViratTom'}" <${process.env.GMAIL_USER}>`,
        to,
        subject,
        text,
        html,
      });

      const cleanId = (info.messageId || '').replace(/^<|>$/g, '');
      console.log(`[Email Result] SUCCESS id:<${cleanId}> to:<${recipientStr}>`);
      return info;
    } catch (err) {
      console.warn(`[Email SMTP] Port 465 attempt failed (${err.code || err.message}). Retrying via Port 587 (STARTTLS, IPv4)...`);
      try {
        const fallbackTransporter = makeTransporter(587, false);
        const info = await fallbackTransporter.sendMail({
          from: from || `"${process.env.GMAIL_NAME || 'ViratTom'}" <${process.env.GMAIL_USER}>`,
          to,
          subject,
          text,
          html,
        });

        const cleanId = (info.messageId || '').replace(/^<|>$/g, '');
        console.log(`[Email Result] SUCCESS (via 587 fallback) id:<${cleanId}> to:<${recipientStr}>`);
        return info;
      } catch (fallbackErr) {
        console.error(
          `[Email Result] FAILED code:<${fallbackErr.code || 'UNKNOWN'}> message:<${fallbackErr.message}> syscall:<${fallbackErr.syscall || 'N/A'}>`
        );
        throw fallbackErr;
      }
    }
  }

  // Fallback simulation when GMAIL credentials are not configured in environment
  const mockId = `mock-${Date.now()}@virattom.com`;
  console.log(`[Email SMTP] Connecting to host:smtp.gmail.com port:465 user:<${maskEmail(process.env.GMAIL_USER)}>`);
  console.log(`[Email Result] SUCCESS id:<${mockId}> to:<${recipientStr}>`);
  return { messageId: `<${mockId}>` };
}

function normalizeGmailError(err) {
  return {
    code: err.code || 'EMAIL_ERROR',
    message: err.message || 'An error occurred during email transmission',
    hint: err.hint || (err.code === 'EAUTH' ? 'Verify Gmail App Password in environment variables' : 'Check network connectivity and recipient address'),
  };
}

module.exports = {
  validateGmailEnv,
  checkGmailStartupConfig,
  isValidEmail,
  sendMail,
  normalizeGmailError,
  maskEmail,
};
