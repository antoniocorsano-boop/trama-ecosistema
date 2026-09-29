# TRAMA Project Knowledge Dual-Speed Architecture v2

Status: **PROPOSED / GOVERNANCE-ONLY / NO RUNTIME AUTHORIZATION**

## 1. Problem

The current Project Knowledge path correctly protects promotion, but it couples volatile repository state to governed persistence.

A successful RepositoryObservation is promoted into:
- `control-center/data/repository-observation.json`;
- `control-center/data/project-context-snapshot.json`;
- `status/project-knowledge-events.json`.

This creates an avoidable loop:

`repository change → promoted snapshot becomes stale → new promotion PR → merge → repository head changes again`.

That loop is safe but operationally inefficient. Repository heads, open PRs, mergeability and CI state are observations, not governance decisions. They must not require a new governed promotion merely because they changed.

## 2. Decision

Adopt a **dual-speed Project Knowledge model**:

```text
AUTHORITIES
  │
  ├── Governed Core ──────────────── durable / reviewed / versioned
  │       decisions, contracts,
  │       invariants, closures,
  │       negative knowledge
  │
  └── Live Observation Plane ─────── ephemeral / read-only / freshness-bound
          repository heads,
          open PRs, CI/deploy state,
          source-anchor fingerprints

Governed Core + Live Overlay
          │
          ▼
Effective Context View
          │
          ├── Context Pack
          ├── Control Center UI
          └── agent/human query
```

The Live Observation Plane never becomes authority and never needs a promotion only to report a newer head.

## 3. Three planes

### 3.1 Governed Core

Durable, repository-backed and human-reviewable.

Contains:
- approved/proposed ADR and contracts;
- significant KnowledgeEvents;
- authority assignments;
- semantic capability state;
- closures, deferments, rejections and failure learning;
- governed checkpoints when explicitly useful.

A mutation of this plane keeps the current PR + human review boundary.

### 3.2 Live Observation Plane

Read-only and non-canonical.

Contains volatile facts:
- default-branch head;
- open PR identity/head/draft state;
- workflow/deploy state;
- availability/completeness/freshness;
- semantic-anchor blob/fingerprint when enrolled.

Properties:
- obtained on demand or with bounded cache;
- PUBLIC_ANONYMOUS_READ_ONLY where possible;
- no GitHub App requirement;
- no write token;
- no repository mutation;
- may be discarded and rebuilt at any time.

### 3.3 Effective Context View

An in-memory/materialized-at-read composition.

It combines:
- Governed Core as the durable semantic baseline;
- Live Overlay for current operational facts.

It MUST preserve provenance and must never silently replace a governed decision with an observed inference.

## 4. Knowledge classes

Every item belongs to one class.

### V — Volatile operational fact

Examples:
- repository head;
- PR open/closed/draft/head;
- workflow state;
- deployment status;
- mergeability.

Rule: **never requires promotion merely because it changed**.

### G — Governed semantic knowledge

Examples:
- authority;
- contract;
- runtime authorization;
- publication semantics;
- approved decision;
- capability closure;
- deferred/rejected approach.

Rule: durable update requires governed mutation and existing human boundary.

### B — Boundary signal

An observed change may indicate that governed knowledge should be re-read.

Examples:
- a semantic source anchor changed;
- a merged PR touches an enrolled contract/ADR/status anchor;
- authority-bearing source fingerprint differs from the last governed binding.

Rule: emit `SEMANTIC_DRIFT_DETECTED`; do not auto-promote. The consumer re-reads the authoritative source. A durable KnowledgeEvent is created only if the semantic state actually changed and retention is useful.

### H — Historical checkpoint

An optional governed observation retained for audit/release/milestone evidence.

Rule: checkpoint promotion is allowed, but is **not** the mechanism for keeping live state current.

## 5. Semantic anchors

Repository-head drift alone is too coarse.

Extend the source registry with optional machine-readable anchors:

```json
{
  "authority": "Curriculum-Atlas",
  "domain": "atlas-publication",
  "anchors": [
    {
      "path": "governance/publication-policy.json",
      "role": "SEMANTIC_AUTHORITY",
      "freshness": "ON_CHANGE"
    }
  ]
}
```

