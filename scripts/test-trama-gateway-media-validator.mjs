import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const validator = resolve('scripts/validate-trama-gateway-media.mjs');
assert.equal(existsSync(validator), true, 'validator script must exist before fixture checks can run');

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

function makeFixture({
  missingRole,
  corruptRole,
  version = 3,
  dimensions = {},
  provenanceDimensions = {},
  pathOverrides = {},
  entryOverrides = {},
  legacyConfig = false,
} = {}) {
  const root = mkdtempSync(join(tmpdir(), 'trama-media-v3-'));
  const media = join(root, 'apps/gateway/public/media');
  const configDir = join(root, 'apps/gateway/src/config');
  mkdirSync(media, { recursive: true });
  mkdirSync(configDir, { recursive: true });

  const actual = {};
  for (const role of ROLES) {
    const roleDimensions = dimensions[role] ?? REQUIRED[role];
    actual[role] = roleDimensions;
    if (role === missingRole) continue;
    writeFileSync(
      join(media, `trama-gateway-bg-${role}.webp`),
      role === corruptRole ? Buffer.from('not-a-webp') : makeWebp(roleDimensions.width, roleDimensions.height),
    );
  }

  const backgroundConfig = legacyConfig
    ? "poster: { s: '/media/trama-gateway-poster-s.webp', m: '/media/trama-gateway-poster-m.webp', l: '/media/trama-gateway-poster-l.webp' }"
    : `background: { lim: '/media/trama-gateway-bg-lim.webp', s: '/media/trama-gateway-bg-s.webp', m: '/media/trama-gateway-bg-m.webp', l: '/media/trama-gateway-bg-l.webp' }`;
  writeFileSync(join(configDir, 'gateway.ts'), `export const gatewayConfig = { ${backgroundConfig} };\n`);

  const assets = ROLES.map((role) => {
    const recorded = provenanceDimensions[role] ?? actual[role];
    return {
      path: pathOverrides[role] ?? `/media/trama-gateway-bg-${role}.webp`,
      role,
      dimensions: { width: recorded.width, height: recorded.height },
      source: 'native test fixture',
      artDirection: `independent ${role} composition`,
      encoding: { format: 'webp', quality: 90 },
      approval: 'IMPLEMENTATION_CANDIDATE_PENDING_HUMAN_REVIEW',
      date: '2026-10-10',
      identifiablePersons: false,
      studentData: false,
      uiEmbedded: false,
      segnoVivoEmbedded: false,
      ...(entryOverrides[role] ?? {}),
    };
  });

  writeFileSync(
    join(media, 'trama-gateway-media-provenance.json'),
    `${JSON.stringify({ version, assets }, null, 2)}\n`,
  );
  return root;
}

function run(root) {
  return spawnSync(process.execPath, [validator, '--root', root], { encoding: 'utf8' });
}

function withFixture(options, assertion) {
  const root = makeFixture(options);
  try {
    assertion(run(root));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

function expectFailure(name, options, pattern) {
  withFixture(options, (result) => {
    assert.notEqual(result.status, 0, `${name}: expected failure`);
    assert.match(`${result.stdout}\n${result.stderr}`, pattern, `${name}: wrong diagnostic`);
    console.log(`PASS ${name}`);
  });
}

function expectPass(name, options = {}) {
  withFixture(options, (result) => {
    assert.equal(result.status, 0, `${name}: expected PASS\n${result.stdout}\n${result.stderr}`);
    console.log(`PASS ${name}`);
  });
}

expectFailure('missing-lim-role', { missingRole: 'lim' }, /missing (background )?role lim|lim.*missing/i);
expectFailure('corrupt-webp', { corruptRole: 'm' }, /webp|image format|riff/i);
expectFailure('provenance-version', { version: 2 }, /version.*3|provenance.*3/i);
expectFailure(
  'legacy-provenance-path',
  { pathOverrides: { s: '/media/trama-gateway-poster-s.webp' } },
  /path mismatch|legacy|poster/i,
);
expectFailure('legacy-runtime-config', { legacyConfig: true }, /legacy|poster|background.*config/i);

for (const role of ROLES) {
  expectFailure(
    `undersized-${role}`,
    { dimensions: { [role]: { width: REQUIRED[role].width - 1, height: REQUIRED[role].height } } },
    new RegExp(`${role}.*dimensions|dimensions.*${role}`, 'i'),
  );
}

expectFailure(
  'aspect-ratio-outside-tolerance',
  { dimensions: { m: { width: 1600, height: 2048 } } },
  /m.*aspect|aspect.*m|ratio/i,
);
expectFailure(
  'provenance-dimensions-mismatch',
  { provenanceDimensions: { l: { width: 3000, height: 1440 } } },
  /dimensions.*mismatch|mismatch.*dimensions/i,
);
expectFailure(
  'identifiable-persons-must-be-false',
  { entryOverrides: { s: { identifiablePersons: true } } },
  /identifiable persons|identifiablePersons|privacy/i,
);
expectFailure(
  'student-data-must-be-false',
  { entryOverrides: { m: { studentData: true } } },
  /student data|studentData|privacy/i,
);
expectFailure(
  'ui-embedded-must-be-false',
  { entryOverrides: { l: { uiEmbedded: true } } },
  /ui.*embedded|uiEmbedded/i,
);
expectFailure(
  'segno-vivo-embedded-must-be-false',
  { entryOverrides: { lim: { segnoVivoEmbedded: true } } },
  /segno.*vivo|segnoVivoEmbedded/i,
);
expectPass('four-role-v3-positive');
