# TRAMA CC3 — Governed Forecast & Readiness Architecture v1

**Stato:** CC3-F0 ACTIVE / HUMAN REVIEW PENDING  
**Ambito:** TRAMA Control Center  
**Runtime:** READ_ONLY / ADVISORY_ONLY / NO_NEW_AUTHORITY

## 1. Obiettivo

CC3 estende il Control Center dopo la chiusura di CC2-F0–F6.

CC2 risponde a:

> che cosa sappiamo oggi, da quali fonti, con quali evidenze e gate?

CC3 deve rispondere a:

> quali transizioni sono possibili dopo, perché, quali prerequisiti le bloccano e che cosa invaliderebbe la previsione?

La previsione non decide ciò che deve accadere.

## 2. Principio di separazione

Forecast, scenario e receipt sono **proiezioni derivate**.

Non sono:

- capability state;
- maturity state;
- gate state;
- approval;
- authorization;
- runtime decision;
- roadmap canonica.

Lo stato canonico continua a vivere nelle fonti governate esistenti.

## 3. Source model

Il forecast usa come input almeno un Ecosystem Snapshot versionato.

La prima implementazione deve essere:

- snapshot-bound;
- source-bound;
- freshness-aware;
- deterministic-first;
- explainable;
- read-only.

L'eventuale uso futuro di modelli probabilistici richiede una decisione TRAMA separata.

## 4. Forecast record

Campi minimi:

- subjectRef;
- currentState;
- candidateTransition;
- blockingGateRefs;
- dependencyRefs;
- evidenceRefs;
- confidence;
- confidenceRationale;
- invalidators;
- scenarioRef;
- sourceSnapshotGeneratedAt.

Ogni forecast deve dichiarare esplicitamente:

- canonicalStateImpact = NONE;
- authorityImpact = NONE;
- runtimeAuthorizationImpact = NONE.

## 5. Confidence

Valori ammessi:

- LOW;
- MEDIUM;
- HIGH.

La confidence descrive la solidità della previsione rispetto alle evidenze disponibili.

Non è una probabilità.

Sono vietati:

- percentuali;
- probability;
- likelihood numerica;
- overall score;
- ranking automatico di priorità.

## 6. Invalidators

Ogni forecast deve indicare almeno un evento che lo renderebbe falso o non più applicabile.

Esempi:

- cambio exact head;
- gate FAIL;
- nuova decisione ADR;
- nuovo vincolo di authority;
- rework richiesto dalla review umana;
- source stale o partial.

## 7. Scenario

Gli scenari ammessi sono:

- BASE;
- CONSERVATIVE;
- EXPANSION;
- COUNTERFACTUAL.

Uno scenario simula conseguenze logiche senza mutare lo snapshot.

## 8. ForecastReceipt

Un ForecastReceipt collega un forecast a un evento reale successivo.

Outcome:

- CONFIRMED;
- PARTIAL;
- INVALIDATED;
- NOT_YET_OBSERVABLE.

Serve alla calibrazione storica.

Non promuove stati.

## 9. Sequenza governata CC3

### CC3-F0 — Forecast Contract & Guardrails

Definisce schema, policy, ADR, validazione e confine stato/previsione.

### CC3-F1 — Next Transition Engine

Deriva deterministicamente le transizioni possibili dal grafo corrente di gate e dipendenze.

### CC3-F2 — Scenario Explorer

Valuta scenari controfattuali senza mutare lo stato reale.

### CC3-F3 — Bottleneck & Dependency Forecast

Individua gate e dipendenze che bloccano più transizioni, senza trasformarli in priorità automatiche.

### CC3-F4 — Adoption Readiness Forecast

Valuta prerequisiti verso R5 soltanto quando le evidenze sono sufficienti; nessuna percentuale di readiness non calibrata.

### CC3-F5 — Forecast Calibration & Backtesting

Confronta forecast e risultati osservati tramite ForecastReceipt e decide se esistono basi sufficienti per una futura metrica quantitativa.

## 10. Invarianti

- Control Center READ_ONLY;
- NO_SYNTHETIC_AUTHORITY;
- NO_AUTO_PROMOTION;
- NO_RUNTIME_AUTHORIZATION;
- NO_CROSS_PRODUCT_WRITE;
- DOS-A1 resta RUNTIME_DEFERRED;
- Docente OS → Atlas resta NOT_AUTHORIZED fino a gate dedicato;
- nessun forecast può essere usato dal maturity engine come stato canonico;
- nessun forecast può cambiare roadmap o gate.

## 11. Criterio di uscita F0

CC3-F0 può chiudersi solo quando:

- ADR-016 è reviewata;
- schema forecast è valido;
- policy forecast è valida;
- fixture valide/invalidanti sono testate;
- il Control Center mostra CC3-F0 come capability separata;
- GATE-CC3-F0-HUMAN riceve HUMAN exact-head review.
