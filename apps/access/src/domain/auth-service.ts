import type { AuthProviderAdapter } from '../ports/auth-provider.ts';
import type { IdentityRepository } from '../ports/identity-repository.ts';
import type { SessionStore } from '../ports/session-store.ts';
import type { RateLimiter } from '../ports/rate-limiter.ts';
import { digestRateLimitKey } from '../ports/rate-limiter.ts';
import { isPilotAliasAllowed, resolvePrincipalForVerifiedIdentity } from './principal-service.ts';
import { issueAccessSession } from './session-service.ts';
import { normalizeLoginEmail } from './email.ts';

export type RequestPilotOtpResult = { status: 'OTP_REQUESTED' | 'PROVIDER_UNAVAILABLE' };
export async function requestPilotOtp(input: { repo: IdentityRepository; provider: AuthProviderAdapter; email: string; rateLimiter?: RateLimiter; now?: Date }): Promise<RequestPilotOtpResult> {
  const email = normalizeLoginEmail(input.email);
  const now = input.now ?? new Date();
  if (input.rateLimiter) {
    const rate = await input.rateLimiter.consume({ scope: 'OTP_REQUEST', keyDigest: digestRateLimitKey(email), now });
    if (!rate.allowed) return { status: 'OTP_REQUESTED' };
  }
  let available = false;
  try { available = await input.provider.checkAvailability(); } catch { available = false; }
  if (!available) return { status: 'PROVIDER_UNAVAILABLE' };
  const allowed = await isPilotAliasAllowed(input.repo, email);
  if (!allowed) return { status: 'OTP_REQUESTED' };
  try {
    await input.provider.requestEmailOtp({ email });
    return { status: 'OTP_REQUESTED' };
  } catch {
    return { status: 'PROVIDER_UNAVAILABLE' };
  }
}

export type VerifyPilotOtpResult =
  | { status: 'AUTHENTICATED'; principalId: string; contextId: string; sessionSecret: string }
  | { status: 'OTP_INVALID' | 'OTP_EXPIRED' | 'PROVIDER_UNAVAILABLE' | 'ACCESS_DENIED' | 'RATE_LIMITED' };
export async function verifyPilotOtp(input: { repo: IdentityRepository; provider: AuthProviderAdapter; store: SessionStore; email: string; otp: string; now: Date; rateLimiter?: RateLimiter }): Promise<VerifyPilotOtpResult> {
  const email = normalizeLoginEmail(input.email);
  if (input.rateLimiter) {
    const rate = await input.rateLimiter.consume({ scope: 'OTP_VERIFY', keyDigest: digestRateLimitKey(email), now: input.now });
    if (!rate.allowed) return { status: 'RATE_LIMITED' };
  }
  let available = false;
  try { available = await input.provider.checkAvailability(); } catch { available = false; }
  if (!available) return { status: 'PROVIDER_UNAVAILABLE' };
  if (!(await isPilotAliasAllowed(input.repo, email))) return { status: 'ACCESS_DENIED' };
  let verified;
  try {
    verified = await input.provider.verifyEmailOtp({ email, otp: input.otp });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message === 'OTP_EXPIRED') return { status: 'OTP_EXPIRED' };
    if (message === 'PROVIDER_UNAVAILABLE') return { status: 'PROVIDER_UNAVAILABLE' };
    return { status: 'OTP_INVALID' };
  }
  const resolution = await resolvePrincipalForVerifiedIdentity(input.repo, verified);
  if (!resolution.ok) return { status: 'ACCESS_DENIED' };
  const { secret } = await issueAccessSession({ store: input.store, principalId: resolution.principal.principalId, contextId: resolution.context.contextId, now: input.now });
  return { status: 'AUTHENTICATED', principalId: resolution.principal.principalId, contextId: resolution.context.contextId, sessionSecret: secret };
}
