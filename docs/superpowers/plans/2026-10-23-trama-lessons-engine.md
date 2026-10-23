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
- No automatic actor may approve or merge a lesson PR.
- Candidate preparation may be automated; canonical promotion may not be self-authorized.
- One central index only; no per-repository index copies.
- Chat history and assistant memory are never canonical technical state.
- No new paid service or external runtime dependency.
- No product deploy, runtime publication, tenant mutation or student-data processing.
- Candidate evidence must preserve source repository, PR/SHA/run provenance when applicable.
- `SUPERSEDED` lessons remain historical but must not be surfaced as active.

## Review Focus

1. A candidate marked causally `CERTIFIED` without direct exception/assertion/controlled-reproduction evidence must be rejected by validation — pinned in Task 1.
2. A bot or non-authorized reviewer must never satisfy the human promotion gate — pinned in Task 2.
3. Index generation must fail closed on canonical-document/event mismatch and duplicate lesson IDs — pinned in Task 3.
4. Session Bootstrap must return only relevant `CURRENT` lessons and exclude `SUPERSEDED` lessons — pinned in Task 4.
5. Governance CI must detect generated-index drift and candidate artifacts accidentally prepared for canonical merge — pinned in Task 5.

---

## File Structure

### New files

- `schemas/lesson-proposal.schema.json` — machine-readable candidate contract.
- `config/lesson-governance.json` — human-review authority and no-auto-merge policy.
- `scripts/lesson_engine_common.py` — normalized IDs, fingerprints, evidence helpers and canonical lesson selection.
- `scripts/validate_lesson_proposal.py` — deterministic candidate validation.
- `scripts/verify_lesson_human_gate.py` — authorized human-review check over GitHub review data.
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
- `.github/workflows/lesson-governance.yml` — PR/review gate for candidate validation and human approval verification; never merges.

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

- [ ] **Step 1: Write the failing candidate-validation tests**

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

- [ ] **Step 2: Run the focused tests and verify RED**

Run:

```bash
python3 tests/test_lessons_engine.py
```

Expected: FAIL because proposal schema/helpers/validator do not exist yet.

- [ ] **Step 3: Implement the minimal proposal schema and helpers**

`lesson-proposal.schema.json` must require:

`schemaVersion`, `lessonId`, `title`, `status`, `category`, `scope`, `priority`, `subjects`, `sourceRepository`, `sourceRefs`, `observedProblem`, `previousBehavior`, `learnedPrinciple`, `proposedRule`, `evidenceStrength`, `causalStatus`, `relatedLessons`, `supersedes`, `proposedBy`, `createdAt`.

Candidate status is exactly `CANDIDATE | VALIDATED | AWAITING_HUMAN_DECISION | NEEDS_EVIDENCE | LOCAL_ONLY | REJECTED` and must never accept `CANONICAL`.

`validate_proposal(data)` must:

- validate JSON Schema;
- reject duplicate evidence refs;
- reject `causalStatus=CERTIFIED` unless `direct_causal_evidence()` returns at least one item;
- compute and return a deterministic fingerprint;
- never infer causal certification from a workflow-step failure alone.

- [ ] **Step 4: Run the focused tests and verify GREEN**

Run:

```bash
python3 tests/test_lessons_engine.py
python3 scripts/validate_lesson_proposal.py tests/fixtures/lessons/LL-TDD-RED-001.localized.json
```

Expected: PASS; validator prints the lesson ID, fingerprint and `causalStatus=LOCALIZED`.

- [ ] **Step 5: Commit**

```bash
git add schemas/lesson-proposal.schema.json scripts/lesson_engine_common.py scripts/validate_lesson_proposal.py tests/test_lessons_engine.py tests/fixtures/lessons/LL-TDD-RED-001.localized.json
git commit -m "feat: add governed lesson proposal contract"
```

---

### Task 2: Human GitHub decision gate and deterministic promotion

**Files:**
- Create: `config/lesson-governance.json`
- Create: `scripts/verify_lesson_human_gate.py`
- Create: `scripts/promote_lesson_proposal.py`
- Modify: `tests/test_lessons_engine.py`

