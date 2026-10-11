import test from 'node:test';
import assert from 'node:assert/strict';
import { createAccessRuntime } from '../src/server/runtime.ts';
import { SupabaseAuthProvider } from '../src/infrastructure/supabase/supabase-auth-provider.ts';
import { SupabaseIdentityRepository } from '../src/infrastructure/supabase/supabase-identity-repository.ts';
import { SupabaseSessionStore } from '../src/infrastructure/supabase/supabase-session-store.ts';
import { SupabaseRateLimiter } from '../src/infrastructure/supabase/supabase-rate-limiter.ts';

const secret = 'sb_secret_test_value_that_must_never_escape';
const publishable = 'sb_publishable_test_value_for_auth_only';
const baseEnv: NodeJS.ProcessEnv = {
  NODE_ENV: 'production',
  ACCESS_ORIGIN: 'https://access.trama.test',
  ACCESS_PROVIDER_KIND: 'supabase',
  ACCESS_STORE_KIND: 'supabase',
  ACCESS_SUPABASE_URL: 'https://project-ref.supabase.co',
  ACCESS_SUPABASE_SECRET_KEY: secret,
  ACCESS_SUPABASE_PUBLISHABLE_KEY: publishable,
};

test('live runtime fails closed when Supabase URL, secret or publishable key is absent', () => {
  assert.throws(() => createAccessRuntime({ ...baseEnv, ACCESS_SUPABASE_URL: undefined }), /SUPABASE_CONFIG_MISSING/);
  assert.throws(() => createAccessRuntime({ ...baseEnv, ACCESS_SUPABASE_SECRET_KEY: undefined }), /SUPABASE_CONFIG_MISSING/);
  assert.throws(() => createAccessRuntime({ ...baseEnv, ACCESS_SUPABASE_PUBLISHABLE_KEY: undefined }), /SUPABASE_CONFIG_MISSING/);
});

test('live runtime rejects a secret key placed in the publishable-key slot before constructing transport', () => {
  assert.throws(
    () => createAccessRuntime({ ...baseEnv, ACCESS_SUPABASE_PUBLISHABLE_KEY: secret }),
    (error: Error) => error.message === 'SUPABASE_PUBLISHABLE_KEY_INVALID' && !error.message.includes(secret),
  );
});

test('live runtime requires an https Supabase project URL and never exposes keys in config/errors', () => {
  assert.throws(
    () => createAccessRuntime({ ...baseEnv, ACCESS_SUPABASE_URL: 'http://project-ref.supabase.co' }),
    (error: Error) => error.message === 'SUPABASE_URL_INVALID' && !error.message.includes(secret) && !error.message.includes(publishable),
  );
  const runtime = createAccessRuntime(baseEnv, async () => new Response('{}', { status: 200 }));
  const serialized = JSON.stringify(runtime.config);
  assert.equal(serialized.includes(secret), false);
  assert.equal(serialized.includes(publishable), false);
});

test('supabase plus supabase constructs only the live adapters', () => {
  const runtime = createAccessRuntime(baseEnv, async () => new Response('{}', { status: 200 }));
  assert.ok(runtime.authProvider instanceof SupabaseAuthProvider);
  assert.ok(runtime.identityRepository instanceof SupabaseIdentityRepository);
  assert.ok(runtime.sessionStore instanceof SupabaseSessionStore);
  assert.ok(runtime.rateLimiter instanceof SupabaseRateLimiter);
});

test('live availability probe targets Auth health with publishable apikey only and is abortable', async () => {
  const seen: Array<{
    url: string;
    method: string;
    signal: AbortSignal | null;
    apikey: string | null;
    authorization: string | null;
  }> = [];
  const fetchImpl: typeof fetch = async (input, init) => {
    const headers = new Headers(init?.headers);
    seen.push({
      url: String(input),
      method: init?.method ?? 'GET',
      signal: init?.signal ?? null,
      apikey: headers.get('apikey'),
      authorization: headers.get('authorization'),
    });
    if (init?.signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    return new Response('{"name":"GoTrue"}', { status: 200, headers: { 'content-type': 'application/json' } });
  };
  const runtime = createAccessRuntime(baseEnv, fetchImpl);
  const controller = new AbortController();
  assert.equal(await runtime.authProvider.checkAvailability({ signal: controller.signal }), true);
  assert.equal(seen.length, 1);
  assert.equal(seen[0]?.url, 'https://project-ref.supabase.co/auth/v1/health');
  assert.equal(seen[0]?.method, 'GET');
  assert.equal(seen[0]?.signal, controller.signal);
  assert.equal(seen[0]?.apikey, publishable);
  assert.equal(seen[0]?.authorization, null);

  controller.abort();
  assert.equal(await runtime.authProvider.checkAvailability({ signal: controller.signal }), false);
});
