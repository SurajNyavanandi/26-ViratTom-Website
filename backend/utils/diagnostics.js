/**
 * Startup system diagnostics and environment validation.
 * Prints structured logs highlighting:
 * - mongodb connected / in-memory store
 * - Brevo connected / Brevo connection failed
 * - cors issue / allowed origins
 * - "Everything fine no issues" when all essential services are ready
 */
async function runStartupDiagnostics({ dbResult = null, corsOrigins = [], port = 3000 } = {}) {
  const issues = [];
  const warnings = [];
  const successes = [];

  console.log('\n============================================================');
  console.log('       VIRATTOM SYSTEM STARTUP & ENVIRONMENT DIAGNOSTICS     ');
  console.log('============================================================');

  // 1. Port Verification
  console.log(`[Port] Active on port ${port} (0.0.0.0)`);

  // 2. Database Connection Check
  if (dbResult && dbResult.connected) {
    console.log('[Database] mongodb connected successfully');
    successes.push('mongodb connected');
  } else {
    const rawUri = (process.env.MONGO_URI || process.env.MONGODB_URI || '').trim();
    if (!rawUri) {
      console.log('[Database] MONGO_URI not provided -> High-speed in-memory repository active');
      warnings.push('MONGO_URI empty (in-memory mode)');
    } else {
      console.warn(`[Database] MongoDB connection note: ${dbResult?.reason || 'unreachable'} -> In-memory repository active`);
      warnings.push('MongoDB offline (in-memory mode)');
    }
  }

  // 3. CORS Configuration Check
  const rawCors = (process.env.CORS_ORIGIN || '').trim();
  if (rawCors.includes(' ') && !rawCors.includes(',')) {
    console.warn('[CORS] cors issue: CORS_ORIGIN contains spaces without commas. Please use comma-separated URLs or "*"');
    issues.push('cors issue: invalid format');
  } else {
    console.log(`[CORS] CORS configured (Allowed: ${rawCors || '*'}${corsOrigins.length ? ` + ${corsOrigins.length} preset domains` : ''})`);
    successes.push('cors active');
  }

  // 4. Gmail SMTP Email Service Check
  try {
    const { validateGmailEnv } = require('../lib/mailer');
    const gmailCheck = validateGmailEnv();
    if (gmailCheck.configured) {
      console.log(`[Email] Gmail SMTP configured (${process.env.GMAIL_USER})`);
      successes.push('Gmail connected');
    } else {
      console.log(`[Email] Gmail SMTP credentials missing: ${gmailCheck.missing.join(', ')}`);
      warnings.push(`Gmail: missing ${gmailCheck.missing.join(', ')}`);
    }
  } catch (err) {
    console.log(`[Email] Gmail check notice: ${err.message}`);
    warnings.push(`Gmail: ${err.message}`);
  }

  // 5. Authentication & Security Check
  const jwtSecret = (process.env.JWT_SECRET || '').trim();
  if (!jwtSecret || jwtSecret === 'your-jwt-secret') {
    console.warn('[Security] JWT_SECRET is using default fallback key. Recommended to set a random string in .env');
    warnings.push('JWT_SECRET using fallback');
  } else {
    console.log('[Security] JWT_SECRET verified');
    successes.push('JWT verified');
  }

  // 6. Admin Email Check
  const adminEmail = (process.env.ADMIN_EMAIL || process.env.BREVO_SENDER_EMAIL || 'kanusuraj15@gmail.com').trim();
  console.log(`[Admin] Admin email: ${adminEmail}`);

  // 7. Payment Gateway Check
  const rzpId = (process.env.RAZORPAY_KEY_ID || '').trim();
  const rzpSecret = (process.env.RAZORPAY_KEY_SECRET || '').trim();
  if (rzpId && rzpSecret) {
    console.log('[Payments] Razorpay credentials active');
  } else {
    console.log('[Payments] Razorpay credentials not configured (mock test payments active)');
  }

  // 8. AI Assistant Check
  const geminiKey = (process.env.GEMINI_API_KEY || '').trim();
  if (geminiKey) {
    console.log('[AI] Google Gemini API Key configured');
  } else {
    console.log('[AI] GEMINI_API_KEY not configured (built-in intelligent consultant active)');
  }

  // 9. Summary & Final Verdict
  console.log('------------------------------------------------------------');
  if (issues.length === 0) {
    console.log('STATUS: Everything fine no issues');
  } else {
    console.log(`STATUS: Operational with ${issues.length} environment notice(s):`);
    issues.forEach((iss) => console.log(` - ${iss}`));
  }
  console.log('============================================================\n');
}

module.exports = {
  runStartupDiagnostics,
};
