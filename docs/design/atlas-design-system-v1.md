# Atlas Design System v1 — specifica di sviluppo

**Stato:** PROPOSED  
**Riferimento visivo:** mockup Atlas approvato nella conversazione del 22 settembre 2026.  
**Vincolo:** il mockup è target di direzione, non specifica pixel-perfect.

## 1. Principi

1. Atlante, non dashboard.
2. Relazioni prima delle card.
3. Gerarchia prima della decorazione.
4. Chiarezza editoriale.
5. Provenienza discreta ma sempre raggiungibile.
6. Mobile progettato, non compresso.
7. Accessibilità integrata.
8. Stati semantici distinti.

## 2. Direzione visuale

- fondo avorio / cool white;
- sidebar navy profondo;
- indaco per curricolo/azioni primarie;
- verde petrolio per conoscenza/navigazione Atlas;
- oro tenue per connessioni/decisioni;
- terracotta per accenti didattici;
- bordi sottili;
- shadow minima;
- radius medio, non eccessivo;
- tipografia editoriale + UI sobria.

## 3. Token

### Surface
- canvas
- subtle
- raised
- overlay
- inverse

### Text
- primary
- secondary
- muted
- inverse
- link

### Domain
- authority.arena
- domain.atlas
- domain.docente-os

### State
- curricular.current
- curricular.superseded
- editorial.draft
- editorial.published
- editorial.updated
- editorial.withdrawn
- ui.info
- ui.success
- ui.warning
- ui.error
- decision.human

### Interaction
- focus.ring
- selection.background
- selection.foreground
- hover.background
- pressed.background

## 4. Typography

Ruoli:
- display;
- page-title;
- section-title;
- subsection;
- body;
- body-strong;
- small;
- metadata;
- code.

Regole:
- corpo 16px minimo come riferimento;
- line-height editoriale ampio;
- metadata leggibili anche su LIM;
- massimo 70–75 caratteri per contenuto editoriale;
- niente testo minuscolo per provenienza.

## 5. Grid e spacing

Base 4px.

Scala:
4 / 8 / 12 / 16 / 24 / 32 / 48 / 64.

Desktop:
- 12 colonne quando utile;
- shell con sidebar;
- context rail;
- content width variabile.

Mobile:
- 4 colonne logiche;
- gutters 16px;
- safe-area;
- no overflow pagina.

## 6. Component tiers

### Tier 0 — primitive
Button, Link, IconButton, Input, Textarea, Select, Checkbox, Radio, Switch, Badge, Separator, Skeleton.

### Tier 1 — composition
Tabs, Accordion, Sheet, Drawer, Dialog, Popover, Tooltip, Command, Breadcrumbs, Pagination.

### Tier 2 — Atlas
CurriculumTree, RelationCanvas, CurriculumNode, ObjectiveRow, ResourceCard, ResourceTable, ProvenancePanel, ProgressionRail, RelationLegend, SearchResult, ContextPanel.

### Tier 3 — page patterns
ExploreLayout, CurriculumLayout, ObjectiveLayout, ResourceCatalogLayout, PathwayLayout.

## 7. Motion

- 120–220 ms per transizioni comuni;
- niente autoplay;
- reduced motion;
- canvas zoom/pan non trasporta informazione essenziale.

## 8. Responsive behavior

### ≥1200
sidebar + content + context panel.

### 768–1199
sidebar collapsible, context drawer.

### <768
bottom nav, single primary column, sheets per filtri/dettagli.

Touch device può forzare pattern mobile/tablet indipendentemente dalla sola width.

## 9. Visual QA

Ogni componente Atlas deve avere stati:
- default;
- hover;
- focus;
- active;
- selected;
- loading;
- empty;
- error;
- disabled solo se necessario.

Ogni pagina deve essere verificata:
- desktop;
- mobile reale;
- tablet;
- LIM;
- 200% zoom;
- tastiera;
- screen reader.

## 10. Regola di fedeltà al mockup

Lo sviluppo deve conservare:
- sidebar scura e chiara gerarchia;
- command search;
- mappa relazionale come hero experience;
- context panel;
- curriculum tree;
- dettaglio obiettivo;
- mobile bottom navigation;
- tono visuale premium e sobrio.

Non deve conservare errori testuali o dettagli inventati presenti nell'immagine generata.


## 11. Estensione Vision Alignment — Mockup V2

Il Design System v1 resta la fondazione canonica.

La vision consolidata del 23 settembre 2026 introduce un'estensione di prodotto, non un secondo design system. Le nuove superfici devono seguire [Atlas Mockup V2 — Vision Alignment Specification](./atlas-mockup-v2-vision-alignment.md).

Nuovi componenti Atlas da valutare/implementare nei successivi slice:
- LearningActivityCard;
- LearningActivityPlayer;
- ActivityStep;
- OffscreenStep;
- LearningJourney;
- LessonHeader;
- LearningIntent;
- MaterialRoleBadge;
- OfflineAvailability;
- PublicContextSelector;
- CurriculumBindingDisclosure.

Nuovi page pattern:
- StudentHubLayout;
- LessonPublicLayout;
- LearningActivityLayout;
- LearningJourneyLayout.

Invariante: la nuova grammatica deve estendere i token, primitive e livelli esistenti senza introdurre una libreria visuale concorrente.
