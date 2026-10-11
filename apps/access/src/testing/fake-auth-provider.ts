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
  requestCompletionCount = 0;
  requestAbortCount = 0;
  verifyCount = 0;
  verifyCompletionCount = 0;
  verifyAbortCount = 0;
  requestDelayMs = 0;
  verifyDelayMs = 0;
  available = true;
  requestFailure = false;
  verifyFailure: 'INVALID' | 'EXPIRED' | 'UNAVAILABLE' | null = null;
  constructor(seed: { issuer: string; subject: string; email: string; otp: string; identities?: Record<string, FakeIdentity> }) {
    this.issuer = seed.issuer; this.subject = seed.subject; this.email = seed.email; this.otp = seed.otp; this.identities = seed.identities ?? {};
  }
  async checkAvailability(_input: { signal: AbortSignal }): Promise<boolean> { return this.available; }
  async requestEmailOtp(input: { email: string; signal: AbortSignal }): Promise<void> {
    this.requestCount += 1;
    if (this.requestDelayMs > 0) {
      await new Promise<void>((resolve, reject) => {
        let settled = false;
        const finish = (callback: () => void) => {
          if (settled) return;
          settled = true;
          input.signal.removeEventListener('abort', onAbort);
          callback();
        };
        const timer = setTimeout(() => finish(resolve), this.requestDelayMs);
        const onAbort = () => {
          clearTimeout(timer);
          finish(() => {
            this.requestAbortCount += 1;
            reject(new Error('OTP_REQUEST_ABORTED'));
          });
        };
        if (input.signal.aborted) onAbort();
        else input.signal.addEventListener('abort', onAbort, { once: true });
      });
    }
    if (this.requestFailure) throw new Error('PROVIDER_UNAVAILABLE');
    this.requestCompletionCount += 1;
  }
  async verifyEmailOtp(input: { email: string; otp: string; signal: AbortSignal }): Promise<VerifiedExternalIdentity> {
    this.verifyCount += 1;
    if (this.verifyDelayMs > 0) {
      await new Promise<void>((resolve, reject) => {
        let settled = false;
        const finish = (callback: () => void) => {
          if (settled) return;
          settled = true;
          input.signal.removeEventListener('abort', onAbort);
          callback();
        };
        const timer = setTimeout(() => finish(resolve), this.verifyDelayMs);
        const onAbort = () => {
          clearTimeout(timer);
          finish(() => {
            this.verifyAbortCount += 1;
            reject(new Error('OTP_VERIFY_ABORTED'));
          });
        };
        if (input.signal.aborted) onAbort();
        else input.signal.addEventListener('abort', onAbort, { once: true });
      });
    }
    if (this.verifyFailure === 'UNAVAILABLE') throw new Error('PROVIDER_UNAVAILABLE');
    if (this.verifyFailure === 'EXPIRED') throw new Error('OTP_EXPIRED');
    if (this.verifyFailure === 'INVALID' || input.otp !== this.otp) throw new Error('OTP_INVALID');
    const identity = this.identities[input.email];
    this.verifyCompletionCount += 1;
    return { issuer: this.issuer, subject: identity?.subject ?? this.subject, verifiedEmail: identity?.email ?? this.email };
  }
}
