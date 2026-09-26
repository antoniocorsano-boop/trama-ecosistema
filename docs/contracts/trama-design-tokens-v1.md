# TRAMA Design Tokens Contract v1

**Contract ID:** TRAMA-DESIGN-TOKENS-01  
**Status:** PROPOSED / GOVERNANCE-ONLY  
**Baseline:** `d37bd1defe173da66493b6476a63f27db59129b0`  
**Parents:** `TRAMA-UIUX-01` · `TRAMA-UI-EVIDENCE-01`  
**Runtime impact:** NONE  
**DOS-A1:** RUNTIME_DEFERRED

## 1. Purpose

TRAMA-DESIGN-TOKENS-01 defines the shared semantic design-token foundation for Arena, Atlas, Docente OS and TRAMA Control Center. It governs visual and responsive semantics so product interfaces can remain coherent without becoming visually identical.

Tokens are design decisions with stable names and governed meaning. They are not arbitrary CSS constants, framework-specific class names or a mandate to adopt a particular component library.

## 2. Layer model

The token system SHALL use three conceptual layers:

1. **Primitive/reference layer** — raw scales and reference values (for example spacing steps, type sizes, radii). Product code SHOULD NOT consume this layer directly.
2. **Semantic ecosystem layer** — intent-based tokens such as surface, text, border, focus, feedback, spacing-role and responsive-condition semantics. This is the default consumption layer.
3. **Product/profile alias layer** — Arena, Atlas, Docente OS and Control Center MAY alias ecosystem semantics to express their product profile, but MUST NOT change the semantic meaning of a shared token.

Component-specific tokens MAY exist only where a reusable component has a genuine semantic need not expressible by existing ecosystem tokens.

## 3. Required token domains

### TOK-01 — Color and state
The governed taxonomy MUST cover at least:
- canvas/surface layers;
- primary/secondary text and muted text;
- borders/dividers;
- interactive/action states;
- focus indicator;
- selection;
- informational, success, warning and error feedback;
- disabled/unavailable state.

Color tokens MUST encode semantic role, not literal hue names in product-facing APIs. Required meaning MUST NOT rely on color alone.

### TOK-02 — Typography
The taxonomy MUST define semantic roles for display/title, section heading, body, supporting text, labels/controls and code/data where applicable. It MUST govern size, line height, weight and readable measure/line length where relevant.

Typography MUST support user zoom and reflow; production profiles MUST NOT depend on fixed text dimensions that defeat browser/user scaling.

### TOK-03 — Spacing and density
A shared spacing scale MUST exist, with semantic aliases for page, section, cluster, control and inline relationships. Product profiles MAY choose density variants only when touch-target, readability and accessibility requirements remain satisfied.

### TOK-04 — Shape, border and elevation
Radius, border and elevation/shadow semantics MUST distinguish hierarchy and interaction without becoming the sole carrier of state. Elevation MUST NOT be used as an uncontrolled decorative scale.

### TOK-05 — Motion
Motion tokens MUST define duration/easing roles and reduced-motion behavior. Essential state changes MUST remain understandable when nonessential animation is reduced or removed.

### TOK-06 — Responsive conditions
The shared responsive policy MUST define governed conditions `S`, `M`, `L`, `LIM` as semantic verification contexts. Concrete viewport/container ranges SHALL live in a versioned machine-readable policy artifact.

A product profile MAY narrow applicability (for example LIM not applicable to a journey) only through the evidence rules of `TRAMA-UI-EVIDENCE-01`. Individual views MUST NOT invent private breakpoints without a governed exception or approved container-specific rule.

### TOK-07 — Layout semantics
The taxonomy MUST provide semantic constraints for content measure, page gutters, grid/gap relationships, stacked/clustered regions and stable action placement. Tokens SHOULD support container-query-based composition where appropriate rather than assuming viewport width alone.

### TOK-08 — Layering and overlays
If z-order/layer tokens are used, they MUST express semantic layers (base, sticky, overlay, modal, notification) rather than arbitrary large integers. Focus and modal semantics remain governed by interaction/accessibility contracts, not z-index alone.

## 4. Naming and value rules

