import { createHash, randomBytes } from 'node:crypto';
import type { AccessRepository } from '../ports/access-repository.js';

const SESSION_TTL_MS = 28_800_000;

export type SessionValidation =
  | { kind: 'VALID'; principalId: string; expiresAt: Date }
  | {
      kind: 'INVALID';
      reason: 'MISSING' | 'EXPIRED' | 'REVOKED' | 'PRINCIPAL_DISABLED';
    };

function digestSessionSecret(secret: string): string {
  return createHash('sha256').update(secret).digest('hex');
}

export async function revokeSession(
  secret: string,
  now: Date,
  repository: AccessRepository,
): Promise<void> {
  if (!secret) return;
  await repository.revokeSessionByDigest(digestSessionSecret(secret), now);
}

export async function issueSession(
  principalId: string,
  now: Date,
  repository: AccessRepository,
  predecessorSecret?: string,
): Promise<{ secret: string; digest: string; expiresAt: Date }> {
  if (predecessorSecret) {
    await revokeSession(predecessorSecret, now, repository);
  }

  const secret = randomBytes(32).toString('base64url');
  const digest = digestSessionSecret(secret);
  const expiresAt = new Date(now.getTime() + SESSION_TTL_MS);

  await repository.createSession({
    digest,
    principalId,
    issuedAt: new Date(now),
    expiresAt,
    revokedAt: null,
  });

  return { secret, digest, expiresAt };
}

export async function validateSession(
  secret: string,
  now: Date,
  repository: AccessRepository,
): Promise<SessionValidation> {
  if (!secret) return { kind: 'INVALID', reason: 'MISSING' };

  const session = await repository.findSessionByDigest(digestSessionSecret(secret));
  if (!session) return { kind: 'INVALID', reason: 'MISSING' };
  if (session.revokedAt) return { kind: 'INVALID', reason: 'REVOKED' };
  if (now.getTime() >= session.expiresAt.getTime()) return { kind: 'INVALID', reason: 'EXPIRED' };

  const principal = await repository.getPrincipalById(session.principalId);
  if (!principal || principal.status !== 'ACTIVE') {
    return { kind: 'INVALID', reason: 'PRINCIPAL_DISABLED' };
  }

  return {
    kind: 'VALID',
    principalId: session.principalId,
    expiresAt: session.expiresAt,
  };
}
