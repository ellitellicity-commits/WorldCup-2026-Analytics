/* global __HAS_PHOTO_SEARCH__ */
// Player headshot resolver + cache.
//
// ESPN ships headshots for only ~4% of the 2026 squads, so most players would
// otherwise render as initials. This module fills the gap: for a player without
// an ESPN headshot it asks a same-origin proxy (/photo-api) that runs a Google
// Custom Search image query server-side, then caches the winning URL in
// localStorage scoped to the tournament year. Everything degrades gracefully -
// a missing key, an exhausted quota, a corrupt entry, or an image that fails to
// load all resolve to `null`, which the caller renders as initials.
//
// KEY SAFETY: the Google key lives only in the serverless proxy (api/photo.js)
// and the vite dev/preview proxy - never in a VITE_ var, so it never reaches the
// browser bundle. This mirrors the football-data proxy (see api/index.js).
//
// LOAD VALIDITY: the one reliable "does this URL actually display" signal is the
// <img> element itself (image loads are not CORS-gated for display, whereas a
// HEAD fetch to a third-party image host usually fails CORS and tells us
// nothing). So validation here is a cheap URL sanity check; the real arbiter is
// the caller's <img onError>, which calls invalidatePhoto() to purge a dead
// cached URL. This is a deliberate departure from a blocking HEAD probe, which
// would reject nearly every cross-origin photo and defeat the cache.

const KEY_PREFIX = 'wc-photos'
const YEAR = '2026'
const QUOTA_ESTIMATE_BYTES = 10_000_000 // ~10MB localStorage budget
const QUOTA_WARN_RATIO = 0.8
const GOOGLE_DAILY_LIMIT = 100 // Custom Search free tier
const DAY_MS = 86_400_000

const HAS_PHOTO_SEARCH = typeof __HAS_PHOTO_SEARCH__ !== 'undefined' && __HAS_PHOTO_SEARCH__

// --- localStorage availability -------------------------------------------------

// Private mode, disabled storage, or a hard quota can make localStorage throw on
// the very first write. Probe once so every other function can no-op safely.
function canUseLocalStorage() {
  try {
    const probe = `${KEY_PREFIX}-probe`
    localStorage.setItem(probe, '1')
    localStorage.getItem(probe)
    localStorage.removeItem(probe)
    return true
  } catch (err) {
    console.warn('[Photo] localStorage unavailable; caching disabled', err)
    return false
  }
}

// --- storage accounting --------------------------------------------------------

function getStorageUsage() {
  let bytes = 0
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(KEY_PREFIX)) {
        const val = localStorage.getItem(key) || ''
        bytes += key.length + val.length
      }
    }
  } catch {
    /* accounting is best-effort */
  }
  return bytes
}

function isStorageNearQuota() {
  return getStorageUsage() / QUOTA_ESTIMATE_BYTES > QUOTA_WARN_RATIO
}

// --- keys & validation ---------------------------------------------------------

// Year-scoped so a future tournament's photos never collide with 2026's, and a
// stale 2026 set can be cleared wholesale (see clearPhotoCache).
function getCacheKey(teamCode, playerName) {
  const slug = playerName.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  return `${KEY_PREFIX}-${YEAR}-${teamCode}-${slug}`
}

// Cheap, synchronous sanity check - is this a plausible absolute http(s) URL?
// Runtime load validity is enforced by the caller's <img onError>, not here.
function validateImageUrl(url) {
  if (!url || typeof url !== 'string') return false
  try {
    const u = new URL(url)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    console.warn('[Photo] Discarding malformed URL', url)
    return false
  }
}

// --- read / write cache --------------------------------------------------------

function getCachedPhoto(teamCode, playerName) {
  if (!canUseLocalStorage()) return null
  const key = getCacheKey(teamCode, playerName)
  let raw
  try {
    raw = localStorage.getItem(key)
  } catch {
    return null
  }
  if (!raw) return null
  try {
    const { url } = JSON.parse(raw)
    if (validateImageUrl(url)) return url
  } catch {
    /* fall through to purge */
  }
  // Corrupt or malformed entry - remove it so we can re-fetch cleanly.
  try {
    localStorage.removeItem(key)
  } catch {
    /* ignore */
  }
  return null
}

function setCachedPhoto(teamCode, playerName, url, source) {
  if (!canUseLocalStorage() || !validateImageUrl(url)) return
  const key = getCacheKey(teamCode, playerName)
  const entry = JSON.stringify({ url, timestamp: Date.now(), source })
  if (isStorageNearQuota()) {
    console.warn('[Photo] Cache near quota (~80% of budget); consider clearPhotoCache()')
  }
  try {
    localStorage.setItem(key, entry)
    console.log(`[Photo] Cached: ${teamCode}/${playerName} (${source})`)
  } catch (err) {
    if (err && err.name === 'QuotaExceededError') {
      console.warn('[Photo] Cache full; skipping write for', `${teamCode}/${playerName}`)
    } else {
      console.warn('[Photo] Cache write failed', err)
    }
  }
}

/**
 * Purge a single cached photo. Called from the caller's `<img onError>`: the URL
 * cached fine but the browser couldn't render it (404, hotlink block, etc.), so
 * we drop it and the next view re-resolves instead of re-failing.
 * @param {string} teamCode  FIFA code used to scope the cache key, e.g. "USA"
 * @param {string} playerName full name, e.g. "Matt Freese"
 * @returns {void}
 */
function invalidatePhoto(teamCode, playerName) {
  if (!canUseLocalStorage()) return
  try {
    localStorage.removeItem(getCacheKey(teamCode, playerName))
  } catch {
    /* ignore */
  }
}

