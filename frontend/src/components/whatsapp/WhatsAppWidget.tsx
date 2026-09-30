import React, { useState } from 'react';
import { X, CheckCircle2, MessageCircle, ArrowRight, ExternalLink, AlertCircle } from 'lucide-react';
import { getVerifiedWhatsAppUrl } from '@/lib/utils';

interface ProjectOption {
  id: string;
  label: string;
  shortName: string;
  minPrice: number;
}

const PROJECT_TYPE_OPTIONS: ProjectOption[] = [
  {
    id: 'Static Website',
    shortName: 'Static Website',
    label: 'Simple Static Website (Landing Page, Portfolio, Business Info)',
    minPrice: 4999,
  },
  {
    id: 'Online Store',
    shortName: 'Online Shopping Store',
    label: 'Online Shopping Store (E-commerce / Products)',
    minPrice: 14999,
  },
  {
    id: 'Mobile App',
    shortName: 'Mobile App',
    label: 'Mobile App (Android & iOS)',
    minPrice: 25999,
  },
  {
    id: 'Custom Business Software',
    shortName: 'Custom Business Software',
    label: 'Custom Business Software / Web App',
    minPrice: 19999,
  },
  {
    id: 'Website Redesign',
    shortName: 'Website Redesign',
    label: 'Website Redesign or Bug Fix',
    minPrice: 2999,
  },
  {
    id: 'Other Inquiry',
    shortName: 'General Consultation',
    label: 'Other / General Consultation',
    minPrice: 2000,
  },
];

interface WhatsAppFormData {
  name: string;
  phone: string;
  projectType: string;
  budget: string;
  description: string;
}

