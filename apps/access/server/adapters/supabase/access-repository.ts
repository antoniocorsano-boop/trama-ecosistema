import type { AccessRepository } from '../../ports/access-repository.js';
import type {
  AccessSessionRecord,
  Application,
  ApplicationEntitlement,
  ContextType,
  Entitlement,
  EntitlementStatus,
  PrincipalContext,
  PrincipalStatus,
  ProfessionalPrincipal,
  VerifiedProviderIdentity,
} from '../../domain/types.js';

export type SupabaseDataError = { message: string };
export type SupabaseDataResult<T> = { data: T | null; error: SupabaseDataError | null };

export interface SupabaseDataClient {
  selectOne(table: string, filters: Record<string, unknown>): Promise<SupabaseDataResult<unknown>>;
  selectMany(table: string, filters: Record<string, unknown>): Promise<SupabaseDataResult<unknown[]>>;
  insertOne(table: string, payload: Record<string, unknown>): Promise<SupabaseDataResult<unknown>>;
  upsertOne(
    table: string,
    payload: Record<string, unknown>,
    conflictColumns: string[],
  ): Promise<SupabaseDataResult<unknown>>;
  updateMany(
    table: string,
    payload: Record<string, unknown>,
    filters: Record<string, unknown>,
  ): Promise<SupabaseDataResult<unknown[]>>;
}

type DbRow = Record<string, unknown>;

const PRINCIPAL_STATUSES = new Set<PrincipalStatus>(['ACTIVE', 'DISABLED']);
const CONTEXT_TYPES = new Set<ContextType>(['PERSONAL', 'INSTITUTION']);
const APPLICATIONS = new Set<Application>([
  'DOCENTE_OS',
  'CURRICOLO_ATLAS',
  'STUDIO_ATLAS',
  'ARENA',
  'CONTROL_CENTER',
]);
const ENTITLEMENTS = new Set<Entitlement>(['USE', 'READ', 'AUTHOR', 'ENTER', 'GOVERNANCE_OPERATOR']);
const ENTITLEMENT_STATUSES = new Set<EntitlementStatus>(['ACTIVE', 'REVOKED']);

function storeFailure(): Error {
  return new Error('ACCESS_STORE_FAILURE');
}

function row(value: unknown): DbRow {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw storeFailure();
  return value as DbRow;
}

function text(value: unknown): string {
  if (typeof value !== 'string' || value.length === 0) throw storeFailure();
  return value;
}

function nullableText(value: unknown): string | null {
  if (value === null) return null;
  return text(value);
}

function date(value: unknown): Date {
  const parsed = typeof value === 'string' ? new Date(value) : null;
  if (!parsed || Number.isNaN(parsed.getTime())) throw storeFailure();
  return parsed;
}

function nullableDate(value: unknown): Date | null {
  if (value === null) return null;
  return date(value);
}

function enumValue<T extends string>(value: unknown, values: ReadonlySet<T>): T {
  if (typeof value !== 'string' || !values.has(value as T)) throw storeFailure();
  return value as T;
}

function principalFromRow(value: unknown): ProfessionalPrincipal {
  const record = row(value);
  return {
    principalId: text(record.principal_id),
    issuer: text(record.issuer),
    subject: text(record.subject),
    status: enumValue(record.status, PRINCIPAL_STATUSES),
  };
}

function contextFromRow(value: unknown): PrincipalContext {
  const record = row(value);
  return {
    principalId: text(record.principal_id),
    contextType: enumValue(record.context_type, CONTEXT_TYPES),
    institutionRef: nullableText(record.institution_ref),
  };
}

function entitlementFromRow(value: unknown): ApplicationEntitlement {
  const record = row(value);
  return {
    principalId: text(record.principal_id),
    application: enumValue(record.application, APPLICATIONS),
    entitlement: enumValue(record.entitlement, ENTITLEMENTS),
    status: enumValue(record.status, ENTITLEMENT_STATUSES),
  };
}

function sessionFromRow(value: unknown): AccessSessionRecord {
  const record = row(value);
  return {
    digest: text(record.session_digest),
    principalId: text(record.principal_id),
    issuedAt: date(record.issued_at),
    expiresAt: date(record.expires_at),
    revokedAt: nullableDate(record.revoked_at),
  };
}

