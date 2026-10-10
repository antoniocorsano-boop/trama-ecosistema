# TRAMA ACCESS-01 Ecosystem Roadmap

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement each active phase task-by-task. This document is the master roadmap; every implementation phase receives its own focused implementation plan before code changes begin.

**Goal:** Turn the existing TRAMA products and capabilities into a coherent ecosystem with one professional identity plane, privacy-first learner access, explicit governance access, and evidence-backed cross-product user flows.

**Architecture:** Preserve independent product authorities while adding the missing connective layer. The roadmap treats nodes and integrations separately: an existing product does not make its cross-product flow real. Every phase closes only when exact-head evidence proves the intended boundary and the machine-readable ecosystem state is updated.

**Tech Stack:** Existing TRAMA, Docente OS, Arena, Curricolo Atlas, Studio Atlas, Atlas learner, Control Center stacks; OAuth 2.x / OpenID Connect boundary for professional identity; existing product-local authorization/RLS; existing TRAMA governance/evidence workflows.

**Spec:** `docs/superpowers/specs/2026-10-10-trama-access-01-ecosystem-access-architecture.md`

## Global Constraints

- Canonical name: **Curricolo Atlas**. `Curriculum Atlas` is non-canonical.
- One professional TRAMA identity; product authorities remain independent.
- No personal learner account by default.
- Arena remains authority for the curricolo di istituto.
- Curricolo Atlas remains consultation/navigation/intelligibility, not curricular authority.
- Studio Atlas remains professional authoring; Atlas learner remains learner runtime.
- Gateway remains public and is not the identity provider.
- Control Center public observability remains distinct from privileged governance.
- Materials and class/group/assignment are cross-cutting capabilities, not automatically standalone apps.
- No bearer tokens, passwords, privileged JWTs, or sensitive personal context in URLs.
- No automatic merge or deploy without the applicable explicit decision.
- DOS-A1 remains `RUNTIME_DEFERRED` unless separately authorized.

## Review Focus

1. A node marked `REAL` while its runtime is unavailable must not imply that its integrations are operational.
2. Professional federation must not weaken product-local authorization or RLS.
3. Learner assignment must not silently propagate nominal class registers or create learner-wide identities.
4. Public/professional modes of Curricolo Atlas and public/privileged modes of Control Center must not cross-leak data or authority.
5. Logout/session-expiry and failed identity-provider conditions must fail closed without leaving broken public surfaces.

---

## Operating model: one roadmap, one active implementation front

This roadmap is the canonical sequence. At any moment:

- at most **one implementation phase** is `ACTIVE`;
- documentation/review may prepare the next phase, but runtime/code work does not start in parallel unless an explicit exception is recorded;
- every phase has its own branch/PR, focused plan, RED→GREEN tests, exact-head certification, human review where visual/user-facing, and state-map delta;
- a node or flow changes to `REAL` only when reproducible evidence exists;
- blockers are recorded against the phase and do not silently redefine the target architecture;
- an unrelated defect discovered mid-phase is classified: fix only if it blocks the phase, otherwise record and defer.

### Mandatory phase close packet

Every phase closes with all of:

1. implementation or documentation artifact;
2. tests and exact-head certification;
3. security/privacy evidence appropriate to the boundary;
4. human product review when the user experience changes;
5. machine-readable state update in `governance/access/trama-ecosystem-state-v0.2.json` (or its successor);
6. visual map update only after the machine-readable state changes;
7. short decision receipt recording what became `REAL`, what remains `PARTIAL/DESIGNED/DEFERRED`, and why.

---

# Roadmap

## Phase 0 — Canonical baseline and safe public Gateway

**Purpose:** Establish the persistent state baseline and ensure the public Gateway remains usable while professional entry is intentionally unavailable.

**Deliverables:**
- ACCESS-01 spec merged after human written-spec review;
- machine-readable ecosystem state baseline;
- AS-IS/TARGET state-map asset and assessment;
- Gateway public UI renders without inventing a temporary professional destination;
- when `VITE_TRAMA_ENTRY_HREF` is absent, professional entry remains fail-closed without crashing the public landing.

**Exit gate:** public Gateway visible in production; access action safely unavailable; state map and evidence match the exact deployed behavior.

**State delta expected:** Gateway runtime moves from `BLOCKED/PARTIAL` to `REAL` for the public surface; `Gateway → TRAMA Access` remains `DESIGNED`.

---

## Phase 1 — Provider-neutral professional identity contract

**Purpose:** Define the stable ecosystem identity boundary before creating an identity runtime.

**Deliverables:**
- canonical `Principal`, `InstitutionalContext`, and `ApplicationEntitlement` contracts;
- OIDC/OAuth relying-party rules;
- identity-to-local-product mapping rules;
- session/logout/failure semantics;
- threat model covering token handling, redirect validation, privilege boundaries, and provider outage;
- provider decision record: dedicated Supabase Auth candidate versus alternatives, without product data in the identity plane.

