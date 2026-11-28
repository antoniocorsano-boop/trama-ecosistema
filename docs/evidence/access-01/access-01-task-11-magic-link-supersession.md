# ACCESS-01 Task 11 — Magic Link Supersession Note

State: `APPROVED_2026-10-11`

## Decision

The numeric email OTP transport described by the original ACCESS-01 Task 11 authorization/implementation material is superseded for the pilot by **Supabase email Magic Link** using the provider's default email template plus **PKCE**.

This note changes authentication transport only. It does not broaden authority, deployment, federation, data scope, provider count, plan, or pilot population.

## Current canonical transport

```text
pre-authorized email alias
  -> server generates high-entropy PKCE code_verifier
  -> host-only HttpOnly/Secure/SameSite=Lax PKCE verifier cookie
  -> Supabase /auth/v1/otp
       create_user=false
       redirect_to=<configured TRAMA Access callback>
       code_challenge=<S256(verifier)>
       code_challenge_method=s256
  -> Supabase default Magic Link email
  -> /auth/confirm?code=<provider auth code>
  -> /auth/v1/token?grant_type=pkce with auth_code + code_verifier
  -> transient provider token/session reduced to verified issuer + subject + email
  -> independent bounded best-effort provider-session revocation
  -> exact governed issuer + subject binding
  -> ACTIVE principal
  -> exactly one ACTIVE institutional context with institution reference
  -> ACTIVE/time-valid entitlement
  -> local TRAMA Access session (EMAIL_MAGIC_LINK)
  -> PKCE verifier cookie cleared
```

The governed `token_hash` callback form remains accepted for compatibility, but the controlled pilot does not depend on a customized email template. A valid Supabase authentication result is necessary but is not sufficient for TRAMA authorization.

## Preserved security invariants

- Automatic provider-user creation is disabled (`create_user=false`); unknown emails cannot create provider users through the runtime.
- The Magic Link redirect derives only from the configured TRAMA Access origin; request headers cannot select the callback origin.
- Unknown/disallowed aliases do not trigger a provider email send and receive the same neutral public request result shape.
- PKCE is bound with S256; a `code` callback without the corresponding verifier cookie fails closed.
- Email matching never replaces exact `issuer + subject` authority after provider verification.
- No provider access token, refresh token, session object, Magic Link code, token hash, or PKCE verifier is persisted in TRAMA state.
- Provider tokens returned by a callback are best-effort revoked even if provider identity reduction fails.
- Transient provider-session cleanup is **outside the Magic Link verification deadline** and uses an independent finite `500 ms` abort budget; cleanup latency or failure cannot change an already established verified-identity result.
- Provider-authenticated identities that fail TRAMA authorization create no local session.
- AccessSession TTL remains absolute `28800` seconds.
- The private Access store, RLS/grants boundary, entitlement model, and four shared limiter scopes remain unchanged except for forward additive migrations.
- The existing `OTP_*` limiter scope names are retained as internal historical datastore identifiers only; they no longer describe the user-facing transport.

## One-pilot provisioning guard

The single-pilot boundary is now reserved **before any Supabase Auth inspection or user creation**:

1. `access_claim_pilot(normalized_email)` acquires the project-wide `TASK11:GLOBAL` transaction lock and persists one private singleton claim;
2. a retry for the same normalized email is allowed;
3. a different email conflicts before provider mutation;
4. only after the claim may the provisioning command inspect/create the provider user;
5. `access_provision_pilot(...)` reacquires the same global lock, requires the matching claim and enforces the global `pilot_allowed` boundary;
6. the idempotent existing-binding path re-enters the governed provisioning RPC and revalidates principal, context and entitlement before reporting `ALREADY_PROVISIONED`.

The claim is intentionally durable: if an external provider mutation fails, retry remains confined to the same authorized pilot identity rather than reopening the one-user race.

## Infrastructure scope

- Supabase organization: `EduManag` (`kpwzlloivhstoaiqjyjb`)
- TRAMA Access project ref: `toxhflbmipnwtgxgevfj`
- Region: `eu-central-1`
- Plan: Free
- Email delivery: Supabase built-in email for the single authorized pilot
- Email template: provider default Magic Link template
- Custom SMTP: not authorized / not required for this pilot
- Provider users: exactly one pre-authorized pilot
- Public deploy/federation: not authorized by Task 11

## Exact-head qualification

Qualified head: `9a6e6e57bd04048471996a81a23e5b6cc537d68e`.

Fresh checks on that exact head:

- TRAMA Access run `38173195936` / #264 — PASS
  - unit tests — PASS
  - typecheck — PASS
  - build — PASS
  - Browser Certification — PASS
  - Phase 2 invariant-validator adversarial tests — PASS
  - Phase 2 branch/runtime invariant validation — PASS
- Governance run `38173196010` / #2322 — PASS
- TRAMA Gateway run `38173196056` / #353 — PASS

No provider/database mutation is authorized by this qualification alone. A fresh independent review on the exact head is required before live preflight or provisioning.

## Canonical supporting documents

- Design: `docs/superpowers/specs/2026-10-11-access-01-magic-link-supabase-registry-design.md`
- Implementation plan: `docs/superpowers/plans/2026-10-11-access-01-magic-link-supabase-registry.md`
- Supabase registry: `docs/operations/TRAMA_SUPABASE_PROJECT_REGISTRY.md`
- Live receipt template: `docs/evidence/access-01/access-01-task-11-live-receipt.template.md`

Where older Task 11 documents say `OTP-only`, numeric token entry, `{{ .Token }}`, or `EMAIL_OTP` as the current pilot behavior, this approved note and the documents above define the current implementation. Historical migration files remain immutable evidence of the earlier design and must not be rewritten.
