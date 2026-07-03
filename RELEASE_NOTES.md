# Release Notes — v1.0 (July 2026)

## Live

**World Cup 2026 Predictor & Dashboard** is live at
[world-cup-2026-analytics-xi.vercel.app](https://world-cup-2026-analytics-xi.vercel.app).

### What's included

- **Real-time tournament tracking** — live match results, lineups, and stats, refreshed during matches (results ~60s, an open match panel ~30s).
- **Outcome predictions** — an XGBoost classifier estimating win/draw/loss probabilities (~46.2% accuracy on held-out three-class data).
- **Monte Carlo simulator** — a 10,000-run bracket simulation for advancement and championship odds, with two modes (Respect Reality and Reimagine).
- **Broadcast-style interface** — designed for live tournament viewing: clean, scannable, authoritative.
- **Full FIFA 2026 tiebreaker rules** — group standings respect the official tiebreaker sequence.
- **Works offline** — a bundled data snapshot means the app runs with no keys or backend; live data is an enhancement, not a requirement.

### Architecture

- Frontend: React 19 + Vite
- Deployment: Vercel (static build + a serverless proxy for live data)
- Model: XGBoost (trained on historical + 2026 data)
- Data: football-data.org (live results, via the server-side proxy) + ESPN (lineups and stats, direct from the browser)

### Known limitations

- Player headshots: ESPN provides ~4% of 2026 WC headshots; the rest render as initials on a neutral background (intentional minimalist design).
- No persistence: simulation runs live in the session only.
- Live-source coupling: live features depend on two third-party APIs whose schemas can change.

### What's next (v2.0)

- Interactive globe + flight animation for the match predictor
- Broader player headshot coverage from an alternative source
- Substitution tracking and bench visualization
- Persisted / shareable simulation runs

---

**Built during the 2026 World Cup. Portfolio project by Ellison James Naz.**
