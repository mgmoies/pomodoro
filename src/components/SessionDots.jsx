import React from 'react';

export default function SessionDots({ pomosCompleted, currentMode, timerStatus }) {
  const dots = Array.from({ length: 4 });
  const activeIndex = pomosCompleted % 4;

  return (
    <div className="flex gap-3 justify-center mt-2.5 select-none">
      {dots.map((_, idx) => {
        const isCompleted = idx < activeIndex;
        const isCurrent = idx === activeIndex && currentMode === 'pomo' && timerStatus !== 'idle';
        
        return (
          <div 
            key={idx}
            className={`w-3.5 h-3.5 rounded-full border-2 border-app-br transition-all duration-300 ${
              isCompleted 
                ? 'bg-tomato shadow-retro-sm' 
                : isCurrent 
                  ? 'bg-tomato/40 animate-retro-pulse' 
                  : 'bg-transparent'
            }`}
          />
        );
      })}
    </div>
  );
}
