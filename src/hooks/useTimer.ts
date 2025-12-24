import { useState, useEffect, useCallback, useRef } from 'react';
import { TimerState } from '@/types';
import { storage } from '@/utils/storage';

export const useTimer = () => {
  const [timerState, setTimerState] = useState<TimerState>(() => storage.getTimerState());
  const [timerFinished, setTimerFinished] = useState(false);
  const intervalRef = useRef<number | null>(null);

  // Start the interval when timer is running
  useEffect(() => {
    if (timerState.status === 'running' && timerState.remainingSeconds > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimerState(prev => {
          const newRemaining = prev.remainingSeconds - 1;
          if (newRemaining <= 0) {
            // Timer finished
            const newState: TimerState = {
              ...prev,
              status: 'stopped',
              remainingSeconds: 0,
            };
            storage.saveTimerState(newState);
            setTimerFinished(true);
            return newState;
          }
          const newState = { ...prev, remainingSeconds: newRemaining };
          storage.saveTimerState(newState);
          return newState;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [timerState.status]);

  const startTimer = useCallback((minutes: number, taskId?: string, taskTitle?: string) => {
    const seconds = minutes * 60;
    const newState: TimerState = {
      status: 'running',
      remainingSeconds: seconds,
      totalSeconds: seconds,
      linkedTaskId: taskId,
      linkedTaskTitle: taskTitle,
      startedAt: Date.now(),
    };
    setTimerState(newState);
    storage.saveTimerState(newState);
    setTimerFinished(false);
  }, []);

  const pauseTimer = useCallback(() => {
    setTimerState(prev => {
      if (prev.status !== 'running') return prev;
      const newState: TimerState = {
        ...prev,
        status: 'paused',
        pausedAt: Date.now(),
      };
      storage.saveTimerState(newState);
      return newState;
    });
  }, []);

  const resumeTimer = useCallback(() => {
    setTimerState(prev => {
      if (prev.status !== 'paused') return prev;
      const newState: TimerState = {
        ...prev,
        status: 'running',
        startedAt: Date.now(),
      };
      storage.saveTimerState(newState);
      return newState;
    });
  }, []);

  const stopTimer = useCallback(() => {
    const newState: TimerState = {
      status: 'stopped',
      remainingSeconds: 0,
      totalSeconds: 0,
    };
    setTimerState(newState);
    storage.clearTimer();
    setTimerFinished(false);
  }, []);

  const dismissFinished = useCallback(() => {
    setTimerFinished(false);
  }, []);

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    timerState,
    timerFinished,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    dismissFinished,
    formatTime,
  };
};
