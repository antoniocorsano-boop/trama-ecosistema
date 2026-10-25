# Contextual Copilot Embedding Intent Adapter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** creare `@trama/contextual-copilot-intent-embedding@0.1.0`, un adapter condiviso, stateless, provider-neutral e local-only che implementi il contratto `IntentPort` del Contextual Copilot Core 0.3 tramite embedding iniettati dal consumer.

**Architecture:** il package riceve `embed(text)` e un catalogo consumer-owned di esempi per action id, restringe il catalogo esclusivamente alle action ricevute dal Core e usa cosine similarity best-example con threshold e ambiguity margin. Il package restituisce soltanto `IntentMatch[]`, non amplia authority e non conosce provider, rete, persistenza, Registro Docente o altri verticali; il Core 0.3 resta invariato e continua a distinguere no-match da failure tecnica.

**Tech Stack:** Node.js >=20, ESM JavaScript, TypeScript declarations, `node:test`, Python `unittest`, package vendorizzato offline, SHA-256 distribution receipt, GitHub Actions Governance CI.

**Spec:** `docs/superpowers/specs/2026-10-25-contextual-copilot-embedding-intent-adapter-design.md`

## Global Constraints

- Design baseline: `trama-ecosistema main@f5549b8a9cbbcd40752f8aa85183b3db23faf0ce`.
- Design approved on PR #284; implementation starts only after the approved design/plan is integrated into `main`, or from a `main` baseline containing these exact approved documents.
- Do not add implementation code to PR #284; the implementation branch is `feat/contextual-copilot-intent-embedding-v0.1` with a separate Draft PR.
- Package: `@trama/contextual-copilot-intent-embedding@0.1.0` under `shared/contextual-copilot-intent-embedding/`.
- Core contract remains canonical in `@trama/contextual-copilot-core@^0.3.0`; do not duplicate `IntentPort`, `IntentMatch`, `ResolvedAction` or `IntentActionCandidate` types.
- Use a type-only peer dependency on the Core; runtime source must contain no import from the Core.
- Public factory: `createEmbeddingIntentPort(options): IntentPort` with `mode: 'local'`, `resolve()` and `discover()`.
- Public input types: `IntentEmbeddingFunction`, `IntentExampleSet`, `EmbeddingIntentPortOptions` exactly as approved in the spec.
- Default `minSimilarity`: `0.75`.
- Default `minMargin`: `0.08`.
- `minSimilarity` must be finite and within `[-1, 1]`; `minMargin` must be finite and within `[0, 2]`.
- Catalog action ids must be non-empty; duplicate action ids are rejected at construction.
- Each action must contain at least one non-empty example after whitespace normalization; examples are normalized only with `trim()` plus internal whitespace collapse.
- Catalog is defensively snapshotted at construction; later consumer mutation must not change an existing port.
- Message blank/whitespace-only, empty action set, or no catalog entries matching the supplied action ids return `[]` without calling `embed()`.
- Only action ids supplied to the current `resolve()` / `discover()` call may be embedded or returned.
- Ranking is best-example cosine similarity per action; all surviving action matches are returned sorted by score desc then action id asc.
- Scores below `minSimilarity` are discarded.
- If at least two actions survive and `topScore - secondScore < minMargin`, return `[]`; equality with `minMargin` is not ambiguous.
- Embedding failure, non-array/empty vectors, non-finite components, dimension mismatch or zero norm are technical failures and must throw; never convert them to `[]`.
- Runtime package contains no `fetch`, URL, endpoint, API key, provider SDK, remote fallback, telemetry, persistence, RAG, vector index, keyword parser or vertical action catalog.
- No change to `shared/contextual-copilot-core/` is authorized by this plan.
- No Registro Docente or Docente OS consumer wiring in this implementation PR.
- No merge, deploy, publish or downstream vendoring without a separate human decision.

## File Structure

Implementation branch creates only the new shared package plus repository-level qualification tests:

