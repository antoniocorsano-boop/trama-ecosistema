# CC-MSS-01 — Stage C2: separately authorized live read-only probe

Status: PROPOSED — HARDENED AFTER INDEPENDENT REVIEW
Parent authority: Stage C1 QUALIFIED on exact head `02ba8563c2cbefd771cc4a5b6e3dac1a367f5aae`
Scope: tightly bounded live observation probe against explicitly enrolled GitHub repositories
Writes: FORBIDDEN
UI/runtime activation: NOT AUTHORIZED
CC3-F1 transition authority: UNCHANGED
DOS-A1: DEFERRED

## 1. Purpose
C2 proves that the Stage C observation contract can acquire authoritative GitHub facts in a live environment using only read capabilities, without broadening repository scope or decision authority. C2 is evidence generation only. It does not approve, merge, deploy, mutate, score, recommend or activate anything.

## 2. Human authorization boundary
C2 execution requires a separate human authorization bound to the exact implementation head, explicit `ENROLLED` repository allowlist, declared read-operation allowlist, probe run identifier/time window and maximum request budget. Authorization expires after the bounded probe and is not standing permission for continuous collection.

## 3. Repository scope
Repository identifiers MUST come only from governed `repositoryEnrollment` records in state `ENROLLED`. No organization enumeration, repository discovery, prose-link following, inferred membership or wildcard scope is allowed. An unenrolled repository fails with `UNENROLLED_REPOSITORY` before network access.

## 4. Read-operation allowlist
The implementation exposes only typed GET/read operations required for repository identity/metadata, refs/commits, pull-request metadata, review/thread factual state, workflow/job/check/status evidence and explicitly governed content evidence. No generic arbitrary-URL client is exposed to the probe layer. Every request is constructed from a typed operation plus validated repository identity.

All mutation families are forbidden: create/update/delete, merge, review submission/dismissal, workflow dispatch/rerun/cancel/approval, issue/label mutation, settings/rulesets/protection mutation, secrets/environments and deployment/runtime activation.

## 5. Deterministic PermissionAttestation
Before any material live collection, C2 MUST produce a `PermissionAttestation` containing:
- `attestationId` and `probeRunId`;
- credential/context identity as a non-secret opaque reference;
- authoritative permission source/type;
- `observedPermissions` normalized to explicit read/write capability states;
- `requiredReadSet`;
- `forbiddenWriteSet`;
- `observedAt`;
- `attestationStatus: VERIFIED_READ_ONLY | WRITE_PRESENT | UNKNOWN`;
- canonicalization version and SHA-256 digest of the non-secret attestation payload.

`WRITE_PRESENT` or `UNKNOWN` blocks the probe before material evidence is accepted. Successful GET requests are never evidence that write permission is absent. C2 MUST NOT request permission elevation dynamically. Permissions belonging to unrelated CI/bots are not collector authority.

## 6. Normative network boundary and redirect policy
Allowed scheme: `https` only. Allowed API host for the initial GitHub adapter: `api.github.com`. Any future host requires a separately governed adapter-contract change.

The probe MUST NOT derive hosts from response payloads, prose, links, repository metadata or redirects. Requests are built from typed endpoint templates.

Redirect policy is default-deny. An unexpected redirect terminates with `SOURCE_BOUNDARY_VIOLATION`. HTTPS downgrade is always forbidden. Credentials MUST NOT be forwarded across a host boundary. Cross-host redirect following is forbidden. DNS/connection destination handling MUST remain bound to the validated hostname; literal/unapproved destination substitution is forbidden.

## 7. Request budget semantics
Each run declares `probeRunId`, repositories, operations, `maxRequests`, hard timeout and finite retry policy.

One outbound HTTP attempt counts as one request, including initial requests, retries, every pagination page, permission-attestation source requests, anchor capture and anchor re-check. Failed attempts count. Cached/local validation does not count because it emits no network request.

Before starting a collection session, the adapter MUST reserve sufficient remaining budget for the mandatory terminal anchor re-check and any other contractually mandatory close operation. If the remaining budget cannot guarantee minimum fail-closed completion, no new dependent request may start and the session terminates as `REQUEST_BUDGET_INSUFFICIENT`. Budget exhaustion never permits omission of the closing anchor check while claiming consistency.

## 8. Response/resource limits
Before C2 implementation, adapter policy MUST define finite limits for:
- maximum compressed response bytes;
- maximum decompressed response bytes;
- maximum JSON/document nesting/structural complexity supported by the parser;
- maximum items per page accepted;
- maximum pages per typed operation;
- maximum cumulative bytes/items per collection session.

Limits are checked as early as technically possible, before unbounded buffering/parsing/retention. Exceeding a limit produces `SOURCE_RESOURCE_LIMIT_EXCEEDED` and fail-closed termination of the affected session. Compression/decompression MUST enforce the decompressed-byte ceiling; compressed-small/decompressed-large payloads cannot bypass it.

