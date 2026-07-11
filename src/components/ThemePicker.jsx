import React, { useState, useEffect, useRef } from 'react';
import { THEMES } from '../hooks/useTheme';

const PaletteIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="13.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/>
    <circle cx="17.5" cy="10.5" r="1.5" fill="currentColor" stroke="none"/>
    <circle cx="8.5"  cy="7.5"  r="1.5" fill="currentColor" stroke="none"/>
    <circle cx="6.5"  cy="12"   r="1.5" fill="currentColor" stroke="none"/>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.1 0 2-.9 2-2v-.5c0-.28.11-.53.29-.71a1 1 0 0 0-.29-.79C13.39 17.4 13 16.74 13 16c0-1.1.9-2 2-2h2c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8z"/>
  </svg>
);

const CheckIcon = () => (
  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5"/>
  </svg>
);

export default function ThemePicker({ currentTheme, onThemeChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef(null);
  const buttonRef = useRef(null);

  const currentThemeData = THEMES.find(t => t.id === currentTheme) || THEMES[0];

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target) &&
        buttonRef.current && !buttonRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') setIsOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen]);

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(prev => !prev)}
        className="flex items-center justify-center w-8 h-8 border-2 border-app-br bg-app-card text-app-ink shadow-retro-sm shadow-retro-hover cursor-pointer"
        title="Change Theme"
        aria-label="Open theme picker"
      >
        <PaletteIcon />
      </button>

      {/* Floating Panel */}
      {isOpen && (
        <div
          ref={panelRef}
          className="animate-picker-appear absolute right-0 top-10 z-[200] w-72 border-[3px] border-app-br bg-app-card shadow-retro rounded-xl overflow-hidden"
        >
          {/* Header */}
          <div className="px-4 py-3 border-b-[2px] border-app-br">
            <p className="text-[10px] font-black uppercase tracking-[2px] text-app-mt">
              Theme
            </p>
            <p className="text-sm font-extrabold text-app-ink leading-tight mt-0.5">
              {currentThemeData.name}
            </p>
          </div>

          {/* Theme grid */}
          <div className="p-3 grid grid-cols-2 gap-2 max-h-80 overflow-y-auto">
            {THEMES.map((t) => {
              const isActive = t.id === currentTheme;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    onThemeChange(t.id);
                    setIsOpen(false);
                  }}
                  className={`group relative text-left rounded-lg border-[2.5px] p-2.5 cursor-pointer transition-all hover:scale-[1.03] active:scale-[0.97] ${
                    isActive
                      ? 'border-tomato shadow-retro-sm'
                      : 'border-app-br hover:border-app-ink'
                  }`}
                  style={{ background: t.swatches[0] }}
                  title={t.name}
                >
                  {/* 4 colour swatches */}
                  <div className="flex gap-1 mb-2">
                    {t.swatches.map((color, i) => (
                      <div
                        key={i}
                        className="flex-1 h-4 rounded-sm"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>

                  {/* Theme name */}
                  <p
                    className="text-[10px] font-black leading-tight truncate"
                    style={{ color: t.swatches[2] }}
                  >
                    {t.name}
                  </p>

                  {/* Active checkmark */}
                  {isActive && (
                    <div
                      className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: t.swatches[3], color: t.swatches[0] }}
                    >
                      <CheckIcon />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
