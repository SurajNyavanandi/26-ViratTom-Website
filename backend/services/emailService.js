const nodemailer = require('nodemailer');
const dns = require('dns');
const mailQueue = require('./mailQueue');

let transporter = null;
let isTransporterChecked = false;

// DNS Cache to bypass repetitive synchronous libuv getaddrinfo lookups
let cachedHostIp = null;
let dnsCacheExpiresAt = 0;

function customDnsLookup(hostname, options, callback) {
  // If options is a callback
  const cb = typeof options === 'function' ? options : callback;

  if (cachedHostIp && Date.now() < dnsCacheExpiresAt) {
    return cb(null, cachedHostIp, 4);
  }

  // Force IPv4 lookup
  dns.lookup(hostname, { family: 4 }, (err, address, family) => {
    if (!err && address) {
      cachedHostIp = address;
      dnsCacheExpiresAt = Date.now() + 60 * 60 * 1000; // cache for 1 hour
    }
    cb(err, address, family || 4);
  });
}

/**
 * Configure Nodemailer with IPv4 enforcement, direct SSL port 465, and timeout guards
 */
function getTransporter() {
  if (isTransporterChecked) return transporter;
  isTransporterChecked = true;

  const service = (process.env.SMTP_SERVICE || '').trim().toLowerCase();
  const host = (process.env.SMTP_HOST || 'smtp.gmail.com').trim();
  const port = Number.parseInt(process.env.SMTP_PORT || '465', 10);
  const user = (process.env.SMTP_USER || 'kanusuraj15@gmail.com').trim();
  const pass = (process.env.SMTP_PASS || 'ryxp kwkk rbji itfa').trim();
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  const isPlaceholder = !pass || pass.includes('your-') || pass.includes('your_') || pass.includes('placeholder') || pass === 'your-smtp-app-password';

  if (user && pass && !isPlaceholder) {
    try {
      const cleanPass = pass.replace(/\s+/g, '');
      const isGmail = service === 'gmail' || host.includes('gmail');

      const transportOptions = isGmail
        ? {
            service: 'gmail',
            auth: { user, pass: cleanPass },
            family: 4,
            lookup: customDnsLookup,
            connectionTimeout: 8000,
            greetingTimeout: 6000,
            socketTimeout: 10000,
            tls: {
              rejectUnauthorized: false,
              minVersion: 'TLSv1.2',
            },
          }
        : {
            host: host || 'smtp.gmail.com',
            port: port || 465,
            secure: secure,
            auth: { user, pass: cleanPass },
            family: 4,
            lookup: customDnsLookup,
            pool: false,
            connectionTimeout: 8000,
            greetingTimeout: 6000,
            socketTimeout: 10000,
            tls: {
              rejectUnauthorized: false,
              minVersion: 'TLSv1.2',
            },
          };

      transporter = nodemailer.createTransport(transportOptions);
      console.log(`[Nodemailer] Gmail/SMTP Transporter configured (${user} | ${isGmail ? 'Gmail Service' : host + ':' + port} | IPv4 Enforced)`);

      // Verify SMTP connection in background without blocking server boot
      transporter.verify((err) => {
        if (err) {
          console.warn(`[Nodemailer Notice] SMTP verify status: ${err.message}`);
          console.warn(`[Nodemailer Hint] For Gmail, ensure 2-Step Verification is active and use a 16-character App Password (https://myaccount.google.com/apppasswords)`);
        } else {
          console.log(`[Nodemailer Ready] Connected to Gmail SMTP successfully! Live email delivery active for ${user}.`);
        }
      });
    } catch (err) {
      console.warn(`[Nodemailer Error] Transporter creation failed: ${err.message}`);
      transporter = null;
    }
  } else {
    transporter = null;
    console.log('[Nodemailer] Local Simulation Mode (No live SMTP credentials in .env). OTPs will log to console instantly.');
  }

  return transporter;
}

function getFromEmail() {
  return process.env.SMTP_FROM || process.env.EMAIL_FROM || process.env.SMTP_USER || 'Suraj Nyavanandi <kanusuraj15@gmail.com>';
}

