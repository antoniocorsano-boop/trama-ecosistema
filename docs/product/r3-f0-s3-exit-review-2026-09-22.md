# R3-F0/S3 — Exit review consolidata

**Data:** 22 settembre 2026  
**Stato:** READY_FOR_FINAL_HUMAN_ASSISTIVE_REVIEW / NO_RUNTIME  
**Parent:** R3-F0/S3 — EXIT_GATES_PENDING  
**Artifact browser:** `r3-f0-s3-v1-rendering` — artifact id `10676260188`  
**Run browser di riferimento:** `35683224857`  
**Exact head browser evidence:** `8c3af92dfdf5841522d2072c7f0496e8d4d83f17`

## 1. Scopo

Ridurre i gate residui di R3-F0/S3 a una sola exit review conclusiva, evitando di ripetere test già coperti da evidenza automatica.

Questa review non autorizza runtime Atlas, non attiva R3-P2/R3-P5 e non modifica i confini Arena / Atlas / Docente OS.

## 2. Evidenze già disponibili

### Contratto statico

Già PASS:

- singolo h1;
- skip link;
- ancore interne valide;
- nessun id duplicato;
- nessuna dipendenza esterna;
- mappa visuale con elenco equivalente;
- details/summary provenance;
- tab Lezioni ↔ Obiettivi con ruoli ARIA;
- focus-visible;
- target principali >=44 px;
- media query mobile;
- media query grande schermo;
- reduced motion;
- nessuna dipendenza da hover;
- stati CurricularStatus / EditorialStatus / UIFeedbackStatus distinti.

### Contrasto campione

Già PASS sui token documentati:

- text-primary 14.68:1;
- text-secondary 7.58:1;
- action-primary 6.70:1;
- focus-ring 5.93:1;
- authority-arena 11.42:1;
- domain-atlas 5.47:1;
- editorial-withdrawn 9.37:1;
- ui-error 8.31:1.

### Browser evidence

Già PASS:

- Android-like 390×844;
- desktop 1440×1100;
- LIM / grande schermo 1920×1080;
- DOM renderizzato;
- marker critici;
- screenshot artifact.

## 3. Ispezione visuale indipendente delle evidenze browser

L'artifact browser è stato riesaminato direttamente sui tre screenshot prodotti dal workflow.

### Android-like 390×844

**Esito indipendente: VISUAL_PASS_WITH_SCOPE_LIMIT**

Osservato:

- singola colonna;
- header e navigazione senza sovrapposizioni visibili;
- titolo principale leggibile;
- testo introduttivo leggibile;
- callout fonte curricolare chiaro;
- nessun overflow orizzontale evidente nella porzione catturata;
- nessuna informazione essenziale affidata al solo colore nella porzione visibile.

Limite:

- lo screenshot non sostituisce il walkthrough completo della pagina né la prova reale touch/reflow.

### Desktop 1440×1100

**Esito indipendente: VISUAL_PASS**

Osservato:

- gerarchia leggibile;
- contenuto principale dominante;
- nessun dashboard/card overload;
- provenance presente ma non invasiva;
- progressione annuale leggibile;
- nessuna sovrapposizione evidente;
- spaziatura ampia ma coerente con la natura esplorativa del prototipo.

### LIM / 1920×1080

**Esito indipendente: VISUAL_PARTIAL**

Osservato:

- titolo principale molto leggibile;
- struttura generale pulita;
- contenuto principale ben separato.

Da verificare dal vivo:

- leggibilità a distanza della navigazione superiore;
- leggibilità a distanza di metadata e testo secondario;
- adeguatezza della densità informativa in aula.

Per questo la prova LIM resta umana e non viene promossa a PASS sulla sola base dello screenshot.

## 4. Exit review finale — unica checklist residua

La review finale deve eseguire soltanto i controlli che non sono già dimostrati automaticamente.

### A. Mobile / reflow

- [ ] nessun overflow orizzontale a 320 CSS px;
- [ ] zoom browser/reflow senza perdita di informazione essenziale;
- [ ] details/provenance utilizzabili;
- [ ] Visuale | Elenco sempre raggiungibile;
- [ ] nessun hover necessario.

### B. Tastiera

- [ ] skip link raggiungibile come primo elemento utile;
- [ ] ordine focus coerente;
- [ ] details/summary utilizzabile;
- [ ] tabs Lezioni ↔ Obiettivi utilizzabili;
- [ ] focus sempre visibile;
- [ ] focus non coperto;
- [ ] tutte le azioni raggiungibili senza mouse.

### C. Screen reader reale

- [ ] un solo h1;
- [ ] gerarchia heading comprensibile;
- [ ] navigazioni nominate;
- [ ] breadcrumb comprensibile;
- [ ] annualità corrente percepibile;
- [ ] provenance details/summary comprensibile;
- [ ] liste curricolari lette correttamente;
- [ ] mappa visuale esclusa dall'albero accessibile;
- [ ] elenco equivalente disponibile;
- [ ] stati persistenti non annunciati come live;
- [ ] feedback UI transitorio annunciato solo quando pertinente.

### D. Non-text contrast / uso del colore

- [ ] focus ring chiaramente distinguibile;
- [ ] bordi/indicatori necessari distinguibili;
- [ ] scala di grigi: CurricularStatus / EditorialStatus / UIFeedbackStatus restano distinguibili;
- [ ] nessun significato dipende esclusivamente dal colore.

### E. LIM reale

- [ ] titolo leggibile a distanza;
- [ ] testo secondario leggibile;
- [ ] metadata leggibili;
- [ ] densità adeguata;
- [ ] Visuale | Elenco comprensibili;
- [ ] nessun tooltip necessario.

## 5. Regola di esito

S3 può passare a candidato `CLOSED_VERIFIED` solo se:

- tutte le voci A-E sono PASS;
- nessun blocker di comprensibilità resta aperto;
- review terza PASS;
- HUMAN EXACT-HEAD REVIEW PASS sulla PR di chiusura.

Qualunque PARTIAL mantiene S3 ACTIVE.

## 6. Cosa non va ripetuto

Non vanno ripetuti, salvo regressioni:

- test statici già PASS;
- browser rendering 390×844 / 1440×1100 / 1920×1080;
- contrasto dei token campione;
- verifica di assenza dipendenze esterne;
- verifica del fallback elenco della mappa;
- verifica del target size dichiarato nel prototipo.

## 7. Passo successivo dopo S3

Solo dopo la chiusura verificata di S3:

1. R3-P2 — Curriculum pubblico;
2. R3-P5 — Smart Navigation.

R3-P4 resta successivo e non autorizzato al runtime.

DOS-A1 resta `RUNTIME_DEFERRED`.
