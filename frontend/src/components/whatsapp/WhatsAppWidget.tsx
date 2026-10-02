import React, { useState } from 'react';
import { X, CheckCircle2, MessageCircle, ArrowRight, ExternalLink, AlertCircle } from 'lucide-react';
import { getVerifiedWhatsAppUrl } from '@/lib/utils';

interface ServiceOption {
  id: string;
  name: string;
  shortName: string;
  minPrice: number;
}

const SERVICE_OPTIONS: ServiceOption[] = [
  {
    id: 'website',
    name: 'Website (Business, Shop, Portfolio)',
    shortName: 'Website',
    minPrice: 4999,
  },
  {
    id: 'store',
    name: 'Online Store (E-Commerce)',
    shortName: 'Online Store',
    minPrice: 14999,
  },
  {
    id: 'app',
    name: 'Mobile App (Android & iOS)',
    shortName: 'Mobile App',
    minPrice: 25999,
  },
  {
    id: 'software',
    name: 'Custom Software / Web App',
    shortName: 'Custom Software',
    minPrice: 19999,
  },
  {
    id: 'fix',
    name: 'Fix or Update Existing Website',
    shortName: 'Website Fix/Update',
    minPrice: 2999,
  },
  {
    id: 'other',
    name: 'Other / Just have a question',
    shortName: 'General Consultation',
    minPrice: 1000,
  },
];

interface WhatsAppFormData {
  name: string;
  phone: string;
  service: string;
  budget: string;
  message: string;
}

