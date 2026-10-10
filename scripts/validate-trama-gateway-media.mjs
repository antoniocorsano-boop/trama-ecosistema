import { existsSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const roles = ['lim', 's', 'm', 'l'];
const approval = 'IMPLEMENTATION_CANDIDATE_PENDING_HUMAN_REVIEW';
const aspectTolerance = 0.02;
const contract = {
  lim: { minWidth: 960, minHeight: 2700, ratio: 320 / 900 },
  s: { minWidth: 1170, minHeight: 2532, ratio: 390 / 844 },
  m: { minWidth: 1536, minHeight: 2048, ratio: 3 / 4 },
  l: { minWidth: 2560, minHeight: 1440, ratio: 16 / 9 },
};

function readUInt24LE(buffer, offset) {
  return buffer[offset] | (buffer[offset + 1] << 8) | (buffer[offset + 2] << 16);
}

export function readWebpDimensions(path) {
  const buffer = readFileSync(path);
  if (buffer.length < 30 || buffer.toString('ascii', 0, 4) !== 'RIFF' || buffer.toString('ascii', 8, 12) !== 'WEBP') {
    throw new Error(`valid RIFF/WEBP image required: ${path}`);
  }

  let offset = 12;
  while (offset + 8 <= buffer.length) {
    const type = buffer.toString('ascii', offset, offset + 4);
    const size = buffer.readUInt32LE(offset + 4);
    const data = offset + 8;

    if (size < 0 || data + size > buffer.length + 1) {
      throw new Error(`corrupt WebP chunk: ${path}`);
    }
    if (type === 'VP8X' && data + 10 <= buffer.length) {
      return { width: 1 + readUInt24LE(buffer, data + 4), height: 1 + readUInt24LE(buffer, data + 7) };
    }
    if (type === 'VP8 ' && data + 10 <= buffer.length) {
      if (buffer[data + 3] !== 0x9d || buffer[data + 4] !== 0x01 || buffer[data + 5] !== 0x2a) {
        throw new Error(`invalid VP8 frame header: ${path}`);
      }
      return {
        width: buffer.readUInt16LE(data + 6) & 0x3fff,
        height: buffer.readUInt16LE(data + 8) & 0x3fff,
      };
    }
    if (type === 'VP8L' && data + 5 <= buffer.length) {
      if (buffer[data] !== 0x2f) throw new Error(`invalid VP8L frame header: ${path}`);
      const b1 = buffer[data + 1];
      const b2 = buffer[data + 2];
      const b3 = buffer[data + 3];
      const b4 = buffer[data + 4];
      return {
        width: 1 + b1 + ((b2 & 0x3f) << 8),
        height: 1 + ((b2 & 0xc0) >> 6) + (b3 << 2) + ((b4 & 0x0f) << 10),
      };
    }

    offset = data + size + (size % 2);
  }

  throw new Error(`unable to read WebP dimensions: ${path}`);
}

function requireNonEmptyString(entry, key, role) {
  if (typeof entry[key] !== 'string' || entry[key].trim() === '') {
    throw new Error(`provenance role ${role} missing ${key}`);
  }
}

function validateRuntimeConfig(root) {
  const configPath = join(root, 'apps/gateway/src/config/gateway.ts');
  if (!existsSync(configPath)) throw new Error('missing gateway runtime configuration');
  const config = readFileSync(configPath, 'utf8');
  if (config.includes('trama-gateway-poster-')) {
    throw new Error('legacy poster family is forbidden in gateway runtime configuration');
  }
  for (const role of roles) {
    const canonical = `/media/trama-gateway-bg-${role}.webp`;
    if (!config.includes(canonical)) {
      throw new Error(`background role ${role} missing from gateway runtime configuration`);
    }
  }
}

function validateProvenanceEntry(entry, role, dimensions) {
  const expectedPath = `/media/trama-gateway-bg-${role}.webp`;
  for (const key of ['path', 'source', 'artDirection', 'approval', 'date']) {
    requireNonEmptyString(entry, key, role);
  }
  if (entry.path !== expectedPath) throw new Error(`provenance role ${role} path mismatch or legacy poster path`);
  if (entry.approval !== approval) {
    throw new Error(`provenance role ${role} approval must remain ${approval}`);
  }
  if (
    !entry.dimensions ||
    !Number.isInteger(entry.dimensions.width) ||
    !Number.isInteger(entry.dimensions.height) ||
    entry.dimensions.width <= 0 ||
    entry.dimensions.height <= 0
  ) {
    throw new Error(`provenance role ${role} missing valid dimensions`);
  }
  if (entry.dimensions.width !== dimensions.width || entry.dimensions.height !== dimensions.height) {
    throw new Error(`provenance role ${role} dimensions mismatch actual WebP dimensions`);
  }
  if (!entry.encoding || String(entry.encoding.format).toLowerCase() !== 'webp') {
    throw new Error(`provenance role ${role} encoding format must be webp`);
  }
  if (
    entry.encoding.quality !== undefined &&
    (!Number.isFinite(entry.encoding.quality) || entry.encoding.quality < 1 || entry.encoding.quality > 100)
  ) {
    throw new Error(`provenance role ${role} encoding quality must be between 1 and 100`);
  }
  if (entry.identifiablePersons !== false) {
    throw new Error(`provenance role ${role} must explicitly record identifiablePersons false`);
  }
  if (entry.studentData !== false) {
    throw new Error(`provenance role ${role} must explicitly record studentData false`);
  }
  if (entry.uiEmbedded !== false) {
    throw new Error(`provenance role ${role} must explicitly record uiEmbedded false`);
  }
  if (entry.segnoVivoEmbedded !== false) {
    throw new Error(`provenance role ${role} must explicitly record segnoVivoEmbedded false`);
  }
}

function validateDimensions(role, dimensions) {
  const requirement = contract[role];
  if (dimensions.width < requirement.minWidth || dimensions.height < requirement.minHeight) {
    throw new Error(
      `background role ${role} dimensions must be at least ${requirement.minWidth}x${requirement.minHeight}; got ${dimensions.width}x${dimensions.height}`,
    );
  }
  const actualRatio = dimensions.width / dimensions.height;
  const relativeDifference = Math.abs(actualRatio - requirement.ratio) / requirement.ratio;
  if (relativeDifference > aspectTolerance) {
    throw new Error(
      `background role ${role} aspect ratio outside ±2% tolerance; got ${dimensions.width}:${dimensions.height}`,
    );
  }
}

export function validateTramaGatewayMedia(root = process.cwd()) {
  const mediaDir = join(root, 'apps/gateway/public/media');
  const paths = Object.fromEntries(roles.map((role) => [role, join(mediaDir, `trama-gateway-bg-${role}.webp`)]));

  validateRuntimeConfig(root);

  for (const role of roles) {
    if (!existsSync(paths[role])) {
      throw new Error(`missing background role ${role}: expected trama-gateway-bg-${role}.webp`);
    }
  }

  const provenancePath = join(mediaDir, 'trama-gateway-media-provenance.json');
  if (!existsSync(provenancePath)) throw new Error('missing gateway media provenance record');

  let provenance;
  try {
    provenance = JSON.parse(readFileSync(provenancePath, 'utf8'));
  } catch {
    throw new Error('gateway media provenance must be valid JSON');
  }
  if (provenance.version !== 3) throw new Error('gateway media provenance version must be 3');
  if (!Array.isArray(provenance.assets)) throw new Error('gateway media provenance assets must be an array');

  const dimensions = {};
  const byteSizes = {};
  for (const role of roles) {
    dimensions[role] = readWebpDimensions(paths[role]);
    byteSizes[role] = statSync(paths[role]).size;
    validateDimensions(role, dimensions[role]);

    const entries = provenance.assets.filter((asset) => asset.role === role);
    if (entries.length !== 1) throw new Error(`provenance must contain exactly one role ${role}`);
    validateProvenanceEntry(entries[0], role, dimensions[role]);
  }

  return { mediaDir, paths, dimensions, byteSizes, provenance };
}

function parseRoot(argv) {
  const index = argv.indexOf('--root');
  if (index < 0) return process.cwd();
  if (!argv[index + 1]) throw new Error('--root requires a path');
  return resolve(argv[index + 1]);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const result = validateTramaGatewayMedia(parseRoot(process.argv.slice(2)));
    const summary = roles
      .map((role) => {
        const size = result.dimensions[role];
        return `${role.toUpperCase()} ${size.width}x${size.height} ${result.byteSizes[role]}B`;
      })
      .join(', ');
    console.log(`PASS TRAMA gateway background media v3: ${summary}`);
  } catch (error) {
    console.error(`FAIL TRAMA gateway background media v3: ${error.message}`);
    process.exitCode = 1;
  }
}
