import React from 'react';
import type { ResumeData, ResumeChunk, ExperienceItem, EducationItem } from '@/types/resume';
import { ResumeSectionHeading } from './ResumeSectionHeading';

interface ResumeChunkRendererProps {
  chunk: ResumeChunk;
  pageChunks: ResumeChunk[];
  chunkIndex: number;
  activeResumeData: ResumeData;
  isDummyPreview?: boolean;
}

export const ResumeChunkRenderer: React.FC<ResumeChunkRendererProps> = ({
  chunk,
  pageChunks,
  chunkIndex,
  activeResumeData: d,
  isDummyPreview = false,
}) => {
  const txtCls = isDummyPreview ? 'text-[#555555] font-normal' : 'text-[#000000]';
  const boldCls = isDummyPreview ? 'font-semibold text-[#333333]' : 'font-bold text-[#000000]';
  const linkCls = isDummyPreview ? 'text-[#555555] pointer-events-none' : 'text-[#0000ee] hover:underline';

  switch (chunk.type) {
    case 'header':
      return (
        <div key="header" className={`text-center mb-2.5 ${txtCls}`}>
          <div className={`text-[13.5pt] ${boldCls}`}>
            {[d.header.name, d.header.role, d.header.location].filter(Boolean).join(' — ')}
          </div>

          <div className={`text-[9.5pt] flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 mt-1 ${txtCls}`}>
            {d.header.phone && (
              <a
                href={`tel:${d.header.phone}`}
                className={`${isDummyPreview ? 'text-[#555555] pointer-events-none' : 'text-[#000000] hover:underline'} whitespace-nowrap`}
              >
                {d.header.phone}
              </a>
            )}
            {d.header.phone && d.header.email && <span className="select-none opacity-50">|</span>}
            {d.header.email && (
              <a
                href={`mailto:${d.header.email}`}
                className={`${isDummyPreview ? 'text-[#555555] pointer-events-none' : 'text-[#000000] hover:underline'} whitespace-nowrap`}
              >
                {d.header.email}
              </a>
            )}
            {d.header.email && d.header.github && <span className="select-none opacity-50">|</span>}
            {d.header.github && (
              <a
                href={`https://${d.header.github}`}
                target="_blank"
                rel="noreferrer"
                className={`${isDummyPreview ? 'text-[#555555] pointer-events-none' : 'text-[#000000] hover:underline'} whitespace-nowrap`}
              >
                {d.header.github}
              </a>
            )}
            {d.header.github && d.header.linkedin && <span className="select-none opacity-50">|</span>}
            {d.header.linkedin && (
              <a
                href={`https://${d.header.linkedin}`}
                target="_blank"
                rel="noreferrer"
                className={`${isDummyPreview ? 'text-[#555555] pointer-events-none' : 'text-[#000000] hover:underline'} whitespace-nowrap`}
              >
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
              <a
                href={d.header.portfolioLink || `https://${d.header.portfolio}`}
                target="_blank"
                rel="noreferrer"
                className={linkCls}
              >
                {d.header.portfolio} Link &rarr;
              </a>
            </div>
          )}
        </div>
      );

    case 'skills':
      return (
        <div key="skills" className="mb-2.5">
          <ResumeSectionHeading title="Skills" isDummyPreview={isDummyPreview} />
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
          <ResumeSectionHeading title={d.experienceTitle || 'Experience'} isDummyPreview={isDummyPreview} />
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
          {isFirstProjectOnThisPage && (
            <ResumeSectionHeading
              title={chunk.index > 0 ? 'Projects (Continued)' : 'Projects'}
              isDummyPreview={isDummyPreview}
            />
          )}
          <div className={`text-[10pt] mb-0.5 ${txtCls}`}>
            <span className={boldCls}>{proj.name}</span>
            {proj.tech && <span className="italic">{' | '}{proj.tech}</span>}
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
                <a
                  href={proj.demoLink || `https://${proj.demoLabel}`}
                  target="_blank"
                  rel="noreferrer"
                  className={linkCls}
                >
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
          <ResumeSectionHeading title="Education" isDummyPreview={isDummyPreview} />
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
          <ResumeSectionHeading title="Certifications" isDummyPreview={isDummyPreview} />
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
