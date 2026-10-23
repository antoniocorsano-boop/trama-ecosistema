# TRAMA Lessons Engine — Governed Project Knowledge Extension v0.1

**Status:** APPROVED DESIGN / IMPLEMENTATION IN PROGRESS  
**Date:** 2026-10-23  
**Baseline:** `main@f666239cfdb359ecf52342ed3502f4a60233ea45`  
**Authority:** human decision required for canonical promotion  
**Runtime/publication authority:** NOT GRANTED

## 1. Intent

TRAMA must learn durably from development, CI, browser qualification, review, incident diagnosis and governance work without depending on the operator to remember to write a note.

The system must automatically detect and prepare reusable lessons, deduplicate them, bind them to evidence, surface them in later work and detect recurrences. It must not create a new authority layer and it must not promote a lesson to a canonical rule without an explicit human decision.

## 2. Existing canonical constraint

TRAMA already defines Project Knowledge as the operational memory layer:

`Authority layer -> Control Center observation -> ProjectContextSnapshot -> Context Pack -> persona/agent`.

`docs/knowledge/TRAMA-SECOND-BRAIN-OPERATING-MODEL.md` explicitly forbids creating a parallel knowledge base. `FAILURE_LEARNING` is already a supported Project Knowledge event type and Session Bootstrap already exposes negative knowledge through `knownRejectedApproaches`.

Therefore **TRAMA Lessons Engine is not a new knowledge base**. It is a governed capture, promotion, indexing and retrieval workflow on top of the existing Project Knowledge model.

## 3. Goals

1. Automatically evaluate significant work for reusable lessons.
2. Produce a structured candidate with source provenance and evidence.
3. Deduplicate or link related lessons before promotion.
4. Keep candidate preparation automatic but canonical promotion human-controlled.
5. Represent approved lessons as durable `FAILURE_LEARNING` KnowledgeEvents plus a human-readable canonical lesson document.
6. Generate one compact central index for human and agent lookup.
7. Surface applicable canonical lessons during Session Bootstrap.
8. Detect possible recurrence of a canonical lesson during later work.
9. Preserve exact PR/SHA/run evidence when applicable.
10. Avoid auto-merge, hidden authority transfer and repository-local index duplication.

## 4. Non-goals

The system does not:

- replace Project Knowledge, Context Packs or Session Bootstrap;
- treat chat history or assistant memory as canonical state;
- promote lessons automatically;
- require a new external service or paid dependency;
- duplicate the central index across repositories;
- turn every failure into a lesson;
- mutate product/runtime data as part of lesson capture;
- infer current volatile repository state from a stale lesson;
- authorize deploy, publication or runtime execution.

## 5. Approaches considered

### A. Separate lesson registry

Create an independent lesson database with its own lifecycle and retrieval path.

**Rejected.** It conflicts with the Second Brain anti-duplication rule, creates competing authority and forces future agents to reconcile two memories.

### B. Raw KnowledgeEvents only

Store every approved lesson only as a `FAILURE_LEARNING` entry in `status/project-knowledge-events.json`.

**Rejected as insufficient.** It preserves machine-readable memory but gives poor human review ergonomics, no compact dedicated index and weak support for candidate discussion before promotion.

### C. Governed lesson layer on Project Knowledge

Use Draft PRs for candidate review; after human approval, materialize a canonical lesson document and a `FAILURE_LEARNING` KnowledgeEvent; derive the central index and Session Bootstrap retrieval from those canonical records.

**Selected.** It reuses current authority and retrieval infrastructure while adding the missing operational lifecycle.

## 6. Authority model

Automation may:

- identify a candidate;
- collect evidence;
- classify scope/category/risk;
- propose a lesson ID and title;
- detect probable duplicates or related lessons;
- open or update a Draft PR;
- validate deterministic structure and provenance;
- propose `CANONICAL`, `LOCAL_ONLY`, `NEEDS_EVIDENCE` or `REJECTED`;
- retrieve already canonical lessons;
- emit recurrence warnings.

Automation may not:

