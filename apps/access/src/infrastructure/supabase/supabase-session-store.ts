import type { AccessSessionRecord } from '../../domain/types.ts';
import type { SessionStore } from '../../ports/session-store.ts';
import { runAccessRpc, type SupabaseRpcClientLike } from './supabase-rpc.ts';

type SessionRow = {
  session_digest: string;
  principal_id: string;
  context_id: string;
  alias_id: string;
  provider_issuer: string;
  provider_subject: string;
  created_at: string;
  absolute_expires_at: string;
  revoked_at?: string | null;
  auth_method: 'EMAIL_OTP';
  last_entitlement_check_at: string;
};

function fromRow(row: SessionRow | null): AccessSessionRecord | null {
  if (!row) return null;
  return {
    sessionDigest: row.session_digest,
    principalId: row.principal_id,
    contextId: row.context_id,
    aliasId: row.alias_id,
    providerIssuer: row.provider_issuer,
    providerSubject: row.provider_subject,
    createdAt: new Date(row.created_at),
    absoluteExpiresAt: new Date(row.absolute_expires_at),
    revokedAt: row.revoked_at ? new Date(row.revoked_at) : undefined,
    authMethod: row.auth_method,
    lastEntitlementCheckAt: new Date(row.last_entitlement_check_at),
  };
}

export class SupabaseSessionStore implements SessionStore {
  constructor(private readonly client: SupabaseRpcClientLike) {}

  async create(session: AccessSessionRecord): Promise<void> {
    await runAccessRpc<null>(this.client, 'access_session_create', {
      p_session_digest: session.sessionDigest,
      p_principal_id: session.principalId,
      p_context_id: session.contextId,
      p_alias_id: session.aliasId,
      p_provider_issuer: session.providerIssuer,
      p_provider_subject: session.providerSubject,
      p_created_at: session.createdAt.toISOString(),
      p_absolute_expires_at: session.absoluteExpiresAt.toISOString(),
      p_revoked_at: session.revokedAt?.toISOString() ?? null,
      p_auth_method: session.authMethod,
      p_last_entitlement_check_at: session.lastEntitlementCheckAt.toISOString(),
    });
  }

  async findByDigest(sessionDigest: string): Promise<AccessSessionRecord | null> {
    return fromRow(await runAccessRpc<SessionRow | null>(this.client, 'access_session_find', { p_session_digest: sessionDigest }));
  }

  async revoke(sessionDigest: string, at: Date): Promise<void> {
    await runAccessRpc<null>(this.client, 'access_session_revoke', {
      p_session_digest: sessionDigest,
      p_revoked_at: at.toISOString(),
    });
  }
}
