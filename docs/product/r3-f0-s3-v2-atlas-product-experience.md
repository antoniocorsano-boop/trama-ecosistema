# R3-F0/S3-V2 — Atlas Product Experience Prototype

**Data:** 22 settembre 2026  
**Stato:** ACTIVE / F0-F2 INTEGRATED / NO_CROSS_PRODUCT_RUNTIME  
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

1. esplorare il **curricolo verticale di istituto** come rete di relazioni tra ordini di scuola, aree/dipartimenti, discipline, annualità, nuclei e obiettivi;
2. passare da istituto → area/dipartimento → disciplina → ordine di scuola → annualità → nucleo → obiettivo → prerequisiti/raccordi → risorse;
3. distinguere con chiarezza fonte Arena e contenuto Atlas;
4. passare tra rappresentazione visuale e struttura testuale equivalente;
5. trovare risorse e percorsi senza conoscere la struttura tecnica;
6. permettere allo studente di scegliere **classe → disciplina → lezione** e vedere i materiali didattici pubblicati per quella lezione;
7. mantenere esperienza coerente su desktop, tablet, mobile e LIM;
8. funzionare senza account o tracking individuale studente.

## 3. Superfici minime S3-V2

### A. Home

Scopo:
- ingresso pubblico;
- orientamento;
- accesso rapido a Esplora, Curricolo, Materiali, Risorse Atlas e Percorsi.

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
- navigazione del **curricolo verticale di istituto**, non di una singola disciplina.

Struttura:
- vista istituto;
- aree/dipartimenti;
- discipline;
- ordini di scuola;
- classi/annualità;
- albero/outline disciplinare;
- breadcrumb;
- nuclei;
- obiettivi;
- progressione verticale;
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

### E. Materiali

Scopo:
- accesso pubblico ai materiali didattici effettivamente pubblicati per le lezioni.

Percorso principale:
- classe;
- disciplina;
- lezioni in ordine;
- materiali pubblicati per ciascuna lezione.

Vincoli:
- nessun account studente;
- nessun profilo individuale;
- nessun tracking personale;
- la selezione classe/discipline definisce solo un contesto pubblico.

### F. Risorse Atlas

Scopo:
- esplorazione delle risorse Atlas come catalogo editoriale.

Struttura:
- filtri;
- ricerca;
- vista griglia/lista;
- tabella/dataset quando opportuno;
- preview;
- metadati accessibilità/licenza;
- stato editoriale;
- relazioni curricolari.

### G. Percorsi

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

### Materials
- ClassSelector
- DisciplineSelector
- LessonList
- LessonMaterialGroup
- PublishedMaterialItem

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
- materiali didattici pubblicati;
- organizzazione pubblica per classe, disciplina e lezione;
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

### S3-V2/F0 — Foundation · INTEGRATED
- app shell;
- routing;
- theme/tokens;
- component registry;
- Storybook o equivalente;
- test componenti;
- responsive shell.

### S3-V2/F1 — Curricolo + contesto pubblico materiali · INTEGRATED
- curricolo verticale di istituto;
- aree/dipartimenti;
- discipline;
- ordini di scuola;
- curriculum tree;
- annualità;
- breadcrumb;
- pagina nodo/obiettivo;
- provenance Arena;
- modello pubblico classe → disciplina → lezione → materiali, senza dati personali.

### S3-V2/F2 — Esplora · INTEGRATED
- canvas relazionale;
- filtri;
- semantic zoom;
- pannello contestuale;
- equivalente elenco.

### S3-V2/F3 — Materiali + Risorse · NEXT
- browser pubblico classe → disciplina → lezione;
- materiali pubblicati;
- resource catalog;
- filtri;
- preview;
- metadata;
- table/list/grid;
- integrazione del substrato asset Git-first definito da `ATLAS-MAT-PUB-01` per normalizzazione, manifest, deploy verificato e receipt tecnica;
- nessuna automazione editoriale implicita: la pubblicazione resta distinta dalla generazione e soggetta al controllo docente.

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

- [ ] le superfici A-G sono navigabili;
- [ ] Esplora appare e si comporta come un vero atlante, non come demo tecnica;
- [ ] Curricolo e Nodo/Obiettivo sono coerenti con S1/S2 e rappresentano il **curricolo verticale di istituto**, non una singola disciplina;
- [ ] Materiali consente il percorso pubblico classe → disciplina → lezione senza dati personali;
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
## 15. Stato implementativo corrente

Integrato in `Curriculum-Atlas`:

- **F0 Foundation** — merge `68ba12e06cddd781c28d38e8cd5eab24216ed9fb`;
- **F1 Curricolo verticale d’istituto + Materiali pubblici di base** — merge `ec0c2e0c89e7d1ac56c3cfb3b00ca66a3f51f869`;
- **F2 Esplora** — merge `973429968d480eeeaf31362a9c6da7f18fed50e3`.

F2 è stato validato sull’exact head `c8f0fc6967694391dbfe5510660f8d1007818b77` con Foundation, TRAMA Perceptible Write, F1 Visual Evidence e F2 Visual Evidence PASS. L’evidenza F2 comprende Mappa/Elenco su mobile e desktop, controllo overflow e layout mobile verticale dedicato.

**Prossimo slice: F3 Materiali + Risorse.**

Questa avanzamento non autorizza dati Arena live, pubblicazione Docente OS → Atlas, account studenti, tracking individuale, R3-P4 o DOS-A1.



## 16. Vision alignment 2026-09-23

La ricostruzione della vision TRAMA non modifica i confini S3-V2, ma precisa il target del prodotto.

Atlas deve mostrare non soltanto la struttura del curricolo, ma il modo in cui il curricolo diventa esperienza pubblica attraverso:
- lezioni;
- materiali;
- attività;
- percorsi.

ATLAS-PERCHÉ è assunto come reference implementation sperimentale del pattern **LearningActivity**, non come roadmap autonoma.

Per F3–F5 il target visuale e di interazione è definito in:
[Atlas Mockup V2 — Vision Alignment Specification](../design/atlas-mockup-v2-vision-alignment.md).

Questa estensione:
- non autorizza R3-P4;
- non introduce account studente;
- non introduce tracking individuale;
- non sposta authority da Arena;
- non include il workspace professionale Docente OS dentro Atlas.
