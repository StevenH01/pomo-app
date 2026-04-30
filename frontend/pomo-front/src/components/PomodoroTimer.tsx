'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import CoffeeCup from './CoffeeCup';
import F1Track from './F1Track';
import { useTheme } from '../contexts/ThemeContext';
import { getCurrentRaceWeek, daysUntilRace } from '../lib/f1Calendar';

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
  const { theme } = useTheme();
  const [mode, setMode] = useState<TimerMode>('work');
  const [status, setStatus] = useState<TimerStatus>('idle');
  const [timeRemaining, setTimeRemaining] = useState(DURATIONS['work']);
  const [pomodoroCount, setPomodoroCount] = useState(0);

  const totalDuration = DURATIONS[mode];
  const fillLevel = (timeRemaining / totalDuration) * 100;
  const elapsedPct = 100 - fillLevel; // car progress: 0 → 100 over the session

  // Pick race once on mount; don't recompute every render.
  const race = useMemo(() => getCurrentRaceWeek(), []);
  const daysOut = useMemo(() => daysUntilRace(race), [race]);

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

  const isF1 = theme === 'f1';

  // Theme-dependent classes
  const tabBg          = isF1 ? 'bg-zinc-800'  : 'bg-amber-100';
  const tabActive      = isF1 ? 'bg-red-600 text-white shadow' : 'bg-amber-800 text-amber-50 shadow';
  const tabInactive    = isF1 ? 'text-zinc-300 hover:bg-zinc-700' : 'text-amber-800 hover:bg-amber-200';
  const taskLabelText  = isF1 ? 'text-zinc-100' : 'text-amber-900';
  const taskHintText   = isF1 ? 'text-zinc-500' : 'text-amber-400';
  const timeColor      = isF1 ? '#f8fafc' : '#3E1F00';
  const modeLabelText  = isF1 ? 'text-zinc-400' : 'text-amber-700';
  const startBtn       = isF1
    ? 'bg-red-600 hover:bg-red-700'
    : 'bg-amber-700 hover:bg-amber-800';
  const resetBtn       = isF1
    ? 'border-zinc-500 text-zinc-200 hover:bg-zinc-800'
    : 'border-amber-700 text-amber-700 hover:bg-amber-100';
  const dotActive      = isF1 ? 'bg-red-500' : 'bg-amber-700';
  const dotInactive    = isF1 ? 'bg-zinc-700' : 'bg-amber-200';
  const counterText    = isF1 ? 'text-zinc-400' : 'text-amber-700';

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Mode tabs */}
      <div className={`flex gap-2 rounded-full p-1 ${tabBg}`}>
        {(Object.keys(DURATIONS) as TimerMode[]).map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              mode === m ? tabActive : tabInactive
            }`}
          >
            {MODE_LABELS[m]}
          </button>
        ))}
      </div>

      {/* Selected task label */}
      <div className="text-center min-h-6">
        {selectedTask ? (
          <p className={`${taskLabelText} font-medium text-sm`}>
            Working on: <span className="font-bold">{selectedTask.title}</span>
          </p>
        ) : (
          <p className={`${taskHintText} text-sm italic`}>Select a task to get started</p>
        )}
      </div>

      {/* Visual: coffee cup OR F1 track */}
      {isF1 ? (
        <div className="w-full max-w-md">
          <F1Track
            progress={elapsedPct}
            isRunning={status === 'running'}
            race={race}
          />
          <p className="text-center text-zinc-400 text-xs mt-2">
            {race.circuit} · {daysOut === 0 ? 'race day!' : daysOut > 0 ? `${daysOut} day${daysOut === 1 ? '' : 's'} to lights out` : 'season complete'}
          </p>
        </div>
      ) : (
        <div className="w-52 h-56">
          <CoffeeCup fillLevel={fillLevel} isRunning={status === 'running'} />
        </div>
      )}

      {/* Time display */}
      <div
        className="text-6xl font-mono font-bold tracking-widest"
        style={{ color: timeColor }}
      >
        {timeDisplay}
      </div>

      {/* Mode label */}
      <p className={`${modeLabelText} text-sm font-medium uppercase tracking-widest`}>
        {MODE_LABELS[mode]}
      </p>

      {/* Controls */}
      <div className="flex gap-3">
        {status === 'running' ? (
          <button
            onClick={pause}
            className={`px-8 py-3 rounded-full text-white font-semibold text-lg shadow-md active:scale-95 transition-all ${startBtn}`}
          >
            Pause
          </button>
        ) : (
          <button
            onClick={start}
            className={`px-8 py-3 rounded-full text-white font-semibold text-lg shadow-md active:scale-95 transition-all ${startBtn}`}
          >
            {status === 'paused' ? 'Resume' : 'Start'}
          </button>
        )}
        <button
          onClick={reset}
          className={`px-5 py-3 rounded-full border-2 font-semibold text-lg active:scale-95 transition-all ${resetBtn}`}
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
              i < pomodoroCount % 4 ? dotActive : dotInactive
            }`}
          />
        ))}
        <span className={`ml-2 ${counterText} text-sm`}>
          {pomodoroCount} {isF1 ? (pomodoroCount === 1 ? 'lap' : 'laps') : (pomodoroCount === 1 ? 'pomodoro' : 'pomodoros')} completed
        </span>
      </div>
    </div>
  );
}
