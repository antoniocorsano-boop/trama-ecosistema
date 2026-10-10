import { describe, expect, it } from 'vitest';
import { accessIdentity } from './identity';

describe('TRAMA Access parent identity binding', () => {
  it('uses the governed parent palette and typography without Gateway-only glass/media scope', () => {
    expect(accessIdentity.policyRef).toBe('TRAMA-PARENT-IDENTITY@1.0.0');
    expect(accessIdentity.colors).toEqual({
      background: '201 100% 13%',
      foreground: '0 0% 100%',
      mutedForeground: '240 4% 66%',
      primary: '0 0% 100%',
      primaryForeground: '0 0% 4%',
      secondary: '0 0% 10%',
      muted: '0 0% 10%',
      accent: '0 0% 10%',
      border: '0 0% 18%',
      input: '0 0% 18%',
    });
    expect(accessIdentity.fonts).toEqual({ display: 'Instrument Serif', body: 'Inter' });
    expect(accessIdentity.warmAccentRole).toBe('subordinate-material-accent');
    expect(accessIdentity).not.toHaveProperty('glass');
    expect(accessIdentity).not.toHaveProperty('media');
  });
});