- `shared/contextual-copilot-intent-embedding/package.json` — package metadata, exports, peer dependency, test command.
- `shared/contextual-copilot-intent-embedding/index.d.ts` — public type-only API bound to Core `IntentPort`.
- `shared/contextual-copilot-intent-embedding/src/index.js` — catalog validation, vector validation, cosine ranking, port factory.
- `shared/contextual-copilot-intent-embedding/test/intent-embedding.test.mjs` — package contract and ranking tests.
- `shared/contextual-copilot-intent-embedding/test/core-conformance.test.mjs` — exact Core 0.3 conformance without modifying Core.
- `shared/contextual-copilot-intent-embedding/README.md` — public contract, authority boundary and downstream obligations.
- `shared/contextual-copilot-intent-embedding/distribution.json` — immutable distribution receipt generated after source freeze.
- `tests/test_contextual_copilot_intent_embedding.py` — repository gate for package tests, bounded pack surface and runtime boundary.
- `tests/test_contextual_copilot_intent_embedding_distribution.py` — exact source SHA and SHA-256 receipt verification.

## Review Focus

- Consumer mutates the original catalog or example arrays after factory creation → existing port behavior remains unchanged because the catalog was snapshotted.
- Catalog contains actions not present in the current Core input → those entries are never embedded and can never appear in output.
- An embedding batch is partially valid but one vector is empty, non-finite, zero-norm or wrong-dimensional → the entire call rejects; no partial semantic match escapes as success.
- Top two scores differ by exactly `minMargin` → classification is allowed; only `delta < minMargin` degrades to `[]`.
- Blank message / no configured candidate → valid no-match `[]` and zero `embed()` calls, distinct from an embedding service failure.

---

### Task 1: Causal RED, package contract and construction invariants

**Files:**
- Create: `shared/contextual-copilot-intent-embedding/package.json`
- Create: `shared/contextual-copilot-intent-embedding/test/intent-embedding.test.mjs`
- Create: `shared/contextual-copilot-intent-embedding/index.d.ts`
- Create: `shared/contextual-copilot-intent-embedding/src/index.js`

**Interfaces:**
- Consumes: Core 0.3 `IntentPort` public type contract.
- Produces: `IntentEmbeddingFunction`, `IntentExampleSet`, `EmbeddingIntentPortOptions`, `createEmbeddingIntentPort()` and a local port implementing `resolve()` + `discover()`.

- [ ] **Step 1: Create the minimal package manifest needed to run a RED test**

Create `package.json` with:
- name `@trama/contextual-copilot-intent-embedding`;
- version `0.1.0`;
- `private: true`, `type: "module"`, Node `>=20`;
- files limited to `src`, `index.d.ts`, `README.md`;
- export `.` with `types: ./index.d.ts` and default `./src/index.js`;
- `scripts.test = "node --test test/*.test.mjs"`;
- `peerDependencies["@trama/contextual-copilot-core"] = "^0.3.0"`;
- no runtime `dependencies`.

- [ ] **Step 2: Write the causal failing factory test**

In `test/intent-embedding.test.mjs`, import `createEmbeddingIntentPort` from `../src/index.js` and assert a factory built with a fake `embed()` and one valid catalog entry returns:
- `mode === 'local'`;
- `typeof port.resolve === 'function'`;
- `typeof port.discover === 'function'`.

- [ ] **Step 3: Run the focused test and prove RED**

Run from `shared/contextual-copilot-intent-embedding`:

`npm test`

Expected: FAIL causally because `src/index.js` / `createEmbeddingIntentPort` does not exist; no unrelated repository failure is used as RED evidence.

- [ ] **Step 4: Add public declarations**

Create `index.d.ts` with:

```ts
import type { IntentPort } from '@trama/contextual-copilot-core';

export type IntentEmbeddingFunction = (
  text: string
) => Promise<readonly number[]>;

export interface IntentExampleSet {
  actionId: string;
  examples: readonly string[];
}

export interface EmbeddingIntentPortOptions {
  embed: IntentEmbeddingFunction;
  intents: readonly IntentExampleSet[];
  minSimilarity?: number;
  minMargin?: number;
}

export function createEmbeddingIntentPort(
  options: EmbeddingIntentPortOptions
): IntentPort;
```

No vertical types and no duplicate Core interfaces.

- [ ] **Step 5: Add failing construction-validation tests**

Assert factory throws synchronously for:
- missing/non-function `embed`;
- non-array intents;
- empty/whitespace-only action id;
- duplicate action id;
- action with zero examples;
- example empty after whitespace normalization;
- non-finite/out-of-range `minSimilarity`;
- non-finite/out-of-range `minMargin`.

Also assert examples such as `"  prepara   una attività  "` are normalized internally to `"prepara una attività"` before embedding.

- [ ] **Step 6: Implement factory construction and immutable catalog snapshot**

In `src/index.js` implement `createEmbeddingIntentPort(options)` with internal constants:
- `DEFAULT_MIN_SIMILARITY = 0.75`;
- `DEFAULT_MIN_MARGIN = 0.08`.

Validate options at construction, clone the catalog into private normalized records, clone example arrays, and keep the snapshot inaccessible to callers. Do not import the Core at runtime.

Return an object with `mode: 'local'`; `resolve()` and `discover()` may initially delegate to one shared internal function introduced in Task 2.

- [ ] **Step 7: Run focused package tests**

Run: `npm test`.
Expected: factory and construction-validation tests PASS; ranking tests are not introduced yet.

- [ ] **Step 8: Commit**

Commit message: `feat(intent): add embedding port contract and catalog validation`.

---

### Task 2: Shared best-example ranking and no-match semantics

**Files:**
- Modify: `shared/contextual-copilot-intent-embedding/test/intent-embedding.test.mjs`
- Modify: `shared/contextual-copilot-intent-embedding/src/index.js`

**Interfaces:**
- Consumes: Task 1 immutable catalog, thresholds and factory.
- Produces: one internal ranking path used identically by `resolve()` and `discover()`.

- [ ] **Step 1: Write failing action-boundary tests**

For both `resolve()` and `discover()` assert:
- only `action.id` values present in the call input are eligible;
- a catalog-only action never appears in output;
- the embedding fake records zero calls for examples belonging only to ineligible catalog actions;
- duplicate ids in the action input do not create duplicate output matches.

- [ ] **Step 2: Write failing best-example ranking tests**

Use deterministic vectors whose cosine scores are known and assert:
- each action score equals its best example score, not an average/centroid;
- surviving results are sorted by score desc, action id asc;
- all finite actions above threshold remain in the returned `IntentMatch[]` when ambiguity is not triggered.

- [ ] **Step 3: Write failing threshold and ambiguity tests**

Assert:
- best score below `minSimilarity` → `[]`;
- one score above threshold → one match;
- two scores above threshold with `delta < minMargin` → `[]`;
- `delta === minMargin` → matches are returned;
- custom valid thresholds override defaults.

- [ ] **Step 4: Write failing cheap no-match tests**

Assert whitespace-only message, empty action array, and non-empty action input with no matching catalog entries each return `[]` and call `embed()` zero times.

- [ ] **Step 5: Run focused tests and verify RED**

Run: `node --test test/intent-embedding.test.mjs`.
Expected: new ranking/no-match cases FAIL because the shared ranker is not implemented.

- [ ] **Step 6: Implement `rankMessageAgainstActions()`**

Internal signature:

```js
async function rankMessageAgainstActions({
  message,
  actions,
  catalog,
  embed,
  minSimilarity,
  minMargin,
})
```

