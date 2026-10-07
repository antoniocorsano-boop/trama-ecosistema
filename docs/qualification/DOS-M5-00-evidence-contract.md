# DOS-M5-00 — Docente OS L4 → L5 evidence contract

**Stato:** DRAFT / CONTRACT_DEFINITION  
**Data:** 7 ottobre 2026  
**Ambito:** Docente OS product maturity  
**Authority effect:** NONE  
**Production effect:** NONE  
**DOS-A1:** RUNTIME_DEFERRED

## 1. Scopo

Definire il contratto probatorio necessario per promuovere Docente OS da L4 a L5 nel modello di maturità TRAMA, senza introdurre nuove capability di prodotto, telemetria invasiva, tracking studente o autorizzazioni runtime aggiuntive.

DOS-M5-00 non promuove L5. Stabilisce soltanto quali evidenze sono ammissibili, come devono essere classificate, quali prove devono essere escluse e quali condizioni devono risultare vere prima che i dossier successivi possano produrre `REGRESSION_HISTORY` e `ADOPTION_EVIDENCE` canoniche.

## 2. Baseline canonica

Baseline TRAMA di partenza:

- repository: `antoniocorsano-boop/trama-ecosistema`;
- ref: `main`;
- exact head: `6c8b47c11c8f251aa66a03e4681245fd5dcc4fb4`;
- stato Docente OS: `confirmedLevel = 4`;
- next target: `5`;
- next required evidence types:
  - `REGRESSION_HISTORY`;
  - `ADOPTION_EVIDENCE`.

Baseline prodotto qualificata da DOS-M4-01:

- repository: `antoniocorsano-boop/docente-os-2026-27`;
- product head qualificato: `39bce05fa2e87f3746ee3b6dcd7433065cb2d876`;
- runtime canary: PASS;
- Human Exact-Head Review: PASS;
- L4 integrato in TRAMA;
- `DOS-A1 = RUNTIME_DEFERRED` invariato.

## 3. Rationale dell'audit L5

L'audit L4→L5 ha verificato che il residuo di maturità è principalmente probatorio, non funzionale.

La definizione canonica L5 per Docente OS aggiunge a L4 esattamente:

- `REGRESSION_HISTORY`;
- `ADOPTION_EVIDENCE`.

L'infrastruttura necessaria esiste già in larga parte:

- suite automatiche e browser gate governati;
- H1 e X3 rieseguibili e vincolabili alla Beta;
- precedenti regressioni reali già documentate;
- datastore Beta con dati persistiti delle superfici professionali;
- `teaching_sessions` immutabili come evidenza di attività docente registrata;
- `experience_feedback` già progettato come feedback contestuale del docente e non come raccolta di dati studente.

Osservazione read-only del datastore Beta effettuata durante l'audit, utile solo come fotografia iniziale e non come prova L5 automatica:

- `timetable_versions`: 12 record;
- `teaching_sessions`: 5 record;
- `knowledge_assets`: 219 record;
- `annual_plan_sections`: 17 record;
- `experience_feedback`: 0 record.

Questi conteggi dimostrano che il datastore non è vuoto, ma non sono sufficienti da soli a provare adozione perché alcuni record possono derivare da E2E, canary, pilot o test. Nessuna promozione L5 può essere derivata da quantità aggregate non classificate.

## 4. Principio generale di ammissibilità

Un'evidenza L5 è ammissibile solo se è:

1. **osservabile** — riferita a un evento o risultato concretamente verificabile;
2. **classificata** — la sua origine è distinguibile da test, canary e infrastruttura;
3. **bound** — collegata a prodotto/runtime/ref o periodo osservato sufficientemente determinato;
4. **riproducibile o verificabile** — esiste un percorso ragionevole per riesaminarla;
5. **privacy-safe** — non richiede tracking studente né raccolta di dati personali non necessari;
6. **non auto-promozionale** — la presenza di un record non produce automaticamente un livello di maturità.

Se l'origine non è determinabile con ragionevole certezza, l'evidenza è `INADMISSIBLE` per L5.

## 5. Classificazione obbligatoria degli eventi

Ogni evento o ricevuta usata nei dossier M5 deve essere classificata in una delle seguenti categorie.

### `HUMAN_REAL_USE`

Uso professionale reale del prodotto da parte di un docente autenticato, avvenuto per uno scopo operativo effettivo e non creato per far passare un test o una canary.

Può concorrere ad `ADOPTION_EVIDENCE`.

### `E2E_CANARY`

