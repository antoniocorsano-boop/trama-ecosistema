# CC-MSS-01 — Stage C2 LIVE PROBE one-shot authorization gate

Status: PROPOSED — DESIGN ONLY / LIVE NOT AUTHORIZED
Parent qualification: C2 PRE-LIVE QUALIFIED on exact head `f30a4a37d4bb27ceec8d30dbe0619dfdeb5872c0`
Purpose: define the exact authorization envelope for one bounded live read-only probe after implementation review.

## 1. Non-authorization statement
This document does not authorize network access, credentials, live collection, remote persistence, repository mutation, workflow control, UI/runtime activation, continuous monitoring or Stage D. `live=NOT_AUTHORIZED` remains in force until a later explicit human decision bound to the exact live-probe implementation head and run envelope.

## 2. One-shot run envelope
A live authorization, if later granted, MUST identify exactly:
- `probeRunId`;
- exact implementation commit SHA;
- explicit repository allowlist, each repository already governed as `ENROLLED`;
- explicit typed read-operation allowlist;
- credential/context opaque reference;
- deterministic `PermissionAttestation=VERIFIED_READ_ONLY`;
- `maxRequests` and mandatory close reserve;
- finite retry count and hard timeout;
- resource ceilings;
- canonicalization version;
- local/ephemeral evidence destination;
- authorization issue time and expiry.

Any mismatch between runtime envelope and authorization terminates before material collection.

## 3. Initial probe minimization
The first live probe MUST use the smallest useful surface. It MUST NOT attempt to exercise every supported read operation. Initial scope is limited to factual repository/ref/commit identity needed to prove end-to-end collection safety for the explicitly authorized enrolled repository set. Pull-request/review/workflow/content reads remain disabled unless separately enumerated in the one-shot authorization.

## 4. Required runtime sequence
The implementation MUST enforce this order:
1. load immutable authorization envelope;
2. validate exact implementation SHA and non-expired run authorization;
3. validate repository enrollment locally before network;
4. construct PermissionAttestation from the authoritative permission source; reject UNKNOWN or WRITE_PRESENT;
5. instantiate request BudgetLedger and reserve terminal close capacity;
6. open CollectionSession and capture anchor;
7. execute only typed allowlisted reads against `https://api.github.com`;
8. enforce response/decompression/page/item/session ceilings while consuming data;
9. prove pagination completion where applicable;
10. re-observe the anchor using reserved budget;
11. mark session CONSISTENT / INVALIDATED / UNKNOWN;
12. construct canonical provenance/digest evidence;
13. write only to local/ephemeral sink;
14. emit secret-safe audit summary;
15. terminate the run. No automatic retry of the whole run and no background continuation.

## 5. Fail-closed kill switch
The live probe MUST terminate immediately without remote cleanup writes on any of:
- implementation SHA mismatch;
- expired/missing authorization;
- repository not explicitly authorized and ENROLLED;
- operation not explicitly authorized;
- PermissionAttestation != VERIFIED_READ_ONLY;
- any forbidden write capability observed;
- host/scheme/redirect boundary violation;
- request budget/reserve violation;
- timeout/retry exhaustion;
- resource-limit breach;
- incomplete pagination;
- anchor invalidation/unknown consistency;
- secret leakage risk;
- attempted remote persistence;
- unexpected mutation-capable code path;
- invariant that cannot be proven without permissive fallback.

## 6. Credential constraints
Collector credentials MUST be dedicated to the authorized read-only context and MUST NOT be reused for later persistence. No token value is stored in the authorization envelope, evidence bundle, logs or digest. Credential acquisition/injection mechanism is implementation-specific but MUST support redaction and least privilege and MUST be independently reviewed before live authorization.

## 7. Evidence boundary
Successful execution produces only a local/ephemeral evidence bundle and a non-sensitive run summary. The bundle is not canonical governance state. No commit, issue/PR comment, artifact upload, release, remote object or external storage write is permitted by the collector.

Any decision to preserve or publish evidence is a separate post-probe gate with separate actor, authorization, destination, privacy/retention policy and secret scan.

## 8. Acceptance criteria for the first live run
A run can be recorded as C2 LIVE PROBE PASS only if all are true:
- exact authorized implementation SHA executed;
- authorization valid for that run;
- all contacted repositories were explicitly authorized and ENROLLED;
- PermissionAttestation was VERIFIED_READ_ONLY before material collection;
- only explicitly allowed typed read operations occurred;
- request count remained within budget and terminal anchor close executed;
- network boundary remained HTTPS/api.github.com with no redirect following;
- all resource ceilings were respected;
- collection session ended CONSISTENT;
- evidence has valid canonicalization/provenance/SHA-256 binding;
- only local/ephemeral sink was used;
- logs contain no credential/secret material;
- no mutation or remote persistence attempt occurred.

Any other outcome is FAIL/UNKNOWN, never partial PASS.

## 9. Post-run rule
A successful first live probe authorizes nothing beyond its own run. It does not create standing permission, scheduled collection, continuous monitoring, wider repository scope, additional operation families, persistence, UI/runtime activation or Stage D.

## 10. Pre-authorization implementation gate
Before asking for live authorization, the exact live-probe implementation head MUST pass:
- all existing Stage B, C1 and C2 pre-live qualification;
- static capability-surface audit;
- deterministic offline simulation of the complete runtime sequence;
- adversarial tests for authorization expiry/SHA mismatch/repository mismatch/operation mismatch;
- adversarial PermissionAttestation derivation;
- budget close-reserve and failed-attempt accounting;
- redirect/host/scheme enforcement;
- bounded streaming/decompression;
- pagination/anchor invalidation;
- local-only sink and remote-persistence rejection;
- safe-log/secret redaction;
- independent review with PASS on the exact implementation head.

Only after this gate may a separate human authorization be requested for one live run.