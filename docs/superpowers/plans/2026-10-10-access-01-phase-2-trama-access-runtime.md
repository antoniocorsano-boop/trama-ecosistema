# ACCESS-01 Phase 2 — TRAMA Access Runtime Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** implementare e qualificare il runtime minimo zero-cost di TRAMA Access con autenticazione passwordless reale, principal governato da `issuer + subject`, sessione locale, entitlement coarse-grained, launcher e failure model fail-closed, senza federare ancora alcun prodotto.

**Architecture:** `apps/access` sarà una nuova applicazione same-origin: React/Vite per la UI e un backend Node.js dedicato per auth, sessione e accesso server-side allo store. Supabase Auth/Postgres resta dietro adapter sostituibili e non diventa authority di prodotto; il browser non accede direttamente alle tabelle Access. La CI usa repository/provider fake deterministici, mentre il proof live viene eseguito separatamente su un progetto Supabase dedicato e un servizio Render Free soltanto dopo preflight zero-cost.

**Tech Stack:** Node.js >=22, TypeScript 7, React 19, Vite 8, Vitest 5, Playwright 1.63, Fastify + cookie/static/security plugins, `@supabase/supabase-js` + helper SSR/PKCE ufficiale, Supabase Postgres, GitHub Actions, Render Free pilot.

**Spec:** `docs/superpowers/specs/2026-10-10-access-01-phase-2-trama-access-runtime-design.md`

## Global Constraints

- Zero-cost obbligatorio: nessun piano, add-on o servizio a pagamento è autorizzato.
- Il preflight Supabase/Render è read-only e deve PASS prima di qualsiasi provisioning live.
- Supabase è provider Phase 2 sostituibile; Keycloak resta portability/exit option, non runtime parallelo.
- Login Phase 2: email OTP/Magic Link passwordless, auto-signup disabilitato.
- Email e metadati mutabili non sono authority key e non vengono usati per account linking.
- Il principal autorevole deriva esclusivamente da `issuer + subject` verificati.
- `principalId` TRAMA è opaco e non coincide per requisito con UUID locali dei prodotti.
- Lo store Access contiene soltanto principal, contesto, entitlement e sessioni Access; nessun dato di prodotto o learner.
- Gli entitlement centrali sono solo le coppie canoniche Phase 1 e non includono permessi fini.
- Sessione Access: secret casuale >=256 bit, digest server-side, cookie `HttpOnly; Secure; SameSite=Lax`, TTL assoluto massimo 8 ore, non sliding.
- Nessun provider token/session secret/JWT privilegiato in URL applicativi o `localStorage`.
- Logout locale deve riuscire indipendentemente dalla disponibilità del provider.
- Un entitlement revocato deve sparire alla successiva risoluzione server-side senza richiedere logout globale.
- Nuovo login o nuova escalation durante provider outage fallisce chiuso.
- Gateway, Curricolo Atlas pubblico e Control Center pubblico restano indipendenti dal runtime Access.
- Nessun prodotto viene federato in Phase 2; nessun product URL temporaneo viene usato come falsa integrazione.
- Gateway non viene puntato a TRAMA Access in Phase 2.
- `localSubjectRef` non viene introdotto prima della Phase 3.
- Nessun account learner, social login, SMTP a pagamento, migrazione utenti o global logout.
- Il design system di Access deriva da `TRAMA-PARENT-IDENTITY@1.0.0`; non riutilizzare glass/media del Gateway fuori dallo scope governato gateway-only.
- DOS-A1 resta `RUNTIME_DEFERRED`.
- Nessun merge su `main` senza decisione umana separata.

## Review Focus

1. **User enumeration:** indirizzo inesistente, non ammesso o ammesso deve produrre la stessa risposta pubblica alla richiesta passwordless; aggiungere test route-level in Task 5.
2. **Callback/identity confusion:** code replay, issuer inatteso, subject mancante e provider verification failure devono fallire senza creare principal/sessione; aggiungere test in Task 5.
3. **Stale privilege:** entitlement revocato o principal disabilitato durante una sessione non deve restare nel launcher; aggiungere test in Tasks 2 e 6.
4. **Session fixation/CSRF:** login deve ruotare la sessione; POST auth/logout deve richiedere origin esatto e CSRF double-submit; aggiungere test in Task 3.
5. **Test harness escape:** adapter/route di test non devono poter essere abilitati con `NODE_ENV=production`; aggiungere test di composition/config in Task 1 e browser check in Task 8.

---

## File structure

