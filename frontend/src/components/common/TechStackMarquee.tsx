import React from 'react';

interface TechItem {
  name: string;
  badge: string;
  hoverColor: string;
  svg: React.ReactNode;
}

const TECH_STACK: TechItem[] = [
  {
    name: 'React',
    badge: 'Frontend',
    hoverColor: 'group-hover:text-[#61DAFB]',
    svg: (
      <svg viewBox="-11.5 -10.23174 23 20.46348" className="w-5 h-5" fill="none">
        <circle cx="0" cy="0" r="2.05" fill="currentColor" />
        <g stroke="currentColor" strokeWidth="1" fill="none">
          <ellipse rx="11" ry="4.2" />
          <ellipse rx="11" ry="4.2" transform="rotate(60)" />
          <ellipse rx="11" ry="4.2" transform="rotate(120)" />
        </g>
      </svg>
    ),
  },
  {
    name: 'Node.js',
    badge: 'Backend & Runtime',
    hoverColor: 'group-hover:text-[#5FA04E]',
    svg: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M12 2a2.3 2.3 0 0 0-1.15.31L3.15 6.75A2.3 2.3 0 0 0 2 8.74v8.52a2.3 2.3 0 0 0 1.15 1.99l7.7 4.44a2.3 2.3 0 0 0 2.3 0l7.7-4.44A2.3 2.3 0 0 0 22 17.26V8.74a2.3 2.3 0 0 0-1.15-1.99L13.15 2.31A2.3 2.3 0 0 0 12 2zm0 2.31l7.7 4.43v8.52L12 21.69 4.3 17.26V8.74L12 4.31zm-3.5 4.5a1.2 1.2 0 0 0-1.2 1.2v3.98a1.2 1.2 0 0 0 2.4 0v-2.38l3.6 3.6a1.2 1.2 0 0 0 1.9-.98V10a1.2 1.2 0 0 0-2.4 0v2.38l-3.6-3.6a1.18 1.18 0 0 0-.7-.27z" />
      </svg>
    ),
  },
  {
    name: 'Express.js',
    badge: 'MERN API',
    hoverColor: 'group-hover:text-apple-black',
    svg: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M19.4 6.7c-.5-.7-1.3-1.2-2.3-1.4-1.4-.2-2.8.2-3.8 1.1-.9.8-1.4 2-1.4 3.2 0 1.3.6 2.4 1.5 3.1.9.7 2.1 1.1 3.2 1.1 1.2 0 2.3-.4 3.2-1.1l-1.3-1.6c-.6.5-1.3.8-2 .8-.7 0-1.4-.2-1.9-.7-.5-.5-.8-1.2-.8-1.9 0-.8.3-1.5.8-2 .5-.5 1.2-.8 1.9-.8.7 0 1.4.3 1.9.8l1-1.3zM4.6 7.4L7.8 12 4.5 16.6h2.7l1.9-2.8 1.9 2.8h2.7l-3.3-4.6 3.1-4.6H11.2l-1.8 2.7-1.8-2.7H4.6z" />
      </svg>
    ),
  },
  {
    name: 'MongoDB',
    badge: 'MERN Database',
    hoverColor: 'group-hover:text-[#47A248]',
    svg: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M12 1.5c-.32 0-.58.2-.7.49-1.38 3.14-5.3 9.47-5.3 13.56 0 4.14 2.87 7.24 6 7.55 0-.3.12-.76.22-1.2.78-2.8 1.44-5.7 1.44-8.6 0-1.94-.44-3.77-1.22-5.48-.22-.43-.44-.86-.44-1.29 0-.22 0-.43.33-.54.11 0 .22 0 .22.11 2.44 2.58 3.77 6.02 3.77 9.46 0 3.55-1.66 6.77-4.33 8.82v.32c3.78-.65 6.67-3.76 6.67-7.63 0-4.3-4.22-10.54-5.56-13.33-.22-.54-.56-.97-1.1-.97h-.01z" />
      </svg>
    ),
  },
  {
    name: 'React Native',
    badge: 'iOS & Android',
    hoverColor: 'group-hover:text-[#61DAFB]',
    svg: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="3" ry="3" />
        <path d="M12 18h.01" />
        <ellipse cx="12" cy="10" rx="4.5" ry="1.8" transform="rotate(-30 12 10)" />
        <ellipse cx="12" cy="10" rx="4.5" ry="1.8" transform="rotate(30 12 10)" />
        <circle cx="12" cy="10" r="0.8" fill="currentColor" />
      </svg>
    ),
  },
  {
    name: 'Next.js',
    badge: 'Full-Stack / SSR',
    hoverColor: 'group-hover:text-apple-black',
    svg: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M12 2C6.477 2 2 6.477 2 12c0 5.524 4.477 10 10 10 5.524 0 10-4.476 10-10 0-5.523-4.476-10-10-10zm3.5 14.5l-6-7.85v7.85H7.7V7.5h2l6 7.85V7.5h1.8v9h-2z" />
      </svg>
    ),
  },
  {
    name: 'TypeScript',
    badge: 'Type-Safe Code',
    hoverColor: 'group-hover:text-[#3178C6]',
    svg: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M3 3h18v18H3V3zm10.72 13.56c1.18 0 2.05-.33 2.6-.98.56-.66.84-1.6.84-2.82 0-.8-.15-1.45-.44-1.95-.29-.5-.73-.9-1.31-1.2-.44-.23-1.07-.46-1.91-.68-.6-.16-1-.31-1.22-.46-.22-.15-.33-.37-.33-.67 0-.31.13-.57.38-.76.26-.2.62-.29 1.1-.29.47 0 .88.11 1.22.33.34.22.56.57.65 1.05l1.63-.44c-.2-.79-.6-1.4-1.2-1.83-.6-.43-1.4-.65-2.4-.65-1.08 0-1.93.3-2.54.91-.61.6-.92 1.41-.92 2.42 0 .86.25 1.55.76 2.08.51.52 1.25.9 2.22 1.13.73.18 1.24.36 1.52.54.28.18.42.44.42.79 0 .39-.15.71-.46.95-.31.24-.75.36-1.32.36-.66 0-1.21-.16-1.63-.48-.43-.33-.69-.83-.78-1.51l-1.65.41c.18.98.63 1.73 1.34 2.26.71.53 1.69.8 2.93.8zm-5.74-.24V9.89H9.8V8.37H4.2v1.52h1.82v6.43h1.96z" />
      </svg>
    ),
  },
  {
    name: 'Tailwind CSS',
    badge: 'Modern UI',
    hoverColor: 'group-hover:text-[#38BDF8]',
    svg: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8 1 .25 1.7 1.05 2.5 1.95 1.3 1.5 2.8 3.25 6.5 3.25 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-1-.25-1.7-1.05-2.5-1.95-1.3-1.5-2.8-3.25-6.5-3.25zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8 1 .25 1.7 1.05 2.5 1.95 1.3 1.5 2.8 3.25 6.5 3.25 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-1-.25-1.7-1.05-2.5-1.95-1.3-1.5-2.8-3.25-6.5-3.25z" />
      </svg>
    ),
  },
];