Uso prodotto da browser automation, credenziali tecniche, canary di qualificazione o test E2E, anche quando opera sul runtime e datastore reali.

Non può concorrere ad `ADOPTION_EVIDENCE`.
Può concorrere alla verifica tecnica e, se storicizzato correttamente, a `REGRESSION_HISTORY`.

### `TEST_HARNESS`

Evento o failure causato dalla strumentazione di test, selector, fixture, credenziale tecnica, configurazione o aspettativa del runner e non da una regressione del prodotto.

Può concorrere a `REGRESSION_HISTORY` solo se classificato esplicitamente come regressione dell'harness e se la remediation è verificata.

### `INFRASTRUCTURE`

Evento dovuto a deploy, cold-start, provider, runner, rete, coda, secret/configurazione o altra dipendenza infrastrutturale che impedisce o altera la prova senza costituire un difetto funzionale del prodotto.

Può concorrere alla storia operativa e diagnostica, ma non deve essere conteggiato come regressione prodotto.

## 6. Contratto `REGRESSION_HISTORY`

### 6.1 Obiettivo

Provare che la capacità L4 rimane stabile nel tempo e che regressioni reali, harness e infrastrutturali vengono distinte, diagnosticate e chiuse senza perdita del contratto di prodotto.

### 6.2 Baseline storica già disponibile

Il ledger M5 deve includere almeno i seguenti precedenti, senza reinterpretarli retroattivamente:

- PR Docente OS #688 — HR-01: regressione/difetto di prodotto reale sulla bottom navigation, corretta e ricertificata;
- PR #689 — regressione `TEST_HARNESS` rispetto al login AAL2 governato, senza difetto prodotto;
- PR #690 — regressione `TEST_HARNESS` rispetto alla rappresentazione mobile canonica del Piano annuale, senza difetto prodotto;
- DOS-M4-01 — runtime canary L4 PASS come checkpoint iniziale della baseline stabilizzata.

### 6.3 Checkpoint post-L4 minimi

La storia L5 deve contenere almeno **due checkpoint post-L4 distinti** oltre alla baseline M4.

I checkpoint devono rappresentare momenti operativi realmente separati. Non sono validi, da soli, più rerun consecutivi lanciati nella stessa sessione con l'unico scopo di aumentare il conteggio delle prove.

Un checkpoint è ammissibile se almeno una delle condizioni seguenti è vera:

- segue un periodo di uso professionale reale;
- segue una modifica compatibile integrata nel prodotto;
- segue un evento di regressione con diagnosi e remediation;
- è una ricertificazione periodica separata dalla precedente da un evento operativo significativo.

### 6.4 Classificazione delle regressioni

Ogni finding deve assumere uno dei valori:

- `PRODUCT_REGRESSION`;
- `TEST_HARNESS_REGRESSION`;
- `INFRASTRUCTURE_REGRESSION`;
- `NO_REGRESSION`.

Per ogni regressione non `NO_REGRESSION` il ledger deve registrare:

- data/periodo;
- superficie o gate coinvolto;
- exact head o runtime state quando applicabile;
- sintomo osservato;
- root cause classificata;
- remediation;
- evidenza di non ricorrenza o ricertificazione.

### 6.5 Criterio PASS per `REGRESSION_HISTORY`

`REGRESSION_HISTORY` può essere promossa come evidenza canonica solo quando:

- baseline M4 + almeno due checkpoint post-L4 sono documentati;
- nessuna regressione prodotto critica rimane aperta;
- regressioni harness e infrastructure non sono spacciate per difetti prodotto;
- i checkpoint sono bound a prove verificabili;
- la Human Review conclude che la storia dimostra stabilità e capacità di gestione delle regressioni, non mera ripetizione di test.

## 7. Contratto `ADOPTION_EVIDENCE`

### 7.1 Obiettivo

Provare uso reale, ripetuto e coerente di Docente OS nel lavoro docente, senza ricorrere a tracking studente, analytics comportamentali invasivi o conteggi non classificati.

### 7.2 Fonti ammissibili

Sono ammissibili, in forma read-only e minimizzata:

- `teaching_sessions` realmente registrate dal docente;
- versioni di orario realmente create/attivate nel lavoro operativo;
- knowledge/material assets creati o utilizzati in attività professionale reale;
- sezioni o artefatti di piano annuale effettivamente usati;
- `experience_feedback` volontario del docente;
- altre ricevute professionali già prodotte dal prodotto, purché non introducano tracking aggiuntivo e siano classificabili come `HUMAN_REAL_USE`.

