import React from 'react';
import { Mail, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { OtpVerificationView } from '@/components/ui/OtpVerificationView';

interface ResumeVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  verificationStep: 'form' | 'otp';
  setVerificationStep: (step: 'form' | 'otp') => void;
  inputEmail: string;
  setInputEmail: (email: string) => void;
  verificationError: string;
  setVerificationError: (err: string) => void;
  isResumeOtpRequesting: boolean;
  isResumeOtpVerifying: boolean;
  resumeOtp: string[];
  resumeOtpCountdown: number;
  canResendResumeOtp: boolean;
  resumeOtpInputRefs: React.RefObject<(HTMLInputElement | null)[]>;
  setResumeOtpDigit: (index: number, val: string) => void;
  handleResumeOtpKeyDown: (index: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleResumeOtpPaste: (e: React.ClipboardEvent) => void;
  onSendOtp: (e?: React.FormEvent) => void;
  onVerifyOtp: () => void;
  onResetOtp: () => void;
  hookError?: string;
}

export const ResumeVerificationModal: React.FC<ResumeVerificationModalProps> = ({
  isOpen,
  onClose,
  verificationStep,
  setVerificationStep,
  inputEmail,
  setInputEmail,
  verificationError,
  setVerificationError,
  isResumeOtpRequesting,
  isResumeOtpVerifying,
  resumeOtp,
  resumeOtpCountdown,
  canResendResumeOtp,
  resumeOtpInputRefs,
  setResumeOtpDigit,
  handleResumeOtpKeyDown,
  handleResumeOtpPaste,
  onSendOtp,
  onVerifyOtp,
  onResetOtp,
  hookError,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in no-print">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-apple-gray-200 transition-all">
        <button
          onClick={() => {
            onClose();
            setVerificationError('');
          }}
          className="absolute top-5 right-5 p-2 rounded-full text-apple-gray-400 hover:text-apple-black hover:bg-apple-gray-100 transition-all cursor-pointer"
          title="Close"
        >
          <X size={18} />
        </button>

        {verificationStep === 'form' ? (
          <>
            <div className="text-center mb-6">
              <div className="h-12 w-12 rounded-2xl bg-apple-blue/10 text-apple-blue flex items-center justify-center mx-auto mb-3">
                <Mail size={24} />
              </div>
              <h3 className="text-[20px] font-bold text-apple-black">
                Save & Download Resume
              </h3>
              <p className="text-[13px] text-apple-gray-500 mt-1.5 leading-relaxed">
                Enter your email to receive a 6-digit OTP. Your customized resume will be remembered for your email address so you never lose your edits.
              </p>
            </div>

            <form onSubmit={onSendOtp} className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-apple-gray-600 mb-1.5">
                  Email Address <span className="text-apple-red">*</span>
                </label>
                <Input
                  type="email"
                  required
                  autoFocus
                  placeholder="e.g. yourname@domain.com"
                  value={inputEmail}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setInputEmail(e.target.value);
                    if (verificationError) setVerificationError('');
                  }}
                  className="rounded-xl h-11 text-[14px]"
                />
              </div>

              {verificationError && (
                <div className="text-[13px] text-apple-red bg-apple-red/10 p-3 rounded-xl border border-apple-red/20 text-center">
                  {verificationError}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-11 rounded-xl text-[14px] font-semibold mt-2"
                isLoading={isResumeOtpRequesting}
              >
                Send 6-Digit Code
              </Button>

              <p className="text-[11px] text-apple-gray-400 text-center pt-1">
                Edits are automatically saved to your email.
              </p>
            </form>
          </>
        ) : (
          <OtpVerificationView
            recipient={inputEmail}
            type="email"
            title="Verify Email & Save"
            subtitle={`Enter the 6-digit code sent to ${inputEmail}`}
            otp={resumeOtp}
            inputRefs={resumeOtpInputRefs}
            onDigitChange={setResumeOtpDigit}
            onKeyDown={handleResumeOtpKeyDown}
            onPaste={handleResumeOtpPaste}
            onVerify={onVerifyOtp}
            onResend={() => onSendOtp()}
            onCancel={() => {
              setVerificationStep('form');
              onResetOtp();
              setVerificationError('');
            }}
            isVerifying={isResumeOtpVerifying}
            isRequesting={isResumeOtpRequesting}
            countdown={resumeOtpCountdown}
            canResend={canResendResumeOtp}
            error={verificationError || hookError}
          />
        )}
      </div>
    </div>
  );
};
