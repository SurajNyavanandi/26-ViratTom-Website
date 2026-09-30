const { checkSmtpStatus } = require('../services/mailer');

/**
 * Startup system diagnostics and environment validation.
 * Prints structured logs highlighting:
 * - mongodb connected / in-memory store
 * - email sent successfully / failed to send email
 * - cors issue / allowed origins
 * - smptp issue / SMTP connected
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

  // 4. SMTP / Email Configuration Check
  try {
    const smtpCheck = await checkSmtpStatus();
    if (smtpCheck.ok) {
      if (smtpCheck.status === 'connected') {
        console.log(`[SMTP] ${smtpCheck.message}`);
        successes.push('SMTP connected');
      } else {
        console.log(`[SMTP] ${smtpCheck.message}`);
      }
    } else {
      console.warn(`[SMTP] ${smtpCheck.message}`);
      issues.push(smtpCheck.message);
    }
  } catch (err) {
    console.warn(`[SMTP] smptp issue: ${err.message}`);
    issues.push(`smptp issue: ${err.message}`);
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
  const adminEmail = (process.env.ADMIN_EMAIL || '').trim();
  if (!adminEmail) {
    console.warn('[Admin] ADMIN_EMAIL not set, defaulting to kanusuraj15@gmail.com');
  } else {
    console.log(`[Admin] Admin email: ${adminEmail}`);
  }

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
