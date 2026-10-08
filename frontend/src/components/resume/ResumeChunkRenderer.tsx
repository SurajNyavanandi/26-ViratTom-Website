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

const normalizeUrl = (url?: string): string => {
  if (!url) return '';
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^mailto:/i.test(trimmed)) return trimmed;
  if (/^tel:/i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

const normalizeEmail = (email?: string): string => {
  if (!email) return '';
  const trimmed = email.trim();
  if (/^mailto:/i.test(trimmed)) return trimmed;
  return `mailto:${trimmed}`;
};

const normalizePhone = (phone?: string): string => {
  if (!phone) return '';
  const trimmed = phone.trim();
  if (/^tel:/i.test(trimmed)) return trimmed;
  const digits = trimmed.replace(/[^\d+]/g, '');
  return `tel:${digits || trimmed}`;
};

const normalizeGithub = (val?: string): string => {
  if (!val) return '';
  const trimmed = val.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^github\.com/i.test(trimmed)) return `https://${trimmed}`;
  return `https://github.com/${trimmed.replace(/^@/, '')}`;
};

const normalizeLinkedin = (val?: string): string => {
  if (!val) return '';
  const trimmed = val.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^linkedin\.com/i.test(trimmed)) return `https://${trimmed}`;
  return `https://linkedin.com/in/${trimmed.replace(/^@/, '')}`;
};

/**
 * Parses a string to auto-detect and render active clickable hyperlinks for any embedded URLs.
 */
const renderTextWithLinks = (text: string, linkClassName = 'text-[#0000ee] hover:underline cursor-pointer') => {
  if (!text) return null;
  const urlRegex = /(https?:\/\/[^\s,)]+|www\.[^\s,)]+|[a-zA-Z0-9_-]+\.(?:com|org|net|io|dev|app|co|in|ai|tech|me)(?:\/[^\s,)]*)?)/gi;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = urlRegex.exec(text)) !== null) {
    const rawUrl = match[0].replace(/[.,;:)]$/, '');
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    parts.push(
      <a
        key={match.index}
        href={normalizeUrl(rawUrl)}
        target="_blank"
        rel="noreferrer"
        className={linkClassName}
      >
        {rawUrl}
      </a>
    );
    lastIndex = match.index + rawUrl.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
};

export const ResumeChunkRenderer: React.FC<ResumeChunkRendererProps> = ({
  chunk,
  pageChunks,
  chunkIndex,
  activeResumeData: d,
  isDummyPreview = false,
}) => {
  const txtCls = isDummyPreview ? 'text-[#555555] font-normal' : 'text-[#000000]';
  const boldCls = isDummyPreview ? 'font-semibold text-[#333333]' : 'font-bold text-[#000000]';
  const standardLinkCls = 'text-[#0000ee] hover:underline cursor-pointer font-medium';
  const headerLinkCls = isDummyPreview
    ? 'text-[#444444] hover:underline hover:text-black cursor-pointer'
    : 'text-[#000000] hover:underline hover:text-apple-blue cursor-pointer';

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
                href={normalizePhone(d.header.phone)}
                className={`${headerLinkCls} whitespace-nowrap`}
                title={`Call ${d.header.phone}`}
              >
                {d.header.phone}
              </a>
            )}
            {d.header.phone && d.header.email && <span className="select-none opacity-50">|</span>}
            {d.header.email && (
              <a
                href={normalizeEmail(d.header.email)}
                className={`${headerLinkCls} whitespace-nowrap`}
                title={`Send email to ${d.header.email}`}
              >
                {d.header.email}
              </a>
            )}
            {d.header.email && d.header.github && <span className="select-none opacity-50">|</span>}
            {d.header.github && (
              <a
                href={normalizeGithub(d.header.github)}
                target="_blank"
                rel="noreferrer"
                className={`${headerLinkCls} whitespace-nowrap`}
                title="View GitHub Profile"
              >
                {d.header.github}
              </a>
            )}
            {d.header.github && d.header.linkedin && <span className="select-none opacity-50">|</span>}
            {d.header.linkedin && (
              <a
                href={normalizeLinkedin(d.header.linkedin)}
                target="_blank"
                rel="noreferrer"
                className={`${headerLinkCls} whitespace-nowrap`}
                title="View LinkedIn Profile"
              >
                {d.header.linkedin}
              </a>
            )}
          </div>

          {d.header.liveProjects && (
            <div className={`text-[9.2pt] mt-0.5 ${txtCls}`}>
              Live Projects: {renderTextWithLinks(d.header.liveProjects)}
            </div>
          )}

          {d.header.portfolio && (
            <div className={`text-[9.2pt] mt-0.5 ${txtCls}`}>
              Portfolio:{' '}
              <a
                href={normalizeUrl(d.header.portfolioLink || d.header.portfolio)}
                target="_blank"
                rel="noreferrer"
                className={standardLinkCls}
                title="Visit Portfolio"
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
                    <span>{renderTextWithLinks(parts.slice(1).join(':').trim())}</span>
                  </div>
                );
              }
              return <div key={i}>{renderTextWithLinks(line)}</div>;
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
                      <span>{renderTextWithLinks(bullet.trim().replace(/^[-–•]\s*/, ''))}</span>
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
      const hasLiveDemo = Boolean(proj.demoLink || proj.demoLabel);
      const demoUrl = normalizeUrl(proj.demoLink || proj.demoLabel);
      const demoLabel = proj.demoLabel || proj.demoLink || 'Live Demo';

      return (
        <div key={`project-${proj.id || chunk.index}`} className="mb-2.5">
          {isFirstProjectOnThisPage && (
            <ResumeSectionHeading
              title={chunk.index > 0 ? 'Projects (Continued)' : 'Projects'}
              isDummyPreview={isDummyPreview}
            />
          )}
          <div className={`text-[10pt] mb-0.5 ${txtCls}`}>
            {proj.demoLink ? (
              <a
                href={normalizeUrl(proj.demoLink)}
                target="_blank"
                rel="noreferrer"
                className={`${boldCls} hover:text-apple-blue hover:underline cursor-pointer`}
                title={`Open ${proj.name}`}
              >
                {proj.name}
              </a>
            ) : (
              <span className={boldCls}>{proj.name}</span>
            )}
            {proj.tech && <span className="italic">{' | '}{proj.tech}</span>}
          </div>
          {proj.bullets && (
            <div className={`space-y-0.5 text-[9.5pt] leading-[1.35] ${txtCls}`}>
              {proj.bullets.split('\n').filter(Boolean).map((bullet: string, i: number) => (
                <div key={i} className="flex items-start">
                  <span className="mr-2 select-none">&ndash;</span>
                  <span>{renderTextWithLinks(bullet.trim().replace(/^[-–•]\s*/, ''))}</span>
                </div>
              ))}
            </div>
          )}
          {hasLiveDemo && (
            <div className={`flex items-start text-[9.5pt] leading-[1.35] mt-0.5 ${txtCls}`}>
              <span className="mr-2 select-none">&ndash;</span>
              <span>
                Live Demo:{' '}
                <a
                  href={demoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={standardLinkCls}
                  title={`Open ${proj.name || 'Project'} Demo`}
                >
                  {demoLabel} Link &rarr;
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
                      <span>{renderTextWithLinks(parts.slice(1).join(':').trim())}</span>
                    </span>
                  </div>
                );
              }
              return (
                <div key={i} className="flex items-start">
                  <span className="mr-2 select-none">•</span>
                  <span>{renderTextWithLinks(cert.trim().replace(/^[-–•]\s*/, ''))}</span>
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
