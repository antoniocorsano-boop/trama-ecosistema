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

test('rotating callbacks cannot exceed the shared provider verification budget', async () => {
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

  assert.equal(provider.verifyCount, 20, 'provider verification must have a global cap across callback attempts');
  assert.equal(
    results.filter((result) => result.status === 'RATE_LIMITED').length,
    1,
    'the first attempt beyond the shared provider budget must be rejected before provider work',
  );
});

test('rotating email addresses cannot exceed the shared Magic Link request-work budget', async () => {
  let availabilityCount = 0;
  const provider: AuthProviderAdapter = {
    async checkAvailability() {
      availabilityCount += 1;
      return true;
    },
    async requestEmailOtp() { throw new Error('legacy-unused'); },
    async verifyEmailOtp(): Promise<VerifiedExternalIdentity> { throw new Error('legacy-unused'); },
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
