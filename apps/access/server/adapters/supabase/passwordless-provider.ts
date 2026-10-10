import { createServerClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { VerifiedProviderIdentity } from '../../domain/types.js';
import {
  PasswordlessAccessDeniedError,
  PasswordlessProviderUnavailableError,
  type PasswordlessProvider,
  type ProviderCookieJar,
} from '../../ports/passwordless-provider.js';

export type SupabaseAuthErrorLike = { message: string; status?: number };

export interface SupabaseAuthClient {
  signInWithOtp(credentials: {
    email: string;
    options: { emailRedirectTo: string; shouldCreateUser: false };
  }): Promise<{ data: unknown; error: SupabaseAuthErrorLike | null }>;
  exchangeCodeForSession(code: string): Promise<{ data: unknown; error: SupabaseAuthErrorLike | null }>;
  getClaims(): Promise<{
    data: { claims: Record<string, unknown> } | null;
    error: SupabaseAuthErrorLike | null;
  }>;
}

export interface SupabaseAuthClientFactory {
  create(cookies: ProviderCookieJar): SupabaseAuthClient;
}

function providerError(error: SupabaseAuthErrorLike): Error {
  const status = error.status ?? 503;
  if (status >= 500 || status === 429) return new PasswordlessProviderUnavailableError();
  return new PasswordlessAccessDeniedError();
}

export class SupabasePasswordlessProvider implements PasswordlessProvider {
  constructor(private readonly factory: SupabaseAuthClientFactory) {}

  async requestSignIn(email: string, redirectTo: string, cookies: ProviderCookieJar): Promise<void> {
    const client = this.factory.create(cookies);
    const { error } = await client.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
        shouldCreateUser: false,
      },
    });
    if (error) throw providerError(error);
  }

  async completeSignIn(code: string, cookies: ProviderCookieJar): Promise<VerifiedProviderIdentity> {
    if (!code.trim()) throw new PasswordlessAccessDeniedError();

    const client = this.factory.create(cookies);
    const exchange = await client.exchangeCodeForSession(code);
    if (exchange.error) throw providerError(exchange.error);

    // getClaims() verifies the JWT signature/issuer material before claims are consumed.
    const verified = await client.getClaims();
    if (verified.error) throw providerError(verified.error);
    const issuer = verified.data?.claims?.iss;
    const subject = verified.data?.claims?.sub;
    if (typeof issuer !== 'string' || !issuer.trim() || typeof subject !== 'string' || !subject.trim()) {
      throw new Error('PASSWORDLESS_IDENTITY_INVALID');
    }

    return { issuer: issuer.trim(), subject: subject.trim() };
  }

  async clearTransientAuth(cookies: ProviderCookieJar): Promise<void> {
    const deletions = cookies
      .getAll()
      .filter((cookie) => cookie.name.startsWith('sb-'))
      .map((cookie) => ({
        name: cookie.name,
        value: '',
        options: {
          ...cookie.options,
          path: cookie.options?.path ?? '/',
          maxAge: 0,
        },
      }));
    cookies.setAll(deletions);
  }
}

class OfficialSupabaseAuthClientFactory implements SupabaseAuthClientFactory {
  constructor(
    private readonly supabaseUrl: string,
    private readonly publishableKey: string,
  ) {}

  create(cookies: ProviderCookieJar): SupabaseAuthClient {
    const client = createServerClient(this.supabaseUrl, this.publishableKey, {
      cookies: {
        getAll: () => cookies.getAll().map(({ name, value }) => ({ name, value })),
        setAll: (cookiesToSet) => cookies.setAll(cookiesToSet),
      },
    });
    return wrapOfficialAuth(client);
  }
}

function wrapOfficialAuth(client: SupabaseClient): SupabaseAuthClient {
  return {
    async signInWithOtp(credentials) {
      const result = await client.auth.signInWithOtp(credentials);
      return { data: result.data, error: result.error };
    },
    async exchangeCodeForSession(code) {
      const result = await client.auth.exchangeCodeForSession(code);
      return { data: result.data, error: result.error };
    },
    async getClaims() {
      const result = await client.auth.getClaims();
      return {
        data: result.data ? { claims: result.data.claims as Record<string, unknown> } : null,
        error: result.error,
      };
    },
  };
}

export function createSupabasePasswordlessProvider(
  supabaseUrl: string,
  publishableKey: string,
): SupabasePasswordlessProvider {
  return new SupabasePasswordlessProvider(
    new OfficialSupabaseAuthClientFactory(supabaseUrl, publishableKey),
  );
}
