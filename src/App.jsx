import React, { useState, useEffect } from 'react';
import useTheme from './hooks/useTheme';
import useLocalStorage from './hooks/useLocalStorage';
import useAudio from './hooks/useAudio';
import useTimer from './hooks/useTimer';

import ModeSelector from './components/ModeSelector';
import Timer from './components/Timer';
import Controls from './components/Controls';
import SessionDots from './components/SessionDots';
import StatsChips from './components/StatsChips';
import TaskInput from './components/TaskInput';
import AmbientSounds from './components/AmbientSounds';
import SettingsModal from './components/SettingsModal';
import GroupSession from './components/GroupSession';

// Clean SVG Outlines matching the engraving design
const TargetIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 17a5 5 0 100-10 5 5 0 000 10z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14a2 2 0 100-4 2 2 0 000 4z" />
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

export default function App() {
  const { theme, toggleTheme } = useTheme();
  
  // Settings state
  const [settings, setSettings] = useLocalStorage('pomodoro_settings', {
    pomo: 25,
    short: 5,
    long: 20,
    interval: 4,
    autoBreak: false
  });

  // Tasks state
  const [tasks, setTasks] = useLocalStorage('pomodoro_tasks', []);
  const [activeTaskId, setActiveTaskId] = useLocalStorage('pomodoro_active_task_id', null);

  // Statistics state
  const [stats, setStats] = useLocalStorage('pomodoro_stats', {
    pomos: 0,
    todayPomos: 0,
    totalMins: 0,
    lastActiveDate: new Date().toDateString()
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Audio system hook
  const { playChime, startAmbient, stopAmbient, setVolume, initAudio } = useAudio();

  // Reset daily stats if new day
  useEffect(() => {
    const todayStr = new Date().toDateString();
    if (stats.lastActiveDate !== todayStr) {
      setStats(prev => ({
        ...prev,
        todayPomos: 0,
        lastActiveDate: todayStr
      }));
    }
  }, [stats.lastActiveDate, setStats]);

  // Show floating toast
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Callback when a timer session finishes
  const handleSessionComplete = (completedMode) => {
    initAudio();
    playChime();

    const todayStr = new Date().toDateString();

    if (completedMode === 'pomo') {
      const nextPomos = stats.pomos + 1;
      const nextTodayPomos = stats.todayPomos + 1;
      const nextTotalMins = stats.totalMins + settings.pomo;

      setStats({
        pomos: nextPomos,
        todayPomos: nextTodayPomos,
        totalMins: nextTotalMins,
        lastActiveDate: todayStr
      });

      if (activeTaskId) {
        setTasks(prev => prev.map(t => {
          if (t.id === activeTaskId) {
            const currentPomos = t.pomosCompleted || 0;
            return { ...t, pomosCompleted: currentPomos + 1 };
          }
          return t;
        }));
      }

      showToast('Focus session complete! Take a break.');
      
      const isLongBreak = nextPomos % settings.interval === 0;
      const nextMode = isLongBreak ? 'long' : 'short';
      
      timer.switchMode(nextMode);

      if (typeof window !== 'undefined' && Notification.permission === 'granted') {
        new Notification('FocusTomato', {
          body: isLongBreak ? 'Great work! Take a long break.' : 'Focus session complete! Take a short break.',
          icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🍅</text></svg>'
        });
      }

      if (settings.autoBreak) {
        setTimeout(() => timer.start(), 1000);
      }
    } else {
      showToast('Break over! Back to focus.');
      timer.switchMode('pomo');

      if (typeof window !== 'undefined' && Notification.permission === 'granted') {
        new Notification('FocusTomato', {
          body: 'Break over! Back to focus.',
          icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🍅</text></svg>'
        });
      }

      if (settings.autoBreak) {
        setTimeout(() => timer.start(), 1000);
      }
    }
  };

  // Adjust default timer value from side arrow clicks
  const handleDurationAdjust = (modeToAdjust, nextMinutes) => {
    const key = modeToAdjust === 'pomo' ? 'pomo' : modeToAdjust === 'short' ? 'short' : 'long';
    setSettings(prev => ({
      ...prev,
      [key]: nextMinutes
    }));
  };

  // Initialize timer
  const timer = useTimer(settings, handleSessionComplete, handleDurationAdjust);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        initAudio();
        if (timer.status === 'running') {
          timer.pause();
        } else {
          timer.start();
        }
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        timer.reset();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [timer, initAudio]);

  // Tasks handlers
  const handleAddTask = (name) => {
    const newTask = {
      id: Date.now().toString(),
      name,
      completed: false,
      pomosCompleted: 0,
      subtasks: []
    };
    setTasks(prev => [...prev, newTask]);
    if (!activeTaskId) {
      setActiveTaskId(newTask.id);
    }
  };

  const handleToggleTask = (id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleDeleteTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    if (activeTaskId === id) {
      setActiveTaskId(null);
    }
  };

  // Subtask handlers
  const handleAddSubtask = (taskId, subName) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const nextSubtasks = [...(t.subtasks || []), {
          id: Date.now().toString() + Math.random().toString(),
          name: subName,
          completed: false
        }];
        return { ...t, subtasks: nextSubtasks };
      }
      return t;
    }));
  };

  const handleToggleSubtask = (taskId, subId) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const nextSub = (t.subtasks || []).map(s => s.id === subId ? { ...s, completed: !s.completed } : s);
        return { ...t, subtasks: nextSub };
      }
      return t;
    }));
  };

  const handleDeleteSubtask = (taskId, subId) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const nextSub = (t.subtasks || []).filter(s => s.id !== subId);
        return { ...t, subtasks: nextSub };
      }
      return t;
    }));
  };

  const activeTask = tasks.find(t => t.id === activeTaskId);

  return (
    <div className="h-screen flex flex-col bg-app-bg text-app-ink transition-colors duration-300 overflow-hidden font-sans select-none pb-4">
      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-md border-[3px] border-app-br bg-app-card text-app-ink text-sm font-extrabold shadow-retro animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* 3-Column Newspaper Layout split by vertical lines */}
      <main className="flex-1 grid grid-cols-1 md:grid-cols-3 divide-y-[3px] md:divide-y-0 md:divide-x-[3px] divide-app-br gap-0 p-6 overflow-hidden max-h-screen">
        
        {/* Column 1: Personal Focus Dashboard (Tasks + Stats + Ambient Sounds) */}
        <section className="h-full pr-0 md:pr-6 pb-6 md:pb-0 flex flex-col gap-4 overflow-hidden">
          
          {/* Tasks checklist - stretches to fill column */}
          <div className="flex-1 border-[3px] border-app-br bg-app-card rounded-2xl shadow-retro p-5 overflow-hidden flex flex-col">
            <TaskInput 
              tasks={tasks}
              onAddTask={handleAddTask}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
              activeTaskId={activeTaskId}
              onSetActiveTask={setActiveTaskId}
              onAddSubtask={handleAddSubtask}
              onToggleSubtask={handleToggleSubtask}
              onDeleteSubtask={handleDeleteSubtask}
            />
          </div>

          {/* Stats Bar */}
          <div className="py-2.5 px-3 border-[3px] border-app-br bg-app-card rounded-xl shadow-retro-sm">
            <StatsChips 
              todayCount={stats.todayPomos} 
              totalCount={stats.pomos} 
              totalFocusMinutes={stats.totalMins}
            />
          </div>

          {/* Soundboard Card */}
          <div className="h-[200px] overflow-hidden flex-shrink-0">
            <AmbientSounds 
              startAmbient={startAmbient}
              stopAmbient={stopAmbient}
              setVolume={setVolume}
            />
          </div>

        </section>

        {/* Column 2: Core Timer stopwatch */}
        <section className="h-full px-0 md:px-6 py-6 md:py-0 flex flex-col justify-between overflow-hidden">
          {/* selector tabs */}
          <ModeSelector 
            mode={timer.mode} 
            onModeChange={timer.switchMode}
          />

          {/* Vintage timer card */}
          <div className="flex-1 flex flex-col justify-center items-center py-6 px-6 rounded-2xl border-[3px] border-app-br bg-app-card shadow-retro mb-4 relative">
            {/* Embedded Settings Cog & Theme Toggle (Navbar alternative) */}
            <div className="absolute top-4 right-4 flex gap-2">
              {/* Settings button */}
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="flex items-center justify-center w-8 h-8 border-2 border-app-br bg-app-card text-app-ink shadow-retro-sm shadow-retro-hover cursor-pointer"
                title="Settings"
              >
                <SettingsIcon />
              </button>

              {/* Theme Toggle */}
              <button 
                onClick={toggleTheme}
                className="flex items-center justify-center w-8 h-8 border-2 border-app-br bg-app-card text-app-ink shadow-retro-sm shadow-retro-hover cursor-pointer"
                title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              >
                {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
              </button>
            </div>

            <Timer 
              timeLeft={timer.timeLeft} 
              totalDuration={
                timer.mode === 'pomo' 
                  ? settings.pomo * 60 
                  : timer.mode === 'short' 
                    ? settings.short * 60 
                    : settings.long * 60
              } 
              mode={timer.mode}
              timerStatus={timer.status}
              onAdjustDuration={timer.adjustDuration}
            />

            <Controls 
              status={timer.status}
              mode={timer.mode}
              onStart={() => { initAudio(); timer.start(); }}
              onPause={timer.pause}
              onReset={timer.reset}
              onSkip={timer.skip}
            />

            <SessionDots 
              pomosCompleted={stats.pomos} 
              currentMode={timer.mode}
              timerStatus={timer.status}
            />
          </div>

          {/* Highlight current active focus task */}
          <div className="h-10 flex items-center justify-center">
            {activeTask && !activeTask.completed && (
              <div className="flex items-center justify-center gap-1.5 py-1.5 px-4 rounded-md border-2 border-app-br bg-app-tl text-tomato text-xs font-black shadow-retro-sm animate-pulse">
                <TargetIcon className="w-3.5 h-3.5" /> Focus task: <span className="underline">{activeTask.name}</span>
              </div>
            )}
          </div>
        </section>

        {/* Column 3: Group Focus Session Room */}
        <section className="h-full pl-0 md:pl-6 pt-6 md:pt-0 overflow-hidden">
          <div className="h-full border-[3px] border-app-br bg-app-card rounded-2xl shadow-retro p-5 overflow-hidden flex flex-col">
            <GroupSession onInviteCopied={() => showToast('Invite link copied!')} />
          </div>
        </section>

      </main>

      {/* Settings Modal dialog */}
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={(nextSettings) => {
          setSettings(nextSettings);
          showToast('Settings updated!');
        }}
      />
    </div>
  );
}
