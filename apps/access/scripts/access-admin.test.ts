import { describe, expect, it } from 'vitest';
import { executeAccessAdminCommand, parseAccessAdminCommand } from './access-admin.mjs';
import { InMemoryAccessRepository } from '../server/testing/in-memory-access-repository';

const principalId = '00000000-0000-4000-8000-000000000001';

function grantArgs(application = 'DOCENTE_OS') {
  return ['entitlement', 'grant', '--principal', principalId, '--application', application];
}

describe('access-admin command parser', () => {
  it('derives entitlement from canonical application and never accepts an arbitrary entitlement flag', () => {
    expect(parseAccessAdminCommand(grantArgs())).toEqual({
      kind: 'ENTITLEMENT_GRANT',
      principalId,
      application: 'DOCENTE_OS',
      entitlement: 'USE',
    });

    expect(() =>
      parseAccessAdminCommand([...grantArgs(), '--entitlement', 'ARENA_APPROVE']),
    ).toThrow('ACCESS_ADMIN_ARGUMENT_INVALID');
  });

  it.each(['UNKNOWN_APP', 'ARENA_APPROVE', 'DOCENTE_OS_ADMIN'])('rejects non-canonical app %s', (application) => {
    expect(() => parseAccessAdminCommand(grantArgs(application))).toThrow('ACCESS_ADMIN_APPLICATION_INVALID');
  });

  it('rejects malformed principal UUID', () => {
    expect(() =>
      parseAccessAdminCommand([
        'entitlement',
        'grant',
        '--principal',
        'not-a-uuid',
        '--application',
        'DOCENTE_OS',
      ]),
    ).toThrow('ACCESS_ADMIN_PRINCIPAL_INVALID');
  });

  it('supports only grant/revoke and principal disable mutations', () => {
    expect(() =>
      parseAccessAdminCommand(['principal', 'enable', '--principal', principalId]),
    ).toThrow('ACCESS_ADMIN_COMMAND_INVALID');
    expect(parseAccessAdminCommand(['principal', 'disable', '--principal', principalId])).toEqual({
      kind: 'PRINCIPAL_DISABLE',
      principalId,
    });
  });
});

describe('executeAccessAdminCommand', () => {
  it('makes entitlement grant and revoke idempotent', async () => {
    const repository = new InMemoryAccessRepository();

    const grant = parseAccessAdminCommand(grantArgs());
    await executeAccessAdminCommand(grant, repository);
    await executeAccessAdminCommand(grant, repository);

    expect(await repository.listEntitlements(principalId)).toEqual([
      {
        principalId,
        application: 'DOCENTE_OS',
        entitlement: 'USE',
        status: 'ACTIVE',
      },
    ]);

    const revoke = parseAccessAdminCommand([
      'entitlement',
      'revoke',
      '--principal',
      principalId,
      '--application',
      'DOCENTE_OS',
    ]);
    await executeAccessAdminCommand(revoke, repository);
    await executeAccessAdminCommand(revoke, repository);

    expect(await repository.listEntitlements(principalId)).toEqual([
      {
        principalId,
        application: 'DOCENTE_OS',
        entitlement: 'USE',
        status: 'REVOKED',
      },
    ]);
  });

  it('disables an existing principal without exposing an HTTP mutation', async () => {
    const repository = new InMemoryAccessRepository();
    await repository.createPrincipal(
      { issuer: 'https://issuer.example/auth/v1', subject: 'subject-a' },
      principalId,
    );

    await executeAccessAdminCommand(
      parseAccessAdminCommand(['principal', 'disable', '--principal', principalId]),
      repository,
    );

    expect(await repository.getPrincipalById(principalId)).toMatchObject({ status: 'DISABLED' });
  });
});
