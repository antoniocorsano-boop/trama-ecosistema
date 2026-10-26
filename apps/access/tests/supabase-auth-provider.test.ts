import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { SupabaseAuthProvider } from '../src/infrastructure/supabase/supabase-auth-provider.ts';

const projectUrl = 'https://project-ref.supabase.co';
const issuer = `${projectUrl}/auth/v1`;
const publishableKey = 'sb_publishable_test_only';
const verifier = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_';

function challenge(value: string): string {
  return createHash('sha256').update(value).digest('base64url');
}

function providerWith(fetchImpl: typeof fetch) {
  return new SupabaseAuthProvider({
    issuer,
    projectUrl,
    publishableKey,
    fetchImpl,
    availabilityProbe: async () => true,
  });
}

test('SupabaseAuthProvider requests default-template Magic Link as PKCE with create_user false', async () => {
  let capturedUrl = '';
  let capturedInit: RequestInit | undefined;
  const provider = providerWith(async (input, init) => {
    capturedUrl = String(input);
    capturedInit = init;
    return new Response('{}', { status: 200, headers: { 'content-type': 'application/json' } });
  });

  await provider.requestEmailMagicLink({
    email: 'pilot@example.test',
    redirectTo: 'https://access.example.test/auth/confirm',
    codeVerifier: verifier,
    signal: new AbortController().signal,
  });

  const url = new URL(capturedUrl);
  assert.equal(url.origin + url.pathname, `${projectUrl}/auth/v1/otp`);
  assert.equal(url.searchParams.get('redirect_to'), 'https://access.example.test/auth/confirm');
  const headers = new Headers(capturedInit?.headers);
  assert.equal(headers.get('apikey'), publishableKey);
  assert.equal(headers.has('authorization'), false, 'publishable request must not invent a provider session bearer');
  const body = JSON.parse(String(capturedInit?.body));
  assert.equal(body.email, 'pilot@example.test');
  assert.equal(body.create_user, false);
  assert.equal(body.code_challenge_method, 's256');
  assert.equal(body.code_challenge, challenge(verifier));
});

test('SupabaseAuthProvider exchanges PKCE auth code with the exact verifier and clears transient provider session', async () => {
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  const provider = providerWith(async (input, init) => {
    const url = String(input);
    calls.push({ url, init });
    if (url.includes('/token?grant_type=pkce')) {
      return new Response(JSON.stringify({
        access_token: 'access-secret',
        refresh_token: 'refresh-secret',
        user: { id: 'provider-subject-1', email: 'pilot@example.test' },
      }), { status: 200, headers: { 'content-type': 'application/json' } });
    }
    if (url.includes('/logout')) return new Response(null, { status: 204 });
    throw new Error(`unexpected request ${url}`);
  });

  const result = await provider.verifyEmailMagicLink({
    code: '009e5066-fc11-4eca-8c8c-6fd82aa263f2',
    codeVerifier: verifier,
    signal: new AbortController().signal,
  });

  assert.deepEqual(result, { issuer, subject: 'provider-subject-1', verifiedEmail: 'pilot@example.test' });
  const exchange = calls.find((call) => call.url.includes('/token?grant_type=pkce'));
  assert.ok(exchange);
  assert.deepEqual(JSON.parse(String(exchange.init?.body)), {
    auth_code: '009e5066-fc11-4eca-8c8c-6fd82aa263f2',
    code_verifier: verifier,
  });
  const logout = calls.find((call) => call.url.includes('/logout'));
  assert.ok(logout, 'transient Supabase session must be revoked best-effort after identity reduction');
  const logoutHeaders = new Headers(logout.init?.headers);
  assert.equal(logoutHeaders.get('authorization'), 'Bearer access-secret');
  assert.equal(logoutHeaders.get('apikey'), publishableKey);
  assert.equal(JSON.stringify(result).includes('access-secret'), false);
  assert.equal(JSON.stringify(result).includes('refresh-secret'), false);
});

