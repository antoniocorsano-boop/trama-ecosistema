# TRAMA Ecosystem State Map v0.3 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Materialize the approved TRAMA ecosystem state v0.3 as a governed machine-readable graph, project it deterministically into the read-only Control Center, and add the derived **AS IS → GAP → TO BE** view without creating new authority or promoting unsupported runtime flows.

**Architecture:** Keep `governance/access/trama-ecosystem-state-v0.3.json` as the authority for ecosystem topology and realization state. The existing maturity, capability-lifecycle, evidence and decision registries remain separate authorities; the snapshot builder resolves references into a new `ecosystemGraph` projection inside `control-center/data/ecosystem-snapshot.json`. The Control Center consumes only that validated projection and computes the GAP view from the same `nodes[]/flows[]`, never from a second manually maintained dataset.

**Tech Stack:** Python 3, JSON Schema draft 2020-12, existing TRAMA snapshot builder, React 19, TypeScript 7, Vite 8, Vitest 5, XYFlow 12, Playwright 1.63, axe-core, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-10-17-trama-ecosystem-state-v0.3-design.md`

## Global Constraints

- Canonical realization states remain exactly: `REAL`, `PARTIAL`, `DESIGNED`, `DEFERRED`.
- `DEFERRED` requires an explicit governed decision reference; `DOS-A1=RUNTIME_DEFERRED` remains invariant.
- Node state and flow state are independent; a real product does not promote adjacent flows.
- Maturity is referenced through `maturityRef`; no node-local invented maturity score and no overall ecosystem percentage.
- `authorityOwner` is a stable single-domain identifier or `null`; when `null`, `authorityRefs[]` must be non-empty.
- `implementationOwners[]` never transfers product authority.
- External actors must be explicitly declared; renderers may not synthesize endpoints.
- Evidence is reference-based and retrievable; no second evidence registry is introduced.
- TRAMA Access is `PARTIAL`, not `REAL`, until a live professional user journey is proved end-to-end.
- No TRAMA Access federation flow is promoted merely because the Access runtime exists.
- Control Center remains read-only, snapshot-first, no browser-side GitHub/Supabase queries, no automatic promotion.
- `governance/access/trama-ecosystem-state-v0.2.json` and its evidence remain immutable historical baseline.
- No public deploy, Gateway cutover, live Access pilot execution, privileged Control Center implementation, learner account, nominal student tracking or DOS-A1 runtime is authorized by this plan.
- Snapshot schema version moves from `1.6.0` to `1.7.0` only when the new projection is present and fully validated.

## Review Focus

1. **False promotion of Access:** source code, healthy Supabase infrastructure or successful CI must never make `trama_access`, `professional_identity` or a federation flow `REAL`; tests must pin `PARTIAL`/`DESIGNED` boundaries.
2. **Synthetic topology:** unresolved endpoints, undeclared external actors or renderer-created edges must fail validation rather than appear in the UI.
3. **Authority leakage:** joint flows with `authorityOwner=null` require governed `authorityRefs[]`; Arena curriculum authority must remain explicit through Atlas/Docente OS integrations.
4. **Reference drift:** missing evidence paths, unknown maturity refs and stale canonical snapshot projections must fail CI.
5. **Degraded/mobile UI:** invalid/unavailable snapshots must fail closed without inferred relations; graph and GAP information must remain usable at desktop, phone, LIM and 320px reflow with no horizontal overflow and zero axe violations.

---

### Task 1: Establish the v0.3 graph contract and validator

**Files:**
- Create: `schemas/trama-ecosystem-state-v0.3.schema.json`
- Create: `scripts/validate_ecosystem_state_v03.py`
- Create: `scripts/test_ecosystem_state_v03_contract.py`

**Interfaces:**
- Consumes: approved spec and `governance/maturity/trama-maturity-reconciliation-v1.json`.
- Produces: `validate_graph(document: dict, root: Path) -> None` and a standalone CLI that validates the canonical graph file by default.

- [ ] **Step 1: Write the failing contract tests.**

`test_ecosystem_state_v03_contract.py` must create minimal fixtures and assert rejection of: unknown realization state; duplicate node/flow IDs; flow endpoint absent from both nodes and `externalActors`; `DEFERRED` without decision reference; `authorityOwner=null` with empty `authorityRefs`; unknown `maturityRef`; missing evidence/source path; and a non-terminal target with an empty/uninformative gap. It must assert acceptance of a joint-authority flow with non-empty `authorityRefs` and a declared external actor.

- [ ] **Step 2: Run RED.**

Run: `python scripts/test_ecosystem_state_v03_contract.py`

Expected: FAIL because the schema/validator does not exist.

- [ ] **Step 3: Implement the schema and validator.**

`schemas/trama-ecosystem-state-v0.3.schema.json` must pin `schemaVersion` to `trama.ecosystem.state/v0.3`, define finite enums for state and flow kind, require `externalActors`, `nodes`, `flows`, `views`, `transitionPolicy`, and encode the authority-owner conditional. `validate_ecosystem_state_v03.py` must perform cross-record checks JSON Schema cannot express cleanly: uniqueness, endpoint resolution, maturity-area resolution, repository-path evidence/source resolution, `DEFERRED` decision binding, no duplicate actor/node IDs, and `DOS-A1` deferral invariant when referenced.

- [ ] **Step 4: Run GREEN.**

Run: `python scripts/test_ecosystem_state_v03_contract.py`

Expected: `TRAMA_ECOSYSTEM_STATE_V03_CONTRACT_PASS`.

- [ ] **Step 5: Commit.**

```bash
git add schemas/trama-ecosystem-state-v0.3.schema.json scripts/validate_ecosystem_state_v03.py scripts/test_ecosystem_state_v03_contract.py
git commit -m "feat(governance): validate ecosystem state v0.3 contract"
```

---

### Task 2: Persist the v0.3 baseline and Access promotion evidence

**Files:**
- Create: `docs/evidence/access-01/trama-access-state-promotion-v0.3-2026-10-17.md`
- Create: `governance/access/trama-ecosystem-state-v0.3.json`
- Modify: `scripts/test_ecosystem_state_v03_contract.py`

**Interfaces:**
- Consumes: v0.2 graph, approved v0.3 spec, merged Access Phase 2 evidence, and the read-only live Supabase observation already established on 2026-10-17.
- Produces: the canonical graph that later snapshot tasks consume.

- [ ] **Step 1: Extend tests with the approved baseline assertions.**

Assert at minimum:

```python
nodes["trama_access"]["state"] == "PARTIAL"
nodes["professional_identity"]["state"] == "PARTIAL"
flows["gateway_to_trama_access"]["state"] == "DESIGNED"
flows["trama_access_to_docente_os"]["state"] == "DESIGNED"
flows["arena_to_curricolo_atlas"]["state"] == "REAL"
nodes["docente_os"]["maturityRef"] == "docente-os"
nodes["studio_atlas"]["maturityRef"] == "studio-atlas"
```

Also assert that `public` is declared as an external actor, every visualizable flow endpoint resolves, all joint authority records use `authorityRefs`, and no graph field contains email addresses, tokens, Supabase keys or student rosters.

- [ ] **Step 2: Run RED.**

Run: `python scripts/test_ecosystem_state_v03_contract.py`

Expected: FAIL because the canonical v0.3 file/evidence receipt is absent.

- [ ] **Step 3: Write the Access evidence receipt.**

Record only non-personal facts: Phase 2 runtime integrated via PR #271 / merge commit `4bf57b2fca78bed87db4a2f3f8734d0567835b3b`; dedicated `TRAMA Access` project observed `ACTIVE_HEALTHY` in `eu-central-1`; four applied migrations (`access_live`, `access_pilot_provision`, `access_magic_link_auth_method`, `access_pilot_claim_guard`); observed counts 0 for Auth users, principals, aliases, institutional contexts, entitlements, Access sessions and pilot claim. State explicitly that this supports `PARTIAL`, not `REAL`, and does not prove federation or live end-to-end login.

- [ ] **Step 4: Materialize `trama-ecosystem-state-v0.3.json`.**

Carry forward the v0.2 stable IDs where possible, add explicit `externalActors`, `boundary`, `targetState`, `authorityOwner`, `authorityRefs`, `implementationOwners`, `maturityRef`, reference-based `evidenceRefs`, governed `gap`, `target`, and `nextAllowedIntervention`. Use the exact node/flow states approved in the spec. Keep v0.2 untouched.

- [ ] **Step 5: Validate GREEN.**

Run:

```bash
python scripts/validate_ecosystem_state_v03.py
python scripts/test_ecosystem_state_v03_contract.py
```

Expected: both PASS; Access remains `PARTIAL`, federation remains `DESIGNED`.

- [ ] **Step 6: Commit.**

```bash
git add docs/evidence/access-01/trama-access-state-promotion-v0.3-2026-10-17.md governance/access/trama-ecosystem-state-v0.3.json scripts/test_ecosystem_state_v03_contract.py
git commit -m "feat(governance): materialize ecosystem state v0.3 baseline"
```

---

### Task 3: Project the canonical graph into the governed snapshot

**Files:**
- Modify: `scripts/build_ecosystem_snapshot_core.py`
- Modify: `scripts/build_ecosystem_snapshot.py`
- Modify: `schemas/ecosystem-snapshot.schema.json`
- Create: `scripts/test_ecosystem_graph_projection.py`
- Modify: `control-center/data/ecosystem-snapshot.json` only through the canonical builder

**Interfaces:**
- Consumes: `governance/access/trama-ecosystem-state-v0.3.json` and existing maturity areas/evidence.
- Produces: `snapshot["ecosystemGraph"]` with canonical nodes/flows plus read-only resolved maturity context; existing `capabilities[]` and `dependencies[]` remain backward compatible.

- [ ] **Step 1: Write the failing projection test.**

Test `build_snapshot(ROOT)` and assert:

```python
snapshot["schemaVersion"] == "1.7.0"
graph = snapshot["ecosystemGraph"]
graph["schemaVersion"] == "trama.ecosystem.state/v0.3"
graph["sourceRef"] == "governance/access/trama-ecosystem-state-v0.3.json"
```

Assert exact node/flow counts match the canonical source, no extra edge appears, `trama_access` is `PARTIAL`, Access→Docente OS is `DESIGNED`, and resolved maturity context for `docente_os` is L5 while the canonical graph itself still contains only `maturityRef`.

- [ ] **Step 2: Run RED.**

Run: `python scripts/test_ecosystem_graph_projection.py`

Expected: FAIL because `ecosystemGraph` is absent.

- [ ] **Step 3: Add `project_ecosystem_graph(graph_doc: dict, maturity_areas: list[dict]) -> dict` in `build_ecosystem_snapshot_core.py`.**

The function must copy topology/state fields 1:1, add `sourceRef`, and optionally materialize `maturityContext` from existing snapshot areas by reference. It must not infer missing owners, flows, evidence or lifecycle state.

- [ ] **Step 4: Wire source state and snapshot schema.**

Load and validate the v0.3 graph before projection. Add an `ecosystem-state-v0.3` sourceState entry with SHA-256. Add required `ecosystemGraph` to `schemas/ecosystem-snapshot.schema.json`, preserving all existing fields. Increment snapshot schema version to `1.7.0` and update existing version assertions such as `scripts/test_maturity_reconciliation.py`.

- [ ] **Step 5: Regenerate and verify.**

Run:

```bash
python scripts/test_ecosystem_graph_projection.py
python scripts/test_maturity_reconciliation.py
python scripts/build_ecosystem_snapshot.py --check
python scripts/build_ecosystem_snapshot.py --output control-center/data/ecosystem-snapshot.json
```

Expected: all PASS; generated graph equals the canonical topology semantically.

- [ ] **Step 6: Commit.**

```bash
git add scripts/build_ecosystem_snapshot_core.py scripts/build_ecosystem_snapshot.py schemas/ecosystem-snapshot.schema.json scripts/test_ecosystem_graph_projection.py scripts/test_maturity_reconciliation.py control-center/data/ecosystem-snapshot.json
git commit -m "feat(control-center): project governed ecosystem graph"
```

---

### Task 4: Add typed Control Center graph/GAP domain logic

**Files:**
- Modify: `apps/control-center/src/domain/snapshot/types.ts`
- Modify: `apps/control-center/src/domain/ecosystem/model.ts`
- Modify: `apps/control-center/src/domain/ecosystem/model.test.ts`

**Interfaces:**
- Consumes: validated `snapshot.ecosystemGraph`.
- Produces: `RealizationState`, `EcosystemGraphNode`, `EcosystemGraphFlow`, `EcosystemGraphProjection`, `GapEntry`, `selectGapEntries(graph, includeSafeguards=false)` and label/tone helpers used by UI components.

- [ ] **Step 1: Write failing Vitest cases.**

Add tests proving: graph nodes/flows are preserved exactly; a `PARTIAL → REAL` Access node appears in GAP entries; a `DESIGNED → REAL` Access→Docente OS flow appears; a terminal `REAL` node with no missing gap is omitted by default; `includeSafeguards=true` includes terminal entries whose `nextAllowedIntervention.action === "NONE"`; no dependency/capability record is converted into a graph flow.

- [ ] **Step 2: Run RED.**

Run: `cd apps/control-center && npm test -- --run src/domain/ecosystem/model.test.ts`

Expected: FAIL because graph types/selectors do not exist.

- [ ] **Step 3: Implement typed graph projection and selector.**

Keep existing capability/dependency types for compatibility. `toEcosystemModel(snapshot)` must expose both the legacy lifecycle/dependency model and `ecosystemGraph`; `selectGapEntries()` must derive rows solely from canonical nodes/flows using `state != targetState || gap.missing.length > 0` plus optional safeguards.

- [ ] **Step 4: Run GREEN and typecheck.**

Run:

```bash
cd apps/control-center
npm test -- --run src/domain/ecosystem/model.test.ts
npm run typecheck
```

Expected: PASS.

- [ ] **Step 5: Commit.**

```bash
git add apps/control-center/src/domain/snapshot/types.ts apps/control-center/src/domain/ecosystem/model.ts apps/control-center/src/domain/ecosystem/model.test.ts
git commit -m "feat(control-center): model ecosystem graph gaps"
```

---

### Task 5: Implement the Full State and AS IS → GAP → TO BE views

**Files:**
- Modify: `apps/control-center/src/features/ecosystem/EcosystemPage.tsx`
- Modify: `apps/control-center/src/features/ecosystem/EcosystemGraph.tsx`
- Create: `apps/control-center/src/features/ecosystem/EcosystemGapView.tsx`
- Create: `apps/control-center/src/features/ecosystem/EcosystemStateList.tsx`
- Modify: `apps/control-center/src/features/ecosystem/ecosystem.css`
- Create: `apps/control-center/src/features/ecosystem/EcosystemPage.test.tsx`

**Interfaces:**
- Consumes: Task 4 graph model and `selectGapEntries()`.
- Produces: two deterministic views on `/#/ecosystem`: **Mappa governata** and **AS IS → GAP → TO BE**; capability lifecycle remains available as secondary context, not topology authority.

