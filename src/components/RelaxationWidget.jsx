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

const LotusIcon = ({ className = "w-4 h-4 text-long shrink-0" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21c-2-3-5-4-5-8.5C7 8.5 10 7.5 12 3c2 4.5 5 5.5 5 9.5 0 4.5-3 5.5-5 8.5z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 12c-2-1-4.5-.5-5.5.5-1.2 1.2-.5 3.5 2.5 4 1.5.2 2.5-.2 3-1" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 12c2-1 4.5-.5 5.5.5 1.2 1.2.5 3.5-2.5 4-1.5.2-2.5-.2-3-1" />
  </svg>
);

export default function RelaxationWidget() {
  const [patternKey, setPatternKey] = useState('4444');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isActive, setIsActive] = useState(false);
  
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0); // in ms
  
  const timerRef = useRef(null);
  
  const pattern = PATTERNS[patternKey];
  const currentPhase = pattern.phases[phaseIndex];
  
  // Clean up timer on unmount or pause
  useEffect(() => {
    if (isActive && isModalOpen) {
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
  }, [isActive, phaseIndex, patternKey, isModalOpen]);

  // Reset exercise when changing pattern
  const handlePatternChange = (key) => {
    setPatternKey(key);
    setIsActive(false);
    setPhaseIndex(0);
    setElapsedTime(0);
  };

  const startExercise = () => {
    setPhaseIndex(0);
    setElapsedTime(0);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const closeExercise = () => {
    setIsActive(false);
    setIsModalOpen(false);
    setPhaseIndex(0);
    setElapsedTime(0);
  };

  const toggleActive = () => {
    setIsActive(!isActive);
  };

  // Calculate current scale
  const [startScale, endScale] = currentPhase.scale;
  const progress = elapsedTime / (currentPhase.duration * 1000);
  const currentScale = startScale + (endScale - startScale) * progress;
  const secondsRemaining = Math.max(0, Math.ceil(currentPhase.duration - (elapsedTime / 1000)));

  return (
    <div className="w-full border-[3px] border-app-br bg-app-card rounded-xl p-3 shadow-retro-sm overflow-hidden font-sans select-none flex items-center justify-between gap-3 shrink-0">
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-black uppercase tracking-wider text-app-ink flex items-center gap-1 leading-none">
          <LotusIcon className="w-3.5 h-3.5 text-long shrink-0" /> Relax & Breathe
        </span>
        {/* Simple inline buttons to choose pattern */}
        <div className="flex gap-1 mt-0.5">
          {Object.keys(PATTERNS).map((key) => (
            <button
              key={key}
              onClick={() => handlePatternChange(key)}
              className={`px-2 py-0.5 border border-app-br rounded text-[8px] font-black uppercase tracking-wide cursor-pointer transition-all ${
                patternKey === key 
                  ? 'bg-tomato text-white border-tomato' 
                  : 'bg-app-bg text-app-mt hover:border-tomato hover:text-tomato'
              }`}
            >
              {PATTERNS[key].name}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={startExercise}
        className="px-4 py-2 rounded-lg border-[2px] border-app-br bg-tomato hover:bg-tomato-dark text-white text-[10px] font-black uppercase tracking-wider shadow-retro-sm shadow-retro-hover cursor-pointer"
      >
        Start
      </button>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-xs border-[3px] border-app-br bg-app-card rounded-2xl p-6 shadow-2xl text-center flex flex-col items-center gap-4 text-app-ink">
            <h3 className="font-serif text-xl flex items-center gap-1.5 leading-none">
              <LotusIcon className="w-5 h-5 text-long" /> Breathing Guide
            </h3>
            <p className="text-[10px] text-app-mt uppercase tracking-wider font-extrabold -mt-2">
              {pattern.name} • {pattern.desc}
            </p>

            {/* Pulsing circle */}
            <div className="h-32 flex items-center justify-center relative w-full overflow-hidden my-2">
              <div 
                style={{ transform: `scale(${isActive ? currentScale : 1})` }}
                className={`w-20 h-20 rounded-full border-[3px] flex items-center justify-center transition-all duration-75 ease-linear shadow-retro-sm ${
                  isActive ? currentPhase.color : 'border-app-br bg-app-bg text-app-mt'
                }`}
              >
                <div className="text-center font-black flex flex-col justify-center items-center">
                  <span className="text-[9px] uppercase tracking-wider font-extrabold leading-none">
                    {isActive ? currentPhase.type : 'Ready'}
                  </span>
                  {isActive && <span className="text-xl leading-none mt-1">{secondsRemaining}</span>}
                </div>
              </div>
            </div>

            {/* Modal Controls */}
            <div className="flex gap-2 w-full mt-2">
              <button
                onClick={toggleActive}
                className="flex-1 py-2.5 rounded-lg border-2 border-app-br bg-app-bg hover:bg-app-bg/80 text-app-ink font-black text-[10px] uppercase tracking-wider cursor-pointer shadow-retro-sm active:translate-y-[1px] transition-colors"
              >
                {isActive ? 'Pause' : 'Resume'}
              </button>
              <button
                onClick={closeExercise}
                className="flex-1 py-2.5 rounded-lg border-2 border-app-br bg-tomato hover:bg-tomato-dark text-white font-black text-[10px] uppercase tracking-wider cursor-pointer shadow-retro-sm active:translate-y-[1px] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
