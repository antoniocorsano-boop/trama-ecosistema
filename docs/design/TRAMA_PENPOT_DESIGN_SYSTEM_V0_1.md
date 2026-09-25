# TRAMA Design System — specifica Penpot v0.1

Stato: **PROPOSTA DI PROGETTAZIONE**  
Ambito: TRAMA ecosystem monitor / control center  
Fonte di progettazione UI/UX: **Penpot**  
Impatto runtime: **nessuno**

## 1. Scopo

Questa specifica definisce la base ufficiale di progettazione dell'interfaccia TRAMA in Penpot.

TRAMA resta il livello di governo comune di Arena, Atlas e Docente OS. La superficie qui progettata non costituisce una quarta applicazione autonoma e non replica dati autorevoli: li rende leggibili, tracciabili e contestualizzati per il monitoraggio dell'ecosistema.

## 2. Decisione sullo strumento

Per TRAMA, **Penpot è la fonte di progettazione UI/UX**.

Conseguenze operative:

- wireframe, schermate, componenti, variabili e prototipi UI vengono mantenuti in Penpot;
- il repository TRAMA conserva specifiche, mapping tra design e implementazione, regole di accessibilità e riferimenti alle schermate;
- le immagini generate o i mockup statici sono riferimenti visivi, non sorgente editabile del design;
- Figma non è parte del flusso operativo TRAMA;
- nessuna modifica di design autorizza automaticamente modifiche runtime.

## 3. Riferimenti visivi recuperati

Sono assunti come riferimento iniziale:

1. **Desktop — TRAMA Control Center**
   - shell scura;
   - navigazione laterale;
   - intestazione con stato dati e filtri;
   - roadmap/fasi;
   - KPI;
   - matrice di maturità;
   - ecosistema vivo;
   - attenzione richiesta;
   - prossime espansioni;
   - evidenze recenti;
   - indicatori di integrità e policy.

2. **Mobile — TRAMA**
   - progettazione autonoma per schermo piccolo;
   - nessuna semplice riduzione della versione desktop;
   - priorità a leggibilità, sequenza verticale e accesso progressivo al dettaglio;
   - navigazione inferiore compatta;
   - trasformazione di matrici e tabelle in righe, schede e liste.

Le immagini sono baseline visuali: la costruzione Penpot deve trasformarle in strutture modificabili e responsive.

## 4. Principi di progettazione

### 4.1 Informazione prima della decorazione

Ogni elemento visibile deve rispondere ad almeno una funzione:

- stato;
- evidenza;
- relazione;
- rischio;
- decisione;
- navigazione;
- dettaglio contestuale.

Gli elementi puramente ornamentali devono restare subordinati alla leggibilità.

### 4.2 Ogni dato deve essere spiegabile

Indicatori, badge, stati, icone e grafici devono poter esporre:

- significato;
- fonte;
- ultimo aggiornamento;
- stato di affidabilità o validazione;
- eventuale decisione collegata.

In implementazione, questo principio richiede tooltip, help contestuale, pannelli di dettaglio o viste drill-down accessibili anche da tastiera.

### 4.3 Mobile non è desktop ridotto

La vista mobile ha una propria struttura.

Desktop:
- alta densità informativa;
- visualizzazioni simultanee;
- matrice di maturità;
- grafo ecosistema;
- tabelle.

Mobile:
- sequenza verticale;
- raggruppamenti progressivi;
- tabelle trasformate in card/list;
- matrici trasformate in righe di maturità;
- grafo semplificato;
- priorità a stato, alert e prossime azioni.

### 4.4 Progressiva rivelazione del dettaglio

La vista iniziale mostra il quadro sintetico. Il dettaglio tecnico è disponibile senza sovraccaricare la lettura primaria.

### 4.5 Accessibilità come vincolo di progetto

Target minimo:

- WCAG 2.2 AA;
- contrasto verificato;
- focus chiaramente visibile;
- target interattivi **minimo 44 × 44 px**; l'icona o il segno visivo può essere più piccolo purché l'area attivabile resti almeno 44 × 44 px;
- significato non affidato al solo colore;
- equivalenza tra interazione con mouse, tastiera e touch;
- grafici accompagnati da equivalente testuale o tabellare.

## 5. Architettura delle pagine Penpot

Struttura raccomandata del file:

1. `00 — Cover & Governance`
2. `01 — Foundations`
3. `02 — Components`
4. `03 — Patterns`
5. `04 — Desktop`
6. `05 — Mobile`
7. `06 — States & Accessibility`
8. `07 — Handoff`
9. `99 — References`

