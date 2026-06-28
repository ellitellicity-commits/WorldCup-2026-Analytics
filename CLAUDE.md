# WorldCup 2026 Analytics — Agent Context

## Project

Match predictor, Monte Carlo bracket simulator, and player dashboard for the 2026 FIFA World Cup. XGBoost model trained on historical results and live WC2026 data (ELO ratings, match stats, squad data). Flask backend, empty `frontend/src/` (pre-implementation).

## Design Context

**Register:** product — design serves the data and predictions. See `PRODUCT.md` for full strategic brief and `DESIGN.md` for the visual system spec.

**Personality:** Cinematic, Credible, Precise. Broadcast desk authority — ESPN / TNT Sports / FIFA broadcast production quality. Not a SaaS dashboard, not a gambling app, not a notebook export.

**Creative North Star:** "The 2026 Broadcast Desk" — deep black studio surface, host nation colors in precise data roles, choreographed motion anchored to real events.

**Color system (seed — no hex yet):**
- Near-black body (~70% of any view)
- Mexican green → group-stage data only
- Canadian red → live indicators only
- American blue → predictions / probability only
- Trophy gold → championship moments only (one use per view, maximum)
- No teal, purple, gradients, glow, or AI-default palette combinations

**Typography direction:** Condensed sans display (scores, team names, headlines) + humanist sans body (prose, labels). Font pairing TBD at implementation. All numeric output uses `tabular-nums`.

**Motion:** Choreographed — entrances, bracket draw animations, number count-ups. Motion tracks real game events, never decorative.

**Accessibility:** WCAG AA + color-blind safe. No data channel uses color as its only signal.

**Hard stops:**
- No generic SaaS chrome (sidebar nav, blue-accent BI layouts, identical card grids)
- No sportsbook / gambling aesthetic
- No neon / cyberpunk / RGB glow
- No AI-generated palette defaults
- No Jupyter-notebook visual output
- No `border-left` stripe accents, no gradient text

**Next step:** Run `/impeccable craft <feature>` to design and build the first screen, or `/impeccable document` once `frontend/src/` has code to capture real tokens.
