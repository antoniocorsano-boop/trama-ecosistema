# VPC-01 — Visual Preflight Compiler v0.1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a fail-closed, provider-independent visual preflight layer that turns governed MUSEO ZERO visual intent into deterministic, reviewable provider prompts before any scarce image-generation call.

**Architecture:** Add a native Studio Atlas domain component before `VisualGenerationPlan`. Canonical `VisualIntentSpec` objects are validated and linted, compiled deterministically into provider prompts, bound to digests through `VisualPreflightReceipt`, then admitted into the existing Visual Factory only when the exact preflight evidence is `PREFLIGHT_PASS`. VF-ORCH-01 remains responsible only for provider/compute routing and technical fallback.

**Tech Stack:** TypeScript 5.9, Node 22 built-ins (`node:crypto`, `node:test`), existing Studio Atlas Next.js package, JSON Schema Draft 2020-12, existing Python contract tests for the HF boundary. No new runtime dependency is required for v0.1.

**Spec:** `docs/superpowers/specs/2026-10-05-visual-preflight-compiler-design.md`

## Global Constraints

- `NO IMAGE-PROVIDER CALL BEFORE PREFLIGHT PASS`.
- Canonical jobs use `maxVariants = 1`.
- No automatic aesthetic retry loop and no automatic prompt mutation after visual rejection.
- VF-ORCH-01 technical fallback may preserve the same semantic instruction; it may not alter prompt meaning.
- `paidComputeAuthorized = false`.
- `allowQualityDowngrade = false`.
- `runtimeAuthorized = false`.
- `publicationAuthorityGranted = false`.
- Human Visual Review and reference lock remain authoritative after generation.
- No student identity, tracking or telemetry is introduced.
- No remote paid/token-metered language model is required by deterministic CI or canonical v0.1 execution.
- Promptfoo and local LLM runtimes remain optional qualification adapters, not production authority or mandatory dependencies.
- Preserve the current `atlas.visual-generation-plan/v0.1` provider boundary unless a test proves a schema-version change is required; add preflight fields compatibly.

## Review Focus

1. **Stale preflight evidence:** a spec, compiler version, art-direction version or package-digest change must invalidate the receipt and block generation.
2. **Hand-crafted generation plan:** route/runner validation must reject canonical jobs that merely claim `PREFLIGHT_PASS` without the required digest/receipt bindings.
3. **Locked-reference continuity:** F1–F6 must compile only from exact locked reference inputs and exact preflight-qualified scene specs.
4. **Ambiguous or contradictory intent:** contradictions such as forbidden/required text, detached dashboard vs diegetic scene, incompatible camera instructions or missing identity/world anchors must fail before provider execution.
5. **Semantic critic unavailable:** absence of a local critic must never silently become PASS; canonical work must require explicit human preflight where the critic is not run.

---

## File Structure

### New domain files

- `products/studio-atlas/lib/visual-preflight.ts` — typed contracts, deterministic canonicalization/digests, lint, compiler and receipt creation.
- `products/studio-atlas/lib/visual-preflight.test.ts` — domain tests for validation, lint, digests, compilation, critic/human gate and stale evidence.
- `products/studio-atlas/lib/canonical/museo-zero-visual-intents.ts` — canonical VisualIntentSpec corpus for Lia, Omar, Teo, Sala Zero, Cabina regia and later F1–F6.
- `products/studio-atlas/lib/canonical/museo-zero-visual-intents.test.ts` — qualification/mutation tests for the canonical corpus.
- `schemas/atlas-visual-intent-spec.v0.1.schema.json` — exchange schema for source visual intent.
- `schemas/atlas-visual-preflight-receipt.v0.1.schema.json` — exchange schema for preflight evidence.
- `products/studio-atlas/scripts/compile-canonical-visual-preflight.ts` — offline CLI producing specs, receipts and compiled prompts with zero provider calls.
- `tests/test_visual_preflight_contracts.py` — repository-level schema/contract invariants without external network/model access.

### Existing files to modify

