#!/usr/bin/env node
import fs from 'node:fs';

const file = process.argv[2];
if (!file) {
  console.error('usage: node scripts/validate-trama-parent-identity.mjs <policy-file>');
  process.exit(2);
}

const p = JSON.parse(fs.readFileSync(file, 'utf8'));
const errors = [];
const exactPalette = {
  background: '201 100% 13%',
  foreground: '0 0% 100%',
  mutedForeground: '240 4% 66%',
  primary: '0 0% 100%',
  primaryForeground: '0 0% 4%',
  secondary: '0 0% 10%',
  muted: '0 0% 10%',
  accent: '0 0% 10%',
  border: '0 0% 18%',
  input: '0 0% 18%',
};

if (p.policyId !== 'TRAMA-PARENT-IDENTITY') errors.push('policyId must be TRAMA-PARENT-IDENTITY');
if (p.version !== '1.0.0') errors.push('version must be 1.0.0');
if (p.owner !== 'TRAMA-GOVERNANCE') errors.push('owner must be TRAMA-GOVERNANCE');
if (p.wordmark?.text !== 'TRAMA') errors.push('wordmark must be exactly TRAMA');
if (p.typography?.display?.family !== 'Instrument Serif') errors.push('display font must be Instrument Serif');
if (p.typography?.body?.family !== 'Inter') errors.push('body font must be Inter');
if (JSON.stringify(p.typography?.body?.weights) !== JSON.stringify([400, 500])) errors.push('body font weights must be 400 and 500');
for (const [key, expected] of Object.entries(exactPalette)) {
  if (p.palette?.[key] !== expected) errors.push(`palette ${key} mismatch`);
}
if (p.motion?.contentRevealMs !== 800) errors.push('content reveal must be 800ms');
if (p.motion?.staggerMs !== 200) errors.push('stagger must be 200ms');
if (!(p.motion?.ctaHoverScaleMax <= 1.03)) errors.push('CTA hover scale exceeds 1.03');
if (p.motion?.reducedMotion?.removeNonessential !== true || p.motion?.reducedMotion?.autoplayVideo !== false || p.motion?.reducedMotion?.staticPosterRequired !== true) errors.push('reducedMotion requires static poster');
if (p.media?.prototypeOnly !== true || p.media?.localPosterRequired !== true) errors.push('media prototype/poster constraints missing');
if (!Array.isArray(p.glass?.scope) || !p.glass.scope.every((v) => ['gateway-shell', 'gateway-action'].includes(v))) errors.push('glass scope must be gateway-only');
if (p.glass?.fallbackRequired !== true) errors.push('glass fallback required');
if (p.accessibility?.wcagTarget !== '2.2-A-AA' || p.accessibility?.keyboardRequired !== true || p.accessibility?.focusVisibleRequired !== true || p.accessibility?.fontFailureReadable !== true) errors.push('accessibility requirements incomplete');
if (p.accessibility?.reflowCssPx !== 320 || p.accessibility?.zoom !== 4) errors.push('accessibility reflow binding mismatch');
if (p.responsive?.policyId !== 'TRAMA-RESPONSIVE' || p.responsive?.version !== '1.0.0') errors.push('responsive policy binding mismatch');
if (JSON.stringify(p.responsive?.conditions) !== JSON.stringify(['S', 'M', 'L', 'LIM'])) errors.push('responsive conditions mismatch');
if (p.boundaries?.runtimeImpact !== 'NONE') errors.push('runtimeImpact must remain NONE');
if (p.boundaries?.persistence !== 'NONE') errors.push('persistence must remain NONE');
if (p.boundaries?.studentAccountTracking !== 'NONE') errors.push('studentAccountTracking must remain NONE');
if (p.boundaries?.dosA1 !== 'RUNTIME_DEFERRED') errors.push('dosA1 must remain RUNTIME_DEFERRED');
if (p.boundaries?.authenticationAuthority !== 'NONE') errors.push('authenticationAuthority must remain NONE');
if (p.boundaries?.telemetry !== 'NONE') errors.push('telemetry must remain NONE');
if (p.boundaries?.publicationAuthority !== 'NONE') errors.push('publicationAuthority must remain NONE');

console.log(JSON.stringify({
  policy: 'TRAMA-PARENT-IDENTITY',
  version: p.version,
  result: errors.length ? 'FAIL' : 'PASS',
  errors,
}, null, 2));
process.exit(errors.length ? 1 : 0);
