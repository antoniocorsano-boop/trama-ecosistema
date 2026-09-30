# TRAMA Open-Source Reuse Assessment v1 — Anywhere Labs

**Stato:** BASELINE DI ANALISI / NON VINCOLANTE  
**Data:** 2026-09-30  
**Perimetro:** TRAMA Control Center · Harness Pilot · Docente OS · Component Strategy  
**Vincolo:** nessuna nuova autorità di scrittura; nessuna promozione automatica; **DOS-A1 resta RUNTIME_DEFERRED**.

## 1. Scopo

Consolidare l'analisi di riuso relativa ai progetti pubblici di Anywhere Labs e trasformarla in un piano operativo breve, incrementale e verificabile. L'obiettivo è **riusare il massimo del lavoro già maturo** evitando:
- riscritture non necessarie;
- fork dell'upstream;
- sessioni di sviluppo troppo ampie;
- dipendenze architetturali premature;
- commistione tra osservazione, controllo e autorità.

Il criterio generale è: **adottare o adattare contratti e componenti prima di costruire equivalenti interni**.

## 2. Sorgenti osservate e baseline

### DSH Desktop
- repository: `anywhere-labs/dsh-desktop`
- branch osservato: `master`
- exact head: `85b79816c6ac0ae07df51d138da67d7c7baf7167`
- licenza radice verificata: MIT
- aree rilevanti:
  - `docs/architecture.en.md`
  - `docs/plugin-development.en.md`
  - `dsh-plugin-desktop/`
  - servizi pubblici `desktopProfiles` e `desktopPnpm`
  - lifecycle per generazioni
  - gestione sottoprocessi e recovery
  - composizione Cordis/plugin senza modifica dell'upstream

### Agents Anywhere
- repository: `anywhere-labs/Agents-Anywhere`
- branch osservato: `main`
- exact head: `ea27e0b45701c59ba93695617d901433ba8f68b0`
- metadato GitHub licenza radice: **non dichiarato / null**
- conseguenza: **nessun riuso diretto di codice finché non viene verificata la licenza per il percorso specifico**
- aree rilevanti:
  - `contracts/protocol`
  - `contracts/runtime-control`
  - `contracts/local-machine`
  - `contracts/dsh-bridge`
  - `connector/`
  - `server/`
  - `web-next/`

## 3. Risultato architetturale principale — CORRETTO ECOSYSTEM-FIRST

La catena runtime definita da OR-01/OR-04 resta valida, ma NON è il centro dell'ecosistema.

Il modello di riferimento è:

```text
                         TRAMA
                 governance / contratti
                         |
          +--------------+--------------+
          |              |              |
        ARENA          ATLAS        DOCENTE OS
     authority        public /        teacher-first
    curriculum       navigation
          |              |              |
          +--------------+--------------+
                         |
                capability services
                         |
        Project Knowledge / Connector / Runtime
                         |
                  DSH / Codex / altri
```

La catena tecnica:
`Control Center -> Local Connector -> Runtime Adapter -> RuntimeGeneration -> provider`
è infrastruttura subordinata.

Riferimento normativo: `TRAMA-ADR-019`.

Conseguenze:
- Arena, Atlas e Docente OS determinano bisogni e workflow;
- il Control Center osserva, non orchestra authority;
- Harness/DSH/Codex sono adapter/provider sostituibili;
- nessun proof runtime-only dimostra da solo valore di ecosistema;
- DOS-A1 resta RUNTIME_DEFERRED.

## 4. Matrice ADOPT / ADAPT / REFERENCE / REJECT

