# ACCESS-01 Task 11 Live Provider Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Qualify one isolated live TRAMA Access pilot against a dedicated Supabase Auth project while preserving every Phase 2 security/authority invariant and without deploying or federating products.

**Architecture:** Keep the existing provider-neutral domain untouched. Add a Supabase infrastructure layer behind the existing `AuthProviderAdapter`, `IdentityRepository`, `SessionStore`, and `RateLimiter` ports; use a dedicated Postgres schema/store for Access records and an atomic persistent rate-limit operation. Runtime wiring remains fail-closed and only selects live adapters when `providerKind=supabase` and `storeKind=supabase` with complete server-only configuration.

**Tech Stack:** Next.js 16, TypeScript, Node test runner, Playwright, `@supabase/supabase-js`, Supabase Auth/Postgres, GitHub Actions.

**Spec:** `docs/evidence/access-01/access-01-task-11-provider-authorization-decision.md`

## Global Constraints

- Task execution MUST NOT begin until the decision spec state is explicitly authorized by the human owner.
- Provider: one dedicated Supabase Auth project for TRAMA Access only.
- Region: `eu-central-1` / Frankfurt; unavailable/unverifiable region means STOP.
- Plan: Free only; any paid plan/add-on requirement means STOP.
- Email delivery: built-in SMTP only for this pilot; if the pilot address is ineligible, STOP before custom SMTP.
- OTP email uses `{{ .Token }}` and request flow uses `shouldCreateUser:false`.
- Exactly one provider user is pre-created; no self-signup and no batch provisioning.
- External identity authority remains exact `issuer + subject`; email is never authority.
- Server Auth client uses `autoRefreshToken:false`, `persistSession:false`, `detectSessionInUrl:false`.
- Provider secret is server-only and MUST NOT appear in repository, browser, URL, log, test snapshot, receipt or artifact.
- AccessSession TTL remains exactly `28800` seconds, absolute and non-sliding.
- Live rate limiter is shared/persistent and preserves: `OTP_REQUEST=5/15m`, `OTP_VERIFY=10/15m`, `OTP_REQUEST_GLOBAL=20/15m`, `OTP_VERIFY_GLOBAL=20/15m`.
- `IdentityRepository.findAliasByEmail(..., { signal })` must propagate cancellation to the underlying live query and release it on abort.
- No product federation, learner identity/data, custom SMTP, public/production deploy, or product authorization migration belongs to Task 11.
- Native/TDD: every implementation task begins with witnessed RED, then minimal GREEN, then focused suite, then commit.

## Review Focus

1. Rotating aliases across independent runtime instances must still hit one atomic global provider-work budget before any remote provider operation.
2. Aborting `findAliasByEmail` must cancel the underlying Supabase/PostgREST query, not merely stop awaiting its promise.
3. `signInWithOtp` must never create a provider user when the email is absent, even if provider defaults change.
4. A valid OTP that yields an unexpected `issuer + subject` must fail closed without email-based linking or session creation.
5. Provider/session/token objects returned by `verifyOtp` must be reduced to the minimum verified identity and never persisted/logged as TRAMA Access session state.

---

### Task 1: Add Supabase server client and live Auth provider adapter

**Files:**
- Modify: `apps/access/package.json`
- Modify: `apps/access/package-lock.json`
- Create: `apps/access/src/infrastructure/supabase/supabase-client.ts`
- Create: `apps/access/src/infrastructure/supabase/supabase-auth-provider.ts`
- Test: `apps/access/tests/supabase-auth-provider.test.ts`

**Interfaces:**
- Consumes: existing `AuthProviderAdapter` from `apps/access/src/ports/auth-provider.ts`.
- Produces:
  - `createSupabaseServerClient(input: { url: string; secretKey: string }): SupabaseClient`
  - `class SupabaseAuthProvider implements AuthProviderAdapter`
  - `checkAvailability({ signal })`, `requestEmailOtp({ email, signal })`, `verifyEmailOtp({ email, otp, signal })`, `bestEffortLogout()`.

- [ ] **Step 1: Write failing adapter tests**

