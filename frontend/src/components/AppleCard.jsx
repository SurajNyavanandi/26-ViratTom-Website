import { useState, useRef, useCallback } from 'react';
import { Wifi } from 'lucide-react';

/**
 * Apple-style 3D Interactive Titanium Card
 */
export default function AppleCard() {
  const cardRef = useRef(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -12;
    const rotateY = ((x - centerX) / centerX) * 12;

    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setRotate({ x: rotateX, y: rotateY });
    setGlare({ x: glareX, y: glareY, opacity: 0.85 });
  }, []);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotate({ x: 0, y: 0 });
    setGlare((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div className="perspective-1000 w-full max-w-md mx-auto">
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) ${
            isHovered ? 'scale3d(1.02, 1.02, 1.02)' : 'scale3d(1, 1, 1)'
          }`,
          transition: isHovered
            ? 'transform 0.08s ease-out'
            : 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
        }}
        className="relative preserve-3d w-full aspect-[1.586/1] rounded-2xl sm:rounded-3xl p-7 sm:p-9 bg-linear-to-br from-[#ffffff] via-[#fafafc] to-[#f1f3f7] border border-slate-200/90 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.08),0_0_1px_1px_rgba(0,0,0,0.04)] cursor-pointer select-none overflow-hidden flex flex-col justify-between"
      >
        {/* Holographic light sheen reflection */}
        <div
          className="pointer-events-none absolute inset-0 z-20 rounded-2xl sm:rounded-3xl transition-opacity duration-300 mix-blend-color-dodge"
          style={{
            opacity: glare.opacity,
            background: `radial-gradient(circle 380px at ${glare.x}% ${glare.y}%, rgba(255, 255, 255, 0.95), rgba(186, 230, 253, 0.35) 25%, rgba(244, 114, 182, 0.25) 50%, rgba(192, 132, 252, 0.2) 70%, transparent 90%)`,
          }}
        />

        {/* Card Top Row: EMV Chip & Contactless */}
        <div className="relative z-10 flex items-start justify-between">
          <div className="w-11 h-9 rounded-lg bg-linear-to-br from-amber-100 via-amber-200 to-amber-300 border border-amber-400/50 shadow-inner flex flex-col justify-between p-1 opacity-90">
            <div className="flex justify-between h-2 border-b border-amber-400/40">
              <div className="w-2 border-r border-amber-400/40" />
              <div className="w-2 border-l border-amber-400/40" />
            </div>
            <div className="flex justify-between h-2">
              <div className="w-2 border-r border-amber-400/40" />
              <div className="w-2 border-l border-amber-400/40" />
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400">
            <Wifi className="w-5 h-5 rotate-90 stroke-[1.5]" />
          </div>
        </div>

        {/* Card Center: Brand Heading & Subtitle */}
        <div className="relative z-10 space-y-1.5 text-left my-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-slate-900 leading-none">
            VI<span className="text-blue-500 font-bold">RA</span>T TO<span className="text-blue-500 font-bold">M</span>
          </h1>

          <p className="text-xs sm:text-sm font-medium text-slate-500 tracking-tight">
            Static and Dynamic Website Development
          </p>
        </div>

        {/* Card Bottom Empty spacer for balanced card physics */}
        <div className="relative z-10 h-2" />
      </div>
    </div>
  );
}
