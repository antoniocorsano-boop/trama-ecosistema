import type { IdentityRepository } from '../ports/identity-repository.ts';
import type { AccessSessionRecord, PrincipalResolution, VerifiedExternalIdentity } from './types.ts';
import { normalizeLoginEmail } from './email.ts';

export async function isPilotAliasAllowed(repo: IdentityRepository, email: string): Promise<boolean> {
  const alias = await repo.findAliasByEmail(normalizeLoginEmail(email));
  return Boolean(alias && alias.status === 'ACTIVE' && alias.pilotAllowed);
}

export async function isSessionBindingCurrent(repo: IdentityRepository, record: AccessSessionRecord): Promise<boolean> {
  const alias = await repo.getAlias(record.aliasId);
  return Boolean(
    alias
    && alias.status === 'ACTIVE'
    && alias.pilotAllowed
    && alias.principalId === record.principalId
    && alias.providerIssuer === record.providerIssuer
    && alias.providerSubject === record.providerSubject
  );
}

export async function resolvePrincipalForVerifiedIdentity(
  repo: IdentityRepository,
  input: VerifiedExternalIdentity,
): Promise<PrincipalResolution> {
  const alias = await repo.findAliasByExternalIdentity({ issuer: input.issuer, subject: input.subject });
  if (!alias || alias.status !== 'ACTIVE' || !alias.pilotAllowed) return { ok: false, code: 'ACCESS_DENIED' };
  if (input.verifiedEmail && normalizeLoginEmail(input.verifiedEmail) !== alias.normalizedValue) return { ok: false, code: 'ACCESS_DENIED' };
  const principal = await repo.getPrincipal(alias.principalId);
  if (!principal || principal.status !== 'ACTIVE') return { ok: false, code: 'ACCESS_DENIED' };
  const contexts = await repo.listActiveContexts(principal.principalId);
  if (contexts.length !== 1) return { ok: false, code: 'ACCESS_DENIED' };
  const context = contexts[0]!;
  if (context.status !== 'ACTIVE' || context.contextType !== 'INSTITUTION' || !context.institutionRef?.trim()) {
    return { ok: false, code: 'ACCESS_DENIED' };
  }
  return { ok: true, principal, alias, context };
}
