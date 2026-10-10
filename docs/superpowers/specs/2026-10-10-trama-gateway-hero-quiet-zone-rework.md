# TRAMA Gateway — Hero Quiet Zone Rework

Date: 2026-10-10
Status: HUMAN-APPROVED DESIGN DIRECTION
Scope: PR #266 — `design/trama-identity-gateway-v1`
Baseline entering this rework: `b1e4b0f775c7db3cec76904a44d9762564fb833b`

## Problem statement

The approved photographic background family is visually rich enough that the hero copy competes with the scene, especially on M, S and LIM. The remaining issue is not the copper token alone: the central reading area contains too much local contrast, highlight activity and micro-detail. The image wins over the message.

## Design decision

Keep the approved L/M/S/LIM background assets frozen. Rework only the hero integration so that the scene remains rich at the edges and in the foreground while the copy sits inside a local visual quiet zone.

The quiet zone must be perceived as calmer photographic space, not as a panel, card, dark band or obvious overlay.

## Required treatment

1. Preserve the foreground desk, horizon/window, shelves and warm sunset identity.
2. Create a local quiet zone behind the hero using a restrained combination of:
   - small local reduction in contrast and saturation;
   - subtle local backdrop blur;
   - low-opacity warm-smoke veil;
   - soft falloff to full transparency.
3. Tighten the hero composition so the headline has a more controlled line length and more stable placement.
4. Give `esperienza.` additional vertical breathing room and keep it out of the highest-energy background area.
5. Preserve the existing CTA, navigation and Segno vivo concepts; do not redesign them in this pass.

## Prohibited solutions

- no regenerated or replaced background assets;
- no full-hero blackout;
- no opaque or glass card behind the copy;
- no obvious rectangular gradient band;
- no heavy text outline;
- no additional image sharpening or global contrast increase;
- no solving the issue by color changes alone.

## Breakpoint intent

### L — 1440×900
Editorial and spacious. Keep the wide scene, constrain the hero slightly and calm only the immediate reading area.

### M — 768×1024
More compact composition. Increase separation between headline, copper accent and support copy. Quiet zone may be slightly stronger than L.

### S — 390×844
Prioritize hierarchy over spectacle: headline, accent, support copy, CTA. Quiet zone must be effective while still reading as part of the photograph.

### LIM — 320×900
Legibility is the primary requirement. Keep the visual language intact but use the strongest permitted local quieting and the most disciplined line length.

## Acceptance criteria

The rework is a candidate for Human Visual Review only when all four real browser screenshots demonstrate:

- headline readable at first glance;
- `esperienza.` readable and distinct;
- support copy and CTA clearly legible;
- no visible panel/card/black band behind copy;
- approved background identity remains recognisable;
- L/M/S/LIM feel like one system, not four unrelated compromises;
- automated accessibility, reflow, media and governance checks remain green.

## Human decision

Approved in-chat direction on 2026-10-10. Implementation may proceed under TDD. Human Visual Review remains required before merge or deploy.
