import type { VerifiedExternalIdentity } from '../domain/types.ts';

export type MagicLinkEmailOtpType = 'email' | 'magiclink' | 'signup' | 'invite' | 'recovery' | 'email_change';
export type MagicLinkCallbackInput =
  | { code: string; tokenHash?: never; type?: never }
  | { code?: never; tokenHash: string; type: MagicLinkEmailOtpType };

export interface AuthProviderAdapter {
  checkAvailability(input: { signal: AbortSignal }): Promise<boolean>;
  requestEmailMagicLink(input: { email: string; redirectTo: string; signal: AbortSignal }): Promise<void>;
  verifyEmailMagicLink(input: MagicLinkCallbackInput & { signal: AbortSignal }): Promise<VerifiedExternalIdentity>;

  // Transitional compatibility while Task 3 migrates the domain/handlers.
  requestEmailOtp(input: { email: string; signal: AbortSignal }): Promise<void>;
  verifyEmailOtp(input: { email: string; otp: string; signal: AbortSignal }): Promise<VerifiedExternalIdentity>;
  bestEffortLogout?(): Promise<void>;
}