Add tests proving:
- `requestEmailOtp` calls provider sign-in with `options.shouldCreateUser === false`;
- `verifyEmailOtp` uses email OTP verification and returns only `{ issuer, subject, verifiedEmail }`;
- provider session/access/refresh tokens are not present in the returned domain object;
- synchronous/async provider errors map to the existing provider error contract;
- aborted signals terminate provider HTTP work and do not complete later.

- [ ] **Step 2: Run focused tests and witness RED**

Run: `cd apps/access && npm test -- --test-name-pattern="SupabaseAuthProvider"`

Expected: FAIL because the Supabase infrastructure adapter does not exist.

- [ ] **Step 3: Add the Supabase dependency and minimal server client**

Use `@supabase/supabase-js`. Configure the server client with exactly:

```ts
auth: {
  autoRefreshToken: false,
  persistSession: false,
  detectSessionInUrl: false,
}
```

No publishable/browser client is introduced in Task 11.

- [ ] **Step 4: Implement `SupabaseAuthProvider`**

`requestEmailOtp` must invoke email OTP with `shouldCreateUser:false`; `verifyEmailOtp` must reduce provider output immediately to the existing `VerifiedExternalIdentity`. Keep provider tokens/session objects local to the adapter method and never return/store/log them.

- [ ] **Step 5: Run focused tests and verify GREEN**

