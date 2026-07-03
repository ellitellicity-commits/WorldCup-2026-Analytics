/**
 * Vercel serverless function: proxy to football-data.org
 * 
 * Maps: /api/football-api/* → https://api.football-data.org/*
 * Injects X-Auth-Token from env var FOOTBALL_DATA_API_KEY
 * 
 * File: api/football-api/[...path].js
 */

export default async function handler(req, res) {
  // Only GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Get the path segments (everything after /api/football-api/)
  const { path } = req.query
  if (!path || !Array.isArray(path)) {
    return res.status(400).json({ error: 'Invalid path' })
  }

  const pathString = path.join('/')
  const apiUrl = `https://api.football-data.org/${pathString}`

  // Get API key from env
  const apiKey = process.env.FOOTBALL_DATA_API_KEY
  if (!apiKey) {
    console.error('FOOTBALL_DATA_API_KEY not set in Vercel env')
    return res.status(500).json({ error: 'API key not configured' })
  }

  try {
    // Forward request to football-data.org
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'X-Auth-Token': apiKey,
        'Content-Type': 'application/json',
      },
    })

    // Handle non-200 responses
    if (!response.ok) {
      console.warn(
        `football-data.org returned ${response.status} for ${apiUrl}`
      )
      return res
        .status(response.status)
        .json({ error: `upstream error: ${response.status}` })
    }

    // Parse and return the response
    const data = await response.json()
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Cache-Control', 'public, max-age=60') // Cache for 1 minute
    return res.status(200).json(data)
  } catch (error) {
    console.error(`Proxy error for ${apiUrl}:`, error.message)
    return res.status(500).json({ error: 'Failed to fetch from football-data.org' })
  }
}
