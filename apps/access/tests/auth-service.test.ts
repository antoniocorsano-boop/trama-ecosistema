import test from 'node:test';
import assert from 'node:assert/strict';
import { InMemoryIdentityRepository } from '../src/testing/in-memory-identity-repository.ts';
import { InMemorySessionStore } from '../src/testing/in-memory-session-store.ts';
import { FakeAuthProvider } from '../src/testing/fake-auth-provider.ts';
import { requestPilotMagicLink, verifyPilotMagicLink } from '../src/domain/auth-service.ts';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const redirectTo = 'https://access.example.test/auth/confirm';
const codeVerifier = 'v'.repeat(43);

function fixture() {
  const repo = new InMemoryIdentityRepository({
    principals: [{ principalId: 'p1', status: 'ACTIVE' }],
    aliases: [{ aliasId: 'a1', principalId: 'p1', kind: 'EMAIL', normalizedValue: 'teacher@example.test', status: 'ACTIVE', providerIssuer: 'issuer-1', providerSubject: 'subject-1', pilotAllowed: true }],
    contexts: [{ contextId: 'c1', principalId: 'p1', contextType: 'INSTITUTION', institutionRef: 'inst:1', status: 'ACTIVE' }],
    entitlements: [{ entitlementId: 'e1', principalId: 'p1', contextId: 'c1', applicationKey: 'DOCENTE_OS', entitlementKey: 'USE', status: 'ACTIVE', validFrom: new Date('2026-01-01T00:00:00Z') }],
  });
  const provider = new FakeAuthProvider({ issuer: 'issuer-1', subject: 'subject-1', email: 'teacher@example.test', otp: 'legacy-unused' });
  return { repo, provider, store: new InMemorySessionStore() };
}

test('allowed and unknown email return same neutral Magic Link request result', async () => {
  const f = fixture();
  assert.deepEqual(await requestPilotMagicLink({ repo: f.repo, provider: f.provider, email: 'teacher@example.test', redirectTo, codeVerifier }), { status: 'MAGIC_LINK_REQUESTED' });
  assert.equal(f.provider.requestCount, 1);
  assert.deepEqual(await requestPilotMagicLink({ repo: f.repo, provider: f.provider, email: 'nobody@example.test', redirectTo, codeVerifier }), { status: 'MAGIC_LINK_REQUESTED' });
  assert.equal(f.provider.requestCount, 1);
});

test('request path uses the same public response floor without sending to unknown aliases', async () => {
  const timing = { providerBudgetMs: 60, publicFloorMs: 80 };

  const allowed = fixture();
  allowed.provider.requestDelayMs = 40;
  const allowedStarted = performance.now();
  assert.deepEqual(await requestPilotMagicLink({ repo: allowed.repo, provider: allowed.provider, email: 'teacher@example.test', redirectTo, codeVerifier, timing }), { status: 'MAGIC_LINK_REQUESTED' });
  const allowedElapsed = performance.now() - allowedStarted;
  assert.equal(allowed.provider.requestCount, 1);

  const unknown = fixture();
  unknown.provider.requestDelayMs = 40;
  const unknownStarted = performance.now();
  assert.deepEqual(await requestPilotMagicLink({ repo: unknown.repo, provider: unknown.provider, email: 'nobody@example.test', redirectTo, codeVerifier, timing }), { status: 'MAGIC_LINK_REQUESTED' });
  const unknownElapsed = performance.now() - unknownStarted;
  assert.equal(unknown.provider.requestCount, 0);

  assert.ok(allowedElapsed >= 70, `allowed path returned too early: ${allowedElapsed}ms`);
  assert.ok(unknownElapsed >= 70, `unknown path returned too early: ${unknownElapsed}ms`);
  assert.ok(Math.abs(allowedElapsed - unknownElapsed) < 30, `request timing diverged: allowed=${allowedElapsed} unknown=${unknownElapsed}`);
});

test('request timing budget includes the membership-sensitive alias lookup', async () => {
  const timing = { providerBudgetMs: 120, publicFloorMs: 160 };

  const allowed = fixture();
  const allowedLookup = allowed.repo.findAliasByEmail.bind(allowed.repo);
  allowed.repo.findAliasByEmail = async (email) => {
    await sleep(80);
    return allowedLookup(email);
  };
  allowed.provider.requestDelayMs = 120;
  const allowedStarted = performance.now();
  assert.deepEqual(await requestPilotMagicLink({ repo: allowed.repo, provider: allowed.provider, email: 'teacher@example.test', redirectTo, codeVerifier, timing }), { status: 'MAGIC_LINK_REQUESTED' });
  const allowedElapsed = performance.now() - allowedStarted;

  const unknown = fixture();
  const unknownLookup = unknown.repo.findAliasByEmail.bind(unknown.repo);
  unknown.repo.findAliasByEmail = async (email) => {
    await sleep(80);
    return unknownLookup(email);
  };
  unknown.provider.requestDelayMs = 120;
  const unknownStarted = performance.now();
  assert.deepEqual(await requestPilotMagicLink({ repo: unknown.repo, provider: unknown.provider, email: 'nobody@example.test', redirectTo, codeVerifier, timing }), { status: 'MAGIC_LINK_REQUESTED' });
  const unknownElapsed = performance.now() - unknownStarted;

  assert.equal(allowed.provider.requestCount, 1);
  assert.equal(unknown.provider.requestCount, 0);
  assert.ok(allowedElapsed < 190, `allowed path exceeded common deadline: ${allowedElapsed}ms`);
  assert.ok(unknownElapsed < 190, `unknown path exceeded common deadline: ${unknownElapsed}ms`);
  assert.ok(Math.abs(allowedElapsed - unknownElapsed) < 25, `lookup reopened timing oracle: allowed=${allowedElapsed} unknown=${unknownElapsed}`);
});

