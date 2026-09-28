# CC-MSS-01 — Stage C2 Adapter M1-B LIVE ONE-SHOT contract

Status: PROPOSED — CONTRACT ONLY / LIVE NOT AUTHORIZED
M1-A qualified exact head: `fe29e0086627b4336a2f61bd8ccd0571c72062af`
M1-A evidence: Governance #615 PASS; M1-A qualification 17/17; M1-A audit adversarial 16/16; full Python regression 133/133; second independent adversarial review PASS.
Normative state: `live=NOT_AUTHORIZED`.

## 1. Purpose and non-authorization
M1-B defines the minimum governed envelope required before a single live read-only GitHub probe may even be considered. This document does not authorize execution, credentials, network access, remote persistence, mutation, workflow dispatch, recurring collection, Stage D or merge of PR #116.

No implementation may reinterpret M1-A `QUALIFIED_OFFLINE` or this contract as permission to execute live.

## 2. Frozen implementation binding
Any future live authorization MUST bind to all of:
- repository identity;
- exact M1-A/M1-B implementation SHA;
- approved operation set;
- fixed authority `api.github.com` and HTTPS;
- credential reference, never credential material;
- permission-attestation digest;
- request-budget policy digest;
- resource-limit policy digest;
- evidence-destination policy (`LOCAL_EPHEMERAL_ONLY`);
- issued-at and expires-at timestamps;
- unique authorization receipt reference;
- runtime mode exactly `LIVE_ONE_SHOT`.

Any mismatch or missing/expired field MUST fail before credential materialization, DNS or socket creation.

## 3. Human authorization receipt
A live attempt requires a separate explicit human decision recorded after this contract and after independent review of the exact M1-B candidate head.

The receipt MUST be single-use and bind the fields in section 2. It MUST NOT be synthesized from CI status, PR approval, mergeability, labels, comments, environment variables or successful GET requests.

Default state is DENY. Replay, ambiguity, expiry, changed head, changed repository, changed operation set or changed policy digest invalidates the receipt.

## 4. Credential boundary
M1-B may introduce a concrete credential source only as a separately reviewed component. Requirements:
- opaque credential reference in descriptors/evidence;
- secret material loaded only after authorization receipt, exact-head and permission prerequisites pass;
- no token in logs, exceptions, snapshots, evidence or command arguments;
- no `.env`, shell, subprocess, Git credential helper or caller-provided raw token;
- credential lifetime limited to the one-shot session as far as runtime permits;
- no credential reuse after session termination;
- no cross-host forwarding.

A missing or unverifiable credential source fails closed.

## 5. Authoritative permission attestation
Before the probe operation, an authoritative source MUST establish the effective credential context as read-only for the required operation set.

The attestation MUST bind repository, run/probe ID, exact implementation SHA, opaque credential reference, observed permissions, forbidden-write check, observed-at/expiry and canonical digest.

`UNKNOWN`, incomplete proof, write capability present, digest mismatch or expiry MUST terminate before the probe operation. A successful GET is never permission proof.

Permission attestation itself counts against the request budget if it requires a network request.

## 6. One-shot request budget
The authorization envelope MUST define a finite request budget before execution. Every attempt, retry, page, permission-attestation request and anchor open/close request consumes budget before emission.

A close/anchor reserve MUST be protected. No dependent request may begin if doing so could consume the reserved close budget. Retries are finite, explicit and cannot extend authorization expiry.

Budget exhaustion is terminal and fail-closed.

## 7. Operation and destination scope
Only the closed-world operations carried forward from M0/M1-A are eligible: `repo.read`, `ref.read`, `commit.read`, and only if explicitly named in the authorization receipt.

Each operation maps internally to GET + predetermined path template. No arbitrary URL, host, port, method, header, SNI, proxy or redirect is accepted from runtime input.

Destination remains `https://api.github.com`; redirects are never followed; TLS/hostname verification remains mandatory; `trust_env=False`; HTTP/2 remains disabled unless separately governed.

## 8. Resource and response limits
M1-A bounded streaming/decompression invariants remain mandatory end-to-end. The live envelope MUST pin positive ceilings for compressed bytes, decompressed bytes, cumulative session bytes, pages, items and parsing depth/complexity where applicable.