Behavior:
- return `[]` before embedding for blank message / empty actions / no eligible catalog records;
- build an eligible id set solely from `actions[].id`;
- embed message once;
- embed only normalized examples for eligible action ids;
- compute cosine score per example and retain the maximum per action;
- discard action scores below `minSimilarity`;
- sort score desc then action id asc;
- if first and second surviving scores have `delta < minMargin`, return `[]`;
- otherwise return plain `{ actionId, score }` objects for all surviving actions.

`resolve(input)` and `discover(input)` both delegate to this function and ignore context except for preserving the Core signature.

- [ ] **Step 7: Run package tests**

Run: `npm test`.
Expected: all Task 1–2 tests PASS with `# fail 0`.

- [ ] **Step 8: Commit**

Commit message: `feat(intent): rank candidate actions with local embeddings`.

---

### Task 3: Technical failure propagation and defensive isolation

**Files:**
- Modify: `shared/contextual-copilot-intent-embedding/test/intent-embedding.test.mjs`
- Modify: `shared/contextual-copilot-intent-embedding/src/index.js`

**Interfaces:**
- Consumes: Task 2 shared ranker.
- Produces: strict vector validation and failure semantics that remain distinguishable from semantic no-match.

- [ ] **Step 1: Add failing vector-validation tests**

For message and example embeddings separately, assert rejection for:
- non-array value;
- empty array;
- any `NaN`, `Infinity` or `-Infinity` component;
- zero-norm vector;
- example dimension different from the message dimension.

Assert no successful partial matches are returned when any required vector is invalid.

- [ ] **Step 2: Add failing provider-error propagation test**

Make `embed()` reject with a sentinel error for the message and for one eligible example. Assert `resolve()` / `discover()` reject with that failure rather than returning `[]`.

- [ ] **Step 3: Add no-mutation and snapshot tests**

Freeze action arrays/objects and original catalog records/examples. Assert calls succeed without mutation. Then mutate a non-frozen original catalog after port construction and prove the existing port continues to use the construction snapshot.

- [ ] **Step 4: Run focused tests and verify RED**

Run: `node --test test/intent-embedding.test.mjs`.
Expected: FAIL until strict vector validation and snapshot isolation are complete.

- [ ] **Step 5: Implement `validateVector()` and safe cosine similarity**

Internal validation must require a non-empty JavaScript array of finite numbers, dimension equality against the message vector, and norm > 0. Any violation throws a deterministic `TypeError`/`RangeError`; do not catch and translate to `[]`.

Cosine implementation must be stateless and side-effect free. Do not cache embeddings or persist prototypes.

- [ ] **Step 6: Run package tests**

Run: `npm test`.
Expected: all contract, ranking, technical-failure and isolation tests PASS.

- [ ] **Step 7: Commit**

Commit message: `test(intent): harden embedding failure and isolation semantics`.

---

### Task 4: Core 0.3 conformance without Core changes

**Files:**
- Create: `shared/contextual-copilot-intent-embedding/test/core-conformance.test.mjs`
- Modify: `shared/contextual-copilot-intent-embedding/src/index.js` only if adapter defects are exposed
- Do not modify: `shared/contextual-copilot-core/**`

**Interfaces:**
- Consumes: `createEmbeddingIntentPort()` and exact Core 0.3 runtime from sibling package.
- Produces: evidence that the adapter composes with existing `resolveRequest()` / `discoverRequestIntent()` boundaries without creating authority.

- [ ] **Step 1: Add resolve conformance test**

Build a Core registry containing at least two actions and an adapter catalog containing those plus an extra catalog-only action. Assert `resolveRequest()` can resolve only actions already present in the Core-provided authorized `ResolvedAction[]`; catalog-only or policy-denied actions cannot escape.

- [ ] **Step 2: Add discovery conformance test**

With `generativeMode: 'none'`, a local PREPARE example and Core 0.3 discovery contract, assert `discoverRequestIntent()` can return PREPARE as `DISCOVERED` while `resolveActions()` still excludes the non-executable generative action.

