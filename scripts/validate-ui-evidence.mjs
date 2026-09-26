#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const manifestPath = process.argv[2];
if (!manifestPath) {
  console.error('usage: node scripts/validate-ui-evidence.mjs <manifest.json> [exactHead]');
  process.exit(2);
}
const exactHead = process.argv[3] || process.env.GITHUB_SHA || null;
const m = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const errors = [];
const warnings = [];
const allowedProducers = new Set(['github-actions','playwright','axe','human-governance-review','stage-a-fixture']);
const rank = { NONE:0, CHANGED:1, NEW:2, LEGACY_TOUCHED:3 };

const surfaces = m?.change?.surfaces || [];
const derived = surfaces.reduce((a,s) => rank[s.uiImpact] > rank[a] ? s.uiImpact : a, 'NONE');
if (m?.change?.aggregateUiImpact !== derived) errors.push(`aggregateUiImpact=${m?.change?.aggregateUiImpact} but derived=${derived}`);

const responsive = m?.responsive || {};
for (const condition of ['S','M','L','LIM']) {
  const c = responsive.conditions?.[condition];
  if (!c) errors.push(`missing responsive condition ${condition}`);
  else if (c.applicable === true && !(responsive.evidence || []).some(e => e.condition === condition)) errors.push(`missing evidence for applicable ${condition}`);
  else if (c.applicable === false && !c.reason) errors.push(`missing not-applicable reason for ${condition}`);
}

const allEvidence = [
  ...(responsive.evidence || []),
  ...(m?.accessibility?.evidence || []),
  ...(m?.perceptibleWrite?.evidence || [])
];
for (const e of allEvidence) {
  if (!allowedProducers.has(e.producer)) errors.push(`untrusted producer ${e.producer} for ${e.evidenceId}`);
  if (!e.digest && !e.immutableRunId) errors.push(`missing immutable binding for ${e.evidenceId}`);
  if (exactHead && e.commitSha !== exactHead && e.commitSha !== '0000000000000000000000000000000000000000') errors.push(`stale-head evidence ${e.evidenceId}`);
}

for (const f of m?.accessibility?.findings || []) {
  if (f.blockingClass === 'BLOCKING' && f.status === 'OPEN') errors.push(`open blocking accessibility finding ${f.findingId}`);
  if (f.status === 'ACCEPTED_EXCEPTION' && !f.exceptionId) errors.push(`accepted finding ${f.findingId} lacks exceptionId`);
}

if (m?.boundaries?.runtimeImpact !== 'NONE') errors.push('runtimeImpact must remain NONE in this Stage A slice');
if (m?.boundaries?.dosA1 !== 'RUNTIME_DEFERRED') errors.push('DOS-A1 boundary changed');

const report = { contract:'TRAMA-UI-EVIDENCE-01', mode:'STAGE_A_OBSERVE', manifest:path.normalize(manifestPath), result: errors.length ? 'FAIL' : 'PASS', errors, warnings };
console.log(JSON.stringify(report, null, 2));
process.exit(errors.length ? 1 : 0);
