import React, { useState, useRef, useEffect } from 'react';

interface LiveWebsitePreviewProps {
  url: string;
  title: string;
  imageUrl?: string;
  className?: string;
}

export const LiveWebsitePreview: React.FC<LiveWebsitePreviewProps> = ({
  url,
  title,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(0.4);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Clean URL to ensure full protocol
  const cleanUrl = (url || '').trim();

  // Desktop viewport dimensions to emulate for authentic desktop layout
  const VIRTUAL_WIDTH = 1280;
  const VIRTUAL_HEIGHT = 800; // Matches 16:10 aspect ratio

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

    // Responsive ResizeObserver to adapt dynamically on window resize or layout change
    const resizeObserver = new ResizeObserver(() => {
      updateScale();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full aspect-16/10 bg-apple-gray-100 overflow-hidden select-none border-b border-apple-gray-200/80 ${className}`}
    >
      {/* Skeleton Shimmer Loading Placeholder */}
      <div
        className={`absolute inset-0 z-10 p-5 flex flex-col justify-between bg-apple-gray-100 transition-opacity duration-500 ${
          isLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100 animate-pulse'
        }`}
      >
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
          <span className="text-[11px] font-semibold text-apple-gray-500 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-apple-blue animate-ping inline-block" />
            Live Sandbox
          </span>
        </div>
      </div>

      {/* Real Live-Updating Sandboxed Desktop iFrame (Micro-Viewport CSS Scaling) */}
      {cleanUrl ? (
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none transition-transform duration-500 ease-out group-hover:scale-[1.02]"
          style={{ width: '100%', height: '100%' }}
        >
          <iframe
            src={cleanUrl}
            title={`${title} Live Website Preview`}
            loading="lazy"
            tabIndex={-1}
            aria-hidden="true"
            sandbox="allow-scripts allow-same-origin"
            onLoad={() => setIsLoaded(true)}
            style={{
              width: `${VIRTUAL_WIDTH}px`,
              height: `${VIRTUAL_HEIGHT}px`,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              border: 0,
            }}
            className={`pointer-events-none transition-opacity duration-700 ease-out ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </div>
      ) : (
        /* Fallback if no URL is provided */
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-apple-gray-50 via-white to-apple-gray-100 text-center">
          <div className="w-12 h-12 rounded-2xl bg-apple-blue/10 flex items-center justify-center text-apple-blue font-bold text-lg mb-2 shadow-xs">
            {title.slice(0, 2).toUpperCase()}
          </div>
          <h4 className="text-[16px] font-bold text-apple-black">{title}</h4>
          <p className="text-[12px] font-medium text-apple-gray-500 mt-1 max-w-xs">
            Click to explore the live website
          </p>
        </div>
      )}
    </div>
  );
};