The live collector may fetch only metadata/blob SHA for enrolled anchors.

A commit that changes unrelated code therefore produces:
- `HEAD_DRIFT = true`;
- `SEMANTIC_DRIFT = false`.

A changed governed anchor produces:
- `SEMANTIC_DRIFT = true`;
- source re-verification required;
- no automatic authority or promotion.

## 6. Freshness model

Do not use a single global `ProjectContextSnapshot.status=CURRENT` as proof that every live fact is current.

Use independent dimensions:

```text
governedKnowledgeStatus: CURRENT | SUPERSEDED | UNKNOWN
liveObservationStatus: FRESH | STALE | UNAVAILABLE | PARTIAL
semanticDriftStatus: NONE | DETECTED | REVIEW_REQUIRED
effectiveContextStatus: USABLE | DEGRADED | BLOCKED
```

Typical case after an ordinary merge:

```text
governedKnowledgeStatus = CURRENT
liveObservationStatus = FRESH
semanticDriftStatus = NONE
effectiveContextStatus = USABLE
```

No promotion is required.

## 7. Read path

For a normal query:

```text
1. resolve subject/capability
2. load Governed Core / ProjectContextSnapshot
3. obtain Live Overlay if cached observation is outside freshness budget
4. compare live repository state and semantic anchors
5. compose Effective Context
6. fetch authoritative source only when semantic drift affects the query
7. produce Context Pack with dual timestamps/provenance
```

Recommended metadata:

```json
{
  "governedAsOf": "...",
  "liveObservedAt": "...",
  "effectiveAsOf": "...",
  "liveObservationStatus": "FRESH",
  "semanticDriftStatus": "NONE"
}
```

## 8. Cache policy

Use **stale-while-revalidate**, not repository persistence, for volatile state.

Initial policy:
- process/session cache: 2–5 minutes;
- UI browser cache: session-local or IndexedDB/local cache with TTL;
- no durable canonical write;
- stale cache may be shown only with explicit `STALE` labeling;
- unavailable live source falls back to Governed Core without rewriting it.

No polling faster than operational need is required.

## 9. Promotion rules

A promotion is required only when at least one is true:

1. a durable KnowledgeEvent must be retained;
2. a governed contract/authority/state is being changed;
3. a milestone/release/audit checkpoint is intentionally frozen;
4. negative knowledge or a closure would otherwise exist only in chat;
5. a semantic source change has been reviewed and its distilled meaning should enter durable memory.

A promotion is **not** required solely because:
- a repository head changed;
- a PR opened/closed;
- a CI run changed state;
- a deployment completed;
- a branch was rebased;
- the Live Overlay differs from the last governed checkpoint.

## 10. RepositoryObservation v1 compatibility

Do not delete the existing promotion architecture.

Reclassify its role:

```text
RepositoryObservation v1 promoted in repo
  = GOVERNED_CHECKPOINT / HISTORICAL_EVIDENCE

LiveRepositoryOverlay v1
  = CURRENT VOLATILE READ MODEL
```

This avoids a flag-day migration and preserves all existing audit evidence.

## 11. Proposed machine-readable contracts

### LiveRepositoryOverlay v1

Ephemeral object:

```json
{
  "schemaVersion": "trama.live-repository-overlay/v1",
  "observedAt": "...",
  "status": "COMPLETE",
  "repositories": [],
  "pullRequests": [],
  "workflows": [],
  "semanticAnchors": []
}
```

No persistence path is canonical.

### EffectiveProjectContext v1

Derived view:

```json
{
  "schemaVersion": "trama.effective-project-context/v1",
  "governedSnapshotRef": "...",
  "governedAsOf": "...",
  "liveObservedAt": "...",
  "liveObservationStatus": "FRESH",
  "semanticDriftStatus": "NONE",
  "facts": [],
  "sourceRefs": []
}
```

## 12. Fail-closed rules

- Live Overlay cannot create or modify authority.
- Live Overlay cannot mark an ADR approved.
- Live Overlay cannot create runtime authorization.
- Live Overlay cannot close a human gate.
- Missing/partial live data never overwrites known governed knowledge.
- Semantic drift never automatically rewrites the Governed Core.
- Same source/run identity with contradictory payload remains fail-closed.
- Existing promotion write actor stays separated from collectors.
- DOS-A1 remains `RUNTIME_DEFERRED`.

