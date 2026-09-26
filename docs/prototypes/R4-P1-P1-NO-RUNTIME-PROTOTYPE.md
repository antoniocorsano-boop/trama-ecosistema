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

## 3. Macchina degli stati del prototipo

Il modello P1 usa esclusivamente stato volatile o fixture locali:

`READY → SEARCHING → NEEDS_DECISION → WORKING → PREVIEW → NEEDS_CONFIRMATION → COMPLETED | ERROR`

Sono richiesti anche i percorsi di ritorno:

- `PREVIEW → WORKING` per modifica/rigenerazione simulata;
- `PREVIEW → NEEDS_DECISION` per sostituzione della strategia;
- `ERROR → stato precedente recuperabile` per nuovo tentativo;
- `NEEDS_CONFIRMATION → PREVIEW` per annullamento della decisione.

Nessuno stato del prototipo rappresenta approvazione curricolare o pubblicazione effettiva.

## 4. Fixture minime

P1 deve usare dati fittizi e non personali sufficienti a verificare i tre percorsi:

### A. Riutilizza

Una risorsa Atlas simulata con:
- identità sorgente;
- titolo e tipo;
- provenienza;
- licenza/condizione di riuso;
- riferimento curricolare dimostrativo.

### B. Adatta

Una risorsa Atlas simulata da trasformare, conservando:
- sourceRef;
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

`Proponi per la pubblicazione` termina in P1 con una schermata/receipt simulata `PUBLICATION_NOT_EXECUTED_NO_RUNTIME`.

## 7. Feedback percepibile

Ogni azione significativa deve produrre feedback testuale e semanticamente esposto, non soltanto variazioni cromatiche o animazioni.

Devono essere verificabili almeno:

- avvio ricerca;
- nessun risultato;
- scelta Riutilizza/Adatta/Crea nuova;
- lavorazione in corso;
- annullamento;
- errore recuperabile;
- bozza pronta;
- collegamento simulato;
- richiesta di pubblicazione simulata;
- completamento.

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

## 11. Criteri di accettazione P1

P1 può passare a revisione umana soltanto se:

1. i tre percorsi `Riutilizza | Adatta | Crea nuova` sono percorribili end-to-end con fixture;
2. il docente mantiene controllo e reversibilità in ogni passaggio;
3. lineage/provenance sono visibili nei casi di riuso/adattamento;
4. errore e annullamento sono recuperabili senza perdita della bozza disponibile;
5. collegamento e pubblicazione sono chiaramente separati e soltanto simulati;
6. feedback percepibile è presente per tutte le azioni decisive;
7. smartphone e desktop superano la verifica UX/accessibilità prevista;
8. nessuna chiamata di rete o scrittura runtime viene introdotta;
9. `DOS-A1` resta `RUNTIME_DEFERRED`.

## 12. Gate di uscita

Esiti ammessi della revisione: `PASS`, `CHANGES REQUIRED`, `NOT EVALUABLE`.

Un PASS di P1 autorizza esclusivamente la chiusura del prototipo e la progettazione del successivo slice governato. **Non autorizza runtime, integrazioni reali o pubblicazione automatica.**
