import { describe, expect, it } from 'vitest';
import { gatewayConfig } from './gateway';

describe('gatewayConfig poster contract', () => {
  it('exposes governed S/M/L photographic poster roles', () => {
    const poster = (gatewayConfig as unknown as {
      poster?: { s?: string; m?: string; l?: string };
    }).poster;

    expect(poster).toBeDefined();
    expect(poster?.s ?? '').toMatch(/poster-s\.webp$/);
    expect(poster?.m ?? '').toMatch(/poster-m\.webp$/);
    expect(poster?.l ?? '').toMatch(/poster-l\.webp$/);
    expect(Object.values(poster ?? {}).every((src) => !src.endsWith('.svg'))).toBe(true);
  });

  it('keeps the configured entry destination explicit', () => {
    expect(gatewayConfig.entryHref).toBeTruthy();
  });
});
