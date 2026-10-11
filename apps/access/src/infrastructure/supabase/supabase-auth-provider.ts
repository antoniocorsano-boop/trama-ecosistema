import type { AuthProviderAdapter } from '../../ports/auth-provider.ts';
import type { VerifiedExternalIdentity } from '../../domain/types.ts';

type ProviderError = { message?: string } | null;
type ProviderUser = { id: string; email?: string | null } | null;

type SupabaseAuthClientLike = {
  auth: {
    signInWithOtp(input: { email: string; options: { shouldCreateUser: boolean } }): Promise<{ data: unknown; error: ProviderError }>;
    verifyOtp(input: { email: string; token: string; type: 'email' }): Promise<{
      data: { user: ProviderUser; session?: unknown };
      error: ProviderError;
    }>;
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

  async requestEmailOtp(input: { email: string; signal: AbortSignal }): Promise<void> {
    const client = this.createClientForSignal(input.signal);
    throwIfAborted(input.signal);
    try {
      const { error } = await client.auth.signInWithOtp({
        email: input.email,
        options: { shouldCreateUser: false },
      });
      if (error) throw new Error('PROVIDER_UNAVAILABLE');
    } catch (error) {
      if (input.signal.aborted || (error instanceof DOMException && error.name === 'AbortError')) throw error;
      if (error instanceof Error && error.message === 'PROVIDER_UNAVAILABLE') throw error;
      throw new Error('PROVIDER_UNAVAILABLE');
    }
  }

  async verifyEmailOtp(input: { email: string; otp: string; signal: AbortSignal }): Promise<VerifiedExternalIdentity> {
    const client = this.createClientForSignal(input.signal);
    throwIfAborted(input.signal);
    try {
      const { data, error } = await client.auth.verifyOtp({
        email: input.email,
        token: input.otp,
        type: 'email',
      });
      if (error) throw new Error('OTP_INVALID');
      if (!data.user?.id) throw new Error('PROVIDER_IDENTITY_INVALID');
      return {
        issuer: this.issuer,
        subject: data.user.id,
        verifiedEmail: data.user.email ?? undefined,
      };
    } catch (error) {
      if (input.signal.aborted || (error instanceof DOMException && error.name === 'AbortError')) throw error;
      if (error instanceof Error && (error.message === 'OTP_INVALID' || error.message === 'PROVIDER_IDENTITY_INVALID')) throw error;
      throw new Error('OTP_INVALID');
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
