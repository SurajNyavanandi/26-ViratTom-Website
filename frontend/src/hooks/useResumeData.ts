import { useState, useEffect, useMemo } from 'react';
import type {
  ResumeData,
  ResumeHeader as HeaderData,
  ExperienceItem,
  ProjectItem,
  EducationItem,
  ResumeChunk
} from '@/types/resume';
import { DEFAULT_RESUME_DATA, EMPTY_RESUME_DATA, isResumeEmpty } from '@/types/resume';

export const useResumeData = (verifiedEmail?: string) => {
  const [data, setData] = useState<ResumeData>(() => {
    try {
      const saved = localStorage.getItem('virattom_resume_custom_draft');
      if (saved) {
        const parsed = JSON.parse(saved) as ResumeData;
        if (parsed && !isResumeEmpty(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('[useResumeData] Could not parse stored resume draft:', e);
    }
    return EMPTY_RESUME_DATA;
  });

  const isDummyPreview = useMemo(() => isResumeEmpty(data), [data]);
  const activeResumeData = useMemo(() => (isDummyPreview ? DEFAULT_RESUME_DATA : data), [isDummyPreview, data]);
  const hasCustomEdits = useMemo(() => !isDummyPreview, [isDummyPreview]);

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
      console.warn('[useResumeData] Failed to save draft:', e);
    }
  }, [data, verifiedEmail, isDummyPreview]);

  // Dynamic Pagination Budget and Calculation
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

  // Section manipulation methods
  const updateHeader = (field: keyof HeaderData, value: string) => {
    setData((prev) => ({ ...prev, header: { ...prev.header, [field]: value } }));
  };

  const updateSkills = (skills: string) => {
    setData((prev) => ({ ...prev, skills }));
  };

  const updateExperienceTitle = (experienceTitle: string) => {
    setData((prev) => ({ ...prev, experienceTitle }));
  };

  const addExperience = () => {
    setData((prev) => ({
      ...prev,
      experience: [...prev.experience, { id: Date.now(), role: '', company: '', date: '', tech: '', bullets: '' }]
    }));
  };

  const updateExperience = (index: number, field: keyof ExperienceItem, value: string) => {
    setData((prev) => {
      const updated = [...prev.experience];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, experience: updated };
    });
  };

  const removeExperience = (index: number) => {
    setData((prev) => {
      const updated = [...prev.experience];
      updated.splice(index, 1);
      return { ...prev, experience: updated };
    });
  };

  const addProject = () => {
    setData((prev) => ({
      ...prev,
      projects: [...prev.projects, { id: Date.now(), name: '', tech: '', bullets: '', demoLabel: '', demoLink: '' }]
    }));
  };

  const updateProject = (index: number, field: keyof ProjectItem, value: string) => {
    setData((prev) => {
      const updated = [...prev.projects];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, projects: updated };
    });
  };

  const removeProject = (index: number) => {
    setData((prev) => {
      const updated = [...prev.projects];
      updated.splice(index, 1);
      return { ...prev, projects: updated };
    });
  };

  const addEducation = () => {
    setData((prev) => ({
      ...prev,
      education: [...prev.education, { id: Date.now(), degree: '', institution: '', date: '', score: '' }]
    }));
  };

  const updateEducation = (index: number, field: keyof EducationItem, value: string) => {
    setData((prev) => {
      const updated = [...prev.education];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, education: updated };
    });
  };

  const removeEducation = (index: number) => {
    setData((prev) => {
      const updated = [...prev.education];
      updated.splice(index, 1);
      return { ...prev, education: updated };
    });
  };

  const updateCertifications = (certifications: string) => {
    setData((prev) => ({ ...prev, certifications }));
  };

  const loadSampleData = () => {
    setData(DEFAULT_RESUME_DATA);
    localStorage.setItem('virattom_resume_custom_draft', JSON.stringify(DEFAULT_RESUME_DATA));
  };

  const resetResumeToEmpty = () => {
    setData(EMPTY_RESUME_DATA);
    localStorage.removeItem('virattom_resume_custom_draft');
    if (verifiedEmail) {
      localStorage.removeItem(`virattom_resume_user_${verifiedEmail}`);
    }
  };

  return {
    data,
    setData,
    isDummyPreview,
    activeResumeData,
    hasCustomEdits,
    dynamicPages,
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
    loadSampleData,
    resetResumeToEmpty,
  };
};
