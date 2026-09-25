import React from 'react';
import { Briefcase, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { ExperienceItem } from '@/types/resume';

interface ExperienceEditorProps {
  experienceTitle?: string;
  onTitleChange: (title: string) => void;
  experience: ExperienceItem[];
  onAdd: () => void;
  onUpdate: (index: number, field: keyof ExperienceItem, value: string) => void;
  onRemove: (index: number) => void;
}

const TITLE_PRESETS = [
  'Experience',
  'Internships',
  'Work Experience',
  'Training & Internships',
];

export const ExperienceEditor: React.FC<ExperienceEditorProps> = ({
  experienceTitle = 'Experience',
  onTitleChange,
  experience,
  onAdd,
  onUpdate,
  onRemove,
}) => {
  return (
    <section className="bg-apple-gray-100 border border-apple-gray-200 rounded-2xl p-5 sm:p-6 space-y-5 transition-all duration-300">
      <div className="flex items-center justify-between pb-3 border-b border-apple-gray-200">
        <div className="flex items-center gap-2.5">
          <Briefcase size={18} className="text-apple-blue" />
          <h2 className="text-[17px] font-semibold text-apple-black tracking-[-0.01em]">
            {experienceTitle || 'Work Experience'}
          </h2>
        </div>
        <Button
          variant="secondary"
          onClick={onAdd}
          className="rounded-xl px-3.5 py-1.5 text-[13px] h-9 gap-1.5"
        >
          <Plus size={15} /> Add Position
        </Button>
      </div>

      {/* Customizable Section Heading & Fresher / Experienced Presets */}
      <div className="bg-white p-4 rounded-xl border border-apple-gray-200 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="text-[12px] font-semibold text-apple-black">
            Section Heading on Resume:
          </label>
          <span className="text-[11px] text-apple-gray-500">
            Select a preset or type a custom title (e.g. for Freshers/Interns)
          </span>
        </div>

        {/* Quick-Select Preset Chips */}
        <div className="flex flex-wrap gap-1.5">
          {TITLE_PRESETS.map((preset) => {
            const isSelected = (experienceTitle || 'Experience').toLowerCase() === preset.toLowerCase();
            return (
              <button
                key={preset}
                type="button"
                onClick={() => onTitleChange(preset)}
                className={`px-3 py-1 rounded-lg text-[12px] font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-apple-blue text-white shadow-2xs font-semibold'
                    : 'bg-apple-gray-100 text-apple-gray-600 hover:bg-apple-gray-200/80 hover:text-apple-black'
                }`}
              >
                {preset}
              </button>
            );
          })}
        </div>

        {/* Custom Heading Text Input */}
        <div className="pt-1">
          <Input
            value={experienceTitle}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onTitleChange(e.target.value)}
            placeholder="Custom Section Heading (e.g. Practical Training)"
            className="h-9 rounded-lg text-[13px] bg-apple-gray-50/50"
          />
        </div>
      </div>

      <div className="space-y-4">
        {experience.map((exp: ExperienceItem, i: number) => (
          <div
            key={exp.id}
            className="p-5 bg-white rounded-xl border border-apple-gray-200 space-y-3 relative shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md transition-shadow"
          >
            <button
              onClick={() => onRemove(i)}
              className="absolute top-4 right-4 text-apple-gray-400 hover:text-apple-red hover:bg-apple-red/10 p-1.5 rounded-lg transition-colors cursor-pointer"
              title="Remove Entry"
            >
              <Trash2 size={16} />
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-8">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-apple-gray-500">Role / Position</label>
                <Input
                  placeholder="MERN Stack Developer"
                  value={exp.role}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdate(i, 'role', e.target.value)}
                  className="rounded-lg h-10 text-[14px]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-apple-gray-500">Company / Organization</label>
                <Input
                  placeholder="Apex Software Labs"
                  value={exp.company}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdate(i, 'company', e.target.value)}
                  className="rounded-lg h-10 text-[14px]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-apple-gray-500">Employment Dates</label>
                <Input
                  placeholder="May 2025 – April 2026"
                  value={exp.date}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdate(i, 'date', e.target.value)}
                  className="rounded-lg h-10 text-[14px]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-apple-gray-500">Tech Stack Highlight</label>
                <Input
                  placeholder="React, Express.js, MongoDB..."
                  value={exp.tech}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdate(i, 'tech', e.target.value)}
                  className="rounded-lg h-10 text-[14px]"
                />
              </div>
            </div>

            <div className="space-y-1 pt-1">
              <label className="text-[11px] font-medium text-apple-gray-500">Bullet Points (one per line)</label>
              <textarea
                className="w-full min-h-27.5 p-3 rounded-lg border border-apple-gray-300 bg-apple-gray-100/50 text-apple-black text-[13px] leading-relaxed focus:outline-none focus:ring-2 focus:ring-apple-blue"
                placeholder="Implemented core features..."
                value={exp.bullets}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onUpdate(i, 'bullets', e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
