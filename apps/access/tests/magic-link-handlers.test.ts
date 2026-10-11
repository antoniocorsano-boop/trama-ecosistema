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

function runtime(entitled = true): AccessRuntime {
  return {
    config: { origin: 'https://access.example.test', providerKind: 'fake', storeKind: 'memory', sessionTtlSeconds: 28800, nodeEnv: 'test' },
    identityRepository: new InMemoryIdentityRepository({
      principals: [{ principalId: 'p1', status: 'ACTIVE' }],
      aliases: [{ aliasId: 'a1', principalId: 'p1', kind: 'EMAIL', normalizedValue: 'teacher@example.test', status: 'ACTIVE', providerIssuer: 'issuer-1', providerSubject: 'subject-1', pilotAllowed: true }],
      contexts: [{ contextId: 'c1', principalId: 'p1', contextType: 'INSTITUTION', institutionRef: 'inst:1', status: 'ACTIVE' }],
      entitlements: entitled ? [{ entitlementId: 'e1', principalId: 'p1', contextId: 'c1', applicationKey: 'DOCENTE_OS', entitlementKey: 'USE', status: 'ACTIVE', validFrom: new Date('2026-10-10T00:00:00Z') }] : [],
    }),
    sessionStore: new InMemorySessionStore(),
    rateLimiter: new InMemoryRateLimiter(),
    authProvider: new FakeAuthProvider({ issuer: 'issuer-1', subject: 'subject-1', email: 'teacher@example.test', otp: 'legacy-only' }),
    applicationRegistry: APPLICATION_REGISTRY,
    now: () => new Date('2026-10-11T10:00:00Z'),
  };
}

function requestMagicLink(email: string, origin = 'https://access.example.test') {
  return new Request('https://access.example.test/api/auth/request-magic-link', {
    method: 'POST',
    headers: { Origin: origin, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
}

test('request handler derives callback URL only from configured Access origin', async () => {
  const r = runtime();
  const response = await handleRequestMagicLink(requestMagicLink('teacher@example.test'), r);
  assert.equal(response.status, 202);
  assert.deepEqual(await response.json(), { status: 'MAGIC_LINK_REQUESTED' });
  assert.equal((r.authProvider as FakeAuthProvider).lastMagicLinkRedirectTo, 'https://access.example.test/auth/confirm');
});

test('request handler keeps unknown alias neutral and rejects foreign Origin', async () => {
  const r = runtime();
  const unknown = await handleRequestMagicLink(requestMagicLink('unknown@example.test'), r);
  assert.equal(unknown.status, 202);
  assert.deepEqual(await unknown.json(), { status: 'MAGIC_LINK_REQUESTED' });
  assert.equal((r.authProvider as FakeAuthProvider).requestCount, 0);
  const foreign = await handleRequestMagicLink(requestMagicLink('teacher@example.test', 'https://evil.example'), r);
  assert.equal(foreign.status, 403);
});

test('valid PKCE callback issues local cookie then redirects to configured origin', async () => {
  const r = runtime(true);
  const response = await handleMagicLinkCallback(new Request('https://access.example.test/auth/confirm?code=valid-code'), r);
  assert.equal(response.status, 303);
  assert.equal(response.headers.get('location'), 'https://access.example.test/');
  assert.match(response.headers.get('set-cookie') ?? '', /__Host-trama_access_session=/);
});

test('token-hash callback is supported without accepting an arbitrary redirect target', async () => {
  const r = runtime(true);
  const response = await handleMagicLinkCallback(new Request('https://access.example.test/auth/confirm?token_hash=hash&type=magiclink&next=https%3A%2F%2Fevil.example'), r);
  assert.equal(response.status, 303);
  assert.equal(response.headers.get('location'), 'https://access.example.test/');
  assert.match(response.headers.get('set-cookie') ?? '', /__Host-trama_access_session=/);
});

test('malformed or duplicated callback material fails closed with no cookie', async () => {
  const r = runtime(true);
  for (const url of [
    'https://access.example.test/auth/confirm',
    'https://access.example.test/auth/confirm?code=a&code=b',
    'https://access.example.test/auth/confirm?code=a&token_hash=b&type=magiclink',
    'https://access.example.test/auth/confirm?token_hash=a&type=invalid',
  ]) {
    const response = await handleMagicLinkCallback(new Request(url), r);
    assert.equal(response.status, 303);
    assert.equal(response.headers.get('location'), 'https://access.example.test/?auth=invalid');
    assert.equal(response.headers.has('set-cookie'), false);
  }
});

test('provider-valid callback without governed entitlement redirects denied and creates no cookie', async () => {
  const r = runtime(false);
  const response = await handleMagicLinkCallback(new Request('https://access.example.test/auth/confirm?code=valid-code'), r);
  assert.equal(response.status, 303);
  assert.equal(response.headers.get('location'), 'https://access.example.test/?auth=denied');
  assert.equal(response.headers.has('set-cookie'), false);
});
