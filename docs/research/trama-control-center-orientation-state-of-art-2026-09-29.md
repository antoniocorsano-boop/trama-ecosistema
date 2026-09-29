# TRAMA Control Center — State of the art on orientation and overview surfaces

**Status:** RESEARCH / DESIGN INPUT / NO RUNTIME CHANGE  
**Date:** 2026-09-29  
**Scope:** Control Center orientation, overview composition, navigation shell, mobile hierarchy

## 1. Research question

How should a complex system present itself so that a person immediately understands:
- where they are;
- what the system is;
- what matters now;
- where to go next;
without forcing them to read a long dashboard or understand the system's internal architecture?

## 2. Current TRAMA finding

The current L0 prototype is rationally organized but perceptually weak.

Primary failure:
- the user sees a vertical sequence of sections with similar visual weight;
- after scrolling, location and hierarchy are progressively lost;
- the page behaves like a report, not like an orientation surface;
- progressive disclosure was implemented mainly as “technical detail lower on the page”, not as progressive navigation.

This is an orientation failure, not merely a copy problem.

## 3. Mature pattern: persistent product shell

### IBM Carbon UI Shell

Observed pattern:
- persistent product identity;
- persistent global navigation;
- optional secondary navigation;
- side navigation used only when the product requires frequent movement across multiple secondary areas;
- narrow/mobile layouts collapse secondary navigation rather than preserving a desktop vertical rail.

Adaptation for TRAMA:
- persistent identity should say TRAMA Control Center + current area;
- L0 should not rely on the left rail to explain where the user is;
- mobile should use a compact stable shell, not a long page with a bottom navigation over an equally long vertical dashboard.

## 4. Mature pattern: navigation is not a sitemap

### GOV.UK service navigation

Observed pattern:
- service name confirms where the user is;
- primary navigation contains only the most important top-level sections;
- navigation should help users understand what the service does and what they can find;
- simplify the journey before adding more navigation.

Adaptation for TRAMA:
Primary navigation should be limited to major destinations, e.g.:
- Sintesi
- Ecosistema
- Verifiche
- Cronologia
- Altro / Tecnico

“Attenzione” should normally be a state/entry point, not always a permanent peer destination if no item exists.

## 5. Mature pattern: overview is a launch point

### Backstage Home

Observed pattern:
- Home surfaces relevant information and shortcuts;
- it is a configurable composition surface, not a full reproduction of the underlying catalog;
- users should not need to memorize direct URLs.

Adaptation for TRAMA:
The Home should surface:
- current state;
- ecosystem map;
- important attention item(s);
- a very small set of meaningful next destinations.

The full assurance matrix, history, evidence and technical data should live elsewhere.

## 6. Mature pattern: system model is explicit

### Backstage system model

Observed pattern:
- the system exposes components and their relationships as a conceptual model;
- this model is distinct from the navigation itself.

Adaptation for TRAMA:
Arena → Atlas → Docente OS should be shown as a relationship, not three unrelated cards.

This provides an immediate answer to:
“What am I looking at?”

Suggested semantic mapping:
- Arena — Curricolo e governance
- Atlas — Esplora e pubblica
- Docente OS — Lavora

## 7. New TRAMA model: shell + overview + destinations

### Layer A — Persistent shell

Always visible:
- TRAMA Control Center;
- current area: Sintesi / Ecosistema / Verifiche / etc.;
- current global condition only when relevant;
- stable navigation.

Purpose:
- orientation.

### Layer B — L0 overview

Fits substantially within the first viewport on desktop and should be understandable within one screen plus minimal scroll on smartphone.

Contains only:
1. current situation;
2. freshness;
3. ecosystem relationship;
4. max three high-value destinations.

Purpose:
- comprehension.

### Layer C — Destination pages

Separate views:
- Ecosistema
- Verifiche
- Cronologia
- Tecnico

Purpose:
- exploration.

### Layer D — Contextual drill-down

Details:
- specific finding;
- specific verification;
- source/evidence;
- exact head / PR / workflow.

Purpose:
- auditability.

## 8. Card policy

Current risk:
too many bordered cards flatten hierarchy.

New policy:
- one dominant state panel at L0;
- ecosystem relationship rendered as a lightweight connected model;
- max three secondary destination cards/tiles;
- plain canvas + spacing for explanatory text;
- cards only when they represent an object, decision, or navigable destination.

A card is not the default container for every piece of information.

## 9. Mobile policy

The mobile Home should not be the desktop Home stacked vertically.

Mobile L0 should prioritize:
1. identity/current area;
2. current state;
3. freshness;
4. compact ecosystem relationship;
5. three destinations.

Detailed verification cards and change history should not be rendered inline beneath L0.

Suggested mobile shell:
- top: TRAMA / Sintesi;
- bottom: Sintesi / Ecosistema / Verifiche / Altro.

“Attenzione” appears as a state within Sintesi or as a badge/count on the most relevant destination when actionable.

## 10. Orientation cues

Every destination page should expose:
- product identity: TRAMA Control Center;
- current section;
- optional parent path only when necessary;
- stable location of navigation;
- page title that matches the navigation label.

Do not rely on color alone.

## 11. Progressive navigation vs progressive disclosure

TRAMA SHALL distinguish:

### Progressive disclosure
Show more detail about the current object.

Example:
“Accessibilità — copertura parziale” → open exact evidence.

### Progressive navigation
Move from an overview to a dedicated area.

Example:
Sintesi → Verifiche.

The current prototype overuses vertical progressive disclosure where progressive navigation is more appropriate.

## 12. First-screen acceptance test

A non-technical person should be able to answer, before exploring:
1. Where am I?
2. What is TRAMA in one sentence?
3. Is the situation normal, requiring attention, or blocked?
4. How recent is this information?
5. What are the three parts of the ecosystem and how do they relate?
6. Where do I go if I want more detail?

If these answers require reading multiple stacked sections, L0 has failed.

## 13. Proposed L0 composition

Desktop:

- persistent shell/header;
- page label: Sintesi;
- dominant state panel;
- compact Arena → Atlas → Docente OS relationship;
- three destinations:
  - Attenzione / decisioni;
  - Verifiche;
  - Novità / cronologia.

Mobile:

- compact shell;
- dominant state panel;
- one-line ecosystem relationship, horizontally adapted without forcing page overflow;
- three stacked or 2+1 destination controls;
- no inline specialist matrix.

## 14. Implication for E3-L0

The current E3-L0 surface should be treated as a design probe, not as the final validation target.

Before formal user sessions:
- produce L0 v2 with shell + ecosystem map + three destinations;
- ensure first-screen orientation;
- remove specialist sections from the Home;
- test mobile separately;
- then resume human-use validation.

## 15. Benchmark sources consulted

- IBM Carbon Design System — UI Shell header / left panel / global header;
- GOV.UK Design System — Navigate a service / Service navigation;
- Backstage — Home plugin and system model.

These sources are used as mature pattern references, not as product authority for TRAMA.
