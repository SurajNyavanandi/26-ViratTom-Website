import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Lock, 
  ArrowLeft, 
  ShieldCheck, 
  AlertCircle, 
  KeyRound, 
  Mail, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  Clock, 
  ArrowRight,
  RotateCcw
} from 'lucide-react';

const ADMIN_EMAIL = 'kanusuraj15@gmail.com';

export const Login: React.FC = () => {
  const navigate = useNavigate();

  // Mode: 'login' | 'forgot_email' | 'forgot_otp'
  const [mode, setMode] = useState<'login' | 'forgot_email' | 'forgot_otp'>('login');

  // Login form state
  const [username, setUsername] = useState(ADMIN_EMAIL);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Forgot Password state
  const [resetEmail, setResetEmail] = useState(ADMIN_EMAIL);
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(0);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');
    
    const cleanEmail = username.trim().toLowerCase();
    if (cleanEmail !== ADMIN_EMAIL) {
      setError(`Access denied. Only authorized administrator (${ADMIN_EMAIL}) is permitted.`);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanEmail, password })
      });
      const data = await res.json();
      
      if (data.token) {
        localStorage.setItem('admin_token', data.token);
        navigate('/admin');
      } else {
        setError(data.error || 'Invalid administrator password. Use Forgot Password if needed.');
      }
    } catch {
      setError('Connection error. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  // Request Reset OTP
  const handleRequestResetOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    const cleanEmail = resetEmail.trim().toLowerCase();
    if (cleanEmail !== ADMIN_EMAIL) {
      setError(`Access denied. Password reset is restricted exclusively to ${ADMIN_EMAIL}.`);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/admin/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail })
      });
      const data = await res.json();

      if (data.success) {
        setMode('forgot_otp');
        setSuccessMessage(data.message || `Password reset code sent to ${ADMIN_EMAIL}`);
        if (data.devOtp) setDevOtp(data.devOtp);
        setCountdown(60);
        setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
      } else {
        setError(data.error || 'Failed to send password reset code.');
      }
    } catch {
      setError('Failed to dispatch password reset code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP digit changes
  const handleDigitChange = (index: number, val: string) => {
    const clean = val.replace(/\D/g, '');
    const newDigits = [...otpDigits];
    
    if (clean.length > 1) {
      const chars = clean.slice(0, 6).split('');
      chars.forEach((c, idx) => {
        if (index + idx < 6) newDigits[index + idx] = c;
      });
      setOtpDigits(newDigits);
      const nextIdx = Math.min(index + chars.length, 5);
      otpInputRefs.current[nextIdx]?.focus();
      return;
    }

    newDigits[index] = clean.slice(-1);
    setOtpDigits(newDigits);
    setError('');

    if (clean && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasteData) return;

    const newDigits = [...otpDigits];
    pasteData.split('').forEach((char, idx) => {
      if (idx < 6) newDigits[idx] = char;
    });
    setOtpDigits(newDigits);
    const targetIdx = Math.min(pasteData.length, 5);
    otpInputRefs.current[targetIdx]?.focus();
  };

  // Submit Password Reset with OTP
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const otpCode = otpDigits.join('');
    if (otpCode.length !== 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please ensure both passwords are identical.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: ADMIN_EMAIL,
          otp: otpCode,
          newPassword
        })
      });
      const data = await res.json();

      if (data.success && data.token) {
        localStorage.setItem('admin_token', data.token);
        setSuccessMessage('Password updated successfully! Redirecting to Control Center...');
        setTimeout(() => {
          navigate('/admin');
        }, 800);
      } else {
        setError(data.error || 'Failed to reset password. Please verify the OTP code.');
      }
    } catch {
      setError('Failed to update password. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-apple-gray-100 dark:bg-apple-black text-apple-black dark:text-apple-white antialiased">
      
      {/* Top Bar with Apple Back navigation */}
      <header className="w-full max-w-360 mx-auto px-4 sm:px-8 py-4 sm:py-6 flex items-center justify-between">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 min-h-11 px-4 py-2 rounded-full bg-white dark:bg-[#1C1C1E] border border-apple-gray-200 dark:border-[#38383A] text-[14px] font-medium text-apple-gray-500 dark:text-apple-gray-400 hover:text-apple-black dark:hover:text-white transition-all shadow-xs hover:-translate-y-0.5"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </Link>

        <div className="flex items-center gap-1.5 text-[13px] text-apple-gray-400">
          <ShieldCheck className="h-4 w-4 text-apple-green" />
          <span className="hidden sm:inline font-medium">Single Admin Access Only</span>
        </div>
      </header>

      {/* Center Auth Card */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-115 bg-white dark:bg-[#1C1C1E] rounded-2xl sm:rounded-3xl p-6 sm:p-10 border border-apple-gray-200 dark:border-[#38383A] shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)] transition-all">
          
          {/* Header Icon & Typography */}
          <div className="text-center mb-8">
            <div className="h-14 w-14 rounded-2xl bg-apple-blue/10 text-apple-blue flex items-center justify-center mx-auto mb-4 shadow-xs">
              {mode === 'login' ? (
                <Lock className="h-7 w-7" />
              ) : (
                <KeyRound className="h-7 w-7" />
              )}
            </div>
            <h1 className="text-[24px] sm:text-[28px] font-bold tracking-tight text-apple-black dark:text-white leading-tight">
              {mode === 'login' && 'Admin Sign In'}
              {mode === 'forgot_email' && 'Reset Admin Password'}
              {mode === 'forgot_otp' && 'Enter Reset Code'}
            </h1>
            <p className="text-[13px] text-apple-gray-500 dark:text-apple-gray-400 mt-1.5">
              {mode === 'login' && 'Secure administrative access to ViratTom Control Center.'}
              {mode === 'forgot_email' && `Password reset is exclusively restricted to ${ADMIN_EMAIL}`}
              {mode === 'forgot_otp' && `Enter the 6-digit code sent to ${ADMIN_EMAIL}`}
            </p>
          </div>

          {/* Success Banner */}
          {successMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-apple-green/10 border border-apple-green/20 flex items-start gap-2.5 text-apple-green text-[13px]">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
              <span className="leading-snug">{successMessage}</span>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-apple-red/10 border border-apple-red/20 flex items-start gap-2.5 text-apple-red text-[13px] animate-in fade-in duration-200">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span className="leading-snug">{error}</span>
            </div>
          )}

          {/* MODE 1: Standard Admin Login */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-[14px] font-medium text-apple-black dark:text-white mb-2">
                  Admin Email
                </label>
                <div className="relative">
                  <input 
                    type="email" 
                    required
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder={ADMIN_EMAIL}
                    className="w-full min-h-12 rounded-xl border border-apple-gray-300 dark:border-[#38383A] bg-apple-gray-100 dark:bg-[#2C2C2E] px-4 py-3 text-[15px] text-apple-black dark:text-white placeholder:text-apple-gray-400 focus:outline-none focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all"
                  />
                </div>
                <p className="text-[11px] text-apple-gray-400 mt-1.5">
                  Exclusive administrator account: <code className="font-semibold text-apple-blue">{ADMIN_EMAIL}</code>
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[14px] font-medium text-apple-black dark:text-white">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot_email');
                      setError('');
                      setSuccessMessage('');
                    }}
                    className="text-[13px] font-medium text-apple-blue hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full min-h-12 rounded-xl border border-apple-gray-300 dark:border-[#38383A] bg-apple-gray-100 dark:bg-[#2C2C2E] px-4 py-3 pr-11 text-[15px] text-apple-black dark:text-white placeholder:text-apple-gray-400 focus:outline-none focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-apple-gray-400 hover:text-apple-black dark:hover:text-white p-1"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full min-h-12 rounded-xl bg-apple-blue text-white font-medium text-[15px] hover:bg-[#0077ED] active:scale-[0.98] hover:-translate-y-0.5 transition-all shadow-[0_2px_8px_rgba(0,113,227,0.3)] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <KeyRound className="h-4 w-4" />
                    <span>Sign In to Admin</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* MODE 2: Forgot Password - Request OTP */}
          {mode === 'forgot_email' && (
            <form onSubmit={handleRequestResetOtp} className="space-y-5">
              <div>
                <label className="block text-[14px] font-medium text-apple-black dark:text-white mb-2">
                  Authorized Admin Email Address
                </label>
                <div className="relative">
                  <input 
                    type="email" 
                    required
                    value={resetEmail}
                    onChange={e => setResetEmail(e.target.value)}
                    placeholder={ADMIN_EMAIL}
                    className="w-full min-h-12 rounded-xl border border-apple-gray-300 dark:border-[#38383A] bg-apple-gray-100 dark:bg-[#2C2C2E] px-4 py-3 text-[15px] text-apple-black dark:text-white placeholder:text-apple-gray-400 focus:outline-none focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all"
                  />
                </div>
                <p className="text-[12px] text-apple-gray-500 dark:text-apple-gray-400 mt-2 leading-relaxed">
                  We will dispatch a secure 6-digit one-time password (OTP) to your verified admin inbox.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full min-h-12 rounded-xl bg-apple-blue text-white font-medium text-[15px] hover:bg-[#0077ED] active:scale-[0.98] hover:-translate-y-0.5 transition-all shadow-[0_2px_8px_rgba(0,113,227,0.3)] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Mail className="h-4 w-4" />
                    <span>Send Verification Code</span>
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError('');
                    setSuccessMessage('');
                  }}
                  className="inline-flex items-center gap-1.5 text-[13px] font-medium text-apple-gray-500 dark:text-apple-gray-400 hover:text-apple-black dark:hover:text-white cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back to Sign In</span>
                </button>
              </div>
            </form>
          )}

          {/* MODE 3: Forgot Password - OTP Verification & New Password */}
          {mode === 'forgot_otp' && (
            <form onSubmit={handleResetPasswordSubmit} className="space-y-5">
              {/* 6-Digit OTP Inputs */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[14px] font-medium text-apple-black dark:text-white">
                    6-Digit Verification Code
                  </label>
                  {countdown > 0 ? (
                    <span className="text-[12px] text-apple-gray-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Resend in {countdown}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleRequestResetOtp()}
                      className="text-[12px] font-medium text-apple-blue hover:underline cursor-pointer disabled:opacity-50 flex items-center gap-1"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Resend Code
                    </button>
                  )}
                </div>

                <div className="flex justify-between gap-1.5 sm:gap-2">
                  {otpDigits.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => { otpInputRefs.current[index] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      onPaste={handleOtpPaste}
                      className="w-11 h-13 sm:w-12 sm:h-14 text-center text-[22px] font-bold rounded-xl border border-apple-gray-300 dark:border-[#38383A] bg-apple-gray-100 dark:bg-[#2C2C2E] text-apple-black dark:text-white focus:outline-none focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all font-mono shadow-xs"
                    />
                  ))}
                </div>

                {devOtp && (
                  <div className="mt-2.5 p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-center">
                    <p className="text-[12px] text-apple-blue">
                      Development Mode Code: <strong className="font-mono font-bold tracking-widest">{devOtp}</strong>
                    </p>
                  </div>
                )}
              </div>

              {/* New Password */}
              <div>
                <label className="block text-[14px] font-medium text-apple-black dark:text-white mb-2">
                  New Admin Password
                </label>
                <div className="relative">
                  <input 
                    type={showNewPassword ? 'text' : 'password'} 
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full min-h-12 rounded-xl border border-apple-gray-300 dark:border-[#38383A] bg-apple-gray-100 dark:bg-[#2C2C2E] px-4 py-3 pr-11 text-[15px] text-apple-black dark:text-white placeholder:text-apple-gray-400 focus:outline-none focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-apple-gray-400 hover:text-apple-black dark:hover:text-white p-1"
                    title={showNewPassword ? 'Hide password' : 'Show password'}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-[14px] font-medium text-apple-black dark:text-white mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input 
                    type={showNewPassword ? 'text' : 'password'} 
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full min-h-12 rounded-xl border border-apple-gray-300 dark:border-[#38383A] bg-apple-gray-100 dark:bg-[#2C2C2E] px-4 py-3 text-[15px] text-apple-black dark:text-white placeholder:text-apple-gray-400 focus:outline-none focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full min-h-12 rounded-xl bg-apple-blue text-white font-medium text-[15px] hover:bg-[#0077ED] active:scale-[0.98] hover:-translate-y-0.5 transition-all shadow-[0_2px_8px_rgba(0,113,227,0.3)] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Reset Password & Sign In</span>
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError('');
                    setSuccessMessage('');
                  }}
                  className="inline-flex items-center gap-1.5 text-[13px] font-medium text-apple-gray-500 dark:text-apple-gray-400 hover:text-apple-black dark:hover:text-white cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Cancel & Back to Sign In</span>
                </button>
              </div>
            </form>
          )}

        </div>
      </div>

      {/* Minimal Footer */}
      <footer className="w-full max-w-360 mx-auto px-4 py-6 text-center text-[12px] text-apple-gray-400">
        &copy; {new Date().getFullYear()} ViratTom. Control Center &bull; Authorized Admin Only (<span className="text-apple-blue font-medium">{ADMIN_EMAIL}</span>)
      </footer>
    </div>
  );
};
