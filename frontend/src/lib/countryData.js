// Country profiles for the Encyclopedia (Atlas). Everything here is real, sourced
// data joined from the project's own pipeline:
//   - FIFA rank        → data/fifa_rankings.json (the group/tiebreak snapshot)
//   - Elo, record,     → data/countryProfiles.json, extracted from the model
//     confederation       pipeline's elo_ratings_wc2026.csv (latest snapshot)
//   - championship odds→ odds.json (the 10k-run Monte Carlo output)
//   - group / code / iso→ lib/teams.js
//
// NOT INVENTED — flagged instead: coach, notable players, and a history blurb are
// left null. The squads CSV keys players by an unmapped team_id (no clean
// team_id→name join in the repo), and there is no coach or history source, so
// filling these would mean making data up. The panel surfaces them as "pending"
// rather than fabricating. Sourcing them (e.g. football-data.org /teams squad +
// coach endpoints) is a flagged fast-follow.

import { getOdds } from './data'
import fifaRankings from '../data/fifa_rankings.json'
import profiles from '../data/countryProfiles.json'
import { teamMeta, flagUrl } from './teams'

const RANKS = fifaRankings.ranks
const ODDS = Object.fromEntries(getOdds().teams.map((t) => [t.team, t]))

// The 48 qualified nations (FIFA-rank order is fine; the globe plots them anyway).
export const COUNTRY_NAMES = Object.keys(RANKS)

/**
 * Full profile for a team name, or null if unknown. Sourced fields are real;
 * `coach`, `notablePlayers`, and `history` are intentionally null (see file head).
 */
export function getCountry(name) {
  if (!name || !RANKS[name]) return null
  const meta = teamMeta(name)
  const p = profiles[name] || null
  const o = ODDS[name] || null
  return {
    name,
    code: meta.code,
    iso: meta.iso,
    flag: flagUrl(meta.iso),
    group: meta.group,
    fifaRank: RANKS[name] ?? null,
    elo: p?.elo ?? null,
    confederation: p?.confederation ?? null,
    isHost: p?.isHost ?? false,
    championshipOdds: o?.championship_odds ?? null,
    record: p ? { w: p.w, d: p.d, l: p.l, gf: p.gf, ga: p.ga, played: p.played } : null,
    // Flagged, not sourced — never fabricated:
    coach: null,
    notablePlayers: null,
    history: null,
  }
}
