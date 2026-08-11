import React from 'react';

export const RotatingGlobeBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center opacity-10 dark:opacity-15 transition-opacity duration-500">
      <div className="w-[800px] h-[800px] md:w-[1200px] md:h-[1200px] rounded-full relative animate-[spin_120s_linear_infinite] transform-gpu">
        {/* Wireframe Globe Lines */}
        <svg viewBox="0 0 500 500" className="w-full h-full text-blue-600 dark:text-cyan-400 stroke-current fill-none">
          {/* Outer Ring */}
          <circle cx="250" cy="250" r="240" strokeWidth="1.5" strokeDasharray="6 6" />
          <circle cx="250" cy="250" r="230" strokeWidth="0.8" />
          
          {/* Latitudes */}
          <ellipse cx="250" cy="250" rx="230" ry="60" strokeWidth="0.8" />
          <ellipse cx="250" cy="250" rx="230" ry="120" strokeWidth="0.8" />
          <ellipse cx="250" cy="250" rx="230" ry="180" strokeWidth="0.8" />
          <ellipse cx="250" cy="250" rx="230" ry="220" strokeWidth="0.8" />

          {/* Longitudes */}
          <ellipse cx="250" cy="250" rx="60" ry="230" strokeWidth="0.8" />
          <ellipse cx="250" cy="250" rx="120" ry="230" strokeWidth="0.8" />
          <ellipse cx="250" cy="250" rx="180" ry="230" strokeWidth="0.8" />
          <ellipse cx="250" cy="250" rx="220" ry="230" strokeWidth="0.8" />

          {/* Axis Line */}
          <line x1="250" y1="10" x2="250" y2="490" strokeWidth="1" strokeDasharray="4 4" />

          {/* Humanitarian Relay Dots (Middle East / Global Nodes) */}
          <circle cx="250" cy="250" r="4" className="fill-red-500 animate-ping" />
          <circle cx="280" cy="200" r="3" className="fill-blue-500" />
          <circle cx="210" cy="220" r="3" className="fill-emerald-500" />
          <circle cx="310" cy="260" r="3" className="fill-amber-500" />
          <circle cx="180" cy="290" r="3" className="fill-indigo-500" />
          <circle cx="290" cy="310" r="3" className="fill-rose-500" />

          {/* Connection Arc */}
          <path d="M 250 250 Q 280 200 310 260" strokeWidth="1.5" className="stroke-red-500" strokeDasharray="3 3" />
          <path d="M 250 250 Q 210 220 180 290" strokeWidth="1.5" className="stroke-blue-500" strokeDasharray="3 3" />
        </svg>

        {/* Outer Orbital Ring */}
        <div className="absolute inset-0 rounded-full border border-red-500/20 dark:border-red-500/30 animate-[spin_90s_linear_infinite_reverse]" />
      </div>
    </div>
  );
};
