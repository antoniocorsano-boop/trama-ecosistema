import type { AuthProviderAdapter } from '../ports/auth-provider.ts';
import type { VerifiedExternalIdentity } from '../domain/types.ts';

type FakeIdentity = { subject: string; email: string };
export class FakeAuthProvider implements AuthProviderAdapter {
  issuer: string;
  subject: string;
  email: string;
  otp: string;
  identities: Record<string, FakeIdentity>;
  requestCount = 0;
  verifyCount = 0;
  requestDelayMs = 0;
  available = true;
  requestFailure = false;
  verifyFailure: 'INVALID' | 'EXPIRED' | 'UNAVAILABLE' | null = null;
  constructor(seed: { issuer: string; subject: string; email: string; otp: string; identities?: Record<string, FakeIdentity> }) {
    this.issuer = seed.issuer; this.subject = seed.subject; this.email = seed.email; this.otp = seed.otp; this.identities = seed.identities ?? {};
  }
  async checkAvailability(): Promise<boolean> { return this.available; }
  async requestEmailOtp(_input: { email: string }): Promise<void> {
    this.requestCount += 1;
    if (this.requestDelayMs > 0) await new Promise((resolve) => setTimeout(resolve, this.requestDelayMs));
    if (this.requestFailure) throw new Error('PROVIDER_UNAVAILABLE');
  }
  async verifyEmailOtp(input: { email: string; otp: string }): Promise<VerifiedExternalIdentity> {
    this.verifyCount += 1;
    if (this.verifyFailure === 'UNAVAILABLE') throw new Error('PROVIDER_UNAVAILABLE');
    if (this.verifyFailure === 'EXPIRED') throw new Error('OTP_EXPIRED');
    if (this.verifyFailure === 'INVALID' || input.otp !== this.otp) throw new Error('OTP_INVALID');
    const identity = this.identities[input.email];
    return { issuer: this.issuer, subject: identity?.subject ?? this.subject, verifiedEmail: identity?.email ?? this.email };
  }
}
