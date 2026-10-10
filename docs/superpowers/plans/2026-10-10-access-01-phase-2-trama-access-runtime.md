# ACCESS-01 Phase 2 — TRAMA Access Runtime Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** implementare e qualificare il runtime minimo zero-cost di TRAMA Access con passwordless reale, principal governato da `issuer + subject`, sessione locale, entitlement coarse-grained, launcher e failure model fail-closed, senza federare ancora alcun prodotto.

**Architecture:** `apps/access` è una nuova applicazione same-origin: React/Vite per la UI e backend Node.js/Fastify per autenticazione, sessione e accesso server-side allo store. Supabase Auth/Postgres è confinato dietro adapter sostituibili e non diventa authority di prodotto; il browser non accede direttamente alle tabelle Access. La CI usa repository/provider fake deterministici; il proof live usa un progetto Supabase dedicato e un servizio Render Free solo dopo preflight zero-cost.

**Tech Stack:** Node.js >=22, TypeScript 7, React 19, Vite 8, Vitest 5, Playwright 1.63, Fastify + plugin cookie/static/security, `@supabase/supabase-js` + helper SSR/PKCE ufficiale, Supabase Postgres, GitHub Actions, Render Free pilot.

**Spec:** `docs/superpowers/specs/2026-10-10-access-01-phase-2-trama-access-runtime-design.md`

## Global Constraints

- Zero-cost obbligatorio: nessun piano, add-on o servizio a pagamento è autorizzato.
- Il preflight Supabase/Render è read-only e deve PASS prima di qualsiasi provisioning live.
- Supabase è provider Phase 2 sostituibile; Keycloak resta portability/exit option, non runtime parallelo.
- Il pilot implementa il ramo **Magic Link** del passwordless email approvato; niente UI OTP manuale salvo nuova decisione.
- Auto-signup disabilitato; il pilot è chiuso.
- Email e metadati mutabili non sono authority key e non vengono usati per account linking.
- Il principal autorevole deriva esclusivamente da `issuer + subject` verificati.
- `principalId` TRAMA è opaco e non deve coincidere per requisito con UUID locali dei prodotti.
- Lo store Access contiene soltanto principal, contesto, entitlement e sessioni Access; nessun dato di prodotto o learner.
- Gli entitlement centrali sono solo le cinque coppie canoniche Phase 1 e non includono permessi fini.
- Sessione Access: secret casuale >=256 bit, digest server-side, cookie `HttpOnly; Secure; SameSite=Lax`, TTL assoluto massimo 8 ore, non sliding.
- Nessun provider token/session secret/JWT privilegiato in URL applicativi, `localStorage` o `sessionStorage`.
- Logout locale deve riuscire indipendentemente dalla disponibilità del provider.
- Un entitlement revocato deve sparire alla successiva risoluzione server-side senza richiedere logout globale.
- Nuovo login o nuova escalation durante provider outage fallisce chiuso.
- Gateway, Curricolo Atlas pubblico e Control Center pubblico restano indipendenti dal runtime Access.
- Nessun prodotto viene federato in Phase 2; nessun URL temporaneo di prodotto viene usato come falsa integrazione.
- Gateway non viene puntato a TRAMA Access in Phase 2.
- `localSubjectRef` non viene introdotto prima della Phase 3.
- Nessun account learner, social login, SMTP a pagamento, migrazione utenti o global logout.
- Il design di Access deriva da `TRAMA-PARENT-IDENTITY@1.0.0`; non riutilizzare glass/media del Gateway fuori dallo scope governato gateway-only.
- DOS-A1 resta `RUNTIME_DEFERRED`.
- Nessun merge su `main` senza decisione umana separata.

## Review Focus

