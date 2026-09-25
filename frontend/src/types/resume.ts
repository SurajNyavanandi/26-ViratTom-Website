export interface ResumeHeader {
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

export interface ExperienceItem {
  id: number;
  role: string;
  company: string;
  date: string;
  tech: string;
  bullets: string;
}

export interface ProjectItem {
  id: number;
  name: string;
  tech: string;
  bullets: string;
  demoLabel: string;
  demoLink: string;
}

export interface EducationItem {
  id: number;
  degree: string;
  institution: string;
  date: string;
  score: string;
}

export interface ResumeData {
  header: ResumeHeader;
  skills: string;
  experienceTitle?: string;
  experience: ExperienceItem[];
  projects: ProjectItem[];
  education: EducationItem[];
  certifications: string;
}

export type ResumeChunk =
  | { type: 'header' }
  | { type: 'skills' }
  | { type: 'experience' }
  | { type: 'project'; index: number }
  | { type: 'education' }
  | { type: 'certifications' };

export const DEFAULT_RESUME_DATA: ResumeData = {
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
  experienceTitle: "Experience",
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

export const EMPTY_RESUME_DATA: ResumeData = {
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
  experienceTitle: "Experience",
  experience: [],
  projects: [],
  education: [],
  certifications: ""
};

export const isResumeEmpty = (d: ResumeData): boolean => {
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
