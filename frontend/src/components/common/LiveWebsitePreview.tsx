import React, { useState, useEffect } from 'react';

interface LiveWebsitePreviewProps {
  url: string;
  title: string;
  imageUrl?: string;
  className?: string;
}

export const LiveWebsitePreview: React.FC<LiveWebsitePreviewProps> = ({
  url,
  title,
  imageUrl,
  className = '',
}) => {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);

  const cleanUrl = (url || '').trim();

  // Compute live high-resolution automated screenshot URL via Microlink Screenshot API
  const screenshotUrl = cleanUrl
    ? `https://api.microlink.io/?url=${encodeURIComponent(cleanUrl)}&screenshot=true&meta=false&embed=screenshot.url`
    : '';

  const activeSrc = imageUrl && !imageUrl.endsWith('.svg') ? imageUrl : screenshotUrl;

  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [activeSrc]);

  return (
    <div
      className={`relative w-full aspect-16/10 bg-apple-gray-100 overflow-hidden select-none border-b border-apple-gray-200/80 ${className}`}
    >
      {/* Skeleton Shimmer Loading Placeholder (zero lag) */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 z-0 p-5 flex flex-col justify-between bg-apple-gray-100 animate-pulse">
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
              <span className="w-2 h-2 rounded-full bg-apple-blue inline-block" />
              Live Snapshot
            </span>
          </div>
        </div>
      )}

      {/* Real Live-Updating Screenshot Image (Zero Scripts, Zero Console Errors, Instant Load) */}
      {activeSrc && !hasError ? (
        <img
          src={activeSrc}
          alt={`${title} live website preview`}
          loading="lazy"
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`w-full h-full object-cover object-top transition-all duration-500 ease-out group-hover:scale-[1.03] ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ) : (
        /* Clean Minimalist Fallback */
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-apple-gray-50 via-white to-apple-gray-100 text-center">
          <div className="w-12 h-12 rounded-2xl bg-apple-blue/10 flex items-center justify-center text-apple-blue font-bold text-lg mb-2 shadow-xs">
            {title.slice(0, 2).toUpperCase()}
          </div>
          <h4 className="text-[16px] font-bold text-apple-black">{title}</h4>
          <p className="text-[12px] font-medium text-apple-gray-500 mt-1 max-w-xs">
            Click to open live production website
          </p>
        </div>
      )}
    </div>
  );
};
