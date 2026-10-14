import React, { useState, useEffect, useRef } from 'react';
import { Lock } from 'lucide-react';

interface LiveWebsitePreviewProps {
  url: string;
  title: string;
  className?: string;
}

export const LiveWebsitePreview: React.FC<LiveWebsitePreviewProps> = ({
  url,
  title,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(0.3);
  const [iframeHeight, setIframeHeight] = useState<number>(750);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const cleanDomain = url.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const VIRTUAL_WIDTH = 1200;

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        const totalHeight = containerRef.current.clientHeight;
        const bodyHeight = Math.max(totalHeight - 28, 120); // subtracting top chrome bar
        if (width > 0) {
          const currentScale = width / VIRTUAL_WIDTH;
          setScale(currentScale);
          setIframeHeight(Math.round(bodyHeight / currentScale));
        }
      }
    };

    updateDimensions();
    const observer = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full aspect-16/10 bg-apple-gray-100 overflow-hidden flex flex-col select-none border-b border-apple-gray-200/80 ${className}`}
    >
      {/* Minimalist Browser Chrome Header */}
      <div className="h-7 w-full bg-[#f6f6f8] border-b border-apple-gray-200/80 px-3 flex items-center justify-between shrink-0 z-10">
        {/* Browser Traffic Lights */}
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#ff5f56]" />
          <div className="w-2 h-2 rounded-full bg-[#ffbd2e]" />
          <div className="w-2 h-2 rounded-full bg-[#27c93f]" />
        </div>

        {/* URL Pill */}
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white border border-apple-gray-200/60 text-[10px] text-apple-gray-600 font-mono max-w-[65%] truncate shadow-2xs">
          <Lock className="w-2.5 h-2.5 text-apple-gray-400 shrink-0" />
          <span className="truncate">{cleanDomain}</span>
        </div>

        {/* Live Status Indicator */}
        <div className="flex items-center gap-1 text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200/60">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>LIVE</span>
        </div>
      </div>

      {/* Frame Body Area - Directly displays the live website */}
      <div className="relative flex-1 w-full h-full overflow-hidden bg-white">
        {/* Subtle loading pulse until website renders */}
        {isLoading && (
          <div className="absolute inset-0 z-0 p-4 flex flex-col gap-2.5 bg-gradient-to-b from-apple-gray-50 to-white animate-pulse">
            <div className="h-4 w-1/4 bg-apple-gray-200/80 rounded" />
            <div className="h-16 w-full bg-apple-gray-200/50 rounded-lg" />
            <div className="grid grid-cols-3 gap-2 mt-2">
              <div className="h-14 bg-apple-gray-200/40 rounded" />
              <div className="h-14 bg-apple-gray-200/40 rounded" />
              <div className="h-14 bg-apple-gray-200/40 rounded" />
            </div>
          </div>
        )}

        {/* The Actual Scaled Live Website Iframe */}
        <iframe
          src={url}
          title={title}
          loading="lazy"
          scrolling="no"
          onLoad={() => setIsLoading(false)}
          tabIndex={-1}
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-0 w-[1200px] border-0 transition-opacity duration-300 z-1"
          style={{
            width: `${VIRTUAL_WIDTH}px`,
            height: `${iframeHeight}px`,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        />
      </div>
    </div>
  );
};
