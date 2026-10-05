# VF-ORCH-01 Zero-Cost Multi-Provider Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the existing Studio Atlas Visual Factory executor into a bounded zero-cost orchestrator that preserves Hugging Face ZeroGPU quota for canonical references, falls back to Cloudflare Workers AI on eligible failures, records attempt evidence, and returns `WAITING_FOR_COMPUTE` when no free provider is usable.

**Architecture:** Keep the existing `Studio Atlas → /api/visual-factory/execute → VisualExecutionReceipt` boundary. Add a pure orchestration module plus two provider adapters: the existing Hugging Face Gradio path becomes an injected HF adapter with ZeroGPU quota preflight; Cloudflare Workers AI becomes the second adapter using the same `flux2-klein-4b/v0.2` model family. The API route becomes a thin configuration boundary, and deterministic PR CI never performs live inference.

**Tech Stack:** Next.js 16, React 19, TypeScript 5.9, Node 22 test runner via `tsx`, `@gradio/client` 2.7.1, Web Fetch/FormData APIs, GitHub Actions, Hugging Face Hub ZeroGPU quota API/CLI semantics, Cloudflare Workers AI REST API.

**Spec:** `docs/superpowers/specs/2026-10-05-visual-factory-zero-cost-orchestrator-design.md`

## Global Constraints

- `costClass = FREE_ONLY` for every accepted receipt.
- `paidComputeAuthorized = false` always.
- `allowQualityDowngrade = false` always.
- No runtime or publication authority may be granted by generation.
- Browser code never receives provider credentials.
- Provider order is bounded; no recursion or retry loop.
- HF gets at most one automatic inference attempt per orchestration cycle.
- Unknown cost eligibility excludes the provider.
- The only automatically allowlisted model family in VF-ORCH-01 is `flux2-klein-4b/v0.2`.
- HF model ref: `black-forest-labs/FLUX.2-klein-4B`.
- Cloudflare model ref: `@cf/black-forest-labs/flux-2-klein-4b`.
- Canonical references are Lia, Omar, Teo, Sala Zero and Cabina regia.
- Missing free compute degrades to existing product state `WAITING_FOR_COMPUTE` and preserves authoring state.
- Successful generation still requires Human Visual Review/reference lock.
- Pull-request CI performs no live inference.

## Review Focus

- **HF quota boundary:** a canonical-reference request near the reserve threshold must not consume quota needed by the other unfinished references.
- **Unknown Cloudflare plan:** valid credentials without explicit Workers Free admission must be treated as ineligible, not attempted.
- **Mixed provider failure:** 429/timeout/5xx from HF followed by Cloudflare failure must terminate after one pass with `WAITING_FOR_COMPUTE`.
- **Malformed success:** any provider claiming success without valid model/provenance/hash data must fail closed and must not become a visual candidate.
- **Scene continuity:** Cloudflare scene execution must preserve all locked `referenceInputs`; more than four image inputs must fail closed because the selected Cloudflare model supports at most four.

---

### Task 1: Pure orchestration policy and quota reserve

**Files:**
- Create: `products/studio-atlas/lib/visual-factory-orchestrator.ts`
- Create: `products/studio-atlas/lib/visual-factory-orchestrator.test.ts`
- Modify: `products/studio-atlas/lib/visual-factory.ts`

