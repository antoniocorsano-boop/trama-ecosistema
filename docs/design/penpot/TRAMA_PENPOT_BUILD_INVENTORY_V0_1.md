# TRAMA Penpot — inventario operativo v0.1

Stato: **PRONTO PER COSTRUZIONE IN PENPOT**

## Foundations

- colori semantici: `trama.color.*`
- spaziatura: `trama.space.*`
- raggi: `trama.radius.*`
- dimensioni canoniche: `trama.size.*`
- tipografia: da creare come stili condivisi in Penpot con ruoli Display, H1, H2, H3, Body, Body Compact, Label, Caption, Code

## Componenti da costruire

| Ordine | Componente | Varianti minime |
| --- | --- | --- |
| 1 | TRAMA/Status/Badge | tone × size |
| 2 | TRAMA/Status/Indicator | tone × state |
| 3 | TRAMA/Nav/SidebarItem | default/hover/focus/active/disabled |
| 4 | TRAMA/Nav/BottomItem | default/focus/active |
| 5 | TRAMA/Nav/SegmentedFilter | default/selected/focus |
| 6 | TRAMA/Card/Shell | compact/regular |
| 7 | TRAMA/KPI/Card | tone × trend |
| 8 | TRAMA/Roadmap/Phase | completed/near-complete/active/planned/future/blocked |
| 9 | TRAMA/Maturity/Cell | 0..5 × status |
| 10 | TRAMA/Maturity/Row | desktop/mobile |
| 11 | TRAMA/System/Node | Arena/Atlas/DocenteOS/Assurance/TRAMA |
| 12 | TRAMA/Alert/Card | warning/danger/info |
| 13 | TRAMA/Expansion/Card | planned/analysis/definition/evaluation |
| 14 | TRAMA/Evidence/Row | desktop/mobile |
| 15 | TRAMA/Policy/Card | active/warning/inactive |
| 16 | TRAMA/Help/InfoTrigger | default/hover/focus |
| 17 | TRAMA/Help/Tooltip | compact/regular |
| 18 | TRAMA/Help/DetailPanel | side/mobile-sheet |

## Composizioni

### Desktop 1440

- Sidebar 248
- Topbar
- PhaseRoadmap
- KPIGrid 4 colonne
- MainGrid:
  - Maturity matrix
  - Ecosystem live
  - Alerts / Expansions
- SecondaryGrid:
  - Evidence table
  - Policy cards

### Mobile 390

- CompactTopbar
- Intro + stato dati
- Filtri
- Roadmap compatta
- KPI 2 colonne o stack
- Alerts
- Maturity rows
- Ecosystem simplified
- Evidence list
- Expansions
- Policy
- Bottom navigation

## Regole di costruzione

- nessun componente duplicato per testo o icona;
- colore di modulo separato da colore di stato;
- focus sempre visibile;
- nessun significato affidato al solo colore;
- mobile progettato autonomamente;
- nessun overflow orizzontale non intenzionale;
- i blueprint SVG sono riferimenti strutturali, non sorgente definitiva dei componenti.
