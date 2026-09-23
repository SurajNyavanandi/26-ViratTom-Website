const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = Number.parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  if (host && user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      tls: {
        rejectUnauthorized: process.env.NODE_ENV === 'production',
      },
    });
    console.log(`[Email Service] SMTP Transporter configured (${host}:${port}, secure=${secure})`);
  } else {
    transporter = null;
  }

  return transporter;
}

const FROM_EMAIL = process.env.SMTP_FROM || process.env.EMAIL_FROM || 'ViratTom <team@virattom.com>';

/**
 * Send 6-digit OTP verification email
 */
async function sendOtpEmail(toEmail, otpCode, recipientName = 'User', purpose = 'Account & Resume Verification') {
  const mailer = getTransporter();
  const subject = `Your 6-Digit Verification Code: ${otpCode} - ViratTom`;

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

  if (mailer) {
    try {
      const info = await mailer.sendMail({
        from: FROM_EMAIL,
        to: toEmail,
        subject,
        html,
      });
      console.log(`[Email Service] Live SMTP email sent to ${toEmail}: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.error(`[Email Service] Live SMTP delivery failed to ${toEmail}:`, err.message);
      // Return success with devOtp so user flow is not interrupted
      return { success: true, fallback: true, error: err.message };
    }
  } else {
    console.log(`[Email Service (Simulation / Local)] OTP Email for ${toEmail}: ${otpCode}`);
    return { success: true, simulated: true };
  }
}

/**
 * Send inquiry confirmation email to client
 */
async function sendLeadConfirmationEmail(toEmail, leadData) {
  const mailer = getTransporter();
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

  if (mailer) {
    try {
      await mailer.sendMail({
        from: FROM_EMAIL,
        to: toEmail,
        subject,
        html,
      });
      console.log(`[Email Service] Lead confirmation sent to ${toEmail}`);
    } catch (err) {
      console.error(`[Email Service] Lead confirmation email error:`, err.message);
    }
  }
}

/**
 * Send Razorpay Payment Receipt to client
 */
async function sendPaymentReceiptEmail(toEmail, paymentData) {
  const mailer = getTransporter();
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

  if (mailer) {
    try {
      await mailer.sendMail({
        from: FROM_EMAIL,
        to: toEmail,
        subject,
        html,
      });
      console.log(`[Email Service] Payment receipt sent to ${toEmail}`);
    } catch (err) {
      console.error(`[Email Service] Payment receipt email error:`, err.message);
    }
  }
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
  sendLeadConfirmationEmail,
  sendPaymentReceiptEmail,
};
