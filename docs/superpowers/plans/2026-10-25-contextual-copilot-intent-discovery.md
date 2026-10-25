# Contextual Copilot Intent Discovery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** aggiungere al Contextual Copilot Core una fase di intent discovery separata dall’autorizzazione/esecuzione, così che un intento come `PREPARE` possa essere riconosciuto localmente anche quando non è ancora eseguibile.

**Architecture:** `discoverRequestIntent()` usa il registry e le capability dichiarate per costruire un insieme di `IntentActionCandidate` non eseguibili, applica hard guard e policy `DISCOVER`, quindi delega soltanto a `IntentPort.discover?()`. `resolveActions()`, `resolveRequest()`, `IntentPort.resolve()` e `dispatch()` mantengono la semantica 0.2.0; discovery non restituisce `ResolvedAction`, non abilita provider e non dispatcha.

**Tech Stack:** Node.js >=20, ESM JavaScript, TypeScript declarations, `node:test`, Python `unittest`, package vendorizzato offline, GitHub Actions Governance CI.

**Spec:** `docs/superpowers/specs/2026-10-25-contextual-copilot-intent-discovery-design.md`

## Global Constraints

- Baseline design: `trama-ecosistema main@8c47c34048acc943a1f4a2067b29629eb880e7ef`.
- L’implementazione parte solo dopo integrazione della PR design/plan #282 oppure da una baseline `main` che contenga esattamente questi documenti approvati; non aggiungere codice al branch docs-only.
- Package corrente: `@trama/contextual-copilot-core@0.2.0`; target additivo previsto: `0.3.0`.
- `resolveActions()`, `resolveRequest()`, `IntentPort.resolve()` e `dispatch()` devono restare backward-compatible.
- `IntentPort.discover?()` è opzionale; assenza del metodo non deve essere compensata chiamando `resolve()`.
- `DISCOVER` non autorizza execution, provider, rete, consenso o mutazioni.
- `INSTITUTIONAL_DECISION` e `WRITE_EXTERNAL` non sono discoverable in questa versione.
- Un Intent Port remoto non riceve messaggio o contesto senza `remoteProviderAllowed`, né con `STUDENT_PERSONAL` / `STUDENT_SENSITIVE`.
- Il Core condiviso non importa embedding, SDK modello, tipi verticali, UI o persistenza.
- Package surface invariata: `README.md`, `index.d.ts`, `package.json`, `src/index.js`.
- Nessun consumer update, merge, deploy o publish automatico.

## Review Focus

- Azione generativa `PREPARE` con `generativeMode: 'none'` → discoverable localmente, ma ancora assente da `resolveActions()` e non dispatchabile.
- Custom policy che nega o fallisce su `phase: 'DISCOVER'` → candidato escluso/fail-closed senza contaminare `RESOLVE` o `DISPATCH`.
- Intent Port 0.2 con solo `resolve()` → `resolveRequest()` identico a prima; `discoverRequestIntent()` restituisce `INTENT_DISCOVERY_UNAVAILABLE` senza chiamare `resolve()`.
- Port remoto con contesto non autorizzato/protetto → zero chiamate a `discover()` e nessun inoltro del messaggio.
- `discover()` restituisce id inventati, duplicati o score non finiti / tenta mutazioni → output filtrato e deterministico; snapshot/candidate restano frozen e nessuna authority viene ampliata.

---

### Task 1: RED causale e contratto pubblico additivo

**Files:**
- Modify: `shared/contextual-copilot-core/test/request-intent.test.mjs`
- Modify: `shared/contextual-copilot-core/index.d.ts`
- Modify: `shared/contextual-copilot-core/src/index.js`

**Interfaces:**
- Consumes: `CopilotRequest`, `ContextualAction`, `IntentMatch`, `IntentPort`, `createContextualCopilotCore()`.
- Produces: `PolicyPhase`, `IntentActionCandidate`, `DiscoveredIntent`, `CopilotIntentDiscovery`, `IntentPort.discover?()`, `ContextualCopilotCore.discoverRequestIntent()`.

- [ ] **Step 1: Write the causal failing test**

Add one test with registry actions `review` (`REVIEW`, non-generative) and `prepare` (`PREPARE`, `requiresGenerativeAI: true`), context capabilities `REVIEW` + `PREPARE`, `generativeMode: 'none'`, and a local Intent Port whose `discover()` returns `{ actionId: 'prepare', score: 1 }`.