- [ ] **Step 1: Write component RED tests.**

Mock a validated snapshot and assert: tabs/buttons for `Mappa governata` and `AS IS → GAP → TO BE`; Access displays `PARTIAL`, gap text and target `REAL`; Access→Docente OS remains `DESIGNED`; Docente OS terminal safeguard can be shown as `Nessun intervento ecosistemico ammesso`; an invalid load state renders “Snapshot non utilizzabile. Nessuna relazione viene inferita.” and no graph edge/list item.

- [ ] **Step 2: Run RED.**

Run: `cd apps/control-center && npm test -- --run src/features/ecosystem/EcosystemPage.test.tsx`

Expected: FAIL.

- [ ] **Step 3: Convert `EcosystemGraph` to canonical graph inputs.**

Signature becomes based on `nodes: EcosystemGraphNode[]` and `flows: EcosystemGraphFlow[]`. Node labels come from canonical nodes/external actors; edge IDs/states come only from `flows[]`. Preserve keyboard focus and the equivalent structured list; do not derive edges from `dependencies[]`.

- [ ] **Step 4: Implement `EcosystemStateList` and `EcosystemGapView`.**

`EcosystemStateList` is the accessible equivalent of the full graph and exposes state, authority/provenance and next action. `EcosystemGapView` renders each entry in four explicit columns/regions: `AS IS`, `GAP`, `TO BE`, `NEXT`; include a control for terminal safeguards but default to actionable gaps only.

