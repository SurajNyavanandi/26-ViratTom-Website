/**
 * ============================================================================
 * ViratTom Universal Diagnostic Logger
 * ============================================================================
 * Provides zero-guesswork diagnostic tracking for:
 * 1. Email & SMTP dispatch (trace, root cause, instant fix instructions)
 * 2. Backend & Express API errors (route, sanitized payload, error, file/line, stack)
 * 3. System-level unhandled exceptions & database events
 */

const dns = require('dns');

/**
 * Sanitize sensitive parameters from payload before logging
 */
function sanitizePayload(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  try {
    const copy = Array.isArray(obj) ? [...obj] : { ...obj };
    const sensitiveKeys = ['password', 'pass', 'secret', 'token', 'key', 'apiKey', 'authorization'];
    for (const key of Object.keys(copy)) {
      if (sensitiveKeys.some((s) => key.toLowerCase().includes(s.toLowerCase()))) {
        copy[key] = '******** (masked)';
      } else if (typeof copy[key] === 'object' && copy[key] !== null) {
        copy[key] = sanitizePayload(copy[key]);
      }
    }
    return copy;
  } catch {
    return '[Unserializable Payload]';
  }
}

/**
 * Extract source file and line number from an Error stack trace
 */
function extractLocationFromStack(stack) {
  if (!stack || typeof stack !== 'string') return 'Unknown Location';
  const lines = stack.split('\n');
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    // Match (/path/to/file.js:line:col) or (file.js:line:col) or at ... /path:line:col
    const match = line.match(/\(?([\w\d_\-\.\/\\]+\.(js|ts|jsx|tsx)):(\d+):(\d+)\)?/);
    if (match && !match[1].includes('node_modules') && !match[1].includes('internal/')) {
      const fileName = match[1].split(/[/\\]/).pop();
      return `${fileName}:${match[3]}:${match[4]} (${line.trim()})`;
    }
  }
  // Fallback to first non-internal frame
  return lines[1] ? lines[1].trim() : 'Unknown Location';
}

/**
 * Analyze an SMTP / Email error to provide immediate root-cause explanation and instant-fix steps
 */
function analyzeEmailError(err, context = {}) {
  const msg = String(err?.message || '');
  const code = String(err?.code || err?.statusCode || '');
  const response = String(err?.response || err?.brevoResponse ? JSON.stringify(err.brevoResponse) : '');
  const to = context.to || 'recipient';

  let rootCause = 'An unexpected error occurred during email transmission via Brevo API.';
  let instantFix = 'Check that BREVO_API_KEY and BREVO_SENDER_EMAIL are set correctly.';

  if (
    msg.includes('Key not found') ||
    msg.includes('unauthorized') ||
    msg.includes('401') ||
    code === '401'
  ) {
    rootCause = 'Brevo API rejected your BREVO_API_KEY. The key is either invalid, revoked, or has insufficient permissions.';
    instantFix = [
      '1. Log into your Brevo dashboard at https://app.brevo.com',
      '2. Navigate to "SMTP & API Keys" (https://app.brevo.com/settings/keys/api)',
      '3. Generate a new API Key (starts with "xkeysib-")',
      '4. Set BREVO_API_KEY in your Render / hosting environment variables.',
    ].join('\n     ');
  } else if (
    msg.includes('sender') ||
    msg.includes('unregistered') ||
    msg.includes('400') ||
    code === '400'
  ) {
    rootCause = `Brevo rejected the sender email address (${process.env.BREVO_SENDER_EMAIL || 'unconfigured'}). The sender email must be verified in your Brevo account.`;
    instantFix = [
      '1. Log into Brevo: https://app.brevo.com/senders',
      '2. Add and verify your sender email address (BREVO_SENDER_EMAIL).',
      '3. Set BREVO_SENDER_EMAIL in your environment variables to match that verified email.',
    ].join('\n     ');
  } else if (msg.includes('ENETUNREACH') || msg.includes('ETIMEDOUT') || msg.includes('fetch failed')) {
    rootCause = 'Network error attempting to reach https://api.brevo.com.';
    instantFix = 'Ensure outbound HTTPS (port 443) connectivity is available on your hosting server.';
  }

  return { rootCause, instantFix };
}

/**
 * High-visibility email dispatch trace logger
 */
function logEmailTrace(info = {}) {
  const {
    host = 'smtp.gmail.com',
    port = 465,
    isSecure = true,
    user = 'N/A',
    from = 'N/A',
    to = 'N/A',
    subject = 'N/A',
    resolvedIp = 'Checking...',
    dispatchMode = 'SMTP Relay',
  } = info;

  console.log('\n┌────────────────────────────────────────────────────────────────────────┐');
  console.log('│ 📧 [EMAIL DIAGNOSTIC TRACE] Dispatch Initiated                          │');
  console.log('├────────────────────────────────────────────────────────────────────────┤');
  console.log(`│ • Timestamp    : ${new Date().toISOString()}`);
  console.log(`│ • Mode         : ${dispatchMode}`);
  console.log(`│ • SMTP Host    : ${host}:${port} (${isSecure ? 'SSL/TLS - Secure' : 'STARTTLS'})`);
  console.log(`│ • DNS IPv4     : ${resolvedIp}`);
  console.log(`│ • Auth User    : ${user}`);
  console.log(`│ • From         : ${from}`);
  console.log(`│ • Recipient    : ${to}`);
  console.log(`│ • Subject      : "${subject}"`);
  console.log('└────────────────────────────────────────────────────────────────────────┘\n');
}

