# ACCESS-01 Phase 2 — TRAMA Access Runtime Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** implementare il runtime minimo di TRAMA Access per il pilot professionale chiuso: OTP email, Principal pre-provisionato, un solo contesto istituzionale attivo, entitlement coarse-grained, sessione server-side opaca ≤ 8 ore e launcher fail-closed, senza federare ancora alcun prodotto.

**Architecture:** `apps/access` è una nuova applicazione Next.js 16 server-side/BFF. Il dominio dipende da porte provider-neutral per identità, sessione, rate limiting e provider OTP; il browser riceve solo la sessione Access opaca. Il provider concreto e il datastore live restano dietro adapter e vengono introdotti solo dopo un gate esplicito separato.

**Tech Stack:** Node 22; Next.js 16.3.1; React 19.2.8; React DOM 19.2.8; TypeScript 5.9.2; `tsx` 4.20.6 + Node test runner; Playwright 1.63.0 + `@axe-core/playwright` 4.13.0; CSS locale; Supabase client solo dopo il provider gate autorizzato.

**Spec:** `docs/superpowers/specs/2026-10-11-access-01-phase-2-trama-access-runtime-design.md`

## Global Constraints

- Login pilot: **OTP email**, non Magic Link.
- Pilot chiuso con allowlist esplicita; nessun self-signup.
- `Principal`, `LoginAlias`, binding `issuer + subject`, contesto ed entitlement sono pre-provisionati prima del primo login valido.
- Nessun auto-provisioning o auto-linking al primo OTP.
- Email e dominio non sono authority key e non attribuiscono permessi.
- Un solo `InstitutionalContext` attivo per Principal nel pilot; schema future-ready per multi-contesto.
- Entitlement pre-provisionati manualmente; i permessi fini restano nei prodotti.
- Launcher sempre visibile dopo login valido; app entitlemented ma non federate sono visibili e non navigabili.
- `apps/access` usa BFF/server-side; nessun token provider viene condiviso con il browser o con altri prodotti.
- Sessione server-side con secret opaco in cookie `HttpOnly + Secure + SameSite=Lax`, TTL assoluto massimo `28800` secondi, non sliding.
- Il datastore conserva solo digest della sessione, mai il secret in chiaro.
- Nessun bearer token, OTP, session secret o JWT privilegiato negli URL o in `localStorage`.
- Gateway, Docente OS, Arena, Curricolo Atlas, Studio Atlas, Atlas learner e Control Center non ricevono sessioni Access in Phase 2.
- Nessun dato di lezioni, curricolo, materiali, classi, gruppi, draft Studio Atlas o learner entra nel datastore Access.
- Supabase Auth resta candidato: nessun progetto/provider/costo/deploy viene creato o autorizzato dall'approvazione di questo piano.
- Il task provider-live contiene un **STOP GATE** e richiede autorizzazione esplicita separata prima di creare/configurare risorse esterne.
- Nessun merge o deploy automatico; exact-head evidence e Human Review precedono qualunque integrazione.
- DOS-A1 resta `RUNTIME_DEFERRED`.
- Non cherry-pickare né fondere i rami preesistenti `docs/access-01-phase-2-trama-access-runtime-design` o `feat/access-01-phase-2-trama-access-runtime`: divergono dal design approvato.

## Review Focus

1. **Account-linking ambiguity:** OTP valido con email corretta ma `issuer + subject` diverso dal binding pre-provisionato deve fallire chiuso; nessun fallback su email.
2. **Session fixation/staleness:** un cookie precedente, revocato o scaduto non deve essere riutilizzabile; la scadenza non deve slittare con l'attività.
3. **Enumeration/provider outage:** alias ammesso e alias assente devono produrre la stessa risposta pubblica quando il provider è disponibile; l'indisponibilità provider deve essere rilevata in modo indipendente dall'allowlist per non diventare un oracle.
4. **Entitlement drift:** revoca o sospensione durante una sessione valida deve riflettersi al successivo launcher/launch check senza richiedere logout globale.
5. **Misconfiguration:** fake/memory adapter non devono poter essere usati in produzione; configurazioni mancanti devono fail-closed senza rompere Gateway o altre superfici pubbliche.

---

## File Structure

### App e dominio

