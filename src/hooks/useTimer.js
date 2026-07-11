import { useState, useEffect, useRef, useCallback } from 'react';

export default function useTimer(settings, onSessionComplete, onDurationAdjust) {
  const { pomo, short, long, interval } = settings;
  const [mode, setMode] = useState('pomo'); // 'pomo' | 'short' | 'long'
  const [timeLeft, setTimeLeft] = useState(pomo * 60);
  const [status, setStatus] = useState('idle'); // 'idle' | 'running' | 'paused'
  
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const durationSecondsRef = useRef(pomo * 60);
  const timeLeftOnPauseRef = useRef(pomo * 60);

  // Get duration based on mode
  const getDuration = useCallback((m) => {
    if (m === 'pomo') return pomo * 60;
    if (m === 'short') return short * 60;
    if (m === 'long') return long * 60;
    return pomo * 60;
  }, [pomo, short, long]);

  // Handle settings change
  useEffect(() => {
    if (status === 'idle') {
      const dur = getDuration(mode);
      setTimeLeft(dur);
      durationSecondsRef.current = dur;
      timeLeftOnPauseRef.current = dur;
    }
  }, [mode, pomo, short, long, getDuration, status]);

  // Stop current interval
  const stopInterval = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // High precision tick with drift correction
  const tick = useCallback(() => {
    const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
    const nextTimeLeft = Math.max(0, durationSecondsRef.current - elapsed);
    
    setTimeLeft(nextTimeLeft);

    if (nextTimeLeft <= 0) {
      stopInterval();
      setStatus('idle');
      onSessionComplete(mode);
    }
  }, [mode, onSessionComplete]);

  // Start timer
  const start = useCallback(() => {
    if (status === 'running') return;
    
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }

    setStatus('running');
    startTimeRef.current = Date.now() - (durationSecondsRef.current - timeLeftOnPauseRef.current) * 1000;
    timerRef.current = setInterval(tick, 200);
  }, [status, tick]);

  // Pause timer
  const pause = useCallback(() => {
    if (status !== 'running') return;
    
    stopInterval();
    setStatus('paused');
    timeLeftOnPauseRef.current = timeLeft;
  }, [status, timeLeft]);

  // Reset timer
  const reset = useCallback(() => {
    stopInterval();
    setStatus('idle');
    const dur = getDuration(mode);
    setTimeLeft(dur);
    durationSecondsRef.current = dur;
    timeLeftOnPauseRef.current = dur;
  }, [mode, getDuration]);

  // Skip current session
  const skip = useCallback(() => {
    stopInterval();
    setStatus('idle');
    onSessionComplete(mode);
  }, [mode, onSessionComplete]);

  // Quick switch mode manually
  const switchMode = useCallback((newMode) => {
    stopInterval();
    setStatus('idle');
    setMode(newMode);
    const dur = getDuration(newMode);
    setTimeLeft(dur);
    durationSecondsRef.current = dur;
    timeLeftOnPauseRef.current = dur;
  }, [getDuration]);

  // Increment or decrement duration by side arrows
  const adjustDuration = useCallback((changeInMinutes) => {
    if (status !== 'idle') return; // Only allow when timer is stopped/idle
    
    const currentMins = Math.floor(getDuration(mode) / 60);
    const nextMins = Math.max(1, currentMins + changeInMinutes);
    
    if (onDurationAdjust) {
      onDurationAdjust(mode, nextMins);
    }
  }, [mode, getDuration, status, onDurationAdjust]);

  // Sync timer state with remote room coordinator (Firebase/BroadcastChannel)
  const syncWithRemote = useCallback((remote) => {
    if (!remote) return;
    
    setMode(remote.mode);
    durationSecondsRef.current = remote.duration;
    setStatus(remote.status);

    if (remote.status === 'running') {
      startTimeRef.current = remote.startTime;
      const elapsed = Math.round((Date.now() - remote.startTime) / 1000);
      const nextTimeLeft = Math.max(0, remote.duration - elapsed);
      setTimeLeft(nextTimeLeft);
      
      stopInterval();
      timerRef.current = setInterval(tick, 200);
    } else if (remote.status === 'paused') {
      stopInterval();
      setTimeLeft(remote.pausedTimeLeft);
      timeLeftOnPauseRef.current = remote.pausedTimeLeft;
    } else {
      stopInterval();
      setTimeLeft(remote.duration);
      timeLeftOnPauseRef.current = remote.duration;
    }
  }, [tick]);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopInterval();
  }, []);

  return {
    timeLeft,
    status,
    mode,
    start,
    pause,
    reset,
    skip,
    switchMode,
    adjustDuration,
    syncWithRemote,
    // Expose refs/times for serialization
    startTime: startTimeRef.current,
    duration: durationSecondsRef.current,
    timeLeftOnPause: timeLeftOnPauseRef.current
  };
}