function throwOnError<T>(result: SupabaseDataResult<T>): SupabaseDataResult<T> {
  if (result.error) throw storeFailure();
  return result;
}

function requireData<T>(result: SupabaseDataResult<T>): T {
  throwOnError(result);
  if (result.data === null) throw storeFailure();
  return result.data;
}

export class SupabaseAccessRepository implements AccessRepository {
  constructor(private readonly client: SupabaseDataClient) {}

  async findPrincipalByIdentity(identity: VerifiedProviderIdentity): Promise<ProfessionalPrincipal | null> {
    const result = throwOnError(
      await this.client.selectOne('professional_principal', {
        issuer: identity.issuer,
        subject: identity.subject,
      }),
    );
    return result.data === null ? null : principalFromRow(result.data);
  }

  async createPrincipal(
    identity: VerifiedProviderIdentity,
    principalId: string,
  ): Promise<ProfessionalPrincipal> {
    const data = requireData(
      await this.client.insertOne('professional_principal', {
        principal_id: principalId,
        issuer: identity.issuer,
        subject: identity.subject,
        status: 'ACTIVE',
      }),
    );
    return principalFromRow(data);
  }

  async getPrincipalById(principalId: string): Promise<ProfessionalPrincipal | null> {
    const result = throwOnError(
      await this.client.selectOne('professional_principal', { principal_id: principalId }),
    );
    return result.data === null ? null : principalFromRow(result.data);
  }

  async setPrincipalStatus(principalId: string, status: PrincipalStatus): Promise<void> {
    requireData(
      await this.client.updateMany(
        'professional_principal',
        { status },
        { principal_id: principalId },
      ),
    );
  }

  async getPrincipalContext(principalId: string): Promise<PrincipalContext | null> {
    const result = throwOnError(
      await this.client.selectOne('principal_context', { principal_id: principalId }),
    );
    return result.data === null ? null : contextFromRow(result.data);
  }

  async setPrincipalContext(context: PrincipalContext): Promise<void> {
    requireData(
      await this.client.upsertOne(
        'principal_context',
        {
          principal_id: context.principalId,
          context_type: context.contextType,
          institution_ref: context.institutionRef,
        },
        ['principal_id'],
      ),
    );
  }

  async listEntitlements(principalId: string): Promise<ApplicationEntitlement[]> {
    const data = requireData(
      await this.client.selectMany('principal_entitlement', { principal_id: principalId }),
    );
    return data.map(entitlementFromRow);
  }

  async upsertEntitlement(entitlement: ApplicationEntitlement): Promise<void> {
    requireData(
      await this.client.upsertOne(
        'principal_entitlement',
        {
          principal_id: entitlement.principalId,
          application: entitlement.application,
          entitlement: entitlement.entitlement,
          status: entitlement.status,
        },
        ['principal_id', 'application'],
      ),
    );
  }

  async revokeEntitlement(principalId: string, application: Application): Promise<void> {
    requireData(
      await this.client.updateMany(
        'principal_entitlement',
        { status: 'REVOKED' },
        { principal_id: principalId, application },
      ),
    );
  }

  async createSession(session: AccessSessionRecord): Promise<void> {
    requireData(
      await this.client.insertOne('access_session', {
        session_digest: session.digest,
        principal_id: session.principalId,
        issued_at: session.issuedAt.toISOString(),
        expires_at: session.expiresAt.toISOString(),
        revoked_at: session.revokedAt?.toISOString() ?? null,
      }),
    );
  }

  async findSessionByDigest(digest: string): Promise<AccessSessionRecord | null> {
    const result = throwOnError(
      await this.client.selectOne('access_session', { session_digest: digest }),
    );
    return result.data === null ? null : sessionFromRow(result.data);
  }

  async revokeSessionByDigest(digest: string, revokedAt: Date): Promise<void> {
    requireData(
      await this.client.updateMany(
        'access_session',
        { revoked_at: revokedAt.toISOString() },
        { session_digest: digest },
      ),
    );
  }
}
