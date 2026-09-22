# R3-F0/S3-V2 — Atlas Product Experience Prototype

**Data:** 22 settembre 2026  
**Stato:** PROPOSED / PRODUCT_IMPLEMENTATION_PLAN / NO_CROSS_PRODUCT_RUNTIME  
**Parent:** R3-F0/S3  
**Supersede:** S3-V1 come prototipo di prodotto; S3-V1 resta harness tecnico/accessibilità  
**Prodotto:** Atlas

## 1. Decisione

S3-V1 non rappresenta in modo sufficiente Atlas come prodotto.

Resta valido per:
- semantica;
- accessibilità di base;
- separazione degli stati;
- provenienza;
- fallback testuale;
- test browser.

S3-V2 deve invece dimostrare Atlas come **atlante integrale del curricolo**, navigabile e riconoscibile come prodotto autonomo dell'ecosistema TRAMA.

## 2. Target di prodotto

Atlas deve consentire di:

1. esplorare il curricolo come rete di relazioni;
2. passare da annualità → nucleo → obiettivo → prerequisiti/raccordi → risorse;
3. distinguere con chiarezza fonte Arena e contenuto Atlas;
4. passare tra rappresentazione visuale e struttura testuale equivalente;
5. trovare risorse e percorsi senza conoscere la struttura tecnica;
6. mantenere esperienza coerente su desktop, tablet, mobile e LIM;
7. funzionare senza account o tracking individuale studente.

## 3. Superfici minime S3-V2

### A. Home

Scopo:
- ingresso pubblico;
- orientamento;
- accesso rapido a Esplora, Curricolo, Risorse, Percorsi e Lezioni.

Componenti:
- App Shell;
- ricerca globale;
- card editoriali limitate;
- contenuti in evidenza;
- navigazione mobile inferiore.

### B. Esplora

Scopo:
- mappa relazionale del curricolo.

Struttura:
- canvas relazionale;
- filtri semantici;
- controllo Mappa | Elenco;
- pannello contestuale destro su desktop;
- bottom sheet / drawer su mobile;
- semantic zoom;
- relazioni con tipologie chiaramente distinguibili;
- elenco equivalente accessibile.

### C. Curricolo

Scopo:
- navigazione gerarchica e progressione.

Struttura:
- albero/outline disciplinare;
- breadcrumb;
- annualità;
- nuclei;
- obiettivi;
- progressione;
- provenienza Arena;
- raccordi e prerequisiti.

### D. Nodo / Obiettivo

Scopo:
- pagina di dettaglio curricolare.

Struttura:
- titolo e posizione;
- stato/provenienza;
- descrizione;
- traguardi/conoscenze/abilità quando presenti nella fonte;
- risorse correlate;
- lezioni correlate;
- prerequisiti;
- raccordi;
- tab accessibili.

### E. Risorse

Scopo:
- esplorazione delle risorse Atlas.

Struttura:
- filtri;
- ricerca;
- vista griglia/lista;
- tabella/dataset quando opportuno;
- preview;
- metadati accessibilità/licenza;
- stato editoriale;
- relazioni curricolari.

### F. Percorsi

Scopo:
- rappresentare sequenze didattiche collegate al curricolo.

Forma:
- timeline/percorso;
- tappe;
- obiettivi collegati;
- risorse;
- raccordi.

## 4. Regole di interazione

- nessuna card come grammatica universale;
- relazione → forma visuale appropriata;
- provenienza progressiva, non invasiva;
- URL navigabile e condivisibile per ogni nodo significativo;
- selezione e focus distinti;
- mobile non replica il desktop in miniatura;
- mappa visuale mai unica modalità;
- nessuna azione Atlas implica adozione docente;
- nessuna azione implica approvazione curricolare.

## 5. Layout system

### Desktop

- sidebar primaria 240–280 px;
- top command/search bar;
- area contenuto fluida;
- pannello contestuale opzionale 320–380 px;
- max content width per pagine editoriali;
- canvas Esplora full-width.

### Tablet

- sidebar collapsible;
- pannello contestuale come drawer;
- split view quando disponibile.

### Mobile

- header compatto;
- bottom navigation;
- filtri in sheet;
- dettagli in drawer/bottom sheet;
- tab e segmented controls scrollabili;
- nessuna tabella desktop obbligatoria;
- card e list item adattivi.

### LIM

- densità ridotta;
- tipografia ingrandita;
- controlli principali ≥44 px;
- modalità presentazione;
- niente tooltip come unico accesso.

## 6. Architettura dei componenti

