import type {
  AccessSessionRecord,
  Application,
  ApplicationEntitlement,
  PrincipalContext,
  PrincipalStatus,
  ProfessionalPrincipal,
  VerifiedProviderIdentity,
} from '../domain/types.js';

export interface AccessRepository {
  findPrincipalByIdentity(identity: VerifiedProviderIdentity): Promise<ProfessionalPrincipal | null>;
  createPrincipal(identity: VerifiedProviderIdentity, principalId: string): Promise<ProfessionalPrincipal>;
  getPrincipalById(principalId: string): Promise<ProfessionalPrincipal | null>;
  setPrincipalStatus(principalId: string, status: PrincipalStatus): Promise<void>;

  getPrincipalContext(principalId: string): Promise<PrincipalContext | null>;
  setPrincipalContext(context: PrincipalContext): Promise<void>;

  listEntitlements(principalId: string): Promise<ApplicationEntitlement[]>;
  upsertEntitlement(entitlement: ApplicationEntitlement): Promise<void>;
  revokeEntitlement(principalId: string, application: Application): Promise<void>;

  createSession(session: AccessSessionRecord): Promise<void>;
  findSessionByDigest(digest: string): Promise<AccessSessionRecord | null>;
  revokeSessionByDigest(digest: string, revokedAt: Date): Promise<void>;
}