- Create: `apps/access/package.json`
- Create: `apps/access/package-lock.json`
- Create: `apps/access/tsconfig.json`
- Create: `apps/access/next-env.d.ts`
- Create: `apps/access/next.config.ts`
- Create: `apps/access/app/layout.tsx`
- Create: `apps/access/app/page.tsx`
- Create: `apps/access/app/globals.css`
- Create: `apps/access/components/access-auth-panel.tsx`
- Create: `apps/access/components/access-launcher.tsx`
- Create: `apps/access/components/access-status.tsx`
- Create: `apps/access/src/domain/types.ts`
- Create: `apps/access/src/domain/email.ts`
- Create: `apps/access/src/domain/principal-service.ts`
- Create: `apps/access/src/domain/session-service.ts`
- Create: `apps/access/src/domain/launcher-service.ts`
- Create: `apps/access/src/domain/auth-service.ts`

### Ports/server

- Create: `apps/access/src/ports/identity-repository.ts`
- Create: `apps/access/src/ports/session-store.ts`
- Create: `apps/access/src/ports/auth-provider.ts`
- Create: `apps/access/src/ports/rate-limiter.ts`
- Create: `apps/access/src/config/access-config.ts`
- Create: `apps/access/src/config/application-registry.ts`
- Create: `apps/access/src/server/runtime.ts`
- Create: `apps/access/src/server/session-cookie.ts`
- Create: `apps/access/src/server/origin-guard.ts`
- Create: `apps/access/src/server/audit.ts`
- Create: `apps/access/src/server/handlers/request-otp.ts`
- Create: `apps/access/src/server/handlers/verify-otp.ts`
- Create: `apps/access/src/server/handlers/logout.ts`
- Create: `apps/access/src/server/handlers/launch.ts`
- Create: `apps/access/app/api/auth/request-otp/route.ts`
- Create: `apps/access/app/api/auth/verify-otp/route.ts`
- Create: `apps/access/app/api/auth/logout/route.ts`
- Create: `apps/access/app/api/launch/route.ts`

### Test adapters e browser

- Create: `apps/access/src/testing/in-memory-identity-repository.ts`
- Create: `apps/access/src/testing/in-memory-session-store.ts`
- Create: `apps/access/src/testing/in-memory-rate-limiter.ts`
- Create: `apps/access/src/testing/fake-auth-provider.ts`
- Create: `apps/access/tests/config.test.ts`
- Create: `apps/access/tests/principal-service.test.ts`
- Create: `apps/access/tests/session-service.test.ts`
- Create: `apps/access/tests/launcher-service.test.ts`
- Create: `apps/access/tests/auth-service.test.ts`
- Create: `apps/access/tests/security.test.ts`
- Create: `apps/access/tests/handlers.test.ts`
- Create: `apps/access/playwright.config.ts`
- Create: `apps/access/e2e/access.spec.ts`

### CI/Governance

- Create: `.github/workflows/trama-access.yml`
- Create: `scripts/validate-trama-access-phase2.mjs`
- Create: `scripts/test-trama-access-phase2-validator.mjs`
- Modify: `.github/workflows/governance.yml`

### Provider-specific — solo dopo STOP GATE

- Create: `apps/access/src/adapters/supabase/supabase-client.ts`
- Create: `apps/access/src/adapters/supabase/supabase-identity-repository.ts`
- Create: `apps/access/src/adapters/supabase/supabase-session-store.ts`
- Create: `apps/access/src/adapters/supabase/supabase-rate-limiter.ts`
- Create: `apps/access/src/adapters/supabase/supabase-auth-provider.ts`
- Create: `apps/access/supabase/migrations/20261011_000001_access_phase2.sql`
- Create: `apps/access/scripts/provision-pilot-principal.ts`
- Create: `apps/access/tests/supabase-adapters.test.ts`

### Evidence/closure

- Create: `docs/evidence/access-01/access-01-phase-2-provider-preflight.md`
- Create: `docs/evidence/access-01/access-01-phase-2-threat-model.md`
- Create only at closure: `docs/evidence/access-01/access-01-phase-2-runtime-receipt.md`
- Modify only at closure: `governance/access/trama-ecosystem-state-v0.2.json`

---

### Task 1: Scaffold Next.js and fail-closed configuration

**Files:**
- Create: `apps/access/package.json`
- Create: `apps/access/package-lock.json`
- Create: `apps/access/tsconfig.json`
- Create: `apps/access/next-env.d.ts`
- Create: `apps/access/next.config.ts`
- Create: `apps/access/app/layout.tsx`
- Create: `apps/access/app/page.tsx`
- Create: `apps/access/app/globals.css`
- Create: `apps/access/src/config/access-config.ts`
- Test: `apps/access/tests/config.test.ts`

**Interfaces:**

