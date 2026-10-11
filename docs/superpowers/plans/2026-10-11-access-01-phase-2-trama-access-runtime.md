# ACCESS-01 Phase 2 — TRAMA Access Runtime Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** implementare il runtime minimo di TRAMA Access per il pilot professionale chiuso: OTP email, Principal pre-provisionato, contesto istituzionale unico, entitlement coarse-grained, sessione server-side opaca ≤ 8 ore e launcher fail-closed, senza federare ancora alcun prodotto.

**Architecture:** `apps/access` è una nuova applicazione Next.js 16 server-side/BFF. Il dominio dipende da porte provider-neutral per identità, sessione, storage, rate limiting e provider OTP; il browser riceve solo una sessione Access opaca. Le app di prodotto restano non federate in Phase 2: il launcher mostra solo gli entitlement attivi ma non produce navigazioni reali finché una successiva fase non qualifica la federazione.

**Tech Stack:** Node 22; Next.js 16.3.1; React 19.2.8; React DOM 19.2.8; TypeScript 5.9.2; `tsx` 4.20.6 + Node test runner per domain/server tests; Playwright 1.63.0 + `@axe-core/playwright` 4.13.0 per Browser Certification; CSS locale senza nuovo design-system dependency; Supabase client solo dopo il provider gate esplicito.

**Spec:** `docs/superpowers/specs/2026-10-11-access-01-phase-2-trama-access-runtime-design.md`

## Global Constraints

- Login pilot: **OTP email**, non Magic Link.
- Pilot chiuso con allowlist esplicita; nessuna registrazione pubblica.
- `Principal`, `LoginAlias`, binding `issuer + subject`, contesto ed entitlement sono **pre-provisionati** prima del primo login valido.
- Nessun auto-provisioning o auto-linking al primo OTP.
- Email e dominio non sono authority key e non attribuiscono permessi.
- Un solo `InstitutionalContext` attivo per Principal nel pilot; schema future-ready per multi-contesto.
- Entitlement pre-provisionati manualmente; permessi fini restano nei prodotti.
- Launcher sempre visibile dopo login valido; app entitlemented ma non federate sono visibili e non navigabili.
- `apps/access` usa BFF/server-side; nessun token provider condiviso con il browser o con altri prodotti.
- Sessione server-side con secret opaco in cookie `HttpOnly + Secure + SameSite=Lax`, TTL assoluto massimo `28800` secondi, non sliding.
- Il datastore conserva solo digest della sessione, mai il secret in chiaro.
- Nessun bearer token, OTP, session secret o JWT privilegiato negli URL o in `localStorage`.
- Gateway, Docente OS, Arena, Curricolo Atlas, Studio Atlas, Atlas learner e Control Center non ricevono sessioni Access in Phase 2.
- Nessun dato di lezioni, curricolo, materiali, classi, gruppi, draft Studio Atlas o learner entra nel datastore Access.
- Supabase Auth resta candidato: nessun progetto/provider/costo/deploy viene creato o autorizzato dall'approvazione di questo piano.
- Il task provider-live contiene un **STOP GATE** e richiede autorizzazione esplicita separata prima di creare/configurare risorse esterne.
- Nessun merge o deploy automatico; exact-head evidence e Human Review precedono qualunque integrazione.
- DOS-A1 resta `RUNTIME_DEFERRED`.
- Non cherry-pickare né fondere i rami preesistenti `docs/access-01-phase-2-trama-access-runtime-design` o `feat/access-01-phase-2-trama-access-runtime`: divergono dal design approvato. L'esecuzione parte dal branch pulito `phase/access-01-phase-2-trama-access-runtime`.

## Review Focus

1. **Account-linking ambiguity:** OTP valido con email corretta ma `issuer + subject` diverso dal binding pre-provisionato deve fallire chiuso; nessun fallback su email.
2. **Session fixation/staleness:** un cookie precedente, revocato o scaduto non deve essere riutilizzabile; la scadenza non deve slittare con l'attività.
3. **Enumeration/abuse:** richiesta OTP per alias assente, sospeso o ammesso deve mantenere risposta pubblica neutra e rate limiting equivalente.
4. **Entitlement drift:** revoca o sospensione durante una sessione valida deve riflettersi al successivo launcher/launch check senza richiedere logout globale.
5. **Misconfiguration/provider outage:** fake/memory adapter non devono poter essere usati in produzione; provider/store indisponibili devono fallire chiuso senza rompere Gateway o altre superfici pubbliche.