### Application shell
- Create: `apps/access/package.json`
- Create: `apps/access/package-lock.json`
- Create: `apps/access/index.html`
- Create: `apps/access/tsconfig.json`
- Create: `apps/access/tsconfig.server.json`
- Create: `apps/access/vite.config.ts`
- Create: `apps/access/playwright.config.ts`
- Create: `apps/access/src/main.tsx`
- Create: `apps/access/src/test/setup.ts`

### Client/UI
- Create: `apps/access/src/app/App.tsx`
- Create: `apps/access/src/app/App.test.tsx`
- Create: `apps/access/src/app/access-api.ts`
- Create: `apps/access/src/app/access-state.ts`
- Create: `apps/access/src/components/AccessShell.tsx`
- Create: `apps/access/src/components/AccessLogin.tsx`
- Create: `apps/access/src/components/AccessLauncher.tsx`
- Create: `apps/access/src/components/AccessStatus.tsx`
- Create: `apps/access/src/lib/identity.ts`
- Create: `apps/access/src/styles/globals.css`

### Server/domain
- Create: `apps/access/server/index.ts`
- Create: `apps/access/server/app.ts`
- Create: `apps/access/server/config.ts`
- Create: `apps/access/server/domain/types.ts`
- Create: `apps/access/server/domain/principal-service.ts`
- Create: `apps/access/server/domain/session-service.ts`
- Create: `apps/access/server/domain/launcher-service.ts`
- Create: `apps/access/server/ports/access-repository.ts`
- Create: `apps/access/server/ports/passwordless-provider.ts`
- Create: `apps/access/server/security/csrf.ts`
- Create: `apps/access/server/security/session-cookie.ts`
- Create: `apps/access/server/routes/auth-routes.ts`
- Create: `apps/access/server/routes/access-state-route.ts`

### Adapters/test harness
- Create: `apps/access/server/adapters/supabase/access-repository.ts`
- Create: `apps/access/server/adapters/supabase/passwordless-provider.ts`
- Create: `apps/access/server/testing/in-memory-access-repository.ts`
- Create: `apps/access/server/testing/fake-passwordless-provider.ts`
- Create: `apps/access/server/testing/e2e-server.ts`

### Persistence/admin
- Create: `apps/access/supabase/migrations/20261010_000001_access_phase2.sql`
- Create: `apps/access/scripts/access-admin.mjs`
- Create: `apps/access/scripts/validate-access-migration.mjs`

### Certification/governance
- Create: `apps/access/e2e/access-states.spec.ts`
- Create: `apps/access/e2e/access-security.spec.ts`
- Create: `scripts/materialize-trama-access-phase2-evidence.mjs`
- Create: `scripts/test-materialize-trama-access-phase2-evidence.mjs`
- Create: `.github/workflows/trama-access.yml`
- Modify only at closure: `.github/workflows/governance.yml`
- Modify only at closure: `governance/access/trama-ecosystem-state-v0.2.json`
- Create only at closure: `docs/evidence/access-01/access-01-phase-2-runtime-receipt.md`
- Create during execution after read-only checks: `docs/evidence/access-01/access-01-phase-2-zero-cost-preflight.md`

The generic Stage-A UI evidence manifest is **not** repurposed for this runtime-bearing surface because its current validator requires `runtimeImpact = NONE`. Phase 2 instead materializes an ACCESS-specific exact-head certification artifact; changing the generic UI evidence contract is out of scope.

---

### Task 1: Zero-cost preflight and deterministic app skeleton

**Files:**
- Create after read-only inspection: `docs/evidence/access-01/access-01-phase-2-zero-cost-preflight.md`
- Create: `apps/access/package.json`
- Create: `apps/access/package-lock.json`
- Create: `apps/access/index.html`
- Create: `apps/access/tsconfig.json`
- Create: `apps/access/tsconfig.server.json`
- Create: `apps/access/vite.config.ts`
- Create: `apps/access/src/main.tsx`
- Create: `apps/access/src/test/setup.ts`
- Create: `apps/access/server/config.ts`
- Test: `apps/access/server/config.test.ts`

**Interfaces:**
- Consumes: approved Phase 2 spec and current free-tier/account state.
- Produces: a PASS/STOP preflight decision plus package `@trama/access`, deterministic build/test scripts, and `loadAccessConfig(env) -> AccessConfig`.

- [ ] **Step 1: Run read-only zero-cost preflight before any external write**

Verify and record:
- an available Supabase Free project slot without upgrade;
- an EU Supabase region can be selected for a new project;
- the free email channel can reach the chosen pilot address without paid SMTP;
- a Render Free web service can be created without paid resources;
- no add-on or paid database is required.

Expected: all five `PASS`. If any item is `FAIL/UNKNOWN`, STOP the plan before provisioning and request a new decision. Do not create resources in this step.

