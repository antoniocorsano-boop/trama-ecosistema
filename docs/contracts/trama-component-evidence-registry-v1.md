# TRAMA Component Evidence Registry v1

**Contract ID:** TRAMA-COMPONENT-EVIDENCE-REGISTRY-01  
**Status:** PROPOSED / GOVERNANCE-ONLY  
**Date:** 2026-09-29  
**Baseline:** `f890e170fc2d9bce124c80f3cd396a0f22051a2d`  
**Parent:** TRAMA-UI-EVIDENCE-01 · INV-02 · INV-03  
**Runtime impact:** NONE  
**DOS-A1:** RUNTIME_DEFERRED

## 1. Purpose

Define the minimum machine-readable registry needed to address reusable components and interaction patterns across TRAMA products and bind them to evidence without imposing a shared runtime implementation or a single component library.

This registry complements, and does not replace, `TRAMA-UI-EVIDENCE-01`.

## 2. Registry scope

Each registry entry MUST identify:
- stable `componentId`;
- product;
- implementation target or semantic pattern;
- lifecycle state;
- source class;
- evidence references;
- related inventory findings when applicable.

The registry MAY refer to:
- a reusable component;
- a governed semantic pattern;
- a native platform pattern;
- a specialist interaction primitive.

## 3. Lifecycle vocabulary

Allowed lifecycle values:
- `PROPOSED`
- `TRIAL`
- `STABLE`
- `LEGACY`
- `DEPRECATED`
- `RETIRED`
- `SPECIALIST`
- `NATIVE`

Lifecycle records describe governance state, not visual quality.

## 4. Source classes

Allowed source classes:
- `NATIVE_PLATFORM`
- `PRODUCT_OWNED`
- `TRAMA_SHARED_SEMANTIC`
- `EXTERNAL_PRIMITIVE`
- `SPECIALIST_LIBRARY`

Source class MUST NOT be inferred as a quality score.

## 5. Evidence references

Each evidence reference MUST include:
- `type`: one of `ISOLATED | BEHAVIOURAL | RESPONSIVE_VISUAL | ACCESSIBILITY | LIFECYCLE`;
- `status`: `PRESENT | PARTIAL | DOCUMENTED_ONLY | NOT_OBSERVED | NOT_APPLICABLE`;
- `ref`: stable repository-relative path, governed document ID, or immutable run/review reference when evidence is present;
- `exactHead` or immutable build/run identity when evidence proves executable behavior.

A registry entry MUST NOT manufacture evidence by declaring `PRESENT` without a reference. For evidence types other than `LIFECYCLE`, `PRESENT` means executable or otherwise immutable proof and therefore MUST also carry `exactHead` or an immutable build/run identity. `LIFECYCLE` is governance state and MAY be attested by the governed registry itself.

Human assistive-technology evidence MUST remain distinct from automated accessibility checks.

## 6. Boundaries

This registry does not authorize:
- migration;
- runtime replacement;
- new dependency adoption;
- visual standardization;
- automatic lifecycle promotion.

Lifecycle changes require evidence and a governed decision appropriate to their impact.

## 7. Initial high-priority bindings

The first materialized entries bind the high-priority findings from INV-02:
- Arena confirmation/dialog family;
- Arena tabs family;
- Arena tooltip family;
- Control Center contextual-help popover/dialog family.

These bindings are evidence targets only. They do not remediate the runtime.

## 8. Relationship with CS-S1

CS-S1 MUST bind each candidate contextual-help primitive to a dedicated registry entry or candidate evidence record and MUST not report page-level evidence as sufficient proof of the candidate primitive itself.

## 9. Validation rule

The governed registry validator MUST reject:
- unknown lifecycle/source/evidence vocabularies;
- duplicate `componentId`;
- `PRESENT` evidence without `ref`;
- non-lifecycle `PRESENT` evidence without exact-head/build/run binding;
- any authorization flags set to true.

## 10. Next use

After approval, this registry becomes the addressing layer for:
1. Arena evidence qualification of dialog/tabs/tooltip;
2. CS-S1 candidate comparison;
3. bounded Docente OS component evidence work;
4. future component lifecycle tracking.