/**
 * High-performance email dispatcher using Nodemailer with automatic timeout protection
 */
async function sendGenericEmail({ to, subject, html, logType = 'Email', code = '' }) {
  const startTime = Date.now();
  const mailer = getTransporter();

  if (mailer) {
    try {
      const sendPromise = mailer.sendMail({
        from: getFromEmail(),
        to,
        subject,
        html,
      });

      // 4-second timeout promise protection
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('SMTP timeout (4000ms)')), 4000)
      );

      const info = await Promise.race([sendPromise, timeoutPromise]);
      const elapsed = Date.now() - startTime;
      console.log(`[${logType} Sent] To: ${to}${code ? ` | Code: ${code}` : ''} | Nodemailer Delivery (${elapsed}ms) [ID: ${info.messageId || 'OK'}]`);
      return { success: true, provider: 'Nodemailer', messageId: info.messageId, durationMs: elapsed };
    } catch (err) {
      const elapsed = Date.now() - startTime;
      console.warn(`[${logType} Notice] Nodemailer live delivery issue (${elapsed}ms): ${err.message}`);
      console.log(`[${logType} Fallback] To: ${to}${code ? ` | Code: ${code}` : ''} | Console Verification Ready`);
      return { success: true, fallback: true, error: err.message, durationMs: elapsed };
    }
  }

  // Instant local console simulation
  const elapsed = Date.now() - startTime;
  console.log(`[${logType} Sent] To: ${to}${code ? ` | Code: ${code}` : ''} | Console Verification (${elapsed}ms)`);
  return { success: true, simulated: true, durationMs: elapsed };
}

/**
 * Send 6-digit OTP verification email
 */