- [ ] **Step 5: Integrate into `EcosystemPage` and CSS.**

Keep the existing read-only snapshot loading/degraded behavior. Summary numbers must be descriptive counts only (nodes, flows, open governed gaps), never a percentage. At <=800px use one-column cards/list; at 320px no required horizontal scrolling.

- [ ] **Step 6: Run GREEN.**

Run:

```bash
cd apps/control-center
npm test -- --run src/features/ecosystem/EcosystemPage.test.tsx src/domain/ecosystem/model.test.ts
npm run typecheck
npm run build
```

Expected: PASS.

- [ ] **Step 7: Commit.**

```bash
git add apps/control-center/src/features/ecosystem apps/control-center/src/domain/ecosystem/model.ts apps/control-center/src/domain/snapshot/types.ts
git commit -m "feat(control-center): add governed ecosystem gap view"
```

---

### Task 6: Certify accessibility, responsive behavior and visual evidence

**Files:**
- Modify: `apps/control-center/e2e/a4-ecosystem-evidence.spec.ts`
- Modify: `apps/control-center/e2e/a6-visual.spec.ts` if ecosystem is not already captured at all canonical viewports
- Update only intentional ecosystem visual baselines under `apps/control-center/e2e/a6-visual.spec.ts-snapshots/`

**Interfaces:**
- Consumes: Task 5 UI.
- Produces: browser evidence for graph/list parity and GAP view on desktop, phone, LIM and 320px reflow.

