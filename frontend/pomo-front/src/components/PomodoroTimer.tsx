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

const F1_MODE_LABELS: Record<TimerMode, string> = {
  'work': 'STINT',
  'short-break': 'IN-LAP',
  'long-break': 'PIT WINDOW',
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
  const elapsedPct = 100 - fillLevel;

  const race = useMemo(() => getCurrentRaceWeek(), []);
  const daysOut = useMemo(() => daysUntilRace(race), [race]);

  const switchMode = useCallback((newMode: TimerMode) => {
    setMode(newMode);
    setStatus('idle');
    setTimeRemaining(DURATIONS[newMode]);
  }, []);

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

  if (isF1) return renderF1();
  return renderCoffee();

  // ──────────────────────────────────────────────
  // F1 broadcast-HUD layout
  // ──────────────────────────────────────────────
  function renderF1() {
    const lapNum = (pomodoroCount % 4) + 1;
    const statusLabel = status === 'running' ? 'ON TRACK' : status === 'paused' ? 'YELLOW FLAG' : 'IN GARAGE';
    const statusColor =
      status === 'running' ? 'text-green-400'
      : status === 'paused' ? 'text-yellow-400'
      : 'text-zinc-500';

    return (
      <div className="flex flex-col gap-4 font-mono text-zinc-100">
        {/* Race meta strip */}
        <div className="border-b border-zinc-800 pb-3">
          <div className="text-[10px] tracking-[0.25em] text-zinc-500">
            ROUND {String(race.round).padStart(2, '0')} · 2026 SEASON
          </div>
          <div className="text-base font-bold tracking-wide mt-1">
            {race.name.toUpperCase()}
          </div>
          <div className="text-[11px] text-zinc-400 mt-0.5">
            {race.circuit.toUpperCase()} · {race.country.toUpperCase()} ·{' '}
            {daysOut === 0 ? 'RACE DAY' : daysOut > 0 ? `T-${daysOut}D` : 'SEASON CLOSED'}
          </div>
        </div>

        {/* Sector / mode tabs */}
        <div className="grid grid-cols-3 gap-1">
          {(Object.keys(DURATIONS) as TimerMode[]).map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={`px-2 py-1.5 text-[10px] font-bold tracking-[0.2em] border transition-colors ${
                mode === m
                  ? 'bg-cyan-500 text-black border-cyan-500'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-700 hover:border-zinc-500 hover:text-zinc-200'
              }`}
            >
              {F1_MODE_LABELS[m]}
            </button>
          ))}
        </div>

        {/* Track HUD */}
        <div className="border border-zinc-800 bg-black overflow-hidden">
          <F1Track progress={elapsedPct} isRunning={status === 'running'} race={race} />
        </div>

        {/* Driver telemetry card */}
        <div className="border border-zinc-800 bg-zinc-950">
          <div className="flex items-center justify-between bg-cyan-500 text-black px-3 py-1">
            <span className="text-[10px] font-bold tracking-[0.25em]">DRIVER · YOU</span>
            <span className="text-[10px] font-bold">#01</span>
          </div>
          <div className="p-3 space-y-2 text-xs">
            <Row label="TASK" value={selectedTask ? selectedTask.title : '— UNASSIGNED —'} />
            <Row label="STATUS" value={statusLabel} valueClass={statusColor} />
            <Row label="PHASE" value={F1_MODE_LABELS[mode]} />
            <Row label="LAP" value={`${lapNum}/4`} />

            <div className="pt-1">
              <div className="flex justify-between text-[10px] text-zinc-500 mb-1">
                <span>STINT PROGRESS</span>
                <span>{Math.round(elapsedPct)}%</span>
              </div>
              <div className="h-2 bg-zinc-900 border border-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-cyan-500 to-cyan-300 transition-all duration-1000 linear"
                  style={{ width: `${elapsedPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Race time */}
        <div className="border border-zinc-800 bg-zinc-950 px-3 py-3 text-center">
          <div className="text-[10px] tracking-[0.25em] text-zinc-500">RACE TIME</div>
          <div className="text-5xl font-bold tracking-widest text-white tabular-nums mt-1">
            {timeDisplay}
          </div>
        </div>

        {/* Playback-style controls */}
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={reset}
            title="Reset session"
            className="w-10 h-10 flex items-center justify-center border border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 active:scale-95 transition-all"
            aria-label="Reset"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
              <path d="M6 6h2v12H6zM9.5 12l8.5 6V6z" transform="scale(-1,1) translate(-24,0)" />
            </svg>
          </button>
          {status === 'running' ? (
            <button
              onClick={pause}
              className="px-6 h-10 flex items-center justify-center bg-yellow-500 text-black font-bold text-xs tracking-[0.2em] active:scale-95 transition-all"
            >
              ▍▍ PAUSE
            </button>
          ) : (
            <button
              onClick={start}
              className="px-6 h-10 flex items-center justify-center bg-green-500 text-black font-bold text-xs tracking-[0.2em] hover:bg-green-400 active:scale-95 transition-all"
            >
              ▶ {status === 'paused' ? 'RESUME' : 'LIGHTS OUT'}
            </button>
          )}
        </div>

        {/* Lap pips */}
        <div className="flex items-center justify-center gap-3 text-[10px] tracking-[0.2em] text-zinc-500">
          <div className="flex gap-1.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rotate-45 ${
                  i < pomodoroCount % 4 ? 'bg-cyan-400' : 'bg-zinc-800 border border-zinc-700'
                }`}
              />
            ))}
          </div>
          <span>{pomodoroCount} LAPS COMPLETE</span>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────
  // Coffee layout (unchanged)
  // ──────────────────────────────────────────────
  function renderCoffee() {
    return (
      <div className="flex flex-col items-center gap-6">
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

        <div className="text-center min-h-6">
          {selectedTask ? (
            <p className="text-amber-900 font-medium text-sm">
              Working on: <span className="font-bold">{selectedTask.title}</span>
            </p>
          ) : (
            <p className="text-amber-400 text-sm italic">Select a task to get started</p>
          )}
        </div>

        <div className="w-52 h-56">
          <CoffeeCup fillLevel={fillLevel} isRunning={status === 'running'} />
        </div>

        <div className="text-6xl font-mono font-bold tracking-widest" style={{ color: '#3E1F00' }}>
          {timeDisplay}
        </div>

        <p className="text-amber-700 text-sm font-medium uppercase tracking-widest">
          {MODE_LABELS[mode]}
        </p>

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

        <div className="flex items-center gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-all ${
                i < pomodoroCount % 4 ? 'bg-amber-700' : 'bg-amber-200'
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
}

function Row({ label, value, valueClass = 'text-zinc-100' }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-900 pb-1.5 last:border-b-0 last:pb-0">
      <span className="text-[10px] tracking-[0.2em] text-zinc-500">{label}</span>
      <span className={`text-xs font-bold ${valueClass} truncate max-w-[55%] text-right`}>
        {value}
      </span>
    </div>
  );
}
