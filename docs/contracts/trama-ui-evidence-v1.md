# TRAMA UI Evidence Contract v1

**Contract ID:** TRAMA-UI-EVIDENCE-01  
**Status:** PROPOSED / GOVERNANCE-ONLY  
**Baseline:** `6e1892ddeb552d1becbb1e33abf6dd2968673f65`  
**Parent contract:** `TRAMA-UIUX-01`  
**Runtime impact:** NONE  
**DOS-A1:** RUNTIME_DEFERRED

## 1. Purpose

TRAMA-UI-EVIDENCE-01 defines the machine-readable evidence envelope required by `TRAMA-UIUX-01`. Its purpose is to make UI quality review deterministic enough for CI while preserving human review where automation cannot establish perceptual or interaction quality.

The manifest records evidence; it does not replace the governing functional contract, `TRAMA-PW-01`, accessibility review, product authority or human judgement.

## 2. Canonical artifact

A UI-changing pull request SHALL provide one canonical manifest per affected product repository or governed prototype package: `ui-evidence.manifest.json`.

The manifest MUST validate against a versioned JSON Schema before Stage B becomes blocking. Schema evolution MUST be backward-compatible within a major version or explicitly migrated.

The manifest MUST contain repository-relative evidence references. It MUST NOT contain secrets, personal data, student identifiers, authentication material, private URLs or ephemeral local paths.

## 3. Minimum manifest model

The schema SHALL represent contract/product identity, UI-impact scope, responsive evidence, accessibility checks/findings, `TRAMA-PW-01`, visual evidence, design-system traceability, boundaries, exceptions and evidence provenance. The JSON Schema is authoritative once approved.

## 4. Normative fields

### EVID-01 — Identity
`schemaVersion`, contract ID/version, product ID and product-profile ID MUST be present. Product/profile values SHALL come from governed registries once those registries exist.

### EVID-02 — Deterministic UI impact classification
`uiImpact` MUST be one of `NONE | NEW | CHANGED | LEGACY_TOUCHED`.

Classification is determined per affected surface, not chosen opportunistically at PR level:

- `NONE`: no rendered structure, interaction, visual hierarchy, responsive behavior, accessibility semantics or perceptible outcome changes;
- `NEW`: surface/component did not exist in the governed baseline;
- `CHANGED`: material change to a surface already governed under Stage B/C;
- `LEGACY_TOUCHED`: material change to a pre-Stage-B or explicitly registered legacy surface; the touched scope becomes subject to Stage B.

A PR containing multiple affected surfaces MUST retain each surface classification. Its aggregate `uiImpact` SHALL use precedence `LEGACY_TOUCHED > NEW > CHANGED > NONE` solely for gate routing; aggregate precedence MUST NOT erase per-surface obligations. The future classifier SHALL compare changed paths/surface registry/baseline metadata and MUST reject an unsupported `NONE` or lower-impact self-classification.

### EVID-03 — Surface and journey scope
Every affected surface MUST have a stable repository/product identifier and its own `uiImpact`. User journeys MUST be named when the change affects task completion or navigation. Evidence outside declared scope MUST NOT prove the changed surface.

### EVID-04 — Responsive evidence and historical reproducibility
The manifest MUST declare applicable `S`, `M`, `L`, and `LIM` conditions according to `TRAMA-UIUX-01`. Each applicable condition requires evidence; a non-applicable condition requires a reason; omission is invalid.

Each responsive evidence entry MUST record: condition; result; repository-relative artifact/reference; exact commit/build identity; product-profile ID/version; responsive token/policy ID/version that resolved the condition; and concrete viewport/container dimensions used by that run. This preserves historical reproducibility when token values later change.

### EVID-05 — Accessibility evidence and findings
For Stage B release-capable work the manifest MUST record automated accessibility result, human keyboard/focus result, human zoom/reflow result, and assistive-technology result when required by interaction pattern/risk.

Accessibility findings MUST be first-class records with at least: stable `findingId`; criterion or governed interaction pattern; blocking class/severity; status (`OPEN | RESOLVED | ACCEPTED_EXCEPTION`); evidence reference; affected surface; and exception ID when accepted. A Stage B aggregate PASS MUST NOT be emitted while any blocking finding is `OPEN`, and `ACCEPTED_EXCEPTION` is valid only while the referenced governed exception is valid. A tool name or green badge alone is not sufficient evidence of WCAG conformance.

### EVID-06 — Perceptible Write
Mutative surfaces MUST reference their `TRAMA-PW-01` classification and evidence. `NON_MUTATIVE` MAY be used only when the changed journey performs no governed mutation. UI Evidence MUST NOT redefine PW semantics.

### EVID-07 — Visual and overflow evidence
Changed responsive surfaces MUST provide evidence that required journeys do not introduce horizontal page overflow. Material visual changes SHOULD include before/after evidence or an equivalent stable visual baseline. Screenshots MAY support evidence but MUST NOT be the sole proof of keyboard, semantics or dynamic-state behavior.

