# TRAMA Audit v1.3 — Studio Atlas Baseline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reconcile Studio Atlas and Visual Factory into the canonical TRAMA audit/status/Project Knowledge baseline without changing product behavior, runtime authority, publication state, or previously closed package outcomes.

**Architecture:** Treat this as a governance/state-projection change only. Add Studio Atlas as a first-level application domain, append additive A42–A49 audit findings, persist a source-bound v1.3 Project Knowledge event, and regenerate/update the existing Control Center projections while preserving all historical evidence and fail-closed authority boundaries.

**Tech Stack:** Markdown, JSON, Python `unittest`, existing TRAMA snapshot/Project Knowledge generation and validation tooling, GitHub Actions governance/Control Center checks.

**Spec:** `docs/superpowers/specs/2026-10-05-trama-audit-v1-3-studio-atlas-baseline-design.md`

## Global Constraints

- Baseline source is `main@36e7f105070ab69c09930ad27c64f05962ec170b`; implementation branch is `docs/audit-v1-3-studio-atlas-baseline`.
- Preserve A01–A41 historically; add A42–A49 as v1.3 delta rather than rewriting prior findings.
- Studio Atlas becomes a first-level application domain but gains no Arena, Docente OS, Atlas-publication, TRAMA-governance, provider/GPU, or student-identity authority.
- Preserve P1/P2/P3/P6 closure states unless contradictory fresh evidence appears.
- Keep P4 Argo G5-C and P5 QE-01 as independent open/requalification lanes.
- Preserve `DOS-A1=RUNTIME_DEFERRED`.
- Keep Control Center `READ_ONLY`.
- MUSEO ZERO remains `REMEDIATION_IMPLEMENTED / SECOND_HUMAN_PRODUCT_REVIEW_PENDING` until a new human product decision exists.
- Visual Factory remains incomplete until a governed real visual run plus Human Visual Review is evidenced.
- VF-ORCH-01 remains incomplete until its dedicated orchestrator/manual execution surface required by the approved plan exists.
- No student identity, telemetry, tracking, product implementation, runtime execution, publication, Production promotion, or automatic merge is authorized by this plan.
- Exact-head CI success is necessary but never substitutes for Human Product Review or Human Visual Review.

## Review Focus

1. **Authority inflation:** adding Studio Atlas to the map must not imply public/runtime/student authorization. Task 2 tests exact negative assertions around `NOT_RUNTIME_AUTHORIZED`, `SECOND_HUMAN_PRODUCT_REVIEW_PENDING`, and `RUNTIME_DEFERRED`.
2. **Historical rewrite:** A01–A41 and v1.2 closure history must remain present. Task 2 pins preservation and additive A42–A49 semantics.
3. **Projection drift:** `STATUS.md`, Project Knowledge, ecosystem snapshot, project-context snapshot, and context pack must agree on Studio Atlas and the v1.3 state. Tasks 1, 3 and 4 add cross-file assertions.
4. **False Visual Factory completion:** automated qualification must not be represented as real production proof. Tasks 2 and 3 assert `REAL_VISUAL_RUN_PENDING` and the pending Human Visual Review boundary.
5. **Accidental reopening of closed work:** P1/P2/P3/P6 must remain closed while P4/P5 remain separate. Tasks 1 and 2 assert these package states explicitly.

---

### Task 1: Add regression guards for the v1.3 baseline

**Files:**
- Modify: `tests/test_p3_status_alignment.py`

**Interfaces:**
- Consumes: current v1.2 `STATUS.md`, canonical audit, Project Knowledge event store and generated context pack.
- Produces: regression assertions that define the minimum semantic contract for Audit v1.3 before any state files are changed.

- [ ] **Step 1: Add failing test `test_audit_v13_adds_studio_atlas_without_rewriting_history`**

Assert that `docs/audits/TRAMA-AUDIT-2026-10-03.md` contains all of:

```python
self.assertIn("Versione 1.3", audit)
for audit_id in range(42, 50):
    self.assertIn(f"A{audit_id:02d}", audit)
self.assertIn("Studio Atlas", audit)
self.assertIn("SECOND_HUMAN_PRODUCT_REVIEW_PENDING", audit)
self.assertIn("REAL_VISUAL_RUN_PENDING", audit)
self.assertIn("CORE_IMPLEMENTED / PLAN_INCOMPLETE", audit)
self.assertIn("A01", audit)
self.assertIn("A41", audit)
```

