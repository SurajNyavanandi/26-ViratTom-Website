import React from 'react';
import { GraduationCap, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { EducationItem } from '@/types/resume';

interface EducationEditorProps {
  education: EducationItem[];
  onAdd: () => void;
  onUpdate: (index: number, field: keyof EducationItem, value: string) => void;
  onRemove: (index: number) => void;
}

export const EducationEditor: React.FC<EducationEditorProps> = ({
  education,
  onAdd,
  onUpdate,
  onRemove,
}) => {
  return (
    <section className="bg-apple-gray-100 border border-apple-gray-200 rounded-2xl p-5 sm:p-6 space-y-5 transition-all duration-300">
      <div className="flex items-center justify-between pb-3 border-b border-apple-gray-200">
        <div className="flex items-center gap-2.5">
          <GraduationCap size={18} className="text-apple-blue" />
          <h2 className="text-[17px] font-semibold text-apple-black tracking-[-0.01em]">
            Education
          </h2>
        </div>
        <Button
          variant="secondary"
          onClick={onAdd}
          className="rounded-xl px-3.5 py-1.5 text-[13px] h-9 gap-1.5"
        >
          <Plus size={15} /> Add Degree
        </Button>
      </div>

      <div className="space-y-4">
        {education.map((edu: EducationItem, i: number) => (
          <div
            key={edu.id}
            className="p-5 bg-white rounded-xl border border-apple-gray-200 space-y-3 relative shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md transition-shadow"
          >
            <button
              onClick={() => onRemove(i)}
              className="absolute top-4 right-4 text-apple-gray-400 hover:text-apple-red hover:bg-apple-red/10 p-1.5 rounded-lg transition-colors cursor-pointer"
              title="Remove Degree"
            >
              <Trash2 size={16} />
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-8">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-apple-gray-500">Degree & Specialization</label>
                <Input
                  placeholder="B.Tech. Electrical..."
                  value={edu.degree}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdate(i, 'degree', e.target.value)}
                  className="rounded-lg h-10 text-[14px]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-apple-gray-500">Graduation Date</label>
                <Input
                  placeholder="Graduated: July 2022"
                  value={edu.date}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdate(i, 'date', e.target.value)}
                  className="rounded-lg h-10 text-[14px]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-apple-gray-500">Institution</label>
                <Input
                  placeholder="University Name"
                  value={edu.institution}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdate(i, 'institution', e.target.value)}
                  className="rounded-lg h-10 text-[14px]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-apple-gray-500">Score / CGPA</label>
                <Input
                  placeholder="CGPA: 8.10 / 10"
                  value={edu.score}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdate(i, 'score', e.target.value)}
                  className="rounded-lg h-10 text-[14px]"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