```ts
export type AccessProviderKind = 'disabled' | 'fake' | 'supabase';
export type AccessStoreKind = 'disabled' | 'memory' | 'supabase';

export interface AccessConfig {
  origin: string;
  providerKind: AccessProviderKind;
  storeKind: AccessStoreKind;
  sessionTtlSeconds: 28800;
  nodeEnv: string;
}

export function loadAccessConfig(env: NodeJS.ProcessEnv): AccessConfig;
```

- [ ] **Step 1: Create package/test scaffold**

Pin the Tech Stack versions. Scripts:

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "typecheck": "tsc --noEmit",
  "test": "tsx --test tests/*.test.ts",
  "test:e2e": "playwright test"
}
```

Run `npm install` in `apps/access` to create `package-lock.json`.

- [ ] **Step 2: Write RED config tests**

Assert:
- TTL is exactly `28800`;
- `fake + memory` is accepted only outside production;
- production rejects `fake` and `memory`;
- `disabled + disabled` is a valid production fail-closed configuration;
- `supabase + supabase` in production requires exact HTTPS `ACCESS_ORIGIN`;
- mixed impossible pairs (`supabase + disabled`, `fake + supabase`) fail closed;
- unsupported values throw a configuration error.

- [ ] **Step 3: Run RED**

Run: `cd apps/access && npx tsx --test tests/config.test.ts`

Expected: FAIL because config code does not exist.

- [ ] **Step 4: Implement config and minimal static shell**

No auth behavior yet. `disabled + disabled` must render a safe unavailable state rather than crash.

- [ ] **Step 5: Verify GREEN**

Run:

```bash
cd apps/access
npx tsx --test tests/config.test.ts
npm run typecheck
npm run build
```

Expected: PASS.

- [ ] **Step 6: Commit**

Commit: `feat(access): scaffold phase 2 next runtime`

---

### Task 2: Model Principal, LoginAlias, context and exact external binding

**Files:**
- Create: `apps/access/src/domain/types.ts`
- Create: `apps/access/src/domain/email.ts`
- Create: `apps/access/src/ports/identity-repository.ts`
- Create: `apps/access/src/domain/principal-service.ts`
- Create: `apps/access/src/testing/in-memory-identity-repository.ts`
- Test: `apps/access/tests/principal-service.test.ts`

**Interfaces:**

```ts
findAliasByEmail(normalizedEmail: string): Promise<LoginAlias | null>;
findAliasByExternalIdentity(identity: { issuer: string; subject: string }): Promise<LoginAlias | null>;
getPrincipal(principalId: string): Promise<Principal | null>;
listActiveContexts(principalId: string): Promise<InstitutionalContext[]>;
listEntitlements(principalId: string, contextId: string, at: Date): Promise<ApplicationEntitlement[]>;

normalizeLoginEmail(value: string): string;
isPilotAliasAllowed(repo: IdentityRepository, email: string): Promise<boolean>;
resolvePrincipalForVerifiedIdentity(repo: IdentityRepository, input: ResolvePrincipalInput): Promise<PrincipalResolution>;
```

- [ ] **Step 1: Write RED identity tests**

Cover:
- allowlist true only for `LoginAlias ACTIVE + pilotAllowed`;
- trim/lowercase normalization for lookup;
- exact `issuer + subject` resolves the pre-provisioned Principal;
- same email + different subject fails `ACCESS_DENIED`;
- suspended/disabled Principal fails;
- zero or >1 active contexts fails;
- exactly one active context succeeds;
- provider `verifiedEmail` mismatch with the bound alias fails as consistency check;
- no function creates Principal, alias, context or entitlement.

- [ ] **Step 2: Run RED**

Run: `cd apps/access && npx tsx --test tests/principal-service.test.ts`

Expected: FAIL.

- [ ] **Step 3: Implement types, repository port and resolver**

Status enums exactly:
- Principal `ACTIVE | SUSPENDED | DISABLED`;
- LoginAlias `ACTIVE | DISABLED`;
- Context `ACTIVE | SUSPENDED | DISABLED`;
- Entitlement `ACTIVE | SUSPENDED | REVOKED`.

- [ ] **Step 4: Verify GREEN**

Run: `cd apps/access && npx tsx --test tests/principal-service.test.ts && npm test && npm run typecheck`

Expected: PASS.

- [ ] **Step 5: Commit**

Commit: `feat(access): add preprovisioned principal resolution`

---

### Task 3: Implement opaque server-side sessions

**Files:**
- Create: `apps/access/src/ports/session-store.ts`
- Create: `apps/access/src/domain/session-service.ts`
- Create: `apps/access/src/server/session-cookie.ts`
- Create: `apps/access/src/testing/in-memory-session-store.ts`
- Test: `apps/access/tests/session-service.test.ts`

**Interfaces:**

```ts
create(session: AccessSessionRecord): Promise<void>;
findByDigest(sessionDigest: string): Promise<AccessSessionRecord | null>;
revoke(sessionDigest: string, at: Date): Promise<void>;

