#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const validator = path.join(root, 'scripts/validate-trama-parent-identity.mjs');
const policyPath = path.join(root, 'policies/design-system/trama-parent-identity.v1.json');
const base = JSON.parse(fs.readFileSync(policyPath, 'utf8'));
const clone = () => JSON.parse(JSON.stringify(base));
const cases = [
  ['valid', () => clone(), null],
  ['wordmark', () => { const x = clone(); x.wordmark.text = 'Trama'; return x; }, 'wordmark must be exactly TRAMA'],
  ['display-font', () => { const x = clone(); x.typography.display.family = 'Georgia'; return x; }, 'display font must be Instrument Serif'],
  ['body-font', () => { const x = clone(); x.typography.body.family = 'Arial'; return x; }, 'body font must be Inter'],
  ['background', () => { const x = clone(); x.palette.background = '201 100% 14%'; return x; }, 'palette background mismatch'],
  ['foreground', () => { const x = clone(); x.palette.foreground = '0 0% 99%'; return x; }, 'palette foreground mismatch'],
  ['muted-foreground', () => { const x = clone(); x.palette.mutedForeground = '240 4% 65%'; return x; }, 'palette mutedForeground mismatch'],
  ['secondary', () => { const x = clone(); x.palette.secondary = '0 0% 11%'; return x; }, 'palette secondary mismatch'],
  ['border', () => { const x = clone(); x.palette.border = '0 0% 17%'; return x; }, 'palette border mismatch'],
  ['primary', () => { const x = clone(); x.palette.primary = '0 0% 99%'; return x; }, 'palette primary mismatch'],
  ['primary-foreground', () => { const x = clone(); x.palette.primaryForeground = '0 0% 5%'; return x; }, 'palette primaryForeground mismatch'],
  ['reduced-motion', () => { const x = clone(); x.motion.reducedMotion.staticPosterRequired = false; return x; }, 'reducedMotion requires static poster'],
  ['runtime-boundary', () => { const x = clone(); x.boundaries.runtimeImpact = 'WRITE'; return x; }, 'runtimeImpact must remain NONE'],
  ['persistence-boundary', () => { const x = clone(); x.boundaries.persistence = 'WRITE'; return x; }, 'persistence must remain NONE'],
  ['tracking-boundary', () => { const x = clone(); x.boundaries.studentAccountTracking = 'ENABLED'; return x; }, 'studentAccountTracking must remain NONE'],
  ['dos-a1', () => { const x = clone(); x.boundaries.dosA1 = 'AUTHORIZED'; return x; }, 'dosA1 must remain RUNTIME_DEFERRED'],
];

let failed = 0;
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'trama-parent-identity-'));
for (const [name, make, reason] of cases) {
  const fixture = path.join(dir, `${name}.json`);
  fs.writeFileSync(fixture, JSON.stringify(make(), null, 2));
  const result = spawnSync(process.execPath, [validator, fixture], { encoding: 'utf8' });
  const text = `${result.stdout || ''}${result.stderr || ''}`;
  const ok = reason ? result.status !== 0 && text.includes(reason) : result.status === 0;
  if (!ok) {
    failed++;
    console.error(`FAIL ${name}: expected ${reason || 'PASS'}; status=${result.status}; ${text}`);
  } else {
    console.log(`PASS ${name}${reason ? ` -> ${reason}` : ''}`);
  }
}
fs.rmSync(dir, { recursive: true, force: true });
process.exit(failed ? 1 : 0);
