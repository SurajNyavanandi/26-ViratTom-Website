import React from 'react';
import { Wrench } from 'lucide-react';

interface SkillsEditorProps {
  skills: string;
  onChange: (value: string) => void;
}

export const SkillsEditor: React.FC<SkillsEditorProps> = ({ skills, onChange }) => {
  return (
    <section className="bg-apple-gray-100 border border-apple-gray-200 rounded-2xl p-5 sm:p-6 space-y-4 transition-all duration-300">
      <div className="flex items-center justify-between pb-3 border-b border-apple-gray-200">
        <div className="flex items-center gap-2.5">
          <Wrench size={18} className="text-apple-blue" />
          <h2 className="text-[17px] font-semibold text-apple-black tracking-[-0.01em]">
            Technical Skills
          </h2>
        </div>
        <span className="text-[12px] text-apple-gray-500">Category: Items (one per line)</span>
      </div>

      <textarea
        className="w-full min-h-35 p-4 rounded-xl border border-apple-gray-300 bg-white text-apple-black text-[14px] leading-relaxed focus:outline-none focus:ring-2 focus:ring-apple-blue transition-all"
        value={skills}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
        placeholder="Languages: JavaScript, TypeScript...\nFrontend: React, Tailwind CSS..."
      />
    </section>
  );
};
