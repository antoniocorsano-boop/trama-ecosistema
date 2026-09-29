# CC2 — RepositoryObservation Promotion Architecture v1

Status: PROPOSED / DESIGN ONLY / NO WRITE AUTOMATION AUTHORIZED

## 1. Purpose

Define the governed promotion path from a successful `RepositoryObservation` produced by the read-only collector into TRAMA Project Knowledge / Second Brain.

The design preserves a strict separation:

```text
PUBLIC_ANONYMOUS collector
  -> ephemeral normalized evidence
  -> deterministic promotion proposal
  -> governed write actor
  -> pull request
  -> human review
  -> merge
  -> materialized Project Knowledge views
```

The collector remains read-only and has no capability to persist into canonical project knowledge.

## 2. Mature-product patterns adopted

### GitLab

GitLab separates pipeline evidence from protected deployment/promotion. Job reports may be produced automatically, while protected-environment deployments can require explicit approvals. Merge request approval rules and protected branches prevent evidence production from becoming authority by itself.

Adopted pattern:
- evidence production != promotion authority;
- protected target;
- explicit review gate for state-changing promotion;
- immutable pipeline/run identity attached to evidence;
- reusable/versioned pipeline components rather than ad-hoc scripts.

### Backstage Software Catalog

Backstage treats the catalog as a processed projection fed by authoritative sources. Providers ingest raw entities, policies/processors validate and transform them, and stitching creates the final entity exposed to consumers. Backstage explicitly treats the catalog as a cache/projection rather than the ultimate source of truth.

Adopted pattern:
- provider/collector is separate from policy/processor;
- raw ingestion is not immediately visible as final catalog state;
- materialized view is derived, not canonical authority;
- provenance remains attached to the entity.

### DataHub

DataHub models metadata updates as atomic metadata change proposals/events and maintains a materialized metadata graph. The event/change layer is distinct from the read model.

Adopted pattern:
- promotion is an explicit change proposal;
- proposal is idempotent and version-bound;
- materialized state is reconstructed from governed changes;
- change lineage is first-class.

### OpenMetadata

OpenMetadata versions entities and records change events identifying what changed, who changed it and how. Change-event history supports debugging and rollback while search/UI consume derived current state.

Adopted pattern:
- every promoted observation creates a durable change record;
- supersession is explicit;
- current state and history are distinct;
- rollback never destroys historical evidence.

### GitHub

GitHub Actions provenance/attestation patterns reinforce binding evidence to exact workflow/run/source revision.

Adopted pattern:
- bind promotion input to run ID + exact implementation SHA + digest;
- do not trust mutable branch names as evidence identity.

## 3. TRAMA canonical model

TRAMA SHALL distinguish four objects.

### A. RepositoryObservationEvidence

Ephemeral output of the read-only collector.

Properties:
- normalized `RepositoryObservation v1`;
- collector run ID;
- exact collector implementation SHA;
- observedAt;
- source refs;
- SHA-256 digest of canonical normalized JSON;
- terminal receiptRef with state CONSUMED.

Authority: NONE.
Persistence: local/ephemeral by default.
Mutation capability: NONE.

### B. RepositoryObservationPromotionProposal

Deterministic candidate generated from valid evidence.

Required bindings:
- proposalId;
- observationDigest;
- source runId;
- source receiptRef;
- collector exact SHA;
- promotion-policy version/digest;
- repository-enrollment digest;
- previous promoted observation digest, if any;
- candidate observedAt;
- candidate repository heads;
- candidate open-PR identities;
- validation verdict;
- supersession verdict;
- proposed files/diff.

State:
`PROPOSED | REJECTED | READY_FOR_HUMAN_REVIEW`.

A proposal is never canonical state.

### C. RepositoryObservationPromotionEvent

Append-only governed event prepared by the write/promotion actor and made authoritative only when its PR is merged by human decision.

Required fields:
- eventId;
- proposalId;
- observationDigest;
- previousObservationDigest;
- recordedAt;
- recordedBy;
- source runId;
- source receiptRef;
- collector exact SHA;
- promotion actor exact SHA;
- policy digest;
- repository-enrollment digest;
- result = PROMOTED;
- sourceRefs;
- supersedes.

Authority: once merged to `main`, TRAMA governance for the fact that the observation was promoted.
`recordedAt` / `recordedBy` describe preparation of the event record, not the later merge timestamp. It does not become curriculum/product authority for Arena, Atlas or Docente OS.

### D. Materialized current views

Generated from canonical sources plus the latest promoted observation:
- `control-center/data/repository-observation.json`;
- `control-center/data/project-context-snapshot.json`;
- Context Packs;
- Control Center UI projections.

These are materialized views/caches, not independent authority.

## 4. Promotion pipeline

### Stage P0 — Evidence admission

