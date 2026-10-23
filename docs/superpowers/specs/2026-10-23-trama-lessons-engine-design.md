# TRAMA Lessons Engine — Governed Project Knowledge Extension v0.1

**Status:** APPROVED DESIGN / READY FOR IMPLEMENTATION PLAN  
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
- `relatedLessons`;
- `supersedes`;
- `proposedBy`;
- `createdAt`.

A candidate must fail validation if it asserts causal certainty that the bound evidence does not support.

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

- subject/capability;
- repository/domain;
- task phase/category;
- risk class;
- current/superseded status.

The central machine index is consulted first; only matching canonical lesson documents are opened when deeper detail is needed.

`FAILURE_LEARNING` remains available through Project Knowledge negative-knowledge paths, so the new index accelerates discovery without bypassing existing Context Pack semantics.

## 14. Recurrence detection

When a new task exhibits a pattern already covered by a canonical lesson, the system may emit a `RECURRENCE_WARNING` in the task receipt or CI output.

The warning must identify:

- applicable lesson ID;
- observed evidence;
- task/repository context;
- whether the lesson was retrieved during bootstrap;
- the point where the canonical rule should have affected execution.

A recurrence warning is diagnostic only. It does not mutate Project Knowledge automatically.

## 15. Initial lesson

The first real candidate is:

**LL-TDD-RED-001 — RED localizzato != RED causale certificato**

Origin:

- repository: `antoniocorsano-boop/docente-os-2026-27`;
- PR: `#736`;
- RED head: `ca3950cadf645e8c250d9192373d27794dab3457`;
- Product CI run: `40018037974`;
- observed state: workflow failure localized to `Run product tests`, but the precise expected `ERR_MODULE_NOT_FOUND: provision-hva-baseline.mjs` exception was not yet directly available from the connector.

Candidate principle:

> A workflow failure at the expected test step establishes a localized RED, not automatically a causally certified TDD RED. Before writing the GREEN, the expected causal failure must be directly observable or reproduced equivalently in a controlled environment.

The initial implementation must use this lesson as an end-to-end acceptance case without promoting it automatically.

## 16. Deterministic controls

CI must reject at least:

- duplicate lesson IDs;
- malformed proposal objects;
- candidate files present in the canonical set;
- canonical lesson without matching `FAILURE_LEARNING` event;
- `FAILURE_LEARNING` lesson metadata without canonical document;
- generated index drift;
- `SUPERSEDED` lesson surfaced as active;
- promotion without authorized human review evidence;
- automatic merge configuration for lesson promotion;
- missing source provenance for evidence-bearing claims.

## 17. Security, privacy and scope

Lesson records must not contain secrets, student data, authentication material or unnecessary personal data.

Evidence should reference repository artifacts, PRs, exact SHAs, workflow runs, receipts or controlled test output rather than copying sensitive logs into the lesson document.

Cross-repository capture must remain read-only toward product/runtime data. The only governed write target is the TRAMA documentation/Project Knowledge branch created for the proposal.

## 18. Success criteria

The design is successful when:

1. a significant reusable learning is proposed without requiring the operator to remember the step;
2. the candidate is bound to verifiable evidence;
3. the system detects duplicate/related lessons before promotion;
4. only a human can authorize canonical promotion;
5. the approved lesson becomes a Project Knowledge `FAILURE_LEARNING` event;
6. the central index is regenerated deterministically;
7. a later relevant Session Bootstrap surfaces the lesson automatically;
8. recurrence can be detected without granting the detector mutation authority;
9. no parallel knowledge base or per-repository index is introduced.

## 19. Governance boundary

This design authorizes only the implementation of the lesson-management mechanism under normal TRAMA review discipline.

It does **not** authorize:

- merge of any implementation PR;
- automatic approval;
- product deploy;
- runtime publication;
- tenant/data mutation;
- widening of existing agent authority.
