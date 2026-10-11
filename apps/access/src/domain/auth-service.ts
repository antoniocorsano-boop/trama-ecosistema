import type { AuthProviderAdapter } from '../ports/auth-provider.ts';
import type { IdentityRepository } from '../ports/identity-repository.ts';
import type { SessionStore } from '../ports/session-store.ts';
import type { RateLimiter } from '../ports/rate-limiter.ts';
import { digestRateLimitKey } from '../ports/rate-limiter.ts';
import { isPilotAliasAllowed, resolvePrincipalForVerifiedIdentity } from './principal-service.ts';
import { issueAccessSession } from './session-service.ts';
import { normalizeLoginEmail } from './email.ts';

export type OtpRequestTimingPolicy = {
  providerBudgetMs: number;
  publicFloorMs: number;
};

export const DEFAULT_OTP_REQUEST_TIMING: OtpRequestTimingPolicy = {
  providerBudgetMs: 1200,
  publicFloorMs: 1500,
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function settleSendBeforeDeadline(
  provider: AuthProviderAdapter,
  email: string,
  deadlineAtMs: number,
): Promise<void> {
  const remainingMs = deadlineAtMs - performance.now();
  if (remainingMs <= 0) return;

  const controller = new AbortController();
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const work = provider.requestEmailOtp({ email, signal: controller.signal }).catch(() => undefined);
  const deadline = new Promise<void>((resolve) => {
    timeout = setTimeout(() => {
      controller.abort();
      resolve();
    }, remainingMs);
  });

  try {
    await Promise.race([work, deadline]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

async function waitForPublicFloor(startedAtMs: number, publicFloorMs: number): Promise<void> {
  const remaining = startedAtMs + publicFloorMs - performance.now();
  if (remaining > 0) await sleep(remaining);
}

export type RequestPilotOtpResult = { status: 'OTP_REQUESTED' | 'PROVIDER_UNAVAILABLE' };
export async function requestPilotOtp(input: {
  repo: IdentityRepository;
  provider: AuthProviderAdapter;
  email: string;
  rateLimiter?: RateLimiter;
  now?: Date;
  timing?: OtpRequestTimingPolicy;
}): Promise<RequestPilotOtpResult> {
  const email = normalizeLoginEmail(input.email);
  const now = input.now ?? new Date();
  if (input.rateLimiter) {
    const rate = await input.rateLimiter.consume({ scope: 'OTP_REQUEST', keyDigest: digestRateLimitKey(email), now });
    if (!rate.allowed) return { status: 'OTP_REQUESTED' };
  }
  let available = false;
  try { available = await input.provider.checkAvailability(); } catch { available = false; }
  if (!available) return { status: 'PROVIDER_UNAVAILABLE' };

  const timing = input.timing ?? DEFAULT_OTP_REQUEST_TIMING;
  if (timing.providerBudgetMs < 0 || timing.publicFloorMs <= timing.providerBudgetMs) {
    throw new Error('INVALID_OTP_REQUEST_TIMING_POLICY');
  }

  // The membership-sensitive interval starts before the alias lookup. The
  // lookup and any real provider send therefore share one deadline; a slow
  // lookup reduces the remaining send budget instead of extending the allowed
  // branch beyond the unknown branch. The provider receives an AbortSignal so
  // expiry also cancels the underlying delivery attempt rather than detaching it.
  const startedAtMs = performance.now();
  const sensitiveDeadlineAtMs = startedAtMs + timing.providerBudgetMs;
  const allowed = await isPilotAliasAllowed(input.repo, email);
  if (allowed) {
    await settleSendBeforeDeadline(input.provider, email, sensitiveDeadlineAtMs);
  }
  await waitForPublicFloor(startedAtMs, timing.publicFloorMs);
  return { status: 'OTP_REQUESTED' };
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

  const allowed = await isPilotAliasAllowed(input.repo, email);
  let verified;
  try {
    // Always execute provider verification after the address-independent health
    // check, even for an unknown/not-allowed alias. Returning early before this
    // remote operation would leave a repeatable response-time membership oracle.
    verified = await input.provider.verifyEmailOtp({ email, otp: input.otp });
  } catch {
    return { status: 'OTP_INVALID' };
  }
  if (!allowed) return { status: 'OTP_INVALID' };

  const resolution = await resolvePrincipalForVerifiedIdentity(input.repo, verified);
  if (!resolution.ok) return { status: 'ACCESS_DENIED' };
  const { secret } = await issueAccessSession({
    store: input.store,
    principalId: resolution.principal.principalId,
    contextId: resolution.context.contextId,
    aliasId: resolution.alias.aliasId,
    providerIssuer: resolution.alias.providerIssuer,
    providerSubject: resolution.alias.providerSubject,
    now: input.now,
  });
  return { status: 'AUTHENTICATED', principalId: resolution.principal.principalId, contextId: resolution.context.contextId, sessionSecret: secret };
}
