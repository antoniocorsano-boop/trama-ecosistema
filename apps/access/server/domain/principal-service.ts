import { randomUUID } from 'node:crypto';
import type { AccessRepository } from '../ports/access-repository.js';
import type { ProfessionalPrincipal, VerifiedProviderIdentity } from './types.js';

export type PrincipalResolution =
  | { kind: 'ACTIVE'; principal: ProfessionalPrincipal }
  | { kind: 'DENIED' };

function normalizeVerifiedIdentity(identity: VerifiedProviderIdentity): VerifiedProviderIdentity {
  const issuer = identity.issuer?.trim();
  const subject = identity.subject?.trim();
  if (!issuer || !subject) throw new Error('VERIFIED_PROVIDER_IDENTITY_INVALID');
  return { issuer, subject };
}

export async function resolveProfessionalPrincipal(
  identity: VerifiedProviderIdentity,
  repository: AccessRepository,
  options: { allowCreate: boolean },
): Promise<PrincipalResolution> {
  const verified = normalizeVerifiedIdentity(identity);
  const existing = await repository.findPrincipalByIdentity(verified);

  if (existing) {
    return existing.status === 'ACTIVE' ? { kind: 'ACTIVE', principal: existing } : { kind: 'DENIED' };
  }

  if (!options.allowCreate) return { kind: 'DENIED' };

  const created = await repository.createPrincipal(verified, randomUUID());
  return created.status === 'ACTIVE' ? { kind: 'ACTIVE', principal: created } : { kind: 'DENIED' };
}
