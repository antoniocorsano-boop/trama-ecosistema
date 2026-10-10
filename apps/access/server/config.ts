export type AccessConfig = {
  nodeEnv: string;
  publicOrigin: string;
  allowedIssuer: string;
  supabaseUrl: string;
  supabasePublishableKey: string;
  supabaseServiceRoleKey: string;
  sessionTtlMs: 28_800_000;
  testHarness: boolean;
};

type Env = Record<string, string | undefined>;

const SESSION_TTL_MS = 28_800_000 as const;

function requireValue(env: Env, key: string): string {
  const value = env[key]?.trim();
  if (!value) throw new Error(`ACCESS_CONFIG_MISSING:${key}`);
  return value;
}

function requireExactHttpsOrigin(value: string): string {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error('ACCESS_CONFIG_INVALID:ACCESS_PUBLIC_ORIGIN');
  }

  if (
    parsed.protocol !== 'https:' ||
    parsed.origin !== value ||
    parsed.pathname !== '/' ||
    parsed.search !== '' ||
    parsed.hash !== '' ||
    parsed.username !== '' ||
    parsed.password !== ''
  ) {
    throw new Error('ACCESS_CONFIG_INVALID:ACCESS_PUBLIC_ORIGIN');
  }

  return value;
}

export function loadAccessConfig(env: Env): AccessConfig {
  const nodeEnv = env.NODE_ENV?.trim() || 'development';
  const production = nodeEnv === 'production';
  const testHarness = env.ACCESS_TEST_HARNESS === '1';

  if (production && testHarness) {
    throw new Error('ACCESS_CONFIG_FORBIDDEN:ACCESS_TEST_HARNESS');
  }

  if (production) {
    const publicOrigin = requireExactHttpsOrigin(requireValue(env, 'ACCESS_PUBLIC_ORIGIN'));
    return {
      nodeEnv,
      publicOrigin,
      allowedIssuer: requireValue(env, 'ACCESS_ALLOWED_ISSUER'),
      supabaseUrl: requireValue(env, 'SUPABASE_URL'),
      supabasePublishableKey: requireValue(env, 'SUPABASE_PUBLISHABLE_KEY'),
      supabaseServiceRoleKey: requireValue(env, 'SUPABASE_SERVICE_ROLE_KEY'),
      sessionTtlMs: SESSION_TTL_MS,
      testHarness: false,
    };
  }

  return {
    nodeEnv,
    publicOrigin: env.ACCESS_PUBLIC_ORIGIN?.trim() || 'http://127.0.0.1:4175',
    allowedIssuer: env.ACCESS_ALLOWED_ISSUER?.trim() || 'https://provider.invalid/auth/v1',
    supabaseUrl: env.SUPABASE_URL?.trim() || 'https://provider.invalid',
    supabasePublishableKey: env.SUPABASE_PUBLISHABLE_KEY?.trim() || 'test-publishable-key',
    supabaseServiceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY?.trim() || 'test-service-role-key',
    sessionTtlMs: SESSION_TTL_MS,
    testHarness,
  };
}
