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
| TRAMA Access | `toxhflbmipnwtgxgevfj` | `eu-central-1` | `ACTIVE_HEALTHY` | Dedicated TRAMA identity/access provider and private Access store | Task 11 baseline used email OTP; decision 2026-10-11 changes the pilot to Supabase Magic Link with `shouldCreateUser=false`, exact issuer+subject binding, pre-authorized alias, context and entitlement checks | `VERIFIED/OBSERVED` + `VERIFIED/CODE-EVIDENCE` | Current Dashboard template remains Supabase default Magic Link; no custom SMTP is authorized for the pilot |
| DOCENTE OS MFA Test | `xyowtnivxnzgwewvvmyz` | `eu-west-1` | `INACTIVE` | Historical MFA test environment | Dedicated MFA test project; not selected as the TRAMA Access baseline | `VERIFIED/OBSERVED` | Current Auth provider configuration not asserted while project is inactive |
| CurManLight Arena Beta | `ysgaokenrutmgzkhcxvy` | `eu-west-1` | `INACTIVE` | Arena Beta identity/data environment | Arena Beta application code uses email/password sign-up/sign-in, email confirmation and password recovery | `VERIFIED/OBSERVED` + `HISTORICAL/CODE-EVIDENCE` | Current paused-project Dashboard Auth settings not inferred from code |
| `corsano.antonio@icdonmilaniariano.edu.it's Project` | `gnshgapmwyjamhmlikeg` | `eu-west-1` | `ACTIVE_HEALTHY` | Historical Supabase project in the same organization | Live `auth.users` observation: 4 users with provider `email`; all 4 had password credentials, confirmed email and sign-in activity at verification time | `VERIFIED/OBSERVED` | Application ownership/long-term ecosystem role remains historical unless explicitly reassigned |
| DOCENTE OS Production | `xpxhlmpsvfzgsjxgieks` | `eu-central-1` | `INACTIVE` | DOCENTE OS production Supabase project | DOCENTE OS architecture contains a passwordless Magic Link implementation: `signInWithOtp`, `/auth/confirm`, PKCE code exchange/token-hash verification; the P1 identity baseline records live E2E Magic Link verification | `VERIFIED/OBSERVED` + `HISTORICAL/CODE-EVIDENCE` | Current paused-project Dashboard Auth settings are not inferred from the repository |

## Canonical precedent for TRAMA Access

DOCENTE OS is the ecosystem precedent for the Supabase **Magic Link transport pattern**, not for TRAMA authorization. TRAMA Access preserves the stricter chain:

```text
pre-authorized email alias
  -> signInWithOtp(..., shouldCreateUser=false)
  -> Magic Link callback verification
  -> exact provider issuer + subject
  -> ACTIVE principal
  -> ACTIVE context
  -> ACTIVE/time-valid entitlement
  -> local TRAMA Access session
```

A valid Supabase session alone never grants a TRAMA Access session.

## Safety rules

This file must never contain credential values or authentication artifacts. In particular, do not store:

- secret/service-role/API key values;
- passwords;
- OAuth authorization codes;
- bearer/access/refresh tokens;
- SMTP credentials;
- Magic Link codes or token hashes;
- provider session objects;
- user secrets.

Stable operational identifiers such as organization ids, project refs, regions and lifecycle states are permitted because they are required to disambiguate infrastructure.

## Update rule

Update this registry when a Supabase project is created, renamed, paused/restored, repurposed, transferred, or when its authentication model materially changes. Always distinguish direct observation from repository evidence and from unknown provider state.