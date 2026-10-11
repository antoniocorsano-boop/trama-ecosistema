-- ACCESS-01 Task 11 live store.
-- Internal identity/session/rate-limit state lives outside exposed API schemas.
create schema if not exists trama_access_private;
revoke all on schema trama_access_private from public, anon, authenticated;

create table if not exists trama_access_private.principals (
  principal_id text primary key,
  status text not null check (status in ('ACTIVE','SUSPENDED','DISABLED'))
);

create table if not exists trama_access_private.login_aliases (
  alias_id text primary key,
  principal_id text not null references trama_access_private.principals(principal_id) on delete restrict,
  kind text not null check (kind = 'EMAIL'),
  normalized_value text not null unique,
  status text not null check (status in ('ACTIVE','DISABLED')),
  provider_issuer text not null,
  provider_subject text not null,
  pilot_allowed boolean not null default false,
  unique (provider_issuer, provider_subject)
);

create table if not exists trama_access_private.institutional_contexts (
  context_id text primary key,
  principal_id text not null references trama_access_private.principals(principal_id) on delete restrict,
  context_type text not null check (context_type in ('PERSONAL','INSTITUTION')),
  institution_ref text,
  status text not null check (status in ('ACTIVE','SUSPENDED','DISABLED')),
  check (context_type <> 'INSTITUTION' or institution_ref is not null)
);

create table if not exists trama_access_private.application_entitlements (
  entitlement_id text primary key,
  principal_id text not null references trama_access_private.principals(principal_id) on delete restrict,
  context_id text not null references trama_access_private.institutional_contexts(context_id) on delete restrict,
  application_key text not null check (application_key in ('DOCENTE_OS','CURRICOLO_ATLAS','STUDIO_ATLAS','ARENA','CONTROL_CENTER')),
  entitlement_key text not null check (entitlement_key in ('USE','READ','AUTHOR','ENTER','GOVERNANCE_OPERATOR')),
  status text not null check (status in ('ACTIVE','SUSPENDED','REVOKED')),
  valid_from timestamptz not null,
  valid_until timestamptz,
  check (valid_until is null or valid_until > valid_from)
);

create table if not exists trama_access_private.access_sessions (
  session_digest text primary key,
  principal_id text not null references trama_access_private.principals(principal_id) on delete restrict,
  context_id text not null references trama_access_private.institutional_contexts(context_id) on delete restrict,
  alias_id text not null references trama_access_private.login_aliases(alias_id) on delete restrict,
  provider_issuer text not null,
  provider_subject text not null,
  created_at timestamptz not null,
  absolute_expires_at timestamptz not null,
  revoked_at timestamptz,
  auth_method text not null check (auth_method = 'EMAIL_OTP'),
  last_entitlement_check_at timestamptz not null,
  check (absolute_expires_at > created_at)
);

create table if not exists trama_access_private.rate_limit_counters (
  scope text not null check (scope in ('OTP_REQUEST','OTP_REQUEST_GLOBAL','OTP_VERIFY','OTP_VERIFY_GLOBAL')),
  key_digest text not null,
  window_started_at timestamptz not null,
  count integer not null check (count > 0),
  primary key (scope, key_digest, window_started_at)
);

alter table trama_access_private.principals enable row level security;
alter table trama_access_private.login_aliases enable row level security;
alter table trama_access_private.institutional_contexts enable row level security;
alter table trama_access_private.application_entitlements enable row level security;
alter table trama_access_private.access_sessions enable row level security;
alter table trama_access_private.rate_limit_counters enable row level security;

revoke all on all tables in schema trama_access_private from public, anon, authenticated;
revoke all on all sequences in schema trama_access_private from public, anon, authenticated;

create or replace function public.access_find_alias_by_email(p_normalized_email text)
returns jsonb
language sql stable security definer set search_path = ''
as $$
  select to_jsonb(a)
  from trama_access_private.login_aliases a
  where a.normalized_value = p_normalized_email
  limit 1
$$;

create or replace function public.access_find_alias_by_external_identity(p_provider_issuer text, p_provider_subject text)
returns jsonb
language sql stable security definer set search_path = ''
as $$
  select to_jsonb(a)
  from trama_access_private.login_aliases a
  where a.provider_issuer = p_provider_issuer and a.provider_subject = p_provider_subject
  limit 1
$$;

create or replace function public.access_get_alias(p_alias_id text)
returns jsonb
language sql stable security definer set search_path = ''
as $$
  select to_jsonb(a) from trama_access_private.login_aliases a where a.alias_id = p_alias_id limit 1
$$;

create or replace function public.access_get_principal(p_principal_id text)
returns jsonb
language sql stable security definer set search_path = ''
as $$
  select to_jsonb(p) from trama_access_private.principals p where p.principal_id = p_principal_id limit 1
$$;

create or replace function public.access_list_active_contexts(p_principal_id text)
returns jsonb
language sql stable security definer set search_path = ''
as $$
  select coalesce(jsonb_agg(to_jsonb(c) order by c.context_id), '[]'::jsonb)
  from trama_access_private.institutional_contexts c
  where c.principal_id = p_principal_id and c.status = 'ACTIVE'
