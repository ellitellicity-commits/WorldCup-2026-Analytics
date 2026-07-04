#!/usr/bin/env node
// Playwright scenario: country emblems (session brief, Part B).
//
// Runs against `npm run dev`. Drives the global playwright-cli. Asserts:
//   1. each-emblem-mounts   — CA / MX / US each mount their own emblem on trigger.
//   2. no-cross-fire        — only one emblem is ever in the DOM at once.
//   3. emblem-dismisses     — an emblem removes itself after its ~2.8s play.
//   4. flight-crossing-fires— a real flight (Buenos Aires→New York) crosses US
//                             airspace and fires the US emblem via the bounding
//                             circle. Uses a MutationObserver (robust to the
//                             variable headless frame rate), no console errors.

import { execFileSync } from 'node:child_process'

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173'
const SESSION = 'wc-emblem-test'

function cli(args, { raw = false } = {}) {
  const base = [`-s=${SESSION}`]
  if (raw) base.push('--raw')
  return execFileSync('playwright-cli', [...base, ...args], { encoding: 'utf8' }).trim()
}
const evalRaw = (expr) => cli(['eval', expr], { raw: true })
// --raw JSON-encodes the result (a string comes back quoted); parse once.
const evalJSON = (expr) => JSON.parse(evalRaw(expr))
const clickEmblem = (code) => evalRaw(`(() => { document.querySelector('[data-emblem=${code}]').click(); return 1; })()`)
const emblemCountry = () => evalJSON('document.querySelector(".emblem")?.dataset.country || "none"')
const emblemCount = () => evalJSON('document.querySelectorAll(".emblem").length')
const sleep = (ms) => cli(['run-code', `async page => { await page.waitForTimeout(${ms}) }`])

const results = []
const record = (name, ok, detail) => results.push({ name, ok, detail })

try {
  cli(['open', `${BASE_URL}/simulator`])
  cli(['run-code', 'async page => { await page.waitForSelector(".sim__emblem-btn", { timeout: 15000 }) }'])

  // 1 + 2: each country mounts its own, one at a time.
  const mounted = {}
  let single = true
  for (const code of ['CA', 'MX', 'US']) {
    clickEmblem(code)
    sleep(250)
    mounted[code] = emblemCountry() === code
    if (emblemCount() !== 1) single = false
    sleep(3000) // let it fully dismiss before the next
  }
  record('each-emblem-mounts', mounted.CA && mounted.MX && mounted.US, `CA:${mounted.CA} MX:${mounted.MX} US:${mounted.US}`)
  record('no-cross-fire', single, `exactly one emblem at a time: ${single}`)

  // 3: dismissal within its lifetime.
  clickEmblem('MX')
  sleep(250)
  const present = emblemCount() === 1
  sleep(3200)
  const gone = emblemCount() === 0
  record('emblem-dismisses', present && gone, `present-then-gone: ${present} -> ${gone}`)

  // 4: a real flight crossing fires the US emblem. Observe DOM mutations so a
  // fast headless flight can't slip the emblem past a coarse poll.
  evalRaw(`(() => {
    window.__seen = new Set();
    const root = document.querySelector('.sim');
    new MutationObserver(() => {
      const e = document.querySelector('.emblem');
      if (e) window.__seen.add(e.dataset.country);
    }).observe(root, { childList: true, subtree: true });
    document.querySelector('.sim__btn').click();
    return 1;
  })()`)
  sleep(6000)
  const seen = evalJSON('[...window.__seen]')
  const noErr = /Errors:\s*0|Returning 0 messages/.test(cli(['console', 'error']))
  record('flight-crossing-fires', seen.includes('US') && noErr, `emblems seen during flight=${JSON.stringify(seen)}, console ${noErr ? 'clean' : 'errors'}`)
} catch (err) {
  record('harness', false, err.message)
} finally {
  try { cli(['close']) } catch { /* noop */ }
}

let failed = 0
for (const r of results) {
  console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}  —  ${r.detail}`)
  if (!r.ok) failed++
}
console.log(`\n${results.length - failed}/${results.length} scenarios passed`)
process.exit(failed ? 1 : 0)
