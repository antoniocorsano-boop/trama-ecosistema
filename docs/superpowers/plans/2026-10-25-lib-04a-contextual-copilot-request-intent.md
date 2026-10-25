# LIB-04A Contextual Copilot Request & Intent Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** aggiungere al Contextual Copilot Core un request/intent contract condiviso che interpreti messaggi liberi soltanto entro azioni già autorizzate.

**Architecture:** `resolveRequest()` riusa integralmente `resolveActions()` come authority gate e applica `allowedCapabilities` come ulteriore restringimento. Un `IntentPort` opzionale, locale o remoto, può soltanto selezionare/ordinare action id già ammessi; failure o assenza degradano al fallback deterministico senza ampliare authority.

**Tech Stack:** Node.js >=20, ESM JavaScript, TypeScript declarations, `node:test`, Python governance tests, GitHub Actions Governance CI.

**Spec:** `docs/superpowers/specs/2026-10-25-lib-04a-contextual-copilot-request-intent-design.md`

## Global Constraints

- Baseline: `main@85a01142d90c30da9b4fbbc339a92d1457bb04b3`.
- `resolveActions()` e `dispatch()` restano backward-compatible.
- `IntentPort` è opzionale e provider-neutral.
- Intent resolution può solo restringere azioni già ammesse.
- Remote intent obeys `remoteProviderAllowed` e blocco `STUDENT_PERSONAL` / `STUDENT_SENSITIVE` prima della chiamata.
- Nessuna UI, persistenza chat, provider generativo, consumer update, merge, deploy o publish.
- Package version finale: `0.2.0`.
- Package surface invariata: `README.md`, `index.d.ts`, `package.json`, `src/index.js`.

## Review Focus

- `allowedCapabilities` contiene capability nota ma non dichiarata nel context → non deve comparire nel risultato.
- Intent Port restituisce action id inventati o score non finiti → devono essere ignorati senza contaminare il fallback.
- Intent Port remoto con autorizzazione assente/protected data → zero invocazioni e messaggio mai inoltrato.
- Intent Port tenta di mutare context/actions → nessuna authority aggiunta a questa o successive risoluzioni.
- Intent Port fallisce dopo che le policy normali hanno già filtrato le azioni → fallback deterministico sulle sole azioni autorizzate.

---

### Task 1: Public request contract and deterministic fallback

**Files:**
- Create: `shared/contextual-copilot-core/test/request-intent.test.mjs`
- Modify: `shared/contextual-copilot-core/src/index.js`
- Modify: `shared/contextual-copilot-core/index.d.ts`

**Interfaces:**
- Consumes: `ContextSnapshot`, `ResolvedAction`, `createContextualCopilotCore()`.
- Produces: `CopilotRequest`, `CopilotRequestResolution`, `IntentMatch`, `IntentPort`, `ContextualCopilotCore.resolveRequest()`.

- [ ] **Step 1: Write failing tests for request validation and fallback**

Add tests proving:
- blank `message` throws;
- unknown `allowedCapabilities` throws;
- known capabilities absent from `context.capabilities` do not widen authority;
- no Intent Port returns `UNRESOLVED / INTENT_PORT_UNAVAILABLE` with deterministic allowed actions;
- no allowed actions returns `UNRESOLVED / NO_ALLOWED_ACTIONS`.

- [ ] **Step 2: Run package tests and verify causal RED**

Run: `npm test` in `shared/contextual-copilot-core`.
Expected: FAIL because `resolveRequest` does not exist.

- [ ] **Step 3: Implement request validation and fallback**

In `src/index.js`, add internal request validation and `resolveRequest(rawRequest)` to the returned Core object. It must call the existing `resolveActions(context)`, then intersect with `allowedCapabilities`.

In `index.d.ts`, add the four public request/intent interfaces and the `resolveRequest()` method.

- [ ] **Step 4: Run package tests**

Run: `npm test`.
Expected: PASS for all legacy tests plus new Task 1 cases.

- [ ] **Step 5: Commit**

Commit message: `feat(core): add copilot request fallback contract`.

---

### Task 2: Intent Port narrowing, privacy and extension isolation

**Files:**
- Modify: `shared/contextual-copilot-core/test/request-intent.test.mjs`
- Modify: `shared/contextual-copilot-core/test/core-extension-isolation.test.mjs`
- Modify: `shared/contextual-copilot-core/src/index.js`

**Interfaces:**
- Consumes: Task 1 `resolveRequest()`, `IntentPort`, `IntentMatch`.
- Produces: local/remote intent resolution with safe fallback.

- [ ] **Step 1: Add failing local Intent Port tests**

Prove that:
- valid action-id scores select only matched allowed actions and sort by score, then priority, then id;
- unknown/non-authorized action ids and non-finite scores are ignored;
- no valid match returns `UNRESOLVED / NO_INTENT_MATCH` with deterministic fallback;
- thrown resolver returns `UNRESOLVED / INTENT_RESOLUTION_FAILED` with deterministic fallback.

