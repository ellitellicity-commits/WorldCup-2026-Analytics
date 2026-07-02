import { createContext, useContext, useEffect, useState } from 'react'
import { loadFixtures, loadOdds } from './data'
import LoadingScreen from '../components/LoadingScreen'

// App-wide tournament data. Fixtures may resolve live (football-data.org) or
// static; odds are always static. The provider loads both once on mount and
// gates the app on their arrival, so every downstream view reads ready,
// synchronous data — no per-component fetching, one seam, one loading state.
const TournamentDataContext = createContext(null)

// Polling cadence (seconds). Fast while a match is in play so scores/minutes
// tick along; slow otherwise, just to catch a match kicking off. Both stay well
// under football-data.org's 10 req/min free-tier limit (which is shared across
// all clients via the one server-side key), and polling pauses while the tab is
// hidden. Odds are static and loaded once, so only fixtures are re-fetched.
const POLL_LIVE_S = 60
const POLL_IDLE_S = 300

export function TournamentDataProvider({ children }) {
  const [state, setState] = useState({ status: 'loading' })

  // Initial load — gates the app on first data arrival.
  useEffect(() => {
    let cancelled = false
    Promise.all([loadFixtures(), loadOdds()])
      .then(([fixtures, odds]) => {
        if (cancelled) return
        // `pollable` is fixed at first load: if the live feed is configured and
        // working now, keep polling even if a later poll blips to the static
        // fallback — otherwise one transient error would stop live updates for good.
        setState({ status: 'ready', fixtures, odds, source: fixtures.source, pollable: fixtures.source === 'live' })
      })
      .catch(() => {
        // loadFixtures/loadOdds already fall back internally; this only guards
        // against an unexpected throw so the app never hangs on the loader.
        if (!cancelled) setState({ status: 'error' })
      })
    return () => {
      cancelled = true
    }
  }, [])

  const pollable = state.status === 'ready' && state.pollable
  const liveCount = state.status === 'ready' ? state.fixtures.liveCount || 0 : 0

  // Live refresh loop. Re-fetches fixtures in place (no loading gate, no reload),
  // adapts cadence to whether anything is in play, and skips fetching while the
  // tab is hidden — firing one immediate refresh when it becomes visible again.
  useEffect(() => {
    if (!pollable) return
    let cancelled = false
    let timer

    const schedule = () => {
      timer = setTimeout(tick, (liveCount > 0 ? POLL_LIVE_S : POLL_IDLE_S) * 1000)
    }
    const tick = async () => {
      if (document.visibilityState === 'hidden') {
        schedule()
        return
      }
      try {
        const fixtures = await loadFixtures()
        if (!cancelled) setState((s) => (s.status === 'ready' ? { ...s, fixtures, source: fixtures.source } : s))
      } finally {
        if (!cancelled) schedule()
      }
    }
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        clearTimeout(timer)
        tick()
      }
    }

    document.addEventListener('visibilitychange', onVisibility)
    schedule()
    return () => {
      cancelled = true
      clearTimeout(timer)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [pollable, liveCount])

  if (state.status !== 'ready') return <LoadingScreen failed={state.status === 'error'} />

  return <TournamentDataContext.Provider value={state}>{children}</TournamentDataContext.Provider>
}

/**
 * @returns {{ fixtures: {generated:string, fixtures:object[]}, odds: object, source: 'live'|'static' }}
 */
export function useTournamentData() {
  const ctx = useContext(TournamentDataContext)
  if (!ctx) throw new Error('useTournamentData must be used within TournamentDataProvider')
  return ctx
}
