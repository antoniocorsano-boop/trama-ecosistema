import type { UserConfig } from 'vite';
import viteConfig from '../vite.config';

describe('Render preview host policy', () => {
  it('allows the canonical public TRAMA Gateway host explicitly', () => {
    const config = viteConfig as UserConfig;

    expect(config.preview?.allowedHosts).toEqual(['trama-gateway.onrender.com']);
    expect(config.preview?.allowedHosts).not.toBe(true);
  });
});