- [ ] **Step 2: Commit the preflight receipt only if PASS**

The receipt must contain no credentials or pilot email; record provider/workspace capability facts and the zero-cost decision only.

Commit message: `docs(access): record Phase 2 zero-cost preflight`

- [ ] **Step 3: Write RED config tests**

`loadAccessConfig(env)` must:
- require `ACCESS_PUBLIC_ORIGIN`, `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY` in production;
- require an exact `https://` public origin in production;
- expose `sessionTtlMs = 28_800_000`;
- reject `ACCESS_TEST_HARNESS=1` when `NODE_ENV=production`;
- expose no product destination URLs.

Run: `cd apps/access && npm test -- server/config.test.ts`

Expected: FAIL because the app/config do not exist.

- [ ] **Step 4: Scaffold the app using repository conventions**

Mirror existing Node >=22 / React 19 / Vite / TypeScript / Vitest / Playwright conventions from `apps/gateway`, but add a server build. Runtime dependencies are limited to React, Fastify server/security/static/cookie plugins, Supabase JS + official SSR/PKCE helper, and the existing small UI utilities needed by the shell.

Scripts must include:

```text
typecheck
build:client
build:server
build
test
test:e2e
start
```

`build` must emit the Vite client plus compiled server; `start` runs only compiled server JS.

- [ ] **Step 5: Implement and verify config GREEN**

Run:

```bash
cd apps/access
npm ci
npm run typecheck
npm test -- server/config.test.ts
npm run build
```

Expected: PASS; no network credential is required to build or test.

- [ ] **Step 6: Commit**

Commit message: `feat(access): bootstrap Phase 2 runtime shell`

---

### Task 2: Principal, context and entitlement domain

**Files:**
- Create: `apps/access/server/domain/types.ts`
- Create: `apps/access/server/ports/access-repository.ts`
- Create: `apps/access/server/domain/principal-service.ts`
- Create: `apps/access/server/domain/launcher-service.ts`
- Create: `apps/access/server/testing/in-memory-access-repository.ts`
- Test: `apps/access/server/domain/principal-service.test.ts`
- Test: `apps/access/server/domain/launcher-service.test.ts`

**Interfaces:**
- Produces:

```ts
type PrincipalStatus = 'ACTIVE' | 'DISABLED';
type ContextType = 'PERSONAL' | 'INSTITUTION';
type Application = 'DOCENTE_OS' | 'CURRICOLO_ATLAS' | 'STUDIO_ATLAS' | 'ARENA' | 'CONTROL_CENTER';
type Entitlement = 'USE' | 'READ' | 'AUTHOR' | 'ENTER' | 'GOVERNANCE_OPERATOR';
type EntitlementStatus = 'ACTIVE' | 'REVOKED';

type VerifiedProviderIdentity = { issuer: string; subject: string };
type ProfessionalPrincipal = { principalId: string; issuer: string; subject: string; status: PrincipalStatus };
type PrincipalContext = { principalId: string; contextType: ContextType; institutionRef: string | null };
type ApplicationEntitlement = { principalId: string; application: Application; entitlement: Entitlement; status: EntitlementStatus };
```

`AccessRepository` must expose server-side methods for principal lookup/create/status, context reads, active entitlement reads/upsert/revoke, and session persistence; no method accepts email as a principal key.

- [ ] **Step 1: Write RED principal tests**

Assert:
- same exact `(issuer, subject)` reuses one `principalId`;
- same email metadata is irrelevant because email is not accepted by the API;
- different issuer or different subject creates a different principal;
- `DISABLED` principal resolves to denied;
- missing issuer/subject is rejected before persistence.

Run: `cd apps/access && npm test -- server/domain/principal-service.test.ts`

Expected: RED.

- [ ] **Step 2: Implement minimal principal resolution**

Signature:

```ts
resolveProfessionalPrincipal(
  identity: VerifiedProviderIdentity,
  repository: AccessRepository,
  options: { allowCreate: boolean }
): Promise<{ kind: 'ACTIVE'; principal: ProfessionalPrincipal } | { kind: 'DENIED' }>;
```

Creation is allowed only after a provider-verified pilot identity; the provider project itself is the pre-authorization boundary because public signup is disabled.

- [ ] **Step 3: Write RED launcher tests**

Assert exact canonical pairs only:

```text
DOCENTE_OS/USE
CURRICOLO_ATLAS/READ
STUDIO_ATLAS/AUTHOR
ARENA/ENTER
CONTROL_CENTER/GOVERNANCE_OPERATOR
```

Revoked items do not appear. No item contains a product URL in Phase 2. `GOVERNANCE_OPERATOR` is displayed only as application entry status and never as privileged action authority.

