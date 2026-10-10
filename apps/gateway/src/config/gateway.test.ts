import { describe, expect, it } from 'vitest';
import { gatewayConfig } from './gateway';

describe('gatewayConfig background contract', () => {
  it('exposes governed LIM/S/M/L background roles and no canonical legacy poster reference', () => {
    const background = (gatewayConfig as unknown as {
      background?: { lim?: string; s?: string; m?: string; l?: string };
    }).background;

    expect(background).toBeDefined();
    expect(Object.keys(background ?? {}).sort()).toEqual(['l', 'lim', 'm', 's']);
    expect(background?.lim ?? '').toMatch(/trama-gateway-bg-lim\.webp$/);
    expect(background?.s ?? '').toMatch(/trama-gateway-bg-s\.webp$/);
    expect(background?.m ?? '').toMatch(/trama-gateway-bg-m\.webp$/);
    expect(background?.l ?? '').toMatch(/trama-gateway-bg-l\.webp$/);
    expect(Object.values(background ?? {}).every((src) => src.endsWith('.webp'))).toBe(true);
    expect(JSON.stringify(gatewayConfig)).not.toContain('trama-gateway-poster-');
  });

  it('binds the current desktop treatment to the approved L v3 visual revision', () => {
    expect((gatewayConfig as { visualRevision?: string }).visualRevision).toBe('approved-l-v3');
  });

  it('keeps the configured entry destination explicit', () => {
    expect(gatewayConfig.entryHref).toBeTruthy();
  });
});
