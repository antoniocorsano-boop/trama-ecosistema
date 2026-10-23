# TRAMA Lessons Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a governed lesson-management extension of TRAMA Project Knowledge that automatically prepares reusable failure learning, requires human GitHub approval for canonical promotion, generates one central index, surfaces applicable lessons during Session Bootstrap and detects deterministic recurrence signals without creating a parallel authority.

**Architecture:** Reuse `FAILURE_LEARNING` KnowledgeEvents as the canonical operational record. Candidates live only on Draft PR branches; human-approved promotion materializes a canonical lesson document plus the matching KnowledgeEvent. `LESSONS_INDEX.json` and `LESSONS_INDEX.md` are deterministic projections, and Session Bootstrap filters them contextually before loading detail.

**Tech Stack:** Python 3 standard library, existing `jsonschema` dependency used by Project Knowledge CI, JSON Schema 2020-12, GitHub Actions, existing TRAMA Project Knowledge / Session Bootstrap scripts.

**Spec:** `docs/superpowers/specs/2026-10-23-trama-lessons-engine-design.md`

## Global Constraints

- Do not create a parallel knowledge base; Project Knowledge remains the operational memory authority.
- Canonical lessons are `FAILURE_LEARNING` KnowledgeEvents plus readable canonical lesson documents.
- Human GitHub decision is mandatory before canonical promotion.
- No automatic actor may approve, emit the governed human-decision marker, or merge a lesson PR.
- Candidate preparation may be automated; canonical promotion may not be self-authorized.
- One central index only; no per-repository index copies.
- Chat history and assistant memory are never canonical technical state.
- No new paid service or external runtime dependency.
- No product deploy, runtime publication, tenant mutation or student-data processing.
- Candidate evidence must preserve source repository, PR/SHA/run provenance when applicable.
- `SUPERSEDED` lessons remain historical but must not be surfaced as active.

## Review Focus

1. A candidate marked causally `CERTIFIED` without direct exception/assertion/controlled-reproduction evidence must be rejected by validation — pinned in Task 1.
2. A bot/non-authorized identity, stale-head approval or automated decision marker must never satisfy the human promotion gate — pinned in Task 2.
3. Index generation must fail closed on canonical-document/event mismatch and duplicate lesson IDs — pinned in Task 3.
4. Session Bootstrap must return only relevant `CURRENT` lessons and exclude `SUPERSEDED` lessons — pinned in Task 4.
5. Governance CI must detect generated-index drift and candidate artifacts accidentally prepared for canonical merge — pinned in Task 5.

---

## File Structure

### New files

- `schemas/lesson-proposal.schema.json` — machine-readable candidate contract.
- `config/lesson-governance.json` — human-review/decision authority and no-auto-merge policy.
- `scripts/lesson_engine_common.py` — normalized IDs, fingerprints, evidence helpers and canonical lesson selection.
- `scripts/validate_lesson_proposal.py` — deterministic candidate validation.
- `scripts/verify_lesson_human_gate.py` — authorized human GitHub decision check over PR review/discussion data.
- `scripts/promote_lesson_proposal.py` — deterministic candidate-to-canonical transformation; no GitHub merge action.
- `scripts/build_lessons_index.py` — generated JSON/Markdown index builder and `--check` mode.
- `tests/test_lessons_engine.py` — proposal, promotion, index and recurrence contract tests.
- `tests/fixtures/lessons/LL-TDD-RED-001.localized.json` — acceptance fixture based on Docente OS PR #736 without asserting unobserved causal certainty.
- `docs/knowledge/lessons/README.md` — storage/lifecycle explanation for humans.
- `docs/knowledge/lessons/LESSONS_INDEX.json` — generated machine index.
- `docs/knowledge/lessons/LESSONS_INDEX.md` — generated human index.

### Modified files

- `status/project-knowledge-events.json` — receives canonical `FAILURE_LEARNING` events only during an approved promotion.
- `scripts/build_session_bootstrap.py` — contextual lesson lookup and receipt projection.
- `schemas/session-bootstrap-receipt.schema.json` — `applicableLessons` and lesson-index provenance.
- `scripts/test_session_bootstrap.py` — lesson retrieval regressions.
- `config/session-bootstrap-subjects.json` — aliases/subjects needed to resolve lesson contexts such as TDD and CI qualification.
- `docs/knowledge/TRAMA-SECOND-BRAIN-OPERATING-MODEL.md` — automatic lesson-evaluation closure gate.
- `.github/workflows/governance.yml` — lesson schema/index deterministic checks.
- `.github/workflows/lesson-governance.yml` — PR decision gate for candidate validation and human-decision verification; never merges.

