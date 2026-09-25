import React from 'react';
import { ZoomIn, ZoomOut, Maximize2, CheckCircle2, Sparkles } from 'lucide-react';
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
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
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
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onLoadSampleData,
}) => {
  return (
    <main
      ref={containerRef}
      className={`w-full lg:w-1/2 bg-apple-gray-100 py-6 px-2 sm:px-4 flex flex-col items-center print:p-0 print:bg-white overflow-y-auto overflow-x-auto lg:h-[calc(100vh-64px)] pb-32 transition-colors ${
        mobileView === 'editor' ? 'hidden lg:flex' : 'flex'
      }`}
    >
      {/* Top Preview Controls Toolbar */}
      <div className="no-print flex items-center justify-between gap-3 w-full max-w-[794px] mb-4 px-2">
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
              Sample Preview (Lightweight)
            </span>
          )}
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 bg-white border border-apple-gray-200 rounded-xl p-1 shadow-xs">
          <button
            onClick={onZoomOut}
            className="p-1.5 rounded-lg text-apple-gray-500 hover:text-apple-black hover:bg-apple-gray-100 transition-all cursor-pointer"
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <ZoomOut size={14} />
          </button>
          <button
            onClick={onResetZoom}
            className="px-2 py-1 rounded-lg text-[11.5px] font-semibold text-apple-gray-600 hover:bg-apple-gray-100 transition-all cursor-pointer min-w-12 text-center"
            title="Fit to Screen"
          >
            {Math.round(scale * 100)}%
          </button>
          <button
            onClick={onZoomIn}
            className="p-1.5 rounded-lg text-apple-gray-500 hover:text-apple-black hover:bg-apple-gray-100 transition-all cursor-pointer"
            title="Zoom In"
            aria-label="Zoom In"
          >
            <ZoomIn size={14} />
          </button>
          <button
            onClick={onResetZoom}
            className="p-1.5 rounded-lg text-apple-gray-500 hover:text-apple-black hover:bg-apple-gray-100 transition-all cursor-pointer ml-0.5"
            title="Reset Zoom / Fit Screen"
            aria-label="Fit Screen"
          >
            <Maximize2 size={13} />
          </button>
        </div>
      </div>

      {/* Dummy Notice Banner */}
      {isDummyPreview && (
        <div className="no-print mb-4 w-full max-w-[794px] p-3 rounded-2xl bg-apple-blue/10 border border-apple-blue/20 text-apple-blue text-[12px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 shadow-xs">
          <div className="flex items-center gap-2">
            <Sparkles size={15} className="shrink-0 text-apple-blue" />
            <span>
              <strong>Sample Preview Mode:</strong> Showing a 2-page sample resume in lightweight font. Fill in your details on the editor to preview your live resume!
            </span>
          </div>
          <button
            onClick={onLoadSampleData}
            className="px-2.5 py-1 bg-apple-blue text-white rounded-lg text-[11px] font-medium hover:bg-apple-blue/90 shrink-0 cursor-pointer transition-all self-end sm:self-auto"
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
