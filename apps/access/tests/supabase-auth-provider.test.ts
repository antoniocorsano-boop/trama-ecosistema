import test from 'node:test';
import assert from 'node:assert/strict';
import { SupabaseAuthProvider } from '../src/infrastructure/supabase/supabase-auth-provider.ts';

type SignalClient = {
  auth: {
    signInWithOtp(input: { email: string; options: { shouldCreateUser: boolean; emailRedirectTo: string } }): Promise<{ data: unknown; error: null | { message: string } }>;
    exchangeCodeForSession(code: string): Promise<{
      data: { user: null | { id: string; email?: string | null }; session?: { access_token?: string; refresh_token?: string } | null };
      error: null | { message: string };
    }>;
    verifyOtp(input: { token_hash: string; type: 'email' | 'magiclink' | 'signup' | 'invite' | 'recovery' | 'email_change' }): Promise<{
      data: { user: null | { id: string; email?: string | null }; session?: { access_token?: string; refresh_token?: string } | null };
      error: null | { message: string };
    }>;
    signOut(): Promise<{ error: null | { message: string } }>;
  };
};

function providerWith(factory: (signal: AbortSignal) => SignalClient) {
  return new SupabaseAuthProvider({
    issuer: 'https://project-ref.supabase.co/auth/v1',
    createClientForSignal: factory,
    availabilityProbe: async () => true,
  });
}

test('SupabaseAuthProvider requests Magic Link with redirect and shouldCreateUser false', async () => {
  let captured: unknown;
  const provider = providerWith(() => ({
    auth: {
      async signInWithOtp(input) { captured = input; return { data: { user: null, session: null }, error: null }; },
      async exchangeCodeForSession() { throw new Error('unused'); },
      async verifyOtp() { throw new Error('unused'); },
      async signOut() { return { error: null }; },
    },
  }));

  await provider.requestEmailMagicLink({
    email: 'pilot@example.test',
    redirectTo: 'https://access.example.test/auth/confirm',
    signal: new AbortController().signal,
  });
  assert.deepEqual(captured, {
    email: 'pilot@example.test',
    options: {
      shouldCreateUser: false,
      emailRedirectTo: 'https://access.example.test/auth/confirm',
    },
  });
});

test('SupabaseAuthProvider verifies PKCE code and reduces provider payload to governed identity', async () => {
  const provider = providerWith(() => ({
    auth: {
      async signInWithOtp() { throw new Error('unused'); },
      async exchangeCodeForSession(code) {
        assert.equal(code, 'pkce-code');
        return {
          data: {
            user: { id: 'provider-subject-1', email: 'pilot@example.test' },
            session: { access_token: 'access-secret', refresh_token: 'refresh-secret' },
          },
          error: null,
        };
      },
      async verifyOtp() { throw new Error('unused'); },
      async signOut() { return { error: null }; },
    },
  }));

  const result = await provider.verifyEmailMagicLink({ code: 'pkce-code', signal: new AbortController().signal });
  assert.deepEqual(result, {
    issuer: 'https://project-ref.supabase.co/auth/v1',
    subject: 'provider-subject-1',
    verifiedEmail: 'pilot@example.test',
  });
  assert.equal(JSON.stringify(result).includes('access-secret'), false);
  assert.equal(JSON.stringify(result).includes('refresh-secret'), false);
});

test('SupabaseAuthProvider verifies token hash callback and reduces provider payload to governed identity', async () => {
  const provider = providerWith(() => ({
    auth: {
      async signInWithOtp() { throw new Error('unused'); },
      async exchangeCodeForSession() { throw new Error('unused'); },
      async verifyOtp(input) {
        assert.deepEqual(input, { token_hash: 'token-hash', type: 'magiclink' });
        return {
          data: {
            user: { id: 'provider-subject-2', email: 'pilot@example.test' },
            session: { access_token: 'must-not-leak' },
          },
          error: null,
        };
      },
      async signOut() { return { error: null }; },
    },
  }));

  const result = await provider.verifyEmailMagicLink({
    tokenHash: 'token-hash',
    type: 'magiclink',
    signal: new AbortController().signal,
  });
  assert.deepEqual(result, {
    issuer: 'https://project-ref.supabase.co/auth/v1',
    subject: 'provider-subject-2',
    verifiedEmail: 'pilot@example.test',
  });
  assert.equal(JSON.stringify(result).includes('must-not-leak'), false);
});

