'use client';

import { useState, useEffect } from 'react';
import PomodoroTimer from '../components/PomodoroTimer';
import TaskList from '../components/TaskList';
import ThemeSwitcher from '../components/ThemeSwitcher';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';

interface Task {
  id: number;
  title: string;
  completed: boolean;
}

const API_BASE = 'http://localhost:8080/api';

function HomeInner() {
  const { theme } = useTheme();
  const isF1 = theme === 'f1';

  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

  const selectedTask = tasks.find((t) => t.id === selectedTaskId) ?? null;

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
      // Optionally auto-complete task after session — user can do it manually
    }
  }

  // Theme tokens for the page chrome
  const pageBg = isF1
    ? 'bg-linear-to-br from-zinc-950 via-zinc-900 to-red-950'
    : 'bg-linear-to-br from-amber-50 to-orange-100';
  const titleColor = isF1 ? 'text-zinc-50' : 'text-amber-900';
  const subtitleColor = isF1 ? 'text-zinc-400' : 'text-amber-700';
  const cardBg = isF1
    ? 'bg-zinc-900/70 ring-1 ring-zinc-800'
    : 'bg-white/70';
  const dividerColor = isF1 ? 'bg-zinc-800' : 'bg-amber-200';
  const footerColor = isF1 ? 'text-zinc-600' : 'text-amber-400';
  const titleFont = isF1
    ? { fontFamily: 'Arial Black, Impact, sans-serif', letterSpacing: '0.05em' }
    : { fontFamily: 'Georgia, serif' };

  return (
    <div className={`min-h-screen px-4 py-10 ${pageBg}`}>
      <div className="max-w-5xl mx-auto flex flex-col items-center gap-6">

        {/* Theme switcher */}
        <div className="self-end">
          <ThemeSwitcher />
        </div>

        {/* Header */}
        <header className="text-center">
          <h1 className={`text-4xl font-bold tracking-tight ${titleColor}`} style={titleFont}>
            {isF1 ? '🏎️ PomoGrid' : '☕ PomoCoffee'}
          </h1>
          <p className={`mt-1 text-sm ${subtitleColor}`}>
            {isF1
              ? 'Lights out, head down — finish the lap before the chequered flag.'
              : 'Stay focused, one cup at a time.'}
          </p>
        </header>

        {/* Main layout */}
        <div className="w-full flex flex-col lg:flex-row gap-10 items-start justify-center">

          {/* Timer */}
          <div className="shrink-0 w-full lg:w-auto flex justify-center">
            <div className={`backdrop-blur-sm rounded-3xl shadow-xl p-8 w-full max-w-xl ${cardBg}`}>
              <PomodoroTimer
                selectedTask={selectedTask}
                onSessionComplete={handleSessionComplete}
              />
            </div>
          </div>

          {/* Divider */}
          <div className={`hidden lg:block w-px self-stretch ${dividerColor}`} />

          {/* Task list */}
          <div className="flex-1 w-full flex justify-center">
            <div className={`backdrop-blur-sm rounded-3xl shadow-xl p-8 w-full max-w-md ${cardBg}`}>
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

        <footer className={`text-xs ${footerColor}`}>
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
