import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { ArrowRight, Code, Smartphone, Zap, Shield, CheckCircle, KeyRound, Mail, MessageSquare, Phone, ExternalLink, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

const PROJECT_MIN_PRICES: Record<string, number> = {
  'Static Website': 4999,
  'Dynamic Website': 14999,
  'Online Store': 25999,
  'Online Store (E-Commerce)': 25999,
  'Mobile App': 39000,
  'Website + Mobile App': 49000,
};

const getMinPrice = (type: string): number => {
  return PROJECT_MIN_PRICES[type] || 4999;
};

export const Home = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formState, setFormState] = useState({ 
    name: '', 
    email: '', 
    phone: '', 
    budget: '', 
    scope: '', 
    projectType: 'Static Website' 
  });
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'otp' | 'success'>('idle');
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProjects(data);
        } else {
          setProjects([]);
        }
      })
      .catch(err => {
        console.error('[Home] Failed to load dynamic projects from backend:', err);
        setProjects([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanEmail = formState.email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError('Please enter a valid email address to receive your verification code.');
      return;
    }

    const digitsOnly = formState.phone.replace(/\D/g, '');
    const cleanPhone = digitsOnly.slice(-10);
    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    
    const budget = parseInt(formState.budget);
    const minBudget = getMinPrice(formState.projectType);

    if (isNaN(budget) || budget < minBudget) {
      setError(`Minimum budget is ₹${minBudget.toLocaleString('en-IN')}.`);
      return;
    }

    setFormStatus('submitting');
    try {
      console.log(`[Home Inquiry] Requesting Email OTP for ${formState.name} (${cleanEmail})...`);
      const res = await fetch('/api/lead/request-email-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          name: formState.name.trim(),
          phone: cleanPhone,
          budget: formState.budget,
          scope: formState.scope,
          projectType: formState.projectType
        })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to send verification code. Please try again.');
        setFormStatus('idle');
        return;
      }

      console.log('[Home Inquiry] Email OTP requested successfully.');
      setFormStatus('otp');
    } catch (err: any) {
      console.error('[Home Inquiry] Error requesting email OTP:', err);
      setError('Network error sending verification code. Please try again.');
      setFormStatus('idle');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanOtp = otp.trim();
    if (cleanOtp.length !== 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    setIsVerifying(true);
    try {
      const cleanEmail = formState.email.trim().toLowerCase();
      const cleanPhone = formState.phone.replace(/\D/g, '').slice(-10);
      console.log(`[Home Inquiry] Verifying Email OTP "${cleanOtp}" for ${cleanEmail}...`);
      
      const res = await fetch('/api/lead/verify-email-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          otp: cleanOtp,
          leadData: {
            name: formState.name.trim(),
            email: cleanEmail,
            phone: cleanPhone,
            budget: formState.budget,
            projectType: formState.projectType,
            scope: formState.scope
          }
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Invalid or expired OTP code.');
        setIsVerifying(false);
        return;
      }

      console.log('[Home Inquiry] Lead submitted and verified successfully! Lead ID:', data.leadId);
      setFormStatus('success');
    } catch (err: any) {
      console.error('[Home Inquiry] Verification error:', err);
      setError('Verification failed. Please check your internet connection.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full max-w-360 px-4 sm:px-8 py-16 sm:py-24 text-center md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-3 inline-flex items-center">
            <Link
              to="/resume"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-apple-gray-100 dark:bg-[#1C1C1E] border border-apple-gray-200 dark:border-[#38383A] text-apple-gray-600 dark:text-apple-gray-300 hover:text-apple-black dark:hover:text-white text-[12px] sm:text-[13px] font-medium transition-all hover:scale-[1.02] shadow-xs cursor-pointer"
            >
              <FileText className="h-3.5 w-3.5 text-apple-blue" />
              <span>Looking for a developer CV? <span className="text-apple-blue font-semibold underline">Download resume template at Virattom</span> &rarr;</span>
            </Link>
          </div>
          <br />
          <span className="text-[12px] sm:text-[14px] font-semibold tracking-widest text-apple-gray-500 dark:text-apple-gray-400 uppercase">
            VI<span className="font-bold text-apple-blue">R</span>
            <span className="font-bold text-apple-blue">A</span>T TO
            <span className="font-bold text-apple-blue">M</span>
          </span>
          <h1 className="mt-4 text-[32px] xs:text-[38px] sm:text-[48px] md:text-[56px] font-bold tracking-[-0.03em] leading-[1.15]">
            Website & Mobile App Development.
          </h1>
          <p className="mt-4 sm:mt-6 mx-auto max-w-2xl text-[16px] sm:text-[20px] text-apple-gray-500 dark:text-apple-gray-400 leading-relaxed">
            Fast, scalable apps and websites tailored to your business.
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
              onClick={() => document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' })}
            >
              View work
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section id="process" className="w-full py-24 bg-apple-gray-100 dark:bg-[#1C1C1E]">
        <div className="mx-auto max-w-360 px-4 sm:px-8">
          <div className="text-center mb-16">
            <h2 className="text-[34px] font-semibold tracking-[-0.02em]">What We Build</h2>
            <p className="mt-4 text-[16px] text-apple-gray-500 dark:text-apple-gray-400">
              Clear, simple solutions tailored for every business need.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-white dark:bg-black">
              <Code className="h-8 w-8 text-apple-blue mb-4" />
              <h3 className="text-[20px] font-semibold mb-2">Static Websites</h3>
              <p className="text-[16px] text-apple-gray-500 dark:text-apple-gray-400">
                Simple, fast websites for businesses, clinics, and personal portfolios with instant WhatsApp buttons.
              </p>
            </Card>
            <Card className="bg-white dark:bg-black">
              <Zap className="h-8 w-8 text-apple-blue mb-4" />
              <h3 className="text-[20px] font-semibold mb-2">Dynamic Websites</h3>
              <p className="text-[16px] text-apple-gray-500 dark:text-apple-gray-400">
                Interactive websites with customer logins, membership portals, and automated databases.
              </p>
            </Card>
            <Card className="bg-white dark:bg-black">
              <Smartphone className="h-8 w-8 text-apple-blue mb-4" />
              <h3 className="text-[20px] font-semibold mb-2">Mobile Apps</h3>
              <p className="text-[16px] text-apple-gray-500 dark:text-apple-gray-400">
                Installable smartphone apps for Android phones and Apple iPhones with push notifications.
              </p>
            </Card>
            <Card className="bg-white dark:bg-black">
              <Shield className="h-8 w-8 text-apple-blue mb-4" />
              <h3 className="text-[20px] font-semibold mb-2">Online Stores (E-Commerce)</h3>
              <p className="text-[16px] text-apple-gray-500 dark:text-apple-gray-400">
                Shopping websites with product catalogs, shopping carts, and direct UPI or card payments.
              </p>
            </Card>
            <Card className="bg-white dark:bg-black">
              <CheckCircle className="h-8 w-8 text-apple-blue mb-4" />
              <h3 className="text-[20px] font-semibold mb-2">Super Fast Loading</h3>
              <p className="text-[16px] text-apple-gray-500 dark:text-apple-gray-400">
                Every page opens in 1 second, optimized for mobile phones and low data connections.
              </p>
            </Card>
            <Card className="bg-white dark:bg-black">
              <ArrowRight className="h-8 w-8 text-apple-blue mb-4" />
              <h3 className="text-[20px] font-semibold mb-2">Plain English & Support</h3>
              <p className="text-[16px] text-apple-gray-500 dark:text-apple-gray-400">
                Zero confusing developer jargon. We guide you step-by-step and handle all maintenance.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Selected Works */}
      <section id="work" className="w-full max-w-360 px-4 sm:px-8 py-24 mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-[34px] font-semibold tracking-[-0.02em]">Selected Projects</h2>
        </div>
        
        {loading ? (
          <div className="flex justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-apple-blue border-t-transparent" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {projects.map((project: any) => {
              const projectUrl = project.url || (project.title === 'Inisio' ? 'https://inisio.vercel.app/' : 'https://urbanico.vercel.app/');
              return (
                <a 
                  key={project._id} 
                  href={projectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative block overflow-hidden rounded-2xl bg-white dark:bg-[#1C1C1E] border border-apple-gray-200 dark:border-[#2C2C2E] shadow-sm hover:shadow-lg transition-all text-left focus:outline-none focus:ring-2 focus:ring-apple-blue"
                >
                  <div className="aspect-16/10 overflow-hidden bg-apple-gray-100 dark:bg-[#2C2C2E] relative">
                    <img 
                      src={project.imageUrl} 
                      alt={project.title} 
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" 
                    />
                    <div className="absolute top-4 right-4 bg-white/90 dark:bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-full text-[12px] font-medium text-apple-black dark:text-white flex items-center gap-1.5 shadow-sm opacity-90 group-hover:opacity-100 transition-opacity">
                      <span>Visit Live</span>
                      <ExternalLink className="h-3.5 w-3.5 text-apple-blue" />
                    </div>
                  </div>
                  <div className="p-7">
                    <div className="flex items-center justify-between mb-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-[12px] font-semibold bg-apple-blue/10 text-apple-blue">
                        {project.type}
                      </span>
                      <span className="text-[13px] text-apple-gray-400 dark:text-apple-gray-500 font-mono flex items-center gap-1">
                        {projectUrl.replace('https://', '').replace('/', '')}
                      </span>
                    </div>
                    <h3 className="text-[22px] font-bold text-apple-black dark:text-white group-hover:text-apple-blue transition-colors flex items-center justify-between">
                      <span>{project.title}</span>
                      <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all transform -translate-x-2 group-hover:translate-x-0 text-apple-blue" />
                    </h3>
                    {project.description && (
                      <p className="mt-2 text-[14px] text-apple-gray-500 dark:text-apple-gray-400">
                        {project.description}
                      </p>
                    )}
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="w-full py-24 bg-apple-gray-100 dark:bg-[#1C1C1E]">
        <div className="mx-auto max-w-360 px-4 sm:px-8">
          <div className="text-center mb-16">
            <h2 className="text-[34px] font-semibold tracking-[-0.02em]">Pricing & Services</h2>
            <p className="mt-4 text-[16px] text-apple-gray-500 dark:text-apple-gray-400">
              Every project is unique. Pick the plan that fits your business to request a customized quote.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Static Website */}
            <Card className="bg-white dark:bg-black p-8 text-center flex flex-col h-full border border-apple-gray-200 dark:border-[#38383A]">
              <div className="inline-block mx-auto mb-3 px-3 py-1 rounded-full text-[12px] font-medium bg-apple-blue/10 text-apple-blue">
                Easiest to Start
              </div>
              <h3 className="text-[22px] font-bold mb-1">Static Website</h3>
              <p className="text-[14px] text-apple-gray-500 mb-6">Simple 1 to 5 Page Website with WhatsApp Chat</p>
              <div className="text-[24px] font-bold mb-2 text-apple-black dark:text-white">Custom Quote</div>
              <p className="text-[12px] text-apple-gray-500 mb-6">Tailored to your needs • Direct developer attention</p>
              <ul className="space-y-3.5 mb-8 text-left text-[14px] flex-1">
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-apple-blue shrink-0" /> Simple business brochure / visiting card</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-apple-blue shrink-0" /> 1-tap WhatsApp message button</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-apple-blue shrink-0" /> Fast loading on all mobile phones</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-apple-blue shrink-0" /> Google search (SEO) ready</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-apple-blue shrink-0" /> Direct 1-on-1 developer collaboration & updates</li>
              </ul>
              <Button onClick={() => {
                setFormState({...formState, projectType: 'Static Website'});
                document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
              }} className="w-full mt-auto" variant="outline">Choose Static Website</Button>
            </Card>

            {/* Dynamic Website */}
            <Card className="bg-white dark:bg-black p-8 text-center flex flex-col h-full border border-apple-gray-200 dark:border-[#38383A]">
              <div className="inline-block mx-auto mb-3 px-3 py-1 rounded-full text-[12px] font-medium bg-apple-blue/10 text-apple-blue">
                For Portals & Logins
              </div>
              <h3 className="text-[22px] font-bold mb-1">Dynamic Website</h3>
              <p className="text-[14px] text-apple-gray-500 mb-6">Interactive Website with User Logins & Database</p>
              <div className="text-[24px] font-bold mb-2 text-apple-black dark:text-white">Custom Quote</div>
              <p className="text-[12px] text-apple-gray-500 mb-6">Tailored to your needs • Database included</p>
              <ul className="space-y-3.5 mb-8 text-left text-[14px] flex-1">
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
            </Card>

            {/* Online Store (E-Commerce) */}
            <Card className="bg-white dark:bg-black p-8 text-center flex flex-col h-full border border-apple-gray-200 dark:border-[#38383A]">
              <div className="inline-block mx-auto mb-3 px-3 py-1 rounded-full text-[12px] font-medium bg-apple-blue/10 text-apple-blue">
                Sell Products Online
              </div>
              <h3 className="text-[22px] font-bold mb-1">Online Store</h3>
              <p className="text-[14px] text-apple-gray-500 mb-6">Website to Sell Products with Shopping Cart</p>
              <div className="text-[24px] font-bold mb-2 text-apple-black dark:text-white">Custom Quote</div>
              <p className="text-[12px] text-apple-gray-500 mb-6">Tailored to your needs • Orders & Payments</p>
              <ul className="space-y-3.5 mb-8 text-left text-[14px] flex-1">
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
            </Card>

            {/* Mobile App */}
            <Card className="bg-white dark:bg-black p-8 text-center flex flex-col h-full border border-apple-gray-200 dark:border-[#38383A]">
              <div className="inline-block mx-auto mb-3 px-3 py-1 rounded-full text-[12px] font-medium bg-apple-blue/10 text-apple-blue">
                For Smartphones
              </div>
              <h3 className="text-[22px] font-bold mb-1">Mobile App</h3>
              <p className="text-[14px] text-apple-gray-500 mb-6">Smartphone App for Android & iPhone</p>
              <div className="text-[24px] font-bold mb-2 text-apple-black dark:text-white">Custom Quote</div>
              <p className="text-[12px] text-apple-gray-500 mb-6">Tailored to your needs • App Stores ready</p>
              <ul className="space-y-3.5 mb-8 text-left text-[14px] flex-1">
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
            </Card>

            {/* Website + Mobile App */}
            <Card className="bg-apple-black text-white p-8 text-center flex flex-col h-full md:col-span-2 lg:col-span-2 border border-[#38383A] shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-apple-blue text-[11px] font-bold px-3 py-1 rounded-bl-lg">POPULAR ALL-IN-ONE</div>
              <h3 className="text-[22px] font-bold mb-1">Website + Mobile App</h3>
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
            </Card>
          </div>
        </div>
      </section>

      {/* Application Gate */}
      <section id="contact" className="w-full py-16 sm:py-24 border-t border-apple-gray-200 dark:border-[#38383A]">
        <div className="mx-auto max-w-150 px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-[26px] sm:text-[34px] font-semibold tracking-[-0.02em]">Start a Project</h2>
            <p className="mt-2 sm:mt-4 text-[14px] sm:text-[16px] text-apple-gray-500 dark:text-apple-gray-400">
              Tell us about your requirements to get started.
            </p>
          </div>

          <Card className="p-5 sm:p-8 rounded-2xl border border-apple-gray-200 dark:border-[#38383A]">
            {formStatus === 'success' ? (
              <div className="text-center py-8">
                <CheckCircle className="mx-auto h-12 w-12 text-apple-green mb-4" />
                <h3 className="text-[20px] font-semibold mb-2">Application Received</h3>
                <p className="text-[16px] text-apple-gray-500 dark:text-apple-gray-400 max-w-md mx-auto">
                  Thank you, <span className="font-semibold text-apple-black dark:text-white">{formState.name}</span>! Your verified project details have been received. We will review your requirements and get in touch with you via email or phone shortly.
                </p>
                <div className="mt-6 flex justify-center">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setFormStatus('idle');
                      setFormState({ name: '', email: '', phone: '', budget: '', scope: '', projectType: 'Static Website' });
                      setOtp('');
                    }}
                    className="rounded-xl text-[13px]"
                  >
                    Submit Another Inquiry
                  </Button>
                </div>
              </div>
            ) : formStatus === 'otp' ? (
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div className="text-center mb-4">
                  <div className="h-12 w-12 rounded-2xl bg-apple-blue/10 flex items-center justify-center text-apple-blue mx-auto mb-3">
                    <Mail className="h-6 w-6" />
                  </div>
                  <h3 className="text-[20px] font-bold text-apple-black dark:text-white">Verify Your Email Address</h3>
                  <p className="text-[14px] text-apple-gray-500 dark:text-apple-gray-400 mt-1">
                    We sent a 6-digit verification code to <span className="font-semibold text-apple-black dark:text-white">{formState.email}</span>
                  </p>
                </div>

                <div>
                  <label className="block text-[14px] font-medium mb-2">6-Digit Email OTP</label>
                  <Input 
                    type="text" 
                    required 
                    maxLength={6}
                    placeholder="• • • • • •" 
                    value={otp} 
                    onChange={e => {
                      setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                      if (error) setError('');
                    }} 
                    className="text-center text-[22px] tracking-[0.3em] font-mono font-bold rounded-xl h-12"
                  />
                </div>

                {error && (
                  <p className="text-[13px] text-apple-red text-center bg-apple-red/10 p-3 rounded-xl border border-apple-red/20">
                    {error}
                  </p>
                )}

                <Button type="submit" className="w-full h-11 rounded-xl text-[14px]" isLoading={isVerifying}>
                  Verify & Submit Application
                </Button>

                <div className="flex items-center justify-between text-[13px] pt-1">
                  <button 
                    type="button" 
                    onClick={handleApply} 
                    className="text-apple-blue hover:underline font-medium cursor-pointer"
                  >
                    Resend Code
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      setFormStatus('idle');
                      setOtp('');
                      setError('');
                    }} 
                    className="text-apple-gray-500 hover:text-black dark:hover:text-white cursor-pointer"
                  >
                    Change Email / Number
                  </button>
                </div>
              </form>
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
                              ? 'border-apple-blue bg-apple-blue/5 dark:bg-apple-blue/10 shadow-sm' 
                              : 'border-apple-gray-200 dark:border-[#38383A] bg-white dark:bg-[#1C1C1E] hover:border-apple-gray-400'
                          }`}
                        >
                          <div className={`mt-0.5 h-4 w-4 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                            isSelected ? 'border-apple-blue bg-apple-blue' : 'border-apple-gray-400 dark:border-apple-gray-600'
                          }`}>
                            {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`text-[15px] font-semibold ${isSelected ? 'text-apple-blue' : 'text-apple-black dark:text-white'}`}>
                              {type.label}
                            </div>
                            <div className="text-[13px] text-apple-gray-500 dark:text-apple-gray-400 mt-0.5">
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
                    placeholder="e.g. Shree Shiva"
                    value={formState.name} 
                    onChange={e => setFormState({...formState, name: e.target.value})} 
                    className="rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-[14px] font-medium mb-1.5">Email Address (for instant OTP verification)</label>
                  <Input 
                    type="email" 
                    required 
                    placeholder="e.g. shree@example.com"
                    value={formState.email} 
                    onChange={e => {
                      setFormState({...formState, email: e.target.value});
                      if (error) setError('');
                    }} 
                    className="rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-[14px] font-medium mb-1.5">Mobile Number</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[14px] text-apple-gray-400 font-medium">
                      +91
                    </span>
                    <Input 
                      type="tel" 
                      required 
                      maxLength={10}
                      placeholder="10-digit mobile number"
                      className="pl-12 rounded-xl"
                      value={formState.phone} 
                      onChange={e => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setFormState({...formState, phone: val});
                        if (error) setError('');
                      }} 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[14px] font-medium mb-1.5">Estimated Budget (INR)</label>
                  <Input 
                    type="number" 
                    required 
                    min="1"
                    placeholder={`e.g. ${getMinPrice(formState.projectType)}`}
                    value={formState.budget} 
                    onChange={e => {
                      setFormState({...formState, budget: e.target.value});
                      if (error) setError('');
                    }} 
                    className="rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-[14px] font-medium mb-1.5">Project Scope / Requirements (Optional)</label>
                  <textarea 
                    className="flex min-h-25 w-full rounded-xl border border-apple-gray-300 bg-white px-3.5 py-2.5 text-[15px] placeholder:text-apple-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-apple-blue dark:border-[#38383A] dark:bg-[#1C1C1E] dark:text-white leading-relaxed"
                    placeholder="Describe what features you need or your business goals..."
                    value={formState.scope}
                    onChange={e => setFormState({...formState, scope: e.target.value})}
                  />
                </div>

                {error && (
                  <p className="text-[13px] text-apple-red text-center bg-apple-red/10 p-3 rounded-xl border border-apple-red/20">
                    {error}
                  </p>
                )}

                <Button type="submit" className="w-full h-11 rounded-xl text-[14px]" isLoading={formStatus === 'submitting'}>
                  Continue to Email Verification
                </Button>
              </form>
            )}
          </Card>

          {/* WhatsApp Business Connect Card */}
          {(() => {
            const rawWaNumber = (import.meta.env.VITE_WHATSAPP_NUMBER || '').replace(/\D/g, '');
            const whatsappUrl = rawWaNumber 
              ? `https://wa.me/${rawWaNumber}?text=Hello%20Virattom%20Team,%20I%20would%20like%20to%20discuss%20a%20project.`
              : `https://wa.me/?text=Hello%20Virattom%20Team,%20I%20would%20like%20to%20discuss%20a%20project.`;

            return (
              <div className="mt-8 p-5 rounded-2xl bg-linear-to-r from-[#25D366]/10 to-[#128C7E]/10 border border-[#25D366]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
                <div className="flex items-center gap-3.5">
                  <div className="h-11 w-11 rounded-xl bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <MessageSquare className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[15px] text-apple-black dark:text-white">
                      Prefer WhatsApp?
                    </h4>
                    <p className="text-[13px] text-apple-gray-600 dark:text-apple-gray-300">
                      Chat directly with our business desk for instant project estimates.
                    </p>
                  </div>
                </div>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] text-white text-[13px] font-semibold hover:bg-[#20bd5a] active:scale-95 transition-all shadow-xs shrink-0 self-start sm:self-auto"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            );
          })()}
        </div>
      </section>
    </div>
  );
};