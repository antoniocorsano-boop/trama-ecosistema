# Atlas Experience Engine v1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build one reusable Atlas Experience Engine that runs both Smart Activities and transversal Percorsi, preserves the existing Smart/G2/material contracts, proves generality with a second Smart Activity and a second Percorso, and never infers runtime authorization from successful implementation.

**Architecture:** Add `ChallengeKernel` and `ExperienceDefinition` as shared contracts, separate cognitive Experience Grammar from Presentation Grammar, and introduce a generic composer plus a shared React runtime/session engine. Existing SP-01 and PW-MISSING-INFORMATION-01 become compatibility/conformance cases; the current Smart publication pipeline and G2 governance remain authoritative rather than being duplicated.

**Tech Stack:** Next.js 15.5.2, React 19.1.1, TypeScript 5.9.2, Node 22 in CI, pnpm 10.17.1, Playwright 1.55.0, existing Node `.mjs` validators/workflows, GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-10-03-atlas-experience-engine-design.md`

**Verified planning baselines (2026-10-03):**
- TRAMA main: `ecc26952e6392f93f12f09d24f33ea58ebc33ecd`
- TRAMA approved-spec branch head: `cf12c5cd7599b77ec2b951d14f21423ac809b259`
- Curriculum Atlas main: `db3fed294fe7695b33042192fd4551d6d36bdc68`
- Before execution, compare current heads with these baselines. If either main branch moved, inspect the diff and refresh affected file paths/tests before touching product code; do not silently execute this plan against an unknown baseline.

## Global Constraints

- Arena remains curriculum authority.
- Atlas remains the public/navigation/learning-experience surface.
- Docente OS remains teacher-first operational software.
- TRAMA governs cross-system contracts and evidence.
- No learner account, learner identifier, response API, learner DB write, analytics, profiling, advertising tracker, microphone, camera, location or contact access in Experience Engine v1.
- Learner state is `VOLATILE_MEMORY` or `LOCAL_DEVICE` only; local state must have explicit reset/restart semantics.
- No automatic Smart→Percorsi promotion and no automatic Atlas→Arena authority transfer.
- No second material/publication readiness truth: required-resource readiness continues to derive from the existing MaterialSet + canonical publication receipt chain.
- Successful CI, Q1/Q5/Q6/Q9 evidence or a public build never implies `RUNTIME_AUTHORIZED`.
- `DOS-A1` remains `RUNTIME_DEFERRED`.
- Preserve existing SP-01 and G2 behavior while adapting them to the shared contracts; no rewrite for architectural purity alone.
- Generic engine/factory files must not contain literals for `sistema-tecnologico`, `pw-missing-information-01`, or the two generality-proof cases.
- No new third-party runtime dependency is required for v1; follow the repository's current custom-validator pattern.

## Review Focus

1. **Corrupted or stale local learner state:** the runtime must reset safely to the entry scene and must never fall back to remote persistence. Covered in Task 4 Playwright tests.
2. **Unknown primitive, grammar, content ref or unreachable graph node:** validation must fail closed before runtime. Covered in Tasks 1–3.
3. **Unauthorized pathway accidentally becoming public:** the public catalog must expose only pathways whose existing governed scene graph says `RUNTIME_AUTHORIZED`; lab candidates remain noindex/unlinked. Covered in Task 9.
4. **“Generic” code becoming case-specific:** engine/composer tests must scan generic source for the four conformance IDs and fail if a special case leaks into shared code. Covered in Tasks 3 and 11.
5. **Publication receipts generated but canonical readiness staying stale:** receipt reconciliation must produce a reviewable canonical manifest change without auto-merge and be idempotent. Covered in Task 10.

---

## File Structure Locked by This Plan

### Shared contracts and engine
- Create `schemas/challenge-kernel.schema.json` — machine-readable ChallengeKernel v1 shape.
- Create `schemas/experience-definition.schema.json` — machine-readable ExperienceDefinition v1 shape.
- Create `src/features/experiences/model.ts` — runtime TypeScript model aligned with the two schemas.
- Create `scripts/lib/experience-contracts.mjs` — deterministic contract and graph validators used by CLI/tests/factory.
- Create `scripts/validate-experience-contracts.mjs` — CLI wrapper for contract fixtures.
- Create `scripts/build-experience-candidate.mjs` — generic deterministic composer/factory.
- Create `src/features/experiences/experience-runtime.tsx` — shared learner runtime.
- Create `src/features/experiences/use-experience-session.ts` — volatile/local session state only.
- Create `src/features/experiences/experience-runtime.css` — shared learner UI.
- Create `src/features/experiences/adapters/g2-pathway-adapter.ts` — resolves current G2 PathwayDefinition into runtime scenes.
- Create `src/features/experiences/adapters/smart-guided-adapter.ts` — resolves guided Smart definitions into runtime scenes.

### Governance/registries
- Create `governance/experience-grammar-registry.json` — exactly seven cognitive primitives.
- Modify `governance/percorsi-grammar-registry.json` — retain the eleven current labels as Presentation Grammar research/production strategies, not cognitive engines.
- Modify `governance/percorsi-portfolio.json` only after the second Percorso receives governed TRAMA authority evidence.

### Compatibility/conformance content
- Create `content/experience-kernels/smart/sistema-tecnologico.v1.json`.
- Create `content/experiences/smart/sistema-tecnologico.v1.json`.
- Create `content/experience-kernels/pathways/pw-missing-information-01.v1.json`.
- Create `content/experiences/pathways/pw-missing-information-01.v1.json`.

### Generality proofs
- Create Smart case `fonte-digitale`: “Una fonte digitale è affidabile?”
- Create Pathway case `pw-constraints-tradeoffs-01`: “Una soluzione, molti vincoli”.
- These cases must use only shared contracts, composer, runtime, validators and workflows.

### Tests/CI
- Create `scripts/test-experience-contracts.mjs`.
- Create `scripts/test-experience-grammar-registry.mjs`.
- Create `scripts/test-experience-factory.mjs`.
- Create `scripts/test-smart-flow.mjs` as the generic Smart qualification runner.
- Create `scripts/test-experience-generality.mjs`.
- Create `playwright.config.ts`.
- Create `tests/experience-runtime.spec.ts`.
- Create `.github/workflows/experience-engine.yml`.
- Modify `package.json` to expose deterministic commands used locally and in CI.

---

### Task 1: Add ChallengeKernel and ExperienceDefinition contracts

**Files:**
- Create: `schemas/challenge-kernel.schema.json`
- Create: `schemas/experience-definition.schema.json`
- Create: `src/features/experiences/model.ts`
- Create: `scripts/lib/experience-contracts.mjs`
- Create: `scripts/validate-experience-contracts.mjs`
- Create: `scripts/test-experience-contracts.mjs`
- Create: `fixtures/experience-engine/contracts/valid/challenge-kernel.json`
- Create: `fixtures/experience-engine/contracts/valid/experience-smart.json`
- Create: `fixtures/experience-engine/contracts/valid/experience-pathway.json`
- Create: `fixtures/experience-engine/contracts/invalid/learner-telemetry.json`
- Create: `fixtures/experience-engine/contracts/invalid/unknown-target.json`
- Modify: `package.json`

**Interfaces:**
- Produces `validateChallengeKernel(value) -> { valid: boolean, errors: string[] }`.
- Produces `validateExperienceDefinition(value) -> { valid: boolean, errors: string[] }`.
- Produces `validateExperienceGraph(graph, { mode }) -> { valid: boolean, errors: string[] }`.
- TypeScript exports: `ChallengeKernel`, `ExperienceDefinition`, `ExperienceMode`, `ExperiencePrimitive`, `RuntimeStatePolicy`.

- [ ] **Step 1: Write the failing contract tests.**

Assertions must prove:
- schema IDs are exactly `atlas.challenge-kernel/v1` and `atlas.experience/v1`;
- mode is only `SMART | PATHWAY`;
- primitives are only `EXPLORE | CHOOSE | CONNECT | BUILD | INVESTIGATE | REFRAME | TRANSFER`;
- `learnerIdentityRequired` must be `false`;
- `telemetryAllowed` must be `false`;
- unknown transition targets fail;
- a PATHWAY without at least one `TRANSFER` scene fails;
- a SMART experience may be linear.

- [ ] **Step 2: Run the tests and verify they fail.**

Run: `node scripts/test-experience-contracts.mjs`  
Expected: FAIL because contract module/schemas do not yet exist.

- [ ] **Step 3: Implement the two schema files, TypeScript model, and validator signatures.**

Keep validation deterministic and dependency-free. Do not introduce readiness fields into `ExperienceDefinition`; readiness is resolved from existing MaterialSet/publication evidence.

- [ ] **Step 4: Add the CLI wrapper and package commands.**

Add:
- `validate:experience:contracts`
- `test:experience:contracts`

- [ ] **Step 5: Run contract tests.**

Run: `pnpm test:experience:contracts && pnpm typecheck`  
Expected: PASS.

- [ ] **Step 6: Commit.**

```bash
git add schemas src/features/experiences/model.ts scripts/lib/experience-contracts.mjs scripts/validate-experience-contracts.mjs scripts/test-experience-contracts.mjs fixtures/experience-engine package.json
git commit -m "feat(atlas): add experience engine contracts"
```

---

### Task 2: Separate cognitive Experience Grammar from Presentation Grammar

**Files:**
- Create: `governance/experience-grammar-registry.json`
- Modify: `governance/percorsi-grammar-registry.json`
- Create: `scripts/test-experience-grammar-registry.mjs`
- Modify: `package.json`

**Interfaces:**
- `experience-grammar-registry.json` is canonical for the seven cognitive primitive IDs.
- `percorsi-grammar-registry.json` retains the eleven current narrative labels as presentation strategies.
- Task 3 consumes both registries.

- [ ] **Step 1: Write the failing registry test.**

Assert exactly seven unique cognitive primitive IDs and that none of the eleven existing presentation IDs appears as a cognitive primitive.

- [ ] **Step 2: Run the test and verify failure.**

Run: `node scripts/test-experience-grammar-registry.mjs`  
Expected: FAIL because the cognitive registry does not exist/current registry is still `RESEARCH_REGISTRY`.

- [ ] **Step 3: Create the cognitive registry and reclassify the current Percorsi registry.**

Preserve all eleven current labels and provenance; change their semantics/status to Presentation Grammar. Do not create eleven renderers.

- [ ] **Step 4: Add registry validation to `validateExperienceDefinition`.**

Unknown cognitive primitive or presentation grammar reference must fail closed.

- [ ] **Step 5: Run tests.**

Run: `pnpm test:experience:contracts && node scripts/test-experience-grammar-registry.mjs`  
Expected: PASS.

- [ ] **Step 6: Commit.**

```bash
git add governance scripts/test-experience-grammar-registry.mjs scripts/lib/experience-contracts.mjs package.json
git commit -m "feat(atlas): separate experience and presentation grammars"
```

---

### Task 3: Build the generic deterministic composer and preserve the existing Percorsi factory

**Files:**
- Create: `scripts/build-experience-candidate.mjs`
- Create: `scripts/test-experience-factory.mjs`
- Modify: `scripts/build-percorsi-pathway-candidate.mjs`
- Modify: `scripts/test-percorsi-pathway-factory.mjs`
- Modify: `schemas/percorsi-pathway-seed.schema.json`
- Modify: `.github/workflows/percorsi-portfolio-factory.yml`
- Modify: `package.json`

**Interfaces:**
- Produce `buildExperienceCandidate(seed, options = {}) -> ExperienceDefinition`.
- Preserve public exports `buildPathwayCandidate(seed, options)` and `buildDossier(seed)` for compatibility.
- The Percorsi adapter maps generic scenes back to current G2 `PathwayDefinition` so `validate-g2-pathway.mjs` stays authoritative during migration.

- [ ] **Step 1: Write failing factory tests.**

Test two synthetic seeds with different primitive sequences and branch structures. Assert deterministic output and no hard-coded four-node sequence.

- [ ] **Step 2: Add the anti-special-case assertion.**

Read `scripts/build-experience-candidate.mjs` and `scripts/lib/experience-contracts.mjs`; fail if they contain `sistema-tecnologico`, `pw-missing-information-01`, `fonte-digitale`, or `pw-constraints-tradeoffs-01`.

- [ ] **Step 3: Run tests and verify failure.**

Run: `node scripts/test-experience-factory.mjs`  
Expected: FAIL because the generic composer is absent.

- [ ] **Step 4: Implement `buildExperienceCandidate` and refactor the existing Percorsi builder into an adapter.**

The existing `orient → practice → transfer → reflect` sequence must no longer be hard-coded in shared generation logic. Preserve `NOT_RUNTIME_AUTHORIZED`, `learnerNetworkWrite=forbidden`, `learnerTelemetry=forbidden`.

- [ ] **Step 5: Run old and new factory tests plus G2 validator.**

Run: `node scripts/test-experience-factory.mjs && node scripts/test-percorsi-pathway-factory.mjs && pnpm validate:percorsi:g2`  
Expected: PASS.

- [ ] **Step 6: Commit.**

```bash
git add scripts schemas .github/workflows/percorsi-portfolio-factory.yml package.json
git commit -m "refactor(atlas): generalize experience candidate factory"
```

---

### Task 4: Implement the shared learner runtime and session engine

**Files:**
- Create: `src/features/experiences/experience-runtime.tsx`
- Create: `src/features/experiences/use-experience-session.ts`
- Create: `src/features/experiences/experience-runtime.css`
- Create: `src/features/experiences/adapters/g2-pathway-adapter.ts`
- Create: `src/features/experiences/adapters/smart-guided-adapter.ts`
- Create: `src/app/experience-lab/conformance/page.tsx`
- Create: `playwright.config.ts`
- Create: `tests/experience-runtime.spec.ts`
- Modify: `package.json`

**Interfaces:**
- `<ExperienceRuntime definition={definition} presentationGrammarId={id} />`.
- `useExperienceSession({ experienceId, entryNodeId, statePolicy })` returns `currentNodeId`, `responses`, `visitedNodeIds`, `completion`, `choose`, `writeResponse`, `proceed`, `restart`.
- `LOCAL_DEVICE` uses namespaced localStorage only; `VOLATILE_MEMORY` never reads/writes localStorage.

- [ ] **Step 1: Write Playwright tests before the component exists.**

Cover keyboard completion, focus moving to the new scene heading, feedback `role=status`, restart, corrupt-localStorage recovery, and mobile viewport 390×844.

- [ ] **Step 2: Add the network-write guard test.**

After initial GET/static resource loads, fail the test if the page emits POST/PUT/PATCH/DELETE or sends learner responses via fetch/XHR/beacon.

- [ ] **Step 3: Run Playwright and verify failure.**

Run: `pnpm exec playwright test tests/experience-runtime.spec.ts --project=chromium`  
Expected: FAIL because the conformance route/runtime is absent.

- [ ] **Step 4: Implement the minimal shared runtime/session engine.**

Support v1 interaction shapes needed by the conformance cases: choice, text response, continue/review, terminal summary. Primitive controls cognition; interaction shape controls the UI widget.

- [ ] **Step 5: Run runtime tests, typecheck and lint.**

Run: `pnpm exec playwright test tests/experience-runtime.spec.ts --project=chromium && pnpm typecheck && pnpm lint`  
Expected: PASS.

- [ ] **Step 6: Commit.**

```bash
git add src/features/experiences src/app/experience-lab playwright.config.ts tests package.json
git commit -m "feat(atlas): add shared experience runtime"
```

---

### Task 5: Adapt SP-01 to the shared engine and remove the Smart-flow special case

**Files:**
- Create: `content/experience-kernels/smart/sistema-tecnologico.v1.json`
- Create: `content/experiences/smart/sistema-tecnologico.v1.json`
- Create: `scripts/test-smart-flow.mjs`
- Modify: `scripts/test-smart-flow-sp01.mjs`
- Modify: `src/app/attivita/sistema-tecnologico/page.tsx`
- Modify: `src/app/attivita/sistema-tecnologico/sistema-tecnologico.css`
- Preserve: `content/smart-activities/sistema-tecnologico/material-set.v2.json`
- Modify: `package.json`

**Interfaces:**
- Generic CLI: `node scripts/test-smart-flow.mjs --experience <experience.json> --material-set <material-set.json>`.
- `test-smart-flow-sp01.mjs` becomes a thin compatibility invocation, not a second validator.

- [ ] **Step 1: Write failing compatibility assertions.**

Assert SP-01 has seven learner steps represented through shared primitives/interactions, still uses `LOCAL_DEVICE`, and still points to the existing MaterialSet v2.

- [ ] **Step 2: Run current SP-01 qualification plus new compatibility test.**

Run: `pnpm test:smart:sp01 && node scripts/test-smart-flow.mjs --experience content/experiences/smart/sistema-tecnologico.v1.json --material-set content/smart-activities/sistema-tecnologico/material-set.v2.json`  
Expected before implementation: new command fails; legacy command still passes.

- [ ] **Step 3: Create the kernel/experience definitions and adapt the page to `ExperienceRuntime`.**

Preserve the learner copy, local-only answers, summary, review and restart semantics unless the shared contract requires a strictly equivalent representation.

- [ ] **Step 4: Generalize Smart qualification.**

Move all path-independent checks from `test-smart-flow-sp01.mjs` into `test-smart-flow.mjs`. The compatibility wrapper may contain the SP-01 paths; the generic script may not contain the activity ID.

- [ ] **Step 5: Run SP-01 regression and browser tests.**

Run: `pnpm test:smart:sp01 && pnpm validate:smart && pnpm exec playwright test tests/experience-runtime.spec.ts --project=chromium`  
Expected: PASS.

- [ ] **Step 6: Commit.**

```bash
git add content/experience-kernels content/experiences scripts/test-smart-flow.mjs scripts/test-smart-flow-sp01.mjs src/app/attivita/sistema-tecnologico package.json
git commit -m "refactor(atlas): run SP-01 on shared experience engine"
```

---

### Task 6: Adapt PW-MISSING-INFORMATION-01 to the shared engine without changing authority

**Files:**
- Create: `content/experience-kernels/pathways/pw-missing-information-01.v1.json`
- Create: `content/experiences/pathways/pw-missing-information-01.v1.json`
- Modify: `src/features/pathways/pw-missing-information-01/pathway-g2-prototype.tsx`
- Modify: `src/app/percorsi/lab/pw-missing-information-01/page.tsx`
- Modify: `tests/experience-runtime.spec.ts`
- Preserve/validate: `docs/percorsi/PERCORSI-G2-CONTRACT.md`
- Preserve/validate: `scripts/validate-g2-pathway.mjs`

**Interfaces:**
- The existing exported `MissingInformationPathwayG2Prototype` remains available as a thin compatibility wrapper around `ExperienceRuntime`.
- L/N remain Presentation Grammars with equal semantic coverage.
- Runtime remains `NOT_RUNTIME_AUTHORIZED` and lab route remains `robots: noindex, nofollow`.

- [ ] **Step 1: Add failing tests for the full conformance sequence.**

Assert genuine branching from entry, revision back to entry, transfer to a changed context, terminal completion, L/N semantic parity and no learner network write.

- [ ] **Step 2: Run tests and capture expected failure.**

Run: `pnpm exec playwright test tests/experience-runtime.spec.ts --project=chromium`  
Expected: new shared-engine pathway assertions fail before adaptation.

- [ ] **Step 3: Add the governed kernel/experience definitions and G2 adapter.**

Do not alter the portfolio state or runtime authorization.

- [ ] **Step 4: Refactor the existing prototype component into a compatibility wrapper.**

Remove duplicated navigation/session logic from the pathway-specific component; pathway-specific content remains data.

- [ ] **Step 5: Run G2, factory and browser regressions.**

Run: `pnpm validate:percorsi:g2 && node scripts/test-percorsi-pathway-factory.mjs && pnpm exec playwright test tests/experience-runtime.spec.ts --project=chromium`  
Expected: PASS.

- [ ] **Step 6: Commit.**

```bash
git add content/experience-kernels/pathways content/experiences/pathways src/features/pathways src/app/percorsi/lab tests
git commit -m "refactor(atlas): run first Percorso on shared engine"
```

---

### Task 7: Generality Proof A — second unrelated Smart Activity

**Case fixed by this plan:** `fonte-digitale` — **“Una fonte digitale è affidabile?”**

**Files:**
- Create: `content/experience-kernels/smart/fonte-digitale.v1.json`
- Create: `content/experiences/smart/fonte-digitale.v1.json`
- Create: `content/smart-activities/fonte-digitale/material-set.v1.json`
- Create: `public/materials/smart/fonte-digitale/v1/segnali-affidabilita.svg`
- Create: `src/app/attivita/fonte-digitale/page.tsx`
- Create: `src/app/attivita/fonte-digitale/fonte-digitale.css`
- Modify: `scripts/test-experience-generality.mjs`
- Modify: `tests/experience-runtime.spec.ts`

**Interfaces:**
- Kernel exercises source/evidence/date/purpose checks and ends with transfer to a materially different digital source.
- Uses the same `test-smart-flow.mjs`, asset registration/publication contracts and runtime; no new Smart-specific workflow or validator is allowed.

- [ ] **Step 1: Write the generality test first.**

The test must run the generic Smart qualification against both SP-01 and `fonte-digitale`, then scan `.github/workflows` and generic engine scripts to ensure there is no new `fonte-digitale`-specific workflow/branch.

- [ ] **Step 2: Run and verify failure.**

Run: `node scripts/test-experience-generality.mjs`  
Expected: FAIL because the second case does not exist.

- [ ] **Step 3: Add the kernel, experience, one governed required SVG material and route.**

The SVG must be self-hosted and pass the existing digest/publication path/provenance checks.

- [ ] **Step 4: Run generic Smart and runtime tests.**

Run: `node scripts/test-smart-flow.mjs --experience content/experiences/smart/fonte-digitale.v1.json --material-set content/smart-activities/fonte-digitale/material-set.v1.json && pnpm exec playwright test tests/experience-runtime.spec.ts --project=chromium`  
Expected: PASS except canonical public receipt state before deployment; unresolved public refs must remain fail-closed/not-ready.

- [ ] **Step 5: Run the generality test.**

Run: `node scripts/test-experience-generality.mjs`  
Expected: Smart generality section PASS.

- [ ] **Step 6: Commit.**

```bash
git add content public/materials/smart/fonte-digitale src/app/attivita/fonte-digitale scripts/test-experience-generality.mjs tests
git commit -m "test(atlas): prove smart experience generality"
```

---

### Task 8: Generality Proof B — second materially different Percorso with governed authority

**Case fixed by this plan:** `pw-constraints-tradeoffs-01` — **“Una soluzione, molti vincoli”**

**Competence:** progettare una soluzione valutando vincoli e compromessi e rivederla quando cambia un requisito.

**Territories:** `design`, `world`.

**Primitive emphasis:** `EXPLORE → CONNECT → BUILD → REFRAME → TRANSFER`; this must not copy the missing-information pathway's decision structure.

**TRAMA files:**
- Create: `docs/capabilities/atlas-percorsi/pathways/PW-CONSTRAINTS-TRADEOFFS-01/dossier-v1.md`
- Modify: `docs/capabilities/atlas-percorsi/workflow/CANONICAL-INDEX-v1.md`

**Atlas files after governed TRAMA approval:**
- Modify: `governance/percorsi-portfolio.json`
- Create: `fixtures/percorsi-factory/valid/constraints-tradeoffs.seed.json`
- Create: `content/experience-kernels/pathways/pw-constraints-tradeoffs-01.v1.json`
- Create: `content/experiences/pathways/pw-constraints-tradeoffs-01.v1.json`
- Modify: `scripts/test-experience-generality.mjs`

**Interfaces:**
- TRAMA dossier is `PROPOSED / NOT_RUNTIME_AUTHORIZED`; creating it does not authorize Atlas registration by itself.
- Atlas portfolio entry is added only after the TRAMA proposal receives explicit Human Review and an exact authority head.

- [ ] **Step 1: Prove the factory still rejects an unregistered pathway.**

Add/retain an assertion that `buildPathwayCandidate` rejects `pw-constraints-tradeoffs-01` while absent from `percorsi-portfolio.json`.

- [ ] **Step 2: Create the TRAMA proposal and canonical-index entry on a separate governed branch/PR.**

Record purpose, territories, competence, no-tracking/privacy constraints and `NOT_RUNTIME_AUTHORIZED`.

- [ ] **Step 3: Stop at the authority gate.**

Human Review must approve the exact TRAMA head before Atlas portfolio registration. This is the one required authority decision in this task; no runtime decision is requested.

- [ ] **Step 4: After approval, register the pathway in Atlas with the exact TRAMA authority reference.**

Keep state `IMPLEMENTATION_CANDIDATE` or the currently governed equivalent; never `RUNTIME_AUTHORIZED`.

- [ ] **Step 5: Create the seed/kernel/experience using only the generic factory and shared runtime.**

No new pathway-specific engine file is allowed.

- [ ] **Step 6: Run generality and G2 validation.**

Run: `node scripts/test-experience-generality.mjs && node scripts/test-percorsi-pathway-factory.mjs && pnpm validate:percorsi:g2`  
Expected: both Percorsi cases PASS and shared engine source remains free of case IDs.

- [ ] **Step 7: Commit Atlas changes.**

```bash
git add governance/percorsi-portfolio.json fixtures/percorsi-factory/valid/constraints-tradeoffs.seed.json content/experience-kernels/pathways content/experiences/pathways scripts/test-experience-generality.mjs
git commit -m "test(atlas): prove pathway factory generality"
```

---

### Task 9: Replace the public Percorsi placeholder with a governed catalog that cannot leak candidates

**Files:**
- Create: `src/features/pathways/load-public-pathways.ts`
- Create: `src/features/pathways/pathway-catalog.tsx`
- Create: `src/features/pathways/pathway-catalog.css`
- Modify: `src/app/percorsi/page.tsx`
- Modify: `tests/experience-runtime.spec.ts`

**Interfaces:**
- `loadPublicPathways() -> PublicPathwaySummary[]`.
- A pathway is public only when its existing governed PathwayDefinition/experience graph has `authorizationState === "RUNTIME_AUTHORIZED"`.
- `IMPLEMENTATION_CANDIDATE`, `PROTOTYPE_ONLY`, missing authorization and lab-only entries return no launch URL.

- [ ] **Step 1: Write failing catalog tests.**

With both known pathways still unauthorized, assert the public page exposes zero “Inizia” links to lab/candidate routes and does not contain `/percorsi/lab/` anchors.

- [ ] **Step 2: Add a positive fixture for the loader only.**

A synthetic `RUNTIME_AUTHORIZED` fixture must produce a launchable summary; do not change any real pathway authorization.

- [ ] **Step 3: Run tests and verify failure against the current foundation placeholder.**

Run: `pnpm exec playwright test tests/experience-runtime.spec.ts --project=chromium`  
Expected: catalog-specific assertions fail before implementation.

- [ ] **Step 4: Implement the catalog/loader and replace foundation copy.**

When zero pathways are authorized, show a real empty state such as “Nessun percorso è ancora autorizzato per l’uso pubblico” plus explanatory copy; do not advertise candidate routes.

- [ ] **Step 5: Run browser/build tests.**

Run: `pnpm exec playwright test tests/experience-runtime.spec.ts --project=chromium && pnpm build`  
Expected: PASS.

- [ ] **Step 6: Commit.**

```bash
git add src/features/pathways src/app/percorsi/page.tsx tests
git commit -m "feat(atlas): add governed public pathway catalog"
```

---

### Task 10: Make Smart publication receipts persist as reviewable canonical state

**Files:**
- Create: `scripts/reconcile-smart-publication-receipts.mjs`
- Create: `scripts/test-smart-publication-reconciliation.mjs`
- Create: `.github/workflows/smart-publication-reconcile-pr.yml`
- Modify: `scripts/apply-smart-asset-receipt.mjs` only to expose reusable pure reconciliation logic; preserve CLI compatibility.
- Modify: `.github/workflows/s1-preview-launcher.yml`
- Modify: `package.json`

**Interfaces:**
- `reconcileReceiptDirectory({ manifestPaths, receiptDir }) -> { changedManifests, unchangedManifests }`.
- Reconciliation applies only receipts whose materialSetId/version/resourceId/digest/audience/provenance match the manifest.
- Workflow may create a draft reconciliation PR; it must never merge it.
- A second run with the same receipts must produce zero changes.

- [ ] **Step 1: Write failing reconciliation tests.**

Cover matching receipt, digest mismatch, wrong material set/version, missing receipt, idempotent second run, and preserving `humanDecisionRequired`.

- [ ] **Step 2: Run tests and verify failure.**

Run: `node scripts/test-smart-publication-reconciliation.mjs`  
Expected: FAIL because the reconciler does not exist.

- [ ] **Step 3: Extract reusable receipt application logic and implement directory reconciliation.**

Do not create a new readiness concept; continue to derive `packageReady` from resolved required resources as the current MaterialSet contract does.

- [ ] **Step 4: Add the post-deploy reconciliation workflow.**

Use GitHub Actions/GITHUB_TOKEN only; no GitHub App. Download the Smart publication receipt artifact from the completed canonical Pages deploy, apply it to a branch, and open/update a **draft PR** only when files change. Permissions are limited to `actions: read`, `contents: write`, `pull-requests: write`.

- [ ] **Step 5: Add loop/idempotence protection.**

Merging a reconciliation PR may trigger Pages again; the subsequent reconciliation run must detect identical canonical state and create no new PR/commit.

- [ ] **Step 6: Run tests and static workflow review.**

Run: `node scripts/test-smart-publication-reconciliation.mjs && pnpm validate:smart`  
Expected: PASS.

- [ ] **Step 7: Commit.**

```bash
git add scripts/apply-smart-asset-receipt.mjs scripts/reconcile-smart-publication-receipts.mjs scripts/test-smart-publication-reconciliation.mjs .github/workflows/smart-publication-reconcile-pr.yml .github/workflows/s1-preview-launcher.yml package.json
git commit -m "feat(atlas): reconcile smart publication receipts by review PR"
```

---

### Task 11: Add one generic Experience Engine CI lane and complete the two generality proofs

**Files:**
- Create: `.github/workflows/experience-engine.yml`
- Modify: `package.json`
- Modify: `scripts/test-experience-generality.mjs`

**Interfaces:**
- One CI lane validates contracts, registries, factory, Smart generality, Percorsi generality, typecheck, lint and browser conformance.
- No activity/pathway-specific CI workflow may be added for either proof case.

- [ ] **Step 1: Add a failing completeness assertion to `test-experience-generality.mjs`.**

It must require exactly:
- SP-01 compatibility case;
- `fonte-digitale` Smart proof;
- PW-MISSING compatibility case;
- `pw-constraints-tradeoffs-01` Percorso proof.

It must also scan generic scripts/workflows for forbidden case IDs.

- [ ] **Step 2: Create `experience-engine.yml`.**

Run Node 22 + pnpm 10.17.1, install dependencies, then execute:
`pnpm test:experience:contracts`,
grammar registry test,
factory tests,
`pnpm validate:smart`,
generic Smart tests for both cases,
`pnpm validate:percorsi:g2`,
generality test,
`pnpm typecheck`,
`pnpm lint`,
`pnpm build`,
Playwright chromium conformance.

- [ ] **Step 3: Run the same suite locally.**

Expected: all PASS. If browser binaries are absent, install Chromium for the test environment; do not weaken the browser gate.

- [ ] **Step 4: Commit.**

```bash
git add .github/workflows/experience-engine.yml package.json scripts/test-experience-generality.mjs
git commit -m "ci(atlas): qualify shared experience engine"
```

---

### Task 12: Reconcile evidence into TRAMA without promoting runtime

**TRAMA files:**
- Modify: `docs/superpowers/specs/2026-10-03-atlas-experience-engine-design.md`
- Create: `docs/evidence/atlas-experience-engine-v1-evidence.md`
- Modify the relevant Atlas Percorsi capability index under `docs/capabilities/atlas-percorsi/`
- Update the 2026-10-03 capability audit artifact associated with PR #215 only with evidence actually produced.

**Interfaces:**
- Evidence document records exact Atlas implementation head, CI run URLs/IDs, four conformance cases, Smart publication reconciliation behavior and remaining runtime gates.
- Status after implementation is at most `IMPLEMENTATION_QUALIFIED / NOT_RUNTIME_AUTHORIZED` unless a separate Human Review explicitly changes runtime authority.

- [ ] **Step 1: Write the evidence document from actual results, not expected results.**

No PASS may be recorded without an inspectable test/CI output.

- [ ] **Step 2: Update the design spec implementation status.**

Record exact implementation head and whether both generality proofs passed; preserve `DOS-A1=RUNTIME_DEFERRED`.

- [ ] **Step 3: Reconcile the broader audit.**

A14/Percorsi may move from “partial infrastructure” toward “implementation qualified” only to the extent demonstrated. Public student runtime remains a separate item until explicitly authorized.

- [ ] **Step 4: Run repository documentation/governance checks available on the exact TRAMA head.**

Expected: PASS before any integration decision.

- [ ] **Step 5: Commit the evidence reconciliation on a TRAMA branch and open a draft PR.**

Do not merge automatically.

---

## End-to-End Verification Before Completion Claim

Run on the exact Atlas implementation head:

```bash
pnpm test:experience:contracts
node scripts/test-experience-grammar-registry.mjs
node scripts/test-experience-factory.mjs
node scripts/test-percorsi-pathway-factory.mjs
pnpm validate:smart
pnpm test:smart:sp01
node scripts/test-smart-flow.mjs --experience content/experiences/smart/fonte-digitale.v1.json --material-set content/smart-activities/fonte-digitale/material-set.v1.json
pnpm validate:percorsi:g2
node scripts/test-experience-generality.mjs
node scripts/test-smart-publication-reconciliation.mjs
pnpm typecheck
pnpm lint
pnpm build
pnpm exec playwright test tests/experience-runtime.spec.ts --project=chromium
```

Then verify:
- no generic engine/composer/workflow source contains any conformance-case ID;
- public `/percorsi` exposes no unauthorized pathway;
- both Smart pages send no learner writes;
- both Percorsi candidates remain `NOT_RUNTIME_AUTHORIZED`;
- Smart receipt reconciliation is idempotent and only proposes a draft PR;
- no second readiness state exists;
- DOS-A1 remains RUNTIME_DEFERRED.

## Implementation Boundary

Completion of this plan means the shared engine is implemented and qualified as an implementation candidate. It does **not** mean:
- merge is automatically approved;
- PW-MISSING-INFORMATION-01 or the second Percorso is authorized for students;
- any pathway is automatically listed as publicly launchable;
- Arena authority changes;
- Smart content is automatically promoted into Percorsi;
- DOS-A1 is activated.

A separate Human Review on the exact implementation/evidence heads is required for integration, and a separate runtime-promotion decision is required for any Percorso student release.
