# TRAMA Design Tokens Contract v1

**Contract ID:** TRAMA-DESIGN-TOKENS-01  
**Status:** PROPOSED / GOVERNANCE-ONLY  
**Baseline:** `d37bd1defe173da66493b6476a63f27db59129b0`  
**Parents:** `TRAMA-UIUX-01` · `TRAMA-UI-EVIDENCE-01`  
**Runtime impact:** NONE  
**DOS-A1:** RUNTIME_DEFERRED

## 1. Purpose

TRAMA-DESIGN-TOKENS-01 defines the shared semantic design-token foundation for Arena, Atlas, Docente OS and TRAMA Control Center. It governs visual and responsive semantics so product interfaces can remain coherent without becoming visually identical.

**Ecosystem coherence does not mean visual uniformity.** TRAMA governs shared meaning, accessibility invariants, interaction semantics and evidence. Each product retains a governed visual and semantic-expressive identity appropriate to its role and users.

Tokens are design decisions with stable names and governed meaning. They are not arbitrary CSS constants, framework-specific class names or a mandate to adopt a particular component library, font family or styling framework.

## 2. Layer model and alias boundaries

The token system SHALL use three conceptual layers:

1. **Primitive/reference layer** — raw scales and reference values. Product code SHOULD NOT consume this layer directly.
2. **Semantic ecosystem layer** — intent-based tokens such as surface, text, border, focus, feedback, spacing-role and responsive-condition semantics. This is the default consumption layer.
3. **Product/profile alias layer** — Arena, Atlas, Docente OS and Control Center MAY alias ecosystem semantics to express their product identity, but MUST NOT change the semantic meaning of a shared token.

Component-specific tokens MAY exist only where a reusable component has a genuine semantic need not expressible by existing ecosystem tokens.

Alias resolution MUST be acyclic. Product aliases MUST resolve only through authorized ecosystem/component semantic targets; cross-product aliasing, product-to-product inheritance and aliases that bypass an authorized layer are invalid unless explicitly governed as a shared ecosystem semantic.

## 3. Required token domains

### TOK-01 — Color, modes, interaction and feedback
The governed taxonomy MUST cover at least canvas/surface layers, primary/secondary/muted text, borders/dividers, focus indicator and selection, disabled/unavailable state, and informational/success/warning/error feedback.

Interactive controls MUST expose semantic state roles for all applicable states: `default`, `hover` where pointer interaction exists, `focus-visible`, `active/pressed`, `selected`, `disabled` and `pending/loading`. Success, warning and error are feedback semantics and MUST NOT be used as substitutes for interaction-state semantics.

Color tokens MUST encode semantic role, not literal hue names in product-facing APIs. Required meaning MUST NOT rely on color alone. Product profiles MAY use distinct palettes, tonal ranges and surface treatments when they preserve shared semantic roles, contrast/accessibility invariants and state recognisability.

The implementation MUST govern presentation modes separately from token meaning. At minimum it SHALL model `light`, `dark` and `system/preference-following` behavior where supported and SHALL define resilience for platform `forced-colors`/high-contrast behavior. A mode MAY change a token value but MUST NOT change the token's semantic role.

### TOK-02 — Typography and font resilience
The taxonomy MUST define semantic roles for display/title, section heading, body, supporting text, labels/controls and code/data where applicable. It MUST govern size, line height, weight and readable measure/line length where relevant.

Typography MUST support user zoom and reflow. Text sizing and text-related spacing MUST use scalable/relative semantics suitable for user scaling rather than fixed dimensions that defeat browser/user preferences.

The governed typography profile MUST define a fallback stack or equivalent fallback policy, behavior when the preferred font is unavailable, and loading behavior that keeps text readable throughout font acquisition. When web fonts are used, the implementation MUST address metric compatibility/layout shift and `font-display` or an equivalent strategy. No specific font family is mandated by this contract.

Product profiles MAY differentiate typographic voice through approved families, scale emphasis, weight distribution and measure, provided shared readability/accessibility semantics are preserved.

