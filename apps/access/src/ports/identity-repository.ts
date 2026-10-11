import type { ApplicationEntitlement, InstitutionalContext, LoginAlias, Principal } from '../domain/types.ts';

export interface IdentityRepository {
  findAliasByEmail(normalizedEmail: string, input?: { signal?: AbortSignal }): Promise<LoginAlias | null>;
  findAliasByExternalIdentity(identity: { issuer: string; subject: string }): Promise<LoginAlias | null>;
  getAlias(aliasId: string): Promise<LoginAlias | null>;
  getPrincipal(principalId: string): Promise<Principal | null>;
  listActiveContexts(principalId: string): Promise<InstitutionalContext[]>;
  listEntitlements(principalId: string, contextId: string, at: Date): Promise<ApplicationEntitlement[]>;
}
