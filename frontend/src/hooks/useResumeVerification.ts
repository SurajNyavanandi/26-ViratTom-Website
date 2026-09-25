import { useState, useEffect, useCallback } from 'react';
import { safeFetchJson } from '@/utils/utils';
import { Validation } from '@/utils/validation';
import { useOtpVerification } from './useOtpVerification';
import type { ResumeData } from '@/types/resume';

interface UseResumeVerificationProps {
  data: ResumeData;
  setData: React.Dispatch<React.SetStateAction<ResumeData>>;
  isDummyPreview: boolean;
  onVerificationComplete: () => void;
}

export const useResumeVerification = ({
  data,
  setData,
  isDummyPreview,
  onVerificationComplete,
}: UseResumeVerificationProps) => {
  const [verifiedEmail, setVerifiedEmail] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('virattom_verified_user_email') || '';
      if (saved) return saved;

      // Backward compatibility with previous recruiter object
      const oldRecruiter = localStorage.getItem('virattom_verified_recruiter');
      if (oldRecruiter) {
        const parsed = JSON.parse(oldRecruiter);
        if (parsed && parsed.email) return parsed.email;
      }
    } catch (e) {
      console.warn('[useResumeVerification] Could not parse stored user email:', e);
    }
    return '';
  });

  const [downloadCount, setDownloadCount] = useState<number>(26);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationStep, setVerificationStep] = useState<'form' | 'otp'>('form');
  const [inputEmail, setInputEmail] = useState('');
  const [verificationError, setVerificationError] = useState('');

  // Fetch live download count
  useEffect(() => {
    let isMounted = true;
    safeFetchJson<{ success?: boolean; downloads?: number }>('/api/resume/stats').then((res) => {
      if (isMounted && res.data?.downloads) {
        setDownloadCount(res.data.downloads);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const {
    otp: resumeOtp,
    countdown: resumeOtpCountdown,
    canResend: canResendResumeOtp,
    isRequesting: isResumeOtpRequesting,
    isVerifying: isResumeOtpVerifying,
    error: resumeOtpHookError,
    inputRefs: resumeOtpInputRefs,
    setOtpDigit: setResumeOtpDigit,
    handleKeyDown: handleResumeOtpKeyDown,
    handlePaste: handleResumeOtpPaste,
    requestOtp: requestResumeOtp,
    verifyOtp: verifyResumeOtp,
    resetOtp: resetResumeOtp,
  } = useOtpVerification({
    cooldownSeconds: 30,
    onSuccess: (_resData?: any) => {
      const cleanEmail = inputEmail.trim().toLowerCase();
      localStorage.setItem('virattom_verified_user_email', cleanEmail);
      setVerifiedEmail(cleanEmail);

      const previousSavedResume = localStorage.getItem(`virattom_resume_user_${cleanEmail}`);
      if (previousSavedResume && isDummyPreview) {
        try {
          const parsed = JSON.parse(previousSavedResume);
          setData(parsed);
          console.log('[useResumeVerification] Restored remembered resume for:', cleanEmail);
        } catch (err) {
          console.warn('Could not parse previous saved resume:', err);
        }
      } else {
        localStorage.setItem(`virattom_resume_user_${cleanEmail}`, JSON.stringify(data));
      }

      setShowVerificationModal(false);
      onVerificationComplete();
    },
    onError: (err: string) => {
      setVerificationError(err);
    },
  });

  const sendVerificationOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setVerificationError('');

    const cleanEmail = inputEmail.trim().toLowerCase();
    if (!Validation.isValidEmail(cleanEmail)) {
      setVerificationError('Please enter a valid email address.');
      return;
    }

    const sent = await requestResumeOtp({
      name: data.header.name || 'Resume User',
      email: cleanEmail,
      projectType: 'Resume User',
      scope: `Resume download & sync by ${cleanEmail}`,
    });

    if (sent) {
      setVerificationStep('otp');
    }
  };

  const verifyOtpAndFinish = async () => {
    setVerificationError('');
    const cleanEmail = inputEmail.trim().toLowerCase();

    await verifyResumeOtp({
      name: data.header.name || 'Resume User',
      email: cleanEmail,
      projectType: 'Resume User',
      scope: `Resume verified & downloaded by ${cleanEmail}`,
    });
  };

  const openVerificationModal = useCallback((initialEmail?: string) => {
    setShowVerificationModal(true);
    setVerificationStep('form');
    setVerificationError('');
    resetResumeOtp();
    setInputEmail(initialEmail || '');
  }, [resetResumeOtp]);

  const switchEmail = useCallback(() => {
    localStorage.removeItem('virattom_verified_user_email');
    setVerifiedEmail('');
    setInputEmail('');
    resetResumeOtp();
    setShowVerificationModal(true);
    setVerificationStep('form');
  }, [resetResumeOtp]);

  const incrementDownloadCount = useCallback((userEmail?: string) => {
    const emailToTrack = userEmail || verifiedEmail || data.header.email || '';
    safeFetchJson<{ success?: boolean; downloads?: number }>('/api/resume/track-download', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: emailToTrack }),
    })
      .then((res) => {
        if (res.data?.downloads) {
          setDownloadCount(res.data.downloads);
        }
      })
      .catch(() => {
        setDownloadCount((prev) => prev + 1);
      });
  }, [verifiedEmail, data.header.email]);

  return {
    verifiedEmail,
    downloadCount,
    showVerificationModal,
    setShowVerificationModal,
    verificationStep,
    setVerificationStep,
    inputEmail,
    setInputEmail,
    verificationError,
    setVerificationError,
    resumeOtp,
    resumeOtpCountdown,
    canResendResumeOtp,
    isResumeOtpRequesting,
    isResumeOtpVerifying,
    resumeOtpHookError,
    resumeOtpInputRefs,
    setResumeOtpDigit,
    handleResumeOtpKeyDown,
    handleResumeOtpPaste,
    sendVerificationOtp,
    verifyOtpAndFinish,
    resetResumeOtp,
    openVerificationModal,
    switchEmail,
    incrementDownloadCount,
  };
};