Run: `cd apps/access && npm test -- --test-name-pattern="SupabaseAuthProvider"`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add apps/access/package.json apps/access/package-lock.json apps/access/src/infrastructure/supabase apps/access/tests/supabase-auth-provider.test.ts
git commit -m "feat(access): add supabase auth provider adapter"
```

### Task 2: Add persistent Access schema, repositories and atomic shared rate limiter

**Files:**
- Create: `apps/access/supabase/migrations/20261011_access_live.sql`
- Create: `apps/access/src/infrastructure/supabase/supabase-identity-repository.ts`
- Create: `apps/access/src/infrastructure/supabase/supabase-session-store.ts`
- Create: `apps/access/src/infrastructure/supabase/supabase-rate-limiter.ts`
- Test: `apps/access/tests/supabase-persistence.test.ts`
- Modify: `scripts/validate-trama-access-phase2.mjs`
- Modify: `scripts/test-trama-access-phase2-validator.mjs`

**Interfaces:**
- Consumes: existing `IdentityRepository`, `SessionStore`, `RateLimiter` ports and Phase 2 domain types.
- Produces:
  - `SupabaseIdentityRepository implements IdentityRepository`
  - `SupabaseSessionStore implements SessionStore`
  - `SupabaseRateLimiter implements RateLimiter`
  - one atomic database operation for rate-limit consumption keyed by `(scope, key_digest, window)`.

- [ ] **Step 1: Write failing persistence tests**

Tests must prove:
- alias lookup returns the same domain shape as the in-memory repository;
- session secret is persisted only as the existing digest, never plaintext;
- the 21st distinct-email request and verify attempts are denied globally before provider work;
- two separate `SupabaseRateLimiter` instances share the same counters;
- concurrent consume calls cannot exceed the configured limit;
- no product/learner/material tables or columns are introduced.

- [ ] **Step 2: Run focused tests and witness RED**

Run: `cd apps/access && npm test -- --test-name-pattern="Supabase persistence|shared rate limiter"`

Expected: FAIL because persistent implementations/migration do not exist.

- [ ] **Step 3: Create the migration**

Create only the Access identity/context/entitlement/session/rate-limit structures required by the existing ports. Implement rate-limit consumption atomically in SQL/RPC so independent application instances cannot race past the limit. Do not create public policies or product-data structures.

- [ ] **Step 4: Implement repositories and rate limiter**

Map database rows to existing domain types; do not leak database UUID/table semantics into domain authority. `SupabaseSessionStore` persists the existing SHA-256 session digest only.

- [ ] **Step 5: Extend the permanent validator**

Keep all existing product/learner/material prohibitions and add an adversarial fixture proving the live migration remains inside the Access boundary.

- [ ] **Step 6: Run focused tests and validator**

Run:

```bash
cd apps/access && npm test -- --test-name-pattern="Supabase persistence|shared rate limiter"
cd ../.. && node scripts/test-trama-access-phase2-validator.mjs
node scripts/validate-trama-access-phase2.mjs
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add apps/access/supabase apps/access/src/infrastructure/supabase apps/access/tests/supabase-persistence.test.ts scripts/validate-trama-access-phase2.mjs scripts/test-trama-access-phase2-validator.mjs
git commit -m "feat(access): add persistent live access store"
```

### Task 3: Prove live alias-query cancellation reaches the underlying datastore

**Files:**
- Modify: `apps/access/src/infrastructure/supabase/supabase-identity-repository.ts`
- Test: `apps/access/tests/supabase-abort.test.ts`

**Interfaces:**
- Consumes: `IdentityRepository.findAliasByEmail(normalizedEmail, { signal?: AbortSignal })`.
- Produces: the same method with the supplied signal attached to the underlying Supabase/PostgREST query.

- [ ] **Step 1: Write the failing cancellation regression**

Instrument the query transport and assert that aborting the caller's signal aborts the actual request and prevents late query completion.

- [ ] **Step 2: Run it and witness RED**

Run: `cd apps/access && npm test -- --test-name-pattern="alias lookup abort"`

Expected: FAIL if the repository merely races/ignores the signal.

- [ ] **Step 3: Propagate the signal to the database request**

Attach the supplied signal to the Supabase/PostgREST query (`abortSignal(signal)` or the exact supported equivalent in the pinned client version). No detached query may remain after the public deadline.

- [ ] **Step 4: Run the regression and provider timing regressions**

Run:

```bash
cd apps/access && npm test -- --test-name-pattern="alias lookup abort|request timing|verification timing"
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/access/src/infrastructure/supabase/supabase-identity-repository.ts apps/access/tests/supabase-abort.test.ts
git commit -m "fix(access): enforce live alias lookup cancellation"
```

### Task 4: Wire fail-closed live runtime configuration

**Files:**
- Modify: `apps/access/src/config/access-config.ts`
- Modify: `apps/access/src/server/runtime.ts`
- Test: `apps/access/tests/config.test.ts`
- Create: `apps/access/tests/live-runtime.test.ts`

**Interfaces:**
- Consumes: `ACCESS_PROVIDER_KIND=supabase`, `ACCESS_STORE_KIND=supabase`, existing `AccessRuntime`.
- Produces: runtime construction with live Supabase adapters only when all required server-side variables are present and valid.

- [ ] **Step 1: Write failing runtime/config tests**

Prove:
- missing URL or secret fails closed;
- production live origin must remain HTTPS;
- fake/memory remains rejected in production;
- secret values are never included in thrown errors or serialized config;
- `supabase + supabase` creates the live implementations rather than throwing `SUPABASE_ADAPTER_NOT_AUTHORIZED`.

- [ ] **Step 2: Run tests and witness RED**

Run: `cd apps/access && npm test -- --test-name-pattern="live runtime|config"`

Expected: FAIL on the current `SUPABASE_ADAPTER_NOT_AUTHORIZED` guard.

- [ ] **Step 3: Implement minimal fail-closed wiring**

Remove only the obsolete Phase 2 hard stop after the live adapters exist. Required live configuration must be read server-side; do not expose secret-bearing config to client components or logs.

- [ ] **Step 4: Run config/runtime/security tests**

Run:

```bash
cd apps/access && npm test -- --test-name-pattern="live runtime|config|security"
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/access/src/config/access-config.ts apps/access/src/server/runtime.ts apps/access/tests/config.test.ts apps/access/tests/live-runtime.test.ts
git commit -m "feat(access): wire fail closed supabase runtime"
```

### Task 5: Add guarded one-user provisioning and sanitized receipt generation

**Files:**
- Create: `apps/access/scripts/provision-task11-pilot.ts`
- Create: `apps/access/tests/provision-task11-pilot.test.ts`
- Create: `docs/evidence/access-01/access-01-task-11-live-receipt.template.md`

**Interfaces:**
- Consumes: pilot email from runtime input/environment, server-only provider admin client, live Access repositories.
- Produces: exactly one pre-created provider user plus governed Principal/LoginAlias/binding/context/entitlement records; sanitized receipt metadata only.

- [ ] **Step 1: Write failing provisioning tests**

Prove:
- no email argument means no mutation;
- existing governed pilot is idempotently detected rather than duplicated;
- more than one requested pilot user is rejected;
- provider user is created before the LoginAlias external subject binding;
- subject mismatch fails before any session/login qualification;
- receipt output excludes email, provider subject, OTP, secret and tokens.

- [ ] **Step 2: Run tests and witness RED**

Run: `cd apps/access && npm test -- --test-name-pattern="Task 11 provisioning"`

Expected: FAIL because the provisioning script does not exist.

- [ ] **Step 3: Implement the guarded provisioning command**

Keep all personal/sensitive inputs outside repository arguments and committed files. The command must have explicit pre-mutation checks for one-user scope, region/plan receipt, and provider-user existence.

- [ ] **Step 4: Run focused tests**

Run: `cd apps/access && npm test -- --test-name-pattern="Task 11 provisioning"`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/access/scripts/provision-task11-pilot.ts apps/access/tests/provision-task11-pilot.test.ts docs/evidence/access-01/access-01-task-11-live-receipt.template.md
git commit -m "feat(access): add guarded task11 pilot provisioning"
```

