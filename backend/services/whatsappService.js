/**
 * WhatsApp Silent Verification Service
 * 
 * Silently verifies whether a phone number has an active WhatsApp account using
 * the official Meta WhatsApp Cloud API (/contacts endpoint) without sending any
 * message, notification, or alert to the user.
 * 
 * Also filters out dummy, repetitive, and non-mobile telecom series before calling Meta.
 */

// In-memory cache for recent checks (TTL: 15 minutes)
const verificationCache = new Map();
const CACHE_TTL_MS = 15 * 60 * 1000;

// Known mock/dummy patterns
const KNOWN_DUMMY_PATTERNS = new Set([
  '0123456789',
  '1234567890',
  '0987654321',
  '9876543210',
]);

/**
 * Validates format, telecom allocation, and filters dummy/repetitive numbers
 * @param {string} rawPhone 
 * @returns {{ isValid: boolean; cleanDigits: string; formattedWithCountry: string; error?: string }}
 */
function precheckPhone(rawPhone) {
  const digits = String(rawPhone || '').replace(/\D/g, '');

  if (!digits || digits.length < 10) {
    return {
      isValid: false,
      cleanDigits: digits,
      formattedWithCountry: '',
      error: 'Please enter a valid 10-digit mobile number.',
    };
  }

  // Extract last 10 digits for Indian standard
  const tenDigit = digits.slice(-10);

  // Check 1: Must start with 6, 7, 8, or 9 (Indian TRAI Mobile Series)
  const firstDigit = tenDigit.charAt(0);
  if (!['6', '7', '8', '9'].includes(firstDigit)) {
    return {
      isValid: false,
      cleanDigits: tenDigit,
      formattedWithCountry: '',
      error: 'Please enter a valid mobile number starting with 6, 7, 8, or 9.',
    };
  }

  // Check 2: All same repeating digits (e.g. 0000000000, 1111111111, 9999999999)
  const isAllSame = /^(\d)\1{9}$/.test(tenDigit);
  if (isAllSame) {
    return {
      isValid: false,
      cleanDigits: tenDigit,
      formattedWithCountry: '',
      error: 'Please enter an authentic, active mobile number.',
    };
  }

  // Check 3: Known sequential dummy numbers
  if (KNOWN_DUMMY_PATTERNS.has(tenDigit)) {
    return {
      isValid: false,
      cleanDigits: tenDigit,
      formattedWithCountry: '',
      error: 'Please enter a genuine, active mobile number.',
    };
  }

  // Format with country code (+91 for 10-digit India)
  const countryCode = digits.length > 10 ? digits.slice(0, digits.length - 10) : '91';
  const fullE164 = `+${countryCode}${tenDigit}`;

  return {
    isValid: true,
    cleanDigits: tenDigit,
    formattedWithCountry: fullE164,
  };
}

/**
 * Verifies whether a number has an active WhatsApp account
 * @param {string} rawPhone 
 * @param {object} [customCredentials] 
 * @returns {Promise<{ isValid: boolean; waId?: string; status?: string; method: string; error?: string }>}
 */
async function verifyWhatsAppNumber(rawPhone, customCredentials = {}) {
  const precheck = precheckPhone(rawPhone);
  if (!precheck.isValid) {
    return {
      isValid: false,
      method: 'precheck',
      error: precheck.error,
    };
  }

  const { formattedWithCountry, cleanDigits } = precheck;

  // Check cache first
  const cached = verificationCache.get(formattedWithCountry);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.result;
  }

  // Meta Cloud API configuration
  const phoneNumberId = (
    customCredentials.phoneNumberId ||
    process.env.WHATSAPP_PHONE_NUMBER_ID ||
    process.env.META_PHONE_NUMBER_ID ||
    ''
  ).trim();

  const accessToken = (
    customCredentials.accessToken ||
    process.env.WHATSAPP_ACCESS_TOKEN ||
    process.env.META_ACCESS_TOKEN ||
    process.env.WHATSAPP_TOKEN ||
    ''
  ).trim();

  // If Meta API credentials are not configured, pass precheck gracefully
  if (!phoneNumberId || !accessToken || phoneNumberId.includes('your_') || accessToken.includes('your_')) {
    const fallbackResult = {
      isValid: true,
      waId: formattedWithCountry.replace(/\+/g, ''),
      status: 'valid_precheck',
      method: 'telecom_precheck',
    };
    verificationCache.set(formattedWithCountry, { result: fallbackResult, timestamp: Date.now() });
    return fallbackResult;
  }

  // Call official Meta Graph API contacts check endpoint
  try {
    const metaApiUrl = `https://graph.facebook.com/v21.0/${phoneNumberId}/contacts`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500); // 3.5s timeout for zero user latency

    const response = await fetch(metaApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        blocking: 'wait',
        contacts: [formattedWithCountry],
        force_check: true,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const contactInfo = data?.contacts?.[0];

      if (contactInfo) {
        if (contactInfo.status === 'valid') {
          const result = {
            isValid: true,
            waId: contactInfo.wa_id || formattedWithCountry.replace(/\+/g, ''),
            status: 'valid',
            method: 'meta_cloud_api',
          };
          verificationCache.set(formattedWithCountry, { result, timestamp: Date.now() });
          return result;
        } else if (contactInfo.status === 'invalid') {
          const result = {
            isValid: false,
            status: 'invalid',
            method: 'meta_cloud_api',
            error: 'The mobile number entered does not have an active WhatsApp account. Please provide an active WhatsApp number.',
          };
          verificationCache.set(formattedWithCountry, { result, timestamp: Date.now() });
          return result;
        }
      }
    } else {
      const errBody = await response.text().catch(() => '');
      console.warn('[WhatsApp Verify] Meta API returned non-200:', response.status, errBody);
    }
  } catch (err) {
    console.warn('[WhatsApp Verify] Meta API lookup warning:', err.message);
  }

  // Fallback: If Meta API call encountered transient failure or rate-limit, accept valid telecom format
  const safeFallback = {
    isValid: true,
    waId: formattedWithCountry.replace(/\+/g, ''),
    status: 'fallback_accepted',
    method: 'telecom_fallback',
  };
  return safeFallback;
}

module.exports = {
  precheckPhone,
  verifyWhatsAppNumber,
};