**Interfaces:**
- Consumes: `VisualGenerationPlan`, existing `VisualExecutionReceipt`, existing reference/scene job types.
- Produces:
  - `type VisualProviderId = "HF_ZEROGPU" | "CLOUDFLARE_WORKERS_AI"`
  - `type ProviderEligibility = { eligible: boolean; reason: string; remainingGpuSeconds?: number }`
  - `type ProviderAttemptOutcome = { kind: "SUCCEEDED" | "RETRYABLE_PROVIDER_FAILURE" | "PROVIDER_EXHAUSTED" | "PROVIDER_INELIGIBLE" | "LICENSE_BLOCKED" | "PERMANENT_FAILURE"; receipt?: VisualExecutionReceipt; detail?: string }`
  - `type VisualProviderAdapter = { id: VisualProviderId; preflight(ctx: OrchestrationContext): Promise<ProviderEligibility>; execute(plan: VisualGenerationPlan, ctx: OrchestrationContext): Promise<ProviderAttemptOutcome> }`
  - `computeProtectedHfReserve(input: HfReserveInput): number`
  - `selectProviderOrder(plan: VisualGenerationPlan, ctx: OrchestrationContext): VisualProviderId[]`
  - `orchestrateVisualGeneration(plan: VisualGenerationPlan, adapters: Partial<Record<VisualProviderId, VisualProviderAdapter>>, ctx: OrchestrationContext): Promise<VisualExecutionReceipt>`

- [ ] **Step 1: Write failing tests** in `visual-factory-orchestrator.test.ts` proving:
  - unfinished canonical references order HF before Cloudflare when quota is safe;
  - HF is omitted when the requested attempt would invade the reserve for the other unfinished canonical references;
  - scene generation prefers Cloudflare while unfinished canonical references still require protected HF reserve;
  - unknown/ineligible providers are skipped;
  - each provider is attempted at most once;
  - all-provider failure returns `WAITING_FOR_COMPUTE`, `FREE_ONLY`, and all authority flags false.

- [ ] **Step 2: Run RED verification**

Run from `products/studio-atlas`:

`npm test`

Expected: new orchestrator tests fail because the module/types/functions do not yet exist.

- [ ] **Step 3: Implement the minimal pure policy**

Use a simple ordered candidate array and a single `for ... of` pass. `computeProtectedHfReserve` uses:

`unfinishedReferenceCount * max(configuredFloorSeconds, measuredReferenceP95Seconds ?? 0) + safetyMarginSeconds`

No network calls belong in this module.

- [ ] **Step 4: Run GREEN verification**

Run:

`npm test && npm run typecheck`

Expected: PASS.

- [ ] **Step 5: Commit**

`git add products/studio-atlas/lib/visual-factory.ts products/studio-atlas/lib/visual-factory-orchestrator.ts products/studio-atlas/lib/visual-factory-orchestrator.test.ts && git commit -m "feat: add Visual Factory zero-cost orchestration policy"`

---

### Task 2: Hugging Face ZeroGPU adapter with quota preflight

**Files:**
- Create: `products/studio-atlas/lib/visual-factory-provider-hf.ts`
- Create: `products/studio-atlas/lib/visual-factory-provider-hf.test.ts`
- Modify: `products/studio-atlas/lib/visual-factory-executor.ts`

**Interfaces:**
- Consumes: `VisualProviderAdapter`, `VisualGenerationPlan`, existing `normalizeGradioExecutionResult()`.
- Produces:
  - `createHfZeroGpuAdapter(config: HfZeroGpuConfig, deps?: HfZeroGpuDeps): VisualProviderAdapter`
  - `HfZeroGpuConfig` containing only server-side URL/token plus reserve configuration.
  - quota preflight based on a dependency returning `{ base: number; remaining: number; resetsAt?: string | null; overquotaUsed?: number }` in GPU-seconds.

- [ ] **Step 1: Write failing tests** proving:
  - no token/Space configuration → `PROVIDER_INELIGIBLE` without inference;
  - quota below policy threshold → `PROVIDER_EXHAUSTED` without inference;
  - quota above threshold → exactly one Gradio inference attempt;
  - Gradio timeout/429/capacity/unavailable maps to a fallback-eligible outcome;
  - malformed Gradio payload maps to provider failure and cannot yield an accepted asset;
  - no secret value appears in returned detail/evidence.

- [ ] **Step 2: Run RED verification**

`npm test`

Expected: HF adapter tests fail because the adapter does not exist.

- [ ] **Step 3: Implement the adapter**

