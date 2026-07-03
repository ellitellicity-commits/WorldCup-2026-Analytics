// Vercel serverless proxy: /photo-api -> Google Custom Search (image).
//
// Mirrors the football-data proxy (api/index.js): the Google key and Search
// Engine ID are injected here, server-side, from GOOGLE_CUSTOM_SEARCH_KEY and
// GOOGLE_CUSTOM_SEARCH_ENGINE_ID — they are never shipped to the browser (a
// VITE_ var would inline them into the bundle for anyone to read and burn the
// 100/day free quota).
//
// Client sends ?name=<player>&team=<FIFA code>; we build the search query and
// return Google's native Custom Search JSON so lib/playerPhotoCache.js can read
// data.items[].link directly.
//
// Routing: vercel.json rewrites `/photo-api` to `/api/photo`, preserving query.

module.exports = async function handler(req, res) {
  const key = process.env.GOOGLE_CUSTOM_SEARCH_KEY
  const cx = process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID
  if (!key || !cx) {
    res.status(500).json({ error: 'Google Custom Search is not configured' })
    return
  }

  const q = req.query || {}
  const name = (Array.isArray(q.name) ? q.name[0] : q.name || '').trim()
  const team = (Array.isArray(q.team) ? q.team[0] : q.team || '').trim()
  if (!name) {
    res.status(400).json({ error: 'missing player name' })
    return
  }

  const query = `${name} ${team} 2026 World Cup`.trim()
  const url = new URL('https://www.googleapis.com/customsearch/v1')
  url.searchParams.set('q', query)
  url.searchParams.set('key', key)
  url.searchParams.set('cx', cx)
  url.searchParams.set('searchType', 'image')
  url.searchParams.set('num', '3')
  url.searchParams.set('safe', 'active')

  try {
    const upstream = await fetch(url, { headers: { Accept: 'application/json' } })
    const body = await upstream.text()
    res.setHeader('Content-Type', 'application/json')
    // Headshots are stable — cache hard at the edge to spare the daily quota.
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400')
    res.status(upstream.status).send(body)
  } catch (err) {
    res.status(502).json({ error: 'proxy request failed', detail: String((err && err.message) || err) })
  }
}
