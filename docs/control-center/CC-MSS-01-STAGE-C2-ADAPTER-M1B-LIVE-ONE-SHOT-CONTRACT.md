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
- expected non-secret credential-principal reference/fingerprint;
- permission-attestation digest;
- request-budget policy digest;
- resource-limit policy digest;
- evidence-destination policy (`LOCAL_EPHEMERAL_ONLY`);
- issued-at and expires-at timestamps;
- unique authorization receipt reference;
- unique probe/run ID;
- runtime mode exactly `LIVE_ONE_SHOT`.

Any mismatch or missing/expired field MUST fail before credential materialization, DNS or socket creation, except for the narrowly defined permission-bootstrap credential step in section 5, which itself requires all pre-network authorization gates to have passed.

## 3. Human authorization receipt and atomic anti-replay
A live attempt requires a separate explicit human decision recorded after this contract and after independent review of the exact M1-B candidate head.

The receipt MUST be single-use and bind the fields in section 2. It MUST NOT be synthesized from CI status, PR approval, mergeability, labels, comments, environment variables or successful GET requests.

Receipt lifecycle is closed-world:
`ISSUED -> CLAIMED -> CONSUMED` or `ISSUED -> CLAIMED -> FAILED`.

Requirements:
- claim is an atomic local persistent state transition bound to receipt reference + probe/run ID + exact implementation SHA;
- the atomic claim MUST complete before credential materialization, DNS or socket creation;
- two concurrent processes cannot both obtain a valid claim;
- `CLAIMED`, `CONSUMED`, `FAILED`, unknown, corrupt or ambiguous state is never accepted as a fresh receipt;
- a process restart never converts `CLAIMED` back to `ISSUED`;
- receipt replay, copied state, repository/head/operation/policy mismatch or expiry fails closed;
- terminal state is persisted even when the session fails after claim, as far as local crash-safe primitives permit.

Default state is DENY. A receipt that cannot be atomically claimed is unusable.

## 4. Governed time and expiry
All authorization times are UTC instants represented canonically. The implementation MUST use an explicit clock abstraction so offline tests can control time; the live candidate must use a governed system UTC clock source.

The contract MUST pin a maximum allowed clock-skew tolerance. Unknown/unavailable/non-monotonic wall-clock state beyond that tolerance fails closed.

Expiry is checked:
- when validating and atomically claiming the receipt;
- immediately before permission-bootstrap network emission;
- immediately before every probe request, page and retry;
- immediately before anchor-close/recheck.

No request or bounded retry may start when its configured timeout/backoff envelope could extend beyond the remaining authorization window plus the explicitly governed skew tolerance. `Retry-After` never extends receipt expiry.

Monotonic elapsed-time measurement SHOULD be used for local timeout/budget accounting after session start, while UTC remains authoritative for receipt expiry.

## 5. Permission-attestation bootstrap without circularity
Permission proof MUST NOT be assumed to pre-exist without provenance. M1-B defines two allowed cases only:

**A. Pre-existing attestation:** a still-valid authoritative attestation created by a separately governed source may be supplied if its canonical digest, repository, probe/run or authorized context, exact implementation SHA, opaque credential reference, expected principal identity, observation/expiry and provenance all validate against the authorization envelope.

**B. In-session permission bootstrap:** if a live authoritative check is required, the following order is mandatory:
1. validate repository, exact head, operation/policy digests, receipt structure and UTC expiry;
2. atomically claim the single-use receipt;
3. reserve permission-check + probe + anchor-close budget;
4. materialize the credential solely through the separately reviewed credential source;
5. obtain the provider's non-secret principal reference/fingerprint together with the secret context;
6. compare that principal reference to the expected principal bound into the receipt;
7. recheck expiry immediately before emission;
8. perform only the separately governed authoritative permission-check operation/endpoint;
9. build and validate the permission attestation;
10. compare attested principal identity/fingerprint with the credential-provider identity and authorization envelope;
11. only after PASS may probe/anchor operations become eligible.

The permission-bootstrap endpoint/operation MUST be explicitly declared in the M1-B implementation contract, closed-world, read-only, separately counted in the request budget and covered by the same host/TLS/proxy/redirect/header/resource constraints as probe operations. It cannot be an arbitrary URL and cannot itself mutate remote state.