---

## File Structure

### Runtime application

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

### Domain and ports

- Create: `apps/access/src/domain/types.ts`
- Create: `apps/access/src/domain/email.ts`
- Create: `apps/access/src/domain/principal-service.ts`
- Create: `apps/access/src/domain/session-service.ts`
- Create: `apps/access/src/domain/launcher-service.ts`
- Create: `apps/access/src/domain/auth-service.ts`
- Create: `apps/access/src/ports/identity-repository.ts`
- Create: `apps/access/src/ports/session-store.ts`
- Create: `apps/access/src/ports/auth-provider.ts`
- Create: `apps/access/src/ports/rate-limiter.ts`

### Server/runtime boundary

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

### Test adapters

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

### Browser certification

- Create: `apps/access/playwright.config.ts`
- Create: `apps/access/e2e/access.spec.ts`

### CI/Governance

- Create: `.github/workflows/trama-access.yml`
- Create: `scripts/validate-trama-access-phase2.mjs`
- Create: `scripts/test-trama-access-phase2-validator.mjs`
- Modify: `.github/workflows/governance.yml`

### Provider-specific files — create only after STOP GATE authorization

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

### Task 1: Scaffold the Next.js BFF and fail-closed runtime configuration

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
- Produces: `loadAccessConfig(env: NodeJS.ProcessEnv): AccessConfig`.
- `AccessConfig` exposes `origin`, `providerKind`, `storeKind`, `sessionTtlSeconds`, `nodeEnv`.
- Allowed provider kinds: `disabled | fake | supabase`.
- Allowed store kinds: `memory | supabase`.
- `sessionTtlSeconds` is fixed to `28800` in Phase 2.

- [ ] **Step 1: Create the minimal package/test scaffold**

Pin the versions listed in **Tech Stack**. Scripts:

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

Run `npm install` in `apps/access` to generate `package-lock.json`.

- [ ] **Step 2: Write RED configuration tests**

`config.test.ts` must assert:
- `sessionTtlSeconds === 28800`;
- `fake` and `memory` are accepted only when `NODE_ENV !== "production"`;
- production rejects `providerKind=fake` or `storeKind=memory`;
- production with `providerKind=disabled` yields a disabled/fail-closed runtime rather than a crash;
- production `supabase` configuration requires an exact `ACCESS_ORIGIN` beginning with `https://`;
- unsupported provider/store values throw a configuration error.

- [ ] **Step 3: Run RED**

Run: `cd apps/access && npx tsx --test tests/config.test.ts`

Expected: FAIL because `loadAccessConfig` does not exist.

- [ ] **Step 4: Implement configuration and minimal Next shell**

Create:

```ts
export type AccessProviderKind = 'disabled' | 'fake' | 'supabase';
export type AccessStoreKind = 'memory' | 'supabase';

export interface AccessConfig {
  origin: string;
  providerKind: AccessProviderKind;
  storeKind: AccessStoreKind;
  sessionTtlSeconds: 28800;
  nodeEnv: string;
}

export function loadAccessConfig(env: NodeJS.ProcessEnv): AccessConfig;
```

The initial page may render only a static `TRAMA Access` shell; no auth behavior yet.

- [ ] **Step 5: Verify GREEN and build**

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

### Task 2: Implement the identity model, LoginAlias allowlist and exact subject resolution

**Files:**
- Create: `apps/access/src/domain/types.ts`
- Create: `apps/access/src/domain/email.ts`
- Create: `apps/access/src/ports/identity-repository.ts`
- Create: `apps/access/src/domain/principal-service.ts`
- Create: `apps/access/src/testing/in-memory-identity-repository.ts`
- Test: `apps/access/tests/principal-service.test.ts`

**Interfaces:**
- Produces canonical types `Principal`, `LoginAlias`, `InstitutionalContext`, `ApplicationEntitlement`, `VerifiedExternalIdentity`.
- Produces `normalizeLoginEmail(value: string): string`.
- Produces `isPilotAliasAllowed(repo, email): Promise<boolean>`.
- Produces `resolvePrincipalForVerifiedIdentity(repo, input): Promise<PrincipalResolution>`.

