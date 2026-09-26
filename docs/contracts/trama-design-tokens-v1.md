# TRAMA Design Tokens Contract v1

**Contract ID:** TRAMA-DESIGN-TOKENS-01  
**Status:** PROPOSED / GOVERNANCE-ONLY  
**Baseline:** `d37bd1defe173da66493b6476a63f27db59129b0`  
**Parents:** `TRAMA-UIUX-01` · `TRAMA-UI-EVIDENCE-01`  
**Runtime impact:** NONE  
**DOS-A1:** RUNTIME_DEFERRED

## 1. Purpose

TRAMA-DESIGN-TOKENS-01 defines the shared semantic design-token foundation for Arena, Atlas, Docente OS and TRAMA Control Center. It governs visual and responsive semantics so product interfaces can remain coherent without becoming visually identical.

Tokens are design decisions with stable names and governed meaning. They are not arbitrary CSS constants, framework-specific class names or a mandate to adopt a particular component library, font family or styling framework.

## 2. Layer model and alias boundaries

The token system SHALL use three conceptual layers:

1. **Primitive/reference layer** — raw scales and reference values. Product code SHOULD NOT consume this layer directly.
2. **Semantic ecosystem layer** — intent-based tokens such as surface, text, border, focus, feedback, spacing-role and responsive-condition semantics. This is the default consumption layer.
3. **Product/profile alias layer** — Arena, Atlas, Docente OS and Control Center MAY alias ecosystem semantics to express their product profile, but MUST NOT change the semantic meaning of a shared token.

Component-specific tokens MAY exist only where a reusable component has a genuine semantic need not expressible by existing ecosystem tokens.

Alias resolution MUST be acyclic. Product aliases MUST resolve only through authorized ecosystem/component semantic targets; cross-product aliasing, product-to-product inheritance and aliases that bypass an authorized layer are invalid unless explicitly governed as a shared ecosystem semantic.

## 3. Required token domains

### TOK-01 — Color, modes, interaction and feedback
The governed taxonomy MUST cover at least:
- canvas/surface layers;
- primary/secondary/muted text;
- borders/dividers;
- focus indicator and selection;
- disabled/unavailable state;
- informational, success, warning and error feedback.

Interactive controls MUST expose semantic state roles for all applicable states: `default`, `hover` where pointer interaction exists, `focus-visible`, `active/pressed`, `selected`, `disabled` and `pending/loading`. Success, warning and error are feedback semantics and MUST NOT be used as substitutes for interaction-state semantics.

Color tokens MUST encode semantic role, not literal hue names in product-facing APIs. Required meaning MUST NOT rely on color alone.

The implementation MUST govern presentation modes separately from token meaning. At minimum it SHALL model `light`, `dark` and `system/preference-following` behavior where the product supports theme selection or operating-system preference, and SHALL define resilience for platform `forced-colors`/high-contrast behavior. A mode MAY change a token value but MUST NOT change the token's semantic role. Product aliases MUST NOT map the same semantic token to contradictory meanings across modes.

A product MAY support fewer user-selectable modes only when its product profile documents that choice; forced-colors/high-contrast resilience remains an accessibility concern independent of theme selection.

### TOK-02 — Typography and font resilience
The taxonomy MUST define semantic roles for display/title, section heading, body, supporting text, labels/controls and code/data where applicable. It MUST govern size, line height, weight and readable measure/line length where relevant.

Typography MUST support user zoom and reflow. Text sizing and text-related spacing MUST use scalable/relative semantics suitable for user scaling rather than fixed dimensions that defeat browser/user preferences.

The governed typography profile MUST define a fallback stack or equivalent fallback policy, behavior when the preferred font is unavailable, and loading behavior that keeps text readable throughout font acquisition. When web fonts are used, the implementation MUST address metric compatibility/layout shift and `font-display` or an equivalent strategy. No specific font family is mandated by this contract.

A font dependency remains subject to applicable UI dependency lifecycle, licensing, privacy and supply-chain governance. Failure to load a preferred font MUST NOT make content unreadable, remove controls or materially break task completion.

