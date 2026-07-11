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
            <div className="w-[110px] h-[110px] rounded-full overflow-hidden border-[3px] border-app-br bg-white flex items-center justify-center shadow-retro-sm">
              <img 
                src={meta.image} 
                alt={meta.label} 
                className="w-full h-full object-cover dark:invert dark:mix-blend-screen"
              />
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
            <div className="w-[110px] h-[110px] rounded-full overflow-hidden border-[3px] border-app-br bg-white flex items-center justify-center shadow-retro-sm">
              <img 
                src={meta.image} 
                alt={meta.label} 
                className="w-full h-full object-cover dark:invert dark:mix-blend-screen"
              />
            </div>
            {/* 10 dots sequence */}
            <div className="flex gap-2 justify-center items-center">
              {Array.from({ length: 10 }).map((_, i) => {
                const isActiveDot = progress * 10 > i;
                return (
                  <div 
                    key={i} 
                    className="w-3.5 h-3.5 border-2 border-app-br rounded-full shadow-retro-sm transition-all duration-300"
                    style={{ 
                      backgroundColor: isActiveDot ? meta.stroke : '#ffffff',
                      opacity: isActiveDot ? 1 : 0.25,
                      transform: isActiveDot ? 'scale(1.1)' : 'scale(1)'
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
              {/* Top Sand clipping */}
              <clipPath id="top-sand-clip">
                <rect x="0" y={45 - (35 * progress)} width="100" height="35" />
              </clipPath>
              
              {/* Bottom Sand clipping */}
              <clipPath id="bottom-sand-clip">
                <rect x="0" y={110 - (35 * (1 - progress))} width="100" height="35" />
              </clipPath>

              {/* Sand in top bulb */}
              <path 
                d="M20 10c0 15 10 25 30 35c20-10 30-20 30-35z" 
                fill={meta.stroke}
                clipPath="url(#top-sand-clip)"
              />

              {/* Sand in bottom bulb */}
              <path 
                d="M20 110c0-15 10-25 30-35c20 10 30 20 30 35z" 
                fill={meta.stroke}
                clipPath="url(#bottom-sand-clip)"
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
            <div className="absolute top-[52px] left-[50%] -translate-x-[50%] w-[38px] h-[38px] rounded-full overflow-hidden border-2 border-app-br bg-white flex items-center justify-center shadow-retro-sm">
              <img 
                src={meta.image} 
                alt={meta.label} 
                className="w-full h-full object-cover dark:invert dark:mix-blend-screen"
              />
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
              <div className="w-[110px] h-[110px] rounded-full overflow-hidden border-[3px] border-app-br bg-white flex items-center justify-center">
                <img 
                  src={meta.image} 
                  alt={meta.label} 
                  className="w-full h-full object-cover dark:invert dark:mix-blend-screen"
                />
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