issueAccessSession(input: IssueSessionInput): Promise<{ secret: string; record: AccessSessionRecord }>;
validateAccessSession(input: ValidateSessionInput): Promise<SessionValidation>;
revokeAccessSession(input: RevokeSessionInput): Promise<void>;
sha256SessionSecret(secret: string): string;
```

Cookie: `__Host-trama_access_session`.

- [ ] **Step 1: Write RED session tests**

Assert:
- secret has at least 256 bits of entropy;
- store receives digest only;
- expiry = `createdAt + 28800s`;
- expiry is absolute/non-sliding;
- revoked cookie fails immediately;
- Principal/context no longer active invalidates session;
- cookie includes `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/`, no `Domain`, `Max-Age=28800`;
- clear cookie uses same name and `Max-Age=0`.

- [ ] **Step 2: Run RED**

Run: `cd apps/access && npx tsx --test tests/session-service.test.ts`

Expected: FAIL.

- [ ] **Step 3: Implement with `crypto.randomBytes(32)` + SHA-256**

Do not introduce JWT session state.

- [ ] **Step 4: Verify GREEN**

Run: `cd apps/access && npx tsx --test tests/session-service.test.ts && npm test && npm run typecheck`

Expected: PASS.

- [ ] **Step 5: Commit**

Commit: `feat(access): add opaque bounded access sessions`

---

### Task 4: Implement Application Registry and launcher authorization

**Files:**
- Create: `apps/access/src/config/application-registry.ts`
- Create: `apps/access/src/domain/launcher-service.ts`
- Test: `apps/access/tests/launcher-service.test.ts`

**Interfaces:**

```ts
export type FederationState = 'NOT_FEDERATED' | 'FEDERATION_QUALIFIED' | 'SUSPENDED';
export function buildLauncher(input: BuildLauncherInput): Promise<LauncherCard[]>;
export function authorizeLaunch(input: AuthorizeLaunchInput): Promise<LaunchDecision>;
```

Phase 2 registry entries are all `NOT_FEDERATED` and have no `launchTarget`.

- [ ] **Step 1: Write RED launcher tests**

Cover:
- zero entitlement → authenticated empty launcher;
- active entitlement → matching card only;
- suspended/revoked/expired entitlement → no launch permission;
- `ACTIVE + NOT_FEDERATED` → visible card, `launchAllowed=false`, `CONNECTION_NOT_AVAILABLE`;
- unknown/missing registry entry fails closed;
- no Phase 2 entry contains a product login URL.

- [ ] **Step 2: Run RED**

Run: `cd apps/access && npx tsx --test tests/launcher-service.test.ts`

Expected: FAIL.

- [ ] **Step 3: Implement canonical registry and launcher service**

Canonical pairs:

```text
DOCENTE_OS       / USE
CURRICOLO_ATLAS  / READ
STUDIO_ATLAS     / AUTHOR
ARENA            / ENTER
CONTROL_CENTER   / GOVERNANCE_OPERATOR
```

- [ ] **Step 4: Verify GREEN**

Run: `cd apps/access && npx tsx --test tests/launcher-service.test.ts && npm test`

Expected: PASS.

- [ ] **Step 5: Commit**

Commit: `feat(access): add entitlement driven launcher`

---

### Task 5: Define provider-neutral OTP flow without enumeration leaks

**Files:**
- Create: `apps/access/src/ports/auth-provider.ts`
- Create: `apps/access/src/domain/auth-service.ts`
- Create: `apps/access/src/testing/fake-auth-provider.ts`
- Test: `apps/access/tests/auth-service.test.ts`

**Interfaces:**

```ts
export interface AuthProviderAdapter {
  checkAvailability(): Promise<void>;
  requestEmailOtp(input: { email: string }): Promise<void>;
  verifyEmailOtp(input: { email: string; otp: string }): Promise<VerifiedExternalIdentity>;
  bestEffortLogout?(): Promise<void>;
}

