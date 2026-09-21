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


## HOLDOUT one-shot gate

A one-shot HOLDOUT gate is defined in `r3b-holdout-gate.md`.

It becomes effective only after exact-head human approval and merge of the PR that introduces the gate. Until then, this authorization remains DEVELOPMENT-only.