`IdentityRepository` must expose:

```ts
findAliasByEmail(normalizedEmail: string): Promise<LoginAlias | null>;
findAliasByExternalIdentity(identity: { issuer: string; subject: string }): Promise<LoginAlias | null>;
getPrincipal(principalId: string): Promise<Principal | null>;
listActiveContexts(principalId: string): Promise<InstitutionalContext[]>;
listEntitlements(principalId: string, contextId: string, at: Date): Promise<ApplicationEntitlement[]>;
```

- [ ] **Step 1: Write RED identity tests**

Cover:
- allowed alias returns `true` only for `ACTIVE + pilotAllowed`;
- whitespace/case normalization is accepted for lookup, but email is never the returned authority key;
- exact `issuer + subject` binding resolves the expected pre-provisioned Principal;
- same email with a different subject fails `ACCESS_DENIED`;
- bound alias with suspended/disabled Principal fails;
- zero active contexts fails;
- two active contexts fail in the pilot;
- exactly one active context succeeds;
- if provider returns a `verifiedEmail`, mismatch with the bound alias fails as a consistency check without using email as the linking key.

- [ ] **Step 2: Run RED**

Run: `cd apps/access && npx tsx --test tests/principal-service.test.ts`

Expected: FAIL on missing domain/port/service.

- [ ] **Step 3: Implement minimal identity model and resolver**

Use status enums from the spec exactly:
- Principal: `ACTIVE | SUSPENDED | DISABLED`;
- LoginAlias: `ACTIVE | DISABLED`;
- Context: `ACTIVE | SUSPENDED | DISABLED`;
- Entitlement: `ACTIVE | SUSPENDED | REVOKED`.

No function may create Principal, alias, context or entitlement.

- [ ] **Step 4: Verify GREEN**

Run:

```bash
cd apps/access
npx tsx --test tests/principal-service.test.ts
npm test
npm run typecheck
```

Expected: PASS.

- [ ] **Step 5: Commit**

Commit: `feat(access): add preprovisioned principal resolution`

---

### Task 3: Implement opaque server-side sessions with absolute expiry and immediate revocation

**Files:**
- Create: `apps/access/src/ports/session-store.ts`
- Create: `apps/access/src/domain/session-service.ts`
- Create: `apps/access/src/server/session-cookie.ts`
- Create: `apps/access/src/testing/in-memory-session-store.ts`
- Test: `apps/access/tests/session-service.test.ts`

**Interfaces:**

`SessionStore`:

```ts
create(session: AccessSessionRecord): Promise<void>;
findByDigest(sessionDigest: string): Promise<AccessSessionRecord | null>;
revoke(sessionDigest: string, at: Date): Promise<void>;
```

`session-service.ts`:

```ts
issueAccessSession(input: IssueSessionInput): Promise<{ secret: string; record: AccessSessionRecord }>;
validateAccessSession(input: ValidateSessionInput): Promise<SessionValidation>;
revokeAccessSession(input: RevokeSessionInput): Promise<void>;
sha256SessionSecret(secret: string): string;
```

Cookie name: `__Host-trama_access_session`.

- [ ] **Step 1: Write RED session tests**

Assert:
- generated secret has at least 256 bits of entropy;
- store receives only SHA-256 digest, never raw secret;
- `absoluteExpiresAt = createdAt + 28800s`;
- validation at or after expiry fails `SESSION_EXPIRED`;
- repeated validation never changes `absoluteExpiresAt`;
- revoked session fails immediately;
- Principal or context no longer `ACTIVE` invalidates the session at server validation;
- cookie serializer includes `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/`, no `Domain`, and `Max-Age=28800`;
- clear cookie expires the same cookie name at `Max-Age=0`.

- [ ] **Step 2: Run RED**

Run: `cd apps/access && npx tsx --test tests/session-service.test.ts`

Expected: FAIL.

- [ ] **Step 3: Implement session service and cookie helpers**

Use Node `crypto.randomBytes(32)` and SHA-256. Do not introduce JWT session state.

- [ ] **Step 4: Verify GREEN**

Run:

```bash
cd apps/access
npx tsx --test tests/session-service.test.ts
npm test
npm run typecheck
```

