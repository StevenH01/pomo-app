'use client';

import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface Task {
  id: number;
  title: string;
  completed: boolean;
}

interface TaskListProps {
  tasks: Task[];
  selectedTaskId: number | null;
  onSelect: (task: Task) => void;
  onAdd: (title: string) => void;
  onToggleComplete: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function TaskList(props: TaskListProps) {
  const { theme } = useTheme();
  if (theme === 'f1') return <F1TaskList {...props} />;
  return <CoffeeTaskList {...props} />;
}

// ──────────────────────────────────────────────
// F1 broadcast leaderboard / strategy panel
// ──────────────────────────────────────────────
function F1TaskList({
  tasks,
  selectedTaskId,
  onSelect,
  onAdd,
  onToggleComplete,
  onDelete,
}: TaskListProps) {
  const [inputValue, setInputValue] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const title = inputValue.trim();
    if (!title) return;
    onAdd(title);
    setInputValue('');
  }

  return (
    <div className="w-full max-w-md flex flex-col gap-3 font-mono text-zinc-100">
      {/* Panel header */}
      <div>
        <div className="bg-orange-500 text-black px-3 py-1 flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-[0.25em]">PIT WALL · STRATEGY</span>
          <span className="text-[10px] font-bold">{tasks.length} ENTRIES</span>
        </div>

        {/* Add form */}
        <form onSubmit={handleSubmit} className="flex border border-zinc-800 border-t-0">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="ADD STRATEGY CALL..."
            className="flex-1 px-3 py-2 bg-zinc-950 text-zinc-100 placeholder-zinc-600 text-xs tracking-wider focus:outline-none focus:bg-zinc-900"
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="px-4 bg-cyan-500 text-black font-bold text-[10px] tracking-[0.2em] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-cyan-400 active:scale-95 transition-all"
          >
            + ADD
          </button>
        </form>
      </div>

      {/* Leaderboard / task list */}
      <ul className="flex flex-col">
        {tasks.length === 0 && (
          <li className="text-center text-zinc-600 text-[11px] tracking-[0.2em] py-8 border border-zinc-900 bg-zinc-950">
            — NO STRATEGY CALLS — BOX, BOX —
          </li>
        )}
        {tasks.map((task, idx) => {
          const isSelected = task.id === selectedTaskId;
          const positionLabel = String(idx + 1).padStart(2, '0');
          return (
            <li
              key={task.id}
              className={`flex items-stretch border-b border-zinc-900 last:border-b-0 cursor-pointer transition-colors ${
                isSelected ? 'bg-zinc-900' : 'bg-zinc-950 hover:bg-zinc-900'
              }`}
              onClick={() => !task.completed && onSelect(task)}
            >
              {/* Position number with active accent */}
              <div
                className={`w-9 flex items-center justify-center text-[11px] font-bold tracking-wider ${
                  isSelected ? 'bg-cyan-500 text-black' : 'text-zinc-500 border-r border-zinc-900'
                }`}
              >
                {positionLabel}
              </div>

              {/* Checkbox / status indicator */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleComplete(task.id);
                }}
                className="px-3 flex items-center"
                aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
              >
                <span
                  className={`w-3 h-3 border flex items-center justify-center transition-colors ${
                    task.completed
                      ? 'bg-green-500 border-green-500'
                      : 'border-zinc-600 hover:border-cyan-400'
                  }`}
                >
                  {task.completed && (
                    <svg className="w-2 h-2 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </span>
              </button>

              {/* Title */}
              <span
                className={`flex-1 py-2 pr-2 text-xs tracking-wide truncate ${
                  task.completed
                    ? 'line-through text-zinc-600'
                    : isSelected
                    ? 'text-white font-bold'
                    : 'text-zinc-300'
                }`}
              >
                {task.title}
              </span>

              {/* Active flag */}
              {isSelected && !task.completed && (
                <span className="self-center text-[9px] font-bold tracking-[0.2em] bg-green-500 text-black px-1.5 py-0.5 mr-1">
                  PUSH
                </span>
              )}

              {/* Delete */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(task.id);
                }}
                className="px-3 text-zinc-600 hover:text-red-400 transition-colors"
                aria-label="Delete task"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ──────────────────────────────────────────────
// Coffee task list (unchanged)
// ──────────────────────────────────────────────
function CoffeeTaskList({
  tasks,
  selectedTaskId,
  onSelect,
  onAdd,
  onToggleComplete,
  onDelete,
}: TaskListProps) {
  const [inputValue, setInputValue] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const title = inputValue.trim();
    if (!title) return;
    onAdd(title);
    setInputValue('');
  }

  return (
    <div className="w-full max-w-md flex flex-col gap-4">
      <h2 className="text-lg font-bold tracking-wide text-amber-900">Task List</h2>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Add a task..."
          className="flex-1 px-4 py-2 rounded-full border-2 border-amber-300 bg-amber-50 text-amber-900 placeholder-amber-400 focus:outline-none focus:border-amber-600 transition-colors"
        />
        <button
          type="submit"
          disabled={!inputValue.trim()}
          className="px-5 py-2 rounded-full bg-amber-700 text-white font-semibold hover:bg-amber-800 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all"
        >
          Add
        </button>
      </form>

      <ul className="flex flex-col gap-2">
        {tasks.length === 0 && (
          <li className="text-center text-amber-400 italic py-6">
            No tasks yet. Add one above!
          </li>
        )}
        {tasks.map((task) => {
          const isSelected = task.id === selectedTaskId;
          return (
            <li
              key={task.id}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${
                isSelected
                  ? 'border-amber-700 bg-amber-100 shadow-sm'
                  : 'border-amber-200 bg-amber-50 hover:border-amber-400'
              }`}
              onClick={() => !task.completed && onSelect(task)}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleComplete(task.id);
                }}
                className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  task.completed
                    ? 'bg-amber-600 border-amber-600'
                    : 'border-amber-400 hover:border-amber-700'
                }`}
                aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
              >
                {task.completed && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>

              <span
                className={`flex-1 text-sm font-medium transition-colors ${
                  task.completed
                    ? 'line-through text-amber-400'
                    : isSelected
                    ? 'text-amber-900 font-bold'
                    : 'text-amber-800'
                }`}
              >
                {task.title}
              </span>

              {isSelected && !task.completed && (
                <span className="text-xs bg-amber-700 text-white px-2 py-0.5 rounded-full">
                  Active
                </span>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(task.id);
                }}
                className="flex-shrink-0 text-amber-300 hover:text-red-500 transition-colors"
                aria-label="Delete task"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
