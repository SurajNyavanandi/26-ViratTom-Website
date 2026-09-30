const nodemailer = require('nodemailer');
const dns = require('dns');

/**
 * ============================================================================
 * ViratTom Centralized Mailer Service
 * ============================================================================
 * Reusable utility for handling all OTPs and transactional notifications.
 * Uses Gmail SMTP authenticated via SMTP_USER and SMTP_PASS.
 */

// Custom lookup resolver that guarantees pure IPv4 A-records and completely bypasses unrouted IPv6
function ipv4DnsLookup(hostname, options, callback) {
  dns.resolve4(hostname, (err, addresses) => {
    if (!err && Array.isArray(addresses) && addresses.length > 0) {
      return callback(null, addresses[0], 4);
    }
    // Fallback if direct resolve4 fails
    dns.lookup(hostname, { family: 4 }, callback);
  });
}

function createTransporter(configOverride = {}) {
  const user = (process.env.SMTP_USER || process.env.EMAIL_USER || '').trim();
  const rawPass = (process.env.SMTP_PASS || process.env.SMTP_PASSWORD || process.env.EMAIL_PASS || '').trim();
  // Strip quotes and all spaces from 16-character Google App Password (e.g. "abcd efgh ijkl mnop" -> "abcdefghijklmnop")
  const pass = rawPass.replace(/['"\s]/g, '');

  if (!user || !pass || pass.includes('your_') || pass.includes('placeholder')) {
    return null;
  }

  const port = configOverride.port || Number(process.env.SMTP_PORT) || 465;
  const isSecure = port === 465;

  // Enforce pure IPv4 resolution to prevent ENETUNREACH errors on cloud container platforms (Render, Docker)
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port,
    secure: isSecure,
    family: 4, // Force IPv4 socket
    lookup: ipv4DnsLookup, // Direct A-record lookup completely preventing IPv6 (2607:...) selection
    auth: {
      user,
      pass,
    },
    pool: true,
    maxConnections: 3,
    maxMessages: 50,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    tls: {
      rejectUnauthorized: false,
      minVersion: 'TLSv1.2',
      servername: 'smtp.gmail.com', // Necessary for SNI when custom lookup resolves IP
    },
  });
}

const transporter = createTransporter();

/**
 * Default sender formatted as "ViratTom Team <SMTP_USER>"
 */
function getDefaultFrom() {
  const user = (process.env.SMTP_USER || process.env.EMAIL_USER || 'kanusuraj15@gmail.com').trim();
  return `ViratTom Team <${user}>`;
}

/**
 * Base generic email sender with automatic IPv4 retry & port fallback (465 -> 587)
 */
async function sendMail({ to, subject, html, text, attachments = [], from }) {
  const sender = from || getDefaultFrom();
  const mailTransporter = transporter || createTransporter();

  if (!mailTransporter) {
    console.log(`[Mailer:Simulation] To: ${to} | Subject: "${subject}" | (SMTP credentials not configured)`);
    return { success: true, simulated: true, messageId: `sim_${Date.now()}` };
  }

  const mailOptions = {
    from: sender,
    to,
    subject,
    text: text || (html ? html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : ''),
    html,
    attachments,
  };

  try {
    const info = await mailTransporter.sendMail(mailOptions);
    console.log(`[Email Status] email sent sucessfully to ${to} (Subject: "${subject}", MessageId: ${info.messageId})`);
    return { success: true, messageId: info.messageId, simulated: false };
  } catch (err) {
    // If connection timed out or network error on primary port, try fallback port 587 with IPv4
    if (err.code === 'ENETUNREACH' || err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT') {
      try {
        console.warn(`[Mailer:Retry] Retrying email delivery via alternate port (587 IPv4)...`);
        const fallbackTransporter = createTransporter({ port: 587 });
        if (fallbackTransporter) {
          const info = await fallbackTransporter.sendMail(mailOptions);
          console.log(`[Email Status] email sent sucessfully to ${to} (Port 587 IPv4 fallback)`);
          return { success: true, messageId: info.messageId, simulated: false };
        }
      } catch (retryErr) {
        console.error(`[Email Status] failed to send email to ${to}: ${retryErr.message}`);
        throw retryErr;
      }
    }
    console.error(`[Email Status] failed to send email to ${to}: ${err.message}`);
    throw err;
  }
}

/**
 * Diagnostic helper to verify SMTP credentials and connectivity with IPv4 enforcement
 */