- [ ] **Step 2: Add failing remote privacy tests**

Prove zero resolver calls and fallback reasons:
- `REMOTE_PROVIDER_NOT_AUTHORIZED` when remote flow is not authorized;
- `PROTECTED_DATA_REMOTE_DENIED` for `STUDENT_PERSONAL` and `STUDENT_SENSITIVE` even if remote opt-in is true.

- [ ] **Step 3: Add failing defensive-isolation test**

Intent Port attempts to mutate `context.capabilities`, `context.privacy.dataClasses` and `actions`; mutations must fail or be ineffective, and a later `resolveActions()` call must preserve original authority.

- [ ] **Step 4: Run package tests and verify causal RED**

Run: `npm test`.
Expected: FAIL only in the new intent-port behavior because Task 1 fallback does not invoke/rank through the port.

- [ ] **Step 5: Implement minimal Intent Port support**

Extend `createContextualCopilotCore()` options with `intentPort = null`.
Validate `intentPort.mode` and `intentPort.resolve` when present.
Reuse the existing remote-access rule semantics before calling a remote port.
Filter returned matches against the already-authorized action ids and finite scores.

- [ ] **Step 6: Run package tests**

Run: `npm test`.
Expected: PASS with all legacy and new request-intent tests.

- [ ] **Step 7: Commit**

Commit message: `feat(core): resolve copilot intent within authorized actions`.

---

### Task 3: Public documentation and minor version

**Files:**
- Modify: `shared/contextual-copilot-core/README.md`
- Modify: `shared/contextual-copilot-core/package.json`
- Modify: `shared/contextual-copilot-core/index.d.ts` only if declaration tests reveal drift.

**Interfaces:**
- Consumes: Task 1–2 public API.
- Produces: documented `@trama/contextual-copilot-core@0.2.0` package surface.

- [ ] **Step 1: Update README**

Document `resolveRequest`, `IntentPort`, narrowing-only semantics, remote privacy behavior and deterministic fallback.

- [ ] **Step 2: Set package version to `0.2.0`**

No dependency changes.

- [ ] **Step 3: Run package tests and pack check**

Run: `npm test && npm pack --dry-run --json`.
Expected: PASS; pack contains exactly the same four importable files.

- [ ] **Step 4: Commit**

Commit message: `docs(core): document request intent contract v0.2.0`.

---

### Task 4: Versioned offline distribution receipt

**Files:**
- Modify: `tests/test_contextual_copilot_core_distribution.py`
- Modify: `shared/contextual-copilot-core/distribution.json`

**Interfaces:**
- Consumes: exact Task 3 commit containing all four canonical package files.
- Produces: distribution v1 receipt for package `0.2.0` pointing to that exact source commit and matching SHA-256 digests.

- [ ] **Step 1: Freeze the exact source commit**

Record the Task 3 exact SHA as `EXPECTED_SOURCE_COMMIT` and set expected version `0.2.0` in the distribution test.

- [ ] **Step 2: Run distribution test and verify causal RED**

Run: `python -m unittest tests.test_contextual_copilot_core_distribution -v`.
Expected: FAIL because `distribution.json` still describes `0.1.0` / prior source commit and digests.

- [ ] **Step 3: Update `distribution.json`**

Set package version `0.2.0`, exact Task 3 source commit, and SHA-256 for `README.md`, `index.d.ts`, `package.json`, `src/index.js`. Preserve offline consumer flags and `vendored-file-package`.

- [ ] **Step 4: Run distribution and package tests**

Run: `python -m unittest tests.test_contextual_copilot_core_distribution -v && python -m unittest tests.test_contextual_copilot_core -v`.
Expected: PASS.

- [ ] **Step 5: Commit**

Commit message: `chore(core): publish v0.2.0 distribution receipt`.

---

### Task 5: Whole-repository exact-SHA qualification

**Files:**
- No product files expected.

**Interfaces:**
- Consumes: final branch head from Task 4.
- Produces: exact-SHA Governance CI evidence and reviewable Draft PR.

- [ ] **Step 1: Run/observe Governance CI on exact candidate**

Expected: full governance and test suite PASS on the branch exact SHA.

- [ ] **Step 2: Confirm package surface**

Expected: `npm pack --dry-run` remains bounded to four files.

- [ ] **Step 3: Review diff for boundary violations**

Confirm no app-specific branching, UI, consumer code, persistence, provider dependency, deploy or publish.

- [ ] **Step 4: Record candidate evidence in Draft PR**

Include TDD RED SHA/run, final exact candidate, package version/source receipt and Governance run.

- [ ] **Step 5: Stop at integration boundary**

Do not merge. Do not update `registro-docente` vendor snapshot until separate LIB-04B authorization/integration step.
