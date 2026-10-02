/**
 * Unified Email Service adapter delegating directly to the local Nodemailer + Gmail SMTP mailer.
 * Pure Nodemailer + Gmail SMTP with safe mock fallback when credentials are not supplied.
 */

const mailer = require('./mailer');

/**
 * Sends an email using the standalone Gmail mailer.
 */
async function sendEmail({ to, subject, html, text, from }) {
  return mailer.sendMail({ to, subject, html, text, from });
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

/**
 * Send 6-digit OTP verification email via Gmail SMTP
 */
async function sendOtpEmail(toEmail, otpCode, purpose = 'Verification') {
  const subject = `${otpCode} is your verification code`;
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
          <h2 style="font-size: 20px; font-weight: 700; color: #111827; margin: 0 0 12px 0;">${cleanPurpose} Code</h2>
          <p style="font-size: 14px; color: #4b5563; line-height: 1.5; margin: 0 0 24px 0;">
            Use the 6-digit verification code below to complete verification.
          </p>
          <div style="background: #f3f4f6; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px; border: 1px dashed #cbd5e1;">
            <span style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #111827; display: inline-block;">
              ${cleanCode}
            </span>
          </div>
          <p style="font-size: 12px; color: #6b7280; line-height: 1.5; margin: 0 0 20px 0;">
            This security code is valid for 10 minutes.
          </p>
        </div>
      </body>
    </html>
  `;

  const text = `Your verification code is: ${otpCode}\n\nValid for 10 minutes.`;
  return sendEmail({ to: toEmail, subject, html, text });
}

/**
 * Send inquiry confirmation email
 */
async function sendLeadConfirmationEmail(toEmail, leadData = {}) {
  const subject = `Inquiry Received - Project Confirmation`;
  const name = escapeHtml(leadData.name || 'Valued Client');
  const service = escapeHtml(leadData.service || leadData.projectType || 'Custom Application Development');

  const html = `
    <!DOCTYPE html>
    <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb; margin: 0; padding: 24px;">
        <div style="max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 14px; border: 1px solid #e5e7eb; padding: 28px;">
          <h2 style="font-size: 20px; font-weight: 700; color: #111827; margin: 0 0 12px 0;">Hello ${name},</h2>
          <p style="font-size: 14px; color: #4b5563; line-height: 1.6;">
            Thank you for reaching out regarding <b>${service}</b>.
          </p>
          <p style="font-size: 14px; color: #4b5563; line-height: 1.6;">
            We have received your requirements and will connect with you within 24 hours.
          </p>
        </div>
      </body>
    </html>
  `;

  const text = `Hello ${leadData.name || 'Valued Client'},\n\nThank you for reaching out regarding ${leadData.service || 'your project'}.\nWe have received your requirements and will connect with you within 24 hours.`;
  return sendEmail({ to: toEmail, subject, html, text });
}

/**
 * Send payment receipt email
 */
async function sendPaymentReceiptEmail(toEmail, paymentData = {}) {
  const amount = paymentData.amount || 0;
  const projectName = escapeHtml(paymentData.projectName || 'Project');
  const txId = escapeHtml(paymentData.paymentId || paymentData.transactionId || 'N/A');
  const subject = `Payment Receipt: ₹${amount}`;

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
        </div>
      </body>
    </html>
  `;

  const text = `Payment Confirmation\n\nWe have received your payment of ₹${amount} for ${paymentData.projectName || 'Project'}.\nTransaction Reference: ${paymentData.paymentId || paymentData.transactionId || 'N/A'}`;
  return sendEmail({ to: toEmail, subject, html, text });
}

/**
 * Send admin alert email
 */
async function sendAdminAlertEmail(subject, text, html) {
  const target = process.env.ADMIN_EMAIL || process.env.GMAIL_USER;
  if (!target) return { success: false, error: 'Recipient address not configured' };
  return sendEmail({ to: target, subject: `[Admin Alert] ${subject}`, text, html });
}

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
  mailQueue,
  getQueueMetrics: () => mailQueue.getMetrics(),
};
