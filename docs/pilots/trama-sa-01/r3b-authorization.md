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
- verificare gli hash Git-blob congelati di corpus, harness, dipendenze logiche e requirements;
- usare un anchor di consumo immutabile nella storia di main;
- serializzare i dispatch concorrenti con un unico concurrency group;
- usare un marker durevole di consumo prima delle chiamate provider;
- bloccare qualunque rerun o secondo dispatch dopo la claim;
- preservare l'artefatto anche se il provider step termina con errore dopo aver scritto il payload.

L'esecuzione HOLDOUT resta bloccata fino a nuova review umana exact-head della PR finale.

Il merge del gate ne autorizza la disponibilità, non l'esecuzione automatica. Il dispatch HOLDOUT richiede una distinta azione esplicita dell'operatore.

Il passaggio a HOLDOUT non approva ADR-009, non abilita runtime nei prodotti e non modifica DOS-A1.
