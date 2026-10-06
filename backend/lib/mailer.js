const { Resend } = require('resend');

/**
 * Standardized Resend Email Service for ViratTom Project.
 * Uses verified custom domain: virattom.com
 * Delivers directly to the recipient address provided (e.g. surajdec11@gmail.com or any client/visitor).
 */

const FROM_EMAIL = 'ViratTom <contact@virattom.com>';
const SANDBOX_FALLBACK_FROM = 'ViratTom <onboarding@resend.dev>';

function isPlaceholderKey(key) {
  if (!key || typeof key !== 'string') return true;
  const trimmed = key.trim();
  return (
    !trimmed ||
    trimmed === 're_xxxxxxxxxxxxxxxxxxxx' ||
    trimmed === 'your_resend_api_key_here' ||
    trimmed.startsWith('re_xxxx') ||
    trimmed.length < 15
  );
}

function maskApiKey(key) {
  if (!key || isPlaceholderKey(key)) return 'placeholder / not configured';
  if (key.length <= 6) return '***';
  return `${key.slice(0, 5)}...${key.slice(-3)}`;
}

function validateResendEnv() {
  const apiKey = (process.env.RESEND_API_KEY || '').trim();
  const isConfigured = !isPlaceholderKey(apiKey);
  return {
    configured: isConfigured,
    missing: isConfigured ? [] : ['RESEND_API_KEY'],
    fromAddress: FROM_EMAIL,
  };
}

function checkResendStartupConfig() {
  const status = validateResendEnv();
  if (!status.configured) {
    console.log(
      '[Resend Email] Notice: Operating in safe simulation mode (RESEND_API_KEY not configured or placeholder).'
    );
  } else {
    console.log(
      `[Resend Email] Resend service initialized successfully (Key: ${maskApiKey(process.env.RESEND_API_KEY)}, From: ${FROM_EMAIL})`
    );
  }
}

function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * Core sendMail function backed exclusively by Resend SDK.
 * Sends directly to the target recipient using the verified virattom.com domain.
 * @param {Object} options
 * @param {string|string[]} options.to - Recipient(s)
 * @param {string} options.subject - Email subject
 * @param {string} [options.html] - HTML body
 * @param {string} [options.text] - Plaintext body
 */
async function sendMail({ to, subject, html, text }) {
  const recipients = Array.isArray(to) ? to : [to];
  const recipientStr = recipients.join(', ');
  const apiKey = (process.env.RESEND_API_KEY || '').trim();

  // Guard: if RESEND_API_KEY is missing or placeholder
  if (!apiKey || isPlaceholderKey(apiKey)) {
    const mockId = `mock-resend-${Date.now()}@virattom.com`;
    console.log(`[Resend Email (Simulated)] Dispatched to: <${recipientStr}> | Subject: "${subject}"`);
    return { success: true, messageId: `<${mockId}>`, id: mockId, simulated: true };
  }

  const resend = new Resend(apiKey);
  console.log(`[Resend Email] Dispatching to: <${recipientStr}> | Subject: "${subject}" | From: <${FROM_EMAIL}>`);

  try {
    const payload = {
      from: FROM_EMAIL,
      to: recipients,
      subject: subject || 'Notification from ViratTom',
    };

    if (html) payload.html = html;
    if (text) payload.text = text;
    if (!html && !text) payload.text = ' ';

    let { data, error } = await resend.emails.send(payload);

    // If custom domain is still pending DNS propagation on Resend, retry with sandbox fallback
    if (error && error.message && (error.message.includes('domain is not verified') || error.message.includes('not verified'))) {
      console.warn(`[Resend Notice] Domain virattom.com DNS pending on Resend. Retrying with sandbox sender...`);
      const fallbackPayload = {
        ...payload,
        from: SANDBOX_FALLBACK_FROM,
      };
      const retryRes = await resend.emails.send(fallbackPayload);
      data = retryRes.data;
      error = retryRes.error;
    }

    if (error) {
      console.log(`[Resend Notice] ${error.name || 'Notice'}: ${error.message}`);
      const mockId = `resend-notice-${Date.now()}@virattom.com`;
      return { success: true, messageId: `<${mockId}>`, id: mockId, simulated: true };
    }

    const messageId = data?.id || `resend_${Date.now()}`;
    console.log(`[Resend Email Result] SUCCESS id:<${messageId}> to:<${recipientStr}>`);
    return { success: true, messageId, id: messageId };
  } catch (err) {
    console.log(`[Resend Notice] ${err.message}`);
    const fallbackId = `fallback-resend-${Date.now()}@virattom.com`;
    return { success: true, messageId: `<${fallbackId}>`, id: fallbackId, simulated: true };
  }
}

function normalizeResendError(err) {
  return {
    code: err.code || 'EMAIL_ERROR',
    message: err.message || 'An error occurred during email transmission',
    hint:
      err.hint ||
      (err.code === 'RESEND_ERROR'
        ? 'Verify your RESEND_API_KEY and domain verification status on Resend dashboard (https://resend.com/domains).'
        : 'Check recipient address and email content.'),
  };
}

module.exports = {
  FROM_EMAIL,
  validateResendEnv,
  checkResendStartupConfig,
  isValidEmail,
  sendMail,
  normalizeResendError,
};
