# ACCESS-01 Phase 1 — Professional Identity Contract Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** qualificare un contratto provider-neutral per l'identità professionale TRAMA, con semantics di principal, contesto istituzionale, entitlement applicativi, federazione OIDC, mapping verso identità locali, session/logout/failure e threat model, senza creare ancora un runtime di autenticazione.

**Architecture:** Phase 1 produce un artefatto normativo machine-readable sotto `governance/access/`, validato in CI da un validator dependency-free e accompagnato da threat model e decision record sul provider candidato. Le app restano autorità dei propri permessi fini; il piano identitario espone soltanto identità professionale, contesto minimo ed entitlement coarse-grained. Nessun database di prodotto, account learner o runtime IdP viene introdotto.

**Tech Stack:** JSON / JSON Schema, Node.js 22 ESM validator dependency-free, GitHub Actions Governance, Markdown evidence/decision records.

**Spec:** `docs/superpowers/specs/2026-10-10-trama-access-01-ecosystem-access-architecture-design.md`

## Global Constraints

- Nome canonico: **Curricolo Atlas**.
- Una identità professionale TRAMA; autorità di prodotto indipendenti.
- Nessun account personale learner per impostazione predefinita.
- Arena resta autorità sul curricolo di istituto.
- Gateway resta pubblico e non è identity provider.
- TRAMA Access non possiede permessi fini dei prodotti.
- Nessun bearer token, password, JWT privilegiato o contesto personale sensibile negli URL.
- Nessun token condiviso via `localStorage`.
- Email e metadati mutabili non sono input autorevoli di autorizzazione o account linking.
- Gli UUID locali dei prodotti non devono coincidere con il principal TRAMA.
- Il provider è sostituibile dietro OAuth 2.x / OpenID Connect.
- Nessun provider/project/runtime viene creato in Phase 1.
- Nessun dato di prodotto entra nel piano identitario.
- Nessun merge o deploy automatico senza decisione esplicita applicabile.
- DOS-A1 resta `RUNTIME_DEFERRED`.

## Review Focus

1. **Account linking ambiguo:** due identità con stessa email non devono convergere nello stesso principal o local binding; il validator deve vietare email come chiave autorevole.
2. **Issuer/audience confusion:** issuer wildcard, audience mancante o callback non allowlisted devono essere rifiutati.
3. **Revoca/expiry:** una sessione locale non deve acquisire o mantenere nuovi privilegi oltre la finestra di revalidation prevista dal contratto.
4. **Provider outage/logout:** nuove autenticazioni devono fail-closed senza abbattere le superfici pubbliche; il logout locale deve riuscire anche se il provider non risponde.
5. **Confine learner/governance:** il contratto professionale non deve introdurre identità learner e `GOVERNANCE_OPERATOR` non deve equivalere da solo ad authority operativa senza step-up previsto dalle fasi successive.

---

## File structure

- Create: `governance/access/trama-professional-identity-contract.v1.schema.json` — schema normativo del contratto.
- Create: `governance/access/trama-professional-identity-contract.v1.json` — istanza canonica provider-neutral.
- Create: `scripts/validate-trama-professional-identity-contract.mjs` — validator dependency-free.
- Create: `scripts/test-trama-professional-identity-contract-validator.mjs` — negative/adversarial contract tests.
- Create: `docs/contracts/TRAMA-PROFESSIONAL-IDENTITY-01.md` — lettura umana del contratto e semantics normative.
- Create: `governance/access/trama-professional-identity-threat-model.v1.json` — threat register machine-readable.
- Create: `docs/evidence/access-01/access-01-phase-1-professional-identity-threat-model.md` — threat model leggibile e mapping threat→control→verification.
- Create: `docs/evidence/access-01/access-01-phase-1-provider-candidate-decision.md` — decision record `CANDIDATE_ONLY / NOT_RUNTIME_AUTHORIZED`.
- Modify: `.github/workflows/governance.yml` — exact-head validation hook.
- Modify only at close: `governance/access/trama-ecosystem-state-v0.2.json` — evidence-backed Phase 1 delta.
- Create only at close: `docs/evidence/access-01/access-01-phase-1-professional-identity-receipt.md` — closure receipt.

