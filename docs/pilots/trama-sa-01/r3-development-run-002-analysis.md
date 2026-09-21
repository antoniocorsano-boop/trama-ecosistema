# TRAMA-SA-01/R3 — Development Run 002

Stato: **PROVIDER_RUN_COMPLETE / DEVELOPMENT_REVIEW_PENDING / HOLDOUT_LOCKED**

## Identificazione

- GitHub Actions run: `35649286123`
- workflow: `TRAMA-SA-01 TypeSafe Pilot R3 Development`
- run number: `2`
- exact head: `1a2d3045e4bde8f344caf6a4713550d71931519e`
- evaluated split: `DEVELOPMENT`
- corpus: `3.0.0`
- provider: TypeSafe
- SDK: `typesafe-sdk 0.7.1`
- modello richiesto: `jev-latest`
- modello effettivo: `jev-1.13.0`
- risultati: `32/32`
- provider errors: `0`
- holdout locked: `true`
- artefatto temporaneo: `trama-sa01-typesafe-r3-development-raw`

L'artefatto grezzo non viene copiato nel repository.

## Risultato DEVELOPMENT

Distribuzione preregistrata dello split eseguito:

- `ALIGNED`: 12;
- `PARTIAL`: 12;
- `CONTRADICTORY`: 8;
- `INSUFFICIENT_EVIDENCE`: 0.

Esito TypeSafe:

- accordo esatto: `32/32 = 100%`;
- falsi `ALIGNED`: `0`;
- falsi `INSUFFICIENT_EVIDENCE`: non valutabili nello split DEVELOPMENT;
- provider errors: `0`;
- input token complessivi: `41088`;
- output token complessivi: `2340`;
- latenza media client: circa `270 ms/caso`;
- latenza totale misurata dal client: circa `8.64 s`.

Tutti i 32 casi hanno superato il gate di sufficienza evidenza e sono arrivati al giudizio di alignment.

## Segnale di incertezza

`SA01-R3-009` è classificato correttamente `ALIGNED`, ma con:

- evidence sufficient: `0.90`;
- alignment confidence: `0.49`;
- distribuzione: `ALIGNED 0.66 / PARTIAL 0.34 / CONTRADICTORY 0.00`.

Il caso va mantenuto nella review umana come esempio di esito corretto ma incerto.

## Finding metodologico sullo split

Il corpus complessivo è bilanciato 12/12/12/12, ma lo split non è stratificato:

### DEVELOPMENT

- 12 `ALIGNED`;
- 12 `PARTIAL`;
- 8 `CONTRADICTORY`;
- 0 `INSUFFICIENT_EVIDENCE`.

### HOLDOUT

- 0 `ALIGNED`;
- 0 `PARTIAL`;
- 4 `CONTRADICTORY`;
- 12 `INSUFFICIENT_EVIDENCE`.

Questo significa che il DEVELOPMENT non può calibrare o verificare il boundary di sufficienza evidenza sui casi positivi/negativi della classe `INSUFFICIENT_EVIDENCE`.

Inoltre, dopo aver osservato i risultati DEVELOPMENT, **non è metodologicamente corretto rimescolare gli stessi casi per creare un nuovo holdout bilanciato**, perché casi già osservati diventerebbero parte del test finale.

## Conseguenza

Il HOLDOUT corrente può essere usato soltanto come **challenge set mirato** su:

- `INSUFFICIENT_EVIDENCE`;
- una quota residua di `CONTRADICTORY`.

Non può supportare da solo una conclusione generale sulla stabilità finale di tutte e quattro le classi.

Per una futura review ADR-009 rigorosa, la soluzione preferibile è preregistrare un nuovo corpus/split `R3B` con holdout stratificato e mai eseguito.

## Stato di governance

- R3 DEVELOPMENT provider run: **COMPLETE**;
- human review DEVELOPMENT: **PENDING**;
- HOLDOUT corrente: **LOCKED / NOT_EXECUTED**;
- `TRAMA-ADR-009`: **PROPOSED**;
- runtime TypeSafe: **NOT_AUTHORIZED**;
- `DOS-A1`: **RUNTIME_DEFERRED**.

## Decisione successiva

La review umana deve scegliere tra:

1. usare il HOLDOUT esistente come challenge set mirato, mantenendo esplicito che non è un holdout generale; oppure
2. mantenere il HOLDOUT intatto e preregistrare `R3B` con split stratificato per una validazione finale più robusta.

La seconda opzione è metodologicamente più forte.
