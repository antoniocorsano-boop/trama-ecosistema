# CC-MSS-01 — Stage C2 Adapter M1 contract

Status: PROPOSED — CONTRACT ONLY / NO LIVE EXECUTION
M0 qualified exact head: `d400beae8cc45549ea01622911c710170db72087`
M0 evidence: Governance #604 PASS; M0 qualification 19/19; M0 audit adversarial 11/11; full Python regression 100/100; second independent adversarial review PASS.
Normative state: `network=GUARDED`; `live=NOT_AUTHORIZED`.

## 1. M0 checkpoint
M0 is frozen as the qualified inert boundary. M1 MUST preserve all M0 invariants and MUST NOT reinterpret M0 PASS as authorization to contact GitHub.

M0 invariants carried forward:
- closed-world operations: `repo.read`, `ref.read`, `commit.read`;
- method exactly `GET`;
- scheme exactly `https`;
- host exactly `api.github.com`;
- redirects denied;
- no arbitrary runtime absolute URL;
- validated owner/repository/ref/SHA path inputs;
- opaque credential reference, never token material in descriptors/evidence/logs;
- positive resource ceilings and cumulative session budget;
- truncated/malformed compressed payload fail-closed;
- no mutation, remote persistence, workflow dispatch or Stage D behavior.

## 2. Purpose of M1
M1 may materialize the first concrete read-only HTTP transport, but only behind a hard execution interlock. Its implementation and tests MUST remain incapable of a real network call under ordinary CI and local qualification.

M1 is split into two distinct states:
- **M1-A — concrete transport, execution disabled:** implementation exists; all behavior is exercised through an injected offline transport/socket boundary; no credential source and no live execution path is authorized.
- **M1-B — one-shot live candidate:** may be considered only after M1-A CI PASS and independent adversarial review. M1-B requires a separate human authorization envelope and is outside this contract's implementation authorization.

This document authorizes design/implementation of M1-A only. It does not authorize M1-B.

## 3. Concrete transport requirements
The M1-A transport MUST:
- accept only a validated M0 request descriptor, never a raw URL;
- construct the destination exclusively from the descriptor's fixed scheme/host/path;
- issue only `GET`;
- disable redirects at the HTTP client layer;
- verify TLS certificates and hostname using the platform trust store with verification enabled and no bypass option;
- set an explicit connect/read/total timeout policy;
- stream response bytes incrementally into the M0 bounded processor; never call an unbounded whole-body convenience API;
- expose response status and selected safe headers without logging secrets;
- reject unexpected content encoding/media type before parsing where applicable;
- close response/socket resources deterministically on success and failure.

## 4. Network execution interlock
M1-A MUST be fail-closed by construction.

A real network call requires all of the following, which M1-A qualification MUST NOT provide:
1. an explicit `LiveExecutionPermit` object;
2. permit bound to repository, exact implementation SHA, operation set and expiry;
3. a concrete credential source separately authorized;
4. authoritative permission attestation proving read-only scope;
5. one-shot request budget with close reserve;
6. explicit runtime mode `LIVE_ONE_SHOT`;
7. human authorization receipt reference.

Absence, mismatch, expiry or unknown state of any field MUST fail before DNS/socket creation.

CI MUST install a network guard that fails if DNS/socket/HTTP egress is attempted.

## 5. Credential boundary
M1-A MUST NOT load a real credential.

The implementation may define a `CredentialProvider` protocol and an authorization-header constructor that accepts only a secret value supplied by an injected provider during isolated tests. The provider used by CI MUST be fake and deterministic.

Requirements:
- no `os.environ`, `.env`, filesystem token, Git credential helper, CLI credential lookup, OAuth exchange or secret-store integration in M1-A;
- token values never appear in exception text, evidence, snapshots or logs;
- authorization header is created as late as possible and is never copied into request/evidence serialization;
- cross-host credential forwarding is impossible because redirects are denied and host is fixed;
- credential memory lifetime is limited to the request scope as far as the language/runtime permits.

A concrete real credential provider is a separate reviewed step.

## 6. TLS and redirect qualification
Offline/mocked tests MUST prove:
- certificate verification cannot be disabled by configuration;
- hostname verification cannot be disabled;
- HTTP downgrade is impossible;
- redirect responses (301, 302, 303, 307, 308) are rejected without following `Location`;
- redirect to another host never receives credentials;
- destination host remains exactly `api.github.com`.

No test may contact an external host.

## 7. Streaming and decompression qualification
The transport and M0 bounded processor MUST be composed end-to-end under offline fixtures.

