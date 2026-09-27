# CC-MSS-01 — Stage B: schema, enrollment, collision rules and negative fixtures

Status: PROPOSED — REVIEW REMEDIATED
Base authority: CC-MSS-01 Stage A, merged on main at 794f0a7220956df1ccdf53ccf08263eda96880fb
Scope: data/schema contract and validation fixtures only
Collectors: NOT AUTHORIZED
Runtime: NOT AUTHORIZED
UI: NOT AUTHORIZED
DOS-A1: DEFERRED

## 1. Objective

Materialize the Stage A contract into a testable, additive data contract before any live collector or UI consumes it.

Stage B MUST be fail-closed and backward-readable relative to ecosystem snapshot schema 1.3.0.

## 2. Additive schema target

Target schema version: `1.4.0-draft` until qualification.

Existing 1.3.0 structures remain authoritative and valid. Stage B adds, without duplicating existing gate/evidence semantics:

- `entities[]`
- `workstreams[]`
- `relations[]`
- `decisions[]`
- `transitions[]`
- `repositoryEnrollment[]`
- `attentionRequired[]`
- `collisionCandidates[]`

References to existing `gates[]` and `evidence[]` MUST use stable IDs.

### Entity
Required: `id`, `kind`, `name`, `lifecycleState`, `ownerDomain`, `decisionAuthority`, `sourceRefs`.

### Workstream
Required: `id`, `title`, `state`, `entityRefs`, `repository`, `changeRef`, `exactHead`, `observedHead`, `lastActivityAt`, `observedAt`, `freshnessStatus`, `decisionAuthority`, `runtimeAuthorization`, `blockedByRefs`, `nextTransitionRefs`, `evidenceRefs`, `sourceRefs`.

Nullable fields MUST be explicit where the authoritative source has no value. Missing observation MUST NOT be normalized to PASS/CLOSED/AUTHORIZED.

### Relation
Required: `id`, `type`, `fromRef`, `toRef`, `sourceRefs`.
Allowed initial types: `depends_on`, `publishes_to`, `governed_by`, `implements`, `blocks`, `supersedes`, `evidenced_by`, `works_on`.

### Decision
Required: `id`, `state`, `authority`, `subjectRefs`, `rationaleRef`, `evidenceRefs`, `sourceRefs`, `decidedAt`.

### Transition
Required: `id`, `subjectRef`, `fromState`, `toState`, `status`, `gateRefs`, `blockedByRefs`, `decisionAuthority`, `evidenceRefs`, `sourceRefs`.
`Transition` is a projection of CC3-F1 governed output; Stage B MUST NOT implement independent transition recommendation logic.

## 3. Identity and reference integrity

Stage B uses a single reference space across retained 1.3.0 objects and additive 1.4.0-draft objects.

Rules:
1. Every addressable object MUST have a stable, non-empty `id` unique across the canonical snapshot reference space.
2. A reference field MUST resolve to exactly one canonical object of an allowed target kind.
3. Duplicate IDs are validation errors (`DUPLICATE_ID`).
4. Dangling references are validation errors (`DANGLING_REF`) for authorization-bearing assertions and explicit attention (`UNRESOLVED_REF`) for non-authorizing read-only observations; they are never silently dropped.
5. A reference resolving to an object of an invalid kind is a validation error (`REF_KIND_MISMATCH`).
6. Existing stable IDs from 1.3.0 MUST NOT be renamed merely to adopt the 1.4.0-draft additions.
7. New IDs MUST be namespaced by object kind using a stable prefix (for example `entity:`, `workstream:`, `relation:`, `decision:`, `transition:`, `enrollment:`, `attention:`, `collision:`). Prefixes are identity syntax, not authority.
8. References to existing `gate` and `evidence` IDs remain valid without migration aliases.

## 4. Repository enrollment contract

Live discovery is deferred to Stage C. Stage B defines the allowlist contract only.

Each enrollment record requires:
- `id`
- `repository`
- `ecosystemRole`
- `authorityRef`
- `defaultBranch`
- `discoveryPolicy`
- `sourceRefs[]`
- `state`: `ENROLLED | SUSPENDED | UNKNOWN`

