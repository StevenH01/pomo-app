'use client';

interface CoffeeCupProps {
  fillLevel: number; // 0–100
  isRunning: boolean;
}

export default function CoffeeCup({ fillLevel, isRunning }: CoffeeCupProps) {
  const clampedFill = Math.max(0, Math.min(100, fillLevel));

  // Cup interior bounds
  const interiorX = 24;
  const interiorY = 28;
  const interiorW = 72;
  const interiorH = 84;

  // Coffee fill rect — anchored to bottom of interior
  const coffeeH = (interiorH * clampedFill) / 100;
  const coffeeY = interiorY + interiorH - coffeeH;

  const showSteam = clampedFill > 55 && isRunning;

  return (
    <svg
      viewBox="0 0 160 180"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full drop-shadow-lg"
      aria-label={`Coffee cup ${Math.round(clampedFill)}% full`}
    >
      <defs>
        {/* Clip to cup interior */}
        <clipPath id="cup-interior-clip">
          <rect x={interiorX} y={interiorY} width={interiorW} height={interiorH} rx="6" />
        </clipPath>

        {/* Gradient for coffee liquid */}
        <linearGradient id="coffee-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8B5E3C" />
          <stop offset="100%" stopColor="#3E1F00" />
        </linearGradient>

        {/* Gradient for cup body */}
        <linearGradient id="cup-gradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#F5E6D3" />
          <stop offset="50%" stopColor="#FDFAF6" />
          <stop offset="100%" stopColor="#EDD9C0" />
        </linearGradient>
      </defs>

      {/* ── Steam ── */}
      {showSteam && (
        <g opacity="0.7">
          <path
            d="M 55 22 Q 50 14 55 6 Q 60 -2 55 -10"
            fill="none"
            stroke="#C4A882"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="animate-steam-1"
          />
          <path
            d="M 75 18 Q 70 10 75 2 Q 80 -6 75 -14"
            fill="none"
            stroke="#C4A882"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="animate-steam-2"
          />
          <path
            d="M 95 22 Q 90 14 95 6 Q 100 -2 95 -10"
            fill="none"
            stroke="#C4A882"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="animate-steam-3"
          />
        </g>
      )}

      {/* ── Cup body fill ── */}
      <rect
        x={interiorX}
        y={interiorY}
        width={interiorW}
        height={interiorH}
        rx="6"
        fill="url(#cup-gradient)"
      />

      {/* ── Coffee liquid ── */}
      <rect
        x={interiorX}
        y={coffeeY}
        width={interiorW}
        height={Math.max(0, coffeeH)}
        fill="url(#coffee-gradient)"
        clipPath="url(#cup-interior-clip)"
        style={{ transition: 'y 0.8s ease-in-out, height 0.8s ease-in-out' }}
      />

      {/* Coffee surface highlight */}
      {clampedFill > 2 && (
        <ellipse
          cx={interiorX + interiorW / 2}
          cy={coffeeY + 4}
          rx={interiorW / 2 - 4}
          ry={5}
          fill="#A0714F"
          opacity="0.5"
          clipPath="url(#cup-interior-clip)"
          style={{ transition: 'cy 0.8s ease-in-out' }}
        />
      )}

      {/* ── Cup outline ── */}
      <rect
        x="20"
        y="24"
        width="80"
        height="92"
        rx="10"
        fill="none"
        stroke="#7B4F2E"
        strokeWidth="4"
      />

      {/* ── Handle ── */}
      <path
        d="M 100 48 C 130 48, 130 100, 100 100"
        fill="none"
        stroke="#7B4F2E"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* ── Saucer ── */}
      <ellipse
        cx="60"
        cy="126"
        rx="52"
        ry="10"
        fill="#EDD9C0"
        stroke="#7B4F2E"
        strokeWidth="3"
      />
      <ellipse
        cx="60"
        cy="124"
        rx="36"
        ry="6"
        fill="none"
        stroke="#7B4F2E"
        strokeWidth="2"
        opacity="0.4"
      />

      {/* ── Fill % label ── */}
      <text
        x="60"
        y="158"
        textAnchor="middle"
        fontSize="13"
        fontFamily="Georgia, serif"
        fill="#5D2E0C"
        opacity="0.6"
      >
        {Math.round(clampedFill)}%
      </text>
    </svg>
  );
}
