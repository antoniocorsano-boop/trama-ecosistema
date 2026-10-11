import type { RateLimiter, RateLimitScope, RateLimitDecision } from '../ports/rate-limiter.ts';
const WINDOW_MS = 15 * 60 * 1000;
const LIMITS: Record<RateLimitScope, number> = { OTP_REQUEST: 5, OTP_VERIFY: 10 };
export class InMemoryRateLimiter implements RateLimiter {
  entries: Array<{ scope: RateLimitScope; keyDigest: string; at: Date }> = [];
  async consume(input: { scope: RateLimitScope; keyDigest: string; now: Date }): Promise<RateLimitDecision> {
    const cutoff = input.now.getTime() - WINDOW_MS;
    this.entries = this.entries.filter((entry) => entry.at.getTime() > cutoff);
    const matching = this.entries.filter((entry) => entry.scope === input.scope && entry.keyDigest === input.keyDigest);
    const limit = LIMITS[input.scope];
    if (matching.length >= limit) {
      const first = matching[0]!;
      return { allowed: false, remaining: 0, resetAt: new Date(first.at.getTime() + WINDOW_MS) };
    }
    this.entries.push({ scope: input.scope, keyDigest: input.keyDigest, at: input.now });
    return { allowed: true, remaining: limit - matching.length - 1, resetAt: new Date(input.now.getTime() + WINDOW_MS) };
  }
}