Tests MUST include:
- response delivered in many small chunks;
- compressed payload within limits;
- compressed-small/decompressed-large bomb;
- truncated compressed stream;
- malformed UTF-8/JSON;
- single-response compressed/decompressed ceilings;
- cumulative session ceiling across multiple operations;
- early abort before complete body materialization when a ceiling is crossed;
- deterministic cleanup after abort.

## 8. Status, retry and rate-limit semantics
M1-A MUST classify HTTP outcomes fail-closed.

Initial policy:
- 2xx: eligible for schema/resource validation;
- 3xx: `SOURCE_BOUNDARY_VIOLATION`, never followed;
- 401/403: `SOURCE_PERMISSION_UNVERIFIED` or `SOURCE_UNAVAILABLE` according to authoritative evidence; never infer read-only permission from GET success;
- 404: `SOURCE_UNAVAILABLE` unless the operation contract explicitly defines absence semantics;
- 408/429/5xx: transient source failure eligible only for bounded retry policy;
- all other/unknown statuses: `SOURCE_UNAVAILABLE`.

Retry rules:
- retry count is explicit and finite;
- each attempt consumes request budget before execution;
- no retry may consume the reserved close/anchor budget;
- `Retry-After`, if supported, is parsed with a bounded maximum delay and is testable without sleeping in CI;
- retries never broaden host, operation or credential scope.

## 9. Permission derivation
M1-A MUST NOT treat successful GET as permission proof.

A future concrete `PermissionSource` must derive observed permissions from an authoritative GitHub source and bind the resulting attestation to:
- repository;
- probe/run identifier;
- exact implementation SHA;
- opaque credential reference;
- observation timestamp/expiry;
- canonical digest.

Until that concrete source is separately implemented and reviewed, M1-A remains non-live.

## 10. Evidence and logging
Evidence remains local/ephemeral during M1-A.

Allowed evidence:
- operation identifier;
- repository identity;
- exact implementation SHA;
- status classification;
- byte/page/item/request counters;
- canonical digests;
- timing buckets that do not expose secrets;
- attestation/authorization receipt references.

Forbidden evidence/log content:
- tokens or authorization headers;
- raw credential provider output;
- arbitrary response bodies;
- secret-bearing exception objects;
- remote upload destinations.

## 11. Capability-surface audit
M1-A introduces a deliberately narrow network capability, so the M0 blanket network prohibition is replaced only for the explicitly declared M1 transport module.

The audit MUST enforce a closed-world runtime manifest and fail on:
- additional undeclared network-capable modules;
- subprocess/shell execution;
- dynamic imports/eval/exec;
- environment/filesystem/CLI credential discovery;
- generic URL fetchers;
- methods other than GET;
- redirect-following configuration;
- TLS verification bypass;
- remote persistence/upload/publish/comment/merge/dispatch surfaces;
- concrete PermissionSource or real CredentialProvider implementations not separately authorized.

The audit itself and tests are outside the runtime manifest but require adversarial detector tests.

## 12. Required M1-A negative tests
At minimum:
- raw/absolute URL rejected;
- non-GET rejected;
- host/scheme mutation rejected;
- redirect rejected and not followed;
- TLS verification bypass attempt rejected;
- missing/expired/mismatched LiveExecutionPermit rejected before network boundary;
- no real credential provider available;
- permission unknown/write-present rejected;
- timeout/retry exhaustion fail-closed;
- request budget and close reserve enforced;
- rate-limit classification deterministic;
- streaming/decompression/session limits enforced;
- malformed/truncated response rejected;
- secret redaction tests for logs/exceptions/evidence;
- network guard proves CI makes zero real egress;
- mutation and remote persistence surfaces absent.

## 13. Qualification gate
M1-A can be called `QUALIFIED_OFFLINE` only when all are true:
1. M0 regression remains green;
2. M1-A unit/integration/negative tests PASS;
3. capability-surface audit PASS;
4. adversarial tests of the audit PASS;
5. CI network guard proves zero egress;
6. workflow permissions remain read-only;
7. independent adversarial review PASS on the exact implementation head.

Any remediation to security-relevant M1-A code after review requires another independent review.

## 14. Explicit non-authorization
M1-A qualification does **not** authorize:
- a real credential provider;
- a real PermissionSource;
- live GitHub execution;
- recurring/background collection;
- remote evidence persistence;
- mutation APIs;
- workflow dispatch;
- Stage D;
- merge of PR #116 solely because CI is green.

The normative state remains `live=NOT_AUTHORIZED` until a separate M1-B authorization decision is recorded.