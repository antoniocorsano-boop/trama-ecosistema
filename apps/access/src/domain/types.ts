export type PrincipalStatus = 'ACTIVE' | 'SUSPENDED' | 'DISABLED';
export type LoginAliasStatus = 'ACTIVE' | 'DISABLED';
export type ContextStatus = 'ACTIVE' | 'SUSPENDED' | 'DISABLED';
export type EntitlementStatus = 'ACTIVE' | 'SUSPENDED' | 'REVOKED';
export type ContextType = 'PERSONAL' | 'INSTITUTION';
export type CanonicalApplicationKey = 'DOCENTE_OS' | 'CURRICOLO_ATLAS' | 'STUDIO_ATLAS' | 'ARENA' | 'CONTROL_CENTER';
export type CanonicalEntitlementKey = 'USE' | 'READ' | 'AUTHOR' | 'ENTER' | 'GOVERNANCE_OPERATOR';

export interface Principal { principalId: string; status: PrincipalStatus; }
export interface LoginAlias {
  aliasId: string;
  principalId: string;
  kind: 'EMAIL';
  normalizedValue: string;
  status: LoginAliasStatus;
  providerIssuer: string;
  providerSubject: string;
  pilotAllowed: boolean;
}
export interface InstitutionalContext {
  contextId: string;
  principalId: string;
  contextType: ContextType;
  institutionRef?: string;
  status: ContextStatus;
}
export interface ApplicationEntitlement {
  entitlementId: string;
  principalId: string;
  contextId: string;
  applicationKey: CanonicalApplicationKey;
  entitlementKey: CanonicalEntitlementKey;
  status: EntitlementStatus;
  validFrom: Date;
  validUntil?: Date;
}
export interface VerifiedExternalIdentity { issuer: string; subject: string; verifiedEmail?: string; }
export type PrincipalResolution =
  | { ok: true; principal: Principal; alias: LoginAlias; context: InstitutionalContext }
  | { ok: false; code: 'ACCESS_DENIED' };

export interface AccessSessionRecord {
  sessionDigest: string;
  principalId: string;
  contextId: string;
  aliasId: string;
  providerIssuer: string;
  providerSubject: string;
  createdAt: Date;
  absoluteExpiresAt: Date;
  revokedAt?: Date;
  authMethod: 'EMAIL_MAGIC_LINK';
  lastEntitlementCheckAt: Date;
}
