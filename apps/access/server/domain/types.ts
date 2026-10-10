export type PrincipalStatus = 'ACTIVE' | 'DISABLED';
export type ContextType = 'PERSONAL' | 'INSTITUTION';
export type Application =
  | 'DOCENTE_OS'
  | 'CURRICOLO_ATLAS'
  | 'STUDIO_ATLAS'
  | 'ARENA'
  | 'CONTROL_CENTER';
export type Entitlement = 'USE' | 'READ' | 'AUTHOR' | 'ENTER' | 'GOVERNANCE_OPERATOR';
export type EntitlementStatus = 'ACTIVE' | 'REVOKED';

export type VerifiedProviderIdentity = {
  issuer: string;
  subject: string;
};

export type ProfessionalPrincipal = {
  principalId: string;
  issuer: string;
  subject: string;
  status: PrincipalStatus;
};

export type PrincipalContext = {
  principalId: string;
  contextType: ContextType;
  institutionRef: string | null;
};

export type ApplicationEntitlement = {
  principalId: string;
  application: Application;
  entitlement: Entitlement;
  status: EntitlementStatus;
};

export type AccessSessionRecord = {
  digest: string;
  principalId: string;
  issuedAt: Date;
  expiresAt: Date;
  revokedAt: Date | null;
};

export type LauncherItem = {
  application: Application;
  label: string;
  entitlement: Entitlement;
  availability: 'FEDERATION_PENDING';
};

export const CANONICAL_ENTITLEMENT_PAIRS = [
  ['DOCENTE_OS', 'USE'],
  ['CURRICOLO_ATLAS', 'READ'],
  ['STUDIO_ATLAS', 'AUTHOR'],
  ['ARENA', 'ENTER'],
  ['CONTROL_CENTER', 'GOVERNANCE_OPERATOR'],
] as const satisfies readonly (readonly [Application, Entitlement])[];

export function isCanonicalEntitlementPair(application: Application, entitlement: Entitlement): boolean {
  return CANONICAL_ENTITLEMENT_PAIRS.some(
    ([canonicalApplication, canonicalEntitlement]) =>
      canonicalApplication === application && canonicalEntitlement === entitlement,
  );
}