| Area | Fonte | Classe iniziale | Motivo |
|---|---|---|---|
| Lifecycle a generazioni | DSH Desktop | **ADAPT** | modello robusto per eliminare stato residuo tra run |
| Gestione profili | DSH Desktop | **ADAPT** | utile per profili TRAMA/test/prod senza inferenze implicite |
| Subprocess ownership | DSH Desktop | **ADAPT** | cancellazione, output, exit code, signal e teardown espliciti |
| Recovery receipts / recovery mode | DSH Desktop | **ADAPT** | utile per operazioni mutative future, ma soggetto a authority |
| Plugin composition Cordis | DSH Desktop | **ADOPT/ADAPT** | priorità alla composizione senza fork dell'upstream |
| Electron shell | DSH Desktop | **REFERENCE** | utile come contenitore locale, non dipendenza generale dell'ecosistema |
| Runtime-control contracts | Agents Anywhere | **REFERENCE -> ADAPT** | candidato forte; prima serve license/path audit |
| Local connector | Agents Anywhere | **REFERENCE -> ADAPT** | modello adatto al confine macchina locale/runtime |
| DSH bridge | Agents Anywhere | **REFERENCE -> ADAPT** | possibile ponte per DSH; non importare prima del license audit |
| Server completo | Agents Anywhere | **REFERENCE** | utile per concorrenza, timeline, websocket e distribuzione; non da importare integralmente |
| Frontend component stack | Agents Anywhere | **REFERENCE/ADOPT per dipendenze upstream** | riusare direttamente librerie originarie, non necessariamente il loro wrapper |
| Account/cloud/mobile product | Agents Anywhere | **REJECT per TRAMA core** | non necessario al perimetro attuale |
| Auto-approval / runtime authority | qualsiasi | **REJECT** | incompatibile con governance e Human Review |

## 5. Strategia di riuso massimo

### Regola R1 — upstream-first
Quando il progetto usa una libreria matura (Radix UI, Base UI, shadcn, cmdk, xterm, CodeMirror, Monaco, Mermaid, ecc.), TRAMA deve preferire la **dipendenza upstream originale** rispetto alla copia di wrapper specifici di Agents Anywhere.

### Regola R2 — contract-before-code
Per runtime, connector, session lifecycle e subprocess:
1. estrarre il contratto concettuale;
2. confrontarlo con i contratti TRAMA;
3. creare un adapter sottile;
4. importare codice solo se riduce realmente complessità e licenza/provenance sono chiare.

### Regola R3 — no fork by default
Nessun fork di DSH Desktop, Agents Anywhere o DSH core come percorso standard. Le estensioni devono passare da plugin, adapter o contratto.

### Regola R4 — bounded slices
Ogni ciclo di lavoro deve:
- avere **un solo obiettivo tecnico**;
- modificare il minor numero possibile di file;
- produrre un'evidenza verificabile;
- chiudersi con PASS / FAIL / DEFER;
- non aprire automaticamente il ciclo successivo.

### Regola R5 — no authority drift
Il riuso non modifica:
- Arena come autorità curricolare;
- Atlas come superficie pubblica;
- Docente OS come superficie teacher-first;
- Control Center come osservatorio/governance;
- Human Review;
- `DOS-A1 = RUNTIME_DEFERRED`.

## 6. Piano operativo smart

### OR-00 — License & provenance gate — **PASS CON RISERVA DI PERIMETRO**
**Obiettivo:** stabilire cosa può essere riusato legalmente e con quale obbligo di attribuzione.

Output:
- licenza per repository/percorso;
- eventuali file con licenze diverse;
- dipendenze vendorizzate;
- obblighi NOTICE/attribution;
- lista CODE_REUSE_ALLOWED / REFERENCE_ONLY.

**Exit:** nessuna riga di codice importata prima di questo gate.

### OR-01 — DSH lifecycle extraction — **PASS documentale**
**Obiettivo:** estrarre da DSH Desktop il minimo modello utile per Harness.

Esaminare:
- generation lifecycle;
- idempotent release;
- subprocess tree ownership;
- cancellation;
- profile switching;
- recovery semantics.

Output completato:
- `docs/contracts/trama-runtime-generation-contract-v0.md`;
- mapping DSH Desktop -> Harness Pilot;
- gap list G1–G7;
- qualification gates per una futura implementazione.