async function sendOtpEmail(toEmail, otpCode, recipientName = 'User', purpose = 'Account & Resume Verification') {
  const subject = `Your Verification Code: ${otpCode} - ViratTom`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f5f5f7; margin: 0; padding: 24px; color: #1d1d1f; }
    .card { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 36px 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e5e5ea; }
    .header { text-align: center; margin-bottom: 28px; }
    .brand { font-size: 22px; font-weight: 700; letter-spacing: -0.5px; color: #0071e3; }
    .title { font-size: 18px; font-weight: 600; margin-top: 12px; margin-bottom: 8px; color: #1d1d1f; }
    .otp-box { background: #f2f2f7; border-radius: 12px; padding: 18px; text-align: center; margin: 24px 0; border: 1px dashed #d1d1d6; }
    .otp-code { font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #0071e3; font-family: 'SF Mono', Consolas, Monaco, monospace; }
    .text { font-size: 14px; line-height: 1.6; color: #6e6e73; margin-bottom: 16px; }
    .footer { font-size: 12px; color: #86868b; text-align: center; margin-top: 32px; border-top: 1px solid #e5e5ea; padding-top: 16px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="brand">ViratTom</div>
      <div class="title">Verify Your Email</div>
    </div>
    <p class="text">Hello <strong>${escapeHtml(recipientName)}</strong>,</p>
    <p class="text">Use the following one-time verification code to proceed with <strong>${escapeHtml(purpose)}</strong> on virattom.com:</p>
    
    <div class="otp-box">
      <div class="otp-code">${otpCode}</div>
    </div>

    <p class="text">This code is valid for <strong>10 minutes</strong>. If you did not request this code, please ignore this email.</p>
    
    <div class="footer">
      © ${new Date().getFullYear()} ViratTom. All rights reserved.<br/>
      High-Performance Web Applications & Engineering.
    </div>
  </div>
</body>
</html>
  `;

  return sendGenericEmail({ to: toEmail, subject, html, logType: 'OTP', code: otpCode });
}

/**
 * Send inquiry confirmation email to client
 */
async function sendLeadConfirmationEmail(toEmail, leadData) {
  const subject = `We Received Your Project Inquiry - ViratTom`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f5f5f7; margin: 0; padding: 24px; color: #1d1d1f; }
    .card { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 36px 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e5e5ea; }
    .brand { font-size: 22px; font-weight: 700; color: #0071e3; text-align: center; margin-bottom: 20px; }
    .title { font-size: 19px; font-weight: 600; margin-bottom: 12px; color: #1d1d1f; text-align: center; }
    .text { font-size: 14px; line-height: 1.6; color: #515154; margin-bottom: 14px; }
    .summary-box { background: #fbfbfd; border-radius: 12px; padding: 18px; margin: 20px 0; border: 1px solid #e5e5ea; font-size: 13.5px; }
    .row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f2f2f7; }
    .row:last-child { border-bottom: none; }
    .label { color: #86868b; font-weight: 500; }
    .val { font-weight: 600; color: #1d1d1f; }
    .footer { font-size: 12px; color: #86868b; text-align: center; margin-top: 32px; border-top: 1px solid #e5e5ea; padding-top: 16px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="brand">ViratTom</div>
    <div class="title">Project Inquiry Received</div>
    <p class="text">Hi <strong>${escapeHtml(leadData.name || 'there')}</strong>,</p>
    <p class="text">Thank you for reaching out! We have received your project details and will review your requirements within 2-4 business hours.</p>
    
    <div class="summary-box">
      <div class="row"><span class="label">Project Type:</span> <span class="val">${escapeHtml(leadData.projectType || 'Web Application')}</span></div>
      <div class="row"><span class="label">Estimated Budget:</span> <span class="val">₹${Number(leadData.budget || 0).toLocaleString('en-IN')}</span></div>
      ${leadData.phone ? `<div class="row"><span class="label">Contact Phone:</span> <span class="val">${escapeHtml(leadData.phone)}</span></div>` : ''}
      ${leadData.company ? `<div class="row"><span class="label">Company / Org:</span> <span class="val">${escapeHtml(leadData.company)}</span></div>` : ''}
    </div>

    <p class="text">You can access your dedicated client portal at any time to monitor milestones, review deliverables, and collaborate directly.</p>
    
    <div class="footer">
      © ${new Date().getFullYear()} ViratTom • virattom.com
    </div>
  </div>
</body>
</html>
  `;

  return sendGenericEmail({ to: toEmail, subject, html, logType: 'Lead Confirmation' });
}

/**
 * Send Razorpay Payment Receipt to client
 */
async function sendPaymentReceiptEmail(toEmail, paymentData) {
  const subject = `Payment Receipt - ₹${Number(paymentData.amount || 0).toLocaleString('en-IN')} for ${escapeHtml(paymentData.projectTitle || 'Project Milestone')}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f5f5f7; margin: 0; padding: 24px; color: #1d1d1f; }
    .card { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 36px 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e5e5ea; }
    .badge { background: #34c759; color: #ffffff; display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 12px; }
    .title { font-size: 20px; font-weight: 700; color: #1d1d1f; margin-bottom: 6px; }
    .amount { font-size: 32px; font-weight: 800; color: #1d1d1f; margin: 16px 0; }
    .receipt-box { background: #fbfbfd; border-radius: 12px; padding: 18px; margin: 20px 0; border: 1px solid #e5e5ea; font-size: 13px; }
    .row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f2f2f7; }
    .row:last-child { border-bottom: none; }
    .label { color: #86868b; }
    .val { font-weight: 600; color: #1d1d1f; }
    .footer { font-size: 12px; color: #86868b; text-align: center; margin-top: 32px; border-top: 1px solid #e5e5ea; padding-top: 16px; }
  </style>
</head>
<body>
  <div class="card">
    <div style="text-align: center;">
      <div class="badge">Payment Successful</div>
      <div class="title">Payment Receipt</div>
      <div class="amount">₹${Number(paymentData.amount || 0).toLocaleString('en-IN')}</div>
    </div>

    <div class="receipt-box">
      <div class="row"><span class="label">Project:</span> <span class="val">${escapeHtml(paymentData.projectTitle || 'Client Project')}</span></div>
      <div class="row"><span class="label">Payment Type:</span> <span class="val">${escapeHtml(paymentData.type || 'Milestone Advance')}</span></div>
      <div class="row"><span class="label">Transaction ID:</span> <span class="val" style="font-family: monospace;">${escapeHtml(paymentData.transactionId || 'N/A')}</span></div>
      <div class="row"><span class="label">Order ID:</span> <span class="val" style="font-family: monospace;">${escapeHtml(paymentData.orderId || 'N/A')}</span></div>
      <div class="row"><span class="label">Date:</span> <span class="val">${paymentData.date || new Date().toLocaleDateString('en-IN')}</span></div>
      <div class="row"><span class="label">Status:</span> <span class="val" style="color: #34c759;">Confirmed & Paid</span></div>
    </div>

    <p style="font-size: 13.5px; color: #6e6e73; line-height: 1.5; text-align: center;">
      Your payment has been reconciled. All deliverables and milestone work are unlocked in your client dashboard.
    </p>

    <div class="footer">
      © ${new Date().getFullYear()} ViratTom • Official Billing Receipt
    </div>
  </div>
</body>
</html>
  `;

  return sendGenericEmail({ to: toEmail, subject, html, logType: 'Payment Receipt' });
}

/**
 * Enqueue email into the non-blocking background queue
 */
function queueEmail({ to, subject, html, logType = 'Email', code = '' }) {
  return mailQueue.add(
    () => sendGenericEmail({ to, subject, html, logType, code }),
    { type: logType, to }
  );
}

/**
 * Offload OTP email to non-blocking background queue (< 1ms return)
 */
function queueOtpEmail(toEmail, otpCode, recipientName = 'User', purpose = 'Account & Resume Verification') {
  const subject = `Your Verification Code: ${otpCode} - ViratTom`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f5f5f7; margin: 0; padding: 24px; color: #1d1d1f; }
    .card { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 36px 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e5e5ea; }
    .header { text-align: center; margin-bottom: 28px; }
    .brand { font-size: 22px; font-weight: 700; letter-spacing: -0.5px; color: #0071e3; }
    .title { font-size: 18px; font-weight: 600; margin-top: 12px; margin-bottom: 8px; color: #1d1d1f; }
    .otp-box { background: #f2f2f7; border-radius: 12px; padding: 18px; text-align: center; margin: 24px 0; border: 1px dashed #d1d1d6; }
    .otp-code { font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #0071e3; font-family: 'SF Mono', Consolas, Monaco, monospace; }
    .text { font-size: 14px; line-height: 1.6; color: #6e6e73; margin-bottom: 16px; }
    .footer { font-size: 12px; color: #86868b; text-align: center; margin-top: 32px; border-top: 1px solid #e5e5ea; padding-top: 16px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="brand">ViratTom</div>
      <div class="title">Verify Your Email</div>
    </div>
    <p class="text">Hello <strong>${escapeHtml(recipientName)}</strong>,</p>
    <p class="text">Use the following one-time verification code to proceed with <strong>${escapeHtml(purpose)}</strong> on virattom.com:</p>
    
    <div class="otp-box">
      <div class="otp-code">${otpCode}</div>
    </div>

    <p class="text">This code is valid for <strong>10 minutes</strong>. If you did not request this code, please ignore this email.</p>
    
    <div class="footer">
      © ${new Date().getFullYear()} ViratTom. All rights reserved.<br/>
      High-Performance Web Applications & Engineering.
    </div>
  </div>
</body>
</html>
  `;

  return queueEmail({ to: toEmail, subject, html, logType: 'OTP', code: otpCode });
}

/**
 * Offload lead confirmation email to background queue
 */
function queueLeadConfirmationEmail(toEmail, leadData) {
  return mailQueue.add(
    () => sendLeadConfirmationEmail(toEmail, leadData),
    { type: 'Lead Confirmation', to: toEmail }
  );
}

/**
 * Offload payment receipt email to background queue
 */
function queuePaymentReceiptEmail(toEmail, paymentData) {
  return mailQueue.add(
    () => sendPaymentReceiptEmail(toEmail, paymentData),
    { type: 'Payment Receipt', to: toEmail }
  );
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

module.exports = {
  getTransporter,
  sendOtpEmail,
  queueOtpEmail,
  sendLeadConfirmationEmail,
  queueLeadConfirmationEmail,
  sendPaymentReceiptEmail,
  queuePaymentReceiptEmail,
  mailQueue,
  getQueueMetrics: () => mailQueue.getMetrics(),
};
