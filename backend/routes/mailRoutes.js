const express = require('express');
const router = express.Router();

let mailerPromise = null;
function getMailer() {
  if (!mailerPromise) {
    mailerPromise = import('../../mailer/index.ts');
  }
  return mailerPromise;
}

/**
 * GET /api/mail/status
 * Returns { configured: boolean, missing: string[] }
 */
router.get('/status', async (req, res, next) => {
  try {
    const { validateGmailEnv } = await getMailer();
    const status = validateGmailEnv();
    return res.status(200).json({
      configured: status.configured,
      missing: status.missing,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/mail/send
 * Accepts { to, subject, message }
 */
router.post('/send', async (req, res, next) => {
  try {
    const { to, subject, message, text, html, from } = req.body || {};

    if (!to || (!subject && subject !== '') || (!message && !text && !html)) {
      const error = new Error("Missing required fields: 'to', 'subject', and 'message' are required.");
      error.code = 'VALIDATION_ERROR';
      error.hint = 'Provide a valid JSON body with { to, subject, message }.';
      throw error;
    }

    const { sendMail, isValidEmail } = await getMailer();

    const recipients = Array.isArray(to) ? to : [to];
    for (const recipient of recipients) {
      if (!isValidEmail(recipient)) {
        const error = new Error(`Invalid recipient email address format: "${recipient}".`);
        error.code = 'INVALID_RECIPIENT';
        error.hint = 'Please provide a valid recipient email address (e.g. user@example.com).';
        throw error;
      }
    }

    const emailContent = message || text || '';
    const result = await sendMail({
      to,
      subject,
      text: emailContent,
      html: html || (emailContent ? `<p>${emailContent}</p>` : undefined),
      from,
    });

    return res.status(200).json({
      success: true,
      messageId: result.messageId,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Centralized Mail Error Handler
 * Returns appropriate HTTP status codes and the normalized JSON error shape:
 * { success: false, code, message, hint }
 */
router.use(async (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const { normalizeGmailError } = await getMailer();
  const normalized = normalizeGmailError(err);

  let statusCode = 500;
  if (normalized.code === 'VALIDATION_ERROR' || normalized.code === 'INVALID_RECIPIENT') {
    statusCode = 400;
  } else if (normalized.code === 'EAUTH') {
    statusCode = 401;
  } else if (normalized.code === 'CONFIG_MISSING') {
    statusCode = 503;
  } else if (normalized.code === 'ECONNECTION' || normalized.code === 'ETIMEDOUT') {
    statusCode = 504;
  }

  return res.status(statusCode).json({
    success: false,
    code: normalized.code,
    message: normalized.message,
    hint: normalized.hint,
  });
});

module.exports = router;