`UNKNOWN`, incomplete proof, write capability present, identity mismatch, missing provenance, digest mismatch or expiry terminates the claimed session as FAILED. A successful GET is never permission proof.

## 6. Credential context and confused-deputy protection
For credentialed modes, M1-B may introduce a concrete credential source only as a separately reviewed component. In `PUBLIC_ANONYMOUS_READ_ONLY`, credential materialization is forbidden: credentialRef=`NONE`, principalRef=`PUBLIC_ANONYMOUS`, and the public-repository proof replaces credential permission bootstrap. The provider contract MUST return a request-scoped secret context plus a non-secret stable principal/install/account reference or fingerprint suitable for equality checking; the secret itself is never included in a digest.

Requirements:
- opaque credential reference in descriptors/evidence;
- expected non-secret principal reference is bound into the authorization receipt;
- provider principal, authorization principal and attested principal MUST match before probe execution;
- secret material loads only after receipt claim and all non-secret pre-network gates pass;
- no token in logs, exceptions, snapshots, evidence or command arguments;
- no `.env`, shell, subprocess, Git credential helper or caller-provided raw token;
- credential lifetime is limited to the claimed one-shot session as far as runtime permits;
- no credential reuse after session termination/restart;
- no cross-host forwarding;
- provider ambiguity, identity mismatch or unverifiable principal fails closed.

A concrete provider implementation and authoritative permission source remain separately reviewed capabilities.

## 7. One-shot request budget
The authorization envelope MUST define a finite request budget before execution. Every attempt, retry, page, permission-attestation request and anchor open/close request consumes budget before emission.

A close/anchor reserve MUST be protected. No dependent request may begin if doing so could consume the reserved close budget. Permission bootstrap MUST reserve enough budget for the required close/reconciliation path before emission. Retries are finite, explicit and cannot extend authorization expiry.

Budget exhaustion is terminal and fail-closed.

## 8. Operation and destination scope
Only the closed-world operations eligible for the public anonymous repository observation are: `repo.read`, `ref.read`, `commit.read`, `pr.read`, and only if explicitly named in the authorization receipt. `pr.read` is limited to the bounded open-PR listing required by `RepositoryObservation v1`; saturation/incomplete pagination fails closed. The permission-bootstrap operation is not implicitly one of these operations and must be separately declared and authorized as described in section 5.

Each operation maps internally to GET + predetermined path template. No arbitrary URL, host, port, method, header, SNI, proxy or redirect is accepted from runtime input.

Destination remains `https://api.github.com`; redirects are never followed; TLS/hostname verification remains mandatory; `trust_env=False`; HTTP/2 remains disabled unless separately governed.

## 9. Resource and response limits
M1-A bounded streaming/decompression invariants remain mandatory end-to-end. The live envelope MUST pin positive ceilings for compressed bytes, decompressed bytes, cumulative session bytes, pages, items and parsing depth/complexity where applicable.

Unknown/multiple/stacked content encoding, malformed/truncated payload, unsupported media type, limit breach or incomplete pagination terminates fail-closed with deterministic cleanup.

No whole-body unbounded convenience read is allowed.

## 10. Snapshot consistency
A live one-shot session MUST use an anchor/open-close consistency rule. If the observed anchor changes during collection, the collection is invalidated; no mixed snapshot may be promoted as valid evidence.

`observedHead` and authorized/exact implementation head remain distinct concepts and MUST never be conflated.

## 11. Status, retry and rate-limit behavior
3xx is a boundary violation and is never followed. 401/403 cannot establish permissions. 404 and unknown statuses are fail-closed unless a specific operation contract defines absence semantics. 408/429/5xx may be retried only within the explicit retry, budget and authorization-expiry bounds.

`Retry-After`, if honored, MUST have a bounded maximum delay and be evaluated against the remaining receipt lifetime before sleeping/retrying.

## 12. Evidence boundary and crash-safe partial state
During M1-B the collector may produce only local/ephemeral evidence. No commit, upload, issue/PR comment, check publication, artifact publication or other remote persistence is permitted.

Evidence may contain identifiers, exact implementation SHA, operation, classifications, counters, canonical digests, non-secret principal reference and receipt/attestation references. It MUST NOT contain credentials, authorization/cookie/proxy headers, raw secret-bearing exceptions or arbitrary response bodies.