Expected: PASS.

- [ ] **Step 5: Commit**

Commit: `feat(access): add opaque bounded access sessions`

---

### Task 4: Implement the governed Application Registry and entitlement-driven launcher

**Files:**
- Create: `apps/access/src/config/application-registry.ts`
- Create: `apps/access/src/domain/launcher-service.ts`
- Test: `apps/access/tests/launcher-service.test.ts`

**Interfaces:**

```ts
export type FederationState = 'NOT_FEDERATED' | 'FEDERATION_QUALIFIED' | 'SUSPENDED';
export interface ApplicationRegistryEntry {
  applicationKey: CanonicalApplicationKey;
  displayName: string;
  federationState: FederationState;
  launchTarget?: string;
}

export function buildLauncher(input: BuildLauncherInput): Promise<LauncherCard[]>;
export function authorizeLaunch(input: AuthorizeLaunchInput): Promise<LaunchDecision>;
```

Phase 2 registry entries are all `NOT_FEDERATED` with no `launchTarget`.

- [ ] **Step 1: Write RED launcher tests**

Cover:
- zero entitlement → authenticated launcher with zero cards;
- active entitlement → exactly one corresponding card;
- suspended/revoked/expired entitlement → no launchable card;
- active entitlement + `NOT_FEDERATED` → card visible, `launchAllowed=false`, copy key `CONNECTION_NOT_AVAILABLE`;
- unknown application registry entry or missing registry entry → fail closed/no redirect;
- `authorizeLaunch` returns denied for no entitlement and `NOT_FEDERATED` for entitled-but-unfederated;
- no Phase 2 registry entry contains a product login URL.

- [ ] **Step 2: Run RED**

Run: `cd apps/access && npx tsx --test tests/launcher-service.test.ts`

Expected: FAIL.

- [ ] **Step 3: Implement registry and launcher service**

Canonical pairs remain:

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

### Task 5: Define the OTP provider port, fake provider and auth orchestration

**Files:**
- Create: `apps/access/src/ports/auth-provider.ts`
- Create: `apps/access/src/domain/auth-service.ts`
- Create: `apps/access/src/testing/fake-auth-provider.ts`
- Test: `apps/access/tests/auth-service.test.ts`

**Interfaces:**

```ts
export interface AuthProviderAdapter {
  requestEmailOtp(input: { email: string }): Promise<void>;
  verifyEmailOtp(input: { email: string; otp: string }): Promise<VerifiedExternalIdentity>;
  bestEffortLogout?(): Promise<void>;
}

export async function requestPilotOtp(input: RequestPilotOtpInput): Promise<RequestPilotOtpResult>;
export async function verifyPilotOtp(input: VerifyPilotOtpInput): Promise<VerifyPilotOtpResult>;
```

`requestPilotOtp` returns a public-neutral result irrespective of allowlist membership; provider invocation occurs only for an allowed alias.

- [ ] **Step 1: Write RED auth-service tests**

Cover:
- allowed alias invokes provider once and returns neutral `OTP_REQUESTED`;
- absent/disallowed alias does not invoke provider and returns the same public result;
- provider request failure maps to `PROVIDER_UNAVAILABLE` without leaking provider detail;
- valid OTP + exact subject binding creates a session;
- wrong OTP / expired OTP creates no session;
- valid OTP + unbound subject creates no session;
- valid OTP + disabled Principal creates no session;
- valid OTP + ambiguous context creates no session;
- provider `verifiedEmail` mismatch fails closed;
- zero entitlement still allows a valid session;
- the service exposes no method for auto-provisioning.

- [ ] **Step 2: Run RED**

Run: `cd apps/access && npx tsx --test tests/auth-service.test.ts`

Expected: FAIL.

- [ ] **Step 3: Implement provider-neutral orchestration and deterministic fake**

The fake provider may use a fixed test OTP only under non-production configuration. It must return a preconfigured exact `issuer + subject`.

- [ ] **Step 4: Verify GREEN**

Run: `cd apps/access && npx tsx --test tests/auth-service.test.ts && npm test && npm run typecheck`

Expected: PASS.

- [ ] **Step 5: Commit**

Commit: `feat(access): add provider neutral otp flow`

---

### Task 6: Add rate limiting, same-origin mutation guard and safe audit logging