Fail closed unless:
- LIVE_ONE_SHOT receipt = CONSUMED;
- observation status = COMPLETE;
- schema valid;
- exact four enrolled repositories present exactly once;
- all repository statuses AVAILABLE/FRESH/COMPLETE;
- source runId and receiptRef match;
- exact collector SHA is an integrated reviewed main commit;
- no unknown source refs;
- canonical JSON digest computed deterministically.

### Stage P1 — Freshness and supersession

Compare candidate against current promoted observation.

Rules:
- older `observedAt` MUST NOT replace newer state;
- same digest => `NO_OP_ALREADY_PROMOTED`;
- same runId with different digest => fail closed;
- same repository heads + same PR set => semantic no-op even if collectionId differs;
- candidate with changed heads/PR set => valid supersession candidate;
- PARTIAL/UNKNOWN can never supersede CURRENT automatically;
- evidence from an obsolete enrollment set fails closed.

### Stage P2 — Promotion proposal

Create an immutable proposal containing:
- all bindings above;
- deterministic diff for current observation;
- deterministic regenerated ProjectContextSnapshot;
- Project Knowledge event patch;
- summary of added/removed/changed repositories/PRs;
- explicit statement that no domain authority changed.

No repository write yet.

### Stage P3 — Write actor

A separate promotion actor may create a branch and PR.

The actor:
- has no collector role;
- receives only normalized evidence/proposal, never raw GitHub response bodies;
- may write only the governed promotion paths;
- cannot modify source repositories Arena/Atlas/Docente OS;
- cannot self-approve or merge;
- cannot bypass branch protection;
- uses exact-head expected-SHA updates.

Allowed paths:
- `control-center/data/repository-observation.json`;
- `control-center/data/project-context-snapshot.json`;
- `status/project-knowledge-events.json`;
- optional immutable promotion receipt under `control-center/evidence/promotions/`.

Any other path => DENY.

### Stage P4 — Human review

Human review checks:
- source run/receipt;
- observation digest;
- old -> new state diff;
- supersession decision;
- ProjectContextSnapshot changes;
- no authority drift;
- no unexpected file changes;
- CI PASS.

Merge is the promotion decision.

### Stage P5 — Post-merge materialization

After merge:
- latest promoted observation becomes current;
- ProjectContextSnapshot status may become CURRENT if all other required sources validate;
- Context Packs are regenerated;
- prior promotion event remains historical and is marked/superseded logically, never deleted;
- no collector is automatically re-run.

## 5. Automation boundary

The promotion proposal MAY be generated automatically after a successful live run.

The following MUST NOT be automatic:
- approval;
- merge;
- authority-changing interpretation;
- deletion of previous events;
- promotion of PARTIAL/UNKNOWN observations;
- resolution of conflicting canonical sources.

This distinguishes automated evidence processing from human governance.

## 6. Idempotency

Promotion key:

`sha256(canonical RepositoryObservation JSON)`

Rules:
- same digest already promoted -> NO_OP;
- proposal creation is idempotent by digest;
- promotion event ID is deterministic from digest + policy version;
- branch/PR retries must resolve to the same proposal identity;
- a new collector run producing the same semantic state does not create needless knowledge churn.

## 7. Retention

Retain:
- all promotion events;
- all human decisions;
- negative/rejected promotion proposals where they expose a meaningful governance failure;
- latest promoted observation;
- previous promoted observation digest/identity.

Do not retain by default:
- raw GitHub response bodies;
- temporary checkout files;
- secrets/tokens (none expected);
- transient duplicate/no-op proposals.

## 8. Rollback

Rollback is a new governed promotion/revert event, never deletion of history.

A revert:
- restores a previously promoted materialized observation;
- records the reverted event and reason;
- regenerates ProjectContextSnapshot deterministically;
- preserves both original and revert events.

## 9. Recommended implementation sequence

### PR-A — Promotion contract and schemas
- `repository-observation-promotion-proposal.schema.json`;
- `repository-observation-promotion-event.schema.json`;
- canonicalization/digest contract;
- positive/negative fixtures.

### PR-B — Deterministic promotion planner
Pure/read-only:
- admission;
- freshness/supersession;
- idempotency;
- diff generation;
- regenerated snapshot;
- no network and no GitHub write.

### PR-C — Governed write actor
- narrow path allowlist;
- branch + PR only;
- expected-head binding;
- no merge capability;
- no source-repository mutation.

### PR-D — Control Center projection
Display:
- latest observation age;
- promotion status;
- source run;
- digest;
- previous observation;
- changed heads/PRs;
- provenance chain;
- stale/partial warning.

## 10. Decision

Adopt an **event-backed, PR-mediated materialized-view architecture**.

Do NOT:
- let the collector write Project Knowledge directly;
- treat workflow artifacts as canonical memory;
- overwrite current state without a promotion event;
- make ProjectContextSnapshot the event store;
- persist raw API bodies;
- auto-merge promotion changes.

This model gives TRAMA the simplicity of Git-backed governance while adopting the mature separation found in GitLab approvals, Backstage ingestion/processing/stitching, DataHub change proposals and OpenMetadata versioned change events.
