import type { RateLimitDecision, RateLimiter, RateLimitScope } from '../../ports/rate-limiter.ts';
import { runAccessRpc, type SupabaseRpcClientLike } from './supabase-rpc.ts';

const WINDOW_SECONDS = 15 * 60;
const LIMITS: Record<RateLimitScope, number> = {
  OTP_REQUEST: 5,
  OTP_REQUEST_GLOBAL: 20,
  OTP_VERIFY: 10,
  OTP_VERIFY_GLOBAL: 20,
};

type RateLimitRow = { allowed: boolean; retry_after_seconds: number };

export class SupabaseRateLimiter implements RateLimiter {
  constructor(private readonly client: SupabaseRpcClientLike) {}

  async consume(input: { scope: RateLimitScope; keyDigest: string; now: Date }): Promise<RateLimitDecision> {
    const row = await runAccessRpc<RateLimitRow>(this.client, 'access_rate_limit_consume', {
      p_scope: input.scope,
      p_key_digest: input.keyDigest,
      p_now: input.now.toISOString(),
      p_limit: LIMITS[input.scope],
      p_window_seconds: WINDOW_SECONDS,
    });
    if (!row || typeof row.allowed !== 'boolean') throw new Error('ACCESS_STORE_UNAVAILABLE');
    return {
      allowed: row.allowed,
      retryAfterSeconds: Math.max(0, Number(row.retry_after_seconds) || 0),
    };
  }
}
