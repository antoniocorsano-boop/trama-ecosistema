import { describe, expect, it } from 'vitest';
import {
  SupabasePasswordlessProvider,
  type SupabaseAuthClient,
  type SupabaseAuthClientFactory,
} from './passwordless-provider';
import { MemoryProviderCookieJar } from '../../testing/fake-passwordless-provider';

class FakeAuthClient implements SupabaseAuthClient {
  readonly otpCalls: unknown[] = [];
  readonly exchangeCalls: string[] = [];
  claims: Record<string, unknown> = {
    iss: 'https://project-ref.supabase.co/auth/v1',
    sub: '00000000-0000-4000-8000-000000000001',
  };
  signInError: { message: string; status?: number } | null = null;
  exchangeError: { message: string; status?: number } | null = null;
  claimsError: { message: string; status?: number } | null = null;

  async signInWithOtp(credentials: unknown) {
    this.otpCalls.push(credentials);
    return { data: {}, error: this.signInError };
  }

  async exchangeCodeForSession(code: string) {
    this.exchangeCalls.push(code);
    return { data: {}, error: this.exchangeError };
  }

  async getClaims() {
    return {
      data: this.claimsError ? null : { claims: this.claims },
      error: this.claimsError,
    };
  }
}

class FakeFactory implements SupabaseAuthClientFactory {
  readonly client = new FakeAuthClient();
  readonly jars: unknown[] = [];
  create(cookies: unknown) {
    this.jars.push(cookies);
    return this.client;
  }
}

describe('SupabasePasswordlessProvider', () => {
  it('requests a Magic Link with signup disabled and exact callback redirect', async () => {
    const factory = new FakeFactory();
    const provider = new SupabasePasswordlessProvider(factory);
    const cookies = new MemoryProviderCookieJar();

    await provider.requestSignIn(
      'pilot@example.invalid',
      'https://access.trama.example/auth/callback',
      cookies,
    );

    expect(factory.client.otpCalls).toEqual([
      {
        email: 'pilot@example.invalid',
        options: {
          emailRedirectTo: 'https://access.trama.example/auth/callback',
          shouldCreateUser: false,
        },
      },
    ]);
  });

  it('exchanges the PKCE code then obtains cryptographically verified claims', async () => {
    const factory = new FakeFactory();
    const provider = new SupabasePasswordlessProvider(factory);
    const cookies = new MemoryProviderCookieJar();

    await expect(provider.completeSignIn('valid-code', cookies)).resolves.toEqual({
      issuer: 'https://project-ref.supabase.co/auth/v1',
      subject: '00000000-0000-4000-8000-000000000001',
    });
    expect(factory.client.exchangeCalls).toEqual(['valid-code']);
  });

  it.each([
    [{ iss: '', sub: 'subject-a' }, 'empty issuer'],
    [{ iss: 'https://project-ref.supabase.co/auth/v1', sub: '' }, 'empty subject'],
    [{ email: 'pilot@example.invalid' }, 'email-only claims'],
  ])('rejects incomplete verified claims: %s', async (claims) => {
    const factory = new FakeFactory();
    factory.client.claims = claims;
    const provider = new SupabasePasswordlessProvider(factory);

    await expect(provider.completeSignIn('valid-code', new MemoryProviderCookieJar())).rejects.toThrow(
      'PASSWORDLESS_IDENTITY_INVALID',
    );
  });

  it('never falls back to an unverified JWT decode when getClaims verification fails', async () => {
    const factory = new FakeFactory();
    factory.client.claimsError = { message: 'signature verification failed', status: 401 };
    const provider = new SupabasePasswordlessProvider(factory);

    await expect(provider.completeSignIn('valid-code', new MemoryProviderCookieJar())).rejects.toThrow(
      'PASSWORDLESS_ACCESS_DENIED',
    );
  });

  it('classifies a missing pilot identity separately from provider outage', async () => {
    const deniedFactory = new FakeFactory();
    deniedFactory.client.signInError = { message: 'user not found', status: 400 };
    const denied = new SupabasePasswordlessProvider(deniedFactory);
    await expect(
      denied.requestSignIn(
        'pilot@example.invalid',
        'https://access.trama.example/auth/callback',
        new MemoryProviderCookieJar(),
      ),
    ).rejects.toThrow('PASSWORDLESS_ACCESS_DENIED');

    const outageFactory = new FakeFactory();
    outageFactory.client.signInError = { message: 'service unavailable', status: 503 };
    const outage = new SupabasePasswordlessProvider(outageFactory);
    await expect(
      outage.requestSignIn(
        'pilot@example.invalid',
        'https://access.trama.example/auth/callback',
        new MemoryProviderCookieJar(),
      ),
    ).rejects.toThrow('PASSWORDLESS_PROVIDER_UNAVAILABLE');
  });

  it('clears transient Supabase auth cookies after callback', async () => {
    const factory = new FakeFactory();
    const provider = new SupabasePasswordlessProvider(factory);
    const cookies = new MemoryProviderCookieJar([
      { name: 'sb-project-auth-token-code-verifier', value: 'verifier' },
      { name: 'unrelated', value: 'keep' },
    ]);

    await provider.clearTransientAuth(cookies);

    expect(cookies.getAll()).toEqual([{ name: 'unrelated', value: 'keep' }]);
  });
});
