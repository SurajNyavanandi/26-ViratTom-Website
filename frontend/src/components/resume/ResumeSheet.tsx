import React from 'react';
import type { ResumeData, ResumeChunk } from '@/types/resume';
import { ResumeChunkRenderer } from './ResumeChunkRenderer';

interface ResumeSheetProps {
  pageIndex: number;
  totalPages: number;
  pageChunks: ResumeChunk[];
  activeResumeData: ResumeData;
  scale: number;
  isDummyPreview?: boolean;
}

export const ResumeSheet: React.FC<ResumeSheetProps> = ({
  pageIndex,
  totalPages,
  pageChunks,
  activeResumeData,
  scale,
  isDummyPreview = false,
}) => {
  return (
    <div
      className="page-sheet-container relative shrink-0 mx-auto transition-all duration-200 flex flex-col items-center"
      style={{
        width: `${794 * scale}px`,
        marginBottom: pageIndex === totalPages - 1 ? '0' : '32px',
      }}
    >
      <div className="no-print w-full flex items-center justify-between text-[11px] font-medium text-apple-gray-500 mb-2 px-1">
        <span>
          Page {pageIndex + 1} of {totalPages}
        </span>
        <span className="text-[10px] uppercase tracking-wider text-apple-gray-400">
          A4 • 794 × 1123 px
        </span>
      </div>
      <div
        style={{
          width: `${794 * scale}px`,
          height: `${1123 * scale}px`,
          position: 'relative',
        }}
      >
        <div
          className="page-sheet bg-white text-black shadow-[0_20px_50px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.06)] rounded-xs transition-transform duration-200 relative overflow-hidden flex flex-col justify-between"
          style={{
            width: '794px',
            height: '1123px',
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            boxSizing: 'border-box',
            padding: '12.7mm',
            fontFamily: '"Tinos", "Times New Roman", Times, "Liberation Serif", Georgia, serif',
            lineHeight: '1.3',
          }}
        >
          <div>
            {pageChunks.map((chunk: ResumeChunk, chunkIndex: number) => (
              <ResumeChunkRenderer
                key={`${chunk.type}-${chunkIndex}`}
                chunk={chunk}
                pageChunks={pageChunks}
                chunkIndex={chunkIndex}
                activeResumeData={activeResumeData}
                isDummyPreview={isDummyPreview}
              />
            ))}
          </div>

          {/* Ultra-minimal, elegant footer watermark */}
          <div
            className="w-full pt-2 flex items-center justify-between text-[8pt] text-[#9ca3af] border-t border-[#e5e7eb]"
            style={{
              fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
          >
            <a
              href="https://virattom.com"
              target="_blank"
              rel="noreferrer"
              className="text-[#9ca3af] hover:text-[#4b5563] transition-colors cursor-pointer"
              title="Visit ViratTom"
            >
              Created with ViratTom
            </a>
            <a
              href="https://virattom.com"
              target="_blank"
              rel="noreferrer"
              className="text-[#9ca3af] hover:text-[#4b5563] transition-colors cursor-pointer"
              title="Visit virattom.com"
            >
              virattom.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
