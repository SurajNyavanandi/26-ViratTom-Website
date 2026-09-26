import React, { useState } from 'react';
import { 
  Send, 
  Mail, 
  MessageSquare, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  ExternalLink, 
  Download, 
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { safeFetchJson } from '@/lib/utils';

export const RecruiterOutreachSection: React.FC = () => {
  const [templateType, setTemplateType] = useState<'fresher' | 'experienced'>('fresher');
  const [emailsInput, setEmailsInput] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<{
    success?: boolean;
    message?: string;
    results?: Array<{ email: string; success: boolean; error?: string; simulated?: boolean; messageId?: string }>;
  } | null>(null);

  // WhatsApp state
  const [phoneInput, setPhoneInput] = useState('');
  const [generatingWhatsApp, setGeneratingWhatsApp] = useState(false);
  const [whatsappResult, setWhatsappResult] = useState<{
    url: string;
    message: string;
    formattedNumber: string;
  } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawList = emailsInput
      .split(/[\n,;]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && s.includes('@'));

    if (rawList.length === 0) {
      setEmailStatus({
        success: false,
        message: 'Please enter at least one valid recruiter email address.',
      });
      return;
    }

    setSendingEmail(true);
    setEmailStatus(null);

    const endpoint = templateType === 'fresher' 
      ? '/api/send-fresher-email' 
      : '/api/send-experienced-email';

    try {
      const res = await safeFetchJson<{
        success: boolean;
        message: string;
        results?: Array<{ email: string; success: boolean; error?: string; simulated?: boolean; messageId?: string }>;
      }>(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails: rawList }),
      });

      if (res.data) {
        setEmailStatus(res.data);
      } else {
        setEmailStatus({
          success: false,
          message: res.error || 'Failed to dispatch email request',
        });
      }
    } catch (err: any) {
      setEmailStatus({
        success: false,
        message: err?.message || 'Network error occurred',
      });
    } finally {
      setSendingEmail(false);
    }
  };

  const handleGenerateWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNumber = phoneInput.replace(/\D/g, '');
    if (!cleanNumber || cleanNumber.length < 10) {
      return;
    }

    setGeneratingWhatsApp(true);
    const endpoint = templateType === 'fresher'
      ? '/api/send-fresher-whatsapp'
      : '/api/send-experienced-whatsapp';

    try {
      const res = await safeFetchJson<{
        success: boolean;
        url: string;
        text: string;
        formattedNumber: string;
      }>(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number: cleanNumber }),
      });

      if (res.ok && res.data) {
        setWhatsappResult({
          url: res.data.url,
          message: res.data.text,
          formattedNumber: res.data.formattedNumber,
        });
      }
    } catch (err) {
      console.error('Failed to generate WhatsApp link:', err);
    } finally {
      setGeneratingWhatsApp(false);
    }
  };

  const copyWhatsAppUrl = () => {
    if (!whatsappResult) return;
    navigator.clipboard.writeText(whatsappResult.url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-indigo-500/10 border border-blue-500/20 dark:border-blue-400/20">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[12px] font-semibold mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Nodemailer Job Outreach & WhatsApp Service</span>
          </div>
          <h2 className="text-xl font-bold text-apple-black dark:text-white">
            Recruiter Dispatcher & Applications
          </h2>
          <p className="text-[13px] text-apple-gray-500 dark:text-apple-gray-400 mt-1 max-w-xl">
            Dispatch applications for MERN Stack Developer roles with auto-attached PDF resume (SurajNyavanandi-Resume.pdf) and generate direct WhatsApp pitch links.
          </p>
        </div>

        <a
          href="/SurajNyavanandi-Resume.pdf"
          download="SurajNyavanandi-Resume.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-[#1C1C1E] border border-apple-gray-200 dark:border-[#38383A] text-[13px] font-semibold text-apple-black dark:text-white shadow-xs hover:bg-apple-gray-50 dark:hover:bg-[#2C2C2E] transition-all cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Download className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span>Download Resume PDF</span>
        </a>
      </div>

      {/* Role / Template Selector */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-apple-gray-200 dark:border-[#38383A] shadow-xs">
        <label className="block text-[13px] font-semibold text-apple-black dark:text-white mb-2">
          Select Application Template
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setTemplateType('fresher')}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              templateType === 'fresher'
                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 ring-2 ring-blue-500/20'
                : 'border-apple-gray-200 dark:border-[#38383A] hover:bg-apple-gray-50 dark:hover:bg-[#2C2C2E]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[14px] text-apple-black dark:text-white">
                Fresher MERN Stack Role
              </span>
              {templateType === 'fresher' && <CheckCircle2 className="h-4 w-4 text-blue-600" />}
            </div>
            <p className="text-[12px] text-apple-gray-500 dark:text-apple-gray-400 mt-1">
              "Fresher MERN Stack Developer with 11 months hands-on training and production projects"
            </p>
          </button>

          <button
            type="button"
            onClick={() => setTemplateType('experienced')}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              templateType === 'experienced'
                ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/20 ring-2 ring-purple-500/20'
                : 'border-apple-gray-200 dark:border-[#38383A] hover:bg-apple-gray-50 dark:hover:bg-[#2C2C2E]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[14px] text-apple-black dark:text-white">
                1+ Years Experience Opening
              </span>
              {templateType === 'experienced' && <CheckCircle2 className="h-4 w-4 text-purple-600" />}
            </div>
            <p className="text-[12px] text-apple-gray-500 dark:text-apple-gray-400 mt-1">
              "Humble request to consider profile as a fresher with 11 months rigorous training"
            </p>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Email Dispatch Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-apple-gray-200 dark:border-[#38383A] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Mail className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-[16px] text-apple-black dark:text-white">
                Send Application Emails
              </h3>
            </div>
            <p className="text-[13px] text-apple-gray-500 dark:text-apple-gray-400 mb-4">
              Enter recruiter or hiring manager email addresses. Dispatches via Nodemailer with attached resume.
            </p>

            <form onSubmit={handleSendEmail} className="space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-apple-black dark:text-white mb-1.5">
                  Recruiter Emails (comma or new-line separated)
                </label>
                <textarea
                  rows={4}
                  value={emailsInput}
                  onChange={(e) => setEmailsInput(e.target.value)}
                  placeholder="hr@techcorp.com, hiring@startup.io&#10;recruiter@enterprise.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-apple-gray-200 dark:border-[#38383A] bg-white dark:bg-[#2C2C2E] text-apple-black dark:text-white text-[13px] placeholder:text-apple-gray-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/40"
                />
              </div>

              <div className="flex items-center justify-between text-[12px] text-apple-gray-500 dark:text-apple-gray-400 bg-apple-gray-50 dark:bg-[#2C2C2E]/50 p-2.5 rounded-xl border border-apple-gray-200/60 dark:border-[#38383A]">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-500" />
                  <span>SurajNyavanandi-Resume.pdf</span>
                </div>
                <span className="text-apple-green font-medium">Ready</span>
              </div>

              <Button
                type="submit"
                disabled={sendingEmail || !emailsInput.trim()}
                className="w-full min-h-[44px] rounded-xl text-[14px] font-semibold gap-2"
              >
                {sendingEmail ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Dispatching Emails...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Send Application Emails</span>
                  </>
                )}
              </Button>
            </form>

            {emailStatus && (
              <div
                className={`mt-4 p-3.5 rounded-xl border text-[13px] ${
                  emailStatus.success
                    ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300'
                    : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
                }`}
              >
                <div className="flex items-center gap-2 font-semibold">
                  {emailStatus.success ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                  )}
                  <span>{emailStatus.message}</span>
                </div>

                {Array.isArray(emailStatus.results) && (
                  <div className="mt-2.5 space-y-1.5 pt-2 border-t border-current/20 font-mono text-[11px]">
                    {emailStatus.results.map((r, i) => (
                      <div key={i} className="flex items-center justify-between gap-2">
                        <span className="truncate">{r.email}</span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold shrink-0 ${
                            r.success
                              ? 'bg-green-600/20 text-green-700 dark:text-green-300'
                              : 'bg-red-600/20 text-red-700 dark:text-red-300'
                          }`}
                        >
                          {r.success ? (r.simulated ? 'Simulated' : 'Delivered') : 'Failed'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* WhatsApp Outreach Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-apple-gray-200 dark:border-[#38383A] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-xl bg-green-500/10 text-green-600 dark:text-green-400">
                <MessageSquare className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-[16px] text-apple-black dark:text-white">
                WhatsApp Outreach Generator
              </h3>
            </div>
            <p className="text-[13px] text-apple-gray-500 dark:text-apple-gray-400 mb-4">
              Enter recruiter's 10-digit mobile number to generate a tailored pitch message and direct WhatsApp chat link.
            </p>

            <form onSubmit={handleGenerateWhatsApp} className="space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-apple-black dark:text-white mb-1.5">
                  Recruiter Phone Number
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[13px] font-semibold text-apple-gray-400">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="9876543210"
                    className="w-full pl-12 pr-3.5 py-2.5 rounded-xl border border-apple-gray-200 dark:border-[#38383A] bg-white dark:bg-[#2C2C2E] text-apple-black dark:text-white text-[14px] font-mono placeholder:text-apple-gray-400 focus:outline-hidden focus:ring-2 focus:ring-green-500/40"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={generatingWhatsApp || phoneInput.length < 10}
                className="w-full min-h-[44px] rounded-xl text-[14px] font-semibold gap-2 bg-green-600 hover:bg-green-700 text-white"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Generate WhatsApp Pitch Link</span>
              </Button>
            </form>

            {whatsappResult && (
              <div className="mt-4 p-4 rounded-xl bg-apple-gray-50 dark:bg-[#2C2C2E]/60 border border-apple-gray-200 dark:border-[#38383A] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-semibold text-apple-black dark:text-white">
                    Target: +{whatsappResult.formattedNumber}
                  </span>
                  <span className="text-[11px] text-green-600 dark:text-green-400 font-medium">
                    Link Ready
                  </span>
                </div>

                <div className="bg-white dark:bg-[#1C1C1E] p-3 rounded-lg border border-apple-gray-200/80 dark:border-[#38383A] text-[12px] whitespace-pre-wrap font-sans text-apple-black dark:text-apple-gray-200 max-h-36 overflow-y-auto">
                  {whatsappResult.message}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <a
                    href={whatsappResult.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-green-600 hover:bg-green-700 text-white text-[13px] font-semibold transition-all cursor-pointer"
                  >
                    <span>Open in WhatsApp</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>

                  <button
                    type="button"
                    onClick={copyWhatsAppUrl}
                    className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-white dark:bg-[#2C2C2E] border border-apple-gray-200 dark:border-[#38383A] text-apple-black dark:text-white text-[13px] font-medium hover:bg-apple-gray-100 transition-all cursor-pointer"
                  >
                    {copiedLink ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