test('SupabaseAuthProvider keeps best-effort logout outside verification deadline with its own bounded signal', async () => {
  const caller = new AbortController();
  let logoutSignal: AbortSignal | null = null;
  let resolveCleanupAbort!: () => void;
  const cleanupAborted = new Promise<void>((resolve) => { resolveCleanupAbort = resolve; });

  const provider = providerWith(async (input, init) => {
    const url = String(input);
    if (url.includes('/token?grant_type=pkce')) {
      return new Response(JSON.stringify({
        access_token: 'access-secret',
        user: { id: 'provider-subject-1', email: 'pilot@example.test' },
      }), { status: 200, headers: { 'content-type': 'application/json' } });
    }
    if (url.includes('/logout')) {
      logoutSignal = init?.signal ?? null;
      return await new Promise<Response>((resolve) => {
        logoutSignal?.addEventListener('abort', () => {
          resolveCleanupAbort();
          resolve(new Response(null, { status: 204 }));
        }, { once: true });
      });
    }
    throw new Error(`unexpected request ${url}`);
  });

  const verification = provider.verifyEmailMagicLink({
    code: '009e5066-fc11-4eca-8c8c-6fd82aa263f2',
    codeVerifier: verifier,
    signal: caller.signal,
  });
  const outcome = await Promise.race([
    verification,
    new Promise<'TIMEOUT'>((resolve) => setTimeout(() => resolve('TIMEOUT'), 100)),
  ]);

  assert.notEqual(outcome, 'TIMEOUT', 'verified identity must not await best-effort provider logout');
  assert.deepEqual(outcome, { issuer, subject: 'provider-subject-1', verifiedEmail: 'pilot@example.test' });
  assert.ok(logoutSignal, 'cleanup must still be attempted');
  assert.notEqual(logoutSignal, caller.signal, 'cleanup must not reuse the verification deadline signal');

  const bounded = await Promise.race([
    cleanupAborted.then(() => true),
    new Promise<false>((resolve) => setTimeout(() => resolve(false), 1500)),
  ]);
  assert.equal(bounded, true, 'cleanup signal must abort within a finite independent budget');
});

test('SupabaseAuthProvider verifies token hash and clears returned transient provider session', async () => {
  const calls: string[] = [];
  const provider = providerWith(async (input, init) => {
    const url = String(input);
    calls.push(url);
    if (url.endsWith('/auth/v1/verify')) {
      assert.deepEqual(JSON.parse(String(init?.body)), { token_hash: 'token-hash', type: 'email' });
      return new Response(JSON.stringify({
        access_token: 'token-hash-access',
        user: { id: 'provider-subject-2', email: 'pilot@example.test' },
      }), { status: 200, headers: { 'content-type': 'application/json' } });
    }
    if (url.includes('/logout')) return new Response(null, { status: 204 });
    throw new Error(`unexpected request ${url}`);
  });

  const result = await provider.verifyEmailMagicLink({
    tokenHash: 'token-hash',
    type: 'email',
    signal: new AbortController().signal,
  });
  assert.deepEqual(result, { issuer, subject: 'provider-subject-2', verifiedEmail: 'pilot@example.test' });
  assert.equal(calls.filter((url) => url.includes('/logout')).length, 1);
});

test('SupabaseAuthProvider fails closed and revokes transient session when callback returns no user', async () => {
  let logoutCount = 0;
  const provider = providerWith(async (input) => {
    const url = String(input);
    if (url.includes('/token?grant_type=pkce')) {
      return new Response(JSON.stringify({ access_token: 'transient', user: null }), { status: 200, headers: { 'content-type': 'application/json' } });
    }
    if (url.includes('/logout')) {
      logoutCount += 1;
      return new Response(null, { status: 204 });
    }
    throw new Error(`unexpected request ${url}`);
  });

  await assert.rejects(
    () => provider.verifyEmailMagicLink({ code: '009e5066-fc11-4eca-8c8c-6fd82aa263f2', codeVerifier: verifier, signal: new AbortController().signal }),
    /PROVIDER_IDENTITY_INVALID/,
  );
  assert.equal(logoutCount, 1, 'transient provider token must be revoked even when identity reduction fails');
});

test('SupabaseAuthProvider maps request and callback failures to stable internal errors', async () => {
  const provider = providerWith(async () => new Response(JSON.stringify({ message: 'provider detail must not escape' }), { status: 400, headers: { 'content-type': 'application/json' } }));

  await assert.rejects(
    () => provider.requestEmailMagicLink({ email: 'pilot@example.test', redirectTo: 'https://access.example.test/auth/confirm', codeVerifier: verifier, signal: new AbortController().signal }),
    (error: Error) => error.message === 'PROVIDER_UNAVAILABLE',
  );
  await assert.rejects(
    () => provider.verifyEmailMagicLink({ code: '009e5066-fc11-4eca-8c8c-6fd82aa263f2', codeVerifier: verifier, signal: new AbortController().signal }),
    (error: Error) => error.message === 'MAGIC_LINK_INVALID',
  );
});

test('SupabaseAuthProvider supplies caller AbortSignal directly to PKCE transport', async () => {
  let fetchCount = 0;
  const provider = providerWith(async (_input, init) => {
    fetchCount += 1;
    assert.equal(init?.signal?.aborted, true);
    throw new DOMException('Aborted', 'AbortError');
  });
  const controller = new AbortController();
  controller.abort();

  await assert.rejects(() => provider.requestEmailMagicLink({ email: 'pilot@example.test', redirectTo: 'https://access.example.test/auth/confirm', codeVerifier: verifier, signal: controller.signal }));
  assert.equal(fetchCount, 0, 'already-aborted work must fail before network transport');
});