**Exit gate:** contract and threat model approved; no product is forced to share its database or authorization schema.

**State delta expected:** `Professional Identity Contract` becomes `REAL` as governance/spec evidence; identity runtime remains `DESIGNED`.

---

## Phase 2 — TRAMA Access minimal runtime

**Purpose:** Build only the missing professional entry layer: sign-in boundary, session establishment, entitlement-aware launcher, and sign-out coordination.

**Deliverables:**
- minimal TRAMA Access application/service;
- dedicated identity provider candidate configured through standard identity protocols;
- launcher driven by governed entitlements, not a hard-coded permanent app list;
- safe unauthenticated and provider-failure states;
- no curriculum, lesson, materials, Studio Atlas drafts, or learner data in the Access store.

**Exit gate:** a test principal can authenticate, receive bounded application entitlements, see the correct launcher, and sign out; unauthorized destinations fail closed.

**State delta expected:** `TRAMA Access` and professional identity runtime move from `DESIGNED` to `PARTIAL` pending a real relying application.

---

## Phase 3 — Docente OS federation pilot

**Purpose:** Prove the identity architecture against the most mature authenticated product without transferring Docente OS authority to TRAMA Access.

**Deliverables:**
- Docente OS relies on TRAMA professional identity for the pilot path;
- governed mapping from TRAMA principal to local Docente OS identity/session;
- existing workspace membership and RLS remain authoritative;
- direct unauthenticated routes, revoked entitlement, session expiry, second-user isolation, and logout are tested.

**Exit gate:** `Gateway/Access → Docente OS → local authorization → logout` works end-to-end with no regression in workspace isolation.

**State delta expected:** `TRAMA Access → Docente OS` becomes `REAL`; professional identity becomes `REAL` for the pilot scope.

---

## Phase 4 — Studio Atlas professional federation

**Purpose:** Replace the intentionally missing standalone professional-auth boundary with the canonical TRAMA identity path while preserving Studio Atlas authority.

**Deliverables:**
- Studio Atlas professional federation;
- local draft ownership/authorization semantics tied to a governed local identity mapping;
- learner preview boundary continues to exclude professional session transfer;
- remote draft persistence is treated as a separate capability and is not smuggled into the auth change unless its own plan/gate is approved.

**Exit gate:** authorized professional can enter Studio Atlas through TRAMA Access; unauthorized entry fails closed; learner preview contains no professional credentials.

**State delta expected:** `TRAMA Access → Studio Atlas` becomes `REAL`; Studio Atlas node remains `PARTIAL` if unrelated capabilities such as remote persistence/publication are still incomplete.

---

## Phase 5 — Curricolo Atlas public/professional access model

**Purpose:** Preserve the already-real public surface while adding professional context without creating a second curricular authority.

**Deliverables:**
- explicit public and professional modes;
- public mode remains login-free;
- professional mode may expose bounded links/context for planning, materials, and authoring;
- no write path can bypass Arena;
- deep-link context is opaque/bounded and resolved under destination authorization.

**Exit gate:** public use remains unchanged; professional enrichment works after federation; no professional-only data leaks publicly; no curricular mutation occurs through Curricolo Atlas.

**State delta expected:** `TRAMA Access → Curricolo Atlas professional` becomes `REAL`; `Arena → Curricolo Atlas` remains the canonical real curricular flow.

---

## Phase 6 — Arena institutional access and curricular roles

**Purpose:** Federate professional identity while keeping institutional curricular authority local to Arena.

**Deliverables:**
- TRAMA principal/institution context reaches Arena through the standard identity boundary;
- Arena owns read/edit/approve/publish permissions;
- institutional-context mismatch, entitlement revocation, and unauthorized mutation are tested;
- Curricolo Atlas access alone never grants Arena write authority.

**Exit gate:** authenticated entry and local curricular authorization are both proven independently.

**State delta expected:** `TRAMA Access → Arena` becomes `REAL` for authorized professional contexts.

---

## Phase 7 — Privacy-first assignment → Atlas learner contract

**Purpose:** Make teacher-side class/group targeting usable without creating personal learner accounts in Atlas.

**Deliverables:**
- assignment contract with minimum necessary fields;
- bounded code/ticket/link semantics, expiry and replay rules;
- no nominal class register in the default learner handoff;
- reset/deletion/retention behavior documented;
- learner flow works without email, account, or cross-experience personal profile.

**Exit gate:** a teacher can address a class/group/assignment and a learner can open the intended experience without personal Atlas identity or unauthorized disclosure.

**State delta expected:** `Classi/Gruppi/Assegnazioni → Atlas learner` becomes `REAL` for the approved bounded flow.

---