Assertions:
- `resolveActions()` returns only `review`;
- existing `resolveRequest()` does not expose/resolve `prepare`;
- `discoverRequestIntent()` is expected to return `{ status: 'DISCOVERED', reason: 'INTENT_DISCOVERED', intents: [{ actionId: 'prepare', capability: 'PREPARE' }] }`;
- no executor/provider path is invoked.

- [ ] **Step 2: Write failing candidate-boundary tests**

Add focused tests proving:
- a registry action whose capability is absent from `context.capabilities` never reaches `discover()`;
- `allowedCapabilities` removes an otherwise discoverable action before the port is called;
- if the intersection is empty, result is `UNRESOLVED / NO_DISCOVERABLE_ACTIONS` with `intents: []`;
- with no Intent Port, a non-empty candidate set returns `UNRESOLVED / INTENT_PORT_UNAVAILABLE`.

- [ ] **Step 3: Run the focused tests and prove RED**

Run from `shared/contextual-copilot-core`:

`node --test test/request-intent.test.mjs`

Expected: FAIL specifically because `discoverRequestIntent` / discovery contract does not exist; all pre-existing 0.2 request tests remain green.

- [ ] **Step 4: Add public declarations without changing 0.2 signatures**

In `index.d.ts`:
- define `PolicyPhase = 'DISCOVER' | 'RESOLVE' | 'DISPATCH'` and use it in `PolicyEngine.evaluate(...phase?)`;
- add `IntentActionCandidate` with the same descriptor fields as `ContextualAction` but no `policy`;
- leave `IntentPort.resolve(input.actions: readonly ResolvedAction[])` unchanged;
- add optional `IntentPort.discover(input: { context: ContextSnapshot; message: string; actions: readonly IntentActionCandidate[] }): Promise<readonly IntentMatch[]>`;
- add `DiscoveredIntent`, `CopilotIntentDiscovery` with the reasons fixed by the spec;
- add `ContextualCopilotCore.discoverRequestIntent(request: CopilotRequest): Promise<CopilotIntentDiscovery>`.

- [ ] **Step 5: Implement the minimum discovery path**

In `src/index.js`, add `discoverRequestIntent(rawRequest)` that:
- reuses `validateCopilotRequest()`;
- intersects registry actions with `context.capabilities` and `request.allowedCapabilities`;
- never calls `resolveActions()` to build the discovery set;
- rejects `INSTITUTIONAL_DECISION` and `WRITE_EXTERNAL` as hard discovery boundaries;
- evaluates remaining candidates with `phase: 'DISCOVER'`;
- returns `NO_DISCOVERABLE_ACTIONS` when empty;
- returns `INTENT_PORT_UNAVAILABLE` when no port exists;
- returns `INTENT_DISCOVERY_UNAVAILABLE` when the port exists but has no `discover` method;
- applies remote access guard before calling a remote `discover()`;
- calls only `intentPort.discover()` with defensive/frozen context and descriptors;
- filters matches through the candidate ids and finite score rule already used by request resolution;
- sorts by score desc, priority desc, id asc;
- maps matches to `{ actionId, capability }` only.

- [ ] **Step 6: Run focused package tests**

Run: `node --test test/request-intent.test.mjs`.
Expected: causal and candidate-boundary cases GREEN and every pre-existing request/resolve test unchanged and GREEN.

- [ ] **Step 7: Commit**

Commit message: `feat(core): add non-executable intent discovery contract`.

---

### Task 2: DISCOVER policy semantics and hard safety boundaries

**Files:**
- Modify: `shared/contextual-copilot-core/test/request-intent.test.mjs`
- Modify: `shared/contextual-copilot-core/test/core-boundaries.test.mjs`
- Modify: `shared/contextual-copilot-core/src/index.js`

**Interfaces:**
- Consumes: Task 1 `PolicyPhase`, `discoverRequestIntent()`, `IntentPort.discover?()`.
- Produces: default fail-closed `DISCOVER` semantics that permit local recognition of generative `PROPOSE` actions without weakening `RESOLVE`/`DISPATCH`.

- [ ] **Step 1: Add failing standard-policy phase tests**

Add tests proving that with `createFailClosedPolicyEngine({ generativeMode: 'none' })`:
- `PREPARE`/generative `PROPOSE` may pass policy only for `phase: 'DISCOVER'`;
- the same action is still denied under `RESOLVE`/`DISPATCH` with `GENERATIVE_PROVIDER_UNAVAILABLE`;
- `WRITE_EXTERNAL` remains excluded from discovery;
- `INSTITUTIONAL_DECISION` remains excluded regardless of a permissive custom policy.