- `products/studio-atlas/lib/visual-factory.ts` — remove canonical free-form prompt authority; require valid preflight evidence for reference/shot job compilation; set `maxVariants=1`.
- `products/studio-atlas/lib/visual-factory.test.ts` — update reference/shot compilation tests to prove fail-closed preflight behavior.
- `products/studio-atlas/components/VisualFactoryStage.tsx` — compile/run preflight before invoking generation; show preflight blockers instead of calling provider.
- `products/studio-atlas/scripts/compile-canonical-reference-plan.ts` — consume preflight-qualified canonical receipts rather than free-form prompt constants.
- `products/studio-atlas/scripts/run-visual-factory-orchestrator.ts` — reject unbound canonical plans before provider selection.
- `products/studio-atlas/app/api/visual-factory/execute/route.ts` — reject plans missing exact preflight bindings.
- `products/studio-atlas/lib/visual-factory-executor.test.ts` — preserve executor invariants with preflight-bound fixtures.
- `products/studio-atlas/lib/visual-factory-orchestrator.test.ts` — prove technical fallback preserves prompt digest and cannot bypass preflight.
- `products/studio-atlas/lib/visual-factory-provider-hf.test.ts` — update typed fixtures; preserve provider behavior.
- `products/studio-atlas/lib/visual-factory-provider-cloudflare.test.ts` — update typed fixtures; preserve provider behavior.
- `products/studio-atlas/lib/visual-factory-route-config.test.ts` — update typed fixtures; preserve same-origin/config behavior.
- `services/visual-factory-hf/contract.py` — require preflight binding fields and canonical `maxVariants=1` at provider boundary without owning preflight policy.
- `tests/test_visual_factory_hf_contract.py` — provider-boundary fail-closed tests.
- `products/studio-atlas/package.json` — add offline `visual-factory:preflight-references` script only; no new package dependency.
- `.github/workflows/visual-factory-generation-v0.2.yml` — run deterministic preflight qualification before any manual live generation lane.

---

### Task 1: Define native preflight contracts, canonical digests and JSON schemas

**Files:**
- Create: `products/studio-atlas/lib/visual-preflight.ts`
- Create: `products/studio-atlas/lib/visual-preflight.test.ts`
- Create: `schemas/atlas-visual-intent-spec.v0.1.schema.json`
- Create: `schemas/atlas-visual-preflight-receipt.v0.1.schema.json`
- Create: `tests/test_visual_preflight_contracts.py`

**Interfaces:**
- Consumes: existing 64-char lowercase hex `packageDigest` convention and fixed authority flags from `visual-factory.ts`.
- Produces:
  - `VisualIntentSpec`
  - `VisualPreflightFinding`
  - `CompiledVisualPrompt`
  - `VisualPreflightReceipt`
  - `SemanticCriticResult`
  - `canonicalDigest(value: unknown): string`
  - `validateVisualIntentSpec(spec: VisualIntentSpec): VisualPreflightFinding[]`

- [ ] **Step 1: Write failing TypeScript tests for exact schema identities and authority defaults**

Test names/assertions:
- `VisualIntentSpec uses atlas.visual-intent-spec/v0.1`.
- `VisualPreflightReceipt uses atlas.visual-preflight-receipt/v0.1`.
- receipt authority fields are exactly `false`.
- `canonicalDigest` is stable for logically identical key ordering and changes when semantic content changes.

- [ ] **Step 2: Run the focused test and confirm RED**

Run from `products/studio-atlas`:

```bash
npm test -- --test-name-pattern="visual preflight contracts|canonical digest"
```

Expected: FAIL because `visual-preflight.ts` does not exist.

- [ ] **Step 3: Implement the minimal contracts and canonical SHA-256 digest helper**

Required signatures:

```ts
export function canonicalDigest(value: unknown): string;
export function validateVisualIntentSpec(spec: VisualIntentSpec): VisualPreflightFinding[];
```

Canonicalization must recursively sort object keys, preserve array order, serialize deterministically and hash UTF-8 bytes with SHA-256.

- [ ] **Step 4: Add JSON schemas matching the TypeScript contract names and fixed false authority flags**

Schemas must set `additionalProperties: false` at the top-level contract objects and require the fields fixed by the spec.

- [ ] **Step 5: Add repository-level Python tests for schema identities and fixed authority flags**

The Python test must parse JSON only with stdlib and assert contract/schema field agreement; do not add `jsonschema` or another dependency.

