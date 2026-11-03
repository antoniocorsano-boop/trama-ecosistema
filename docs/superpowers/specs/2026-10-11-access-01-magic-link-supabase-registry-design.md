# ACCESS-01 — Magic Link + Supabase Project Registry Design

Status: APPROVED IN CHAT / WRITTEN SPEC PENDING HUMAN REVIEW  
Date: 2026-10-11  
Repository: `antoniocorsano-boop/trama-ecosistema`  
PR: #273 (`feat/access-01-task-11-live-provider`)

## 1. Intent

Consolidate two decisions without opening a new technical front:

1. preserve in the TRAMA repository the authoritative operational knowledge about Supabase projects used by the ecosystem;
2. adapt TRAMA Access Task 11 from numeric email OTP to Supabase Magic Link while preserving the existing fail-closed authorization boundary.

The goal is not to redesign identity. The goal is to reuse an already proven ecosystem pattern, remove the custom-SMTP dependency for the pilot, and retain the stricter TRAMA Access authorization model.

## 2. Success criteria

This change is complete only when all of the following are true:

- the repository contains one canonical Supabase project registry with no secrets or credentials;
- the registry records organization, project refs, regions, observed states, ecosystem roles, and verified auth patterns;
- TRAMA Access requests a Magic Link through Supabase without creating unknown users;
- clicking a valid Magic Link cannot by itself grant a TRAMA Access session;
- after provider verification, TRAMA Access still resolves authorization through pre-authorized alias, exact provider issuer + subject, active context, and active entitlement;
- any mismatch fails closed and performs best-effort provider logout;
- local TRAMA Access session state records the authentication method as `EMAIL_MAGIC_LINK`;
- the previously applied live migration is not edited in place; the schema change is additive;
- the pilot remains one-user, Free-tier, no custom SMTP, no learner data, no public federation;
- RED -> GREEN tests and exact-head validation demonstrate the new flow before live pilot provisioning.

## 3. Current verified state

### 3.1 Supabase organization

Canonical organization:

- name: `EduManag`
- organization id/slug: `kpwzlloivhstoaiqjyjb`
- observed plan: Free

### 3.2 Projects currently visible in the organization

| Project | Ref | Region | Observed state | Auth / role notes |
| --- | --- | --- | --- | --- |
| TRAMA Access | `toxhflbmipnwtgxgevfj` | `eu-central-1` | ACTIVE_HEALTHY | Dedicated Access provider/store. At design time: 0 `auth.users`, 0 private Access identities/sessions. Current Task 11 implementation is numeric email OTP. |
| DOCENTE OS MFA Test | `xyowtnivxnzgwewvvmyz` | `eu-west-1` | INACTIVE | Historical MFA test environment. Not a baseline for TRAMA Access pilot. |
| CurManLight Arena Beta | `ysgaokenrutmgzkhcxvy` | `eu-west-1` | INACTIVE | Arena Beta identity uses email/password with confirmation and password recovery in the application code. |
| `corsano.antonio@icdonmilaniariano.edu.it's Project` | `gnshgapmwyjamhmlikeg` | `eu-west-1` | ACTIVE_HEALTHY | Historical Supabase project. Observed 4 email-provider users; all 4 have password credentials, confirmed email, and sign-in activity. |
| DOCENTE OS Production | `xpxhlmpsvfzgsjxgieks` | `eu-central-1` | INACTIVE | Production project currently paused. DOCENTE OS repository contains the proven Magic Link identity baseline used by the product architecture. |

This registry data is operational metadata only. API keys, secret keys, passwords, access tokens, SMTP credentials, and user secrets must never be stored in the registry.

## 4. Existing ecosystem precedent

DOCENTE OS provides the canonical implementation precedent for passwordless Magic Link:

- `signInWithOtp(...)` is used to request the email link;
- the request provides `emailRedirectTo` to `/auth/confirm`;
- `/auth/confirm` accepts a PKCE `code` and calls `exchangeCodeForSession(code)`;
- it also supports `token_hash + type` verification for compatible email links;
- the production identity baseline was previously documented as `LIVE_E2E_VERIFIED` for passwordless Magic Link.

TRAMA Access must reuse the provider transport pattern, not the DOCENTE OS authorization model. DOCENTE OS can bootstrap a personal workspace; TRAMA Access must not bootstrap an unknown identity.

## 5. Security boundary

