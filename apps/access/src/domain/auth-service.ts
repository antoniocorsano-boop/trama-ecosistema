import type { AuthProviderAdapter } from '../ports/auth-provider.ts';
import type { IdentityRepository } from '../ports/identity-repository.ts';
import type { SessionStore } from '../ports/session-store.ts';
import type { RateLimiter } from '../ports/rate-limiter.ts';
import { digestRateLimitKey } from '../ports/rate-limiter.ts';
import { isPilotAliasAllowed, resolvePrincipalForVerifiedIdentity } from './principal-service.ts';
import { issueAccessSession } from './session-service.ts';
import { normalizeLoginEmail } from './email.ts';
import type { VerifiedExternalIdentity } from './types.ts';

export type OtpRequestTimingPolicy = {
  providerBudgetMs: number;
  publicFloorMs: number;
};

export const DEFAULT_OTP_REQUEST_TIMING: OtpRequestTimingPolicy = {
  providerBudgetMs: 1200,
  publicFloorMs: 1500,
};

export const DEFAULT_OTP_VERIFY_PROVIDER_BUDGET_MS = 1200;
const GLOBAL_PROVIDER_VERIFY_KEY_DIGEST = digestRateLimitKey('trama-access:otp-verify:global');

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function checkAvailabilityBeforeDeadline(
  provider: AuthProviderAdapter,
  deadlineAtMs: number,
): Promise<boolean> {
  const remainingMs = deadlineAtMs - performance.now();
  if (remainingMs <= 0) return false;

  const controller = new AbortController();
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const work = Promise.resolve()
    .then(() => provider.checkAvailability({ signal: controller.signal }))
    .then((available) => Boolean(available))
    .catch(() => false);
  const deadline = new Promise<boolean>((resolve) => {
    timeout = setTimeout(() => {
      controller.abort();
      resolve(false);
    }, remainingMs);
  });

  try {
    return await Promise.race([work, deadline]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
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
  // Invoke the adapter inside a promise boundary so a synchronous throw is
  // normalized exactly like an asynchronously rejected provider operation.
  const work = Promise.resolve()
    .then(() => provider.requestEmailOtp({ email, signal: controller.signal }))
    .catch(() => undefined);
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

async function verifyBeforeDeadline(input: {
  provider: AuthProviderAdapter;
  email: string;
  otp: string;
  deadlineAtMs: number;
}): Promise<VerifiedExternalIdentity | null> {
  const remainingMs = input.deadlineAtMs - performance.now();
  if (remainingMs <= 0) return null;

  const controller = new AbortController();
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const work = Promise.resolve()
    .then(() => input.provider.verifyEmailOtp({ email: input.email, otp: input.otp, signal: controller.signal }))
    .then((identity) => ({ ok: true as const, identity }))
    .catch(() => ({ ok: false as const }));
  const deadline = new Promise<{ ok: false }>((resolve) => {
    timeout = setTimeout(() => {
      controller.abort();
      resolve({ ok: false });
    }, remainingMs);
  });

  try {
    const outcome = await Promise.race([work, deadline]);
    return outcome.ok ? outcome.identity : null;
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

  const timing = input.timing ?? DEFAULT_OTP_REQUEST_TIMING;
  if (timing.providerBudgetMs < 0 || timing.publicFloorMs <= timing.providerBudgetMs) {
    throw new Error('INVALID_OTP_REQUEST_TIMING_POLICY');
  }

  // Availability, alias lookup and any real provider send share one absolute
  // provider deadline. A stalled availability probe is actively aborted rather
  // than retaining an unauthenticated request indefinitely.
  const startedAtMs = performance.now();
  const providerDeadlineAtMs = startedAtMs + timing.providerBudgetMs;
  const available = await checkAvailabilityBeforeDeadline(input.provider, providerDeadlineAtMs);
  if (!available) return { status: 'PROVIDER_UNAVAILABLE' };

  const allowed = await isPilotAliasAllowed(input.repo, email);
  if (allowed) {
    await settleSendBeforeDeadline(input.provider, email, providerDeadlineAtMs);
  }
  await waitForPublicFloor(startedAtMs, timing.publicFloorMs);
  return { status: 'OTP_REQUESTED' };
}

export type VerifyPilotOtpResult =
  | { status: 'AUTHENTICATED'; principalId: string; contextId: string; sessionSecret: string }
  | { status: 'OTP_INVALID' | 'OTP_EXPIRED' | 'PROVIDER_UNAVAILABLE' | 'ACCESS_DENIED' | 'RATE_LIMITED' };
export async function verifyPilotOtp(input: {
  repo: IdentityRepository;
  provider: AuthProviderAdapter;
  store: SessionStore;
  email: string;
  otp: string;
  now: Date;
  rateLimiter?: RateLimiter;
  verifyProviderBudgetMs?: number;
}): Promise<VerifyPilotOtpResult> {
  const email = normalizeLoginEmail(input.email);
  if (input.rateLimiter) {
    const rate = await input.rateLimiter.consume({ scope: 'OTP_VERIFY', keyDigest: digestRateLimitKey(email), now: input.now });
    if (!rate.allowed) return { status: 'RATE_LIMITED' };
    const globalRate = await input.rateLimiter.consume({
      scope: 'OTP_VERIFY_GLOBAL',
      keyDigest: GLOBAL_PROVIDER_VERIFY_KEY_DIGEST,
      now: input.now,
    });
    if (!globalRate.allowed) return { status: 'RATE_LIMITED' };
  }

  const providerBudgetMs = input.verifyProviderBudgetMs ?? DEFAULT_OTP_VERIFY_PROVIDER_BUDGET_MS;
  if (providerBudgetMs <= 0) throw new Error('INVALID_OTP_VERIFY_TIMING_POLICY');

  // Availability and verification share one provider deadline. Negative public
  // verification outcomes are not released before that same deadline, removing
  // response-time distinctions between fast and slow provider rejection paths.
  const startedAtMs = performance.now();
  const providerDeadlineAtMs = startedAtMs + providerBudgetMs;
  const available = await checkAvailabilityBeforeDeadline(input.provider, providerDeadlineAtMs);
  if (!available) return { status: 'PROVIDER_UNAVAILABLE' };

  const allowed = await isPilotAliasAllowed(input.repo, email);
  const verified = await verifyBeforeDeadline({
    provider: input.provider,
    email,
    otp: input.otp,
    deadlineAtMs: providerDeadlineAtMs,
  });
  if (!verified || !allowed) {
    await waitForPublicFloor(startedAtMs, providerBudgetMs);
    return { status: 'OTP_INVALID' };
  }

  const resolution = await resolvePrincipalForVerifiedIdentity(input.repo, verified);
  if (!resolution.ok) {
    await waitForPublicFloor(startedAtMs, providerBudgetMs);
    return { status: 'ACCESS_DENIED' };
  }
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
