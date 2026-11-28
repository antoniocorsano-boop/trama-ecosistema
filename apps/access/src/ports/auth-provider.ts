import type { VerifiedExternalIdentity } from '../domain/types.ts';

export type MagicLinkEmailOtpType = 'email' | 'magiclink' | 'signup' | 'invite' | 'recovery' | 'email_change';
export type MagicLinkCallbackInput =
  | { code: string; codeVerifier: string; tokenHash?: never; type?: never }
  | { code?: never; codeVerifier?: never; tokenHash: string; type: MagicLinkEmailOtpType };

export interface AuthProviderAdapter {
  checkAvailability(input: { signal: AbortSignal }): Promise<boolean>;
  requestEmailMagicLink(input: { email: string; redirectTo: string; codeVerifier: string; signal: AbortSignal }): Promise<void>;
  verifyEmailMagicLink(input: MagicLinkCallbackInput & { signal: AbortSignal }): Promise<VerifiedExternalIdentity>;
  bestEffortLogout?(): Promise<void>;
}
