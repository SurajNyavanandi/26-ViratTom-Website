import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { ArrowRight, ArrowUpRight, Code, Smartphone, Zap, Shield, CheckCircle, Mail, ExternalLink, FileText, MessageCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { getMinPrice, getVerifiedWhatsAppUrl, safeFetchJson, PROJECT_MIN_PRICES, normalizeProjectType, maskEmail, maskPhone } from '@/lib/utils';
import { Validation, type LeadFormValues, type LeadFormErrors } from '@/lib/validation';
import { useOtpVerification } from '@/hooks/useOtpVerification';
import { OtpVerificationView } from '@/components/ui/OtpVerificationView';
import { SEO } from '@/components/seo/SEO';
import { TechStackMarquee } from '@/components/common/TechStackMarquee';
import { LiveWebsitePreview } from '@/components/common/LiveWebsitePreview';
import { DEFAULT_PORTFOLIO_PROJECTS, type PortfolioProject } from '@/types';

export const Home = () => {
  const location = useLocation();
  const [projects, setProjects] = useState<PortfolioProject[]>(DEFAULT_PORTFOLIO_PROJECTS);
  const [loading, setLoading] = useState(false);
  const [projectPrices, setProjectPrices] = useState<Record<string, number>>(PROJECT_MIN_PRICES);
  const [formState, setFormState] = useState<LeadFormValues>({ 
    name: '', 
    email: '', 
    phone: '', 
    budget: '', 
    scope: '', 
    projectType: 'Static Website' 
  });
  const [fieldErrors, setFieldErrors] = useState<LeadFormErrors>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

  // Field DOM refs for auto-focusing on validation failure
  const projectTypeRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const budgetInputRef = useRef<HTMLInputElement>(null);
  const scopeTextareaRef = useRef<HTMLTextAreaElement>(null);

  const [submittedLead, setSubmittedLead] = useState<{
    name: string;
    email: string;
    phone: string;
    budget: string;
    scope: string;
    projectType: string;
  } | null>(null);
  const [routingNotice, setRoutingNotice] = useState<string | null>(null);
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'otp' | 'success'>('idle');
  const [error, setError] = useState('');

  // Shared OTP hook
  const {
    otp,
    countdown,
    canResend,
    isRequesting: isOtpRequesting,
    isVerifying: isOtpVerifying,
    error: otpHookError,
    inputRefs,
    setOtpDigit,
    handleKeyDown,
    handlePaste,
    requestOtp,
    verifyOtp,
    resetOtp,
  } = useOtpVerification({
    cooldownSeconds: 60,
    onSuccess: (data) => {
      console.log('[Home Inquiry] Lead submitted and verified successfully! Lead ID:', data?.lead?._id);
      setSubmittedLead({ ...formState });
      localStorage.setItem('virattom_lead_verified', 'true');
      sessionStorage.setItem('virattom_lead_verified', 'true');
      localStorage.setItem('virattom_verified_lead_data', JSON.stringify({ ...formState }));
      sessionStorage.setItem('virattom_verified_lead_data', JSON.stringify({ ...formState }));
      setFormStatus('success');
      setRoutingNotice(null);
    },
    onError: (err) => {
      setError(err);
    }
  });

  useEffect(() => {
    const handleGate = (e: any) => {
      const msg = e?.detail?.message || 'Please submit your project details first for instant WhatsApp routing.';
      setRoutingNotice(msg);
      const contactEl = document.getElementById('contact');
      if (contactEl) {
        contactEl.scrollIntoView({ behavior: 'smooth' });
      }
    };
    window.addEventListener('whatsapp-gate-triggered', handleGate);
    return () => window.removeEventListener('whatsapp-gate-triggered', handleGate);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadProjects = async (retry = true) => {
      const res = await safeFetchJson<PortfolioProject[]>('/api/projects');
      if (!isMounted) return;

      if (res.ok && Array.isArray(res.data) && res.data.length > 0) {
        const fetched = [...res.data];
        const normalized = fetched.map(p => {
          if (p.url && p.url.includes('prosyncweb.vercel.app')) {
            return {
              ...p,
              url: 'https://prosyncindia.com',
              imageUrl: 'https://api.microlink.io/?url=https%3A%2F%2Fprosyncindia.com&screenshot=true&meta=false&embed=screenshot.url',
            };
          }
          return p;
        });

        // 1st: husoro.com, 2nd: prosyncindia.com, 3rd: manadrivers.com, 4th: inisio.in, 5th: rvmcarrybags.com, 6th: urbanico
        const getOrder = (p: PortfolioProject) => {
          const u = (p.url || '').toLowerCase();
          const t = (p.title || '').toLowerCase();
          if (u.includes('husoro') || t.includes('husoro')) return 1;
          if (u.includes('prosyncindia.com') || t.includes('prosync')) return 2;
          if (u.includes('manadrivers') || t.includes('mana drivers')) return 3;
          if (u.includes('inisio') || t.includes('inisio')) return 4;
          if (u.includes('rvmcarrybags') || t.includes('rvm')) return 5;
          if (u.includes('urbanico') || t.includes('urbanico')) return 6;
          return 99;
        };

        normalized.sort((a, b) => getOrder(a) - getOrder(b));
        setProjects(normalized);
      } else if (retry) {
        // Retry once after cold-start delay
        setTimeout(() => {
          if (isMounted) loadProjects(false);
        }, 2000);
      }
    };

    loadProjects();

    safeFetchJson<{ success: boolean; prices: Record<string, number> }>('/api/project-prices').then(res => {
      if (!isMounted) return;
      if (res.ok && res.data?.prices) {
        setProjectPrices(prev => ({ ...prev, ...res.data?.prices }));
      }
    }).catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const getProjectThreshold = useCallback((type: string) => {
    const norm = normalizeProjectType(type);
    return projectPrices[norm] || projectPrices[type] || PROJECT_MIN_PRICES[norm] || PROJECT_MIN_PRICES[type] || 4999;
  }, [projectPrices]);

  // Handle URL hash scrolling (e.g. #services, #pricing, #projects, #contact)
  useEffect(() => {
    if (location.hash) {
      const targetId = location.hash.replace('#', '');
      const scroll = () => {
        const element = document.getElementById(targetId) ||
          (targetId === 'services' ? document.getElementById('process') : null) ||
          (targetId === 'projects' ? document.getElementById('work') : null);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      };
      scroll();
      const timer = setTimeout(scroll, 200);
      return () => clearTimeout(timer);
    }
  }, [location.hash, loading]);

  const [hasSubmittedForm, setHasSubmittedForm] = useState(false);

  const handleFieldChange = (field: keyof LeadFormValues, val: string) => {
    const updated = { ...formState, [field]: val };
    setFormState(updated);
    if (error) setError('');

    if (field === 'projectType') {
      const minThreshold = getProjectThreshold(val);
      if (hasSubmittedForm && formState.budget) {
        const num = Number(formState.budget);
        if (!isNaN(num) && num > 0) {
          if (num < minThreshold) {
            setFieldErrors(prev => ({ ...prev, budget: `Minimum budget for this project is ₹${minThreshold.toLocaleString('en-IN')}.` }));
          } else {
            setFieldErrors(prev => ({ ...prev, budget: '' }));
          }
        }
      }
    } else if (field === 'budget') {
      const num = Number(val);
      const minThreshold = getProjectThreshold(updated.projectType);
      if (hasSubmittedForm) {
        if (!val.trim()) {
          setFieldErrors(prev => ({ ...prev, budget: 'Estimated budget is required.' }));
        } else if (isNaN(num) || num <= 0) {
          setFieldErrors(prev => ({ ...prev, budget: 'Please enter a positive estimated budget amount.' }));
        } else if (num < minThreshold) {
          setFieldErrors(prev => ({ ...prev, budget: `Minimum budget for this project is ₹${minThreshold.toLocaleString('en-IN')}.` }));
        } else {
          setFieldErrors(prev => ({ ...prev, budget: '' }));
        }
      }
    } else if (touchedFields[field]) {
      const minThreshold = hasSubmittedForm ? getProjectThreshold(updated.projectType) : undefined;
      const res = Validation.validateLeadForm(updated, minThreshold);
      setFieldErrors(prev => ({ ...prev, [field]: res.errors[field] || '' }));
    }
  };

  const handleFieldBlur = (field: keyof LeadFormValues) => {
    setTouchedFields(prev => ({ ...prev, [field]: true }));
    const minThreshold = hasSubmittedForm ? getProjectThreshold(formState.projectType) : undefined;
    const res = Validation.validateLeadForm(formState, minThreshold);
    setFieldErrors(prev => ({ ...prev, [field]: res.errors[field] || '' }));
  };

  const handleApply = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (formStatus === 'submitting') return; // Prevent duplicate submissions
    setError('');
    setHasSubmittedForm(true);

    const minThreshold = getProjectThreshold(formState.projectType);
    const validationResult = Validation.validateLeadForm(formState, minThreshold);

    if (!validationResult.isValid) {
      setFieldErrors(validationResult.errors);
      setTouchedFields({
        projectType: true,
        name: true,
        email: true,
        phone: true,
        budget: true,
        scope: true,
      });

      // Auto-focus and scroll to first invalid field
      const field = validationResult.firstErrorField;
      if (field === 'projectType' && projectTypeRef.current) {
        projectTypeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (field === 'name' && nameInputRef.current) {
        nameInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        nameInputRef.current.focus();
      } else if (field === 'email' && emailInputRef.current) {
        emailInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        emailInputRef.current.focus();
      } else if (field === 'phone' && phoneInputRef.current) {
        phoneInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        phoneInputRef.current.focus();
      } else if (field === 'budget' && budgetInputRef.current) {
        budgetInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        budgetInputRef.current.focus();
      } else if (field === 'scope' && scopeTextareaRef.current) {
        scopeTextareaRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        scopeTextareaRef.current.focus();
      }

      const firstErrMsg = Object.values(validationResult.errors)[0];
      setError(firstErrMsg || 'Please fill in all mandatory fields with valid details.');
      return;
    }

    setFieldErrors({});
    setFormStatus('submitting');
    const cleanEmail = formState.email.trim().toLowerCase();
    const cleanPhone = Validation.sanitizePhone(formState.phone);
    const budget = Math.min(300000, Number(formState.budget));

    const sent = await requestOtp({
      email: cleanEmail,
      name: formState.name.trim(),
      phone: cleanPhone,
      budget: String(budget),
      scope: formState.scope.trim(),
      projectType: formState.projectType,
    });

    if (sent) {
      setFormStatus('otp');
    } else {
      setFormStatus('idle');
    }
  }, [formState, formStatus, getProjectThreshold, requestOtp]);

  const handleVerifyOtp = useCallback(async () => {
    setError('');
    const cleanEmail = formState.email.trim().toLowerCase();
    const cleanPhone = Validation.sanitizePhone(formState.phone);
    const rawBudget = parseInt(formState.budget, 10);
    const budget = !isNaN(rawBudget) && rawBudget > 0 ? Math.min(300000, rawBudget) : 0;

    await verifyOtp({
      name: formState.name.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      budget: String(budget),
      projectType: formState.projectType,
      scope: formState.scope.trim(),
    });
  }, [formState, verifyOtp]);

  return (
    <div className="flex flex-col items-center">
      <SEO
        title="VIRAT TOM Technologies | Custom Web & Mobile App Development Company in Hyderabad | ViratTom"
        description="VIRAT TOM Technologies (also known as Virat Tom, ViratTom) is a premier IT software development company in Hyderabad delivering custom web applications, scalable iOS & Android mobile apps, e-commerce platforms, and free ATS developer tools."
        keywords="VIRAT TOM Technologies, Virat Tom Technologies, Virat Tom, ViratTom, ViratTom Technologies, VIRATTOM, Virat Tom Website Development, Virat Tom App Development, Website Development Company in Hyderabad, Mobile App Development in Hyderabad, E-commerce Website Development, Custom Web Application Development, React Node.js Agency Hyderabad, Full Stack Developers India, Free ATS Resume Builder"
        canonical="https://virattom.com/"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            "@id": "https://virattom.com/#organization",
            "name": "VIRAT TOM Technologies",
            "alternateName": [
              "Virat Tom",
              "ViratTom",
              "Virat Tom Technologies",
              "ViratTom Technologies",
              "VIRATTOM",
              "Virat Tom Software Solutions"
            ],
            "legalName": "VIRAT TOM Technologies",
            "url": "https://virattom.com",
            "logo": "https://res.cloudinary.com/dfr0zghtc/image/upload/v1790404330/logo26_uyogzp.jpg",
            "image": "https://virattom.com/projects/inisio.png",
            "description": "VIRAT TOM Technologies is an enterprise IT software development company delivering custom web applications, cross-platform mobile solutions, and scalable developer tools in Hyderabad, Telangana, India.",
            "email": "contact@virattom.com",
            "telephone": "+91-96666-35009",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "ARC Property Solutions Pvt. Ltd., 2nd Floor, Plot no. 24 & 25, beside Kakatiya Hills, Guttala Begumpet, Jubilee Hills",
              "addressLocality": "Hyderabad",
              "addressRegion": "Telangana",
              "postalCode": "500081",
              "addressCountry": "IN"
            },
            "areaServed": ["Hyderabad", "Telangana", "India", "Worldwide"],
            "sameAs": [
              "https://github.com/SurajNyavanandi",
              "https://www.linkedin.com/in/suraj-nyavanandi-305962286",
              "https://www.instagram.com/virat.tom/",
              "https://twitter.com/virattom"
            ]
          },
          {
            "@context": "https://schema.org",
            "@type": "ProfessionalService",
            "@id": "https://virattom.com/#service",
            "name": "VIRAT TOM Technologies",
            "alternateName": [
              "Virat Tom Technologies",
              "Virat Tom Website Development",
              "Virat Tom App Development",
              "ViratTom Technologies"
            ],
            "url": "https://virattom.com",
            "logo": "https://res.cloudinary.com/dfr0zghtc/image/upload/v1790404330/logo26_uyogzp.jpg",
            "image": "https://virattom.com/projects/inisio.png",
            "description": "High-impact custom software engineering, scalable web application development, iOS & Android mobile applications, and full-stack cloud systems in Hyderabad, India.",
            "priceRange": "₹₹ - ₹₹₹₹",
            "telephone": "+91-96666-35009",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "ARC Property Solutions Pvt. Ltd., 2nd Floor, Plot no. 24 & 25, beside Kakatiya Hills, Guttala Begumpet, Jubilee Hills",
              "addressLocality": "Hyderabad",
              "addressRegion": "Telangana",
              "postalCode": "500081",
              "addressCountry": "IN"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": "17.4399",
              "longitude": "78.3908"
            },
            "openingHoursSpecification": {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
              "opens": "09:00",
              "closes": "20:00"
            }
          }
        ]}
      />
      {/* Hero Section with 21st.dev motion effects & distinct ambient backdrop */}
      <section className="w-full relative overflow-hidden bg-gradient-to-b from-[#F3F7FD] via-[#F9FBFE] to-white pt-16 pb-20 sm:pt-24 sm:pb-28 md:pt-32 md:pb-36 border-b border-apple-gray-200/50">
        {/* Ambient Top Glow & Radial Mesh */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[720px] max-w-full h-[380px] bg-gradient-to-b from-blue-400/12 via-indigo-400/5 to-transparent blur-3xl pointer-events-none rounded-full" />
        <div className="w-full max-w-360 px-4 sm:px-8 mx-auto text-center relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.12,
                  delayChildren: 0.05,
                },
              },
            }}
          >
            <motion.div
              variants={{
                hidden: { opacity: 0, y: -12, scale: 0.96 },
                visible: {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
                },
              }}
              className="mb-4 inline-flex items-center"
            >
              <Link
                to="/resume"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-apple-gray-200 text-apple-gray-600 hover:text-apple-black text-[13px] font-medium transition-all hover:scale-[1.02] hover:shadow-sm shadow-xs cursor-pointer group"
              >
                <FileText className="h-3.5 w-3.5 text-apple-blue transition-transform group-hover:scale-110" />
                <span>Free ATS Resume Builder</span>
                <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-md bg-apple-blue/10 text-apple-blue">
                  Free
                </span>
                <ArrowRight className="h-3 w-3 text-apple-blue transition-transform group-hover:translate-x-0.5" />
              </Link>
            </motion.div>
            <br />
            <motion.span
              variants={{
                hidden: { opacity: 0, y: 12 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
                },
              }}
              className="inline-block text-[13px] sm:text-[14px] font-medium tracking-widest text-apple-gray-500 uppercase"
            >
              VI
              <motion.span
                initial={{ y: -80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 180, damping: 14, delay: 0.2 }}
                className="inline-block font-semibold text-apple-blue"
              >
                R
              </motion.span>
              <motion.span
                initial={{ y: -80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 180, damping: 14, delay: 0.35 }}
                className="inline-block font-semibold text-apple-blue"
              >
                A
              </motion.span>
              T TO
              <motion.span
                initial={{ y: -80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 180, damping: 14, delay: 0.5 }}
                className="inline-block font-semibold text-apple-blue"
              >
                M
              </motion.span>
              {" "}TECHNOLOGIES
            </motion.span>
            <motion.h1
              variants={{
                hidden: { opacity: 0, y: 18 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
                },
              }}
              className="mt-4 text-[34px] xs:text-[40px] sm:text-[48px] md:text-[56px] font-semibold tracking-tight leading-[1.15] text-apple-black"
            >
              Website &amp; Mobile App Development
            </motion.h1>
            <motion.p
              variants={{
                hidden: { opacity: 0, y: 18 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
                },
              }}
              className="mt-4 sm:mt-5 mx-auto max-w-2xl text-[16px] sm:text-[19px] font-normal text-apple-gray-600 leading-relaxed"
            >
              We build modern, fast websites and mobile apps that help your business grow and reach more customers online.
            </motion.p>
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
                },
              }}
              className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full max-w-xs sm:max-w-none mx-auto"
            >
              <Button 
                className="w-full sm:w-auto h-12 rounded-xl text-[15px] font-medium transition-transform hover:scale-[1.02] active:scale-[0.98]" 
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Start a project <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button 
                variant="secondary" 
                className="w-full sm:w-auto h-12 rounded-xl text-[15px] font-medium transition-transform hover:scale-[1.02] active:scale-[0.98]"
                onClick={() => (document.getElementById('projects') || document.getElementById('work'))?.scrollIntoView({ behavior: 'smooth' })}
              >
                View work
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Infinite Smooth Tech Stack Marquee */}
      <TechStackMarquee />

      {/* Features Grid - What We Build (Distinct soft backdrop & zig-zag motion) */}
      <section id="process" className="w-full py-20 sm:py-28 bg-[#F4F4F7] border-b border-apple-gray-200/80 relative">
        <div id="services" className="absolute -top-16 left-0" />
        <div className="mx-auto max-w-360 px-4 sm:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-14 sm:mb-16"
          >
            <h2 className="text-[28px] sm:text-[38px] font-semibold tracking-tight text-apple-black">
              What We Build
            </h2>
            <p className="mt-2 text-[15px] sm:text-[16px] font-normal text-apple-gray-600">
              Clear, simple solutions tailored for every business need.
            </p>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.09,
                },
              },
            }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
          >
            {[
              {
                icon: Code,
                title: 'Static Websites',
                desc: 'Simple, fast websites for businesses, clinics, and personal portfolios with instant WhatsApp buttons.',
              },
              {
                icon: Zap,
                title: 'Dynamic Websites',
                desc: 'Interactive websites with customer logins, membership portals, and automated databases.',
              },
              {
                icon: Smartphone,
                title: 'Mobile Apps',
                desc: 'Installable smartphone apps for Android phones and Apple iPhones with push notifications.',
              },
              {
                icon: Shield,
                title: 'Online Stores (E-Commerce)',
                desc: 'Shopping websites with product catalogs, shopping carts, and direct UPI or card payments.',
              },
              {
                icon: CheckCircle,
                title: 'Super Fast Loading',
                desc: 'Every page opens in 1 second, optimized for mobile phones and low data connections.',
              },
              {
                icon: ArrowRight,
                title: 'Plain English & Support',
                desc: 'Zero confusing developer jargon. We guide you step-by-step and handle all maintenance.',
              },
            ].map((service, index) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={index}
                  variants={{
                    hidden: { 
                      opacity: 0, 
                      y: index % 2 === 0 ? 26 : 34, 
                      x: index % 3 === 0 ? -6 : index % 3 === 2 ? 6 : 0 
                    },
                    visible: {
                      opacity: 1,
                      y: 0,
                      x: 0,
                      transition: {
                        duration: 0.52,
                        ease: [0.16, 1, 0.3, 1],
                      },
                    },
                  }}
                  whileHover={{ 
                    y: -6, 
                    transition: { duration: 0.22, ease: "easeOut" } 
                  }}
                  className="group rounded-2xl bg-white p-7 border border-apple-gray-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_32px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col justify-start text-left cursor-default"
                >
                  <Icon className="h-6 w-6 text-apple-blue mb-4 stroke-[2.2] transition-transform duration-300 group-hover:scale-110" />
                  <h3 className="text-[18px] sm:text-[19px] font-semibold text-apple-black mb-2 tracking-normal">
                    {service.title}
                  </h3>
                  <p className="text-[14px] font-normal text-apple-gray-600 leading-relaxed">
                    {service.desc}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Selected Works (Distinct clean white canvas with crisp borders) */}
      <section id="work" className="w-full py-20 sm:py-28 bg-[#FFFFFF] border-b border-apple-gray-200/60 relative">
        <div id="projects" className="absolute -top-16 left-0" />
        <div className="w-full max-w-360 px-4 sm:px-8 mx-auto">
        
        <motion.div 
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-center max-w-2xl mx-auto mb-12 sm:mb-16"
        >
          <span className="inline-block text-[12px] font-medium tracking-wider uppercase text-apple-blue mb-2">
            Selected Work
          </span>
          <h2 className="text-[28px] sm:text-[38px] font-semibold tracking-tight text-apple-black">
            Featured Deployments
          </h2>
          <p className="mt-2 text-[15px] sm:text-[16px] font-normal text-apple-gray-600">
            Real-world web platforms and mobile solutions engineered for performance, clarity, and scale.
          </p>
        </motion.div>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-apple-blue border-t-transparent" />
          </div>
        ) : (
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.08 },
              },
            }}
            className="grid grid-cols-1 md:grid-cols-2 gap-7 sm:gap-8"
          >
            {projects.map((project: any) => {
              const projectUrl =
                (project.url && project.url.includes('prosyncweb.vercel.app')
                  ? 'https://prosyncindia.com'
                  : project.url) ||
                (project.title === 'ProSync Web' || project.title === 'ProSync'
                  ? 'https://prosyncindia.com'
                  : project.title === 'Mana Drivers'
                  ? 'https://manadrivers.com'
                  : project.title === 'Prosync Consulting'
                  ? 'https://prosyncindia.vercel.app/'
                  : project.title === 'RVM Carry Bags'
                  ? 'https://rvmcarrybags.com/'
                  : project.title === 'Inisio'
                  ? 'https://inisio.vercel.app/'
                  : 'https://urbanico.vercel.app/');

              const displayDomain = projectUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');

              return (
                <motion.a 
                  key={project._id} 
                  href={projectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
                    },
                  }}
                  whileHover={{ y: -4, transition: { duration: 0.2, ease: "easeOut" } }}
                  className="group flex flex-col justify-between overflow-hidden rounded-2xl bg-white border border-apple-gray-200/80 transition-all duration-300 hover:border-apple-gray-300 hover:shadow-[0_12px_28px_rgba(0,0,0,0.06)] text-left focus:outline-none focus:ring-2 focus:ring-apple-blue"
                >
                  <div>
                    {/* Live Interactive Sandbox Desktop iFrame (Micro-Viewport CSS Scaling) */}
                    <LiveWebsitePreview url={projectUrl} title={project.title} />

                    {/* Metadata & Description */}
                    <div className="p-5 sm:p-6">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-apple-gray-100 text-apple-gray-700">
                          {project.type}
                        </span>
                        <span className="text-[12px] text-apple-gray-500 font-mono font-normal truncate">
                          {displayDomain}
                        </span>
                      </div>

                      <h3 className="text-[18px] sm:text-[20px] font-semibold text-apple-black group-hover:text-apple-blue transition-colors flex items-center justify-between gap-1 mt-1">
                        <span>{project.title}</span>
                        <ArrowUpRight className="h-4 w-4 text-apple-gray-400 group-hover:text-apple-blue transition-colors shrink-0" />
                      </h3>

                      {project.description && (
                        <p className="mt-2 text-[13.5px] font-normal text-apple-gray-600 leading-relaxed line-clamp-2">
                          {project.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Clean Footer Link */}
                  <div className="px-5 sm:px-6 pb-5 pt-3 mt-auto flex items-center justify-between text-[12.5px] font-medium text-apple-blue border-t border-apple-gray-100/60">
                    <span className="group-hover:underline">Explore Website</span>
                    <ArrowRight className="h-3.5 w-3.5 transform transition-transform group-hover:translate-x-1" />
                  </div>
                </motion.a>
              );
            })}
          </motion.div>
        )}
        </div>
      </section>

      {/* Editorial Philosophy Quote - Steve Jobs (Distinct serene backdrop) */}
      <section className="w-full py-16 sm:py-24 bg-[#F8F9FB] border-b border-apple-gray-200/70 relative">
        <div className="w-full max-w-4xl px-4 sm:px-8 mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative overflow-hidden rounded-3xl bg-white border border-apple-gray-200/90 p-8 sm:p-12 text-center shadow-[0_4px_24px_rgba(0,0,0,0.03)]"
          >
            {/* Subtle Stylized Quotation Mark */}
            <span
              aria-hidden="true"
              className="block select-none text-[56px] sm:text-[72px] leading-none font-serif text-apple-gray-300/50 -mb-4 sm:-mb-7 font-light"
            >
              “
            </span>

            {/* The Quote Statement - Simple, sleek & clean */}
            <blockquote className="relative z-10 max-w-2xl mx-auto">
              <p className="text-[19px] sm:text-[24px] md:text-[26px] font-medium tracking-normal text-apple-black leading-[1.38] text-balance">
                The only way to do great work is to love what you do.
              </p>
            </blockquote>

            {/* Attribution & Steve Jobs Photo Avatar */}
            <div className="mt-7 sm:mt-8 flex items-center justify-center gap-3.5 pt-5 border-t border-apple-gray-200/70 max-w-xs mx-auto">
              <div className="relative h-13 w-13 rounded-full overflow-hidden border-2 border-apple-gray-300 shadow-sm ring-2 ring-white/90 shrink-0 bg-apple-gray-100">
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRulqeXqeMGnWwu4nQYub6_8RwF7cFK_-725lb_K9fsiVZSmQ1MTmIbwoik&amp;s=10"
                  alt="Steve Jobs"
                  loading="lazy"
                  className="h-full w-full object-cover object-center"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/steve-jobs.svg';
                  }}
                />
              </div>
              <div className="text-left">
                <div className="text-[15px] font-semibold text-apple-black tracking-normal leading-tight">
                  Steve Jobs
                </div>
                <div className="text-[12px] text-apple-gray-500 font-normal leading-tight mt-0.5">
                  Co-founder, Apple Inc.
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section (Distinct soft gray backdrop) */}
      <section id="pricing" className="w-full py-20 sm:py-28 bg-[#EFF1F5] border-b border-apple-gray-200/80 relative">
        <div className="mx-auto max-w-360 px-4 sm:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-14 sm:mb-16"
          >
            <h2 className="text-[28px] sm:text-[38px] font-semibold tracking-tight text-apple-black">
              Pricing & Services
            </h2>
            <p className="mt-2 text-[15px] sm:text-[16px] font-normal text-apple-gray-600 max-w-xl mx-auto">
              Every project is unique. Pick the plan that fits your business to request a customized quote.
            </p>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.08,
                },
              },
            }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
          >
            {/* Static Website */}
            <motion.div 
              variants={{
                hidden: { opacity: 0, y: 24 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.5,
                    ease: [0.16, 1, 0.3, 1],
                  },
                },
              }}
              whileHover={{ 
                y: -6, 
                transition: { duration: 0.22, ease: "easeOut" } 
              }}
              className="bg-white p-7 sm:p-8 rounded-2xl text-center flex flex-col h-full border border-apple-gray-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_32px_rgba(0,0,0,0.08)] transition-shadow duration-300"
            >
              <div className="inline-block mx-auto mb-3 px-3 py-1 rounded-full text-[12px] font-medium bg-apple-blue/10 text-apple-blue">
                Easiest to Start
              </div>
              <h3 className="text-[19px] sm:text-[21px] font-semibold mb-1 text-apple-black">Static Website</h3>
              <p className="text-[14px] text-apple-gray-500 mb-6">Simple 1 to 5 Page Website with WhatsApp Chat</p>
              <div className="text-[22px] font-semibold mb-2 text-apple-black">Custom Quote</div>
              <p className="text-[12px] text-apple-gray-500 mb-6">Tailored to your needs • Direct collaboration</p>
              <ul className="space-y-3.5 mb-8 text-left text-[14px] flex-1 text-apple-black">
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-apple-blue shrink-0" /> Simple business brochure / visiting card</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-apple-blue shrink-0" /> 1-tap WhatsApp message button</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-apple-blue shrink-0" /> Fast loading on all mobile phones</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-apple-blue shrink-0" /> Google search (SEO) ready</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-apple-blue shrink-0" /> Dedicated 1-on-1 support & updates</li>
              </ul>
              <Button onClick={() => {
                setFormState({...formState, projectType: 'Static Website'});
                document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
              }} className="w-full mt-auto" variant="outline">Choose Static Website</Button>
            </motion.div>

            {/* Dynamic Website */}
            <motion.div 
              variants={{
                hidden: { opacity: 0, y: 24 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.5,
                    ease: [0.16, 1, 0.3, 1],
                  },
                },
              }}
              whileHover={{ 
                y: -6, 
                transition: { duration: 0.22, ease: "easeOut" } 
              }}
              className="bg-white p-7 sm:p-8 rounded-2xl text-center flex flex-col h-full border border-apple-gray-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_32px_rgba(0,0,0,0.08)] transition-shadow duration-300"
            >
              <div className="inline-block mx-auto mb-3 px-3 py-1 rounded-full text-[12px] font-medium bg-apple-blue/10 text-apple-blue">
                For Portals & Logins
              </div>
              <h3 className="text-[19px] sm:text-[21px] font-semibold mb-1 text-apple-black">Dynamic Website</h3>
              <p className="text-[14px] text-apple-gray-500 mb-6">Interactive Website with User Logins & Database</p>
              <div className="text-[22px] font-semibold mb-2 text-apple-black">Custom Quote</div>
              <p className="text-[12px] text-apple-gray-500 mb-6">Tailored to your needs • Database included</p>
              <ul className="space-y-3.5 mb-8 text-left text-[14px] flex-1 text-apple-black">
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-apple-blue shrink-0" /> User accounts & password login</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-apple-blue shrink-0" /> Database that saves customer or student data</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-apple-blue shrink-0" /> Admin panel to edit info anytime</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-apple-blue shrink-0" /> Interactive search & forms</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-apple-blue shrink-0" /> Milestone-based progress with live preview links</li>
              </ul>
              <Button onClick={() => {
                setFormState({...formState, projectType: 'Dynamic Website'});
                document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
              }} className="w-full mt-auto" variant="outline">Choose Dynamic Website</Button>
            </motion.div>

            {/* Online Store (E-Commerce) */}
            <motion.div 
              variants={{
                hidden: { opacity: 0, y: 24 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.5,
                    ease: [0.16, 1, 0.3, 1],
                  },
                },
              }}
              whileHover={{ 
                y: -6, 
                transition: { duration: 0.22, ease: "easeOut" } 
              }}
              className="bg-white p-7 sm:p-8 rounded-2xl text-center flex flex-col h-full border border-apple-gray-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_32px_rgba(0,0,0,0.08)] transition-shadow duration-300"
            >
              <div className="inline-block mx-auto mb-3 px-3 py-1 rounded-full text-[12px] font-medium bg-apple-blue/10 text-apple-blue">
                Sell Products Online
              </div>
              <h3 className="text-[19px] sm:text-[21px] font-semibold mb-1 text-apple-black">Online Store</h3>
              <p className="text-[14px] text-apple-gray-500 mb-6">Website to Sell Products with Shopping Cart</p>
              <div className="text-[22px] font-semibold mb-2 text-apple-black">Custom Quote</div>
              <p className="text-[12px] text-apple-gray-500 mb-6">Tailored to your needs • Orders & Payments</p>
              <ul className="space-y-3.5 mb-8 text-left text-[14px] flex-1 text-apple-black">
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-apple-blue shrink-0" /> Product catalog with photos & prices</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-apple-blue shrink-0" /> Shopping cart & customer checkout</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-apple-blue shrink-0" /> Online payments (UPI, GPay, Cards)</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-apple-blue shrink-0" /> Order tracking & inventory manager</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-apple-blue shrink-0" /> End-to-end checkout & payment integration testing</li>
              </ul>
              <Button onClick={() => {
                setFormState({...formState, projectType: 'Online Store'});
                document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
              }} className="w-full mt-auto" variant="outline">Choose Online Store</Button>
            </motion.div>

            {/* Mobile App */}
            <motion.div 
              variants={{
                hidden: { opacity: 0, y: 24 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.5,
                    ease: [0.16, 1, 0.3, 1],
                  },
                },
              }}
              whileHover={{ 
                y: -6, 
                transition: { duration: 0.22, ease: "easeOut" } 
              }}
              className="bg-white p-7 sm:p-8 rounded-2xl text-center flex flex-col h-full border border-apple-gray-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_32px_rgba(0,0,0,0.08)] transition-shadow duration-300"
            >
              <div className="inline-block mx-auto mb-3 px-3 py-1 rounded-full text-[12px] font-medium bg-apple-blue/10 text-apple-blue">
                For Smartphones
              </div>
              <h3 className="text-[19px] sm:text-[21px] font-semibold mb-1 text-apple-black">Mobile App</h3>
              <p className="text-[14px] text-apple-gray-500 mb-6">Smartphone App for Android & iPhone</p>
              <div className="text-[22px] font-semibold mb-2 text-apple-black">Custom Quote</div>
              <p className="text-[12px] text-apple-gray-500 mb-6">Tailored to your needs • App Stores ready</p>
              <ul className="space-y-3.5 mb-8 text-left text-[14px] flex-1 text-apple-black">
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-apple-blue shrink-0" /> Installable app for Android & iPhone</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-apple-blue shrink-0" /> Daily phone push notifications</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-apple-blue shrink-0" /> Smooth touch gestures & offline mode</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-apple-blue shrink-0" /> Assistance publishing on App Stores</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-apple-blue shrink-0" /> Multi-device responsiveness & app store compliance</li>
              </ul>
              <Button onClick={() => {
                setFormState({...formState, projectType: 'Mobile App'});
                document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
              }} className="w-full mt-auto" variant="outline">Choose Mobile App</Button>
            </motion.div>

            {/* Website + Mobile App */}
            <motion.div 
              variants={{
                hidden: { opacity: 0, y: 24 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.5,
                    ease: [0.16, 1, 0.3, 1],
                  },
                },
              }}
              whileHover={{ 
                y: -6, 
                transition: { duration: 0.22, ease: "easeOut" } 
              }}
              className="bg-apple-black text-white p-7 sm:p-8 rounded-2xl text-center flex flex-col h-full md:col-span-2 lg:col-span-2 border border-[#38383A] shadow-xl hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] transition-shadow duration-300 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 bg-apple-blue text-[11px] font-semibold px-3 py-1 rounded-bl-lg">POPULAR ALL-IN-ONE</div>
              <h3 className="text-[19px] sm:text-[21px] font-semibold mb-1 text-white">Website + Mobile App</h3>
              <p className="text-[14px] text-gray-400 mb-6">Complete Digital Presence: Website & Phone App Combined</p>
              <div className="text-[22px] font-semibold mb-2 text-white">Custom Quote</div>
              <p className="text-[12px] text-gray-400 mb-6">Tailored to your needs • All-in-one package</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 text-left text-[14px]">
                <ul className="space-y-3.5">
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-apple-blue shrink-0" /> Website and Phone App synced together</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-apple-blue shrink-0" /> Single admin panel manages both</li>
                </ul>
                <ul className="space-y-3.5">
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-apple-blue shrink-0" /> Reach customers on computer & mobile phones</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-apple-blue shrink-0" /> Priority guidance & VIP ongoing support</li>
                </ul>
              </div>
              <Button onClick={() => {
                setFormState({...formState, projectType: 'Website + Mobile App'});
                document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
              }} className="w-full mt-auto bg-apple-blue text-white hover:bg-blue-600 border-none font-medium">
                Start Complete Combo Project
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Application Gate (Distinct radiant background) */}
      <section id="contact" className="w-full py-20 sm:py-28 bg-gradient-to-b from-[#FFFFFF] via-[#F8F9FA] to-white border-t border-apple-gray-200/80 relative">
        <div className="mx-auto max-w-150 px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-[26px] sm:text-[32px] font-semibold tracking-tight text-apple-black">Start a Project</h2>
            <p className="mt-2 sm:mt-3 text-[14px] sm:text-[15px] font-normal text-apple-gray-600">
              Tell us about your requirements to get started.
            </p>
          </div>

          <Card className="p-5 sm:p-8 rounded-2xl border border-apple-gray-200">
            {routingNotice && formStatus !== 'success' && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-800 text-[13px] flex items-center justify-between gap-3 shadow-2xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-6 w-6 rounded-full bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <MessageCircle className="h-3.5 w-3.5 fill-current" />
                  </div>
                  <span className="font-medium">{routingNotice}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setRoutingNotice(null)}
                  className="text-emerald-700 hover:text-emerald-900 text-[18px] leading-none px-1.5 cursor-pointer"
                  title="Dismiss"
                  aria-label="Dismiss notice"
                >
                  ×
                </button>
              </motion.div>
            )}

            {formStatus === 'success' ? (
              <div className="py-6 sm:py-8 text-center animate-in fade-in zoom-in-95 duration-300">
                <div className="mx-auto h-14 w-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center justify-center mb-4 shadow-xs">
                  <CheckCircle className="h-8 w-8 text-emerald-500" />
                </div>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 text-[12px] font-semibold tracking-wide uppercase mb-3">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Application Verified & Received
                </span>

                <h3 className="text-[22px] sm:text-[26px] font-semibold text-apple-black mb-2 tracking-tight">
                  Thank you, {submittedLead?.name || formState.name}!
                </h3>
                <p className="text-[14px] sm:text-[15px] text-apple-gray-500 max-w-lg mx-auto mb-6 leading-relaxed">
                  Your project requirements have been verified and saved. Our engineering leads have received your details and will get in touch with you directly.
                </p>

                {/* Submitted Lead Summary Box with Masked Contact */}
                <div className="max-w-md mx-auto mb-6 p-4 rounded-xl bg-apple-gray-100/70 border border-apple-gray-200/80 text-left text-[13px] space-y-2">
                  <div className="flex items-center justify-between text-apple-gray-500">
                    <span>Project Type:</span>
                    <strong className="text-apple-black font-semibold">{submittedLead?.projectType || formState.projectType}</strong>
                  </div>
                  <div className="flex items-center justify-between text-apple-gray-500">
                    <span>Estimated Budget:</span>
                    <strong className="text-apple-black font-semibold">
                      ₹{Number(submittedLead?.budget || formState.budget || 0).toLocaleString('en-IN')}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between text-apple-gray-500">
                    <span>Verified Contact:</span>
                    <span className="text-apple-black font-medium">
                      {maskPhone(submittedLead?.phone || formState.phone)} • {maskEmail(submittedLead?.email || formState.email)}
                    </span>
                  </div>
                  {Boolean(submittedLead?.scope || formState.scope) && (
                    <div className="pt-1.5 border-t border-apple-gray-200 text-apple-gray-600">
                      <span className="text-[12px] text-apple-gray-400 block mb-0.5">Project Scope:</span>
                      <p className="line-clamp-2 text-[12.5px] italic text-apple-gray-700">
                        "{submittedLead?.scope || formState.scope}"
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex justify-center pt-3 border-t border-apple-gray-200/60">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setFormStatus('idle');
                      setFormState({ name: '', email: '', phone: '', budget: '', scope: '', projectType: 'Static Website' });
                      setSubmittedLead(null);
                    }}
                    className="rounded-xl text-[13px] h-9"
                  >
                    Submit Another Inquiry
                  </Button>
                </div>
              </div>
            ) : formStatus === 'otp' ? (
              <OtpVerificationView
                recipient={formState.email}
                type="email"
                otp={otp}
                inputRefs={inputRefs}
                onDigitChange={setOtpDigit}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                onVerify={handleVerifyOtp}
                onResend={handleApply as any}
                onCancel={() => {
                  setFormStatus('idle');
                  resetOtp();
                  setError('');
                }}
                isVerifying={isOtpVerifying}
                isRequesting={isOtpRequesting}
                countdown={countdown}
                canResend={canResend}
                error={error || otpHookError}
              />
            ) : (
              <form onSubmit={handleApply} className="space-y-5" noValidate>
                {/* 1. Project Type (Mandatory) */}
                <div ref={projectTypeRef}>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-[14px] font-semibold text-apple-black">
                      Project Type <span className="text-apple-red">*</span>
                    </label>
                  </div>
                  <div className="space-y-2.5">
                    {[
                      { id: 'Static Website', label: 'Static Website', desc: 'Simple informational site with WhatsApp button' },
                      { id: 'Dynamic Website', label: 'Dynamic Website', desc: 'Interactive site with user logins & database' },
                      { id: 'Online Store', label: 'Online Store', desc: 'Sell products with shopping cart & payments' },
                      { id: 'Mobile App', label: 'Mobile App', desc: 'Smartphone app for Android & iPhone' },
                      { id: 'Website + Mobile App', label: 'Website + Mobile App', desc: 'Complete package: Website & phone app together' }
                    ].map((type) => {
                      const isSelected = formState.projectType === type.id;
                      return (
                        <div 
                          key={type.id}
                          onClick={() => {
                            handleFieldChange('projectType', type.id);
                          }}
                          className={`cursor-pointer rounded-xl p-3.5 border transition-all flex items-start gap-3.5 ${
                            isSelected 
                              ? 'border-apple-blue bg-apple-blue/5 shadow-sm ring-1 ring-apple-blue/20' 
                              : fieldErrors.projectType
                              ? 'border-apple-red/60 bg-white hover:border-apple-red'
                              : 'border-apple-gray-200 bg-white hover:border-apple-gray-400'
                          }`}
                        >
                          <div className={`mt-0.5 h-4 w-4 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                            isSelected ? 'border-apple-blue bg-apple-blue' : 'border-apple-gray-400'
                          }`}>
                            {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`text-[15px] font-semibold ${isSelected ? 'text-apple-blue' : 'text-apple-black'}`}>
                              {type.label}
                            </div>
                            <div className="text-[13px] text-apple-gray-500 mt-0.5">
                              {type.desc}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {fieldErrors.projectType && (
                    <p className="text-[12px] text-apple-red mt-1.5 flex items-center gap-1.5 font-medium animate-in fade-in">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      {fieldErrors.projectType}
                    </p>
                  )}
                </div>

                {/* 2. Full Name (Mandatory) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[14px] font-medium text-apple-black">
                      Full Name <span className="text-apple-red">*</span>
                    </label>
                  </div>
                  <Input 
                    ref={nameInputRef}
                    type="text" 
                    required 
                    placeholder="e.g. Shree Rama"
                    value={formState.name} 
                    onChange={e => handleFieldChange('name', e.target.value)} 
                    onBlur={() => handleFieldBlur('name')}
                    className={`rounded-xl transition-all ${
                      fieldErrors.name 
                        ? 'border-apple-red focus:border-apple-red focus:ring-apple-red/20 ring-1 ring-apple-red/20' 
                        : ''
                    }`}
                  />
                  {fieldErrors.name && (
                    <p className="text-[12px] text-apple-red mt-1.5 flex items-center gap-1.5 font-medium animate-in fade-in">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      {fieldErrors.name}
                    </p>
                  )}
                </div>

                {/* 3. Email Address (Mandatory) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[14px] font-medium text-apple-black">
                      Email Address <span className="text-apple-red">*</span>
                    </label>
                  </div>
                  <Input 
                    ref={emailInputRef}
                    type="email" 
                    required 
                    placeholder="e.g. yourname@company.com"
                    value={formState.email} 
                    onChange={e => handleFieldChange('email', e.target.value)} 
                    onBlur={() => handleFieldBlur('email')}
                    className={`rounded-xl transition-all ${
                      fieldErrors.email 
                        ? 'border-apple-red focus:border-apple-red focus:ring-apple-red/20 ring-1 ring-apple-red/20' 
                        : ''
                    }`}
                  />
                  {fieldErrors.email && (
                    <p className="text-[12px] text-apple-red mt-1.5 flex items-center gap-1.5 font-medium animate-in fade-in">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      {fieldErrors.email}
                    </p>
                  )}
                </div>

                {/* 4. Mobile Number (Mandatory, 10-digit Indian) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[14px] font-medium text-apple-black">
                      Mobile Number <span className="text-apple-red">*</span>
                    </label>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[14px] text-apple-gray-400 font-medium z-10 pointer-events-none">
                      +91
                    </span>
                    <Input 
                      ref={phoneInputRef}
                      type="tel" 
                      required 
                      maxLength={10}
                      placeholder="10-digit mobile number"
                      className={`pl-12 rounded-xl transition-all ${
                        fieldErrors.phone
                          ? 'border-apple-red focus:border-apple-red focus:ring-apple-red/20 ring-1 ring-apple-red/20'
                          : ''
                      }`}
                      value={formState.phone} 
                      onChange={e => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                        handleFieldChange('phone', val);
                      }} 
                      onBlur={() => handleFieldBlur('phone')}
                    />
                  </div>
                  {fieldErrors.phone ? (
                    <p className="text-[12px] text-apple-red mt-1.5 flex items-center gap-1.5 font-medium animate-in fade-in">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      {fieldErrors.phone}
                    </p>
                  ) : (
                    <p className="text-[11.5px] text-apple-gray-400 mt-1">
                      Enter your 10-digit Indian WhatsApp or calling number.
                    </p>
                  )}
                </div>

                {/* 5. Estimated Budget (Mandatory, positive number) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[14px] font-medium text-apple-black">
                      Estimated Budget (INR) <span className="text-apple-red">*</span>
                    </label>
                  </div>
                  <Input 
                    ref={budgetInputRef}
                    type="number" 
                    required 
                    max="3000000"
                    placeholder="Enter estimated budget"
                    value={formState.budget} 
                    onChange={e => {
                      const val = e.target.value;
                      if (val === '') {
                        handleFieldChange('budget', '');
                      } else {
                        const num = Number(val);
                        if (!isNaN(num) && num > 3000000) {
                          handleFieldChange('budget', '3000000');
                        } else {
                          handleFieldChange('budget', val);
                        }
                      }
                    }} 
                    onBlur={() => handleFieldBlur('budget')}
                    className={`rounded-xl transition-all ${
                      fieldErrors.budget 
                        ? 'border-apple-red focus:border-apple-red focus:ring-apple-red/20 ring-1 ring-apple-red/20' 
                        : ''
                    }`}
                  />
                  {fieldErrors.budget && (
                    <p className="text-[12px] text-apple-red mt-1.5 flex items-center gap-1.5 font-medium animate-in fade-in">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      {fieldErrors.budget}
                    </p>
                  )}
                </div>

                {/* 6. Project Scope / Requirements (Optional) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[14px] font-medium text-apple-black">
                      Project Scope / Requirements <span className="text-apple-gray-400 font-normal text-[12px]">(Optional)</span>
                    </label>
                  </div>
                  <textarea 
                    ref={scopeTextareaRef}
                    className={`flex min-h-24 w-full rounded-xl border bg-white px-3.5 py-2.5 text-[15px] placeholder:text-apple-gray-400 focus-visible:outline-none focus-visible:ring-2 leading-relaxed transition-all ${
                      fieldErrors.scope 
                        ? 'border-apple-red focus-visible:ring-apple-red/20 ring-1 ring-apple-red/20' 
                        : 'border-apple-gray-300 focus-visible:ring-apple-blue'
                    }`}
                    placeholder="Describe what features you need, pages, timeline, or business goals (optional)..."
                    value={formState.scope}
                    onChange={e => handleFieldChange('scope', e.target.value)}
                    onBlur={() => handleFieldBlur('scope')}
                  />
                  {fieldErrors.scope && (
                    <p className="text-[12px] text-apple-red mt-1.5 flex items-center gap-1.5 font-medium animate-in fade-in">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      {fieldErrors.scope}
                    </p>
                  )}
                </div>

                {(error || otpHookError) && (
                  <p className="text-[13px] text-apple-red text-center bg-apple-red/10 p-3 rounded-xl border border-apple-red/20 font-medium flex items-center justify-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error || otpHookError}</span>
                  </p>
                )}

                <Button 
                  type="submit" 
                  className="w-full h-11 rounded-xl text-[14px] font-medium shadow-sm transition-all" 
                  isLoading={formStatus === 'submitting'}
                  disabled={formStatus === 'submitting'}
                >
                  {formStatus === 'submitting' ? 'Validating & Verifying...' : 'Verify Email & Send Requirements'}
                </Button>
              </form>
            )}
          </Card>
        </div>
      </section>
    </div>
  );
};
