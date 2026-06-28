<!-- SEED: re-run /impeccable document once there's code to capture the actual tokens and components. -->

---
name: WorldCup 2026 Analytics
description: Match predictor, Monte Carlo bracket simulator, and player dashboard for the 2026 FIFA World Cup.
---

# Design System: WorldCup 2026 Analytics

## 1. Overview

**Creative North Star: "The 2026 Broadcast Desk"**

A deep black studio surface. Three host nation colors holding down three precise data roles — Mexican green for group-stage data, Canadian red for live indicators, American blue for predictions and probability. Trophy gold appearing exactly once per landmark moment. The interface feels like the analyst desk at ESPN or a FIFA broadcast production: high contrast, unhurried authority, every element earning its placement through function.

The system is cinematic without being theatrical. Choreographed motion serves the drama of the game — brackets animate on draw, numbers count up, match cards enter with intention — but nothing moves for decoration. The product's credibility comes from the quality of the model; the design's job is to make that credibility legible at a glance.

This system explicitly rejects: generic SaaS dashboard chrome (sidebar navs, card grids, blue-accent BI tools); sportsbook gambling aesthetics (dark green + gold odds, transactional feel); academic Jupyter-notebook output (matplotlib charts, pandas-table density, code-visible formatting); overcrowded stats-site data dumps; neon, glow effects, or any cyberpunk RGB aesthetic; and AI-generated default palettes (teal/purple/gradient combos, tinted cream backgrounds, any combination that reads as "first training-data reflex").

**Key Characteristics:**
- 70% deep black or near-black surface coverage — everything else is signal
- Three host nation colors, three data roles, no decorative use
- Condensed display weight for scores, names, and match headlines; humanist sans for prose
- Choreographed motion anchored to real events (draws, reveals, live state changes)
- Broadcast-desk authority: confident, precise, never decorative

## 2. Colors

The palette is four deliberate roles on a black ground. Every color earns its place by encoding meaning. Color alone never carries the only semantic signal.

### Primary
- **Near-Black Studio** (`[to be resolved during implementation]`): The default surface. Carries ~70% of any given view. Not pure black — should carry a slight neutral tint (lean toward cool, not warm) to feel like a studio environment rather than a void or a gaming setup.

### Secondary — Host Nation Roles

**The Host Nation Rule.** Three accent colors, three data roles, no exceptions. Mexican green encodes group-stage data. Canadian red encodes live state (active match, current indicator). American blue encodes predictions and probability. None of these colors appear outside their assigned role. Decorative use of any host nation color is prohibited.

- **Mexican Green** (`[to be resolved: OKLCH hue family ~145–160°, mid-high chroma, mid lightness]`): Group data — standings tables, group phase match records, team groupings.
- **Canadian Red** (`[to be resolved: OKLCH hue family ~25–30°, high chroma, mid lightness]`): Live indicators — active match states, real-time score changes, "LIVE" chips, current-round indicators.
- **American Blue** (`[to be resolved: OKLCH hue family ~250–265°, mid-high chroma, mid lightness]`): Predictions and probability — win odds, Monte Carlo outputs, model confidence bars, projected paths.

### Tertiary
- **Trophy Gold** (`[to be resolved: OKLCH hue family ~85–95°, mid chroma, high lightness]`): Championship moments only — final winner reveal, tournament champion card, top-ranked probability callout. Maximum one deliberate use per full-screen view. Its rarity is the point.

### Neutral
- **Primary Text** (`[to be resolved: high-lightness near-white, chroma ~0]`): Headlines, team names, scores on dark surface.
- **Secondary Text** (`[to be resolved: mid-lightness neutral, chroma ~0–0.01]`): Labels, captions, supporting data on dark surface. Must meet WCAG AA (4.5:1) against the near-black body — verify before shipping.
- **Divider / Border** (`[to be resolved: low-lightness neutral, subtle]`): Separators, card edges, structural lines. Never decorative; always structural.

### Named Rules

**The 70% Rule.** Near-black body covers 70% or more of any given view. If you're adding a new surface element and the ratio is slipping, the element needs to live on the dark ground, not introduce a new surface.

**The Color-Blind Contract.** No data channel uses color as its only differentiator. Every color-encoded datum (green for group data, red for live, blue for prediction) is also differentiated by shape, label, position, or pattern. Test every data visualization in deuteranopia and protanopia simulation before shipping.

**The Rarity Gradient.** Trophy gold > host nation accents > neutral text. The more chromatic a color, the rarer its use. If an accent color appears on more than 20% of a given screen, it's no longer an accent — it's noise.

## 3. Typography

**Display Font:** Condensed sans-serif `[font pairing to be chosen at implementation — reference: Barlow Condensed, Neue Haas Grotesk Condensed, or similar broadcast-grade condensed grotesque]`
**Body Font:** Humanist sans-serif `[font pairing to be chosen at implementation — reference: Inter, Plus Jakarta Sans, or similar readable humanist sans]`

**Character:** The condensed display weight carries the broadcast authority — tight, tall, built for score cards, team names, and matchup headlines. The humanist body handles everything the user needs to read, not just scan: analysis prose, probability explanations, player bios. The two voices stay in their lanes.