La pagina `99 — References` contiene i mockup statici recuperati e ogni riferimento successivo, marcati chiaramente come **reference only**.

## 6. Foundations

### 6.1 Colore

Famiglie semantiche:

- `surface/background`
- `surface/panel`
- `surface/elevated`
- `text/primary`
- `text/secondary`
- `border/default`
- `accent/primary`
- `status/success`
- `status/warning`
- `status/danger`
- `status/info`
- `module/arena`
- `module/atlas`
- `module/docente-os`
- `module/assurance`

Il colore di modulo non deve sostituire la semantica di stato.

### 6.2 Spaziatura

Scala consigliata a base 4:

- 4
- 8
- 12
- 16
- 20
- 24
- 32
- 40
- 48

### 6.3 Raggi

- 8 — controlli compatti;
- 12 — righe e controlli;
- 16 — card;
- 20 — pannelli principali;
- full — pill/badge.

### 6.4 Tipografia

Gerarchia minima:

- Display / titolo pagina
- Heading 1
- Heading 2
- Heading 3
- Body
- Body compact
- Label
- Caption
- Code / identificatori tecnici

La scala deve essere definita con stili condivisi Penpot, non valori locali ripetuti.

## 7. Griglia e breakpoint

### Desktop

Frame di riferimento: **1440 px**.

- sidebar: 240–256 px;
- contenuto con griglia a 12 colonne;
- margini laterali contenuto: 24–32 px;
- gap principali: 16–24 px.

### Tablet

Indicativamente 768–1199 px.

- navigazione laterale collassabile;
- pannelli a due colonne quando possibile;
- componenti che passano a singola colonna sotto soglia di leggibilità.

### Mobile

Frame di riferimento: **390 px**.

- padding laterale: 16 px;
- singola colonna;
- bottom navigation quando utile;
- nessun overflow orizzontale non intenzionale;
- nessun layout desktop che si riattiva dopo il caricamento.

## 8. Shell desktop

Struttura:

```
AppShell
├─ Sidebar
│  ├─ Brand
│  ├─ PrimaryNavigation
│  ├─ Context/Version
│  └─ EnvironmentStatus
└─ Main
   ├─ Topbar
   ├─ PhaseRoadmap
   ├─ KPIGrid
   ├─ MainGrid
   └─ SecondaryGrid
```

Navigazione primaria:

- Panoramica
- Maturità
- Ecosistema
- Fasi
- Evidenze
- Gate
- Roadmap
- Documentazione

## 9. Shell mobile

Struttura:

```
MobileAppShell
├─ CompactTopbar
├─ PageIntro
├─ StatusAndFilters
├─ ContentStack
└─ BottomNavigation
```

Navigazione inferiore iniziale:

- Panoramica
- Ecosistema
- Qualità
- Altro

Le destinazioni non presenti nella barra inferiore restano accessibili da `Altro`.

## 10. Componenti principali

### Navigazione

- `Nav/SidebarItem`
- `Nav/BottomItem`
- `Nav/SegmentedFilter`
- `Nav/ViewToggle`
- `Nav/Breadcrumb`

### Stato

- `Status/Badge`
- `Status/Indicator`
- `Status/DataFreshness`
- `Status/Gate`

Stati minimi:

- neutral
- info
- success
- warning
- danger
- pending

### Card

- `Card/KPI`
- `Card/SystemModule`
- `Card/Alert`
- `Card/Expansion`
- `Card/Policy`
- `Card/Evidence`

### Roadmap

- `Roadmap/Phase`
- `Roadmap/Connector`
- `Roadmap/CompactPhase`

Stati:

- completed
- near-complete
- active
- planned
- future
- blocked

### Maturità

Desktop:

- `Maturity/Matrix`
- `Maturity/Row`
- `Maturity/Cell`

Mobile:

- `Maturity/MobileRow`
- `Maturity/LevelBlocks`

### Ecosistema vivo

- `Ecosystem/Node`
- `Ecosystem/Relation`
- `Ecosystem/FlowItem`
- `Ecosystem/Legend`

Il grafo deve avere una rappresentazione alternativa accessibile in elenco.

### Evidenze

Desktop:

- `Evidence/Table`
- `Evidence/TableRow`

Mobile:

- `Evidence/List`
- `Evidence/ListItem`

### Help contestuale

