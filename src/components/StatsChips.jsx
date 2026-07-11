import React from 'react';

const TomatoIcon = () => (
  <svg className="w-3.5 h-3.5 inline-block ml-1 align-middle text-tomato" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v3m0 0c-3 0-5.5 1.5-6.5 4-1 2.5-.5 5.5 1.5 7.5s5 2.5 7.5 1.5c2.5-1 4-3.5 4-6.5s-1.5-5.5-4-6.5c-.7-.3-1.6-.5-2.5-.5z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6c.5-1.5 1.5-2.5 3-2.5M12 6c-.5-1.5-1.5-2.5-3-2.5" />
  </svg>
);

export default function StatsChips({ todayCount, totalCount, totalFocusMinutes }) {
  const formatFocusTime = (minutes) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="flex justify-center gap-3 flex-wrap font-sans font-extrabold text-xs select-none">
      <div className="flex items-center px-5 py-2.5 border-[3px] border-app-br bg-app-card text-app-mt shadow-retro-sm">
        Today:&nbsp;<span className="text-tomato font-black">{todayCount}</span>&nbsp;<TomatoIcon />
      </div>
      
      <div className="flex items-center px-5 py-2.5 border-[3px] border-app-br bg-app-card text-app-mt shadow-retro-sm">
        Total:&nbsp;<span className="text-tomato font-black">{totalCount}</span>&nbsp;<TomatoIcon />
      </div>

      <div className="flex items-center px-5 py-2.5 border-[3px] border-app-br bg-app-card text-app-mt shadow-retro-sm">
        Focus:&nbsp;<span className="text-tomato font-black">{formatFocusTime(totalFocusMinutes)}</span>
      </div>
    </div>
  );
}
