import test from 'node:test';
import assert from 'node:assert/strict';
import { requestPilotMagicLink, verifyPilotMagicLink } from '../src/domain/auth-service.ts';
import { InMemoryIdentityRepository } from '../src/testing/in-memory-identity-repository.ts';
import { InMemorySessionStore } from '../src/testing/in-memory-session-store.ts';
import { InMemoryRateLimiter } from '../src/testing/in-memory-rate-limiter.ts';
import { FakeAuthProvider } from '../src/testing/fake-auth-provider.ts';

const now = new Date('2026-10-11T10:00:00Z');
const codeVerifier = 'v'.repeat(43);

function fixture(entitled = true) {
  const repo = new InMemoryIdentityRepository({
    principals: [{ principalId: 'p1', status: 'ACTIVE' }],
    aliases: [{ aliasId: 'a1', principalId: 'p1', kind: 'EMAIL', normalizedValue: 'teacher@example.test', status: 'ACTIVE', providerIssuer: 'issuer-1', providerSubject: 'subject-1', pilotAllowed: true }],
    contexts: [{ contextId: 'c1', principalId: 'p1', contextType: 'INSTITUTION', institutionRef: 'inst:1', status: 'ACTIVE' }],
    entitlements: entitled ? [{ entitlementId: 'e1', principalId: 'p1', contextId: 'c1', applicationKey: 'DOCENTE_OS', entitlementKey: 'USE', status: 'ACTIVE', validFrom: new Date('2026-10-10T00:00:00Z') }] : [],
  });
  const store = new InMemorySessionStore();
  const provider = new FakeAuthProvider({ issuer: 'issuer-1', subject: 'subject-1', email: 'teacher@example.test', otp: 'legacy-only' });
  return { repo, store, provider, rateLimiter: new InMemoryRateLimiter() };
}

test('Magic Link request is neutral and sends only for the pre-authorized alias', async () => {
  const f = fixture();
  const redirectTo = 'https://access.example.test/auth/confirm';
  const allowed = await requestPilotMagicLink({ repo: f.repo, provider: f.provider, email: 'teacher@example.test', redirectTo, codeVerifier, now, timing: { providerBudgetMs: 50, publicFloorMs: 60 } });
  const unknown = await requestPilotMagicLink({ repo: f.repo, provider: f.provider, email: 'unknown@example.test', redirectTo, codeVerifier, now, timing: { providerBudgetMs: 50, publicFloorMs: 60 } });
  assert.deepEqual(allowed, { status: 'MAGIC_LINK_REQUESTED' });
  assert.deepEqual(unknown, { status: 'MAGIC_LINK_REQUESTED' });
  assert.equal(f.provider.requestCount, 1);
  assert.equal(f.provider.lastMagicLinkEmail, 'teacher@example.test');
  assert.equal(f.provider.lastMagicLinkRedirectTo, redirectTo);
  assert.equal(f.provider.lastMagicLinkCodeVerifier, codeVerifier);
});

test('valid Magic Link callback with exact binding and active entitlement creates one local session', async () => {
  const f = fixture(true);
  const result = await verifyPilotMagicLink({ repo: f.repo, provider: f.provider, store: f.store, callback: { code: 'valid-code', codeVerifier }, now, rateLimiter: f.rateLimiter, verifyProviderBudgetMs: 100 });
  assert.equal(result.status, 'AUTHENTICATED');
  assert.equal(f.store.records.length, 1);
  assert.equal(f.store.records[0]?.providerIssuer, 'issuer-1');
  assert.equal(f.store.records[0]?.providerSubject, 'subject-1');
});

test('verified email cannot relink an unexpected provider subject', async () => {
  const f = fixture(true);
  f.provider.subject = 'different-subject';
  const result = await verifyPilotMagicLink({ repo: f.repo, provider: f.provider, store: f.store, callback: { code: 'valid-code', codeVerifier }, now, rateLimiter: f.rateLimiter, verifyProviderBudgetMs: 100 });
  assert.equal(result.status, 'ACCESS_DENIED');
  assert.equal(f.store.records.length, 0);
  assert.equal(f.provider.logoutCount, 1);
});

test('provider-authenticated identity without an active entitlement fails closed and logs provider out', async () => {
  const f = fixture(false);
  const result = await verifyPilotMagicLink({ repo: f.repo, provider: f.provider, store: f.store, callback: { tokenHash: 'valid-hash', type: 'magiclink' }, now, rateLimiter: f.rateLimiter, verifyProviderBudgetMs: 100 });
  assert.equal(result.status, 'ACCESS_DENIED');
  assert.equal(f.store.records.length, 0);
  assert.equal(f.provider.logoutCount, 1);
});

test('Magic Link provider timeout creates no local session', async () => {
  const f = fixture(true);
  f.provider.verifyDelayMs = 80;
  const result = await verifyPilotMagicLink({ repo: f.repo, provider: f.provider, store: f.store, callback: { code: 'slow-code', codeVerifier }, now, rateLimiter: f.rateLimiter, verifyProviderBudgetMs: 20 });
  assert.equal(result.status, 'MAGIC_LINK_INVALID');
  assert.equal(f.store.records.length, 0);
  assert.equal(f.provider.verifyAbortCount, 1);
});
