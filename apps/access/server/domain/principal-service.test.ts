import { describe, expect, it } from 'vitest';
import { resolveProfessionalPrincipal } from './principal-service';
import { InMemoryAccessRepository } from '../testing/in-memory-access-repository';

describe('resolveProfessionalPrincipal', () => {
  it('reuses one principal for the exact same issuer and subject', async () => {
    const repository = new InMemoryAccessRepository();
    const identity = { issuer: 'https://issuer.example/auth/v1', subject: 'subject-a' };

    const first = await resolveProfessionalPrincipal(identity, repository, { allowCreate: true });
    const second = await resolveProfessionalPrincipal(identity, repository, { allowCreate: true });

    expect(first.kind).toBe('ACTIVE');
    expect(second.kind).toBe('ACTIVE');
    if (first.kind === 'ACTIVE' && second.kind === 'ACTIVE') {
      expect(second.principal.principalId).toBe(first.principal.principalId);
    }
    expect(repository.principalCount()).toBe(1);
  });

  it('keeps same-looking people distinct when issuer or subject differs', async () => {
    const repository = new InMemoryAccessRepository();

    const a = await resolveProfessionalPrincipal(
      { issuer: 'https://issuer-a.example/auth/v1', subject: 'subject-a' },
      repository,
      { allowCreate: true },
    );
    const b = await resolveProfessionalPrincipal(
      { issuer: 'https://issuer-b.example/auth/v1', subject: 'subject-a' },
      repository,
      { allowCreate: true },
    );
    const c = await resolveProfessionalPrincipal(
      { issuer: 'https://issuer-a.example/auth/v1', subject: 'subject-b' },
      repository,
      { allowCreate: true },
    );

    expect(a.kind).toBe('ACTIVE');
    expect(b.kind).toBe('ACTIVE');
    expect(c.kind).toBe('ACTIVE');
    if (a.kind === 'ACTIVE' && b.kind === 'ACTIVE' && c.kind === 'ACTIVE') {
      expect(new Set([a.principal.principalId, b.principal.principalId, c.principal.principalId]).size).toBe(3);
    }
  });

  it('does not accept email as part of the identity API', async () => {
    const repository = new InMemoryAccessRepository();
    const identity = {
      issuer: 'https://issuer.example/auth/v1',
      subject: 'subject-a',
      email: 'same@example.invalid',
    };

    const result = await resolveProfessionalPrincipal(identity, repository, { allowCreate: true });
    expect(result.kind).toBe('ACTIVE');
    expect(repository.lastIdentityLookup()).toEqual({
      issuer: 'https://issuer.example/auth/v1',
      subject: 'subject-a',
    });
  });

  it('denies a disabled principal', async () => {
    const repository = new InMemoryAccessRepository();
    const identity = { issuer: 'https://issuer.example/auth/v1', subject: 'subject-a' };
    const created = await resolveProfessionalPrincipal(identity, repository, { allowCreate: true });
    expect(created.kind).toBe('ACTIVE');
    if (created.kind !== 'ACTIVE') throw new Error('expected active principal');

    await repository.setPrincipalStatus(created.principal.principalId, 'DISABLED');
    await expect(resolveProfessionalPrincipal(identity, repository, { allowCreate: false })).resolves.toEqual({
      kind: 'DENIED',
    });
  });

  it.each([
    { issuer: '', subject: 'subject-a' },
    { issuer: '   ', subject: 'subject-a' },
    { issuer: 'https://issuer.example/auth/v1', subject: '' },
    { issuer: 'https://issuer.example/auth/v1', subject: '   ' },
  ])('rejects missing issuer or subject before persistence', async (identity) => {
    const repository = new InMemoryAccessRepository();

    await expect(resolveProfessionalPrincipal(identity, repository, { allowCreate: true })).rejects.toThrow(
      'VERIFIED_PROVIDER_IDENTITY_INVALID',
    );
    expect(repository.principalCount()).toBe(0);
  });

  it('denies unknown identities when creation is not authorized', async () => {
    const repository = new InMemoryAccessRepository();

    await expect(
      resolveProfessionalPrincipal(
        { issuer: 'https://issuer.example/auth/v1', subject: 'unknown' },
        repository,
        { allowCreate: false },
      ),
    ).resolves.toEqual({ kind: 'DENIED' });
    expect(repository.principalCount()).toBe(0);
  });
});
