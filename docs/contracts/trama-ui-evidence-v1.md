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

A UI-changing pull request SHALL provide one canonical manifest per affected product repository or governed prototype package:

`ui-evidence.manifest.json`

The manifest MUST validate against a versioned JSON Schema before Stage B becomes blocking. Schema evolution MUST be backward-compatible within a major version or explicitly migrated.

The manifest MUST contain repository-relative evidence references. It MUST NOT contain secrets, personal data, student identifiers, authentication material, private URLs or ephemeral local paths.

## 3. Minimum manifest model

```json
{
  "schemaVersion": "1.0.0",
  "contract": {
    "id": "TRAMA-UI-EVIDENCE-01",
    "version": "1"
  },
  "product": {
    "id": "ATLAS",
    "profile": "ATLAS-PUBLIC"
  },
  "change": {
    "uiImpact": "CHANGED",
    "surfaces": ["curriculum/lesson-materials"],
    "journeys": ["student-browse-materials"]
  },
  "responsive": {
    "applicable": ["S", "M", "L"],
    "notApplicable": [{"condition": "LIM", "reason": "journey-not-intended-for-lim"}],
    "evidence": []
  },
  "accessibility": {
    "automated": [],
    "human": [],
    "keyboardFocus": [],
    "zoomReflow": [],
    "assistiveTechnology": []
  },
  "perceptibleWrite": {
    "classification": "NON_MUTATIVE",
    "evidence": []
  },
  "visual": {
    "beforeAfter": [],
    "noHorizontalOverflow": [],
    "componentCatalogue": []
  },
  "designSystem": {
    "tokens": [],
    "components": [],
    "newComponents": []
  },
  "boundaries": {
    "authorityImpact": "NONE",
    "privacyImpact": "NONE",
    "runtimeImpact": "NONE",
    "dosA1": "RUNTIME_DEFERRED"
  },
  "exceptions": []
}
```

This example is illustrative. The JSON Schema is authoritative once approved.

## 4. Normative fields

### EVID-01 — Identity
`schemaVersion`, contract ID/version, product ID and product-profile ID MUST be present. Product/profile values SHALL come from governed registries once those registries exist.

### EVID-02 — UI impact classification
`uiImpact` MUST be one of:

- `NONE` — no rendered UI impact;
- `NEW` — new user-facing surface/component;
- `CHANGED` — material change to an existing governed surface;
- `LEGACY_TOUCHED` — legacy surface materially changed and therefore subject to Stage B for the touched scope.

`NONE` MUST NOT be used when rendered structure, interaction, visual hierarchy, responsive behavior, accessibility semantics or perceptible outcomes change.

### EVID-03 — Surface and journey scope
Every affected surface MUST have a stable repository/product identifier. User journeys MUST be named when the change affects task completion or navigation. Evidence outside declared scope MUST NOT be treated as proof for the changed surface.

### EVID-04 — Responsive evidence
The manifest MUST declare applicable `S`, `M`, `L`, and `LIM` conditions according to `TRAMA-UIUX-01`. Each applicable condition requires evidence. A non-applicable condition requires a reason; omission is invalid.

Evidence SHOULD include viewport/container condition, artifact reference and result. Exact dimensions SHALL be supplied by governed design tokens/product profiles when available.

### EVID-05 — Accessibility evidence
For Stage B release-capable work the manifest MUST record:

- automated accessibility result;
- human keyboard/focus result;
- human zoom/reflow result;
- assistive-technology result when required by interaction pattern/risk;
- unresolved accessibility findings, if any, linked to a governed exception.

A tool name or green badge alone is not sufficient evidence of WCAG conformance.

### EVID-06 — Perceptible Write
Mutative surfaces MUST reference their `TRAMA-PW-01` classification and evidence. `NON_MUTATIVE` MAY be used only when the changed journey performs no governed mutation. UI Evidence MUST NOT redefine PW semantics.

### EVID-07 — Visual and overflow evidence
Changed responsive surfaces MUST provide evidence that required journeys do not introduce horizontal page overflow. Material visual changes SHOULD include before/after evidence or an equivalent stable visual baseline. Screenshots MAY support evidence but MUST NOT be the sole proof of keyboard, semantics or dynamic-state behavior.

