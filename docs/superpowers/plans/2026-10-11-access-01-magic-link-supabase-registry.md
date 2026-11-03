# ACCESS-01 Magic Link + Supabase Registry Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Preserve canonical Supabase project knowledge in TRAMA and replace numeric email OTP in TRAMA Access with a fail-closed Supabase Magic Link flow for the one-user pilot.

**Architecture:** Keep Supabase as the external identity verifier and TRAMA Access as the authorization authority. Requesting a link remains allowlist-gated and neutral for unknown aliases; the callback verifies the provider identity, then resolves the exact issuer + subject through the existing principal/context/entitlement chain before issuing a local TRAMA session. Persist operational Supabase metadata in one secret-free registry and apply the auth-method schema change only through a forward migration.

**Tech Stack:** Node.js 22, TypeScript 5.9, Next.js 16, `@supabase/supabase-js` 2.117.3, `tsx --test`, PostgreSQL/Supabase, existing TRAMA validators.

**Spec:** `docs/superpowers/specs/2026-10-11-access-01-magic-link-supabase-registry-design.md`

## Global Constraints

- Work only in PR #273 / branch `feat/access-01-task-11-live-provider`; do not merge `main`.
- Supabase organization is `EduManag` (`kpwzlloivhstoaiqjyjb`); TRAMA Access project ref is `toxhflbmipnwtgxgevfj` in `eu-central-1`.
- Pilot remains Free-tier, one user, no custom SMTP, no learner data, no public federation.
- `signInWithOtp` must always pass `shouldCreateUser: false` for TRAMA Access.
- Unknown/disallowed aliases must not cause a provider send and must retain a neutral public request result.
- Provider verification never grants authorization by itself; exact issuer + subject, active principal/context and active entitlement remain mandatory.
- Never persist provider access tokens, refresh tokens, session objects, Magic Link codes, token hashes, API secrets or credentials in TRAMA state or documentation.
- Existing applied migration `20261011000000_access_live.sql` is immutable; auth-method changes are forward-only.
- New local sessions use `EMAIL_MAGIC_LINK`.
- TDD RED -> GREEN is mandatory for behavioral changes; full Access tests, typecheck, build and TRAMA validators must pass on the exact final head before live smoke.

## Review Focus

1. **Callback replay / malformed callback:** missing, duplicated or invalid `code`/`token_hash` must create no local session and return a neutral denial.
2. **Provider identity mismatch:** a verified email matching the pilot alias must still fail when issuer + subject differ; no email-based relinking is permitted.
3. **Partial provider success:** if Supabase authenticates but TRAMA authorization fails, best-effort provider logout must run and no local cookie/session may survive.
4. **Redirect-origin abuse:** Magic Link callback URL must be derived from the configured TRAMA Access origin, never from arbitrary request headers or user input.
5. **Legacy naming drift:** retained `OTP_*` limiter scope names may remain internal, but public/API semantics and receipts must not falsely claim numeric OTP after the transition.

---

### Task 1: Canonical Supabase Project Registry

**Files:**
- Create: `docs/operations/TRAMA_SUPABASE_PROJECT_REGISTRY.md`
- Test/validator: `scripts/test-trama-access-phase2-validator.mjs` only if the existing documentation validator requires registry coverage.

**Interfaces:**
- Consumes: verified project metadata gathered from the Supabase connector and verified auth evidence in the ecosystem repositories.
- Produces: one canonical, secret-free operational registry used by future TRAMA work.

- [ ] **Step 1: Write the registry with explicit evidence status**

Record organization `EduManag` and the five known projects with project ref, region, observed lifecycle state, ecosystem role, auth pattern evidence, last verified date `2026-10-11`, and explicit unknowns. Mark Dashboard/runtime facts as `VERIFIED/OBSERVED`, historical code-only facts as `HISTORICAL/CODE-EVIDENCE`, and do not infer paused-project provider settings.

- [ ] **Step 2: Add the registry safety rules**

State that API keys, secret keys, passwords, OAuth codes, SMTP credentials, bearer tokens, provider sessions and user secrets are forbidden content; operational project identifiers are allowed.

- [ ] **Step 3: Verify no secret material is present**

Run repository search/validator checks for common secret forms (`sb_secret_`, `service_role`, bearer tokens, password assignments) against the new file. Expected: no credential value stored.

- [ ] **Step 4: Commit**

