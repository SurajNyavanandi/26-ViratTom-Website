/**
 * ============================================================================
 * ViratTom Unified Brevo Email Service (backend/lib/email.js)
 * ============================================================================
 * Exclusive email client for the platform using Brevo.
 * Supports:
 * 1. Brevo Transactional REST API (when BREVO_API_KEY starts with 'xkeysib-')
 * 2. Brevo SMTP Relay (when BREVO_API_KEY starts with 'xsmtpsib-')
 *
 * Configured strictly via:
 * - BREVO_API_KEY (xkeysib-... for REST API or xsmtpsib-... for SMTP Relay)
 * - BREVO_SENDER_EMAIL (verified sender email in Brevo)
 * - BREVO_SENDER_NAME (display name, e.g. "ViratTom")
 */

const net = require('net');
const tls = require('tls');

const BREVO_API_ENDPOINT = 'https://api.brevo.com/v3/smtp/email';
const BREVO_ACCOUNT_ENDPOINT = 'https://api.brevo.com/v3/account';
const BREVO_SMTP_HOST = 'smtp-relay.brevo.com';
const BREVO_SMTP_PORT = 587;

/**
 * Get Brevo configuration from environment variables
 */
function getBrevoConfig() {
  return {
    apiKey: (process.env.BREVO_API_KEY || '').trim(),
    senderEmail: (process.env.BREVO_SENDER_EMAIL || '').trim(),
    senderName: (process.env.BREVO_SENDER_NAME || 'ViratTom').trim(),
  };
}

/**
 * Validate required Brevo configuration at startup
 */
function validateBrevoConfig() {
  const { apiKey, senderEmail } = getBrevoConfig();
  const missing = [];
  if (!apiKey) missing.push('BREVO_API_KEY');
  if (!senderEmail) missing.push('BREVO_SENDER_EMAIL');

  if (missing.length > 0) {
    console.log(`[Email] Brevo setup note: Missing environment variable(s): ${missing.join(', ')}`);
    return { valid: false, missing };
  }
  return { valid: true, missing: [] };
}

/**
 * Verify connectivity to Brevo SMTP Relay (port 587)
 */
function checkBrevoSmtpConnectivity() {
  return new Promise((resolve) => {
    const socket = net.createConnection(BREVO_SMTP_PORT, BREVO_SMTP_HOST);
    const timeout = setTimeout(() => {
      socket.destroy();
      resolve({ ok: false, message: 'Brevo SMTP relay connection timed out (port 587)' });
    }, 4000);

    socket.once('data', (data) => {
      clearTimeout(timeout);
      const str = data.toString();
      socket.destroy();
      if (str.startsWith('220')) {
        resolve({ ok: true, message: 'Brevo connected (smtp-relay.brevo.com:587 ready)' });
      } else {
        resolve({ ok: false, message: `Brevo SMTP relay returned: ${str.trim()}` });
      }
    });

    socket.once('error', (err) => {
      clearTimeout(timeout);
      socket.destroy();
      resolve({ ok: false, message: `Brevo SMTP relay connection notice: ${err.message}` });
    });
  });
}

/**
 * Verify Brevo connection for startup diagnostics
 * Intelligently routes check based on key type (xkeysib vs xsmtpsib)
 */
async function verifyBrevoConnection() {
  const { apiKey, senderEmail } = getBrevoConfig();
  if (!apiKey) {
    return {
      ok: false,
      status: 'missing_key',
      message: 'BREVO_API_KEY is not set in environment variables',
    };
  }
  if (!senderEmail) {
    return {
      ok: false,
      status: 'missing_sender',
      message: 'BREVO_SENDER_EMAIL is not set in environment variables',
    };
  }

  // If using Brevo SMTP relay key (starts with 'xsmtpsib-')
  if (apiKey.startsWith('xsmtpsib-')) {
    const smtpStatus = await checkBrevoSmtpConnectivity();
    if (smtpStatus.ok) {
      return {
        ok: true,
        status: 'connected',
        message: `Brevo connected (smtp-relay.brevo.com:587 ready | ${senderEmail})`,
      };
    }
    return {
      ok: false,
      status: 'smtp_unreachable',
      message: smtpStatus.message,
    };
  }

  // If using Brevo REST API key (starts with 'xkeysib-')
  try {
    const res = await fetch(BREVO_ACCOUNT_ENDPOINT, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
      },
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errMsg = data.message || `HTTP ${res.status}`;
      return {
        ok: false,
        status: 'rejected',
        message: `Brevo API response: ${errMsg}`,
      };
    }

    const accountEmail = data.email || senderEmail;
    const planType = data.plan?.[0]?.type || 'Standard';
    return {
      ok: true,
      status: 'connected',
      message: `Brevo connected (${accountEmail} | Plan: ${planType})`,
      account: data,
    };
  } catch (err) {
    return {
      ok: false,
      status: 'network_error',
      message: `Network error connecting to Brevo API: ${err.message}`,
    };
  }
}