## 9. Collection consistency
Each repository observation uses `CollectionSession`: capture `anchorRef`/`anchorHead`, collect required evidence, re-observe anchor, then mark `CONSISTENT | INVALIDATED | UNKNOWN`. Evidence from invalidated/unknown sessions cannot support authorization-bearing assertions and different sessions are not silently combined.

## 10. Completeness, pagination and freshness
Paginated material sources MUST prove terminal completion. Truncated/interrupted/ambiguous pagination produces `PARTIAL`/`UNKNOWN`. Rate limit, 403/429, timeout, transport error or retry exhaustion produces source-local `UNKNOWN`/`UNAVAILABLE`; stale cached evidence cannot become `FRESH`. Freshness remains policy-driven and distinct from availability/completeness.

## 11. Provenance and digest
Every material observation binds source/repository identity, typed operation identity without secrets, `probeRunId`, `collectionId`, source timestamps when available, observed head when applicable, completeness/freshness/availability/consistency, `canonicalizationVersion = cc-mss-c1-v1` unless governed successor, SHA-256 semantic payload digest and resolvable provenance references. Tokens, authorization headers, cookies and credential material never enter evidence, logs or digests.

## 12. Evidence output and persistence boundary
During the live probe C2 may produce only a local/ephemeral observation-evidence bundle. The collector credential is read-only and MUST NOT be capable of committing, uploading, publishing or otherwise persisting that bundle to GitHub or another remote service.

The probe completes before any persistence decision. Any later commit/upload/publication of C2 evidence is a distinct governed phase requiring separate human authorization, a separate write-capable actor/context if needed, explicit destination and retention policy, and validation that no secret/raw-sensitive material is present. Collector credentials MUST never be reused for that persistence phase.

Failure or termination of C2 MUST NOT trigger remote cleanup writes. Local ephemeral data is discarded according to the run policy unless separately authorized for retention.

## 13. Privacy and data minimization
Collect only fields required by the declared evidence contract. Do not collect unrelated user/profile data, organization membership, email addresses or arbitrary discussion content. Review/comment text is collected only when an explicit governed evidence reference requires it; otherwise metadata/state is preferred. Live raw-payload retention is disabled by default.

## 14. Logging
Logs contain typed operation identifiers, repository refs, counts, status classes and non-sensitive digests sufficient for audit. Logs never contain tokens, authorization headers, cookies or raw sensitive payloads.

## 15. Kill conditions
Terminate immediately on non-allowlisted operation, unenrolled repository, `PermissionAttestation` other than `VERIFIED_READ_ONLY`, insufficient/exhausted request budget, unexpected redirect/host or HTTPS downgrade, response/resource-limit breach, mutation-capable path detected, credential/sensitive-data leakage, attempted remote persistence/upload from collector context, or invariant failure requiring permissive fallback. Termination triggers no GitHub cleanup write.

## 16. C2 pre-live qualification
Before live execution, implementation MUST pass offline tests for:
- repository allowlist before network;
- typed operation allowlist and arbitrary-URL rejection;
- PermissionAttestation `VERIFIED_READ_ONLY` accepted;
- PermissionAttestation `UNKNOWN` rejected;
- PermissionAttestation with any forbidden write capability rejected;
- GET success not accepted as permission proof;
- `https`/`api.github.com` boundary;
- cross-host redirect rejection;
- HTTPS downgrade rejection;
- credential non-forwarding across rejected redirect;
- request counting includes retries/pages/attestation/anchor operations;
- insufficient budget for terminal anchor close rejects before dependent request;
- finite retry/timeout behavior;
- pagination completion/partial failure;
- anchor change invalidation;
- compressed response within limit but decompressed output over limit rejected;
- oversized response rejected before unbounded parse/retention;
- page/item/session resource ceilings;
- secret redaction/log safety;
- raw-payload retention disabled;
- attempted remote persistence/upload from collector rejected;
- no mutation-capable imports/calls;
- Stage B 27/27 and C1 qualification remain green.

## 17. Live probe acceptance evidence
A separately authorized live probe succeeds only if it demonstrates authorized `ENROLLED` repositories only, allowlisted read operations only, `PermissionAttestation=VERIFIED_READ_ONLY`, request count within budget including close checks, no mutation or remote persistence attempted, provenance/digest/completeness/session evidence, fail-closed source failures, resource limits respected, no secret/raw-sensitive leakage and Stage-B validation of the candidate observation projection without weakened invariants.

A successful C2 probe does not authorize continuous monitoring or Stage D.

## 18. Non-goals
C2 does not authorize continuous/background collection, scheduled polling, automatic decisions/recommendations, repository writes, workflow control, merge/approval, evidence publication, UI/runtime activation, maturity scoring, DOS-A1 or Stage D cold-start qualification.

## 19. Next gate
After implementation and offline pre-live qualification, an independent adversarial review MUST PASS on the exact implementation head. Only then may the user provide separate human authorization for one bounded C2 live probe. Stage D remains subsequent and separately governed.
