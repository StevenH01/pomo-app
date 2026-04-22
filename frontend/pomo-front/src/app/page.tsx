'use client';

import { useState, useEffect } from 'react';
import PomodoroTimer from '../components/PomodoroTimer';
import TaskList from '../components/TaskList';

interface Task {
  id: number;
  title: string;
  completed: boolean;
}

const API_BASE = 'http://localhost:8080/api';

export default function Home() {
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
      // optimistic fallback: add with temp id
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

  return (
    <div className="min-h-screen bg-linear-to-br from-amber-50 to-orange-100 px-4 py-10">
      <div className="max-w-5xl mx-auto flex flex-col items-center gap-10">

        {/* Header */}
        <header className="text-center">
          <h1 className="text-4xl font-bold text-amber-900 tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
            ☕ PomoCoffee
          </h1>
          <p className="mt-1 text-amber-700 text-sm">
            Stay focused, one cup at a time.
          </p>
        </header>

        {/* Main layout */}
        <div className="w-full flex flex-col lg:flex-row gap-10 items-start justify-center">

          {/* Timer */}
          <div className="shrink-0 w-full lg:w-auto flex justify-center">
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl p-8 w-full max-w-sm">
              <PomodoroTimer
                selectedTask={selectedTask}
                onSessionComplete={handleSessionComplete}
              />
            </div>
          </div>

          {/* Divider */}
          <div className="hidden lg:block w-px bg-amber-200 self-stretch" />

          {/* Task list */}
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
