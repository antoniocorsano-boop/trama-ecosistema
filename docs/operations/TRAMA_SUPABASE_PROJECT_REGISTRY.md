# TRAMA — Supabase Project Registry

Status: CANONICAL OPERATIONAL REGISTRY  
Last verified: 2026-10-11  
Organization: `EduManag`  
Organization id/slug: `kpwzlloivhstoaiqjyjb`

## Purpose

This registry preserves project-level Supabase facts that materially affect the TRAMA ecosystem. It is operational memory, not a credential store.

Evidence labels:

- `VERIFIED/OBSERVED` — read directly from the Supabase organization/project connector or live database state on the verification date;
- `VERIFIED/CODE-EVIDENCE` — verified in the corresponding application repository;
- `HISTORICAL/CODE-EVIDENCE` — implementation precedent in code/docs, without asserting current provider settings when the Supabase project is paused;
- `UNKNOWN` — intentionally not inferred.

## Projects

| Project | Ref | Region | Observed lifecycle state | Ecosystem role | Auth pattern evidence | Evidence status | Explicit unknowns |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TRAMA Access | `toxhflbmipnwtgxgevfj` | `eu-central-1` | `ACTIVE_HEALTHY` | Dedicated TRAMA identity/access provider and private Access store | Controlled pilot uses Supabase default email Magic Link with S256 PKCE, `create_user=false`, callback origin pinned to TRAMA Access, exact issuer+subject binding, pre-authorized alias, institutional context and entitlement checks; one provider pilot is reserved by a durable project-wide claim before Auth mutation | `VERIFIED/OBSERVED` + `VERIFIED/CODE-EVIDENCE` | Current Dashboard template remains Supabase default Magic Link; no custom SMTP is authorized for the pilot; live pilot provisioning/smoke remains separately gated |
| DOCENTE OS MFA Test | `xyowtnivxnzgwewvvmyz` | `eu-west-1` | `INACTIVE` | Historical MFA test environment | Dedicated MFA test project; not selected as the TRAMA Access baseline | `VERIFIED/OBSERVED` | Current Auth provider configuration not asserted while project is inactive |
| CurManLight Arena Beta | `ysgaokenrutmgzkhcxvy` | `eu-west-1` | `INACTIVE` | Arena Beta identity/data environment | Arena Beta application code uses email/password sign-up/sign-in, email confirmation and password recovery | `VERIFIED/OBSERVED` + `HISTORICAL/CODE-EVIDENCE` | Current paused-project Dashboard Auth settings not inferred from code |
| `corsano.antonio@icdonmilaniariano.edu.it's Project` | `gnshgapmwyjamhmlikeg` | `eu-west-1` | `ACTIVE_HEALTHY` | Historical Supabase project in the same organization | Live `auth.users` observation: 4 users with provider `email`; all 4 had password credentials, confirmed email and sign-in activity at verification time | `VERIFIED/OBSERVED` | Application ownership/long-term ecosystem role remains historical unless explicitly reassigned |
| DOCENTE OS Production | `xpxhlmpsvfzgsjxgieks` | `eu-central-1` | `INACTIVE` | DOCENTE OS production Supabase project | DOCENTE OS architecture contains a passwordless Magic Link implementation: `signInWithOtp`, `/auth/confirm`, PKCE code exchange/token-hash verification; the P1 identity baseline records live E2E Magic Link verification | `VERIFIED/OBSERVED` + `HISTORICAL/CODE-EVIDENCE` | Current paused-project Dashboard Auth settings are not inferred from the repository |

## Canonical precedent and current TRAMA Access specialization

DOCENTE OS is the ecosystem precedent for the Supabase **Magic Link transport pattern**, not for TRAMA authorization. TRAMA Access now specializes that precedent for the default Supabase email template by binding the request and callback with server-generated S256 PKCE:

```text
pre-authorized email alias
  -> server-generated PKCE verifier + host-only HttpOnly cookie
  -> Supabase /auth/v1/otp
       create_user=false
       redirect_to=<configured TRAMA Access callback>
       code_challenge=<S256(verifier)>
  -> default Supabase Magic Link
  -> /auth/confirm?code=...
  -> PKCE auth-code exchange using the matching verifier
  -> exact provider issuer + subject
  -> ACTIVE principal
  -> exactly one ACTIVE institutional context
  -> ACTIVE/time-valid entitlement
  -> local TRAMA Access session
```

A valid Supabase session alone never grants a TRAMA Access session. Provider session/token material is transient and is not persisted by TRAMA.

The one-pilot provisioning boundary is also project-wide: a private singleton claim for the normalized pilot email is acquired before any provider-user inspection or creation. A different email cannot race past that reservation; an idempotent retry for the same pilot must still revalidate the governed principal/context/entitlement graph before succeeding.

## TRAMA Access live postflight — 2026-10-11

Direct live observation on project `toxhflbmipnwtgxgevfj` after exact-head qualification and independent review:

- applied migrations: `access_live`, `access_pilot_provision`, `access_magic_link_auth_method`, `access_pilot_claim_guard`;
- `access_sessions.auth_method` is constrained to `EMAIL_MAGIC_LINK`;
- `trama_access_private.pilot_provision_claim` exists with RLS enabled and no direct non-`postgres` table grants;
- `public.access_claim_pilot(text)` exists and EXECUTE is granted only to `postgres` and `service_role`;
- live counts remain zero for `auth.users`, `auth.identities`, principals, login aliases, institutional contexts, application entitlements, Access sessions, rate-limit events and pilot claims;
- no pilot provider user has been created and no Magic Link has been sent yet;
- Supabase Security Advisor reports only INFO `rls_enabled_no_policy` findings for the seven private tables. This is consistent with the current private-store model: direct client table grants are absent and access is mediated through service-role-only governed RPCs.

The pilot-claim migration initially failed transactionally because `POSITION(... IN ...)` had been written as the invalid schema-qualified form `pg_catalog.position(...)`. The failure left no claim table/function behind. A regression test reproduced the defect (101/102 tests PASS, one intentional RED), the migration was corrected to valid PostgreSQL syntax, exact head `a9d710bf8ad92464465d19254f6e8bc703d154b6` passed TRAMA Access #267, Governance #2325 and TRAMA Gateway #356, and fresh Codex review reported no major P1/P2 issue before the corrected migration was applied live.

## Safety rules

This file must never contain credential values or authentication artifacts. In particular, do not store:

- secret/service-role/API key values;
- passwords;
- OAuth authorization codes;
- bearer/access/refresh tokens;
- SMTP credentials;
- Magic Link codes or token hashes;
- PKCE verifiers;
- provider session objects;
- user secrets.

Stable operational identifiers such as organization ids, project refs, regions and lifecycle states are permitted because they are required to disambiguate infrastructure.

## Update rule

Update this registry when a Supabase project is created, renamed, paused/restored, repurposed, transferred, or when its authentication model materially changes. Always distinguish direct observation from repository evidence and from unknown provider state.
