# R4-P1/P1 — Prototipo NO_RUNTIME dell'Officina materiali

Status: **PROTOTYPE / HUMAN REVIEW REQUIRED / NO_RUNTIME**

Base canonica: R4-P1 Governed Entry Contract integrato su `main` con merge commit `83f64cc7688ba89608cbaf55710f27ee6a705cff`.

## 1. Obiettivo dello slice

P1 rende verificabile il percorso professionale minimo dell'Officina materiali senza collegare motori reali, database, storage, API cross-product o pubblicazione runtime.

Il prototipo deve consentire di valutare il modello mentale del docente e la sequenza decisionale prima di autorizzare qualunque integrazione tecnica.

## 2. Scenario minimo

Il docente parte da una lezione già definita in Docente OS e apre l'Officina materiali.

Il prototipo rappresenta in sequenza:

1. **Contesto** — titolo della lezione, classe, disciplina, obiettivo/aggancio curricolare disponibile e brief modificabile.
2. **Cerca prima** — proposta di materiali Atlas pertinenti, chiaramente distinguibili da contenuti ancora da creare.
3. **Decisione** — tre azioni esplicite: `Riutilizza`, `Adatta`, `Crea nuova`.
4. **Lavorazione** — simulazione locale del risultato con lineage/provenance visibili quando applicabili.
5. **Anteprima** — il docente confronta il risultato con il brief e può modificare, sostituire, rigenerare simulatamente o scartare.
6. **Decisione docente** — `Collega alla lezione` è separato da `Proponi per la pubblicazione`.
7. **Feedback** — ogni azione significativa espone stato, esito e azione successiva disponibile.

### 2.1 Atlas senza risultati utili

La ricerca Atlas simulata non costituisce un vincolo all'azione del docente. Se non esistono risultati, oppure il docente considera i risultati non pertinenti o non adeguati:

- può rifiutarli senza creare collegamenti, bozze derivate o altri effetti collaterali;
- `Crea nuova` resta sempre disponibile;
- può modificare il brief e ripetere la ricerca simulata;
- nessuna assenza di risultati viene interpretata come autorizzazione automatica alla generazione.

## 3. Macchina degli stati del prototipo

Il modello P1 usa esclusivamente stato volatile o fixture locali:

`READY → SEARCHING → NEEDS_DECISION → WORKING → PREVIEW → NEEDS_CONFIRMATION → LINK_SIMULATED | PUBLICATION_PROPOSAL_SIMULATED | ERROR`

`LINK_SIMULATED` e `PUBLICATION_PROPOSAL_SIMULATED` sono esiti terminali distinti della singola decisione simulata. Nessuno dei due rappresenta una scrittura reale; il secondo espone inoltre `PUBLICATION_NOT_EXECUTED_NO_RUNTIME`.

Sono richiesti i percorsi di ritorno:

- `PREVIEW → WORKING` per modifica/rigenerazione simulata;
- `PREVIEW → NEEDS_DECISION` per sostituzione della strategia;
- `NEEDS_CONFIRMATION → PREVIEW` per annullamento della decisione;
- `ERROR → RECOVERY_TARGET` secondo la tabella seguente.

### 3.1 Semantica deterministica di errore e recupero

| Operazione fallita | Payload che deve restare disponibile | Recovery target |
| --- | --- | --- |
| ricerca simulata | contesto lezione + brief | `NEEDS_DECISION` con `Crea nuova` disponibile oppure nuova `SEARCHING` su scelta docente |
| lavorazione fixture | contesto + brief + strategia + sorgente/lineage applicabile + ultima bozza valida, se presente | `WORKING` per retry oppure `NEEDS_DECISION` per cambio strategia |
| preparazione anteprima | ultima bozza valida + lineage/provenance | `WORKING` |
| collegamento simulato | bozza + decisione non eseguita | `NEEDS_CONFIRMATION` |
| proposta di pubblicazione simulata | bozza + decisione editoriale non eseguita + publicationRequestId | `NEEDS_CONFIRMATION` |

Un errore non può cancellare una bozza valida né trasformare un'operazione non eseguita in un esito riuscito. Nessuno stato del prototipo rappresenta approvazione curricolare o pubblicazione effettiva.

## 4. Fixture minime e identità stabili

