# Visual Factory Executor v0.2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Studio Atlas actually request, receive, review and lock character/environment images, then generate continuity-bound MUSEO ZERO scene frames through a provider-neutral Visual Factory executor.

**Architecture:** Studio Atlas keeps authoring state locally and talks only to a same-origin server route. The route proxies bounded generation jobs to a configured executor and returns machine-readable receipts/assets; no provider credential reaches the browser. A Hugging Face ZeroGPU Gradio/Diffusers adapter is supplied as the first opportunistic FREE_ONLY executor, while the existing TRAMA Compute Policy remains the canonical compute authority. Reference generation and shot generation remain separate: production shots fail closed until character/environment references are human-locked.

**Tech Stack:** Next.js 16 / React 19 / TypeScript 5.9, Node test runner via `tsx`, Python 3.12 stdlib contract tests, Gradio + `spaces` + Diffusers for the optional ZeroGPU adapter, GitHub Actions.

**Spec:** `docs/capabilities/atlas-percorsi/production/VISUAL-GENERATION-PIPELINE-v0.2.md`

## Global Constraints

- Studio Atlas, not Atlas learner runtime, owns image generation and reference locking.
- `paidComputeAuthorized=false`; no paid fallback.
- `allowQualityDowngrade=false`; no automatic model downgrade.
- No production shot may compile from prompt text alone once a recurring character/environment exists.
- Lia, Omar, Teo, Sala Zero and Cabina regia require human-locked reference assets before F1–F6 production.
- Missing/expired/unavailable free compute becomes `WAITING_FOR_COMPUTE`, never an implicit approval or purchase.
- Executor success grants no runtime, learner, product-review or publication authority.
- Binary provider credentials remain server-side only.
- Learner-facing Atlas composition is out of scope for this plan; this plan ends with a reviewable Studio Atlas asset pack.

## Review Focus

- Executor unavailable, timeout or quota exhaustion must return a stable `WAITING_FOR_COMPUTE` receipt and preserve authoring state.
- Malformed executor responses must fail closed and never create locked/reference-ready assets.
- A shot request referencing an unlocked/missing character or environment must never be sent to inference.
- Stale candidate assets from an older package digest must not be lockable into a newer authoring revision.
- A successful executor response must preserve provenance fields and must not imply visual quality or publication PASS.

---

### Task 1: Studio Atlas Visual Factory domain contract

**Files:**
- Modify: `products/studio-atlas/lib/model.ts`
- Create: `products/studio-atlas/lib/visual-factory.ts`
- Create: `products/studio-atlas/lib/visual-factory.test.ts`
- Modify: `products/studio-atlas/package.json`

**Interfaces:**
- Consumes: existing `PathwayProject`, `VisualProductionRequest`, MUSEO ZERO canonical project identity.
- Produces: `VisualAssetCandidate`, `VisualReferenceLock`, `VisualFactoryState`, `compileReferenceJobs(project)`, `compileShotJobs(project)`, `lockReference(project, subjectRef, assetId)`.

- [ ] **Step 1: Write failing tests** proving reference jobs are emitted first, shot compilation fails before locks, stale-digest assets cannot be locked, locked references allow F1–F6 jobs, and no authority flags become true.
- [ ] **Step 2: Run** `npm test -- --runInBand` in `products/studio-atlas`; expected RED because `visual-factory.ts` does not exist.
- [ ] **Step 3: Implement minimal domain types/functions** with MUSEO ZERO visual subjects and F1–F6 continuity bindings.
- [ ] **Step 4: Run** `npm test` and `npm run typecheck`; expected PASS.
- [ ] **Step 5: Commit** domain contract + tests.

### Task 2: Same-origin executor gateway and client

**Files:**
- Create: `products/studio-atlas/lib/visual-factory-executor.ts`
- Create: `products/studio-atlas/lib/visual-factory-executor.test.ts`
- Create: `products/studio-atlas/app/api/visual-factory/execute/route.ts`

**Interfaces:**
- Consumes: a bounded `VisualGenerationJob[]` compiled by Task 1.
- Produces: `executeVisualFactoryJobs(jobs, packageDigest)` client helper and normalized `VisualExecutionReceipt` with `SUCCEEDED | WAITING_FOR_COMPUTE | FAILED`.