- [ ] **Step 4: Implement launcher view model**

Signature:

```ts
buildLauncher(principalId: string, repository: AccessRepository): Promise<LauncherItem[]>;
```

Each `LauncherItem` contains `application`, user-facing label, entitlement, and `availability: 'FEDERATION_PENDING'`; no `href` field.

- [ ] **Step 5: Verify GREEN**

Run: `cd apps/access && npm test -- server/domain/principal-service.test.ts server/domain/launcher-service.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit**

Commit message: `feat(access): add principal and entitlement domain`

---

### Task 3: Local session, cookie, CSRF and logout semantics

**Files:**
- Create: `apps/access/server/domain/session-service.ts`
- Create: `apps/access/server/security/session-cookie.ts`
- Create: `apps/access/server/security/csrf.ts`
- Test: `apps/access/server/domain/session-service.test.ts`
- Test: `apps/access/server/security/csrf.test.ts`

**Interfaces:**
- Consumes: session persistence methods from `AccessRepository`.
- Produces:

```ts
issueSession(principalId: string, now: Date): Promise<{ secret: string; digest: string; expiresAt: Date }>;
validateSession(secret: string, now: Date, repository: AccessRepository): Promise<SessionValidation>;
revokeSession(secret: string, now: Date, repository: AccessRepository): Promise<void>;
createCsrfToken(): string;
verifyMutationRequest(origin: string | undefined, expectedOrigin: string, cookieToken: string | undefined, headerToken: string | undefined): boolean;
```

- [ ] **Step 1: Write RED session tests**

Assert:
- 32 random bytes minimum before base64url encoding;
- persisted value is SHA-256 digest, never raw secret;
- absolute expiry is exactly `issuedAt + 28_800_000ms` and does not slide;
- expired/revoked/missing session is invalid;
- disabled principal invalidates the session on server-side validation;
- issuing a new login session revokes any supplied predecessor session to prevent fixation.

- [ ] **Step 2: Run RED**

Run: `cd apps/access && npm test -- server/domain/session-service.test.ts`

Expected: FAIL.

- [ ] **Step 3: Implement session/cookie semantics**

Cookie name: `trama_access_session`.

Production cookie attributes: `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/`, `Max-Age=28800`.

Do not serialize principal, entitlement or provider tokens into the cookie.

- [ ] **Step 4: Write and implement CSRF RED→GREEN**

Double-submit token name: `trama_access_csrf`; token is random, non-authoritative and may be readable by the UI. Mutative requests require both exact `Origin === ACCESS_PUBLIC_ORIGIN` and constant-time equality of CSRF cookie/header values.

Test mismatched/missing Origin, missing token, mismatched token and valid token.

Run: `cd apps/access && npm test -- server/security/csrf.test.ts`

Expected: PASS after implementation.

- [ ] **Step 5: Full task verification**

Run: `cd apps/access && npm test -- server/domain/session-service.test.ts server/security/csrf.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit**

Commit message: `feat(access): add bounded local session security`

---

### Task 4: Access Store migration and Supabase repository adapter

**Files:**
- Create: `apps/access/supabase/migrations/20261010_000001_access_phase2.sql`
- Create: `apps/access/scripts/validate-access-migration.mjs`
- Create: `apps/access/server/adapters/supabase/access-repository.ts`
- Test: `apps/access/server/adapters/supabase/access-repository.test.ts`
- Test: `apps/access/scripts/validate-access-migration.test.ts`

**Interfaces:**
- Consumes: `AccessRepository` port.
- Produces: production adapter backed by exactly four tables:
  `professional_principal`, `principal_context`, `principal_entitlement`, `access_session`.

- [ ] **Step 1: Write RED migration contract tests**

Require:
- unique exact `(issuer, subject)`;
- principal status check `ACTIVE|DISABLED`;
- context check `PERSONAL|INSTITUTION` with `institution_ref` required only for `INSTITUTION`;
- entitlement check restricted to the five exact canonical pairs and status `ACTIVE|REVOKED`;
- session digest only, issuance/expiry/revocation timestamps;
- RLS enabled on all four tables;
- no browser policy granting `anon` or `authenticated` table access;
- no columns for email, lesson, curriculum/curricolo content, materials, class/group, workspace, Studio Atlas draft or learner data.

Run: `cd apps/access && npm test -- scripts/validate-access-migration.test.ts`

Expected: RED.

- [ ] **Step 2: Create migration and validator**

Use Postgres native UUID generation. Keep migration additive and dedicated to the new Access project; do not reference any product schema.

- [ ] **Step 3: Write RED repository adapter tests with a fake Supabase client**

