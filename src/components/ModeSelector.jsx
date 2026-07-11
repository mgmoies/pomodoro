import React from 'react';

// Hand-drawn vector outlines matching the retro engraving theme
const TomatoIcon = () => (
  <svg className="w-4 h-4 mr-1.5 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v3m0 0c-3 0-5.5 1.5-6.5 4-1 2.5-.5 5.5 1.5 7.5s5 2.5 7.5 1.5c2.5-1 4-3.5 4-6.5s-1.5-5.5-4-6.5c-.7-.3-1.6-.5-2.5-.5z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6c.5-1.5 1.5-2.5 3-2.5M12 6c-.5-1.5-1.5-2.5-3-2.5" />
  </svg>
);

const CupIcon = () => (
  <svg className="w-4 h-4 mr-1.5 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 10h12v5a5 5 0 01-5 5h-2a5 5 0 01-5-5v-5zM18 10h1a2 2 0 012 2v2a2 2 0 01-2 2h-1M9 3v3M12 3v3M15 3v3" />
  </svg>
);

const LeafIcon = () => (
  <svg className="w-4 h-4 mr-1.5 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M12 3C8 7 8 13 12 17M12 7c4 0 6 3 6 6s-2 4-6 4M12 11c-3-1-4-3-4-5M12 14c3-1 4-3 4-5" />
  </svg>
);

export default function ModeSelector({ mode, onModeChange }) {
  return (
    <div className="flex justify-center gap-3 mb-6 flex-wrap font-sans font-extrabold text-xs">
      <button 
        onClick={() => onModeChange('pomo')}
        className={`flex items-center px-5 py-2.5 border-[3px] border-app-br transition-all duration-150 cursor-pointer ${
          mode === 'pomo' 
            ? 'bg-tomato text-white shadow-retro translate-x-[-2px] translate-y-[-2px]' 
            : 'bg-app-card text-app-mt hover:border-tomato hover:text-tomato shadow-retro-sm shadow-retro-hover'
        }`}
      >
        <TomatoIcon /> Pomodoro
      </button>

      <button 
        onClick={() => onModeChange('short')}
        className={`flex items-center px-5 py-2.5 border-[3px] border-app-br transition-all duration-150 cursor-pointer ${
          mode === 'short' 
            ? 'bg-short text-white shadow-retro translate-x-[-2px] translate-y-[-2px]' 
            : 'bg-app-card text-app-mt hover:border-short hover:text-short shadow-retro-sm shadow-retro-hover'
        }`}
      >
        <CupIcon /> Short Break
      </button>

      <button 
        onClick={() => onModeChange('long')}
        className={`flex items-center px-5 py-2.5 border-[3px] border-app-br transition-all duration-150 cursor-pointer ${
          mode === 'long' 
            ? 'bg-long text-white shadow-retro translate-x-[-2px] translate-y-[-2px]' 
            : 'bg-app-card text-app-mt hover:border-long hover:text-long shadow-retro-sm shadow-retro-hover'
        }`}
      >
        <LeafIcon /> Long Break
      </button>
    </div>
  );
}
