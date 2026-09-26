const mailQueue = require('./mailQueue');
const { transporter, sendMail, sendOtpEmail: mailerOtp, getDefaultFrom } = require('./mailer');

function getTransporter() {
  return transporter;
}

function getFromEmail() {
  return getDefaultFrom();
}

/**
 * Send generic email with timeout guard
 */
async function sendGenericEmail({ to, subject, html, logType = 'Email', code = '', attachments = [] }) {
  const startTime = Date.now();
  try {
    const res = await sendMail({
      to,
      subject,
      html,
      attachments,
    });
    const elapsed = Date.now() - startTime;
    console.log(`[${logType} Sent] To: ${to}${code ? ` | Code: ${code}` : ''} (${elapsed}ms)`);
    return { success: true, ...res, durationMs: elapsed };
  } catch (err) {
    const elapsed = Date.now() - startTime;
    console.warn(`[${logType} Error] (${elapsed}ms): ${err.message}`);
    return { success: false, error: err.message, durationMs: elapsed };
  }
}

/**
 * Send 6-digit OTP verification email
 */
async function sendOtpEmail(toEmail, otpCode, purpose = 'Verification') {
  return mailerOtp(toEmail, otpCode, purpose);
}

/**
 * Offload OTP to background queue
 */
function queueOtpEmail(toEmail, otpCode, purpose = 'Verification') {
  return mailQueue.add(
    () => sendOtpEmail(toEmail, otpCode, purpose),
    { type: 'OTP', to: toEmail, code: otpCode }
  );
}

/**
 * Send confirmation email to lead
 */
async function sendLeadConfirmationEmail(toEmail, leadData) {
  const subject = `Inquiry Received - ViratTom Web & Mobile Solutions`;
  const name = leadData.name || 'Valued Client';
  const service = leadData.service || 'Custom Application Development';

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb; padding: 28px;">
      <h2 style="font-size: 20px; font-weight: 700; color: #111827; margin: 0 0 12px 0;">Hello ${escapeHtml(name)},</h2>
      <p style="font-size: 14px; color: #4b5563; line-height: 1.6;">
        Thank you for reaching out to <b>ViratTom</b> regarding <b>${escapeHtml(service)}</b>.
      </p>
      <p style="font-size: 14px; color: #4b5563; line-height: 1.6;">
        We have received your requirements and our engineering lead will review your project scope and contact you within 24 hours.
      </p>
      <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #f3f4f6; font-size: 12px; color: #9ca3af;">
        ViratTom Solutions • High-Performance Web & Mobile Applications
      </div>
    </div>
  `;

  return sendGenericEmail({ to: toEmail, subject, html, logType: 'Lead Confirmation' });
}

function queueLeadConfirmationEmail(toEmail, leadData) {
  return mailQueue.add(
    () => sendLeadConfirmationEmail(toEmail, leadData),
    { type: 'Lead Confirmation', to: toEmail }
  );
}

/**
 * Send Payment Receipt confirmation email
 */
async function sendPaymentReceiptEmail(toEmail, paymentData) {
  const subject = `Payment Receipt: ₹${paymentData.amount} - ViratTom`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb; padding: 28px;">
      <h2 style="font-size: 20px; font-weight: 700; color: #111827; margin: 0 0 12px 0;">Payment Received</h2>
      <p style="font-size: 14px; color: #4b5563; line-height: 1.6;">
        We have received your advance payment of <b>₹${paymentData.amount}</b> for project <b>${escapeHtml(paymentData.projectName || 'Project')}</b>.
      </p>
      <p style="font-size: 13px; color: #6b7280;">Transaction Reference: ${escapeHtml(paymentData.paymentId || paymentData.transactionId || 'N/A')}</p>
      <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #f3f4f6; font-size: 12px; color: #9ca3af;">
        ViratTom Solutions • Invoicing & Client Portal
      </div>
    </div>
  `;

  return sendGenericEmail({ to: toEmail, subject, html, logType: 'Payment Receipt' });
}

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
  getFromEmail,
  sendGenericEmail,
  sendOtpEmail,
  queueOtpEmail,
  sendLeadConfirmationEmail,
  queueLeadConfirmationEmail,
  sendPaymentReceiptEmail,
  queuePaymentReceiptEmail,
  mailQueue,
  getQueueMetrics: () => mailQueue.getMetrics(),
};
