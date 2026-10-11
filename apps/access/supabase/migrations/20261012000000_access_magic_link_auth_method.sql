-- ACCESS-01 Task 11 forward transition from numeric email OTP to email Magic Link.
-- The historical access_live migration remains immutable; only new sessions are accepted after this migration.

alter table trama_access_private.access_sessions
  drop constraint if exists access_sessions_auth_method_check;

alter table trama_access_private.access_sessions
  add constraint access_sessions_auth_method_check
  check (auth_method = 'EMAIL_MAGIC_LINK');

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
  if p_auth_method <> 'EMAIL_MAGIC_LINK' then raise exception 'invalid auth method'; end if;
  insert into trama_access_private.access_sessions (
    session_digest, principal_id, context_id, alias_id, provider_issuer, provider_subject,
    created_at, absolute_expires_at, revoked_at, auth_method, last_entitlement_check_at
  ) values (
    p_session_digest, p_principal_id, p_context_id, p_alias_id, p_provider_issuer, p_provider_subject,
    p_created_at, p_absolute_expires_at, p_revoked_at, p_auth_method, p_last_entitlement_check_at
  );
end
$$;

revoke all on function public.access_session_create(text,text,text,text,text,text,timestamptz,timestamptz,timestamptz,text,timestamptz)
  from public, anon, authenticated;
grant execute on function public.access_session_create(text,text,text,text,text,text,timestamptz,timestamptz,timestamptz,text,timestamptz)
  to service_role;
