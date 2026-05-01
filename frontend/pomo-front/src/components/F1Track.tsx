'use client';

import { useEffect, useRef, useState } from 'react';
import { F1Race } from '../lib/f1Calendar';

interface F1TrackProps {
  progress: number; // 0–100 (100 = finished)
  isRunning: boolean;
  race: F1Race;
}

// Albert Park (Australian Grand Prix) inspired silhouette. Path starts at the
// middle of the pit straight so the car begins/ends at the start/finish line.
// Goes clockwise: pit straight → turn 1 → right-side wiggle (turns 11–16) →
// bottom straight (sector 2) → bottom-left curl (turns 7–9) → chicane bumps
// across the middle (turns 3–6) → lake loop (turns 17–19) → back along the
// top straight to the start/finish.
const TRACK_PATH =
  'M 300 55 ' +
  'L 540 50 ' +
  'C 580 50, 590 80, 575 110 ' +
  'C 565 135, 590 150, 580 175 ' +
  'C 572 195, 590 215, 580 235 ' +
  'C 572 255, 555 275, 535 285 ' +
  'L 510 290 ' +
  'L 150 295 ' +
  'C 75 300, 35 270, 45 225 ' +
  'C 50 205, 65 195, 90 195 ' +
  'C 120 195, 140 175, 170 185 ' +
  'C 200 195, 230 175, 260 188 ' +
  'C 295 205, 320 175, 350 185 ' +
  'C 385 198, 410 178, 425 155 ' +
  'C 440 130, 425 105, 395 100 ' +
  'C 350 92, 290 90, 230 75 ' +
  'C 170 62, 120 55, 90 60 ' +
  'L 300 55 Z';

// Static "corner marker" dots — placed by distance % along the path so they
// sit on the racing line. Mimics the corner-number / sector dots in the broadcast UI.
const CORNER_MARKERS: { pct: number; color: string }[] = [
  { pct: 0.06, color: '#f97316' },
  { pct: 0.13, color: '#facc15' },
  { pct: 0.22, color: '#22d3ee' },
  { pct: 0.32, color: '#ec4899' },
  { pct: 0.41, color: '#22c55e' },
  { pct: 0.52, color: '#f97316' },
  { pct: 0.62, color: '#a78bfa' },
  { pct: 0.72, color: '#facc15' },
  { pct: 0.82, color: '#22d3ee' },
  { pct: 0.92, color: '#ec4899' },
];