### EVID-08 — Design-system traceability
The manifest MUST identify governed tokens/components reused and any new component introduced. A new reusable component MUST identify its ownership/catalogue destination or an approved temporary exception.

### EVID-09 — Boundaries
Every manifest MUST declare authority, privacy and runtime impact. It MUST preserve governing product contracts. `dosA1` MUST remain explicit while DOS-A1 is `RUNTIME_DEFERRED`.

### EVID-10 — Exceptions
Exceptions MUST reference stable exception IDs governed by `TRAMA-UIUX-01`; free-text waivers are invalid. Expired exceptions MUST fail Stage B/C validation.

### EVID-11 — Evidence integrity, provenance and anti-self-certification
Every evidence entry MUST include a stable evidence type, result (`PASS | FAIL | NOT_APPLICABLE` where appropriate), exact commit SHA or immutable build/run identity, and producer/check identity.

Generated artifacts MUST additionally carry either a cryptographic digest or an immutable provider artifact/run identifier sufficient to bind the referenced artifact to the declared run. Human evidence MUST carry a stable review/check reference and governed role/type, without requiring private identity.

A manifest assertion is metadata, not proof. The manifest MUST NOT satisfy a gate merely by declaring `PASS` or by pointing to an arbitrary self-authored file. The future validator SHALL accept evidence only from producer/check classes allowed by the governing evidence policy and SHALL verify the declared binding where technically available. Evidence from another head MUST NOT satisfy an exact-head gate unless an explicit reproducibility rule permits it.

### EVID-12 — Human evidence and minimisation
Human checks MUST record check type, result, affected surface, exact-head/build binding and stable review/check reference. They MAY record a governance role; they MUST NOT require a person's private identity or unnecessary personal data.

## 5. CI consumption model

The future gate SHALL:

1. derive/validate per-surface UI-impact classification and aggregate routing precedence;
2. locate the canonical manifest;
3. validate JSON Schema/enumerations;
4. validate exact-head/build binding and producer/check provenance;
5. validate S/M/L/LIM completeness plus profile/token-policy version binding;
6. validate accessibility evidence and ensure no unresolved blocking findings are hidden by aggregate status;
7. validate `TRAMA-PW-01` evidence where mutative;
8. validate design-system traceability;
9. validate boundary declarations;
10. resolve and validate exception status;
11. emit a machine result plus human-readable summary.

The gate MUST distinguish `missing evidence` from `failing evidence`; neither may be manufactured into PASS.

## 6. Evidence retention and minimisation

Evidence SHOULD be retained only as long as required for repository governance, auditability and reproducibility. Deterministic structured results are preferred over large binary captures when equivalent. Visual captures MUST avoid personal/student data and unrelated browser/account chrome where practicable.

No UI evidence requirement authorizes telemetry, student tracking, account creation or cross-product data collection.

## 7. Staged enforcement

- **Stage A / OBSERVE:** manifest MAY support legacy inventory and non-blocking diagnostics.
- **Stage B / ENFORCE-NEW:** valid manifest and complete applicable evidence are blocking for new/materially changed release-capable UI.
- **Stage C / ENFORCE-BASELINE:** ecosystem-wide enforcement after baselines and exception registry are governed.

A changed surface MUST NOT downgrade itself to Stage A to avoid evidence requirements.

## 8. Acceptance criteria

- **EVID-E1:** canonical machine-readable manifest path/name defined.
- **EVID-E2:** per-surface UI-impact classification and aggregate precedence are deterministic.
- **EVID-E3:** S/M/L/LIM evidence binds to exact head/build plus versioned profile/responsive policy.
- **EVID-E4:** accessibility evidence separates automated/human checks and models findings; blocking open findings cannot hide behind PASS.
- **EVID-E5:** `TRAMA-PW-01` is referenced, not duplicated.
- **EVID-E6:** token/component traceability is represented.
- **EVID-E7:** authority/privacy/runtime/DOS-A1 boundaries are explicit.
- **EVID-E8:** exceptions are stable references, not free-text waivers.
- **EVID-E9:** evidence has producer/check provenance and immutable binding; manifest self-assertion is not proof.
- **EVID-E10:** missing/failing evidence cannot be interpreted as PASS.
- **EVID-E11:** evidence minimisation forbids personal/student data expansion.
- **EVID-E12:** contract introduces no runtime, persistence, student account/tracking or DOS-A1 activation.

## 9. Next governed implementation slice

Approval authorizes a separate implementation PR containing:

1. versioned JSON Schema for `ui-evidence.manifest.json`;
2. valid fixture plus representative invalid fixtures, including false `NONE`, stale-head evidence, untrusted/self-certified evidence and hidden blocking accessibility finding;
3. schema/semantic validator tests;
4. non-blocking Stage A classifier/report;
5. exception-registry linkage;
6. producer/check allow-list policy seed.

Blocking Stage B MUST NOT be enabled until schema, fixtures, validator behavior, provenance policy and migration/exception handling pass independent review.