1. **User enumeration:** indirizzo inesistente, non ammesso o ammesso deve produrre la stessa risposta pubblica alla richiesta passwordless; prova route-level in Task 5.
2. **Callback/identity confusion:** code replay, issuer inatteso, subject mancante e verification failure devono fallire senza creare principal/sessione; prova in Task 5.
3. **Stale privilege:** entitlement revocato o principal disabilitato durante una sessione non deve restare nel launcher; prova in Tasks 2 e 6.
4. **Session fixation/CSRF:** login deve ruotare la sessione; POST auth/logout richiede Origin esatto e CSRF double-submit; prova in Task 3.
5. **Test harness escape:** adapter/route di test non possono essere abilitati con `NODE_ENV=production`; prova in Tasks 1 e 8.

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
- Create during execution after preflight: `docs/evidence/access-01/access-01-phase-2-zero-cost-preflight.md`
- Create only at closure: `docs/evidence/access-01/access-01-phase-2-runtime-receipt.md`

The generic Stage-A UI evidence manifest is **not** repurposed for this runtime-bearing surface because its current validator requires `runtimeImpact = NONE`. Phase 2 uses an ACCESS-specific exact-head certification artifact; changing the generic UI evidence contract is out of scope.

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
- Produces: PASS/STOP preflight, package `@trama/access`, deterministic build/test scripts, and `loadAccessConfig(env) -> AccessConfig`.

- [ ] **Step 1: Run read-only zero-cost preflight before any external write**

Verify and record:
- an available Supabase Free project slot without upgrade;
- an EU Supabase region can be selected for a new project;
- the free email channel can reach the chosen pilot address without paid SMTP;
- a Render Free web service can be created without paid resources;
- no add-on or paid database is required.

Expected: all five `PASS`. If any item is `FAIL/UNKNOWN`, STOP before provisioning and request a new decision. Do not create resources in this step.

- [ ] **Step 2: Commit the preflight receipt only if PASS**

The receipt contains no credentials or pilot email; record capability facts and the zero-cost decision only.

Commit message: `docs(access): record Phase 2 zero-cost preflight`

- [ ] **Step 3: Write RED config tests**

`loadAccessConfig(env)` must:
- require in production: `ACCESS_PUBLIC_ORIGIN`, `ACCESS_ALLOWED_ISSUER`, `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`;
- require exact `https://` public origin in production;
- require `ACCESS_ALLOWED_ISSUER` to be an exact `https://` issuer with no wildcard;
- expose `sessionTtlMs = 28_800_000`;
- reject `ACCESS_TEST_HARNESS=1` when `NODE_ENV=production`;
- expose no product destination URLs.

Run: `cd apps/access && npm test -- server/config.test.ts`

Expected: FAIL because app/config do not exist.

- [ ] **Step 4: Scaffold the app using repository conventions**

Mirror Node >=22 / React 19 / Vite / TypeScript / Vitest / Playwright conventions from `apps/gateway`, adding a server build. Runtime dependencies are limited to React, Fastify server/security/static/cookie plugins, Supabase JS + official SSR/PKCE helper, and small UI utilities needed by the shell.

`vite.config.ts`/Vitest must include tests under:
- `src/**/*.test.{ts,tsx}`;
- `server/**/*.test.ts`;
- `scripts/**/*.test.ts`.

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

`build` emits Vite client + compiled server; `start` runs compiled server JS only.

- [ ] **Step 5: Implement and verify config GREEN**

Run:

```bash
cd apps/access
npm ci
npm run typecheck
npm test -- server/config.test.ts
npm run build
```

Expected: PASS; no live network credential is required.

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

`AccessRepository` exposes server-side methods for principal lookup/create/status, context reads, active entitlement reads/upsert/revoke and session persistence. No method accepts email as a principal key.

- [ ] **Step 1: Write RED principal tests**

Assert:
- same exact `(issuer, subject)` reuses one `principalId`;
- email metadata is irrelevant because email is absent from the API;
- different issuer or subject gives a distinct principal;
- `DISABLED` resolves to denied;
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

Creation is allowed only after a provider-verified identity from the closed pilot provider.

- [ ] **Step 3: Write RED launcher tests**

Allow only:

```text
DOCENTE_OS/USE
CURRICOLO_ATLAS/READ
STUDIO_ATLAS/AUTHOR
ARENA/ENTER
CONTROL_CENTER/GOVERNANCE_OPERATOR
```

Revoked items do not appear. No item contains product URL. `GOVERNANCE_OPERATOR` is application-entry status only.

- [ ] **Step 4: Implement launcher view model**

