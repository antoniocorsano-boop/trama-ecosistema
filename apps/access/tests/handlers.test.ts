import test from 'node:test';
import assert from 'node:assert/strict';
import { InMemoryIdentityRepository } from '../src/testing/in-memory-identity-repository.ts';
import { InMemorySessionStore } from '../src/testing/in-memory-session-store.ts';
import { InMemoryRateLimiter } from '../src/testing/in-memory-rate-limiter.ts';
import { FakeAuthProvider } from '../src/testing/fake-auth-provider.ts';
import { APPLICATION_REGISTRY } from '../src/config/application-registry.ts';
import type { AccessRuntime } from '../src/server/runtime.ts';
import { handleRequestOtp } from '../src/server/handlers/request-otp.ts';
import { handleVerifyOtp } from '../src/server/handlers/verify-otp.ts';
import { handleLogout } from '../src/server/handlers/logout.ts';
import { handleLaunch } from '../src/server/handlers/launch.ts';

function runtime(entitled = true): AccessRuntime {
  const repo = new InMemoryIdentityRepository({
    principals: [{ principalId: 'p1', status: 'ACTIVE' }],
    aliases: [{ aliasId: 'a1', principalId: 'p1', kind: 'EMAIL', normalizedValue: 'teacher@example.test', status: 'ACTIVE', providerIssuer: 'issuer-1', providerSubject: 'subject-1', pilotAllowed: true }],
    contexts: [{ contextId: 'c1', principalId: 'p1', contextType: 'INSTITUTION', institutionRef: 'inst:1', status: 'ACTIVE' }],
    entitlements: entitled ? [{ entitlementId: 'e1', principalId: 'p1', contextId: 'c1', applicationKey: 'DOCENTE_OS', entitlementKey: 'USE', status: 'ACTIVE', validFrom: new Date('2026-10-10T00:00:00Z') }] : []
  });
  return {
    config: { origin: 'https://access.example.test', providerKind: 'fake', storeKind: 'memory', sessionTtlSeconds: 28800, nodeEnv: 'test' },
    identityRepository: repo,
    sessionStore: new InMemorySessionStore(),
    rateLimiter: new InMemoryRateLimiter(),
    authProvider: new FakeAuthProvider({ issuer: 'issuer-1', subject: 'subject-1', email: 'teacher@example.test', otp: '123456' }),
    applicationRegistry: APPLICATION_REGISTRY,
    now: () => new Date('2026-10-11T10:00:00Z')
  };
}
const req = (path: string, body: unknown, cookie?: string) => new Request(`https://access.example.test${path}`, {
  method: 'POST',
  headers: { Origin: 'https://access.example.test', 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) },
  body: JSON.stringify(body)
});

test('request OTP is neutral for allowed and unknown aliases', async () => {
  const r = runtime();
  const allowed = await handleRequestOtp(req('/api/auth/request-otp', { email: 'teacher@example.test' }), r);
  const unknown = await handleRequestOtp(req('/api/auth/request-otp', { email: 'unknown@example.test' }), r);
  assert.equal(allowed.status, 202); assert.equal(unknown.status, 202);
  assert.deepEqual(await allowed.json(), { status: 'OTP_REQUESTED' });
  assert.deepEqual(await unknown.json(), { status: 'OTP_REQUESTED' });
});

test('send-time OTP failure stays publicly neutral', async () => {
  const r = runtime();
  (r.authProvider as FakeAuthProvider).requestFailure = true;
  const allowed = await handleRequestOtp(req('/api/auth/request-otp', { email: 'teacher@example.test' }), r);
  const unknown = await handleRequestOtp(req('/api/auth/request-otp', { email: 'unknown@example.test' }), r);
  assert.equal(allowed.status, 202); assert.equal(unknown.status, 202);
  assert.deepEqual(await allowed.json(), { status: 'OTP_REQUESTED' });
  assert.deepEqual(await unknown.json(), { status: 'OTP_REQUESTED' });
});

test('request OTP rejects malformed payload and provider outage safely', async () => {
  const r = runtime();
  const malformed = await handleRequestOtp(req('/api/auth/request-otp', { email: 'not-an-email' }), r);
  assert.equal(malformed.status, 400);
  (r.authProvider as FakeAuthProvider).available = false;
  const outage = await handleRequestOtp(req('/api/auth/request-otp', { email: 'teacher@example.test' }), r);
  assert.equal(outage.status, 503);
  assert.deepEqual(await outage.json(), { status: 'PROVIDER_UNAVAILABLE' });
});

