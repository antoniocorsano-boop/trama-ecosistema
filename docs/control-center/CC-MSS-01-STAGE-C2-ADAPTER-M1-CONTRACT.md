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

The concrete HTTP library and version MUST be declared as a governed dependency before implementation. Security-critical client configuration MUST be constructed internally by the M1 transport and MUST NOT be accepted as arbitrary caller configuration. Method, scheme, host, TLS verification, hostname verification, redirect policy, proxy policy, automatic decompression policy and timeout bounds are invariants.

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

## 5. Destination, DNS, proxy and SSRF boundary
The logical destination is closed-world: `https://api.github.com` plus the validated descriptor path.

M1-A MUST enforce:
- no caller-provided absolute URL, authority, port, Host header or SNI value;
- no proxy discovery from environment variables, system configuration or caller input;
- no HTTP(S)/SOCKS proxy unless a future separately governed contract explicitly authorizes one;
- DNS resolution only as a consequence of connecting to the internally fixed hostname `api.github.com`;
- TLS hostname verification and SNI remain `api.github.com`; neither may be derived from resolved address or caller input;
- no direct-IP destination and no Host/SNI override;
- no alternate service discovery, URL rewrite or redirect path that can change authority;
- resolved addresses MUST NOT be pinned in this contract: GitHub address ranges can legitimately change.

Offline qualification MUST exercise proxy-variable/config injection, absolute-URL injection, Host override and SNI override attempts and prove they cannot alter the destination. DNS/socket creation remains blocked by the M1-A execution interlock and CI network guard.

## 6. Credential and outbound-header boundary
M1-A MUST NOT load a real credential.

The implementation may define a `CredentialProvider` protocol and an authorization-header constructor that accepts only a secret value supplied by an injected provider during isolated tests. The provider used by CI MUST be fake and deterministic.

Outbound headers are closed-world. The transport MUST construct them internally from a fixed allowlist. Caller-supplied arbitrary headers are forbidden. At minimum:
- `Host` is controlled by the HTTP/TLS destination and cannot be overridden;
- `Authorization`, when exercised in isolated tests, is produced only from the injected fake provider and is never caller-supplied;
- `Proxy-Authorization`, `Cookie`, `Forwarded`, `X-Forwarded-*` and equivalent routing/authentication headers are forbidden;
- CR/LF and other control characters in all header names/values are rejected before the transport boundary;
- sensitive headers are excluded from serialization, evidence, snapshots and exception rendering.

Additional credential requirements:
- no `os.environ`, `.env`, filesystem token, Git credential helper, CLI credential lookup, OAuth exchange or secret-store integration in M1-A;
- token values never appear in exception text, evidence, snapshots or logs;
- authorization header is created as late as possible and is never copied into request/evidence serialization;
- cross-host credential forwarding is impossible because redirects are denied and authority is fixed;
- credential memory lifetime is limited to the request scope as far as the language/runtime permits.

A concrete real credential provider is a separate reviewed step.

## 7. TLS, redirect and connection-state qualification
Offline/mocked tests MUST prove:
- certificate verification cannot be disabled by configuration;
- hostname verification cannot be disabled;
- HTTP downgrade is impossible;
- redirect responses (301, 302, 303, 307, 308) are rejected without following `Location`;
- redirect to another host never receives credentials;
- destination host and SNI remain exactly `api.github.com`;
- no proxy configuration can be inherited or injected;
- cookie jar is disabled/not present;
- authentication cache and cross-host connection state are disabled/not present;
- any connection pool is restricted to the single authorized authority and cannot broaden destination scope;
- response/connection resources are closed deterministically on success, rejection, timeout and bounded-processing abort;
- one-shot/session shutdown clears transport state as far as the chosen library permits.

No test may contact an external host.

## 8. Streaming, content encoding and decompression ownership
The transport and M0 bounded processor MUST be composed end-to-end under offline fixtures.

There MUST be exactly one governed decompression owner. M1-A MUST configure the HTTP client so that response-body automatic decompression does not invisibly occur before compressed-byte accounting. Wire/compressed bytes are counted before decompression and the explicit, validated content encoding is then handed to the bounded processor.

Initial encoding policy is closed-world:
- identity/no encoding: allowed;
- a single explicitly supported compressed encoding: allowed only when the bounded processor implements and tests it;
- unknown, multiple, stacked or syntactically ambiguous content encodings: fail closed;
- content type/media type must match the operation contract before JSON parsing where applicable.

