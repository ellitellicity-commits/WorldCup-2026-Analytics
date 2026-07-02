// Human-readable live clock for an in-play tie: "63'", "63+2'", "HT" (paused /
// half-time), or "LIVE" when football-data.org's free tier omits the minute.
// `live` is the { minute, injuryTime, paused } object attached to a fixture in
// live mode (see lib/data.js).
export function liveClock(live) {
  if (!live) return 'LIVE'
  if (live.paused) return 'HT'
  if (typeof live.minute === 'number') return live.injuryTime ? `${live.minute}+${live.injuryTime}'` : `${live.minute}'`
  return 'LIVE'
}