test('verify OTP establishes opaque Access cookie', async () => {
  const r = runtime();
  const response = await handleVerifyOtp(req('/api/auth/verify-otp', { email: 'teacher@example.test', otp: '123456' }), r);
  assert.equal(response.status, 204);
  const cookie = response.headers.get('set-cookie') ?? '';
  assert.match(cookie, /__Host-trama_access_session=/);
  assert.match(cookie, /HttpOnly/);
});

test('verify OTP does not reveal allowlist membership for invalid codes', async () => {
  const r = runtime();
  const invalidAllowed = await handleVerifyOtp(req('/api/auth/verify-otp', { email: 'teacher@example.test', otp: '000000' }), r);
  const invalidUnknown = await handleVerifyOtp(req('/api/auth/verify-otp', { email: 'unknown@example.test', otp: '000000' }), r);
  assert.equal(invalidAllowed.status, 401);
  assert.equal(invalidUnknown.status, 401);
  assert.deepEqual(await invalidAllowed.json(), { status: 'OTP_INVALID' });
  assert.deepEqual(await invalidUnknown.json(), { status: 'OTP_INVALID' });
});

test('verified but unbound identity remains denied', async () => {
  const r = runtime();
  (r.authProvider as FakeAuthProvider).subject = 'other-subject';
  const denied = await handleVerifyOtp(req('/api/auth/verify-otp', { email: 'teacher@example.test', otp: '123456' }), r);
  assert.equal(denied.status, 403);
  assert.deepEqual(await denied.json(), { status: 'ACCESS_DENIED' });
});

test('logout is idempotent, revokes session and always clears cookie', async () => {
  const r = runtime();
  const auth = await handleVerifyOtp(req('/api/auth/verify-otp', { email: 'teacher@example.test', otp: '123456' }), r);
  const pair = (auth.headers.get('set-cookie') ?? '').split(';')[0]!;
  const out = await handleLogout(req('/api/auth/logout', {}, pair), r);
  assert.equal(out.status, 204);
  assert.match(out.headers.get('set-cookie') ?? '', /Max-Age=0/);
  const again = await handleLogout(req('/api/auth/logout', {}, pair), r);
  assert.equal(again.status, 204);
});

test('launch fails closed and never redirects in phase 2', async () => {
  const r = runtime();
  const auth = await handleVerifyOtp(req('/api/auth/verify-otp', { email: 'teacher@example.test', otp: '123456' }), r);
  const pair = (auth.headers.get('set-cookie') ?? '').split(';')[0]!;
  const notFederated = await handleLaunch(req('/api/launch', { applicationKey: 'DOCENTE_OS' }, pair), r);
  assert.equal(notFederated.status, 409);
  assert.deepEqual(await notFederated.json(), { status: 'NOT_FEDERATED' });
  assert.equal(notFederated.headers.has('location'), false);
  const noEntitlementRuntime = runtime(false);
  const auth2 = await handleVerifyOtp(req('/api/auth/verify-otp', { email: 'teacher@example.test', otp: '123456' }), noEntitlementRuntime);
  const pair2 = (auth2.headers.get('set-cookie') ?? '').split(';')[0]!;
  const denied = await handleLaunch(req('/api/launch', { applicationKey: 'DOCENTE_OS' }, pair2), noEntitlementRuntime);
  assert.equal(denied.status, 403);
});

test('launch rejects a session after its bound alias is revoked or rebound', async () => {
  const r = runtime();
  const auth = await handleVerifyOtp(req('/api/auth/verify-otp', { email: 'teacher@example.test', otp: '123456' }), r);
  const pair = (auth.headers.get('set-cookie') ?? '').split(';')[0]!;
  const repo = r.identityRepository as InMemoryIdentityRepository;
  repo.aliases[0]!.status = 'DISABLED';
  const disabled = await handleLaunch(req('/api/launch', { applicationKey: 'DOCENTE_OS' }, pair), r);
  assert.equal(disabled.status, 403);

  repo.aliases[0]!.status = 'ACTIVE';
  repo.aliases[0]!.providerSubject = 'subject-rebound';
  const rebound = await handleLaunch(req('/api/launch', { applicationKey: 'DOCENTE_OS' }, pair), r);
  assert.equal(rebound.status, 403);
});

test('every mutation rejects mismatched origin', async () => {
  const r = runtime();
  const bad = new Request('https://access.example.test/api/auth/request-otp', { method: 'POST', headers: { Origin: 'https://evil.test', 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'teacher@example.test' }) });
  const response = await handleRequestOtp(bad, r);
  assert.equal(response.status, 403);
});