- [ ] **Step 2: Add failing test `test_status_projects_studio_atlas_as_first_level_domain_without_authority_promotion`**

Assert that `STATUS.md` contains `Studio Atlas`, `v1.3`, `NOT_RUNTIME_AUTHORIZED`, and `DOS-A1` with `RUNTIME_DEFERRED`; also assert that the current package summary still contains P1/P2/P3/P6 closed states and P4/P5 as residual/open lanes.

- [ ] **Step 3: Add failing test `test_project_knowledge_records_audit_v13_as_current_source_bound_delta`**

Load `status/project-knowledge-events.json`, index by `eventId`, and assert a new event id `TRAMA-EVT-AUDIT-V1.3-STUDIO-ATLAS-BASELINE-2026-10-05` exists with:

```python
self.assertEqual(event["status"], "CURRENT")
self.assertEqual(event["type"], "BASELINE")
self.assertEqual(event["subject"], "ecosystem-audit")
self.assertIn("Studio Atlas", event["statement"])
self.assertIn("A42", event["statement"])
self.assertIn("A49", event["statement"])
```

Also assert at least one `sourceRefs` entry points to the approved v1.3 spec path and that no source ref claims a merge/publication/runtime authorization.

- [ ] **Step 4: Add failing test `test_context_pack_and_snapshot_project_studio_atlas_consistently`**

Load `control-center/data/context-packs/project-knowledge.json`, `control-center/data/ecosystem-snapshot.json`, and `control-center/data/project-context-snapshot.json`. Assert the v1.3 event is projected in the context pack and project context, and that the ecosystem snapshot exposes a first-level `studio-atlas` component/domain whose wording does not contain `RUNTIME_AUTHORIZED`, `STUDENT_AUTHORIZED`, or `PRODUCTION` as a promotion state.

- [ ] **Step 5: Run the focused tests and verify RED**

Run:

```bash
python -m unittest tests.test_p3_status_alignment -v
```

Expected: the new v1.3 tests FAIL because A42–A49, the v1.3 event, and first-level Studio Atlas projection are not yet present.

- [ ] **Step 6: Commit the RED regression contract**

```bash
git add tests/test_p3_status_alignment.py
git commit -m "test: define Audit v1.3 Studio Atlas baseline contract"
```

---

### Task 2: Reconcile the canonical audit and STATUS map

**Files:**
- Modify: `docs/audits/TRAMA-AUDIT-2026-10-03.md`
- Modify: `STATUS.md`
- Test: `tests/test_p3_status_alignment.py`

**Interfaces:**
- Consumes: approved v1.3 design and the regression contract from Task 1.
- Produces: canonical human-readable v1.3 audit/status state used by Project Knowledge and snapshot projections.

- [ ] **Step 1: Update the audit header from v1.2 to v1.3 without deleting prior delta sections**

Set the current version/date to `Versione 1.3 — 5 ottobre 2026` and state that v1.3 adds the Studio Atlas/Visual Factory delta while preserving the historical A01–A41 findings and v1.1/v1.2 closure evidence.

- [ ] **Step 2: Append one new v1.3 delta section containing A42–A49**

Use the exact classifications from the approved spec:

```text
A42 IMPLEMENTED_CANDIDATE / PRODUCT_DOMAIN_ESTABLISHED / NOT_RUNTIME_AUTHORIZED
A43 VERIFIED_BUILD / AUTHORING_SLICE_AVAILABLE / HUMAN_GATES_PRESERVED
A44 CROSS_PRODUCT_QUALIFIED / NON_PUBLIC / NOT_STUDENT_AUTHORIZED
A45 REMEDIATION_IMPLEMENTED / SECOND_HUMAN_PRODUCT_REVIEW_PENDING
A46 IMPLEMENTATION_ADVANCED / AUTOMATED_QUALIFICATION_AVAILABLE / REAL_VISUAL_RUN_PENDING
A47 CORE_IMPLEMENTED / PLAN_INCOMPLETE
A48 DEVELOPMENT_PERSISTENCE_ONLY / PROFESSIONAL_RUNTIME_FOUNDATION_PENDING
A49 CONTRACT_DIRECTION_ESTABLISHED / RUNTIME_BINDING_DEFERRED
```

For each row, include the evidence boundary and the reason it is not promoted further. Preserve the earlier Human Product Review `REVISE` as authoritative for its frozen baseline.

