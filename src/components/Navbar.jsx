import React from 'react';

// Custom outline SVGs matching the retro hand-drawn style
const TomatoIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v3m0 0c-3 0-5.5 1.5-6.5 4-1 2.5-.5 5.5 1.5 7.5s5 2.5 7.5 1.5c2.5-1 4-3.5 4-6.5s-1.5-5.5-4-6.5c-.7-.3-1.6-.5-2.5-.5z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6c.5-1.5 1.5-2.5 3-2.5M12 6c-.5-1.5-1.5-2.5-3-2.5M12 6c0-1.5-.5-3-1.5-3" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const SunIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const MoonIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

export default function Navbar({ theme, onToggleTheme, onOpenSettings }) {
  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between h-16 px-6 border-b-[3px] border-app-br bg-app-bg transition-colors duration-300">
      {/* Logo */}
      <a href="/" className="flex items-center gap-2 text-xl font-bold font-serif text-app-ink tracking-tight select-none">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-tomato text-white border-2 border-app-br">
          <TomatoIcon />
        </div>
        <span>FocusTomato</span>
      </a>

      {/* Nav links */}
      <div className="hidden sm:flex items-center gap-1 font-sans font-extrabold text-xs text-app-mt">
        <button className="flex items-center gap-1.5 px-4 py-2 border-[3px] border-app-br bg-tomato text-white shadow-retro-sm hover:translate-y-[-1px] transition-all cursor-pointer">
          ⏱ Timer
        </button>
        <a href="#tasks" className="px-4 py-2 border-[3px] border-transparent hover:border-app-br hover:bg-app-tl hover:text-tomato transition-all cursor-pointer">
          Tasks
        </a>
        <a href="#ambient" className="px-4 py-2 border-[3px] border-transparent hover:border-app-br hover:bg-app-tl hover:text-tomato transition-all cursor-pointer">
          Sounds
        </a>
      </div>

      {/* Options */}
      <div className="flex items-center gap-2">
        {/* Settings button */}
        <button 
          onClick={onOpenSettings}
          className="flex items-center justify-center w-9 h-9 border-[3px] border-app-br bg-app-card text-app-ink shadow-retro-sm shadow-retro-hover cursor-pointer"
          title="Settings"
        >
          <SettingsIcon />
        </button>

        {/* Theme Toggle */}
        <button 
          onClick={onToggleTheme}
          className="flex items-center justify-center w-9 h-9 border-[3px] border-app-br bg-app-card text-app-ink shadow-retro-sm shadow-retro-hover cursor-pointer"
          title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>
    </nav>
  );
}