---

### Task 1: Candidate contract and causal-evidence validation

**Files:**
- Create: `schemas/lesson-proposal.schema.json`
- Create: `scripts/lesson_engine_common.py`
- Create: `scripts/validate_lesson_proposal.py`
- Create: `tests/test_lessons_engine.py`
- Create: `tests/fixtures/lessons/LL-TDD-RED-001.localized.json`

**Interfaces:**
- Produces: `lesson_engine_common.normalize_text(value: str) -> str`
- Produces: `lesson_engine_common.lesson_fingerprint(proposal: dict) -> str`
- Produces: `lesson_engine_common.direct_causal_evidence(proposal: dict) -> list[dict]`
- Produces: `validate_lesson_proposal.validate_proposal(data: dict) -> dict`
- Proposal `causalStatus`: `NOT_APPLICABLE | LOCALIZED | CERTIFIED`
- Direct causal evidence kinds: `DIRECT_EXCEPTION | FAILED_ASSERTION | CONTROLLED_REPRODUCTION`

- [x] **Step 1: Write the failing candidate-validation tests**

Add tests named:

- `test_localized_red_candidate_is_valid_without_certified_exception()`
- `test_certified_causal_claim_requires_direct_evidence()`
- `test_duplicate_evidence_refs_are_rejected()`
- `test_candidate_requires_source_repository_and_source_refs()`
- `test_fingerprint_is_stable_for_semantically_identical_whitespace()`

The PR #736 fixture must assert:

- `lessonId == "LL-TDD-RED-001"`;
- source repository `antoniocorsano-boop/docente-os-2026-27`;
- pull request `736`;
- exact RED head `ca3950cadf645e8c250d9192373d27794dab3457`;
- workflow run `40018037974`;
- `causalStatus == "LOCALIZED"`;
- the candidate text does not claim that `ERR_MODULE_NOT_FOUND: provision-hva-baseline.mjs` was directly observed.

- [x] **Step 2: Run the focused tests and verify RED**

Run:

```bash
python3 tests/test_lessons_engine.py
```

Expected: FAIL because proposal schema/helpers/validator do not exist yet.

**Observed equivalent CI evidence:** Governance #40021484127 on exact head `fc57158b563c93af25681e548e1553ace245bba5` reached the full unit-test step and failed with exactly five lesson-contract failures, each caused by the intentionally missing Task 1 implementation; all preceding workflow steps passed.

- [x] **Step 3: Implement the minimal proposal schema and helpers**

`lesson-proposal.schema.json` must require:

`schemaVersion`, `lessonId`, `title`, `status`, `category`, `scope`, `priority`, `subjects`, `sourceRepository`, `sourceRefs`, `observedProblem`, `previousBehavior`, `learnedPrinciple`, `proposedRule`, `evidenceStrength`, `causalStatus`, `relatedLessons`, `supersedes`, `proposedBy`, `createdAt`.

Candidate status is exactly `CANDIDATE | VALIDATED | AWAITING_HUMAN_DECISION | NEEDS_EVIDENCE | LOCAL_ONLY | REJECTED` and must never accept `CANONICAL`.

`validate_proposal(data)` must:

- validate the JSON Schema contract;
- reject duplicate evidence refs;
- reject `causalStatus=CERTIFIED` unless `direct_causal_evidence()` returns at least one item;
- compute and return a deterministic fingerprint;
- never infer causal certification from a workflow-step failure alone.

- [x] **Step 4: Run the focused tests and verify GREEN**

Run:

```bash
python3 tests/test_lessons_engine.py
python3 scripts/validate_lesson_proposal.py tests/fixtures/lessons/LL-TDD-RED-001.localized.json
```

Expected: PASS; validator prints the lesson ID, fingerprint and `causalStatus=LOCALIZED`.

**Observed equivalent CI evidence:** Governance #40021783693 on exact head `149171b5c3d5f0bb2695cc67a824c6663a85068f` completed PASS; the five Task 1 tests all passed inside the full `337 tests / OK` suite.

- [x] **Step 5: Commit**

Task 1 implementation is materialized on the branch through exact head `149171b5c3d5f0bb2695cc67a824c6663a85068f` before the documentation-status updates.

---

### Task 2: Human GitHub decision gate and deterministic promotion

**Files:**
- Create: `config/lesson-governance.json`
- Create: `scripts/verify_lesson_human_gate.py`
- Create: `scripts/promote_lesson_proposal.py`
- Modify: `tests/test_lessons_engine.py`