Keep `@gradio/client` connection/inference behind injected functions for tests. The quota source must model Hugging Face `get_zero_gpu_quota()` semantics: values are GPU-seconds and include `remaining`/`resets_at`; do not assume midnight reset and do not admit over-quota credit-backed execution.

- [ ] **Step 4: Run GREEN verification**

`npm test && npm run typecheck`

Expected: PASS.

- [ ] **Step 5: Commit**

`git add products/studio-atlas/lib/visual-factory-executor.ts products/studio-atlas/lib/visual-factory-provider-hf.ts products/studio-atlas/lib/visual-factory-provider-hf.test.ts && git commit -m "feat: guard Hugging Face ZeroGPU quota"`

---

### Task 3: Cloudflare Workers AI FLUX.2 Klein adapter

**Files:**
- Create: `products/studio-atlas/lib/visual-factory-provider-cloudflare.ts`
- Create: `products/studio-atlas/lib/visual-factory-provider-cloudflare.test.ts`

**Interfaces:**
- Consumes: `VisualProviderAdapter`, `VisualGenerationPlan` and existing receipt/asset types.
- Produces:
  - `createCloudflareWorkersAiAdapter(config: CloudflareWorkersAiConfig, deps?: CloudflareWorkersAiDeps): VisualProviderAdapter`
  - exact REST target: `/accounts/{ACCOUNT_ID}/ai/run/@cf/black-forest-labs/flux-2-klein-4b`
  - multipart fields `prompt`, `width`, `height`, optional `seed`, and `input_image_0..3`.

- [ ] **Step 1: Write failing tests** proving:
  - missing token/account ID/free-plan admission → `PROVIDER_INELIGIBLE` without HTTP request;
  - the exact allowlisted Cloudflare model is used;
  - reference inputs are forwarded as `input_image_0..3` after bounded fetch/downscale preparation;
  - more than four required reference inputs fails closed before calling Workers AI;
  - 429 maps to `PROVIDER_EXHAUSTED`;
  - timeout and transient 5xx map to `RETRYABLE_PROVIDER_FAILURE`;
  - 401/403 or cost-policy violations map to non-retryable ineligibility/permanent failure;
  - valid Base64 image response becomes a provenance-complete candidate with SHA-256 and `workflowRef = "cloudflare-workers-ai.flux2-klein-4b/v0.1"`.

- [ ] **Step 2: Run RED verification**

`npm test`

Expected: Cloudflare adapter tests fail because the module does not exist.

- [ ] **Step 3: Implement the adapter**

Use `fetch` + `FormData`; do not add a Cloudflare SDK. Preserve the canonical workflow family; never substitute another model. Cloudflare free-plan admission is an explicit boolean configuration and defaults to false.

- [ ] **Step 4: Run GREEN verification**

`npm test && npm run typecheck`

Expected: PASS.

- [ ] **Step 5: Commit**

`git add products/studio-atlas/lib/visual-factory-provider-cloudflare.ts products/studio-atlas/lib/visual-factory-provider-cloudflare.test.ts && git commit -m "feat: add Cloudflare Workers AI visual fallback"`

---

### Task 4: Wire the existing same-origin API route to the orchestrator

**Files:**
- Modify: `products/studio-atlas/app/api/visual-factory/execute/route.ts`
- Modify: `products/studio-atlas/lib/visual-factory-executor.test.ts`
- Create: `products/studio-atlas/lib/visual-factory-route-config.ts`
- Create: `products/studio-atlas/lib/visual-factory-route-config.test.ts`

**Interfaces:**
- Consumes: Tasks 1–3 adapters and orchestrator.
- Produces:
  - `buildVisualProviderConfig(env: NodeJS.ProcessEnv): VisualProviderRuntimeConfig`
  - API route calls exactly one `orchestrateVisualGeneration()` invocation per request.

