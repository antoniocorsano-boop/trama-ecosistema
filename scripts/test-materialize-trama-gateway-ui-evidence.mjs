#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const sourceRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const materializer = path.join(sourceRoot, 'scripts/materialize-trama-gateway-ui-evidence.mjs');
const EXACT_HEAD = 'a'.repeat(40);
const RUN_ID = '123456789';
const ROLES = ['lim', 's', 'm', 'l'];
const REQUIRED = {
  lim: { width: 960, height: 2700 },
  s: { width: 1170, height: 2532 },
  m: { width: 1536, height: 2048 },
  l: { width: 2560, height: 1440 },
};

function writeUInt24LE(buffer, value, offset) {
  buffer[offset] = value & 0xff;
  buffer[offset + 1] = (value >> 8) & 0xff;
  buffer[offset + 2] = (value >> 16) & 0xff;
}

function makeWebp(width, height) {
  const buffer = Buffer.alloc(30);
  buffer.write('RIFF', 0, 'ascii');
  buffer.writeUInt32LE(22, 4);
  buffer.write('WEBP', 8, 'ascii');
  buffer.write('VP8X', 12, 'ascii');
  buffer.writeUInt32LE(10, 16);
  writeUInt24LE(buffer, width - 1, 24);
  writeUInt24LE(buffer, height - 1, 27);
  return buffer;
}

function writeRepositoryFixture(repoRoot) {
  const media = path.join(repoRoot, 'apps/gateway/public/media');
  const config = path.join(repoRoot, 'apps/gateway/src/config');
  const baseline = path.join(repoRoot, 'docs/superpowers/specs/assets');
  fs.mkdirSync(media, { recursive: true });
  fs.mkdirSync(config, { recursive: true });
  fs.mkdirSync(baseline, { recursive: true });

  for (const role of ROLES) {
    fs.writeFileSync(
      path.join(media, `trama-gateway-bg-${role}.webp`),
      makeWebp(REQUIRED[role].width, REQUIRED[role].height),
    );
  }
  fs.writeFileSync(
    path.join(config, 'gateway.ts'),
    "export const gatewayConfig = { background: { lim: '/media/trama-gateway-bg-lim.webp', s: '/media/trama-gateway-bg-s.webp', m: '/media/trama-gateway-bg-m.webp', l: '/media/trama-gateway-bg-l.webp' } };\n",
  );
  fs.writeFileSync(path.join(baseline, 'trama-gateway-approved-desktop-v2.jpg'), 'baseline');
  fs.writeFileSync(
    path.join(media, 'trama-gateway-media-provenance.json'),
    `${JSON.stringify({
      version: 3,
      assets: ROLES.map((role) => ({
        path: `/media/trama-gateway-bg-${role}.webp`,
        role,
        dimensions: REQUIRED[role],
        source: 'native fixture',
        artDirection: `independent ${role} composition`,
        encoding: { format: 'webp', quality: 90 },
        approval: 'IMPLEMENTATION_CANDIDATE_PENDING_HUMAN_REVIEW',
        date: '2026-10-10',
        identifiablePersons: false,
        studentData: false,
        uiEmbedded: false,
        segnoVivoEmbedded: false,
      })),
    }, null, 2)}\n`,
  );
}

function writeEvidence(dir) {
  fs.mkdirSync(dir, { recursive: true });
  for (const [name, content] of [
    ['background-S.png', 'S'],
    ['background-M.png', 'M'],
    ['background-L.png', 'L'],
    ['background-LIM.png', 'LIM'],
    ['axe-L.json', JSON.stringify({ result: 'PASS', violations: [] })],
    ['keyboard-focus-L.json', JSON.stringify({ result: 'PASS', reachedPrimaryAccess: true, visibleFocus: true })],
    ['text-resize-LIM.json', JSON.stringify({ result: 'PASS', percent: 200, overflow: false })],
  ]) {
    fs.writeFileSync(path.join(dir, name), content);
  }
}

function run(repoRoot, exactHead, evidenceDir, outputFile) {
  return spawnSync(
    process.execPath,
    [materializer, exactHead, evidenceDir, outputFile, RUN_ID, '--repository-root', repoRoot],
    { cwd: sourceRoot, encoding: 'utf8' },
  );
}