---

### Task 1: Define the provider-neutral professional identity contract

**Files:**
- Create: `governance/access/trama-professional-identity-contract.v1.schema.json`
- Create: `governance/access/trama-professional-identity-contract.v1.json`
- Create: `docs/contracts/TRAMA-PROFESSIONAL-IDENTITY-01.md`
- Test: `scripts/test-trama-professional-identity-contract-validator.mjs` (initial RED fixture expectations)

**Interfaces:**
- Consumes: ACCESS-01 sections 3, 7, 8, 15, 16, 17 and 19.
- Produces: contract id `TRAMA-PROFESSIONAL-IDENTITY-01`, version `1.0.0`, and normative sections `principal`, `institutionalContext`, `applicationEntitlement`, `localIdentityBinding`, `oidcRelyingParty`, `session`, `logout`, `failureModes`, `forbiddenPatterns`.

- [ ] **Step 1: Write RED assertions for required contract semantics**

The test must assert at minimum:
- contract id/version are exact;
- principal identity is derived from exact `issuer + subject` and not email;
- context types are exactly `PERSONAL` and `INSTITUTION`;
- `INSTITUTION` requires an opaque `institutionRef`; context alone grants no product permission;
- application entitlements are coarse-grained and limited to the canonical applications/capabilities below;
- local mapping is server-side `(principalId, application) -> localSubjectRef` and does not require matching UUIDs;
- learner identity is absent from the contract.

Canonical coarse entitlements for v1:

```text
DOCENTE_OS      USE
CURRICOLO_ATLAS READ
STUDIO_ATLAS    AUTHOR
ARENA           ENTER
CONTROL_CENTER  GOVERNANCE_OPERATOR
```

- [ ] **Step 2: Run the test and verify RED**

Run: `node scripts/test-trama-professional-identity-contract-validator.mjs`

Expected: FAIL because the canonical contract/schema/validator do not exist yet.

- [ ] **Step 3: Create schema and canonical instance**

Pin these provider-neutral OIDC semantics in the instance:
- authorization code flow + PKCE `S256`;
- exact allowlisted issuer;
- exact audience/client binding;
- `state` required;
- OIDC `nonce` required where an ID token is consumed;
- redirect URIs exact-allowlisted, no wildcard redirects;
- tokens never transported in application URLs or stored in shared `localStorage`;
- local app session established only after verified assertion and local authorization mapping.

- [ ] **Step 4: Write the human-readable normative contract**

`docs/contracts/TRAMA-PROFESSIONAL-IDENTITY-01.md` must explain the same fields without adding authority not present in the JSON contract.

- [ ] **Step 5: Run the contract test**

Run: `node scripts/test-trama-professional-identity-contract-validator.mjs`

Expected at this stage: structural assertions may pass; validator-specific adversarial assertions remain RED until Task 2.

- [ ] **Step 6: Commit**

Commit message: `feat(access): define professional identity contract v1`

---

### Task 2: Implement fail-closed validation and adversarial cases

**Files:**
- Create: `scripts/validate-trama-professional-identity-contract.mjs`
- Complete: `scripts/test-trama-professional-identity-contract-validator.mjs`

**Interfaces:**
- Consumes: canonical contract/schema from Task 1.
- Produces: CLI validator with exit `0` only for the canonical valid contract and non-zero for contract violations.

- [ ] **Step 1: Add negative fixtures in-memory to the validator test**

The test suite must independently reject:
- email as `principalKey` or local binding key;
- wildcard issuer/audience/redirect URI;
- implicit/hybrid flow in place of authorization-code + PKCE;
- missing `state` or required `nonce`;
- bearer/JWT transport in query/hash URLs;
- shared cross-product UUID as a requirement;
- product-fine permission such as `ARENA_APPROVE` in central entitlements;
- unknown application/capability pair;
- learner/student account/profile claim in the professional contract;
- `CONTROL_CENTER/GOVERNANCE_OPERATOR` declared as sufficient for irreversible action without separate step-up boundary;
- provider outage behavior that turns the public Gateway unavailable.

