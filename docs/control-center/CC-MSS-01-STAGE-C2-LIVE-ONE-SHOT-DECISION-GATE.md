# CC-MSS-01 — Stage C2 M1-B LIVE_ONE_SHOT human decision gate

Status: PREPARED / HUMAN_DECISION_REQUIRED / LIVE NOT AUTHORIZED

Qualified M1-B baseline: `c818df64656e373f34d8f72bd62dde5b203be634`
Independent adversarial review: PASS on the exact baseline above.
Normative state: `M1-B=QUALIFIED_OFFLINE`; `live=NOT_AUTHORIZED`.

## 1. Purpose

This artifact consolidates the decision gate that must exist before any `LIVE_ONE_SHOT` authorization can be issued. Creating, reviewing, committing or merging this document does **not** authorize network access, credential materialization, permission bootstrap, remote persistence or execution of the live probe.

The human decision is intentionally separate from the technical qualification. CI success, review PASS, PR mergeability, labels, comments or this document cannot synthesize authorization.

## 2. Candidate freeze

A future authorization receipt MUST pin a reviewed live candidate by exact implementation SHA. The current qualified offline baseline is:

`c818df64656e373f34d8f72bd62dde5b203be634`

If preparation of the executable live candidate changes any security-relevant code, policy, dependency, operation mapping, credential/permission component or gate semantics, the new exact head MUST pass the required CI and independent adversarial review before a human authorization decision is requested.

Therefore this document does not pre-authorize a descendant head.

## 3. Mandatory authorization envelope

A human `LIVE_ONE_SHOT` receipt is valid only when every field below is explicit, internally consistent and bound into the receipt/digest:

- authorization receipt reference: unique, single-use;
- probe/run ID: unique;
- runtime mode: exactly `LIVE_ONE_SHOT`;
- repository identity: exact allowlisted repository;
- exact implementation SHA: exact reviewed candidate;
- operation allowlist: closed-world subset of reviewed read-only operations;
- permission-bootstrap operation/endpoint, if needed: separately declared read-only operation;
- authority: `https://api.github.com` only;
- credential reference: opaque, never secret material;
- expected non-secret principal/install/account reference or fingerprint;
- permission-attestation reference + canonical digest + provenance + expiry;
- request-budget policy digest, including permission bootstrap and protected anchor-close reserve;
- retry/timeout policy digest;
- resource-limit policy digest;
- canonicalization version;
- evidence destination: exactly `LOCAL_EPHEMERAL_ONLY`;
- issued-at UTC;
- expires-at UTC;
- governed maximum clock skew;
- explicit human authorization decision.

Missing, unknown, ambiguous, mismatched or expired fields mean DENY.

## 4. Preconditions before the human decision

The decision MUST NOT be requested until all of the following are true on the exact candidate head:

1. M1-B offline qualification PASS.
2. Capability-surface audit PASS.
3. Adversarial M1-B tests PASS.
4. Full regression CI PASS with workflow permissions remaining read-only.
5. Independent adversarial review PASS on that exact candidate head.
6. No unresolved security-relevant review finding.
7. Candidate operation set, repository allowlist, budget, expiry, credential reference/principal and evidence destination are frozen and inspectable.
8. No live execution has occurred during qualification.

A change to any security-relevant item after review invalidates the decision package and returns the candidate to review.

## 5. Human decision semantics

The decision is binary and explicit:

- `DENY`: no live execution; no credential materialization; no network.
- `AUTHORIZE_LIVE_ONE_SHOT`: authorizes exactly one claimed session under the frozen envelope and nothing else.

Authorization MUST NOT imply permission to merge PR #116, enable recurring/background collection, mutate GitHub state, publish evidence remotely, dispatch workflows or enter Stage D.

Silence, inactivity, CI success, previous approval or a generic instruction to proceed MUST NOT be converted into a live authorization receipt unless it explicitly authorizes the frozen `LIVE_ONE_SHOT` envelope.

## 6. Atomic claim and credential boundary

After explicit authorization, execution still remains fail-closed:

1. validate exact head, repository, operations, policy digests, receipt structure and UTC expiry;
2. atomically claim `ISSUED -> CLAIMED`, bound to receipt + probe/run + exact SHA;
3. only then may the separately reviewed credential source materialize a request-scoped credential context, and only after all applicable non-secret pre-network gates;
4. provider principal, authorization principal and attested principal MUST match;
5. any failure invalidates the credential context and moves the claimed receipt to `FAILED`;
6. success invalidates/closes the credential context and moves the receipt to `CONSUMED`.