## 13. Implementation plan

### Stage A — Contract and tests only

- define LiveRepositoryOverlay v1;
- define EffectiveProjectContext v1;
- add semantic-anchor extension to source registry schema;
- add fixtures for ordinary head drift, semantic drift, partial/unavailable live state;
- no production runtime change.

### Stage B — Pure composer

Add a deterministic pure module:

`compose_effective_project_context(governed_snapshot, live_overlay)`

Tests:
- head-only drift => USABLE / no promotion required;
- PR-only drift => USABLE / no promotion required;
- semantic-anchor drift => REVIEW_REQUIRED;
- partial live overlay => DEGRADED but governed facts preserved;
- contradictory identity => fail closed.

### Stage C — Ephemeral live adapter

Reuse the qualified PUBLIC_ANONYMOUS collector, but output only ephemeral LiveRepositoryOverlay.

No write actor, no PR, no promotion.

### Stage D — Context Pack integration

Context Pack reads EffectiveProjectContext rather than treating promoted RepositoryObservation as the only current-state source.

### Stage E — Human communication and UI

Stage E MUST follow the governed sequence:

- **E0 — Human Communication & Interaction Contract**: vocabulary, mental model, information hierarchy, benchmark, accessibility baseline and acceptance criteria;
- **E1 — Visual prototype**: realistic desktop/mobile states, including normal, partial, review-required, blocked and offline/stale;
- **E2 — Implementation**: components integrated with EffectiveProjectContext;
- **E3 — Human-use validation**: comprehension and usability validation with users who are not assumed to have repository/DevOps expertise.

The primary UI MUST translate, not expose, internal technical state.

Internally TRAMA still distinguishes:
- Governed knowledge;
- Live state;
- Semantic drift.

User-facing communication instead answers:
- can I trust these reference informations?
- how recent are the latest updates?
- do I need to do anything?

Technical identifiers and internal enums use progressive disclosure under a dedicated technical-details surface.

Never label a promoted checkpoint as stale merely because an ordinary repository head moved.
Never present missing evidence as an error by default.
Never rely on a single traffic-light state to compress authority, freshness and review need.

Normative Stage E0 reference:
- `docs/architecture/trama-stage-e0-human-communication-ui-contract-v1.md`;
- `docs/decisions/trama-adr-018-human-readable-system-state-ui.md`.

### Stage F — Promotion simplification

Keep WRITE_ONE_SHOT only for deliberate checkpoint/consolidation use.

The human decision becomes:
`AUTHORIZE_GOVERNED_CONSOLIDATION`, not “refresh current heads”.

## 14. Migration rule

Existing files and events remain valid historical evidence.

No migration must manufacture new authority.

The current promoted RepositoryObservation is retained as the last governed checkpoint. After v2 activation, repository/PR freshness comes from the Live Overlay and no longer controls whether the governed snapshot itself is semantically valid.

## 15. Acceptance criteria

The architecture is qualified when all are true:

1. merging an unrelated repository commit does not require a promotion;
2. current heads/PRs can still be retrieved read-only;
3. semantic source changes are detectable separately from head drift;
4. a live-source outage does not corrupt governed knowledge;
5. no live observation can authorize runtime or publication;
6. Context Packs expose both governed and live timestamps;
7. the existing one-shot promotion path remains usable for intentional checkpoints;
8. no GitHub App is introduced;
9. no automatic merge/review/promotion is introduced;
10. tests demonstrate absence of the infinite refresh loop;
11. Stage E primary UI can be understood without repository/DevOps terminology;
12. governed validity, live freshness and review need remain distinguishable without relying on color alone.

## 16. Operational consequence

The normal development cycle becomes:

```text
work → merge → Live Overlay notices state → continue work
```

Only meaningful semantic consolidation uses:

```text
semantic decision/milestone → governed proposal → human review → merge
```

This restores the intended role of the Second Brain: reduce reconstruction cost without turning observation freshness into governance overhead.
