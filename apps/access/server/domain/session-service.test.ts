import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { issueSession, revokeSession, validateSession } from './session-service';
import { SESSION_COOKIE_NAME, sessionCookieOptions } from '../security/session-cookie';
import { InMemoryAccessRepository } from '../testing/in-memory-access-repository';

const principalId = '00000000-0000-4000-8000-000000000001';
const identity = { issuer: 'https://issuer.example/auth/v1', subject: 'subject-a' };

async function activeRepository() {
  const repository = new InMemoryAccessRepository();
  await repository.createPrincipal(identity, principalId);
  return repository;
}

describe('bounded TRAMA Access session', () => {
  it('issues at least 256 bits of random secret and persists only its SHA-256 digest', async () => {
    const repository = await activeRepository();
    const now = new Date('2026-10-10T10:00:00.000Z');

    const issued = await issueSession(principalId, now, repository);

    expect(Buffer.from(issued.secret, 'base64url').byteLength).toBeGreaterThanOrEqual(32);
    expect(issued.digest).toBe(createHash('sha256').update(issued.secret).digest('hex'));
    expect(await repository.findSessionByDigest(issued.secret)).toBeNull();
    expect(await repository.findSessionByDigest(issued.digest)).toMatchObject({
      digest: issued.digest,
      principalId,
      revokedAt: null,
    });
  });

  it('uses an absolute eight-hour expiry and does not slide during validation', async () => {
    const repository = await activeRepository();
    const issuedAt = new Date('2026-10-10T10:00:00.000Z');
    const issued = await issueSession(principalId, issuedAt, repository);

    expect(issued.expiresAt.toISOString()).toBe('2026-10-10T18:00:00.000Z');

    const validation = await validateSession(
      issued.secret,
      new Date('2026-10-10T17:59:59.000Z'),
      repository,
    );
    expect(validation).toEqual({
      kind: 'VALID',
      principalId,
      expiresAt: issued.expiresAt,
    });
    expect((await repository.findSessionByDigest(issued.digest))?.expiresAt).toEqual(issued.expiresAt);
  });

  it('fails closed for missing, expired and revoked sessions', async () => {
    const repository = await activeRepository();
    const now = new Date('2026-10-10T10:00:00.000Z');

    await expect(validateSession('not-a-session', now, repository)).resolves.toEqual({
      kind: 'INVALID',
      reason: 'MISSING',
    });

    const expired = await issueSession(principalId, now, repository);
    await expect(
      validateSession(expired.secret, new Date('2026-10-10T18:00:00.001Z'), repository),
    ).resolves.toEqual({ kind: 'INVALID', reason: 'EXPIRED' });

    const revoked = await issueSession(principalId, now, repository);
    await revokeSession(revoked.secret, new Date('2026-10-10T10:05:00.000Z'), repository);
    await expect(validateSession(revoked.secret, new Date('2026-10-10T10:06:00.000Z'), repository)).resolves.toEqual({
      kind: 'INVALID',
      reason: 'REVOKED',
    });
  });

  it('invalidates a session when its principal is disabled', async () => {
    const repository = await activeRepository();
    const now = new Date('2026-10-10T10:00:00.000Z');
    const issued = await issueSession(principalId, now, repository);
    await repository.setPrincipalStatus(principalId, 'DISABLED');

    await expect(validateSession(issued.secret, new Date('2026-10-10T10:01:00.000Z'), repository)).resolves.toEqual({
      kind: 'INVALID',
      reason: 'PRINCIPAL_DISABLED',
    });
  });

  it('revokes a predecessor session when a fresh login session is issued', async () => {
    const repository = await activeRepository();
    const first = await issueSession(principalId, new Date('2026-10-10T10:00:00.000Z'), repository);
    const second = await issueSession(
      principalId,
      new Date('2026-10-10T10:01:00.000Z'),
      repository,
      first.secret,
    );

    expect(second.secret).not.toBe(first.secret);
    await expect(validateSession(first.secret, new Date('2026-10-10T10:02:00.000Z'), repository)).resolves.toEqual({
      kind: 'INVALID',
      reason: 'REVOKED',
    });
    await expect(validateSession(second.secret, new Date('2026-10-10T10:02:00.000Z'), repository)).resolves.toMatchObject({
      kind: 'VALID',
      principalId,
    });
  });

  it('pins the production session cookie boundary', () => {
    expect(SESSION_COOKIE_NAME).toBe('trama_access_session');
    expect(sessionCookieOptions).toEqual({
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 28_800,
    });
  });
});
