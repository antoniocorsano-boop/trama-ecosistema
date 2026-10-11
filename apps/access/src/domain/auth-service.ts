import type { AuthProviderAdapter, MagicLinkCallbackInput } from '../ports/auth-provider.ts';
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
const GLOBAL_PROVIDER_REQUEST_KEY_DIGEST = digestRateLimitKey('trama-access:otp-request:global');
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

async function isPilotAliasAllowedBeforeDeadline(
  repo: IdentityRepository,
  email: string,
  deadlineAtMs: number,
): Promise<boolean> {
  const remainingMs = deadlineAtMs - performance.now();
  if (remainingMs <= 0) return false;

  const controller = new AbortController();
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const work = Promise.resolve()
    .then(() => isPilotAliasAllowed(repo, email, { signal: controller.signal }))
    .then((allowed) => Boolean(allowed))
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

async function settleMagicLinkSendBeforeDeadline(input: {
  provider: AuthProviderAdapter;
  email: string;
  redirectTo: string;
  deadlineAtMs: number;
}): Promise<void> {
  const remainingMs = input.deadlineAtMs - performance.now();
  if (remainingMs <= 0) return;

  const controller = new AbortController();
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const work = Promise.resolve()
    .then(() => input.provider.requestEmailMagicLink({
      email: input.email,
      redirectTo: input.redirectTo,
      signal: controller.signal,
    }))
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

async function verifyMagicLinkBeforeDeadline(input: {
  provider: AuthProviderAdapter;
  callback: MagicLinkCallbackInput;
  deadlineAtMs: number;
}): Promise<VerifiedExternalIdentity | null> {
  const remainingMs = input.deadlineAtMs - performance.now();
  if (remainingMs <= 0) return null;

  const controller = new AbortController();
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const work = Promise.resolve()
    .then(() => input.provider.verifyEmailMagicLink({ ...input.callback, signal: controller.signal }))
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

export type RequestPilotMagicLinkResult = { status: 'MAGIC_LINK_REQUESTED' | 'PROVIDER_UNAVAILABLE' };
export async function requestPilotMagicLink(input: {
  repo: IdentityRepository;
  provider: AuthProviderAdapter;
  email: string;
  redirectTo: string;
  rateLimiter?: RateLimiter;
  now?: Date;
  timing?: OtpRequestTimingPolicy;
}): Promise<RequestPilotMagicLinkResult> {
  const email = normalizeLoginEmail(input.email);
  const now = input.now ?? new Date();
  if (input.rateLimiter) {
    const rate = await input.rateLimiter.consume({ scope: 'OTP_REQUEST', keyDigest: digestRateLimitKey(email), now });
    if (!rate.allowed) return { status: 'MAGIC_LINK_REQUESTED' };
    const globalRate = await input.rateLimiter.consume({
      scope: 'OTP_REQUEST_GLOBAL',
      keyDigest: GLOBAL_PROVIDER_REQUEST_KEY_DIGEST,
      now,
    });
    if (!globalRate.allowed) return { status: 'MAGIC_LINK_REQUESTED' };
  }

  const timing = input.timing ?? DEFAULT_OTP_REQUEST_TIMING;
  if (timing.providerBudgetMs < 0 || timing.publicFloorMs <= timing.providerBudgetMs) {
    throw new Error('INVALID_MAGIC_LINK_REQUEST_TIMING_POLICY');
  }

  const startedAtMs = performance.now();
  const providerDeadlineAtMs = startedAtMs + timing.providerBudgetMs;
  const available = await checkAvailabilityBeforeDeadline(input.provider, providerDeadlineAtMs);
  if (!available) return { status: 'PROVIDER_UNAVAILABLE' };

  const allowed = await isPilotAliasAllowedBeforeDeadline(input.repo, email, providerDeadlineAtMs);
  if (allowed) {
    await settleMagicLinkSendBeforeDeadline({
      provider: input.provider,
      email,
      redirectTo: input.redirectTo,
      deadlineAtMs: providerDeadlineAtMs,
    });
  }
  await waitForPublicFloor(startedAtMs, timing.publicFloorMs);
  return { status: 'MAGIC_LINK_REQUESTED' };
}

export type VerifyPilotMagicLinkResult =
  | { status: 'AUTHENTICATED'; principalId: string; contextId: string; sessionSecret: string }
  | { status: 'MAGIC_LINK_INVALID' | 'PROVIDER_UNAVAILABLE' | 'ACCESS_DENIED' | 'RATE_LIMITED' };

export async function verifyPilotMagicLink(input: {
  repo: IdentityRepository;
  provider: AuthProviderAdapter;
  store: SessionStore;
  callback: MagicLinkCallbackInput;
  now: Date;
  rateLimiter?: RateLimiter;
  verifyProviderBudgetMs?: number;
}): Promise<VerifyPilotMagicLinkResult> {
  if (input.rateLimiter) {
    const globalRate = await input.rateLimiter.consume({
      scope: 'OTP_VERIFY_GLOBAL',
      keyDigest: GLOBAL_PROVIDER_VERIFY_KEY_DIGEST,
      now: input.now,
    });
    if (!globalRate.allowed) return { status: 'RATE_LIMITED' };
  }

  const providerBudgetMs = input.verifyProviderBudgetMs ?? DEFAULT_OTP_VERIFY_PROVIDER_BUDGET_MS;
  if (providerBudgetMs <= 0) throw new Error('INVALID_MAGIC_LINK_VERIFY_TIMING_POLICY');

  const startedAtMs = performance.now();
  const providerDeadlineAtMs = startedAtMs + providerBudgetMs;
  const available = await checkAvailabilityBeforeDeadline(input.provider, providerDeadlineAtMs);
  if (!available) return { status: 'PROVIDER_UNAVAILABLE' };

  const verified = await verifyMagicLinkBeforeDeadline({
    provider: input.provider,
    callback: input.callback,
    deadlineAtMs: providerDeadlineAtMs,
  });
  if (!verified) {
    await waitForPublicFloor(startedAtMs, providerBudgetMs);
    return { status: 'MAGIC_LINK_INVALID' };
  }

  if (input.rateLimiter) {
    const identityRateKey = verified.verifiedEmail
      ? normalizeLoginEmail(verified.verifiedEmail)
      : `${verified.issuer}:${verified.subject}`;
    const rate = await input.rateLimiter.consume({
      scope: 'OTP_VERIFY',
      keyDigest: digestRateLimitKey(identityRateKey),
      now: input.now,
    });
    if (!rate.allowed) {
      await input.provider.bestEffortLogout?.();
      return { status: 'RATE_LIMITED' };
    }
  }

  const resolution = await resolvePrincipalForVerifiedIdentity(input.repo, verified);
  if (!resolution.ok) {
    await input.provider.bestEffortLogout?.();
    await waitForPublicFloor(startedAtMs, providerBudgetMs);
    return { status: 'ACCESS_DENIED' };
  }

  const entitlements = await input.repo.listEntitlements(
    resolution.principal.principalId,
    resolution.context.contextId,
    input.now,
  );
  if (entitlements.length === 0) {
    await input.provider.bestEffortLogout?.();
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
  return {
    status: 'AUTHENTICATED',
    principalId: resolution.principal.principalId,
    contextId: resolution.context.contextId,
    sessionSecret: secret,
  };
}
