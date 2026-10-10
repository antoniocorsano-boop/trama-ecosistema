import type { AccessRepository } from '../ports/access-repository.js';
import {
  isCanonicalEntitlementPair,
  type AccessSessionRecord,
  type Application,
  type ApplicationEntitlement,
  type PrincipalContext,
  type PrincipalStatus,
  type ProfessionalPrincipal,
  type VerifiedProviderIdentity,
} from '../domain/types.js';

const identityKey = ({ issuer, subject }: VerifiedProviderIdentity) => `${issuer}\u0000${subject}`;
const entitlementKey = (principalId: string, application: Application) => `${principalId}\u0000${application}`;

export class InMemoryAccessRepository implements AccessRepository {
  private readonly principalsByIdentity = new Map<string, ProfessionalPrincipal>();
  private readonly principalsById = new Map<string, ProfessionalPrincipal>();
  private readonly contexts = new Map<string, PrincipalContext>();
  private readonly entitlements = new Map<string, ApplicationEntitlement>();
  private readonly sessions = new Map<string, AccessSessionRecord>();
  private lastLookup: VerifiedProviderIdentity | null = null;

  principalCount(): number {
    return this.principalsById.size;
  }

  lastIdentityLookup(): VerifiedProviderIdentity | null {
    return this.lastLookup ? { ...this.lastLookup } : null;
  }

  async findPrincipalByIdentity(identity: VerifiedProviderIdentity): Promise<ProfessionalPrincipal | null> {
    this.lastLookup = { issuer: identity.issuer, subject: identity.subject };
    const principal = this.principalsByIdentity.get(identityKey(identity));
    return principal ? { ...principal } : null;
  }

  async createPrincipal(identity: VerifiedProviderIdentity, principalId: string): Promise<ProfessionalPrincipal> {
    const key = identityKey(identity);
    const existing = this.principalsByIdentity.get(key);
    if (existing) return { ...existing };

    const principal: ProfessionalPrincipal = {
      principalId,
      issuer: identity.issuer,
      subject: identity.subject,
      status: 'ACTIVE',
    };
    this.principalsByIdentity.set(key, principal);
    this.principalsById.set(principalId, principal);
    return { ...principal };
  }

  async getPrincipalById(principalId: string): Promise<ProfessionalPrincipal | null> {
    const principal = this.principalsById.get(principalId);
    return principal ? { ...principal } : null;
  }

  async setPrincipalStatus(principalId: string, status: PrincipalStatus): Promise<void> {
    const principal = this.principalsById.get(principalId);
    if (!principal) throw new Error('PRINCIPAL_NOT_FOUND');
    const updated = { ...principal, status };
    this.principalsById.set(principalId, updated);
    this.principalsByIdentity.set(identityKey(updated), updated);
  }

  async getPrincipalContext(principalId: string): Promise<PrincipalContext | null> {
    const context = this.contexts.get(principalId);
    return context ? { ...context } : null;
  }

  async setPrincipalContext(context: PrincipalContext): Promise<void> {
    if (context.contextType === 'INSTITUTION' && !context.institutionRef?.trim()) {
      throw new Error('INSTITUTION_REF_REQUIRED');
    }
    if (context.contextType === 'PERSONAL' && context.institutionRef !== null) {
      throw new Error('PERSONAL_CONTEXT_INSTITUTION_REF_FORBIDDEN');
    }
    this.contexts.set(context.principalId, { ...context });
  }

  async listEntitlements(principalId: string): Promise<ApplicationEntitlement[]> {
    return [...this.entitlements.values()]
      .filter((entry) => entry.principalId === principalId)
      .map((entry) => ({ ...entry }));
  }

  async upsertEntitlement(entitlement: ApplicationEntitlement): Promise<void> {
    if (!isCanonicalEntitlementPair(entitlement.application, entitlement.entitlement)) {
      throw new Error('ENTITLEMENT_PAIR_INVALID');
    }
    this.entitlements.set(entitlementKey(entitlement.principalId, entitlement.application), {
      ...entitlement,
    });
  }

  async revokeEntitlement(principalId: string, application: Application): Promise<void> {
    const key = entitlementKey(principalId, application);
    const existing = this.entitlements.get(key);
    if (!existing) return;
    this.entitlements.set(key, { ...existing, status: 'REVOKED' });
  }

  async createSession(session: AccessSessionRecord): Promise<void> {
    this.sessions.set(session.digest, { ...session });
  }

  async findSessionByDigest(digest: string): Promise<AccessSessionRecord | null> {
    const session = this.sessions.get(digest);
    return session ? { ...session } : null;
  }

  async revokeSessionByDigest(digest: string, revokedAt: Date): Promise<void> {
    const session = this.sessions.get(digest);
    if (!session) return;
    this.sessions.set(digest, { ...session, revokedAt });
  }
}
