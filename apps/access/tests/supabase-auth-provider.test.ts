import test from 'node:test';
import assert from 'node:assert/strict';
import { SupabaseAuthProvider } from '../src/infrastructure/supabase/supabase-auth-provider.ts';

type SignalClient = {
  auth: {
    signInWithOtp(input: { email: string; options: { shouldCreateUser: boolean } }): Promise<{ data: unknown; error: null | { message: string } }>;
    verifyOtp(input: { email: string; token: string; type: 'email' }): Promise<{
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
  });
}

test('SupabaseAuthProvider requests email OTP with shouldCreateUser false', async () => {
  let captured: unknown;
  const provider = providerWith(() => ({
    auth: {
      async signInWithOtp(input) { captured = input; return { data: { user: null, session: null }, error: null }; },
      async verifyOtp() { throw new Error('unused'); },
      async signOut() { return { error: null }; },
    },
  }));

  await provider.requestEmailOtp({ email: 'pilot@example.test', signal: new AbortController().signal });
  assert.deepEqual(captured, { email: 'pilot@example.test', options: { shouldCreateUser: false } });
});

test('SupabaseAuthProvider reduces verifyOtp output to the governed external identity', async () => {
  const provider = providerWith(() => ({
    auth: {
      async signInWithOtp() { throw new Error('unused'); },
      async verifyOtp(input) {
        assert.deepEqual(input, { email: 'pilot@example.test', token: '123456', type: 'email' });
        return {
          data: {
            user: { id: 'provider-subject-1', email: 'pilot@example.test' },
            session: { access_token: 'access-secret', refresh_token: 'refresh-secret' },
          },
          error: null,
        };
      },
      async signOut() { return { error: null }; },
    },
  }));

  const result = await provider.verifyEmailOtp({ email: 'pilot@example.test', otp: '123456', signal: new AbortController().signal });
  assert.deepEqual(result, {
    issuer: 'https://project-ref.supabase.co/auth/v1',
    subject: 'provider-subject-1',
    verifiedEmail: 'pilot@example.test',
  });
  assert.equal(JSON.stringify(result).includes('access-secret'), false);
  assert.equal(JSON.stringify(result).includes('refresh-secret'), false);
});

test('SupabaseAuthProvider fails closed when verifyOtp returns no user', async () => {
  const provider = providerWith(() => ({
    auth: {
      async signInWithOtp() { throw new Error('unused'); },
      async verifyOtp() { return { data: { user: null, session: null }, error: null }; },
      async signOut() { return { error: null }; },
    },
  }));

  await assert.rejects(
    () => provider.verifyEmailOtp({ email: 'pilot@example.test', otp: '123456', signal: new AbortController().signal }),
    /PROVIDER_IDENTITY_INVALID/,
  );
});

test('SupabaseAuthProvider maps provider request and verify failures to stable internal errors', async () => {
  const provider = providerWith(() => ({
    auth: {
      async signInWithOtp() { return { data: null, error: { message: 'provider detail must not escape' } }; },
      async verifyOtp() { return { data: { user: null, session: null }, error: { message: 'provider detail must not escape' } }; },
      async signOut() { return { error: null }; },
    },
  }));

  await assert.rejects(
    () => provider.requestEmailOtp({ email: 'pilot@example.test', signal: new AbortController().signal }),
    (error: Error) => error.message === 'PROVIDER_UNAVAILABLE',
  );
  await assert.rejects(
    () => provider.verifyEmailOtp({ email: 'pilot@example.test', otp: '123456', signal: new AbortController().signal }),
    (error: Error) => error.message === 'OTP_INVALID',
  );
});

test('SupabaseAuthProvider supplies the caller AbortSignal to request-scoped clients', async () => {
  const seen: AbortSignal[] = [];
  const provider = providerWith((signal) => {
    seen.push(signal);
    return {
      auth: {
        async signInWithOtp() { if (signal.aborted) throw new DOMException('Aborted', 'AbortError'); return { data: null, error: null }; },
        async verifyOtp() { if (signal.aborted) throw new DOMException('Aborted', 'AbortError'); return { data: { user: { id: 'subject' }, session: null }, error: null }; },
        async signOut() { return { error: null }; },
      },
    };
  });
  const controller = new AbortController();
  controller.abort();

  await assert.rejects(() => provider.requestEmailOtp({ email: 'pilot@example.test', signal: controller.signal }));
  assert.equal(seen.length, 1);
  assert.equal(seen[0], controller.signal);
});