**Files:**
- Create: `apps/access/src/ports/rate-limiter.ts`
- Create: `apps/access/src/testing/in-memory-rate-limiter.ts`
- Create: `apps/access/src/server/origin-guard.ts`
- Create: `apps/access/src/server/audit.ts`
- Modify: `apps/access/src/domain/auth-service.ts`
- Test: `apps/access/tests/security.test.ts`

**Interfaces:**

```ts
export interface RateLimiter {
  consume(input: { scope: 'OTP_REQUEST' | 'OTP_VERIFY'; keyDigest: string; now: Date }): Promise<RateLimitDecision>;
}

export function assertSameOrigin(request: Request, configuredOrigin: string): void;
export function digestRateLimitKey(value: string): string;
export function auditAccessEvent(event: SafeAccessAuditEvent): void;
```

Phase 2 local limits:
- OTP request: max `5` attempts per normalized-email digest per `15` minutes;
- OTP verify: max `10` attempts per normalized-email digest per `15` minutes.

No raw email is persisted in limiter keys or audit events.

- [ ] **Step 1: Write RED security tests**

Assert:
- sixth OTP request inside 15 minutes is rate-limited with the same neutral public message;
- eleventh verification attempt is rejected;
- limits reset after the window;
- raw email/OTP/session secret never appears in limiter storage;
- missing/mismatched `Origin` on state-changing production requests is rejected;
- exact origin is accepted;
- audit event types reject/log-redact fields named `email`, `otp`, `token`, `cookie`, `sessionSecret`.

- [ ] **Step 2: Run RED**

Run: `cd apps/access && npx tsx --test tests/security.test.ts`

Expected: FAIL.

- [ ] **Step 3: Implement rate limiter and security helpers**

Use SHA-256 digest of normalized email as limiter key. The in-memory implementation is test/dev-only and is blocked by production config.

- [ ] **Step 4: Verify GREEN**

Run: `cd apps/access && npx tsx --test tests/security.test.ts && npm test`

Expected: PASS.

- [ ] **Step 5: Commit**

Commit: `feat(access): harden otp and mutation boundary`

---

### Task 7: Implement BFF handlers and thin Next route adapters

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

`AccessRuntime` composes:
- `config`;
- `identityRepository`;
- `sessionStore`;
- `rateLimiter`;
- `authProvider`;
- `applicationRegistry`.

Handlers accept `(request, runtime)`; Next `route.ts` files are thin adapters that call `getRuntime()`.

- [ ] **Step 1: Write RED handler tests**

Pin response semantics:
- `POST /request-otp`: valid-shaped email returns `202 { status: "OTP_REQUESTED" }` whether allowlisted or not;
- malformed body/email returns `400` without allowlist information;
- provider unavailable returns `503 { status: "PROVIDER_UNAVAILABLE" }` only when a real allowed request reaches the provider;
- `POST /verify-otp`: valid flow returns `204` plus `Set-Cookie: __Host-trama_access_session=...`;
- invalid/expired OTP returns generic `401` with no provider detail;
- unbound subject/disabled Principal/invalid context returns generic `403 ACCESS_DENIED`;
- `POST /logout`: idempotent `204`, revokes valid session if present and always clears cookie;
- `POST /launch`: no entitlement → `403`; entitled but `NOT_FEDERATED` → `409 NOT_FEDERATED`; never emits `Location` in Phase 2;
- every POST rejects a mismatched origin.

- [ ] **Step 2: Run RED**

Run: `cd apps/access && npx tsx --test tests/handlers.test.ts`

Expected: FAIL.

- [ ] **Step 3: Implement runtime composition and handlers**

Runtime modes:
- `fake + memory`: non-production only;
- `disabled`: fail-closed signed-out/provider-unavailable surface;
- `supabase`: wired only after Task 10/11 provider gate.

- [ ] **Step 4: Add thin Next route adapters**

Each `route.ts` only obtains runtime and forwards the Request; no business rules duplicated in the route file.

- [ ] **Step 5: Verify GREEN and build**

Run:

```bash
cd apps/access
npm test
npm run typecheck
npm run build
```

Expected: PASS.

- [ ] **Step 6: Commit**

Commit: `feat(access): add fail closed bff routes`

---