- [ ] **Step 2: Run adversarial tests and verify RED**

Run: `node scripts/test-trama-professional-identity-contract-validator.mjs`

Expected: FAIL on the first unimplemented rejection rule.

- [ ] **Step 3: Implement the dependency-free validator**

Signature/CLI behavior:

```text
node scripts/validate-trama-professional-identity-contract.mjs [contractPath]
```

Default path: `governance/access/trama-professional-identity-contract.v1.json`.

The validator must fail closed on malformed JSON, missing required sections, unsupported enum values and every adversarial condition above.

- [ ] **Step 4: Verify GREEN**

Run:

```bash
node scripts/test-trama-professional-identity-contract-validator.mjs
node scripts/validate-trama-professional-identity-contract.mjs
```

Expected: all adversarial cases PASS and canonical instance validates.

- [ ] **Step 5: Commit**

Commit message: `test(access): qualify professional identity contract`

---

### Task 3: Threat model session, redirect, token and privilege boundaries

**Files:**
- Create: `governance/access/trama-professional-identity-threat-model.v1.json`
- Create: `docs/evidence/access-01/access-01-phase-1-professional-identity-threat-model.md`
- Modify: `scripts/test-trama-professional-identity-contract-validator.mjs`

**Interfaces:**
- Consumes: contract controls from Tasks 1–2.
- Produces: threat IDs with explicit asset, attack/failure, control, residual risk, and verification reference.

- [ ] **Step 1: Add RED assertions for required threat coverage**

Required threat classes:

```text
T01 token leakage / URL exposure
T02 authorization-code interception / missing PKCE
T03 redirect injection / open redirect
T04 login CSRF / state mismatch
T05 nonce or assertion replay
T06 issuer/audience confusion / confused deputy
T07 account linking takeover via email or mutable metadata
T08 entitlement escalation / cross-product authority leak
T09 provider outage and unavailable discovery/JWKS/login
T10 incomplete logout / stale local session
T11 governance step-up bypass
T12 learner boundary contamination
```

- [ ] **Step 2: Run tests and verify RED**

Run: `node scripts/test-trama-professional-identity-contract-validator.mjs`

Expected: FAIL because the threat register is absent/incomplete.

- [ ] **Step 3: Create machine-readable threat register and human-readable model**

Session/failure semantics must include:
- new professional sign-in fails closed when provider verification is unavailable;
- public Gateway/Curricolo Atlas public/Control Center public are not taken down by identity-provider outage;
- an existing local product session may continue only under its own bounded expiry policy and may not gain new privilege without successful revalidation;
- local logout always terminates local session independently of provider availability;
- coordinated/global logout is best-effort only where the chosen provider/protocol supports it and must not be faked;
- entitlement revocation takes effect no later than the next governed entitlement/session revalidation boundary; privileged governance work remains reserved for later step-up design.

- [ ] **Step 4: Verify threat coverage GREEN**

Run: `node scripts/test-trama-professional-identity-contract-validator.mjs`

Expected: PASS for required threat IDs and control mappings.

- [ ] **Step 5: Commit**

Commit message: `docs(access): add professional identity threat model`

---

### Task 4: Record a provider candidate without authorizing runtime

**Files:**
- Create: `docs/evidence/access-01/access-01-phase-1-provider-candidate-decision.md`

**Interfaces:**
- Consumes: provider-neutral contract and threat model.
- Produces: one candidate decision with status `CANDIDATE_ONLY / NOT_RUNTIME_AUTHORIZED`, explicit gaps and no project/account mutation.

- [ ] **Step 1: Research current official provider documentation**

Evaluate at least the dedicated Supabase Auth option already contemplated by ACCESS-01 and one standards-based alternative only as needed to test portability. Use current official documentation, not cached assumptions.

