# CAP-DOS-ARGO-SYNC — G4 Design Review v1

**Lifecycle:** G4 — Design  
**Status:** PASS / FLOW-VALIDATED  
**Runtime:** NOT_AUTHORIZED  
**Visual fidelity:** NON-BINDING MOCKUP  
**Implementation UI source:** current Docente OS AppShell and navigation

## 1. Review basis

The G4 review used two kinds of evidence:

1. **flow evidence** — generated mockups that exercise the complete teacher journey;
2. **real product evidence** — current Docente OS AppShell, navigation model and Progetta/Piano annuale routes from the Docente OS repository.

The mockups are not accepted as pixel-accurate visual specifications.

## 2. Real Docente OS surfaces confirmed

Current product evidence establishes:

- AppShell component at `product/src/components/app-shell/app-shell.tsx`;
- primary navigation labels:
  - Home
  - Oggi
  - Classi
  - Progetta
  - Piano annuale
  - Orario
  - Conoscenza
  - Impostazioni
- `Progetta` route at `/progetta`;
- `Piano annuale` route at `/piano-annuale`;
- Progetta already exposes:
  - `Programmazione annuale`;
  - `Unità di apprendimento`;
  - `Materiali operativi`;
- Progetta already links to Piano annuale, including section context when available;
- the AppShell already supports desktop navigation, mobile header, bottom navigation, command palette and mobile sheet.

## 3. Finding F-G4-01 — mockup navigation drift

### Finding

The first mockup introduced a navigation structure that did not accurately match the current Docente OS AppShell.

### Resolution

The mockup is reclassified as **flow evidence only**.

Implementation MUST reuse the actual AppShell/navigation contract and MUST NOT create a parallel navigation hierarchy for Argo export.

**Status:** RESOLVED.

## 4. Finding F-G4-02 — entry-point ambiguity

### Finding

The capability could plausibly appear in either:
- Progetta → Programmazione annuale; or
- Piano annuale.

A duplicate primary workflow would fragment the teacher experience.

### Resolution

The canonical entry point is:

```text
Piano annuale
  → current section/class context
  → consolidated annual programming
  → Prepara file per Argo
```

Progetta → Programmazione annuale MAY expose a contextual secondary entry/link that routes to the same canonical workflow.

There is one capability state machine and one generation flow, not two separate implementations.

**Status:** RESOLVED.

## 5. Finding F-G4-03 — visual design authority

### Finding

Generated mockups risk being mistaken for a new visual system.

### Resolution

The visual implementation is constrained by the real Docente OS design system and components available at implementation time.

The G4 mockup does not authorize:
- new sidebar architecture;
- new global navigation;
- a separate visual language;
- duplicated shell components.

The functional layout may adapt to existing components as long as G3/G4 interaction invariants are preserved.

**Status:** RESOLVED.

## 6. Canonical interaction flow after review

```text
AppShell
→ Piano annuale
→ section/class context
→ annual programming state
→ consolidate
→ Prepara file per Argo
→ review/validation
→ generate .xls
→ manual Argo import
→ verify result
→ confirm in Docente OS
→ baseline advance
```

Secondary discovery path:

```text
Progetta
→ Programmazione annuale
→ Apri Piano annuale / Prepara file per Argo
→ same canonical flow
```

## 7. AppShell integration constraints

Implementation must preserve:

- current `NavigationKey` model;
- current navigation groups;
- current mobile behavior;
- current AppShell command/search model;
- current class/section context conventions;
- current Progetta/Piano annuale route boundaries.

No new top-level `Argo` navigation item is required for v1.

## 8. Responsive behavior

The Argo flow inherits the AppShell's established responsive behavior.

Desktop:
- work inside existing `dosContent/workSurface`;
- no parallel full-screen shell.

Mobile:
- preserve `dosMobileHeader`;
- preserve `dosBottomNav`;
- use existing mobile menu for non-primary destinations;
- Argo review content must fit one-column interaction.

## 9. Mockup evidence classification

The generated mockup is accepted for:

- step ordering;
- action naming;
- success/failure semantics;
- confirmation timing;
- handoff clarity.

It is **not** accepted for:

- exact sidebar labels;
- component dimensions;
- visual styling;
- card density;
- typography;
- spacing;
- pixel-level layout.

## 10. G4 Definition of Done

- [x] user journey/task flow defined;
- [x] information architecture and interaction states defined;
- [x] desktop/mobile/responsive behavior addressed;
- [x] accessibility addressed;
- [x] success/error/waiting/recovery feedback defined;
- [x] human control and authority boundaries preserved;
- [x] prototype/mockup evidence available as flow evidence;
- [x] design review findings resolved;
- [x] implementation handoff traceable to G3 requirements;
- [x] real Docente OS AppShell/navigation constraints recorded.

## 11. G4 decision

**PASS / READY_FOR_G5 PLANNING.**

This PASS validates the interaction model and its binding to the current Docente OS shell.

It does not authorize runtime implementation.

Before G5 begins, implementation planning must identify the exact Docente OS integration slice, affected routes/components, persistence impact and tests.
