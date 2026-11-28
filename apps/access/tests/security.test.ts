import test from 'node:test';
import assert from 'node:assert/strict';
import { InMemoryRateLimiter } from '../src/testing/in-memory-rate-limiter.ts';
import { digestRateLimitKey } from '../src/ports/rate-limiter.ts';
import { assertSameOrigin } from '../src/server/origin-guard.ts';
import { sanitizeAuditEvent } from '../src/server/audit.ts';
import { InMemoryIdentityRepository } from '../src/testing/in-memory-identity-repository.ts';
import { FakeAuthProvider } from '../src/testing/fake-auth-provider.ts';
import { requestPilotMagicLink } from '../src/domain/auth-service.ts';

const now = new Date('2026-10-11T10:00:00Z');
const redirectTo = 'https://access.example.test/auth/confirm';
const codeVerifier = 'v'.repeat(43);

test('rate limiter enforces 5 request and 10 verify attempts per 15 minutes', async () => {
  const limiter = new InMemoryRateLimiter();
  const keyDigest = digestRateLimitKey('teacher@example.test');
  for (let i = 0; i < 5; i++) assert.equal((await limiter.consume({ scope: 'OTP_REQUEST', keyDigest, now })).allowed, true);
  assert.equal((await limiter.consume({ scope: 'OTP_REQUEST', keyDigest, now })).allowed, false);
  for (let i = 0; i < 10; i++) assert.equal((await limiter.consume({ scope: 'OTP_VERIFY', keyDigest, now })).allowed, true);
  assert.equal((await limiter.consume({ scope: 'OTP_VERIFY', keyDigest, now })).allowed, false);
  assert.equal((await limiter.consume({ scope: 'OTP_REQUEST', keyDigest, now: new Date('2026-10-11T10:16:00Z') })).allowed, true);
});

test('rate limiter persists only digests, never raw email', async () => {
  const limiter = new InMemoryRateLimiter();
  const email = 'teacher@example.test';
  const keyDigest = digestRateLimitKey(email);
  await limiter.consume({ scope: 'OTP_REQUEST', keyDigest, now });
  assert.equal(JSON.stringify(limiter.entries).includes(email), false);
  assert.equal(JSON.stringify(limiter.entries).includes(keyDigest), true);
});

test('same-origin guard rejects missing or mismatched origin and accepts exact origin', () => {
  const exact = new Request('https://access.example.test/api', { method: 'POST', headers: { Origin: 'https://access.example.test' } });
  assert.doesNotThrow(() => assertSameOrigin(exact, 'https://access.example.test'));
  const missing = new Request('https://access.example.test/api', { method: 'POST' });
  assert.throws(() => assertSameOrigin(missing, 'https://access.example.test'));
  const other = new Request('https://access.example.test/api', { method: 'POST', headers: { Origin: 'https://evil.test' } });
  assert.throws(() => assertSameOrigin(other, 'https://access.example.test'));
});

test('audit sanitizer strips sensitive raw fields', () => {
  const event = sanitizeAuditEvent({ type: 'OTP_VERIFY_DENIED', principalId: 'p1', email: 'teacher@example.test', otp: '123456', token: 'abc', cookie: 'raw', sessionSecret: 'secret' });
  const serialized = JSON.stringify(event);
  assert.equal(serialized.includes('teacher@example.test'), false);
  assert.equal(serialized.includes('123456'), false);
  assert.equal(serialized.includes('abc'), false);
  assert.equal(serialized.includes('raw'), false);
  assert.equal(serialized.includes('secret'), false);
  assert.equal(event.type, 'OTP_VERIFY_DENIED');
});

test('provider outage does not reveal allowlist membership', async () => {
  const repo = new InMemoryIdentityRepository({
    principals: [{ principalId: 'p1', status: 'ACTIVE' }],
    aliases: [{ aliasId: 'a1', principalId: 'p1', kind: 'EMAIL', normalizedValue: 'teacher@example.test', status: 'ACTIVE', providerIssuer: 'issuer-1', providerSubject: 'subject-1', pilotAllowed: true }],
    contexts: [{ contextId: 'c1', principalId: 'p1', contextType: 'INSTITUTION', institutionRef: 'inst:1', status: 'ACTIVE' }]
  });
  const provider = new FakeAuthProvider({ issuer: 'issuer-1', subject: 'subject-1', email: 'teacher@example.test', otp: 'legacy-unused' });
  provider.available = false;
  const allowed = await requestPilotMagicLink({ repo, provider, email: 'teacher@example.test', redirectTo, codeVerifier });
  const unknown = await requestPilotMagicLink({ repo, provider, email: 'unknown@example.test', redirectTo, codeVerifier });
  assert.deepEqual(allowed, { status: 'PROVIDER_UNAVAILABLE' });
  assert.deepEqual(unknown, { status: 'PROVIDER_UNAVAILABLE' });
});
