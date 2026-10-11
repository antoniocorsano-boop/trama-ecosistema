import type { AuthProviderAdapter } from '../ports/auth-provider.ts';
import type { VerifiedExternalIdentity } from '../domain/types.ts';

export class FakeAuthProvider implements AuthProviderAdapter {
  issuer: string;
  subject: string;
  email: string;
  otp: string;
  requestCount = 0;
  available = true;
  requestFailure = false;
  verifyFailure: 'INVALID' | 'EXPIRED' | 'UNAVAILABLE' | null = null;
  constructor(seed: { issuer: string; subject: string; email: string; otp: string }) {
    this.issuer = seed.issuer; this.subject = seed.subject; this.email = seed.email; this.otp = seed.otp;
  }
  async checkAvailability(): Promise<boolean> { return this.available; }
  async requestEmailOtp(_input: { email: string }): Promise<void> {
    this.requestCount += 1;
    if (this.requestFailure) throw new Error('PROVIDER_UNAVAILABLE');
  }
  async verifyEmailOtp(input: { email: string; otp: string }): Promise<VerifiedExternalIdentity> {
    if (this.verifyFailure === 'UNAVAILABLE') throw new Error('PROVIDER_UNAVAILABLE');
    if (this.verifyFailure === 'EXPIRED') throw new Error('OTP_EXPIRED');
    if (this.verifyFailure === 'INVALID' || input.otp !== this.otp) throw new Error('OTP_INVALID');
    return { issuer: this.issuer, subject: this.subject, verifiedEmail: this.email };
  }
}