async function checkSmtpStatus() {
  const user = (process.env.SMTP_USER || process.env.EMAIL_USER || '').trim();
  const rawPass = (process.env.SMTP_PASS || process.env.SMTP_PASSWORD || process.env.EMAIL_PASS || '').trim();
  const pass = rawPass.replace(/['"\s]/g, '');

  if (!user && !pass) {
    return { ok: true, status: 'simulated', message: 'SMTP credentials not configured (simulation mode active - no crash)' };
  }
  if (!user || !pass) {
    return { ok: false, status: 'incomplete', message: 'smptp issue: Both SMTP_USER and SMTP_PASS must be provided together' };
  }

  // First try primary transporter (Port 465 SSL, IPv4)
  const primaryTransporter = transporter || createTransporter({ port: 465 });
  if (primaryTransporter) {
    try {
      await primaryTransporter.verify();
      return { ok: true, status: 'connected', message: `SMTP connected successfully (${user})` };
    } catch (err) {
      console.warn(`[SMTP Diagnostic] Port 465 IPv4 check: ${err.message}. Trying port 587 fallback...`);
    }
  }

  // Try fallback transporter (Port 587 TLS, IPv4)
  try {
    const fallbackTransporter = createTransporter({ port: 587 });
    if (fallbackTransporter) {
      await fallbackTransporter.verify();
      return { ok: true, status: 'connected', message: `SMTP connected successfully (${user} via Port 587 IPv4)` };
    }
  } catch (fallbackErr) {
    return { ok: false, status: 'failed', message: `smptp issue: ${fallbackErr.message}` };
  }

  return { ok: false, status: 'error', message: 'smptp issue: Unable to initialize nodemailer transporter' };
}

/**
 * Unified OTP Dispatch for entire platform:
 * 1. Contact Lead Verification (/api/lead/request-email-otp)
 * 2. Resume Download Verification (/api/resume/request-download-otp)
 * 3. Admin Password Reset (/api/admin/forgot-password)
 */
async function sendOtpEmail(toEmail, otpCode, purpose = 'Verification') {
  const subject = `Your ViratTom Security Code: ${otpCode}`;
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 24px;">
        <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e5e7eb; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <div style="display: flex; align-items: center; margin-bottom: 24px;">
            <div style="background: #111827; color: #ffffff; width: 36px; height: 36px; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; font-size: 18px; margin-right: 12px; text-align: center; line-height: 36px;">V</div>
            <span style="font-size: 18px; font-weight: 700; color: #111827; letter-spacing: -0.5px;">ViratTom</span>
          </div>

          <h2 style="font-size: 20px; font-weight: 700; color: #111827; margin: 0 0 12px 0;">${purpose} Code</h2>
          <p style="font-size: 14px; color: #4b5563; line-height: 1.5; margin: 0 0 24px 0;">
            Use the 6-digit security verification code below to complete your ${purpose.toLowerCase()} request.
          </p>

          <div style="background: #f3f4f6; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px; border: 1px dashed #cbd5e1;">
            <span style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #111827; display: inline-block;">
              ${otpCode}
            </span>
          </div>

          <p style="font-size: 12px; color: #6b7280; line-height: 1.5; margin: 0 0 20px 0;">
            This security code is valid for 10 minutes. If you did not initiate this request, please disregard this email.
          </p>

          <div style="border-top: 1px solid #f3f4f6; padding-top: 16px; font-size: 11px; color: #9ca3af; text-align: center;">
            Secure Automated Dispatch • ViratTom Web & Mobile Solutions
          </div>
        </div>
      </body>
    </html>
  `;

  return sendMail({
    to: toEmail,
    subject,
    html,
  });
}

/**
 * Reusable Lead Confirmation Email
 */
async function sendLeadConfirmationEmail(toEmail, leadData = {}) {
  const subject = `Inquiry Received - ViratTom Web & Mobile Solutions`;
  const name = leadData.name || 'Valued Client';
  const service = leadData.service || 'Custom Application Development';

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb; padding: 28px;">
      <h2 style="font-size: 20px; font-weight: 700; color: #111827; margin: 0 0 12px 0;">Hello ${name},</h2>
      <p style="font-size: 14px; color: #4b5563; line-height: 1.6;">
        Thank you for contacting <b>ViratTom</b> regarding <b>${service}</b>.
      </p>
      <p style="font-size: 14px; color: #4b5563; line-height: 1.6;">
        We have received your project requirements. Our engineering lead will review the scope and connect with you within 24 hours.
      </p>
      <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #f3f4f6; font-size: 12px; color: #9ca3af;">
        ViratTom Solutions • High-Performance Web & Mobile Applications
      </div>
    </div>
  `;

  return sendMail({ to: toEmail, subject, html });
}

/**
 * Reusable Payment Receipt Email
 */
async function sendPaymentReceiptEmail(toEmail, paymentData = {}) {
  const subject = `Payment Receipt: ₹${paymentData.amount || 0} - ViratTom`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb; padding: 28px;">
      <h2 style="font-size: 20px; font-weight: 700; color: #111827; margin: 0 0 12px 0;">Payment Received</h2>
      <p style="font-size: 14px; color: #4b5563; line-height: 1.6;">
        We have received your advance payment of <b>₹${paymentData.amount || 0}</b> for project <b>${paymentData.projectName || 'Project'}</b>.
      </p>
      <p style="font-size: 13px; color: #6b7280;">Transaction ID: ${paymentData.paymentId || paymentData.transactionId || 'N/A'}</p>
      <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #f3f4f6; font-size: 12px; color: #9ca3af;">
        ViratTom Solutions • Invoicing & Client Portal
      </div>
    </div>
  `;

  return sendMail({ to: toEmail, subject, html });
}

// TODO: Resume PDF email dispatch and recruiter outreach will be implemented in a future update.
async function sendResumeEmail(toEmail) {
  console.log(`[Mailer] Resume PDF email paused for future implementation (Target: ${toEmail})`);
  return { success: true, simulated: true, message: 'Resume email dispatch paused for future implementation' };
}

// TODO: Recruiter outreach email dispatch will be implemented in a future update.
async function sendOutreachEmail(toEmail) {
  console.log(`[Mailer] Recruiter outreach email paused for future implementation (Target: ${toEmail})`);
  return { success: true, simulated: true, message: 'Recruiter outreach email dispatch paused for future implementation' };
}

module.exports = {
  transporter,
  sendMail,
  checkSmtpStatus,
  sendOtpEmail,
  sendLeadConfirmationEmail,
  sendPaymentReceiptEmail,
  sendResumeEmail,
  sendOutreachEmail,
  getDefaultFrom,
};
