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
- Every one of the four live rate-limit scopes MUST be proven across separate limiter instances under concurrent consumption before qualification.
- `IdentityRepository.findAliasByEmail(..., { signal })` must propagate cancellation to the underlying live query and release it on abort.
- No product federation, learner identity/data, custom SMTP, public/production deploy, or product authorization migration belongs to Task 11.
- Native/TDD: every implementation task begins with witnessed RED, then minimal GREEN, then focused suite, then commit.
- After Tasks 1–5, the exact pushed head MUST pass repository qualification and an independent Codex review with zero open P1/P2 blockers before Task 6 may perform any provider mutation. Any code change after that review invalidates the gate and requires fresh exact-head qualification/review before provider mutation.

## Review Focus

1. All four limiter scopes must preserve their exact limits atomically across separate runtime instances under concurrent consumption: per-alias request/verify and both global provider-work budgets.
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

- [ ] **Step 1: Write failing persistence and four-scope cross-instance limiter tests**

Tests must prove:
- alias lookup returns the same domain shape as the in-memory repository;
- session secret is persisted only as the existing digest, never plaintext;
- `OTP_REQUEST` on the same alias digest permits at most 5 total consumes / 15m across at least two separate `SupabaseRateLimiter` instances under concurrent consumption; the 6th total consume is denied;
- `OTP_VERIFY` on the same alias digest permits at most 10 total consumes / 15m across at least two separate limiter instances under concurrent consumption; the 11th total consume is denied;
- `OTP_REQUEST_GLOBAL` permits at most 20 total consumes / 15m across at least two separate limiter instances under concurrent consumption; the 21st total consume is denied before provider work;
- `OTP_VERIFY_GLOBAL` permits at most 20 total consumes / 15m across at least two separate limiter instances under concurrent consumption; the 21st total consume is denied before provider work;
- each of those four tests uses the scope's real keying rule (`normalized-email digest` for alias scopes, fixed non-personal technical digest for global scopes), not one generic surrogate scope;
- concurrent consumes racing at each boundary cannot exceed the configured scope limit;
- no product/learner/material tables or columns are introduced.

- [ ] **Step 2: Run focused tests and witness RED**

Run: `cd apps/access && npm test -- --test-name-pattern="Supabase persistence|shared rate limiter|OTP_REQUEST|OTP_VERIFY"`

Expected: FAIL because persistent implementations/migration and explicit four-scope cross-instance guarantees do not exist.

- [ ] **Step 3: Create the migration**

Create only the Access identity/context/entitlement/session/rate-limit structures required by the existing ports. Implement rate-limit consumption atomically in SQL/RPC so independent application instances cannot race past the limit. Do not create public policies or product-data structures.

- [ ] **Step 4: Implement repositories and rate limiter**

Map database rows to existing domain types; do not leak database UUID/table semantics into domain authority. `SupabaseSessionStore` persists the existing SHA-256 session digest only. The persistent limiter must enforce the exact configured limit separately for each `RateLimitScope` and share counters across runtime instances.

- [ ] **Step 5: Extend the permanent validator**

Keep all existing product/learner/material prohibitions and add adversarial fixtures proving the live migration remains inside the Access boundary and that all four canonical rate-limit scope names remain represented by the live implementation/tests.

- [ ] **Step 6: Run focused tests and validator**

Run:

```bash
cd apps/access && npm test -- --test-name-pattern="Supabase persistence|shared rate limiter|OTP_REQUEST|OTP_VERIFY"
cd ../.. && node scripts/test-trama-access-phase2-validator.mjs
node scripts/validate-trama-access-phase2.mjs
```

Expected: PASS, including the separate cross-instance/concurrent boundary test for each of the four scopes.

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

- [ ] **Step 5: Run full pre-mutation qualification on the exact pushed head**

Run:

```bash
cd apps/access && npm test
npm run typecheck
npm run build
npm run test:e2e
cd ../.. && node scripts/test-trama-access-phase2-validator.mjs
node scripts/validate-trama-access-phase2.mjs
```

Then require the repository Governance/TRAMA Access workflows on that exact pushed head.

Expected: all PASS before any provider resource is created or modified.

- [ ] **Step 6: Request independent Codex review on that exact head**

Review Tasks 1–5 with focus on provider adapter, `shouldCreateUser:false`, exact subject authority, token/secret isolation, persistent four-scope rate limiting, real abort propagation, migration boundary and provisioning idempotency/privacy.