test('provider send is actually aborted when the request budget expires', async () => {
  const f = fixture();
  f.provider.requestDelayMs = 200;
  const timing = { providerBudgetMs: 40, publicFloorMs: 70 };

  assert.deepEqual(await requestPilotMagicLink({ repo: f.repo, provider: f.provider, email: 'teacher@example.test', redirectTo, codeVerifier, timing }), { status: 'MAGIC_LINK_REQUESTED' });
  assert.equal(f.provider.requestCount, 1);
  await sleep(180);
  assert.equal(f.provider.requestAbortCount, 1);
  assert.equal(f.provider.requestCompletionCount, 0);
});

test('synchronous provider send failure remains neutral', async () => {
  const f = fixture();
  f.provider.requestEmailMagicLink = () => {
    throw new Error('SYNC_PROVIDER_FAILURE');
  };
  const timing = { providerBudgetMs: 30, publicFloorMs: 50 };
  assert.deepEqual(
    await requestPilotMagicLink({ repo: f.repo, provider: f.provider, email: 'teacher@example.test', redirectTo, codeVerifier, timing }),
    { status: 'MAGIC_LINK_REQUESTED' },
  );
});

test('send-time provider failure remains neutral to avoid allowlist enumeration', async () => {
  const f = fixture();
  f.provider.requestFailure = true;
  assert.deepEqual(await requestPilotMagicLink({ repo: f.repo, provider: f.provider, email: 'teacher@example.test', redirectTo, codeVerifier }), { status: 'MAGIC_LINK_REQUESTED' });
  assert.deepEqual(await requestPilotMagicLink({ repo: f.repo, provider: f.provider, email: 'nobody@example.test', redirectTo, codeVerifier }), { status: 'MAGIC_LINK_REQUESTED' });
});

test('invalid Magic Link callback creates no local session', async () => {
  const f = fixture();
  f.provider.verifyFailure = 'INVALID';
  const result = await verifyPilotMagicLink({ repo: f.repo, provider: f.provider, store: f.store, callback: { code: 'invalid', codeVerifier }, now: new Date(), verifyProviderBudgetMs: 50 });
  assert.deepEqual(result, { status: 'MAGIC_LINK_INVALID' });
  assert.equal(f.store.records.length, 0);
});

test('provider verification is bounded and actually aborted', async () => {
  const f = fixture();
  f.provider.verifyDelayMs = 200;
  const result = await Promise.race([
    verifyPilotMagicLink({ repo: f.repo, provider: f.provider, store: f.store, callback: { code: 'slow', codeVerifier }, now: new Date(), verifyProviderBudgetMs: 40 }),
    sleep(200).then(() => ({ status: 'TEST_TIMEOUT' as const })),
  ]);
  assert.deepEqual(result, { status: 'MAGIC_LINK_INVALID' });
  assert.equal(f.provider.verifyAbortCount, 1);
  assert.equal(f.store.records.length, 0);
});

test('provider callback failures map to neutral invalid-link result after a healthy availability check', async () => {
  const f = fixture();
  f.provider.verifyFailure = 'UNAVAILABLE';
  assert.deepEqual(await verifyPilotMagicLink({ repo: f.repo, provider: f.provider, store: f.store, callback: { code: 'provider-failed', codeVerifier }, now: new Date(), verifyProviderBudgetMs: 50 }), { status: 'MAGIC_LINK_INVALID' });
  f.provider.verifyFailure = 'EXPIRED';
  assert.deepEqual(await verifyPilotMagicLink({ repo: f.repo, provider: f.provider, store: f.store, callback: { code: 'expired', codeVerifier }, now: new Date(), verifyProviderBudgetMs: 50 }), { status: 'MAGIC_LINK_INVALID' });
  assert.equal(f.store.records.length, 0);
});

test('valid Magic Link and exact governed binding with entitlement creates access session', async () => {
  const f = fixture();
  const result = await verifyPilotMagicLink({ repo: f.repo, provider: f.provider, store: f.store, callback: { code: 'valid', codeVerifier }, now: new Date('2026-10-11T10:00:00Z') });
  assert.equal(result.status, 'AUTHENTICATED');
  if (result.status === 'AUTHENTICATED') assert.equal(result.principalId, 'p1');
  assert.equal(f.store.records.length, 1);
});

test('unbound provider subject creates no session and logs provider out', async () => {
  const f = fixture();
  f.provider.subject = 'subject-other';
  assert.deepEqual(await verifyPilotMagicLink({ repo: f.repo, provider: f.provider, store: f.store, callback: { code: 'valid', codeVerifier }, now: new Date(), verifyProviderBudgetMs: 50 }), { status: 'ACCESS_DENIED' });
  assert.equal(f.store.records.length, 0);
  assert.equal(f.provider.logoutCount, 1);
});

test('verified email mismatch fails closed without email-based linking', async () => {
  const f = fixture();
  f.provider.email = 'other@example.test';
  assert.deepEqual(await verifyPilotMagicLink({ repo: f.repo, provider: f.provider, store: f.store, callback: { code: 'valid', codeVerifier }, now: new Date(), verifyProviderBudgetMs: 50 }), { status: 'ACCESS_DENIED' });
  assert.equal(f.store.records.length, 0);
});
