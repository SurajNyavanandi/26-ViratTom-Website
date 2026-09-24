import React from 'react';
import { Mail, Clock, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { Button } from './Button';

interface OtpVerificationViewProps {
  recipient: string;
  type?: 'email' | 'phone';
  otp: string[];
  inputRefs: React.MutableRefObject<(HTMLInputElement | null)[]>;
  onDigitChange: (index: number, value: string) => void;
  onKeyDown: (index: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
  onPaste: (e: React.ClipboardEvent<HTMLInputElement>) => void;
  onVerify: () => void;
  onResend: () => void;
  onCancel?: () => void;
  isVerifying?: boolean;
  isRequesting?: boolean;
  countdown?: number;
  canResend?: boolean;
  error?: string | null;
  title?: string;
  subtitle?: string;
}

export const OtpVerificationView = React.memo<OtpVerificationViewProps>(({
  recipient,
  type = 'email',
  otp,
  inputRefs,
  onDigitChange,
  onKeyDown,
  onPaste,
  onVerify,
  onResend,
  onCancel,
  isVerifying = false,
  isRequesting = false,
  countdown = 0,
  canResend = true,
  error = null,
  title = 'Verify Your Email Address',
  subtitle,
}) => {
  const isComplete = otp.join('').length === 6;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <div className="h-13 w-13 rounded-2xl bg-apple-blue/10 dark:bg-apple-blue/20 flex items-center justify-center text-apple-blue mx-auto mb-3 shadow-2xs">
          {type === 'email' ? <Mail className="h-6 w-6" /> : <ShieldCheck className="h-6 w-6" />}
        </div>
        <h3 className="text-[20px] sm:text-[22px] font-bold text-apple-black dark:text-white tracking-tight">
          {title}
        </h3>
        <p className="text-[13.5px] sm:text-[14px] text-apple-gray-500 dark:text-apple-gray-400 mt-1 max-w-sm mx-auto leading-relaxed">
          {subtitle || (
            <>
              Enter the 6-digit code sent to{' '}
              <span className="font-semibold text-apple-black dark:text-white">{recipient}</span>
            </>
          )}
        </p>
      </div>

      <div className="flex justify-center items-center gap-2 sm:gap-3 py-2">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => onDigitChange(index, e.target.value)}
            onKeyDown={(e) => onKeyDown(index, e)}
            onPaste={index === 0 ? onPaste : undefined}
            autoFocus={index === 0}
            className={`w-11 h-13 sm:w-13 sm:h-15 text-center text-[22px] sm:text-[24px] font-mono font-bold rounded-2xl border transition-all focus:outline-none focus:ring-2 focus:ring-apple-blue shadow-2xs ${
              digit
                ? 'border-apple-blue bg-apple-blue/5 dark:bg-apple-blue/10 text-apple-blue'
                : 'border-apple-gray-300 dark:border-[#38383A] bg-white dark:bg-[#1C1C1E] text-apple-black dark:text-white'
            }`}
          />
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-apple-red/10 border border-apple-red/20 text-apple-red text-[13px] font-medium animate-shake">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Button
        type="button"
        onClick={onVerify}
        disabled={!isComplete || isVerifying}
        isLoading={isVerifying}
        className="w-full h-12 rounded-xl text-[14.5px] font-semibold gap-2 shadow-sm"
      >
        <span>Verify & Proceed</span>
        <ArrowRight className="h-4 w-4" />
      </Button>

      <div className="flex items-center justify-between text-[13px] pt-1 border-t border-apple-gray-200 dark:border-[#38383A]/60">
        <button
          type="button"
          onClick={onResend}
          disabled={!canResend || isRequesting}
          className={`inline-flex items-center gap-1.5 font-medium transition-colors cursor-pointer ${
            canResend && !isRequesting
              ? 'text-apple-blue hover:underline'
              : 'text-apple-gray-400 dark:text-apple-gray-500 cursor-not-allowed'
          }`}
        >
          <Clock className="h-3.5 w-3.5" />
          <span>
            {canResend
              ? isRequesting
                ? 'Sending code...'
                : 'Resend Code'
              : `Resend in ${countdown}s`}
          </span>
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-apple-gray-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
          >
            Change Details
          </button>
        )}
      </div>
    </div>
  );
});

OtpVerificationView.displayName = 'OtpVerificationView';