- [ ] **Step 1: Write failing tests** for unavailable executor, malformed executor response, provenance preservation, and authority flags remaining false.
- [ ] **Step 2: Run targeted tests**; expected RED because executor helper/route contract is missing.
- [ ] **Step 3: Implement pure response normalization** and server route proxy using `VISUAL_FACTORY_EXECUTOR_URL` and optional `VISUAL_FACTORY_EXECUTOR_TOKEN`; browser never receives either.
- [ ] **Step 4: Verify** targeted tests + `npm run typecheck` + `npm run build`; expected PASS.
- [ ] **Step 5: Commit** executor gateway.

### Task 3: Production-stage reference review and locking

**Files:**
- Modify: `products/studio-atlas/components/PathwayWorkspace.tsx`
- Modify: `products/studio-atlas/app/globals.css`
- Modify: `products/studio-atlas/lib/store.ts`
- Modify: `products/studio-atlas/lib/model.ts`
- Test: `products/studio-atlas/lib/visual-factory.test.ts`

**Interfaces:**
- Consumes: Task 1 state/locking API and Task 2 execution receipts/assets.
- Produces: author workflow `Genera riferimenti → scegli candidato → blocca riferimento → genera F1–F6`.

- [ ] **Step 1: Add failing state-transition tests** covering candidate ingestion, lock invalidation on package-digest change and shot-generation readiness.
- [ ] **Step 2: Run tests**; expected RED for missing transitions.
- [ ] **Step 3: Implement production UI** with thumbnail-led authoring controls for Lia/Omar/Teo/Sala Zero/Cabina regia; do not use the learner-facing card/dashboard pattern as a visual substitute for generated art.
- [ ] **Step 4: Verify** tests + typecheck + standalone build; expected PASS.
- [ ] **Step 5: Commit** Studio Atlas production workflow.

### Task 4: Hugging Face ZeroGPU opportunistic executor

**Files:**
- Create: `services/visual-factory-hf/contract.py`
- Create: `services/visual-factory-hf/app.py`
- Create: `services/visual-factory-hf/requirements.txt`
- Create: `services/visual-factory-hf/README.md`
- Create: `tests/test_visual_factory_hf_contract.py`

**Interfaces:**
- Consumes: normalized Visual Factory jobs from Task 2.
- Produces: JSON receipt with asset URLs, hashes/provenance, workflow/model refs and zero authority grants.

- [ ] **Step 1: Write failing Python tests** for job validation, aspect-ratio dimensions, bounded variants, unsupported paid/quality-downgrade flags and receipt shape.
- [ ] **Step 2: Run** `python -m unittest tests/test_visual_factory_hf_contract.py -v`; expected RED because `contract.py` does not exist.
- [ ] **Step 3: Implement stdlib contract module**, then Gradio/ZeroGPU adapter: FLUX.1 Schnell for reference candidates; SDXL + IP-Adapter Plus reference-conditioned path for continuity-sensitive scene generation. Inference imports remain outside the pure contract tests.
- [ ] **Step 4: Run Python tests**; expected PASS. Static inspection must confirm `@spaces.GPU`, bounded variant count, no purchase/billing code and explicit model/workflow provenance.
- [ ] **Step 5: Commit** executor service.

### Task 5: Qualification and optional deployment workflow

**Files:**
- Modify: `.github/workflows/studio-atlas-s1.yml`
- Modify: `.github/workflows/visual-factory-generation-v0.2.yml`
- Create: `.github/workflows/visual-factory-hf-space-deploy.yml`
- Create: `scripts/deploy_visual_factory_hf_space.py`

**Interfaces:**
- Consumes: Tasks 1–4.
- Produces: CI proof of reference-first fail-closed behavior and an explicit `workflow_dispatch` deployment path requiring `HF_TOKEN` + `HF_VISUAL_FACTORY_SPACE_REPO`.

- [ ] **Step 1: Extend CI first** so it fails until Task 1–4 files/contracts exist and tests pass.
- [ ] **Step 2: Run/observe PR CI**; expected RED before implementation completion.
- [ ] **Step 3: Add optional deploy script/workflow** that creates/updates only the configured Space when manually dispatched; missing configuration exits `NOT_CONFIGURED` without mutation.
- [ ] **Step 4: Verify** generation gate, Studio Atlas S1, Governance, typecheck/build and Python tests all PASS.
- [ ] **Step 5: Record exact-head qualification evidence on PR #233**; keep PR Draft and do not deploy/merge automatically.
