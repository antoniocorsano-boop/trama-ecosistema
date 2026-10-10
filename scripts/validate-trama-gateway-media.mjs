import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const roles = ['s', 'm', 'l'];

function readUInt24LE(buffer, offset) {
  return buffer[offset] | (buffer[offset + 1] << 8) | (buffer[offset + 2] << 16);
}

export function readWebpDimensions(path) {
  const buffer = readFileSync(path);
  if (buffer.length < 30 || buffer.toString('ascii', 0, 4) !== 'RIFF' || buffer.toString('ascii', 8, 12) !== 'WEBP') {
    throw new Error(`approved image format required: ${path}`);
  }

  let offset = 12;
  while (offset + 8 <= buffer.length) {
    const type = buffer.toString('ascii', offset, offset + 4);
    const size = buffer.readUInt32LE(offset + 4);
    const data = offset + 8;

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

export function validateTramaGatewayMedia(root = process.cwd()) {
  const mediaDir = join(root, 'apps/gateway/public/media');
  const paths = Object.fromEntries(roles.map((role) => [role, join(mediaDir, `trama-gateway-poster-${role}.webp`)]));

  for (const role of roles) {
    if (!existsSync(paths[role])) throw new Error(`missing poster role ${role}: expected trama-gateway-poster-${role}.webp`);
  }

  const provenancePath = join(mediaDir, 'trama-gateway-media-provenance.json');
  if (!existsSync(provenancePath)) throw new Error('missing gateway media provenance record');
  if (existsSync(join(mediaDir, 'trama-gateway-poster.svg'))) {
    throw new Error('legacy vector poster SVG is forbidden in the canonical production media path');
  }

  let provenance;
  try {
    provenance = JSON.parse(readFileSync(provenancePath, 'utf8'));
  } catch {
    throw new Error('gateway media provenance must be valid JSON');
  }
  if (!Array.isArray(provenance.assets)) throw new Error('gateway media provenance assets must be an array');

  for (const role of roles) {
    const entry = provenance.assets.find((asset) => asset.role === role);
    if (!entry) throw new Error(`provenance missing role ${role}`);
    for (const key of ['path', 'source', 'approval', 'date']) {
      if (typeof entry[key] !== 'string' || entry[key].trim() === '') {
        throw new Error(`provenance role ${role} missing ${key}`);
      }
    }
    if (entry.path !== `/media/trama-gateway-poster-${role}.webp`) {
      throw new Error(`provenance role ${role} path mismatch`);
    }
    if (entry.identifiablePersons !== false || entry.studentData !== false) {
      throw new Error(`provenance role ${role} must explicitly record no identifiable persons/student data`);
    }
  }

  const dimensions = Object.fromEntries(roles.map((role) => [role, readWebpDimensions(paths[role])]));
  if (dimensions.l.width < 1920 || dimensions.l.height < 1080) {
    throw new Error(`poster role l dimensions must be at least 1920x1080; got ${dimensions.l.width}x${dimensions.l.height}`);
  }

  return { mediaDir, paths, dimensions, provenance };
}

function parseRoot(argv) {
  const index = argv.indexOf('--root');
  return index >= 0 ? resolve(argv[index + 1]) : process.cwd();
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const result = validateTramaGatewayMedia(parseRoot(process.argv.slice(2)));
    console.log(`PASS TRAMA gateway media: S ${result.dimensions.s.width}x${result.dimensions.s.height}, M ${result.dimensions.m.width}x${result.dimensions.m.height}, L ${result.dimensions.l.width}x${result.dimensions.l.height}`);
  } catch (error) {
    console.error(`FAIL TRAMA gateway media: ${error.message}`);
    process.exitCode = 1;
  }
}
