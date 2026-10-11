import { createHash } from 'node:crypto';
export type RateLimitScope = 'OTP_REQUEST' | 'OTP_VERIFY';
export interface RateLimitDecision { allowed: boolean; remaining: number; resetAt: Date; }
export interface RateLimiter {
  consume(input: { scope: RateLimitScope; keyDigest: string; now: Date }): Promise<RateLimitDecision>;
}
export function digestRateLimitKey(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}