- [ ] **Step 1: Change E2E assertions first and obtain RED.**

Replace the old `Docente OS → Atlas / FUTURE_NOT_AUTHORIZED` assumptions with canonical v0.3 assertions. Verify `TRAMA Access` = `PARTIAL`, `TRAMA Access → Docente OS` = `DESIGNED`, switching to `AS IS → GAP → TO BE` exposes the Access gap, no percentage/overall score text exists, and the accessible state list contains every visual flow.

Run: `cd apps/control-center && npx playwright test e2e/a4-ecosystem-evidence.spec.ts --project=desktop`

Expected: FAIL before UI completion/baseline update.

- [ ] **Step 2: Verify all canonical viewports and axe.**

Run:

```bash
cd apps/control-center
npx playwright test e2e/a4-ecosystem-evidence.spec.ts
```

Expected: PASS on `desktop`, `phone`, `lim`, `reflow-320`; body width <= viewport+1; external request list empty; axe violations empty.

- [ ] **Step 3: Update visual regression evidence only after semantic E2E is GREEN.**

Run the existing a6 visual suite with screenshot update only for the ecosystem route if the baseline changed intentionally, then rerun without update and require exact PASS.

- [ ] **Step 4: Commit.**

```bash
git add apps/control-center/e2e/a4-ecosystem-evidence.spec.ts apps/control-center/e2e/a6-visual.spec.ts apps/control-center/e2e/a6-visual.spec.ts-snapshots
git commit -m "test(control-center): certify ecosystem state gap views"
```