- [ ] **Step 3: Prove discovery does not dispatch**

Use an executor spy and assert intent discovery does not invoke it. A later dispatch attempt remains governed by Core policy/human confirmation exactly as before.

- [ ] **Step 4: Prove Core pre-filtering of hard boundaries**

Include `WRITE_EXTERNAL` and `INSTITUTIONAL_DECISION` entries in the adapter catalog. Assert the Core does not send them as discovery candidates and the adapter cannot surface them.

- [ ] **Step 5: Prove technical failure remains distinct from no-match**

Use one adapter whose scores are below threshold and another whose `embed()` rejects. Assert:
- below threshold → Core `NO_INTENT_MATCH`;
- rejection in resolve path → `INTENT_RESOLUTION_FAILED`;
- rejection in discovery path → `INTENT_DISCOVERY_FAILED`.

- [ ] **Step 6: Run conformance suite**

Run: `node --test test/core-conformance.test.mjs test/intent-embedding.test.mjs`.
Expected: PASS with Core files unchanged.

- [ ] **Step 7: Commit**

Commit message: `test(intent): prove contextual copilot core conformance`.

---

### Task 5: Runtime boundary, README and bounded package surface

**Files:**
- Create: `shared/contextual-copilot-intent-embedding/README.md`
- Create: `tests/test_contextual_copilot_intent_embedding.py`
- Verify: `shared/contextual-copilot-intent-embedding/package.json`
- Verify: `shared/contextual-copilot-intent-embedding/index.d.ts`
- Verify: `shared/contextual-copilot-intent-embedding/src/index.js`

**Interfaces:**
- Consumes: final Task 1–4 package API.
- Produces: documented local-only contract and repository-level gate proving bounded runtime/package surface.

- [ ] **Step 1: Document the package contract**

README must state:
- package purpose and version `0.1.0`;
- `mode: 'local'` is a consumer contract, not a network detector;
- consumer must inject only a local-compliant embedding function when representing the port as local;
- intent match is classification, never authority;
- `resolve()` receives authorized actions; `discover()` receives Core-filtered candidates;
- catalog ownership remains with the consumer;
- `minSimilarity = 0.75`, `minMargin = 0.08` and ambiguity semantics;
- valid no-match cases versus technical errors;
- no built-in provider, network, persistence, RAG, vector index or vertical catalog;
- first downstream Registro task is explicitly separate and limited to REVIEW/LINK/PREPARE; SUMMARIZE remains out until a governed handoff exists.

- [ ] **Step 2: Add repository package gate first**

Create `tests/test_contextual_copilot_intent_embedding.py` that:
- runs `npm test` in the package and requires tests > 0 / fail 0;
- runs `npm pack --dry-run --json` and requires exactly `README.md`, `index.d.ts`, `package.json`, `src/index.js`;
- parses `package.json` and requires no runtime `dependencies` and the Core peer dependency `^0.3.0`;
- reads `src/index.js` and fails if runtime contains `fetch(`, `http://`, `https://`, provider SDK imports, filesystem/network/storage imports, or a runtime import from `contextual-copilot-core`.

- [ ] **Step 3: Run the repository package gate**

Run from repository root:

`python3 -m unittest tests.test_contextual_copilot_intent_embedding -v`

Expected: PASS.

- [ ] **Step 4: Run full repository tests before source freeze**

Run:

`python3 -m unittest discover -s tests -v`

Expected: PASS with no regression to existing governance/core/distribution tests.

- [ ] **Step 5: Dry-run package surface**

Run from package directory:

`npm test && npm pack --dry-run --json`

Expected: package tests PASS and pack includes only the four canonical importable files.

- [ ] **Step 6: Commit and freeze source SHA**

Commit message: `docs(intent): document local embedding adapter v0.1.0`.

Record this exact commit as `SOURCE_SHA`. After this freeze, do not change `README.md`, `index.d.ts`, `package.json` or `src/index.js` without restarting the receipt step with a new source SHA.

