# TRAMA-SA-01 — Contratto dei risultati

Questo contratto definisce il formato **provider-neutral** usato dal pilota. Non è un contratto runtime tra Arena, Atlas e Docente OS.

## Record minimo

Ogni risultato semantico deve contenere:

- `caseId`: identificativo del caso;
- `provider`: identificativo del provider effettivamente usato;
- `providerModel`: modello/versione, se disponibile;
- `judgmentType`: per il primo pilota `CHOICE_ALIGNMENT`;
- `semanticLabel`: uno fra `ALIGNED`, `PARTIAL`, `CONTRADICTORY`, `INSUFFICIENT_EVIDENCE`;
- `distribution`: probabilità o pesi restituiti dal provider, se disponibili;
- `advisoryOnly`: obbligatoriamente `true`;
- `stateDigest`: impronta del solo stato sintetico/minimizzato valutato;
- `evaluatedAt`: data/ora della valutazione;
- `humanReview`: revisione successiva con `reviewed=true`, `label` e nota facoltativa.

## Regole

1. Il risultato non può contenere un campo di autorizzazione operativa.
2. `advisoryOnly=false` rende il record non valido per TRAMA-SA-01.
3. La distribuzione non viene trasformata automaticamente in soglia o permesso.
4. I casi respinti dal pre-gate non vengono inviati al provider.
5. Il report finale usa l'etichetta umana come riferimento per la valutazione del pilota.
6. Un errore del provider deve essere registrato come errore/indisponibilità, non come `ALIGNED`.
