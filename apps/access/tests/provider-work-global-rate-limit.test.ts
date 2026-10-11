import test from 'node:test';
import assert from 'node:assert/strict';
import { verifyPilotOtp } from '../src/domain/auth-service.ts';
import { InMemoryIdentityRepository } from '../src/testing/in-memory-identity-repository.ts';
import { InMemoryRateLimiter } from '../src/testing/in-memory-rate-limiter.ts';
import { InMemorySessionStore } from '../src/testing/in-memory-session-store.ts';
import { FakeAuthProvider } from '../src/testing/fake-auth-provider.ts';

test('rotating email addresses cannot exceed the shared provider verification budget', async () => {
  const provider = new FakeAuthProvider({
    issuer: 'issuer-1',
    subject: 'subject-1',
    email: 'nobody@example.test',
    otp: '123456',
  });
  const rateLimiter = new InMemoryRateLimiter();
  const repo = new InMemoryIdentityRepository();
  const store = new InMemorySessionStore();
  const now = new Date('2026-10-11T10:00:00Z');

  const results = [];
  for (let index = 0; index < 21; index += 1) {
    results.push(await verifyPilotOtp({
      repo,
      provider,
      store,
      rateLimiter,
      email: `rotating-${index}@example.test`,
      otp: '000000',
      now,
      verifyProviderBudgetMs: 2,
    }));
  }

  assert.equal(provider.verifyCount, 20, 'provider verification must have a global cap across rotating email keys');
  assert.equal(
    results.filter((result) => result.status === 'RATE_LIMITED').length,
    1,
    'the first attempt beyond the shared provider budget must be rejected before provider work',
  );
});