requestPilotOtp(input: RequestPilotOtpInput): Promise<RequestPilotOtpResult>;
verifyPilotOtp(input: VerifyPilotOtpInput): Promise<VerifyPilotOtpResult>;
```

Flow for a syntactically valid request:
1. rate limit;
2. call `checkAvailability()` **before** evaluating allowlist;
3. if unavailable, every alias receives the same `PROVIDER_UNAVAILABLE` result;
4. if available, evaluate allowlist;
5. call `requestEmailOtp` only for allowed alias;
6. return the same public `OTP_REQUESTED` result for allowed and absent alias.

- [ ] **Step 1: Write RED auth tests**

Cover:
- provider unavailable returns same public state for allowed and absent aliases and never reveals allowlist membership;
- provider available + allowed alias invokes OTP send once;
- provider available + absent alias does not send but returns same `OTP_REQUESTED` response;
- valid OTP + exact subject binding creates session;
- wrong/expired OTP creates no session;
- valid OTP + unbound subject/disabled Principal/ambiguous context creates no session;
- verified email mismatch fails closed;
- zero entitlement still allows valid session;
- no auto-provisioning entry point exists.

- [ ] **Step 2: Run RED**

Run: `cd apps/access && npx tsx --test tests/auth-service.test.ts`

Expected: FAIL.

- [ ] **Step 3: Implement provider-neutral service and fake provider**

Fake provider may use fixed OTP only in non-production mode and returns a preconfigured exact `issuer + subject`.

- [ ] **Step 4: Verify GREEN**

Run: `cd apps/access && npx tsx --test tests/auth-service.test.ts && npm test && npm run typecheck`

Expected: PASS.

- [ ] **Step 5: Commit**

Commit: `feat(access): add provider neutral otp flow`

---

### Task 6: Add rate limiting, same-origin guard and safe audit logging

**Files:**
- Create: `apps/access/src/ports/rate-limiter.ts`
- Create: `apps/access/src/testing/in-memory-rate-limiter.ts`
- Create: `apps/access/src/server/origin-guard.ts`
- Create: `apps/access/src/server/audit.ts`
- Modify: `apps/access/src/domain/auth-service.ts`
- Test: `apps/access/tests/security.test.ts`

**Interfaces:**

```ts
consume(input: { scope: 'OTP_REQUEST' | 'OTP_VERIFY'; keyDigest: string; now: Date }): Promise<RateLimitDecision>;
assertSameOrigin(request: Request, configuredOrigin: string): void;
digestRateLimitKey(value: string): string;
auditAccessEvent(event: SafeAccessAuditEvent): void;
```

Policy:
- OTP request: max `5` attempts / normalized-email digest / `15` minutes;
- OTP verify: max `10` attempts / normalized-email digest / `15` minutes.

- [ ] **Step 1: Write RED security tests**

Assert:
- sixth request and eleventh verification are blocked;
- window reset works;
- limiter stores only digests, not raw email;
- missing/mismatched `Origin` on mutation is rejected;
- exact configured origin passes;
- audit rejects/redacts `email`, `otp`, `token`, `cookie`, `sessionSecret` fields.

- [ ] **Step 2: Run RED**

Run: `cd apps/access && npx tsx --test tests/security.test.ts`

Expected: FAIL.

- [ ] **Step 3: Implement helpers**

In-memory limiter remains test/dev only; production config rejects it.

- [ ] **Step 4: Verify GREEN**

Run: `cd apps/access && npx tsx --test tests/security.test.ts && npm test`

Expected: PASS.

- [ ] **Step 5: Commit**

Commit: `feat(access): harden otp and mutation boundary`

---

### Task 7: Implement BFF handlers and thin Next routes

**Files:**
- Create: `apps/access/src/server/runtime.ts`
- Create: `apps/access/src/server/handlers/request-otp.ts`
- Create: `apps/access/src/server/handlers/verify-otp.ts`
- Create: `apps/access/src/server/handlers/logout.ts`
- Create: `apps/access/src/server/handlers/launch.ts`
- Create: `apps/access/app/api/auth/request-otp/route.ts`
- Create: `apps/access/app/api/auth/verify-otp/route.ts`
- Create: `apps/access/app/api/auth/logout/route.ts`
- Create: `apps/access/app/api/launch/route.ts`
- Test: `apps/access/tests/handlers.test.ts`

**Interfaces:**

`AccessRuntime` contains `config`, `identityRepository`, `sessionStore`, `rateLimiter`, `authProvider`, `applicationRegistry`.

Handlers accept `(request, runtime)`; `route.ts` files only call `getRuntime()` and delegate.

- [ ] **Step 1: Write RED handler tests**

Pin semantics:
- `POST request-otp`: valid-shaped email returns `202 OTP_REQUESTED` for both allowed and absent alias when provider is healthy;
- provider unavailable returns `503 PROVIDER_UNAVAILABLE` for both allowed and absent aliases;
- malformed email/body returns `400` without allowlist detail;
- `POST verify-otp`: valid → `204` + session cookie; invalid/expired → generic `401`; unbound/disabled/context-invalid → generic `403`;
- `POST logout`: idempotent `204`, revokes valid session and always clears cookie;
- `POST launch`: no entitlement → `403`; active entitlement + `NOT_FEDERATED` → `409 NOT_FEDERATED`; never emits `Location` in Phase 2;
- every mutation rejects mismatched Origin.

- [ ] **Step 2: Run RED**

Run: `cd apps/access && npx tsx --test tests/handlers.test.ts`

Expected: FAIL.

- [ ] **Step 3: Implement runtime modes and handlers**

Modes:
- `fake + memory`: non-production only;
- `disabled + disabled`: safe fail-closed surface;
- `supabase + supabase`: only after provider gate.

- [ ] **Step 4: Add thin Next route adapters**

No duplicated business rules in `route.ts`.

- [ ] **Step 5: Verify GREEN**

Run: `cd apps/access && npm test && npm run typecheck && npm run build`

Expected: PASS.

- [ ] **Step 6: Commit**

Commit: `feat(access): add fail closed bff routes`

---

### Task 8: Build minimal UI and Browser Certification

**Files:**
- Modify: `apps/access/app/page.tsx`
- Modify: `apps/access/app/globals.css`
- Create: `apps/access/components/access-auth-panel.tsx`
- Create: `apps/access/components/access-launcher.tsx`
- Create: `apps/access/components/access-status.tsx`
- Create: `apps/access/playwright.config.ts`
- Create: `apps/access/e2e/access.spec.ts`

**Interfaces:**
- Server page states: `SIGNED_OUT | SESSION_EXPIRED | AUTHENTICATED`.
- Client auth states: `ENTER_EMAIL | OTP_REQUESTED | OTP_VERIFY | ACCESS_DENIED | PROVIDER_UNAVAILABLE`.

- [ ] **Step 1: Write RED Playwright scenarios in fake+memory mode**

Seed fixture:
- active pre-bound Principal;
- one active INSTITUTION context;
- one active `DOCENTE_OS/USE` entitlement;
- deterministic fake OTP;
- all registry entries `NOT_FEDERATED`.

Cover:
- signed-out mobile/desktop/large viewport;
- neutral OTP confirmation;
- OTP entry and successful session;
- launcher card disabled with `Connessione non ancora disponibile`;
- zero-entitlement authenticated empty state;
- wrong OTP generic error;
- provider unavailable state;
- expired session state;
- logout and old cookie rejection;
- disabled card has no product `href`;
- axe has no serious/critical violations on signed-out, OTP and launcher states.

- [ ] **Step 2: Run RED**

Run: `cd apps/access && npx playwright test`

Expected: FAIL.

- [ ] **Step 3: Implement minimal TRAMA Access UI**

Use TRAMA visual language in a restrained shell; do not copy the Gateway cinematic hero and do not create a dashboard. `apps/gateway/src/styles/globals.css` may be consulted, but Access owns its CSS.

- [ ] **Step 4: Verify GREEN**

Run:

```bash
cd apps/access
npm test
npm run typecheck
npm run build
npx playwright test
```

Expected: PASS.

- [ ] **Step 5: Commit**

Commit: `feat(access): add minimal professional access ui`

---

### Task 9: Add permanent CI and governance invariants

**Files:**
- Create: `.github/workflows/trama-access.yml`
- Create: `scripts/validate-trama-access-phase2.mjs`
- Create: `scripts/test-trama-access-phase2-validator.mjs`
- Modify: `.github/workflows/governance.yml`

**Interfaces:**

`node scripts/validate-trama-access-phase2.mjs` exits `0` only for a compliant Phase 2 tree.

- [ ] **Step 1: Write RED adversarial validator tests**

Reject:
- token/session `localStorage` use;
- `launchTarget` with `NOT_FEDERATED`;
- Magic Link pilot flow;
- auto-provisioning in request/runtime handlers;
- Gateway routing changes in Phase 2 scope;
- fake/memory production defaults;
- TTL > `28800`;
- product/learner data model terms in Access migration except docs/tests.

- [ ] **Step 2: Run RED**

Run: `node scripts/test-trama-access-phase2-validator.mjs`

Expected: FAIL.

- [ ] **Step 3: Implement validator and `trama-access.yml`**

Workflow exact-head steps:

```text
npm ci
npm test
npm run typecheck
npm run build
npx playwright install --with-deps chromium
npx playwright test
node ../../scripts/validate-trama-access-phase2.mjs
```

Do not deploy.

- [ ] **Step 4: Hook permanent validator into Governance**

Add:
- `Validate ACCESS-01 Phase 2 runtime invariants`;
- `Test ACCESS-01 Phase 2 validator adversarial cases`.

- [ ] **Step 5: Verify GREEN locally**

Run:

```bash
node scripts/test-trama-access-phase2-validator.mjs
node scripts/validate-trama-access-phase2.mjs
cd apps/access && npm test && npm run typecheck && npm run build
```

Expected: PASS.

- [ ] **Step 6: Commit**

Commit: `ci(access): enforce phase 2 runtime invariants`

---

### Task 10: Provider preflight — read-only, no external mutation

**Files:**
- Create: `docs/evidence/access-01/access-01-phase-2-provider-preflight.md`
- Create: `docs/evidence/access-01/access-01-phase-2-threat-model.md`

**Interfaces:**
- Produces `READY_FOR_EXPLICIT_PROVIDER_AUTHORIZATION` or `BLOCKED_PROVIDER_GATE`.
- Creates no project, secret, provider user, database or deployment.

- [ ] **Step 1: Re-verify current official Supabase documentation**

Evidence must cover:
- admin pre-provisioning of email user + stable subject before first login;
- email OTP with self-signup disabled;
- a provider availability check that does not depend on a candidate email/allowlist decision;
- exact issuer/subject semantics;
- EU region choices;
- current free-tier/cost limits for one pilot principal;
- session/logout constraints;
- future OIDC discovery/JWKS and PKCE S256 compatibility;
- server-only admin credential requirements.

- [ ] **Step 2: Prove adapter portability**

Document that no domain type requires Supabase email/UUID as an authority key beyond the provider subject binding.

- [ ] **Step 3: Complete threat model**

Cover OTP interception/replay, enumeration, provider-health oracle risk, subject/email mismatch, service-role leakage, session theft/fixation, limiter persistence, provider outage, stale entitlement, accidental fake/memory production mode and future federation privilege confusion.

- [ ] **Step 4: Record gate result**

If any requirement is not demonstrable without bending the spec, record `BLOCKED_PROVIDER_GATE` and stop. Otherwise record `READY_FOR_EXPLICIT_PROVIDER_AUTHORIZATION` with exact region/cost/resource assumptions.

- [ ] **Step 5: Commit**

Commit: `docs(access): complete phase 2 provider preflight`

- [ ] **Step 6: STOP GATE**

Do not execute Task 11. Request separate explicit authorization for:
- dedicated Supabase project creation/selection;
- exact EU region;
- free-tier/cost assumption;
- provider pilot user creation;
- server-side secrets/configuration.

Plan approval or execution-mode approval does **not** satisfy this gate.

---

### Task 11: After explicit authorization — Supabase adapters, live pilot and closure

**Prerequisite:** explicit user authorization after Task 10.

**Files:**
- Create: `apps/access/src/adapters/supabase/supabase-client.ts`
- Create: `apps/access/src/adapters/supabase/supabase-identity-repository.ts`
- Create: `apps/access/src/adapters/supabase/supabase-session-store.ts`
- Create: `apps/access/src/adapters/supabase/supabase-rate-limiter.ts`
- Create: `apps/access/src/adapters/supabase/supabase-auth-provider.ts`
- Create: `apps/access/supabase/migrations/20261011_000001_access_phase2.sql`
- Create: `apps/access/scripts/provision-pilot-principal.ts`
- Create: `apps/access/tests/supabase-adapters.test.ts`
- Modify: `apps/access/src/server/runtime.ts`
- Modify: `apps/access/package.json`
- Modify: `apps/access/package-lock.json`
- Modify only with evidence: `governance/access/trama-ecosystem-state-v0.2.json`
- Create: `docs/evidence/access-01/access-01-phase-2-runtime-receipt.md`

**Interfaces:**
- Concrete adapters implement Tasks 2/3/5/6 ports unchanged.
- Provider subject stored in LoginAlias is the stable pre-provisioned subject returned by the authorized admin operation.

- [ ] **Step 1: Write RED Supabase adapter contract tests**

Assert:
- exact `issuer + subject` lookup, never email-only linking;
- session insert stores digest only;
- revocation is immediate;
- active entitlement query respects status and validity window;
- rate-limit records contain digest, not email;
- provider outage/invalid OTP map to domain errors;
- provider availability check is independent of allowlist email;
- no browser/anon client export exists from server adapter package.

- [ ] **Step 2: Run RED**

Run: `cd apps/access && npx tsx --test tests/supabase-adapters.test.ts`

Expected: FAIL.

- [ ] **Step 3: Add verified current Supabase client and server-only adapters**

No service-role value may use `NEXT_PUBLIC_`.

- [ ] **Step 4: Create dedicated Access migration**

Tables:
- `access_principal`;
- `access_login_alias`;
- `access_context`;
- `access_entitlement`;
- `access_session`;
- technical rate-limit table if required.

Enforce unique external binding and duplicate-binding rejection. Enable RLS with no public/anon policies; server-only service role is the Phase 2 data path.

- [ ] **Step 5: Implement governed provisioning CLI**

Require explicit Principal/context/entitlement input. Pre-create/bind provider subject via the currently verified admin API. Never attach an existing provider identity by email alone.

If a stable subject cannot be pre-provisioned without violating the design, stop `BLOCKED_PROVIDER_GATE`.

- [ ] **Step 6: Verify adapter GREEN**

Run:

```bash
cd apps/access
npx tsx --test tests/supabase-adapters.test.ts
npm test
npm run typecheck
npm run build
```

Expected: PASS.

- [ ] **Step 7: Apply migration and provision one pilot Principal**

Only in the explicitly authorized dedicated project/region. Do not commit secrets, OTPs or full emails.

- [ ] **Step 8: Execute live OTP smoke**

Demonstrate:

```text
pre-provisioned provider subject
→ real email OTP
→ exact issuer+subject binding
→ pre-provisioned Principal
→ one active context
→ AccessSession
→ entitlement launcher
→ local logout
```

- [ ] **Step 9: Run exact-head qualification**

Run:

```bash
node scripts/test-trama-access-phase2-validator.mjs
node scripts/validate-trama-access-phase2.mjs
cd apps/access
npm ci
npm test
npm run typecheck
npm run build
npx playwright test
```

Required GitHub PASS on same SHA: `TRAMA Access` and `Governance`.

- [ ] **Step 10: Perform Human Review**

Review mobile, desktop and large/LIM viewport for login, OTP, neutral failures, launcher, disabled cards and logout. If `REWORK`, do not promote state.

- [ ] **Step 11: Update state map conservatively**

Promote only evidence-backed runtime facts. Keep unchanged/not promoted:
- `gateway_to_trama_access`;
- Docente OS federation;
- Arena federation;
- Studio Atlas federation;
- Curricolo Atlas professional federation;
- Control Center privileged;
- learner identity.

- [ ] **Step 12: Write exact-head receipt and re-run Governance**

Receipt includes head SHA, run IDs, provider gate, Human Review, what became pilot-real and explicit `NO PRODUCT FEDERATION` / `NO GATEWAY CUTOVER`.

- [ ] **Step 13: Commit**

Commit: `docs(access): qualify phase 2 pilot runtime`

- [ ] **Step 14: Stop before merge/deploy/cutover**

Present exact-head evidence. Merge, deployment and Gateway cutover remain separate explicit decisions.

---

## Self-Review Notes

- **Spec coverage:** identity/alias (2), session (3), launcher (4), provider abstraction/OTP (5), security (6), BFF (7), UI/browser (8), CI/governance (9), provider gate (10), provider-specific runtime/live qualification (11).
- **Step scan:** every task has RED, verification and commit; Task 10 is intentionally read-only and ends in a hard external-action gate.
- **Type consistency:** `issuer + subject` is defined once in Task 2 and consumed unchanged; session digest semantics are defined once in Task 3; launch decisions are defined once in Task 4.
- **Review Focus coverage:** subject mismatch (2/5), stale session (3), enumeration/provider-health oracle (5/7/10/11), entitlement drift (4/11), production misconfiguration (1/7/9) all have explicit tests.
- **Scope:** no product federation, Gateway cutover, learner identity, global logout guarantee or governance-MFA flow is implemented.
- **Provider gate:** execution may proceed provider-neutrally through Task 10; Task 11 requires a new explicit authorization even if this plan and execution mode are approved.