### Task 8: Build the minimal TRAMA Access UI and Browser Certification fixture

**Files:**
- Modify: `apps/access/app/page.tsx`
- Modify: `apps/access/app/globals.css`
- Create: `apps/access/components/access-auth-panel.tsx`
- Create: `apps/access/components/access-launcher.tsx`
- Create: `apps/access/components/access-status.tsx`
- Create: `apps/access/playwright.config.ts`
- Create: `apps/access/e2e/access.spec.ts`

**Interfaces:**
- Page server-side state: `SIGNED_OUT | SESSION_EXPIRED | AUTHENTICATED`.
- Client auth panel local states: `ENTER_EMAIL | OTP_REQUESTED | OTP_VERIFY | ACCESS_DENIED | PROVIDER_UNAVAILABLE`.
- Launcher card fields: `applicationKey`, `displayName`, `availability`, `launchAllowed`.

- [ ] **Step 1: Write RED Playwright scenarios against `fake + memory` mode**

The fake runtime seed must contain:
- one pre-bound active Principal with one active INSTITUTION context;
- one active `DOCENTE_OS/USE` entitlement;
- deterministic fake OTP;
- all application registry entries `NOT_FEDERATED`.

Browser scenarios:
- signed-out responsive page;
- neutral OTP-request confirmation;
- OTP form and successful authentication;
- launcher card visible and disabled with copy `Connessione non ancora disponibile`;
- zero-entitlement seeded Principal shows authenticated empty state;
- wrong OTP shows generic access error;
- provider-unavailable fixture shows non-technical temporary error;
- expired session shows session-expired state;
- logout returns to signed-out and old cookie no longer authenticates;
- no disabled card has an `href` to a product;
- axe scan has no serious/critical violations on signed-out, OTP and launcher states.

- [ ] **Step 2: Run browser tests and verify RED**

Run: `cd apps/access && npx playwright test`

Expected: FAIL because UI/fixture wiring is incomplete.

- [ ] **Step 3: Implement minimal UI**

Use the established TRAMA identity as a restrained shell; do not copy the cinematic Gateway hero or create a dashboard. `apps/gateway/src/styles/globals.css` may be consulted for canonical visual language, but Access keeps its own CSS and no runtime dependency on Gateway.

- [ ] **Step 4: Verify browser and build GREEN**

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

### Task 9: Add permanent Phase 2 CI and governance invariants

**Files:**
- Create: `.github/workflows/trama-access.yml`
- Create: `scripts/validate-trama-access-phase2.mjs`
- Create: `scripts/test-trama-access-phase2-validator.mjs`
- Modify: `.github/workflows/governance.yml`

**Interfaces:**
- Validator CLI: `node scripts/validate-trama-access-phase2.mjs` exits `0` only when static Phase 2 invariants hold.

- [ ] **Step 1: Write RED validator adversarial tests**

The test must reject fixtures/diffs that introduce:
- `localStorage` token/session use in `apps/access`;
- app registry `launchTarget` while federation state is `NOT_FEDERATED`;
- Magic Link copy/flow in the pilot;
- auto-provisioning function names/paths in runtime request handlers;
- Gateway routing changes inside the Phase 2 runtime PR;
- fake/memory production defaults;
- session TTL above `28800`;
- product/learner data model terms in the Access store migration once it exists (`lesson`, `curriculum`, `curricolo`, `student`, `learner`, `class`, `group`, `studio_draft`) except explanatory docs/tests.

- [ ] **Step 2: Run RED**

Run: `node scripts/test-trama-access-phase2-validator.mjs`

Expected: FAIL until validator exists.

- [ ] **Step 3: Implement validator and CI workflow**

`trama-access.yml` must run on exact head:

```text
npm ci
npm test
npm run typecheck
npm run build
npx playwright install --with-deps chromium
npx playwright test
node ../../scripts/validate-trama-access-phase2.mjs
```

Use `working-directory: apps/access` where appropriate. Do not deploy.

- [ ] **Step 4: Hook validator into Governance**

Add permanent Governance steps:
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

### Task 10: Execute the provider gate preflight — no external mutation

**Files:**
- Create: `docs/evidence/access-01/access-01-phase-2-provider-preflight.md`
- Create: `docs/evidence/access-01/access-01-phase-2-threat-model.md`

