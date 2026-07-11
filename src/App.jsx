import React, { useState, useEffect } from 'react';
import useTheme from './hooks/useTheme';
import useLocalStorage from './hooks/useLocalStorage';
import useAudio from './hooks/useAudio';
import useTimer from './hooks/useTimer';
import useGroupSync from './hooks/useGroupSync';
import ThemePicker from './components/ThemePicker';

import ModeSelector from './components/ModeSelector';
import Timer from './components/Timer';
import Controls from './components/Controls';
import SessionDots from './components/SessionDots';
import StatsChips from './components/StatsChips';
import RelaxationWidget from './components/RelaxationWidget';
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



// Adjective + Noun room ID generator (Monkeytype style)
const ADJECTIVES = ['swift','bright','silent','golden','crimson','ancient','iron','velvet','misty','lunar','bold','calm','dark','deep','emerald','silver','amber','jade','marble','steel'];
const NOUNS = ['falcon','harbor','press','lantern','forge','tide','grove','manor','tower','ridge','quill','anvil','ember','abbey','dusk','atlas','cipher','echo','fern','glyph'];
const generateRoomId = () => {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  return `${adj}-${noun}`;
};

export default function App() {
  const { theme, setTheme } = useTheme();
  
  // Persistent User ID for Group sessions (sessionStorage to isolate tabs on the same host)
  const [userId] = useState(() => {
    const saved = sessionStorage.getItem('pomodoro_user_id');
    if (saved) return saved;
    const generated = 'user_' + Math.random().toString(36).substring(2, 11);
    sessionStorage.setItem('pomodoro_user_id', generated);
    return generated;
  });

  // Dynamic Room ID read from URL query parameters (?room=xyz)
  const [roomId, setRoomId] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const r = params.get('room');
      if (r) return r;
    }
    return 'letterpress-lab';
  });

  // Settings state
  const [settings, setSettings] = useLocalStorage('pomodoro_settings', {
    displayName: 'Tomato Member',
    pomo: 25,
    short: 5,
    long: 20,
    interval: 4,
    autoBreak: false
  });

  // Lobby joining state
  const [hasJoined, setHasJoined] = useState(false);
  const [tempName, setTempName] = useState(settings.displayName || '');
  const [tempRoomId, setTempRoomId] = useState(roomId);

  // Private client Active Task ID selection (kept local to allow independent focus selection)
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
        // Increment pomosCompleted in the shared room database
        incrementTaskPomos(activeTaskId);
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

  // Initialize timer (running purely local and independent)
  const timer = useTimer(settings, handleSessionComplete, handleDurationAdjust);

  // Initialize Group room synchronization hook (Firebase / BroadcastChannel)
  const { 
    participants, 
    roomName,
    roomTasks,
    addTask,
    toggleTask,
    deleteTask,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    incrementTaskPomos
  } = useGroupSync({
    enabled: hasJoined, // Hook gates connection actions until user enters display name
    roomId,
    userId,
    userName: settings.displayName || 'Tomato Member',
    activeTaskId,
    timerState: {
      status: timer.status,
      mode: timer.mode,
      timeLeft: timer.timeLeft,
      duration: timer.duration || (timer.mode === 'pomo' ? settings.pomo * 60 : timer.mode === 'short' ? settings.short * 60 : settings.long * 60)
    }
  });

  const tasks = roomTasks || [];
  const activeTask = tasks.find(t => t.id === activeTaskId);

  // Switch room trigger
  const handleRoomChange = (newRoomId) => {
    setRoomId(newRoomId);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('room', newRoomId);
      window.history.pushState({}, '', url.toString());
      showToast(`Joined room: ${newRoomId}`);
    }
  };

  // Onboarding Join Room Trigger
  const handleJoin = (e) => {
    e.preventDefault();
    if (tempName.trim()) {
      setSettings(prev => ({ ...prev, displayName: tempName.trim() }));
      // Apply room ID if user changed it
      const finalRoom = (tempRoomId.trim().toLowerCase().replace(/\s+/g, '-')) || roomId;
      if (finalRoom !== roomId) {
        handleRoomChange(finalRoom);
      }
      setHasJoined(true);
      showToast(`Joined room "${finalRoom}" as ${tempName.trim()}`);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    if (!hasJoined) return;

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
  }, [timer, initAudio, hasJoined]);

  // Tasks handlers (relayed through the useGroupSync hook)
  const handleAddTask = (name) => {
    addTask(name, settings.displayName || 'Tomato Member');
  };

  const handleToggleTask = (id) => {
    toggleTask(id);
  };

  const handleDeleteTask = (id) => {
    deleteTask(id);
  };

  // Subtask handlers (relayed through the useGroupSync hook)
  const handleAddSubtask = (taskId, subName) => {
    addSubtask(taskId, subName);
  };

  const handleToggleSubtask = (taskId, subId) => {
    toggleSubtask(taskId, subId);
  };

  const handleDeleteSubtask = (taskId, subId) => {
    deleteSubtask(taskId, subId);
  };

  // Render Onboarding/Join Room Lobby Screen first
  if (!hasJoined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app-bg text-app-ink font-sans p-6 transition-colors duration-300">
        <div className="w-full max-w-sm border-[3px] border-app-br bg-app-card rounded-2xl shadow-retro p-8 text-center flex flex-col items-center select-none">
          {/* Vintage Woodcut Illustration */}
          <div className="w-24 h-24 mb-4 border-[3px] border-app-br rounded-full overflow-hidden bg-app-bg p-1 shadow-retro-sm">
            <img 
              src="/assets/tomato.jpg" 
              alt="Tomato Engraving" 
              className="w-full h-full object-contain filter dark:invert-0 dark:opacity-85 select-none"
              draggable="false"
            />
          </div>

          <h1 className="font-serif text-3xl mb-1 text-app-ink leading-tight">FocusTomato</h1>
          <p className="text-[10px] text-app-mt mb-6 uppercase tracking-[2.5px] font-black">
            London News Agency Sync
          </p>

          {/* Room ID Input */}
          <div className="w-full text-left mb-2 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] uppercase font-black text-app-mt tracking-wider">
                Room ID
              </label>
              <button
                type="button"
                onClick={() => setTempRoomId(generateRoomId())}
                className="text-[9px] font-black text-tomato hover:underline cursor-pointer tracking-wide uppercase"
              >
                Generate
              </button>
            </div>
            <input
              type="text"
              placeholder="e.g. design-sprint"
              maxLength={40}
              value={tempRoomId}
              onChange={(e) => setTempRoomId(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border-2 border-app-br bg-app-bg text-sm font-extrabold outline-none focus:border-tomato text-app-ink placeholder-app-mt/40"
            />
          </div>

          {/* Onboarding Form */}
          <form onSubmit={handleJoin} className="w-full flex flex-col gap-4">
            <div className="text-left flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-black text-app-mt tracking-wider">
                Enter Your Display Name
              </label>
              <input 
                type="text"
                required
                placeholder="e.g. Sarah"
                maxLength={20}
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 border-app-br bg-app-bg text-sm font-extrabold outline-none focus:border-tomato text-app-ink placeholder-app-mt/40"
              />
            </div>

            <button 
              type="submit"
              className="w-full py-3 rounded-lg border-[3px] border-app-br bg-tomato hover:bg-tomato-dark text-white text-xs font-black shadow-retro-sm shadow-retro-hover cursor-pointer transition-colors"
            >
              Join Session Room
            </button>
          </form>

          {/* Lobby Footer Credits */}
          <div className="text-[9px] text-app-mt font-extrabold tracking-wider mt-6 border-t border-app-br/20 pt-4 w-full uppercase">
            © {new Date().getFullYear()} FocusTomato • Designed by mgmoies • Powered by React, Vite & Firebase
          </div>
        </div>
      </div>
    );
  }

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
        
        {/* Column 1: Personal Focus Dashboard (Tasks + Ambient Sounds) */}
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

          {/* Soundboard Card (Adjusted height to fit header-aligned volume controls) */}
          <div className="h-[200px] shrink-0">
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

              {/* Theme Picker */}
              <ThemePicker currentTheme={theme} onThemeChange={setTheme} />
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
              timerStyle={settings.timerStyle || 'circle'}
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
          <div className="h-10 flex items-center justify-center shrink-0">
            {activeTask && !activeTask.completed && (
              <div className="flex items-center justify-center gap-1.5 py-1.5 px-4 rounded-md border-2 border-app-br bg-app-tl text-tomato text-xs font-black shadow-retro-sm animate-pulse">
                <TargetIcon className="w-3.5 h-3.5" /> Focus task: <span className="underline">{activeTask.name}</span>
              </div>
            )}
          </div>

          {/* Relaxation/Breathing Widget */}
          <div className="shrink-0 mb-4">
            <RelaxationWidget />
          </div>

          {/* Stats Chips */}
          <div className="shrink-0">
            <StatsChips 
              todayCount={stats.todayPomos} 
              totalCount={stats.pomos} 
              totalFocusMinutes={stats.totalMins}
            />
          </div>
        </section>

        {/* Column 3: Group Focus Session Room */}
        <section className="h-full pl-0 md:pl-6 pt-6 md:pt-0 overflow-hidden">
          <div className="h-full border-[3px] border-app-br bg-app-card rounded-2xl shadow-retro p-5 overflow-hidden flex flex-col">
            <GroupSession 
              roomId={roomId}
              participants={participants} 
              roomName={roomName}
              onInviteCopied={() => showToast('Invite link copied!')} 
              onRoomChange={handleRoomChange}
            />
          </div>
        </section>

      </main>

      {/* Footer Credits */}
      <footer className="text-center text-[9px] text-app-mt font-black py-1.5 shrink-0 tracking-wider uppercase border-t border-app-br/20 mt-1 select-none">
        © {new Date().getFullYear()} FocusTomato • Designed by mgmoies • Powered by React, Vite & Firebase
      </footer>

      {/* Settings Modal dialog */}
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={(nextSettings) => {
          setSettings(nextSettings);
          setTempName(nextSettings.displayName); // Sync back to lobby display state
          showToast('Settings updated!');
        }}
      />
    </div>
  );
}