P1 deve usare dati fittizi e non personali sufficienti a verificare i tre percorsi. Gli identificativi sono stabili e deterministici nel reference set P1.

Ogni scenario espone almeno:

- `scenarioId` — identifica lo scenario di prova;
- `fixtureId` — identifica la fixture sorgente o di generazione;
- `workItemId` — identifica la bozza logica prodotta nel percorso;
- `requestId` — identifica una singola richiesta simulata al motore;
- `parentRequestId` — valorizzato per retry/cancellation lineage quando applicabile;
- `publicationRequestId` — identifica la singola decisione editoriale simulata di proposta alla pubblicazione.

Un retry può creare un nuovo `requestId`, ma deve mantenere lo stesso `workItemId` finché il docente non sceglie esplicitamente di sostituire/scartare il lavoro. Ripetere la stessa proposta di pubblicazione non crea una seconda decisione logica: conserva lo stesso `publicationRequestId`. L'annullamento registra l'esito `CANCELLED` e il relativo lineage senza produrre un nuovo materiale implicito.

### A. Riutilizza

Una risorsa Atlas simulata con:
- identità sorgente stabile;
- titolo e tipo;
- provenienza;
- licenza/condizione di riuso;
- riferimento curricolare dimostrativo.

### B. Adatta

Una risorsa Atlas simulata da trasformare, conservando:
- `sourceRef`;
- lineage;
- attribuzione/licenza;
- indicazione esplicita `DERIVED_DRAFT`.

### C. Crea nuova

Un artefatto simulato con nuova identità di lavoro e metadati che distinguono:
- brief sorgente;
- eventuali fonti/asset incorporati;
- stato `NEW_DRAFT`;
- assenza di qualunque implicazione editoriale automatica.

## 5. Boundary simulato del motore

Il prototipo può simulare una chiamata a un motore specialistico soltanto mediante fixture deterministiche. Il boundary concettuale deve rendere visibili:

- input tipizzato;
- output tipizzato;
- provenance;
- `requestId` e lineage di retry/annullamento;
- stato `SUCCESS | ERROR | CANCELLED | INCOMPLETE`;
- assenza di direct writes.

Non sono ammessi token, chiavi API, servizi esterni o chiamate di rete per produrre materiali in P1.

## 6. Decisioni e separazioni obbligatorie

Il prototipo deve rendere impossibile confondere:

- **generato** con **approvato**;
- **bozza** con **materiale collegato**;
- **collegato alla lezione** con **pubblicato**;
- **decisione editoriale** con **ricevuta tecnica**;
- **errore tecnico** con perdita del lavoro.

`Collega alla lezione` termina esclusivamente in `LINK_SIMULATED`.

`Proponi per la pubblicazione` termina esclusivamente in `PUBLICATION_PROPOSAL_SIMULATED` con receipt simulata `PUBLICATION_NOT_EXECUTED_NO_RUNTIME`.

Le due azioni non condividono un generico stato di completamento e non possono produrre reciprocamente effetti impliciti.

## 7. Feedback percepibile

Ogni azione significativa deve produrre feedback testuale e semanticamente esposto, non soltanto variazioni cromatiche o animazioni.

Devono essere verificabili almeno:

- avvio ricerca;
- nessun risultato o risultato rifiutato;
- scelta Riutilizza/Adatta/Crea nuova;
- lavorazione in corso;
- annullamento;
- errore recuperabile;
- bozza pronta;
- collegamento simulato;
- richiesta di pubblicazione simulata;
- esito terminale distinto dell'azione scelta.

## 8. Responsive e accessibilità

Il prototipo deve essere progettato e verificato almeno per smartphone e desktop. Sono requisiti di P1:

- nessun overflow orizzontale non intenzionale;
- ordine del focus coerente;
- uso completo da tastiera;
- nomi accessibili dei controlli;
- stati e messaggi annunciabili;
- ingrandimento/riflusso senza perdita delle azioni principali;
- target WCAG 2.2 AA.

## 9. Privacy e dati

P1 non introduce account studente, tracking, profilazione o dati personali dello studente. Le fixture devono essere anonime e non riconducibili a persone reali.

Eventuali preferenze locali del docente non fanno parte di questo slice salvo quanto strettamente necessario alla dimostrazione dell'interfaccia e comunque non vengono sincronizzate.

