import type { IdentityRepository } from '../../ports/identity-repository.ts';
import type { ApplicationEntitlement, InstitutionalContext, LoginAlias, Principal } from '../../domain/types.ts';
import { runAccessRpc, type SupabaseRpcClientLike } from './supabase-rpc.ts';

type AliasRow = {
  alias_id: string; principal_id: string; kind: 'EMAIL'; normalized_value: string; status: LoginAlias['status'];
  provider_issuer: string; provider_subject: string; pilot_allowed: boolean;
};
type PrincipalRow = { principal_id: string; status: Principal['status'] };
type ContextRow = {
  context_id: string; principal_id: string; context_type: InstitutionalContext['contextType']; institution_ref?: string | null; status: InstitutionalContext['status'];
};
type EntitlementRow = {
  entitlement_id: string; principal_id: string; context_id: string; application_key: ApplicationEntitlement['applicationKey'];
  entitlement_key: ApplicationEntitlement['entitlementKey']; status: ApplicationEntitlement['status']; valid_from: string; valid_until?: string | null;
};

function aliasFromRow(row: AliasRow | null): LoginAlias | null {
  if (!row) return null;
  return {
    aliasId: row.alias_id,
    principalId: row.principal_id,
    kind: row.kind,
    normalizedValue: row.normalized_value,
    status: row.status,
    providerIssuer: row.provider_issuer,
    providerSubject: row.provider_subject,
    pilotAllowed: row.pilot_allowed,
  };
}

function contextFromRow(row: ContextRow): InstitutionalContext {
  return {
    contextId: row.context_id,
    principalId: row.principal_id,
    contextType: row.context_type,
    institutionRef: row.institution_ref ?? undefined,
    status: row.status,
  };
}

function entitlementFromRow(row: EntitlementRow): ApplicationEntitlement {
  return {
    entitlementId: row.entitlement_id,
    principalId: row.principal_id,
    contextId: row.context_id,
    applicationKey: row.application_key,
    entitlementKey: row.entitlement_key,
    status: row.status,
    validFrom: new Date(row.valid_from),
    validUntil: row.valid_until ? new Date(row.valid_until) : undefined,
  };
}

export class SupabaseIdentityRepository implements IdentityRepository {
  constructor(private readonly client: SupabaseRpcClientLike) {}

  async findAliasByEmail(normalizedEmail: string, input?: { signal?: AbortSignal }): Promise<LoginAlias | null> {
    const row = await runAccessRpc<AliasRow | null>(
      this.client,
      'access_find_alias_by_email',
      { p_normalized_email: normalizedEmail },
      input?.signal,
    );
    return aliasFromRow(row);
  }

  async findAliasByExternalIdentity(identity: { issuer: string; subject: string }): Promise<LoginAlias | null> {
    const row = await runAccessRpc<AliasRow | null>(this.client, 'access_find_alias_by_external_identity', {
      p_provider_issuer: identity.issuer,
      p_provider_subject: identity.subject,
    });
    return aliasFromRow(row);
  }

  async getAlias(aliasId: string): Promise<LoginAlias | null> {
    return aliasFromRow(await runAccessRpc<AliasRow | null>(this.client, 'access_get_alias', { p_alias_id: aliasId }));
  }

  async getPrincipal(principalId: string): Promise<Principal | null> {
    const row = await runAccessRpc<PrincipalRow | null>(this.client, 'access_get_principal', { p_principal_id: principalId });
    return row ? { principalId: row.principal_id, status: row.status } : null;
  }

  async listActiveContexts(principalId: string): Promise<InstitutionalContext[]> {
    const rows = await runAccessRpc<ContextRow[]>(this.client, 'access_list_active_contexts', { p_principal_id: principalId });
    return (rows ?? []).map(contextFromRow);
  }

  async listEntitlements(principalId: string, contextId: string, at: Date): Promise<ApplicationEntitlement[]> {
    const rows = await runAccessRpc<EntitlementRow[]>(this.client, 'access_list_entitlements', {
      p_principal_id: principalId,
      p_context_id: contextId,
      p_at: at.toISOString(),
    });
    return (rows ?? []).map(entitlementFromRow);
  }
}
