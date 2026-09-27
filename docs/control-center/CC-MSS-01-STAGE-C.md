# CC-MSS-01 — Stage C: governed read-only observation

Status: PROPOSED
Base authority: Stage B merged on `main` at `d8ea36addfe9984e73ada28f2c737ce2097c99ee`
Scope: read-only source observation and normalization contract only
Writes to external repositories/services: FORBIDDEN
UI/runtime activation: NOT AUTHORIZED
DOS-A1: DEFERRED

## 1. Objective

Stage C introduces the first governed path from authoritative external sources into the canonical Control Center model qualified in Stage B. Its purpose is observation, not decision or action.

The collector MUST be deterministic, provenance-preserving, allowlist-bound and fail-closed. It MUST NOT infer approval, authority, enrollment, collisions or transition permission from names, prose, similarity or absence of data.

## 2. Source boundary

Only repositories with a Stage-B `repositoryEnrollment` record in state `ENROLLED` may be queried.

A collector MUST reject or ignore any repository that is not explicitly enrolled. Organization membership, repository naming, links discovered in prose and cross-repository references do not expand scope.

Initial source family: GitHub read APIs required to observe repository identity, refs/commits, pull-request metadata, review state and workflow/check evidence. Each source family requires an explicit adapter contract before use.

## 3. Least privilege

Stage C credentials MUST be read-only and scoped to the enrolled repositories. The collector MUST NOT require or use permissions to push commits, edit files, merge/close PRs, dispatch/rerun workflows, modify issues, labels, reviews, settings, secrets, deployments or branch protection.

If read-only scope cannot be established or verified, collection fails closed with `SOURCE_PERMISSION_UNVERIFIED`.

## 4. Observation envelope

Every external observation MUST produce a canonical envelope containing:

- `sourceType`
- `sourceRef`
- `repositoryEnrollmentRef`
- `observedAt`
- `sourceUpdatedAt` when supplied by the source
- `observedHead` when applicable
- `freshnessStatus`: `FRESH | STALE | UNKNOWN`
- `availabilityStatus`: `AVAILABLE | UNAVAILABLE | UNKNOWN`
- `payloadDigest`
- `provenanceRefs[]`

Raw source data may be retained only when necessary for deterministic re-validation and MUST NOT become an alternative canonical state store.

## 5. Normalization rules

Adapters may normalize factual source states only. Examples include: PR open/draft/closed/merged, observed commit SHA, workflow conclusion, submitted review state and source timestamps.

Adapters MUST NOT normalize:

- CI success into human approval;
- merged/closed into curriculum or runtime authorization;
- review text into a governed decision without the required decision authority/evidence contract;
- missing/unreachable source into PASS/CLOSED/AUTHORIZED;
- branch or repository names into ecosystem membership;
- concurrent activity into a collision without Stage-B collision evidence.

Unknown or unavailable evidence remains `UNKNOWN` and produces the appropriate attention record.

## 6. Freshness and head integrity

`observedHead` is what the source currently reports. `exactHead` is the head qualified by the relevant governed evidence. They MUST remain distinct.

If both are present and differ, the collector/normalizer MUST emit `HEAD_MISMATCH` and MUST NOT silently move qualification to the observed head.

Freshness thresholds MUST be configured by governed policy rather than embedded as undocumented constants. An observation whose freshness cannot be established is `UNKNOWN`, not `FRESH`.

## 7. Determinism and idempotence

Given the same normalized source payload and governed policy, Stage C MUST produce the same semantic snapshot. Observation timestamps may change without creating semantic changes.

Ordering of repositories, PRs, checks, reviews and evidence MUST be canonicalized before digesting or comparing snapshots.

## 8. Failure model

Mandatory fail-closed conditions include:

- enrolled source unreachable;
- source authentication/permission unverifiable;
- malformed or partial payload required for an authorization-bearing assertion;
- unresolved enrollment authority;
- ambiguous repository identity;
- head mismatch;
- stale/unknown freshness where freshness is required;
- provenance or digest missing for a material machine assertion.

A failure in one source MUST NOT rewrite unrelated known-good observations as failed. Partial collection must explicitly expose source-local `UNKNOWN/UNAVAILABLE` state.

## 9. No action plane

Stage C is an observation plane only. It MUST NOT expose functions that mutate GitHub or any ecosystem repository/service. It MUST NOT recommend or execute transitions independently of CC3-F1.

No automatic merge, approval, deployment, workflow dispatch, issue mutation, label mutation or runtime activation is permitted.

## 10. Collector architecture

The implementation SHOULD separate:

1. `EnrollmentResolver` — consumes the governed allowlist only;
2. `SourceAdapter` — performs read-only source acquisition;
3. `Normalizer` — converts source facts into observation envelopes;
4. `ProvenanceBinder` — attaches resolvable source/evidence references and digest;
5. `SnapshotProjector` — projects observations into the Stage-B canonical model;
6. `StageBValidator` — validates the projected result before publication.

No layer may broaden repository scope or decision authority.

## 11. Qualification strategy

Stage C MUST be qualified in two steps.

### C1 — deterministic adapter fixtures

Offline fixtures reproduce representative GitHub responses and failures. Mandatory classes include:

- enrolled repository accepted;
- unenrolled repository rejected;
- open/draft/merged PR normalization;
- workflow PASS remains CI evidence only;
- human review remains distinct from CI;
- source outage -> UNKNOWN/UNAVAILABLE;
- permission uncertainty -> fail closed;
- observed/exact head mismatch -> attention;
- timestamp-only refresh -> semantic idempotence;
- canonical ordering independent of API response order;
- malformed/partial payload -> fail closed;
- provenance/digest required.

### C2 — read-only integration probe

Only after C1 PASS may a tightly scoped probe query authoritative GitHub sources for explicitly enrolled repositories. The probe MUST prove that no write permission or write endpoint is required. Its output is evidence for Stage D; it is not itself authority to alter the ecosystem.

## 12. Stage C acceptance gates

Stage C PASS requires:

- Stage B validator remains PASS with no weakened invariant;
- all C1 adapter fixtures PASS;
- mutation-surface test proves no write-capable operation is exposed by Stage C code;
- network is absent from offline qualification;
- collector queries only `ENROLLED` repositories;
- every material observation has provenance and digest;
- outage/permission/head mismatch cases fail closed;
- semantic idempotence and canonical ordering are demonstrated;
- independent adversarial review PASS on exact head;
- C2 read-only probe, when separately authorized, demonstrates least privilege without mutations.

## 13. Non-goals

Stage C does not:

- activate a user-facing Control Center UI;
- write to GitHub or ecosystem repositories;
- approve or merge work;
- decide curriculum authority;
- activate Arena/Atlas/Docente OS runtime behavior;
- compute autonomous maturity scores;
- replace CC3-F1;
- activate DOS-A1;
- perform the Stage D real cold-start qualification.

## 14. Next boundary

Only after Stage C qualification may Stage D use refreshed authoritative source observations for the mandatory real cold-start fixture, including Atlas Percorsi G1 / TRAMA PR #96. Stage D must distinguish observation from authority and must not inherit stale facts from earlier fixtures or conversations.
