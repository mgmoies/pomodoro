import React, { useState, useEffect, useRef } from 'react';

const PATTERNS = {
  '4444': {
    name: 'Box Breath',
    desc: '4s In • 4s Hold • 4s Out • 4s Hold',
    phases: [
      { type: 'Inhale', duration: 4, scale: [1, 1.7], color: 'text-tomato bg-tomato/10 border-tomato' },
      { type: 'Hold', duration: 4, scale: [1.7, 1.7], color: 'text-long bg-long/10 border-long' },
      { type: 'Exhale', duration: 4, scale: [1.7, 1], color: 'text-short bg-short/10 border-short' },
      { type: 'Hold (Empty)', duration: 4, scale: [1, 1], color: 'text-app-mt bg-app-mt/5 border-app-br' }
    ]
  },
  '478': {
    name: 'Relax (4-7-8)',
    desc: '4s In • 7s Hold • 8s Out',
    phases: [
      { type: 'Inhale', duration: 4, scale: [1, 1.7], color: 'text-tomato bg-tomato/10 border-tomato' },
      { type: 'Hold', duration: 7, scale: [1.7, 1.7], color: 'text-long bg-long/10 border-long' },
      { type: 'Exhale', duration: 8, scale: [1.7, 1], color: 'text-short bg-short/10 border-short' }
    ]
  },
  '55': {
    name: 'Coherent',
    desc: '5s Inhale • 5s Exhale',
    phases: [
      { type: 'Inhale', duration: 5, scale: [1, 1.7], color: 'text-tomato bg-tomato/10 border-tomato' },
      { type: 'Exhale', duration: 5, scale: [1.7, 1], color: 'text-short bg-short/10 border-short' }
    ]
  }
};

const LotusIcon = () => (
  <svg className="w-4.5 h-4.5 text-app-ink shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21c-2-3-5-4-5-8.5C7 8.5 10 7.5 12 3c2 4.5 5 5.5 5 9.5 0 4.5-3 5.5-5 8.5z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 12c-2-1-4.5-.5-5.5.5-1.2 1.2-.5 3.5 2.5 4 1.5.2 2.5-.2 3-1" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 12c2-1 4.5-.5 5.5.5 1.2 1.2.5 3.5-2.5 4-1.5.2-2.5-.2-3-1" />
  </svg>
);

export default function RelaxationWidget() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [patternKey, setPatternKey] = useState('4444');
  const [isActive, setIsActive] = useState(false);
  
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0); // in ms
  
  const timerRef = useRef(null);
  
  const pattern = PATTERNS[patternKey];
  const currentPhase = pattern.phases[phaseIndex];
  
  // Clean up timer on unmount or pause
  useEffect(() => {
    if (isActive) {
      const intervalMs = 50;
      timerRef.current = setInterval(() => {
        setElapsedTime((prev) => {
          const next = prev + intervalMs;
          const phaseDurationMs = currentPhase.duration * 1000;
          
          if (next >= phaseDurationMs) {
            // Move to next phase
            setPhaseIndex((prevIndex) => (prevIndex + 1) % pattern.phases.length);
            return 0;
          }
          return next;
        });
      }, intervalMs);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isActive, phaseIndex, patternKey]);

  // Reset exercise when changing pattern
  const handlePatternChange = (key) => {
    setPatternKey(key);
    setIsActive(false);
    setPhaseIndex(0);
    setElapsedTime(0);
  };

  const toggleActive = () => {
    if (isActive) {
      setIsActive(false);
    } else {
      setIsActive(true);
      setPhaseIndex(0);
      setElapsedTime(0);
    }
  };

  // Calculate current scale
  const [startScale, endScale] = currentPhase.scale;
  const progress = elapsedTime / (currentPhase.duration * 1000);
  const currentScale = startScale + (endScale - startScale) * progress;
  const secondsRemaining = Math.max(0, Math.ceil(currentPhase.duration - (elapsedTime / 1000)));

  return (
    <div className="w-full border-[3px] border-app-br bg-app-card rounded-2xl shadow-retro-sm overflow-hidden font-sans select-none transition-all duration-300">
      {/* Header Button */}
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full py-2.5 px-4 bg-app-bg/50 border-b-[3px] border-app-br flex items-center justify-between text-xs font-black text-app-ink hover:bg-app-bg/85 cursor-pointer uppercase tracking-wider transition-colors"
      >
        <span className="flex items-center gap-1.5">
          <LotusIcon /> Relax & Breathe
        </span>
        <span className="text-[10px] font-bold text-app-mt">
          {isExpanded ? 'Collapse ▲' : 'Expand ▼'}
        </span>
      </button>

      {isExpanded && (
        <div className="p-4 flex flex-col items-center gap-4 animate-fadeIn">
          {/* Pattern Selector */}
          <div className="flex gap-1.5 w-full justify-center">
            {Object.keys(PATTERNS).map((key) => (
              <button
                key={key}
                onClick={() => handlePatternChange(key)}
                className={`px-3 py-1.5 border-2 border-app-br text-[10px] font-black uppercase tracking-wide cursor-pointer transition-all ${
                  patternKey === key 
                    ? 'bg-tomato text-white shadow-retro-sm translate-x-[-1px] translate-y-[-1px]' 
                    : 'bg-app-bg text-app-mt hover:border-tomato hover:text-tomato'
                }`}
              >
                {PATTERNS[key].name}
              </button>
            ))}
          </div>

          <p className="text-[10px] text-app-mt uppercase tracking-wider font-extrabold -mt-1">
            {pattern.desc}
          </p>

          {/* Interactive Breathing circle Area */}
          <div className="h-32 flex items-center justify-center relative w-full overflow-hidden my-1">
            {/* Guide Circle */}
            <div 
              style={{ transform: `scale(${isActive ? currentScale : 1})` }}
              className={`w-16 h-16 rounded-full border-[3px] flex items-center justify-center transition-all duration-75 ease-linear shadow-retro-sm ${
                isActive ? currentPhase.color : 'border-app-br bg-app-bg text-app-mt'
              }`}
            >
              {isActive ? (
                <div className="text-center font-black flex flex-col justify-center items-center">
                  <span className="text-[9px] uppercase tracking-wider font-extrabold leading-none">
                    {currentPhase.type}
                  </span>
                  <span className="text-lg leading-none mt-1">{secondsRemaining}</span>
                </div>
              ) : (
                <span className="text-[10px] font-black uppercase tracking-wider text-center p-1">
                  Ready
                </span>
              )}
            </div>
          </div>

          {/* Action button */}
          <button
            onClick={toggleActive}
            className={`w-full py-2.5 rounded-lg border-2 border-app-br font-black text-xs uppercase tracking-wider shadow-retro-sm shadow-retro-hover cursor-pointer transition-all ${
              isActive 
                ? 'bg-app-bg hover:bg-tomato/5 hover:text-tomato text-app-ink' 
                : 'bg-tomato hover:bg-tomato-dark text-white'
            }`}
          >
            {isActive ? 'Pause Exercise' : 'Start Breathing'}
          </button>
        </div>
      )}
    </div>
  );
}
