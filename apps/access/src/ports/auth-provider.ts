import type { VerifiedExternalIdentity } from '../domain/types.ts';
export interface AuthProviderAdapter {
  checkAvailability(): Promise<boolean>;
  requestEmailOtp(input: { email: string; signal: AbortSignal }): Promise<void>;
  verifyEmailOtp(input: { email: string; otp: string; signal: AbortSignal }): Promise<VerifiedExternalIdentity>;
  bestEffortLogout?(): Promise<void>;
}
