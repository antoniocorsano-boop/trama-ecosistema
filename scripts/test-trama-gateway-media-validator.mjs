import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const validator = resolve('scripts/validate-trama-gateway-media.mjs');
assert.equal(existsSync(validator), true, 'validator script must exist before fixture checks can run');

const ONE_BY_ONE_WEBP = Buffer.from('UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEALmk0mk0iIiIiIgBoSygABc6zbAAA', 'base64');

function makeFixture({ missingRole, badExt = false, missingProvenance = false, legacySvg = false } = {}) {
  const root = mkdtempSync(join(tmpdir(), 'trama-media-'));
  const media = join(root, 'apps/gateway/public/media');
  mkdirSync(media, { recursive: true });
  for (const role of ['s', 'm', 'l']) {
    if (role === missingRole) continue;
    const ext = badExt && role === 'm' ? 'png' : 'webp';
    writeFileSync(join(media, `trama-gateway-poster-${role}.${ext}`), ONE_BY_ONE_WEBP);
  }
  if (legacySvg) writeFileSync(join(media, 'trama-gateway-poster.svg'), '<svg/>');
  if (!missingProvenance) {
    writeFileSync(join(media, 'trama-gateway-media-provenance.json'), JSON.stringify({
      version: 1,
      assets: ['s', 'm', 'l'].map((role) => ({
        path: `/media/trama-gateway-poster-${role}.webp`,
        role,
        source: 'test fixture',
        approval: 'APPROVED_FOR_TEST',
        date: '2026-10-10',
        identifiablePersons: false,
        studentData: false,
        notes: 'fixture'
      }))
    }, null, 2));
  }
  return root;
}

function run(root) {
  return spawnSync(process.execPath, [validator, '--root', root], { encoding: 'utf8' });
}

function expectFailure(name, fixture, pattern) {
  const root = makeFixture(fixture);
  const result = run(root);
  try {
    assert.notEqual(result.status, 0, `${name}: expected failure`);
    assert.match(`${result.stdout}\n${result.stderr}`, pattern, `${name}: wrong diagnostic`);
    console.log(`PASS ${name}`);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

expectFailure('missing-role', { missingRole: 'm' }, /missing poster role m/i);
expectFailure('bad-extension', { badExt: true }, /approved image format|poster role m/i);
expectFailure('undersized-l', {}, /poster role l.*1920.*1080|dimensions/i);
expectFailure('missing-provenance', { missingProvenance: true }, /provenance/i);
expectFailure('legacy-svg', { legacySvg: true }, /legacy vector poster|svg/i);
