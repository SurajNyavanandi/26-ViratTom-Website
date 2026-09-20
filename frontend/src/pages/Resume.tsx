import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { 
  Plus, 
  Trash2, 
  Download,
  Loader2,
  ArrowLeft, 
  FileText,
  User,
  Wrench,
  Briefcase,
  FolderGit2,
  GraduationCap,
  Award,
  Layers,
  Sparkles,
  Info,
  Mail,
  Phone,
  Building2,
  ShieldCheck,
  CheckCircle2,
  X,
  RotateCcw,
  Check
} from 'lucide-react';
import { Link } from 'react-router-dom';

/* ------------------------------------------------------------------ */
/* TYPES                                                               */
/* ------------------------------------------------------------------ */

interface HeaderData {
  name: string;
  role: string;
  location: string;
  phone: string;
  email: string;
  github: string;
  linkedin: string;
  liveProjects: string;
  portfolio: string;
  portfolioLink: string;
}

interface ExperienceItem {
  id: number;
  role: string;
  company: string;
  date: string;
  tech: string;
  bullets: string;
}

interface ProjectItem {
  id: number;
  name: string;
  tech: string;
  bullets: string;
  demoLabel: string;
  demoLink: string;
}

interface EducationItem {
  id: number;
  degree: string;
  institution: string;
  date: string;
  score: string;
}

interface ResumeData {
  header: HeaderData;
  skills: string;
  experience: ExperienceItem[];
  projects: ProjectItem[];
  education: EducationItem[];
  certifications: string;
}

interface VerifiedRecruiter {
  name: string;
  email: string;
  phone: string;
  company?: string;
  verifiedAt: string;
}

type ResumeChunk =
  | { type: 'header' }
  | { type: 'skills' }
  | { type: 'experience' }
  | { type: 'project'; index: number }
  | { type: 'education' }
  | { type: 'certifications' };

/* ------------------------------------------------------------------ */
/* DEFAULT DATA                                                        */
/* ------------------------------------------------------------------ */

const DEFAULT_RESUME_DATA: ResumeData = {
  header: {
    name: "Suraj Nyavanandi",
    role: "MERN Stack Developer",
    location: "Hyderabad, Telangana",
    phone: "+91-9666635009",
    email: "kanusuraj15@gmail.com",
    github: "github.com/SurajNyavanandi",
    linkedin: "linkedin.com/in/suraj-nyavanandi-305962286",
    liveProjects: "Portfolio | E-Commerce | Invoice Management | AI Chatbot | RVM Bags",
    portfolio: "virattom.com",
    portfolioLink: "https://virattom.com"
  },
  skills: "Languages: JavaScript, TypeScript, HTML5, CSS3\nFrontend: React, Redux, React Hooks, Angular, NgRx, Bootstrap, Tailwind CSS\nBackend: Node.js, Express.js, NestJS, RESTful API Design\nDatabases: MongoDB, MySQL, Supabase\nSecurity: JWT Authentication, Role-Based Access(RBAC), bcrypt Password Hashing, Email OTP Verification\nTools & Platforms: AWS S3, Git, Postman, VSCode, Swagger, Nodemailer, Vite\nDeployment & Hosting: Vercel, Render, Netlify\nOther: Data Structures and Algorithms (DSA)",
  experience: [
    {
      id: 1,
      role: "MERN Stack Developer (Training)",
      company: "Sharpener",
      date: "May 2025 – April 2026",
      tech: "React, Express.js, MongoDB, JWT, Razorpay, AWS S3, Nodemailer",
      bullets: "Completed comprehensive MERN Stack training (11 months) with focus on real-world application development and industry best practices.\nBuilt multiple full-stack projects from scratch using React, Express.js, and MongoDB with production-grade code quality.\nImplemented secure JWT-based authentication systems with bcrypt password hashing and role-based access control.\nDesigned and developed RESTful APIs supporting CRUD operations with proper validation and error handling.\nCreated responsive and interactive user interfaces using React hooks, state management, and component composition patterns.\nIntegrated third-party services: Razorpay for payment processing, AWS S3 for file storage, Nodemailer for email services."
    }
  ],
  projects: [
    {
      id: 1,
      name: "StoreAndManage E-Commerce Platform",
      tech: "React, Vite, Node.js, Express.js, MongoDB, Swagger, Tailwind CSS, Bootstrap",
      bullets: "Developed modern, scalable e-commerce platform with Men's Wear, Women's Wear, and Kids Wear categories using React.\nBuilt responsive frontend using React 19 and Vite with clean, modern UI design using Tailwind CSS and Bootstrap.\nEngineered robust backend API with comprehensive Swagger API documentation for seamless integration and developer experience.\nImplemented category-based product filtering, product management, inventory handling, and comprehensive product catalog.\nIntegrated user authentication with JWT tokens, email OTP verification, and secure password reset functionality.\nImplemented role-based access control (user, admin roles) and Nodemailer for transactional email notifications.",
      demoLabel: "shop.virattom.com",
      demoLink: "https://shop.virattom.com"
    },
    {
      id: 2,
      name: "Expense Tracker",
      tech: "React, Node.js, Express.js, MongoDB, Razorpay, AWS S3, JWT",
      bullets: "Built full-stack expense management application for tracking daily, monthly, and yearly expenses with analytics and reporting.\nImplemented secure JWT-based authentication with bcrypt password hashing and token-based session management.\nCreated interactive React components for expense visualization, filtering, and reporting using React hooks and state management.\nIntegrated Razorpay payment gateway for premium account upgrades with transaction logging and error handling.\nDeveloped RESTful APIs with pagination, filtering, sorting, leaderboard rankings, and premium membership feature validation.\nIntegrated AWS S3 for server-side expense report storage enabling users to generate, download, and manage reports.\nImplemented email-based password reset functionality with secure token validation and transactional email service integration.",
      demoLabel: "expense.virattom.com",
      demoLink: "https://expense.virattom.com"
    },
    {
      id: 3,
      name: "Invoice Management System",
      tech: "React, Node.js, Express.js, MongoDB, JWT, Tailwind CSS",
      bullets: "Enterprise invoice system with role-based access control (SUPER_ADMIN, ADMIN, UNIT_MANAGER, USER).\nImplemented invoice validation: unique invoice numbers per financial year and date sequencing between invoices.\nBuilt pagination, filtering by financial year, date range, and search by invoice number functionality.\nDesigned hierarchical user creation flow with system-generated User IDs (SA1, A1, UM1, U1).\nImplemented timezone validation during login and user profile management with update capabilities.",
      demoLabel: "invoice.virattom.com",
      demoLink: "https://invoice.virattom.com"
    }
  ],
  education: [
    {
      id: 1,
      degree: "B.Tech. Electrical and Electronics Engineering",
      institution: "VIGNAN Institute of Technology & Science, Hyderabad",
      date: "Graduated: July 2022",
      score: "CGPA: 7.32 / 10"
    },
    {
      id: 2,
      degree: "Intermediate (MPC)",
      institution: "SR Junior College, Nizamabad",
      date: "Completed: March 2018",
      score: "Percentage: 93%"
    }
  ],
  certifications: "Wipro Certification in Java/J2EE (2022): Comprehensive training in Java fundamentals, object-oriented programming, and enterprise application development."
};

/* ------------------------------------------------------------------ */
/* COMPONENT                                                           */
/* ------------------------------------------------------------------ */