### 5.1 Invariant preserved

A Supabase-authenticated user is not automatically a TRAMA Access user.

The authoritative TRAMA Access chain remains:

```text
email submitted
  -> normalized alias lookup
  -> pilot_allowed must be true
  -> Supabase Magic Link request, shouldCreateUser=false
  -> provider callback verifies link and yields verified provider identity
  -> exact issuer + subject lookup
  -> principal ACTIVE
  -> context ACTIVE
  -> application entitlement ACTIVE and time-valid
  -> local TRAMA Access session issued
```

If any step fails, no TRAMA Access session is created.

### 5.2 Unknown-email behavior

Unknown or disallowed aliases must not trigger a real provider send. The public response must remain neutral enough to avoid creating an allowlist oracle.

`shouldCreateUser` remains explicitly `false` even if Supabase defaults change in the future.

### 5.3 Callback behavior

A valid Supabase provider session is necessary but insufficient.

The callback must reduce provider state to the minimum verified external identity required by TRAMA Access:

- provider issuer;
- provider subject/user id;
- verified email when available.

TRAMA Access must not persist Supabase provider tokens, refresh tokens, session objects, or email-link artifacts in its own session store.

If provider verification succeeds but TRAMA authorization fails, the provider session is logged out on a best-effort basis and the request fails closed.

## 6. Proposed architecture

### 6.1 Provider adapter

Replace the numeric verification capability with an email-link callback capability while preserving availability probing and request cancellation.

Target conceptual interface:

```ts
interface AuthProviderAdapter {
  checkAvailability(input: { signal: AbortSignal }): Promise<boolean>;
  requestEmailMagicLink(input: {
    email: string;
    redirectTo: string;
    signal: AbortSignal;
  }): Promise<void>;
  verifyEmailMagicLink(input: MagicLinkCallbackInput): Promise<VerifiedExternalIdentity>;
  bestEffortLogout?(): Promise<void>;
}
```

`MagicLinkCallbackInput` supports the provider callback forms actually accepted by Supabase:

- PKCE `code` -> `exchangeCodeForSession(code)`;
- `token_hash + type` -> `verifyOtp({ token_hash, type })` when present.

No numeric token entry remains in the TRAMA Access user flow.

### 6.2 Server handlers

The current `request-otp` handler becomes a Magic Link request endpoint in semantics and naming. It retains:

- same-origin enforcement;
- email-shape validation;
- neutral public response;
- per-alias and global request rate limiting;
- provider availability budget;
- no provider call for unknown aliases.

A callback handler replaces the numeric `verify-otp` POST endpoint. It:

1. validates callback shape;
2. verifies the Supabase link under a finite provider budget;
3. derives the minimal verified identity;
4. resolves the exact pre-provisioned alias by issuer + subject;
5. validates principal/context/entitlement through the existing domain services;
6. creates the local Access session and cookie only on success;
7. performs best-effort provider logout on authorization failure.

The callback must not use email-only linking after provider verification.

### 6.3 Rate limiting

Preserve the existing four-scope limiter mechanics and atomic database enforcement.

The request scopes remain semantically valid. Verify scopes may be renamed later for clarity, but renaming is not required for the pilot if it would create unnecessary migration or validator churn. The security property is the bounded provider work, not the literal `OTP_*` label.

Any retained legacy names must be documented as implementation names, not as a claim that the user flow is numeric OTP.

### 6.4 Session auth method

New local Access sessions must use:

```text
EMAIL_MAGIC_LINK
```

The already-applied Task 11 migration must not be rewritten.

Add a new forward-only migration that:

- replaces the `access_sessions.auth_method` check so `EMAIL_MAGIC_LINK` is valid;
- updates the `access_session_create` RPC guard accordingly;
- does not rewrite historical migration files;
- does not touch user data beyond what is required by the constraint transition.

At design time the live `access_sessions` table contains 0 rows, so no data conversion is expected.

## 7. Canonical Supabase registry

Create one operational registry under a stable documentation path, proposed:

```text
docs/operations/TRAMA_SUPABASE_PROJECT_REGISTRY.md
```

The registry is the canonical memory for project-level Supabase facts that matter to TRAMA.

Required fields per project:

- project display name;
- project ref;
- organization id;
- region;
- observed lifecycle state;
- ecosystem owner/use;
- verified authentication pattern;
- evidence/source note;
- last verified date;
- explicit unknowns.

