import type { AuthProviderAdapter, MagicLinkCallbackInput, MagicLinkEmailOtpType } from '../../ports/auth-provider.ts';
import type { VerifiedExternalIdentity } from '../../domain/types.ts';

type ProviderError = { message?: string } | null;
type ProviderUser = { id: string; email?: string | null } | null;
type ProviderAuthResult = {
  data: { user: ProviderUser; session?: unknown };
  error: ProviderError;
};

type SupabaseAuthClientLike = {
  auth: {
    signInWithOtp(input: {
      email: string;
      options: { shouldCreateUser: boolean; emailRedirectTo: string };
    }): Promise<{ data: unknown; error: ProviderError }>;
    exchangeCodeForSession(code: string): Promise<ProviderAuthResult>;
    verifyOtp(input: { token_hash: string; type: MagicLinkEmailOtpType }): Promise<ProviderAuthResult>;
    signOut(): Promise<{ error: ProviderError }>;
  };
};

export interface SupabaseAuthProviderInput {
  issuer: string;
  createClientForSignal: (signal: AbortSignal) => SupabaseAuthClientLike;
  availabilityProbe: (signal: AbortSignal) => Promise<boolean>;
}

function throwIfAborted(signal: AbortSignal): void {
  if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
}

function reduceVerifiedIdentity(issuer: string, result: ProviderAuthResult): VerifiedExternalIdentity {
  if (result.error) throw new Error('MAGIC_LINK_INVALID');
  if (!result.data.user?.id) throw new Error('PROVIDER_IDENTITY_INVALID');
  return {
    issuer,
    subject: result.data.user.id,
    verifiedEmail: result.data.user.email ?? undefined,
  };
}

export class SupabaseAuthProvider implements AuthProviderAdapter {
  readonly issuer: string;
  private readonly createClientForSignal: (signal: AbortSignal) => SupabaseAuthClientLike;
  private readonly availabilityProbe: (signal: AbortSignal) => Promise<boolean>;

  constructor(input: SupabaseAuthProviderInput) {
    this.issuer = input.issuer;
    this.createClientForSignal = input.createClientForSignal;
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

  async requestEmailMagicLink(input: { email: string; redirectTo: string; signal: AbortSignal }): Promise<void> {
    const client = this.createClientForSignal(input.signal);
    throwIfAborted(input.signal);
    try {
      const { error } = await client.auth.signInWithOtp({
        email: input.email,
        options: {
          shouldCreateUser: false,
          emailRedirectTo: input.redirectTo,
        },
      });
      if (error) throw new Error('PROVIDER_UNAVAILABLE');
    } catch (error) {
      if (input.signal.aborted || (error instanceof DOMException && error.name === 'AbortError')) throw error;
      if (error instanceof Error && error.message === 'PROVIDER_UNAVAILABLE') throw error;
      throw new Error('PROVIDER_UNAVAILABLE');
    }
  }

  async verifyEmailMagicLink(input: MagicLinkCallbackInput & { signal: AbortSignal }): Promise<VerifiedExternalIdentity> {
    const client = this.createClientForSignal(input.signal);
    throwIfAborted(input.signal);
    try {
      const result = 'code' in input && typeof input.code === 'string'
        ? await client.auth.exchangeCodeForSession(input.code)
        : await client.auth.verifyOtp({ token_hash: input.tokenHash, type: input.type });
      const identity = reduceVerifiedIdentity(this.issuer, result);
      try {
        await client.auth.signOut();
      } catch {
        // Provider session cleanup is best-effort; TRAMA never persists provider tokens/session state.
      }
      return identity;
    } catch (error) {
      if (input.signal.aborted || (error instanceof DOMException && error.name === 'AbortError')) throw error;
      if (error instanceof Error && error.message === 'PROVIDER_IDENTITY_INVALID') throw error;
      throw new Error('MAGIC_LINK_INVALID');
    }
  }

  async bestEffortLogout(): Promise<void> {
    const controller = new AbortController();
    try {
      const client = this.createClientForSignal(controller.signal);
      await client.auth.signOut();
    } catch {
      // Local AccessSession revocation is authoritative; provider logout is best-effort only.
    }
  }
}
