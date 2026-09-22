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