- [ ] **Step 2: Add custom policy observability test**

Use a policy engine that records `phase` and returns denied for one candidate only when `phase === 'DISCOVER'`. Assert the candidate is absent and that the policy actually received `DISCOVER`.

- [ ] **Step 3: Add policy-failure fail-closed test**

Use a custom policy that throws only for `phase === 'DISCOVER'`. Assert the failed candidate is not sent to the Intent Port; if it was the sole candidate, return `NO_DISCOVERABLE_ACTIONS`. Verify existing `RESOLVE`/`DISPATCH` tests preserve their previous behavior.

- [ ] **Step 4: Run focused tests and verify RED**

Run: `node --test test/request-intent.test.mjs test/core-boundaries.test.mjs`.
Expected: FAIL because the current fail-closed engine ignores `phase` and current core generative guard applies execution availability before any discovery-specific semantics.

- [ ] **Step 5: Implement phase-aware default policy**

Change `createFailClosedPolicyEngine().evaluate` to accept `phase = 'RESOLVE'`.
For `DISCOVER` only:
- preserve capability and risk checks;
- preserve `WRITE_EXTERNAL` denial in this version;
- skip generative runtime availability checks because no generation/execution occurs.
For `RESOLVE` and `DISPATCH`, preserve exact 0.2 behavior.

Keep the existing execution guard path (`coreGenerativePrivacyGuard`) untouched for normal resolution and dispatch; discovery must use its own evaluation path rather than weakening that guard globally. Policy exceptions during discovery exclude that candidate fail-closed.

- [ ] **Step 6: Run focused tests**

Run: `node --test test/request-intent.test.mjs test/core-boundaries.test.mjs`.
Expected: PASS.

- [ ] **Step 7: Commit**

Commit message: `feat(core): separate discovery policy from execution availability`.

---

### Task 3: Privacy, compatibility and extension isolation

**Files:**
- Modify: `shared/contextual-copilot-core/test/request-intent.test.mjs`
- Modify: `shared/contextual-copilot-core/test/core-extension-isolation.test.mjs`
- Modify: `shared/contextual-copilot-core/src/index.js` only if tests expose missing guards.

**Interfaces:**
- Consumes: Task 1–2 discovery API.
- Produces: proof that discovery is fail-closed, immutable and backward-compatible with IntentPort 0.2.

- [ ] **Step 1: Add remote privacy tests**

Assert zero `discover()` calls and exact reasons:
- remote port + `remoteProviderAllowed: false` → `REMOTE_PROVIDER_NOT_AUTHORIZED`;
- remote port + `STUDENT_PERSONAL` or `STUDENT_SENSITIVE` → `PROTECTED_DATA_REMOTE_DENIED` even when remote is opted in;
- local port may discover with `remoteProviderAllowed: false`.

- [ ] **Step 2: Add 0.2 compatibility test**

Create a local port with required `resolve()` but no `discover()`.
Assert:
- existing `resolveRequest()` behavior is identical to current 0.2 expectations;
- `discoverRequestIntent()` returns `UNRESOLVED / INTENT_DISCOVERY_UNAVAILABLE` with empty `intents`;
- `resolve()` call count is unchanged by discovery.

- [ ] **Step 3: Add match sanitization tests**

`discover()` returns allowed id, invented id, duplicated id with lower/higher score, non-finite score and an id filtered out by `allowedCapabilities`.
Assert output contains only the best finite match per discoverable action in deterministic order and never exposes scores. When no valid finite match survives, assert `UNRESOLVED / NO_INTENT_MATCH` with `intents: []`.

- [ ] **Step 4: Add discovery-runtime failure test**

Make `discover()` throw. Assert `UNRESOLVED / INTENT_DISCOVERY_FAILED`, `intents: []`, no fallback to `resolve()`, and no mutation/execution.

- [ ] **Step 5: Add defensive-isolation test**

Inside `discover()` assert mutation attempts against `context.capabilities`, `context.privacy`, candidate array and candidate objects throw or are ineffective. Then prove a later `resolveActions()` / `dispatch()` call has unchanged authority.

- [ ] **Step 6: Run package suite**

Run from `shared/contextual-copilot-core`: `npm test`.
Expected: all request, core-boundary, extension-isolation and legacy tests PASS with `# fail 0`.

- [ ] **Step 7: Commit**

Commit message: `test(core): harden intent discovery privacy and compatibility`.

---

### Task 4: Public documentation and package 0.3.0

**Files:**
- Modify: `shared/contextual-copilot-core/README.md`
- Modify: `shared/contextual-copilot-core/package.json`
- Verify: `shared/contextual-copilot-core/index.d.ts`