- [ ] **Step 3: Add the v1.3 canonical operational sequence to the audit**

Record the sequence exactly in this order: baseline reconciliation → PR consolidation → close bounded VF-ORCH-01 residual → first governed real references → Human Visual Review/reference lock → F1–F6 → complete MUSEO ZERO v0.2 → second Human Product Review → S5 → S6; P4/P5 remain independent.

- [ ] **Step 4: Update the top-level ecosystem map in `STATUS.md`**

Represent the current topology as:

```text
TRAMA governance
├─ Arena — curriculum authority
├─ Docente OS — teacher/class/lesson truth
├─ Studio Atlas — professional authoring/production candidate domain
└─ Atlas — learner/public navigation, preview/runtime and governed publication
```

Keep shared evidence/knowledge/connector/runtime/assurance layers subordinate. Explicitly state Studio Atlas is standalone in domain ownership, with Docente OS as privileged professional entry and stable-reference lesson continuity.

- [ ] **Step 5: Update `STATUS.md` audit reference and current product-state reading**

Point the transverse audit reference to v1.3 and add the current Studio Atlas/Visual Factory/MUSEO ZERO classifications without changing P1/P2/P3/P6, P4/P5 or `DOS-A1` meanings.

- [ ] **Step 6: Run the focused tests**

```bash
python -m unittest tests.test_p3_status_alignment -v
```

Expected: audit/status assertions PASS; Project Knowledge/snapshot assertions remain FAIL until Tasks 3–4.

- [ ] **Step 7: Commit the canonical human-readable baseline**

```bash
git add docs/audits/TRAMA-AUDIT-2026-10-03.md STATUS.md tests/test_p3_status_alignment.py
git commit -m "docs: reconcile Audit v1.3 Studio Atlas baseline"
```

---

### Task 3: Persist the v1.3 Project Knowledge event and context-pack projection

**Files:**
- Modify: `status/project-knowledge-events.json`
- Modify: `control-center/data/context-packs/project-knowledge.json`
- Test: `tests/test_p3_status_alignment.py`

**Interfaces:**
- Consumes: canonical audit/status state from Task 2.
- Produces: current operational-memory event and its distributed context-pack projection.

- [ ] **Step 1: Add current event `TRAMA-EVT-AUDIT-V1.3-STUDIO-ATLAS-BASELINE-2026-10-05`**

Use:

```json
{
  "eventId": "TRAMA-EVT-AUDIT-V1.3-STUDIO-ATLAS-BASELINE-2026-10-05",
  "type": "BASELINE",
  "subject": "ecosystem-audit",
  "status": "CURRENT",
  "freshness": { "policy": "UNTIL_CHANGE" }
}
```

The statement must summarize that Studio Atlas is now a first-level application domain and A42–A49 are the additive current delta, while explicitly saying this does not authorize runtime/publication/student use. Include source refs for the approved design path and the source-bound evidence already cited by the audit; do not fabricate a future PR number or merge SHA.

- [ ] **Step 2: Preserve all prior events and their statuses**

Do not supersede P1/P2/P3/P6 closure events. Do not change P4/P5 current residual semantics. The v1.3 baseline event supplements them.

- [ ] **Step 3: Project the same event into `control-center/data/context-packs/project-knowledge.json`**

Ensure the event appears in the appropriate facts/current-event projection and that the exact-head/reference projection contains only source refs that actually exist at implementation time.

- [ ] **Step 4: Run focused tests**

```bash
python -m unittest tests.test_p3_status_alignment -v
```

Expected: Project Knowledge assertions PASS; the snapshot projection test may still fail until Task 4.

- [ ] **Step 5: Commit persistent memory reconciliation**

```bash
git add status/project-knowledge-events.json control-center/data/context-packs/project-knowledge.json tests/test_p3_status_alignment.py
git commit -m "docs: persist Audit v1.3 project knowledge"
```

---

### Task 4: Reconcile Control Center snapshots and semantic alignment

**Files:**
- Modify: `control-center/data/ecosystem-snapshot.json`
- Modify: `control-center/data/project-context-snapshot.json`
- Modify as required by the existing generator: `control-center/data/context-packs/project-knowledge.json`
- Test: `tests/test_p3_status_alignment.py`

**Interfaces:**
- Consumes: STATUS/audit and Project Knowledge from Tasks 2–3.
- Produces: READ_ONLY Control Center projections that semantically agree with the v1.3 baseline.