Pin method-to-table mapping and fail-closed behavior for missing/error responses. Test that email never appears in identity lookup filters.

- [ ] **Step 4: Implement server-only Supabase repository**

The adapter is instantiated only with server credentials. Client-side source files must never import it.

- [ ] **Step 5: Verify GREEN**

Run:

```bash
cd apps/access
npm test -- scripts/validate-access-migration.test.ts server/adapters/supabase/access-repository.test.ts
node scripts/validate-access-migration.mjs
```

Expected: PASS without live network.

- [ ] **Step 6: Commit**

Commit message: `feat(access): define isolated Access store`

---

### Task 5: Supabase passwordless adapter and fail-closed auth routes

**Files:**
- Create: `apps/access/server/ports/passwordless-provider.ts`
- Create: `apps/access/server/adapters/supabase/passwordless-provider.ts`
- Create: `apps/access/server/testing/fake-passwordless-provider.ts`
- Create: `apps/access/server/routes/auth-routes.ts`
- Create: `apps/access/server/app.ts`
- Test: `apps/access/server/routes/auth-routes.test.ts`
- Test: `apps/access/server/adapters/supabase/passwordless-provider.test.ts`

**Interfaces:**
- Produces:

```ts
interface PasswordlessProvider {
  requestSignIn(email: string, redirectTo: string, cookies: ProviderCookieJar): Promise<void>;
  completeSignIn(code: string, cookies: ProviderCookieJar): Promise<VerifiedProviderIdentity>;
  clearTransientAuth(cookies: ProviderCookieJar): Promise<void>;
}
```

HTTP contract:

```text
POST /api/auth/request-link
GET  /auth/callback?code=...
POST /api/auth/logout
```

- [ ] **Step 1: Write route-level RED tests for request-link**

Assert:
- valid-looking email receives the same `202` neutral body whether provider reports unknown/not-authorized/accepted;
- `shouldCreateUser` is false in the provider adapter;
- exact Origin + CSRF are required;
- provider outage maps to a neutral failure state without stack/provider details;
- raw email is not written to application logs in tests.

- [ ] **Step 2: Write callback RED tests**

Assert:
- missing/replayed/invalid code fails closed;
- verified claims must contain exact non-empty `iss` and `sub`;
- `iss` must match `ACCESS_ALLOWED_ISSUER` exactly;
- no fallback to email linking exists;
- provider verification failure creates no principal/session;
- successful verified pilot identity resolves/creates the principal, issues a fresh Access session, clears transient provider auth cookies and redirects to `/` without token material in the redirect URL.

- [ ] **Step 3: Implement Supabase passwordless adapter**

Use the official PKCE-capable server/SSR flow. After code exchange, obtain **verified signed claims** and return only `{ issuer: claims.iss, subject: claims.sub }`. Do not use an unverified JWT decode fallback; if the pinned SDK cannot provide verified claims, STOP and revise the plan rather than weakening the boundary.

- [ ] **Step 4: Implement auth routes**

Public response copy for request-link is constant. Technical provider errors remain server-side and redacted. Callback error state is stored as a short-lived non-sensitive flash enum/cookie before redirect; do not put provider details in URL parameters.

- [ ] **Step 5: Verify GREEN**

Run:

```bash
cd apps/access
npm test -- server/routes/auth-routes.test.ts server/adapters/supabase/passwordless-provider.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

Commit message: `feat(access): add passwordless fail-closed authentication`

---

### Task 6: Access-state API, launcher and governed admin CLI

**Files:**
- Create: `apps/access/server/routes/access-state-route.ts`
- Create: `apps/access/scripts/access-admin.mjs`
- Test: `apps/access/server/routes/access-state-route.test.ts`
- Test: `apps/access/scripts/access-admin.test.ts`

**Interfaces:**
- `GET /api/access-state` returns one canonical client view model and no provider token.
- CLI supports only server-side governed pilot mutations:

```text
access-admin.mjs entitlement grant  --principal <uuid> --application <canonical-app>
access-admin.mjs entitlement revoke --principal <uuid> --application <canonical-app>
access-admin.mjs principal disable  --principal <uuid>
```

Application determines its entitlement from the canonical pair; CLI does not accept arbitrary entitlement strings.

- [ ] **Step 1: Write RED access-state tests**

Pin these server outcomes:
- no cookie → `SIGNED_OUT`;
- flash request success → `MAGIC_LINK_SENT`;
- valid session/no entitlement → `NO_ENTITLEMENTS`;
- valid session/active entitlement → `ENTITLEMENTS_AVAILABLE`;
- expired session → clear session cookie + `SESSION_EXPIRED`;
- disabled principal → clear session cookie + `ACCESS_DENIED`;
- revoked entitlement disappears on next request without re-login.

- [ ] **Step 2: Implement access-state route**

Return only data required by UI: canonical state, optional opaque principal display reference, context type/ref if needed for display, launcher item labels/status. No email or provider token.

- [ ] **Step 3: Write RED CLI tests**

Reject unknown app, arbitrary entitlement, malformed principal UUID and any attempt to grant product-fine permissions. Prove grant/revoke is idempotent.

- [ ] **Step 4: Implement CLI with service credential only**

Do not expose these mutations as HTTP routes in Phase 2.

- [ ] **Step 5: Verify GREEN**

Run: `cd apps/access && npm test -- server/routes/access-state-route.test.ts scripts/access-admin.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit**

