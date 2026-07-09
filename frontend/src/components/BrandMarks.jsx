import './BrandMarks.css'

/**
 * Geometric gold "26" emblem - the recurring FIFA World Cup 26 motif rendered
 * in the brand's ultra-bold condensed style (not the official logo). Pure SVG,
 * copyright-safe: a rounded-square tile with a quarter-circle cut and the "26"
 * numeral in Barlow Condensed Ultra Bold.
 */
export function Mark26({ className = '' }) {
  return (
    <svg className={`mark26 ${className}`} viewBox="0 0 100 100" role="img" aria-label="World Cup 26">
      <rect x="3" y="3" width="94" height="94" rx="22" fill="none" stroke="var(--trophy-gold)" strokeWidth="3" />
      <path d="M97 25 V3 H75 a22 22 0 0 1 22 22Z" fill="var(--trophy-gold-deep)" />
      <path d="M3 75 V97 H25 a22 22 0 0 1 -22 -22Z" fill="var(--trophy-gold)" opacity="0.5" />
      <text
        x="50"
        y="50"
        textAnchor="middle"
        dominantBaseline="central"
        className="mark26__num"
        fill="var(--trophy-gold)"
      >
        26
      </text>
    </svg>
  )
}

// One tile of the official "unify / amplify" geometric language - quarter
// circles, rounded squares, concentric arcs, stadium pills - in the FIFA
// multicolour palette. Driven to a low opacity by CSS so it reads as texture.
export function BrandField({ className = '' }) {
  return (
    <svg className={`brand-field ${className}`} aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <defs>
        <pattern id="brand-geo" width="220" height="220" patternUnits="userSpaceOnUse">
          {/* quarter circle */}
          <path d="M0 0 A110 110 0 0 1 110 110 L0 110 Z" fill="var(--fifa-blue)" />
          {/* rounded square */}
          <rect x="132" y="20" width="66" height="66" rx="22" fill="var(--fifa-magenta)" />
          {/* solid disc */}
          <circle cx="170" cy="160" r="34" fill="var(--fifa-yellow)" />
          {/* concentric arc (amplify) */}
          <path d="M150 110 A40 40 0 0 1 110 150" fill="none" stroke="var(--fifa-green)" strokeWidth="10" />
          {/* stadium pill */}
          <rect x="6" y="150" width="86" height="34" rx="17" fill="var(--fifa-orange)" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#brand-geo)" />
    </svg>
  )
}