**Interfaces:**
- Consumes: `validate_proposal(data: dict) -> dict` from Task 1.
- Produces: `verify_lesson_human_gate.verify_human_gate(reviews: list[dict], config: dict) -> str` returning the authorized reviewer login or raising `LessonGateError`.
- Produces: `promote_lesson_proposal.build_failure_learning_event(proposal: dict, decision: dict) -> dict`.
- Produces: `promote_lesson_proposal.render_canonical_markdown(proposal: dict, decision: dict) -> str`.
- `config/lesson-governance.json` must declare `authorizedHumanReviewers: ["antoniocorsano-boop"]` and `autoMergeAllowed: false`.

- [ ] **Step 1: Write failing human-gate and promotion tests**

Add:

- `test_bot_approval_does_not_satisfy_human_gate()`;
- `test_unlisted_human_does_not_satisfy_human_gate()`;
- `test_authorized_human_approval_satisfies_gate()`;
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

`verify_human_gate()` must accept only a review with:

- `state == "APPROVED"`;
- reviewer login present in `authorizedHumanReviewers`;
- reviewer login not ending in `[bot]`;
- review bound to the proposal PR/head supplied by the caller.

It must not create reviews, labels, commits or merges.

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

Expected: PASS; no repository mutation occurs without `--write`.

- [ ] **Step 6: Commit**

```bash
git add config/lesson-governance.json scripts/verify_lesson_human_gate.py scripts/promote_lesson_proposal.py tests/test_lessons_engine.py
git commit -m "feat: require human lesson promotion decision"
```

---

### Task 3: Canonical storage and generated central index

**Files:**
- Create: `scripts/build_lessons_index.py`
- Create: `docs/knowledge/lessons/README.md`
- Create: `docs/knowledge/lessons/LESSONS_INDEX.json`
- Create: `docs/knowledge/lessons/LESSONS_INDEX.md`
- Modify: `tests/test_lessons_engine.py`

**Interfaces:**
- Consumes canonical `FAILURE_LEARNING` events from `status/project-knowledge-events.json`.
- Produces: `build_lessons_index.collect_lessons(events: dict, root: Path) -> list[dict]`.
- Produces: `build_lessons_index.build_json_index(lessons: list[dict]) -> dict`.
- Produces: `build_lessons_index.render_markdown(index: dict) -> str`.
- CLI supports `--check` and `--write`; `--check` must not modify files.

- [ ] **Step 1: Write failing index tests**

Add:

- `test_index_requires_unique_lesson_ids()`;
- `test_index_requires_matching_canonical_document()`;
- `test_index_excludes_superseded_from_active_view()`;
- `test_index_preserves_supersession_history()`;
- `test_markdown_and_json_indexes_have_same_active_ids()`;
- `test_check_mode_detects_generated_index_drift()`.

- [ ] **Step 2: Run tests and verify RED**

Run `python3 tests/test_lessons_engine.py`.

Expected: index tests FAIL because builder/index files do not exist.

- [ ] **Step 3: Implement canonical index collection**

`collect_lessons()` must accept only events with `type=FAILURE_LEARNING` and lesson metadata. For every such event it must verify that the declared canonical lesson document exists. Duplicate lesson IDs or duplicate canonical document paths are fatal.

The JSON index must expose separate `activeLessons` and `historicalLessons` arrays. `SUPERSEDED` items may appear only in the historical array.

- [ ] **Step 4: Implement deterministic Markdown rendering and drift check**

`LESSONS_INDEX.md` is a compact table with ID, title, category, scope, priority, subjects, status and document link. It is generated from the JSON index object, never edited independently.

- [ ] **Step 5: Generate the empty/current baseline index and verify**

Run:

```bash
python3 scripts/build_lessons_index.py --write
python3 scripts/build_lessons_index.py --check
python3 tests/test_lessons_engine.py
```

Expected: PASS. If main currently has no lesson-tagged `FAILURE_LEARNING` events, the active index is valid and empty rather than synthetic.

- [ ] **Step 6: Commit**

```bash
git add scripts/build_lessons_index.py docs/knowledge/lessons tests/test_lessons_engine.py
git commit -m "feat: add generated central lessons index"
```

---

### Task 4: Contextual Session Bootstrap retrieval

