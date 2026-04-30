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

export default function TaskList({
  tasks,
  selectedTaskId,
  onSelect,
  onAdd,
  onToggleComplete,
  onDelete,
}: TaskListProps) {
  const { theme } = useTheme();
  const isF1 = theme === 'f1';
  const [inputValue, setInputValue] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const title = inputValue.trim();
    if (!title) return;
    onAdd(title);
    setInputValue('');
  }

  // Theme classes
  const heading      = isF1 ? 'text-zinc-100' : 'text-amber-900';
  const input        = isF1
    ? 'border-zinc-600 bg-zinc-800 text-zinc-100 placeholder-zinc-500 focus:border-red-500'
    : 'border-amber-300 bg-amber-50 text-amber-900 placeholder-amber-400 focus:border-amber-600';
  const submitBtn    = isF1
    ? 'bg-red-600 hover:bg-red-700'
    : 'bg-amber-700 hover:bg-amber-800';
  const emptyText    = isF1 ? 'text-zinc-500' : 'text-amber-400';
  const itemSelected = isF1
    ? 'border-red-500 bg-zinc-800 shadow-sm'
    : 'border-amber-700 bg-amber-100 shadow-sm';
  const itemDefault  = isF1
    ? 'border-zinc-700 bg-zinc-900 hover:border-zinc-500'
    : 'border-amber-200 bg-amber-50 hover:border-amber-400';
  const checkboxOn   = isF1
    ? 'bg-red-600 border-red-600'
    : 'bg-amber-600 border-amber-600';
  const checkboxOff  = isF1
    ? 'border-zinc-500 hover:border-red-500'
    : 'border-amber-400 hover:border-amber-700';
  const titleDone    = isF1 ? 'line-through text-zinc-500' : 'line-through text-amber-400';
  const titleSelected = isF1 ? 'text-zinc-100 font-bold' : 'text-amber-900 font-bold';
  const titleDefault  = isF1 ? 'text-zinc-200' : 'text-amber-800';
  const badge        = isF1 ? 'bg-red-600 text-white' : 'bg-amber-700 text-white';
  const deleteBtn    = isF1 ? 'text-zinc-600 hover:text-red-400' : 'text-amber-300 hover:text-red-500';

  return (
    <div className="w-full max-w-md flex flex-col gap-4">
      <h2 className={`text-lg font-bold tracking-wide ${heading}`}>
        {isF1 ? 'Pit Wall' : 'Task List'}
      </h2>

      {/* Add task form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={isF1 ? 'Add a strategy call...' : 'Add a task...'}
          className={`flex-1 px-4 py-2 rounded-full border-2 focus:outline-none transition-colors ${input}`}
        />
        <button
          type="submit"
          disabled={!inputValue.trim()}
          className={`px-5 py-2 rounded-full text-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all ${submitBtn}`}
        >
          Add
        </button>
      </form>

      {/* Task items */}
      <ul className="flex flex-col gap-2">
        {tasks.length === 0 && (
          <li className={`text-center italic py-6 ${emptyText}`}>
            {isF1 ? 'No tasks queued. Box, box!' : 'No tasks yet. Add one above!'}
          </li>
        )}
        {tasks.map((task) => {
          const isSelected = task.id === selectedTaskId;
          return (
            <li
              key={task.id}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${
                isSelected ? itemSelected : itemDefault
              }`}
              onClick={() => !task.completed && onSelect(task)}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleComplete(task.id);
                }}
                className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  task.completed ? checkboxOn : checkboxOff
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
                  task.completed ? titleDone : isSelected ? titleSelected : titleDefault
                }`}
              >
                {task.title}
              </span>

              {isSelected && !task.completed && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${badge}`}>
                  {isF1 ? 'On Track' : 'Active'}
                </span>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(task.id);
                }}
                className={`flex-shrink-0 transition-colors ${deleteBtn}`}
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