$$;

create or replace function public.access_list_entitlements(p_principal_id text, p_context_id text, p_at timestamptz)
returns jsonb
language sql stable security definer set search_path = ''
as $$
  select coalesce(jsonb_agg(to_jsonb(e) order by e.entitlement_id), '[]'::jsonb)
  from trama_access_private.application_entitlements e
  where e.principal_id = p_principal_id
    and e.context_id = p_context_id
    and e.status = 'ACTIVE'
    and e.valid_from <= p_at
    and (e.valid_until is null or e.valid_until > p_at)
$$;

create or replace function public.access_session_create(
  p_session_digest text, p_principal_id text, p_context_id text, p_alias_id text,
  p_provider_issuer text, p_provider_subject text, p_created_at timestamptz,
  p_absolute_expires_at timestamptz, p_revoked_at timestamptz,
  p_auth_method text, p_last_entitlement_check_at timestamptz
)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if p_auth_method <> 'EMAIL_OTP' then raise exception 'invalid auth method'; end if;
  insert into trama_access_private.access_sessions (
    session_digest, principal_id, context_id, alias_id, provider_issuer, provider_subject,
    created_at, absolute_expires_at, revoked_at, auth_method, last_entitlement_check_at
  ) values (
    p_session_digest, p_principal_id, p_context_id, p_alias_id, p_provider_issuer, p_provider_subject,
    p_created_at, p_absolute_expires_at, p_revoked_at, p_auth_method, p_last_entitlement_check_at
  );
end
$$;

create or replace function public.access_session_find(p_session_digest text)
returns jsonb
language sql stable security definer set search_path = ''
as $$
  select to_jsonb(s) from trama_access_private.access_sessions s where s.session_digest = p_session_digest limit 1
$$;

create or replace function public.access_session_revoke(p_session_digest text, p_revoked_at timestamptz)
returns void
language sql security definer set search_path = ''
as $$
  update trama_access_private.access_sessions
  set revoked_at = coalesce(revoked_at, p_revoked_at)
  where session_digest = p_session_digest
$$;

create or replace function public.access_rate_limit_consume(
  p_scope text, p_key_digest text, p_now timestamptz, p_limit integer, p_window_seconds integer
)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_window_start timestamptz;
  v_count integer;
  v_retry integer;
begin
  if p_scope not in ('OTP_REQUEST','OTP_REQUEST_GLOBAL','OTP_VERIFY','OTP_VERIFY_GLOBAL') then
    raise exception 'invalid rate limit scope';
  end if;
  if p_limit < 1 or p_window_seconds < 1 then raise exception 'invalid rate limit parameters'; end if;

  v_window_start := to_timestamp(floor(extract(epoch from p_now) / p_window_seconds) * p_window_seconds);

  insert into trama_access_private.rate_limit_counters(scope, key_digest, window_started_at, count)
  values (p_scope, p_key_digest, v_window_start, 1)
  on conflict (scope, key_digest, window_started_at)
  do update set count = trama_access_private.rate_limit_counters.count + 1
  returning count into v_count;

  v_retry := greatest(0, ceil(extract(epoch from (v_window_start + make_interval(secs => p_window_seconds) - p_now)))::integer);
  return jsonb_build_object('allowed', v_count <= p_limit, 'retry_after_seconds', case when v_count <= p_limit then 0 else v_retry end);
end
$$;

revoke all on function public.access_find_alias_by_email(text) from public, anon, authenticated;
revoke all on function public.access_find_alias_by_external_identity(text,text) from public, anon, authenticated;
revoke all on function public.access_get_alias(text) from public, anon, authenticated;
revoke all on function public.access_get_principal(text) from public, anon, authenticated;
revoke all on function public.access_list_active_contexts(text) from public, anon, authenticated;
revoke all on function public.access_list_entitlements(text,text,timestamptz) from public, anon, authenticated;
revoke all on function public.access_session_create(text,text,text,text,text,text,timestamptz,timestamptz,timestamptz,text,timestamptz) from public, anon, authenticated;
revoke all on function public.access_session_find(text) from public, anon, authenticated;
revoke all on function public.access_session_revoke(text,timestamptz) from public, anon, authenticated;
revoke all on function public.access_rate_limit_consume(text,text,timestamptz,integer,integer) from public, anon, authenticated;

grant execute on function public.access_find_alias_by_email(text) to service_role;
grant execute on function public.access_find_alias_by_external_identity(text,text) to service_role;
grant execute on function public.access_get_alias(text) to service_role;
grant execute on function public.access_get_principal(text) to service_role;
grant execute on function public.access_list_active_contexts(text) to service_role;
grant execute on function public.access_list_entitlements(text,text,timestamptz) to service_role;
grant execute on function public.access_session_create(text,text,text,text,text,text,timestamptz,timestamptz,timestamptz,text,timestamptz) to service_role;
grant execute on function public.access_session_find(text) to service_role;
grant execute on function public.access_session_revoke(text,timestamptz) to service_role;
grant execute on function public.access_rate_limit_consume(text,text,timestamptz,integer,integer) to service_role;