const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'trama-gateway-evidence-v3-'));
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
  const repoRoot = path.join(temp, 'repo');
  const evidenceDir = path.join(repoRoot, 'apps/gateway/test-results/evidence');
  const outputFile = path.join(repoRoot, 'apps/gateway/test-results/ui-evidence.manifest.json');
  writeRepositoryFixture(repoRoot);
  writeEvidence(evidenceDir);

  const invalidSha = run(repoRoot, 'not-a-sha', evidenceDir, outputFile);
  check(invalidSha.status !== 0, 'rejects non-40-character exact head');

  const valid = run(repoRoot, EXACT_HEAD, evidenceDir, outputFile);
  check(valid.status === 0, `materializes valid background-only evidence: ${valid.stderr || valid.stdout}`);
  if (valid.status === 0 && fs.existsSync(outputFile)) {
    const manifest = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
    check(manifest.change?.aggregateUiImpact === 'NEW', 'aggregate impact is NEW');
    check(manifest.change?.surfaces?.[0]?.id === 'trama-public-gateway', 'surface id is trama-public-gateway');
    check(manifest.perceptibleWrite?.classification === 'NON_MUTATIVE', 'journey is NON_MUTATIVE');
    check(manifest.boundaries?.runtimeImpact === 'NONE', 'runtime impact remains NONE');
    check(manifest.boundaries?.dosA1 === 'RUNTIME_DEFERRED', 'DOS-A1 remains RUNTIME_DEFERRED');

    const expectedDimensions = { S: [390, 844], M: [768, 1024], L: [1440, 900], LIM: [320, 900] };
    for (const condition of ['S', 'M', 'L', 'LIM']) {
      const entry = manifest.responsive?.evidence?.find((item) => item.condition === condition);
      check(Boolean(entry), `${condition} background evidence exists`);
      if (entry) {
        check(entry.reference.endsWith(`background-${condition}.png`), `${condition} binds background-only screenshot`);
        check(entry.type === 'responsive', `${condition} evidence uses responsive schema type`);
        check(entry.commitSha === EXACT_HEAD, `${condition} binds exact head`);
        check(entry.width === expectedDimensions[condition][0] && entry.height === expectedDimensions[condition][1], `${condition} dimensions are concrete`);
      }
    }

    const evidenceById = new Map((manifest.perceptibleWrite?.evidence || []).map((entry) => [entry.evidenceId, entry]));
    const requiredMediaEvidence = {
      'trama-gateway-visual-baseline': 'docs/superpowers/specs/assets/trama-gateway-approved-desktop-v2.jpg',
      'trama-gateway-media-provenance': 'apps/gateway/public/media/trama-gateway-media-provenance.json',
      'trama-gateway-background-lim': 'apps/gateway/public/media/trama-gateway-bg-lim.webp',
      'trama-gateway-background-s': 'apps/gateway/public/media/trama-gateway-bg-s.webp',
      'trama-gateway-background-m': 'apps/gateway/public/media/trama-gateway-bg-m.webp',
      'trama-gateway-background-l': 'apps/gateway/public/media/trama-gateway-bg-l.webp',
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
    check(
      !JSON.stringify(manifest).includes('trama-gateway-poster-'),
      'manifest contains no legacy poster reference',
    );
  }

  fs.rmSync(path.join(evidenceDir, 'background-M.png'));
  const missingBackground = run(repoRoot, EXACT_HEAD, evidenceDir, path.join(temp, 'missing-background.json'));
  check(missingBackground.status !== 0, 'fails when required background-only screenshot is missing');
  fs.writeFileSync(path.join(evidenceDir, 'background-M.png'), 'M');

  fs.rmSync(path.join(evidenceDir, 'axe-L.json'));
  const missingAxe = run(repoRoot, EXACT_HEAD, evidenceDir, path.join(temp, 'missing-axe.json'));
  check(missingAxe.status !== 0, 'fails when required axe artifact is missing');
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}

process.exit(failures ? 1 : 0);