Commit message: `docs(ops): add canonical Supabase project registry`.

### Task 2: Provider Port and Supabase Magic Link Adapter

**Files:**
- Modify: `apps/access/src/ports/auth-provider.ts`
- Modify: `apps/access/src/infrastructure/supabase/supabase-auth-provider.ts`
- Modify: `apps/access/src/infrastructure/supabase/supabase-client.ts` only if callback client capabilities require it.
- Modify: `apps/access/src/testing/fake-auth-provider.ts`
- Test: `apps/access/tests/supabase-auth-provider.test.ts`
- Test: existing fake/provider regression tests as needed.

**Interfaces:**
- Consumes: `VerifiedExternalIdentity` from `apps/access/src/domain/types.ts`.
- Produces:
  - `requestEmailMagicLink(input: { email: string; redirectTo: string; signal: AbortSignal }): Promise<void>`
  - `verifyEmailMagicLink(input: MagicLinkCallbackInput & { signal: AbortSignal }): Promise<VerifiedExternalIdentity>`
  - `MagicLinkCallbackInput = { code: string } | { tokenHash: string; type: EmailOtpType }`
  - existing `checkAvailability` and `bestEffortLogout` behavior unchanged.

- [ ] **Step 1: Write RED provider tests**

Add tests asserting: request calls `signInWithOtp` with exact email, `emailRedirectTo`, and `shouldCreateUser === false`; PKCE callback calls `exchangeCodeForSession(code)`; token-hash callback calls `verifyOtp({ token_hash, type })`; verified result is reduced to `{ issuer, subject, verifiedEmail }`; provider session/token objects are not returned; abort/provider errors fail with normalized provider errors.

- [ ] **Step 2: Run targeted provider tests and capture RED**

Run: `cd apps/access && npx tsx --test tests/supabase-auth-provider.test.ts`

Expected: FAIL because the Magic Link port/adapter methods do not yet exist.

- [ ] **Step 3: Replace numeric-OTP provider contract with Magic Link contract**

Implement the interfaces above. The request adapter must supply `options: { shouldCreateUser: false, emailRedirectTo: redirectTo }`. Verification must support exactly one callback form per call, extract the verified user id/email from Supabase, and discard provider session/token payloads.

- [ ] **Step 4: Update fake provider for deterministic callback identities**

Provide fake Magic Link request capture and deterministic callback verification without introducing a real token or secret model.

- [ ] **Step 5: Run provider/fake regression tests GREEN**

Run targeted provider tests plus tests importing `FakeAuthProvider`. Expected: PASS.

- [ ] **Step 6: Commit**

Commit message: `refactor(access): add fail-closed Magic Link provider adapter`.

### Task 3: Fail-Closed Magic Link Domain Flow and HTTP Handlers

**Files:**
- Modify: `apps/access/src/domain/auth-service.ts`
- Modify: `apps/access/src/server/handlers/request-otp.ts` (rename to `request-magic-link.ts` if route imports can be updated atomically)
- Modify: `apps/access/src/server/handlers/verify-otp.ts` (replace with `magic-link-callback.ts`)
- Modify: `apps/access/src/server/runtime.ts`
- Modify: route files/imports that dispatch these handlers.
- Test: `apps/access/tests/auth-service.test.ts`
- Test: `apps/access/tests/auth-service-p1-regressions.test.ts`
- Test: `apps/access/tests/provider-work-global-rate-limit.test.ts`
- Test: `apps/access/tests/handlers.test.ts`
- Test: `apps/access/tests/live-runtime.test.ts`

**Interfaces:**
- Consumes: Task 2 Magic Link provider interface; existing `IdentityRepository`, `SessionStore`, `RateLimiter`, `resolvePrincipalForVerifiedIdentity`, `issueAccessSession`.
- Produces:
  - `requestPilotMagicLink({ repo, provider, email, redirectTo, rateLimiter?, now?, timing? })`
  - `verifyPilotMagicLink({ repo, provider, store, callback, now, rateLimiter?, verifyProviderBudgetMs? })`
  - callback HTTP handler that sets the existing local Access session cookie only after full TRAMA authorization.

- [ ] **Step 1: Write RED domain tests for request semantics**

Assert allowed alias triggers one provider request with callback URL `${configuredOrigin}/auth/confirm`; unknown/disallowed alias returns the same neutral public status and triggers zero provider sends; request timing/abort boundaries remain finite; redirect origin is configuration-derived, not request-derived.

