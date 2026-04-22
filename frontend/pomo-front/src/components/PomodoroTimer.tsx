'use client';

import { useState, useEffect, useCallback } from 'react';
import CoffeeCup from './CoffeeCup';

type TimerMode = 'work' | 'short-break' | 'long-break';
type TimerStatus = 'idle' | 'running' | 'paused';

const DURATIONS: Record<TimerMode, number> = {
  'work': 25 * 60,
  'short-break': 5 * 60,
  'long-break': 15 * 60,
};

const MODE_LABELS: Record<TimerMode, string> = {
  'work': 'Focus',
  'short-break': 'Short Break',
  'long-break': 'Long Break',
};

interface Task {
  id: number;
  title: string;
  completed: boolean;
}

interface PomodoroTimerProps {
  selectedTask: Task | null;
  onSessionComplete: () => void;
}

export default function PomodoroTimer({ selectedTask, onSessionComplete }: PomodoroTimerProps) {
  const [mode, setMode] = useState<TimerMode>('work');
  const [status, setStatus] = useState<TimerStatus>('idle');
  const [timeRemaining, setTimeRemaining] = useState(DURATIONS['work']);
  const [pomodoroCount, setPomodoroCount] = useState(0);

  const totalDuration = DURATIONS[mode];
  const fillLevel = (timeRemaining / totalDuration) * 100;

  const switchMode = useCallback((newMode: TimerMode) => {
    setMode(newMode);
    setStatus('idle');
    setTimeRemaining(DURATIONS[newMode]);
  }, []);

  // Tick
  useEffect(() => {
    if (status !== 'running') return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSessionEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, mode]);

  function handleSessionEnd() {
    if (mode === 'work') {
      const newCount = pomodoroCount + 1;
      setPomodoroCount(newCount);
      onSessionComplete();
      const nextMode = newCount % 4 === 0 ? 'long-break' : 'short-break';
      switchMode(nextMode);
    } else {
      switchMode('work');
    }
  }

  function start() {
    if (timeRemaining === 0) setTimeRemaining(DURATIONS[mode]);
    setStatus('running');
  }

  function pause() {
    setStatus('paused');
  }

  function reset() {
    setStatus('idle');
    setTimeRemaining(DURATIONS[mode]);
  }

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const timeDisplay = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Mode tabs */}
      <div className="flex gap-2 bg-amber-100 rounded-full p-1">
        {(Object.keys(DURATIONS) as TimerMode[]).map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              mode === m
                ? 'bg-amber-800 text-amber-50 shadow'
                : 'text-amber-800 hover:bg-amber-200'
            }`}
          >
            {MODE_LABELS[m]}
          </button>
        ))}
      </div>

      {/* Selected task label */}
      <div className="text-center min-h-6">
        {selectedTask ? (
          <p className="text-amber-900 font-medium text-sm">
            Working on: <span className="font-bold">{selectedTask.title}</span>
          </p>
        ) : (
          <p className="text-amber-400 text-sm italic">Select a task to get started</p>
        )}
      </div>

      {/* Coffee Cup */}
      <div className="w-52 h-56">
        <CoffeeCup fillLevel={fillLevel} isRunning={status === 'running'} />
      </div>

      {/* Time display */}
      <div
        className="text-6xl font-mono font-bold tracking-widest"
        style={{ color: '#3E1F00' }}
      >
        {timeDisplay}
      </div>

      {/* Mode label */}
      <p className="text-amber-700 text-sm font-medium uppercase tracking-widest">
        {MODE_LABELS[mode]}
      </p>

      {/* Controls */}
      <div className="flex gap-3">
        {status === 'running' ? (
          <button
            onClick={pause}
            className="px-8 py-3 rounded-full bg-amber-700 text-white font-semibold text-lg shadow-md hover:bg-amber-800 active:scale-95 transition-all"
          >
            Pause
          </button>
        ) : (
          <button
            onClick={start}
            className="px-8 py-3 rounded-full bg-amber-700 text-white font-semibold text-lg shadow-md hover:bg-amber-800 active:scale-95 transition-all"
          >
            {status === 'paused' ? 'Resume' : 'Start'}
          </button>
        )}
        <button
          onClick={reset}
          className="px-5 py-3 rounded-full border-2 border-amber-700 text-amber-700 font-semibold text-lg hover:bg-amber-100 active:scale-95 transition-all"
        >
          Reset
        </button>
      </div>

      {/* Pomodoro count */}
      <div className="flex items-center gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-all ${
              i < pomodoroCount % 4
                ? 'bg-amber-700'
                : 'bg-amber-200'
            }`}
          />
        ))}
        <span className="ml-2 text-amber-700 text-sm">
          {pomodoroCount} {pomodoroCount === 1 ? 'pomodoro' : 'pomodoros'} completed
        </span>
      </div>
    </div>
  );
}
