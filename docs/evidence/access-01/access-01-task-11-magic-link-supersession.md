# ACCESS-01 Task 11 — Magic Link Supersession Note

State: `APPROVED_2026-10-11`

## Decision

The numeric email OTP transport described by the original ACCESS-01 Task 11 authorization/implementation material is superseded for the pilot by **Supabase email Magic Link**.

This note changes authentication transport only. It does not broaden authority, deployment, federation, data scope, provider count, plan, or pilot population.

## Current canonical transport

```text
pre-authorized email alias
  -> Supabase signInWithOtp(..., shouldCreateUser=false, emailRedirectTo=<configured TRAMA Access callback>)
  -> Magic Link callback (PKCE code or governed token-hash form)
  -> verified provider issuer + subject
  -> ACTIVE principal
  -> ACTIVE context
  -> ACTIVE/time-valid entitlement
  -> local TRAMA Access session (EMAIL_MAGIC_LINK)
```

A valid Supabase authentication result is necessary but is not sufficient for TRAMA authorization.

## Preserved security invariants

- `shouldCreateUser=false`; unknown emails cannot create provider users through the runtime.
- Unknown/disallowed aliases do not trigger a provider email send and receive a neutral public request result.
- Email matching never replaces exact `issuer + subject` authority after provider verification.
- No provider access token, refresh token, session object, Magic Link code, or token hash is persisted in TRAMA state.
- Provider-authenticated identities that fail TRAMA authorization create no local session and trigger best-effort provider logout.
- AccessSession TTL remains absolute `28800` seconds.
- The private Access store, RLS/grants boundary, entitlement model, and four shared limiter scopes remain unchanged except for the forward auth-method migration.
- The existing `OTP_*` limiter scope names are retained as internal historical identifiers only; they no longer describe the user-facing transport.

## Infrastructure scope

- Supabase organization: `EduManag` (`kpwzlloivhstoaiqjyjb`)
- TRAMA Access project ref: `toxhflbmipnwtgxgevfj`
- Region: `eu-central-1`
- Plan: Free
- Email delivery: Supabase built-in email for the single authorized pilot
- Custom SMTP: not authorized / not required for this pilot
- Provider users: exactly one pre-authorized pilot
- Public deploy/federation: not authorized by Task 11

## Canonical supporting documents

- Design: `docs/superpowers/specs/2026-10-11-access-01-magic-link-supabase-registry-design.md`
- Implementation plan: `docs/superpowers/plans/2026-10-11-access-01-magic-link-supabase-registry.md`
- Supabase registry: `docs/operations/TRAMA_SUPABASE_PROJECT_REGISTRY.md`
- Live receipt template: `docs/evidence/access-01/access-01-task-11-live-receipt.template.md`

Where older Task 11 documents say `OTP-only`, numeric token entry, `{{ .Token }}`, or `EMAIL_OTP` as the current pilot behavior, this approved note and the documents above define the current implementation. Historical migration files remain immutable evidence of the earlier design and must not be rewritten.
