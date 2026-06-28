# Product

## Register

product

## Users

Two overlapping audiences:

**Football fans** — following the 2026 World Cup and want predictions, bracket outcomes, and tournament standings. They open the dashboard to answer "who's going to win?" and "what are the odds for tonight's match?" Entertainment-first; data is the engine but not the story.

**Data-curious enthusiasts** — want to understand the model: see probability distributions, explore Monte Carlo bracket paths, dig into feature importance. They open the dashboard to interrogate the predictions, not just read them.

Both audiences share the same surface. Fans get the headline; analysts get the depth. The interface must earn trust from both without requiring statistical literacy to use.

## Product Purpose

A match predictor, Monte Carlo bracket simulator, and player dashboard for the 2026 FIFA World Cup. Built on an XGBoost model trained on historical results and live WC2026 data (ELO ratings, match stats, squad data). The product makes model-driven predictions feel like broadcast-quality intelligence, not academic output.

Success looks like: a user opens the bracket view, immediately understands who's favored and by how much, and can drill into any match or team to understand why.

## Brand Personality

Cinematic, Credible, Precise.

The voice is confident without being boastful — like a sharp analyst on a broadcast desk, not a gambling app or a research paper. The tone is direct: state the prediction, show the evidence, let the data speak. Never hype, never hedge.

Emotional goal: the feeling of watching a high-quality live broadcast with an analyst in your ear who actually knows what they're talking about.

## Anti-references

- **Generic SaaS dashboards** — no card grids, sidebar navs, or blue-accent business intelligence chrome. This is not a BI tool.
- **Sportsbook / gambling UIs** — the dark green + gold odds aesthetic reads as transactional. Avoid it entirely.
- **Jupyter notebook exports** — no academic, matplotlib-chart, code-output feel. The analysis is done; this is the product.
- **Overcrowded stats sites** — no dense table dumps or 40-column data grids. Hierarchy and focus over completeness.
- **Neon / cyberpunk / gaming RGB** — dark backgrounds are fine but must feel like a broadcast studio, not a gaming setup. No glow effects. No cyberpunk.
- **AI-generated color palettes** — explicitly avoid teal/purple/gradient combos, tinted cream backgrounds, and any color combination that reads as "AI-built dashboard default." Color choices must be intentional and traceable to the brand.

## Design Principles

1. **Match over metrics** — the game is the story; data is the analysis, not the product. Every screen opens on the human-scale drama (teams, score, date), then offers depth.
2. **Broadcast credibility** — if it wouldn't look at home on a live ESPN or TNT Sports production, it doesn't belong here. Quality of presentation signals quality of prediction.
3. **Progressive depth** — fans see the headline, analysts can drill. No information is hidden, but it earns its place through hierarchy, not volume.
4. **Precision over decoration** — every visual element must carry meaning. No decorative gradients, no glass effects for effect, no motion that isn't doing work.
5. **Color-blind honest** — data is never encoded by color alone. Shape, position, and label carry the semantic load; color reinforces but never solely communicates.

## Accessibility & Inclusion

- Target: WCAG AA
- Color-blind safe: no data channel relies solely on color for meaning (hue + shape/label/pattern at minimum)
- All probability/odds visualizations must be legible in deuteranopia and protanopia simulation
- Keyboard navigable; screen-reader compatible labels on all data visualizations
- Reduced motion: all animations must degrade gracefully (instant transitions or crossfades)
