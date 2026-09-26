import fs from 'node:fs';

const catalogPath = 'governance/component-pattern/catalog.stage-a.json';
const matrixPath = 'governance/component-pattern/support-matrix.stage-a.json';
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
const matrix = JSON.parse(fs.readFileSync(matrixPath, 'utf8'));
const errors = [];
const required = ['id','version','kind','owner','status','intent','products','semanticContract','nativeFirst','states','accessibility','responsive','content','privacyTrust','composition','supportEvidence','extensions'];
const statuses = new Set(['PROPOSED','TRIAL','STABLE','DEPRECATED','RETIRED']);
const kinds = new Set(['COMPONENT','PATTERN','TEMPLATE']);
const products = new Set(['ARENA','ATLAS','DOCENTE_OS','CONTROL_CENTER']);

if (catalog.contractId !== 'TRAMA-COMPONENT-PATTERN-01') errors.push('wrong contractId');
if (catalog.stage !== 'A') errors.push('catalog stage must be A');
if (catalog.runtimeMigration !== false) errors.push('Stage A runtimeMigration must be false');
if (!Array.isArray(catalog.entries) || catalog.entries.length === 0) errors.push('catalog entries required');

const ids = new Set();
for (const [i,e] of (catalog.entries || []).entries()) {
  const p = `entries[${i}]`;
  for (const key of required) if (!(key in e)) errors.push(`${p}: missing ${key}`);
  if (ids.has(e.id)) errors.push(`${p}: duplicate id ${e.id}`); else ids.add(e.id);
  if (!kinds.has(e.kind)) errors.push(`${p}: invalid kind`);
  if (!statuses.has(e.status)) errors.push(`${p}: invalid status`);
  if (e.status === 'STABLE') errors.push(`${p}: Stage A cannot introduce STABLE entries`);
  if (!Array.isArray(e.products) || e.products.some(x => !products.has(x))) errors.push(`${p}: invalid products`);
  for (const size of ['S','M','L','LIM']) if (!e.responsive?.[size]) errors.push(`${p}: responsive.${size} required`);
  if (!Array.isArray(e.composition?.slots) || !Array.isArray(e.composition?.allowedChildren) || !e.composition?.cardinality || !e.composition?.responsibilities) errors.push(`${p}: incomplete composition contract`);
  if (!['LOW','MEDIUM','HIGH'].includes(e.supportEvidence?.riskClass) || !Array.isArray(e.supportEvidence?.matrix) || e.supportEvidence.matrix.length === 0) errors.push(`${p}: incomplete support evidence`);
  if (e.feedback?.mutatesState === true && !e.feedback?.perceptibleOutcome) errors.push(`${p}: mutating action requires perceptibleOutcome`);
  if (!Array.isArray(e.extensions?.forbiddenOverrides) || e.extensions.forbiddenOverrides.length === 0) errors.push(`${p}: forbiddenOverrides required`);
}

if (matrix.contractId !== catalog.contractId || matrix.stage !== 'A') errors.push('support matrix identity mismatch');
if (matrix.policy?.runtimeMigration !== false) errors.push('support matrix must forbid runtime migration');
if (matrix.policy?.stablePromotionAllowed !== false) errors.push('Stage A must forbid STABLE promotion');
if (matrix.policy?.dosA1 !== 'RUNTIME_DEFERRED') errors.push('DOS-A1 must remain RUNTIME_DEFERRED');
if (!Array.isArray(matrix.negativeCases) || matrix.negativeCases.length < 5) errors.push('negative cases insufficient');

if (errors.length) {
  console.error('TRAMA-COMPONENT-PATTERN-01 Stage A: FAIL');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(`TRAMA-COMPONENT-PATTERN-01 Stage A: PASS (${catalog.entries.length} entries; ${matrix.negativeCases.length} negative cases declared)`);