### TOK-03 — Spacing, density and scalable units
A shared spacing scale MUST exist, with semantic aliases for page, section, cluster, control and inline relationships. Product profiles MAY choose density variants only when touch-target, readability and accessibility requirements remain satisfied.

Values coupled to text size, readable measure or reflow SHOULD use scalable/relative units or semantics. Absolute units MAY be used where semantically appropriate, such as hairline/border geometry, raster alignment, explicitly governed minimum hit-area constraints, or concrete viewport/container dimensions recorded as test evidence. Absolute units MUST NOT be used to freeze text or layouts against user zoom/reflow.

### TOK-04 — Shape, border and elevation
Radius, border and elevation/shadow semantics MUST distinguish hierarchy and interaction without becoming the sole carrier of state. Elevation MUST NOT be used as an uncontrolled decorative scale.

### TOK-05 — Motion
Motion tokens MUST define duration/easing roles and reduced-motion behavior. Essential state changes MUST remain understandable when nonessential animation is reduced or removed.

### TOK-06 — Responsive conditions
The shared responsive policy MUST define governed conditions `S`, `M`, `L`, `LIM` as semantic verification contexts. Concrete viewport/container ranges SHALL live in a versioned machine-readable policy artifact.

A product profile MAY narrow applicability only through the evidence rules of `TRAMA-UI-EVIDENCE-01`. Individual views MUST NOT invent private breakpoints without a governed exception or approved container-specific rule.

### TOK-07 — Layout semantics
The taxonomy MUST provide semantic constraints for content measure, page gutters, grid/gap relationships, stacked/clustered regions and stable action placement. Tokens SHOULD support container-query-based composition where appropriate rather than assuming viewport width alone.

### TOK-08 — Layering and overlays
If z-order/layer tokens are used, they MUST express semantic layers such as base, sticky, overlay, modal and notification rather than arbitrary large integers. Focus and modal semantics remain governed by interaction/accessibility contracts, not z-index alone.

## 4. Naming, identity and value rules

Token names MUST be stable, semantic and tool-independent. The machine-readable representation SHOULD align with the Design Tokens Community Group stable format or a documented compatible subset.

- Token IDs/names MUST be unique within their governed namespace.
- Product/profile namespaces MUST NOT redefine another product's namespace.
- Product code MUST prefer semantic aliases over primitives.
- Raw constants in product-facing styles require migration or an explicit exception when the corresponding governed token exists.
- A token MUST NOT silently change semantic meaning across versions or presentation modes.
- Breaking semantic changes require a major token-policy version and migration note.
- Value changes that preserve meaning require evidence for affected responsive/accessibility/visual baselines where applicable.
- Namespace collisions, duplicate canonical IDs and ambiguous alias targets are invalid.

## 5. Product profiles

### Arena
Tokens SHALL favor dense but legible authoritative work, provenance/review state clarity and stable information hierarchy. Density MUST NOT reduce accessible targets or obscure authority state.

### Atlas
Tokens SHALL favor public readability, exploration, discoverability, responsive navigation and low cognitive load. Student/public journeys MUST remain understandable without account-dependent personalization.

### Docente OS
Tokens SHALL favor focus, speed and teacher agency. Local-only/personal-preference surfaces MUST remain visually distinguishable where required by privacy/product contracts. Primary preparation actions and perceptible outcomes MUST remain prominent.

### TRAMA Control Center
Tokens SHALL support evidence-rich monitoring and comparison without turning status into visual noise. Severity/status semantics MUST be consistent with the ecosystem feedback vocabulary.

A product profile owns only its authorized alias namespace. It MUST NOT override another product profile or ecosystem semantics.

## 6. Accessibility invariants

Token values MUST be evaluated in actual component/context combinations; token-level contrast claims alone are insufficient. The governed implementation SHALL support:

- WCAG 2.2 A/AA applicable contrast requirements;
- visible focus that is not removed by product aliases or modes;
- text zoom/reflow;
- target sizing where applicable;
- reduced motion;
- high-contrast/forced-colors resilience where supported by the platform;
- meaning independent of color alone;
- readable fallback typography when preferred fonts are unavailable.

A product alias or presentation mode MUST NOT reduce an ecosystem accessibility invariant.

## 7. Responsive policy and evidence binding

The future machine-readable responsive policy SHALL have a stable policy ID and version. `TRAMA-UI-EVIDENCE-01` evidence MUST bind to that policy version and record the concrete viewport/container dimensions used in each S/M/L/LIM run.

Changing a breakpoint/range does not retroactively reinterpret historical evidence: evidence remains bound to the policy version active when it was produced.

## 8. Ownership and token governance lifecycle

Every machine-readable ecosystem policy, token namespace and product-profile artifact MUST declare an `owner` or governing-authority identifier from an approved governance registry. Ownership controls who may propose authoritative changes; it does not bypass review, evidence or repository protections.

Each machine-readable token release MUST record:
- token-policy ID/version;
- owner/governing authority;
- changed tokens;
- semantic-change classification (`NONE | VALUE_ONLY | ADDITIVE | BREAKING`);
- affected products/profiles;
- migration note for breaking changes;
- accessibility/responsive review requirement;
- exact commit/build identity.

Deprecated tokens MUST have a replacement or explicit removal rationale and a bounded migration period. Alias cycles, namespace collisions, unauthorized cross-product overrides and alias targets outside authorized layers are invalid.

## 9. Machine-readable seed authorized after approval

Approval of this contract authorizes a separate implementation PR containing:

1. ecosystem semantic token seed, including interaction-state and presentation-mode semantics;
2. S/M/L/LIM responsive policy v1;
3. product-profile alias seeds for Arena, Atlas, Docente OS and Control Center;
4. typography/fallback and scalable-unit policy seed;
5. machine-readable ownership/governing-authority references;
6. schema/validator for token structure, unique identity, alias resolution, authorized layer transitions, ownership, forbidden cycles/collisions/cross-product overrides and mode-semantic invariance;
7. fixtures for valid aliases/modes/fallbacks plus missing targets, cycles, collisions, unauthorized cross-product aliases, mode semantic inversion, semantic-breaking changes and unauthorized raw product constants;
8. non-blocking Stage A report integrated with `TRAMA-UI-EVIDENCE-01`.

No product runtime migration is authorized by this contract alone.

## 10. Acceptance criteria

- **TOK-E1:** primitive, semantic and product-alias layers are explicitly separated and alias transitions are governed.
- **TOK-E2:** color, typography, spacing, shape/border/elevation, motion, responsive, layout and layering domains are governed.
- **TOK-E3:** light/dark/system behavior and forced-colors/high-contrast resilience preserve semantic meaning.
- **TOK-E4:** interactive states are distinct from feedback semantics and have a closed minimum taxonomy.
- **TOK-E5:** typography governs fallback/loading/metric resilience without mandating a specific font.
- **TOK-E6:** scalable/relative units are required where necessary for text zoom/reflow; absolute units are confined to appropriate uses.
- **TOK-E7:** S/M/L/LIM semantics and versioned policy binding are explicit.
- **TOK-E8:** product profiles preserve shared semantics while allowing appropriate visual emphasis.
- **TOK-E9:** accessibility invariants cannot be weakened by aliases or modes.
- **TOK-E10:** token lifecycle/versioning/deprecation, ownership and breaking-change handling are defined.
- **TOK-E11:** collisions, cycles, unauthorized layer transitions and cross-product overrides are invalid and validator targets.
- **TOK-E12:** product-facing raw constants are governed rather than silently proliferating.
- **TOK-E13:** evidence remains historically reproducible across responsive-policy changes.
- **TOK-E14:** implementation follow-up includes schema, validator, fixtures and Stage A reporting before enforcement.
- **TOK-E15:** no runtime, persistence, student account/tracking or DOS-A1 activation is introduced.