Required gate: review completed on the same exact head, **zero open P1/P2 blockers**. If the review produces a code/documentation change, repeat Step 5 and Step 6 on the new exact head. **Do not proceed to Task 6 until this gate is clean.**

- [ ] **Step 7: Commit only if review remediation changed tracked files**

Any remediation commit invalidates the prior exact-head gate; re-run Steps 5–6 after the commit. If no remediation is needed, do not create a ceremonial commit.

### Task 6: Execute authorized provider provisioning and live qualification

**Files:**
- Materialize from template after execution: `docs/evidence/access-01/access-01-task-11-live-receipt.md`
- Modify only if needed for evidence hooks: `.github/workflows/trama-access.yml`

**Interfaces:**
- Consumes: the explicitly approved authorization decision, eligible team pilot email, provider Free project, live environment secrets, and the clean pre-mutation exact-head review gate from Task 5.
- Produces: one sanitized live qualification receipt and no public deployment.

- [ ] **Step 1: Re-check the human gate and pre-mutation review gate before any external mutation**

Required state:
- explicit authorization of `docs/evidence/access-01/access-01-task-11-provider-authorization-decision.md`;
- Tasks 1–5 exact-head qualification PASS;
- independent Codex review completed on the same exact head with zero open P1/P2 blockers.

If any condition is absent, stale, or refers to another head, STOP with no provider mutations.

- [ ] **Step 2: Check Free quota, Frankfurt availability and built-in SMTP eligibility**

This step is read-only preflight. If any condition is not satisfied, STOP `AWAITING_HUMAN_DECISION`; do not choose another region, paid plan or custom SMTP.

- [ ] **Step 3: Reconfirm exact head immediately before the first provider mutation**

Assert that no tracked code/documentation change has occurred since the clean Task 5 review. If the head moved, STOP and repeat Task 5 Steps 5–6 before mutation.

- [ ] **Step 4: Create/configure the dedicated provider project and live Access store**

This is the **first external provider mutation**. Apply only the approved project, OTP-only template, one-user, secret and migration scope. Never print the secret.

- [ ] **Step 5: Run the provisioning command for exactly one pilot**

Verify provider user pre-exists before requesting OTP and that the exact external subject is bound server-side.

- [ ] **Step 6: Run one controlled live OTP smoke**

Execute request → human reads OTP from the authorized mailbox → verify → exact identity resolution → AccessSession → launcher → logout. The OTP must be supplied ephemerally and never echoed, logged or written to evidence.

- [ ] **Step 7: Run negative live checks**

At minimum: unknown alias, invalid OTP, subject mismatch fixture, provider outage/failure mapping, alias revocation, entitlement revocation, session expiry/logout behavior, aborted alias query proof, and live cross-instance/concurrent proof for each of `OTP_REQUEST`, `OTP_VERIFY`, `OTP_REQUEST_GLOBAL`, `OTP_VERIFY_GLOBAL` at its exact configured limit.

- [ ] **Step 8: Run full post-live exact-head qualification**

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

- [ ] **Step 9: Write the sanitized receipt**

Record only approved non-secret metadata, exact head, region/Free/built-in-email confirmations and test/check outcomes. Include the four per-scope live rate-limit results without recording alias/email/key digests. No email, OTP, provider subject, provider tokens, secret or session cookie.

- [ ] **Step 10: Request fresh independent post-live Codex review**

Review exact head with focus on provider adapter, auto-provision prevention, token isolation, persistent four-scope rate limiting, real abort propagation, secret hygiene, subject binding, migration boundary and sanitized evidence.

- [ ] **Step 11: Stop at qualification boundary**

Even after a clean post-live review, do **not** deploy publicly and do **not** implement federation. Final state is `TASK_11_QUALIFIED_AWAITING_DEPLOY_DECISION`.

## Self-Review Result

- Spec coverage: all authorization scope, stop conditions, provider/live-store hardening, live smoke, evidence and review gates are mapped to Tasks 1–6.
- Type consistency: all implementations remain behind the existing Phase 2 ports; no new domain authority interface is introduced.
- Review focus coverage: all four scopes have separate cross-instance/concurrent boundary tests in Task 2 and live proof in Task 6; real abort is Task 3/6; no auto-create is Task 1/6; subject mismatch is Task 5/6; token minimization is Task 1/6.
- Sequencing: Tasks 1–5 are fully qualified and independently reviewed on an exact head before Task 6 may perform the first provider mutation; any intervening tracked change invalidates that gate.
- Proportion: external provider mutation remains isolated in Task 6; code, tests, validator, provisioning guard and pre-mutation independent review are completed first.