import { describe, expect, it } from 'vitest';
import { buildLauncher } from './launcher-service';
import { InMemoryAccessRepository } from '../testing/in-memory-access-repository';

const principalId = '00000000-0000-4000-8000-000000000001';

const canonical = [
  ['DOCENTE_OS', 'USE'],
  ['CURRICOLO_ATLAS', 'READ'],
  ['STUDIO_ATLAS', 'AUTHOR'],
  ['ARENA', 'ENTER'],
  ['CONTROL_CENTER', 'GOVERNANCE_OPERATOR'],
] as const;

describe('buildLauncher', () => {
  it('projects only the five canonical active application-entitlement pairs', async () => {
    const repository = new InMemoryAccessRepository();

    for (const [application, entitlement] of canonical) {
      await repository.upsertEntitlement({
        principalId,
        application,
        entitlement,
        status: 'ACTIVE',
      });
    }

    const launcher = await buildLauncher(principalId, repository);

    expect(launcher).toHaveLength(5);
    expect(launcher.map(({ application, entitlement }) => [application, entitlement])).toEqual(canonical);
    expect(launcher.every((item) => item.availability === 'FEDERATION_PENDING')).toBe(true);
    expect(launcher.every((item) => !('href' in item))).toBe(true);
  });

  it('does not expose revoked entitlements', async () => {
    const repository = new InMemoryAccessRepository();
    await repository.upsertEntitlement({
      principalId,
      application: 'DOCENTE_OS',
      entitlement: 'USE',
      status: 'ACTIVE',
    });
    await repository.revokeEntitlement(principalId, 'DOCENTE_OS');

    await expect(buildLauncher(principalId, repository)).resolves.toEqual([]);
  });

  it('rejects non-canonical application-entitlement combinations at the repository boundary', async () => {
    const repository = new InMemoryAccessRepository();

    await expect(
      repository.upsertEntitlement({
        principalId,
        application: 'ARENA',
        entitlement: 'USE',
        status: 'ACTIVE',
      } as never),
    ).rejects.toThrow('ENTITLEMENT_PAIR_INVALID');
  });

  it('treats governance operator as launcher entry only, without privileged action authority', async () => {
    const repository = new InMemoryAccessRepository();
    await repository.upsertEntitlement({
      principalId,
      application: 'CONTROL_CENTER',
      entitlement: 'GOVERNANCE_OPERATOR',
      status: 'ACTIVE',
    });

    const [item] = await buildLauncher(principalId, repository);
    expect(item).toMatchObject({
      application: 'CONTROL_CENTER',
      entitlement: 'GOVERNANCE_OPERATOR',
      availability: 'FEDERATION_PENDING',
    });
    expect(item).not.toHaveProperty('href');
    expect(item).not.toHaveProperty('canMutate');
    expect(item).not.toHaveProperty('authority');
  });
});
