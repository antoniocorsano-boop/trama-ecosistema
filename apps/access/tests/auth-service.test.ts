import test from 'node:test';
import assert from 'node:assert/strict';
import { InMemoryIdentityRepository } from '../src/testing/in-memory-identity-repository.ts';
import { InMemorySessionStore } from '../src/testing/in-memory-session-store.ts';
import { FakeAuthProvider } from '../src/testing/fake-auth-provider.ts';
import { requestPilotOtp, verifyPilotOtp } from '../src/domain/auth-service.ts';

function fixture() {
  const repo = new InMemoryIdentityRepository({
    principals: [{ principalId: 'p1', status: 'ACTIVE' }],
    aliases: [{ aliasId: 'a1', principalId: 'p1', kind: 'EMAIL', normalizedValue: 'teacher@example.test', status: 'ACTIVE', providerIssuer: 'issuer-1', providerSubject: 'subject-1', pilotAllowed: true }],
    contexts: [{ contextId: 'c1', principalId: 'p1', contextType: 'INSTITUTION', institutionRef: 'inst:1', status: 'ACTIVE' }],
    entitlements: []
  });
  const provider = new FakeAuthProvider({ issuer: 'issuer-1', subject: 'subject-1', email: 'teacher@example.test', otp: '123456' });
  return { repo, provider, store: new InMemorySessionStore() };
}

test('allowed and unknown email return same neutral request result', async () => {
  const f = fixture();
  assert.deepEqual(await requestPilotOtp({ repo: f.repo, provider: f.provider, email: 'teacher@example.test' }), { status: 'OTP_REQUESTED' });
  assert.equal(f.provider.requestCount, 1);
  assert.deepEqual(await requestPilotOtp({ repo: f.repo, provider: f.provider, email: 'nobody@example.test' }), { status: 'OTP_REQUESTED' });
  assert.equal(f.provider.requestCount, 1);
});

test('provider request outage maps to provider unavailable', async () => {
  const f = fixture();
  f.provider.requestFailure = true;
  assert.deepEqual(await requestPilotOtp({ repo: f.repo, provider: f.provider, email: 'teacher@example.test' }), { status: 'PROVIDER_UNAVAILABLE' });
});

test('valid OTP and exact binding creates access session even with zero entitlements', async () => {
  const f = fixture();
  const result = await verifyPilotOtp({ repo: f.repo, provider: f.provider, store: f.store, email: 'teacher@example.test', otp: '123456', now: new Date('2026-10-11T10:00:00Z') });
  assert.equal(result.status, 'AUTHENTICATED');
  if (result.status === 'AUTHENTICATED') assert.equal(result.principalId, 'p1');
});

test('wrong OTP and unbound subject create no session', async () => {
  const f = fixture();
  assert.deepEqual(await verifyPilotOtp({ repo: f.repo, provider: f.provider, store: f.store, email: 'teacher@example.test', otp: '000000', now: new Date() }), { status: 'OTP_INVALID' });
  assert.equal(f.store.records.length, 0);
  f.provider.subject = 'subject-other';
  assert.deepEqual(await verifyPilotOtp({ repo: f.repo, provider: f.provider, store: f.store, email: 'teacher@example.test', otp: '123456', now: new Date() }), { status: 'ACCESS_DENIED' });
  assert.equal(f.store.records.length, 0);
});

test('verified email mismatch fails closed', async () => {
  const f = fixture();
  f.provider.email = 'other@example.test';
  assert.deepEqual(await verifyPilotOtp({ repo: f.repo, provider: f.provider, store: f.store, email: 'teacher@example.test', otp: '123456', now: new Date() }), { status: 'ACCESS_DENIED' });
});