- [ ] **Step 6: Run focused TypeScript + Python tests and confirm GREEN**

```bash
cd products/studio-atlas && npm test -- --test-name-pattern="visual preflight contracts|canonical digest"
cd ../.. && python -m unittest tests.test_visual_preflight_contracts -v
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add products/studio-atlas/lib/visual-preflight.ts products/studio-atlas/lib/visual-preflight.test.ts schemas/atlas-visual-intent-spec.v0.1.schema.json schemas/atlas-visual-preflight-receipt.v0.1.schema.json tests/test_visual_preflight_contracts.py
git commit -m "feat: add visual preflight contracts"
```

---

### Task 2: Implement deterministic lint and fail-closed preflight state

**Files:**
- Modify: `products/studio-atlas/lib/visual-preflight.ts`
- Modify: `products/studio-atlas/lib/visual-preflight.test.ts`

**Interfaces:**
- Consumes: `VisualIntentSpec`, `VisualPreflightFinding` from Task 1.
- Produces:
  - `runDeterministicPreflight(spec: VisualIntentSpec): VisualPreflightFinding[]`
  - `hasPreflightErrors(findings: readonly VisualPreflightFinding[]): boolean`
  - `resolvePreflightState(input: PreflightDecisionInput): "PREFLIGHT_PASS" | "PREFLIGHT_REVISE"`

- [ ] **Step 1: Write failing tests for structural completeness**

Cover:
- character reference without `identityAnchors` → `ERROR`;
- environment reference without `worldAnchors` or spatial relation → `ERROR`;
- scene frame without `narrativeFunction`/`sceneRef`/`shotId` → `ERROR`.

- [ ] **Step 2: Write failing tests for the Review Focus ambiguity/contradiction cases**

Cover:
- same required and forbidden text → `ERROR`;
- detached dashboard dominant surface plus diegetic-scene requirement → `ERROR`;
- incompatible camera instructions → `ERROR`;
- provider-specific syntax in canonical spec → `ERROR` or blocking finding;
- long unprioritized adjective chain / too many focal actions → at least `WARNING`.

- [ ] **Step 3: Run focused tests and confirm RED**

```bash
cd products/studio-atlas && npm test -- --test-name-pattern="deterministic preflight|contradiction|prompt risk"
```

- [ ] **Step 4: Implement only deterministic checks required by the tests and spec section 6**

Do not call network, browser model or provider code.

- [ ] **Step 5: Add semantic-critic availability gate tests**

Assertions:
- deterministic PASS + semantic critic `PASS` → `PREFLIGHT_PASS`;
- semantic critic `REVISE` → `PREFLIGHT_REVISE`;
- semantic critic `NOT_AVAILABLE` + `humanPreflightDecision` absent → `PREFLIGHT_REVISE`/review-required result, never PASS;
- `NOT_AVAILABLE` + explicit human preflight `PASS` → `PREFLIGHT_PASS`.

- [ ] **Step 6: Run focused tests and confirm GREEN**

```bash
cd products/studio-atlas && npm test -- --test-name-pattern="deterministic preflight|contradiction|prompt risk|semantic critic"
```

- [ ] **Step 7: Commit**

```bash
git add products/studio-atlas/lib/visual-preflight.ts products/studio-atlas/lib/visual-preflight.test.ts
git commit -m "feat: add deterministic visual preflight"
```

---

### Task 3: Build the MUSEO ZERO golden visual-intent corpus

**Files:**
- Create: `products/studio-atlas/lib/canonical/museo-zero-visual-intents.ts`
- Create: `products/studio-atlas/lib/canonical/museo-zero-visual-intents.test.ts`
- Modify: `products/studio-atlas/lib/visual-factory.ts`

**Interfaces:**
- Consumes: `VisualIntentSpec`, `runDeterministicPreflight`.
- Produces:
  - `MUSEO_ZERO_REFERENCE_INTENTS: readonly VisualIntentSpec[]`
  - `MUSEO_ZERO_SHOT_INTENTS: readonly VisualIntentSpec[]`
  - `getMuseoZeroReferenceIntent(subjectRef: string): VisualIntentSpec`
  - `getMuseoZeroShotIntent(shotId: string): VisualIntentSpec`