## 10. Non-obiettivi

P1 non implementa:

- motori generativi reali;
- ricerca Atlas reale;
- scritture in Docente OS;
- scritture o pubblicazione Atlas;
- persistenza database/storage;
- autenticazione;
- automazioni cross-product;
- DOS-A1;
- approvazione o modifica del curricolo Arena.

## 11. Matrice minima delle evidenze

L'implementazione del prototipo deve produrre evidenze ripetibili almeno secondo questa matrice. Una dichiarazione testuale priva della relativa prova non soddisfa il criterio.

| ID | Requisito | Scenario/prova minima | Evidenza attesa |
| --- | --- | --- | --- |
| E1 | tre percorsi | eseguire `Riutilizza`, `Adatta`, `Crea nuova` fino all'anteprima | test deterministici + cattura/stato finale per ciascun percorso |
| E2 | Atlas vuoto/non adatto | fixture `NO_RESULTS` e rifiuto manuale di una fixture proposta | `Crea nuova` disponibile; nessun work item derivato creato dal rifiuto |
| E3 | lineage | adattare una fixture e ripetere/annullare una lavorazione | sourceRef, workItemId, requestId/parentRequestId e licenza ispezionabili |
| E4 | recupero | forzare errore in ricerca, lavorazione e decisione finale | payload previsto conservato e recovery target conforme alla §3.1 |
| E5 | separazione decisioni | eseguire separatamente collegamento e proposta pubblicazione | `LINK_SIMULATED` distinto da `PUBLICATION_PROPOSAL_SIMULATED`; nessun effetto incrociato |
| E6 | feedback | percorrere stati normali, errore e annullamento | messaggi testuali/semantici osservabili per ogni azione decisiva |
| E7 | accessibilità | tastiera, focus, nomi accessibili, annunci stato, zoom/riflusso | checklist/test automatizzabile ove possibile + verifica umana prevista |
| E8 | smartphone/desktop | viewport mobile e desktop di riferimento | nessun overflow orizzontale non intenzionale; azioni principali raggiungibili |
| E9 | zero rete | eseguire l'intera suite P1 con intercettazione delle richieste | nessuna richiesta HTTP/HTTPS/WebSocket applicativa; eventuali asset di build devono essere locali |
| E10 | zero scritture runtime | eseguire tutti i percorsi con spy/adapters di write disabilitati | zero chiamate a DB/storage/API Atlas/Docente OS/Arena; nessun token/secret richiesto |
| E11 | idempotenza simulata | ripetere retry e proposta pubblicazione sullo stesso work item | workItemId stabile; retry lineage ispezionabile; publicationRequestId non duplicato |
| E12 | privacy | ispezionare fixture e storage browser dopo i percorsi | nessun dato personale studente, account, tracking o sincronizzazione introdotti |

## 12. Criteri di accettazione P1

P1 può passare a revisione umana soltanto se:

1. i tre percorsi `Riutilizza | Adatta | Crea nuova` sono percorribili end-to-end con fixture;
2. il docente mantiene controllo e reversibilità in ogni passaggio;
3. il percorso Atlas senza risultati o con risultati rifiutati lascia disponibile `Crea nuova` senza effetti collaterali;
4. lineage/provenance e identità stabili sono visibili nei casi applicabili;
5. errore e annullamento sono recuperabili secondo la semantica deterministica definita;
6. collegamento e pubblicazione sono chiaramente separati, soltanto simulati e con esiti terminali distinti;
7. feedback percepibile è presente per tutte le azioni decisive;
8. smartphone e desktop superano la verifica UX/accessibilità prevista;
9. le evidenze E1–E12 sono disponibili e coerenti con l'exact head sottoposto a review;
10. nessuna chiamata di rete o scrittura runtime viene introdotta;
11. retry e proposta di pubblicazione rispettano identità/idempotenza simulate;
12. `DOS-A1` resta `RUNTIME_DEFERRED`.

## 13. Gate di uscita

Esiti ammessi della revisione: `PASS`, `CHANGES REQUIRED`, `NOT EVALUABLE`.

Un PASS di P1 autorizza esclusivamente la chiusura del prototipo e la progettazione del successivo slice governato. **Non autorizza runtime, integrazioni reali o pubblicazione automatica.**
