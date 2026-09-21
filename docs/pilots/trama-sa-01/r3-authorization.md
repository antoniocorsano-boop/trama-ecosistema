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


## Corpus canonico e gate DEVELOPMENT

Prima del primo run provider, R3 è stato consolidato sul corpus `3.1.0`:

- 48 casi;
- 32 DEVELOPMENT;
- 16 HOLDOUT locked;
- 12 casi per etichetta;
- quattro domini: Tecnologia, Scienze, Matematica, Educazione civica;
- 24 coppie di parafrasi;
- nessun dato personale.

Il corpus precedente era monodisciplinare ed è stato sostituito **prima di qualsiasi run R3**.

L'autorizzazione corrente abilita soltanto DEVELOPMENT. L'HOLDOUT:
- non è presente nel workflow corrente;
- è bloccato dalla CLI senza `TRAMA_R3_HOLDOUT_AUTHORIZED=true`;
- richiede una decisione umana separata dopo la review DEVELOPMENT.

Policy preregistrate:
- baseline `0.5`;
- review band `0.4–0.6`;
- alignment confidence floor `0.65`.

Le policy hanno valore esclusivamente sperimentale e advisory.


## Run monodisciplinari esclusi

Prima del consolidamento canonico 3.1.0 erano stati avviati due run DEVELOPMENT sul corpus R3 monodisciplinare:

- run `35648847753`: **FAILURE**;
- run `35649286123`: **SUCCESS**.

Entrambi sono classificati **NON_CANONICAL / EXCLUDED_FROM_R3_EVIDENCE** perché il corpus usato non rispettava il requisito multi-dominio già previsto dal piano R3.

La non conformità del corpus era stata identificata prima di usare questi output per analisi o tuning. Nessun risultato dei due run viene utilizzato per:
- modificare prompt;
- modificare boundary;
- selezionare casi;
- modificare l'holdout canonico 3.1.0;
- sostenere `TRAMA-ADR-009`.

L'HOLDOUT canonico 3.1.0 non è stato eseguito.