Commit message: `feat(access): expose governed Access state and pilot admin controls`

---

### Task 7: Minimal TRAMA Access UI and canonical states

**Files:**
- Create: `apps/access/src/lib/identity.ts`
- Create: `apps/access/src/app/access-state.ts`
- Create: `apps/access/src/app/access-api.ts`
- Create: `apps/access/src/components/AccessShell.tsx`
- Create: `apps/access/src/components/AccessLogin.tsx`
- Create: `apps/access/src/components/AccessLauncher.tsx`
- Create: `apps/access/src/components/AccessStatus.tsx`
- Create: `apps/access/src/app/App.tsx`
- Create: `apps/access/src/app/App.test.tsx`
- Create: `apps/access/src/styles/globals.css`

**Interfaces:**
- Consumes: `GET /api/access-state`, `POST /api/auth/request-link`, `POST /api/auth/logout`.
- Produces visual states exactly:
  `SIGNED_OUT`, `MAGIC_LINK_SENT`, `AUTH_CALLBACK_PROCESSING`, `AUTHENTICATED`, `NO_ENTITLEMENTS`, `ENTITLEMENTS_AVAILABLE`, `ACCESS_DENIED`, `PROVIDER_UNAVAILABLE`, `SESSION_EXPIRED`.

- [ ] **Step 1: Write RED UI tests for every canonical state**

Assert human-facing Italian copy contains no `Supabase`, `PKCE`, `issuer`, `subject`, stack/HTTP code or other provider jargon.

`ENTITLEMENTS_AVAILABLE` shows application cards/buttons as disabled/non-navigation with copy equivalent to **“Disponibile dalla fase di federazione”**; there are no product `href`s.

- [ ] **Step 2: Write RED identity-policy test**

`src/lib/identity.ts` must bind to `TRAMA-PARENT-IDENTITY@1.0.0` palette and typography values. Do not copy Gateway-only glass/media scope. Access may use the TRAMA wordmark, Instrument Serif, Inter, parent palette and warm accent role only.

- [ ] **Step 3: Implement the minimal shell**

One professional-access surface, not a dashboard. Required affordances:
- TRAMA identity/wordmark;
- email input + one primary access action when signed out;
- clear neutral “controlla la tua email” state;
- explicit status/error panel states;
- launcher after auth;
- visible logout.

Do not add navigation to ecosystem products or extra settings.

- [ ] **Step 4: Implement access API client**

CSRF token is read from its dedicated cookie and sent in `X-CSRF-Token`; no auth/session token goes into JS storage.

- [ ] **Step 5: Verify GREEN**

Run:

```bash
cd apps/access
npm run typecheck
npm test
npm run build
```

Expected: PASS.

- [ ] **Step 6: Commit**

Commit message: `feat(access): add minimal professional access experience`

---

### Task 8: Deterministic browser/adversarial certification and exact-head artifact

**Files:**
- Create: `apps/access/server/testing/e2e-server.ts`
- Create: `apps/access/e2e/access-states.spec.ts`
- Create: `apps/access/e2e/access-security.spec.ts`
- Create: `apps/access/playwright.config.ts`
- Create: `scripts/materialize-trama-access-phase2-evidence.mjs`
- Create: `scripts/test-materialize-trama-access-phase2-evidence.mjs`
- Create: `.github/workflows/trama-access.yml`

**Interfaces:**
- E2E server composes production routes with in-memory repository/fake provider only under `NODE_ENV=test`; production entrypoint cannot import/enable test control routes.
- Materializer consumes an exact 40-char head plus browser/security outputs and emits `access-phase2-evidence.json` bound to SHA and immutable GitHub run ID.

- [ ] **Step 1: Write RED e2e tests for canonical states**

Capture S/M/L/LIM evidence for at least:
- `SIGNED_OUT`;
- `MAGIC_LINK_SENT`;
- `NO_ENTITLEMENTS`;
- `ENTITLEMENTS_AVAILABLE`;
- `ACCESS_DENIED`;
- `PROVIDER_UNAVAILABLE`;
- `SESSION_EXPIRED`.