Tests MUST include:
- response delivered in many small chunks;
- compressed payload within limits;
- compressed-small/decompressed-large bomb;
- truncated compressed stream;
- malformed UTF-8/JSON;
- unknown/multiple/stacked content encoding;
- proof that automatic client decompression is disabled;
- single-response compressed/decompressed ceilings;
- cumulative session ceiling across multiple operations;
- early abort before complete body materialization when a ceiling is crossed;
- deterministic cleanup after abort.

## 9. Status, retry and rate-limit semantics
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

## 10. Permission derivation
M1-A MUST NOT treat successful GET as permission proof.

A future concrete `PermissionSource` must derive observed permissions from an authoritative GitHub source and bind the resulting attestation to:
- repository;
- probe/run identifier;
- exact implementation SHA;
- opaque credential reference;
- observation timestamp/expiry;
- canonical digest.

Until that concrete source is separately implemented and reviewed, M1-A remains non-live.

## 11. Evidence and logging
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
- tokens, authorization headers, cookies or proxy credentials;
- raw credential provider output;
- arbitrary response bodies;
- secret-bearing exception objects;
- raw outbound header maps;
- remote upload destinations.

## 12. Connection/session state
M1-A MUST be stateless across independently authorized one-shot sessions except for explicit non-secret counters/evidence state.

The chosen HTTP client MUST NOT expose an implicit cookie jar, authentication cache, proxy-auth cache or cross-authority connection pool to M1-A. If pooling is used internally, it is restricted to `api.github.com`, contains no caller-controlled authority, and is closed deterministically at session end. Tests MUST prove that simulated sensitive state from one request is not reused or emitted in a later request.

## 13. Capability-surface and dependency audit
M1-A introduces a deliberately narrow network capability, so the M0 blanket network prohibition is replaced only for the explicitly declared M1 transport module.

The audit MUST enforce a closed-world runtime manifest and a governed HTTP dependency/version. It MUST fail on:
- additional undeclared network-capable modules;
- undeclared or changed HTTP client dependency/version;
- subprocess/shell execution;
- dynamic imports/eval/exec;
- environment/filesystem/CLI credential or proxy discovery;
- generic URL fetchers;
- methods other than GET;
- caller-overridable scheme/host/port/SNI/Host/proxy/TLS/redirect/auto-decompression settings;
- redirect-following configuration;
- TLS or hostname-verification bypass;
- automatic response decompression before bounded accounting;
- cookie jar/auth cache/cross-host state;
- remote persistence/upload/publish/comment/merge/dispatch surfaces;
- concrete PermissionSource or real CredentialProvider implementations not separately authorized.

The audit itself and tests are outside the runtime manifest but require adversarial detector tests specific to the selected HTTP library and its configuration API.

## 14. Required M1-A negative tests
At minimum:
- raw/absolute URL rejected;
- non-GET rejected;
- host/scheme/port/SNI mutation rejected;
- proxy environment/configuration injection cannot affect destination;
- arbitrary outbound headers, Host override, Proxy-Authorization, Cookie, Forwarded/X-Forwarded-* and CR/LF injection rejected;
- redirect rejected and not followed;
- TLS/hostname verification bypass attempt rejected;
- automatic decompression cannot be enabled;
- unknown/multiple content encoding rejected;
- missing/expired/mismatched LiveExecutionPermit rejected before network boundary;
- no real credential provider available;
- permission unknown/write-present rejected;
- timeout/retry exhaustion fail-closed;
- request budget and close reserve enforced;
- rate-limit classification deterministic;
- streaming/decompression/session limits enforced;
- malformed/truncated response rejected;
- connection/cookie/auth state does not leak across simulated requests/sessions;
- secret redaction tests for logs/exceptions/evidence;
- network guard proves CI makes zero real egress;
- mutation and remote persistence surfaces absent;
- dependency/configuration audit proves the governed client version and immutable security settings.

## 15. Qualification gate
M1-A can be called `QUALIFIED_OFFLINE` only when all are true:
1. M0 regression remains green;
2. M1-A unit/integration/negative tests PASS;
3. capability/dependency-surface audit PASS;
4. adversarial tests of the audit PASS;
5. CI network guard proves zero egress;
6. workflow permissions remain read-only;
7. selected HTTP dependency/version is explicitly governed and security configuration is internally constructed/non-overridable;
8. independent adversarial review PASS on the exact implementation head.

Any remediation to security-relevant M1-A code after review requires another independent review.

## 16. Explicit non-authorization
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