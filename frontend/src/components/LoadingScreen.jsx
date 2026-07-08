import { useEffect, useState } from 'react'
import Typewriter from './Typewriter'
import './LoadingScreen.css'

// Faint host-city skylines behind the loading content — Toronto (CN Tower),
// New York / New Jersey (Empire State + Manhattan blocks) and Mexico City
// (Metropolitan Cathedral beneath Popocatépetl). Inline SVG so it renders
// instantly with no asset fetch; filled in a tonal surface step so it reads as
// a low broadcast backdrop, not decoration. Ordered N→S, left to right.
const CITY_BUILDINGS = [
  // Toronto
  [30, 190, 46], [82, 168, 38], [126, 200, 30], [236, 206, 34], [280, 176, 42], [332, 196, 34], [372, 210, 26],
  // New York / New Jersey
  [408, 170, 40], [456, 150, 44], [612, 158, 46], [666, 138, 40], [714, 172, 40], [760, 150, 36],
  // Mexico City
  [808, 214, 30], [952, 208, 34], [992, 214, 26],
]

function CitySkylines() {
  return (
    <div className="loading__skyline" aria-hidden="true">
      <svg viewBox="0 0 1200 260" preserveAspectRatio="xMidYMax slice" role="presentation">
        <g>
          {CITY_BUILDINGS.map(([x, top, w]) => (
            <rect key={`${x}-${top}`} x={x} y={top} width={w} height={260 - top} />
          ))}
          {/* Toronto — CN Tower: shaft, observation pod, antenna spire */}
          <rect x="194" y="96" width="12" height="164" />
          <ellipse cx="200" cy="98" rx="26" ry="12" />
          <rect x="198" y="28" width="4" height="70" />
          {/* New York — Empire State: stepped setbacks + mast */}
          <rect x="536" y="150" width="60" height="110" />
          <rect x="548" y="96" width="36" height="60" />
          <rect x="558" y="54" width="16" height="46" />
          <rect x="565" y="18" width="4" height="40" />
          {/* Mexico City — Popocatépetl behind the cathedral */}
          <polygon points="990,260 1110,64 1200,140 1200,260" />
          {/* Metropolitan Cathedral: nave, twin bell towers, central dome + finial */}
          <rect x="846" y="196" width="96" height="64" />
          <rect x="852" y="140" width="20" height="120" />
          <polygon points="850,140 862,118 874,140" />
          <rect x="916" y="140" width="20" height="120" />
          <polygon points="914,140 926,118 938,140" />
          <path d="M867,196 A22,26 0 0 1 911,196 Z" />
          <rect x="887" y="158" width="4" height="12" />
        </g>
      </svg>
    </div>
  )
}

// A white match ball, reusing the pentagon + seam geometry from GoalBurst so the
// loader speaks the same visual language as the live-goal cue. The wrapper rolls
// (translate + spin) via CSS; the ball itself is a light disc with a dark
// pentagon so it reads against the studio-black gate.
function SoccerBall() {
  return (
    <span className="loading__ball" aria-hidden="true">
      <svg viewBox="0 0 16 16" width="64" height="64" className="loading__ball-svg">
        <circle cx="8" cy="8" r="6.4" fill="var(--ink)" stroke="var(--studio-black)" strokeWidth="0.9" />
        <path d="M8 5.7 10.19 7.29 9.35 9.86 6.65 9.86 5.81 7.29Z" fill="var(--studio-black)" />
        <path
          d="M8 5.7V1.9M10.19 7.29 13.8 6.12M9.35 9.86 11.59 12.93M6.65 9.86 4.41 12.93M5.81 7.29 2.2 6.12"
          fill="none"
          stroke="var(--studio-black)"
          strokeWidth="0.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}

// Real, checkable World Cup 2026 facts — no fabrication.
const FACTS = [
  'The 2026 World Cup is the first to feature 48 teams',
  'MetLife Stadium in New Jersey hosts the Final on 19 July',
  'Three nations host for the first time: USA, Canada & Mexico',
  '48 teams · 16 groups · 104 matches',
  'Argentina are the defending champions',
  'The tournament spans 3 countries and 16 cities',
]

// Time to type a fact (mirrors Typewriter's own cadence) plus a 2s read hold,
// so the next fact begins only once this one has landed and been read.
function factDuration(text) {
  const perChar = Math.max(9, Math.min(22, 1500 / text.length))
  return 160 + text.length * perChar + 2000
}

// Fisher-Yates — a fresh, unbiased order each time the loader mounts.
function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function FunFacts() {
  // Shuffle once on mount so the reel starts somewhere different each visit, then
  // advance sequentially through the whole shuffled set before looping.
  const [facts] = useState(() => shuffle(FACTS))
  const [i, setI] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setI((n) => (n + 1) % facts.length), factDuration(facts[i]))
    return () => clearTimeout(t)
  }, [i, facts])
  return (
    <div className="loading__facts">
      <p className="loading__facts-label">Did you know</p>
      {/* key remounts the typewriter so each fact types in from empty. */}
      <Typewriter key={`${i}-${facts[i]}`} text={facts[i]} className="loading__fact" />
    </div>
  )
}

/**
 * Full-screen gate shown while tournament data resolves (and for a 3s minimum,
 * so it never flashes past). The broadcast register: studio-black surface, faint
 * host-city skylines, a rolling match ball, and a rotating reel of real
 * tournament facts — "coming on air", not a generic spinner.
 */
function LoadingScreen({ failed = false }) {
  return (
    <div className="loading" role="status" aria-live="polite">
      <CitySkylines />
      <div className="loading__inner">
        <SoccerBall />
        <FunFacts />
        <p className="loading__label">
          {failed ? 'Loading tournament data…' : 'Loading tournament data'}
        </p>
        <span className="visually-hidden">Loading the World Cup 2026 desk</span>
      </div>
    </div>
  )
}

export default LoadingScreen