Signature:

```ts
buildLauncher(principalId: string, repository: AccessRepository): Promise<LauncherItem[]>;
```

Each item contains `application`, user-facing label, entitlement and `availability: 'FEDERATION_PENDING'`; no `href`.

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
issueSession(
  principalId: string,
  now: Date,
  repository: AccessRepository,
  predecessorSecret?: string
): Promise<{ secret: string; digest: string; expiresAt: Date }>;

validateSession(
  secret: string,
  now: Date,
  repository: AccessRepository
): Promise<SessionValidation>;

revokeSession(
  secret: string,
  now: Date,
  repository: AccessRepository
): Promise<void>;

createCsrfToken(): string;
verifyMutationRequest(
  origin: string | undefined,
  expectedOrigin: string,
  cookieToken: string | undefined,
  headerToken: string | undefined
): boolean;
```

- [ ] **Step 1: Write RED session tests**

Assert:
- >=32 random bytes before base64url encoding;
- persisted value is SHA-256 digest, never raw secret;
- absolute expiry exactly `issuedAt + 28_800_000ms`, non-sliding;
- expired/revoked/missing session invalid;
- disabled principal invalidates session on server-side validation;
- issuing a new login session with `predecessorSecret` revokes predecessor first.

- [ ] **Step 2: Run RED**

Run: `cd apps/access && npm test -- server/domain/session-service.test.ts`

Expected: FAIL.

- [ ] **Step 3: Implement session/cookie semantics**

Cookie name: `trama_access_session`.

Production attributes: `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/`, `Max-Age=28800`.

Do not serialize principal, entitlement or provider token into cookie.

- [ ] **Step 4: Write and implement CSRF RED→GREEN**

Double-submit token name: `trama_access_csrf`; it is non-authoritative and may be readable by the UI. Mutations require exact `Origin === ACCESS_PUBLIC_ORIGIN` and constant-time equality of CSRF cookie/header.

Test missing/mismatched Origin, missing/mismatched token and valid token.

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
- principal status `ACTIVE|DISABLED`;
- context `PERSONAL|INSTITUTION`, with `institution_ref` only required for `INSTITUTION`;
- entitlement restricted to five exact canonical pairs and status `ACTIVE|REVOKED`;
- session digest only + issuance/expiry/revocation timestamps;
- RLS enabled on all four tables;
- no policy granting browser `anon` or `authenticated` direct table access;
- no columns for email, lesson, curriculum/curricolo content, materials, class/group, workspace, Studio Atlas draft or learner data.

Run: `cd apps/access && npm test -- scripts/validate-access-migration.test.ts`

Expected: RED.

- [ ] **Step 2: Create migration and validator**

Use Postgres native UUID generation. Migration is additive and dedicated to the new Access project; no product schema reference.

- [ ] **Step 3: Write RED repository-adapter tests with fake Supabase client**

Pin method-to-table mapping and fail-closed behavior for missing/error responses. Prove email never appears in identity lookup filters.

- [ ] **Step 4: Implement server-only Supabase repository**

Instantiate only with server credentials. Client-side source must never import this adapter.

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
type ProviderCookieOptions = {
  httpOnly?: boolean;
  secure: boolean;
  sameSite: 'lax';
  path: '/';
  maxAge?: number;
};

interface ProviderCookieJar {
  get(name: string): string | undefined;
  set(name: string, value: string, options: ProviderCookieOptions): void;
  clear(name: string, options: ProviderCookieOptions): void;
}

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
- accepted vs unknown/non-authorized membership outcomes produce the same `202` neutral public body;
- provider adapter uses `shouldCreateUser: false`;
- exact Origin + CSRF required;
- global provider outage may return canonical `503 PROVIDER_UNAVAILABLE`, but must not reveal membership or provider internals;
- raw email is absent from application logs in tests.

- [ ] **Step 2: Write callback RED tests**

Assert:
- missing/replayed/invalid code fails closed;
- verified claims require exact non-empty `iss` and `sub`;
- `iss === ACCESS_ALLOWED_ISSUER`, exact, no wildcard;
- no email-linking fallback;
- verification failure creates no principal/session;
- success resolves/creates principal, issues fresh Access session, clears transient provider auth cookies and redirects to `/` with no token material in URL.

- [ ] **Step 3: Implement Supabase passwordless adapter**

Use official PKCE-capable server/SSR flow. After code exchange, obtain **verified signed claims** and return only `{ issuer: claims.iss, subject: claims.sub }`. No unverified JWT decode fallback. If the pinned official SDK cannot provide verified claims, STOP and revise the plan rather than weakening the boundary.

- [ ] **Step 4: Implement auth routes**

Membership-related request-link responses are constant. Technical provider errors are redacted. Callback success writes a short-lived non-sensitive flash `AUTHENTICATED`; callback failures write only canonical flash enums such as `ACCESS_DENIED`/`PROVIDER_UNAVAILABLE`, never provider details in URL.

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
- `GET /api/access-state` returns canonical client state and no provider token.
- CLI supports only server-side pilot mutations:

```text
access-admin.mjs entitlement grant  --principal <uuid> --application <canonical-app>
access-admin.mjs entitlement revoke --principal <uuid> --application <canonical-app>
access-admin.mjs principal disable  --principal <uuid>
```

Application determines its entitlement from canonical pair; CLI does not accept arbitrary entitlement strings.

- [ ] **Step 1: Write RED access-state tests**

Pin:
- no cookie → `SIGNED_OUT`;
- request-link success flash → `MAGIC_LINK_SENT`;
- callback-success flash + valid session → one-time `AUTHENTICATED`, then next state resolution proceeds to launcher state;
- valid session/no entitlement → `NO_ENTITLEMENTS`;
- valid session/active entitlement → `ENTITLEMENTS_AVAILABLE`;
- expired session → clear cookie + `SESSION_EXPIRED`;
- disabled principal → clear cookie + `ACCESS_DENIED`;
- revoked entitlement disappears on next request without re-login.

- [ ] **Step 2: Implement access-state route**

Return only canonical state, optional opaque principal display reference, context type/ref if needed for display, launcher labels/status. No email/provider token. Consuming `AUTHENTICATED` flash is one-shot.

- [ ] **Step 3: Write RED CLI tests**

Reject unknown app, arbitrary entitlement, malformed principal UUID and product-fine permission attempts. Grant/revoke must be idempotent.

- [ ] **Step 4: Implement CLI with service credential only**

Do not expose admin mutations as HTTP routes in Phase 2.

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
- Produces states exactly:
  `SIGNED_OUT`, `MAGIC_LINK_SENT`, `AUTH_CALLBACK_PROCESSING`, `AUTHENTICATED`, `NO_ENTITLEMENTS`, `ENTITLEMENTS_AVAILABLE`, `ACCESS_DENIED`, `PROVIDER_UNAVAILABLE`, `SESSION_EXPIRED`.

- [ ] **Step 1: Write RED UI tests for all nine canonical states**

Human-facing Italian copy must not contain `Supabase`, `PKCE`, `issuer`, `subject`, stack/HTTP code or provider jargon.

`ENTITLEMENTS_AVAILABLE` shows application items as non-navigation with copy equivalent to **“Disponibile dalla fase di federazione”**; no product `href`.

- [ ] **Step 2: Write RED identity-policy test**

`src/lib/identity.ts` binds to `TRAMA-PARENT-IDENTITY@1.0.0` palette/typography. Do not copy Gateway-only glass/media scope. Allowed: TRAMA wordmark, Instrument Serif, Inter, parent palette, warm accent role.

- [ ] **Step 3: Implement the minimal shell**

One professional-access surface, not dashboard. Required:
- TRAMA identity/wordmark;
- email input + one primary access action when signed out;
- neutral “controlla la tua email” state;
- callback-processing and authenticated-confirmation states;
- explicit denied/provider unavailable/session expired states;
- launcher after auth;
- visible logout.

On one-time `AUTHENTICATED`, render confirmation then immediately request the next access-state resolution; it must converge to `NO_ENTITLEMENTS` or `ENTITLEMENTS_AVAILABLE` without creating a second session.

- [ ] **Step 4: Implement access API client**

Read dedicated CSRF cookie and send `X-CSRF-Token`; no auth/session token goes into JS storage.

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
- Materializer consumes exact 40-char head + browser/security outputs and emits `access-phase2-evidence.json` bound to SHA and immutable run ID.

- [ ] **Step 1: Write RED e2e tests for every canonical state**

Certify all nine states:
- `SIGNED_OUT`;
- `MAGIC_LINK_SENT`;
- `AUTH_CALLBACK_PROCESSING`;
- `AUTHENTICATED`;
- `NO_ENTITLEMENTS`;
- `ENTITLEMENTS_AVAILABLE`;
- `ACCESS_DENIED`;
- `PROVIDER_UNAVAILABLE`;
- `SESSION_EXPIRED`.

For visual evidence, capture each relevant state at the condition(s) needed for review and capture the primary shell at all repository-standard S/M/L/LIM sizes. Fake provider may deliberately delay callback completion to expose `AUTH_CALLBACK_PROCESSING`; no production test-control route is added.

- [ ] **Step 2: Write RED browser security/accessibility tests**

Assert:
- no token/session secret in URL, `localStorage` or `sessionStorage`;
- product links absent;
- logout invalidates state;
- revoked entitlement disappears after reload;
- test-control endpoint unavailable from production composition;
- keyboard path reaches input, submit and logout;
- axe has no blocking A/AA findings on signed-out and authenticated launcher states;
- 320px reflow has no horizontal overflow.

- [ ] **Step 3: Implement test composition and Playwright config**

Responsive conditions:
`S=390x844`, `M=768x1024`, `L=1440x900`, `LIM=320x900`.

- [ ] **Step 4: Write RED evidence-materializer tests**

Reject:
- malformed/stale head;
- missing required S/M/L/LIM screenshots;
- missing canonical-state coverage metadata;
- missing axe/security reports;
- any required report not `PASS`.

Artifact records exact head, run ID, digests and `runtimeBoundary = PHASE2_ACCESS_ONLY_NO_PRODUCT_FEDERATION`.

- [ ] **Step 5: Add dedicated CI workflow**

`.github/workflows/trama-access.yml` must:
- checkout exact PR head;
- Node 22 + pinned npm resolver consistent with repository practice;
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

### Task 9: Provision zero-cost pilot and prove real passwordless flow

**Files:**
- No credential-bearing file is committed.
- Modify only non-secret deployment documentation if needed.
- Live evidence is later summarized by Task 10.

**Interfaces:**
- Consumes: preflight PASS and code/CI PASS from Tasks 1–8.
- Produces: dedicated Supabase Free project, Render Free pilot service, one provider-preauthorized pilot user, applied four-table migration, live proof data.

- [ ] **Step 1: Re-run zero-cost preflight immediately before provisioning**

If account state, quotas, email capability or pricing changed, STOP. Do not substitute paid service.

- [ ] **Step 2: Create one dedicated Supabase Free project in EU region**

Name identifies TRAMA Access pilot. Do not reuse Docente OS/Arena/Studio Atlas databases. Enable only required passwordless email behavior; public signup remains disabled.

- [ ] **Step 3: Apply reviewed migration**

Verify exactly four application tables and direct `anon/authenticated` table access denied. No product schema/table.

- [ ] **Step 4: Pre-authorize one real pilot Auth user administratively**

Use email compatible with free provider channel. Never record email in repository receipt/logs.

- [ ] **Step 5: Create one Render Free web service**

Build command equivalent:

```text
cd apps/access && npm ci && npm run build
```

Start command equivalent:

```text
cd apps/access && npm start
```

Secrets only in provider-managed env vars. No Render Postgres. `ACCESS_PUBLIC_ORIGIN` exactly equals deployed HTTPS origin. `ACCESS_ALLOWED_ISSUER` exactly equals verified Supabase issuer. Exact callback/redirect URLs only; no wildcard.

- [ ] **Step 6: Live proof — first login and principal creation**

Perform real Magic Link sign-in. Verify logs contain no magic link, OTP, provider access/refresh token, session secret or email. Verify Access principal record contains issuer/subject, opaque principal ID, status/timestamps only.

- [ ] **Step 7: Live proof — entitlement lifecycle**

Initial state: `NO_ENTITLEMENTS`.

Use server-side CLI to grant one canonical entitlement; reload → `ENTITLEMENTS_AVAILABLE`. Revoke same entitlement during session; reload → item absent/`NO_ENTITLEMENTS` without re-login.

- [ ] **Step 8: Live proof — logout and bounded failure behavior**

Logout terminates local Access session; subsequent authenticated API state unavailable. Provider-unavailable behavior may be proven deterministically by Task 8; do not damage provider configuration solely to manufacture live outage.

- [ ] **Step 9: Record non-secret live evidence identifiers**

Record project/service identifiers, EU region, deployed URL, code head, timestamps and proof outcomes; never credentials or pilot email.

No commit required until closure evidence is assembled in Task 10.

---

### Task 10: Closure receipt, conservative state-map delta and final exact-head qualification

**Files:**
- Create: `docs/evidence/access-01/access-01-phase-2-runtime-receipt.md`
- Modify: `governance/access/trama-ecosystem-state-v0.2.json`
- Modify: `.github/workflows/governance.yml` only if permanent Access validation hook is missing.
- Test: Governance + TRAMA Access workflow on final exact head.

**Interfaces:**
- Consumes: deterministic exact-head artifact, live pilot proof, Human Review.
- Produces:
  - `trama_access.state = REAL` only for Phase 2 pilot boundary;
  - `professional_identity.state = PARTIAL`;
  - runtime state equivalent to `ACCESS_RUNTIME_REAL_PRODUCT_FEDERATION_NOT_IMPLEMENTED`;
  - every `trama_access_to_*` product flow and `gateway_to_trama_access` remains `DESIGNED`.

- [ ] **Step 1: Write receipt with evidence before state promotion**

Distinguish deterministic CI proof, live provider/runtime proof, what is REAL, what remains DESIGNED/PARTIAL, zero-cost result, no product federation and no Gateway cutover. No secrets, pilot email or provider tokens.

- [ ] **Step 2: Update machine-readable state map conservatively**

Do not promote product flows or alter Docente OS/Arena/Studio Atlas/Curricolo Atlas/Control Center authority states.

- [ ] **Step 3: Add/confirm permanent Governance validation**

Validate Phase 2 state delta/receipt invariants without live secrets/network.

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

- [ ] **Step 6: Certify final exact head in GitHub Actions**

Require simultaneously:
- `TRAMA Access` workflow PASS;
- Governance PASS;
- exact-head Access evidence artifact retrievable;
- no stale-head evidence.

A commit cannot embed its own future SHA/run ID: immutable exact-head binding is the CI-generated Access artifact plus final PR closure comment. The committed receipt describes evidence contract/live proof but does not fabricate self-referential SHA.

- [ ] **Step 7: Human Visual Review on exact-head pilot**

Show real S/M/L/LIM surfaces and verify:
- sign-in understandable without provider jargon;
- neutral email-sent state;
- launcher not mistaken for working product federation;
- access-denied/provider-unavailable/session-expired states clear;
- logout visible;
- TRAMA identity coherent while surface remains minimal.

Decision: `PASS / REWORK / REJECT`.

- [ ] **Step 8: Independent whole-branch review**

Review security boundaries, migration/RLS, session lifecycle, fail-closed logic, exact-head evidence and state-map claims. Any blocking finding returns to RED→GREEN before closure.

- [ ] **Step 9: Record human closure without merging automatically**

On PASS, add PR closure comment naming exact head, Governance run, Access run/artifact and live proof. Merge remains a separate explicit human decision.

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

Execution stops and returns for a new decision if any becomes true:

- zero-cost provisioning is no longer possible;
- free email delivery cannot support approved pilot without adding SMTP/provider scope;
- official Supabase SDK path cannot provide verified claims for exact issuer/subject without unverified JWT decoding;
- implementation would require sharing product database or product-local authorization state;
- a product must be federated to close Phase 2;
- Gateway must be modified/cut over to prove Phase 2;
- paid Render/Supabase resource is required;
- security review finds a blocker that cannot be fixed inside approved boundary.
