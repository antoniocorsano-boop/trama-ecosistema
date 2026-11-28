import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { gatewayConfig, resolveGatewayMediaRole, resolveGatewayVisualProfile } from './gateway';

describe('Orizzonte della conoscenza', () => {
  it('only enables the third profile explicitly, never a URL or unknown value', () => {
    expect(resolveGatewayVisualProfile('?ambiente=orizzonte')).toBe('orizzonte');
    expect(resolveGatewayVisualProfile('')).toBe('atelier');
    expect(resolveGatewayVisualProfile('?ambiente=studio-classico')).toBe('studio-classico');
    expect(resolveGatewayVisualProfile('?ambiente=https://example.com')).toBe('atelier');
  });
  it('matches the picture breakpoints exactly', () => {
    for (const [width, role] of [[320, 'lim'], [359, 'lim'], [360, 's'], [599, 's'], [600, 'm'], [1023, 'm'], [1024, 'l'], [1440, 'l']] as const) {
      expect(resolveGatewayMediaRole(width)).toBe(role);
    }
  });
  it('binds only the eight acquired files with exact hashes and expected local paths', () => {
    const manifest = JSON.parse(readFileSync(resolve('media-provenance/orizzonte.json'), 'utf8'));
    expect(manifest.derived).toHaveLength(4);
    expect(manifest.original.sha256).toBe('c5c37853107ca51166f453662a4ccbfd668a020e7cd70ffa0b5a3be0351d458b');
    for (const role of ['lim', 's', 'm', 'l'] as const) {
      const entry = manifest.derived.find((item: { profile: string }) => item.profile === role.toUpperCase());
      expect(entry).toBeDefined();
      const video = gatewayConfig.historicalVideo[role];
      const poster = gatewayConfig.historicalBackground[role];
      expect(video).toBe(`/media/orizzonte-${role.toUpperCase()}.mp4`);
      expect(poster).toBe(`/media/orizzonte-${role.toUpperCase()}.webp`);
      for (const [url, digest, bytes] of [[video, entry.sha256, entry.bytes], [poster, entry.poster_sha256, entry.poster_bytes]]) {
        const data = readFileSync(resolve('public', url.slice(1)));
        expect(data.length).toBe(bytes);
        expect(createHash('sha256').update(data).digest('hex')).toBe(digest);
      }
    }
  });
});
