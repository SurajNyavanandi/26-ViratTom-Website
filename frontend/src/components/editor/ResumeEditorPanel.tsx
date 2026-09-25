import React from 'react';
import {
  Layers,
  User,
  Wrench,
  Briefcase,
  FolderGit2,
  GraduationCap,
  Award,
} from 'lucide-react';
import type { ResumeData, ResumeHeader, ExperienceItem, ProjectItem, EducationItem } from '@/types/resume';
import { PersonalEditor } from './PersonalEditor';
import { SkillsEditor } from './SkillsEditor';
import { ExperienceEditor } from './ExperienceEditor';
import { ProjectsEditor } from './ProjectsEditor';
import { EducationEditor } from './EducationEditor';
import { CertificationsEditor } from './CertificationsEditor';

export type EditorTab = 'all' | 'header' | 'skills' | 'experience' | 'projects' | 'education' | 'certifications';

interface ResumeEditorPanelProps {
  mobileView: 'editor' | 'preview';
  activeTab: EditorTab;
  setActiveTab: (tab: EditorTab) => void;
  data: ResumeData;
  updateHeader: (field: keyof ResumeHeader, value: string) => void;
  updateSkills: (skills: string) => void;
  updateExperienceTitle: (title: string) => void;
  addExperience: () => void;
  updateExperience: (index: number, field: keyof ExperienceItem, value: string) => void;
  removeExperience: (index: number) => void;
  addProject: () => void;
  updateProject: (index: number, field: keyof ProjectItem, value: string) => void;
  removeProject: (index: number) => void;
  addEducation: () => void;
  updateEducation: (index: number, field: keyof EducationItem, value: string) => void;
  removeEducation: (index: number) => void;
  updateCertifications: (certs: string) => void;
}

const SECTIONS_NAV = [
  { id: 'all' as EditorTab, label: 'All Sections', icon: Layers },
  { id: 'header' as EditorTab, label: 'Personal', icon: User },
  { id: 'skills' as EditorTab, label: 'Skills', icon: Wrench },
  { id: 'experience' as EditorTab, label: 'Experience', icon: Briefcase },
  { id: 'projects' as EditorTab, label: 'Projects', icon: FolderGit2 },
  { id: 'education' as EditorTab, label: 'Education', icon: GraduationCap },
  { id: 'certifications' as EditorTab, label: 'Certs', icon: Award },
];

export const ResumeEditorPanel: React.FC<ResumeEditorPanelProps> = ({
  mobileView,
  activeTab,
  setActiveTab,
  data,
  updateHeader,
  updateSkills,
  updateExperienceTitle,
  addExperience,
  updateExperience,
  removeExperience,
  addProject,
  updateProject,
  removeProject,
  addEducation,
  updateEducation,
  removeEducation,
  updateCertifications,
}) => {
  return (
    <aside
      className={`w-full lg:w-1/2 p-4 sm:p-8 lg:border-r border-apple-gray-200 bg-apple-white lg:overflow-y-auto lg:h-[calc(100vh-64px)] print:hidden ${
        mobileView === 'preview' ? 'hidden lg:block' : 'block'
      }`}
    >
      <div className="max-w-2xl mx-auto space-y-6 pb-24">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-apple-gray-100 rounded-2xl border border-apple-gray-200 overflow-x-auto scrollbar-none">
          {SECTIONS_NAV.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeTab === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveTab(sec.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-apple-white text-apple-black shadow-sm'
                    : 'text-apple-gray-500 hover:text-apple-black'
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
          <PersonalEditor header={data.header} onChange={updateHeader} />
        )}

        {/* SKILLS */}
        {(activeTab === 'all' || activeTab === 'skills') && (
          <SkillsEditor skills={data.skills} onChange={updateSkills} />
        )}

        {/* EXPERIENCE */}
        {(activeTab === 'all' || activeTab === 'experience') && (
          <ExperienceEditor
            experienceTitle={data.experienceTitle}
            onTitleChange={updateExperienceTitle}
            experience={data.experience}
            onAdd={addExperience}
            onUpdate={updateExperience}
            onRemove={removeExperience}
          />
        )}

        {/* PROJECTS */}
        {(activeTab === 'all' || activeTab === 'projects') && (
          <ProjectsEditor
            projects={data.projects}
            onAdd={addProject}
            onUpdate={updateProject}
            onRemove={removeProject}
          />
        )}

        {/* EDUCATION */}
        {(activeTab === 'all' || activeTab === 'education') && (
          <EducationEditor
            education={data.education}
            onAdd={addEducation}
            onUpdate={updateEducation}
            onRemove={removeEducation}
          />
        )}

        {/* CERTIFICATIONS */}
        {(activeTab === 'all' || activeTab === 'certifications') && (
          <CertificationsEditor
            certifications={data.certifications}
            onChange={updateCertifications}
          />
        )}
      </div>
    </aside>
  );
};