/**
 * Dispatch email via Brevo SMTP Relay over STARTTLS
 */
function sendViaBrevoSmtpRelay({ to, subject, html, text, apiKey, senderEmail, senderName }) {
  return new Promise((resolve, reject) => {
    const loginUser = (process.env.BREVO_SMTP_LOGIN || process.env.SMTP_USER || senderEmail).trim();
    const loginPass = apiKey.trim();

    const socket = net.createConnection(BREVO_SMTP_PORT, BREVO_SMTP_HOST, () => {});
    let tlsSocket = null;
    let step = 0;
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error('Brevo SMTP relay timed out on port 587'));
    }, 15000);

    function cleanup() {
      clearTimeout(timeout);
      socket.destroy();
      if (tlsSocket) tlsSocket.destroy();
    }

    socket.on('data', (d) => {
      const msg = d.toString();
      if (step === 0 && msg.startsWith('220')) {
        step = 1;
        socket.write('EHLO localhost\r\n');
      } else if (step === 1 && (msg.includes('250-STARTTLS') || msg.startsWith('250'))) {
        step = 2;
        socket.write('STARTTLS\r\n');
      } else if (step === 2 && msg.startsWith('220')) {
        step = 3;
        tlsSocket = tls.connect({ socket, host: BREVO_SMTP_HOST }, () => {
          tlsSocket.write('EHLO localhost\r\n');
        });

        tlsSocket.on('data', (td) => {
          const tmsg = td.toString();
          if (step === 3 && tmsg.startsWith('250')) {
            step = 4;
            tlsSocket.write('AUTH LOGIN\r\n');
          } else if (step === 4 && tmsg.startsWith('334')) {
            step = 5;
            tlsSocket.write(Buffer.from(loginUser).toString('base64') + '\r\n');
          } else if (step === 5 && tmsg.startsWith('334')) {
            step = 6;
            tlsSocket.write(Buffer.from(loginPass).toString('base64') + '\r\n');
          } else if (step === 6) {
            if (!tmsg.startsWith('235')) {
              cleanup();
              return reject(new Error(`Brevo SMTP authentication failed: ${tmsg.trim()}. For instant API sending, generate a v3 API key starting with 'xkeysib-' at https://app.brevo.com/settings/keys/api`));
            }
            step = 7;
            tlsSocket.write(`MAIL FROM:<${senderEmail}>\r\n`);
          } else if (step === 7 && tmsg.startsWith('250')) {
            step = 8;
            tlsSocket.write(`RCPT TO:<${to}>\r\n`);
          } else if (step === 8 && tmsg.startsWith('250')) {
            step = 9;
            tlsSocket.write('DATA\r\n');
          } else if (step === 9 && tmsg.startsWith('354')) {
            step = 10;
            const boundary = `----=_Part_${Date.now()}_${Math.random().toString(36).slice(2)}`;
            const messageId = `<${Date.now()}.${Math.random().toString(36).slice(2)}@virattom.com>`;
            const headers = [
              `From: "${senderName}" <${senderEmail}>`,
              `To: <${to}>`,
              `Subject: ${subject}`,
              `Message-ID: ${messageId}`,
              `MIME-Version: 1.0`,
              `Content-Type: multipart/alternative; boundary="${boundary}"`,
              '',
              `--${boundary}`,
              `Content-Type: text/plain; charset=utf-8`,
              '',
              text || (html ? html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : ''),
              '',
              `--${boundary}`,
              `Content-Type: text/html; charset=utf-8`,
              '',
              html || `<p>${text || ''}</p>`,
              '',
              `--${boundary}--`,
              '',
              '.\r\n',
            ].join('\r\n');
            tlsSocket.write(headers);
          } else if (step === 10 && tmsg.startsWith('250')) {
            cleanup();
            resolve({ success: true, messageId: `brevo_smtp_${Date.now()}` });
          } else if (tmsg.startsWith('4') || tmsg.startsWith('5')) {
            cleanup();
            reject(new Error(`Brevo SMTP relay error: ${tmsg.trim()}`));
          }
        });

        tlsSocket.on('error', (err) => {
          cleanup();
          reject(new Error(`Brevo TLS socket error: ${err.message}`));
        });
      }
    });

    socket.on('error', (err) => {
      cleanup();
      reject(new Error(`Brevo SMTP connection error: ${err.message}`));
    });
  });
}

