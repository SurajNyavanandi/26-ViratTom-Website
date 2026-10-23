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
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);

  const cleanUrl = (url || '').trim();
  const domain = cleanUrl.replace(/^https?:\/\//i, '').replace(/\/$/, '');

  // Desktop viewport virtual dimensions (standard 1280x800 desktop viewport)
  const VIRTUAL_WIDTH = 1280;
  const VIRTUAL_HEIGHT = 800;

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        if (width > 0) {
          setScale(width / VIRTUAL_WIDTH);
        }
      }
    };

    updateScale();

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      resizeObserver = new ResizeObserver(() => updateScale());
      resizeObserver.observe(containerRef.current);
    } else {
      window.addEventListener('resize', updateScale);
    }

    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener('resize', updateScale);
    };
  }, []);

  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [cleanUrl]);

  return (
    <div className={`relative w-full overflow-hidden select-none border-b border-apple-gray-200/80 bg-apple-gray-50 flex flex-col ${className}`}>
      {/* Sleek Browser Chrome Top Bar */}
      <div className="w-full h-8 px-3.5 bg-apple-gray-100/90 border-b border-apple-gray-200/70 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]/80 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]/80 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F]/80 inline-block" />
        </div>

        {/* URL Pill */}
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-white/80 border border-apple-gray-200/60 shadow-[0_1px_2px_rgba(0,0,0,0.03)] text-[10.5px] font-mono text-apple-gray-600 max-w-[200px] sm:max-w-[240px] truncate">
          <Lock className="w-2.5 h-2.5 text-apple-gray-400 shrink-0" />
          <span className="truncate">{domain}</span>
        </div>

        {/* Live indicator */}
        <div className="flex items-center gap-1.5 text-[10.5px] font-medium text-emerald-600">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="hidden sm:inline text-[10px] tracking-wide uppercase font-semibold text-apple-gray-500">Live View</span>
        </div>
      </div>

      {/* Viewport Frame Container (16:10 desktop scaled aspect ratio preview) */}
      <div 
        ref={containerRef}
        className="relative w-full aspect-16/10 bg-apple-gray-100 overflow-hidden"
      >
        {/* Skeleton Shimmer Loading Placeholder */}
        {!isLoaded && !hasError && (
          <div className="absolute inset-0 z-1 p-5 flex flex-col justify-between bg-apple-gray-100 animate-pulse">
            <div className="space-y-3">
              <div className="h-5 w-1/3 bg-apple-gray-200/90 rounded-md" />
              <div className="h-4 w-2/3 bg-apple-gray-200/70 rounded-md" />
            </div>
            <div className="space-y-2.5 my-auto">
              <div className="h-28 bg-apple-gray-200/50 rounded-xl" />
            </div>
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <div className="h-3.5 w-16 bg-apple-gray-200/80 rounded" />
                <div className="h-3.5 w-24 bg-apple-gray-200/60 rounded" />
              </div>
              <span className="text-[11px] font-medium text-apple-gray-500">
                Loading Live Sandbox...
              </span>
            </div>
          </div>
        )}

        {/* Live Interactive Sandbox Desktop iFrame (Micro-Viewport CSS Scaling) */}
        {cleanUrl && !hasError ? (
          <iframe
            src={cleanUrl}
            title={`${title} Live Sandbox`}
            loading="lazy"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            onLoad={() => setIsLoaded(true)}
            onError={() => setHasError(true)}
            style={{
              width: `${VIRTUAL_WIDTH}px`,
              height: `${VIRTUAL_HEIGHT}px`,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
            }}
            className={`absolute top-0 left-0 border-0 pointer-events-none transition-opacity duration-500 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ) : (
          /* Minimalist Fallback */
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-apple-gray-50 via-white to-apple-gray-100 text-center">
            <div className="w-12 h-12 rounded-2xl bg-apple-blue/10 flex items-center justify-center text-apple-blue font-bold text-lg mb-2 shadow-xs">
              {title.slice(0, 2).toUpperCase()}
            </div>
            <h4 className="text-[15px] font-semibold text-apple-black">{title}</h4>
            <p className="text-[12px] font-normal text-apple-gray-500 mt-1 max-w-xs">
              Click to launch live production site
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
