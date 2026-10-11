import type { AuthProviderAdapter, MagicLinkCallbackInput } from '../ports/auth-provider.ts';
import type { VerifiedExternalIdentity } from '../domain/types.ts';

type FakeIdentity = { subject: string; email: string };

export class FakeAuthProvider implements AuthProviderAdapter {
  issuer: string;
  subject: string;
  email: string;
  identities: Record<string, FakeIdentity>;
  requestCount = 0;
  requestCompletionCount = 0;
  requestAbortCount = 0;
  verifyCount = 0;
  verifyCompletionCount = 0;
  verifyAbortCount = 0;
  logoutCount = 0;
  requestDelayMs = 0;
  verifyDelayMs = 0;
  available = true;
  requestFailure = false;
  verifyFailure: 'INVALID' | 'EXPIRED' | 'UNAVAILABLE' | null = null;
  lastMagicLinkRedirectTo: string | null = null;
  lastMagicLinkEmail: string | null = null;

  constructor(seed: { issuer: string; subject: string; email: string; identities?: Record<string, FakeIdentity> }) {
    this.issuer = seed.issuer;
    this.subject = seed.subject;
    this.email = seed.email;
    this.identities = seed.identities ?? {};
  }

  async checkAvailability(_input: { signal: AbortSignal }): Promise<boolean> { return this.available; }

  private async delayOrAbort(input: { signal: AbortSignal; delayMs: number; phase: 'request' | 'verify' }): Promise<void> {
    if (input.delayMs <= 0) {
      if (input.signal.aborted) throw new Error(input.phase === 'request' ? 'MAGIC_LINK_REQUEST_ABORTED' : 'MAGIC_LINK_VERIFY_ABORTED');
      return;
    }
    await new Promise<void>((resolve, reject) => {
      let settled = false;
      const finish = (callback: () => void) => {
        if (settled) return;
        settled = true;
        input.signal.removeEventListener('abort', onAbort);
        callback();
      };
      const timer = setTimeout(() => finish(resolve), input.delayMs);
      const onAbort = () => {
        clearTimeout(timer);
        finish(() => {
          if (input.phase === 'request') this.requestAbortCount += 1;
          else this.verifyAbortCount += 1;
          reject(new Error(input.phase === 'request' ? 'MAGIC_LINK_REQUEST_ABORTED' : 'MAGIC_LINK_VERIFY_ABORTED'));
        });
      };
      if (input.signal.aborted) onAbort();
      else input.signal.addEventListener('abort', onAbort, { once: true });
    });
  }

  async requestEmailMagicLink(input: { email: string; redirectTo: string; signal: AbortSignal }): Promise<void> {
    this.requestCount += 1;
    this.email = input.email;
    this.lastMagicLinkEmail = input.email;
    this.lastMagicLinkRedirectTo = input.redirectTo;
    await this.delayOrAbort({ signal: input.signal, delayMs: this.requestDelayMs, phase: 'request' });
    if (this.requestFailure) throw new Error('PROVIDER_UNAVAILABLE');
    this.requestCompletionCount += 1;
  }

  async verifyEmailMagicLink(input: MagicLinkCallbackInput & { signal: AbortSignal }): Promise<VerifiedExternalIdentity> {
    this.verifyCount += 1;
    await this.delayOrAbort({ signal: input.signal, delayMs: this.verifyDelayMs, phase: 'verify' });
    if (this.verifyFailure === 'UNAVAILABLE') throw new Error('PROVIDER_UNAVAILABLE');
    if (this.verifyFailure === 'EXPIRED') throw new Error('MAGIC_LINK_EXPIRED');
    if (this.verifyFailure === 'INVALID') throw new Error('MAGIC_LINK_INVALID');
    this.verifyCompletionCount += 1;
    const identity = this.identities[this.email];
    return { issuer: this.issuer, subject: identity?.subject ?? this.subject, verifiedEmail: identity?.email ?? this.email };
  }

  async bestEffortLogout(): Promise<void> {
    this.logoutCount += 1;
  }
}
