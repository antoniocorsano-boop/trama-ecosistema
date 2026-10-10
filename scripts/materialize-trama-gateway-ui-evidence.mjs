#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { validateTramaGatewayMedia } from './validate-trama-gateway-media.mjs';

const [exactHead, evidenceDirArg, outputArg, runId = 'local'] = process.argv.slice(2);
if (!exactHead || !evidenceDirArg || !outputArg) {
  console.error('usage: node scripts/materialize-trama-gateway-ui-evidence.mjs <exactHead> <evidenceDir> <outputFile> [runId]');
  process.exit(2);
}
if (!/^[0-9a-f]{40}$/.test(exactHead)) {
  console.error('exact head must be a 40-character lowercase hexadecimal SHA');
  process.exit(2);
}

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const evidenceDir = path.resolve(root, evidenceDirArg);
const outputFile = path.resolve(root, outputArg);
const templatePath = path.join(root, 'apps/gateway/ui-evidence.manifest.template.json');
const required = [
  'gateway-S.png',
  'gateway-M.png',
  'gateway-L.png',
  'gateway-LIM.png',
  'axe-L.json',
  'keyboard-focus-L.json',
  'text-resize-LIM.json',
];

for (const name of required) {
  const file = path.join(evidenceDir, name);
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
    console.error(`missing required gateway evidence: ${name}`);
    process.exit(1);
  }
}

const readJsonPass = (name) => {
  const data = JSON.parse(fs.readFileSync(path.join(evidenceDir, name), 'utf8'));
  if (data.result !== 'PASS') {
    console.error(`required evidence is not PASS: ${name}`);
    process.exit(1);
  }
  return data;
};
readJsonPass('axe-L.json');
readJsonPass('keyboard-focus-L.json');
readJsonPass('text-resize-LIM.json');

const digest = (file) => `sha256:${crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')}`;
const reference = (file) => path.relative(root, file).split(path.sep).join('/');
const bind = (name, producer, type, evidenceId) => {
  const file = path.join(evidenceDir, name);
  return {
    evidenceId,
    type,
    result: 'PASS',
    commitSha: exactHead,
    producer,
    reference: reference(file),
    digest: digest(file),
    immutableRunId: `github-actions:${runId}`,
  };
};
const bindRepositoryFile = (relativePath, producer, type, evidenceId) => {
  const file = path.join(root, relativePath);
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
    console.error(`missing required repository evidence: ${relativePath}`);
    process.exit(1);
  }
  return {
    evidenceId,
    type,
    result: 'PASS',
    commitSha: exactHead,
    producer,
    reference: relativePath,
    digest: digest(file),
    immutableRunId: `github-actions:${runId}`,
  };
};

const media = validateTramaGatewayMedia(root);
const visualBaseline = 'docs/superpowers/specs/assets/trama-identity-gateway-v1-approved-baseline.jpg';
const provenance = 'apps/gateway/public/media/trama-gateway-media-provenance.json';

const manifest = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
const dimensions = {
  S: { width: 390, height: 844 },
  M: { width: 768, height: 1024 },
  L: { width: 1440, height: 900 },
  LIM: { width: 320, height: 900 },
};
manifest.responsive.evidence = Object.entries(dimensions).map(([condition, size]) => ({
  ...bind(`gateway-${condition}.png`, 'playwright', 'responsive', `trama-gateway-responsive-${condition.toLowerCase()}`),
  condition,
  policyId: 'TRAMA-RESPONSIVE',
  policyVersion: '1.0.0',
  width: size.width,
  height: size.height,
}));
manifest.accessibility.evidence = [
  bind('axe-L.json', 'axe', 'accessibility-automated', 'trama-gateway-axe-l'),
  bind('keyboard-focus-L.json', 'playwright', 'keyboard-focus-automated', 'trama-gateway-keyboard-focus-l'),
  bind('text-resize-LIM.json', 'playwright', 'text-resize-reflow', 'trama-gateway-text-resize-lim'),
];
manifest.perceptibleWrite.evidence = [
  bindRepositoryFile(visualBaseline, 'human-visual-review', 'visual-baseline-contract', 'trama-gateway-visual-baseline'),
  bindRepositoryFile(provenance, 'trama-media-validator', 'media-provenance', 'trama-gateway-media-provenance'),
  bindRepositoryFile(reference(media.paths.s), 'trama-media-validator', 'poster-asset', 'trama-gateway-poster-s'),
  bindRepositoryFile(reference(media.paths.m), 'trama-media-validator', 'poster-asset', 'trama-gateway-poster-m'),
  bindRepositoryFile(reference(media.paths.l), 'trama-media-validator', 'poster-asset', 'trama-gateway-poster-l'),
];

fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(outputFile, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify({
  contract: manifest.contract.id,
  product: manifest.product.id,
  exactHead,
  output: reference(outputFile),
  responsiveEvidence: manifest.responsive.evidence.length,
  accessibilityEvidence: manifest.accessibility.evidence.length,
  governedMediaEvidence: manifest.perceptibleWrite.evidence.length,
  result: 'PASS',
}, null, 2));
