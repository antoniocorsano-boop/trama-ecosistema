# TRAMA-SA-01/R3B — Authorization record

Stato: **AUTHORIZED_FOR_DEVELOPMENT_ONLY**

Autorizzazione umana: 21 settembre 2026.

## Ambito

È autorizzato:
- nuovo corpus R3B sintetico;
- 32 casi DEVELOPMENT;
- 8 casi per ciascuna delle quattro etichette;
- esecuzione TypeSafe advisory-only;
- review umana successiva.

## Bloccato

Non è autorizzato:
- eseguire i 16 casi HOLDOUT;
- usare dati personali;
- modificare il boundary come policy runtime;
- promuovere `TRAMA-ADR-009`;
- integrare TypeSafe nei prodotti;
- attivare `DOS-A1`.

Il passaggio a HOLDOUT richiede una nuova decisione umana.


## Adjudication DEVELOPMENT e autorizzazione al gate HOLDOUT

Decisione successiva alla review indipendente:

- `SA01-R3B-003 = PARTIAL` come annotazione post-preregistration;
- corpus preregistrato invariato;
- nessun tuning del provider, prompt o boundary;
- DEVELOPMENT chiuso come **PASS_WITH_ONE_ADJUDICATED_ERROR**.

È autorizzata la **preparazione tecnica** del gate HOLDOUT sui 16 casi congelati. L'esecuzione avverrà tramite workflow manuale separato e non costituisce approvazione di ADR-009 o del runtime.
