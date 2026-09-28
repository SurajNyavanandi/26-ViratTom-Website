import React from 'react';
import { CheckCircle2, Sparkles } from 'lucide-react';
import type { ResumeData, ResumeChunk } from '@/types/resume';
import { ResumeSheet } from './ResumeSheet';

interface ResumePreviewProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  dynamicPages: ResumeChunk[][];
  activeResumeData: ResumeData;
  scale: number;
  downloadCount: number;
  isDummyPreview: boolean;
  mobileView: 'editor' | 'preview';
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onResetZoom?: () => void;
  onLoadSampleData: () => void;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({
  containerRef,
  dynamicPages,
  activeResumeData,
  scale,
  downloadCount,
  isDummyPreview,
  mobileView,
  onLoadSampleData,
}) => {
  return (
    <main
      ref={containerRef}
      className={`w-full lg:w-1/2 bg-apple-gray-100 py-6 px-2 sm:px-4 flex flex-col items-center print:p-0 print:bg-white overflow-y-auto overflow-x-auto lg:h-[calc(100vh-64px)] pb-32 transition-colors ${
        mobileView === 'editor' ? 'hidden lg:flex' : 'flex'
      }`}
    >
      {/* Top Preview Controls Toolbar - hidden on mobile for clean clutter-free view */}
      <div className="no-print hidden sm:flex items-center justify-between gap-3 w-full max-w-[794px] mb-4 px-2">
        <div className="flex items-center gap-2 text-[12px] text-apple-gray-500 font-medium">
          <span>
            {dynamicPages.length} {dynamicPages.length === 1 ? 'Page' : 'Pages'}
          </span>
          <span className="text-apple-gray-300">•</span>
          <span className="inline-flex items-center gap-1 text-[11.5px] text-emerald-600">
            <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
            {downloadCount.toLocaleString()} downloaded
          </span>
          {isDummyPreview && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 text-[11px] font-medium border border-amber-500/20">
              Sample Preview
            </span>
          )}
        </div>
      </div>

      {/* Sample Notice Banner - desktop only, concise and clean */}
      {isDummyPreview && (
        <div className="no-print mb-3 w-full max-w-[794px] px-3 py-2 rounded-xl bg-apple-blue/5 border border-apple-blue/15 text-apple-blue text-[12px] hidden sm:flex items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="shrink-0 text-apple-blue" />
            <span>
              <strong>Sample Preview Mode:</strong> Showing sample template. Fill in details in the editor to customize.
            </span>
          </div>
          <button
            onClick={onLoadSampleData}
            className="px-2.5 py-1 bg-apple-blue text-white rounded-lg text-[11px] font-medium hover:bg-apple-blue/90 shrink-0 cursor-pointer transition-all active:scale-95"
          >
            Populate Form
          </button>
        </div>
      )}

      {/* Render Pages */}
      <div className="flex flex-col items-center w-full">
        {dynamicPages.map((pageChunks: ResumeChunk[], pageIndex: number) => (
          <ResumeSheet
            key={pageIndex}
            pageIndex={pageIndex}
            totalPages={dynamicPages.length}
            pageChunks={pageChunks}
            activeResumeData={activeResumeData}
            scale={scale}
            isDummyPreview={isDummyPreview}
          />
        ))}
      </div>
    </main>
  );
};