- [ ] **Step 1: Write failing tests** proving:
  - no provider configuration returns `WAITING_FOR_COMPUTE`;
  - HF credentials do not authorize Cloudflare and vice versa;
  - `CLOUDFLARE_WORKERS_FREE_ADMITTED` defaults false;
  - the API never serializes HF/Cloudflare secrets into its response;
  - legacy single-executor environment configuration remains either explicitly translated to HF configuration or rejected with a stable migration state, never silently treated as paid-capable compute.

- [ ] **Step 2: Run RED verification**

`npm test`

Expected: route-config tests fail until the configuration boundary exists.

- [ ] **Step 3: Implement route/config wiring**

The route validates the plan as today, builds adapters from environment, invokes the orchestrator, then returns the normalised receipt using the existing HTTP status mapping. Keep the client helper `executeVisualFactoryPlan()` unchanged unless tests require a receipt-compatible extension.

- [ ] **Step 4: Run GREEN verification**

`npm test && npm run typecheck && npm run build`

Expected: PASS.

- [ ] **Step 5: Commit**

`git add products/studio-atlas/app/api/visual-factory/execute/route.ts products/studio-atlas/lib/visual-factory-executor.test.ts products/studio-atlas/lib/visual-factory-route-config.ts products/studio-atlas/lib/visual-factory-route-config.test.ts && git commit -m "feat: route Visual Factory through zero-cost providers"`

---

### Task 5: Orchestration evidence manifest

**Files:**
- Modify: `products/studio-atlas/lib/visual-factory.ts`
- Modify: `products/studio-atlas/lib/visual-factory-orchestrator.ts`
- Modify: `products/studio-atlas/lib/visual-factory-orchestrator.test.ts`

**Interfaces:**
- Consumes: provider attempt outcomes from Tasks 2–4.
- Produces:
  - `VisualProviderAttemptEvidence`
  - optional `orchestration` evidence field on `VisualExecutionReceipt` containing orchestration ID, workload class, considered providers, selected provider/model, bounded attempt records, quota snapshot metadata without credentials, duration, fallback reason and final state.

- [ ] **Step 1: Write failing tests** proving:
  - HF→Cloudflare fallback records both attempts in order;
  - quota values may be recorded but tokens/account secrets never are;
  - successful and deferred receipts both carry enough provider-attempt evidence for Human Visual Review;
  - existing receipt validation rejects malformed orchestration evidence when present.

- [ ] **Step 2: Run RED verification**

`npm test`

Expected: evidence assertions fail because receipt schema/types do not yet carry orchestration data.

- [ ] **Step 3: Implement minimal evidence extension**

Keep evidence backward-compatible by making the new receipt field optional in v0.1. Do not grant any additional authority through evidence fields.

- [ ] **Step 4: Run GREEN verification**

`npm test && npm run typecheck`

Expected: PASS.

- [ ] **Step 5: Commit**

`git add products/studio-atlas/lib/visual-factory.ts products/studio-atlas/lib/visual-factory-orchestrator.ts products/studio-atlas/lib/visual-factory-orchestrator.test.ts && git commit -m "feat: record Visual Factory provider evidence"`

---

### Task 6: GitHub Actions qualification and explicit live execution path

**Files:**
- Modify: `.github/workflows/visual-factory-generation-v0.2.yml`
- Create: `.github/workflows/visual-factory-orchestrator-v0.1.yml`
- Create: `products/studio-atlas/scripts/run-visual-factory-orchestrator.ts`
- Modify: `products/studio-atlas/package.json`

**Interfaces:**
- Consumes: same orchestrator and provider adapters used by the API route.
- Produces:
  - npm script `visual-factory:orchestrate`;
  - deterministic PR qualification job;
  - manual `workflow_dispatch` modes `dry-run | references | shots`;
  - uploaded evidence directory only; no commit or publication of generated assets.

- [ ] **Step 1: Add failing/static qualification checks first** requiring the orchestrator/adapters, `FREE_ONLY`, explicit Cloudflare Free admission and absence of live inference from PR-triggered jobs.

