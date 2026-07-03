#!/usr/bin/env node
// Playwright scenario: live-vs-fallback data state (session brief, Part 2).
//
// Runs against a live `npm run dev` (default http://localhost:5173, override with
// BASE_URL) and drives the global `playwright-cli`. Reports PASS/FAIL per scenario
// and exits non-zero if any fail.
//
// The gap this guards: when the football-data.org fetch fails (missing key, rate
// limit, network error, timeout), the app silently falls back to a bundled
// snapshot. Without a signal, a days-old snapshot is indistinguishable from live
// state. This forces the fallback path and asserts:
//   1. fallback-indicator   — the data-state marker shows the non-live "Snapshot"
//                             state (not the red LIVE chip).
//   2. fallback-round-sane  — getCurrentRound() over the fallback data returns a
//                             valid round (here "Group Stage" — the snapshot is
//                             from 28 Jun), and the page renders it without crashing.
//   3. fn-off-static-data   — getCurrentRound() computed directly from the app's
//                             own bundled static fixtures is a valid round, proving
//                             the fallback dataset itself yields a sane result.
//
// Works with or without a live key: with a key, routing the API to 500 exercises
// the catch path; without one the app is static from the start. Either way the
// asserted end-state (non-live indicator + sane round) is the same.

import { execFileSync } from 'node:child_process'

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173/'
const SESSION = 'wc-fallback-test'
const VALID_ROUNDS = ['Group Stage', 'Round of 32', 'Round of 16', 'Quarter-finals', 'Semi-finals', 'Third place', 'Final']

function cli(args, { raw = false } = {}) {
  const base = [`-s=${SESSION}`]
  if (raw) base.push('--raw')
  return execFileSync('playwright-cli', [...base, ...args], { encoding: 'utf8' }).trim()
}

const PROBE = `(async () => {
  const bracket = await import('/src/lib/bracket.js');
  const staticFixtures = (await import('/src/data/fixtures.json')).default;

  const marker = document.querySelector('.data-status');
  const stageEl = document.querySelectorAll('.snapshot__item')[1];

  // getCurrentRound over the app's OWN bundled static fixtures (the fallback set),
  // with the static knockout scaffold — the same inputs the app uses when it falls back.
  const fnOffStatic = bracket.getCurrentRound(staticFixtures.fixtures, { r32: [], resultsByPair: new Map() });

  return {
    markerClass: marker ? marker.className : null,
    markerText: marker ? marker.textContent.replace(/\\s+/g, ' ').trim() : null,
    displayedStage: stageEl ? stageEl.querySelector('.snapshot__big').textContent.trim() : null,
    fnOffStatic,
  };
})()`

const results = []
const record = (name, ok, detail) => results.push({ name, ok, detail })

try {
  cli(['open', BASE_URL])
  // Force every live fetch to fail, so the app must take the fallback path.
  cli(['route', '**/football-api/**', '--status=500'])
  cli(['reload'])
  cli(['run-code', 'async page => { await page.waitForSelector(".data-status", { timeout: 10000 }) }'])

  const probe = JSON.parse(cli(['eval', PROBE], { raw: true }))

  record(
    'fallback-indicator',
    probe.markerClass === 'data-status data-status--static' && /snapshot/i.test(probe.markerText || ''),
    `marker="${probe.markerText}" (${probe.markerClass})`,
  )
  record(
    'fallback-round-sane',
    VALID_ROUNDS.includes(probe.displayedStage),
    `displayed stage="${probe.displayedStage}"`,
  )
  record(
    'fn-off-static-data',
    VALID_ROUNDS.includes(probe.fnOffStatic),
    `getCurrentRound(static)="${probe.fnOffStatic}"`,
  )
} catch (err) {
  record('harness', false, err.message)
} finally {
  try { cli(['unroute']) } catch { /* noop */ }
  try { cli(['close']) } catch { /* session may not exist */ }
}

let failed = 0
for (const r of results) {
  console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}  —  ${r.detail}`)
  if (!r.ok) failed++
}
console.log(`\n${results.length - failed}/${results.length} scenarios passed`)
process.exit(failed ? 1 : 0)