**Interfaces:**
- Consumes: final Task 1–3 public API.
- Produces: documented `@trama/contextual-copilot-core@0.3.0` with unchanged importable file set.

- [ ] **Step 1: Document the authority distinction**

README must state explicitly:
- `resolveRequest()` = interpretation within currently authorized actions;
- `discoverRequestIntent()` = recognition only, not availability or execution;
- `DISCOVERED` must never be treated as `allowed`;
- remote discovery privacy rules;
- `IntentPort.discover?()` optional and `resolve()` unchanged.

- [ ] **Step 2: Set package version `0.3.0`**

Modify only the version in `package.json`; no new dependency.

- [ ] **Step 3: Verify package and declarations**

Run in package directory: `npm test && npm pack --dry-run --json`.
Expected: PASS; pack contains exactly `README.md`, `index.d.ts`, `package.json`, `src/index.js`.

- [ ] **Step 4: Commit and freeze source SHA**

Commit message: `docs(core): document intent discovery v0.3.0`.
Record this exact commit as the source commit consumed by Task 5; do not change any of the four canonical package files after freezing it without regenerating the receipt.

---

### Task 5: Offline distribution receipt v0.3.0

**Files:**
- Modify: `tests/test_contextual_copilot_core_distribution.py`
- Modify: `shared/contextual-copilot-core/distribution.json`

**Interfaces:**
- Consumes: frozen Task 4 source SHA and the four canonical package files.
- Produces: reproducible v1 distribution receipt for `0.3.0`.

- [ ] **Step 1: Update the distribution test first**

Set expected package version to `0.3.0` and `EXPECTED_SOURCE_COMMIT` to the frozen Task 4 SHA.

- [ ] **Step 2: Run test and verify receipt RED**

Run from repository root: `python3 -m unittest tests.test_contextual_copilot_core_distribution -v`.
Expected: FAIL because `distribution.json` still points to `0.2.0` / prior source commit/digests.

- [ ] **Step 3: Regenerate the receipt values**

Update `distribution.json` with:
- version `0.3.0`;
- exact frozen source SHA;
- SHA-256 of `README.md`, `index.d.ts`, `package.json`, `src/index.js`;
- unchanged `consumerMode: vendored-file-package`, `networkRequiredAtBuild: false`, `externalRegistryRequired: false`.

- [ ] **Step 4: Run receipt + cross-app package tests**

Run: `python3 -m unittest tests.test_contextual_copilot_core_distribution tests.test_contextual_copilot_core -v`.
Expected: PASS.

- [ ] **Step 5: Commit**

Commit message: `chore(core): record v0.3.0 distribution receipt`.

---

### Task 6: Whole-branch qualification and integration stop

**Files:**
- No new product files expected.

**Interfaces:**
- Consumes: final Task 5 branch head.
- Produces: exact-SHA evidence for a Draft implementation PR, with no downstream consumer change.

- [ ] **Step 1: Run local/high-signal verification**

From repository root run:
- `python3 -m unittest tests.test_contextual_copilot_core tests.test_contextual_copilot_core_distribution -v`;
- package `npm test`;
- package `npm pack --dry-run --json`.

Expected: all PASS and four-file package surface.

- [ ] **Step 2: Open/maintain a separate Draft implementation PR**

Implementation branch name: `feat/contextual-copilot-intent-discovery-v0.3` from the post-design `main` baseline. Do not turn docs-only PR #282 into the implementation PR.

- [ ] **Step 3: Qualify exact candidate in Governance CI**

Observe the `Governance` pull-request workflow on the exact implementation head. It runs repository governance validators and `python3 -m unittest discover -s tests -v`; require SUCCESS on the same SHA.

- [ ] **Step 4: Independent review**

Review specifically for:
- any changed 0.2 semantics in `resolveActions`, `resolveRequest`, `dispatch`, `IntentPort.resolve`;
- discovery output accidentally carrying policy/score/executor authority;
- provider/model/app-specific coupling;
- remote message leakage before access guards;
- receipt/source SHA mismatch.

No Important/Critical unresolved finding may remain.

- [ ] **Step 5: Record evidence in PR**

Include causal RED SHA/run, per-task GREEN evidence, frozen source SHA, receipt commit, final exact candidate and Governance run.

- [ ] **Step 6: Stop**

Do not merge. Do not vendor 0.3.0 into `registro-docente`. Do not create the embedding IntentPort yet. Surface one human integration decision for the qualified Core.