export const WhatsAppWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [budgetError, setBudgetError] = useState<string | null>(null);

  const [form, setForm] = useState<WhatsAppFormData>(() => {
    try {
      const saved = localStorage.getItem('virattom_wa_lead_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          name: parsed.name || '',
          phone: parsed.phone || '',
          projectType: parsed.projectType || PROJECT_TYPE_OPTIONS[0].label,
          budget: parsed.budget || '',
          description: parsed.description || '',
        };
      }
    } catch {}
    return {
      name: '',
      phone: '',
      projectType: PROJECT_TYPE_OPTIONS[0].label,
      budget: '',
      description: '',
    };
  });

  const selectedProject =
    PROJECT_TYPE_OPTIONS.find((opt) => opt.label === form.projectType) || PROJECT_TYPE_OPTIONS[0];

  const handleOpenModal = () => {
    setIsOpen(true);
    setSubmitted(false);
    setNameError(null);
    setBudgetError(null);
  };

  const handleCloseModal = () => {
    setIsOpen(false);
    setNameError(null);
    setBudgetError(null);
  };

  const validateBudget = (val: string, currentProject: ProjectOption): boolean => {
    const rawNumber = parseInt(val.replace(/\D/g, ''), 10);
    if (!val.trim() || isNaN(rawNumber) || rawNumber <= 0) {
      setBudgetError('Please enter your estimated budget');
      return false;
    }
    if (rawNumber < currentProject.minPrice) {
      setBudgetError(
        `Minimum budget for ${currentProject.shortName} should be at least ₹${currentProject.minPrice.toLocaleString('en-IN')}`
      );
      return false;
    }
    setBudgetError(null);
    return true;
  };

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value.replace(/[^0-9]/g, '');
    setForm({ ...form, budget: inputVal });
    // Clear any previous error while user is actively typing so no threshold is prematurely revealed
    if (budgetError) {
      setBudgetError(null);
    }
  };

  const handleProjectTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProjectType = e.target.value;
    setForm({ ...form, projectType: newProjectType });
    if (budgetError) {
      setBudgetError(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
      setNameError('Please enter your name so we know who we are chatting with.');
      return;
    }
    setNameError(null);

    // Validate budget threshold
    const isBudgetOk = validateBudget(form.budget, selectedProject);
    if (!isBudgetOk) {
      return;
    }

    const rawNumber = parseInt(form.budget.replace(/\D/g, ''), 10);
    const formattedBudget = `₹${rawNumber.toLocaleString('en-IN')}`;

    // Build WhatsApp URL with no email verification required
    const waUrl = getVerifiedWhatsAppUrl({
      name: form.name.trim(),
      phone: form.phone.trim(),
      projectType: form.projectType,
      budget: formattedBudget,
      scope: form.description.trim(),
    });

    // Save for convenient re-use
    try {
      localStorage.setItem('virattom_wa_lead_data', JSON.stringify(form));
    } catch {}

    setRedirectUrl(waUrl);
    setSubmitted(true);

    // Directly open WhatsApp in a new tab without blocking
    try {
      const opened = window.open(waUrl, '_blank', 'noopener,noreferrer');
      if (!opened) {
        window.location.href = waUrl;
      }
    } catch {
      window.location.href = waUrl;
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
          onClick={handleOpenModal}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          type="button"
          aria-label="Direct WhatsApp Consultation"
          className="group relative flex items-center justify-center w-14 h-14 bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white rounded-full shadow-[0_8px_30px_rgb(37,211,102,0.4)] hover:shadow-[0_12px_36px_rgb(37,211,102,0.55)] transition-all duration-200 cursor-pointer"
        >
          {/* Subtle online pulse ring */}
          <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-35 animate-ping -z-10 group-hover:opacity-50" />

          {/* WhatsApp SVG Icon */}
          <svg className="w-7 h-7 fill-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>
        </button>
      </div>

      {/* WhatsApp Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-apple-gray-200 overflow-hidden animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="relative px-6 py-5 bg-gradient-to-r from-emerald-600 via-emerald-500 to-[#25D366] text-white shrink-0">
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-xs">
                  <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-[17.5px] font-bold tracking-tight">Direct WhatsApp Consultation</h3>
                  <p className="text-[12.5px] text-white/95">Instant 1-tap chat with ViratTom Engineering</p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4">
              {submitted ? (
                <div className="py-6 text-center space-y-4">
                  <div className="inline-flex p-3 rounded-full bg-emerald-100 text-emerald-600">
                    <CheckCircle2 size={40} className="animate-bounce" />
                  </div>
                  <h4 className="text-[18px] font-bold text-apple-black">Connecting to WhatsApp...</h4>
                  <p className="text-[13px] text-apple-gray-600 leading-relaxed max-w-sm mx-auto">
                    We’ve prepared your message! If WhatsApp didn’t open automatically, tap the button below to start chatting right now:
                  </p>

                  <div className="pt-2 flex flex-col gap-2">
                    <a
                      href={redirectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] active:scale-98 text-white font-semibold text-[14.5px] shadow-lg shadow-emerald-500/25 transition-all"
                    >
                      <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                      </svg>
                      <span>Open WhatsApp Chat Now</span>
                      <ExternalLink size={16} />
                    </a>

                    <button
                      type="button"
                      onClick={() => setSubmitted(false)}
                      className="text-[13px] text-apple-gray-500 hover:text-apple-black py-2 cursor-pointer transition-colors"
                    >
                      ← Edit details
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name Input */}
                  <div>
                    <label className="block text-[12.5px] font-semibold text-apple-black mb-1">
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Shree Rama"
                      value={form.name}
                      onChange={(e) => {
                        setForm({ ...form, name: e.target.value });
                        if (nameError) setNameError(null);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-apple-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-[14px] outline-none transition-all"
                    />
                    {nameError && (
                      <p className="text-[12px] text-red-600 mt-1">{nameError}</p>
                    )}
                  </div>

                  {/* Beginner-Friendly Project Type Select */}
                  <div>
                    <label className="block text-[12.5px] font-semibold text-apple-black mb-1">
                      What do you want to build?
                    </label>
                    <select
                      value={form.projectType}
                      onChange={handleProjectTypeChange}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-apple-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-[13.5px] outline-none transition-all bg-white"
                    >
                      {PROJECT_TYPE_OPTIONS.map((opt) => (
                        <option key={opt.id} value={opt.label}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Budget Input with Threshold Validation (Clean, no presets displayed) */}
                  <div>
                    <label className="block text-[12.5px] font-semibold text-apple-black mb-1">
                      Your Budget (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-apple-gray-400 font-semibold text-[14px] pointer-events-none">
                        ₹
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="Enter budget"
                        value={form.budget}
                        onChange={handleBudgetChange}
                        className={`w-full pl-8 pr-3.5 py-2.5 rounded-xl border text-[14px] outline-none transition-all ${
                          budgetError
                            ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 bg-red-50/20'
                            : 'border-apple-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                        }`}
                      />
                    </div>
                    {budgetError && (
                      <div className="flex items-start gap-1.5 mt-1.5 text-[12px] text-red-600 font-medium animate-in fade-in duration-150">
                        <AlertCircle size={14} className="shrink-0 mt-0.5" />
                        <span>{budgetError}</span>
                      </div>
                    )}
                  </div>

                  {/* Optional Mobile Number */}
                  <div>
                    <label className="block text-[12.5px] font-semibold text-apple-black mb-1">
                      Your Mobile Number <span className="text-apple-gray-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. 98765 43210 (Optional)"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/[^\d+\s-]/g, '') })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-apple-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-[14px] outline-none transition-all"
                    />
                  </div>

                  {/* Project Description (Optional) */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[12.5px] font-semibold text-apple-black">
                        Project Description <span className="text-apple-gray-400 font-normal">(Optional)</span>
                      </label>
                      <span className="text-[11px] text-apple-gray-400">Can discuss on chat</span>
                    </div>
                    <textarea
                      rows={2}
                      placeholder="Tell us what you want to build (or leave blank and tell us on WhatsApp)..."
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-apple-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-[13.5px] outline-none transition-all resize-none"
                    />
                  </div>

                  {/* Direct WhatsApp Action Button */}
                  <button
                    type="submit"
                    className="w-full mt-2 py-3.5 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] active:scale-98 text-white font-semibold text-[14.5px] flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
                  >
                    <MessageCircle size={18} className="fill-white" />
                    <span>Chat on WhatsApp</span>
                    <ArrowRight size={16} />
                  </button>

                  <p className="text-center text-[11.5px] text-apple-gray-400 pt-1">
                    Direct conversation • No spam • Fast response within 10 minutes
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
