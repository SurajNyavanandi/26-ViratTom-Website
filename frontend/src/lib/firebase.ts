import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import config from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: config.apiKey,
  authDomain: config.authDomain,
  projectId: config.projectId,
  storageBucket: config.storageBucket,
  messagingSenderId: config.messagingSenderId,
  appId: config.appId,
};

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Use custom firestoreDatabaseId if configured
export const db = config.firestoreDatabaseId && config.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, config.firestoreDatabaseId)
  : getFirestore(app);

/**
 * Initializes a 100% invisible RecaptchaVerifier on the specified element.
 * No visible captcha boxes or puzzle checkboxes appear.
 */
export function setupInvisibleRecaptcha(containerId: string): RecaptchaVerifier {
  // Clear any existing verifier on this container
  if ((window as any)[`recaptcha_${containerId}`]) {
    try {
      (window as any)[`recaptcha_${containerId}`].clear();
    } catch (e) {
      // ignore
    }
  }

  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = '';
  }

  const verifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {
      console.log(`[Firebase Phone Auth] 🔒 Invisible security handshake verified.`);
    },
    'expired-callback': () => {
      console.warn(`[Firebase Phone Auth] Verification handshake expired. Refreshing...`);
    }
  });

  (window as any)[`recaptcha_${containerId}`] = verifier;
  return verifier;
}

/**
 * Dispatches real SMS verification OTP via Firebase Phone Auth
 */
export async function sendPhoneOtp(
  phoneNumber: string, 
  appVerifier: RecaptchaVerifier
): Promise<ConfirmationResult> {
  console.log(`[Firebase Phone Auth] 🚀 Dispatching SMS OTP to: ${phoneNumber}`);
  console.log(`[Firebase Phone Auth] Project ID: ${config.projectId}`);

  try {
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
    console.log(`[Firebase Phone Auth] ✅ SMS OTP sent to ${phoneNumber}! Verification ID: ${confirmationResult.verificationId}`);
    return confirmationResult;
  } catch (error: any) {
    console.error(`[Firebase Phone Auth] ❌ Error sending OTP to ${phoneNumber}:`, {
      code: error?.code,
      message: error?.message,
      fullError: error
    });
    throw error;
  }
}

export function formatFirebaseError(err: any): string {
  if (!err) return 'Verification failed. Please try again.';
  const code = err.code || '';
  const msg = err.message || '';
  
  if (code === 'auth/operation-not-allowed') {
    return 'Phone authentication is not enabled in Firebase Console. Please verify your settings.';
  }
  if (code === 'auth/invalid-phone-number') {
    return 'Invalid phone number format. Please enter a valid 10-digit mobile number.';
  }
  if (code === 'auth/missing-phone-number') {
    return 'Please enter your mobile phone number.';
  }
  if (code === 'auth/quota-exceeded') {
    return 'SMS quota exceeded for today. Please try again later.';
  }
  if (code === 'auth/too-many-requests') {
    return 'Too many attempts. Please wait a minute and try again.';
  }
  if (code === 'auth/invalid-verification-code') {
    return 'Incorrect OTP. Please enter the 6-digit code received on your phone.';
  }
  if (code === 'auth/code-expired') {
    return 'OTP has expired. Please request a new code.';
  }
  return msg || 'Authentication error. Please try again.';
}

export { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  serverTimestamp 
};