Rules:

- never store secret values;
- never store passwords, OAuth codes, SMTP credentials, service-role keys, or bearer tokens;
- avoid personal data unless the Supabase project display name itself contains it and is needed for exact project disambiguation;
- distinguish `verified`, `observed`, `historical`, and `unknown` facts;
- do not infer current Auth configuration from application code when the provider project is paused or its Dashboard configuration was not read directly;
- update the registry whenever a project is created, renamed, paused/restored, repurposed, or its auth pattern materially changes.

## 8. Files expected to change

Expected implementation scope inside PR #273:

- `docs/operations/TRAMA_SUPABASE_PROJECT_REGISTRY.md` — new canonical registry;
- `apps/access/src/ports/auth-provider.ts` — Magic Link provider contract;
- `apps/access/src/infrastructure/supabase/supabase-auth-provider.ts` — request/callback implementation;
- `apps/access/src/domain/auth-service.ts` — request/callback authorization orchestration;
- `apps/access/src/server/handlers/*` — request endpoint and callback handler;
- `apps/access/src/server/runtime.ts` — route/runtime wiring as needed;
- `apps/access/src/ports/session-store.ts` and Supabase session adapter if auth method is typed there;
- one new forward-only migration under `apps/access/supabase/migrations/`;
- Task 11 tests and validators;
- Task 11 evidence/receipt and plan/spec wording where it would otherwise falsely claim numeric OTP.

Existing live migration files remain immutable.

## 9. Test design

TDD is mandatory.

### RED cases

At minimum, add failing tests proving:

1. Magic Link request uses `shouldCreateUser === false`.
2. Allowed alias gets a provider request with an explicit callback URL.
3. Unknown alias produces the same public request result but no provider send.
4. Invalid/missing callback material creates no local session.
5. Valid provider callback for an unknown issuer + subject creates no local session.
6. Provider email matching a known alias is insufficient when issuer + subject do not match.
7. Suspended/disabled principal or context fails closed.
8. Missing/expired/revoked entitlement fails closed.
9. Valid callback for the pre-authorized pilot creates exactly one local session with auth method `EMAIL_MAGIC_LINK`.
10. Provider token/session objects are not stored as TRAMA Access session state.
11. Provider verification timeout/abort returns a neutral failure and performs no session creation.
12. Authorization failure after provider authentication triggers best-effort provider logout.
13. Migration contract accepts `EMAIL_MAGIC_LINK` and rejects unsupported auth methods.

### GREEN and regression

After implementation:

- targeted provider tests PASS;
- auth-service/security regression tests PASS;
- migration contract tests PASS;
- complete `apps/access` test suite PASS;
- TRAMA Access validator PASS;
- Governance PASS;
- any exact-head workflow required by PR #273 PASS.

No live pilot provisioning occurs before those gates are green on the exact head.

## 10. Live pilot sequence

After code qualification only:

1. verify project `toxhflbmipnwtgxgevfj` is still `ACTIVE_HEALTHY`;
2. confirm Auth store remains empty or contains only the intentionally provisioned pilot identity;
3. pre-provision exactly one pilot provider user and exact TRAMA alias binding;
4. keep `shouldCreateUser=false`;
5. request Magic Link through TRAMA Access;
6. open the received Supabase email link;
7. callback verifies provider identity;
8. exact issuer + subject and entitlement resolution succeeds;
9. local TRAMA Access session is created with `EMAIL_MAGIC_LINK`;
10. verify an unlisted address does not produce a provider user or local session;
11. capture sanitized receipt/evidence only; no secrets or raw tokens.

## 11. Explicit non-goals

Out of scope for this change:

- custom SMTP;
- Resend integration;
- numeric OTP template customization;
- public deployment/federation of TRAMA Access;
- adding more than one pilot user;
- student/learner accounts or data;
- migrating Arena or DOCENTE OS authentication into TRAMA Access;
- changing authorization authority away from the private TRAMA Access store;
- merging PR #273 automatically.

## 12. Decision record

The pilot authentication decision is:

**Use Supabase Magic Link for provider authentication, reusing the proven DOCENTE OS transport pattern, while retaining TRAMA Access pre-authorization and exact external-identity resolution as the authorization boundary.**

The Supabase operational-memory decision is:

**Maintain one canonical, secret-free project registry in the TRAMA repository for all Supabase projects materially used by the TRAMA ecosystem.**
