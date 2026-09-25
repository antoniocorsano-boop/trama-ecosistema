# TRAMA-ADR-016 — Forecast governato separato dallo stato canonico

**Stato:** PROPOSED  
**Data:** 2026-09-25  
**Ambito:** TRAMA Control Center · Arena · Atlas · Docente OS

## Decisione

Il Control Center può produrre **forecast governati** su possibili transizioni future esclusivamente come proiezioni derivate, advisory e source-bound.

Un forecast:

- non è stato canonico;
- non modifica `STATUS.md`, `ROADMAP.md`, capability, gate o maturity;
- non promuove una capability;
- non chiude o apre un gate;
- non autorizza runtime;
- non autorizza pubblicazione, adozione o write cross-product;
- non modifica le authority Arena, Atlas o Docente OS;
- non può attivare DOS-A1.

## Confine semantico

Lo stato canonico continua a derivare dalle fonti governate esistenti.

Il forecast deve usare un contratto separato e deve essere identificabile come previsione in ogni rappresentazione, API, file o UI.

È vietato riusare campi canonici come `state`, `runtimeState`, `approved`, `authorized` o equivalenti all'interno di un oggetto forecast.

## Confidence

La prima versione usa soltanto:

- `LOW`;
- `MEDIUM`;
- `HIGH`.

Probabilità numeriche, percentuali o score previsionali sono vietati finché non esiste una base di calibrazione sufficiente e una successiva decisione TRAMA li autorizza esplicitamente.

Ogni confidence richiede una rationale verificabile e almeno un invalidator.

## Scenario

Uno scenario è controfattuale e read-only.

Può rispondere a domande del tipo:

> Se il gate X passasse, quali transizioni diventerebbero eleggibili?

Lo scenario non modifica lo snapshot reale e non produce effetti.

## ForecastReceipt

Ogni forecast può essere confrontato con un evento reale successivo mediante un `ForecastReceipt`.

Il receipt serve alla calibrazione e può registrare:

- confermato;
- parzialmente confermato;
- invalidato;
- non ancora osservabile.

Un ForecastReceipt non promuove stati e non sostituisce una review umana.

## Human control

Impatto sul controllo umano: **STRENGTHENED**.

La previsione serve a rendere visibili prerequisiti, colli di bottiglia e invalidatori prima di prendere decisioni, non a prendere decisioni al posto delle authority esistenti.
