import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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
  Check,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileCode2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { safeFetchJson } from '@/utils/utils';
import { Validation } from '@/utils/validation';
import { useOtpVerification } from '@/hooks/useOtpVerification';
import { OtpVerificationView } from '@/components/ui/OtpVerificationView';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

import type { 
  ResumeData, 
  ResumeHeader as HeaderData, 
  ExperienceItem, 
  ProjectItem, 
  EducationItem 
} from '@/types';

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
    name: "Rama",
    role: "MERN Stack Developer",
    location: "Bangalore, Karnataka",
    phone: "+91-9876543210",
    email: "rama@gmail.com",
    github: "github.com/rama-dev",
    linkedin: "linkedin.com/in/rama-developer",
    liveProjects: "Portfolio | E-Commerce | Invoice Management | AI Chatbot | Cloud Services",
    portfolio: "rama.dev",
    portfolioLink: "https://rama.dev"
  },
  skills: "Languages: JavaScript, TypeScript, HTML5, CSS3\nFrontend: React, Redux, React Hooks, Angular, NgRx, Bootstrap, Tailwind CSS\nBackend: Node.js, Express.js, NestJS, RESTful API Design\nDatabases: MongoDB, MySQL, Supabase\nSecurity: JWT Authentication, Role-Based Access(RBAC), bcrypt Password Hashing, Email OTP Verification\nTools & Platforms: AWS S3, Git, Postman, VSCode, Swagger, Nodemailer, Vite\nDeployment & Hosting: Vercel, Render, Netlify\nOther: Data Structures and Algorithms (DSA)",
  experience: [
    {
      id: 1,
      role: "MERN Stack Developer (Training)",
      company: "Apex Software Labs",
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
      demoLabel: "store.example.com",
      demoLink: "https://store.example.com"
    },
    {
      id: 2,
      name: "Expense Tracker",
      tech: "React, Node.js, Express.js, MongoDB, Razorpay, AWS S3, JWT",
      bullets: "Built full-stack expense management application for tracking daily, monthly, and yearly expenses with analytics and reporting.\nImplemented secure JWT-based authentication with bcrypt password hashing and token-based session management.\nCreated interactive React components for expense visualization, filtering, and reporting using React hooks and state management.\nIntegrated Razorpay payment gateway for premium account upgrades with transaction logging and error handling.\nDeveloped RESTful APIs with pagination, filtering, sorting, leaderboard rankings, and premium membership feature validation.\nIntegrated AWS S3 for server-side expense report storage enabling users to generate, download, and manage reports.\nImplemented email-based password reset functionality with secure token validation and transactional email service integration.",
      demoLabel: "expense.example.com",
      demoLink: "https://expense.example.com"
    },
    {
      id: 3,
      name: "Invoice Management System",
      tech: "React, Node.js, Express.js, MongoDB, JWT, Tailwind CSS",
      bullets: "Enterprise invoice system with role-based access control (SUPER_ADMIN, ADMIN, UNIT_MANAGER, USER).\nImplemented invoice validation: unique invoice numbers per financial year and date sequencing between invoices.\nBuilt pagination, filtering by financial year, date range, and search by invoice number functionality.\nDesigned hierarchical user creation flow with system-generated User IDs (SA1, A1, UM1, U1).\nImplemented timezone validation during login and user profile management with update capabilities.",
      demoLabel: "invoice.example.com",
      demoLink: "https://invoice.example.com"
    }
  ],
  education: [
    {
      id: 1,
      degree: "B.Tech. Electrical and Electronics Engineering",
      institution: "Apex Institute of Engineering & Technology, Bangalore",
      date: "Graduated: July 2022",
      score: "CGPA: 8.10 / 10"
    },
    {
      id: 2,
      degree: "Intermediate (MPC)",
      institution: "Apex Junior College, Bangalore",
      date: "Completed: March 2018",
      score: "Percentage: 92%"
    }
  ],
  certifications: "Enterprise Certification in Java/J2EE (2022): Comprehensive training in Java fundamentals, object-oriented programming, and enterprise application development."
};

const EMPTY_RESUME_DATA: ResumeData = {
  header: {
    name: "",
    role: "",
    location: "",
    phone: "",
    email: "",
    github: "",
    linkedin: "",
    liveProjects: "",
    portfolio: "",
    portfolioLink: ""
  },
  skills: "",
  experience: [],
  projects: [],
  education: [],
  certifications: ""
};

const isResumeEmpty = (d: ResumeData): boolean => {
  if (!d) return true;
  const h = d.header;
  const hasHeader = Boolean(
    (h.name && h.name.trim()) ||
    (h.role && h.role.trim()) ||
    (h.location && h.location.trim()) ||
    (h.phone && h.phone.trim()) ||
    (h.email && h.email.trim()) ||
    (h.github && h.github.trim()) ||
    (h.linkedin && h.linkedin.trim()) ||
    (h.liveProjects && h.liveProjects.trim()) ||
    (h.portfolio && h.portfolio.trim())
  );
  const hasSkills = Boolean(d.skills && d.skills.trim());
  const hasExperience = Array.isArray(d.experience) && d.experience.some(e => Boolean((e.role && e.role.trim()) || (e.company && e.company.trim()) || (e.bullets && e.bullets.trim())));
  const hasProjects = Array.isArray(d.projects) && d.projects.some(p => Boolean((p.name && p.name.trim()) || (p.bullets && p.bullets.trim())));
  const hasEducation = Array.isArray(d.education) && d.education.some(e => Boolean((e.degree && e.degree.trim()) || (e.institution && e.institution.trim())));
  const hasCertifications = Boolean(d.certifications && d.certifications.trim());

  return !hasHeader && !hasSkills && !hasExperience && !hasProjects && !hasEducation && !hasCertifications;
};

