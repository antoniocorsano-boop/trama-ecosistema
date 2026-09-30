# OR-05 — TRAMA Ecosystem Component Reuse

**Stato:** PASS DOCUMENTALE / IMPLEMENTATION-READY  
**Data:** 2026-09-30  
**Baseline TRAMA:** `6711f3012efa69ffc0ca2f3fcf5c049c8195d2bd`  
**Riferimenti:** TRAMA-COMPONENT-STRATEGY-01 · TRAMA-ADR-019  
**Runtime impact:** NONE  
**DOS-A1:** `RUNTIME_DEFERRED`

## 1. Obiettivo

Applicare la Component Strategy all'intero ecosistema senza introdurre una nuova libreria globale, senza riscritture e senza confondere riuso semantico con uniformità visiva.

OR-05 parte dagli inventari INV-01/02/03 e dal Component Evidence Registry esistenti; non li ricostruisce.

## 2. Baseline live osservata

| Prodotto | Ref osservato | Stack / supply chain rilevante |
|---|---|---|
| Arena | `main@a89553c0a3daa71555b6a9ec3a07c3edbf19a176` | React 18.3.1, Vite 6, Tailwind 3.4, Storybook 10; nessuna primitive library general-purpose |
| Atlas | `main@0105d4f497bea6e476d1b0c40bd472585068f269` | Next 15.5, React 19.1, Tailwind 4, Radix Slot, XYFlow |
| Docente OS | `develop@1d8c4ee7c1209f624b412db1b11e666c2de25aaa` | Next 16.3, React 19.2, Tailwind 4.3, Radix Dialog, cmdk, assistant-ui |
| Control Center | TRAMA stacked baseline | React/Vite modular app; no new primitive dependency required da OR-05 |

## 3. Decisione OR-05

**Non viene adottata una UI library comune di ecosistema.**

Il riuso avviene su tre livelli:

1. **semantic contracts condivisi** — stato, feedback, evidence/provenance, authority;
2. **behavioral primitive riusati per prodotto** — usando prima la supply chain già presente;
3. **distinctive/product-local components** — preservati quando codificano semantica specifica.

## 4. Matrice di riuso

### 4.1 Arena

#### `ARENA.DIALOG_CONFIRM.GOVERNED`
- stato: **KEEP / QUALIFIED PRODUCT-LOCAL**;
- implementazione: native `<dialog>` + gestione focus;
- decisione: **non introdurre Radix/Base UI solo per sostituirlo**;
- azione successiva: eliminare gradualmente il legacy duplicato solo tramite slice dedicate con evidence parity.

#### `ARENA.TABS.GOVERNED`
- stato: **KEEP / QUALIFIED PRODUCT-LOCAL**;
- implementazione: ARIA tablist product-owned;
- decisione: nessuna nuova dependency;
- azione successiva: sostituire call site legacy, non riscrivere il componente qualificato.

#### Tooltip/disclosure
- native-first;
- nuova primitive library ammessa solo se un caso reale dimostra limiti di focus/positioning/accessibilità.

**Esito Arena:** reuse-by-consolidation, non reuse-by-new-library.

### 4.2 Atlas

#### `ATLAS.RELATION_EXPLORER.FAMILY`
- stato: **KEEP SPECIALIST / XYFLOW**;
- XYFlow è giustificato dalla semantica di graph exploration;
- non generalizzare XYFlow verso Arena, Docente OS o Control Center.

#### `ATLAS.CURRICULUM_TREE.DISCLOSURE`
- stato: **KEEP NATIVE-FIRST**;
- nessuna ragione per una primitive library aggiuntiva.

#### Radix
- footprint attuale limitato a `@radix-ui/react-slot`;
- non equivale a una decisione di adottare l'intera famiglia;
- per un futuro interaction primitive complesso: valutare Radix prima di Base UI, senza mix equivalente non motivato.

**Esito Atlas:** preserve specialist + native; zero nuova supply-chain OR-05.

### 4.3 Docente OS

#### Existing supply chain
- `@radix-ui/react-dialog`;
- `cmdk`;
- `@assistant-ui/react`.

Questa supply chain è già presente e deve essere valutata **prima** di creare nuovi dialog/command patterns custom.

#### `DOCENTE_OS.APPSHELL.FAMILY`
- stato: **KEEP PRODUCT-LOCAL**;
- non va trasformato in shell comune TRAMA.

#### `DOCENTE_OS.TIMETABLE.INTERACTIVE_CELLS`
- stato: **KEEP PRODUCT-LOCAL**;
- la griglia e le celle codificano workflow docente specifico.

