# CC-MSS-01 — Stage C: governed read-only observation

Status: PROPOSED — HARDENED AFTER INDEPENDENT REVIEW
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

A collector MUST reject any repository that is not explicitly enrolled. Organization membership, repository naming, links discovered in prose and cross-repository references do not expand scope.

Initial source family: GitHub read APIs required to observe repository identity, refs/commits, pull-request metadata, review state and workflow/check evidence. Each source family requires an explicit adapter contract before use.

## 3. Least privilege and mutation-surface contract

Stage C credentials MUST be read-only and scoped to enrolled repositories. If read-only scope cannot be established or verified, collection fails closed with `SOURCE_PERMISSION_UNVERIFIED`.

Each adapter MUST declare an operation allowlist before implementation. The initial GitHub allowlist is limited to read operations needed for:

- repository identity/metadata;
- refs and commit identity;
- pull-request metadata;
- pull-request reviews and review threads as factual observations;
- workflow runs, jobs/check/status evidence;
- read-only file/content evidence only when explicitly required by a governed source contract.

Everything not explicitly allowlisted is forbidden. In particular Stage C MUST NOT import, expose or invoke operations capable of:

- creating/updating/deleting files, refs, commits or branches;
- opening/editing/closing/merging pull requests;
- creating/updating/dismissing reviews or review comments;
- dispatching, rerunning, cancelling or approving workflows/deployments;
- mutating issues, labels, milestones or discussions;
- changing repository settings, rulesets, branch protection, permissions, collaborators, apps, secrets or environments;
- activating any Arena, Atlas or Docente OS runtime behavior.

C1 MUST include a static/runtime mutation-surface test that fails if Stage C code references an operation outside the declared allowlist. Connector/bot permissions used by unrelated CI tooling are outside the collector authority and MUST NOT be copied into Stage C credentials.

## 4. Observation envelope and completeness

Every external observation MUST produce a canonical envelope containing:

- `sourceType`;
- `sourceRef`;
- `repositoryEnrollmentRef`;
- `collectionId`;
- `observedAt`;
- `sourceUpdatedAt` when supplied by the source;
- `observedHead` when applicable;
- `freshnessStatus`: `FRESH | STALE | UNKNOWN`;
- `availabilityStatus`: `AVAILABLE | UNAVAILABLE | UNKNOWN`;
- `completenessStatus`: `COMPLETE | PARTIAL | UNKNOWN`;
- `payloadDigest`;
- `canonicalizationVersion`;
- `provenanceRefs[]`;
- pagination evidence when the source family can paginate (`page/cursor`, completion marker and item count as applicable).

A paginated source is `COMPLETE` only after the adapter has deterministically established that all required pages/cursors were consumed. Missing pagination metadata, early termination or an unavailable required page produces `PARTIAL` or `UNKNOWN`. Material authorization-bearing assertions MUST NOT be projected from `PARTIAL` or `UNKNOWN` observations.

Raw source data may be retained only when necessary for deterministic re-validation and MUST NOT become an alternative canonical state store.

## 5. Normalization rules

Adapters may normalize factual source states only: PR open/draft/closed/merged, observed commit SHA, workflow conclusion, submitted review state and source timestamps.

Adapters MUST NOT normalize:

- CI success into human approval;
- merged/closed into curriculum or runtime authorization;
- review text into a governed decision without the required decision authority/evidence contract;
- missing/unreachable/partial source into PASS/CLOSED/AUTHORIZED;
- branch or repository names into ecosystem membership;
- concurrent activity into a collision without Stage-B collision evidence.

Unknown, unavailable or incomplete evidence remains `UNKNOWN`/`UNAVAILABLE`/`PARTIAL` and produces the appropriate attention record.

## 6. Freshness and head integrity

`observedHead` is what the source currently reports. `exactHead` is the head qualified by relevant governed evidence. They MUST remain distinct.

If both are present and differ, the collector/normalizer MUST emit `HEAD_MISMATCH` and MUST NOT silently move qualification to the observed head.

Freshness thresholds MUST be configured by governed policy rather than embedded as undocumented constants. An observation whose freshness cannot be established is `UNKNOWN`, not `FRESH`.

## 7. Collection-session atomicity and TOCTOU control

A multi-request collection MUST execute inside an explicit collection session containing:

- `collectionId`;
- `startedAt` and `completedAt`;
- repository enrollment reference;
- `anchorRef` and `anchorHead` captured before dependent observations;
- terminal `consistencyStatus`: `CONSISTENT | INVALIDATED | UNKNOWN`.

For observations whose meaning depends on a head/ref, the adapter MUST re-observe the anchor at session completion. If the anchor changed, cannot be revalidated, or dependent observations cannot be proven to belong to the same anchor, the session becomes `INVALIDATED` or `UNKNOWN`. Such a session MUST NOT produce authorization-bearing assertions. A bounded retry may start a new collection session; evidence from different sessions MUST NOT be silently combined into one coherent snapshot.

## 8. Determinism, canonicalization and digest

Given the same normalized source payload and governed policy, Stage C MUST produce the same semantic snapshot. Observation timestamps may change without creating semantic changes.

Canonicalization MUST be explicitly versioned. Stage C C1 starts with `canonicalizationVersion = cc-mss-c1-v1` and MUST define, test and freeze these rules before C2:

