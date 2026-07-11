import React from 'react';

const playGradients = {
  pomo: 'bg-tomato hover:bg-tomato-dark text-white',
  short: 'bg-short hover:bg-blue-700 text-white',
  long: 'bg-long hover:bg-emerald-700 text-white'
};

export default function Controls({ status, mode, onStart, onPause, onReset, onSkip }) {
  const isRunning = status === 'running';
  const playStyle = playGradients[mode] || playGradients.pomo;

  return (
    <div className="flex items-center justify-center gap-5 mb-5 font-sans">
      {/* Reset */}
      <button 
        onClick={onReset}
        className="w-12 h-12 rounded-full border-[3px] border-app-br bg-app-card text-app-ink text-lg flex items-center justify-center cursor-pointer shadow-retro-sm shadow-retro-hover hover:translate-y-[-1px] transition-all"
        title="Reset"
      >
        ↺
      </button>

      {/* Play/Pause */}
      <button 
        onClick={isRunning ? onPause : onStart}
        className={`w-16 h-16 rounded-full border-[3px] border-app-br text-2xl flex items-center justify-center cursor-pointer shadow-retro shadow-retro-hover hover:translate-y-[-2px] transition-all ${playStyle}`}
        title={isRunning ? 'Pause' : 'Start'}
      >
        {isRunning ? '⏸' : '▶'}
      </button>

      {/* Skip */}
      <button 
        onClick={onSkip}
        className="w-12 h-12 rounded-full border-[3px] border-app-br bg-app-card text-app-ink text-lg flex items-center justify-center cursor-pointer shadow-retro-sm shadow-retro-hover hover:translate-y-[-1px] transition-all"
        title="Skip"
      >
        ⏭
      </button>
    </div>
  );
}
