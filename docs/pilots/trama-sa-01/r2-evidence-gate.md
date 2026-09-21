# TRAMA-SA-01/R2 — sufficienza evidenza prima dell'allineamento

Stato: **IMPLEMENTATION_IN_REVIEW**

## Motivazione

Il Run 001 ha ottenuto 8/10 corrispondenze con le etichette preregistrate. I due scarti hanno riguardato i casi umanamente confermati come `INSUFFICIENT_EVIDENCE`.

R2 separa quindi due domande semanticamente diverse:

1. `evidence_sufficient` — primitive `Noul`;
2. `alignment` — primitive `Choice` limitata a `ALIGNED`, `PARTIAL`, `CONTRADICTORY`.

## Routing sperimentale

Per rendere eseguibile il laboratorio, R2 usa `0.5` come boundary naturale della probabilità yes/no del `Noul`:

- `<= 0.5`: il secondo giudizio non viene eseguito e il record sperimentale assume `INSUFFICIENT_EVIDENCE`;
- `> 0.5`: viene eseguito il secondo giudizio di allineamento.

Questo boundary serve **soltanto a decidere se effettuare la seconda query nel pilota**. Non è una soglia di approvazione, pubblicazione, adozione o futura policy runtime. La sua adeguatezza deve essere valutata sui risultati e può essere modificata o abbandonata.

## Invarianti

- corpus sintetico invariato;
- pre-gate deterministico invariato;
- nessun dato personale;
- nessuna scrittura runtime;
- nessun esito produce autorizzazione;
- output sempre `advisoryOnly=true`;
- `humanReview.reviewed=false` dopo il run;
- revisione umana obbligatoria prima di ogni conclusione;
- `TRAMA-ADR-009` resta `PROPOSED`;
- `DOS-A1` resta `RUNTIME_DEFERRED`.

## Esecuzione

Workflow manuale: `TRAMA-SA-01 TypeSafe Pilot R2`.

L'artefatto atteso è `trama-sa01-typesafe-r2-raw`. Non viene copiato automaticamente nel repository.