- UTF-8 JSON representation;
- deterministic object-key ordering;
- deterministic ordering of semantically unordered collections by stable identifiers;
- preservation of ordering where source order is semantically material;
- exclusion from semantic digest of explicitly enumerated volatile observation fields such as retrieval timestamps, but never source identity, state, head, evidence, completeness or provenance;
- SHA-256 over the canonical byte representation.

Two semantically equivalent payloads differing only in API ordering or excluded volatile fields MUST produce the same semantic digest. A material field change MUST change the digest.

Raw payload retention is bounded to deterministic validation/debug evidence. Raw payloads MUST NOT be treated as canonical state, MUST NOT be retained indefinitely by default, and MUST follow the repository's governed retention/privacy policy. C1 uses fixtures only and requires no retention of live payloads.

## 9. Retry, rate-limit and transport failure policy

Retries MUST be bounded and deterministic by adapter policy. No infinite retry, silent stale-cache fallback or permissive downgrade is allowed.

HTTP 403/429, transport timeout, truncated response or exhausted retry budget MUST result in source-local `UNKNOWN`/`UNAVAILABLE` and, when applicable, `PARTIAL`. `Retry-After`/rate-limit metadata may govern a later retry but MUST NOT transform old evidence into `FRESH`.

A retry MUST NOT reuse a previous collection session as if it were current. If a new attempt is made after a failure, it receives a new `collectionId` and re-establishes its anchor.

## 10. Failure isolation and fail-closed model

Mandatory fail-closed conditions include:

- enrolled source unreachable;
- source authentication/permission unverifiable;
- malformed, truncated or partial payload required for a material assertion;
- unresolved enrollment authority;
- ambiguous repository identity;
- head mismatch or invalidated collection anchor;
- stale/unknown freshness where freshness is required;
- incomplete pagination for material evidence;
- provenance, canonicalization version or digest missing for a material machine assertion;
- retry/rate-limit budget exhausted.

A failure in one source MUST NOT rewrite unrelated known-good observations as failed. Partial collection explicitly exposes source-local state and cannot be silently promoted to complete.

## 11. No action plane

Stage C is an observation plane only. It MUST NOT expose functions that mutate GitHub or any ecosystem repository/service. It MUST NOT recommend or execute transitions independently of CC3-F1.

No automatic merge, approval, deployment, workflow dispatch, issue mutation, label mutation or runtime activation is permitted.

## 12. Collector architecture

The implementation SHOULD separate:

1. `EnrollmentResolver` — consumes the governed allowlist only;
2. `SourceAdapter` — performs only declared read operations;
3. `CollectionSession` — anchors and validates multi-request consistency;
4. `Normalizer` — converts source facts into observation envelopes;
5. `CompletenessVerifier` — validates pagination/completeness;
6. `ProvenanceBinder` — canonicalizes, digests and attaches resolvable source/evidence references;
7. `SnapshotProjector` — projects observations into the Stage-B canonical model;
8. `StageBValidator` — validates the projected result before publication.

No layer may broaden repository scope, operation scope or decision authority.

## 13. Qualification strategy

Stage C MUST be qualified in two steps.

### C1 — deterministic adapter fixtures, offline

Mandatory classes include:

- enrolled repository accepted;
- unenrolled repository rejected;
- allowlisted read operation accepted;
- mutative/non-allowlisted operation rejected;
- open/draft/merged PR normalization;
- workflow PASS remains CI evidence only;
- human review remains distinct from CI;
- source outage -> UNKNOWN/UNAVAILABLE;
- permission uncertainty -> fail closed;
- 403/429/timeout/retry exhaustion -> fail closed;
- complete pagination -> COMPLETE;
- missing/truncated page -> PARTIAL/UNKNOWN and no material authorization;
- observed/exact head mismatch -> attention;
- anchor head changes during collection -> session INVALIDATED;
- timestamp-only refresh -> semantic idempotence;
- canonical ordering independent of API response order;
- equivalent reordered payload -> stable digest;
- material payload change -> changed digest;
- malformed/partial payload -> fail closed;
- provenance/digest/canonicalization version required.

C1 MUST run with network disabled.

### C2 — separately authorized read-only integration probe

Only after C1 PASS and a separate human authorization may a tightly scoped probe query authoritative GitHub sources for explicitly enrolled repositories. The probe MUST prove that no write permission or write endpoint is required. Its output is evidence for Stage D; it is not itself authority to alter the ecosystem.

## 14. Stage C acceptance gates

Stage C PASS requires:

- Stage B validator remains PASS with no weakened invariant;
- all C1 adapter fixtures PASS;
- mutation-surface test proves no write-capable/non-allowlisted operation is referenced or exposed by Stage C code;
- network is absent from C1 qualification;
- collector queries only `ENROLLED` repositories;
- every material observation has provenance, canonicalization version and digest;
- pagination completeness is explicit and partial data fails closed for material assertions;
- outage/permission/rate-limit/timeout/head mismatch cases fail closed;
- collection-session anchor consistency is demonstrated;
- semantic idempotence, canonical ordering and stable digest are demonstrated;
- independent adversarial review PASS on exact head;
- C2 read-only probe, when separately authorized, demonstrates least privilege without mutations.

## 15. Non-goals

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

## 16. Next boundary

Only after Stage C qualification may Stage D use refreshed authoritative source observations for the mandatory real cold-start fixture, including Atlas Percorsi G1 / TRAMA PR #96. Stage D must distinguish observation from authority and must not inherit stale facts from earlier fixtures or conversations.
