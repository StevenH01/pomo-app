'use client';

import { useTheme } from '../contexts/ThemeContext';

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const isF1 = theme === 'f1';

  function toggle() {
    setTheme(isF1 ? 'coffee' : 'f1');
  }

  // Show the destination — the theme you'd switch TO.
  const targetIcon = isF1 ? '☕' : '🏎️';
  const targetLabel = isF1 ? 'Coffee' : 'F1';

  const baseClasses =
    'group inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold shadow-md active:scale-95 transition-all';
  const themeClasses = isF1
    ? 'bg-zinc-800 text-zinc-100 border-2 border-zinc-700 hover:bg-zinc-700 hover:border-red-500'
    : 'bg-white text-amber-900 border-2 border-amber-300 hover:bg-amber-50 hover:border-amber-700';

  return (
    <button
      onClick={toggle}
      className={`${baseClasses} ${themeClasses}`}
      aria-label={`Switch to ${targetLabel} theme`}
      title={`Switch to ${targetLabel} theme`}
    >
      <svg
        className="w-4 h-4 transition-transform group-hover:rotate-180"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M3 7h13M16 7l-3-3M16 7l-3 3" />
        <path d="M21 17H8M8 17l3-3M8 17l3 3" />
      </svg>
      <span>Switch to {targetLabel}</span>
      <span className="text-base leading-none">{targetIcon}</span>
    </button>
  );
}