**Interfaces:**
- Consumes: `validate_proposal(data: dict) -> dict` from Task 1.
- Produces: `verify_lesson_human_gate.verify_human_gate(decision_artifacts: list[dict], config: dict) -> dict` returning the exact-head-bound authorized human decision or raising `LessonGateError`.
- Produces: `promote_lesson_proposal.build_failure_learning_event(proposal: dict, decision: dict) -> dict`.
- Produces: `promote_lesson_proposal.render_canonical_markdown(proposal: dict, decision: dict) -> str`.
- `config/lesson-governance.json` must declare `authorizedHumanReviewers: ["antoniocorsano-boop"]`, `allowedDecisionKinds: ["PR_REVIEW_APPROVAL", "PR_EXPLICIT_DECISION"]`, `explicitDecisionToken: "APPROVE_CANONICAL"`, and `autoMergeAllowed: false`.
- The caller supplies `proposalBinding.pullRequest` and `proposalBinding.headSha` in the runtime config passed to `verify_human_gate`; these dynamic values are not persisted in the static governance config.

- [ ] **Step 1: Write failing human-gate and promotion tests**

Add:

- `test_bot_approval_does_not_satisfy_human_gate()`;
- `test_unlisted_human_does_not_satisfy_human_gate()`;
- `test_stale_head_human_decision_does_not_satisfy_gate()`;
- `test_authorized_human_review_approval_satisfies_gate()`;
- `test_authorized_explicit_pr_decision_satisfies_gate()`;
- `test_promotion_produces_failure_learning_event_and_markdown()`;
- `test_promotion_preserves_source_pr_sha_and_run()`;
- `test_promotion_rejects_candidate_without_human_gate()`.

The canonical event must contain:

- `type: "FAILURE_LEARNING"`;
- `status: "CURRENT"`;
- stable `eventId` derived from the lesson ID;
- `lesson` metadata containing `lessonId`, `title`, `category`, `scope`, `priority`, `subjects`, `fingerprint`, `humanDecisionRef`;
- sourceRefs copied without loss of exact SHA/run provenance.

- [ ] **Step 2: Run tests and verify RED**

Run `python3 tests/test_lessons_engine.py`.

Expected: new gate/promotion tests FAIL because implementations do not exist.

- [ ] **Step 3: Implement the gate**

`verify_human_gate()` must accept exactly two decision forms:

1. `PR_REVIEW_APPROVAL`: state `APPROVED`, authorized human identity, exact PR/head binding;
2. `PR_EXPLICIT_DECISION`: exact token `APPROVE_CANONICAL`, authorized human author, exact PR/head binding.

Both forms must reject bot identities, unauthorized humans, stale/mismatched heads and mismatched PR numbers. CI status, labels and automated comments do not count.

It must not create reviews, comments, labels, commits or merges.

- [ ] **Step 4: Implement deterministic promotion rendering**

`build_failure_learning_event()` and `render_canonical_markdown()` must be pure transformations. The CLI may write files only when explicitly called with `--write`; default mode prints/checks the proposed outputs.

Canonical document path:

`docs/knowledge/lessons/canonical/<LESSON-ID>.md`

The promotion must fail if the target lesson ID already exists as `CURRENT` unless the proposal explicitly declares a valid supersession relationship.

- [ ] **Step 5: Run tests and verify GREEN**

Run:

```bash
python3 tests/test_lessons_engine.py
python3 scripts/verify_lesson_human_gate.py --help
python3 scripts/promote_lesson_proposal.py --help
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add config/lesson-governance.json scripts/verify_lesson_human_gate.py scripts/promote_lesson_proposal.py tests/test_lessons_engine.py
git commit -m "feat: add human lesson promotion gate"
```

---

### Task 3: Central lesson index and canonical consistency

**Files:**
- Create: `scripts/build_lessons_index.py`
- Create: `docs/knowledge/lessons/README.md`
- Create: `docs/knowledge/lessons/LESSONS_INDEX.json`
- Create: `docs/knowledge/lessons/LESSONS_INDEX.md`
- Modify: `scripts/lesson_engine_common.py`
- Modify: `tests/test_lessons_engine.py`

**Interfaces:**
- Consumes canonical `FAILURE_LEARNING` KnowledgeEvents and canonical lesson documents.
- Produces `build_lessons_index.build_index(events: dict, lesson_root: Path) -> dict`.
- Produces `build_lessons_index.render_markdown(index: dict) -> str`.
- Produces deterministic projections only; index files are never authority.

- [ ] **Step 1: Write failing index-consistency tests**

Add tests for:

- duplicate canonical lesson IDs fail closed;
- a `CURRENT` lesson event without its canonical document fails closed;
- a canonical document without the matching current event fails closed;
- `SUPERSEDED` lesson remains indexed historically but is marked inactive;
- JSON and Markdown order is deterministic by lesson ID;
- the index records source repository, PR, exact SHA/run and supersession metadata.

- [ ] **Step 2: Verify RED**

Run `python3 tests/test_lessons_engine.py`.

Expected: index tests FAIL because builder/index do not exist.

- [ ] **Step 3: Implement the minimal index builder**

`build_index()` must select Lessons Engine `FAILURE_LEARNING` KnowledgeEvents carrying lesson metadata, require the canonical document path, reject duplicates/mismatches, and preserve `CURRENT`/`SUPERSEDED` status. Pre-existing legacy `FAILURE_LEARNING` events without Lessons Engine metadata remain valid Project Knowledge and are not silently reclassified as indexed lessons.

`LESSONS_INDEX.json` schema version:

`trama.lessons-index/v1`

Each entry must remain compact and contain only lookup metadata, not duplicate the full lesson text.

- [ ] **Step 4: Generate both projections**

Run:

```bash
python3 scripts/build_lessons_index.py --write
python3 scripts/build_lessons_index.py --check
```

Expected: both commands PASS and second command reports no drift.

- [ ] **Step 5: Run tests and verify GREEN**

Run `python3 tests/test_lessons_engine.py`.

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add scripts/build_lessons_index.py scripts/lesson_engine_common.py tests/test_lessons_engine.py docs/knowledge/lessons
git commit -m "feat: add canonical lessons index"
```

---

### Task 4: Contextual Session Bootstrap retrieval and recurrence warning

**Files:**
- Modify: `scripts/build_session_bootstrap.py`
- Modify: `schemas/session-bootstrap-receipt.schema.json`
- Modify: `scripts/test_session_bootstrap.py`
- Modify: `config/session-bootstrap-subjects.json`
- Modify: `tests/test_lessons_engine.py`

**Interfaces:**
- Consumes: `docs/knowledge/lessons/LESSONS_INDEX.json`.
- Produces receipt field `governedContext.applicableLessons`.
- Produces lesson provenance in `sourceRefs`.
- Recurrence result is advisory only: `NONE | POSSIBLE_RECURRENCE`; it never mutates state or blocks by itself.

- [ ] **Step 1: Write failing retrieval tests**

Add tests proving:

- query/subject for TDD or CI qualification returns `LL-TDD-RED-001` when canonical/current;
- unrelated subject does not load it;
- `SUPERSEDED` lessons are excluded from active applicable lessons;
- lesson index/document provenance is present;
- repeated failure semantics can produce `POSSIBLE_RECURRENCE` without creating a new canonical event.

- [ ] **Step 2: Verify RED**

Run:

```bash
python3 scripts/test_session_bootstrap.py
python3 tests/test_lessons_engine.py
```

Expected: new retrieval assertions FAIL.

- [ ] **Step 3: Extend subject resolution and receipt schema**

Add aliases/subjects for TDD, RED, CI qualification and failure learning without broad keyword guessing. Extend the receipt schema with bounded `applicableLessons` entries and advisory recurrence status.

- [ ] **Step 4: Implement contextual retrieval**

`build_session_bootstrap.py` must read the compact index, filter by intersection with resolved context subjects, include only active/current lessons and add only the selected entries to the receipt.

Do not load every lesson document into the receipt.

- [ ] **Step 5: Implement recurrence signal**

Use deterministic subject/category/fingerprint-compatible matching. A recurrence warning must contain the lesson ID and reason but cannot modify Project Knowledge or change authority.

- [ ] **Step 6: Run all bootstrap and lesson tests**

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add scripts/build_session_bootstrap.py schemas/session-bootstrap-receipt.schema.json scripts/test_session_bootstrap.py config/session-bootstrap-subjects.json tests/test_lessons_engine.py
git commit -m "feat: surface lessons in session bootstrap"
```

---

### Task 5: Governance CI and automatic closure evaluation

**Files:**
- Modify: `.github/workflows/governance.yml`
- Create: `.github/workflows/lesson-governance.yml`
- Modify: `docs/knowledge/TRAMA-SECOND-BRAIN-OPERATING-MODEL.md`
- Modify: `tests/test_lessons_engine.py`

**Interfaces:**
- Governance CI consumes the proposal schema, canonical events/documents and generated index.
- Lesson governance workflow validates candidate PRs and reports human-gate state; it never approves or merges.

- [ ] **Step 1: Write failing governance tests**

Pin:

