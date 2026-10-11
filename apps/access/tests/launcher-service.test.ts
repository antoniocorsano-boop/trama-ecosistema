import test from 'node:test';
import assert from 'node:assert/strict';
import { APPLICATION_REGISTRY } from '../src/config/application-registry.ts';
import { buildLauncher, authorizeLaunch } from '../src/domain/launcher-service.ts';
import type { ApplicationEntitlement } from '../src/domain/types.ts';

const activeEntitlement = (applicationKey: ApplicationEntitlement['applicationKey'], entitlementKey: ApplicationEntitlement['entitlementKey']): ApplicationEntitlement => ({
  entitlementId: `${applicationKey}:1`, principalId: 'p1', contextId: 'c1', applicationKey, entitlementKey,
  status: 'ACTIVE', validFrom: new Date('2026-10-10T00:00:00Z')
});

test('zero entitlement yields empty authenticated launcher', () => {
  assert.deepEqual(buildLauncher({ entitlements: [], registry: APPLICATION_REGISTRY, at: new Date('2026-10-11T10:00:00Z') }), []);
});

test('active entitlement shows non-federated disabled card', () => {
  const cards = buildLauncher({ entitlements: [activeEntitlement('DOCENTE_OS','USE')], registry: APPLICATION_REGISTRY, at: new Date('2026-10-11T10:00:00Z') });
  assert.equal(cards.length, 1);
  assert.equal(cards[0]!.applicationKey, 'DOCENTE_OS');
  assert.equal(cards[0]!.launchAllowed, false);
  assert.equal(cards[0]!.availability, 'CONNECTION_NOT_AVAILABLE');
});

test('revoked or expired entitlement does not become launchable', () => {
  const revoked = activeEntitlement('ARENA','ENTER'); revoked.status = 'REVOKED';
  const expired = activeEntitlement('STUDIO_ATLAS','AUTHOR'); expired.validUntil = new Date('2026-10-11T09:00:00Z');
  assert.equal(buildLauncher({ entitlements: [revoked, expired], registry: APPLICATION_REGISTRY, at: new Date('2026-10-11T10:00:00Z') }).length, 0);
});

test('authorizeLaunch fails closed for no entitlement and not-federated app', () => {
  assert.deepEqual(authorizeLaunch({ applicationKey: 'DOCENTE_OS', entitlements: [], registry: APPLICATION_REGISTRY, at: new Date('2026-10-11T10:00:00Z') }), { allowed: false, code: 'NO_ENTITLEMENT' });
  assert.deepEqual(authorizeLaunch({ applicationKey: 'DOCENTE_OS', entitlements: [activeEntitlement('DOCENTE_OS','USE')], registry: APPLICATION_REGISTRY, at: new Date('2026-10-11T10:00:00Z') }), { allowed: false, code: 'NOT_FEDERATED' });
});

test('phase 2 registry has no launch targets', () => {
  assert.equal(APPLICATION_REGISTRY.every((entry) => entry.federationState === 'NOT_FEDERATED' && !entry.launchTarget), true);
});
