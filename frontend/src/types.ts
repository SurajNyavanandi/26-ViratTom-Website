export interface Lead {
  _id?: string;
  id?: string;
  name: string;
  email?: string;
  phone: string;
  projectType?: string;
  budget?: string | number;
  scope?: string;
  verified?: boolean;
  createdAt?: string;
}

export interface Milestone {
  id: number;
  task: string;
  done?: boolean;
  completed?: boolean;
  date?: string;
}

export interface Deliverable {
  name: string;
  url: string;
  locked: boolean;
}

export interface ClientProject {
  id: string;
  title: string;
  clientPhone: string;
  clientEmail?: string;
  clientName?: string;
  type: string;
  status: string;
  totalBudget: number;
  advancePercentage: number;
  advanceAmount: number;
  advancePaid: boolean;
  finalPaid: boolean;
  clientPortalApproved: boolean;
  milestones?: Milestone[];
  deliverables?: Deliverable[];
  feedback?: Array<{ id: string; text: string; date: string; resolved?: boolean }>;
}

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
  experience: ExperienceItem[];
  projects: ProjectItem[];
  education: EducationItem[];
  certifications: string;
}

export interface ChatMessage {
  id: string;
  role: 'assistant' | 'user';
  text: string;
  timestamp: string;
}

export interface PortfolioProject {
  _id: string;
  title: string;
  type: string;
  url: string;
  imageUrl: string;
  description: string;
}

export const DEFAULT_PORTFOLIO_PROJECTS: PortfolioProject[] = [
  {
    _id: '0',
    title: 'Prosync Consulting',
    type: 'Financial Advisory & Web Platform',
    url: 'https://prosyncindia.vercel.app/',
    imageUrl: '',
    description: 'Executive business loans, investor debt syndication & corporate financial advisory web platform engineered for high-growth enterprises.'
  },
  {
    _id: '1',
    title: 'Mana Drivers',
    type: 'Dynamic Website',
    url: 'https://manadrivers.com',
    imageUrl: '',
    description: 'Dynamic online driver booking & vehicle service web platform with real-time dispatch and responsive client workflows.'
  },
  {
    _id: '2',
    title: 'RVM Carry Bags',
    type: 'Static Website',
    url: 'https://rvmcarrybags.com/',
    imageUrl: '',
    description: 'High-speed corporate catalog website for eco-friendly carry bags, non-woven packaging, and instant business WhatsApp inquiries.'
  },
  {
    _id: '3',
    title: 'Inisio',
    type: 'Web Application',
    url: 'https://inisio.vercel.app/',
    imageUrl: '',
    description: 'Modern full-stack productivity & workflow management web application.'
  },
  {
    _id: '4',
    title: 'Urbanico',
    type: 'Mobile App',
    url: 'https://urbanico.vercel.app/',
    imageUrl: '',
    description: 'High-performance mobile commerce apparel app with instant checkout & fluid native-feel interactions.'
  }
];