export const TechStackMarquee: React.FC = () => {
  // Repeated sequence for completely seamless infinite loop on any screen width
  const duplicatedList = [...TECH_STACK, ...TECH_STACK, ...TECH_STACK, ...TECH_STACK];

  return (
    <div className="w-full py-10 sm:py-14 border-y border-apple-gray-200/70 bg-gradient-to-b from-white via-apple-gray-50/50 to-white overflow-hidden relative select-none">
      <div className="max-w-360 mx-auto px-4 sm:px-8 mb-6 sm:mb-7 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-apple-gray-100 border border-apple-gray-200/80 text-[11px] sm:text-[12px] font-semibold uppercase tracking-widest text-apple-gray-600">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Core Engineering & Full-Stack Technologies</span>
        </div>
      </div>

      {/* Infinite scrolling track with fade edge masks */}
      <div
        className="w-full relative overflow-hidden"
        style={{
          maskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
        }}
      >
        <div className="animate-marquee flex items-center gap-3 sm:gap-4 py-2 hover:[animation-play-state:paused]">
          {duplicatedList.map((tech, index) => (
            <div
              key={`${tech.name}-${index}`}
              className="group flex items-center gap-3 px-4.5 py-2.5 rounded-2xl bg-white/90 backdrop-blur-sm border border-apple-gray-200/80 shadow-2xs hover:shadow-md hover:border-apple-gray-300 hover:scale-105 hover:-translate-y-0.5 transition-all duration-300 ease-out cursor-pointer shrink-0"
            >
              <div
                className={`p-2 rounded-xl bg-apple-gray-100/80 group-hover:bg-white text-apple-gray-500 ${tech.hoverColor} group-hover:scale-110 transition-all duration-300 shadow-2xs shrink-0`}
              >
                {tech.svg}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[13.5px] font-semibold text-apple-gray-800 group-hover:text-apple-black transition-colors leading-tight">
                  {tech.name}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-apple-gray-400 group-hover:text-apple-blue font-medium leading-tight transition-colors">
                  {tech.badge}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
