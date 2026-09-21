# TRAMA-SA-01/R3 — Authorization record

Stato: **AUTHORIZED_FOR_EXPERIMENT / PROVIDER_RUN_NOT_YET_EXECUTED**

Autorizzazione umana: 21 settembre 2026.

## Ambito autorizzato

È autorizzata esclusivamente la fase sperimentale R3 definita in `r3-validation-plan.md`:

- corpus sintetico preregistrato da 48 casi;
- 32 casi development/calibration;
- 16 casi holdout bloccati;
- 12 casi per ciascuna etichetta;
- nessun dato personale;
- nessuna scrittura runtime;
- output advisory-only;
- review umana obbligatoria dopo il run.

## Non autorizzato

L'autorizzazione R3 non:

- promuove `TRAMA-ADR-009`;
- autorizza TypeSafe nei prodotti;
- autorizza pubblicazione o modifica automatica;
- autorizza tuning sull'holdout;
- autorizza `DOS-A1`.

Stato invariato: `TRAMA-ADR-009 = PROPOSED`; `DOS-A1 = RUNTIME_DEFERRED`.
