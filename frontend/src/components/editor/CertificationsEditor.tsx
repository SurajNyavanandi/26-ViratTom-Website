import React from 'react';
import { Award } from 'lucide-react';

interface CertificationsEditorProps {
  certifications: string;
  onChange: (value: string) => void;
}

export const CertificationsEditor: React.FC<CertificationsEditorProps> = ({
  certifications,
  onChange,
}) => {
  return (
    <section className="bg-apple-gray-100 border border-apple-gray-200 rounded-2xl p-5 sm:p-6 space-y-4 transition-all duration-300">
      <div className="flex items-center justify-between pb-3 border-b border-apple-gray-200">
        <div className="flex items-center gap-2.5">
          <Award size={18} className="text-apple-blue" />
          <h2 className="text-[17px] font-semibold text-apple-black tracking-[-0.01em]">
            Certifications & Accreditations
          </h2>
        </div>
      </div>

      <textarea
        className="w-full min-h-25 p-4 rounded-xl border border-apple-gray-300 bg-white text-apple-black text-[14px] leading-relaxed focus:outline-none focus:ring-2 focus:ring-apple-blue transition-all"
        value={certifications}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
        placeholder="Enterprise Certification in Java/J2EE (2022): Comprehensive training in Java fundamentals..."
      />
    </section>
  );
};
