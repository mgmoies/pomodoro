import React from 'react';

const CIRCUMFERENCE = 615.8;

const modeMeta = {
  pomo: { 
    label: 'Focus Time', 
    colorClass: 'text-tomato', 
    stroke: '#D94B36',
    image: '/assets/tomato.jpg'
  },
  short: { 
    label: 'Short Break', 
    colorClass: 'text-short', 
    stroke: '#3B71CA',
    image: '/assets/cup.jpg'
  },
  long: { 
    label: 'Long Break', 
    colorClass: 'text-long', 
    stroke: '#1E8449',
    image: '/assets/cup.jpg'
  }
};

export default function Timer({ timeLeft, totalDuration, mode, timerStatus, onAdjustDuration }) {
  const meta = modeMeta[mode] || modeMeta.pomo;
  const progress = timeLeft / totalDuration;
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const isIdle = timerStatus === 'idle';

  return (
    <div className="flex flex-col items-center select-none font-sans">
      {/* Outer SVG Timer Ring with Mascot inside */}
      <div className="relative w-52 h-52 mx-auto mb-4 timer-svg">
        <svg width="208" height="208" viewBox="0 0 220 220" className="-rotate-90">
          {/* Background Ring */}
          <circle 
            className="fill-none stroke-app-br" 
            cx="110" 
            cy="110" 
            r="98" 
            strokeWidth="8"
          />
          {/* Foreground Progress Ring */}
          <circle 
            className="fill-none transition-all duration-300"
            cx="110" 
            cy="110" 
            r="98" 
            strokeWidth="8"
            strokeLinecap="round"
            stroke={meta.stroke}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={strokeDashoffset}
          />
        </svg>

        {/* Mascot inside the ring */}
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <div className="w-[110px] h-[110px] rounded-full overflow-hidden border-[3px] border-app-br bg-white flex items-center justify-center">
            <img 
              src={meta.image} 
              alt={meta.label} 
              className="w-full h-full object-cover dark:invert dark:mix-blend-screen"
            />
          </div>
        </div>
      </div>

      {/* Countdown Timer with arrows */}
      <div className="flex items-center gap-4 mb-2">
        {/* Decrement Button */}
        <button
          onClick={() => isIdle && onAdjustDuration(-1)}
          disabled={!isIdle}
          className={`text-xl font-bold font-serif px-2.5 py-1 rounded border-2 border-app-br bg-app-card text-app-ink shadow-retro-sm shadow-retro-hover active:translate-y-[1px] select-none ${
            isIdle ? 'cursor-pointer' : 'opacity-30 cursor-not-allowed'
          }`}
          title="Decrease focus duration"
        >
          ◀
        </button>

        {/* Time display */}
        <div className={`font-serif text-5xl font-normal leading-none tracking-tight ${meta.colorClass}`}>
          {formatTime(timeLeft)}
        </div>

        {/* Increment Button */}
        <button
          onClick={() => isIdle && onAdjustDuration(1)}
          disabled={!isIdle}
          className={`text-xl font-bold font-serif px-2.5 py-1 rounded border-2 border-app-br bg-app-card text-app-ink shadow-retro-sm shadow-retro-hover active:translate-y-[1px] select-none ${
            isIdle ? 'cursor-pointer' : 'opacity-30 cursor-not-allowed'
          }`}
          title="Increase focus duration"
        >
          ▶
        </button>
      </div>

      {/* Mode Label */}
      <div className="font-sans text-[10px] uppercase font-extrabold tracking-[3px] text-app-mt select-none">
        {meta.label}
      </div>
    </div>
  );
}