/**
 * High-visibility email failure banner with exact error, root cause, and instant fix
 */
function logEmailFailure(err, context = {}) {
  const { host, port, user, to, durationMs } = context;
  const analysis = analyzeEmailError(err, context);
  const exactError = err?.message || 'Unknown email error';
  const errorCode = err?.code || err?.responseCode || 'N/A';
  const rawResponse = err?.response || 'None';

  console.error('\n╔════════════════════════════════════════════════════════════════════════╗');
  console.error('║ 🚨 [EMAIL DELIVERY FAILURE DIAGNOSTIC]                                 ║');
  console.error('╠════════════════════════════════════════════════════════════════════════╣');
  console.error(`║ ⏱ TIMESTAMP  : ${new Date().toISOString()}`);
  console.error(`║ 🎯 RECIPIENT  : ${to || 'Unknown'}`);
  console.error(`║ 🌐 TARGET     : ${host || 'Unknown'}:${port || 'Unknown'} (Auth: ${user || 'Unknown'})`);
  console.error(`║ ⏱ DURATION   : ${durationMs ? durationMs + 'ms' : 'N/A'}`);
  console.error(`║ ❌ EXACT ERROR: [${errorCode}] ${exactError}`);
  if (rawResponse && rawResponse !== 'None') {
    console.error(`║ 📥 RAW SERVER : ${rawResponse}`);
  }
  console.error('╟────────────────────────────────────────────────────────────────────────╢');
  console.error(`║ 🔍 ROOT CAUSE :`);
  console.error(`║   ${analysis.rootCause}`);
  console.error('╟────────────────────────────────────────────────────────────────────────╢');
  console.error(`║ 💡 INSTANT FIX :`);
  console.error(`║   ${analysis.instantFix}`);
  console.error('╚════════════════════════════════════════════════════════════════════════╝\n');
}

/**
 * High-visibility Express API & backend error logger
 */
function logApiError(req, err) {
  const timestamp = new Date().toISOString();
  const method = req?.method || 'UNKNOWN';
  const url = req?.originalUrl || req?.url || 'UNKNOWN_URL';
  const ip = req?.ip || req?.headers?.['x-forwarded-for'] || '127.0.0.1';
  const sanitizedBody = sanitizePayload(req?.body || {});
  const sanitizedQuery = sanitizePayload(req?.query || {});
  const errorName = err?.name || 'Error';
  const errorMessage = err?.message || 'Unknown Server Error';
  const location = extractLocationFromStack(err?.stack);

  console.error('\n╔════════════════════════════════════════════════════════════════════════╗');
  console.error('║ 🚨 [BACKEND API ERROR DIAGNOSTIC]                                      ║');
  console.error('╠════════════════════════════════════════════════════════════════════════╣');
  console.error(`║ ⏱ TIMESTAMP  : ${timestamp}`);
  console.error(`║ 🌐 ROUTE      : ${method} ${url} (Client IP: ${ip})`);
  console.error(`║ 📦 QUERY      : ${JSON.stringify(sanitizedQuery)}`);
  console.error(`║ 📦 BODY       : ${JSON.stringify(sanitizedBody)}`);
  console.error(`║ ❌ ERROR      : ${errorName}: ${errorMessage}`);
  console.error(`║ 📍 LOCATION   : ${location}`);
  console.error('╟────────────────────────────────────────────────────────────────────────╢');
  console.error('║ 📜 FULL STACK TRACE:');
  const stackLines = (err?.stack || '').split('\n').slice(0, 10);
  stackLines.forEach((line) => {
    console.error(`║   ${line.trim()}`);
  });
  console.error('╚════════════════════════════════════════════════════════════════════════╝\n');
}

/**
 * High-visibility system-level error logger
 */
function logSystemError(contextTitle, err) {
  const timestamp = new Date().toISOString();
  const errorName = err?.name || 'Error';
  const errorMessage = err?.message || String(err);
  const location = extractLocationFromStack(err?.stack);

  console.error('\n╔════════════════════════════════════════════════════════════════════════╗');
  console.error(`║ 🚨 [SYSTEM ERROR DIAGNOSTIC] - ${contextTitle.toUpperCase()}`);
  console.error('╠════════════════════════════════════════════════════════════════════════╣');
  console.error(`║ ⏱ TIMESTAMP  : ${timestamp}`);
  console.error(`║ ❌ ERROR      : ${errorName}: ${errorMessage}`);
  console.error(`║ 📍 LOCATION   : ${location}`);
  if (err?.stack) {
    console.error('╟────────────────────────────────────────────────────────────────────────╢');
    console.error('║ 📜 STACK TRACE:');
    const stackLines = err.stack.split('\n').slice(0, 8);
    stackLines.forEach((line) => {
      console.error(`║   ${line.trim()}`);
    });
  }
  console.error('╚════════════════════════════════════════════════════════════════════════╝\n');
}

module.exports = {
  logEmailTrace,
  logEmailFailure,
  logApiError,
  logSystemError,
  analyzeEmailError,
  extractLocationFromStack,
};
