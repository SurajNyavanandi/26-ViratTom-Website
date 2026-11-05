export interface Lead {
  _id?: string;
  id?: string;
  name: string;
  email?: string;
  phone: string;
  projectType?: string;
  budget?: string | number;
  scope?: string;
  source?: 'project_form' | 'whatsapp_widget' | string;
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
    _id: 'husoro_web',
    title: 'Husoro',
    type: 'Static Website',
    url: 'https://husoro.com',
    imageUrl: 'https://api.microlink.io/?url=https%3A%2F%2Fhusoro.com&screenshot=true&meta=false&embed=screenshot.url',
    description: 'Luxury static corporate website and high-impact digital brand presentation.'
  },
  {
    _id: 'prosync_web',
    title: 'ProSync',
    type: 'Static Website',
    url: 'https://prosyncindia.com',
    imageUrl: 'https://api.microlink.io/?url=https%3A%2F%2Fprosyncindia.com&screenshot=true&meta=false&embed=screenshot.url',
    description: 'Executive business advisory, debt syndication, and financial platform engineered for high-growth enterprises.'
  },
  {
    _id: 'manadrivers_web',
    title: 'Mana Drivers',
    type: 'Dynamic & E-Commerce',
    url: 'https://manadrivers.com',
    imageUrl: 'https://api.microlink.io/?url=https%3A%2F%2Fmanadrivers.com&screenshot=true&meta=false&embed=screenshot.url',
    description: 'Dynamic online driver booking & vehicle service web platform with e-commerce booking workflows.'
  },
  {
    _id: 'inisio_web',
    title: 'Inisio',
    type: 'Dynamic Web App',
    url: 'https://inisio.in',
    imageUrl: 'https://api.microlink.io/?url=https%3A%2F%2Finisio.in&screenshot=true&meta=false&embed=screenshot.url',
    description: 'Modern full-stack dynamic productivity & workflow management web application.'
  },
  {
    _id: 'rvmcarrybags_web',
    title: 'RVM Carry Bags',
    type: 'Dynamic Web App',
    url: 'https://rvmcarrybags.com/',
    imageUrl: 'https://api.microlink.io/?url=https%3A%2F%2Frvmcarrybags.com%2F&screenshot=true&meta=false&embed=screenshot.url',
    description: 'High-speed dynamic product catalog for eco-friendly carry bags & custom packaging.'
  },
  {
    _id: 'urbanico_app',
    title: 'Urbanico',
    type: 'Mobile App',
    url: 'https://urbanico.vercel.app/',
    imageUrl: 'https://api.microlink.io/?url=https%3A%2F%2Furbanico.vercel.app%2F&screenshot=true&meta=false&embed=screenshot.url',
    description: 'High-performance mobile commerce apparel app with instant checkout & fluid native-feel interactions.'
  }
];
