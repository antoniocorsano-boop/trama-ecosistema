-- ACCESS-01 Task 11 guarded one-pilot provisioning.
-- This function is server/service-role only and never returns personal data.
create or replace function public.access_provision_pilot(
  p_principal_id text,
  p_alias_id text,
  p_context_id text,
  p_entitlement_id text,
  p_normalized_email text,
  p_provider_issuer text,
  p_provider_subject text,
  p_institution_ref text,
  p_valid_from timestamptz
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_alias trama_access_private.login_aliases%rowtype;
  v_context trama_access_private.institutional_contexts%rowtype;
  v_active_context_count integer;
  v_active_entitlement_count integer;
begin
  if p_normalized_email is null or btrim(p_normalized_email) = ''
     or p_provider_issuer is null or btrim(p_provider_issuer) = ''
     or p_provider_subject is null or btrim(p_provider_subject) = ''
     or p_institution_ref is null or btrim(p_institution_ref) = '' then
    raise exception 'invalid pilot provisioning contract';
  end if;

  -- Serialize provisioning for this alias across callers. A collision can only
  -- reduce concurrency and cannot weaken the one-pilot boundary.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('TASK11:' || p_normalized_email, 0)
  );

  select * into v_alias
  from trama_access_private.login_aliases
  where normalized_value = p_normalized_email
  limit 1;

  if found then
    if v_alias.status <> 'ACTIVE'
       or v_alias.pilot_allowed is not true
       or v_alias.provider_issuer <> p_provider_issuer
       or v_alias.provider_subject <> p_provider_subject then
      raise exception 'subject binding mismatch';
    end if;

    if not exists (
      select 1 from trama_access_private.principals p
      where p.principal_id = v_alias.principal_id and p.status = 'ACTIVE'
    ) then
      raise exception 'principal state mismatch';
    end if;

    select count(*)::integer into v_active_context_count
    from trama_access_private.institutional_contexts c
    where c.principal_id = v_alias.principal_id and c.status = 'ACTIVE';
    if v_active_context_count <> 1 then raise exception 'context cardinality mismatch'; end if;

    select * into v_context
    from trama_access_private.institutional_contexts c
    where c.principal_id = v_alias.principal_id and c.status = 'ACTIVE'
    limit 1;
    if v_context.context_type <> 'INSTITUTION' or v_context.institution_ref <> p_institution_ref then
      raise exception 'institution context mismatch';
    end if;

    select count(*)::integer into v_active_entitlement_count
    from trama_access_private.application_entitlements e
    where e.principal_id = v_alias.principal_id
      and e.context_id = v_context.context_id
      and e.status = 'ACTIVE'
      and e.application_key = 'DOCENTE_OS'
      and e.entitlement_key = 'USE'
      and e.valid_from <= p_valid_from
      and (e.valid_until is null or e.valid_until > p_valid_from);
    if v_active_entitlement_count <> 1 then raise exception 'entitlement state mismatch'; end if;
    return;
  end if;

  if exists (
    select 1 from trama_access_private.login_aliases a
    where a.provider_issuer = p_provider_issuer and a.provider_subject = p_provider_subject
  ) then
    raise exception 'provider subject already bound';
  end if;

  insert into trama_access_private.principals(principal_id, status)
  values (p_principal_id, 'ACTIVE');

  insert into trama_access_private.login_aliases(
    alias_id, principal_id, kind, normalized_value, status,
    provider_issuer, provider_subject, pilot_allowed
  ) values (
    p_alias_id, p_principal_id, 'EMAIL', p_normalized_email, 'ACTIVE',
    p_provider_issuer, p_provider_subject, true
  );

  insert into trama_access_private.institutional_contexts(
    context_id, principal_id, context_type, institution_ref, status
  ) values (
    p_context_id, p_principal_id, 'INSTITUTION', p_institution_ref, 'ACTIVE'
  );

  insert into trama_access_private.application_entitlements(
    entitlement_id, principal_id, context_id, application_key,
    entitlement_key, status, valid_from, valid_until
  ) values (
    p_entitlement_id, p_principal_id, p_context_id, 'DOCENTE_OS',
    'USE', 'ACTIVE', p_valid_from, null
  );
end
$$;

revoke all on function public.access_provision_pilot(text,text,text,text,text,text,text,text,timestamptz)
from public, anon, authenticated;
grant execute on function public.access_provision_pilot(text,text,text,text,text,text,text,text,timestamptz)
to service_role;