### Shell
- AppShell
- SidebarNav
- MobileBottomNav
- CommandSearch
- Breadcrumbs
- ContextPanel
- PageHeader

### Navigation
- CurriculumTree
- YearSwitcher
- SegmentedView
- Tabs
- Disclosure
- FilterBar
- FacetSheet

### Curriculum primitives
- CurriculumNode
- ObjectiveRow
- ProgressionRail
- RelationEdge
- RelationLegend
- ProvenanceBadge
- ProvenancePanel
- CurriculumStatus
- EditorialStatus
- UIFeedback

### Explore
- RelationCanvas
- MapNode
- MapEdge
- MiniMap
- ZoomControls
- MapToolbar
- SelectionPanel
- EquivalentOutline

### Resources
- ResourceCard
- ResourceListItem
- ResourcePreview
- ResourceTable
- LicenseBadge
- AccessibilityBadge
- EditorialMeta

### Feedback
- InlineStatus
- EmptyState
- LoadingSkeleton
- ErrorState
- ConfirmDialog
- Toast solo per feedback non critico

## 7. Dati e confini

### Arena
Fornisce:
- struttura curricolare;
- versioni;
- stato curricolare;
- provenienza.

Atlas non modifica tali dati.

### Atlas
Gestisce:
- risorse;
- pagine;
- percorsi;
- stato editoriale;
- relazioni editoriali.

### Docente OS
Resta esterno a S3-V2.

Le azioni professionali del docente non sono implementate nel frontend Atlas S3-V2.

## 8. Stato applicativo

Preferenze:
- server state separato da UI state;
- URL come fonte per filtri/nodo selezionato quando utile;
- query cache;
- stato locale minimo;
- nessun global store finché non giustificato.

## 9. Ricerca

S3-V2 deve includere Command Search:

- ricerca per disciplina;
- annualità;
- nucleo;
- obiettivo;
- risorsa;
- raccordo;
- percorso.

La ricerca deve distinguere chiaramente:
- risultati Arena;
- risultati Atlas.

## 10. Accessibilità

Target: WCAG 2.2 AA.

Obbligatori:
- tastiera completa;
- focus visibile/non oscurato;
- screen reader;
- reflow;
- contrasto testuale/non testuale;
- reduced motion;
- target size;
- fallback elenco per canvas relazionale;
- nessuna semantica dipendente solo dal colore.

## 11. Performance

Budget iniziale:
- route pubbliche principali rapide su rete mobile;
- progressive loading del canvas;
- virtualizzazione solo se necessaria;
- immagini responsive;
- lazy load di viste pesanti;
- niente framework o dipendenze duplicate;
- nessun grafo enorme renderizzato integralmente quando non necessario.

## 12. Slice di implementazione

### S3-V2/F0 — Foundation
- app shell;
- routing;
- theme/tokens;
- component registry;
- Storybook o equivalente;
- test componenti;
- responsive shell.

### S3-V2/F1 — Curricolo
- curriculum tree;
- annualità;
- breadcrumb;
- pagina nodo/obiettivo;
- provenance Arena.

### S3-V2/F2 — Esplora
- canvas relazionale;
- filtri;
- semantic zoom;
- pannello contestuale;
- equivalente elenco.

### S3-V2/F3 — Risorse
- resource catalog;
- filtri;
- preview;
- metadata;
- table/list/grid.

### S3-V2/F4 — Mobile + LIM
- bottom navigation;
- sheets/drawers;
- touch targets;
- presentation mode;
- responsive acceptance.

### S3-V2/F5 — Exit
- visual review;
- keyboard;
- screen reader;
- reflow;
- non-text contrast;
- performance;
- third-party review;
- human exact-head review.

## 13. Exit criteria

S3-V2 può chiudere S3 soltanto se:

- [ ] le superfici A-F sono navigabili;
- [ ] Esplora appare e si comporta come un vero atlante, non come demo tecnica;
- [ ] Curricolo e Nodo/Obiettivo sono coerenti con S1/S2;
- [ ] mobile è progettato specificamente;
- [ ] Arena/Atlas sono distinguibili;
- [ ] mappa ed elenco sono equivalenti;
- [ ] WCAG 2.2 AA sui percorsi critici;
- [ ] performance entro budget;
- [ ] nessun blocker visuale/usabilità;
- [ ] review terza PASS;
- [ ] HUMAN EXACT-HEAD REVIEW PASS.

## 14. Non obiettivi

S3-V2 non autorizza:
- R3-P4 runtime Docente OS → Atlas;
- account studente;
- tracking individuale;
- DOS-A1;
- automazione di adozione;
- scrittura su Arena.