### EVID-08 — Design-system traceability
The manifest MUST identify governed tokens/components reused and any new component introduced. A new reusable component MUST identify its ownership/catalogue destination or an approved temporary exception.

### EVID-09 — Boundaries
Every manifest MUST declare authority, privacy and runtime impact. It MUST preserve the governing product contracts. `dosA1` MUST remain explicit while DOS-A1 is governed as `RUNTIME_DEFERRED`.

### EVID-10 — Exceptions
Exceptions MUST reference stable exception IDs governed by `TRAMA-UIUX-01`; free-text waivers inside the evidence manifest are invalid. Expired exceptions MUST fail Stage B/C validation.

### EVID-11 — Evidence integrity
Each evidence entry SHALL include a stable type, result (`PASS | FAIL | NOT_APPLICABLE` where appropriate), repository-relative artifact/reference and the exact commit SHA or build/run identity to which it applies. Evidence from a different head MUST NOT satisfy an exact-head gate unless reproducibility rules explicitly permit it.

### EVID-12 — Human evidence
Human checks MUST record the check type and result without collecting unnecessary reviewer personal data. The evidence MAY record a governance role or review reference; it MUST NOT require a person's private identity.

## 5. CI consumption model

The future gate SHALL operate in this order:

1. classify whether the PR can legitimately declare `UI_IMPACT=NONE`;
2. locate the canonical manifest;
3. validate JSON Schema and enumerations;
4. validate exact-head/build binding;
5. validate S/M/L/LIM completeness;
6. validate accessibility evidence completeness;
7. validate `TRAMA-PW-01` evidence where mutative;
8. validate design-system traceability;
9. validate boundary declarations;
10. resolve and validate exception status;
11. emit a concise machine result plus human-readable summary.

The gate MUST distinguish `missing evidence` from `failing evidence`. It MUST NOT manufacture a PASS when evidence is absent.

## 6. Evidence retention and minimisation

Evidence SHOULD be retained only as long as required for repository governance, auditability and reproducibility. Artifacts SHOULD prefer deterministic text/structured results over large binary captures when equivalent. Visual captures MUST avoid personal/student data and unrelated browser/account chrome where practicable.

No UI evidence requirement authorizes telemetry, student tracking, account creation or cross-product data collection.

## 7. Staged enforcement

- **Stage A / OBSERVE:** manifest MAY be generated for legacy inventory and non-blocking diagnostics.
- **Stage B / ENFORCE-NEW:** valid manifest and complete applicable evidence are blocking for new/materially changed release-capable UI.
- **Stage C / ENFORCE-BASELINE:** ecosystem-wide enforcement after baselines and exception registry are governed.

A changed surface MUST NOT downgrade itself to Stage A to avoid evidence requirements.

## 8. Acceptance criteria

- **EVID-E1:** canonical machine-readable manifest path/name defined.
- **EVID-E2:** UI impact classification is closed and non-ambiguous.
- **EVID-E3:** S/M/L/LIM evidence completeness is machine-checkable.
- **EVID-E4:** accessibility evidence separates automated and human checks.
- **EVID-E5:** `TRAMA-PW-01` is referenced, not duplicated.
- **EVID-E6:** token/component traceability is represented.
- **EVID-E7:** authority/privacy/runtime/DOS-A1 boundaries are explicit.
- **EVID-E8:** exceptions are stable references, not free-text waivers.
- **EVID-E9:** evidence is bound to exact commit/build identity.
- **EVID-E10:** missing evidence cannot be interpreted as PASS.
- **EVID-E11:** evidence minimisation forbids personal/student data expansion.
- **EVID-E12:** contract introduces no runtime, persistence, student account/tracking or DOS-A1 activation.

## 9. Next governed implementation slice

Approval of this contract authorizes a separate implementation PR containing:

1. versioned JSON Schema for `ui-evidence.manifest.json`;
2. one valid fixture and representative invalid fixtures;
3. schema validator tests;
4. non-blocking Stage A classifier/report;
5. exception-registry schema linkage.

Blocking Stage B MUST NOT be enabled until the schema, fixtures, validator behavior and migration/exception handling have passed independent review.