Run all with deterministic fake adapters; no real email/network.

- [ ] **Step 2: Write RED browser security tests**

Assert:
- no token/session secret appears in URL, `localStorage` or `sessionStorage`;
- product links are absent;
- logout invalidates state;
- revoked entitlement disappears after reload;
- test-control endpoint is unavailable from production composition;
- keyboard path reaches input, submit and logout;
- axe has no blocking A/AA findings on signed-out and authenticated launcher states;
- 320px reflow has no horizontal overflow.

- [ ] **Step 3: Implement test composition and Playwright config**

Use repository-standard responsive conditions `S=390x844`, `M=768x1024`, `L=1440x900`, `LIM=320x900`.

- [ ] **Step 4: Write RED evidence materializer tests**

Materializer must reject:
- malformed/stale head;
- missing S/M/L/LIM screenshots;
- missing axe/security reports;
- any report whose result is not `PASS`.

The emitted artifact records exact head, run ID, digests and `runtimeBoundary = PHASE2_ACCESS_ONLY_NO_PRODUCT_FEDERATION`.

- [ ] **Step 5: Add dedicated CI workflow**

`.github/workflows/trama-access.yml` must:
- checkout exact PR head;
- Node 22 + locked npm resolver consistent with current repository practice;
- `npm ci`, typecheck, unit tests, build;
- install Chromium;
- run deterministic browser/adversarial certification;
- materialize exact-head Access artifact;
- upload artifact with 14-day retention;
- use no live Supabase/Render secrets in ordinary PR CI.

- [ ] **Step 6: Verify locally GREEN**

Run:

```bash
node scripts/test-materialize-trama-access-phase2-evidence.mjs
cd apps/access
npm run typecheck
npm test
npm run build
npm run test:e2e
```

Expected: PASS.

- [ ] **Step 7: Commit**

Commit message: `test(access): certify Phase 2 runtime deterministically`

---

### Task 9: Provision the zero-cost pilot and prove the real passwordless flow

**Files:**
- No credential-bearing file is committed.
- Modify only non-secret deployment documentation if needed.
- Evidence captured externally and later summarized by Task 10.

**Interfaces:**
- Consumes: preflight PASS, code/CI PASS from Tasks 1–8.
- Produces: dedicated Supabase project, Render Free pilot service, one provider-preauthorized pilot auth user, applied four-table migration, and live proof data.

- [ ] **Step 1: Re-run the zero-cost preflight immediately before provisioning**

If account state, quotas, email capability or pricing has changed, STOP. Do not substitute a paid service.

- [ ] **Step 2: Create one dedicated Supabase Free project in an EU region**

Name should identify TRAMA Access pilot. Do not reuse Docente OS/Arena/Studio Atlas databases. Enable passwordless email only as required; keep public signup disabled.

- [ ] **Step 3: Apply the reviewed migration**

Verify exactly four application tables exist and direct `anon/authenticated` table access is denied. No product schema/table is created.

- [ ] **Step 4: Pre-authorize one real pilot Auth user administratively**

Use an email compatible with the free provider channel. Do not record the email in repository receipts or logs.

- [ ] **Step 5: Create one Render Free web service**

Build command equivalent to:

```text
cd apps/access && npm ci && npm run build
```

Start command equivalent to:

```text
cd apps/access && npm start
```

Set secrets only in provider-managed environment variables. No Render Postgres. Exact `ACCESS_PUBLIC_ORIGIN` must equal the deployed HTTPS origin. Register only exact callback/redirect URLs; no wildcard.

- [ ] **Step 6: Live proof — first login and principal creation**

Perform a real passwordless sign-in. Verify server logs contain no magic link, OTP, provider access/refresh token, session secret or email. Verify the created Access record contains verified issuer/subject + opaque principal ID only.

- [ ] **Step 7: Live proof — entitlement lifecycle**

Initial expected state: `NO_ENTITLEMENTS`.

Use the server-side CLI to grant one canonical entitlement; reload → `ENTITLEMENTS_AVAILABLE`. Revoke the same entitlement during the session; reload → item absent/`NO_ENTITLEMENTS` without re-login.

- [ ] **Step 8: Live proof — logout and bounded failure behavior**

Logout must terminate local Access session. Confirm subsequent authenticated API state is unavailable. Provider-unavailable behavior may be proven deterministically by Task 8; do not intentionally damage provider configuration solely to manufacture a live outage.

- [ ] **Step 9: Record non-secret live evidence identifiers**

Record project/service identifiers, EU region, deployed URL, code head, timestamps and proof outcomes; never record credentials or pilot email.

