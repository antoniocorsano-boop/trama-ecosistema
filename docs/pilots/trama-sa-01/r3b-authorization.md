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

## Adjudication DEVELOPMENT

- SA01-R3B-003 = PARTIAL come annotazione post-preregistration;
- corpus preregistrato invariato;
- nessun tuning del provider, prompt o boundary;
- DEVELOPMENT chiuso come PASS_WITH_ONE_ADJUDICATED_ERROR.

## Preparazione del gate HOLDOUT

È autorizzata la sola **preparazione tecnica** del gate one-shot sui 16 casi congelati.

Il gate deve:
- essere dispatchabile soltanto da main;
- caricare harness e corpus da una revisione sorgente pin-nata;
- usare un marker durevole di consumo prima delle chiamate provider;
- bloccare qualunque rerun o secondo dispatch dopo la claim;
- preservare l'artefatto anche se il provider step termina con errore dopo aver scritto il payload.

La revisione sorgente autorizzabile è pin-nata a:

c2595b7354f68ffdd383c71fc253014b01cbcb71

L'esecuzione HOLDOUT resta bloccata fino a nuova review umana exact-head della PR finale.

Il passaggio a HOLDOUT non approva ADR-009, non abilita runtime nei prodotti e non modifica DOS-A1.
