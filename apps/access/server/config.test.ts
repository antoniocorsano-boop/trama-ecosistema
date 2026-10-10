import { describe, expect, it } from 'vitest';
import { loadAccessConfig } from './config';

const productionEnv = {
  NODE_ENV: 'production',
  ACCESS_PUBLIC_ORIGIN: 'https://trama-access.example',
  ACCESS_ALLOWED_ISSUER: 'https://project-ref.supabase.co/auth/v1',
  SUPABASE_URL: 'https://project-ref.supabase.co',
  SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_test',
  SUPABASE_SERVICE_ROLE_KEY: 'service-role-test',
} as const;

describe('loadAccessConfig', () => {
  it.each([
    'ACCESS_PUBLIC_ORIGIN',
    'ACCESS_ALLOWED_ISSUER',
    'SUPABASE_URL',
    'SUPABASE_PUBLISHABLE_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
  ] as const)('fails closed in production when %s is missing', (requiredKey) => {
    const env = { ...productionEnv } as Record<string, string | undefined>;
    delete env[requiredKey];

    expect(() => loadAccessConfig(env)).toThrow(requiredKey);
  });

  it('requires an exact https public origin in production', () => {
    expect(() =>
      loadAccessConfig({ ...productionEnv, ACCESS_PUBLIC_ORIGIN: 'http://trama-access.example' }),
    ).toThrow('ACCESS_PUBLIC_ORIGIN');

    expect(() =>
      loadAccessConfig({ ...productionEnv, ACCESS_PUBLIC_ORIGIN: 'https://trama-access.example/path' }),
    ).toThrow('ACCESS_PUBLIC_ORIGIN');
  });

  it('pins the absolute non-sliding session TTL to eight hours', () => {
    expect(loadAccessConfig(productionEnv).sessionTtlMs).toBe(28_800_000);
  });

  it('rejects the deterministic test harness in production', () => {
    expect(() => loadAccessConfig({ ...productionEnv, ACCESS_TEST_HARNESS: '1' })).toThrow(
      'ACCESS_TEST_HARNESS',
    );
  });

  it('does not expose product destination URLs from runtime configuration', () => {
    const config = loadAccessConfig({
      ...productionEnv,
      DOCENTE_OS_URL: 'https://docente-os.example',
      ARENA_URL: 'https://arena.example',
    });

    expect(config).not.toHaveProperty('docenteOsUrl');
    expect(config).not.toHaveProperty('arenaUrl');
    expect(JSON.stringify(config)).not.toContain('docente-os.example');
    expect(JSON.stringify(config)).not.toContain('arena.example');
  });
});
