# TRAMA Design Tokens + PVIP — Stage A implementation

**Contract:** TRAMA-DESIGN-TOKENS-01  
**Baseline:** `ccfeec0df41929ab53218a5789d5e28ab6879cbb`  
**Mode:** OBSERVE / NON-BLOCKING  
**Runtime:** NONE  
**DOS-A1:** RUNTIME_DEFERRED

## Purpose

Materialise the approved governance model without migrating product runtimes. The seed makes shared semantics and four distinct Product Visual Identity Profiles inspectable and machine-readable.

## Mature reference choices

- **DTCG 2025.10 stable format** is the interoperability direction for token representation and alias semantics. Stage A keeps the TRAMA policy envelope explicit while avoiding a proprietary dead end; full DTCG interchange conformance remains a pre-Stage-B hardening target.
- **JSON Schema Draft 2020-12** is the structural-validation dialect for the policy schema.
- **WCAG 2.2** informs reflow, focus, target-size and accessible state invariants. LIM is therefore encoded as a machine-readable limited-space/reflow verification context rather than a prose-only label.
- Validation follows a mature split: structural schema + semantic/cross-field validator + negative regression fixtures. No single layer is treated as sufficient evidence.

## Included after independent-review hardening

- ecosystem semantic-token seed with explicit layers;
- responsive S/M/L ranges with continuity/non-overlap checks and machine-readable LIM context;
- minimum interaction-state and presentation-mode vocabularies;
- four versioned PVIP seeds with explicit dimensions for voice, palette/tonal character, typography, density/spatial rhythm, shape/elevation, composition, navigation, data visualisation, motion and iconography/illustration; non-applicable dimensions require a reason;
- product aliases constrained to ecosystem-semantic targets;
- versioned authority registry with scoped owner resolution;
- Draft 2020-12 structural schema;
- Stage A semantic validator for authority, alias graph cycles/layers, required products/dimensions, responsive continuity, scalable text/reflow tokens, modes/states and protected boundaries;
- automated regression runner with valid and negative cases and expected failure reasons;
- focused security regression evidence for this governance-only policy surface.

## Identity rule

The validator checks semantic compatibility and substantive identity differentiation. It does not compare pixels, palettes or require visual sameness. Distinct product identities are expected; semantic inversion and cross-product aliasing are not.

## Security classification

The policy directory is conservatively classified as security-sensitive by repository tooling. This slice therefore carries focused security regression evidence rather than suppressing the signal. The evidence is scoped: it proves fail-closed owner/boundary/alias behavior and absence of new network/auth/secret/runtime-write surfaces; it is not runtime security certification.

## Deliberate Stage A limits

Stage A does not yet claim complete DTCG interchange conformance, rendered visual contrast certification, font supply-chain certification, or runtime raw-constant scanning. Before Stage B, the JSON Schema implementation/validator dependency must be pinned and executed in CI, DTCG interchange compatibility must be tested, and visual/accessibility evidence must be produced against rendered product contexts.

No product runtime migration, persistence, student account/tracking or DOS-A1 activation is authorised.