/**
 * Dispatch email via Brevo REST API (POST https://api.brevo.com/v3/smtp/email)
 */
async function sendViaBrevoRestApi({ to, subject, html, text, apiKey, senderEmail, senderName }) {
  const payload = {
    sender: {
      name: senderName,
      email: senderEmail,
    },
    to: [{ email: to }],
    subject: subject,
    htmlContent: html || `<p>${text}</p>`,
  };

  if (text) {
    payload.textContent = text;
  }

  const res = await fetch(BREVO_API_ENDPOINT, {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': apiKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMsg = data.message || `Brevo API HTTP ${res.status}: ${res.statusText}`;
    const err = new Error(errorMsg);
    err.statusCode = res.status;
    err.brevoResponse = data;
    throw err;
  }

  return {
    success: true,
    messageId: data.messageId || `brevo_${Date.now()}`,
  };
}

/**
 * Main email sender function
 *
 * @param {Object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject line
 * @param {string} [options.html] - HTML body content
 * @param {string} [options.text] - Plain text body content
 * @returns {Promise<{ success: boolean, messageId: string, durationMs: number }>}
 */
async function sendEmail({ to, subject, html, text }) {
  const startTime = Date.now();
  const cleanTo = String(to || '').trim().toLowerCase();
  const { apiKey, senderEmail, senderName } = getBrevoConfig();

  if (!cleanTo) {
    throw new Error('Recipient email ("to") is required.');
  }
  if (!subject) {
    throw new Error('Email "subject" is required.');
  }
  if (!html && !text) {
    throw new Error('Email content ("html" or "text") is required.');
  }

  if (!apiKey || !senderEmail) {
    const missing = [];
    if (!apiKey) missing.push('BREVO_API_KEY');
    if (!senderEmail) missing.push('BREVO_SENDER_EMAIL');
    throw new Error(`Brevo email service not configured. Missing: ${missing.join(', ')}`);
  }

  console.log(`[Email] Dispatching to Brevo -> To: ${cleanTo} | Subject: "${subject}"`);

  let result;
  if (apiKey.startsWith('xsmtpsib-')) {
    // Brevo SMTP Relay mode
    result = await sendViaBrevoSmtpRelay({
      to: cleanTo,
      subject,
      html,
      text,
      apiKey,
      senderEmail,
      senderName,
    });
  } else {
    // Brevo REST API mode (default for xkeysib- or standard keys)
    result = await sendViaBrevoRestApi({
      to: cleanTo,
      subject,
      html,
      text,
      apiKey,
      senderEmail,
      senderName,
    });
  }

  const durationMs = Date.now() - startTime;
  console.log(`[Email] Brevo accepted email to ${cleanTo} in ${durationMs}ms (MessageId: ${result.messageId})`);

  return {
    success: true,
    messageId: result.messageId,
    durationMs,
  };
}

/**
 * Escape HTML special characters
 */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Send branded 6-digit OTP verification email via Brevo
 */
async function sendOtpEmail(toEmail, otpCode, purpose = 'Verification') {
  const subject = `${otpCode} is your ViratTom verification code`;
  const cleanPurpose = escapeHtml(purpose);
  const cleanCode = escapeHtml(otpCode);

  const html = `
    <!DOCTYPE html>
    <html lang="en">
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

          <h2 style="font-size: 20px; font-weight: 700; color: #111827; margin: 0 0 12px 0;">${cleanPurpose} Code</h2>
          <p style="font-size: 14px; color: #4b5563; line-height: 1.5; margin: 0 0 24px 0;">
            Use the 6-digit verification code below to verify your email address.
          </p>

          <div style="background: #f3f4f6; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px; border: 1px dashed #cbd5e1;">
            <span style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #111827; display: inline-block;">
              ${cleanCode}
            </span>
          </div>

          <p style="font-size: 12px; color: #6b7280; line-height: 1.5; margin: 0 0 20px 0;">
            This security code is valid for 10 minutes. If you did not initiate this request, you can safely ignore this email.
          </p>

          <div style="border-top: 1px solid #f3f4f6; padding-top: 16px; font-size: 11px; color: #9ca3af; text-align: center;">
            Sent securely via Brevo • ViratTom Web & Mobile Solutions
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `Your ViratTom verification code is: ${otpCode}\n\nValid for 10 minutes.\n\nIf you did not request this, please ignore this email.\n\nViratTom Solutions\nhttps://virattom.com`;

  return sendEmail({
    to: toEmail,
    subject,
    html,
    text,
  });
}

/**
 * Send inquiry confirmation email to prospective lead
 */
async function sendLeadConfirmationEmail(toEmail, leadData = {}) {
  const subject = `Inquiry Received - ViratTom Web & Mobile Solutions`;
  const name = escapeHtml(leadData.name || 'Valued Client');
  const service = escapeHtml(leadData.service || leadData.projectType || 'Custom Application Development');

  const html = `
    <!DOCTYPE html>
    <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb; margin: 0; padding: 24px;">
        <div style="max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 14px; border: 1px solid #e5e7eb; padding: 28px;">
          <h2 style="font-size: 20px; font-weight: 700; color: #111827; margin: 0 0 12px 0;">Hello ${name},</h2>
          <p style="font-size: 14px; color: #4b5563; line-height: 1.6;">
            Thank you for reaching out to <b>ViratTom</b> regarding <b>${service}</b>.
          </p>
          <p style="font-size: 14px; color: #4b5563; line-height: 1.6;">
            We have received your project requirements. Our engineering lead will review your project scope and connect with you within 24 hours.
          </p>
          <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #f3f4f6; font-size: 12px; color: #9ca3af;">
            ViratTom Solutions • High-Performance Web & Mobile Applications
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `Hello ${leadData.name || 'Valued Client'},\n\nThank you for reaching out to ViratTom regarding ${leadData.service || 'your project'}.\nWe have received your requirements and will connect with you within 24 hours.\n\nViratTom Solutions`;

  return sendEmail({
    to: toEmail,
    subject,
    html,
    text,
  });
}

/**
 * Send payment receipt confirmation email
 */
async function sendPaymentReceiptEmail(toEmail, paymentData = {}) {
  const amount = paymentData.amount || 0;
  const projectName = escapeHtml(paymentData.projectName || 'Project');
  const txId = escapeHtml(paymentData.paymentId || paymentData.transactionId || 'N/A');
  const subject = `Payment Receipt: ₹${amount} - ViratTom`;

  const html = `
    <!DOCTYPE html>
    <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb; margin: 0; padding: 24px;">
        <div style="max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 14px; border: 1px solid #e5e7eb; padding: 28px;">
          <h2 style="font-size: 20px; font-weight: 700; color: #111827; margin: 0 0 12px 0;">Payment Confirmation</h2>
          <p style="font-size: 14px; color: #4b5563; line-height: 1.6;">
            We have received your payment of <b>₹${amount}</b> for <b>${projectName}</b>.
          </p>
          <p style="font-size: 13px; color: #6b7280;">
            Transaction Reference: <code>${txId}</code>
          </p>
          <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #f3f4f6; font-size: 12px; color: #9ca3af;">
            ViratTom Solutions • Client Invoicing
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `Payment Confirmation\n\nWe have received your payment of ₹${amount} for ${paymentData.projectName || 'Project'}.\nTransaction Reference: ${paymentData.paymentId || paymentData.transactionId || 'N/A'}\n\nViratTom Solutions`;

  return sendEmail({
    to: toEmail,
    subject,
    html,
    text,
  });
}

/**
 * Send admin alert email to ADMIN_EMAIL
 */
async function sendAdminAlertEmail(subject, text, html) {
  const adminEmail = (process.env.ADMIN_EMAIL || process.env.BREVO_SENDER_EMAIL || '').trim();
  if (!adminEmail) {
    return { success: false, error: 'ADMIN_EMAIL not configured' };
  }

  return sendEmail({
    to: adminEmail,
    subject: `[ViratTom Admin Alert] ${subject}`,
    text,
    html,
  });
}

// Background Mail Queue instance for non-blocking asynchronous email jobs
const mailQueue = require('../services/mailQueue');

function queueOtpEmail(toEmail, otpCode, purpose = 'Verification') {
  return mailQueue.add(
    () => sendOtpEmail(toEmail, otpCode, purpose),
    { type: 'OTP', to: toEmail, code: otpCode }
  );
}

function queueLeadConfirmationEmail(toEmail, leadData) {
  return mailQueue.add(
    () => sendLeadConfirmationEmail(toEmail, leadData),
    { type: 'Lead Confirmation', to: toEmail }
  );
}

function queuePaymentReceiptEmail(toEmail, paymentData) {
  return mailQueue.add(
    () => sendPaymentReceiptEmail(toEmail, paymentData),
    { type: 'Payment Receipt', to: toEmail }
  );
}

module.exports = {
  sendEmail,
  sendOtpEmail,
  queueOtpEmail,
  sendLeadConfirmationEmail,
  queueLeadConfirmationEmail,
  sendPaymentReceiptEmail,
  queuePaymentReceiptEmail,
  sendAdminAlertEmail,
  verifyBrevoConnection,
  validateBrevoConfig,
  getBrevoConfig,
  mailQueue,
  getQueueMetrics: () => mailQueue.getMetrics(),
};