- [ ] **Step 1: Use the repository's existing snapshot/Project Knowledge generation path**

Before editing generated hashes/timestamps manually, locate and run the same checked-in generation commands/workflows used by the current Control Center snapshot and project-context pipeline. Do not create a second generator. If the generator cannot represent a first-level `studio-atlas` domain, make only the minimal source/generator change required and add the corresponding regression assertion before regenerating.

- [ ] **Step 2: Ensure `ecosystem-snapshot.json` contains first-level Studio Atlas**

The component/domain must reflect the approved boundary and a non-promoted maturity state. Its dependencies may reference TRAMA governance and professional/product evidence, but must not create student identity/runtime authority or make Docente OS subordinate to Studio Atlas.

- [ ] **Step 3: Ensure `project-context-snapshot.json` projects the current v1.3 event and Studio Atlas evidence references**

The snapshot must preserve source-bound provenance and distinguish implemented/qualified states from pending human/runtime gates.

- [ ] **Step 4: Regenerate hashes/timestamps through the canonical path**

Do not hand-author source hashes when the generator can produce them. Confirm the STATUS SHA/source record and Project Knowledge source hashes are internally consistent.

- [ ] **Step 5: Run the focused regression suite to GREEN**

```bash
python -m unittest tests.test_p3_status_alignment -v
```

Expected: PASS for all existing and new alignment tests.

- [ ] **Step 6: Commit snapshot reconciliation**

```bash
git add control-center/data/ecosystem-snapshot.json control-center/data/project-context-snapshot.json control-center/data/context-packs/project-knowledge.json tests/test_p3_status_alignment.py
git commit -m "docs: project Audit v1.3 into Control Center"
```

---

### Task 5: Full verification, exact-head evidence, and Human Review PR

**Files:**
- Verify all files changed in Tasks 1–4.
- No product/runtime files should be changed.

**Interfaces:**
- Consumes: complete v1.3 reconciliation branch.
- Produces: exact-head evidence and a Draft/Review PR for human approval; no merge.

- [ ] **Step 1: Verify branch scope**

Run:

```bash
git diff --name-only main...HEAD
```

Expected changed set is limited to the approved spec/plan plus audit/status/Project Knowledge/Control Center projection/test files. Fail the task if product code, runtime adapters, authentication, learner routes, provider execution, or deployment configuration changed unexpectedly.

- [ ] **Step 2: Run focused and repository-level tests**

At minimum run:

```bash
python -m unittest tests.test_p3_status_alignment -v
```

Then run the repository's existing governance, snapshot validation and Control Center validation/build commands exactly as defined by the current workflows. Expected: all relevant local checks PASS.

- [ ] **Step 3: Push the branch and inspect GitHub Actions on the exact head**

Required green families before claiming technical completion:

```text
Governance
Validate TRAMA Ecosystem Snapshot
Validate Control Center / Control Center A1–A7 checks
Build Control Center
TRAMA Project Knowledge Runtime (when triggered for the changed paths)
```

Any additional required check triggered by the branch must also be green or explicitly classified as non-applicable/skipped by its own contract.

- [ ] **Step 4: Create a PR without merge**

Title:

```text
Audit v1.3 — integrate Studio Atlas into canonical ecosystem baseline
```

PR body must state:

```text
- governance/status reconciliation only;
- adds Studio Atlas as first-level application domain;
- appends A42–A49 without rewriting A01–A41;
- preserves P1/P2/P3/P6 closures, P4/P5 residuals and DOS-A1=RUNTIME_DEFERRED;
- MUSEO ZERO remains pending second Human Product Review;
- Visual Factory real visual run and Human Visual Review remain pending;
- VF-ORCH-01 remains incomplete;
- no runtime/publication/student authorization and no auto-merge.
```

Create the PR as Draft unless all exact-head checks are already green at creation time; even if made Ready for Review later, do not merge automatically.

- [ ] **Step 5: Perform verification-before-completion on the PR exact head**

Re-check the actual PR head SHA, changed files, status checks and semantic assertions. Only then classify the reconciliation itself as `READY_FOR_HUMAN_REVIEW`.

- [ ] **Step 6: Stop at Human Review**

Do not merge. Human Review of this PR approves only the truthfulness/consistency of the v1.3 baseline, not MUSEO ZERO, Visual Factory production, VF-ORCH-01 completion, student runtime, QE-01 execution, Argo qualification or Production promotion.