- [ ] **Step 1: Write failing corpus tests for the five canonical references**

Assert exact ordered subjects:

```text
lia, omar, teo, sala-zero, cabina-regia
```

Each fixture must pass deterministic preflight and carry explicit narrative function, required visual facts, composition hierarchy, camera, lighting/mood, negative constraints, forbidden text patterns, quality criteria and art-direction version.

- [ ] **Step 2: Add mutation tests that must fail**

At minimum:
- remove Lia identity anchors;
- turn Sala Zero into a dashboard-like abstract surface;
- disconnect Cabina regia from the museum spatial world;
- add large educational captions;
- add generic cyberpunk-neon default.

- [ ] **Step 3: Add F1–F6 corpus tests**

Assertions:
- exact shot order `F1..F6`;
- F2/F3/F6 share one continuity family and threshold/spatial logic;
- F4/F5 share one control-surface continuity family and encode one bounded state change;
- all character-present shots declare physical placement/action.

- [ ] **Step 4: Run corpus tests and confirm RED**

```bash
cd products/studio-atlas && npm test -- --test-name-pattern="MUSEO ZERO visual intent"
```

- [ ] **Step 5: Implement the fixtures and remove canonical prompt-source authority from `MUSEO_ZERO_VISUAL_SUBJECTS` / `MUSEO_ZERO_SHOTS`**

`visual-factory.ts` may retain subject/shot identity metadata temporarily, but the canonical prose prompt must no longer originate there.

- [ ] **Step 6: Run corpus tests and confirm GREEN**

```bash
cd products/studio-atlas && npm test -- --test-name-pattern="MUSEO ZERO visual intent"
```

- [ ] **Step 7: Commit**

```bash
git add products/studio-atlas/lib/canonical/museo-zero-visual-intents.ts products/studio-atlas/lib/canonical/museo-zero-visual-intents.test.ts products/studio-atlas/lib/visual-factory.ts
git commit -m "feat: define MUSEO ZERO visual intent corpus"
```

---

### Task 4: Compile deterministic provider prompts and receipts

**Files:**
- Modify: `products/studio-atlas/lib/visual-preflight.ts`
- Modify: `products/studio-atlas/lib/visual-preflight.test.ts`
- Modify: `products/studio-atlas/lib/canonical/museo-zero-visual-intents.test.ts`

**Interfaces:**
- Consumes: valid `VisualIntentSpec`, deterministic findings, semantic/human preflight decision.
- Produces:
  - `compileVisualPrompt(spec: VisualIntentSpec, providerFamily: "FLUX2_KLEIN_4B"): CompiledVisualPrompt`
  - `createVisualPreflightReceipt(input: CreateVisualPreflightReceiptInput): VisualPreflightReceipt`
  - exact `specDigest`, `promptDigest`, `compilerVersion`, `artDirectionVersion` binding.

- [ ] **Step 1: Write failing tests for deterministic compilation order**

The compiled positive prompt must preserve this semantic order:
1. medium/style family;
2. narrative/world context;
3. subject identity anchors;
4. required action/state;
5. spatial composition;
6. camera language;
7. lighting/material language;
8. continuity instructions;
9. provider-adaptation hints.

Negative constraints remain separately compiled.

- [ ] **Step 2: Write failing digest/version invalidation tests**

Changing any of these must change or invalidate the receipt:
- source spec semantic field;
- package digest;
- compiler version;
- art-direction version.

Changing object key order only must not change the digest.

- [ ] **Step 3: Write failing test proving `maxVariants` is fixed to `1` in `CompiledVisualPrompt`**

- [ ] **Step 4: Run focused tests and confirm RED**

```bash
cd products/studio-atlas && npm test -- --test-name-pattern="compiled visual prompt|preflight receipt|stale preflight"
```

- [ ] **Step 5: Implement compiler and receipt creation with no provider/model calls**

The compiler may adapt syntax/order for the existing FLUX.2 Klein family but may not invent semantic facts absent from the spec.

- [ ] **Step 6: Run focused tests and confirm GREEN**

```bash
cd products/studio-atlas && npm test -- --test-name-pattern="compiled visual prompt|preflight receipt|stale preflight"
```