// --- request de-duplication ----------------------------------------------------

// Two lineups mounting at once can request the same player simultaneously. Share
// one in-flight promise per key so we never fire duplicate proxy calls.
const inflightRequests = new Map()

function getInflightRequest(teamCode, playerName) {
  return inflightRequests.get(getCacheKey(teamCode, playerName)) || null
}

function setInflightRequest(teamCode, playerName, promise) {
  const key = getCacheKey(teamCode, playerName)
  inflightRequests.set(key, promise)
  promise.finally(() => inflightRequests.delete(key))
}

// --- Google API budget ---------------------------------------------------------

const googleApiUsage = { calls: 0, limit: GOOGLE_DAILY_LIMIT, resetTime: Date.now() + DAY_MS }

/**
 * Whether the Google Custom Search daily budget is spent. Rolls the 100/day
 * free-tier counter over once the 24h window elapses, so a new day frees it up.
 * Exported so callers/tests can branch on it (an exhausted budget → initials).
 * @returns {boolean} true when no further Google lookups may be made today
 */
function isGoogleApiQuotaExhausted() {
  if (Date.now() > googleApiUsage.resetTime) {
    googleApiUsage.calls = 0
    googleApiUsage.limit = GOOGLE_DAILY_LIMIT
    googleApiUsage.resetTime = Date.now() + DAY_MS
  }
  return googleApiUsage.calls >= googleApiUsage.limit
}

// Counted per call attempt (not per hit): a search consumes quota whether or not
// it returns a usable image, so budgeting on attempts is what protects the tier.
function incrementGoogleApiUsage() {
  googleApiUsage.calls += 1
  console.log(`[Photo] Google API: ${googleApiUsage.calls}/${GOOGLE_DAILY_LIMIT}`)
}

// --- proxied Google image search ----------------------------------------------

// Hits the same-origin proxy, which injects the key/cx server-side and returns
// Google's native Custom Search JSON. Returns the first plausible image URL, or
// null. Never throws - all failures resolve to null.
async function fetchGoogleImage(teamCode, playerName) {
  if (!HAS_PHOTO_SEARCH) {
    console.debug('[Photo] Photo search not configured; skipping Google lookup')
    return null
  }
  incrementGoogleApiUsage()
  const params = new URLSearchParams({ name: playerName, team: teamCode })
  let res
  try {
    res = await fetch(`/photo-api?${params}`)
  } catch (err) {
    console.warn('[Photo] Proxy request failed', err)
    return null
  }
  if (!res.ok) {
    console.warn('[Photo] Proxy returned', res.status, 'for', `${teamCode}/${playerName}`)
    return null
  }
  let data
  try {
    data = await res.json()
  } catch {
    return null
  }
  const items = Array.isArray(data?.items) ? data.items : []
  for (const item of items.slice(0, 3)) {
    const url = item?.link
    if (validateImageUrl(url)) {
      console.log(`[Photo] Found: ${playerName} → ${url}`)
      return url
    }
  }
  console.warn('[Photo] No usable image for', `${teamCode}/${playerName}`)
  return null
}

// --- public resolver -----------------------------------------------------------

/**
 * Resolve a headshot URL for a player, or null (→ caller renders initials).
 * @param {string} teamCode  FIFA code, e.g. "USA"
 * @param {string} playerName full name, e.g. "Matt Freese"
 * @param {string|null} [espnUrl] ESPN headshot if already known (preferred)
 * @returns {Promise<string|null>}
 */
async function getPlayerPhoto(teamCode, playerName, espnUrl) {
  try {
    // 1. ESPN already has it - trust it, cache it, done.
    if (espnUrl && validateImageUrl(espnUrl)) {
      setCachedPhoto(teamCode, playerName, espnUrl, 'espn')
      return espnUrl
    }

    // 2. Cache hit.
    const cached = getCachedPhoto(teamCode, playerName)
    if (cached) {
      console.log(`[Photo] Cache hit: ${teamCode}/${playerName}`)
      return cached
    }

    // 3. Already being fetched - ride the shared promise.
    const inflight = getInflightRequest(teamCode, playerName)
    if (inflight) return await inflight

    // 4. Ask Google via the proxy (unless the daily budget is spent).
    if (isGoogleApiQuotaExhausted()) {
      console.warn('[Photo] Google daily quota reached; falling back to initials')
      return null
    }
    const request = fetchGoogleImage(teamCode, playerName)
    setInflightRequest(teamCode, playerName, request)
    const url = await request
    if (url) {
      setCachedPhoto(teamCode, playerName, url, 'google')
      return url
    }

    // 5. Nothing found anywhere.
    return null
  } catch (err) {
    console.warn('[Photo] Resolver error; falling back to initials', err)
    return null
  }
}

/**
 * Clear all cached photos for a tournament year. Keys are year-scoped
 * (`wc-photos-2026-*`), so this never touches another tournament's cache.
 * @param {string} [year] tournament year to clear (defaults to the current "2026")
 * @returns {number} how many cached entries were removed
 */
function clearPhotoCache(year = YEAR) {
  if (!canUseLocalStorage()) return 0
  const prefix = `${KEY_PREFIX}-${year}`
  const toRemove = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith(prefix)) toRemove.push(key)
  }
  toRemove.forEach((k) => localStorage.removeItem(k))
  console.log(`[Photo] Cleared ${toRemove.length} cached photo(s) for ${year}`)
  return toRemove.length
}

export { getPlayerPhoto, invalidatePhoto, clearPhotoCache, isGoogleApiQuotaExhausted }