**Files:**
- Modify: `scripts/build_session_bootstrap.py`
- Modify: `schemas/session-bootstrap-receipt.schema.json`
- Modify: `scripts/test_session_bootstrap.py`
- Modify: `config/session-bootstrap-subjects.json`
- Modify: `tests/test_lessons_engine.py`

**Interfaces:**
- Consumes: `docs/knowledge/lessons/LESSONS_INDEX.json`.
- Produces: `build_session_bootstrap.relevant_lessons(index: dict, subjects: list[str]) -> list[dict]`.
- Receipt adds `governedContext.lessonsIndexRef` and `governedContext.applicableLessons`.
- Each applicable lesson entry contains only compact metadata and canonical document path; full lesson Markdown is not loaded by default.

- [ ] **Step 1: Write failing bootstrap retrieval tests**

Add cases proving:

- a TDD/CI query retrieves `LL-TDD-RED-001` from a fixture index;
- unrelated subject queries do not retrieve it;
- `SUPERSEDED` lesson entries are not returned as applicable;
- duplicate lesson IDs in the index fail closed;
- existing `knownRejectedApproaches` behavior remains unchanged.

- [ ] **Step 2: Run bootstrap tests and verify RED**

Run:

```bash
python3 scripts/test_session_bootstrap.py
python3 tests/test_lessons_engine.py
```

Expected: new applicable-lesson assertions FAIL.

- [ ] **Step 3: Add subject aliases and compact lesson resolution**

Add resolver coverage for the existing development-continuity domain using aliases sufficient to resolve TDD/RED/GREEN/CI qualification work. Do not replace ecosystem-first bootstrap rules.

`relevant_lessons()` must match normalized subject intersection and return only active lessons.

- [ ] **Step 4: Extend receipt schema and builder**

`governedContext.lessonsIndexRef` is the fixed path `docs/knowledge/lessons/LESSONS_INDEX.json`.

`governedContext.applicableLessons` is an array of compact index entries. Existing authority, negative knowledge and live-verification semantics must remain unchanged.

- [ ] **Step 5: Run Project Knowledge regression suite**

Run:

```bash
python3 scripts/build_project_context_snapshot.py --check
python3 scripts/test_project_knowledge_runtime.py
python3 scripts/test_session_bootstrap.py
python3 scripts/validate_project_knowledge_schemas.py
python3 tests/test_lessons_engine.py
```

Expected: all PASS.

- [ ] **Step 6: Commit**

```bash
git add scripts/build_session_bootstrap.py schemas/session-bootstrap-receipt.schema.json scripts/test_session_bootstrap.py config/session-bootstrap-subjects.json tests/test_lessons_engine.py
git commit -m "feat: surface applicable lessons in session bootstrap"
```

---

### Task 5: Governance CI, automatic closure evaluation and no-auto-merge boundary

**Files:**
- Create: `.github/workflows/lesson-governance.yml`
- Modify: `.github/workflows/governance.yml`
- Modify: `docs/knowledge/TRAMA-SECOND-BRAIN-OPERATING-MODEL.md`
- Modify: `tests/test_lessons_engine.py`

**Interfaces:**
- `governance.yml` runs proposal/index deterministic checks on repository content.
- `lesson-governance.yml` reacts to lesson candidate PR/review events, reads GitHub review state and verifies the human gate; it has no merge step.
- Second Brain documentation closure gains a mandatory automatic lesson-evaluation question after significant work.

- [ ] **Step 1: Write failing workflow/policy contract tests**

Add text/structure tests asserting:

- governance workflow runs `python3 scripts/build_lessons_index.py --check`;
- governance workflow runs the lesson-engine test suite;
- lesson-governance workflow contains no `gh pr merge`, merge API call or auto-merge action;
- lesson-governance workflow obtains PR review data and calls `verify_lesson_human_gate.py`;
- Second Brain closure protocol contains the lesson-evaluation gate and states that the operator is not responsible for remembering it.

- [ ] **Step 2: Run tests and verify RED**

Run `python3 tests/test_lessons_engine.py`.

Expected: workflow/policy assertions FAIL.

- [ ] **Step 3: Extend Governance CI**

Add steps for:

```bash
python3 tests/test_lessons_engine.py
python3 scripts/build_lessons_index.py --check
```