No commit is required until closure evidence is assembled in Task 10.

---

### Task 10: Closure receipt, conservative state-map delta and final exact-head qualification

**Files:**
- Create: `docs/evidence/access-01/access-01-phase-2-runtime-receipt.md`
- Modify: `governance/access/trama-ecosystem-state-v0.2.json`
- Modify: `.github/workflows/governance.yml` only if a permanent Access validation hook is still missing.
- Test: existing Governance + TRAMA Access workflow on final exact head.

**Interfaces:**
- Consumes: deterministic exact-head artifact, live pilot proof, Human Review.
- Produces:
  - `trama_access.state = REAL` only for the Phase 2 pilot boundary;
  - `professional_identity.state = PARTIAL`;
  - runtime state equivalent to `ACCESS_RUNTIME_REAL_PRODUCT_FEDERATION_NOT_IMPLEMENTED`;
  - every `trama_access_to_*` product flow and `gateway_to_trama_access` remains `DESIGNED`.

- [ ] **Step 1: Write the receipt with evidence before state promotion**

Receipt must distinguish:
- deterministic CI proof;
- live provider/runtime proof;
- what is REAL;
- what remains DESIGNED/PARTIAL;
- zero-cost result;
- no product federation;
- no Gateway cutover.

Do not include secrets, pilot email or provider tokens.

- [ ] **Step 2: Update the machine-readable state map conservatively**

Do not promote any product flow. Do not change Docente OS/Arena/Studio Atlas/Curricolo Atlas/Control Center authority states as a side effect of this phase.

- [ ] **Step 3: Add/confirm permanent Governance validation**

Governance should validate the Phase 2 state delta/receipt invariants without requiring live secrets or live network.

- [ ] **Step 4: Run local full regression**

Run at minimum:

```bash
node scripts/validate-trama-professional-identity-contract.mjs
node scripts/test-trama-professional-identity-contract-validator.mjs
node scripts/test-materialize-trama-access-phase2-evidence.mjs
cd apps/access
npm run typecheck
npm test
npm run build
npm run test:e2e
```

Expected: PASS.

- [ ] **Step 5: Commit closure delta**

Commit message: `feat(access): qualify Phase 2 TRAMA Access pilot`

- [ ] **Step 6: Certify the final exact head in GitHub Actions**

Require simultaneously:
- `TRAMA Access` workflow PASS;
- Governance PASS;
- exact-head Access evidence artifact retrievable;
- no stale-head evidence.

Because a commit cannot embed its own future SHA/run ID, the immutable exact-head binding is the CI-generated Access artifact plus final PR closure comment; the committed receipt describes the evidence contract and live proof but does not fabricate a self-referential SHA.

- [ ] **Step 7: Human Visual Review on the exact-head pilot**

Show real S/M/L/LIM surfaces and verify:
- sign-in is understandable without provider jargon;
- neutral email-sent state;
- launcher cannot be mistaken for working product federation;
- access-denied/provider-unavailable/session-expired states are clear;
- logout is visible;
- TRAMA identity is coherent but the surface remains minimal.

Decision must be one of `PASS / REWORK / REJECT`.

- [ ] **Step 8: Independent whole-branch review**

Review security boundaries, migration/RLS, session lifecycle, fail-closed logic, exact-head evidence and state-map claims. Any blocking finding returns to RED→GREEN before closure.

- [ ] **Step 9: Record human closure without merging automatically**

On PASS, add a PR closure comment naming exact head, Governance run, Access run/artifact and live proof. Leave merge as a separate explicit human decision.

---

## Expected execution dependency

```text
read-only zero-cost preflight
→ app/config skeleton
→ principal/context/entitlement domain
→ session + CSRF
→ isolated Access Store contract
→ Supabase provider adapter + auth routes
→ access-state + governed admin CLI
→ minimal TRAMA Access UI
→ deterministic adversarial/browser certification
→ zero-cost Supabase + Render provisioning
→ real passwordless/live entitlement proof
→ receipt + state-map delta
→ final exact-head CI
→ Human Review + independent review
→ separate merge decision
```

## Stop conditions

Execution stops and returns for a new decision if any of these becomes true:

- zero-cost provisioning is no longer possible;
- free email delivery cannot support the approved pilot without adding SMTP/provider scope;
- Supabase SDK cannot provide a verified-claims path for exact issuer/subject without unverified JWT decoding;
- implementation would require sharing a product database or product-local authorization state;
- a product must be federated to close Phase 2;
- Gateway must be modified/cut over to prove Phase 2;
- a paid Render/Supabase resource is required;
- security review finds a blocker that cannot be fixed inside the approved boundary.