- convert a candidate into a canonical rule by itself;
- approve its own lesson proposal;
- auto-merge the promotion PR;
- silently widen a repository-local lesson to ecosystem scope.

Canonical promotion requires a human GitHub decision. The durable decision reference is the reviewed/merged PR.

## 7. Lifecycle

```text
SIGNIFICANT EVENT
      |
      v
CANDIDATE
      |
      v
VALIDATED
      |
      v
AWAITING_HUMAN_DECISION
      |
      +--> NEEDS_EVIDENCE
      +--> LOCAL_ONLY
      +--> REJECTED
      |
      v
CANONICAL
      |
      v
SUPERSEDED
```

### CANDIDATE

A structured proposal exists on a working branch/Draft PR. It is not Project Knowledge authority.

### VALIDATED

Schema, evidence shape, identifiers and duplicate checks pass. Validation does not equal approval.

### AWAITING_HUMAN_DECISION

The proposal is ready for explicit GitHub review.

### CANONICAL

The human-approved PR has materialized the lesson into the governed core.

### LOCAL_ONLY

The finding remains useful only in its source repository or bounded context. It does not become a TRAMA-wide rule.

### NEEDS_EVIDENCE

The hypothesis is plausible but not adequately demonstrated.

### REJECTED

The candidate is not promoted. A separate `REJECTION` KnowledgeEvent is retained only when preserving the negative knowledge is itself useful.

### SUPERSEDED

A later lesson replaces the prior rule while retaining history and linkage.

## 8. Canonical storage model

The authoritative operational record remains:

`status/project-knowledge-events.json`

Approved lessons are represented as `type: FAILURE_LEARNING`.

Each canonical lesson also has a readable document under:

`docs/knowledge/lessons/canonical/<LESSON-ID>.md`

Candidate proposal artifacts may exist only on the proposal branch under:

`docs/knowledge/lessons/candidates/<LESSON-ID>.json`

They are not canonical and should not remain on `main` after promotion.

## 9. Central index

There is one logical central index under:

`docs/knowledge/lessons/`

with two generated projections:

- `LESSONS_INDEX.json` — compact machine-readable index;
- `LESSONS_INDEX.md` — human-readable projection of the same data.

Neither is an independent authority. Both are deterministically generated from canonical `FAILURE_LEARNING` KnowledgeEvents and their bound lesson documents.

No repository in the ecosystem maintains a duplicate copy of this index.

Minimum index fields:

- lesson ID;
- title;
- status;
- scope;
- category;
- priority;
- subjects;
- canonical document path;
- source repository;
- source PR when available;
- exact evidence SHA/run when available;
- supersession relation.

## 10. Candidate data contract

A candidate must include at least:

- `lessonId`;
- `title`;
- `status`;
- `category`;
- `scope`;
- `priority`;
- `subjects`;
- `sourceRepository`;
- `sourceRefs`;
- `observedProblem`;
- `previousBehavior`;
- `learnedPrinciple`;
- `proposedRule`;
- `evidenceStrength`;
- `causalStatus`;
- `relatedLessons`;
- `supersedes`;
- `proposedBy`;
- `createdAt`.

A candidate must fail validation if it asserts causal certainty that the bound evidence does not support.

### Implemented Task 1 contract

Task 1 materializes `trama.lesson-proposal/v1` with fail-closed candidate states and deterministic fingerprints. Direct causal certification is allowed only when at least one source reference is explicitly typed as `DIRECT_EXCEPTION`, `FAILED_ASSERTION` or `CONTROLLED_REPRODUCTION`; `WORKFLOW_STEP_FAILURE` alone cannot certify causality.

The first acceptance fixture, `LL-TDD-RED-001`, is deliberately `LOCALIZED`: it binds Docente OS PR #736, exact RED head `ca3950cadf645e8c250d9192373d27794dab3457` and workflow run `40018037974` without claiming that an unobserved module-not-found exception was seen directly.

## 11. Capture protocol

The operator is not responsible for remembering the gate.

At documentation closure for significant work, the working agent/process must evaluate:

1. Did the work expose a reusable failure pattern, diagnostic boundary, process correction or rejection?
2. Is it already covered by a canonical lesson?
3. Is the evidence sufficient to state the lesson without overstating causality?
4. Is the lesson local or ecosystem-wide?
5. If reusable and not already covered, create or update one Draft lesson proposal PR.

The capture step is automatic in the development protocol; the authority decision is not.

## 12. Human GitHub gate

The candidate PR remains Draft while evidence is incomplete.

Before canonical materialization, the system must verify an explicit approval from an authorized human reviewer configured for lesson governance. The promotion step then:

1. removes the candidate artifact;
2. creates/updates the canonical lesson document;
3. adds the matching `FAILURE_LEARNING` KnowledgeEvent;
4. regenerates both index projections;
5. runs Project Knowledge, Session Bootstrap and governance checks;
6. leaves the PR unmerged for final human merge.

No automatic actor may approve or merge the PR.

## 13. Contextual retrieval

Agents must not load all lessons.

Session Bootstrap resolves applicable lessons using:

- subject intersection;
- repository/scope where applicable;
- category relevant to the task;
- active status;
- deterministic fingerprint/recurrence hints only when needed.

Only selected compact index entries are loaded first. Full canonical lesson documents are opened only when relevant.

## 14. Recurrence

A canonical lesson may emit `POSSIBLE_RECURRENCE` when a later task matches its governed failure pattern.

The signal is advisory. It must identify:

- lesson ID;
- matching subject/category/fingerprint reason;
- task/source context;
- whether Session Bootstrap had surfaced the lesson.

It cannot create a new canonical event, change authority or block execution by itself.

## 15. Governance invariants

1. Candidate preparation is not canonical promotion.
2. CI success is not human approval.
3. A bot review is not human approval.
4. `CANONICAL` cannot appear in a candidate contract.
5. A candidate cannot certify causal evidence that its source references do not support.
6. Canonical document and `FAILURE_LEARNING` event must agree on lesson ID and fingerprint.
7. Generated indices must match canonical state exactly.
8. `SUPERSEDED` lessons remain historical but are not active retrieval rules.
9. No auto-merge.
10. No automatic widening of scope.
11. No lesson may become authority merely because it was retrieved frequently.
12. Volatile GitHub state remains Live Observation, not durable lesson state.

## 16. Initial acceptance case

`LL-TDD-RED-001 — RED localizzato non equivale a RED causale certificato`

Source evidence:

- repository: `antoniocorsano-boop/docente-os-2026-27`;
- PR: `#736`;
- RED exact head: `ca3950cadf645e8c250d9192373d27794dab3457`;
- Product CI run: `40018037974`;
- observed fact: the job passes preliminary steps and fails in `Run product tests`;
- evidence limitation: the exact exception text was not available from the observed connector output.

Therefore the candidate starts with:

`causalStatus: LOCALIZED`

and must not claim the hypothesized exception as direct evidence.

## 17. Success criteria

The design is successful when:

1. reusable learning is captured without depending on operator memory;
2. candidate evidence and provenance are deterministic and reviewable;
3. human GitHub approval is technically required for canonical promotion;
4. canonical lessons become existing Project Knowledge, not a second authority;
5. one generated central index stays consistent with canonical state;
6. Session Bootstrap returns only relevant active lessons;
7. recurrence is detectable without granting write authority;
8. the first real candidate can travel end-to-end without overstating the evidence;
9. no merge, deploy, publication or runtime execution can be triggered by lesson automation alone.

## 18. Current implementation checkpoint

Task 1 completed RED → GREEN on the implementation branch:

- RED exact head: `fc57158b563c93af25681e548e1553ace245bba5`;
- RED Governance run: `40021484127`, with exactly five expected lesson-test failures caused by missing implementation;
- GREEN implementation head: `149171b5c3d5f0bb2695cc67a824c6663a85068f`;
- GREEN Governance run: `40021783693`, PASS with `337 tests / OK`.

No canonical lesson promotion, merge, deploy or runtime authority has been exercised.