Do not remove or weaken any existing governance validator.

- [ ] **Step 4: Add lesson PR/review workflow**

`lesson-governance.yml` must:

- trigger only for lesson candidate paths/review events;
- use read permissions by default;
- fetch review data with the repository-scoped GitHub token;
- call `verify_lesson_human_gate.py`;
- report `AWAITING_HUMAN_DECISION` until the gate is satisfied;
- never approve its own PR;
- never enable auto-merge;
- never merge;
- never write product/runtime data.

If later automatic branch materialization is desired, it must be a separate explicitly reviewed increment; v0.1 keeps promotion writes under the working agent/process after the human gate.

- [ ] **Step 5: Extend the Second Brain closure gate**

After durable-documentation closure, add the automatic lesson evaluation:

1. detect reusable failure/process/diagnostic learning;
2. search the central lesson index;
3. update an existing candidate when semantically equivalent;
4. otherwise prepare one Draft candidate proposal;
5. never promote without human GitHub decision.

- [ ] **Step 6: Run governance regression checks**

Run:

```bash
python3 tests/test_lessons_engine.py
python3 scripts/build_lessons_index.py --check
python3 scripts/validate_governed_document_registry.py
python3 scripts/build_project_context_snapshot.py --check
python3 scripts/test_session_bootstrap.py
```

Expected: all PASS.

- [ ] **Step 7: Commit**

```bash
git add .github/workflows/lesson-governance.yml .github/workflows/governance.yml docs/knowledge/TRAMA-SECOND-BRAIN-OPERATING-MODEL.md tests/test_lessons_engine.py
git commit -m "ci: enforce governed lesson lifecycle"
```

---

### Task 6: End-to-end acceptance without unauthorized promotion

**Files:**
- Modify only if required by defects discovered during acceptance: files from Tasks 1–5.
- Do not add `LL-TDD-RED-001` to canonical Project Knowledge in this implementation PR.

**Interfaces:**
- Consumes the real-shaped fixture `tests/fixtures/lessons/LL-TDD-RED-001.localized.json`.
- Produces a validated promotion preview only; canonical write requires a later dedicated lesson PR and human approval.

- [ ] **Step 1: Validate the real-shaped first candidate**

Run:

```bash
python3 scripts/validate_lesson_proposal.py tests/fixtures/lessons/LL-TDD-RED-001.localized.json
```

Expected: PASS with `causalStatus=LOCALIZED`.

- [ ] **Step 2: Prove the causal guard is effective**

Create a temporary copy of the fixture changing only `causalStatus` to `CERTIFIED` without adding direct causal evidence, then run the validator.

Expected: FAIL with the causal-evidence guard. Delete the temporary file.

- [ ] **Step 3: Run the full relevant suite**

Run:

```bash
python3 tests/test_lessons_engine.py
python3 scripts/build_lessons_index.py --check
python3 scripts/build_project_context_snapshot.py --check
python3 scripts/test_project_knowledge_runtime.py
python3 scripts/test_session_bootstrap.py
python3 scripts/validate_project_knowledge_schemas.py
python3 scripts/validate_governed_document_registry.py
```

Expected: all PASS.

- [ ] **Step 4: Verify scope and authority boundaries**

Check the branch diff and assert:

- no product/runtime application code changed;
- no tenant/data migration changed;
- no auto-merge configuration exists;
- no canonical `LL-TDD-RED-001` event was written;
- generated index is deterministic;
- all new writes are confined to Project Knowledge/governance/test infrastructure.

- [ ] **Step 5: Commit any acceptance-only corrections**

Only if Task 6 exposed a defect:

```bash
git add <minimal affected files>
git commit -m "fix: close lessons engine acceptance gaps"
```

---

## Post-implementation handoff

After the engine implementation PR is independently qualified and merged by human decision, create a **separate Draft lesson proposal PR** for `LL-TDD-RED-001` using the real Docente OS PR #736 evidence.

That proposal starts as `causalStatus=LOCALIZED`. It may move to `CERTIFIED` only if the precise expected exception or an equivalent controlled reproduction becomes directly observable. The lesson itself still requires the normal human GitHub promotion decision before entering canonical Project Knowledge.
