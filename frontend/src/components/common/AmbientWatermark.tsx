import React from 'react';

export const AmbientWatermark: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-0 pointer-events-none select-none flex items-center justify-center overflow-hidden"
    >
      <div className="animate-watermark-drift transition-colors duration-1000 will-change-transform">
        <span
          className="font-black text-black dark:text-white uppercase select-none text-[24vw] leading-none block text-center"
          style={{
            letterSpacing: '0.24em',
            WebkitTextStroke: '1.5px currentColor',
          }}
        >
          RAM
        </span>
      </div>
    </div>
  );
};