**Interfaces:**
- Produces one explicit decision: `READY_FOR_EXPLICIT_PROVIDER_AUTHORIZATION` or `BLOCKED_PROVIDER_GATE`.
- This task creates no project, secret, external user, database or deployment.

- [ ] **Step 1: Re-verify current official Supabase documentation**

Evidence must cover current behavior for:
- admin pre-provisioning of an email user and stable subject before first login;
- email OTP with auto-signup disabled;
- exact issuer/subject semantics;
- dedicated EU project region options;
- free-tier/cost limits relevant to one pilot principal;
- session/logout constraints;
- future OAuth/OIDC discovery/JWKS and PKCE S256 compatibility for Phase 3+;
- server-only credential requirements for admin/pre-provisioning.

- [ ] **Step 2: Prove the design can remain provider-neutral**

Document the exact adapter boundary and verify no product or domain type needs a Supabase UUID/email as an authority key.

- [ ] **Step 3: Update the Phase 2 threat model**

At minimum cover:
- OTP interception/replay;
- alias enumeration;
- subject/email mismatch;
- service-role leakage;
- session theft/fixation;
- rate-limit bypass/restart behavior;
- provider outage;
- stale entitlement;
- accidental fake/memory production mode;
- future product-federation privilege confusion.

- [ ] **Step 4: Record the preflight result**

If any required property is not demonstrable without violating the spec, record `BLOCKED_PROVIDER_GATE` and stop.

If all are demonstrable, record `READY_FOR_EXPLICIT_PROVIDER_AUTHORIZATION` including region/cost assumptions and the exact external mutations that would be required next.

- [ ] **Step 5: Commit**

Commit: `docs(access): complete phase 2 provider preflight`

- [ ] **Step 6: STOP GATE**

**Do not execute Task 11.** Present the preflight to the user and request separate explicit authorization for:
- creation/selection of the dedicated Supabase project;
- exact EU region;
- any cost/free-tier assumption;
- creation of the pilot provider user;
- addition of server-side secrets/configuration.

Plan approval or implementation-mode approval does **not** satisfy this gate.

---

### Task 11: After explicit authorization only — implement Supabase adapters, schema and governed pilot provisioning

**Prerequisite:** user has explicitly authorized the external provider actions listed in Task 10.

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

**Interfaces:**
- Concrete adapters implement the ports from Tasks 2, 3, 5 and 6 only; domain services remain unchanged.
- Provider subject stored in `LoginAlias.providerSubject` is the stable pre-provisioned external subject returned by the authorized provider admin operation.

- [ ] **Step 1: Write RED adapter contract tests before adding the implementation**

Use a mocked/fake Supabase client boundary. Assert:
- exact `issuer + subject` lookup, never email-only resolution;
- session insert stores digest only;
- session revoke is immediate;
- entitlement query filters current active status and validity window;
- rate-limit records use digests, not raw email;
- adapter maps provider invalid/expired OTP and outage to domain errors;
- no browser/anon client is exported from the server adapter package.

- [ ] **Step 2: Run RED**

Run: `cd apps/access && npx tsx --test tests/supabase-adapters.test.ts`

Expected: FAIL.

- [ ] **Step 3: Add Supabase dependency and implement server-only client**

Use current compatible `@supabase/supabase-js` version verified at execution time. Credentials are loaded only server-side; no service-role value may use a `NEXT_PUBLIC_` prefix.

- [ ] **Step 4: Create the dedicated Access migration**

Tables:
- `access_principal`;
- `access_login_alias`;
- `access_context`;
- `access_entitlement`;
- `access_session`;
- technical rate-limit table only if required by the approved adapter design.

Constraints must enforce unique external binding and no duplicate active alias binding. Enable RLS with no public/anon policies; server-only service role is the runtime data path for Phase 2.

- [ ] **Step 5: Implement the governed provisioning CLI**

The CLI must require explicit principal/context/entitlement input and must pre-create or bind the provider subject using the currently verified admin API. It must never silently attach an existing provider identity by email alone.

If provider admin pre-creation cannot produce a stable subject without violating the design, stop `BLOCKED_PROVIDER_GATE` and do not weaken the resolver.

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

- [ ] **Step 7: Apply migration and provision exactly one pilot Principal**

