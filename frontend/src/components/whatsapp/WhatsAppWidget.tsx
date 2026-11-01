import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, MessageCircle, ArrowRight, AlertCircle, ChevronDown, Check, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';
import { safeFetchJson, normalizeProjectType, PROJECT_MIN_PRICES } from '@/lib/utils';

interface ServiceOption {
  id: string;
  name: string;
  requiresBudget: boolean;
}

const SERVICE_OPTIONS: ServiceOption[] = [
  {
    id: 'static_website',
    name: 'Static Website',
    requiresBudget: true,
  },
  {
    id: 'dynamic_website',
    name: 'Dynamic Website',
    requiresBudget: true,
  },
  {
    id: 'ecommerce',
    name: 'Online Store (E-Commerce)',
    requiresBudget: true,
  },
  {
    id: 'mobile_app',
    name: 'Mobile App (iOS & Android)',
    requiresBudget: true,
  },
  {
    id: 'full_stack',
    name: 'Website + Mobile App',
    requiresBudget: true,
  },
  {
    id: 'fix',
    name: 'Fix or Update Existing Website',
    requiresBudget: false,
  },
  {
    id: 'question',
    name: 'Just Have a Question',
    requiresBudget: false,
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [budgetError, setBudgetError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [projectPrices, setProjectPrices] = useState<Record<string, number>>({});

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Dynamically fetch configured project prices from Admin Panel
  useEffect(() => {
    let isMounted = true;
    safeFetchJson<{ success: boolean; prices: Record<string, number> }>('/api/project-prices')
      .then((res) => {
        if (!isMounted) return;
        if (res.ok && res.data?.prices) {
          setProjectPrices(res.data.prices);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const getDynamicThreshold = useCallback((serviceName: string): number => {
    const norm = normalizeProjectType(serviceName);
    if (!norm) return 0;
    return projectPrices[norm] || projectPrices[serviceName] || PROJECT_MIN_PRICES[norm] || PROJECT_MIN_PRICES[serviceName] || 0;
  }, [projectPrices]);

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

  const selectedService =
    SERVICE_OPTIONS.find((s) => s.name === form.service) || SERVICE_OPTIONS[0];

  const numericBudget = parseInt(form.budget.replace(/\D/g, ''), 10) || 0;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDropdownOpen]);

  const handleOpenModal = () => {
    setIsOpen(true);
    setIsDropdownOpen(false);
    setNameError(false);
    setBudgetError(null);
    setServerError(null);
    setIsSubmitted(false);
  };

  const handleCloseModal = () => {
    setIsOpen(false);
    setIsDropdownOpen(false);
    setNameError(false);
    setBudgetError(null);
    setServerError(null);
  };

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setForm((prev) => ({ ...prev, budget: val }));
    if (budgetError) {
      const num = parseInt(val, 10) || 0;
      const minThreshold = getDynamicThreshold(selectedService.name);
      if (num >= minThreshold && num > 0) {
        setBudgetError(null);
      }
    }
  };

  const handleSelectService = (serviceName: string) => {
    setForm((prev) => ({ ...prev, service: serviceName }));
    setIsDropdownOpen(false);
    const targetService = SERVICE_OPTIONS.find((s) => s.name === serviceName);
    if (targetService?.requiresBudget && form.budget) {
      const num = parseInt(form.budget.replace(/\D/g, ''), 10) || 0;
      const newThreshold = getDynamicThreshold(serviceName);
      if (num > 0 && num < newThreshold) {
        setBudgetError(`Minimum budget for this project is ₹${newThreshold.toLocaleString('en-IN')}.`);
      } else if (num >= newThreshold) {
        setBudgetError(null);
      }
    } else {
      setBudgetError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
      setNameError(true);
      return;
    }
    setNameError(false);

    const minThreshold = getDynamicThreshold(selectedService.name);

    if (selectedService.requiresBudget) {
      if (!form.budget.trim() || isNaN(numericBudget) || numericBudget <= 0) {
        setBudgetError('Please enter your estimated budget amount');
        return;
      }
      if (minThreshold > 0 && numericBudget < minThreshold) {
        setBudgetError(`Minimum budget for this project is ₹${minThreshold.toLocaleString('en-IN')}.`);
        return;
      }
    }

    setBudgetError(null);
    setServerError(null);
    setIsSubmitting(true);

    try {
      localStorage.setItem('virattom_wa_lead_data', JSON.stringify(form));
    } catch {}

    try {
      let res = await safeFetchJson<{ success: boolean; message?: string; error?: string }>('/api/whatsapp-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone.trim(),
          service: selectedService.name,
          projectType: selectedService.name,
          budget: numericBudget,
          message: form.message.trim(),
          source: 'whatsapp_widget',
        }),
      });

      // Seamless fallback: If the deployed server does not have /api/whatsapp-lead (404),
      // retry via /api/lead which handles source: 'whatsapp_widget'
      if (!res.ok && res.status === 404) {
        res = await safeFetchJson<{ success: boolean; message?: string; error?: string }>('/api/lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.name.trim(),
            phone: form.phone.trim(),
            service: selectedService.name,
            projectType: selectedService.name,
            budget: numericBudget,
            message: form.message.trim(),
            source: 'whatsapp_widget',
          }),
        });
      }

      if (res.ok && res.data?.success) {
        setIsSubmitted(true);
      } else {
        setServerError(res.data?.error || 'Failed to send inquiry. Please try again.');
      }
    } catch (err: any) {
      setServerError('Network error submitting inquiry. Please check connection.');
    } finally {
      setIsSubmitting(false);
    }
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
            <span>Chat with Engineering Team</span>
          </div>
        </div>

        <button
          onClick={handleOpenModal}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          type="button"
          aria-label="WhatsApp Inquiry"
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
              {isSubmitted ? (
                /* In-App Confirmation / Success State */
                <div className="text-center py-6 px-2 space-y-4">
                  <div className="w-16 h-16 bg-[#25D366]/15 rounded-full flex items-center justify-center mx-auto text-[#25D366]">
                    <CheckCircle2 size={36} />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-[20px] font-bold text-[#1C1C1E] dark:text-white">
                      Inquiry Received!
                    </h3>
                    <p className="text-[14px] text-[#6E6E73] dark:text-[#A1A1A6] leading-relaxed max-w-xs mx-auto">
                      Thank you! Our team has received your inquiry and will contact you shortly via WhatsApp or Email.
                    </p>
                  </div>

                  <div className="p-3.5 bg-[#F2F2F7] dark:bg-[#2C2C2E] rounded-2xl text-[12.5px] text-[#424245] dark:text-[#D2D2D7] text-left flex items-start gap-2.5">
                    <ShieldCheck size={18} className="text-[#25D366] shrink-0 mt-0.5" />
                    <span>
                      Your inquiry has been logged securely in our system. You will receive an instant reply from a technical specialist.
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="w-full py-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] active:scale-98 text-white font-semibold text-[14.5px] transition-all cursor-pointer shadow-sm"
                  >
                    Done
                  </button>
                </div>
              ) : (
                /* Submission Form */
                <form id="whatsapp-form" onSubmit={handleSubmit} className="space-y-4">
                  {/* Header title */}
                  <div className="pr-8 pb-1">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-[#25D366]/10 text-[#25D366] rounded-lg">
                        <MessageCircle size={18} />
                      </div>
                      <h3 className="text-[17px] font-semibold text-[#1C1C1E] dark:text-white">
                        WhatsApp Instant Inquiry
                      </h3>
                    </div>
                    <p className="text-[13px] text-[#8E8E93] mt-1">
                      Send your project requirement directly to our team
                    </p>
                  </div>

                  {serverError && (
                    <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 rounded-xl text-red-600 dark:text-red-400 text-[13px] flex items-center gap-2">
                      <AlertCircle size={16} className="shrink-0" />
                      <span>{serverError}</span>
                    </div>
                  )}

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

                  {/* Phone Number / Contact */}
                  <div>
                    <label className="block text-[13px] font-medium text-[#1C1C1E] dark:text-[#E5E5EA] mb-1.5">
                      Mobile Number / WhatsApp <span className="text-[#8E8E93] text-[12px] font-normal">(Optional)</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. 9876543210 (Optional)"
                      value={form.phone}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value.replace(/[^\d+\s-]/g, '') })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E5EA] dark:border-[#3A3A3C] bg-[#F2F2F7] dark:bg-[#2C2C2E] text-[#1C1C1E] dark:text-white text-[14px] outline-none focus:border-[#25D366] focus:ring-2 focus:ring-[#25D366]/20 transition-all"
                    />
                  </div>

                  {/* Service Dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <label className="block text-[13px] font-medium text-[#1C1C1E] dark:text-[#E5E5EA] mb-1.5">
                      What do you need help with?
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen((prev) => !prev)}
                      aria-haspopup="listbox"
                      aria-expanded={isDropdownOpen}
                      className={`w-full px-3.5 py-2.5 rounded-xl border bg-[#F2F2F7] dark:bg-[#2C2C2E] text-[#1C1C1E] dark:text-white text-[13.5px] font-medium flex items-center justify-between text-left outline-none transition-all cursor-pointer ${
                        isDropdownOpen
                          ? 'border-[#25D366] ring-2 ring-[#25D366]/20 bg-white dark:bg-[#2C2C2E]'
                          : 'border-[#E5E5EA] dark:border-[#3A3A3C] hover:border-[#D1D1D6] dark:hover:border-[#48484A]'
                      }`}
                    >
                      <span className="truncate pr-2">{form.service}</span>
                      <ChevronDown
                        size={16}
                        className={`text-[#8E8E93] transition-transform duration-200 shrink-0 ml-1 ${
                          isDropdownOpen ? 'rotate-180 text-[#25D366]' : ''
                        }`}
                      />
                    </button>

                    {/* Custom Dropdown Options Menu */}
                    {isDropdownOpen && (
                      <div
                        role="listbox"
                        className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white dark:bg-[#242426] rounded-2xl shadow-[0_12px_32px_rgba(0,0,0,0.16)] border border-[#E5E5EA] dark:border-[#38383A] p-1.5 space-y-0.5 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md max-h-60 overflow-y-auto"
                      >
                        {SERVICE_OPTIONS.map((opt) => {
                          const isSelected = form.service === opt.name;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              role="option"
                              aria-selected={isSelected}
                              onClick={() => handleSelectService(opt.name)}
                              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-[13.5px] transition-all flex items-center justify-between cursor-pointer ${
                                isSelected
                                  ? 'bg-[#E8F8EE] dark:bg-[#1C3627] text-[#0d7838] dark:text-[#25D366] font-semibold shadow-xs'
                                  : 'text-[#1C1C1E] dark:text-[#E5E5EA] hover:bg-[#F2F2F7] dark:hover:bg-[#2C2C2E]'
                              }`}
                            >
                              <div className="flex flex-col truncate pr-2">
                                <span className="font-medium truncate">{opt.name}</span>
                              </div>
                              {isSelected && <Check size={16} className="text-[#25D366] shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Budget Input (₹) */}
                  <div>
                    <label className="block text-[13px] font-medium text-[#1C1C1E] dark:text-[#E5E5EA] mb-1.5">
                      Estimated Budget (₹){' '}
                      {selectedService.requiresBudget ? (
                        <span className="text-red-500">*</span>
                      ) : (
                        <span className="text-[#8E8E93] text-[12px] font-normal">(Optional)</span>
                      )}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E8E93] font-medium text-[14px] pointer-events-none">
                        ₹
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder={
                          selectedService.requiresBudget
                            ? 'Enter estimated budget'
                            : 'Optional'
                        }
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

                  {/* Description / Message */}
                  <div>
                    <label className="block text-[13px] font-medium text-[#1C1C1E] dark:text-[#E5E5EA] mb-1.5">
                      Requirement Details <span className="text-[#8E8E93] font-normal">(Optional)</span>
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Brief details about your project requirements..."
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E5EA] dark:border-[#3A3A3C] bg-[#F2F2F7] dark:bg-[#2C2C2E] text-[#1C1C1E] dark:text-white text-[13.5px] outline-none focus:border-[#25D366] focus:ring-2 focus:ring-[#25D366]/20 transition-all resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-2 py-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] active:scale-98 text-white font-semibold text-[14.5px] flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        <span>Sending Inquiry...</span>
                      </>
                    ) : (
                      <>
                        <MessageCircle size={18} className="fill-white" />
                        <span>Submit Inquiry</span>
                        <ArrowRight size={16} />
                      </>
                    )}
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