Esito: il pattern di generazione, ownership, `release()` idempotente, process-tree settlement, profile identity canonica e pending/last-known-good è riusabile senza importare Electron. Recovery mutativa resta contract-ready ma runtime-disabled.

**Preferenza confermata:** adattare concetti e API; evitare Electron.

### OR-02 — Local connector contract — **PASS documentale**
**Obiettivo:** definire il confine locale tra TRAMA e runtime.

Input di riferimento:
- Agents Anywhere `contracts/local-machine`;
- `contracts/runtime-control`;
- `connector/`.

Output completato:
- `docs/contracts/trama-local-connector-contract-v0.md`;
- API trasporto-indipendente;
- discovery e observation read-only;
- identità separate `runtimeType` / `runtimeId`;
- capability state con `supported` / `available` / `authorized`;
- health ed evidence normalizzati;
- failure isolation;
- freshness/stale semantics;
- explicit mutation boundary;
- registro DEFER esplicito.

**Vincolo confermato:** nessun runtime attivato.

### OR-03 — Runtime adapter contract — **PASS documentale**
**Obiettivo:** trasformare il Harness Pilot in candidato adapter, non piattaforma centrale.

Output completato:
- `docs/contracts/trama-runtime-adapter-contract-v0.md`;
- descriptor e identity adapter;
- mapping Harness Pilot -> adapter;
- capability model;
- profile/generation/run identity separate;
- health checks;
- evidence envelope;
- cancellation semantics;
- unsupported operations esplicite;
- qualification states e gate;
- chiusura gap G1–G7 a livello contrattuale;
- registro DEFER senza backlog implicito.

Prima implementazione candidata: DSH adapter. Codex resta seconda verifica di portabilità.

### OR-04 — Control Center observation integration — **IMPLEMENTED / VERIFYING**
**Obiettivo:** consentire al Control Center di rappresentare connector/runtime come **osservazioni**, senza comando operativo.

Output implementato nella vista `Operazioni` della app modulare:
- runtime availability;
- adapter/version;
- health;
- capability declaration `supported / available / authorized`;
- evidence refs;
- stato adapter `DEFERRED`;
- source esplicita `contract-mock`;
- nessun controllo operativo.

File principali:
- `apps/control-center/src/domain/runtimeObservation/model.ts`;
- `apps/control-center/src/domain/runtimeObservation/model.test.ts`;
- `apps/control-center/src/features/operations/OperationsPage.tsx`;
- `apps/control-center/src/features/operations/operations.css`.

La fixture è deliberatamente contract-compliant e non viene presentata come runtime live. `DOS-A1` resta `RUNTIME_DEFERRED`. Nessun pulsante operativo è introdotto.

### OR-05 — Ecosystem component reuse — **PASS documentale / implementation-ready**
**Obiettivo:** ridurre componenti custom usando primitive mature e una strategia coerente attraverso Arena, Atlas, Docente OS e Control Center, senza uniformare forzatamente i prodotti.

Priorità:
1. primitive accessibili comuni (Dialog/Popover/Tooltip/Tabs);
2. pattern di feedback/stato/provenance;
3. command/search dove pertinente;
4. resizable/data viewers solo nei prodotti che ne hanno bisogno;
5. diagrammi/stato con semantica coerente.

**Principio:** upstream originale + design token/pattern TRAMA + identità di prodotto preservata.

Output:
- `docs/analysis/trama-or-05-ecosystem-component-reuse-2026-09-30.md`;
- `governance/ui-development/trama-ecosystem-component-reuse-or05.json`.

Decisione: nessuna UI library globale. Existing-supply-chain-first. Arena consolida i componenti governed già qualificati; Atlas preserva XYFlow/native; Docente OS riusa prima Radix/cmdk già presenti; Control Center non aggiunge primitive per OR-05. Primo candidato implementativo: `OR-05-I1` sui dialog mechanics del Timetable Docente OS, senza nuova dependency.

