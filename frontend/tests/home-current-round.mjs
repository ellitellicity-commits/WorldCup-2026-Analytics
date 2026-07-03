#!/usr/bin/env node
// Playwright scenario: Home page "current round" (session brief, Part 4/5a).
//
// Runs against a live `npm run dev` (default http://localhost:5173, override with
// BASE_URL) and drives the global `playwright-cli`. Reports PASS/FAIL per scenario
// and exits non-zero if any fail — so it slots into CI or a pre-commit check.
//
// What it proves, deterministically, without depending on the real-world date:
//   1. home-renders          — the snapshot Stage shows a valid round, no console errors.
//   2. group-stage-branch    — getCurrentRound() returns "Group Stage" while any group
//                              fixture is unfinished (the gap this session fixed).
//   3. group->r32-flip       — once every group fixture is completed and the R32 is in
//                              progress, it flips to "Round of 32".
//   4. displayed-matches-fn  — the round shown on the live page equals getCurrentRound()
//                              recomputed from the same live feed (the wiring is honest).
//
// Scenarios 2-4 import the real ./src/lib modules in-page via Vite, so they exercise
// shipped code, not a reimplementation.

import { execFileSync } from 'node:child_process'

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173/'
const SESSION = 'wc-home-test'
const VALID_ROUNDS = ['Group Stage', 'Round of 32', 'Round of 16', 'Quarter-finals', 'Semi-finals', 'Third place', 'Final']

function cli(args, { raw = false } = {}) {
  const base = [`-s=${SESSION}`]
  if (raw) base.push('--raw')
  return execFileSync('playwright-cli', [...base, ...args], { encoding: 'utf8' }).trim()
}

// One in-page probe returning every input the assertions need, as JSON.
const PROBE = `(async () => {
  const bracket = await import('/src/lib/bracket.js');
  const data = await import('/src/lib/data.js');

  const groupIncomplete = [{ status: 'completed' }, { status: 'completed' }, { status: 'scheduled' }];
  const groupComplete   = [{ status: 'completed' }, { status: 'completed' }, { status: 'completed' }];
  const koEmpty = { r32: [], resultsByPair: new Map() };

  // Recompute the current round from the same live feed the app reads.
  let liveComputed = null;
  try {
    const res = await fetch('/football-api/v4/competitions/WC/matches');
    const json = await res.json();
    const merged = data.mergeLiveData(json.matches);
    liveComputed = bracket.getCurrentRound(merged.fixtures.fixtures, merged.knockout);
  } catch (e) { liveComputed = 'ERROR: ' + e.message; }

  const stageEl = document.querySelectorAll('.snapshot__item')[1];
  // Return an object: playwright-cli --raw JSON-encodes it once, so the caller
  // parses once. (Returning JSON.stringify here would double-encode it.)
  return {
    displayedStage: stageEl ? stageEl.querySelector('.snapshot__big').textContent.trim() : null,
    groupStageBranch: bracket.getCurrentRound(groupIncomplete, koEmpty),
    groupToR32Flip: bracket.getCurrentRound(groupComplete, koEmpty),
    liveComputed,
  };
})()`

const results = []
const record = (name, ok, detail) => results.push({ name, ok, detail })

try {
  cli(['open', BASE_URL])
  // Give the data provider a moment to resolve fixtures + render the snapshot.
  cli(['run-code', 'async page => { await page.waitForSelector(".snapshot__item", { timeout: 10000 }) }'])

  const probe = JSON.parse(cli(['eval', PROBE], { raw: true }))
  const errorsOut = cli(['console', 'error'])
  const noErrors = /Errors:\s*0/.test(errorsOut) || /Returning 0 messages/.test(errorsOut)

  record(
    'home-renders',
    VALID_ROUNDS.includes(probe.displayedStage) && noErrors,
    `stage="${probe.displayedStage}", console errors ${noErrors ? 'none' : 'present'}`,
  )
  record('group-stage-branch', probe.groupStageBranch === 'Group Stage', `got "${probe.groupStageBranch}"`)
  record('group->r32-flip', probe.groupToR32Flip === 'Round of 32', `got "${probe.groupToR32Flip}"`)
  record(
    'displayed-matches-fn',
    probe.displayedStage === probe.liveComputed,
    `displayed="${probe.displayedStage}", getCurrentRound(live)="${probe.liveComputed}"`,
  )
} catch (err) {
  record('harness', false, err.message)
} finally {
  try { cli(['close']) } catch { /* session may not exist */ }
}

let failed = 0
for (const r of results) {
  console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}  —  ${r.detail}`)
  if (!r.ok) failed++
}
console.log(`\n${results.length - failed}/${results.length} scenarios passed`)
process.exit(failed ? 1 : 0)
