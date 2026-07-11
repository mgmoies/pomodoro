import React, { useState } from 'react';

const SettingsIcon = () => (
  <svg className="w-5 h-5 text-app-ink mr-2 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-5 h-5 text-app-mt hover:text-tomato" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default function SettingsModal({ isOpen, onClose, settings, onSaveSettings }) {
  const [displayName, setDisplayName] = useState(settings.displayName || '');
  const [pomo, setPomo] = useState(settings.pomo);
  const [short, setShort] = useState(settings.short);
  const [long, setLong] = useState(settings.long);
  const [interval, setIntervalVal] = useState(settings.interval);
  const [autoBreak, setAutoBreak] = useState(settings.autoBreak);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveSettings({
      displayName: displayName.trim() || 'Tomato Member',
      pomo: Math.max(1, parseInt(pomo, 10) || 25),
      short: Math.max(1, parseInt(short, 10) || 5),
      long: Math.max(1, parseInt(long, 10) || 20),
      interval: Math.max(1, parseInt(interval, 10) || 4),
      autoBreak
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300">
      <div className="w-full max-w-sm rounded-2xl border-[3px] border-app-br bg-app-card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-app-ink font-sans">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="flex items-center font-serif text-2xl font-normal leading-tight text-app-ink select-none">
            <SettingsIcon /> Timer Settings
          </h2>
          <button 
            onClick={onClose}
            className="cursor-pointer p-1 font-bold"
            title="Close"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* Display Name Input */}
          <div className="flex flex-col gap-1.5 pb-2.5 border-b-2 border-app-br/30">
            <label htmlFor="displayName" className="text-[10px] font-extrabold uppercase tracking-wide text-app-mt">
              Your Name (Group Session)
            </label>
            <input 
              id="displayName"
              type="text" 
              placeholder="e.g. Sarah"
              maxLength={20}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border-2 border-app-br bg-app-bg text-sm font-bold focus:border-tomato outline-none text-app-ink"
            />
          </div>

          {/* Durations */}
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="inputPomo" className="text-[10px] font-extrabold uppercase tracking-wide text-app-mt">
                Focus (min)
              </label>
              <input 
                id="inputPomo"
                type="number" 
                min="1" 
                max="180" 
                value={pomo}
                onChange={(e) => setPomo(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border-2 border-app-br bg-app-bg text-center text-sm font-bold focus:border-tomato outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="inputShort" className="text-[10px] font-extrabold uppercase tracking-wide text-app-mt">
                Short Break
              </label>
              <input 
                id="inputShort"
                type="number" 
                min="1" 
                max="60" 
                value={short}
                onChange={(e) => setShort(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border-2 border-app-br bg-app-bg text-center text-sm font-bold focus:border-tomato outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="inputLong" className="text-[10px] font-extrabold uppercase tracking-wide text-app-mt">
                Long Break
              </label>
              <input 
                id="inputLong"
                type="number" 
                min="1" 
                max="60" 
                value={long}
                onChange={(e) => setLong(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border-2 border-app-br bg-app-bg text-center text-sm font-bold focus:border-tomato outline-none"
              />
            </div>
          </div>

          {/* Long break cycle interval */}
          <div className="flex justify-between items-center py-2.5 border-b-2 border-app-br/30">
            <label htmlFor="inputInterval" className="text-xs font-bold text-app-mt">
              Long break interval (sessions)
            </label>
            <input 
              id="inputInterval"
              type="number" 
              min="1" 
              max="24" 
              value={interval}
              onChange={(e) => setIntervalVal(e.target.value)}
              className="w-16 px-2 py-1 rounded-md border-2 border-app-br bg-app-bg text-center text-xs font-bold focus:border-tomato outline-none"
            />
          </div>

          {/* Auto break checkbox */}
          <div className="flex justify-between items-center py-2.5 border-b-2 border-app-br/30">
            <span className="text-xs font-bold text-app-mt">
              Auto-start breaks & focus
            </span>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={autoBreak} 
                onChange={(e) => setAutoBreak(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 border-2 border-app-br bg-app-bg peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-app-br after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-tomato"></div>
            </label>
          </div>

          {/* Submit */}
          <button 
            type="submit"
            className="w-full mt-2 py-3 rounded-lg border-[3px] border-app-br bg-tomato hover:bg-tomato-dark text-white text-sm font-bold shadow-retro-sm shadow-retro-hover cursor-pointer"
          >
            Save Settings
          </button>
        </form>
      </div>
    </div>
  );
}
