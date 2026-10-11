import type { IdentityRepository } from '../ports/identity-repository.ts';
import type { ApplicationEntitlement, InstitutionalContext, LoginAlias, Principal } from '../domain/types.ts';

export class InMemoryIdentityRepository implements IdentityRepository {
  principals: Principal[];
  aliases: LoginAlias[];
  contexts: InstitutionalContext[];
  entitlements: ApplicationEntitlement[];
  constructor(seed: { principals?: Principal[]; aliases?: LoginAlias[]; contexts?: InstitutionalContext[]; entitlements?: ApplicationEntitlement[] } = {}) {
    this.principals = seed.principals ?? [];
    this.aliases = seed.aliases ?? [];
    this.contexts = seed.contexts ?? [];
    this.entitlements = seed.entitlements ?? [];
  }
  async findAliasByEmail(normalizedEmail: string) { return this.aliases.find((a) => a.normalizedValue === normalizedEmail) ?? null; }
  async findAliasByExternalIdentity(identity: { issuer: string; subject: string }) { return this.aliases.find((a) => a.providerIssuer === identity.issuer && a.providerSubject === identity.subject) ?? null; }
  async getPrincipal(principalId: string) { return this.principals.find((p) => p.principalId === principalId) ?? null; }
  async listActiveContexts(principalId: string) { return this.contexts.filter((c) => c.principalId === principalId && c.status === 'ACTIVE'); }
  async listEntitlements(principalId: string, contextId: string, at: Date) {
    return this.entitlements.filter((e) => e.principalId === principalId && e.contextId === contextId && e.status === 'ACTIVE' && e.validFrom <= at && (!e.validUntil || e.validUntil > at));
  }
}
