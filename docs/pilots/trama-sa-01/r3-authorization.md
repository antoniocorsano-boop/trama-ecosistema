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


## Corpus canonico dopo consolidamento

Prima del primo run provider R3, il corpus è stato consolidato per rispettare il piano R3 completo.

Corpus canonico:
- versione: `3.1.0`;
- file: `r3-cases.json`;
- 48 casi;
- 32 development;
- 16 holdout locked;
- 12 casi per etichetta;
- quattro domini: Tecnologia, Scienze, Matematica, Educazione civica;
- 24 coppie di parafrasi;
- nessun dato personale.

Il corpus precedente era monodisciplinare. È stato sostituito **prima di qualsiasi run R3**, quindi nessun risultato provider ha influenzato la nuova preregistrazione.

Policy sperimentali preregistrate:
- baseline evidence routing `0.5`;
- review band `0.4–0.6`;
- alignment confidence floor `0.65`.

Le policy non sono modificabili dal workflow e non hanno valore autorizzativo.