### OR-06 — Cross-ecosystem read-only proof — **PASS documentale / implementation-ready**
**Obiettivo:** una sola prova end-to-end non mutativa che attraversi un workflow reale dell'ecosistema.

```text
Arena authority context
   -> Atlas and/or Docente OS governed context
   -> shared capability / Runtime Adapter
   -> read-only result/evidence
   -> Docente OS or Atlas presentation
   -> Control Center observation
```

Il proof deve dimostrare che:
- Arena resta authority;
- Atlas resta superficie pubblica/navigazione quando coinvolto;
- Docente OS resta teacher-first e decision owner;
- Control Center resta READ_ONLY;
- il provider runtime è sostituibile.

Nessuna autenticazione remota, installazione plugin o mutazione runtime in questo step.

Proof selezionato: **Preparazione della prossima lezione**.

Output:
- `docs/contracts/trama-cross-ecosystem-readonly-proof-v0.md`;
- `governance/runtime/trama-cross-ecosystem-readonly-proof-v1.json`.

Catena:
`Arena curriculum authority -> Docente OS preparation context -> Atlas optional resource read -> lesson.preparation.observe -> Runtime Adapter read-only -> Evidence Envelope -> Docente OS proposal + Control Center observation`.

Next slice: **OR-06-P1 — deterministic cross-ecosystem read-only fixture + validator**. Nessuna connessione live ai prodotti richiesta.

## 7. Sequenza consigliata

Ordine vincolante per ridurre spreco:

`OR-00 -> OR-01 -> OR-02 -> OR-03 -> OR-04 -> OR-05 -> OR-06 -> OR-07 -> OR-08 -> OR-09 -> OR-10`

OR-05 può avanzare in parallelo solo dove non altera authority o flussi di prodotto.

Dopo OR-06:
- **OR-07 — Shared capability layer**;
- **OR-08 — Runtime portability**;
- **OR-09 — Qualified execution**, soggetta a nuova authority decision;
- **OR-10 — Product integrations** Arena/Atlas/Docente OS orientate ai workflow utente.

## 8. Decisioni da non prendere ancora

Restano deliberatamente aperte:
- Electron sì/no come prodotto TRAMA;
- protocollo di trasporto definitivo del connector;
- server centrale dedicato;
- controllo remoto;
- supporto mobile runtime;
- mutazioni/approvazioni runtime;
- selezione definitiva DSH vs Codex vs multi-runtime.

Queste decisioni richiedono evidenza successiva e Human Review.

## 9. Criteri di promozione da REFERENCE ad ADAPT/ADOPT

Un elemento può essere promosso solo se:
1. licenza e provenance sono verificate;
2. il confine di authority resta invariato;
3. esiste un vantaggio misurabile rispetto a implementazione interna;
4. non introduce fork obbligatorio;
5. esistono test o evidenze sufficienti;
6. la dipendenza ha una superficie stabile;
7. l'integrazione è reversibile;
8. Human Review approva le scelte irreversibili.

## 10. Criterio di consolidamento

Questo documento è la baseline dell'analisi, non una decisione architetturale finale.

Le sole decisioni che matureranno devono essere promosse in ADR dedicate; lo stato operativo deve essere riflesso nel Control Center/Project Knowledge secondo il modello dual-speed già adottato.

## 11. OR-00 — Esito License & provenance gate

### 11.1 DSH Desktop

**Esito:** `CODE_REUSE_ALLOWED` per il codice originale del repository e del package `dsh-plugin-desktop`, con obbligo di conservare copyright e testo MIT nelle copie o porzioni sostanziali.