- `Help/InfoTrigger`
- `Help/Tooltip`
- `Help/DetailPanel`

## 11. Varianti da modellare in Penpot

Per ogni componente interattivo:

- default;
- hover;
- focus;
- pressed;
- disabled;
- selected, se applicabile.

Per badge e stati:

- neutral;
- success;
- warning;
- danger;
- info;
- pending.

Per viewport:

- desktop;
- tablet;
- mobile.

## 12. Mapping desktop → mobile

| Desktop | Mobile |
| --- | --- |
| Sidebar | Bottom navigation + menu secondario |
| Roadmap orizzontale completa | Strip compatta / scrollabile |
| KPI in 4 colonne | Griglia 2 colonne o stack |
| Matrice maturità | Righe di stato |
| Grafo ecosistema | Diagramma semplificato + elenco |
| Tabella evidenze | Lista di schede |
| Colonna destra | Sezioni verticali |
| Policy 2×2 | Stack / griglia compatta |

Il mapping è semantico, non geometrico: l'obiettivo è conservare funzione e priorità, non posizione.

## 13. Contenuto della vista Panoramica

Ordine desktop:

1. header e stato dati;
2. filtri;
3. roadmap;
4. KPI;
5. maturità;
6. ecosistema vivo;
7. attenzione richiesta;
8. prossime espansioni;
9. evidenze recenti;
10. integrità e policy.

Ordine mobile:

1. app bar;
2. titolo;
3. stato dati;
4. filtri;
5. roadmap compatta;
6. KPI;
7. attenzione richiesta;
8. maturità;
9. ecosistema;
10. evidenze;
11. espansioni;
12. policy.

Gli alert critici salgono di priorità su mobile.

## 14. Regole di densità

- una card deve comunicare una sola unità informativa primaria;
- evitare testo descrittivo ripetuto quando il dato è autoesplicativo;
- le metriche non devono essere mostrate senza contesto temporale o fonte;
- stati e badge non devono duplicare il titolo;
- le viste tecniche devono essere espandibili, non sempre aperte.

## 15. Responsività

Vincoli obbligatori:

- nessun `min-width` applicativo che forzi il desktop su mobile;
- nessuna dipendenza da larghezza iniziale rilevata solo al bootstrap;
- layout guidato da CSS responsive e container reali;
- test a 320, 360, 390, 412, 768, 1024, 1280 e 1440 px;
- controllo automatico di overflow orizzontale;
- test dopo hydration/caricamento asincrono per intercettare regressioni di layout tardive.

## 16. Handoff Penpot → codice

Ogni componente Penpot destinato all'implementazione deve riportare:

- nome canonico;
- funzione;
- varianti;
- proprietà;
- token usati;
- comportamento responsive;
- stati interattivi;
- note di accessibilità;
- corrispondenza con il componente del codice, quando esiste.

Convenzione proposta:

`TRAMA/<Domain>/<Component>/<Variant>`

Esempio:

`TRAMA/Status/Badge/Warning`

## 17. Definizione di pronto

Una schermata Penpot è pronta per handoff quando:

- usa solo token e componenti condivisi salvo eccezioni motivate;
- desktop e mobile sono progettati esplicitamente;
- non presenta overflow non intenzionali;
- tutti gli stati interattivi necessari sono definiti;
- il significato non dipende solo dal colore;
- i contenuti dinamici hanno casi lunghi verificati;
- il focus è rappresentato;
- le annotazioni di comportamento sono presenti;
- esiste mapping verso requisiti o componenti implementativi.

## 18. Perimetro v0.1

Incluso:

- Panoramica desktop;
- Panoramica mobile;
- shell e navigazione;
- roadmap;
- KPI;
- maturità;
- ecosistema vivo;
- alert;
- espansioni;
- evidenze;
- policy;
- help contestuale.

Fuori perimetro, ma previsto:

- viste di dettaglio complete;
- prototipi animati;
- libreria di grafici avanzata;
- temi multipli;
- integrazione automatica Penpot ↔ codice.

## 19. Governance

Questa specifica:

- non modifica autorità di Arena, Atlas o Docente OS;
- non autorizza integrazioni automatiche;
- non modifica `DOS-A1 RUNTIME_DEFERRED`;
- non introduce dati personali;
- non autorizza tracking;
- non crea una nuova fonte autorevole di stato dell'ecosistema.

Penpot governa il **design della rappresentazione**, non l'autorità dei dati rappresentati.
