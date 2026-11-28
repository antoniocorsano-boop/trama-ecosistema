import test from 'node:test';
import assert from 'node:assert/strict';
import { InMemorySessionStore } from '../src/testing/in-memory-session-store.ts';
import { issueAccessSession, validateAccessSession, revokeAccessSession, sha256SessionSecret } from '../src/domain/session-service.ts';
import { serializeAccessSessionCookie, clearAccessSessionCookie } from '../src/server/session-cookie.ts';

const now = new Date('2026-10-11T10:00:00.000Z');
const binding = { aliasId: 'a1', providerIssuer: 'issuer-1', providerSubject: 'subject-1' };

test('issues 256-bit opaque secret and stores digest with absolute 8h expiry plus governed binding', async () => {
  const store = new InMemorySessionStore();
  const { secret, record } = await issueAccessSession({ store, principalId: 'p1', contextId: 'c1', now, ...binding });
  assert.equal(Buffer.from(secret, 'base64url').byteLength, 32);
  assert.equal(record.sessionDigest, sha256SessionSecret(secret));
  assert.equal(record.absoluteExpiresAt.toISOString(), '2026-10-11T18:00:00.000Z');
  assert.equal(record.aliasId, 'a1');
  assert.equal(record.providerIssuer, 'issuer-1');
  assert.equal(record.providerSubject, 'subject-1');
  assert.equal(record.authMethod, 'EMAIL_MAGIC_LINK');
  assert.equal(store.records[0]!.sessionDigest, record.sessionDigest);
  assert.equal(JSON.stringify(store.records).includes(secret), false);
});

test('expiry is absolute and revocation is immediate', async () => {
  const store = new InMemorySessionStore();
  const { secret, record } = await issueAccessSession({ store, principalId: 'p1', contextId: 'c1', now, ...binding });
  const active = await validateAccessSession({ store, secret, now: new Date('2026-10-11T12:00:00.000Z'), principalActive: true, contextActive: true, bindingActive: true });
  assert.equal(active.ok, true);
  assert.equal(record.absoluteExpiresAt.toISOString(), '2026-10-11T18:00:00.000Z');
  const expired = await validateAccessSession({ store, secret, now: new Date('2026-10-11T18:00:00.000Z'), principalActive: true, contextActive: true, bindingActive: true });
  assert.deepEqual(expired, { ok: false, code: 'SESSION_EXPIRED' });
  const second = await issueAccessSession({ store, principalId: 'p1', contextId: 'c1', now, ...binding });
  await revokeAccessSession({ store, secret: second.secret, now: new Date('2026-10-11T11:00:00.000Z') });
  assert.deepEqual(await validateAccessSession({ store, secret: second.secret, now: new Date('2026-10-11T11:00:01.000Z'), principalActive: true, contextActive: true, bindingActive: true }), { ok: false, code: 'SESSION_REVOKED' });
});

test('inactive principal, context or bound alias invalidates session', async () => {
  const store = new InMemorySessionStore();
  const { secret } = await issueAccessSession({ store, principalId: 'p1', contextId: 'c1', now, ...binding });
  assert.deepEqual(await validateAccessSession({ store, secret, now, principalActive: false, contextActive: true, bindingActive: true }), { ok: false, code: 'SESSION_INVALID' });
  assert.deepEqual(await validateAccessSession({ store, secret, now, principalActive: true, contextActive: false, bindingActive: true }), { ok: false, code: 'SESSION_INVALID' });
  assert.deepEqual(await validateAccessSession({ store, secret, now, principalActive: true, contextActive: true, bindingActive: false }), { ok: false, code: 'SESSION_INVALID' });
});

test('cookie is host-only secure and bounded', () => {
  const value = serializeAccessSessionCookie('opaque');
  assert.match(value, /^__Host-trama_access_session=opaque;/);
  assert.match(value, /HttpOnly/);
  assert.match(value, /Secure/);
  assert.match(value, /SameSite=Lax/);
  assert.match(value, /Path=\//);
  assert.match(value, /Max-Age=28800/);
  assert.equal(value.includes('Domain='), false);
  assert.match(clearAccessSessionCookie(), /Max-Age=0/);
});
