'use client';

import { useEffect, useRef, useState } from 'react';
import { F1Race } from '../lib/f1Calendar';

interface F1TrackProps {
  progress: number; // 0–100 (100 = finished)
  isRunning: boolean;
  race: F1Race;
}

// A stylized circuit shape — generic enough to feel like a real F1 track.
// Path is closed-ish; car finishes near the start/finish line.
const TRACK_PATH =
  'M 60 200 ' +
  'C 30 200, 20 150, 60 130 ' +
  'L 140 130 ' +
  'C 180 130, 200 100, 170 80 ' +
  'C 140 60, 110 90, 130 110 ' +
  'L 230 110 ' +
  'C 280 110, 290 60, 250 50 ' +
  'L 380 50 ' +
  'C 430 50, 440 110, 400 120 ' +
  'L 320 130 ' +
  'C 290 140, 290 180, 320 190 ' +
  'L 430 190 ' +
  'C 470 200, 470 240, 430 240 ' +
  'L 80 240 ' +
  'C 40 240, 40 210, 60 200 Z';

export default function F1Track({ progress, isRunning, race }: F1TrackProps) {
  const pathRef = useRef<SVGPathElement>(null);
  const [carPos, setCarPos] = useState({ x: 60, y: 200, angle: 0 });
  const [pathLength, setPathLength] = useState(0);

  useEffect(() => {
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength());
    }
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
      viewBox="0 0 500 280"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full drop-shadow-lg"
      aria-label={`${race.name} track, car ${Math.round(progress)}% around the lap`}
    >
      <defs>
        <linearGradient id="track-asphalt" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3a3a3a" />
          <stop offset="100%" stopColor="#1c1c1c" />
        </linearGradient>
        <linearGradient id="grass-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2d5016" />
          <stop offset="100%" stopColor="#1a3009" />
        </linearGradient>
        <pattern id="kerb" width="8" height="4" patternUnits="userSpaceOnUse">
          <rect width="4" height="4" fill="#dc2626" />
          <rect x="4" width="4" height="4" fill="#f8fafc" />
        </pattern>
      </defs>

      {/* Grass background */}
      <rect width="500" height="280" fill="url(#grass-gradient)" rx="12" />

      {/* Kerb (track outline) */}
      <path
        d={TRACK_PATH}
        fill="none"
        stroke="url(#kerb)"
        strokeWidth="34"
        strokeLinejoin="round"
        opacity="0.85"
      />

      {/* Asphalt */}
      <path
        d={TRACK_PATH}
        fill="none"
        stroke="url(#track-asphalt)"
        strokeWidth="26"
        strokeLinejoin="round"
      />

      {/* Centerline (dashed) */}
      <path
        ref={pathRef}
        d={TRACK_PATH}
        fill="none"
        stroke="#fbbf24"
        strokeWidth="1"
        strokeDasharray="6 8"
        opacity="0.55"
      />

      {/* Start/finish line — perpendicular checkered band near track origin */}
      <g transform="translate(60, 200) rotate(90)">
        <rect x="-13" y="-3" width="26" height="6" fill="white" />
        {Array.from({ length: 4 }).map((_, i) => (
          <rect
            key={i}
            x={-13 + i * 7}
            y={i % 2 === 0 ? -3 : 0}
            width="6.5"
            height="3"
            fill="black"
          />
        ))}
        {Array.from({ length: 4 }).map((_, i) => (
          <rect
            key={`b-${i}`}
            x={-13 + i * 7}
            y={i % 2 === 0 ? 0 : -3}
            width="6.5"
            height="3"
            fill="black"
          />
        ))}
      </g>

      {/* Race name pill */}
      <g transform="translate(250, 25)">
        <rect x="-90" y="-13" width="180" height="22" rx="11" fill="#dc2626" opacity="0.92" />
        <text
          x="0"
          y="2"
          textAnchor="middle"
          fontSize="11"
          fontFamily="Arial, sans-serif"
          fontWeight="700"
          fill="white"
          letterSpacing="1"
        >
          ROUND {race.round} · {race.country.toUpperCase()}
        </text>
      </g>

      {/* The car */}
      <g
        transform={`translate(${carPos.x}, ${carPos.y}) rotate(${carPos.angle})`}
        style={{ transition: 'transform 0.6s linear' }}
      >
        {/* Body */}
        <rect x="-9" y="-3.5" width="18" height="7" rx="1.5" fill="#dc2626" />
        {/* Nose */}
        <polygon points="9,-2 14,0 9,2" fill="#dc2626" />
        {/* Cockpit */}
        <rect x="-1" y="-2" width="5" height="4" rx="1" fill="#0f172a" />
        {/* Front wing */}
        <rect x="11" y="-4" width="2.5" height="8" fill="#0f172a" />
        {/* Rear wing */}
        <rect x="-11" y="-4.5" width="2" height="9" fill="#0f172a" />
        {/* Wheels */}
        <circle cx="-6" cy="-4.5" r="1.5" fill="#0f172a" />
        <circle cx="-6" cy="4.5" r="1.5" fill="#0f172a" />
        <circle cx="6" cy="-4.5" r="1.5" fill="#0f172a" />
        <circle cx="6" cy="4.5" r="1.5" fill="#0f172a" />
        {/* Speed lines when running */}
        {isRunning && !finished && (
          <g opacity="0.6">
            <line x1="-12" y1="-2" x2="-18" y2="-2" stroke="white" strokeWidth="0.8" />
            <line x1="-12" y1="0" x2="-20" y2="0" stroke="white" strokeWidth="0.8" />
            <line x1="-12" y1="2" x2="-18" y2="2" stroke="white" strokeWidth="0.8" />
          </g>
        )}
      </g>

      {/* Finish flag flourish */}
      {finished && (
        <g transform="translate(60, 175)">
          <rect x="-1" y="0" width="2" height="22" fill="#1c1c1c" />
          <g>
            {Array.from({ length: 9 }).map((_, i) => (
              <rect
                key={i}
                x={1 + (i % 3) * 5}
                y={Math.floor(i / 3) * 4}
                width="5"
                height="4"
                fill={(Math.floor(i / 3) + (i % 3)) % 2 === 0 ? 'white' : 'black'}
              />
            ))}
          </g>
        </g>
      )}
    </svg>
  );
}
