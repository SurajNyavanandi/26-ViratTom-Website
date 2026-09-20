// Firebase configuration and optional phone authentication helper
const app: any = null;
const auth: any = null;
const db: any = null;

export { app, auth, db };

export function setupInvisibleRecaptcha(containerId: string): any {
  console.log(`[Recaptcha] Setup requested on ${containerId}`);
  return {
    verify: async () => 'verified',
    clear: () => {}
  };
}

export async function sendPhoneOtp(
  phoneNumber: string, 
  _appVerifier: any
): Promise<any> {
  console.log(`[Phone Auth] OTP requested for ${phoneNumber}`);
  return {
    verificationId: 'mock_verification_' + Date.now(),
    confirm: async (_code: string) => ({ user: { phoneNumber } })
  };
}

export function formatFirebaseError(err: any): string {
  if (!err) return 'Verification failed. Please try again.';
  return err.message || 'Authentication error. Please try again.';
}

export const collection = (_db: any, name: string) => name;
export const addDoc = async (_col: any, data: any) => ({ id: 'doc_' + Date.now(), ...data });
export const getDocs = async (_q: any) => ({ docs: [] });
export const query = (...args: any[]) => args;
export const orderBy = (...args: any[]) => args;
export const serverTimestamp = () => new Date().toISOString();
