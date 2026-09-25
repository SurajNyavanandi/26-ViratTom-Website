import React from 'react';
import { FolderGit2, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { ProjectItem } from '@/types/resume';

interface ProjectsEditorProps {
  projects: ProjectItem[];
  onAdd: () => void;
  onUpdate: (index: number, field: keyof ProjectItem, value: string) => void;
  onRemove: (index: number) => void;
}

export const ProjectsEditor: React.FC<ProjectsEditorProps> = ({
  projects,
  onAdd,
  onUpdate,
  onRemove,
}) => {
  return (
    <section className="bg-apple-gray-100 border border-apple-gray-200 rounded-2xl p-5 sm:p-6 space-y-5 transition-all duration-300">
      <div className="flex items-center justify-between pb-3 border-b border-apple-gray-200">
        <div className="flex items-center gap-2.5">
          <FolderGit2 size={18} className="text-apple-blue" />
          <h2 className="text-[17px] font-semibold text-apple-black tracking-[-0.01em]">
            Featured Projects
          </h2>
        </div>
        <Button
          variant="secondary"
          onClick={onAdd}
          className="rounded-xl px-3.5 py-1.5 text-[13px] h-9 gap-1.5"
        >
          <Plus size={15} /> Add Project
        </Button>
      </div>

      <div className="space-y-4">
        {projects.map((proj: ProjectItem, i: number) => (
          <div
            key={proj.id}
            className="p-5 bg-white rounded-xl border border-apple-gray-200 space-y-3 relative shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md transition-shadow"
          >
            <button
              onClick={() => onRemove(i)}
              className="absolute top-4 right-4 text-apple-gray-400 hover:text-apple-red hover:bg-apple-red/10 p-1.5 rounded-lg transition-colors cursor-pointer"
              title="Remove Project"
            >
              <Trash2 size={16} />
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-8">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-apple-gray-500">Project Name</label>
                <Input
                  placeholder="StoreAndManage Platform"
                  value={proj.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdate(i, 'name', e.target.value)}
                  className="rounded-lg h-10 text-[14px]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-apple-gray-500">Tech Stack</label>
                <Input
                  placeholder="React, Vite, Node.js..."
                  value={proj.tech}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdate(i, 'tech', e.target.value)}
                  className="rounded-lg h-10 text-[14px]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-apple-gray-500">Live Demo Label</label>
                <Input
                  placeholder="shop.virattom.com"
                  value={proj.demoLabel}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdate(i, 'demoLabel', e.target.value)}
                  className="rounded-lg h-10 text-[14px]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-apple-gray-500">Demo URL</label>
                <Input
                  placeholder="https://shop.virattom.com"
                  value={proj.demoLink}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdate(i, 'demoLink', e.target.value)}
                  className="rounded-lg h-10 text-[14px]"
                />
              </div>
            </div>

            <div className="space-y-1 pt-1">
              <label className="text-[11px] font-medium text-apple-gray-500">
                Project Description Bullets (one per line)
              </label>
              <textarea
                className="w-full min-h-27.5 p-3 rounded-lg border border-apple-gray-300 bg-apple-gray-100/50 text-apple-black text-[13px] leading-relaxed focus:outline-none focus:ring-2 focus:ring-apple-blue"
                placeholder="Developed features..."
                value={proj.bullets}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onUpdate(i, 'bullets', e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