export const Resume = () => {
  // Preserve EXACT resume content with persistent local storage
  const [data, setData] = useState<ResumeData>(() => {
    try {
      const saved = localStorage.getItem('virattom_resume_custom_draft');
      if (saved) {
        console.log('[Resume] Restored customized draft from localStorage');
        return JSON.parse(saved) as ResumeData;
      }
    } catch (e) {
      console.warn('[Resume] Could not parse stored resume draft:', e);
    }
    return DEFAULT_RESUME_DATA;
  });

  // Stored Verified Recruiter State
  const [verifiedRecruiter, setVerifiedRecruiter] = useState<VerifiedRecruiter | null>(() => {
    try {
      const saved = localStorage.getItem('virattom_verified_recruiter');
      if (saved) {
        const parsed = JSON.parse(saved) as VerifiedRecruiter;
        console.log('[Resume] Recognized returning verified recruiter:', parsed.email);
        return parsed;
      }
    } catch (e) {
      console.warn('[Resume] Could not parse stored recruiter profile:', e);
    }
    return null;
  });

  // UI States
  const [scale, setScale] = useState(0.85);
  const [activeTab, setActiveTab] = useState<'all' | 'header' | 'skills' | 'experience' | 'projects' | 'education' | 'certifications'>('all');
  const [mobileView, setMobileView] = useState<'editor' | 'preview'>('editor');
  const [isDownloading, setIsDownloading] = useState(false);
  const [hasCustomEdits, setHasCustomEdits] = useState(false);

  // Verification Modal States
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationStep, setVerificationStep] = useState<'form' | 'otp'>('form');
  const [recruiterForm, setRecruiterForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: ''
  });
  const [recruiterOtp, setRecruiterOtp] = useState('');
  const [devOtpHint, setDevOtpHint] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);

  // Save draft changes to localStorage automatically
  useEffect(() => {
    try {
      localStorage.setItem('virattom_resume_custom_draft', JSON.stringify(data));
      setHasCustomEdits(JSON.stringify(data) !== JSON.stringify(DEFAULT_RESUME_DATA));
    } catch (e) {
      console.warn('[Resume] Failed to save draft:', e);
    }
  }, [data]);

  // Resend Countdown Timer
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setInterval(() => {
      setResendCountdown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCountdown]);

  // Dynamic Pagination Budget and Logic
  const dynamicPages = useMemo<ResumeChunk[][]>(() => {
    const PAGE_BUDGET = 1010;

    const getChunkHeight = (chunk: ResumeChunk): number => {
      switch (chunk.type) {
        case 'header': {
          let h = 35;
          if (data.header.phone || data.header.email || data.header.github || data.header.linkedin) h += 20;
          if (data.header.liveProjects) h += 18;
          if (data.header.portfolio) h += 18;
          return h + 12;
        }
        case 'skills': {
          if (!data.skills) return 0;
          const lines = data.skills.split('\n').filter(Boolean).length;
          return 30 + lines * 16.5 + 10;
        }
        case 'experience': {
          if (!data.experience.length) return 0;
          let h = 30;
          data.experience.forEach((exp: ExperienceItem) => {
            h += 38;
            const bullets = exp.bullets ? exp.bullets.split('\n').filter(Boolean).length : 0;
            h += bullets * 17;
            h += 8;
          });
          return h;
        }
        case 'project': {
          const proj = data.projects[chunk.index];
          if (!proj) return 0;
          let h = 20;
          const bullets = proj.bullets ? proj.bullets.split('\n').filter(Boolean).length : 0;
          h += bullets * 17;
          if (proj.demoLabel) h += 18;
          h += 10;
          return h;
        }
        case 'education': {
          if (!data.education.length) return 0;
          return 30 + data.education.length * 36 + 12;
        }
        case 'certifications': {
          if (!data.certifications) return 0;
          const certLines = data.certifications.split('\n').filter(Boolean).length;
          return 30 + certLines * 22 + 12;
        }
      }
    };

    const allChunks: ResumeChunk[] = [];
    if (data.header.name) allChunks.push({ type: 'header' });
    if (data.skills) allChunks.push({ type: 'skills' });
    if (data.experience.length > 0) allChunks.push({ type: 'experience' });
    data.projects.forEach((_: ProjectItem, i: number) => allChunks.push({ type: 'project', index: i }));
    if (data.education.length > 0) allChunks.push({ type: 'education' });
    if (data.certifications) allChunks.push({ type: 'certifications' });

    const pages: ResumeChunk[][] = [[]];
    let currentHeight = 0;
    let hasProjectsTitleOnPage = false;

    allChunks.forEach((chunk: ResumeChunk) => {
      let cost = getChunkHeight(chunk);
      if (cost === 0) return;

      if (chunk.type === 'project' && !hasProjectsTitleOnPage) {
        cost += 30;
      }

      if (currentHeight + cost > PAGE_BUDGET && pages[pages.length - 1].length > 0) {
        pages.push([]);
        currentHeight = 0;
        hasProjectsTitleOnPage = false;
        if (chunk.type === 'project') {
          cost += 30;
        }
      }

      pages[pages.length - 1].push(chunk);
      currentHeight += cost;
      if (chunk.type === 'project') {
        hasProjectsTitleOnPage = true;
      }
    });

    return pages;
  }, [data]);

  // Auto-fit calculation for responsiveness
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth - 32;
        const targetWidth = 794;
        if (containerWidth > 0 && containerWidth < targetWidth) {
          setScale(Math.max(0.3, Number((containerWidth / targetWidth).toFixed(2))));
        } else if (containerWidth >= targetWidth) {
          setScale(0.85);
        }
      }
    };
    
    handleResize();
    const timeout = setTimeout(handleResize, 60);
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', handleResize);
    };
  }, [mobileView]);

  // 1. Direct PDF Download Execution
  const executeDirectDownload = async () => {
    try {
      setIsDownloading(true);
      console.log('[Resume Download] Requesting PDF generation from /api/resume...', {
        candidate: data.header.name,
        pageCount: dynamicPages.length,
        downloader: verifiedRecruiter ? verifiedRecruiter.email : 'Direct / Verified Session'
      });

      const res = await fetch('/api/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, pages: dynamicPages }),
      });

      if (!res.ok) throw new Error('Failed to generate PDF');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const safeName = (data.header.name || 'Resume').replace(/[^a-zA-Z0-9_-]/g, '_');
      a.download = `${safeName}_Resume.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      console.log('[Resume Download] PDF successfully downloaded to client device.');
    } catch (err) {
      console.error('[Resume Download] Error generating PDF:', err);
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  // 2. Download Initiator
  const handleInitiateDownload = () => {
    if (verifiedRecruiter) {
      console.log('[Resume Download] Recognized returning verified recruiter:', verifiedRecruiter);
      executeDirectDownload();
    } else {
      console.log('[Resume Download] First-time visitor detected. Opening Email OTP Verification modal...');
      setShowVerificationModal(true);
      setVerificationStep('form');
      setVerificationError('');
      setRecruiterOtp('');
      setDevOtpHint('');
    }
  };

  // 3. Send Verification Email OTP
  const handleSendVerificationOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerificationError('');

    const cleanEmail = recruiterForm.email.trim().toLowerCase();
    const cleanPhone = recruiterForm.phone.replace(/\D/g, '').slice(-10);

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setVerificationError('Please enter a valid email address.');
      return;
    }

    if (cleanPhone.length !== 10) {
      setVerificationError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsSendingOtp(true);
    console.log('[Resume Verification] Sending Email OTP request...', {
      name: recruiterForm.name.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      company: recruiterForm.company.trim()
    });

    try {
      const res = await fetch('/api/lead/request-email-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: recruiterForm.name.trim(),
          email: cleanEmail,
          phone: cleanPhone,
          company: recruiterForm.company.trim(),
          projectType: 'Recruiter / Resume Download',
          scope: recruiterForm.company.trim() ? `Recruiter at ${recruiterForm.company.trim()}` : 'Resume Downloader'
        })
      });

      const result = await res.json();
      console.log('[Resume Verification] Server response for OTP request:', result);

      if (!res.ok) {
        setVerificationError(result.error || 'Failed to dispatch verification code.');
        return;
      }

      if (result.devOtp) {
        setDevOtpHint(result.devOtp);
      }
      setVerificationStep('otp');
      setResendCountdown(30);
    } catch (err) {
      console.error('[Resume Verification] Network error sending OTP:', err);
      setVerificationError('Network error. Could not connect to verification service.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // 4. Verify OTP & Persist Profile & Auto-Download PDF
  const handleVerifyOtpAndDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerificationError('');

    const cleanEmail = recruiterForm.email.trim().toLowerCase();
    const cleanPhone = recruiterForm.phone.replace(/\D/g, '').slice(-10);
    const cleanOtp = recruiterOtp.trim();

    if (cleanOtp.length !== 6) {
      setVerificationError('Please enter the 6-digit verification code.');
      return;
    }

    setIsVerifyingOtp(true);
    console.log(`[Resume Verification] Verifying OTP "${cleanOtp}" for ${cleanEmail}...`);

    try {
      const res = await fetch('/api/lead/verify-email-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          otp: cleanOtp,
          leadData: {
            name: recruiterForm.name.trim(),
            email: cleanEmail,
            phone: cleanPhone,
            company: recruiterForm.company.trim(),
            projectType: 'Recruiter / Resume Download',
            scope: `Resume downloaded by ${recruiterForm.name.trim()}${recruiterForm.company.trim() ? ` (${recruiterForm.company.trim()})` : ''}`
          }
        })
      });

      const result = await res.json();
      console.log('[Resume Verification] OTP verification result:', result);

      if (!res.ok) {
        setVerificationError(result.error || 'Verification code failed.');
        return;
      }

      const profile: VerifiedRecruiter = {
        name: recruiterForm.name.trim(),
        email: cleanEmail,
        phone: cleanPhone,
        company: recruiterForm.company.trim(),
        verifiedAt: new Date().toISOString()
      };

      localStorage.setItem('virattom_verified_recruiter', JSON.stringify(profile));
      setVerifiedRecruiter(profile);
      setShowVerificationModal(false);
      console.log('[Resume Verification] Success! Recruiter profile stored to localStorage:', profile);

      executeDirectDownload();
    } catch (err) {
      console.error('[Resume Verification] Error during verification:', err);
      setVerificationError('Network error while verifying OTP.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // 5. Reset Custom Resume Draft to Defaults
  const handleResetResumeToDefault = () => {
    if (window.confirm("Reset all resume sections to Suraj's original defaults?")) {
      setData(DEFAULT_RESUME_DATA);
      localStorage.removeItem('virattom_resume_custom_draft');
      setHasCustomEdits(false);
      console.log('[Resume] Reset to Suraj original defaults.');
    }
  };

  // 6. Clear Verified Recruiter Profile
  const handleSwitchProfile = () => {
    localStorage.removeItem('virattom_verified_recruiter');
    setVerifiedRecruiter(null);
    setRecruiterForm({ name: '', email: '', phone: '', company: '' });
    setRecruiterOtp('');
    setDevOtpHint('');
    console.log('[Resume] Cleared stored recruiter profile.');
  };

  const updateHeader = (field: keyof HeaderData, value: string) => {
    setData({ ...data, header: { ...data.header, [field]: value } });
  };

  const addExperience = () => {
    setData({
      ...data,
      experience: [...data.experience, { id: Date.now(), role: '', company: '', date: '', tech: '', bullets: '' }]
    });
  };

  const updateExperience = (index: number, field: keyof ExperienceItem, value: string) => {
    const newExp = [...data.experience];
    newExp[index] = { ...newExp[index], [field]: value };
    setData({ ...data, experience: newExp });
  };

  const removeExperience = (index: number) => {
    const newExp = [...data.experience];
    newExp.splice(index, 1);
    setData({ ...data, experience: newExp });
  };

  const addProject = () => {
    setData({
      ...data,
      projects: [...data.projects, { id: Date.now(), name: '', tech: '', bullets: '', demoLabel: '', demoLink: '' }]
    });
  };

  const updateProject = (index: number, field: keyof ProjectItem, value: string) => {
    const newProj = [...data.projects];
    newProj[index] = { ...newProj[index], [field]: value };
    setData({ ...data, projects: newProj });
  };

  const removeProject = (index: number) => {
    const newProj = [...data.projects];
    newProj.splice(index, 1);
    setData({ ...data, projects: newProj });
  };

  const addEducation = () => {
    setData({
      ...data,
      education: [...data.education, { id: Date.now(), degree: '', institution: '', date: '', score: '' }]
    });
  };

  const updateEducation = (index: number, field: keyof EducationItem, value: string) => {
    const newEdu = [...data.education];
    newEdu[index] = { ...newEdu[index], [field]: value };
    setData({ ...data, education: newEdu });
  };

  const removeEducation = (index: number) => {
    const newEdu = [...data.education];
    newEdu.splice(index, 1);
    setData({ ...data, education: newEdu });
  };

  const sectionsNav = [
    { id: 'all', label: 'All Sections', icon: Layers },
    { id: 'header', label: 'Personal', icon: User },
    { id: 'skills', label: 'Skills', icon: Wrench },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'projects', label: 'Projects', icon: FolderGit2 },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'certifications', label: 'Certs', icon: Award },
  ] as const;

  const renderResumeChunk = (
    chunk: ResumeChunk,
    pageChunks: ResumeChunk[],
    chunkIndex: number
  ) => {
    switch (chunk.type) {
      case 'header':
        return (
          <div key="header" className="text-center mb-2.5 text-black">
            <div className="font-bold text-[13.5pt] text-black">
              {[data.header.name, data.header.role, data.header.location].filter(Boolean).join(' — ')}
            </div>
            
            <div className="text-[9.5pt] flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 text-black mt-1">
              {data.header.phone && (
                <a href={`tel:${data.header.phone}`} className="text-black hover:underline whitespace-nowrap">
                  {data.header.phone}
                </a>
              )}
              {data.header.phone && data.header.email && <span className="text-black select-none">|</span>}
              {data.header.email && (
                <a href={`mailto:${data.header.email}`} className="text-black hover:underline whitespace-nowrap">
                  {data.header.email}
                </a>
              )}
              {data.header.email && data.header.github && <span className="text-black select-none">|</span>}
              {data.header.github && (
                <a href={`https://${data.header.github}`} target="_blank" rel="noreferrer" className="text-black hover:underline whitespace-nowrap">
                  {data.header.github}
                </a>
              )}
              {data.header.github && data.header.linkedin && <span className="text-black select-none">|</span>}
              {data.header.linkedin && (
                <a href={`https://${data.header.linkedin}`} target="_blank" rel="noreferrer" className="text-black hover:underline whitespace-nowrap">
                  {data.header.linkedin}
                </a>
              )}
            </div>
            
            {data.header.liveProjects && (
              <div className="text-[9.2pt] text-black mt-0.5">
                Live Projects: {data.header.liveProjects}
              </div>
            )}

            {data.header.portfolio && (
              <div className="text-[9.2pt] text-black mt-0.5">
                Portfolio:{' '}
                <a href={data.header.portfolioLink || `https://${data.header.portfolio}`} target="_blank" rel="noreferrer" className="text-[#0000ee] hover:underline">
                  {data.header.portfolio} Link &rarr;
                </a>
              </div>
            )}
          </div>
        );

      case 'skills':
        return (
          <div key="skills" className="mb-2.5">
            <h2 className="text-[11pt] font-bold text-black border-b border-black pb-0.5 mb-1.5">
              Skills
            </h2>
            <div className="text-[9.5pt] leading-[1.3] text-black space-y-0.5">
              {data.skills.split('\n').filter(Boolean).map((line: string, i: number) => {
                const parts = line.split(':');
                if (parts.length > 1) {
                  return (
                    <div key={i}>
                      <span className="font-bold text-black">{parts[0].trim()}: </span>
                      <span>{parts.slice(1).join(':').trim()}</span>
                    </div>
                  );
                }
                return <div key={i}>{line}</div>;
              })}
            </div>
          </div>
        );

      case 'experience':
        return (
          <div key="experience" className="mb-2.5">
            <h2 className="text-[11pt] font-bold text-black border-b border-black pb-0.5 mb-1.5">
              Experience
            </h2>
            {data.experience.map((exp: ExperienceItem) => (
              <div key={exp.id} className="mb-2">
                <div className="flex justify-between items-baseline text-[10pt] text-black">
                  <span className="font-bold">{exp.role}</span>
                  <span className="text-[9.5pt]">{exp.date}</span>
                </div>
                <div className="flex justify-between items-baseline text-[9.5pt] italic text-black mb-1">
                  <span>{exp.company}</span>
                  <span className="text-[9.2pt]">{exp.tech}</span>
                </div>
                {exp.bullets && (
                  <div className="space-y-0.5 text-[9.5pt] leading-[1.35] text-black">
                    {exp.bullets.split('\n').filter(Boolean).map((bullet: string, i: number) => (
                      <div key={i} className="flex items-start">
                        <span className="mr-2 select-none">&ndash;</span>
                        <span>{bullet.trim().replace(/^[-–•]\s*/, '')}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        );

      case 'project': {
        const proj = data.projects[chunk.index];
        if (!proj) return null;
        const isFirstProjectOnThisPage = !pageChunks.slice(0, chunkIndex).some((c: ResumeChunk) => c.type === 'project');
        return (
          <div key={`project-${proj.id || chunk.index}`} className="mb-2.5">
            {isFirstProjectOnThisPage && (
              <h2 className="text-[11pt] font-bold text-black border-b border-black pb-0.5 mb-1.5">
                Projects{chunk.index > 0 ? ' (Continued)' : ''}
              </h2>
            )}
            <div className="text-[10pt] text-black mb-0.5">
              <span className="font-bold">{proj.name}</span>
              {proj.tech && (
                <span className="italic">
                  {' | '}{proj.tech}
                </span>
              )}
            </div>
            {proj.bullets && (
              <div className="space-y-0.5 text-[9.5pt] leading-[1.35] text-black">
                {proj.bullets.split('\n').filter(Boolean).map((bullet: string, i: number) => (
                  <div key={i} className="flex items-start">
                    <span className="mr-2 select-none">&ndash;</span>
                    <span>{bullet.trim().replace(/^[-–•]\s*/, '')}</span>
                  </div>
                ))}
              </div>
            )}
            {proj.demoLabel && (
              <div className="flex items-start text-[9.5pt] leading-[1.35] text-black mt-0.5">
                <span className="mr-2 select-none">&ndash;</span>
                <span>
                  Live Demo:{' '}
                  <a href={proj.demoLink || `https://${proj.demoLabel}`} target="_blank" rel="noreferrer" className="text-[#0000ee] hover:underline">
                    {proj.demoLabel} Link &rarr;
                  </a>
                </span>
              </div>
            )}
          </div>
        );
      }

      case 'education':
        return (
          <div key="education" className="mb-3">
            <h2 className="text-[11pt] font-bold text-black border-b border-black pb-0.5 mb-1.5">
              Education
            </h2>
            {data.education.map((edu: EducationItem) => (
              <div key={edu.id} className="mb-2">
                <div className="flex justify-between items-baseline text-[10pt] text-black font-bold">
                  <span>{edu.degree}</span>
                  <span className="text-[9.5pt] font-normal">{edu.date}</span>
                </div>
                <div className="flex justify-between items-baseline text-[9.5pt] italic text-black">
                  <span>{edu.institution}</span>
                  <span>{edu.score}</span>
                </div>
              </div>
            ))}
          </div>
        );

      case 'certifications':
        return (
          <div key="certifications" className="mb-3">
            <h2 className="text-[11pt] font-bold text-black border-b border-black pb-0.5 mb-1.5">
              Certifications
            </h2>
            <div className="space-y-1 text-[9.5pt] leading-[1.35] text-black">
              {data.certifications.split('\n').filter(Boolean).map((cert: string, i: number) => {
                const parts = cert.split(':');
                if (parts.length > 1) {
                  return (
                    <div key={i} className="flex items-start">
                      <span className="mr-2 select-none">•</span>
                      <span>
                        <span className="font-bold">{parts[0].trim().replace(/^[-–•]\s*/, '')}: </span>
                        <span>{parts.slice(1).join(':').trim()}</span>
                      </span>
                    </div>
                  );
                }
                return (
                  <div key={i} className="flex items-start">
                    <span className="mr-2 select-none">•</span>
                    <span>{cert.trim().replace(/^[-–•]\s*/, '')}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            background: #ffffff !important;
          }
          .no-print {
            display: none !important;
          }
          .page-sheet-container {
            width: 210mm !important;
            height: 297mm !important;
            max-height: 297mm !important;
            margin: 0 !important;
            padding: 0 !important;
            page-break-after: always !important;
            break-after: page !important;
            overflow: hidden !important;
            box-sizing: border-box !important;
          }
          .page-sheet-container:last-child {
            page-break-after: auto !important;
            break-after: auto !important;
          }
          .page-sheet {
            width: 210mm !important;
            height: 297mm !important;
            max-height: 297mm !important;
            padding: 12.7mm !important;
            transform: none !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            overflow: hidden !important;
            box-sizing: border-box !important;
          }
        }
      `}</style>

      <div className="flex flex-col min-h-screen w-full bg-apple-white dark:bg-apple-black font-sans text-apple-black dark:text-apple-white antialiased">
        
        {/* --- APPLE FROSTED TOP NAVIGATION --- */}
        <header className="no-print sticky top-0 z-40 w-full backdrop-blur-xl bg-apple-white/80 dark:bg-apple-black/80 border-b border-apple-gray-200/80 dark:border-[#38383A]/80 transition-colors">
          <div className="mx-auto flex h-16 max-w-360 items-center justify-between px-4 sm:px-8">
            
            {/* Left Brand & Back */}
            <div className="flex items-center gap-3">
              <Link 
                to="/" 
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-apple-gray-100 dark:bg-[#1C1C1E] border border-apple-gray-200 dark:border-[#38383A] flex items-center justify-center text-apple-gray-500 hover:text-apple-black dark:text-apple-gray-400 dark:hover:text-white transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0"
                title="Back to Home"
              >
                <ArrowLeft size={17} />
              </Link>
              <div className="hidden sm:block">
                <h1 className="text-[15px] font-semibold text-apple-black dark:text-white leading-none">
                  Suraj Nyavanandi
                </h1>
                <p className="text-[12px] text-apple-gray-500 dark:text-apple-gray-400 mt-0.5">
                  Resume & Verification
                </p>
              </div>
            </div>

            {/* Middle Mobile Segmented View Control */}
            <div className="flex lg:hidden bg-apple-gray-100 dark:bg-[#1C1C1E] p-1 rounded-xl border border-apple-gray-200 dark:border-[#2C2C2E]">
              <button
                onClick={() => setMobileView('editor')}
                className={`px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-all cursor-pointer ${
                  mobileView === 'editor'
                    ? 'bg-white dark:bg-[#2C2C2E] text-apple-black dark:text-white shadow-sm'
                    : 'text-apple-gray-500 hover:text-apple-black dark:text-apple-gray-400 dark:hover:text-white'
                }`}
              >
                Editor
              </button>
              <button
                onClick={() => setMobileView('preview')}
                className={`px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-all cursor-pointer ${
                  mobileView === 'preview'
                    ? 'bg-white dark:bg-[#2C2C2E] text-apple-black dark:text-white shadow-sm'
                    : 'text-apple-gray-500 hover:text-apple-black dark:text-apple-gray-400 dark:hover:text-white'
                }`}
              >
                Preview
              </button>
            </div>

            {/* Right Action Controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              {verifiedRecruiter && (
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[12px] font-medium">
                  <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
                  <span className="truncate max-w-35 sm:max-w-50">
                    {verifiedRecruiter.name} {verifiedRecruiter.company ? `(${verifiedRecruiter.company})` : ''}
                  </span>
                  <button
                    onClick={handleSwitchProfile}
                    className="text-[11px] underline hover:text-emerald-700 dark:hover:text-emerald-300 ml-1 cursor-pointer"
                    title="Switch user / clear memory"
                  >
                    Switch
                  </button>
                </div>
              )}

              {hasCustomEdits && (
                <button
                  onClick={handleResetResumeToDefault}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-apple-gray-200 dark:border-[#38383A] bg-apple-gray-100 dark:bg-[#1C1C1E] text-apple-gray-600 dark:text-apple-gray-300 hover:text-apple-black dark:hover:text-white text-[12px] font-medium transition-all cursor-pointer"
                  title="Reset to default resume content"
                >
                  <RotateCcw size={13} />
                  <span>Reset Defaults</span>
                </button>
              )}

              <button 
                onClick={handleInitiateDownload} 
                disabled={isDownloading}
                className="h-9 sm:h-10 px-3.5 sm:px-4 rounded-full bg-apple-blue text-white flex items-center justify-center gap-2 text-[13px] sm:text-[14px] font-semibold shadow-sm hover:opacity-90 active:scale-95 disabled:opacity-70 transition-all cursor-pointer"
                title="Download PDF"
                aria-label="Download PDF"
              >
                {isDownloading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span className="hidden sm:inline">Generating PDF...</span>
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    <span className="hidden sm:inline">Download PDF</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* --- MAIN SPLIT WORKSPACE --- */}
        <div className="flex flex-1 flex-col lg:flex-row w-full max-w-360 mx-auto overflow-hidden print:overflow-visible">
          
          {/* EDITOR PANEL */}
          <aside 
            className={`w-full lg:w-1/2 p-4 sm:p-8 lg:border-r border-apple-gray-200 dark:border-[#38383A] bg-apple-white dark:bg-apple-black lg:overflow-y-auto lg:h-[calc(100vh-64px)] print:hidden ${
              mobileView === 'preview' ? 'hidden lg:block' : 'block'
            }`}
          >
            <div className="max-w-2xl mx-auto space-y-6 pb-24">

              {verifiedRecruiter ? (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between gap-3 text-left">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <ShieldCheck size={18} />
                    </div>
                    <div>
                      <div className="text-[13px] font-semibold text-apple-black dark:text-white">
                        Verified Recruiter: {verifiedRecruiter.name}
                      </div>
                      <div className="text-[12px] text-apple-gray-500 dark:text-apple-gray-400">
                        {verifiedRecruiter.email} • 1-Click Instant Download Active
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleSwitchProfile}
                    className="text-[12px] font-medium text-apple-gray-500 hover:text-apple-black dark:hover:text-white underline cursor-pointer shrink-0"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-apple-blue/5 border border-apple-blue/15 flex items-center justify-between gap-3 text-left">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-apple-blue/15 text-apple-blue flex items-center justify-center shrink-0">
                      <Sparkles size={18} />
                    </div>
                    <div>
                      <div className="text-[13px] font-semibold text-apple-black dark:text-white">
                        Official Resume & Editor
                      </div>
                      <div className="text-[12px] text-apple-gray-500 dark:text-apple-gray-400">
                        Verify your email once to save your profile and enable one-click PDF downloads.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-1.5 p-1 bg-apple-gray-100 dark:bg-[#1C1C1E] rounded-2xl border border-apple-gray-200 dark:border-[#2C2C2E] overflow-x-auto scrollbar-none">
                {sectionsNav.map((sec) => {
                  const Icon = sec.icon;
                  const isActive = activeTab === sec.id;
                  return (
                    <button
                      key={sec.id}
                      onClick={() => setActiveTab(sec.id)}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-medium whitespace-nowrap transition-all duration-200 ${
                        isActive
                          ? 'bg-apple-white dark:bg-[#2C2C2E] text-apple-black dark:text-apple-white shadow-sm'
                          : 'text-apple-gray-500 hover:text-apple-black dark:text-apple-gray-400 dark:hover:text-white'
                      }`}
                    >
                      <Icon size={14} className={isActive ? 'text-apple-blue' : 'opacity-70'} />
                      <span>{sec.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* PERSONAL */}
              {(activeTab === 'all' || activeTab === 'header') && (
                <section className="bg-apple-gray-100 dark:bg-[#1C1C1E] border border-apple-gray-200 dark:border-[#2C2C2E] rounded-2xl p-5 sm:p-6 space-y-5 transition-all duration-300">
                  <div className="flex items-center justify-between pb-3 border-b border-apple-gray-200 dark:border-[#2C2C2E]">
                    <div className="flex items-center gap-2.5">
                      <User size={18} className="text-apple-blue" />
                      <h2 className="text-[17px] font-semibold text-apple-black dark:text-white tracking-[-0.01em]">
                        Personal & Contact Details
                      </h2>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[12px] font-medium text-apple-gray-500 dark:text-apple-gray-400">Full Name</label>
                      <Input 
                        value={data.header.name} 
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateHeader('name', e.target.value)} 
                        placeholder="John Appleseed"
                        className="rounded-xl border-apple-gray-300 dark:border-[#38383A] bg-white dark:bg-[#2C2C2E]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[12px] font-medium text-apple-gray-500 dark:text-apple-gray-400">Professional Role</label>
                      <Input 
                        value={data.header.role} 
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateHeader('role', e.target.value)} 
                        placeholder="MERN Stack Developer"
                        className="rounded-xl border-apple-gray-300 dark:border-[#38383A] bg-white dark:bg-[#2C2C2E]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[12px] font-medium text-apple-gray-500 dark:text-apple-gray-400">Location</label>
                      <Input 
                        value={data.header.location} 
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateHeader('location', e.target.value)} 
                        placeholder="City, State"
                        className="rounded-xl border-apple-gray-300 dark:border-[#38383A] bg-white dark:bg-[#2C2C2E]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[12px] font-medium text-apple-gray-500 dark:text-apple-gray-400">Phone</label>
                      <Input 
                        value={data.header.phone} 
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateHeader('phone', e.target.value)} 
                        placeholder="+1-555-0199"
                        className="rounded-xl border-apple-gray-300 dark:border-[#38383A] bg-white dark:bg-[#2C2C2E]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[12px] font-medium text-apple-gray-500 dark:text-apple-gray-400">Email Address</label>
                      <Input 
                        value={data.header.email} 
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateHeader('email', e.target.value)} 
                        placeholder="user@domain.com"
                        className="rounded-xl border-apple-gray-300 dark:border-[#38383A] bg-white dark:bg-[#2C2C2E]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[12px] font-medium text-apple-gray-500 dark:text-apple-gray-400">GitHub Profile</label>
                      <Input 
                        value={data.header.github} 
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateHeader('github', e.target.value)} 
                        placeholder="github.com/username"
                        className="rounded-xl border-apple-gray-300 dark:border-[#38383A] bg-white dark:bg-[#2C2C2E]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[12px] font-medium text-apple-gray-500 dark:text-apple-gray-400">LinkedIn Profile</label>
                      <Input 
                        value={data.header.linkedin} 
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateHeader('linkedin', e.target.value)} 
                        placeholder="linkedin.com/in/username"
                        className="rounded-xl border-apple-gray-300 dark:border-[#38383A] bg-white dark:bg-[#2C2C2E]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[12px] font-medium text-apple-gray-500 dark:text-apple-gray-400">Portfolio URL Label</label>
                      <Input 
                        value={data.header.portfolio} 
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateHeader('portfolio', e.target.value)} 
                        placeholder="virattom.com"
                        className="rounded-xl border-apple-gray-300 dark:border-[#38383A] bg-white dark:bg-[#2C2C2E]"
                      />
                    </div>

                    <div className="col-span-1 sm:col-span-2 space-y-1.5">
                      <label className="text-[12px] font-medium text-apple-gray-500 dark:text-apple-gray-400">Live Projects Tagline</label>
                      <Input 
                        value={data.header.liveProjects} 
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateHeader('liveProjects', e.target.value)} 
                        placeholder="Project A | Project B | Project C"
                        className="rounded-xl border-apple-gray-300 dark:border-[#38383A] bg-white dark:bg-[#2C2C2E]"
                      />
                    </div>
                  </div>
                </section>
              )}

              {/* SKILLS */}
              {(activeTab === 'all' || activeTab === 'skills') && (
                <section className="bg-apple-gray-100 dark:bg-[#1C1C1E] border border-apple-gray-200 dark:border-[#2C2C2E] rounded-2xl p-5 sm:p-6 space-y-4 transition-all duration-300">
                  <div className="flex items-center justify-between pb-3 border-b border-apple-gray-200 dark:border-[#2C2C2E]">
                    <div className="flex items-center gap-2.5">
                      <Wrench size={18} className="text-apple-blue" />
                      <h2 className="text-[17px] font-semibold text-apple-black dark:text-white tracking-[-0.01em]">
                        Technical Skills
                      </h2>
                    </div>
                    <span className="text-[12px] text-apple-gray-500 dark:text-apple-gray-400">Category: Items (one per line)</span>
                  </div>

                  <textarea
                    className="w-full min-h-35 p-4 rounded-xl border border-apple-gray-300 dark:border-[#38383A] bg-white dark:bg-[#2C2C2E] text-apple-black dark:text-white text-[14px] leading-relaxed focus:outline-none focus:ring-2 focus:ring-apple-blue transition-all"
                    value={data.skills}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData({ ...data, skills: e.target.value })}
                    placeholder="Languages: JavaScript, TypeScript..."
                  />
                </section>
              )}

              {/* EXPERIENCE */}
              {(activeTab === 'all' || activeTab === 'experience') && (
                <section className="bg-apple-gray-100 dark:bg-[#1C1C1E] border border-apple-gray-200 dark:border-[#2C2C2E] rounded-2xl p-5 sm:p-6 space-y-5 transition-all duration-300">
                  <div className="flex items-center justify-between pb-3 border-b border-apple-gray-200 dark:border-[#2C2C2E]">
                    <div className="flex items-center gap-2.5">
                      <Briefcase size={18} className="text-apple-blue" />
                      <h2 className="text-[17px] font-semibold text-apple-black dark:text-white tracking-[-0.01em]">
                        Work Experience
                      </h2>
                    </div>
                    <Button 
                      variant="secondary" 
                      onClick={addExperience} 
                      className="rounded-xl px-3.5 py-1.5 text-[13px] h-9 gap-1.5"
                    >
                      <Plus size={15} /> Add Position
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {data.experience.map((exp: ExperienceItem, i: number) => (
                      <div 
                        key={exp.id} 
                        className="p-5 bg-white dark:bg-[#2C2C2E] rounded-xl border border-apple-gray-200 dark:border-[#38383A] space-y-3 relative shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md transition-shadow"
                      >
                        <button 
                          onClick={() => removeExperience(i)} 
                          className="absolute top-4 right-4 text-apple-gray-400 hover:text-apple-red hover:bg-apple-red/10 p-1.5 rounded-lg transition-colors"
                          title="Remove Entry"
                        >
                          <Trash2 size={16} />
                        </button>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-8">
                          <div className="space-y-1">
                            <label className="text-[11px] font-medium text-apple-gray-500 dark:text-apple-gray-400">Role / Position</label>
                            <Input 
                              placeholder="MERN Stack Developer" 
                              value={exp.role} 
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateExperience(i, 'role', e.target.value)} 
                              className="rounded-lg h-10 text-[14px]"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] font-medium text-apple-gray-500 dark:text-apple-gray-400">Company / Organization</label>
                            <Input 
                              placeholder="Sharpener" 
                              value={exp.company} 
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateExperience(i, 'company', e.target.value)} 
                              className="rounded-lg h-10 text-[14px]"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] font-medium text-apple-gray-500 dark:text-apple-gray-400">Employment Dates</label>
                            <Input 
                              placeholder="May 2025 – April 2026" 
                              value={exp.date} 
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateExperience(i, 'date', e.target.value)} 
                              className="rounded-lg h-10 text-[14px]"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] font-medium text-apple-gray-500 dark:text-apple-gray-400">Tech Stack Highlight</label>
                            <Input 
                              placeholder="React, Express.js, MongoDB..." 
                              value={exp.tech} 
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateExperience(i, 'tech', e.target.value)} 
                              className="rounded-lg h-10 text-[14px]"
                            />
                          </div>
                        </div>

                        <div className="space-y-1 pt-1">
                          <label className="text-[11px] font-medium text-apple-gray-500 dark:text-apple-gray-400">Bullet Points (one per line)</label>
                          <textarea 
                            className="w-full min-h-27.5 p-3 rounded-lg border border-apple-gray-300 dark:border-[#38383A] bg-apple-gray-100/50 dark:bg-[#1C1C1E] text-apple-black dark:text-white text-[13px] leading-relaxed focus:outline-none focus:ring-2 focus:ring-apple-blue"
                            placeholder="Implemented core features..." 
                            value={exp.bullets} 
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateExperience(i, 'bullets', e.target.value)} 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* PROJECTS */}
              {(activeTab === 'all' || activeTab === 'projects') && (
                <section className="bg-apple-gray-100 dark:bg-[#1C1C1E] border border-apple-gray-200 dark:border-[#2C2C2E] rounded-2xl p-5 sm:p-6 space-y-5 transition-all duration-300">
                  <div className="flex items-center justify-between pb-3 border-b border-apple-gray-200 dark:border-[#2C2C2E]">
                    <div className="flex items-center gap-2.5">
                      <FolderGit2 size={18} className="text-apple-blue" />
                      <h2 className="text-[17px] font-semibold text-apple-black dark:text-white tracking-[-0.01em]">
                        Featured Projects
                      </h2>
                    </div>
                    <Button 
                      variant="secondary" 
                      onClick={addProject} 
                      className="rounded-xl px-3.5 py-1.5 text-[13px] h-9 gap-1.5"
                    >
                      <Plus size={15} /> Add Project
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {data.projects.map((proj: ProjectItem, i: number) => (
                      <div 
                        key={proj.id} 
                        className="p-5 bg-white dark:bg-[#2C2C2E] rounded-xl border border-apple-gray-200 dark:border-[#38383A] space-y-3 relative shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md transition-shadow"
                      >
                        <button 
                          onClick={() => removeProject(i)} 
                          className="absolute top-4 right-4 text-apple-gray-400 hover:text-apple-red hover:bg-apple-red/10 p-1.5 rounded-lg transition-colors"
                          title="Remove Project"
                        >
                          <Trash2 size={16} />
                        </button>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-8">
                          <div className="space-y-1">
                            <label className="text-[11px] font-medium text-apple-gray-500 dark:text-apple-gray-400">Project Name</label>
                            <Input 
                              placeholder="StoreAndManage Platform" 
                              value={proj.name} 
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateProject(i, 'name', e.target.value)} 
                              className="rounded-lg h-10 text-[14px]"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] font-medium text-apple-gray-500 dark:text-apple-gray-400">Tech Stack</label>
                            <Input 
                              placeholder="React, Vite, Node.js..." 
                              value={proj.tech} 
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateProject(i, 'tech', e.target.value)} 
                              className="rounded-lg h-10 text-[14px]"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] font-medium text-apple-gray-500 dark:text-apple-gray-400">Live Demo Label</label>
                            <Input 
                              placeholder="shop.virattom.com" 
                              value={proj.demoLabel} 
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateProject(i, 'demoLabel', e.target.value)} 
                              className="rounded-lg h-10 text-[14px]"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] font-medium text-apple-gray-500 dark:text-apple-gray-400">Demo URL</label>
                            <Input 
                              placeholder="https://shop.virattom.com" 
                              value={proj.demoLink} 
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateProject(i, 'demoLink', e.target.value)} 
                              className="rounded-lg h-10 text-[14px]"
                            />
                          </div>
                        </div>

                        <div className="space-y-1 pt-1">
                          <label className="text-[11px] font-medium text-apple-gray-500 dark:text-apple-gray-400">Project Description Bullets (one per line)</label>
                          <textarea 
                            className="w-full min-h-27.5 p-3 rounded-lg border border-apple-gray-300 dark:border-[#38383A] bg-apple-gray-100/50 dark:bg-[#1C1C1E] text-apple-black dark:text-white text-[13px] leading-relaxed focus:outline-none focus:ring-2 focus:ring-apple-blue"
                            placeholder="Developed features..." 
                            value={proj.bullets} 
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateProject(i, 'bullets', e.target.value)} 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* EDUCATION */}
              {(activeTab === 'all' || activeTab === 'education') && (
                <section className="bg-apple-gray-100 dark:bg-[#1C1C1E] border border-apple-gray-200 dark:border-[#2C2C2E] rounded-2xl p-5 sm:p-6 space-y-5 transition-all duration-300">
                  <div className="flex items-center justify-between pb-3 border-b border-apple-gray-200 dark:border-[#2C2C2E]">
                    <div className="flex items-center gap-2.5">
                      <GraduationCap size={18} className="text-apple-blue" />
                      <h2 className="text-[17px] font-semibold text-apple-black dark:text-white tracking-[-0.01em]">
                        Education
                      </h2>
                    </div>
                    <Button 
                      variant="secondary" 
                      onClick={addEducation} 
                      className="rounded-xl px-3.5 py-1.5 text-[13px] h-9 gap-1.5"
                    >
                      <Plus size={15} /> Add Degree
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {data.education.map((edu: EducationItem, i: number) => (
                      <div 
                        key={edu.id} 
                        className="p-5 bg-white dark:bg-[#2C2C2E] rounded-xl border border-apple-gray-200 dark:border-[#38383A] space-y-3 relative shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md transition-shadow"
                      >
                        <button 
                          onClick={() => removeEducation(i)} 
                          className="absolute top-4 right-4 text-apple-gray-400 hover:text-apple-red hover:bg-apple-red/10 p-1.5 rounded-lg transition-colors"
                          title="Remove Degree"
                        >
                          <Trash2 size={16} />
                        </button>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-8">
                          <div className="space-y-1">
                            <label className="text-[11px] font-medium text-apple-gray-500 dark:text-apple-gray-400">Degree & Specialization</label>
                            <Input 
                              placeholder="B.Tech. Electrical..." 
                              value={edu.degree} 
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateEducation(i, 'degree', e.target.value)} 
                              className="rounded-lg h-10 text-[14px]"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] font-medium text-apple-gray-500 dark:text-apple-gray-400">Graduation Date</label>
                            <Input 
                              placeholder="Graduated: July 2022" 
                              value={edu.date} 
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateEducation(i, 'date', e.target.value)} 
                              className="rounded-lg h-10 text-[14px]"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] font-medium text-apple-gray-500 dark:text-apple-gray-400">Institution</label>
                            <Input 
                              placeholder="University Name" 
                              value={edu.institution} 
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateEducation(i, 'institution', e.target.value)} 
                              className="rounded-lg h-10 text-[14px]"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] font-medium text-apple-gray-500 dark:text-apple-gray-400">Score / CGPA</label>
                            <Input 
                              placeholder="CGPA: 7.32 / 10" 
                              value={edu.score} 
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateEducation(i, 'score', e.target.value)} 
                              className="rounded-lg h-10 text-[14px]"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* CERTIFICATIONS */}
              {(activeTab === 'all' || activeTab === 'certifications') && (
                <section className="bg-apple-gray-100 dark:bg-[#1C1C1E] border border-apple-gray-200 dark:border-[#2C2C2E] rounded-2xl p-5 sm:p-6 space-y-4 transition-all duration-300">
                  <div className="flex items-center justify-between pb-3 border-b border-apple-gray-200 dark:border-[#2C2C2E]">
                    <div className="flex items-center gap-2.5">
                      <Award size={18} className="text-apple-blue" />
                      <h2 className="text-[17px] font-semibold text-apple-black dark:text-white tracking-[-0.01em]">
                        Certifications & Accreditations
                      </h2>
                    </div>
                  </div>

                  <textarea
                    className="w-full min-h-25 p-4 rounded-xl border border-apple-gray-300 dark:border-[#38383A] bg-white dark:bg-[#2C2C2E] text-apple-black dark:text-white text-[14px] leading-relaxed focus:outline-none focus:ring-2 focus:ring-apple-blue transition-all"
                    value={data.certifications}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData({ ...data, certifications: e.target.value })}
                    placeholder="Wipro Certification in Java/J2EE..."
                  />
                </section>
              )}

            </div>
          </aside>

          {/* A4 PREVIEW CANVAS */}
          <main 
            ref={containerRef} 
            className={`w-full lg:w-1/2 bg-apple-gray-100 dark:bg-[#0F0F10] py-6 px-4 flex flex-col items-center print:p-0 print:bg-white overflow-y-auto lg:h-[calc(100vh-64px)] pb-32 transition-colors ${
              mobileView === 'editor' ? 'hidden lg:flex' : 'flex'
            }`}
          >
            <div className="flex flex-col items-center w-full">
              {dynamicPages.map((pageChunks: ResumeChunk[], pageIndex: number) => (
                <div 
                  key={pageIndex}
                  className="page-sheet-container relative transition-all duration-300"
                  style={{
                    width: `${794 * scale}px`,
                    height: `${1123 * scale}px`,
                    marginBottom: pageIndex === dynamicPages.length - 1 ? '0' : '32px'
                  }}
                >
                  <div 
                    className="page-sheet bg-white text-black shadow-[0_20px_50px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] rounded-xs transition-transform duration-200 relative overflow-hidden"
                    style={{
                      width: '794px',
                      height: '1123px',
                      transform: `scale(${scale})`,
                      transformOrigin: 'top left',
                      boxSizing: 'border-box',
                      padding: '12.7mm',
                      fontFamily: '"Times New Roman", Times, "Computer Modern", Georgia, serif',
                      lineHeight: '1.3'
                    }}
                  >
                    {pageChunks.map((chunk: ResumeChunk, chunkIndex: number) => renderResumeChunk(chunk, pageChunks, chunkIndex))}
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>

        {/* RECRUITER EMAIL OTP VERIFICATION MODAL */}
        {showVerificationModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in no-print">
            <div className="relative w-full max-w-md bg-white dark:bg-[#1C1C1E] rounded-3xl p-6 sm:p-8 shadow-2xl border border-apple-gray-200 dark:border-[#38383A] transition-all">
              
              <button 
                onClick={() => {
                  setShowVerificationModal(false);
                  setVerificationError('');
                }}
                className="absolute top-5 right-5 p-2 rounded-full text-apple-gray-400 hover:text-apple-black dark:hover:text-white hover:bg-apple-gray-100 dark:hover:bg-[#2C2C2E] transition-all cursor-pointer"
                title="Close"
              >
                <X size={18} />
              </button>

              <div className="text-center mb-6">
                <div className="h-12 w-12 rounded-2xl bg-apple-blue/10 text-apple-blue flex items-center justify-center mx-auto mb-3">
                  {verificationStep === 'form' ? <FileText size={24} /> : <Mail size={24} />}
                </div>
                <h3 className="text-[20px] font-bold text-apple-black dark:text-white">
                  {verificationStep === 'form' ? 'Download Official Resume' : 'Enter Verification Code'}
                </h3>
                <p className="text-[13px] text-apple-gray-500 dark:text-apple-gray-400 mt-1 leading-relaxed">
                  {verificationStep === 'form' 
                    ? 'Enter your contact details to receive a 6-digit verification code before downloading.' 
                    : `We sent a 6-digit verification code to `}
                  {verificationStep === 'otp' && (
                    <span className="font-semibold text-apple-black dark:text-white block mt-0.5">
                      {recruiterForm.email}
                    </span>
                  )}
                </p>
              </div>

              {verificationStep === 'form' ? (
                <form onSubmit={handleSendVerificationOtp} className="space-y-4">
                  <div>
                    <label className="block text-[13px] font-medium text-apple-gray-600 dark:text-apple-gray-300 mb-1.5">
                      Your Full Name <span className="text-apple-red">*</span>
                    </label>
                    <Input 
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma / John Doe"
                      value={recruiterForm.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setRecruiterForm({ ...recruiterForm, name: e.target.value });
                        if (verificationError) setVerificationError('');
                      }}
                      className="rounded-xl h-11 text-[14px]"
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-apple-gray-600 dark:text-apple-gray-300 mb-1.5">
                      Work / Personal Email <span className="text-apple-red">*</span>
                    </label>
                    <Input 
                      type="email"
                      required
                      placeholder="e.g. recruiter@company.com"
                      value={recruiterForm.email}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setRecruiterForm({ ...recruiterForm, email: e.target.value });
                        if (verificationError) setVerificationError('');
                      }}
                      className="rounded-xl h-11 text-[14px]"
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-apple-gray-600 dark:text-apple-gray-300 mb-1.5">
                      10-Digit Mobile Number <span className="text-apple-red">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3.5 text-[14px] font-medium text-apple-gray-500 select-none">
                        +91
                      </span>
                      <Input 
                        type="tel"
                        required
                        maxLength={10}
                        placeholder="9876543210"
                        value={recruiterForm.phone}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setRecruiterForm({ ...recruiterForm, phone: val });
                          if (verificationError) setVerificationError('');
                        }}
                        className="pl-12 rounded-xl h-11 text-[14px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-apple-gray-600 dark:text-apple-gray-300 mb-1.5">
                      Company / Organization (Optional)
                    </label>
                    <Input 
                      type="text"
                      placeholder="e.g. Google, Infosys, Freelance"
                      value={recruiterForm.company}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRecruiterForm({ ...recruiterForm, company: e.target.value })}
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
                    isLoading={isSendingOtp}
                  >
                    Send Verification Code
                  </Button>

                  <p className="text-[11px] text-apple-gray-400 text-center pt-1">
                    Your details are remembered in your browser for seamless 1-click future downloads.
                  </p>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtpAndDownload} className="space-y-4">
                  {devOtpHint && (
                    <div className="p-3.5 rounded-xl bg-apple-blue/5 border border-apple-blue/20 text-apple-blue text-[13px] text-center flex items-center justify-between">
                      <span>Verification Code: <strong className="font-mono font-bold tracking-widest">{devOtpHint}</strong></span>
                      <button
                        type="button"
                        onClick={() => setRecruiterOtp(devOtpHint)}
                        className="text-[12px] font-semibold underline hover:text-blue-700 cursor-pointer ml-2"
                      >
                        Auto-fill
                      </button>
                    </div>
                  )}

                  <div>
                    <label className="block text-[13px] font-medium text-apple-gray-600 dark:text-apple-gray-300 mb-2 text-center">
                      Enter 6-Digit Email OTP
                    </label>
                    <Input 
                      type="text" 
                      required 
                      maxLength={6}
                      autoFocus
                      placeholder="• • • • • •" 
                      value={recruiterOtp} 
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setRecruiterOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                        if (verificationError) setVerificationError('');
                      }} 
                      className="text-center text-[22px] tracking-[0.3em] font-mono font-bold rounded-xl h-12"
                    />
                  </div>

                  {verificationError && (
                    <div className="text-[13px] text-apple-red bg-apple-red/10 p-3 rounded-xl border border-apple-red/20 text-center">
                      {verificationError}
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full h-11 rounded-xl text-[14px] font-semibold" 
                    isLoading={isVerifyingOtp}
                  >
                    Verify & Download PDF
                  </Button>

                  <div className="flex items-center justify-between text-[13px] pt-1">
                    <button 
                      type="button" 
                      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                        if (resendCountdown === 0) {
                          handleSendVerificationOtp(e as unknown as React.FormEvent);
                        }
                      }} 
                      disabled={resendCountdown > 0 || isSendingOtp}
                      className="text-apple-blue hover:underline font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {resendCountdown > 0 ? `Resend code in ${resendCountdown}s` : 'Resend Code'}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => {
                        setVerificationStep('form');
                        setRecruiterOtp('');
                        setVerificationError('');
                      }} 
                      className="text-apple-gray-500 hover:text-black dark:hover:text-white cursor-pointer text-[12px]"
                    >
                      Change Details
                    </button>
                  </div>
                </form>
              )}

            </div>
          </div>
        )}

      </div>
    </>
  );
};