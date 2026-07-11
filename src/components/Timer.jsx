import React from 'react';

const CIRCUMFERENCE = 615.8;

const TomatoIcon = ({ className = "w-14 h-14" }) => (
  <svg className={`${className} text-tomato`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.25">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v3m0 0c-3 0-5.5 1.5-6.5 4-1 2.5-.5 5.5 1.5 7.5s5 2.5 7.5 1.5c2.5-1 4-3.5 4-6.5s-1.5-5.5-4-6.5c-.7-.3-1.6-.5-2.5-.5z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6c.5-1.5 1.5-2.5 3-2.5M12 6c-.5-1.5-1.5-2.5-3-2.5" />
  </svg>
);

const CupIcon = ({ className = "w-14 h-14" }) => (
  <svg className={`${className} text-short`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.25">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 10h12v5a5 5 0 01-5 5h-2a5 5 0 01-5-5v-5zM18 10h1a2 2 0 012 2v2a2 2 0 01-2 2h-1M9 3v3M12 3v3M15 3v3" />
  </svg>
);

const LeafIcon = ({ className = "w-14 h-14" }) => (
  <svg className={`${className} text-long`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.25">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M12 3C8 7 8 13 12 17M12 7c4 0 6 3 6 6s-2 4-6 4M12 11c-3-1-4-3-4-5M12 14c3-1 4-3 4-5" />
  </svg>
);

const modeMeta = {
  pomo: { 
    label: 'Focus Time', 
    colorClass: 'text-tomato', 
    stroke: '#D94B36',
    Icon: TomatoIcon
  },
  short: { 
    label: 'Short Break', 
    colorClass: 'text-short', 
    stroke: '#3B71CA',
    Icon: CupIcon
  },
  long: { 
    label: 'Long Break', 
    colorClass: 'text-long', 
    stroke: '#1E8449',
    Icon: LeafIcon
  }
};

export default function Timer({ timeLeft, totalDuration, mode, timerStatus, onAdjustDuration, timerStyle = 'circle' }) {
  const meta = modeMeta[mode] || modeMeta.pomo;
  const progress = timeLeft / totalDuration;
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const isIdle = timerStatus === 'idle';

  const renderTimerVisual = () => {
    switch (timerStyle) {
      case 'line':
        return (
          <div className="relative w-52 h-52 mx-auto mb-4 flex flex-col justify-center items-center gap-6">
            {/* Mascot frame */}
            <div className="w-[110px] h-[110px] rounded-full overflow-hidden border-[3px] border-app-br bg-app-card flex items-center justify-center shadow-retro-sm">
              <meta.Icon className="w-14 h-14" />
            </div>
            {/* Retro horizontal progress bar */}
            <div className="w-full h-5 border-[3px] border-app-br bg-app-bg rounded-lg overflow-hidden shadow-retro-sm relative">
              <div 
                style={{ 
                  width: `${progress * 100}%`,
                  backgroundColor: meta.stroke
                }}
                className="h-full transition-all duration-300 ease-out"
              />
            </div>
          </div>
        );

      case 'dots':
        return (
          <div className="relative w-52 h-52 mx-auto mb-4 flex flex-col justify-center items-center gap-6">
            {/* Mascot frame */}
            <div className="w-[110px] h-[110px] rounded-full overflow-hidden border-[3px] border-app-br bg-app-card flex items-center justify-center shadow-retro-sm">
              <meta.Icon className="w-14 h-14" />
            </div>
            {/* 10 dots sequence */}
            <div className="flex gap-2 justify-center items-center">
              {Array.from({ length: 10 }).map((_, i) => {
                const isActiveDot = progress * 10 > i;
                return (
                  <div 
                    key={i} 
                    className={`w-3.5 h-3.5 border-2 border-app-br rounded-full shadow-retro-sm transition-all duration-300 ${
                      isActiveDot ? 'scale-110' : 'scale-100 bg-app-bg/40'
                    }`}
                    style={{ 
                      backgroundColor: isActiveDot ? meta.stroke : undefined
                    }}
                  />
                );
              })}
            </div>
          </div>
        );

      case 'sandclock':
        return (
          <div className="relative w-52 h-52 mx-auto mb-4 flex items-center justify-center">
            <svg width="140" height="170" viewBox="0 0 100 120" className="text-app-br">
              {/* Sand in top bulb - dynamic height using CSS clipPath: inset */}
              <path 
                d="M20 10c0 15 10 25 30 35c20-10 30-20 30-35z" 
                fill={meta.stroke}
                style={{ clipPath: `inset(${(1 - progress) * 100}% 0% 0% 0%)` }}
              />

              {/* Sand in bottom bulb - dynamic height using CSS clipPath: inset */}
              <path 
                d="M20 110c0-15 10-25 30-35c20 10 30 20 30 35z" 
                fill={meta.stroke}
                style={{ clipPath: `inset(${progress * 100}% 0% 0% 0%)` }}
              />

              {/* Glass frame */}
              <path 
                d="M15 10 h70 v10 c0 15-10 25-25 35 c15 10 25 20 25 35 v10 h-70 v-10 c0-15 10-25 25-35 c-15-10-25-20-25-35 z" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="4.5" 
                strokeLinejoin="round" 
              />
              {/* Wood bases */}
              <rect x="10" y="2" width="80" height="8" rx="2.5" fill="currentColor" />
              <rect x="10" y="110" width="80" height="8" rx="2.5" fill="currentColor" />
              
              {/* Dripping sand stream (visible only if running) */}
              {timerStatus === 'running' && (
                <line 
                  x1="50" 
                  y1="45" 
                  x2="50" 
                  y2="75" 
                  stroke={meta.stroke} 
                  strokeWidth="2.5" 
                  strokeDasharray="4 4" 
                  className="animate-sand-drip"
                />
              )}
            </svg>

            {/* Small mascot badge overlayed at the center intersection */}
            <div className="absolute top-[52px] left-[50%] -translate-x-[50%] w-[38px] h-[38px] rounded-full overflow-hidden border-2 border-app-br bg-app-card flex items-center justify-center shadow-retro-sm">
              <meta.Icon className="w-5 h-5" />
            </div>
          </div>
        );

      case 'circle':
      default:
        return (
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
              <div className="w-[110px] h-[110px] rounded-full overflow-hidden border-[3px] border-app-br bg-app-card flex items-center justify-center">
                <meta.Icon className="w-14 h-14" />
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col items-center select-none font-sans">
      {renderTimerVisual()}

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
