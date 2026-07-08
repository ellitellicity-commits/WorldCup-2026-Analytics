import { Mark26 } from './BrandMarks'
import wcLogo from '../assets/WC_26_Animations.gif'
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

/**
 * Full-screen gate shown while tournament data resolves. Usually a brief flash
 * (static fallback resolves in one tick; a live fetch takes a moment). The
 * broadcast register: studio-black surface, the gold mark, a single sweeping
 * rule — "coming on air", not a generic spinner.
 */
function LoadingScreen({ failed = false }) {
  return (
    <div className="loading" role="status" aria-live="polite">
      <CitySkylines />
      <div className="loading__inner">
        <img
          className="loading__logo"
          src={wcLogo}
          alt="FIFA World Cup 26 — USA · Canada · Mexico"
          width="800"
          height="495"
        />
        <Mark26 className="loading__mark" />
        <p className="loading__label">
          {failed ? 'Loading tournament data…' : 'Loading tournament data'}
        </p>
        <div className="loading__sweep" aria-hidden="true">
          <span className="loading__sweep-bar" />
        </div>
        <span className="visually-hidden">Loading the World Cup 2026 desk</span>
      </div>
    </div>
  )
}

export default LoadingScreen
