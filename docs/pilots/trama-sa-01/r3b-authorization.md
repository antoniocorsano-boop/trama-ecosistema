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
- promuovere TRAMA-ADR-009;
- integrare TypeSafe nei prodotti;
- attivare DOS-A1.

Il passaggio a HOLDOUT richiede una nuova decisione umana.

## HOLDOUT one-shot gate

Il gate one-shot è definito in r3b-holdout-gate.md.

La revisione sorgente preregistrata è pin-nata a:

33ad808ab02c42d68d4f5443452a65b274dc4ae2

Il gate:
- accetta dispatch soltanto da main;
- carica harness/corpus dalla revisione pin-nata;
- usa un marker durevole di consumo prima del provider;
- conserva l'artefatto anche quando il provider step fallisce dopo aver prodotto il payload;
- non consente rerun dopo la claim del provider attempt.

Il gate diventa effettivo soltanto dopo exact-head human approval e merge della PR che introduce queste garanzie.

Fino a quel momento questa autorizzazione resta DEVELOPMENT-only e il HOLDOUT non deve essere eseguito.