## Phase 8 — Shared Material Contract

**Purpose:** Turn materials from duplicated product-local concepts into a governed cross-product resource without creating a premature standalone app.

**Deliverables:**
- stable material identity;
- owner/workspace/governing context;
- author/origin/provenance;
- lifecycle/versioning as required;
- curricular, lesson/planning, Studio Atlas, and learner-experience references;
- sharing/presentation/export semantics;
- adapters that reference rather than copy whenever appropriate.

**Exit gate:** at least two real product surfaces consume the same governed material reference with provenance intact and no authority ambiguity.

**State delta expected:** `Material Contract ecosistemico` becomes `REAL`; relevant cross-product material flows move individually according to evidence.

---

## Phase 9 — Privileged Control Center boundary

**Purpose:** Add privileged governance access only when there are real privileged operations to protect.

**Deliverables:**
- explicit separation of public observability and privileged operations;
- dedicated governance entitlement;
- step-up/MFA for sensitive/irreversible operations;
- audit/receipt requirements;
- ordinary professional sign-in never grants governance authority.

**Exit gate:** one deliberately bounded privileged operation can be exercised only with correct entitlement + step-up and produces an auditable receipt; public Control Center remains unaffected.

**State delta expected:** `Control Center privileged` moves from `DESIGNED` to `PARTIAL/REAL` only for capabilities actually demonstrated.

---

## Phase 10 — Cross-app continuity and deep-link hardening

**Purpose:** Make the ecosystem feel continuous without turning it into a monolith.

**Deliverables:**
- bounded deep-link/context conventions;
- no bearer credentials or sensitive personal context in URLs;
- consistent return/navigation behavior;
- session expiry and logout semantics tested across federated products;
- product-local authorization re-checks every destination context.

**Exit gate:** representative user journeys cross at least three professional surfaces without re-authentication loops, token leakage, or privilege confusion.

**State delta expected:** individual integration arrows become `REAL` only where end-to-end journeys are certified.

---

## Phase 11 — Gateway cutover to canonical TRAMA Access

**Purpose:** Activate the professional entry CTA only after the destination is real and qualified.

**Deliverables:**
- certified production TRAMA Access URL;
- `VITE_TRAMA_ENTRY_HREF` points to that canonical endpoint;
- `Entra in TRAMA` / `Accedi` flows tested from real public Gateway;
- failure/recovery behavior tested if Access is unavailable;
- no temporary product URL remains as a substitute.

**Exit gate:** public Gateway → TRAMA Access → authorized application succeeds in production and the public plane remains usable if professional Access is unavailable.

**State delta expected:** `Gateway → TRAMA Access` becomes `REAL`.

---

## Phase 12 — Ecosystem qualification and roadmap close

**Purpose:** Demonstrate the target as an ecosystem, not as a set of individually green applications.

**Minimum certified journeys:**

1. Public → Gateway → Curricolo Atlas public.
2. Public → Gateway → Control Center public.
3. Professional → Gateway → TRAMA Access → Docente OS.
4. Professional → TRAMA Access → Curricolo Atlas professional → Arena governed path.
5. Professional → TRAMA Access → Studio Atlas → Atlas learner preview/publication boundary.
6. Teacher → class/group assignment → Atlas learner without personal learner account.
7. Governance operator → TRAMA Access → step-up → bounded privileged Control Center operation (if Phase 9 has an authorized runtime capability).
8. Shared material referenced across at least two real product surfaces with provenance intact.

**Exit gate:** exact-head evidence proves the intended journeys and boundaries; the state map contains no flow marked `REAL` without a retrievable evidence reference.

---

# Priority and dependency chain

Canonical sequence:

`Baseline/Gateway safety → Identity contract → TRAMA Access → Docente OS pilot → Studio Atlas → Curricolo Atlas → Arena → Assignment/Learner → Materials → Privileged Control Center → Cross-app hardening → Gateway cutover → Ecosystem qualification`

Dependencies may justify preparation work, but not parallel runtime implementation by default.

# Roadmap anti-stall rules

- Do not solve an unrelated maturity problem merely because it is discovered during the active phase.
- Do not make a provider/tool decision permanent before the contract requiring it is approved.
- Do not merge a phase with missing evidence and call it "mostly done"; keep it `PARTIAL`.
- Do not upgrade a node because its UI exists; node state and flow state are independent.
- Do not downgrade product-local authority to simplify SSO.
- Do not create learner identity to simplify assignment.
- Do not create a standalone Materials product unless a later product decision demonstrates the need.
- Do not activate privileged Control Center surfaces before there are explicit protected operations.

# Progress reporting

Every roadmap update should report only:

- active phase;
- exact head / PR;
- evidence closed;
- blockers;
- state-map delta;
- next canonical action.

This keeps local technical detail from replacing ecosystem progress as the primary measure.