test('SupabaseAuthProvider clears the transient provider session on the same callback client', async () => {
  let signOutCount = 0;
  const provider = providerWith(() => ({
    auth: {
      async signInWithOtp() { throw new Error('unused'); },
      async exchangeCodeForSession() {
        return {
          data: {
            user: { id: 'provider-subject-3', email: 'pilot@example.test' },
            session: { access_token: 'transient-only', refresh_token: 'transient-refresh' },
          },
          error: null,
        };
      },
      async verifyOtp() { throw new Error('unused'); },
      async signOut() { signOutCount += 1; return { error: null }; },
    },
  }));

  await provider.verifyEmailMagicLink({ code: 'pkce-code', signal: new AbortController().signal });
  assert.equal(signOutCount, 1, 'verified provider session must be cleared before returning governed identity');
});

test('SupabaseAuthProvider fails closed when callback returns no user', async () => {
  const provider = providerWith(() => ({
    auth: {
      async signInWithOtp() { throw new Error('unused'); },
      async exchangeCodeForSession() { return { data: { user: null, session: null }, error: null }; },
      async verifyOtp() { throw new Error('unused'); },
      async signOut() { return { error: null }; },
    },
  }));

  await assert.rejects(
    () => provider.verifyEmailMagicLink({ code: 'pkce-code', signal: new AbortController().signal }),
    /PROVIDER_IDENTITY_INVALID/,
  );
});

test('SupabaseAuthProvider maps request and callback failures to stable internal errors', async () => {
  const provider = providerWith(() => ({
    auth: {
      async signInWithOtp() { return { data: null, error: { message: 'provider detail must not escape' } }; },
      async exchangeCodeForSession() { return { data: { user: null, session: null }, error: { message: 'provider detail must not escape' } }; },
      async verifyOtp() { return { data: { user: null, session: null }, error: { message: 'provider detail must not escape' } }; },
      async signOut() { return { error: null }; },
    },
  }));

  await assert.rejects(
    () => provider.requestEmailMagicLink({ email: 'pilot@example.test', redirectTo: 'https://access.example.test/auth/confirm', signal: new AbortController().signal }),
    (error: Error) => error.message === 'PROVIDER_UNAVAILABLE',
  );
  await assert.rejects(
    () => provider.verifyEmailMagicLink({ code: 'bad-code', signal: new AbortController().signal }),
    (error: Error) => error.message === 'MAGIC_LINK_INVALID',
  );
});

test('SupabaseAuthProvider supplies caller AbortSignal to request-scoped clients', async () => {
  const seen: AbortSignal[] = [];
  const provider = providerWith((signal) => {
    seen.push(signal);
    return {
      auth: {
        async signInWithOtp() { if (signal.aborted) throw new DOMException('Aborted', 'AbortError'); return { data: null, error: null }; },
        async exchangeCodeForSession() { if (signal.aborted) throw new DOMException('Aborted', 'AbortError'); return { data: { user: { id: 'subject' }, session: null }, error: null }; },
        async verifyOtp() { if (signal.aborted) throw new DOMException('Aborted', 'AbortError'); return { data: { user: { id: 'subject' }, session: null }, error: null }; },
        async signOut() { return { error: null }; },
      },
    };
  });
  const controller = new AbortController();
  controller.abort();

  await assert.rejects(() => provider.requestEmailMagicLink({ email: 'pilot@example.test', redirectTo: 'https://access.example.test/auth/confirm', signal: controller.signal }));
  assert.equal(seen.length, 1);
  assert.equal(seen[0], controller.signal);
});