export default function F1Track({ progress, isRunning, race }: F1TrackProps) {
  const pathRef = useRef<SVGPathElement>(null);
  const [carPos, setCarPos] = useState({ x: 120, y: 360, angle: 0 });
  const [pathLength, setPathLength] = useState(0);
  const [markerPositions, setMarkerPositions] = useState<{ x: number; y: number; color: string }[]>([]);

  useEffect(() => {
    if (!pathRef.current) return;
    const len = pathRef.current.getTotalLength();
    setPathLength(len);
    setMarkerPositions(
      CORNER_MARKERS.map((m) => {
        const p = pathRef.current!.getPointAtLength(m.pct * len);
        return { x: p.x, y: p.y, color: m.color };
      }),
    );
  }, []);

  useEffect(() => {
    if (!pathRef.current || pathLength === 0) return;
    const clamped = Math.max(0, Math.min(100, progress));
    const distance = (clamped / 100) * pathLength;
    const point = pathRef.current.getPointAtLength(distance);
    const ahead = pathRef.current.getPointAtLength(Math.min(distance + 1, pathLength));
    const angle = (Math.atan2(ahead.y - point.y, ahead.x - point.x) * 180) / Math.PI;
    setCarPos({ x: point.x, y: point.y, angle });
  }, [progress, pathLength]);

  const finished = progress >= 100;

  return (
    <svg
      viewBox="0 0 600 400"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      aria-label={`${race.name} track, lap ${Math.round(progress)}% complete`}
    >
      <defs>
        <pattern id="hud-grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1a1a1a" strokeWidth="0.5" />
        </pattern>
        <radialGradient id="car-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* HUD background */}
      <rect width="600" height="400" fill="#000" />
      <rect width="600" height="400" fill="url(#hud-grid)" opacity="0.6" />

      {/* Track outline (thin white) */}
      <path
        ref={pathRef}
        d={TRACK_PATH}
        fill="none"
        stroke="#f8fafc"
        strokeWidth="14"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* Asphalt fill (inner) */}
      <path
        d={TRACK_PATH}
        fill="none"
        stroke="#0a0a0a"
        strokeWidth="10"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* Centerline dashes */}
      <path
        d={TRACK_PATH}
        fill="none"
        stroke="#3f3f46"
        strokeWidth="1"
        strokeDasharray="4 10"
      />

      {/* Corner / sector markers */}
      {markerPositions.map((m, i) => (
        <g key={i}>
          <circle cx={m.x} cy={m.y} r="6" fill={m.color} opacity="0.18" />
          <circle cx={m.x} cy={m.y} r="3.5" fill={m.color} />
        </g>
      ))}

      {/* Start/finish line — checkered band perpendicular to pit straight (top, horizontal travel) */}
      <g transform="translate(300, 55)">
        {Array.from({ length: 5 }).map((_, i) => (
          <g key={i}>
            <rect x={-10 + i * 4} y={-9} width="4" height="9" fill={i % 2 === 0 ? '#fff' : '#000'} />
            <rect x={-10 + i * 4} y={0}  width="4" height="9" fill={i % 2 === 0 ? '#000' : '#fff'} />
          </g>
        ))}
      </g>

      {/* Race meta overlay — middle-bottom of viewBox (inside track interior, lower area) */}
      <g transform="translate(220, 365)" fontFamily="Consolas, ui-monospace, monospace" fill="#f8fafc">
        <text x="0" y="0" fontSize="11" fill="#71717a" letterSpacing="2">
          ROUND {String(race.round).padStart(2, '0')}
        </text>
        <text x="0" y="18" fontSize="14" fontWeight="700" letterSpacing="1">
          {race.name.toUpperCase()}
        </text>
        <text x="0" y="34" fontSize="10" fill="#a1a1aa" letterSpacing="1">
          {race.circuit.toUpperCase()} · {race.country.toUpperCase()}
        </text>
      </g>

      {/* Lap progress overlay — bottom-right */}
      <g transform="translate(580, 380)" textAnchor="end" fontFamily="Consolas, ui-monospace, monospace">
        <text x="0" y="0" fontSize="10" fill="#71717a" letterSpacing="2">
          LAP PROGRESS
        </text>
        <text x="0" y="-15" fontSize="22" fontWeight="700" fill="#22d3ee">
          {Math.round(progress)}%
        </text>
      </g>

      {/* The car — cyan dot with glow */}
      <g transform={`translate(${carPos.x}, ${carPos.y})`}>
        <circle r="18" fill="url(#car-glow)" />
        <circle r="5" fill="#22d3ee" stroke="#fff" strokeWidth="1.2" />
        {isRunning && !finished && (
          <g
            transform={`rotate(${carPos.angle})`}
            opacity="0.8"
          >
            <line x1="-7" y1="0" x2="-22" y2="0" stroke="#22d3ee" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="-9" y1="-3" x2="-18" y2="-3" stroke="#67e8f9" strokeWidth="1" strokeLinecap="round" />
            <line x1="-9" y1="3"  x2="-18" y2="3"  stroke="#67e8f9" strokeWidth="1" strokeLinecap="round" />
          </g>
        )}
      </g>

      {/* Chequered flag at finish — next to the start/finish line on the pit straight */}
      {finished && (
        <g transform="translate(310, 22)">
          <rect x="-1" y="0" width="2" height="22" fill="#f8fafc" />
          {Array.from({ length: 9 }).map((_, i) => (
            <rect
              key={i}
              x={1 + (i % 3) * 5}
              y={Math.floor(i / 3) * 4}
              width="5"
              height="4"
              fill={(Math.floor(i / 3) + (i % 3)) % 2 === 0 ? '#fff' : '#000'}
            />
          ))}
        </g>
      )}
    </svg>
  );
}
