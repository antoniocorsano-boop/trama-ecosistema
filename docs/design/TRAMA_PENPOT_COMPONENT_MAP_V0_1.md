# TRAMA — mappa componenti Penpot v0.1

Stato: **PROPOSTA DI PROGETTAZIONE**

Questo documento scompone il mockup TRAMA Control Center in unità riutilizzabili da costruire in Penpot.

## 1. Albero dei componenti

```
TRAMA
├─ Navigation
│  ├─ Sidebar
│  ├─ SidebarItem
│  ├─ BottomNavigation
│  ├─ BottomNavItem
│  ├─ SegmentedFilter
│  └─ ViewToggle
├─ Status
│  ├─ Badge
│  ├─ Indicator
│  ├─ Gate
│  └─ Freshness
├─ Roadmap
│  ├─ Phase
│  ├─ Connector
│  └─ CompactPhase
├─ KPI
│  └─ Card
├─ Maturity
│  ├─ Matrix
│  ├─ Row
│  ├─ Cell
│  ├─ LevelBlocks
│  └─ MobileRow
├─ Ecosystem
│  ├─ Node
│  ├─ Relation
│  ├─ FlowItem
│  └─ Legend
├─ Alert
│  └─ Card
├─ Expansion
│  └─ Card
├─ Evidence
│  ├─ Table
│  ├─ TableRow
│  ├─ List
│  └─ ListItem
├─ Policy
│  └─ Card
└─ Help
   ├─ InfoTrigger
   ├─ Tooltip
   └─ DetailPanel
```

## 2. Component API minima

### Status/Badge

Proprietà:

- `label`
- `tone = neutral | info | success | warning | danger | pending`
- `size = compact | regular`
- `icon = optional`

### Navigation/SidebarItem

Proprietà:

- `label`
- `icon`
- `state = default | hover | focus | active | disabled`
- `badge = optional`

### KPI/Card

Proprietà:

- `label`
- `value`
- `trend = optional`
- `context = optional`
- `tone`
- `icon`

### Roadmap/Phase

Proprietà:

- `code`
- `title`
- `status`
- `period`
- `riskCount = optional`
- `state = completed | near-complete | active | planned | future | blocked`

### Maturity/Row

Proprietà:

- `domain`
- `icon`
- `level = 0..5`
- `status`
- `detailAvailable`

### Ecosystem/Node

Proprietà:

- `module`
- `title`
- `description`
- `tone`
- `state`
- `items = optional`

### Evidence/ListItem

Proprietà:

- `type`
- `scope`
- `title`
- `reference`
- `timestamp`
- `state`

## 3. Responsive transformations

### Sidebar

Desktop: persistente.  
Tablet: rail o drawer.  
Mobile: rimossa dalla superficie primaria e sostituita da bottom navigation + menu.

### KPI

Desktop: quattro colonne.  
Tablet: due colonne.  
Mobile: due colonne quando leggibile, altrimenti stack.

### Maturity/Matrix

Desktop: matrice.  
Tablet: matrice semplificata.  
Mobile: `Maturity/MobileRow` per ambito.

### Evidence/Table

Desktop: tabella.  
Mobile: lista, senza scroll orizzontale obbligatorio.

### Ecosystem graph

Desktop: rete visuale.  
Mobile: relazione semplificata e navigabile, con alternativa testuale.

## 4. Ordine di costruzione in Penpot

1. Foundations — colori, tipografia, spaziatura, raggi.
2. Status primitives.
3. Navigation primitives.
4. Generic card shell.
5. KPI card.
6. Roadmap.
7. Maturity.
8. Alert + Expansion.
9. Evidence.
10. Policy.
11. Ecosystem nodes/relations.
12. Desktop composition.
13. Mobile composition.
14. Interaction states.
15. Accessibility annotations.
16. Handoff mapping.

## 5. Criteri di non duplicazione

Un nuovo componente non va creato se può essere ottenuto con:

- variante;
- proprietà;
- slot di contenuto;
- composizione di componenti esistenti.

Non creare varianti separate solo per:

- testi diversi;
- icone intercambiabili;
- singoli valori KPI;
- singoli moduli dell'ecosistema.

## 6. Naming

Componenti:

`TRAMA/<Area>/<Component>`

Varianti:

`Property=Value`

Esempi:

- `TRAMA/Status/Badge`
- `Tone=Warning, Size=Compact`
- `TRAMA/Roadmap/Phase`
- `State=Active`

## 7. Handoff

Per ogni componente devono essere documentati:

- token;
- padding/gap;
- dimensioni minime;
- comportamento di resize;
- breakpoint;
- stato focus;
- contenuto lungo;
- comportamento senza dati;
- comportamento in errore;
- componente implementativo corrispondente.

## 8. Vincolo TRAMA

Il design non deve suggerire che TRAMA sia fonte autorevole di curricolo o dati professionali.

Le etichette e le visualizzazioni devono distinguere:

- dato autorevole;
- proiezione;
- stato di monitoraggio;
- evidenza;
- valutazione;
- decisione umana.
