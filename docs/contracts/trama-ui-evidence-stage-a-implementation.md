# TRAMA UI Evidence — Stage A implementation slice

**Parent:** TRAMA-UI-EVIDENCE-01  
**Mode:** OBSERVE / NON-BLOCKING  
**Baseline:** `67e26bf14a91305f562b53b5b6c6be39e4882957`  
**Runtime:** NONE  
**DOS-A1:** RUNTIME_DEFERRED

This slice turns the approved evidence contract into inspectable implementation artifacts without enabling Stage B enforcement.

## Included

- Draft 2020-12 JSON Schema for `ui-evidence.manifest.json`, with closed responsive evidence and conditional `exceptionId` requirement.
- Dependency-free Stage A structural validation equivalent for the schema constraints used by this slice, followed by semantic cross-field/context validation.
- Versioned machine-readable producer policy: `policies/ui-evidence-producers.v1.json`.
- Exact-head validation with zero SHA permitted only under `fixtures/ui-evidence/` and only for producer `stage-a-fixture`.
- Positive fixture plus negative corpus for hidden accessibility blocker, aggregate mismatch, stale head, untrusted producer, missing responsive evidence, incomplete accepted exception and protected-boundary mutation.
- Executable contract suite `scripts/test-ui-evidence-validator.mjs` asserting expected exit status and failure reason, including rejection of zero SHA outside the governed fixture root.
- GitHub Actions workflow `UI Evidence Stage A` running the contract suite on relevant pull-request changes.

## Validation separation

Structural constraints that can be expressed locally are enforced before semantic checks: required/closed objects, manifest identity/version, SHA form, evidence shape, responsive condition shape, immutable binding and accepted-exception integrity. Semantic validation remains responsible for aggregate derivation, responsive evidence completeness, producer trust, exact-head/fixture context, accessibility blockers and protected runtime/DOS-A1 boundaries.

Stage A intentionally remains dependency-free. Before Stage B, the canonical JSON Schema must additionally be executed through a pinned Draft 2020-12 implementation; the Stage A structural validator is not represented as a substitute for that Stage B requirement.

## Explicitly not included

- No production runtime or persistence.
- No student telemetry/account/tracking.
- No blocking Stage B gate.
- No activation of DOS-A1.
- No release-certification claim: Stage A output is diagnostic only.

## Independent-review remediation

The six findings raised on PR #103 exact head `b7a7be25ed26d6eee44c81eb4707d2b23a129331` are addressed by this revision: executable structural validation; expanded negative corpus; fixture-only zero SHA; governed producer policy; automated expected-result runner; and stronger schema invariants.
