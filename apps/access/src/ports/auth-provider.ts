import type { VerifiedExternalIdentity } from '../domain/types.ts';
export interface AuthProviderAdapter {
  checkAvailability(): Promise<boolean>;
  requestEmailOtp(input: { email: string }): Promise<void>;
  verifyEmailOtp(input: { email: string; otp: string }): Promise<VerifiedExternalIdentity>;
  bestEffortLogout?(): Promise<void>;
}