---

### Task 6: Distribution receipt, exact-SHA qualification and stop gate

**Files:**
- Create: `shared/contextual-copilot-intent-embedding/distribution.json`
- Create: `tests/test_contextual_copilot_intent_embedding_distribution.py`
- Modify: implementation PR body only for qualification evidence

**Interfaces:**
- Consumes: Task 5 frozen `SOURCE_SHA` and four canonical package files.
- Produces: reproducible offline distribution receipt and an exact-SHA implementation candidate awaiting human integration decision.

- [ ] **Step 1: Write the distribution test before the receipt**

Create `tests/test_contextual_copilot_intent_embedding_distribution.py` with:
- package name `@trama/contextual-copilot-intent-embedding`;
- version `0.1.0`;
- schema `trama.contextual-copilot-intent-embedding-distribution/v1`;
- source repository `antoniocorsano-boop/trama-ecosistema`;
- source path `shared/contextual-copilot-intent-embedding`;
- exact `SOURCE_SHA` from Task 5;
- expected canonical file set `{README.md, index.d.ts, package.json, src/index.js}`;
- `consumerMode: vendored-file-package`;
- `networkRequiredAtBuild: false`;
- `externalRegistryRequired: false`;
- SHA-256 verification for every canonical file;
- independent `npm pack --dry-run --json` surface verification.

- [ ] **Step 2: Run receipt test and prove RED**

Run:

`python3 -m unittest tests.test_contextual_copilot_intent_embedding_distribution -v`

Expected: FAIL specifically because `distribution.json` does not yet exist.

- [ ] **Step 3: Create `distribution.json` from the frozen source**

Write the manifest with the exact Task 5 `SOURCE_SHA` and SHA-256 digests of the four canonical files. The receipt commit is allowed to differ from `SOURCE_SHA`; `source.commit` must continue to point to the frozen source commit.

- [ ] **Step 4: Run focused and full qualification locally/CI-equivalent**

Run from repository root:
- `python3 -m unittest tests.test_contextual_copilot_intent_embedding tests.test_contextual_copilot_intent_embedding_distribution -v`;
- `python3 -m unittest discover -s tests -v`.

Run from package directory:
- `npm test`;
- `npm pack --dry-run --json`.

Expected: all PASS, no network/provider requirement, no Core modification.

- [ ] **Step 5: Commit the receipt**

Commit message: `build(intent): add reproducible v0.1.0 distribution receipt`.

Record the resulting commit as the implementation candidate exact SHA.

- [ ] **Step 6: Review the complete implementation diff**

Review from the integrated docs baseline to the exact candidate. Reject qualification if the diff contains:
- any change under `shared/contextual-copilot-core/`;
- consumer application changes;
- provider/network/persistence/RAG/keyword-classifier code;
- built-in Registro/Docente OS action ids or example catalog;
- new runtime dependencies;
- UI, deploy or publish configuration.

- [ ] **Step 7: Run GitHub exact-SHA governance qualification**

Wait for the repository governance workflow on the exact candidate and require SUCCESS on that same SHA. Re-run qualification after any code/doc/package change that affects the candidate.

- [ ] **Step 8: Update Draft PR evidence and stop**

PR body must record:
- approved design PR/baseline;
- implementation branch and exact candidate SHA;
- RED evidence;
- package test counts;
- Core conformance result;
- repository test result;
- distribution `SOURCE_SHA`, receipt commit and digests;
- Governance CI run id/result;
- review status and unresolved findings, if any;
- explicit `NO MERGE / NO DEPLOY / NO PUBLISH / NO DOWNSTREAM VENDORING`.

Final state before human decision:

`ENGINEERING QUALIFIED / DRAFT PR / HUMAN INTEGRATION DECISION PENDING`.

Do not merge. Do not create the Registro downstream task in the same PR.