Evidenze verificate sull'exact head `85b79816c6ac0ae07df51d138da67d7c7baf7167`:
- `LICENSE` radice: MIT, copyright 2026 Anywhere Labs;
- `dsh-plugin-desktop/LICENSE`: MIT;
- `dsh-plugin-desktop/package.json`: `license: MIT`;
- `dsh-plugin-desktop/THIRD_PARTY_NOTICES.md`: inventario delle dipendenze redistribuite;
- `dsh-plugin-desktop/scripts/verify-licenses.mjs`: gate automatico sulle licenze di produzione, con allowlist per MIT, Apache-2.0, BSD, ISC, MPL-2.0 e altre licenze redistribuibili e gestione separata delle licenze con obbligo di notice;
- `.gitmodules`: `deepseek-harness` è un submodule esterno e non va considerato automaticamente coperto dalla licenza del repository Desktop.

**Regola operativa:** riuso diretto ammesso soltanto per file appartenenti al perimetro DSH Desktop verificato; submodule, cartelle `vendor`, pacchetti vendorizzati e asset terzi richiedono verifica propria. Dove possibile, preferire dipendenze upstream anziché copia di codice vendorizzato.

### 11.2 Agents Anywhere

**Esito generale:** `REFERENCE_ONLY` per `contracts/`, `connector/`, `server/` e `web-next/` sull'exact head `ea27e0b45701c59ba93695617d901433ba8f68b0`, perché non è stata individuata una licenza radice applicabile né dichiarazioni di licenza nei manifest principali di connector, server o web.

**Eccezione verificata:** `dsh-bridge/` è `CODE_REUSE_ALLOWED` sotto MIT:
- `dsh-bridge/LICENSE`: MIT, copyright 2026 Agents Anywhere Contributors;
- `dsh-bridge/package.json`: `license: MIT`.

**Cautela ulteriore:** il processo `prepack` di `dsh-bridge` copia contenuti da `../connector` in `bundled-connector`. Poiché `connector/` non ha una licenza applicabile individuata, un artefatto impacchettato che includa quel contenuto non deve essere assunto integralmente MIT senza ulteriore chiarimento. Il riuso sicuro riguarda il codice sorgente specificamente coperto dal perimetro `dsh-bridge/`, non automaticamente il connector inglobato durante il packaging.

### 11.3 Classificazione aggiornata

| Percorso | Stato OR-00 | Uso TRAMA consentito |
|---|---|---|
| `dsh-desktop` codice originale | **CODE_REUSE_ALLOWED / MIT** | ADOPT o ADAPT con attribution |
| `dsh-plugin-desktop` | **CODE_REUSE_ALLOWED / MIT** | candidato prioritario per OR-01 |
| `dsh-desktop/deepseek-harness` submodule | **SEPARATE_LICENSE_CHECK** | non copiare per inferenza |
| `dsh-desktop/vendor/**` | **SEPARATE_LICENSE_CHECK** | preferire upstream / verificare singolo artefatto |
| `Agents-Anywhere/dsh-bridge/**` | **CODE_REUSE_ALLOWED / MIT** | ADAPT possibile, escluso bundled connector non verificato |
| `Agents-Anywhere/contracts/**` | **REFERENCE_ONLY** | reimplementare concetti, non copiare testo/codice |
| `Agents-Anywhere/connector/**` | **REFERENCE_ONLY** | riferimento architetturale |
| `Agents-Anywhere/server/**` | **REFERENCE_ONLY** | riferimento architetturale |
| `Agents-Anywhere/web-next/**` | **REFERENCE_ONLY** | usare librerie upstream, non wrapper/copied source |

### 11.4 Conseguenza progettuale

OR-00 sblocca **OR-01** senza necessità di altre verifiche generali: il candidato di riuso diretto è DSH Desktop. Agents Anywhere resta una fonte di pattern e contratti concettuali, salvo `dsh-bridge/`, che può essere analizzato come sorgente MIT separata.

## 12. Stato OR-01

**PASS documentale.** Creato `docs/contracts/trama-runtime-generation-contract-v0.md`.

Invarianti consolidate:
- una generazione possiede tutte le risorse che crea;
- nessun handle operativo sopravvive alla generazione;
- `release()` è unico e idempotente anche su startup parziale;
- cancel e release sono semanticamente distinti;
- il processo è settled solo alla chiusura dell'intero process tree;
- discovery profili/capability è read-only;
- cambio profilo/modalità implica nuova generazione;
- observation non crea authority;
- recovery mutativa resta disabilitata nel perimetro corrente.