export const WhatsAppWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState('');
  const [nameError, setNameError] = useState(false);
  const [budgetError, setBudgetError] = useState<string | null>(null);

  const [form, setForm] = useState<WhatsAppFormData>(() => {
    try {
      const saved = localStorage.getItem('virattom_wa_lead_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          name: parsed.name || '',
          phone: parsed.phone || '',
          service: parsed.service || SERVICE_OPTIONS[0].name,
          budget: parsed.budget || '',
          message: parsed.message || '',
        };
      }
    } catch {}
    return {
      name: '',
      phone: '',
      service: SERVICE_OPTIONS[0].name,
      budget: '',
      message: '',
    };
  });

  const handleOpenModal = () => {
    setIsOpen(true);
    setSubmitted(false);
    setNameError(false);
    setBudgetError(null);
  };

  const handleCloseModal = () => {
    setIsOpen(false);
    setNameError(false);
    setBudgetError(null);
  };

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setForm((prev) => ({ ...prev, budget: val }));
    // Do NOT show any hint or error while user is actively typing
    if (budgetError) {
      setBudgetError(null);
    }
  };

  const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, service: e.target.value }));
    if (budgetError) {
      setBudgetError(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
      setNameError(true);
      return;
    }
    setNameError(false);

    // Validate budget only when submitting
    const rawNumber = parseInt(form.budget.replace(/\D/g, ''), 10);
    const selectedService =
      SERVICE_OPTIONS.find((s) => s.name === form.service) || SERVICE_OPTIONS[0];

    if (!form.budget.trim() || isNaN(rawNumber) || rawNumber <= 0) {
      setBudgetError(`Please enter your budget`);
      return;
    }

    if (rawNumber < selectedService.minPrice) {
      setBudgetError(
        `Minimum budget for ${selectedService.shortName} is ₹${selectedService.minPrice.toLocaleString('en-IN')}`
      );
      return;
    }

    setBudgetError(null);

    const formattedBudget = `₹${rawNumber.toLocaleString('en-IN')}`;

    // Generate formatted WhatsApp message URL
    const waUrl = getVerifiedWhatsAppUrl({
      name: form.name.trim(),
      phone: form.phone.trim(),
      projectType: form.service,
      budget: formattedBudget,
      scope: form.message.trim(),
    });

    try {
      localStorage.setItem('virattom_wa_lead_data', JSON.stringify(form));
    } catch {}

    setRedirectUrl(waUrl);
    setSubmitted(true);
  };

  return (
    <>
      {/* Floating WhatsApp Action Button */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
        {/* Tooltip */}
        <div
          className={`mb-2 px-3 py-1.5 bg-[#1C1C1E] text-white text-[12px] font-medium rounded-xl shadow-lg border border-white/10 transition-all duration-300 pointer-events-none ${
            showTooltip ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
            <span>Chat on WhatsApp</span>
          </div>
        </div>

        <button
          onClick={handleOpenModal}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          type="button"
          aria-label="WhatsApp Chat"
          className="group relative flex items-center justify-center w-14 h-14 bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white rounded-full shadow-[0_8px_24px_rgba(37,211,102,0.35)] transition-all duration-200 cursor-pointer"
        >
          <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-30 animate-ping -z-10 group-hover:opacity-45" />
          <svg className="w-7 h-7 fill-white" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>
        </button>
      </div>

      {/* WhatsApp Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white dark:bg-[#1C1C1E] rounded-3xl shadow-2xl border border-[#E5E5EA] dark:border-[#2C2C2E] overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
            
            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 p-2 rounded-full text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white hover:bg-[#F2F2F7] dark:hover:bg-[#2C2C2E] transition-colors cursor-pointer z-10"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            {/* Modal Body */}
            <div className="p-6 pt-6">
              {submitted ? (
                <div className="py-6 text-center space-y-4">
                  <div className="inline-flex p-3 rounded-full bg-emerald-100 text-[#25D366]">
                    <CheckCircle2 size={36} />
                  </div>
                  <h4 className="text-[17px] font-semibold text-[#1C1C1E] dark:text-white">
                    Opening WhatsApp...
                  </h4>
                  <p className="text-[13px] text-[#8E8E93] max-w-xs mx-auto">
                    If WhatsApp didn't open automatically, click the button below to start chat:
                  </p>

                  <div className="pt-2 flex flex-col gap-2">
                    <a
                      href={redirectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] active:scale-98 text-white font-medium text-[14px] shadow-md transition-all"
                    >
                      <MessageCircle size={18} className="fill-white" />
                      <span>Open WhatsApp</span>
                      <ExternalLink size={15} />
                    </a>

                    <button
                      type="button"
                      onClick={() => setSubmitted(false)}
                      className="text-[13px] text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white py-2 cursor-pointer transition-colors"
                    >
                      Edit details
                    </button>
                  </div>
                </div>
              ) : (
                <form id="whatsapp-form" onSubmit={handleSubmit} className="space-y-4">
                  {/* Name Input */}
                  <div>
                    <label className="block text-[13px] font-medium text-[#1C1C1E] dark:text-[#E5E5EA] mb-1.5">
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your name"
                      value={form.name}
                      onChange={(e) => {
                        setForm({ ...form, name: e.target.value });
                        if (nameError) setNameError(false);
                      }}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-[14px] outline-none transition-all bg-[#F2F2F7] dark:bg-[#2C2C2E] text-[#1C1C1E] dark:text-white ${
                        nameError
                          ? 'border-red-500 focus:ring-2 focus:ring-red-500/20'
                          : 'border-[#E5E5EA] dark:border-[#3A3A3C] focus:border-[#25D366] focus:ring-2 focus:ring-[#25D366]/20'
                      }`}
                    />
                    {nameError && (
                      <p className="text-[12px] text-red-500 mt-1">Please enter your name</p>
                    )}
                  </div>

                  {/* Phone Number (Optional) */}
                  <div>
                    <label className="block text-[13px] font-medium text-[#1C1C1E] dark:text-[#E5E5EA] mb-1.5">
                      Phone Number <span className="text-[#8E8E93] text-[12px] font-normal">(Optional)</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. +91 98765 43210 (Optional)"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/[^\d+\s-]/g, '') })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E5EA] dark:border-[#3A3A3C] bg-[#F2F2F7] dark:bg-[#2C2C2E] text-[#1C1C1E] dark:text-white text-[14px] outline-none focus:border-[#25D366] focus:ring-2 focus:ring-[#25D366]/20 transition-all"
                    />
                  </div>

                  {/* Clear Service Dropdown */}
                  <div>
                    <label className="block text-[13px] font-medium text-[#1C1C1E] dark:text-[#E5E5EA] mb-1.5">
                      What do you need help with?
                    </label>
                    <select
                      value={form.service}
                      onChange={handleServiceChange}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E5EA] dark:border-[#3A3A3C] bg-[#F2F2F7] dark:bg-[#2C2C2E] text-[#1C1C1E] dark:text-white text-[13.5px] outline-none focus:border-[#25D366] focus:ring-2 focus:ring-[#25D366]/20 transition-all cursor-pointer"
                    >
                      {SERVICE_OPTIONS.map((opt) => (
                        <option key={opt.id} value={opt.name} className="text-[#1C1C1E] bg-white dark:bg-[#2C2C2E] dark:text-white">
                          {opt.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Numeric Budget Input (₹) with clean state and submit-only threshold validation */}
                  <div>
                    <label className="block text-[13px] font-medium text-[#1C1C1E] dark:text-[#E5E5EA] mb-1.5">
                      Estimated Budget (₹) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E8E93] font-medium text-[14px] pointer-events-none">
                        ₹
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="Enter your budget"
                        value={form.budget}
                        onChange={handleBudgetChange}
                        className={`w-full pl-8 pr-3.5 py-2.5 rounded-xl border text-[14px] outline-none transition-all bg-[#F2F2F7] dark:bg-[#2C2C2E] text-[#1C1C1E] dark:text-white ${
                          budgetError
                            ? 'border-red-500 focus:ring-2 focus:ring-red-500/20 bg-red-50/10'
                            : 'border-[#E5E5EA] dark:border-[#3A3A3C] focus:border-[#25D366] focus:ring-2 focus:ring-[#25D366]/20'
                        }`}
                      />
                    </div>
                    {budgetError && (
                      <div className="flex items-center gap-1.5 mt-1.5 text-[12px] text-red-500 font-medium">
                        <AlertCircle size={14} className="shrink-0" />
                        <span>{budgetError}</span>
                      </div>
                    )}
                  </div>

                  {/* Optional Short Message */}
                  <div>
                    <label className="block text-[13px] font-medium text-[#1C1C1E] dark:text-[#E5E5EA] mb-1.5">
                      Note / Description <span className="text-[#8E8E93] font-normal">(Optional)</span>
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Brief details (or discuss directly on WhatsApp)..."
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E5EA] dark:border-[#3A3A3C] bg-[#F2F2F7] dark:bg-[#2C2C2E] text-[#1C1C1E] dark:text-white text-[13.5px] outline-none focus:border-[#25D366] focus:ring-2 focus:ring-[#25D366]/20 transition-all resize-none"
                    />
                  </div>

                  {/* Clean WhatsApp Submit Button */}
                  <button
                    type="submit"
                    className="w-full mt-2 py-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] active:scale-98 text-white font-semibold text-[14.5px] flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <MessageCircle size={18} className="fill-white" />
                    <span>Start Chat</span>
                    <ArrowRight size={16} />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
