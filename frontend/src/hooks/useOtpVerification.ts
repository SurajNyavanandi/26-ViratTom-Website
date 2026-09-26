import { useState, useEffect, useCallback, useRef } from 'react';
import { Validation } from '@/lib/validation';
import { safeFetchJson } from '@/lib/utils';

export interface UseOtpOptions {
  cooldownSeconds?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export function useOtpVerification(options: UseOtpOptions = {}) {
  const { cooldownSeconds = 60, onSuccess, onError } = options;

  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(0);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recipient, setRecipient] = useState<string>('');

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const fullOtp = otp.join('');
  const isComplete = fullOtp.length === 6 && Validation.isValidOtp(fullOtp);

  // Countdown timer tick
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const setOtpDigit = useCallback((index: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    setOtp((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });
    setError(null);

    // Auto-focus next input if digit entered
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }, []);

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace' && !otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    },
    [otp]
  );

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const digits = pasted.split('');
    setOtp((prev) => {
      const next = [...prev];
      for (let i = 0; i < 6; i++) {
        next[i] = digits[i] || '';
      }
      return next;
    });

    const targetIdx = Math.min(digits.length, 5);
    inputRefs.current[targetIdx]?.focus();
    setError(null);
  }, []);

  const resetOtp = useCallback(() => {
    setOtp(['', '', '', '', '', '']);
    setError(null);
    inputRefs.current[0]?.focus();
  }, []);

  // Request OTP from server
  const requestOtp = useCallback(
    async ({
      email,
      name,
      phone,
      budget,
      projectType,
      scope,
    }: {
      email: string;
      name?: string;
      phone?: string;
      budget?: number | string;
      projectType?: string;
      scope?: string;
    }) => {
      const cleanEmail = email.trim().toLowerCase();
      if (!Validation.isValidEmail(cleanEmail)) {
        const err = 'Please enter a valid email address.';
        setError(err);
        if (onError) onError(err);
        return false;
      }

      setIsRequesting(true);
      setError(null);
      setRecipient(cleanEmail);
      const startTime = performance.now();

      try {
        const numericBudget = budget ? Math.min(300000, Math.max(0, Number(budget) || 0)) : 0;

        const res = await safeFetchJson<{ success?: boolean; message?: string; error?: string; devOtp?: string; durationMs?: number }>(
          '/api/lead/request-email-otp',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: cleanEmail,
              name: name || 'Client',
              phone: phone || '',
              budget: numericBudget,
              projectType: projectType || 'Website',
              scope: scope || '',
            }),
          }
        );

        const totalElapsed = Math.round(performance.now() - startTime);

        if (!res.ok || !res.data?.success) {
          const errMsg = res.error || res.data?.error || 'Failed to send verification code.';
          console.warn(`[OTP Client] Request failed in ${totalElapsed}ms:`, errMsg);
          setError(errMsg);
          if (onError) onError(errMsg);
          setIsRequesting(false);
          return false;
        }

        console.log(`[OTP Client] Code dispatched in ${totalElapsed}ms to ${cleanEmail}`);
        setCountdown(cooldownSeconds);
        resetOtp();
        setIsRequesting(false);
        return true;
      } catch (err: any) {
        const totalElapsed = Math.round(performance.now() - startTime);
        const errMsg = err?.message || 'Network error while requesting OTP.';
        console.warn(`[OTP Client] Request error in ${totalElapsed}ms:`, errMsg);
        setError(errMsg);
        if (onError) onError(errMsg);
        setIsRequesting(false);
        return false;
      }
    },
    [cooldownSeconds, resetOtp, onError]
  );

  // Verify OTP
  const verifyOtp = useCallback(
    async (leadData: Record<string, any> = {}) => {
      if (!isComplete) {
        setError('Please enter the full 6-digit code.');
        return false;
      }

      setIsVerifying(true);
      setError(null);
      const startTime = performance.now();

      try {
        const cleanLeadData = { ...leadData };
        if (cleanLeadData.budget !== undefined && cleanLeadData.budget !== null) {
          cleanLeadData.budget = Math.min(300000, Math.max(0, Number(cleanLeadData.budget) || 0));
        }

        const res = await safeFetchJson<{
          success?: boolean;
          token?: string;
          email?: string;
          lead?: any;
          error?: string;
        }>('/api/lead/verify-email-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: recipient,
            otp: fullOtp,
            leadData: cleanLeadData,
          }),
        });

        const totalElapsed = Math.round(performance.now() - startTime);

        if (!res.ok || !res.data?.success) {
          const errMsg = res.error || res.data?.error || 'Invalid or expired OTP code.';
          console.warn(`[OTP Client] Verification failed in ${totalElapsed}ms:`, errMsg);
          setError(errMsg);
          if (onError) onError(errMsg);
          setIsVerifying(false);
          return false;
        }

        console.log(`[OTP Client] OTP verified successfully in ${totalElapsed}ms`);

        if (res.data.token) {
          localStorage.setItem('client_token', res.data.token);
        }

        if (onSuccess) {
          onSuccess(res.data);
        }

        setIsVerifying(false);
        return true;
      } catch (err: any) {
        const errMsg = err?.message || 'Failed to verify OTP with server.';
        setError(errMsg);
        if (onError) onError(errMsg);
        setIsVerifying(false);
        return false;
      }
    },
    [isComplete, recipient, fullOtp, onSuccess, onError]
  );

  return {
    otp,
    fullOtp,
    isComplete,
    countdown,
    canResend: countdown === 0,
    isRequesting,
    isVerifying,
    error,
    recipient,
    inputRefs,
    setOtpDigit,
    handleKeyDown,
    handlePaste,
    resetOtp,
    requestOtp,
    verifyOtp,
    setError,
  };
}