### Hierarchy
- **Display** (Black or ExtraBold weight, condensed, `clamp(2rem, 6vw, 4.5rem)`, line-height 0.9–1.0): Match score numerals, team names in hero matchup cards, bracket headlines. Condensed only.
- **Headline** (Bold or Semibold, condensed, `clamp(1.25rem, 3vw, 2rem)`, line-height 1.1): Section titles, tournament round labels, player names in feature cards.
- **Title** (Medium or Semibold, humanist, `1rem–1.25rem`, line-height 1.3): Card headers, sidebar section labels, stat group headings.
- **Body** (Regular, humanist, `1rem`, line-height 1.6, max 65ch): Analysis text, model explanations, match descriptions. Never condensed.
- **Label** (Medium, humanist or tabular-nums, `0.75rem–0.875rem`, letter-spacing 0.02–0.04em): Data table column headers, chip labels, probability percentages, odds. Use tabular-nums variant for all numeric labels so columns align.

### Named Rules

**The Broadcast Weight Rule.** Condensed display weight is reserved for scores, team names, and match-scale headlines. It never appears in body prose, UI labels, or captions. If a text element is something you read rather than something you scan, it uses the humanist body.

**The Tabular Precision Rule.** All numeric output — scores, probabilities, ELO ratings, Monte Carlo percentages — uses `font-variant-numeric: tabular-nums`. Numbers that shift column width as they update are a data credibility failure.

## 4. Elevation

The system is dark and layered. Depth is conveyed through lightness delta between surface levels, not through shadow blur. Cards and panels sit one tonal step above the base surface (a lighter shade of the same near-black). Interactive elements lift one further step on hover. No colored shadows; no drop shadows with visible blur radius at rest.

Motion is the primary depth cue at interaction time — elements that are closer to the user respond faster (shorter duration, snappier easing). Elements in the background respond slower or not at all.

### Shadow Vocabulary

**The Tonal Layering Rule.** Rest states use no box-shadow. Depth is encoded by surface tone: base → card → elevated card is three tonal steps, not three shadow depths. Shadows appear only as state feedback (hover lift, focus ring). If a shadow is visible at rest, it's decorative — remove it.

- **Hover Lift** (`box-shadow: 0 4px 16px rgba(0,0,0,0.4)` — exact value TBD at implementation): Applied to interactive cards on hover. Paired with a `translateY(-2px)` transform.
- **Focus Ring** (2px offset ring in Canadian red at full opacity — exact value TBD at implementation): Keyboard focus indicator for all interactive elements. Canadian red is the only accent permitted for focus rings; it's already the system's live-state color.

## 5. Components

*Components will be documented in the first `/impeccable document` scan-mode pass once `frontend/src/` contains code. The component inventory is expected to include: match card, bracket node, probability bar, team crest chip, score display, navigation bar, Monte Carlo distribution chart, and simulation controls.*

## 6. Do's and Don'ts

### Do:
- **Do** keep the near-black body at 70%+ of any given view. Every new surface element must sit on it, not beside it.
- **Do** use condensed display type exclusively for scores, team names, and match headlines. Everything else gets the humanist body.
- **Do** encode live state exclusively with Canadian red — no other color signals "this is happening now."
- **Do** reserve trophy gold for genuine championship moments — one deliberate use per full view, maximum.
- **Do** pair every color-encoded data channel with a non-color signal (shape, label, position, pattern) for color-blind safety.
- **Do** use `font-variant-numeric: tabular-nums` for all numeric output so figures align in columns.
- **Do** let choreographed motion track real game events: bracket draws animate, scores count up, match cards enter on load. Motion is always anchored to a meaningful moment.
- **Do** test all data visualizations in deuteranopia and protanopia simulation before shipping.
- **Do** reference ESPN, TNT Sports, FIFA broadcast, and Apple TV+ MLS Season Pass as the production quality bar.

### Don't:
- **Don't** use the host nation accent colors (Mexican green, Canadian red, American blue) decoratively. Each color owns one data role. Using Canadian red for a button hover because it looks good is a violation.
- **Don't** use teal, purple, or gradient combinations. These are the saturated AI-default palette of 2025-2026 and read immediately as generated output.
- **Don't** add glow effects, neon outlines, or any cyberpunk / gaming RGB aesthetic. Dark backgrounds must feel like a broadcast studio, not a gaming setup.
- **Don't** build generic SaaS chrome: sidebar navs, card grids with icon + heading + body text, blue-accent BI tool layouts. This is a broadcast product, not a business intelligence tool.
- **Don't** use the gambling / sportsbook aesthetic — no dark green + gold odds bars, no transactional chip patterns, no odds-format probability display that mimics a betting interface.
- **Don't** let data visualizations look like Jupyter notebook output — no raw matplotlib chart style, no visible plot borders, no academic histogram defaults.
- **Don't** dump everything into a table. Dense row-column data is the last resort, not the first. Lead with the narrative (who's favored, what the bracket looks like), offer the table as a drill-down.
- **Don't** animate for decoration. Every motion must respond to a real event or state change. Uniform entrance animations on every section is the AI motion reflex — reject it.
- **Don't** rely on color alone for any data channel. If the visualization breaks when you desaturate it, it fails the color-blind contract.
- **Don't** use side-stripe `border-left` accents on cards or list items. Use full borders, background tints, or leading icons instead.
- **Don't** use gradient text (`background-clip: text`). Scores and team names are single solid colors.
