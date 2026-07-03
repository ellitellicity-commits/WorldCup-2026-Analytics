// Vercel serverless proxy: /football-api/* -> https://api.football-data.org/*
//
// Mirrors the vite dev/preview proxy (frontend/vite.config.js) so PRODUCTION
// gets live tournament data too. The football-data.org token is injected here,
// server-side, from FOOTBALL_DATA_API_KEY — it is never shipped to the browser.
//
// Routing: vercel.json rewrites `/football-api/:path*` to `/api?path=:path*`,
// so the upstream path arrives as the `path` query param.

module.exports = async function handler(req, res) {
  const key = process.env.FOOTBALL_DATA_API_KEY
  if (!key) {
    res.status(500).json({ error: 'FOOTBALL_DATA_API_KEY is not configured' })
    return
  }

  // The rewrite passes the upstream path as ?path=v4/competitions/WC/matches.
  // Vercel may hand it back as a string or an array of segments — normalise both.
  const raw = req.query && req.query.path
  const path = Array.isArray(raw) ? raw.join('/') : raw || ''
  if (!path) {
    res.status(400).json({ error: 'missing upstream path' })
    return
  }

  try {
    const upstream = await fetch(`https://api.football-data.org/${path}`, {
      headers: { 'X-Auth-Token': key, Accept: 'application/json' },
    })
    const body = await upstream.text()
    res.setHeader('Content-Type', 'application/json')
    // Short cache so live scores stay fresh but repeat loads are cheap.
    res.setHeader('Cache-Control', 'public, max-age=60')
    res.status(upstream.status).send(body)
  } catch (err) {
    res.status(502).json({ error: 'proxy request failed', detail: String((err && err.message) || err) })
  }
}
