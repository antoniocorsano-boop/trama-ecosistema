# TRAMA Penpot design contract

Penpot is the visual design and prototyping surface for the pilot.

The repository stores only **governed design metadata and portable design-system artifacts**. The Penpot canvas itself is not a source of authority for TRAMA.

## Canonical direction

- TRAMA repository / governed snapshots: canonical project state.
- Penpot: visual specification and prototype.
- React implementation: product runtime.
- Figma: optional interoperability/reference during the pilot.

## Target Penpot pages

1. Foundations
2. Tokens
3. Components
4. Desktop 1440
5. Mobile 390
6. LIM 1920
7. States
8. Interaction notes

## Primary component mapping

The design file should preserve a 1:1 mapping, where practical, with the main UI implementation components:

- PhaseRail
- MetricCard
- StatusBadge
- MaturityMatrix
- EvidenceRow
- AttentionItem
- ExpansionItem
- EcosystemNode
- DependencyRow
- ContextHelp
- MobileBottomNav

## Responsive baseline

Visual regression targets remain:

- 1440 × 1024
- 1600 × 1000
- 390 × 844
- 412 × 915
- 1920 × 1080

The mobile design is autonomous and must not be produced by merely scaling or compressing the desktop layout.

See `manifest.json` for the machine-readable governance boundary.
