'use client';

import { useState, useEffect, useMemo } from 'react';
import PomodoroTimer from '../components/PomodoroTimer';
import TaskList from '../components/TaskList';
import ThemeSwitcher from '../components/ThemeSwitcher';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';
import { getCurrentRaceWeek } from '../lib/f1Calendar';

interface Task {
  id: number;
  title: string;
  completed: boolean;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8080/api';

function HomeInner() {
  const { theme } = useTheme();
  const isF1 = theme === 'f1';

  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

  const selectedTask = tasks.find((t) => t.id === selectedTaskId) ?? null;
  const race = useMemo(() => getCurrentRaceWeek(), []);

  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    try {
      const res = await fetch(`${API_BASE}/tasks`);
      if (res.ok) setTasks(await res.json());
    } catch {
      // backend not running — start without tasks
    }
  }

  async function handleAddTask(title: string) {
    try {
      const res = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      if (res.ok) {
        const newTask: Task = await res.json();
        setTasks((prev) => [...prev, newTask]);
      }
    } catch {
      const tempTask: Task = { id: Date.now(), title, completed: false };
      setTasks((prev) => [...prev, tempTask]);
    }
  }

  async function handleToggleComplete(id: number) {
    try {
      const res = await fetch(`${API_BASE}/tasks/${id}/complete`, { method: 'PATCH' });
      if (res.ok) {
        const updated: Task = await res.json();
        setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
        if (updated.completed && selectedTaskId === id) setSelectedTaskId(null);
      }
    } catch {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
      );
    }
  }

  async function handleDeleteTask(id: number) {
    try {
      await fetch(`${API_BASE}/tasks/${id}`, { method: 'DELETE' });
    } catch {
      // proceed with local deletion
    }
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (selectedTaskId === id) setSelectedTaskId(null);
  }

  function handleSelectTask(task: Task) {
    setSelectedTaskId(task.id === selectedTaskId ? null : task.id);
  }

  function handleSessionComplete() {
    if (selectedTask) {
      // user can complete tasks manually
    }
  }

  if (isF1) {
    return (
      <div className="min-h-screen bg-black text-zinc-100 font-mono">
        {/* Top broadcast bar */}
        <div className="border-b border-zinc-800 bg-zinc-950">
          <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <span className="bg-red-600 text-white text-[10px] font-bold tracking-[0.25em] px-2 py-1">
                LIVE
              </span>
              <span className="text-[11px] tracking-[0.25em] text-zinc-500 hidden sm:inline">
                F1 RACE REPLAY · POMODORO
              </span>
            </div>
            <ThemeSwitcher />
          </div>
        </div>

        {/* Race title bar — country, name, date */}
        <div className="border-b border-zinc-800 bg-linear-to-r from-zinc-900 via-zinc-950 to-zinc-900">
          <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <div className="text-[10px] tracking-[0.25em] text-zinc-500">
                2026 ROUND {String(race.round).padStart(2, '0')} · {new Date(race.raceDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()}
              </div>
              <div className="text-lg font-bold tracking-wide text-white mt-0.5">
                {race.name.toUpperCase()}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] tracking-[0.25em] text-zinc-500">CIRCUIT</div>
              <div className="text-sm font-bold text-zinc-200 tracking-wider">
                {race.circuit.toUpperCase()} · {race.country.toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {/* Main grid */}
        <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)] gap-6">
          <div>
            <PomodoroTimer
              selectedTask={selectedTask}
              onSessionComplete={handleSessionComplete}
            />
          </div>
          <div>
            <TaskList
              tasks={tasks}
              selectedTaskId={selectedTaskId}
              onSelect={handleSelectTask}
              onAdd={handleAddTask}
              onToggleComplete={handleToggleComplete}
              onDelete={handleDeleteTask}
            />
          </div>
        </div>

        {/* Bottom status bar */}
        <div className="border-t border-zinc-800 bg-zinc-950 mt-6">
          <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between text-[10px] tracking-[0.2em] text-zinc-500">
            <span>STATUS · CONNECTED</span>
            <span>25:00 STINT · 05:00 IN-LAP · 15:00 PIT WINDOW</span>
            <span>v1.0</span>
          </div>
        </div>
      </div>
    );
  }

  // ── Coffee theme (unchanged) ──
  return (
    <div className="min-h-screen px-4 py-10 bg-linear-to-br from-amber-50 to-orange-100">
      <div className="max-w-5xl mx-auto flex flex-col items-center gap-6">
        <div className="self-end">
          <ThemeSwitcher />
        </div>

        <header className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-amber-900" style={{ fontFamily: 'Georgia, serif' }}>
            ☕ PomoCoffee
          </h1>
          <p className="mt-1 text-sm text-amber-700">
            Stay focused, one cup at a time.
          </p>
        </header>

        <div className="w-full flex flex-col lg:flex-row gap-10 items-start justify-center">
          <div className="shrink-0 w-full lg:w-auto flex justify-center">
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl p-8 w-full max-w-sm">
              <PomodoroTimer
                selectedTask={selectedTask}
                onSessionComplete={handleSessionComplete}
              />
            </div>
          </div>

          <div className="hidden lg:block w-px bg-amber-200 self-stretch" />

          <div className="flex-1 w-full flex justify-center">
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl p-8 w-full max-w-md">
              <TaskList
                tasks={tasks}
                selectedTaskId={selectedTaskId}
                onSelect={handleSelectTask}
                onAdd={handleAddTask}
                onToggleComplete={handleToggleComplete}
                onDelete={handleDeleteTask}
              />
            </div>
          </div>
        </div>

        <footer className="text-amber-400 text-xs">
          25 min focus · 5 min break · long break every 4 sessions
        </footer>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <ThemeProvider>
      <HomeInner />
    </ThemeProvider>
  );
}
