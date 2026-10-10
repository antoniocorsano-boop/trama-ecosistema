import { describe, expect, it } from 'vitest';
import {
  SupabaseAccessRepository,
  type SupabaseDataClient,
  type SupabaseDataResult,
} from './access-repository';

class FakeSupabaseDataClient implements SupabaseDataClient {
  readonly calls: Array<{ operation: string; table: string; payload?: unknown; filters?: Record<string, unknown> }> = [];
  next: SupabaseDataResult<unknown> = { data: null, error: null };

  async selectOne(table: string, filters: Record<string, unknown>): Promise<SupabaseDataResult<unknown>> {
    this.calls.push({ operation: 'selectOne', table, filters });
    return this.next;
  }

  async selectMany(table: string, filters: Record<string, unknown>): Promise<SupabaseDataResult<unknown[]>> {
    this.calls.push({ operation: 'selectMany', table, filters });
    return this.next as SupabaseDataResult<unknown[]>;
  }

  async insertOne(table: string, payload: Record<string, unknown>): Promise<SupabaseDataResult<unknown>> {
    this.calls.push({ operation: 'insertOne', table, payload });
    return this.next;
  }

  async upsertOne(
    table: string,
    payload: Record<string, unknown>,
    conflictColumns: string[],
  ): Promise<SupabaseDataResult<unknown>> {
    this.calls.push({ operation: `upsertOne:${conflictColumns.join(',')}`, table, payload });
    return this.next;
  }

  async updateMany(
    table: string,
    payload: Record<string, unknown>,
    filters: Record<string, unknown>,
  ): Promise<SupabaseDataResult<unknown[]>> {
    this.calls.push({ operation: 'updateMany', table, payload, filters });
    return this.next as SupabaseDataResult<unknown[]>;
  }
}

const principalRow = {
  principal_id: '00000000-0000-4000-8000-000000000001',
  issuer: 'https://issuer.example/auth/v1',
  subject: 'subject-a',
  status: 'ACTIVE',
};

describe('SupabaseAccessRepository', () => {
  it('looks up identity only by exact issuer+subject in professional_principal', async () => {
    const client = new FakeSupabaseDataClient();
    client.next = { data: principalRow, error: null };
    const repository = new SupabaseAccessRepository(client);

    await expect(
      repository.findPrincipalByIdentity({
        issuer: principalRow.issuer,
        subject: principalRow.subject,
      }),
    ).resolves.toMatchObject({
      principalId: principalRow.principal_id,
      issuer: principalRow.issuer,
      subject: principalRow.subject,
      status: 'ACTIVE',
    });

    expect(client.calls).toEqual([
      {
        operation: 'selectOne',
        table: 'professional_principal',
        filters: { issuer: principalRow.issuer, subject: principalRow.subject },
      },
    ]);
    expect(JSON.stringify(client.calls)).not.toMatch(/email/i);
  });

  it('maps creation to professional_principal without mutable identity metadata', async () => {
    const client = new FakeSupabaseDataClient();
    client.next = { data: principalRow, error: null };
    const repository = new SupabaseAccessRepository(client);

    await repository.createPrincipal(
      { issuer: principalRow.issuer, subject: principalRow.subject },
      principalRow.principal_id,
    );

    expect(client.calls[0]).toEqual({
      operation: 'insertOne',
      table: 'professional_principal',
      payload: {
        principal_id: principalRow.principal_id,
        issuer: principalRow.issuer,
        subject: principalRow.subject,
        status: 'ACTIVE',
      },
    });
    expect(JSON.stringify(client.calls[0])).not.toMatch(/email/i);
  });

  it('reads entitlements only from principal_entitlement using principal_id', async () => {
    const client = new FakeSupabaseDataClient();
    client.next = {
      data: [
        {
          principal_id: principalRow.principal_id,
          application: 'DOCENTE_OS',
          entitlement: 'USE',
          status: 'ACTIVE',
        },
      ],
      error: null,
    };
    const repository = new SupabaseAccessRepository(client);

    await expect(repository.listEntitlements(principalRow.principal_id)).resolves.toEqual([
      {
        principalId: principalRow.principal_id,
        application: 'DOCENTE_OS',
        entitlement: 'USE',
        status: 'ACTIVE',
      },
    ]);
    expect(client.calls[0]).toEqual({
      operation: 'selectMany',
      table: 'principal_entitlement',
      filters: { principal_id: principalRow.principal_id },
    });
  });

  it('persists sessions as digest records with ISO lifecycle timestamps', async () => {
    const client = new FakeSupabaseDataClient();
    client.next = { data: {}, error: null };
    const repository = new SupabaseAccessRepository(client);

    await repository.createSession({
      digest: 'a'.repeat(64),
      principalId: principalRow.principal_id,
      issuedAt: new Date('2026-10-10T10:00:00.000Z'),
      expiresAt: new Date('2026-10-10T18:00:00.000Z'),
      revokedAt: null,
    });

    expect(client.calls[0]).toEqual({
      operation: 'insertOne',
      table: 'access_session',
      payload: {
        session_digest: 'a'.repeat(64),
        principal_id: principalRow.principal_id,
        issued_at: '2026-10-10T10:00:00.000Z',
        expires_at: '2026-10-10T18:00:00.000Z',
        revoked_at: null,
      },
    });
    expect(JSON.stringify(client.calls[0])).not.toMatch(/secret/i);
  });

  it('fails closed when Supabase reports an error', async () => {
    const client = new FakeSupabaseDataClient();
    client.next = { data: null, error: { message: 'database unavailable' } };
    const repository = new SupabaseAccessRepository(client);

    await expect(
      repository.findPrincipalByIdentity({ issuer: principalRow.issuer, subject: principalRow.subject }),
    ).rejects.toThrow('ACCESS_STORE_FAILURE');
  });

  it('fails closed when a required mutation returns no row', async () => {
    const client = new FakeSupabaseDataClient();
    client.next = { data: null, error: null };
    const repository = new SupabaseAccessRepository(client);

    await expect(
      repository.createPrincipal(
        { issuer: principalRow.issuer, subject: principalRow.subject },
        principalRow.principal_id,
      ),
    ).rejects.toThrow('ACCESS_STORE_FAILURE');
  });
});
