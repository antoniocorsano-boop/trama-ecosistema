# TRAMA Component Evidence Lane v2

**Contract ID:** TRAMA-COMPONENT-EVIDENCE-LANE-02  
**Status:** PROPOSED / GOVERNANCE-ONLY / READ-ONLY LIVE EVIDENCE  
**Runtime impact:** NONE  
**Parent:** TRAMA-COMPONENT-EVIDENCE-REGISTRY-01 · CC-MAT-COMP-01 · TRAMA Project Knowledge Dual-Speed Architecture v2  
**DOS-A1:** RUNTIME_DEFERRED

## 1. Problem

The current component qualification path can require a product PR followed by a TRAMA evidence-binding PR, snapshot synchronization and another review even when the product evidence is already exact-head, immutable and technically qualified.

That preserves safety but duplicates review and makes governed state lag behind verified product state.

## 2. Decision

Component evidence adopts the same dual-speed rule already used by Project Knowledge.

The governed Component Evidence Registry remains the durable semantic baseline. A new **Live Component Evidence Overlay** may report immutable, verified product evidence without mutating that registry.

The effective read model is:

```text
Governed Component Evidence Registry
          +
Live Component Evidence Overlay
          |
          v
Effective Component Evidence
          |
          +-- candidate maturity projection
          +-- Control Center read model
          +-- checkpoint proposal when intentionally requested
```

A live evidence observation never becomes authority.

## 3. Evidence classes

### V — Verified technical evidence

Examples:
- exact-head isolated render evidence;
- behavioural test evidence;
- responsive/visual artifact;
- accessibility artifact.

Rule: it may be exposed immediately as live evidence when provenance is complete and the producing run succeeded.

### G — Governed semantic state

Examples:
- lifecycle;
- authority;
- adoption authorization;
- runtime authorization;
- exemptions;
- contract changes.

Rule: remains PR + Human Review governed.

### B — Boundary signal

A live observation that conflicts with governed identity, provenance or semantic state emits REVIEW_REQUIRED and does not override the governed baseline.

### H — Historical checkpoint

A deliberate consolidation of live evidence into the governed registry for audit, milestone or release purposes.

Rule: optional; it is not the freshness mechanism.

## 4. Live Component Evidence Overlay

The overlay is ephemeral, read-only and rebuildable.

Minimum identity:

- componentId;
- evidenceType;
- status;
- repository;
- exactHead;
- sourceRef;
- runId;
- runConclusion;
- artifactId and artifactDigest when an artifact exists;
- observedAt.

Only `PRESENT` is admitted as a live positive evidence status in v1. Partial or inferred claims stay in the governed registry until a stronger contract is defined.

## 5. Effective merge rules

1. Live evidence may replace `DOCUMENTED_ONLY`, `PARTIAL` or `NOT_OBSERVED` only for the same componentId + evidenceType.
2. It may never alter lifecycle, sourceClass, target, semanticPattern or authority.
3. A live item is usable only when:
   - repository and exactHead are present;
   - runConclusion = SUCCESS;
   - sourceRef is present;
   - artifactDigest is present when artifactId is present.
4. Same component/evidence identity with contradictory exact-head payloads fails closed.
5. Candidate maturity may use effective evidence.
6. Confirmed governed maturity remains distinguishable from live candidate maturity until a deliberate checkpoint is merged.
7. A product merge does not create a TRAMA PR merely to copy evidence.

## 6. Human Review boundary

Human Review remains required when any of the following changes:

- lifecycle;
- authority;
- governed contract;
- runtime authorization;
- dependency adoption authorization;
- publication authorization;
- security boundary;
- deliberate historical checkpoint;
- contradictory evidence that cannot be resolved deterministically.

Human Review is not required merely because a new successful immutable artifact is observed.

## 7. Atlas R1 pilot

The first real case is Curriculum-Atlas PR #65, merged as `0105d4f497bea6e476d1b0c40bd472585068f269`.

Qualified source head:

`fe43bb037ae0bd5bc13aba40e17875d1673667c2`

Successful isolation run:

`36671130676`

Artifact:

- id: `11078325536`
- digest: `sha256:3a664cea8d53ea87eed192afefc756a1d67eaf6ad3fd43b9d9a01d85405ec2a5`

The live overlay may therefore expose:

- `ATLAS.RELATION_EXPLORER.FAMILY / ISOLATED = PRESENT`
- `ATLAS.CURRICULUM_TREE.DISCLOSURE / ISOLATED = PRESENT`

This does not change either component lifecycle from `PROPOSED` and does not authorize runtime migration.

## 8. Checkpoint policy

Live evidence is consolidated into the governed registry only when one of these is true:

- milestone/release/audit checkpoint;
- semantic governance change;
- explicit Human Review requests durable consolidation;
- retention is needed for a closure or long-lived decision.

The intended normal cycle becomes:

```text
product change -> product qualification -> merge -> live evidence read -> continue
```

rather than:

```text
product change -> product qualification -> merge -> TRAMA binding PR -> snapshot PR -> review -> merge
```

## 9. Acceptance criteria

1. Atlas PR #65 can appear as ISOLATED=PRESENT without editing the governed component registry.
2. Lifecycle stays PROPOSED.
3. Candidate maturity may advance; governed confirmed maturity is not silently rewritten.
4. Missing or contradictory provenance fails closed.
5. No write token, merge, promotion or runtime authorization is introduced by the live lane.
6. A deliberate checkpoint path remains available.
7. Existing registry and historical evidence remain valid.
