import React, { useState, useEffect, useRef } from 'react';
import { X, CheckCircle2, AlertCircle, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import { getVerifiedWhatsAppUrl, getWhatsAppUrl, safeFetchJson, sanitizePhone } from '@/lib/utils';

interface LeadFormState {
  name: string;
  email: string;
  phone: string;
  projectType: string;
  requirements: string;
}

export const WhatsAppWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'form' | 'otp' | 'success'>('form');
  const [form, setForm] = useState<LeadFormState>({
    name: '',
    email: '',
    phone: '',
    projectType: 'Web Application',
    requirements: '',
  });

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isRequestingOtp, setIsRequestingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [verifiedWaUrl, setVerifiedWaUrl] = useState<string>('');
  const [showTooltip, setShowTooltip] = useState(false);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Check if user is verified in current session or localStorage
  const isAlreadyVerified = (): boolean => {
    return (
      localStorage.getItem('virattom_lead_verified') === 'true' ||
      sessionStorage.getItem('virattom_lead_verified') === 'true'
    );
  };

  const getStoredLead = (): LeadFormState | null => {
    try {
      const stored =
        localStorage.getItem('virattom_verified_lead_data') ||
        sessionStorage.getItem('virattom_verified_lead_data');
      if (stored) return JSON.parse(stored);
    } catch {}
    return null;
  };

  // Open WhatsApp or open verification modal
  const handleWhatsAppButtonClick = () => {
    if (isAlreadyVerified()) {
      const storedLead = getStoredLead();
      const targetUrl = storedLead
        ? getVerifiedWhatsAppUrl({
            name: storedLead.name,
            email: storedLead.email,
            phone: storedLead.phone,
            projectType: storedLead.projectType,
            budget: 'To be discussed',
            scope: storedLead.requirements,
          })
        : getWhatsAppUrl('Hello ViratTom Team, I am interested in discussing a project with you.');

      // Direct WhatsApp navigation for already verified clients
      window.open(targetUrl, '_blank', 'noopener,noreferrer') || (window.location.href = targetUrl);
      return;
    }

    // Open inquiry verification modal
    setIsOpen(true);
    setStep('form');
    setError(null);
  };

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Phone validation check
  const cleanPhone = sanitizePhone(form.phone);
  const isPhoneValid =
    cleanPhone.length === 10 &&
    ['6', '7', '8', '9'].includes(cleanPhone[0]) &&
    !/^(\d)\1{9}$/.test(cleanPhone) &&
    !['0123456789', '1234567890', '0987654321', '9876543210'].includes(cleanPhone);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());

  // Handle Form Submit & OTP Request
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!isEmailValid) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!isPhoneValid) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!form.requirements.trim() || form.requirements.trim().length < 5) {
      setError('Please briefly describe your project requirements (min 5 characters).');
      return;
    }

    setIsRequestingOtp(true);
    try {
      const res = await safeFetchJson<{
        success?: boolean;
        devOtp?: string;
        message?: string;
        error?: string;
      }>('/api/lead/request-email-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          phone: cleanPhone,
          projectType: form.projectType,
          scope: form.requirements.trim(),
          budget: 0,
        }),
      });

      if (!res.ok || !res.data?.success) {
        setError(res.error || res.data?.error || 'Failed to dispatch verification code. Please try again.');
        setIsRequestingOtp(false);
        return;
      }

      setCountdown(60);
      setStep('otp');
      if (res.data?.devOtp && res.data.devOtp.length === 6) {
        setOtp(res.data.devOtp.split(''));
      } else {
        setOtp(['', '', '', '', '', '']);
      }
    } catch {
      setError('Connection error while requesting verification code.');
    } finally {
      setIsRequestingOtp(false);
    }
  };

  // Handle OTP Digit Input
  const handleOtpChange = (index: number, value: string) => {
    const char = value.replace(/\D/g, '').slice(-1);
    const updated = [...otp];
    updated[index] = char;
    setOtp(updated);

    if (char && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const updated = [...otp];
    for (let i = 0; i < 6; i++) {
      updated[i] = pasted[i] || '';
    }
    setOtp(updated);
    const nextIdx = Math.min(pasted.length, 5);
    otpInputRefs.current[nextIdx]?.focus();
  };

  // Handle OTP Verification & WhatsApp Generation
  const handleVerifyOtp = async () => {
    const fullOtp = otp.join('');
    if (fullOtp.length < 6) {
      setError('Please enter the full 6-digit verification code.');
      return;
    }

    setIsVerifyingOtp(true);
    setError(null);

    try {
      const res = await safeFetchJson<{
        success?: boolean;
        token?: string;
        error?: string;
      }>('/api/lead/verify-email-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(),
          otp: fullOtp,
          leadData: {
            name: form.name.trim(),
            email: form.email.trim().toLowerCase(),
            phone: cleanPhone,
            projectType: form.projectType,
            scope: form.requirements.trim(),
            budget: 0,
          },
        }),
      });

      if (!res.ok || !res.data?.success) {
        setError(res.error || res.data?.error || 'Invalid verification code. Please check and try again.');
        setIsVerifyingOtp(false);
        return;
      }

      // Mark user as verified in current browser
      localStorage.setItem('virattom_lead_verified', 'true');
      sessionStorage.setItem('virattom_lead_verified', 'true');
      localStorage.setItem('virattom_verified_lead_data', JSON.stringify(form));
      sessionStorage.setItem('virattom_verified_lead_data', JSON.stringify(form));

      // Construct verified WhatsApp URL
      const waUrl = getVerifiedWhatsAppUrl({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: cleanPhone,
        projectType: form.projectType,
        budget: 'To be discussed',
        scope: form.requirements.trim(),
      });

      setVerifiedWaUrl(waUrl);
      setStep('success');

      // Auto-open WhatsApp after 1.2s delay for seamless experience
      setTimeout(() => {
        window.open(waUrl, '_blank', 'noopener,noreferrer') || (window.location.href = waUrl);
      }, 1200);
    } catch {
      setError('Failed to verify code due to a network error.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Resend OTP handler
  const handleResendOtp = async () => {
    if (countdown > 0 || isRequestingOtp) return;
    setIsRequestingOtp(true);
    setError(null);

    try {
      const res = await safeFetchJson<{
        success?: boolean;
        devOtp?: string;
        error?: string;
      }>('/api/lead/request-email-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          phone: cleanPhone,
          projectType: form.projectType,
          scope: form.requirements.trim(),
          budget: 0,
        }),
      });

      if (res.ok && res.data?.success) {
        setCountdown(60);
        if (res.data?.devOtp && res.data.devOtp.length === 6) {
          setOtp(res.data.devOtp.split(''));
        }
      } else {
        setError(res.error || res.data?.error || 'Failed to resend code.');
      }
    } catch {
      setError('Failed to resend code.');
    } finally {
      setIsRequestingOtp(false);
    }
  };

  return (
    <>
      {/* Floating WhatsApp Action Button */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
        {/* Tooltip */}
        <div
          className={`mb-2 px-3 py-1.5 bg-apple-black text-white text-[12px] font-medium rounded-xl shadow-lg border border-white/10 transition-all duration-300 pointer-events-none ${
            showTooltip ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Chat on WhatsApp</span>
          </div>
        </div>

        <button
          onClick={handleWhatsAppButtonClick}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          type="button"
          aria-label="Direct WhatsApp Consultation"
          className="group relative flex items-center justify-center w-14 h-14 bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white rounded-full shadow-[0_8px_30px_rgb(37,211,102,0.4)] hover:shadow-[0_12px_36px_rgb(37,211,102,0.55)] transition-all duration-200 cursor-pointer"
        >
          {/* Subtle online pulse ring */}
          <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-35 animate-ping -z-10 group-hover:opacity-50" />

          {/* WhatsApp SVG Icon */}
          <svg
            className="w-7 h-7 fill-white"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>
        </button>
      </div>

      {/* Inquiry & Email Verification Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-apple-gray-200 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="relative px-6 py-5 bg-gradient-to-r from-emerald-600 via-emerald-500 to-[#25D366] text-white">
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-xs">
                  <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-[17px] font-semibold tracking-tight">Direct WhatsApp Consultation</h3>
                  <p className="text-[12px] text-white/90">Connect directly with the ViratTom Team</p>
                </div>
              </div>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="mx-6 mt-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-[12.5px] flex items-start gap-2">
                <AlertCircle size={15} className="shrink-0 mt-0.5 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Modal Body */}
            <div className="p-6">
              {step === 'form' && (
                <form onSubmit={handleSubmitForm} className="space-y-4">
                  <div className="text-[13px] text-apple-gray-600 mb-1 leading-relaxed">
                    Please share your contact and project details to start a priority chat with the ViratTom Team.
                  </div>

                  {/* Name Input */}
                  <div>
                    <label className="block text-[12px] font-medium text-apple-gray-600 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-apple-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-[14px] outline-none transition-all"
                    />
                  </div>

                  {/* Email Input */}
                  <div>
                    <label className="block text-[12px] font-medium text-apple-gray-600 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="you@company.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-apple-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-[14px] outline-none transition-all"
                    />
                  </div>

                  {/* Mobile Number Input */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[12px] font-medium text-apple-gray-600">
                        Mobile Number <span className="text-red-500">*</span>
                      </label>
                      {isPhoneValid && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                          <CheckCircle2 size={12} /> Valid Number
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[13px] font-semibold text-apple-gray-500 pointer-events-none">
                        +91
                      </span>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        placeholder="98765 43210"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })}
                        className="w-full pl-12 pr-3.5 py-2.5 rounded-xl border border-apple-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-[14px] outline-none transition-all tracking-wide"
                      />
                    </div>
                  </div>

                  {/* Project Type Select */}
                  <div>
                    <label className="block text-[12px] font-medium text-apple-gray-600 mb-1">
                      Project Type
                    </label>
                    <select
                      value={form.projectType}
                      onChange={(e) => setForm({ ...form, projectType: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-apple-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-[14px] outline-none transition-all bg-white"
                    >
                      <option value="Web Application">Web Application (React, TypeScript, Node.js)</option>
                      <option value="Mobile App">Mobile App (iOS & Android)</option>
                      <option value="Static Website">Static Website (High Speed Portfolio / Business)</option>
                      <option value="Online Store">Online Store (E-Commerce Platform)</option>
                      <option value="Website + Mobile App">Website + Mobile App Suite</option>
                      <option value="Other Custom Project">Other Custom Software</option>
                    </select>
                  </div>

                  {/* Project Requirements Textarea */}
                  <div>
                    <label className="block text-[12px] font-medium text-apple-gray-600 mb-1">
                      Project Requirements <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Briefly describe what you would like to build..."
                      value={form.requirements}
                      onChange={(e) => setForm({ ...form, requirements: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-apple-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-[13.5px] outline-none transition-all resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isRequestingOtp}
                    className="w-full mt-2 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-medium text-[14px] flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-60"
                  >
                    {isRequestingOtp ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Connecting to WhatsApp...</span>
                      </>
                    ) : (
                      <>
                        <span>Continue to WhatsApp</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>
              )}

              {step === 'otp' && (
                <div className="space-y-5">
                  <div className="text-center">
                    <div className="inline-flex p-3 rounded-full bg-emerald-100 text-emerald-600 mb-2">
                      <ShieldCheck size={28} />
                    </div>
                    <h4 className="text-[16px] font-semibold text-apple-black">Security Confirmation</h4>
                    <p className="text-[12.5px] text-apple-gray-500 mt-1">
                      Enter the 6-digit confirmation code sent to <strong className="text-apple-black">{form.email}</strong> to connect with the ViratTom Team.
                    </p>
                  </div>

                  {/* 6 Digit Inputs */}
                  <div className="flex justify-center gap-2">
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => {
                          otpInputRefs.current[idx] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        onPaste={idx === 0 ? handleOtpPaste : undefined}
                        className="w-11 h-12 text-center text-[19px] font-semibold rounded-xl border border-apple-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all bg-apple-gray-50/50"
                      />
                    ))}
                  </div>

                  {/* Verify Button */}
                  <button
                    onClick={handleVerifyOtp}
                    disabled={isVerifyingOtp || otp.join('').length < 6}
                    className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-medium text-[14px] flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isVerifyingOtp ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Verifying Code...</span>
                      </>
                    ) : (
                      <>
                        <span>Confirm & Connect on WhatsApp</span>
                        <ArrowRight size={15} />
                      </>
                    )}
                  </button>

                  {/* Resend & Back controls */}
                  <div className="flex items-center justify-between text-[12.5px] pt-1">
                    <button
                      type="button"
                      onClick={() => setStep('form')}
                      className="text-apple-gray-500 hover:text-apple-black cursor-pointer transition-colors"
                    >
                      ← Edit Details
                    </button>

                    <button
                      type="button"
                      disabled={countdown > 0 || isRequestingOtp}
                      onClick={handleResendOtp}
                      className="text-emerald-600 font-medium hover:underline disabled:opacity-50 disabled:no-underline cursor-pointer"
                    >
                      {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend code'}
                    </button>
                  </div>
                </div>
              )}

              {step === 'success' && (
                <div className="py-4 text-center space-y-4">
                  <div className="inline-flex p-3 rounded-full bg-emerald-100 text-emerald-600">
                    <CheckCircle2 size={36} className="animate-bounce" />
                  </div>
                  <h4 className="text-[17px] font-semibold text-apple-black">Inquiry Confirmed!</h4>
                  <p className="text-[13px] text-apple-gray-600 leading-relaxed">
                    Your project details have been received. Connecting you directly with the ViratTom Team on WhatsApp...
                  </p>

                  <div className="pt-2">
                    <a
                      href={verifiedWaUrl || getWhatsAppUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] active:scale-98 text-white font-medium text-[14px] shadow-lg transition-all"
                    >
                      <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                      </svg>
                      <span>Open WhatsApp Chat Now</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
