---
name: project-design-context
description: Design system seed for WorldCup 2026 Analytics — register, personality, color roles, type direction, motion energy, and hard stops.
metadata:
  type: project
---

DESIGN.md and PRODUCT.md were seeded via /impeccable init on 2026-06-28. Frontend is pre-implementation (empty frontend/src/). Re-run `/impeccable document` once frontend code exists to capture real tokens.

**Why:** User established a full design brief before writing any frontend code, so future agents stay on-brand without re-interviewing.

**How to apply:** Read PRODUCT.md and DESIGN.md before generating any frontend code or UI suggestions. CLAUDE.md carries a concise pointer section for quick reference.

Key decisions:
- Register: product (design serves the data)
- Personality: Cinematic, Credible, Precise — "The 2026 Broadcast Desk"
- Color: deep black body (70%+), three host nation accent colors in fixed data roles (Mexican green = group data, Canadian red = live, American blue = predictions), trophy gold = championship moments only
- Type: condensed sans display + humanist sans body; tabular-nums for all numeric output
- Motion: choreographed, anchored to real game events
- Hard stops: no SaaS chrome, no gambling aesthetic, no neon/cyberpunk, no AI-default palettes (teal/purple/gradients)
- Accessibility: WCAG AA + color-blind safe (no color-only data channels)

See [[feedback_design_antirefs]] for the specific anti-references the user named.