### TOK-03 — Spacing, density and scalable units
A shared spacing scale MUST exist, with semantic aliases for page, section, cluster, control and inline relationships. Product profiles MAY choose distinct density and rhythm profiles when touch-target, readability, reflow and accessibility requirements remain satisfied.

Values coupled to text size, readable measure or reflow SHOULD use scalable/relative units or semantics. Absolute units MAY be used where semantically appropriate and MUST NOT freeze text or layouts against user zoom/reflow.

### TOK-04 — Shape, border and elevation
Radius, border and elevation/shadow semantics MUST distinguish hierarchy and interaction without becoming the sole carrier of state. Product profiles MAY use different shape/elevation vocabularies as an identity dimension when shared interaction/state semantics remain recognisable.

### TOK-05 — Motion
Motion tokens MUST define duration/easing roles and reduced-motion behavior. Product profiles MAY differ in expressive motion character, but essential state changes MUST remain understandable when nonessential animation is reduced or removed.

### TOK-06 — Responsive conditions
The shared responsive policy MUST define governed conditions `S`, `M`, `L`, `LIM` as semantic verification contexts. Concrete viewport/container ranges SHALL live in a versioned machine-readable policy artifact. Individual views MUST NOT invent private breakpoints without a governed exception or approved container-specific rule.

### TOK-07 — Layout semantics
The taxonomy MUST provide semantic constraints for content measure, page gutters, grid/gap relationships, stacked/clustered regions and stable action placement. Product profiles MAY adopt different composition patterns and information density appropriate to their role. Tokens SHOULD support container-query-based composition where appropriate rather than assuming viewport width alone.

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

## 5. Governed Product Visual Identity Profiles

Visual identity is a governed product property, not an accidental divergence and not something erased by ecosystem standardisation. Each product SHALL have a versioned **Product Visual Identity Profile (PVIP)**. A PVIP defines the permitted expressive range of a product while remaining bound to ecosystem semantics.

A PVIP SHOULD govern, as applicable: palette/tonal character; typographic voice; density and spatial rhythm; shape/border/elevation character; composition and information hierarchy; navigation expression; data-visualisation character; motion character; illustration/iconographic treatment; and presentation-mode choices.

A PVIP MUST NOT redefine shared semantic meaning, accessibility requirements, authority boundaries, feedback meaning, interaction-state semantics, `TRAMA-PW-01`, responsive evidence obligations or privacy constraints. The same semantic concept MAY therefore look different across products while remaining recognisably equivalent in meaning and behavior.

The future validator SHALL test **semantic compatibility, not pixel similarity**. Cross-product visual sameness is not a quality criterion. Conversely, arbitrary divergence that breaks shared meaning is invalid.

### Arena — authoritative curriculum identity
Arena SHALL communicate authority, provenance, review state and curriculum structure. Its identity MAY be denser, more document- and evidence-oriented, with restrained visual hierarchy. Distinctiveness MUST NOT obscure authority state or reduce accessible targets.

### Atlas — public exploration identity
Atlas SHALL communicate openness, orientation, discovery and public readability. Its identity MAY be more spacious, visual and exploratory, supporting curriculum navigation and published learning materials without account-dependent personalisation.

### Docente OS — teacher-workspace identity
Docente OS SHALL communicate focus, continuity of work, speed and teacher agency. Its identity MAY privilege task-focused composition, stable primary actions and low interaction noise. Local-only/personal-preference surfaces remain subject to privacy/product contracts.

### TRAMA Control Center — ecosystem-observability identity
TRAMA Control Center SHALL communicate system state, evidence, comparison and governed progression. Its identity MAY be denser and more analytical, but MUST prevent status/severity information from becoming visual noise or relying on color alone.

Each product profile owns only its authorized alias/PVIP namespace. It MUST NOT override another product profile or ecosystem semantics.

## 6. Accessibility invariants

Token values MUST be evaluated in actual component/context combinations; token-level contrast claims alone are insufficient. The governed implementation SHALL support WCAG 2.2 A/AA applicable contrast requirements, visible focus, text zoom/reflow, target sizing where applicable, reduced motion, high-contrast/forced-colors resilience, meaning independent of color alone and readable fallback typography.

