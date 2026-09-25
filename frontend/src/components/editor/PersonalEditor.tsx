import React from 'react';
import { User } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import type { ResumeHeader } from '@/types/resume';

interface PersonalEditorProps {
  header: ResumeHeader;
  onChange: (field: keyof ResumeHeader, value: string) => void;
}

export const PersonalEditor: React.FC<PersonalEditorProps> = ({ header, onChange }) => {
  return (
    <section className="bg-apple-gray-100 border border-apple-gray-200 rounded-2xl p-5 sm:p-6 space-y-5 transition-all duration-300">
      <div className="flex items-center justify-between pb-3 border-b border-apple-gray-200">
        <div className="flex items-center gap-2.5">
          <User size={18} className="text-apple-blue" />
          <h2 className="text-[17px] font-semibold text-apple-black tracking-[-0.01em]">
            Personal & Contact Details
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[12px] font-medium text-apple-gray-600">Full Name</label>
          <Input
            value={header.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange('name', e.target.value)}
            placeholder="John Appleseed"
            className="rounded-xl border-apple-gray-300 bg-white"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[12px] font-medium text-apple-gray-600">Professional Role</label>
          <Input
            value={header.role}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange('role', e.target.value)}
            placeholder="MERN Stack Developer"
            className="rounded-xl border-apple-gray-300 bg-white"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[12px] font-medium text-apple-gray-600">Location</label>
          <Input
            value={header.location}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange('location', e.target.value)}
            placeholder="City, State"
            className="rounded-xl border-apple-gray-300 bg-white"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[12px] font-medium text-apple-gray-600">Phone</label>
          <Input
            value={header.phone}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange('phone', e.target.value)}
            placeholder="+1-555-0199"
            className="rounded-xl border-apple-gray-300 bg-white"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[12px] font-medium text-apple-gray-600">Email Address</label>
          <Input
            value={header.email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange('email', e.target.value)}
            placeholder="user@domain.com"
            className="rounded-xl border-apple-gray-300 bg-white"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[12px] font-medium text-apple-gray-600">GitHub Profile</label>
          <Input
            value={header.github}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange('github', e.target.value)}
            placeholder="github.com/username"
            className="rounded-xl border-apple-gray-300 bg-white"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[12px] font-medium text-apple-gray-600">LinkedIn Profile</label>
          <Input
            value={header.linkedin}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange('linkedin', e.target.value)}
            placeholder="linkedin.com/in/username"
            className="rounded-xl border-apple-gray-300 bg-white"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[12px] font-medium text-apple-gray-600">Portfolio URL Label</label>
          <Input
            value={header.portfolio}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange('portfolio', e.target.value)}
            placeholder="virattom.com"
            className="rounded-xl border-apple-gray-300 bg-white"
          />
        </div>

        <div className="col-span-1 sm:col-span-2 space-y-1.5">
          <label className="text-[12px] font-medium text-apple-gray-600">Live Projects Tagline</label>
          <Input
            value={header.liveProjects}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange('liveProjects', e.target.value)}
            placeholder="Project A | Project B | Project C"
            className="rounded-xl border-apple-gray-300 bg-white"
          />
        </div>
      </div>
    </section>
  );
};