## 13. Stato OR-02

**PASS documentale.** Creato `docs/contracts/trama-local-connector-contract-v0.md`.

Decisioni consolidate:
- separazione immutabile tra tipo runtime e istanza;
- discovery read-only;
- capability dichiarative separate dall'authority;
- stato live distinto da persisted/stale;
- health non promuove maturità;
- errori isolati per richiesta/provider;
- ownership locale senza segreti nei record condivisi;
- trasporto non ancora scelto;
- tutte le mutazioni restano non autorizzate.

DEFER espliciti e non bloccanti: trasporto, autenticazione/pairing, formato machine-state concreto, controllo remoto multi-host, mutation API. Nessun backlog analitico implicito resta aperto per OR-02.

## 14. Stato OR-03

**PASS documentale.** Creato `docs/contracts/trama-runtime-adapter-contract-v0.md`.

Il livello di astrazione runtime è ora completo:
1. `RuntimeGeneration`;
2. `Local Connector`;
3. `Runtime Adapter`.

Il Pilot viene riclassificato come candidato adapter e non come piattaforma centrale. Sono fissati single-shot, `maxRetries=0`, snapshot read-only, consumption marker, zero-network qualification, runtime/model identity esplicita, evidence envelope, no auto-approval e unsupported operations negative-testable.

DEFER espliciti: implementazione concreta DSH, adapter Codex di portabilità, gestione credenziali, retry > 0, recovery mutativo, validazione KPI su misura reale. Nessun backlog analitico implicito resta aperto per OR-03.

## 15. Stato OR-04

**IMPLEMENTED / VERIFYING.**

Scelta di integrazione: nessuna nuova route. La proiezione runtime vive in **Operazioni**, accanto allo stato governato già esistente.

Vincoli verificabili introdotti:
- fixture marcata `contract-mock`;
- adapter state `DEFERRED`;
- availability e health non falsificate come live;
- mutation capability `authorized=false`;
- nessun comando operativo;
- evidence refs ai tre contratti OR-01/02/03;
- test di dominio che impedisce authorization mutativa accidentale;
- layout responsive nella stessa superficie Operazioni.

Backlog OR-04: **nessun tema analitico implicito**. L'unico passo residuo è la verifica CI/build/browser della modifica corrente.

## 16. Primo prossimo passo

Dopo PASS dei gate, **OR-05 — UI component reuse** può procedere come inventario/adozione mirata dei primitive maturi già identificati, senza duplicare la Component Strategy esistente. OR-06 resta il proof end-to-end read-only successivo.


## 17. Stato OR-07

**PASS documentale / implementation-ready.**

Creati:
- `docs/contracts/trama-shared-capability-layer-contract-v0.md`;
- `governance/runtime/trama-shared-capability-layer-v1.json`.

Decisioni consolidate:
- il Shared Capability Layer è infrastruttura subordinata e non un nuovo prodotto;
- capability identity provider-neutral;
- caller e decision owner espliciti;
- separazione tra semantica, adapter, provider e runtime;
- capability state separate: `supported / available / authorized / qualified`;
- OR-07 v0 ammette soltanto `READ_ONLY` e `PROPOSE_ONLY`;
- provenance, freshness ed evidence refs obbligatorie per risultati governati;
- failure isolation e stale honesty;
- Arena authority, Atlas role, Docente OS teacher-first e Control Center READ_ONLY invariati;
- nessun dato personale studente nel contratto base;
- `DOS-A1 = RUNTIME_DEFERRED`.

Prima capability di riferimento: `lesson.preparation.observe`, già usata nel proof OR-06.

Next slice: **OR-07-P1 — deterministic provider-neutral fixture + validator**, interamente offline e con almeno due fake adapter per provare la sostituibilità del provider.