A product alias, presentation mode or PVIP MUST NOT reduce an ecosystem accessibility invariant.

## 7. Responsive policy and evidence binding

The future machine-readable responsive policy SHALL have a stable policy ID and version. `TRAMA-UI-EVIDENCE-01` evidence MUST bind to that policy version and record the concrete viewport/container dimensions used in each S/M/L/LIM run.

Changing a breakpoint/range does not retroactively reinterpret historical evidence: evidence remains bound to the policy version active when it was produced.

## 8. Ownership and token governance lifecycle

Every machine-readable ecosystem policy, token namespace, product-profile artifact and PVIP MUST declare an `owner` or governing-authority identifier from an approved governance registry. Ownership controls who may propose authoritative changes; it does not bypass review, evidence or repository protections.

Each machine-readable token/PVIP release MUST record policy/profile ID and version, owner/governing authority, changed tokens/identity dimensions, semantic-change classification (`NONE | VALUE_ONLY | ADDITIVE | BREAKING`), affected products/profiles, migration note for breaking changes, accessibility/responsive review requirement and exact commit/build identity.

Deprecated tokens MUST have a replacement or explicit removal rationale and a bounded migration period. Alias cycles, namespace collisions, unauthorized cross-product overrides and alias targets outside authorized layers are invalid.

## 9. Machine-readable seed authorized after approval

Approval of this contract authorizes a separate implementation PR containing:

1. ecosystem semantic token seed, including interaction-state and presentation-mode semantics;
2. S/M/L/LIM responsive policy v1;
3. product-profile alias seeds for Arena, Atlas, Docente OS and Control Center;
4. **PVIP v1 seeds for all four products**, encoding identity dimensions without duplicating ecosystem semantics;
5. typography/fallback and scalable-unit policy seed;
6. machine-readable ownership/governing-authority references;
7. schema/validator for token structure, unique identity, alias resolution, authorized layer transitions, ownership, forbidden cycles/collisions/cross-product overrides, mode-semantic invariance and PVIP semantic compatibility;
8. fixtures for valid differentiated product identities plus missing targets, cycles, collisions, unauthorized cross-product aliases, mode semantic inversion, semantic-breaking changes, identity profiles that weaken accessibility/shared meaning and unauthorized raw product constants;
9. non-blocking Stage A report integrated with `TRAMA-UI-EVIDENCE-01`.

No product runtime migration is authorized by this contract alone.

## 10. Acceptance criteria

- **TOK-E1:** primitive, semantic and product-alias layers are explicitly separated and alias transitions are governed.
- **TOK-E2:** color, typography, spacing, shape/border/elevation, motion, responsive, layout and layering domains are governed.
- **TOK-E3:** light/dark/system behavior and forced-colors/high-contrast resilience preserve semantic meaning.
- **TOK-E4:** interactive states are distinct from feedback semantics and have a closed minimum taxonomy.
- **TOK-E5:** typography governs fallback/loading/metric resilience without mandating a specific font.
- **TOK-E6:** scalable/relative units are required where necessary for text zoom/reflow; absolute units are confined to appropriate uses.
- **TOK-E7:** S/M/L/LIM semantics and versioned policy binding are explicit.
- **TOK-E8:** each product has a governed, versioned PVIP and may express a distinct visual identity without changing shared semantic meaning.
- **TOK-E9:** ecosystem quality is evaluated by semantic compatibility and evidence, not cross-product pixel similarity.
- **TOK-E10:** accessibility invariants cannot be weakened by aliases, modes or PVIPs.
- **TOK-E11:** token/PVIP lifecycle, versioning, deprecation, ownership and breaking-change handling are defined.
- **TOK-E12:** collisions, cycles, unauthorized layer transitions and cross-product overrides are invalid and validator targets.
- **TOK-E13:** product-facing raw constants are governed rather than silently proliferating.
- **TOK-E14:** evidence remains historically reproducible across responsive-policy changes.
- **TOK-E15:** implementation follow-up includes token seed, four PVIP seeds, schema, validator, fixtures and Stage A reporting before enforcement.
- **TOK-E16:** no runtime, persistence, student account/tracking or DOS-A1 activation is introduced.