- [ ] **Step 2: Write RED callback authorization tests**

Assert missing/invalid callback creates zero sessions; unknown issuer + subject fails; matching email with wrong issuer/subject still fails; inactive principal/context or invalid entitlement fails; provider-authenticated/TRAMA-denied path invokes `bestEffortLogout`; valid pre-authorized identity creates exactly one local session.

- [ ] **Step 3: Write RED handler tests**

Replace numeric `otp` POST expectations with callback tests for PKCE `code` and token-hash forms. Assert no cookie on any denied/error path and one secure Access cookie only on `AUTHENTICATED`.

- [ ] **Step 4: Run targeted RED suite**

Run: `cd apps/access && npx tsx --test tests/auth-service.test.ts tests/auth-service-p1-regressions.test.ts tests/provider-work-global-rate-limit.test.ts tests/handlers.test.ts tests/live-runtime.test.ts`

Expected: FAIL only on the intentional Magic Link contract changes.

- [ ] **Step 5: Implement request flow with existing neutral timing/oracle protections**

Rename semantics from OTP request to Magic Link request while preserving the shared provider deadline, per-alias/global request limiter and no-send behavior for unknown aliases. Keep legacy limiter scope literals only where migration churn would add no security value.

- [ ] **Step 6: Implement callback verification and authorization**

Verify the provider callback under a finite budget, then resolve authorization exclusively by verified issuer + subject. Never relink by email after provider verification. On any post-provider authorization failure, call `bestEffortLogout` and create no local session.

- [ ] **Step 7: Wire configured callback origin**

Derive redirect URL solely from `runtime.config.origin`; reject/ignore arbitrary forwarded host/origin input for auth redirect construction.

- [ ] **Step 8: Run targeted suite GREEN**

Expected: all targeted tests PASS.

- [ ] **Step 9: Commit**

Commit message: `feat(access): switch pilot authentication to Magic Link`.

### Task 4: Local Session Auth Method and Forward Migration

**Files:**
- Modify: `apps/access/src/domain/types.ts`
- Modify: `apps/access/src/domain/session-service.ts`
- Modify: `apps/access/src/infrastructure/supabase/supabase-session-store.ts` if typed literals are enforced there.
- Create: `apps/access/supabase/migrations/20261011XXXXXX_access_magic_link_auth_method.sql`
- Test: `apps/access/tests/supabase-migration-contract.test.ts`
- Test: `apps/access/tests/supabase-persistence.test.ts`
- Test: session/domain tests that assert auth method.

**Interfaces:**
- Consumes: existing `AccessSessionRecord` and `public.access_session_create(...)` RPC.
- Produces: `AccessSessionRecord.authMethod: 'EMAIL_MAGIC_LINK'`; live RPC accepts only the supported Magic Link method after forward migration.

- [ ] **Step 1: Write RED session/migration tests**

Assert newly issued record has `authMethod === 'EMAIL_MAGIC_LINK'`; migration changes the live check/RPC guard without editing `20261011000000_access_live.sql`; unsupported auth methods remain rejected.

- [ ] **Step 2: Run RED migration/session tests**

Run: `cd apps/access && npx tsx --test tests/supabase-migration-contract.test.ts tests/supabase-persistence.test.ts`

Expected: FAIL on current `EMAIL_OTP` contract.

- [ ] **Step 3: Change local session type/service**

Set new sessions to `EMAIL_MAGIC_LINK` only.

- [ ] **Step 4: Add forward-only SQL migration**

Drop/recreate the `access_sessions.auth_method` check and replace `public.access_session_create` guard so the live contract accepts `EMAIL_MAGIC_LINK`. Do not modify the earlier migration file and do not migrate provider tokens/session data.

- [ ] **Step 5: Run migration/session tests GREEN**

Expected: PASS.

- [ ] **Step 6: Commit**

Commit message: `feat(access): record Magic Link session method`.

### Task 5: Documentation, Validators, and Exact-Head Qualification

**Files:**
- Modify: `docs/superpowers/plans/2026-10-11-access-01-task-11-live-provider.md`
- Modify: `docs/superpowers/specs/2026-10-11-access-01-phase-2-trama-access-runtime-design.md` only where it would otherwise assert numeric OTP as current behavior; preserve historical context explicitly.
- Modify: `docs/evidence/access-01/access-01-task-11-live-receipt.template.md`
- Modify: `scripts/validate-trama-access-phase2.mjs`
- Modify: `scripts/test-trama-access-phase2-validator.mjs`
- Other tests only where literal `EMAIL_OTP`/numeric-OTP assertions represent current rather than historical behavior.

