import test from 'node:test';
import assert from 'node:assert/strict';
import { InMemoryIdentityRepository } from '../src/testing/in-memory-identity-repository.ts';
import { isPilotAliasAllowed, resolvePrincipalForVerifiedIdentity } from '../src/domain/principal-service.ts';

const seed = () => new InMemoryIdentityRepository({
  principals: [{ principalId: 'p1', status: 'ACTIVE' }],
  aliases: [{ aliasId: 'a1', principalId: 'p1', kind: 'EMAIL', normalizedValue: 'teacher@example.test', status: 'ACTIVE', providerIssuer: 'issuer-1', providerSubject: 'subject-1', pilotAllowed: true }],
  contexts: [{ contextId: 'c1', principalId: 'p1', contextType: 'INSTITUTION', institutionRef: 'inst:1', status: 'ACTIVE' }],
  entitlements: []
});

test('allowlist requires active pilot alias and normalizes email', async () => {
  const repo = seed();
  assert.equal(await isPilotAliasAllowed(repo, ' Teacher@Example.Test '), true);
  repo.aliases[0]!.status = 'DISABLED';
  assert.equal(await isPilotAliasAllowed(repo, 'teacher@example.test'), false);
});

test('resolves only exact issuer and subject', async () => {
  const repo = seed();
  const ok = await resolvePrincipalForVerifiedIdentity(repo, { issuer: 'issuer-1', subject: 'subject-1', verifiedEmail: 'teacher@example.test' });
  assert.equal(ok.ok, true);
  if (ok.ok) assert.equal(ok.principal.principalId, 'p1');
  const mismatch = await resolvePrincipalForVerifiedIdentity(repo, { issuer: 'issuer-1', subject: 'subject-other', verifiedEmail: 'teacher@example.test' });
  assert.deepEqual(mismatch, { ok: false, code: 'ACCESS_DENIED' });
});

test('fails for disabled principal and invalid context cardinality', async () => {
  const repo = seed();
  repo.principals[0]!.status = 'DISABLED';
  assert.deepEqual(await resolvePrincipalForVerifiedIdentity(repo, { issuer: 'issuer-1', subject: 'subject-1' }), { ok: false, code: 'ACCESS_DENIED' });
  repo.principals[0]!.status = 'ACTIVE';
  repo.contexts.length = 0;
  assert.deepEqual(await resolvePrincipalForVerifiedIdentity(repo, { issuer: 'issuer-1', subject: 'subject-1' }), { ok: false, code: 'ACCESS_DENIED' });
  repo.contexts.push({ contextId: 'c1', principalId: 'p1', contextType: 'INSTITUTION', institutionRef: 'inst:1', status: 'ACTIVE' }, { contextId: 'c2', principalId: 'p1', contextType: 'PERSONAL', status: 'ACTIVE' });
  assert.deepEqual(await resolvePrincipalForVerifiedIdentity(repo, { issuer: 'issuer-1', subject: 'subject-1' }), { ok: false, code: 'ACCESS_DENIED' });
});

test('verified email mismatch is consistency failure not linking fallback', async () => {
  const repo = seed();
  const result = await resolvePrincipalForVerifiedIdentity(repo, { issuer: 'issuer-1', subject: 'subject-1', verifiedEmail: 'other@example.test' });
  assert.deepEqual(result, { ok: false, code: 'ACCESS_DENIED' });
});