Rules:
1. Repository membership MUST be explicitly enrolled by governed evidence.
2. Name similarity, organization membership, branch names, prose or chat history MUST NOT enroll a repository.
3. `UNKNOWN` is used when enrollment authority cannot be verified.
4. A suspended/unknown repository MUST NOT silently contribute current-work assertions.
5. Stage C collectors may query only `ENROLLED` repositories.

Initial ecosystem roles to support: `CONTROL_PLANE`, `CURRICULUM_AUTHORITY`, `PUBLICATION_SURFACE`, `TEACHER_OPERATIONAL_SURFACE`.

Stage B MUST NOT hard-code current repository URLs as permanent truth; concrete enrollment records require authoritative source references.

## 5. Collision rules v1

A collision candidate is informational/attention state, never an authorization decision.

Deterministic rules:

- `C01_SAME_GOVERNED_SUBJECT`: two non-closed workstreams have source-backed `works_on` relations to the same governed Entity/capability/contract surface.
- `C02_DEPENDENCY_MUTATION`: active workstream A changes a governed subject for which active workstream B has a source-backed `depends_on` relation.
- `C03_INCOMPATIBLE_TRANSITION`: two non-closed workstreams target transitions for the same subject that are explicitly marked incompatible by authoritative CC3-F1 output or by a separately governed compatibility matrix referenced by both transition records.

C03 MUST NOT infer incompatibility from transition names, states, text, ordering or Control Center heuristics. The Control Center only projects an incompatibility assertion whose authority and evidence are resolvable. Absence of such authoritative incompatibility evidence yields no C03 candidate.

Every candidate requires:
- `id`
- `ruleId`
- `workstreamRefs[2+]`
- `subjectRefs[]`
- `evidenceRefs[]`
- `sourceRefs[]`
- `status`: `CANDIDATE | CLEARED | UNKNOWN`

Prohibited collision signals: text similarity alone, shared keywords, branch-name similarity, author identity, temporal overlap alone.

## 6. Attention semantics

`attentionRequired[]` contains canonical attention records. Every record requires:
- `id`
- `reasonCode`
- `subjectRefs[]`
- `evidenceRefs[]`
- `sourceRefs[]`
- `status`: `OPEN | CLEARED | UNKNOWN`
- `observedAt`

Allowed initial `reasonCode` values:
- `HEAD_MISMATCH`
- `STALE_SOURCE`
- `UNKNOWN_SOURCE`
- `BLOCKING_GATE`
- `WAITING_HUMAN`
- `RUNTIME_NOT_AUTHORIZED`
- `COLLISION_CANDIDATE`
- `UNSUPPORTED_ASSERTION`
- `UNRESOLVED_REF`

Deterministic identity/deduplication rule: for the same canonical snapshot, at most one OPEN/UNKNOWN attention record may exist for the tuple `(reasonCode, sorted(subjectRefs))`. Evidence/source references are unioned and deterministically sorted; `observedAt` is observational metadata and MUST NOT create a second semantic attention record. A CLEARED record may coexist only as governed history/timeline evidence, not as a second current attention item.

Attention is not a severity score and MUST NOT be used as an automatic approval/rejection mechanism.

## 7. Backward-readability contract

Backward-readability means that the additive 1.4.0-draft representation preserves the complete meaning of all retained 1.3.0 fields.

A conforming 1.3.0 consumer that ignores unknown top-level additive fields MUST obtain the same values and semantics for all 1.3.0 fields as it would from the corresponding 1.3.0 snapshot.

Stage B MUST NOT:
- rename, remove or repurpose a 1.3.0 field;
- change an existing 1.3.0 enum meaning to encode a new 1.4 concept;
- require a 1.3.0 consumer to understand new fields to interpret an existing field correctly;
- move authoritative 1.3.0 gate/evidence content exclusively into new structures.

Mandatory compatibility fixtures:
- `BC-P01`: a valid 1.3.0 snapshot enriched only with valid additive fields projects back to an equivalent 1.3.0 view after unknown fields are ignored — PASS.
- `BC-N01`: a candidate that changes/removes/repurposes any retained 1.3.0 semantic field while claiming additive compatibility — FAIL with `BACKWARD_SEMANTIC_BREAK`.

## 8. Fifteen mandatory negative fixtures

Stage B validation MUST include fixtures proving rejection or explicit attention for:

N01 — enrolled governed open PR omitted from active workstreams.
N02 — DOS-A1 represented AUTHORIZED without authoritative human decision.
N03 — transition ALLOWED while a blocking gate is not PASS.
N04 — `exactHead != observedHead` without HEAD_MISMATCH/stale attention.
N05 — CI success interpreted as human approval.
N06 — missing evidence represented as high confidence/supported.
N07 — relation created from display text without source provenance.
N08 — timestamp-only regeneration treated as semantic change.
N09 — human and machine views use different canonical state sources.
N10 — next transition invented outside CC3-F1 authority.
N11 — unreachable source normalized to CLOSED or PASS.
N12 — repository enrolled because its name resembles an ecosystem component.
N13 — collision asserted from textual similarity alone.
N14 — APPROVED decision without authority/evidence provenance.
N15 — material machine assertion without resolvable source/evidence provenance.

Each fixture MUST define expected validator result and reason code. Validators MUST fail closed for authorization-bearing assertions.

Reference-integrity and backward-readability fixtures are additional structural gates and do not replace the 15 Stage A negative cases.

## 9. Positive/control fixtures

Stage B MUST also include controls to prevent over-rejection:

P01 — unknown source remains UNKNOWN and does not block unrelated read-only observations.
P02 — timestamp-only snapshot regeneration is semantically idempotent.
P03 — open Draft workstream may be represented while runtime is NOT_AUTHORIZED.
P04 — collision candidate may coexist with both workstreams remaining active; it does not imply automatic blocking unless a governed gate says so.
P05 — human approval and CI PASS may coexist but remain separate evidence classes.

Additional structural controls:
- `RI-P01`: all IDs unique and all references resolvable to allowed target kinds — PASS.
- `RI-N01`: duplicate ID — FAIL `DUPLICATE_ID`.
- `RI-N02`: authorization-bearing dangling reference — FAIL `DANGLING_REF`.
- `RI-N03`: reference resolves to invalid object kind — FAIL `REF_KIND_MISMATCH`.
- `BC-P01` and `BC-N01` as defined in section 7.

## 10. Mandatory real fixture

Atlas Percorsi G1 / TRAMA PR #96 is the mandatory real cold-start fixture inherited from Stage A. Stage B stores only a fixture contract and expected distinctions; current PR data MUST be refreshed from authoritative GitHub sources during Stage D qualification and MUST NOT be frozen as permanent truth.

Required distinctions:
- open/draft workstream state;
- human approval state;
- runtime authorization;
- observed head versus qualified exact head;
- child-safe constraints/evidence versus recommendations;
- DOS-A1 remains unactivated unless separately authorized.

## 11. Stage B acceptance gates

Stage B PASS requires all of the following:
- additive schema validation passes;
- identity/reference-integrity validation passes;
- `BC-P01` passes and `BC-N01` fails with `BACKWARD_SEMANTIC_BREAK`;
- all 15 negative fixtures produce the expected fail/attention reason;
- all 5 positive/control fixtures pass;
- all additional reference-integrity structural fixtures produce expected results;
- attention deduplication/idempotence is verified;
- C03 incompatibility has resolvable CC3-F1/governed-matrix provenance;
- no collector/network execution is introduced;
- no UI/runtime files are changed;
- CC3-F1 remains sole transition authority;
- DOS-A1 remains DEFERRED;
- independent review PASS on exact head.

## 12. Non-goals

Stage B does not:
- discover live PRs;
- call GitHub at runtime;
- modify Arena, Atlas or Docente OS;
- create UI panels;
- authorize merges/deployments;
- calculate maturity scores;
- recommend transitions independently;
- activate DOS-A1.

## 13. Review remediation record

Independent review target: `8558598a0b9c0523adfe9e95b95d0a0898114aa5`.

Remediated findings:
1. canonical `attentionRequired` envelope and deterministic semantic deduplication;
2. C03 incompatibility constrained to authoritative CC3-F1 or separately governed compatibility evidence;
3. cross-version identity/reference integrity, duplicate/dangling/kind-mismatch behavior and stable namespace rules;
4. testable backward-readability semantics with positive and negative compatibility fixtures.

Disposition: READY FOR SECOND INDEPENDENT CHECK. No collector, network, UI or runtime authorization is introduced.

## 14. Next boundary

Only after Stage B PASS may Stage C propose read-only collectors/generator integration. Stage C must consume the governed enrollment contract and cannot expand discovery scope on its own.