`CLAIMED`, `FAILED`, `CONSUMED`, corrupt or ambiguous receipts cannot be reused. A restart never resumes a claimed session.

## 7. Bounded one-shot scope

The live session is constrained to the explicitly authorized read-only operations. Carried-forward eligible probe operations are:

- `repo.read`;
- `ref.read`;
- `commit.read`.

Only operations actually named in the authorization receipt are enabled. Permission bootstrap, when required, is separate and must be declared and budgeted explicitly.

All requests remain GET-only, HTTPS-only, authority-fixed, redirect-denied, proxy-disabled, TLS/hostname verified and resource-bounded. No arbitrary URL, method, host, port, header, SNI or proxy input is permitted.

## 8. Budget and expiry

Every permission request, anchor operation, probe attempt, retry and page consumes budget before emission. A protected close reserve is mandatory.

No request may start if:

- remaining request budget is insufficient;
- protected close reserve would be consumed;
- receipt expiry is reached or ambiguous;
- configured timeout/backoff could exceed the remaining authorized lifetime under the governed skew rule.

Budget exhaustion or expiry is terminal for that receipt.

## 9. Evidence boundary

The authorized session may produce only local/ephemeral evidence. Evidence becomes `VALID` only after successful anchor-close/recheck and deterministic cleanup.

Any crash, abort, permission failure, expiry, anchor change, incomplete pagination or lifecycle failure yields `INVALID/INCOMPLETE` evidence. Restart cannot promote partial evidence.

Commit, upload, PR/issue comment, check publication, artifact publication or any other remote persistence requires a separate actor and separate authorization.

## 10. Kill conditions

The session MUST terminate fail-closed on any unclassified state and at least on:

- exact-head/repository/operation mismatch;
- missing/replayed/expired/concurrently claimed/corrupt receipt;
- invalid clock or insufficient authorization lifetime;
- permission UNKNOWN, write-present, unbound, expired or without provenance;
- provider/authorization/attestation principal mismatch;
- credential ambiguity or invalidated context;
- unexpected scheme/host/port/SNI/proxy/redirect or TLS failure;
- budget/close-reserve violation;
- response/resource/session limit breach;
- incomplete pagination;
- anchor change;
- unsupported/malformed/truncated response or encoding;
- secret-redaction failure;
- non-local evidence destination;
- mutation, remote persistence, workflow dispatch or undeclared network capability.

No kill condition may fall back to a permissive state.

## 11. Decision record template

This template is intentionally incomplete until the candidate and human decision are frozen.

```text
CC-MSS-01 / M1-B LIVE_ONE_SHOT HUMAN DECISION

Decision: <DENY | AUTHORIZE_LIVE_ONE_SHOT>
Authorization receipt ref: <unique ref>
Probe/run ID: <unique id>
Repository: <exact allowlisted repository>
Exact candidate SHA: <reviewed exact SHA>
Operations: <closed-world read-only set>
Permission bootstrap: <NONE | exact reviewed operation>
Credential ref: <opaque ref; no secret>
Expected principal ref/fingerprint: <non-secret value>
Permission attestation digest/ref: <value>
Request-budget policy digest: <value>
Retry/timeout policy digest: <value>
Resource-limit policy digest: <value>
Canonicalization version: <value>
Evidence destination: LOCAL_EPHEMERAL_ONLY
Issued at UTC: <timestamp>
Expires at UTC: <timestamp>
Clock-skew ceiling: <value>
Independent review ref: <review bound to exact candidate SHA>
Human decision recorded by: <authorized human identity/ref>
```

The receipt MUST be generated/claimed through the governed mechanism; this textual template alone is never executable authorization.

## 12. Current gate state

At creation of this artifact:

- `M1-B=QUALIFIED_OFFLINE` on `c818df64656e373f34d8f72bd62dde5b203be634`;
- independent adversarial review on that exact head: PASS;
- `LIVE_ONE_SHOT=AWAITING_SEPARATE_HUMAN_DECISION`;
- `live=NOT_AUTHORIZED`;
- no credential materialization authorized;
- no network execution authorized;
- no remote evidence persistence authorized;
- no merge authorization implied.

The next permissible transition is preparation/verification of the exact decision package. Actual live execution can occur only after an explicit human `AUTHORIZE_LIVE_ONE_SHOT` decision bound to that package.