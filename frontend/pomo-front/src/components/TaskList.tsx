'use client';

import { useState } from 'react';

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
      <h2 className="text-lg font-bold text-amber-900 tracking-wide">Task List</h2>

      {/* Add task form */}
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

      {/* Task items */}
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
              {/* Checkbox */}
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

              {/* Title */}
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

              {/* Selected badge */}
              {isSelected && !task.completed && (
                <span className="text-xs bg-amber-700 text-white px-2 py-0.5 rounded-full">
                  Active
                </span>
              )}

              {/* Delete */}
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
