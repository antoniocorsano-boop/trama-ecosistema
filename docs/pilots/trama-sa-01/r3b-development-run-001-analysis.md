# TRAMA-SA-01/R3B — Development Run 001

Stato: **PROVIDER_RUN_COMPLETE / AI_CROSS_REVIEW_COMPLETE / HUMAN_ADJUDICATION_REQUIRED / HOLDOUT_LOCKED**

## Identificazione

- GitHub Actions run: `35650447621`
- workflow: `TRAMA-SA-01 TypeSafe Pilot R3B Development`
- run number: `1`
- exact head eseguito: `a2b4b6c9047651454fd13da2372c60ead21ef4e7`
- corpus: `3.1.0`
- evaluated split: `DEVELOPMENT`
- provider: TypeSafe
- SDK: `typesafe-sdk 0.7.1`
- modello richiesto: `jev-latest`
- modello effettivo: `jev-1.13.0`
- risultati: `32/32`
- provider errors: `0`
- holdout locked: `true`
- artefatto temporaneo: `trama-sa01-typesafe-r3b-development-raw`

L'artefatto grezzo non viene copiato nel repository.

## Split DEVELOPMENT

Distribuzione preregistrata:

- `ALIGNED`: 8;
- `PARTIAL`: 8;
- `CONTRADICTORY`: 8;
- `INSUFFICIENT_EVIDENCE`: 8.

## Risultati

- accordo esatto: `32/32 = 100%`;
- falsi `ALIGNED`: `0`;
- falsi `INSUFFICIENT_EVIDENCE`: `0`;
- confusion matrix perfettamente diagonale: `8/8` per ciascuna classe;
- provider errors: `0`;
- casi marcati per review dalla policy sperimentale: `0`;
- input token complessivi: `36202`;
- output token complessivi: `1968`;
- latenza media client: circa `180.12 ms/caso`;
- latenza client complessiva: circa `5.76 s`.

## Sufficienza evidenza

Per gli 8 casi preregistrati `INSUFFICIENT_EVIDENCE`:

- tutti sono stati fermati prima del giudizio di alignment;
- massimo `evidenceSufficientNoul`: `0.29`;
- minimo: `0.10`.

Per i 24 casi con evidenza sufficiente:

- minimo `evidenceSufficientNoul`: `0.74`.

Sul DEVELOPMENT osservato esiste quindi una separazione netta attorno al boundary sperimentale `0.5`, senza casi nella fascia di attenzione `0.4–0.6`.

Questo dato è descrittivo del campione R3B DEVELOPMENT e non rende `0.5` una soglia runtime.

## Alignment

Tutti i 24 casi inviati al secondo giudizio sono stati classificati correttamente.

La confidence minima del Choice è `0.76`:

- `SA01-R3B-038`;
- dominio: Geografia;
- atteso: `ALIGNED`;
- risultato: `ALIGNED`;
- evidence sufficient: `0.82`;
- alignment confidence: `0.76`.

Non risultano casi sotto la soglia sperimentale di attenzione `0.7`.

## Conclusione tecnica DEVELOPMENT

R3B corregge il limite metodologico di R3 e, sullo split DEVELOPMENT stratificato, il disegno `evidence_sufficient → alignment` mostra:

- comportamento corretto su tutte e quattro le classi;
- nessun falso allineamento;
- nessun falso insufficiente;
- nessun caso vicino al boundary;
- nessun errore provider;
- nessuna scrittura o autorizzazione prodotta.

Questo risultato **non equivale ancora a validazione finale** perché i 16 casi HOLDOUT non sono stati eseguiti.

## Stato di governance

- R3B DEVELOPMENT provider run: **COMPLETE**;
- human review DEVELOPMENT: **PENDING**;
- R3B HOLDOUT: **LOCKED / NOT_EXECUTED**;
- `TRAMA-ADR-009`: **PROPOSED**;
- runtime TypeSafe: **NOT_AUTHORIZED**;
- `DOS-A1`: **RUNTIME_DEFERRED**.

## Gate successivo

Lo sblocco dei 16 casi HOLDOUT richiede una decisione umana distinta dopo la review di questo report.


## Terza valutazione indipendente

È stata completata una AI cross-review distinta dal provider.

Esito: **PASS_WITH_ADJUDICATION_REQUIRED**.

- 31/32 etichette preregistrate confermate;
- `SA01-R3B-003` contestato come possibile `PARTIAL` invece di `ALIGNED`;
- HOLDOUT resta bloccato;
- nessuna modifica retroattiva al corpus.

Riferimento: `docs/pilots/trama-sa-01/r3b-third-evaluation.md`.
