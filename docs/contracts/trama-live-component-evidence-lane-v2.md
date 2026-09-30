# TRAMA Live Component Evidence Lane v2

**Contract ID:** TRAMA-LIVE-COMPONENT-EVIDENCE-01  
**Date:** 2026-09-30  
**Status:** PROPOSED / READ_ONLY LIVE EVIDENCE / HUMAN REVIEW REQUIRED FOR CONTRACT ACTIVATION  
**Runtime authority:** NONE  
**Automatic lifecycle promotion:** FORBIDDEN  
**DOS-A1:** RUNTIME_DEFERRED

## 1. Problem

The previous component qualification line required a second TRAMA pull request after a product pull request had already produced immutable exact-head evidence.

That line was safe but operationally wasteful:

`product change → exact-head evidence → product Human Review → merge → TRAMA evidence-binding PR → snapshot sync → second Human Review`.

The second PR frequently recorded a technical fact that had already been proved: a specific evidence artifact exists, belongs to a merged product change, and satisfies an enrolled evidence producer contract.

## 2. Decision

Extend the existing TRAMA dual-speed architecture to component evidence.

Component state is split into:

- **Governed Component Core** — registry identity, lifecycle, source class, semantic pattern, durable checkpoints and reviewed bindings;
- **Live Component Evidence Overlay** — ephemeral, read-only evidence facts discovered from enrolled qualified producers;
- **Effective Component Evidence View** — deterministic composition of the two.

The live overlay may report that an evidence class is PRESENT without mutating the governed registry.

## 3. What live evidence may change

Live evidence may change only the **effective technical evidence view**.

It may provide:

- evidence type;
- exact head;
- successful workflow run;
- artifact identity and digest;
- default-branch integration proof;
- source provenance.

It may derive an **observed evidence stage** from the same contiguous evidence model used by TRAMA.

## 4. What live evidence may never change

The live lane MUST NOT:

- change component lifecycle;
- change source class or semantic pattern;
- approve a contract or ADR;
- create product or publication authority;
- authorize runtime;
- authorize DOS-A1;
- merge a pull request;
- manufacture missing evidence;
- overwrite stronger governed evidence with weaker live state.

The governed `confirmedStage` remains the durable checkpoint. The live view exposes a separate `observedMaturity`.

## 5. Enrollment model

A source is enrolled once by stable identity:

`component → evidence type → repository → workflow name → artifact prefix`.

Run ID, exact head, artifact ID and digest are live observations. They MUST NOT require a new TRAMA PR merely because a new qualified run was merged.

## 6. Acceptance rule for live evidence

A live evidence item is PRESENT only when all are true:

1. repository is public and matches enrollment;
2. default branch identity matches enrollment;
3. the enrolled workflow exists;
4. the workflow run concluded successfully and was triggered by `pull_request`;
5. its exact head is integrated into the observed default-branch head;
6. a non-expired artifact matching the enrolled prefix and exact head exists;
7. the artifact exposes a SHA-256 digest;
8. provenance is complete.

Failure to prove any condition means the live lane does not assert PRESENT.

## 7. Human Review boundary

Human Review remains required when a change affects:

- this contract or enrollment policy;
- component lifecycle;
- authority or publication semantics;
- security boundaries;
- runtime authorization;
- irreversible or externally consequential decisions;
- an intentional historical/audit checkpoint.

Human Review is **not** required merely because an enrolled producer generated a new valid artifact.

## 8. Atlas first real case

The first enrolled producer is Curriculum-Atlas workflow:

`TRAMA Atlas Component Isolation R1`.

Targets:

- `ATLAS.RELATION_EXPLORER.FAMILY / ISOLATED`;
- `ATLAS.CURRICULUM_TREE.DISCLOSURE / ISOLATED`.

The qualifying integrated Atlas evidence is currently:

- exact head `fe43bb037ae0bd5bc13aba40e17875d1673667c2`;
- run `36671130676`;
- artifact `11078325536`;
- digest `sha256:3a664cea8d53ea87eed192afefc756a1d67eaf6ad3fd43b9d9a01d85405ec2a5`;
- Atlas merge `0105d4f497bea6e476d1b0c40bd472585068f269`.

These identifiers are verification fixtures for activation, not configuration that must be rewritten for future runs.

## 9. Operational line after activation

Normal component work:

`product PR → exact-head evidence → Human Review if product decision requires it → merge → live overlay discovers evidence → continue`.

Governed consolidation:

`lifecycle/authority/contract/milestone → governed proposal → Human Review → merge`.

This preserves safety while eliminating approval fatigue and evidence-binding churn.
