// Shared team-name reconciliation for every live/unofficial data source (
// football-data.org via lib/data.js, ESPN via lib/espn.js). Split out from
// data.js so espn.js can depend on it without the two live-data modules
// importing each other - lib/data.js now also imports FROM lib/espn.js (to
// cross-check football-data.org's live score against ESPN's), and a cycle
// between them would make module load order fragile for no benefit.
//
// football-data.org and ESPN both use FIFA/UEFA long-forms that differ from
// our names. Map the known divergences; anything already matching our set
// passes through. If a live name can't be resolved to one of our teams, that
// match is simply skipped (the fixture keeps its static result), so an
// unmapped name degrades gracefully rather than corrupting the table. Extend
// this map as real live data surfaces.
// Verified against the live football-data.org WC response: the API's 48 team
// names match ours except for the entries below. Only two actually diverge in
// live data today - Bosnia and Cape Verde - and each silently dropped every one
// of that team's matches (both sides of a pairing must resolve). The rest are
// defensive mappings for naming football-data.org uses across competitions.
import TEAM_META from './teams'

const NAME_ALIASES = {
  'Korea Republic': 'South Korea',
  'Korea DPR': 'North Korea',
  'IR Iran': 'Iran',
  Iran: 'Iran',
  'United States': 'United States',
  USA: 'United States',
  'Côte d’Ivoire': 'Ivory Coast',
  "Côte d'Ivoire": 'Ivory Coast',
  'Cape Verde Islands': 'Cape Verde', // live API form
  'Cabo Verde': 'Cape Verde',
  'Bosnia-Herzegovina': 'Bosnia and Herzegovina', // live API form
  'Bosnia and Herzegovina': 'Bosnia and Herzegovina',
  'Czech Republic': 'Czechia',
  Türkiye: 'Turkey',
  'DR Congo': 'DR Congo',
  'Congo DR': 'DR Congo',
}

const OUR_NAMES = new Set(Object.keys(TEAM_META))

// Reconcile a provider's team name to our canonical name (or null if unmapped).
export function resolveTeamName(liveName) {
  if (!liveName) return null
  if (OUR_NAMES.has(liveName)) return liveName
  const aliased = NAME_ALIASES[liveName]
  if (aliased && OUR_NAMES.has(aliased)) return aliased
  return null
}

export const pairKey = (a, b) => [a, b].sort().join('|')
