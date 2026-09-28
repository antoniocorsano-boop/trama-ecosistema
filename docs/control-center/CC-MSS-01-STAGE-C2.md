# CC-MSS-01 — Stage C2: separately authorized live read-only probe

Status: PROPOSED — REQUIRES INDEPENDENT REVIEW BEFORE IMPLEMENTATION
Parent authority: Stage C1 QUALIFIED on exact head `02ba8563c2cbefd771cc4a5b6e3dac1a367f5aae`
Scope: tightly bounded live observation probe against explicitly enrolled GitHub repositories
Writes: FORBIDDEN
UI/runtime activation: NOT AUTHORIZED
CC3-F1 transition authority: UNCHANGED
DOS-A1: DEFERRED

## 1. Purpose

C2 proves that the Stage C observation contract can acquire authoritative GitHub facts in a live environment using only read capabilities, without broadening repository scope or decision authority. C2 is evidence generation only. It does not approve, merge, deploy, mutate, score, recommend or activate anything.

## 2. Human authorization boundary

C2 execution requires a separate human authorization bound to:
- exact implementation head;
- explicit repository allowlist derived from governed `repositoryEnrollment` records in state `ENROLLED`;
- declared read-operation allowlist;
- probe time window/run identifier;
- maximum request budget.

Authorization expires after the bounded probe. It is not standing permission for continuous collection.

## 3. Repository scope

The probe MUST accept repository identifiers only from Stage-B/C1 governed enrollment data. No organization enumeration, repository discovery, prose-link following, inferred membership or wildcard scope is allowed.

Any requested repository not explicitly enrolled MUST fail closed with `UNENROLLED_REPOSITORY` before a network request is attempted.

## 4. Read-operation allowlist

The implementation MUST expose only the minimum GET/read operations required to observe:
- repository identity/metadata;
- branch/ref and commit identity;
- pull-request metadata;
- pull-request reviews/review threads as factual evidence;
- workflow runs/jobs/check/status evidence;
- repository content evidence only when explicitly required by a governed evidence reference.

No generic arbitrary-URL client may be exposed to the probe layer. Each request MUST be constructed by a typed adapter from an allowlisted operation and validated repository identity.

All write/mutation operation families remain forbidden, including create/update/delete, merge, review submission/dismissal, workflow dispatch/rerun/cancel/approval, issue/label mutation, settings/rulesets/protection mutation, secrets/environments and deployment/runtime activation.

## 5. Credential and permission gate

Before the first live source request, C2 MUST establish that the credential/context is read-only for the intended operations. The probe MUST NOT request additional permissions dynamically.

If effective permissions cannot be established with sufficient confidence, execution terminates with `SOURCE_PERMISSION_UNVERIFIED` before material evidence is accepted.

CI/bot permissions unrelated to the collector MUST NOT be treated as collector authority.

## 6. Request budget and bounded execution

Every probe run MUST declare:
- `probeRunId`;
- authorized repository list;
- authorized operation list;
- `maxRequests`;
- `startedAt`;
- hard timeout;
- retry policy with finite maximum attempts.

The adapter MUST count requests. Exceeding the budget terminates collection fail-closed. No unbounded pagination or retries are permitted.

## 7. Collection consistency

Each repository observation uses the Stage C `CollectionSession` model:
- capture `anchorRef`/`anchorHead` before dependent observations;
- collect required pages/evidence;
- re-observe the anchor before session completion;
- mark `CONSISTENT`, `INVALIDATED` or `UNKNOWN`.

Evidence from invalidated/unknown sessions MUST NOT support authorization-bearing assertions. Evidence from different sessions MUST NOT be silently combined.

## 8. Completeness, pagination and freshness

All paginated material sources MUST prove terminal completion. Truncated, interrupted or ambiguous pagination produces `PARTIAL`/`UNKNOWN`.

Rate limit, 403/429, timeout, transport error or retry exhaustion produces source-local `UNKNOWN`/`UNAVAILABLE`; stale cached evidence MUST NOT be promoted to `FRESH`.

Freshness is policy-driven and distinct from availability and completeness.

## 9. Provenance and digest

Every material live observation MUST bind:
- source/repository identity;
- exact endpoint/typed operation identity without secrets;
- `probeRunId` and `collectionId`;
- source timestamps when available;
- observed head when applicable;
- completeness/freshness/availability/consistency states;
- `canonicalizationVersion = cc-mss-c1-v1` unless a separately governed successor exists;
- SHA-256 semantic payload digest;
- resolvable provenance references.

Secrets, authorization headers and sensitive credential material MUST never enter evidence payloads, logs or digests.

## 10. Output boundary

C2 output is an observation/evidence bundle suitable for validation by the existing Stage-B/C1 contracts. It MUST NOT directly modify canonical governance state. Projection into a candidate snapshot remains subject to validation and later human/governed decision authority.

C2 MUST NOT write observations back to GitHub during the probe.

## 11. Privacy and data minimization

Collect only fields required by the declared evidence contract. Do not collect unrelated user/profile data, organization membership, email addresses or arbitrary discussion content. Review/comment text is collected only when an explicit governed evidence reference requires it; otherwise metadata/state is preferred.

Live raw payload retention MUST be disabled by default. If a debugging exception is later required, it needs separate governed authorization and retention rules.

## 12. Logging

Logs MUST contain operation identifiers, repository refs, counts, status classes and non-sensitive digests sufficient for audit. Logs MUST NOT contain tokens, authorization headers, cookies or raw sensitive payloads.

## 13. Kill conditions

The probe MUST terminate immediately on:
- attempted non-allowlisted operation;
- unenrolled repository request;
- unverifiable permission scope;
- request-budget exhaustion;
- unexpected redirect/host outside approved GitHub source boundary;
- mutation-capable client path detected at runtime;
- credential/sensitive-data leakage into evidence/logging path;
- invariant failure that would require permissive fallback.

Termination MUST NOT trigger cleanup writes to GitHub.

## 14. C2 pre-live qualification

Before any live execution, the implementation MUST pass offline tests for:
- repository allowlist before network;
- typed operation allowlist and arbitrary-URL rejection;
- request counter/budget exhaustion;
- finite retry/timeout behavior;
- pagination completion/partial failure;
- anchor change invalidation;
- permission-unverified fail-closed;
- redirect/host boundary rejection;
- secret redaction/log safety;
- raw-payload retention disabled;
- no mutation-capable imports/calls;
- Stage B 27/27 and C1 qualification remain green.

## 15. Live probe acceptance evidence

A separately authorized live probe may be considered successful only if it demonstrates:
- queries limited to authorized `ENROLLED` repositories;
- only allowlisted read operations used;
- request count within budget;
- no mutation request attempted;
- provenance/digest/completeness/session evidence produced;
- expected source failures remain fail-closed;
- no secret/raw-sensitive leakage;
- Stage-B validator accepts the resulting candidate observation projection without weakening invariants.

A successful C2 probe does not authorize continuous monitoring or Stage D.

## 16. Non-goals

C2 does not authorize:
- continuous/background collection;
- scheduled polling;
- automatic decisions or recommendations;
- repository writes;
- workflow control;
- merge/approval;
- UI/runtime activation;
- maturity scoring;
- DOS-A1;
- Stage D cold-start qualification.

## 17. Next gate

After implementation and offline pre-live qualification, an independent adversarial review MUST PASS on the exact implementation head. Only then may the user provide the separate human authorization for one bounded C2 live probe. Stage D remains a subsequent, separately governed phase.
