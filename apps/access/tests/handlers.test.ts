import test from 'node:test';
import assert from 'node:assert/strict';
import { InMemoryIdentityRepository } from '../src/testing/in-memory-identity-repository.ts';
import { InMemorySessionStore } from '../src/testing/in-memory-session-store.ts';
import { InMemoryRateLimiter } from '../src/testing/in-memory-rate-limiter.ts';
import { FakeAuthProvider } from '../src/testing/fake-auth-provider.ts';
import { APPLICATION_REGISTRY } from '../src/config/application-registry.ts';
import type { AccessRuntime } from '../src/server/runtime.ts';
import { handleRequestMagicLink } from '../src/server/handlers/request-magic-link.ts';
import { handleMagicLinkCallback } from '../src/server/handlers/magic-link-callback.ts';
import { handleLogout } from '../src/server/handlers/logout.ts';
import { handleLaunch } from '../src/server/handlers/launch.ts';

function runtime(entitled = true): AccessRuntime {
  const repo = new InMemoryIdentityRepository({
    principals: [{ principalId: 'p1', status: 'ACTIVE' }],
    aliases: [{ aliasId: 'a1', principalId: 'p1', kind: 'EMAIL', normalizedValue: 'teacher@example.test', status: 'ACTIVE', providerIssuer: 'issuer-1', providerSubject: 'subject-1', pilotAllowed: true }],
    contexts: [{ contextId: 'c1', principalId: 'p1', contextType: 'INSTITUTION', institutionRef: 'inst:1', status: 'ACTIVE' }],
    entitlements: entitled ? [{ entitlementId: 'e1', principalId: 'p1', contextId: 'c1', applicationKey: 'DOCENTE_OS', entitlementKey: 'USE', status: 'ACTIVE', validFrom: new Date('2026-10-10T00:00:00Z') }] : [],
  });
  return {
    config: { origin: 'https://access.example.test', providerKind: 'fake', storeKind: 'memory', sessionTtlSeconds: 28800, nodeEnv: 'test' },
    identityRepository: repo,
    sessionStore: new InMemorySessionStore(),
    rateLimiter: new InMemoryRateLimiter(),
    authProvider: new FakeAuthProvider({ issuer: 'issuer-1', subject: 'subject-1', email: 'teacher@example.test', otp: 'legacy-unused' }),
    applicationRegistry: APPLICATION_REGISTRY,
    now: () => new Date('2026-10-11T10:00:00Z'),
  };
}

const post = (path: string, body: unknown, cookie?: string, origin = 'https://access.example.test') => new Request(`https://access.example.test${path}`, {
  method: 'POST',
  headers: { Origin: origin, 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) },
  body: JSON.stringify(body),
});

async function authenticate(r: AccessRuntime): Promise<string> {
  const requested = await handleRequestMagicLink(post('/api/auth/request-magic-link', { email: 'teacher@example.test' }), r);
  assert.equal(requested.status, 202);
  const callback = await handleMagicLinkCallback(new Request('https://access.example.test/auth/confirm?code=valid-code'), r);
  assert.equal(callback.status, 303);
  const pair = (callback.headers.get('set-cookie') ?? '').split(';')[0]!;
  assert.match(pair, /^__Host-trama_access_session=/);
  return pair;
}

test('request Magic Link is neutral for allowed and unknown aliases', async () => {
  const r = runtime();
  const allowed = await handleRequestMagicLink(post('/api/auth/request-magic-link', { email: 'teacher@example.test' }), r);
  const unknown = await handleRequestMagicLink(post('/api/auth/request-magic-link', { email: 'unknown@example.test' }), r);
  assert.equal(allowed.status, 202);
  assert.equal(unknown.status, 202);
  assert.deepEqual(await allowed.json(), { status: 'MAGIC_LINK_REQUESTED' });
  assert.deepEqual(await unknown.json(), { status: 'MAGIC_LINK_REQUESTED' });
});

test('send-time Magic Link failure stays publicly neutral', async () => {
  const r = runtime();
  (r.authProvider as FakeAuthProvider).requestFailure = true;
  const allowed = await handleRequestMagicLink(post('/api/auth/request-magic-link', { email: 'teacher@example.test' }), r);
  const unknown = await handleRequestMagicLink(post('/api/auth/request-magic-link', { email: 'unknown@example.test' }), r);
  assert.equal(allowed.status, 202);
  assert.equal(unknown.status, 202);
  assert.deepEqual(await allowed.json(), { status: 'MAGIC_LINK_REQUESTED' });
  assert.deepEqual(await unknown.json(), { status: 'MAGIC_LINK_REQUESTED' });
});

