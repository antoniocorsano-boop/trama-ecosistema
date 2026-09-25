# CC3-F0 — Forecast Contract & Guardrails

**Stato:** ACTIVE / HUMAN REVIEW PENDING  
**Authority:** TRAMA governance only  
**Runtime:** NO_RUNTIME

## Deliverable

CC3-F0 introduce esclusivamente il contratto della previsione governata.

Non produce ancora forecast operativi di progetto.

## Artefatti

- TRAMA-ADR-016;
- `config/governed-forecast-policy.json`;
- `schemas/governed-forecast.schema.json`;
- validatore del contratto;
- fixture positive e negative;
- gate CI dedicato;
- capability `CC3-F0` nello stato strutturato;
- gate `GATE-CC3-F0-HUMAN`.

## Guardrail obbligatori

Un oggetto forecast non può contenere campi canonici o decisionali come:

- `state`;
- `runtimeState`;
- `approved`;
- `authorized`;
- `probability`;
- `score`;
- `overallScore`.

Le sole espressioni di impatto ammesse sono:

- `canonicalStateImpact = NONE`;
- `authorityImpact = NONE`;
- `runtimeAuthorizationImpact = NONE`.

## Confidence

Solo LOW / MEDIUM / HIGH.

Qualunque metrica numerica richiede:

1. ForecastReceipt storici;
2. backtesting;
3. valutazione di calibrazione;
4. nuova decisione TRAMA.

## Definition of Done

- tutti i test del contratto PASS;
- nessuna regressione CC2;
- snapshot corrente coerente;
- GATE-CC3-F0-HUMAN aperto;
- review tecnica indipendente PASS;
- HUMAN EXACT-HEAD REVIEW prima del merge.
