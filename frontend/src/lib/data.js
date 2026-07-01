// Single data-access seam for the app. Every view reads live-swappable tournament
// data — fixtures (schedule + results) and championship odds — through the
// functions here, never by importing the JSON directly. Today they return the
// bundled static snapshot; in Phase 4 step 2 this is the one place that changes
// to fetch from the live source (football-data.org), so no component needs to be
// touched again.
//
// Structural/reference data that isn't part of live tournament state —
// bracket.json (venues + knockout schedule) and fifa_rankings.json — is
// deliberately kept as direct imports; it doesn't move with the live feed.

import fixturesData from '../data/fixtures.json'
import oddsData from '../data/odds.json'

/**
 * Fixtures snapshot: schedule, group assignments, completed results, and the
 * model's per-fixture predictions.
 * @returns {{ generated: string, fixtures: object[] }}
 */
export function loadFixtures() {
  return fixturesData
}

/**
 * Championship odds snapshot: teams ranked by Monte Carlo title probability,
 * plus the simulation count behind them.
 * @returns {{ simulations: number, teams: object[] }}
 */
export function loadOdds() {
  return oddsData
}