- [ ] **Step 7: Commit**

```bash
git add products/studio-atlas/lib/visual-preflight.ts products/studio-atlas/lib/visual-preflight.test.ts products/studio-atlas/lib/canonical/museo-zero-visual-intents.test.ts
git commit -m "feat: compile preflight-qualified visual prompts"
```

---

### Task 5: Gate Visual Factory reference/shot plan compilation on exact preflight evidence

**Files:**
- Modify: `products/studio-atlas/lib/visual-factory.ts`
- Modify: `products/studio-atlas/lib/visual-factory.test.ts`
- Modify: `products/studio-atlas/components/VisualFactoryStage.tsx`

**Interfaces:**
- Consumes: `VisualPreflightReceipt`, `CompiledVisualPrompt`, MUSEO ZERO intent lookup functions.
- Produces:
  - updated `VisualGenerationPlan` with `preflightReceiptId`, `preflightSpecDigest`, `compiledPromptDigest`, `preflightState: "PREFLIGHT_PASS"` at the plan/job binding needed by validators;
  - `compileReferenceJobs(..., preflightReceipts)` and `compileShotJobs(..., preflightReceipts)` fail-closed behavior.

- [ ] **Step 1: Replace the old positive-path reference test with a failing preflight-gate test**

Assertions:
- zero receipts → no executable jobs and explicit preflight blockers;
- stale/wrong digest receipt → no executable job;
- `PREFLIGHT_REVISE` → no executable job;
- five exact PASS receipts → exactly five jobs.

- [ ] **Step 2: Add generation-job assertions**

For every emitted canonical job:
- `maxVariants === 1`;
- prompt equals the compiled prompt from the bound receipt;
- prompt digest/spec digest/receipt ID match exactly;
- all four authority flags remain false.

- [ ] **Step 3: Add shot-gate tests after reference lock**

Even with all five human reference locks, F1–F6 remain blocked until their own exact scene preflight receipts PASS.

- [ ] **Step 4: Run focused Visual Factory tests and confirm RED**

```bash
cd products/studio-atlas && npm test -- --test-name-pattern="preflight|reference jobs|scene generation|F1 through F6"
```

- [ ] **Step 5: Implement fail-closed integration in `visual-factory.ts`**

No function may fall back to the old hard-coded free-form prompt when a receipt is absent.

- [ ] **Step 6: Update `VisualFactoryStage.tsx` to run/show preflight before calling `/api/visual-factory/execute`**

Expected UI behavior:
- deterministic error → show blocker and make no execute request;
- critic unavailable → require explicit human preflight decision before generation;
- PASS → existing generation flow continues.

Do not redesign the surrounding Studio Atlas workflow.

- [ ] **Step 7: Run Studio Atlas tests and typecheck**

