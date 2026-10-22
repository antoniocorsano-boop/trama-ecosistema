import { createHash } from 'node:crypto';
import type { AuthProviderAdapter, MagicLinkCallbackInput, MagicLinkEmailOtpType } from '../../ports/auth-provider.ts';
import type { VerifiedExternalIdentity } from '../../domain/types.ts';

const PKCE_VERIFIER_PATTERN = /^[A-Za-z0-9_-]{43,128}$/;
const TRANSIENT_LOGOUT_TIMEOUT_MS = 500;

type ProviderUser = { id: string; email?: string | null } | null;
type ProviderTokenResponse = {
  user?: ProviderUser;
  access_token?: string | null;
  refresh_token?: string | null;
  session?: {
    access_token?: string | null;
    refresh_token?: string | null;
    user?: ProviderUser;
  } | null;
};

export interface SupabaseAuthProviderInput {
  issuer: string;
  projectUrl: string;
  publishableKey: string;
  fetchImpl?: typeof fetch;
  availabilityProbe: (signal: AbortSignal) => Promise<boolean>;
}

function throwIfAborted(signal: AbortSignal): void {
  if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
}

function normalizedProjectUrl(raw: string): string {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error('SUPABASE_URL_INVALID');
  }
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) {
    throw new Error('SUPABASE_URL_INVALID');
  }
  return url.origin;
}

function assertVerifier(verifier: string, failure: 'PROVIDER_UNAVAILABLE' | 'MAGIC_LINK_INVALID'): void {
  if (!PKCE_VERIFIER_PATTERN.test(verifier)) throw new Error(failure);
}

function pkceChallenge(verifier: string): string {
  return createHash('sha256').update(verifier).digest('base64url');
}

function providerIdentity(issuer: string, payload: ProviderTokenResponse): VerifiedExternalIdentity {
  const user = payload.user ?? payload.session?.user ?? null;
  if (!user?.id) throw new Error('PROVIDER_IDENTITY_INVALID');
  return {
    issuer,
    subject: user.id,
    verifiedEmail: user.email ?? undefined,
  };
}

function accessToken(payload: ProviderTokenResponse): string | null {
  return payload.access_token ?? payload.session?.access_token ?? null;
}

export class SupabaseAuthProvider implements AuthProviderAdapter {
  readonly issuer: string;
  private readonly projectUrl: string;
  private readonly publishableKey: string;
  private readonly fetchImpl: typeof fetch;
  private readonly availabilityProbe: (signal: AbortSignal) => Promise<boolean>;

  constructor(input: SupabaseAuthProviderInput) {
    this.issuer = input.issuer;
    this.projectUrl = normalizedProjectUrl(input.projectUrl);
    this.publishableKey = input.publishableKey;
    this.fetchImpl = input.fetchImpl ?? fetch;
    this.availabilityProbe = input.availabilityProbe;
  }

  async checkAvailability(input: { signal: AbortSignal }): Promise<boolean> {
    if (input.signal.aborted) return false;
    try {
      return Boolean(await this.availabilityProbe(input.signal)) && !input.signal.aborted;
    } catch {
      return false;
    }
  }

  async requestEmailMagicLink(input: { email: string; redirectTo: string; codeVerifier: string; signal: AbortSignal }): Promise<void> {
    throwIfAborted(input.signal);
    assertVerifier(input.codeVerifier, 'PROVIDER_UNAVAILABLE');
    try {
      const url = new URL('/auth/v1/otp', this.projectUrl);
      url.searchParams.set('redirect_to', input.redirectTo);
      const response = await this.fetchImpl(url.toString(), {
        method: 'POST',
        headers: {
          apikey: this.publishableKey,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: input.email,
          create_user: false,
          code_challenge: pkceChallenge(input.codeVerifier),
          code_challenge_method: 's256',
        }),
        cache: 'no-store',
        signal: input.signal,
      });
      if (!response.ok) throw new Error('PROVIDER_UNAVAILABLE');
    } catch (error) {
      if (input.signal.aborted || (error instanceof DOMException && error.name === 'AbortError')) throw error;
      if (error instanceof Error && error.message === 'PROVIDER_UNAVAILABLE') throw error;
      throw new Error('PROVIDER_UNAVAILABLE');
    }
  }

  async verifyEmailMagicLink(input: MagicLinkCallbackInput & { signal: AbortSignal }): Promise<VerifiedExternalIdentity> {
    throwIfAborted(input.signal);
    try {
      let response: Response;
      if ('code' in input && typeof input.code === 'string') {
        assertVerifier(input.codeVerifier, 'MAGIC_LINK_INVALID');
        response = await this.fetchImpl(`${this.projectUrl}/auth/v1/token?grant_type=pkce`, {
          method: 'POST',
          headers: {
            apikey: this.publishableKey,
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ auth_code: input.code, code_verifier: input.codeVerifier }),
          cache: 'no-store',
          signal: input.signal,
        });
      } else {
        response = await this.fetchImpl(`${this.projectUrl}/auth/v1/verify`, {
          method: 'POST',
          headers: {
            apikey: this.publishableKey,
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token_hash: input.tokenHash, type: input.type as MagicLinkEmailOtpType }),
          cache: 'no-store',
          signal: input.signal,
        });
      }

      if (!response.ok) throw new Error('MAGIC_LINK_INVALID');
      let payload: ProviderTokenResponse;
      try {
        payload = await response.json() as ProviderTokenResponse;
      } catch {
        throw new Error('MAGIC_LINK_INVALID');
      }

      const token = accessToken(payload);
      try {
        return providerIdentity(this.issuer, payload);
      } finally {
        if (token) this.scheduleTransientSessionLogout(token);
      }
    } catch (error) {
      if (input.signal.aborted || (error instanceof DOMException && error.name === 'AbortError')) throw error;
      if (error instanceof Error && error.message === 'PROVIDER_IDENTITY_INVALID') throw error;
      throw new Error('MAGIC_LINK_INVALID');
    }
  }

  private scheduleTransientSessionLogout(token: string): void {
    const signal = AbortSignal.timeout(TRANSIENT_LOGOUT_TIMEOUT_MS);
    void this.logoutTransientSession(token, signal);
  }

  private async logoutTransientSession(token: string, signal: AbortSignal): Promise<void> {
    if (signal.aborted) return;
    try {
      await this.fetchImpl(`${this.projectUrl}/auth/v1/logout?scope=local`, {
        method: 'POST',
        headers: {
          apikey: this.publishableKey,
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        cache: 'no-store',
        signal,
      });
    } catch {
      // Provider cleanup is best-effort. TRAMA never persists provider token/session state.
    }
  }

  async bestEffortLogout(): Promise<void> {
    // The callback transport discards and best-effort revokes provider tokens before returning identity.
  }
}