Only against the explicitly authorized dedicated project/region. Record identifiers opaquely in evidence; do not commit secrets, OTPs or full emails.

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

Provider credentials and OTPs remain outside logs/artifacts.

- [ ] **Step 9: Commit**

Commit: `feat(access): add authorized supabase pilot adapter`

---

### Task 12: Exact-head qualification, Human Review and conservative closure

**Files:**
- Modify if evidence supports it: `governance/access/trama-ecosystem-state-v0.2.json`
- Create: `docs/evidence/access-01/access-01-phase-2-runtime-receipt.md`
- Modify if needed: `docs/evidence/access-01/access-01-phase-2-threat-model.md`

**Interfaces:**
- Produces closure receipt tied to one exact head SHA.
- State map may promote only the node/runtime facts actually demonstrated; no product federation or Gateway flow is promoted.

- [ ] **Step 1: Run the full exact-head suite**

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

Expected: PASS.

- [ ] **Step 2: Verify GitHub exact-head workflows**

Required PASS on the same SHA:
- `TRAMA Access` workflow;
- `Governance` workflow.

Do not treat previous-head success as evidence.

- [ ] **Step 3: Perform Human Review of the new Access surface**

Review at minimum mobile, desktop and LIM/large viewport for:
- signed-out login clarity;
- OTP entry clarity;
- neutral error states;
- launcher hierarchy;
- disabled/non-federated cards unmistakably non-navigable;
- logout discoverability;
- no accidental dashboard expansion;
- continuity with TRAMA identity without copying the Gateway hero.

If Human Review is `REWORK`, do not update the state map or receipt to qualified.

- [ ] **Step 4: Re-check runtime boundary and live pilot evidence**

Confirm:
- one real pre-provisioned principal completed OTP;
- issuer+subject mapping was exact;
- session TTL ≤ 8h and logout invalidation were observed;
- entitlement cards match current store state;
- no product federation occurred;
- no Gateway routing change occurred;
- no learner/product data entered Access.

- [ ] **Step 5: Update state map conservatively**

Use only enum/state values accepted by the current state-map validator. Promote `trama_access` / `professional_identity.runtimeState` only to the strongest status directly supported by the exact-head evidence. Keep unchanged/not promoted:
- `gateway_to_trama_access`;
- Docente OS federation;
- Arena federation;
- Studio Atlas federation;
- Curricolo Atlas professional federation;
- Control Center privileged;
- learner identity.

- [ ] **Step 6: Write the exact-head closure receipt**

Receipt must include:
- head SHA;
- workflow run IDs;
- provider gate status;
- Human Review decision;
- what became real/pilot-real;
- what remains designed/deferred;
- explicit `NO PRODUCT FEDERATION` and `NO GATEWAY CUTOVER` statements.

- [ ] **Step 7: Re-run Governance after state/receipt changes**

Expected: PASS on the new exact head. If SHA changed, earlier workflow evidence is no longer the closure head.

- [ ] **Step 8: Commit**

Commit: `docs(access): qualify phase 2 pilot runtime`

- [ ] **Step 9: Stop before merge/deploy/cutover**

Present exact-head evidence and Human Review result. Merge, deployment and Gateway cutover remain separate explicit decisions.

---

## Self-Review Notes

- **Spec coverage:** every approved design section has an owning task: identity/alias (2), session (3), launcher (4), provider abstraction/OTP (5), security (6), BFF (7), UI/browser (8), CI/governance (9), provider gate (10), provider-specific runtime only after authorization (11), evidence/state closure (12).
- **Type consistency:** `issuer + subject` resolution is defined once in Task 2 and consumed unchanged by Tasks 5, 7 and 11; session secret/digest semantics are defined once in Task 3; launcher decisions are defined once in Task 4.
- **Review Focus coverage:** subject mismatch (Tasks 2/5), stale sessions (3), enumeration/rate limiting (5/6/7), entitlement drift (4/12), production misconfiguration/provider outage (1/5/7/10) all have explicit tests.
- **Scope:** no product federation, Gateway cutover, learner identity, shared product data, MFA governance flow or global logout implementation is included.
- **Provider gate:** the plan is executable provider-neutrally through Task 10; Task 11 cannot begin without a new explicit authorization even if the overall plan and execution mode are approved.