test('request Magic Link rejects malformed payload and provider outage safely', async () => {
  const r = runtime();
  const malformed = await handleRequestMagicLink(post('/api/auth/request-magic-link', { email: 'not-an-email' }), r);
  assert.equal(malformed.status, 400);
  (r.authProvider as FakeAuthProvider).available = false;
  const outage = await handleRequestMagicLink(post('/api/auth/request-magic-link', { email: 'teacher@example.test' }), r);
  assert.equal(outage.status, 503);
  assert.deepEqual(await outage.json(), { status: 'PROVIDER_UNAVAILABLE' });
});

test('Magic Link callback establishes opaque Access cookie only after governed authorization', async () => {
  const r = runtime();
  await handleRequestMagicLink(post('/api/auth/request-magic-link', { email: 'teacher@example.test' }), r);
  const response = await handleMagicLinkCallback(new Request('https://access.example.test/auth/confirm?code=valid-code'), r);
  assert.equal(response.status, 303);
  const cookie = response.headers.get('set-cookie') ?? '';
  assert.match(cookie, /__Host-trama_access_session=/);
  assert.match(cookie, /HttpOnly/);
});

test('invalid Magic Link callback never creates a cookie', async () => {
  const r = runtime();
  (r.authProvider as FakeAuthProvider).verifyFailure = 'INVALID';
  const response = await handleMagicLinkCallback(new Request('https://access.example.test/auth/confirm?code=invalid-code'), r);
  assert.equal(response.status, 303);
  assert.equal(response.headers.get('location'), 'https://access.example.test/?auth=invalid');
  assert.equal(response.headers.has('set-cookie'), false);
});

test('verified but unbound identity remains denied', async () => {
  const r = runtime();
  (r.authProvider as FakeAuthProvider).subject = 'other-subject';
  const denied = await handleMagicLinkCallback(new Request('https://access.example.test/auth/confirm?code=valid-code'), r);
  assert.equal(denied.status, 303);
  assert.equal(denied.headers.get('location'), 'https://access.example.test/?auth=denied');
  assert.equal(denied.headers.has('set-cookie'), false);
});

test('logout is idempotent, revokes Magic Link session and always clears cookie', async () => {
  const r = runtime();
  const pair = await authenticate(r);
  const out = await handleLogout(post('/api/auth/logout', {}, pair), r);
  assert.equal(out.status, 204);
  assert.match(out.headers.get('set-cookie') ?? '', /Max-Age=0/);
  const again = await handleLogout(post('/api/auth/logout', {}, pair), r);
  assert.equal(again.status, 204);
});

test('launch fails closed and never redirects in phase 2', async () => {
  const r = runtime();
  const pair = await authenticate(r);
  const notFederated = await handleLaunch(post('/api/launch', { applicationKey: 'DOCENTE_OS' }, pair), r);
  assert.equal(notFederated.status, 409);
  assert.deepEqual(await notFederated.json(), { status: 'NOT_FEDERATED' });
  assert.equal(notFederated.headers.has('location'), false);

  const repo = r.identityRepository as InMemoryIdentityRepository;
  repo.entitlements.splice(0, repo.entitlements.length);
  const denied = await handleLaunch(post('/api/launch', { applicationKey: 'DOCENTE_OS' }, pair), r);
  assert.equal(denied.status, 403);
});

test('launch rejects a session after its bound alias is revoked or rebound', async () => {
  const r = runtime();
  const pair = await authenticate(r);
  const repo = r.identityRepository as InMemoryIdentityRepository;
  repo.aliases[0]!.status = 'DISABLED';
  const disabled = await handleLaunch(post('/api/launch', { applicationKey: 'DOCENTE_OS' }, pair), r);
  assert.equal(disabled.status, 403);

  repo.aliases[0]!.status = 'ACTIVE';
  repo.aliases[0]!.providerSubject = 'subject-rebound';
  const rebound = await handleLaunch(post('/api/launch', { applicationKey: 'DOCENTE_OS' }, pair), r);
  assert.equal(rebound.status, 403);
});

test('launch rejects a session after its context is downgraded to PERSONAL', async () => {
  const r = runtime();
  const pair = await authenticate(r);
  const repo = r.identityRepository as InMemoryIdentityRepository;
  repo.contexts[0]!.contextType = 'PERSONAL';
  const denied = await handleLaunch(post('/api/launch', { applicationKey: 'DOCENTE_OS' }, pair), r);
  assert.equal(denied.status, 403);
});

test('launch rejects a session after its institutional reference is removed', async () => {
  const r = runtime();
  const pair = await authenticate(r);
  const repo = r.identityRepository as InMemoryIdentityRepository;
  repo.contexts[0]!.institutionRef = undefined;
  const denied = await handleLaunch(post('/api/launch', { applicationKey: 'DOCENTE_OS' }, pair), r);
  assert.equal(denied.status, 403);
});

test('Magic Link request mutation rejects mismatched origin', async () => {
  const r = runtime();
  const response = await handleRequestMagicLink(post('/api/auth/request-magic-link', { email: 'teacher@example.test' }, undefined, 'https://evil.test'), r);
  assert.equal(response.status, 403);
});
