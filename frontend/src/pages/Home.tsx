import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { ArrowRight, Code, Smartphone, Zap, Shield, CheckCircle, Mail, ExternalLink, FileText, MessageCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { getMinPrice, getVerifiedWhatsAppUrl, safeFetchJson, PROJECT_MIN_PRICES } from '@/lib/utils';
import { Validation } from '@/lib/validation';
import { useOtpVerification } from '@/hooks/useOtpVerification';
import { OtpVerificationView } from '@/components/ui/OtpVerificationView';
import { SEO } from '@/components/seo/SEO';
import { TechStackMarquee } from '@/components/common/TechStackMarquee';
import { DEFAULT_PORTFOLIO_PROJECTS, type PortfolioProject } from '@/types';

export const Home = () => {
  const location = useLocation();
  const [projects, setProjects] = useState<PortfolioProject[]>(DEFAULT_PORTFOLIO_PROJECTS);
  const [loading, setLoading] = useState(false);
  const [projectPrices, setProjectPrices] = useState<Record<string, number>>(PROJECT_MIN_PRICES);
  const [formState, setFormState] = useState({ 
    name: '', 
    email: '', 
    phone: '', 
    budget: '', 
    scope: '', 
    projectType: 'Static Website' 
  });
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
        setProjects(res.data);
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
    return projectPrices[type] || PROJECT_MIN_PRICES[type] || 4999;
  }, [projectPrices]);

  const isPhoneValid = Boolean(
    formState.phone.length === 10 &&
    ['6', '7', '8', '9'].includes(formState.phone[0]) &&
    !/^(\d)\1{9}$/.test(formState.phone) &&
    !['0123456789', '1234567890', '0987654321', '9876543210'].includes(formState.phone)
  );

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

  const handleApply = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanEmail = formState.email.trim().toLowerCase();
    if (!Validation.isValidEmail(cleanEmail)) {
      setError('Please enter a valid email address to receive your verification code.');
      return;
    }

    const cleanPhone = Validation.sanitizePhone(formState.phone);
    if (!Validation.isValidPhone(cleanPhone)) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    
    const rawBudget = parseInt(formState.budget, 10);
    const minThreshold = getProjectThreshold(formState.projectType);
    if (isNaN(rawBudget) || rawBudget <= 0) {
      setError('Please enter your estimated budget.');
      return;
    }

    if (rawBudget < minThreshold) {
      setError(`Minimum budget is ₹${minThreshold.toLocaleString('en-IN')}`);
      return;
    }

    const budget = Math.min(300000, rawBudget);

    setFormStatus('submitting');
    const sent = await requestOtp({
      email: cleanEmail,
      name: formState.name.trim(),
      phone: cleanPhone,
      budget: String(budget),
      scope: formState.scope,
      projectType: formState.projectType,
    });

    if (sent) {
      setFormStatus('otp');
    } else {
      setFormStatus('idle');
    }
  }, [formState, requestOtp]);

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
      scope: formState.scope,
    });
  }, [formState, verifyOtp]);

  return (
    <div className="flex flex-col items-center">
      <SEO
        title="ViratTom Technologies | Custom Web & Mobile App Development Company | Enterprise Software Solutions"
        description="ViratTom Technologies is an IT software engineering company delivering scalable web applications, mobile apps (iOS & Android), custom SaaS platforms, and free ATS career tools."
        keywords="Custom Software Development Company, Full Stack Web Development Services, Hire Mobile App Developers, React Node.js Agency India, Enterprise SaaS Engineering, Web App Development Company, ViratTom Technologies"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "ProfessionalService",
          "name": "ViratTom Technologies",
          "url": "https://virattom.com",
          "logo": "https://res.cloudinary.com/dfr0zghtc/image/upload/v1790404330/logo26_uyogzp.jpg",
          "image": "https://virattom.com/projects/inisio.png",
          "description": "Enterprise IT software engineering company delivering full-stack web applications, iOS and Android mobile software, and digital cloud platforms.",
          "telephone": "+91-96666-35009",
          "email": "contact@virattom.com",
          "priceRange": "$$$",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "ARC Property Solutions Pvt. Ltd., 2nd Floor, Plot no, 24 & 25, Lane, beside Kakatiya Hills, Kakatiya Hills, Guttala_Begumpet, Kamaan, Jubilee Hills",
            "addressLocality": "Hyderabad",
            "addressRegion": "Telangana",
            "postalCode": "500081",
            "addressCountry": "IN"
          },
          "serviceArea": "Worldwide"
        }}
      />
      {/* Hero Section */}
      <section className="w-full max-w-360 px-4 sm:px-8 py-16 sm:py-24 text-center md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-4 inline-flex items-center">
            <Link
              to="/resume"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-apple-gray-200 text-apple-gray-600 hover:text-apple-black text-[13px] font-medium transition-all hover:scale-[1.01] shadow-xs cursor-pointer"
            >
              <FileText className="h-3.5 w-3.5 text-apple-blue" />
              <span>Free ATS Resume Builder</span>
              <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-md bg-apple-blue/10 text-apple-blue">
                Free
              </span>
              <ArrowRight className="h-3 w-3 text-apple-blue" />
            </Link>
          </div>
          <br />
          <span className="text-[12px] sm:text-[14px] font-semibold tracking-widest text-apple-gray-500 uppercase">
            VI<span className="font-bold text-apple-blue">R</span>
            <span className="font-bold text-apple-blue">A</span>T TO
            <span className="font-bold text-apple-blue">M</span> TECHNOLOGIES
          </span>
          <h1 className="mt-4 text-[32px] xs:text-[38px] sm:text-[48px] md:text-[56px] font-bold tracking-[-0.03em] leading-[1.15]">
            Website & Mobile App Development
          </h1>
          <p className="mt-4 sm:mt-6 mx-auto max-w-2xl text-[16px] sm:text-[20px] text-apple-gray-500 leading-relaxed">
            We build modern, fast websites and mobile apps that help your business grow and reach more customers online.
          </p>
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full max-w-xs sm:max-w-none mx-auto">
            <Button 
              className="w-full sm:w-auto h-12 rounded-xl text-[15px]" 
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Start a project <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button 
              variant="secondary" 
              className="w-full sm:w-auto h-12 rounded-xl text-[15px]"
              onClick={() => (document.getElementById('projects') || document.getElementById('work'))?.scrollIntoView({ behavior: 'smooth' })}
            >
              View work
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Infinite Smooth Tech Stack Marquee */}
      <TechStackMarquee />

      {/* Features Grid - What We Build */}
      <section id="process" className="w-full py-20 sm:py-24 bg-[#F5F5F7] relative">
        <div id="services" className="absolute -top-16 left-0" />
        <div className="mx-auto max-w-360 px-4 sm:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-14 sm:mb-16"
          >
            <h2 className="text-[30px] sm:text-[36px] font-semibold tracking-[-0.02em] text-apple-black">
              What We Build
            </h2>
            <p className="mt-3 text-[15px] sm:text-[16px] text-apple-gray-500">
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
                  staggerChildren: 0.08,
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
                  className="group rounded-2xl bg-white p-7 border border-apple-gray-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_32px_rgba(0,0,0,0.08)] transition-shadow duration-300 flex flex-col justify-start text-left cursor-default"
                >
                  <Icon className="h-6 w-6 text-apple-blue mb-4 stroke-[2.2] transition-transform duration-300 group-hover:scale-110" />
                  <h3 className="text-[18px] sm:text-[19px] font-semibold text-apple-black mb-2 tracking-tight">
                    {service.title}
                  </h3>
                  <p className="text-[14px] text-apple-gray-500 leading-relaxed">
                    {service.desc}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Selected Works */}
      <section id="work" className="w-full max-w-360 px-4 sm:px-8 py-24 mx-auto relative">
        <div id="projects" className="absolute -top-16 left-0" />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <h2 className="text-[34px] font-semibold tracking-[-0.02em]">Selected Projects</h2>
        </motion.div>
        
        {loading ? (
          <div className="flex justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-apple-blue border-t-transparent" /></div>
        ) : (
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
            className="grid grid-cols-1 md:grid-cols-2 gap-10"
          >
            {projects.map((project: any) => {
              const projectUrl = project.url || (project.title === 'Inisio' ? 'https://inisio.vercel.app/' : 'https://urbanico.vercel.app/');
              return (
                <motion.a 
                  key={project._id} 
                  href={projectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
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
                  className="group relative block overflow-hidden rounded-2xl bg-white border border-apple-gray-200 shadow-sm hover:shadow-xl transition-shadow duration-300 text-left focus:outline-none focus:ring-2 focus:ring-apple-blue"
                >
                  <div className="aspect-16/10 overflow-hidden bg-apple-gray-100 relative">
                    <img 
                      src={project.imageUrl} 
                      alt={project.title} 
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" 
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[12px] font-medium text-apple-black flex items-center gap-1.5 shadow-sm opacity-90 group-hover:opacity-100 transition-opacity">
                      <span>Visit Live</span>
                      <ExternalLink className="h-3.5 w-3.5 text-apple-blue" />
                    </div>
                  </div>
                  <div className="p-7">
                    <div className="flex items-center justify-between mb-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-[12px] font-semibold bg-apple-blue/10 text-apple-blue">
                        {project.type}
                      </span>
                      <span className="text-[13px] text-apple-gray-400 font-mono flex items-center gap-1">
                        {projectUrl.replace('https://', '').replace('/', '')}
                      </span>
                    </div>
                    <h3 className="text-[22px] font-bold text-apple-black group-hover:text-apple-blue transition-colors flex items-center justify-between">
                      <span>{project.title}</span>
                      <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all transform -translate-x-2 group-hover:translate-x-0 text-apple-blue" />
                    </h3>
                    {project.description && (
                      <p className="mt-2 text-[14px] text-apple-gray-500">
                        {project.description}
                      </p>
                    )}
                  </div>
                </motion.a>
              );
            })}
          </motion.div>
        )}
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="w-full py-20 sm:py-24 bg-[#F5F5F7]">
        <div className="mx-auto max-w-360 px-4 sm:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-14 sm:mb-16"
          >
            <h2 className="text-[30px] sm:text-[36px] font-semibold tracking-[-0.02em] text-apple-black">
              Pricing & Services
            </h2>
            <p className="mt-3 text-[15px] sm:text-[16px] text-apple-gray-500">
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
              <h3 className="text-[20px] sm:text-[22px] font-bold mb-1 text-apple-black">Static Website</h3>
              <p className="text-[14px] text-apple-gray-500 mb-6">Simple 1 to 5 Page Website with WhatsApp Chat</p>
              <div className="text-[24px] font-bold mb-2 text-apple-black">Custom Quote</div>
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
              <h3 className="text-[20px] sm:text-[22px] font-bold mb-1 text-apple-black">Dynamic Website</h3>
              <p className="text-[14px] text-apple-gray-500 mb-6">Interactive Website with User Logins & Database</p>
              <div className="text-[24px] font-bold mb-2 text-apple-black">Custom Quote</div>
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
              <h3 className="text-[20px] sm:text-[22px] font-bold mb-1 text-apple-black">Online Store</h3>
              <p className="text-[14px] text-apple-gray-500 mb-6">Website to Sell Products with Shopping Cart</p>
              <div className="text-[24px] font-bold mb-2 text-apple-black">Custom Quote</div>
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
              <h3 className="text-[20px] sm:text-[22px] font-bold mb-1 text-apple-black">Mobile App</h3>
              <p className="text-[14px] text-apple-gray-500 mb-6">Smartphone App for Android & iPhone</p>
              <div className="text-[24px] font-bold mb-2 text-apple-black">Custom Quote</div>
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
              <div className="absolute top-0 right-0 bg-apple-blue text-[11px] font-bold px-3 py-1 rounded-bl-lg">POPULAR ALL-IN-ONE</div>
              <h3 className="text-[20px] sm:text-[22px] font-bold mb-1 text-white">Website + Mobile App</h3>
              <p className="text-[14px] text-gray-400 mb-6">Complete Digital Presence: Website & Phone App Combined</p>
              <div className="text-[24px] font-bold mb-2 text-white">Custom Quote</div>
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
              }} className="w-full mt-auto bg-apple-blue text-white hover:bg-blue-600 border-none">
                Start Complete Combo Project
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Application Gate */}
      <section id="contact" className="w-full py-16 sm:py-24 border-t border-apple-gray-200">
        <div className="mx-auto max-w-150 px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-[26px] sm:text-[34px] font-semibold tracking-[-0.02em]">Start a Project</h2>
            <p className="mt-2 sm:mt-4 text-[14px] sm:text-[16px] text-apple-gray-500">
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
                  Your project requirements have been verified and saved to our engineering queue. For fastest response, connect directly with our team on WhatsApp below.
                </p>

                {/* Submitted Lead Summary Box */}
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
                    <span className="text-apple-black font-medium">{submittedLead?.phone || formState.phone} • {submittedLead?.email || formState.email}</span>
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

                {/* Prominent Fast Response WhatsApp Button with Pre-filled Lead Details */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto mb-3">
                  <a
                    href={getVerifiedWhatsAppUrl(submittedLead || formState)}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-semibold text-[14.5px] shadow-sm hover:shadow-md hover:scale-[1.01] active:scale-95 transition-all cursor-pointer"
                  >
                    <MessageCircle className="h-5 w-5 fill-current" />
                    <span>Fast Response: Continue on WhatsApp</span>
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
                <p className="text-[11.5px] text-apple-gray-400 mb-6">
                  Pre-fills your verified project inquiry directly into WhatsApp for priority routing.
                </p>

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
              <form onSubmit={handleApply} className="space-y-5">
                <div>
                  <label className="block text-[14px] font-semibold mb-3">Project Type</label>
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
                            setFormState({...formState, projectType: type.id});
                            if (error) setError('');
                          }}
                          className={`cursor-pointer rounded-xl p-3.5 border transition-all flex items-start gap-3.5 ${
                            isSelected 
                              ? 'border-apple-blue bg-apple-blue/5 shadow-sm' 
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
                </div>

                <div>
                  <label className="block text-[14px] font-medium mb-1.5">Full Name</label>
                  <Input 
                    type="text" 
                    required 
                    placeholder="e.g. Shree Rama"
                    value={formState.name} 
                    onChange={e => setFormState({...formState, name: e.target.value})} 
                    className="rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-[14px] font-medium mb-1.5">Email Address</label>
                  <Input 
                    type="email" 
                    required 
                    placeholder="e.g. yourname@gmail.com"
                    value={formState.email} 
                    onChange={e => {
                      setFormState({...formState, email: e.target.value});
                      if (error) setError('');
                    }} 
                    className="rounded-xl"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[14px] font-medium">Mobile Number</label>
                    {isPhoneValid && (
                      <span className="text-[12px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1 animate-in fade-in">
                        <CheckCircle className="h-3.5 w-3.5" />
                        Valid Mobile Number
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[14px] text-apple-gray-400 font-medium z-10 pointer-events-none">
                      +91
                    </span>
                    <Input 
                      type="tel" 
                      required 
                      maxLength={10}
                      placeholder="10-digit mobile number"
                      className={`pl-12 pr-10 rounded-xl transition-all ${
                        isPhoneValid
                          ? 'border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500/20 bg-emerald-50/15 dark:bg-emerald-950/10'
                          : ''
                      }`}
                      value={formState.phone} 
                      onChange={e => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setFormState({...formState, phone: val});
                        if (error) setError('');
                      }} 
                    />
                    {isPhoneValid && (
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-emerald-500 animate-in zoom-in-75">
                        <CheckCircle className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[14px] font-medium mb-1.5">Estimated Budget (INR)</label>
                  <Input 
                    type="number" 
                    required 
                    min="1"
                    max="300000"
                    placeholder="Enter estimated budget"
                    value={formState.budget} 
                    onChange={e => {
                      const val = e.target.value;
                      if (val === '') {
                        setFormState({...formState, budget: ''});
                      } else {
                        const num = Number(val);
                        if (!isNaN(num) && num > 300000) {
                          setFormState({...formState, budget: '300000'});
                        } else {
                          setFormState({...formState, budget: val});
                        }
                      }
                      if (error) setError('');
                    }} 
                    className="rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-[14px] font-medium mb-1.5">Project Scope / Requirements (Optional)</label>
                  <textarea 
                    className="flex min-h-25 w-full rounded-xl border border-apple-gray-300 bg-white px-3.5 py-2.5 text-[15px] placeholder:text-apple-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-apple-blue leading-relaxed"
                    placeholder="Describe what features you need or your business goals..."
                    value={formState.scope}
                    onChange={e => setFormState({...formState, scope: e.target.value})}
                  />
                </div>

                {(error || otpHookError) && (
                  <p className="text-[13px] text-apple-red text-center bg-apple-red/10 p-3 rounded-xl border border-apple-red/20">
                    {error || otpHookError}
                  </p>
                )}

                <Button type="submit" className="w-full h-11 rounded-xl text-[14px]" isLoading={formStatus === 'submitting'}>
                  Continue
                </Button>
              </form>
            )}
          </Card>
        </div>
      </section>
    </div>
  );
};
