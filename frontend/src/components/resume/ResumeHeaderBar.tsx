import React from 'react';
import { ArrowLeft, Download, Loader2, RotateCcw, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ResumeHeaderBarProps {
  mobileView: 'editor' | 'preview';
  setMobileView: (view: 'editor' | 'preview') => void;
  downloadCount: number;
  verifiedEmail: string;
  onSwitchEmail: () => void;
  hasCustomEdits: boolean;
  onResetResume: () => void;
  onInitiateDownload: () => void;
  isDownloading: boolean;
}

export const ResumeHeaderBar: React.FC<ResumeHeaderBarProps> = ({
  mobileView,
  setMobileView,
  downloadCount,
  verifiedEmail,
  onSwitchEmail,
  hasCustomEdits,
  onResetResume,
  onInitiateDownload,
  isDownloading,
}) => {
  return (
    <header className="no-print sticky top-0 z-40 w-full backdrop-blur-xl bg-apple-white/90 border-b border-apple-gray-200/80 transition-colors">
      <div className="mx-auto flex h-16 max-w-360 items-center justify-between px-4 sm:px-8">
        {/* Left Brand & Back */}
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-apple-gray-100 border border-apple-gray-200 flex items-center justify-center text-apple-gray-500 hover:text-apple-black transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0"
            title="Back to Home"
          >
            <ArrowLeft size={17} />
          </Link>
          <div className="hidden sm:block">
            <h1 className="text-[15px] font-semibold text-apple-black leading-none">
              Resume Builder
            </h1>
            <p className="text-[12px] text-apple-gray-500 mt-0.5">Create & Edit</p>
          </div>
        </div>

        {/* Middle Mobile Segmented View Control */}
        <div className="flex lg:hidden bg-apple-gray-100 p-1 rounded-xl border border-apple-gray-200">
          <button
            onClick={() => setMobileView('editor')}
            className={`px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-all cursor-pointer ${
              mobileView === 'editor'
                ? 'bg-white text-apple-black shadow-sm'
                : 'text-apple-gray-500 hover:text-apple-black'
            }`}
          >
            Editor
          </button>
          <button
            onClick={() => setMobileView('preview')}
            className={`px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-all cursor-pointer ${
              mobileView === 'preview'
                ? 'bg-white text-apple-black shadow-sm'
                : 'text-apple-gray-500 hover:text-apple-black'
            }`}
          >
            Preview
          </button>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Trust-building live download metric */}
          <div className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-apple-gray-100 border border-apple-gray-200 text-[12px] font-medium text-apple-gray-600 shadow-2xs">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              <strong className="text-apple-black font-semibold">
                {downloadCount.toLocaleString()}
              </strong>{' '}
              resumes downloaded
            </span>
          </div>

          {verifiedEmail && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-[12px] font-medium">
              <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
              <span className="truncate max-w-35 sm:max-w-50">{verifiedEmail}</span>
              <button
                onClick={onSwitchEmail}
                className="text-[11px] underline hover:text-emerald-700 ml-1 cursor-pointer"
                title="Switch email / change user"
              >
                Switch
              </button>
            </div>
          )}

          {hasCustomEdits && (
            <button
              onClick={onResetResume}
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-full border border-apple-gray-200 bg-apple-gray-100 text-apple-gray-600 hover:text-apple-red flex items-center justify-center transition-all cursor-pointer"
              title="Reset to default resume"
              aria-label="Reset resume"
            >
              <RotateCcw size={16} />
            </button>
          )}

          <button
            onClick={onInitiateDownload}
            disabled={isDownloading}
            className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-apple-blue hover:bg-apple-blue/90 text-white flex items-center justify-center shadow-sm active:scale-95 disabled:opacity-70 transition-all cursor-pointer"
            title="Download PDF"
            aria-label="Download PDF"
          >
            {isDownloading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Download size={17} />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