/* ------------------------------------------------------------------ */
/* COMPONENT                                                           */
/* ------------------------------------------------------------------ */

export const Resume = () => {
  // Preserve resume state - starts EMPTY with placeholders; shows lightweight dummy preview until user inputs data
  const [data, setData] = useState<ResumeData>(() => {
    try {
      const saved = localStorage.getItem('virattom_resume_custom_draft');
      if (saved) {
        const parsed = JSON.parse(saved) as ResumeData;
        if (parsed && !isResumeEmpty(parsed)) {
          console.log('[Resume] Restored customized draft from localStorage');
          return parsed;
        }
      }
    } catch (e) {
      console.warn('[Resume] Could not parse stored resume draft:', e);
    }
    return EMPTY_RESUME_DATA;
  });

  // Stored Verified User Email State (for auto-saving & remembering resume per user)
  const [verifiedEmail, setVerifiedEmail] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('virattom_verified_user_email') || '';
      if (saved) {
        console.log('[Resume] Recognized returning user email:', saved);
        return saved;
      }
      // Backward compatibility with previous recruiter object
      const oldRecruiter = localStorage.getItem('virattom_verified_recruiter');
      if (oldRecruiter) {
        const parsed = JSON.parse(oldRecruiter);
        if (parsed && parsed.email) return parsed.email;
      }
    } catch (e) {
      console.warn('[Resume] Could not parse stored user email:', e);
    }
    return '';
  });

  // Check if form is currently empty (if empty -> show lightweight dummy resume preview)
  const isDummyPreview = useMemo(() => isResumeEmpty(data), [data]);
  const activeResumeData = useMemo(() => (isDummyPreview ? DEFAULT_RESUME_DATA : data), [isDummyPreview, data]);
  const hasCustomEdits = useMemo(() => !isDummyPreview, [isDummyPreview]);

  // UI States & Zoom Controls
  const [scale, setScale] = useState(0.85);
  const [activeTab, setActiveTab] = useState<'all' | 'header' | 'skills' | 'experience' | 'projects' | 'education' | 'certifications'>('all');
  const [mobileView, setMobileView] = useState<'editor' | 'preview'>('preview');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadCount, setDownloadCount] = useState<number>(26);

  // Fetch download stats from server
  useEffect(() => {
    let isMounted = true;
    safeFetchJson<{ success?: boolean; downloads?: number }>('/api/resume/stats').then((res) => {
      if (isMounted && res.data?.downloads) {
        setDownloadCount(res.data.downloads);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Verification Modal States
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationStep, setVerificationStep] = useState<'form' | 'otp'>('form');
  const [inputEmail, setInputEmail] = useState('');
  const [verificationError, setVerificationError] = useState('');

  // Shared OTP hook for resume verification
  const {
    otp: resumeOtp,
    countdown: resumeOtpCountdown,
    canResend: canResendResumeOtp,
    isRequesting: isResumeOtpRequesting,
    isVerifying: isResumeOtpVerifying,
    error: resumeOtpHookError,
    inputRefs: resumeOtpInputRefs,
    setOtpDigit: setResumeOtpDigit,
    handleKeyDown: handleResumeOtpKeyDown,
    handlePaste: handleResumeOtpPaste,
    requestOtp: requestResumeOtp,
    verifyOtp: verifyResumeOtp,
    resetOtp: resetResumeOtp,
  } = useOtpVerification({
    cooldownSeconds: 30,
    onSuccess: (_resData?: any) => {
      const cleanEmail = inputEmail.trim().toLowerCase();
      localStorage.setItem('virattom_verified_user_email', cleanEmail);
      setVerifiedEmail(cleanEmail);

      const previousSavedResume = localStorage.getItem(`virattom_resume_user_${cleanEmail}`);
      if (previousSavedResume && isDummyPreview) {
        try {
          const parsed = JSON.parse(previousSavedResume);
          setData(parsed);
          console.log('[Resume Verification] Restored previously remembered resume for:', cleanEmail);
        } catch (err) {
          console.warn('Could not parse previous saved resume:', err);
        }
      } else {
        localStorage.setItem(`virattom_resume_user_${cleanEmail}`, JSON.stringify(data));
      }

      setShowVerificationModal(false);
      console.log('[Resume Verification] Success! Verified & linked to:', cleanEmail);
      executeDirectDownload();
    },
    onError: (err: string) => {
      setVerificationError(err);
    }
  });

  const containerRef = useRef<HTMLDivElement>(null);

  // Save draft changes to localStorage automatically when customized
  useEffect(() => {
    try {
      if (!isDummyPreview) {
        localStorage.setItem('virattom_resume_custom_draft', JSON.stringify(data));
        if (verifiedEmail) {
          localStorage.setItem(`virattom_resume_user_${verifiedEmail}`, JSON.stringify(data));
        }
      }
    } catch (e) {
      console.warn('[Resume] Failed to save draft:', e);
    }
  }, [data, verifiedEmail, isDummyPreview]);

  // Dynamic Pagination Budget and Logic (uses activeResumeData)
  const dynamicPages = useMemo<ResumeChunk[][]>(() => {
    const PAGE_BUDGET = 1010;

    const getChunkHeight = (chunk: ResumeChunk): number => {
      switch (chunk.type) {
        case 'header': {
          let h = 35;
          if (activeResumeData.header.phone || activeResumeData.header.email || activeResumeData.header.github || activeResumeData.header.linkedin) h += 20;
          if (activeResumeData.header.liveProjects) h += 18;
          if (activeResumeData.header.portfolio) h += 18;
          return h + 12;
        }
        case 'skills': {
          if (!activeResumeData.skills) return 0;
          const lines = activeResumeData.skills.split('\n').filter(Boolean).length;
          return 30 + lines * 16.5 + 10;
        }
        case 'experience': {
          if (!activeResumeData.experience.length) return 0;
          let h = 30;
          activeResumeData.experience.forEach((exp: ExperienceItem) => {
            h += 38;
            const bullets = exp.bullets ? exp.bullets.split('\n').filter(Boolean).length : 0;
            h += bullets * 17;
            h += 8;
          });
          return h;
        }
        case 'project': {
          const proj = activeResumeData.projects[chunk.index];
          if (!proj) return 0;
          let h = 20;
          const bullets = proj.bullets ? proj.bullets.split('\n').filter(Boolean).length : 0;
          h += bullets * 17;
          if (proj.demoLabel) h += 18;
          h += 10;
          return h;
        }
        case 'education': {
          if (!activeResumeData.education.length) return 0;
          return 30 + activeResumeData.education.length * 36 + 12;
        }
        case 'certifications': {
          if (!activeResumeData.certifications) return 0;
          const certLines = activeResumeData.certifications.split('\n').filter(Boolean).length;
          return 30 + certLines * 22 + 12;
        }
      }
    };

    const allChunks: ResumeChunk[] = [];
    if (activeResumeData.header.name || activeResumeData.header.role) allChunks.push({ type: 'header' });
    if (activeResumeData.skills) allChunks.push({ type: 'skills' });
    if (activeResumeData.experience.length > 0) allChunks.push({ type: 'experience' });
    activeResumeData.projects.forEach((_: ProjectItem, i: number) => allChunks.push({ type: 'project', index: i }));
    if (activeResumeData.education.length > 0) allChunks.push({ type: 'education' });
    if (activeResumeData.certifications) allChunks.push({ type: 'certifications' });

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
  }, [activeResumeData]);

  // Auto-fit calculation for responsiveness & mobile screens
  const updateAutoFitScale = useCallback(() => {
    if (containerRef.current) {
      const clientWidth = containerRef.current.clientWidth || window.innerWidth;
      if (clientWidth > 0) {
        const isMobile = window.innerWidth < 1024;
        const padding = isMobile ? 24 : 48;
        const availableWidth = clientWidth - padding;
        const targetWidth = 794;
        
        if (availableWidth < targetWidth) {
          const calculatedScale = Number((availableWidth / targetWidth).toFixed(3));
          setScale(Math.max(0.35, Math.min(1.0, calculatedScale)));
        } else {
          const desktopScale = Math.min(0.92, Number((availableWidth / targetWidth).toFixed(2)));
          setScale(Math.max(0.75, desktopScale));
        }
      }
    }
  }, []);

  useEffect(() => {
    updateAutoFitScale();
    const t1 = setTimeout(updateAutoFitScale, 60);
    const t2 = setTimeout(updateAutoFitScale, 200);

    const resizeObserver = new ResizeObserver(() => {
      updateAutoFitScale();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener('resize', updateAutoFitScale);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateAutoFitScale);
    };
  }, [mobileView, updateAutoFitScale]);

  // Helper to convert any modern CSS color (oklch, lch, lab, color-mix, etc.) to standard hex/rgb
  const convertColorToRgb = (colorStr: string): string => {
    if (!colorStr) return colorStr;
    const lower = colorStr.toLowerCase().trim();
    if (
      lower === 'transparent' ||
      lower === 'inherit' ||
      lower === 'initial' ||
      lower === 'currentcolor' ||
      lower === 'none'
    ) {
      return colorStr;
    }
    if (
      !lower.includes('oklch') &&
      !lower.includes('lch') &&
      !lower.includes('lab') &&
      !lower.includes('color(') &&
      !lower.includes('color-mix')
    ) {
      return colorStr;
    }

    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (ctx) {
        ctx.fillStyle = '#000000';
        ctx.fillStyle = colorStr;
        return ctx.fillStyle;
      }
    } catch (e) {
      console.warn('[Resume] Color conversion fallback for:', colorStr, e);
    }

    // Direct fallback mapping if canvas 2d parsing fails
    if (lower.includes('blue')) return '#0071e3';
    if (lower.includes('white')) return '#ffffff';
    if (lower.includes('gray') || lower.includes('grey') || lower.includes('neutral')) return '#737373';
    return '#000000';
  };

  const sanitizeOklchString = (str: string): string => {
    if (!str) return str;
    if (
      !str.includes('oklch') &&
      !str.includes('lch') &&
      !str.includes('lab') &&
      !str.includes('color(') &&
      !str.includes('color-mix')
    ) {
      return str;
    }
    // Replace modern color syntax tokens with standard rgb/hex
    return str.replace(/(?:oklch|lch|lab|color|color-mix)\([^)]+\)/gi, (match) => {
      return convertColorToRgb(match);
    });
  };

  // Recursively copies all resolved computed styles from live preview DOM nodes to cloned nodes
  const inlineComputedStyles = (sourceEl: Element, targetEl: HTMLElement) => {
    const computed = window.getComputedStyle(sourceEl);
    
    const propertiesToCopy = [
      'font-family',
      'font-size',
      'font-weight',
      'font-style',
      'line-height',
      'letter-spacing',
      'word-spacing',
      'text-align',
      'text-decoration-line',
      'text-decoration-color',
      'text-decoration-style',
      'text-transform',
      'color',
      'background-color',
      'display',
      'flex-direction',
      'flex-wrap',
      'flex-grow',
      'flex-shrink',
      'flex-basis',
      'align-items',
      'align-content',
      'align-self',
      'justify-content',
      'justify-items',
      'justify-self',
      'column-gap',
      'row-gap',
      'gap',
      'margin-top',
      'margin-right',
      'margin-bottom',
      'margin-left',
      'padding-top',
      'padding-right',
      'padding-bottom',
      'padding-left',
      'border-top-width',
      'border-top-style',
      'border-top-color',
      'border-bottom-width',
      'border-bottom-style',
      'border-bottom-color',
      'border-left-width',
      'border-left-style',
      'border-left-color',
      'border-right-width',
      'border-right-style',
      'border-right-color',
      'border-radius',
      'width',
      'min-width',
      'max-width',
      'height',
      'min-height',
      'max-height',
      'box-sizing',
      'white-space',
      'word-break',
      'overflow-wrap',
      'opacity',
      'vertical-align',
    ];

    for (const prop of propertiesToCopy) {
      const val = computed.getPropertyValue(prop);
      if (val && val !== 'initial') {
        const cleanVal = sanitizeOklchString(val);
        targetEl.style.setProperty(prop, cleanVal, 'important');
      }
    }

    const sourceChildren = Array.from(sourceEl.children);
    const targetChildren = Array.from(targetEl.children) as HTMLElement[];

    for (let i = 0; i < sourceChildren.length && i < targetChildren.length; i++) {
      inlineComputedStyles(sourceChildren[i], targetChildren[i]);
    }
  };

  // Helper to render an HTML element directly to high-res JPEG via isolated iframe canvas with 100% computed style fidelity
  const rasterizePageElement = async (
    sourcePageElement: HTMLElement,
    width = 794,
    height = 1123,
    scale = 2
  ): Promise<{
    imgData: string;
    anchors: Array<{ href: string; relLeft: number; relTop: number; relWidth: number; relHeight: number }>;
  }> => {
    return new Promise((resolve, reject) => {
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.left = '-99999px';
      iframe.style.top = '0';
      iframe.style.width = `${width}px`;
      iframe.style.height = `${height}px`;
      iframe.style.border = 'none';
      iframe.style.zIndex = '-9999';
      document.body.appendChild(iframe);

      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) {
        document.body.removeChild(iframe);
        return reject(new Error('Could not access iframe document'));
      }

      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8" />
          <style>
            * { box-sizing: border-box; }
            body {
              margin: 0;
              padding: 0;
              background-color: #ffffff;
              color: #000000;
              width: ${width}px;
              height: ${height}px;
              overflow: hidden;
              -webkit-font-smoothing: antialiased;
            }
          </style>
        </head>
        <body></body>
        </html>
      `);
      doc.close();

      const clonedPage = sourcePageElement.cloneNode(true) as HTMLElement;
      clonedPage.style.transform = 'none';
      clonedPage.style.boxShadow = 'none';
      clonedPage.style.margin = '0';
      clonedPage.style.width = `${width}px`;
      clonedPage.style.height = `${height}px`;
      clonedPage.style.maxWidth = `${width}px`;
      clonedPage.style.maxHeight = `${height}px`;
      clonedPage.style.minWidth = `${width}px`;
      clonedPage.style.minHeight = `${height}px`;
      clonedPage.style.boxSizing = 'border-box';
      clonedPage.style.backgroundColor = '#ffffff';

      // Inline all resolved computed styles from live DOM into cloned DOM
      inlineComputedStyles(sourcePageElement, clonedPage);

      // Deep sanitize all elements in clonedPage to remove any oklch remnants
      const allCloned = clonedPage.querySelectorAll<HTMLElement>('*');
      allCloned.forEach((el) => {
        const s = el.getAttribute('style');
        if (s && (s.includes('oklch') || s.includes('lch') || s.includes('lab') || s.includes('color('))) {
          el.setAttribute('style', sanitizeOklchString(s));
        }
        if (el.style) {
          if (el.style.color && el.style.color.includes('oklch')) {
            el.style.color = convertColorToRgb(el.style.color);
          }
          if (el.style.backgroundColor && el.style.backgroundColor.includes('oklch')) {
            el.style.backgroundColor = convertColorToRgb(el.style.backgroundColor);
          }
          if (el.style.borderColor && el.style.borderColor.includes('oklch')) {
            el.style.borderColor = convertColorToRgb(el.style.borderColor);
          }
          if (el.style.borderTopColor && el.style.borderTopColor.includes('oklch')) {
            el.style.borderTopColor = convertColorToRgb(el.style.borderTopColor);
          }
          if (el.style.borderBottomColor && el.style.borderBottomColor.includes('oklch')) {
            el.style.borderBottomColor = convertColorToRgb(el.style.borderBottomColor);
          }
        }
      });

      doc.body.appendChild(clonedPage);

      setTimeout(async () => {
        try {
          const anchorElements = clonedPage.querySelectorAll<HTMLAnchorElement>('a[href]');
          const pageRect = clonedPage.getBoundingClientRect();
          const anchors: Array<{ href: string; relLeft: number; relTop: number; relWidth: number; relHeight: number }> = [];

          anchorElements.forEach((anchor) => {
            const href = anchor.getAttribute('href');
            if (href && href !== '#') {
              const r = anchor.getBoundingClientRect();
              anchors.push({
                href,
                relLeft: r.left - pageRect.left,
                relTop: r.top - pageRect.top,
                relWidth: r.width,
                relHeight: r.height,
              });
            }
          });

          const canvas = await html2canvas(clonedPage, {
            scale: scale,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            width: width,
            height: height,
            windowWidth: width,
            windowHeight: height,
            onclone: (clonedDoc) => {
              const elements = clonedDoc.querySelectorAll<HTMLElement>('*');
              elements.forEach((node) => {
                if (node.style) {
                  if (node.style.boxShadow && node.style.boxShadow.includes('oklch')) {
                    node.style.boxShadow = 'none';
                  }
                  if (node.style.color && node.style.color.includes('oklch')) {
                    node.style.color = convertColorToRgb(node.style.color);
                  }
                  if (node.style.backgroundColor && node.style.backgroundColor.includes('oklch')) {
                    node.style.backgroundColor = convertColorToRgb(node.style.backgroundColor);
                  }
                  if (node.style.borderColor && node.style.borderColor.includes('oklch')) {
                    node.style.borderColor = convertColorToRgb(node.style.borderColor);
                  }
                }
              });
            }
          });

          const imgData = canvas.toDataURL('image/jpeg', 0.98);
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
          resolve({ imgData, anchors });
        } catch (err) {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
          reject(err);
        }
      }, 60);
    });
  };

  // 1. Direct PDF Download Execution (Exact pixel-for-pixel preview match)
  const executeDirectDownload = async () => {
    const previousMobileView = mobileView;

    try {
      setIsDownloading(true);
      console.log('[Resume Download] Initiating exact preview-matching PDF generation...', {
        candidate: data.header.name,
        pageCount: dynamicPages.length,
        downloader: verifiedEmail ? verifiedEmail : 'Direct / Verified Session'
      });

      // Ensure preview DOM is active even on mobile editor tab
      if (mobileView === 'editor') {
        setMobileView('preview');
        await new Promise((r) => setTimeout(r, 120));
      }

      // Wait a tick for fonts/layout to settle
      await new Promise((r) => setTimeout(r, 60));

      const pageElements = document.querySelectorAll<HTMLElement>('.page-sheet');
      if (!pageElements || pageElements.length === 0) {
        console.warn('[Resume Download] No .page-sheet elements found in DOM, falling back to print');
        window.print();
        return;
      }

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      for (let i = 0; i < pageElements.length; i++) {
        const originalPage = pageElements[i];
        const { imgData, anchors } = await rasterizePageElement(originalPage, 794, 1123, 2);

        if (i > 0) {
          pdf.addPage('a4', 'portrait');
        }

        // Standard A4: 210mm x 297mm
        pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');

        // Extract all link positions and embed clickable annotations into the PDF
        anchors.forEach(({ href, relLeft, relTop, relWidth, relHeight }) => {
          if (relWidth > 0 && relHeight > 0) {
            // Convert pixels (794 x 1123) to A4 mm (210 x 297)
            const x_mm = (relLeft / 794) * 210;
            const y_mm = (relTop / 1123) * 297;
            const w_mm = (relWidth / 794) * 210;
            const h_mm = (relHeight / 1123) * 297;

            let formattedUrl = href.trim();
            if (
              !formattedUrl.startsWith('http://') &&
              !formattedUrl.startsWith('https://') &&
              !formattedUrl.startsWith('mailto:') &&
              !formattedUrl.startsWith('tel:')
            ) {
              formattedUrl = `https://${formattedUrl}`;
            }

            pdf.link(x_mm, y_mm, w_mm, h_mm, { url: formattedUrl });
          }
        });
      }

      const safeName = (data.header.name || 'Resume').replace(/[^a-zA-Z0-9_-]/g, '_');
      pdf.save(`${safeName}_Resume.pdf`);
      console.log('[Resume Download] PDF successfully generated and downloaded with 100% exact preview fidelity and clickable links.');

      // Increment live download count on server and update UI count immediately
      safeFetchJson<{ success?: boolean; downloads?: number }>('/api/resume/track-download', {
        method: 'POST'
      }).then((res) => {
        if (res.data?.downloads) {
          setDownloadCount(res.data.downloads);
        }
      }).catch(() => {
        setDownloadCount((prev) => prev + 1);
      });
    } catch (err) {
      console.error('[Resume Download] Error generating PDF from preview, providing print dialog:', err);
      window.print();
    } finally {
      if (previousMobileView === 'editor') {
        setMobileView('editor');
      }
      setIsDownloading(false);
    }
  };

  // 2. Download Initiator (Direct download if verified, otherwise ask for Email OTP)
  const handleInitiateDownload = () => {
    if (verifiedEmail) {
      console.log('[Resume Download] Recognized returning verified user:', verifiedEmail);
      // Ensure the latest draft is saved for this email before downloading
      try {
        localStorage.setItem(`virattom_resume_user_${verifiedEmail}`, JSON.stringify(data));
      } catch (e) {
        console.warn('Failed to sync user draft:', e);
      }
      executeDirectDownload();
    } else {
      console.log('[Resume Download] Email not yet verified. Opening Email OTP modal...');
      setShowVerificationModal(true);
      setVerificationStep('form');
      setVerificationError('');
      resetResumeOtp();
      setInputEmail(data.header.email || '');
    }
  };

  // 3. Send Verification Email OTP (Email-only)
  const handleSendVerificationOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setVerificationError('');

    const cleanEmail = inputEmail.trim().toLowerCase();
    if (!Validation.isValidEmail(cleanEmail)) {
      setVerificationError('Please enter a valid email address.');
      return;
    }

    const sent = await requestResumeOtp({
      name: data.header.name || 'Resume User',
      email: cleanEmail,
      projectType: 'Resume User',
      scope: `Resume download & sync by ${cleanEmail}`,
    });

    if (sent) {
      setVerificationStep('otp');
    }
  };

  // 4. Verify OTP, Persist & Link Resume to Email, Auto-Download PDF
  const handleVerifyOtpAndDownload = async () => {
    setVerificationError('');
    const cleanEmail = inputEmail.trim().toLowerCase();

    await verifyResumeOtp({
      name: data.header.name || 'Resume User',
      email: cleanEmail,
      projectType: 'Resume User',
      scope: `Resume verified & downloaded by ${cleanEmail}`,
    });
  };

  // 5. Load / Clear Form Actions
  const handleLoadSampleData = () => {
    setData(DEFAULT_RESUME_DATA);
    localStorage.setItem('virattom_resume_custom_draft', JSON.stringify(DEFAULT_RESUME_DATA));
  };

  const handleClearForm = () => {
    if (window.confirm("Clear all form details?")) {
      setData(EMPTY_RESUME_DATA);
      localStorage.removeItem('virattom_resume_custom_draft');
    }
  };

  const handleResetResumeToDefault = () => {
    if (window.confirm("Reset all resume sections to empty builder?")) {
      setData(EMPTY_RESUME_DATA);
      localStorage.removeItem('virattom_resume_custom_draft');
      if (verifiedEmail) {
        localStorage.removeItem(`virattom_resume_user_${verifiedEmail}`);
      }
    }
  };

  // Zoom handlers
  const handleZoomIn = () => {
    setScale(prev => Math.min(1.4, Number((prev + 0.1).toFixed(2))));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(0.35, Number((prev - 0.1).toFixed(2))));
  };

  const handleResetZoom = () => {
    updateAutoFitScale();
  };

  // 6. Switch / Change Email
  const handleSwitchEmail = () => {
    localStorage.removeItem('virattom_verified_user_email');
    setVerifiedEmail('');
    setInputEmail('');
    resetResumeOtp();
    setShowVerificationModal(true);
    setVerificationStep('form');
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
    const d = activeResumeData;
    const txtCls = isDummyPreview ? 'text-[#555555] font-normal' : 'text-[#000000]';
    const boldCls = isDummyPreview ? 'font-semibold text-[#333333]' : 'font-bold text-[#000000]';
    const linkCls = isDummyPreview ? 'text-[#555555] pointer-events-none' : 'text-[#0000ee] hover:underline';

    const renderSectionHeading = (title: string) => (
      <div className="mb-1.5">
        <div className={`text-[11pt] font-bold leading-tight ${isDummyPreview ? 'text-[#333333]' : 'text-[#000000]'}`}>
          {title}
        </div>
        <div
          className={`w-full ${isDummyPreview ? 'bg-[#d0d0d0]' : 'bg-[#000000]'}`}
          style={{
            height: '1px',
            marginTop: '2px',
            backgroundColor: isDummyPreview ? '#d0d0d0' : '#000000',
            boxSizing: 'border-box'
          }}
        />
      </div>
    );

    switch (chunk.type) {
      case 'header':
        return (
          <div key="header" className={`text-center mb-2.5 ${txtCls}`}>
            <div className={`text-[13.5pt] ${boldCls}`}>
              {[d.header.name, d.header.role, d.header.location].filter(Boolean).join(' — ')}
            </div>
            
            <div className={`text-[9.5pt] flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 mt-1 ${txtCls}`}>
              {d.header.phone && (
                <a href={`tel:${d.header.phone}`} className={`${isDummyPreview ? 'text-[#555555] pointer-events-none' : 'text-[#000000] hover:underline'} whitespace-nowrap`}>
                  {d.header.phone}
                </a>
              )}
              {d.header.phone && d.header.email && <span className="select-none opacity-50">|</span>}
              {d.header.email && (
                <a href={`mailto:${d.header.email}`} className={`${isDummyPreview ? 'text-[#555555] pointer-events-none' : 'text-[#000000] hover:underline'} whitespace-nowrap`}>
                  {d.header.email}
                </a>
              )}
              {d.header.email && d.header.github && <span className="select-none opacity-50">|</span>}
              {d.header.github && (
                <a href={`https://${d.header.github}`} target="_blank" rel="noreferrer" className={`${isDummyPreview ? 'text-[#555555] pointer-events-none' : 'text-[#000000] hover:underline'} whitespace-nowrap`}>
                  {d.header.github}
                </a>
              )}
              {d.header.github && d.header.linkedin && <span className="select-none opacity-50">|</span>}
              {d.header.linkedin && (
                <a href={`https://${d.header.linkedin}`} target="_blank" rel="noreferrer" className={`${isDummyPreview ? 'text-[#555555] pointer-events-none' : 'text-[#000000] hover:underline'} whitespace-nowrap`}>
                  {d.header.linkedin}
                </a>
              )}
            </div>
            
            {d.header.liveProjects && (
              <div className={`text-[9.2pt] mt-0.5 ${txtCls}`}>
                Live Projects: {d.header.liveProjects}
              </div>
            )}

            {d.header.portfolio && (
              <div className={`text-[9.2pt] mt-0.5 ${txtCls}`}>
                Portfolio:{' '}
                <a href={d.header.portfolioLink || `https://${d.header.portfolio}`} target="_blank" rel="noreferrer" className={linkCls}>
                  {d.header.portfolio} Link &rarr;
                </a>
              </div>
            )}
          </div>
        );

      case 'skills':
        return (
          <div key="skills" className="mb-2.5">
            {renderSectionHeading('Skills')}
            <div className={`text-[9.5pt] leading-[1.3] space-y-0.5 ${txtCls}`}>
              {d.skills.split('\n').filter(Boolean).map((line: string, i: number) => {
                const parts = line.split(':');
                if (parts.length > 1) {
                  return (
                    <div key={i}>
                      <span className={boldCls}>{parts[0].trim()}: </span>
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
            {renderSectionHeading('Experience')}
            {d.experience.map((exp: ExperienceItem) => (
              <div key={exp.id} className="mb-2">
                <div className={`flex justify-between items-baseline text-[10pt] ${txtCls}`}>
                  <span className={boldCls}>{exp.role}</span>
                  <span className="text-[9.5pt]">{exp.date}</span>
                </div>
                <div className={`flex justify-between items-baseline text-[9.5pt] italic mb-1 ${txtCls}`}>
                  <span>{exp.company}</span>
                  <span className="text-[9.2pt]">{exp.tech}</span>
                </div>
                {exp.bullets && (
                  <div className={`space-y-0.5 text-[9.5pt] leading-[1.35] ${txtCls}`}>
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
        const proj = d.projects[chunk.index];
        if (!proj) return null;
        const isFirstProjectOnThisPage = !pageChunks.slice(0, chunkIndex).some((c: ResumeChunk) => c.type === 'project');
        return (
          <div key={`project-${proj.id || chunk.index}`} className="mb-2.5">
            {isFirstProjectOnThisPage && renderSectionHeading(chunk.index > 0 ? 'Projects (Continued)' : 'Projects')}
            <div className={`text-[10pt] mb-0.5 ${txtCls}`}>
              <span className={boldCls}>{proj.name}</span>
              {proj.tech && (
                <span className="italic">
                  {' | '}{proj.tech}
                </span>
              )}
            </div>
            {proj.bullets && (
              <div className={`space-y-0.5 text-[9.5pt] leading-[1.35] ${txtCls}`}>
                {proj.bullets.split('\n').filter(Boolean).map((bullet: string, i: number) => (
                  <div key={i} className="flex items-start">
                    <span className="mr-2 select-none">&ndash;</span>
                    <span>{bullet.trim().replace(/^[-–•]\s*/, '')}</span>
                  </div>
                ))}
              </div>
            )}
            {proj.demoLabel && (
              <div className={`flex items-start text-[9.5pt] leading-[1.35] mt-0.5 ${txtCls}`}>
                <span className="mr-2 select-none">&ndash;</span>
                <span>
                  Live Demo:{' '}
                  <a href={proj.demoLink || `https://${proj.demoLabel}`} target="_blank" rel="noreferrer" className={linkCls}>
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
            {renderSectionHeading('Education')}
            {d.education.map((edu: EducationItem) => (
              <div key={edu.id} className="mb-2">
                <div className={`flex justify-between items-baseline text-[10pt] ${boldCls}`}>
                  <span>{edu.degree}</span>
                  <span className="text-[9.5pt] font-normal">{edu.date}</span>
                </div>
                <div className={`flex justify-between items-baseline text-[9.5pt] italic ${txtCls}`}>
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
            {renderSectionHeading('Certifications')}
            <div className={`space-y-1 text-[9.5pt] leading-[1.35] ${txtCls}`}>
              {d.certifications.split('\n').filter(Boolean).map((cert: string, i: number) => {
                const parts = cert.split(':');
                if (parts.length > 1) {
                  return (
                    <div key={i} className="flex items-start">
                      <span className="mr-2 select-none">•</span>
                      <span>
                        <span className={boldCls}>{parts[0].trim().replace(/^[-–•]\s*/, '')}: </span>
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
                  Resume Builder
                </h1>
                <p className="text-[12px] text-apple-gray-500 dark:text-apple-gray-400 mt-0.5">
                  Create & Edit
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
              {/* Trust-building live download metric */}
              <div className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-apple-gray-100 dark:bg-[#1C1C1E] border border-apple-gray-200 dark:border-[#38383A] text-[12px] font-medium text-apple-gray-600 dark:text-apple-gray-400 shadow-2xs">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>
                  <strong className="text-apple-black dark:text-white font-semibold">{downloadCount.toLocaleString()}</strong> resumes downloaded
                </span>
              </div>

              {verifiedEmail && (
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[12px] font-medium">
                  <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
                  <span className="truncate max-w-35 sm:max-w-50">
                    {verifiedEmail}
                  </span>
                  <button
                    onClick={handleSwitchEmail}
                    className="text-[11px] underline hover:text-emerald-700 dark:hover:text-emerald-300 ml-1 cursor-pointer"
                    title="Switch email / change user"
                  >
                    Switch
                  </button>
                </div>
              )}

              {hasCustomEdits && (
                <button
                  onClick={handleResetResumeToDefault}
                  className="h-9 w-9 sm:h-10 sm:w-10 rounded-full border border-apple-gray-200 dark:border-[#38383A] bg-apple-gray-100 dark:bg-[#1C1C1E] text-apple-gray-600 hover:text-apple-red dark:text-apple-gray-300 dark:hover:text-apple-red flex items-center justify-center transition-all cursor-pointer"
                  title="Reset to default resume"
                  aria-label="Reset resume"
                >
                  <RotateCcw size={16} />
                </button>
              )}

              <button 
                onClick={handleInitiateDownload} 
                disabled={isDownloading}
                className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-apple-blue hover:bg-apple-blue/90 text-white flex items-center justify-center shadow-sm active:scale-95 disabled:opacity-70 transition-all cursor-pointer"
                title="Download PDF"
                aria-label="Download PDF"
              >
                {isDownloading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Download size={17} />
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
            className={`w-full lg:w-1/2 bg-apple-gray-100 dark:bg-[#0F0F10] py-6 px-2 sm:px-4 flex flex-col items-center print:p-0 print:bg-white overflow-y-auto overflow-x-auto lg:h-[calc(100vh-64px)] pb-32 transition-colors ${
              mobileView === 'editor' ? 'hidden lg:flex' : 'flex'
            }`}
          >
            {/* Top Preview Controls Toolbar */}
            <div className="no-print flex items-center justify-between gap-3 w-full max-w-[794px] mb-4 px-2">
              <div className="flex items-center gap-2 text-[12px] text-apple-gray-500 dark:text-apple-gray-400 font-medium">
                <span>{dynamicPages.length} {dynamicPages.length === 1 ? 'Page' : 'Pages'}</span>
                <span className="text-apple-gray-300 dark:text-[#38383A]">•</span>
                <span className="inline-flex items-center gap-1 text-[11.5px] text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                  {downloadCount.toLocaleString()} downloaded
                </span>
                {isDummyPreview && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] font-medium border border-amber-500/20">
                    Sample Preview (Lightweight)
                  </span>
                )}
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center gap-1 bg-white dark:bg-[#1C1C1E] border border-apple-gray-200 dark:border-[#38383A] rounded-xl p-1 shadow-xs">
                <button
                  onClick={handleZoomOut}
                  className="p-1.5 rounded-lg text-apple-gray-500 hover:text-apple-black dark:text-apple-gray-400 dark:hover:text-white hover:bg-apple-gray-100 dark:hover:bg-[#2C2C2E] transition-all cursor-pointer"
                  title="Zoom Out"
                  aria-label="Zoom Out"
                >
                  <ZoomOut size={14} />
                </button>
                <button
                  onClick={handleResetZoom}
                  className="px-2 py-1 rounded-lg text-[11.5px] font-semibold text-apple-gray-600 dark:text-apple-gray-300 hover:bg-apple-gray-100 dark:hover:bg-[#2C2C2E] transition-all cursor-pointer min-w-12 text-center"
                  title="Fit to Screen"
                >
                  {Math.round(scale * 100)}%
                </button>
                <button
                  onClick={handleZoomIn}
                  className="p-1.5 rounded-lg text-apple-gray-500 hover:text-apple-black dark:text-apple-gray-400 dark:hover:text-white hover:bg-apple-gray-100 dark:hover:bg-[#2C2C2E] transition-all cursor-pointer"
                  title="Zoom In"
                  aria-label="Zoom In"
                >
                  <ZoomIn size={14} />
                </button>
                <button
                  onClick={handleResetZoom}
                  className="p-1.5 rounded-lg text-apple-gray-500 hover:text-apple-black dark:text-apple-gray-400 dark:hover:text-white hover:bg-apple-gray-100 dark:hover:bg-[#2C2C2E] transition-all cursor-pointer ml-0.5"
                  title="Reset Zoom / Fit Screen"
                  aria-label="Fit Screen"
                >
                  <Maximize2 size={13} />
                </button>
              </div>
            </div>

            {/* Dummy Notice Banner */}
            {isDummyPreview && (
              <div className="no-print mb-4 w-full max-w-[794px] p-3 rounded-2xl bg-apple-blue/10 border border-apple-blue/20 text-apple-blue dark:text-blue-400 text-[12px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 shadow-xs">
                <div className="flex items-center gap-2">
                  <Sparkles size={15} className="shrink-0 text-apple-blue" />
                  <span>
                    <strong>Sample Preview Mode:</strong> Showing a 2-page sample resume in lightweight font. Fill in your details on the editor to preview your live resume!
                  </span>
                </div>
                <button
                  onClick={handleLoadSampleData}
                  className="px-2.5 py-1 bg-apple-blue text-white rounded-lg text-[11px] font-medium hover:bg-apple-blue/90 shrink-0 cursor-pointer transition-all self-end sm:self-auto"
                >
                  Populate Form
                </button>
              </div>
            )}

            <div className="flex flex-col items-center w-full">
              {dynamicPages.map((pageChunks: ResumeChunk[], pageIndex: number) => (
                <div 
                  key={pageIndex}
                  className="page-sheet-container relative shrink-0 mx-auto transition-all duration-200"
                  style={{
                    width: `${794 * scale}px`,
                    height: `${1123 * scale}px`,
                    marginBottom: pageIndex === dynamicPages.length - 1 ? '0' : '32px'
                  }}
                >
                  <div 
                    className="page-sheet bg-white text-black shadow-[0_20px_50px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] rounded-xs transition-transform duration-200 relative overflow-hidden flex flex-col justify-between"
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
                    <div>
                      {pageChunks.map((chunk: ResumeChunk, chunkIndex: number) => renderResumeChunk(chunk, pageChunks, chunkIndex))}
                    </div>

                    {/* Ultra-minimal, elegant footer watermark */}
                    <div 
                      className="w-full pt-2 flex items-center justify-between text-[8pt] text-[#9ca3af] border-t border-[#e5e7eb]"
                      style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
                    >
                      <a 
                        href="https://virattom.com" 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-[#9ca3af] hover:text-[#4b5563] transition-colors cursor-pointer"
                        title="Visit ViratTom"
                      >
                        Created with ViratTom
                      </a>
                      <a 
                        href="https://virattom.com" 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-[#9ca3af] hover:text-[#4b5563] transition-colors cursor-pointer"
                        title="Visit virattom.com"
                      >
                        virattom.com
                      </a>
                    </div>
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

              {verificationStep === 'form' ? (
                <>
                  <div className="text-center mb-6">
                    <div className="h-12 w-12 rounded-2xl bg-apple-blue/10 text-apple-blue flex items-center justify-center mx-auto mb-3">
                      <Mail size={24} />
                    </div>
                    <h3 className="text-[20px] font-bold text-apple-black dark:text-white">
                      Save & Download Resume
                    </h3>
                    <p className="text-[13px] text-apple-gray-500 dark:text-apple-gray-400 mt-1.5 leading-relaxed">
                      Enter your email to receive a 6-digit OTP. Your customized resume will be remembered for your email address so you never lose your edits.
                    </p>
                  </div>

                  <form onSubmit={handleSendVerificationOtp} className="space-y-4">
                    <div>
                      <label className="block text-[13px] font-medium text-apple-gray-600 dark:text-apple-gray-300 mb-1.5">
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
                  onVerify={handleVerifyOtpAndDownload}
                  onResend={() => handleSendVerificationOtp()}
                  onCancel={() => {
                    setVerificationStep('form');
                    resetResumeOtp();
                    setVerificationError('');
                  }}
                  isVerifying={isResumeOtpVerifying}
                  isRequesting={isResumeOtpRequesting}
                  countdown={resumeOtpCountdown}
                  canResend={canResendResumeOtp}
                  error={verificationError || resumeOtpHookError}
                />
              )}

            </div>
          </div>
        )}

      </div>
    </>
  );
};