- [ ] **Step 2: Verify the qualification workflow is RED on the pre-task structure** using local static commands where possible and PR CI after push.

- [ ] **Step 3: Implement the runner and workflow**

Manual live mode reads secrets only through environment:

- `HF_TOKEN`;
- configured HF Space URL/identity;
- `CLOUDFLARE_API_TOKEN`;
- `CLOUDFLARE_ACCOUNT_ID`;
- explicit `CLOUDFLARE_WORKERS_FREE_ADMITTED=true` variable when qualified.

`dry-run` performs provider eligibility only. `references` executes only remaining canonical-reference jobs. `shots` requires a locked-reference input plan. All outputs go to an artifact directory and never to an automatic commit.

- [ ] **Step 4: Run complete local verification**

From `products/studio-atlas`:

`npm test && npm run typecheck && npm run build`

From repository root:

`python -m unittest tests/test_visual_generation_plan.py -v`

Expected: PASS, with no live provider call.

- [ ] **Step 5: Push and verify PR checks**

Confirm exact-head GitHub Actions results for Visual Factory generation/orchestrator and Studio Atlas S1. Any unrelated failing gate must be named explicitly rather than hidden.

- [ ] **Step 6: Commit**

`git add .github/workflows/visual-factory-generation-v0.2.yml .github/workflows/visual-factory-orchestrator-v0.1.yml products/studio-atlas/scripts/run-visual-factory-orchestrator.ts products/studio-atlas/package.json && git commit -m "ci: qualify Visual Factory multi-provider orchestration"`

---

### Task 7: Documentation, qualification receipt and branch-level verification

**Files:**
- Modify: `docs/capabilities/atlas-percorsi/production/VISUAL-GENERATION-PIPELINE-v0.2.md`
- Modify: `docs/capabilities/atlas-percorsi/production/PROVIDER-QUALIFICATION-MATRIX-v0.1.md`
- Create: `docs/capabilities/atlas-percorsi/production/VF-ORCH-01-QUALIFICATION-RECEIPT-v0.1.md`

**Interfaces:**
- Consumes: exact implementation head and CI evidence from Tasks 1–6.
- Produces: durable qualification record without asserting a live provider run unless one actually occurred.

- [ ] **Step 1: Update docs** with the implemented HF→Cloudflare bounded chain, exact model refs, zero-cost eligibility rules, evidence semantics and explicit out-of-scope providers.

- [ ] **Step 2: Write qualification receipt** recording exact head, deterministic tests/checks and whether live provider credentials were configured. If no live inference occurred, state `LIVE_ZERO_COST_EXECUTION_NOT_YET_PROVEN` rather than PASS.

- [ ] **Step 3: Run final verification before completion**

Run all Studio Atlas tests/typecheck/build plus relevant Python Visual Factory tests. Inspect PR exact-head checks.

- [ ] **Step 4: Commit**

`git add docs/capabilities/atlas-percorsi/production/VISUAL-GENERATION-PIPELINE-v0.2.md docs/capabilities/atlas-percorsi/production/PROVIDER-QUALIFICATION-MATRIX-v0.1.md docs/capabilities/atlas-percorsi/production/VF-ORCH-01-QUALIFICATION-RECEIPT-v0.1.md && git commit -m "docs: qualify VF-ORCH-01 zero-cost fallback"`

## Plan self-review

- **Spec coverage:** provider order, HF reserve, Cloudflare same-model fallback, zero-cost guard, bounded failure semantics, evidence, GitHub Actions and Human Visual Review are each owned by a task.
- **No duplicate subsystem:** all work extends PR #233 and the existing API/executor boundary.
- **Type consistency:** provider IDs, adapter interface and orchestration result are introduced in Task 1 and consumed unchanged thereafter.
- **Failure coverage:** quota threshold, unknown plan, mixed failures, malformed output and >4 scene references are pinned by tests.
- **Scope:** AI Horde, Pollinations, Gemini and notebook providers remain explicitly outside this plan.