### Task 6: Execute authorized provider provisioning and live qualification

**Files:**
- Materialize from template after execution: `docs/evidence/access-01/access-01-task-11-live-receipt.md`
- Modify only if needed for evidence hooks: `.github/workflows/trama-access.yml`

**Interfaces:**
- Consumes: the explicitly approved authorization decision, eligible team pilot email, provider Free project, live environment secrets.
- Produces: one sanitized live qualification receipt and no public deployment.

- [ ] **Step 1: Re-check the human gate before any external mutation**

Required state: explicit authorization of `docs/evidence/access-01/access-01-task-11-provider-authorization-decision.md`. If absent, STOP with no provider mutations.

- [ ] **Step 2: Check Free quota, Frankfurt availability and built-in SMTP eligibility**

If any condition is not satisfied, STOP `AWAITING_HUMAN_DECISION`; do not choose another region, paid plan or custom SMTP.

- [ ] **Step 3: Create/configure the dedicated provider project and live Access store**

Apply only the approved project, OTP-only template, one-user, secret and migration scope. Never print the secret.

- [ ] **Step 4: Run the provisioning command for exactly one pilot**

Verify provider user pre-exists before requesting OTP and that the exact external subject is bound server-side.

- [ ] **Step 5: Run one controlled live OTP smoke**

Execute request → human reads OTP from the authorized mailbox → verify → exact identity resolution → AccessSession → launcher → logout. The OTP must be supplied ephemerally and never echoed, logged or written to evidence.

- [ ] **Step 6: Run negative live checks**

At minimum: unknown alias, invalid OTP, subject mismatch fixture, provider outage/failure mapping, alias revocation, entitlement revocation, session expiry/logout behavior, cross-instance rate-limit proof, aborted alias query proof.

- [ ] **Step 7: Run full exact-head qualification**

Run:

```bash
cd apps/access && npm test
npm run typecheck
npm run build
npm run test:e2e
cd ../.. && node scripts/test-trama-access-phase2-validator.mjs
node scripts/validate-trama-access-phase2.mjs
```

Then require the repository Governance/TRAMA Access workflows on the exact pushed head.

Expected: all PASS; zero open blocker.

- [ ] **Step 8: Write the sanitized receipt**

Record only approved non-secret metadata, exact head, region/Free/built-in-email confirmations and test/check outcomes. No email, OTP, provider subject, provider tokens, secret or session cookie.

- [ ] **Step 9: Request fresh independent Codex review**

Review exact head with focus on provider adapter, auto-provision prevention, token isolation, persistent rate limiting, real abort propagation, secret hygiene, subject binding and migration boundary.

- [ ] **Step 10: Stop at qualification boundary**

Even after a clean review, do **not** deploy publicly and do **not** implement federation. Final state is `TASK_11_QUALIFIED_AWAITING_DEPLOY_DECISION`.

## Self-Review Result

- Spec coverage: all authorization scope, stop conditions, provider/live-store hardening, live smoke, evidence and review gates are mapped to Tasks 1–6.
- Type consistency: all implementations remain behind the existing Phase 2 ports; no new domain authority interface is introduced.
- Review focus coverage: cross-instance limiter (Task 2/6), real abort (Task 3/6), no auto-create (Task 1/6), subject mismatch (Task 5/6), token minimization (Task 1/6).
- Proportion: provider provisioning and live mutation remain a final separate task so code can be reviewed before external state changes.