#### Timetable context/editor dialogs
Nel file corrente sono implementati come overlay custom con `role="dialog"`, mentre Radix Dialog è già dipendenza del prodotto.

Classificazione:
- **REUSE CANDIDATE R1**;
- obiettivo futuro: valutare una sostituzione bounded dei soli mechanics dialog con la primitive già presente;
- mantenere markup, copy, semantic actions e visual identity Docente OS;
- nessuna nuova dependency;
- richiede regression/accessibility/e2e evidence prima della promozione.

#### `DOCENTE_OS.ALERT.STATUS`
- candidato a mapping più esplicito su `TRAMA.STATUS_MESSAGE`;
- condividere il contratto semantico, non necessariamente il componente React.

**Esito Docente OS:** massimo potenziale di riduzione manutentiva usando dipendenze già presenti.

### 4.4 Control Center

- OR-04 runtime observation è una composizione informativa, non richiede primitive esterne;
- Context Help ha già evidence nel Component Registry;
- nessun Web Awesome/Base UI/Radix viene aggiunto da OR-05;
- eventuale nuovo interactive primitive deve passare dal bisogno reale e dalla dependency policy del modular app.

**Esito Control Center:** no dependency churn.

## 5. Semantiche realmente condivisibili

### SHARE AS CONTRACT
- `TRAMA.STATUS_MESSAGE`;
- evidence/provenance presentation semantics;
- authority/source identity;
- loading/pending/progress semantics;
- error/recovery semantics;
- review/decide/confirm semantics.

### SHARE AS BEHAVIORAL GUIDANCE
- dialog focus/escape/return-focus;
- tabs keyboard semantics;
- responsive disclosure;
- status announcement/accessibility.

### DO NOT SHARE AS GLOBAL COMPONENT
- Arena confirm dialog;
- Atlas RelationExplorer;
- Atlas CurriculumTree;
- Docente OS AppShell;
- Docente OS Timetable;
- Control Center RuntimeObservation panel.

## 6. Maintenance benefit

La strategia riduce manutenzione in modo diverso per prodotto:

- **Arena:** rimuovere duplicazioni legacy senza cambiare stack;
- **Atlas:** evitare una seconda primitive family e preservare il componente specialistico già adeguato;
- **Docente OS:** riusare Radix Dialog già installato per evitare due implementation mechanics concorrenti;
- **Control Center:** evitare dependency growth non necessario.

Il beneficio comune è che i contratti semantici possono evolvere senza imporre un unico runtime UI.

## 7. User benefit

Il riuso è giudicato valido solo se produce:
- interazioni più prevedibili;
- focus/tastiera coerenti;
- meno differenze accidentali tra superfici;
- nessuna perdita dell'identità di prodotto;
- nessun aumento della complessità percepita.

Per il docente, il risultato atteso non è “componenti uguali”, ma comportamenti affidabili tra Arena/Atlas/Docente OS quando le azioni hanno la stessa semantica.

## 8. First implementation candidates

### OR-05-I1 — Docente OS dialog mechanics reuse
**Candidate più forte.**

Perimetro:
- solo Timetable context/editor overlays;
- riuso di Radix Dialog già installato;
- nessuna modifica ai domain actions;
- nessuna nuova dependency;
- preservare UI/copy;
- regression e accessibility required.

### OR-05-I2 — Arena legacy call-site consolidation
- migrare call site dal legacy confirm/tabs ai governed components;
- no dependency change;
- no visual redesign;
- evidence parity.

### OR-05-I3 — Atlas no-op preservation + evidence
- nessuna migrazione componenti;
- mantenere XYFlow RelationExplorer e native disclosure;
- aggiornare evidence solo quando cambia l'implementazione.

## 9. Explicit REJECT / DEFER

### REJECT
- global component library;
- global shadcn visual system;
- React runtime unification;
- XYFlow outside graph needs;
- migration “for consistency” without user/maintenance evidence.

### DEFER
- Base UI comparative spike: solo quando emerge un nuovo complex interaction non già coperto;
- Web Awesome: solo per standards-first surfaces con bisogno reale;
- shared code package for UI components: nessuna evidenza sufficiente oggi;
- cross-repo design-token package: separato da OR-05 e richiede lifecycle/versioning decision.

## 10. Closure

**OR-05: PASS documentale / implementation-ready.**

Non resta backlog analitico implicito.

La prima implementazione consigliata è OR-05-I1 in Docente OS, ma deve essere una PR product-local separata e verificata. OR-06 può essere progettato in parallelo solo come cross-ecosystem read-only proof e non deve dipendere dalla migrazione UI.