```bash
cd products/studio-atlas
npm test
npm run typecheck
```

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add products/studio-atlas/lib/visual-factory.ts products/studio-atlas/lib/visual-factory.test.ts products/studio-atlas/components/VisualFactoryStage.tsx
git commit -m "feat: gate visual generation on preflight"
```

---

### Task 6: Enforce preflight bindings at route, runner, orchestrator and provider contract boundaries

**Files:**
- Modify: `products/studio-atlas/app/api/visual-factory/execute/route.ts`
- Modify: `products/studio-atlas/scripts/run-visual-factory-orchestrator.ts`
- Modify: `products/studio-atlas/lib/visual-factory-executor.test.ts`
- Modify: `products/studio-atlas/lib/visual-factory-orchestrator.test.ts`
- Modify: `products/studio-atlas/lib/visual-factory-provider-hf.test.ts`
- Modify: `products/studio-atlas/lib/visual-factory-provider-cloudflare.test.ts`
- Modify: `products/studio-atlas/lib/visual-factory-route-config.test.ts`
- Modify: `services/visual-factory-hf/contract.py`
- Modify: `tests/test_visual_factory_hf_contract.py`

**Interfaces:**
- Consumes: preflight-bound `VisualGenerationPlan` from Task 5.
- Produces: boundary validation that cannot bypass required bindings; existing execution/orchestration receipt formats remain authoritative for compute evidence.

- [ ] **Step 1: Add failing route/runner tests for hand-crafted unbound plans**

Reject when any canonical job lacks:
- `preflightState === "PREFLIGHT_PASS"`;
- `preflightReceiptId`;
- 64-char lowercase hex `preflightSpecDigest`;
- 64-char lowercase hex `compiledPromptDigest`;
- `maxVariants === 1`.

- [ ] **Step 2: Add failing orchestration test proving technical fallback preserves semantic binding**

HF failure → Cloudflare fallback must receive the same compiled prompt text, `compiledPromptDigest`, `preflightSpecDigest` and receipt ID.

- [ ] **Step 3: Add failing Python provider-contract tests**

`validate_plan` must reject missing/invalid preflight bindings and `maxVariants != 1` for canonical Studio Atlas jobs. It must not attempt to decide Human Visual Review or reference lock.

- [ ] **Step 4: Run focused tests and confirm RED**

```bash
cd products/studio-atlas && npm test -- --test-name-pattern="preflight|fallback"
cd ../.. && python -m unittest tests.test_visual_factory_hf_contract -v
```

- [ ] **Step 5: Implement boundary validation without duplicating lint/compiler logic**

Route, runner, orchestrator and provider contract validate evidence shape/binding only. `visual-preflight.ts` remains the sole semantic preflight implementation.

- [ ] **Step 6: Run full Studio Atlas and HF contract suites**

```bash
cd products/studio-atlas
npm test
npm run typecheck
cd ../..
python -m unittest tests.test_visual_factory_hf_contract -v
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add products/studio-atlas/app/api/visual-factory/execute/route.ts products/studio-atlas/scripts/run-visual-factory-orchestrator.ts products/studio-atlas/lib/visual-factory-executor.test.ts products/studio-atlas/lib/visual-factory-orchestrator.test.ts products/studio-atlas/lib/visual-factory-provider-hf.test.ts products/studio-atlas/lib/visual-factory-provider-cloudflare.test.ts products/studio-atlas/lib/visual-factory-route-config.test.ts services/visual-factory-hf/contract.py tests/test_visual_factory_hf_contract.py
git commit -m "feat: enforce visual preflight at execution boundaries"
```

---

### Task 7: Add the zero-provider-call offline preflight CLI and qualification lane

**Files:**
- Create: `products/studio-atlas/scripts/compile-canonical-visual-preflight.ts`
- Modify: `products/studio-atlas/scripts/compile-canonical-reference-plan.ts`
- Modify: `products/studio-atlas/package.json`
- Modify: `.github/workflows/visual-factory-generation-v0.2.yml`
- Test: `products/studio-atlas/lib/visual-preflight.test.ts`

**Interfaces:**
- Consumes: MUSEO ZERO corpus, deterministic preflight/compiler/receipt functions.
- Produces: offline artifact directory containing source specs, findings, compiled prompts, digests and receipts without provider calls.

- [ ] **Step 1: Write failing CLI-output test around an exported pure compile function**

Required logical output for reference mode:
- exactly five source specs;
- exactly five preflight receipts;
- exactly five compiled prompt digests;
- zero provider/execution receipt fields;
- final state PASS only where semantic/human preflight requirements are satisfied.

- [ ] **Step 2: Run focused test and confirm RED**

```bash
cd products/studio-atlas && npm test -- --test-name-pattern="offline canonical preflight"
```

- [ ] **Step 3: Implement `compile-canonical-visual-preflight.ts`**

CLI arguments:

```text
--mode references|shots
--output <directory>
--human-preflight-pass
```

For v0.1, `--human-preflight-pass` is an explicit author/reviewer decision used only when semantic critic mode is `NOT_AVAILABLE`; it is recorded in the receipt and never inferred.

- [ ] **Step 4: Add package script**

```json
"visual-factory:preflight-references": "tsx scripts/compile-canonical-visual-preflight.ts --mode references"
```

Do not add a package dependency.

- [ ] **Step 5: Update `compile-canonical-reference-plan.ts`**

It must first obtain/consume exact PASS preflight receipts and then call Visual Factory plan compilation. Direct hard-coded prompt compilation is forbidden.

- [ ] **Step 6: Update the existing GitHub workflow**

Before any live `references` execution step:
1. run Studio Atlas tests/typecheck;
2. compile deterministic preflight evidence;
3. fail closed if any canonical reference is not PASS;
4. only then compile the generation plan;
5. existing FREE_ONLY live lane remains unchanged after that gate.

No live provider call is added to pull-request CI.

- [ ] **Step 7: Execute the offline qualification locally/CI-style**

```bash
cd products/studio-atlas
npm test
npm run typecheck
npm run visual-factory:preflight-references -- --output ../../artifacts/vpc-01/references --human-preflight-pass
```

Expected: five reviewable preflight bundles, no provider call.

- [ ] **Step 8: Commit**

```bash
git add products/studio-atlas/scripts/compile-canonical-visual-preflight.ts products/studio-atlas/scripts/compile-canonical-reference-plan.ts products/studio-atlas/package.json .github/workflows/visual-factory-generation-v0.2.yml products/studio-atlas/lib/visual-preflight.test.ts
git commit -m "feat: add offline visual preflight qualification"
```

---

### Task 8: Full regression, evidence and plan closeout

**Files:**
- Modify only if tests expose a defect in VPC-01-owned code.
- Update: `docs/superpowers/plans/2026-10-05-visual-preflight-compiler-v0.1.md` checkbox state during execution.
- Update PR #251 body with exact-head verification evidence after tests pass.

**Interfaces:**
- Consumes: all Task 1–7 deliverables.
- Produces: exact-head VPC-01 qualification evidence; no merge and no runtime/publication authority.

- [ ] **Step 1: Run complete Studio Atlas tests**

```bash
cd products/studio-atlas
npm test
npm run typecheck
npm run build
```

Expected: PASS.

- [ ] **Step 2: Run repository-level Visual Factory contract tests**

```bash
cd ../..
python -m unittest tests.test_visual_preflight_contracts tests.test_visual_factory_hf_contract -v
```

Expected: PASS.

- [ ] **Step 3: Run deterministic offline preflight qualification**

```bash
cd products/studio-atlas
npm run visual-factory:preflight-references -- --output ../../artifacts/vpc-01/references --human-preflight-pass
```

Expected:
- five reference specs;
- five PASS receipts bound to exact digests;
- five deterministic compiled prompts;
- no execution/provider receipt;
- no network/provider requirement.

- [ ] **Step 4: Negative proof — ensure generation cannot be compiled without preflight evidence**

Run the dedicated test case/fixture that omits receipts.

Expected: fail-closed blocker; zero executable jobs.

- [ ] **Step 5: Inspect branch diff for scope control**

Confirm:
- no paid provider path added;
- no auto-publication/reference lock;
- no student identity/telemetry;
- no mandatory remote LLM/model dependency;
- no unrelated architecture refactor.

- [ ] **Step 6: Record exact head and CI/test evidence in PR #251**

Do not mark Ready for Review until all deterministic gates pass.

- [ ] **Step 7: Request one whole-branch independent review**

Review focus: semantic authority boundaries, stale digest handling, bypass resistance, continuity bindings and accidental provider-call paths.

- [ ] **Step 8: Stop at Human Review**

No automatic merge. No live regeneration of Lia/Omar/Teo/Sala Zero/Cabina regia is part of VPC-01 implementation proof unless separately authorized after the preflight layer is reviewed.

---

## Self-Review Result

- **Spec coverage:** all v0.1 mandatory requirements are assigned to Tasks 1–8. Promptfoo and concrete local-model execution remain intentionally optional because the approved spec defines them as qualification adapters, not mandatory core.
- **Step scan:** each task has a RED test, minimal implementation action, GREEN verification and commit boundary; no task depends on an unnamed function or unspecified state.
- **Type consistency:** preflight types originate only in `visual-preflight.ts`; generation consumes exact receipt/digest bindings; execution/orchestration do not duplicate semantic lint.
- **Review Focus coverage:** stale evidence → Tasks 1/4/5; hand-crafted plan bypass → Task 6; locked-reference continuity → Tasks 3/5; contradictory intent → Task 2/3; critic unavailable → Tasks 2/7.
- **Proportion:** the plan specifies interfaces, tests, commands and boundaries without embedding implementation bodies.