**Interfaces:**
- Consumes: Tasks 1-4 final behavior.
- Produces: documentation/validator contract that accurately describes Magic Link while retaining auditable history of the original OTP design.

- [ ] **Step 1: Add validator RED assertions for Magic Link**

Require current Task 11 evidence to state Magic Link, `shouldCreateUser=false`, fail-closed issuer+subject binding, one pilot, no custom SMTP, and forward migration. Ensure historical docs may still contain `EMAIL_OTP` only when clearly historical/immutable.

- [ ] **Step 2: Run validator RED**

Run: `node scripts/test-trama-access-phase2-validator.mjs`

Expected: FAIL until docs/receipt are updated.

- [ ] **Step 3: Update Task 11 docs and evidence wording**

Remove claims that the active pilot requires a numeric code. Record the approved 2026-10-11 decision and point to the Supabase project registry.

- [ ] **Step 4: Run full local qualification**

Run:
- `cd apps/access && npm test`
- `cd apps/access && npm run typecheck`
- `cd apps/access && npm run build`
- `node scripts/test-trama-access-phase2-validator.mjs`
- `node scripts/validate-trama-access-phase2.mjs`

Expected: all PASS.

- [ ] **Step 5: Commit**

Commit message: `docs(access): qualify Magic Link pilot contract`.

### Task 6: Live Preflight, Additive Migration, One-User Smoke

**Files:**
- No new product code unless a fresh blocker is found; any blocker returns to RED -> GREEN before live mutation.
- Update: `docs/evidence/access-01/access-01-task-11-live-receipt.template.md` or materialized receipt path used by the existing Task 11 process.
- Update: `docs/operations/TRAMA_SUPABASE_PROJECT_REGISTRY.md` observed state after successful smoke if material facts changed.

**Interfaces:**
- Consumes: exact-head qualified code, TRAMA Access project `toxhflbmipnwtgxgevfj`, existing guarded one-user provisioning path.
- Produces: one controlled live Magic Link pilot result and sanitized receipt; no merge/deploy.

- [ ] **Step 1: Re-read exact PR head and CI status**

Confirm PR #273 remains open/draft/unmerged and all required exact-head checks are PASS before touching live provider state.

- [ ] **Step 2: Read-only live preflight**

Confirm project is `ACTIVE_HEALTHY`, project ref/region match the registry, `auth.users` and private pilot tables are in the expected pre-provision state, and no custom SMTP is required for the authorized Supabase organization email smoke.

- [ ] **Step 3: Apply only the new forward migration**

Use the normal Supabase migration path. Verify migration history and schema contract after application; do not rewrite prior migrations.

- [ ] **Step 4: Provision exactly one pre-authorized pilot identity**

Use the existing guarded Task 11 provisioning flow. Do not create a second pilot, do not enable open signup, and do not expose credentials in chat/logs.

- [ ] **Step 5: Execute controlled Magic Link smoke**

Request the link for the pre-authorized pilot, follow the provider callback, verify exactly one TRAMA local session is created with `EMAIL_MAGIC_LINK`, confirm entitlement-gated launch still works, then log out/revoke as required by the receipt procedure.

- [ ] **Step 6: Negative live check**

Use a non-provisioned alias only if the existing Task 11 smoke procedure permits it without sending mail; verify neutral request behavior and zero provider-user creation. Do not create a second Auth user merely to test denial.

- [ ] **Step 7: Materialize sanitized evidence and re-run security advisors**

Record exact head, project ref, migration identifier, counts/statuses and PASS/FAIL only; omit email addresses, secrets, provider tokens and link artifacts. Run Supabase security advisor after DDL change.

- [ ] **Step 8: Final exact-head qualification**

Re-run full Access/Governance/validator checks on the unchanged exact head. If any tracked file changes during evidence materialization, treat that as a new head and recertify.

- [ ] **Step 9: Stop at human decision gate**

Leave PR #273 open/draft/unmerged. Report `PASS`, `REWORK`, or `BLOCKED` with exact evidence; do not auto-merge or deploy.