- generated index drift fails;
- duplicate lesson ID fails;
- candidate artifact under `docs/knowledge/lessons/candidates/` cannot be merged to `main` as canonical state;
- workflow has no `pull-requests: write` or `contents: write` permission for automatic promotion/merge;
- workflow has no auto-merge command/action;
- Second Brain closure gate explicitly requires lesson evaluation after significant reusable failure/process learning.

- [ ] **Step 2: Verify RED**

Expected: new workflow/governance assertions FAIL.

- [ ] **Step 3: Extend Governance workflow**

Run deterministic lesson checks in existing Governance CI:

```bash
python3 scripts/build_lessons_index.py --check
python3 -m unittest tests.test_lessons_engine -v
```

Also fail if a candidate artifact is present in a main-bound canonical diff without promotion materialization.

- [ ] **Step 4: Add read-only lesson governance workflow**

`lesson-governance.yml` may use `pull-requests: read` and `contents: read`. It validates candidate artifacts and checks whether the configured authorized human decision exists. It must report state only.

No write permission, review/comment mutation, merge or branch mutation.

- [ ] **Step 5: Update documentation closure gate**

Add the reusable-lesson evaluation step to the existing Second Brain operating model; do not create a separate process authority.

- [ ] **Step 6: Run workflow-contract tests and Governance validation**

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add .github/workflows/governance.yml .github/workflows/lesson-governance.yml docs/knowledge/TRAMA-SECOND-BRAIN-OPERATING-MODEL.md tests/test_lessons_engine.py
git commit -m "ci: govern lesson capture and index drift"
```

---

### Task 6: First real candidate, human gate rehearsal and closeout

**Files:**
- Candidate branch only: `docs/knowledge/lessons/candidates/LL-TDD-RED-001.json`
- After explicit human approval only: `docs/knowledge/lessons/canonical/LL-TDD-RED-001.md`
- After explicit human approval only: `status/project-knowledge-events.json`
- Generated after approved materialization: `docs/knowledge/lessons/LESSONS_INDEX.json`
- Generated after approved materialization: `docs/knowledge/lessons/LESSONS_INDEX.md`

**Interfaces:**
- Uses all Tasks 1–5.
- Demonstrates end-to-end lifecycle without bypassing human authority.

- [ ] **Step 1: Materialize the real candidate from the Task 7 evidence**

Copy the acceptance fixture into the candidate location and validate it.

It must remain `causalStatus=LOCALIZED` until direct evidence exists. Do not retroactively claim that the module-not-found exception was observed.

- [ ] **Step 2: Run duplicate lookup and proposal validation**

Expected: candidate is valid, not canonical, and no existing lesson with the same fingerprint is silently overwritten.

- [ ] **Step 3: Open/update the Draft lesson PR and stop at human gate**

The workflow must report `AWAITING_HUMAN_DECISION` when no authorized decision artifact exists.

No canonical document/Event/index mutation is allowed yet.

- [ ] **Step 4: Human decision**

An authorized human chooses one:

- approve for canonical promotion;
- local only;
- needs evidence;
- reject.

The decision must be expressed through an eligible GitHub approval review or the governed exact-head-bound PR decision marker. Automation cannot perform this step.

- [ ] **Step 5: If and only if approved, materialize canonical outputs**

Run the promotion tool with the bound human decision, regenerate the index, run full tests and leave the PR unmerged for final human merge.

If the decision is not canonical approval, do not create a `CURRENT FAILURE_LEARNING` event.

- [ ] **Step 6: Full verification**

Run:

```bash
python3 scripts/validate_lesson_proposal.py docs/knowledge/lessons/candidates/LL-TDD-RED-001.json
python3 scripts/build_lessons_index.py --check
python3 scripts/test_project_knowledge_runtime.py
python3 scripts/test_session_bootstrap.py
python3 -m unittest discover -s tests -v
python3 scripts/validate_governed_document_registry.py
```

Expected: PASS for all applicable checks on the exact candidate head.

- [ ] **Step 7: Human merge decision**

Do not auto-merge. Report exact head, workflow results, human decision reference, canonical lesson state and remaining scope.

---

## Final self-review

- Spec coverage: all design requirements map to Tasks 1–6.
- Authority boundary: promotion and merge remain human-controlled; no automation owns approval or the explicit human-decision marker.
- Existing architecture: `FAILURE_LEARNING`, Project Knowledge, Context Pack and Session Bootstrap are extended rather than duplicated.
- First acceptance case preserves the known evidence limit from PR #736 instead of inventing causal certainty.
- Central index is generated from canonical state and cannot become a second authority.
- Recurrence detection is advisory and cannot mutate state.
- No runtime/deploy/student-data authority is introduced.