---

### Task 7: Wire CI/governance, snapshot drift checks and final qualification receipt

**Files:**
- Modify: `.github/workflows/control-center-snapshot.yml`
- Modify: `.github/workflows/control-center-projection.yml`
- Modify: `.github/workflows/control-center-build.yml`
- Create: `docs/evidence/ecosystem-state-v0.3-qualification.md`
- Modify: `control-center/data/ecosystem-snapshot.json` only if canonical regeneration is required after final changes

**Interfaces:**
- Consumes: all prior tasks.
- Produces: exact-head CI gates that fail on graph/schema/reference drift and an evidence receipt for Human Review; no merge/deploy authority.

- [ ] **Step 1: Add path triggers and RED drift assertions.**

All relevant workflows must trigger on:

```text
governance/access/trama-ecosystem-state-v0.3.json
schemas/trama-ecosystem-state-v0.3.schema.json
scripts/validate_ecosystem_state_v03.py
scripts/test_ecosystem_state_v03_contract.py
scripts/test_ecosystem_graph_projection.py
docs/evidence/access-01/trama-access-state-promotion-v0.3-2026-10-17.md
```

Add snapshot drift equality for `ecosystemGraph`. Add a dedicated validation step running the two v0.3 Python tests before snapshot generation.

- [ ] **Step 2: Preserve read-only projection semantics.**

