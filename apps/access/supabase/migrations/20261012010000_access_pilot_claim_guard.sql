-- ACCESS-01 Task 11 additive hardening.
-- Reserve the single pilot identity before any external Auth mutation and
-- revalidate the governed graph on every provisioning/idempotency path.

create table if not exists trama_access_private.pilot_provision_claim (
  singleton boolean primary key default true check (singleton is true),
  normalized_email text not null,
  claimed_at timestamptz not null default pg_catalog.transaction_timestamp()
);

alter table trama_access_private.pilot_provision_claim enable row level security;
revoke all on table trama_access_private.pilot_provision_claim from public, anon, authenticated;

create or replace function public.access_claim_pilot(p_normalized_email text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_email text := pg_catalog.lower(pg_catalog.btrim(p_normalized_email));
  v_existing_email text;
begin
  if v_email is null or v_email = '' or pg_catalog.position('@' in v_email) <= 1 then
    raise exception 'invalid pilot claim contract';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('TASK11:GLOBAL', 0)
  );

  select normalized_email into v_existing_email
  from trama_access_private.pilot_provision_claim
  where singleton is true
  for update;

  if not found then
    insert into trama_access_private.pilot_provision_claim(singleton, normalized_email)
    values (true, v_email);
    return 'CLAIMED';
  end if;

  if v_existing_email <> v_email then
    return 'CONFLICT';
  end if;

  return 'ALREADY_CLAIMED';
end
$$;

revoke all on function public.access_claim_pilot(text) from public, anon, authenticated;
grant execute on function public.access_claim_pilot(text) to service_role;

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
  v_email text := pg_catalog.lower(pg_catalog.btrim(p_normalized_email));
  v_claim_email text;
  v_alias trama_access_private.login_aliases%rowtype;
  v_context trama_access_private.institutional_contexts%rowtype;
  v_active_context_count integer;
  v_active_entitlement_count integer;
  v_pilot_count integer;
begin
  if v_email is null or v_email = ''
     or p_provider_issuer is null or pg_catalog.btrim(p_provider_issuer) = ''
     or p_provider_subject is null or pg_catalog.btrim(p_provider_subject) = ''
     or p_institution_ref is null or pg_catalog.btrim(p_institution_ref) = '' then
    raise exception 'invalid pilot provisioning contract';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('TASK11:GLOBAL', 0)
  );

  select normalized_email into v_claim_email
  from trama_access_private.pilot_provision_claim
  where singleton is true
  for update;

  if not found or v_claim_email <> v_email then
    raise exception 'PILOT_SCOPE_VIOLATION';
  end if;

  select count(*)::integer into v_pilot_count
  from trama_access_private.login_aliases
  where pilot_allowed is true;

  if v_pilot_count > 1 then
    raise exception 'PILOT_SCOPE_VIOLATION';
  end if;

  select * into v_alias
  from trama_access_private.login_aliases
  where normalized_value = v_email
  limit 1;

  if found then
    if v_pilot_count <> 1
       or v_alias.status <> 'ACTIVE'
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

  if v_pilot_count <> 0 then
    raise exception 'PILOT_SCOPE_VIOLATION';
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
    p_alias_id, p_principal_id, 'EMAIL', v_email, 'ACTIVE',
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