Evidence lifecycle is explicit: `IN_PROGRESS -> VALID` only after successful anchor-close/recheck and terminal cleanup. Any crash, abort, anchor mismatch, expiry, permission failure or incomplete lifecycle yields `INVALID/INCOMPLETE`; such evidence can never be promoted as valid by restart/resume.

Any later persistence/promotion is a separate actor and separately authorized phase.

## 13. Crash-safe one-shot lifecycle and recovery
A valid M1-B session has exactly one authorization envelope and one bounded execution lifecycle:
1. validate frozen exact head, repository, operation/policy digests and UTC expiry;
2. atomically claim receipt (`ISSUED -> CLAIMED`) bound to probe/run ID;
3. reserve total/permission/anchor-close budget;
4. validate pre-existing permission attestation OR perform the section 5 permission bootstrap;
5. verify provider principal == authorization principal == attested principal;
6. open anchor and consume budget;
7. execute only authorized bounded GET operations with expiry recheck before each emission;
8. close/recheck anchor using reserved budget;
9. finalize local/ephemeral evidence as VALID only if all checks pass;
10. deterministically close response/client state, invalidate credential context and transition receipt to CONSUMED.

Any ordinary failure jumps to cleanup, marks evidence `INVALID/INCOMPLETE`, invalidates credential context and transitions the claimed receipt to FAILED.

Crash/restart rule: a persisted `CLAIMED` receipt discovered after process restart MUST NOT resume automatically and MUST NOT be reissued locally. It is treated as terminal/unusable pending reconciliation; associated partial evidence remains `INVALID/INCOMPLETE`; any further live attempt requires a new human authorization receipt. No credential material may be reconstructed from persisted session state.

## 14. Kill conditions
The live candidate MUST abort immediately and fail closed on at least:
- exact-head/repository/operation mismatch;
- missing, replayed, expired, concurrently claimed, corrupt or malformed authorization receipt;
- unavailable/invalid clock or expiry window insufficient for the next bounded request;
- permission UNKNOWN/write-present/unbound/expired or provenance missing;
- provider/authorization/attestation principal mismatch;
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

## 15. Required pre-live M1-B qualification
Before any human live authorization can be requested, an M1-B candidate implementation MUST pass offline/mocked tests proving at minimum:
- exact-head and receipt binding, UTC expiry and replay rejection;
- atomic claim under concurrent contenders; only one may transition ISSUED -> CLAIMED;
- restart with CLAIMED receipt cannot resume/replay and requires new authorization;
- corrupt/ambiguous receipt state fails closed;
- clock skew/unavailable clock/insufficient remaining lifetime fail closed;
- credential is not materialized before atomic claim and all non-secret pre-network gates;
- permission-bootstrap order is enforced and endpoint/operation is closed-world;
- pre-existing attestation provenance and expiry validation;
- provider principal == authorization principal == attested principal; mismatch rejected;
- authoritative permission derivation and write-present/UNKNOWN rejection;
- budget accounting including failed attempts, permission bootstrap, pagination and close reserve;
- redirect/proxy/host/SNI/TLS fail-closed behavior;
- bounded streaming/decompression and cumulative limits;
- anchor-change invalidation;
- status/rate-limit/retry semantics without real sleeping and without crossing receipt expiry;
- local/ephemeral-only evidence capability;
- crash/abort leaves evidence INVALID/INCOMPLETE and receipt non-reusable;
- secret-safe logging/exceptions;
- deterministic cleanup on every ordinary abort point;
- one-shot credential/session state cannot be reused or reconstructed after restart;
- network guard proves ordinary CI performs zero real egress;
- capability audit rejects mutation, remote persistence, subprocess/dynamic escape and undeclared network clients.

CI workflow permissions MUST remain read-only.

## 16. Independent review gate
After M1-B implementation and offline qualification, an independent adversarial review MUST PASS on the exact candidate head. Any security-relevant remediation changes the exact head and requires another review.

Only after that review may a human be asked for a separate `LIVE_ONE_SHOT` authorization decision.

## 17. Explicit decision boundary
This contract authorizes only the design and offline materialization/qualification of an M1-B candidate. It does not authorize the live probe itself.

Current normative state remains:

`M1-A=QUALIFIED_OFFLINE`

`M1-B=CONTRACT_HARDENED / IMPLEMENTATION_NOT_AUTHORIZED_FOR_LIVE`

`live=NOT_AUTHORIZED`
