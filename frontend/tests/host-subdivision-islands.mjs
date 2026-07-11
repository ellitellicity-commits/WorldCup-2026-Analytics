#!/usr/bin/env node
// Playwright scenario: host subdivision capitals always land on rendered land.
//
// Runs against `npm run dev`. scripts/generate_host_subdivisions.mjs used to keep
// only the single largest ring per subdivision (by bbox area), dropping every
// other island/exclave. For most provinces that's harmless (the dropped bits are
// tiny), but Nunavut's capital, Iqaluit, sits on Baffin Island - a separate ring
// from the mainland tundra strip that used to "win" - so the capital dot/label
// rendered floating over blank ocean with no landmass under it. The fix keeps
// every ring at least 3% of the subdivision's largest ring's bbox area. This
// asserts, in the live Atlas Canada sub-map:
//   1. nunavut-multi-ring   — the underlying data now carries >1 ring for Nunavut.
//   2. iqaluit-on-land      — the Iqaluit capital marker's projected point falls
//                             inside one of Nunavut's rendered SVG path shapes
//                             (point-in-polygon on the live DOM, not just data).
// No console errors throughout.

import { execFileSync } from 'node:child_process'

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173'
const SESSION = 'wc-nunavut-test'

function cli(args, { raw = false } = {}) {
  const base = [`-s=${SESSION}`]
  if (raw) base.push('--raw')
  return execFileSync('playwright-cli', [...base, ...args], { encoding: 'utf8' }).trim()
}
const evalJSON = (expr) => JSON.parse(cli(['eval', expr], { raw: true }))

const results = []
const record = (name, ok, detail) => results.push({ name, ok, detail })

try {
  cli(['open', '--browser=chromium', `${BASE_URL}/encyclopedia`])

  const data = evalJSON(`(async () => {
    const mod = await import('/src/data/hostSubdivisions.json?import');
    const subs = mod.default.CA.subs;
    return { ringCount: subs.find((s) => s.name === 'Nunavut').rings.length, nunavutIndex: subs.findIndex((s) => s.name === 'Nunavut') };
  })()`)
  record('nunavut-multi-ring', data.ringCount > 1, `Nunavut has ${data.ringCount} ring(s) in the data file`)

  // Drive to the Canada panel: pick Canada, click through the mascot tour to
  // "Explore" (which opens the panel + sub-map), then locate Iqaluit's marker
  // and Nunavut's rendered <path> (Nth child of .submap__provs, matching the
  // data array index - CA has no EXCLUDE filter, so order is preserved), and
  // point-in-polygon test in the live SVG's own coordinate space (matches the
  // component's own projection exactly).
  const onLand = JSON.parse(cli(['run-code', `async page => {
    await page.goto('${BASE_URL}/encyclopedia');
    await page.waitForSelector('[aria-label="Jump to a nation"]', { timeout: 15000 });
    await page.selectOption('[aria-label="Jump to a nation"]', 'Canada');
    for (let i = 0; i < 8; i++) {
      const nextBtn = page.getByRole('button', { name: /Next/ });
      const exploreBtn = page.getByRole('button', { name: /Explore/i });
      if (await exploreBtn.count() > 0) { await exploreBtn.first().click(); break; }
      if (await nextBtn.count() > 0) { await nextBtn.first().click(); await page.waitForTimeout(150); }
      else break;
    }
    await page.waitForSelector('.submap--CA', { timeout: 8000 });
    return await page.evaluate((nunavutIndex) => {
      const svg = document.querySelector('.submap--CA svg');
      const dots = [...svg.querySelectorAll('circle.submap__cap')];
      const iq = dots.find((d) => d.querySelector('title')?.textContent.includes('Iqaluit'));
      if (!iq) return { found: false };
      const cx = +iq.getAttribute('cx'), cy = +iq.getAttribute('cy');
      const path = [...svg.querySelectorAll('.submap__provs path')][nunavutIndex];
      if (!path) return { found: true, noPath: true };
      const pt = svg.createSVGPoint();
      pt.x = cx; pt.y = cy;
      const inside = path.isPointInFill ? path.isPointInFill(pt) : false;
      return { found: true, inside };
    }, ${data.nunavutIndex});
  }`], { raw: true }))
  record('iqaluit-on-land', onLand.found && onLand.inside, JSON.stringify(onLand))

  const noErr = /Errors:\s*0|Returning 0 messages/.test(cli(['console', 'error']))
  record('no-console-errors', noErr, noErr ? 'clean' : 'errors present')
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