`control-center-projection.yml` may regenerate `/tmp/ecosystem-snapshot.json` but must keep `contents: read` and `git status --porcelain` clean. `control-center-build.yml` may continue its existing governed projection synchronization behavior; it must not mutate the canonical v0.3 graph or infer promotions.

- [ ] **Step 3: Run the full local qualification set.**

Run:

```bash
python scripts/validate_ecosystem_state_v03.py
python scripts/test_ecosystem_state_v03_contract.py
python scripts/test_ecosystem_graph_projection.py
python scripts/build_ecosystem_snapshot.py --check
python scripts/test_maturity_reconciliation.py
cd apps/control-center
npm ci
npm run check
npx playwright test e2e/a4-ecosystem-evidence.spec.ts
```

Expected: all PASS. Also inspect `git diff` to confirm v0.2 is unchanged and no product runtime outside Control Center/governance was modified.

- [ ] **Step 4: Write the qualification receipt.**

Record exact head, commands/run IDs when available, canonical graph digest, snapshot digest, Access `PARTIAL` boundary, federation `DESIGNED` boundary, zero synthetic edges, WCAG/viewport evidence, and explicit statement: `NO MERGE / NO PUBLIC DEPLOY / NO RUNTIME CUTOVER AUTHORIZED`.

- [ ] **Step 5: Commit.**

```bash
git add .github/workflows/control-center-snapshot.yml .github/workflows/control-center-projection.yml .github/workflows/control-center-build.yml docs/evidence/ecosystem-state-v0.3-qualification.md control-center/data/ecosystem-snapshot.json
git commit -m "ci(governance): qualify ecosystem state v0.3"
```

- [ ] **Step 6: Final branch review gate.**

Require fresh whole-branch review focused on authority/state promotion, reference integrity, privacy boundaries and Control Center non-authority. Do not merge or deploy on the strength of automated PASS alone; return the exact head and Human Review evidence for the explicit integration decision.

---

## Self-review result

- **Spec coverage:** schema, external actors, authority semantics, v0.2→v0.3 promotion evidence, nodes/flows baseline, maturity references, GAP/NEXT model, deterministic snapshot projection, read-only UI, accessible equivalent, transition safety, privacy and Human Review are all assigned to tasks.
- **Type consistency:** canonical source uses `nodes[]/flows[]`; snapshot projection is consistently named `ecosystemGraph`; UI domain uses `EcosystemGraphNode`/`EcosystemGraphFlow`; GAP rows are derived by `selectGapEntries()`.
- **Backward compatibility:** existing `capabilities[]` and `dependencies[]` stay in snapshot 1.7.0 for current consumers; they are not treated as the new topology authority.
- **No hidden second authority:** no manually maintained GAP dataset, no new maturity registry, no browser-side inference.
- **Execution boundary:** this plan stops at a qualified branch and Human Review package; merge, public deploy, Gateway cutover and live Access pilot remain separate decisions.