Token names MUST be stable, semantic and tool-independent. The machine-readable representation SHOULD align with the Design Tokens Community Group stable format or a documented compatible subset.

- Product code MUST prefer semantic aliases over primitives.
- Raw constants in product-facing styles require migration or an explicit exception when the corresponding governed token exists.
- A token MUST NOT silently change semantic meaning across versions.
- Breaking semantic changes require a major token-policy version and migration note.
- Value changes that preserve meaning require evidence for affected responsive/accessibility/visual baselines where applicable.

## 5. Product profiles

### Arena
Tokens SHALL favor dense but legible authoritative work, provenance/review state clarity and stable information hierarchy. Density MUST NOT reduce accessible targets or obscure authority state.

### Atlas
Tokens SHALL favor public readability, exploration, discoverability, responsive navigation and low cognitive load. Student/public journeys MUST remain understandable without account-dependent personalization.

### Docente OS
Tokens SHALL favor focus, speed and teacher agency. Local-only/personal-preference surfaces MUST remain visually distinguishable where required by privacy/product contracts. Primary preparation actions and perceptible outcomes MUST remain prominent.

### TRAMA Control Center
Tokens SHALL support evidence-rich monitoring and comparison without turning status into visual noise. Severity/status semantics MUST be consistent with the ecosystem feedback vocabulary.

## 6. Accessibility invariants

Token values MUST be evaluated in actual component/context combinations; token-level contrast claims alone are insufficient. The governed implementation SHALL support:

- WCAG 2.2 A/AA applicable contrast requirements;
- visible focus that is not removed by product aliases;
- text zoom/reflow;
- target sizing where applicable;
- reduced motion;
- high-contrast/forced-colors resilience where supported by the platform;
- meaning independent of color alone.

A product alias MUST NOT reduce an ecosystem accessibility invariant.

## 7. Responsive policy and evidence binding

The future machine-readable responsive policy SHALL have a stable policy ID and version. `TRAMA-UI-EVIDENCE-01` evidence MUST bind to that policy version and record the concrete viewport/container dimensions used in each S/M/L/LIM run.

Changing a breakpoint/range does not retroactively reinterpret historical evidence: evidence remains bound to the policy version active when it was produced.

## 8. Token governance lifecycle

Each machine-readable token release MUST record:
- token-policy ID/version;
- changed tokens;
- semantic-change classification (`NONE | VALUE_ONLY | ADDITIVE | BREAKING`);
- affected products/profiles;
- migration note for breaking changes;
- accessibility/responsive review requirement;
- exact commit/build identity.

Deprecated tokens MUST have a replacement or explicit removal rationale and a bounded migration period. Alias cycles are invalid.

## 9. Machine-readable seed authorized after approval

Approval of this contract authorizes a separate implementation PR containing:

1. ecosystem semantic token seed;
2. S/M/L/LIM responsive policy v1;
3. product-profile alias seeds for Arena, Atlas, Docente OS and Control Center;
4. schema/validator for token structure, alias resolution and forbidden cycles;
5. fixtures for valid aliases, missing targets, cycles, semantic-breaking changes and unauthorized raw product constants;
6. non-blocking Stage A report integrated with `TRAMA-UI-EVIDENCE-01`.

No product runtime migration is authorized by this contract alone.

## 10. Acceptance criteria

- **TOK-E1:** primitive, semantic and product-alias layers are explicitly separated.
- **TOK-E2:** color, typography, spacing, shape/border/elevation, motion, responsive, layout and layering domains are governed.
- **TOK-E3:** S/M/L/LIM semantics and versioned policy binding are explicit.
- **TOK-E4:** product profiles preserve shared semantics while allowing appropriate visual emphasis.
- **TOK-E5:** accessibility invariants cannot be weakened by aliases.
- **TOK-E6:** token lifecycle/versioning/deprecation and breaking-change handling are defined.
- **TOK-E7:** product-facing raw constants are governed rather than silently proliferating.
- **TOK-E8:** evidence remains historically reproducible across responsive-policy changes.
- **TOK-E9:** implementation follow-up includes schema, validator, fixtures and Stage A reporting before enforcement.
- **TOK-E10:** no runtime, persistence, student account/tracking or DOS-A1 activation is introduced.
