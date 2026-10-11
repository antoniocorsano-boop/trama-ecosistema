import test from 'node:test';
import assert from 'node:assert/strict';
import type { AuthProviderAdapter } from '../src/ports/auth-provider.ts';
import type { VerifiedExternalIdentity } from '../src/domain/types.ts';
import { requestPilotMagicLink, verifyPilotMagicLink } from '../src/domain/auth-service.ts';
import { InMemoryIdentityRepository } from '../src/testing/in-memory-identity-repository.ts';
import { InMemoryRateLimiter } from '../src/testing/in-memory-rate-limiter.ts';
import { InMemorySessionStore } from '../src/testing/in-memory-session-store.ts';
import { FakeAuthProvider } from '../src/testing/fake-auth-provider.ts';

const redirectTo = 'https://access.example.test/auth/confirm';

test('rotating callbacks are globally capped while repeated verified identity is also capped', async () => {
  const provider = new FakeAuthProvider({
    issuer: 'issuer-1',
    subject: 'subject-1',
    email: 'nobody@example.test',
    otp: 'legacy-unused',
  });
  const rateLimiter = new InMemoryRateLimiter();
  const repo = new InMemoryIdentityRepository();
  const store = new InMemorySessionStore();
  const now = new Date('2026-10-11T10:00:00Z');

  const results = [];
  for (let index = 0; index < 21; index += 1) {
    results.push(await verifyPilotMagicLink({
      repo,
      provider,
      store,
      rateLimiter,
      callback: { code: `rotating-${index}` },
      now,
      verifyProviderBudgetMs: 2,
    }));
  }

  const globalConsumes = rateLimiter.entries.filter((entry) => entry.scope === 'OTP_VERIFY_GLOBAL').length;
  const identityConsumes = rateLimiter.entries.filter((entry) => entry.scope === 'OTP_VERIFY').length;

  assert.equal(provider.verifyCount, 20, 'the global budget must stop provider verification before attempt 21');
  assert.equal(globalConsumes, 20, 'the shared global verification budget must contain exactly 20 accepted consumptions');
  assert.equal(identityConsumes, 10, 'the repeated verified identity must stop consuming after its 10-attempt budget');
  assert.equal(
    results.filter((result) => result.status === 'RATE_LIMITED').length,
    11,
    'attempts 11-20 are denied by the identity budget and attempt 21 by the global provider budget',
  );
  assert.equal(results[20]?.status, 'RATE_LIMITED', 'the first attempt beyond the global provider budget must be rejected before provider work');
});

test('rotating email addresses cannot exceed the shared Magic Link request-work budget', async () => {
  let availabilityCount = 0;
  const provider: AuthProviderAdapter = {
    async checkAvailability() {
      availabilityCount += 1;
      return true;
    },
    async requestEmailMagicLink() {
      throw new Error('SEND_MUST_NOT_RUN_FOR_UNKNOWN_ALIAS');
    },
    async verifyEmailMagicLink(): Promise<VerifiedExternalIdentity> {
      throw new Error('VERIFY_MUST_NOT_RUN');
    },
  };
  const rateLimiter = new InMemoryRateLimiter();
  const repo = new InMemoryIdentityRepository();
  const now = new Date('2026-10-11T10:00:00Z');

  const results = [];
  for (let index = 0; index < 21; index += 1) {
    results.push(await requestPilotMagicLink({
      repo,
      provider,
      rateLimiter,
      email: `request-rotating-${index}@example.test`,
      redirectTo,
      now,
      timing: { providerBudgetMs: 2, publicFloorMs: 5 },
    }));
  }

  assert.equal(availabilityCount, 20, 'provider request work must have a global cap across rotating email keys');
  assert.equal(
    results.filter((result) => result.status === 'MAGIC_LINK_REQUESTED').length,
    21,
    'request throttling must preserve the neutral public request result',
  );
});