Unknown/multiple/stacked content encoding, malformed/truncated payload, unsupported media type, limit breach or incomplete pagination terminates fail-closed with deterministic cleanup.

No whole-body unbounded convenience read is allowed.

## 9. Snapshot consistency
A live one-shot session MUST use an anchor/open-close consistency rule. If the observed anchor changes during collection, the collection is invalidated; no mixed snapshot may be promoted as valid evidence.

`observedHead` and authorized/exact implementation head remain distinct concepts and MUST never be conflated.

## 10. Status, retry and rate-limit behavior
3xx is a boundary violation and is never followed. 401/403 cannot establish permissions. 404 and unknown statuses are fail-closed unless a specific operation contract defines absence semantics. 408/429/5xx may be retried only within the explicit retry, budget and authorization-expiry bounds.

`Retry-After`, if honored, MUST have a bounded maximum delay; sleeping past receipt expiry is forbidden.

## 11. Evidence boundary
During M1-B the collector may produce only local/ephemeral evidence. No commit, upload, issue/PR comment, check publication, artifact publication or other remote persistence is permitted.

Evidence may contain identifiers, exact implementation SHA, operation, classifications, counters, canonical digests and receipt/attestation references. It MUST NOT contain credentials, authorization/cookie/proxy headers, raw secret-bearing exceptions or arbitrary response bodies.

Any later persistence/promotion is a separate actor and separately authorized phase.

## 12. One-shot lifecycle
A valid M1-B session has exactly one authorization envelope and one bounded execution lifecycle:
1. validate frozen exact head and repository;
2. validate single-use human receipt and expiry;
3. validate operation/policy digests;
4. obtain/validate authoritative read-only permission attestation;
5. materialize credential only after prior gates pass;
6. open anchor and consume budget;
7. execute only authorized bounded GET operations;
8. close/recheck anchor using reserved budget;
9. finalize local/ephemeral evidence;
10. deterministically close response/client state and invalidate session credential/receipt state.

Any failure jumps to cleanup and terminal failure. There is no background continuation or automatic retry after the session ends.

## 13. Kill conditions
The live candidate MUST abort immediately and fail closed on at least:
- exact-head/repository/operation mismatch;
- missing, replayed, expired or malformed authorization receipt;
- permission UNKNOWN/write-present/unbound/expired;
- credential source ambiguity;
- unexpected host/scheme/port/SNI/proxy/redirect;
- TLS verification failure;
- request budget or close reserve violation;
- response/resource/session limit breach;
- incomplete pagination;
- anchor change;
- unsupported content encoding/media type;
- secret-redaction failure;
- evidence destination not local/ephemeral;
- any mutation/remote-write capability detected;
- any state not explicitly classified as safe.

## 14. Required pre-live M1-B qualification
Before any human live authorization can be requested, an M1-B candidate implementation MUST pass offline/mocked tests proving at minimum:
- exact-head and receipt binding, expiry and replay rejection;
- credential is not materialized before all pre-network gates;
- authoritative permission derivation and write-present/UNKNOWN rejection;
- budget accounting including failed attempts, attestation, pagination and close reserve;
- redirect/proxy/host/SNI/TLS fail-closed behavior;
- bounded streaming/decompression and cumulative limits;
- anchor-change invalidation;
- status/rate-limit/retry semantics without real sleeping;
- local/ephemeral-only evidence capability;
- secret-safe logging/exceptions;
- deterministic cleanup on every abort point;
- one-shot state cannot be reused;
- network guard proves ordinary CI performs zero real egress;
- capability audit rejects mutation, remote persistence, subprocess/dynamic escape and undeclared network clients.

CI workflow permissions MUST remain read-only.

## 15. Independent review gate
After M1-B implementation and offline qualification, an independent adversarial review MUST PASS on the exact candidate head. Any security-relevant remediation changes the exact head and requires another review.

Only after that review may a human be asked for a separate `LIVE_ONE_SHOT` authorization decision.

## 16. Explicit decision boundary
This contract authorizes only the design and offline materialization/qualification of an M1-B candidate. It does not authorize the live probe itself.

Current normative state remains:

`M1-A=QUALIFIED_OFFLINE`

`M1-B=CONTRACT_DEFINED / IMPLEMENTATION_NOT_AUTHORIZED_FOR_LIVE`

`live=NOT_AUTHORIZED`