### 7.3 Fonti non ammissibili

Non possono essere usati come adozione:

- canary DOS-M4;
- account o credenziali E2E;
- fixture o seed;
- test automatici;
- synthetic browser runs;
- conteggi aggregati privi di classificazione;
- access log generici non collegabili con certezza a uso professionale reale;
- dati studente o metriche derivate dal comportamento degli studenti.

### 7.4 Forma della receipt

La receipt di adozione deve contenere solo dati minimizzati e aggregati necessari, ad esempio:

- periodo osservato;
- baseline/deploy rilevante;
- numero di giorni distinti di uso reale;
- superfici professionali osservate;
- numero aggregato di azioni persistenti reali;
- eventuale feedback contestuale volontario;
- metodo usato per escludere `E2E_CANARY` e test;
- dichiarazione `studentTracking = none`;
- classificazione della confidenza.

Non deve contenere:

- nomi o identificativi di studenti;
- contenuti didattici personali non necessari alla prova;
- testo libero degli utenti salvo esplicita necessità di review;
- segreti, token o credenziali;
- identificatori tecnici non necessari alla verifica.

### 7.5 Soglia di adozione

DOS-M5-00 non introduce una soglia artificiale di numero utenti.

Per questa fase teacher-first, l'adozione è dimostrata da **uso reale ripetuto nel tempo**, non dal volume utenti. La receipt deve almeno mostrare uso `HUMAN_REAL_USE` su più momenti distinti e su almeno due superfici professionali significative oppure su un workflow professionale end-to-end ripetuto.

Se la distinzione real/synthetic non è affidabile sui record storici esistenti, tali record restano `INADMISSIBLE` e la prova deve essere costruita con nuovi eventi reali chiaramente attestati.

## 8. Privacy e minimizzazione

Vincoli obbligatori:

- nessun tracking studente;
- nessuna autenticazione studente introdotta per il dossier;
- nessuna nuova analytics pipeline necessaria;
- preferenza per query read-only e receipt aggregate;
- nessuna mutazione del datastore per produrre una prova;
- nessuna raccolta di PII aggiuntiva rispetto al funzionamento ordinario del prodotto;
- `experience_feedback` resta volontario e contestuale, non telemetria continua.

## 9. Sequenza dei dossier M5

### DOS-M5-00 — Evidence Contract

Definisce il presente contratto. Non produce L5.

### DOS-M5-01 — Regression History

Costruisce e verifica il ledger storico di regressione sulla baseline L4 e sui checkpoint post-L4.

Output atteso: una evidenza canonica `REGRESSION_HISTORY` se i criteri PASS risultano soddisfatti.

### DOS-M5-02 — Adoption Evidence

Produce una receipt read-only di adozione reale, con separazione `HUMAN_REAL_USE` / synthetic e minimizzazione privacy.

Output atteso: una evidenza canonica `ADOPTION_EVIDENCE` se i criteri PASS risultano soddisfatti.

### DOS-M5-03 — L5 Qualification

Solo dopo M5-01 PASS e M5-02 PASS:

- registra le due evidenze canoniche nel maturity registry;
- riconcilia lo snapshot;
- verifica deterministicamente `confirmedLevel = 5`;
- esegue Human Exact-Head Review;
- richiede decisione umana separata per qualsiasi merge.

## 10. Cose esplicitamente fuori scope

DOS-M5-00 non autorizza né richiede:

- promozione Production;
- modifica di `DOS-A1`;
- nuovo runtime adapter;
- tracking o analytics studente;
- riapertura PWA/installazione Android;
- nuove capability funzionali di Docente OS;
- modifica dei criteri L5 nel modello TRAMA per facilitare la promozione;
- inserimento anticipato di `REGRESSION_HISTORY` o `ADOPTION_EVIDENCE` nel registry.

## 11. Criterio di uscita DOS-M5-00

Il dossier può essere chiuso come `CONTRACT_APPROVED` solo quando una Human Review conferma che:

- i due evidence type L5 sono definiti in modo non ambiguo;
- real use e synthetic use sono separati;
- i checkpoint di regressione non possono essere soddisfatti con rerun artificiali consecutivi;
- le fonti di adozione sono privacy-safe e read-only;
- record di origine incerta restano `INADMISSIBLE`;
- non viene introdotta alcuna promozione automatica L5;
- Production, authority e `DOS-A1` restano invariati.

Fino a tale review, lo stato resta **DRAFT / CONTRACT_DEFINITION**.
