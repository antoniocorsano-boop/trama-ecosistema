#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const materializer = path.join(root, 'scripts/materialize-trama-gateway-ui-evidence.mjs');
const EXACT_HEAD = 'a'.repeat(40);
const RUN_ID = '123456789';

function writeEvidence(dir) {
  fs.mkdirSync(dir, { recursive: true });
  for (const [name, content] of [
    ['gateway-S.png', 'S'],
    ['gateway-M.png', 'M'],
    ['gateway-L.png', 'L'],
    ['gateway-LIM.png', 'LIM'],
    ['axe-L.json', JSON.stringify({ result: 'PASS', violations: [] })],
    ['keyboard-focus-L.json', JSON.stringify({ result: 'PASS', reachedPrimaryAccess: true, visibleFocus: true })],
    ['text-resize-LIM.json', JSON.stringify({ result: 'PASS', percent: 200, overflow: false })],
  ]) {
    fs.writeFileSync(path.join(dir, name), content);
  }
}

function run(exactHead, evidenceDir, outputFile) {
  return spawnSync(process.execPath, [materializer, exactHead, evidenceDir, outputFile, RUN_ID], {
    cwd: root,
    encoding: 'utf8',
  });
}

const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'trama-gateway-evidence-'));
let failures = 0;
const check = (condition, message) => {
  if (!condition) {
    failures += 1;
    console.error(`FAIL ${message}`);
  } else {
    console.log(`PASS ${message}`);
  }
};

try {
  const evidenceDir = path.join(temp, 'evidence');
  const outputFile = path.join(temp, 'ui-evidence.manifest.json');
  writeEvidence(evidenceDir);

  const invalidSha = run('not-a-sha', evidenceDir, outputFile);
  check(invalidSha.status !== 0, 'rejects non-40-character exact head');

  const valid = run(EXACT_HEAD, evidenceDir, outputFile);
  check(valid.status === 0, `materializes valid evidence: ${valid.stderr || valid.stdout}`);
  if (valid.status === 0 && fs.existsSync(outputFile)) {
    const manifest = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
    check(manifest.change?.aggregateUiImpact === 'NEW', 'aggregate impact is NEW');
    check(manifest.change?.surfaces?.[0]?.id === 'trama-public-gateway', 'surface id is trama-public-gateway');
    check(manifest.change?.surfaces?.[0]?.uiImpact === 'NEW', 'surface impact is NEW');
    check(manifest.perceptibleWrite?.classification === 'NON_MUTATIVE', 'journey is NON_MUTATIVE');
    check(manifest.boundaries?.runtimeImpact === 'NONE', 'runtime impact remains NONE');
    check(manifest.boundaries?.dosA1 === 'RUNTIME_DEFERRED', 'DOS-A1 remains RUNTIME_DEFERRED');
    check(manifest.product?.profile === 'TRAMA-PARENT-IDENTITY', 'parent identity profile is recorded');
    const expectedDimensions = { S: [390, 844], M: [768, 1024], L: [1440, 900], LIM: [320, 900] };
    for (const condition of ['S', 'M', 'L', 'LIM']) {
      check(manifest.responsive?.conditions?.[condition]?.applicable === true, `${condition} is applicable`);
      const entry = manifest.responsive?.evidence?.find((item) => item.condition === condition);
      check(Boolean(entry), `${condition} evidence exists`);
      if (entry) {
        check(entry.commitSha === EXACT_HEAD, `${condition} binds exact head`);
        check(entry.policyId === 'TRAMA-RESPONSIVE' && entry.policyVersion === '1.0.0', `${condition} binds responsive policy`);
        check(entry.width === expectedDimensions[condition][0] && entry.height === expectedDimensions[condition][1], `${condition} dimensions are concrete`);
      }
    }
    const newComponents = new Set(manifest.designSystem?.newComponents || []);
    for (const component of ['TramaWordmark', 'TramaGlassAction', 'TramaMediaBackdrop', 'TramaNavigation', 'TramaGatewayShell']) {
      check(newComponents.has(component), `records ${component}`);
    }
    check((manifest.designSystem?.tokens || []).includes('TRAMA-PARENT-IDENTITY@1.0.0'), 'records parent identity policy');

    const perceptibleEvidence = manifest.perceptibleWrite?.evidence || [];
    const evidenceById = new Map(perceptibleEvidence.map((entry) => [entry.evidenceId, entry]));
    const requiredMediaEvidence = {
      'trama-gateway-visual-baseline': 'docs/superpowers/specs/assets/trama-identity-gateway-v1-approved-baseline.jpg',
      'trama-gateway-media-provenance': 'apps/gateway/public/media/trama-gateway-media-provenance.json',
      'trama-gateway-poster-s': 'apps/gateway/public/media/trama-gateway-poster-s.webp',
      'trama-gateway-poster-m': 'apps/gateway/public/media/trama-gateway-poster-m.webp',
      'trama-gateway-poster-l': 'apps/gateway/public/media/trama-gateway-poster-l.webp',
    };
    for (const [evidenceId, reference] of Object.entries(requiredMediaEvidence)) {
      const entry = evidenceById.get(evidenceId);
      check(Boolean(entry), `records ${evidenceId}`);
      if (entry) {
        check(entry.reference === reference, `${evidenceId} binds canonical reference`);
        check(entry.commitSha === EXACT_HEAD, `${evidenceId} binds exact head`);
        check(typeof entry.digest === 'string' && entry.digest.startsWith('sha256:'), `${evidenceId} records digest`);
      }
    }
  }

  fs.rmSync(path.join(evidenceDir, 'gateway-M.png'));
  const missingPlaywright = run(EXACT_HEAD, evidenceDir, path.join(temp, 'missing-playwright.json'));
  check(missingPlaywright.status !== 0, 'fails when required Playwright screenshot is missing');
  fs.writeFileSync(path.join(evidenceDir, 'gateway-M.png'), 'M');

  fs.rmSync(path.join(evidenceDir, 'axe-L.json'));
  const missingAxe = run(EXACT_HEAD, evidenceDir, path.join(temp, 'missing-axe.json'));
  check(missingAxe.status !== 0, 'fails when required axe artifact is missing');
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}

process.exit(failures ? 1 : 0);