Evaluation criteria:
- OAuth 2.x / OpenID Connect compatibility for the relying-party/federation boundary actually needed by TRAMA;
- authorization-code + PKCE support;
- exact redirect controls;
- MFA/step-up capability or a clear later integration path;
- logout/session semantics;
- issuer/JWKS/audience verification model;
- EU-region/data residency options relevant to deployment;
- exportability/portability and avoidance of product-database coupling;
- cost/project creation implications reserved for Phase 2.

- [ ] **Step 2: Write the decision record**

The record must contain:
- candidate;
- evidence date and official-source references;
- why it satisfies or fails each criterion;
- open gaps;
- exit strategy;
- explicit `NO PROJECT CREATED`, `NO COST AUTHORIZED`, `NOT_RUNTIME_AUTHORIZED`.

- [ ] **Step 3: Cross-check against contract invariants**

No provider-specific field may become required by `TRAMA-PROFESSIONAL-IDENTITY-01` unless it maps cleanly to the provider-neutral protocol semantics.

- [ ] **Step 4: Commit**

Commit message: `docs(access): record identity provider candidate`

---

### Task 5: Wire Governance, qualify exact head, and close Phase 1 evidence

**Files:**
- Modify: `.github/workflows/governance.yml`
- Modify: `governance/access/trama-ecosystem-state-v0.2.json`
- Create: `docs/evidence/access-01/access-01-phase-1-professional-identity-receipt.md`

**Interfaces:**
- Consumes: Tasks 1–4.
- Produces: exact-head evidence and an evidence-backed state delta only after all gates are PASS.

- [ ] **Step 1: Add Governance steps**

Add:

```text
Validate ACCESS-01 professional identity contract
Test ACCESS-01 professional identity contract adversarial cases
```

Commands:

```bash
node scripts/validate-trama-professional-identity-contract.mjs
node scripts/test-trama-professional-identity-contract-validator.mjs
```

- [ ] **Step 2: Run local/CI-equivalent validation before state promotion**

Run:

```bash
node scripts/validate-trama-professional-identity-contract.mjs
node scripts/test-trama-professional-identity-contract-validator.mjs
python3 scripts/validate_governance.py
python3 scripts/validate_curricolo_vocabulary.py --base HEAD^
```

Expected: all PASS.

- [ ] **Step 3: Update state map conservatively**

Do **not** mark SSO/runtime `REAL`.

Update only the `professional_identity` note/evidence to state that the provider-neutral contract and threat model are qualified while runtime remains `DESIGNED`. If the state schema cannot represent this distinction without lying, leave `state: DESIGNED` and attach an evidence block/contractStatus field rather than promoting the node.

- [ ] **Step 4: Create closure receipt**

The receipt must state explicitly:
- contract/threat model = qualified;
- provider record = candidate only;
- `professional_identity` runtime = still `DESIGNED`;
- `trama_access` runtime = still `DESIGNED`;
- no app federation demonstrated;
- no learner identity introduced;
- no provider/project/cost created.

- [ ] **Step 5: Exact-head CI and independent review**

Require Governance PASS on the exact head. Request one independent code/governance review focused on security boundary, provider neutrality, product authority leakage, and consistency between JSON contract, threat model and decision record.

- [ ] **Step 6: Human decision gate**

No merge until the exact-head contract evidence and independent review are clean and the user approves Phase 1 closure.

---

## Self-review checklist

- Spec coverage: Phase 1 roadmap deliverables are mapped one-to-one to Tasks 1–5.
- Scope: no Phase 2 runtime, provider project, OAuth callback, database or user migration is included.
- Type/term consistency: `Principal`, `InstitutionalContext`, `ApplicationEntitlement`, `localIdentityBinding` and canonical app names are stable across tasks.
- Review Focus coverage: each of the five focus areas has an explicit adversarial test or threat-model requirement.
- State integrity: Phase 1 cannot turn professional SSO/runtime `REAL`; only the contract qualification may become evidence-backed.
- Terminology: **Curricolo Atlas** / **curricolo di istituto** only.
