# CC2-F5 — Evidence Explorer + Integrity

**Stato:** ACTIVE / implementation slice  
**Runtime:** READ_ONLY / SNAPSHOT_FIRST / NO NEW AUTHORITY  
**Principio:** l'assenza di dati non può essere convertita in PASS.

## Scopo

CC2-F5 separa la consultazione delle evidenze dai controlli di coerenza dell'ecosistema.

La Home continua a fornire orientamento sintetico. Il dettaglio vive in una vista specialistica dedicata, così da evitare viste verticalmente eccessive e duplicazione informativa.

## Evidence Explorer

La vista risponde alla domanda:

> Su quali evidenze si basa lo stato dichiarato?

Filtri disponibili:

- ambito;
- capability;
- evidence type;
- freshness;
- exact head;
- stato PASS / FAIL / PARTIAL / IN_PROGRESS / NOT_APPLICABLE.

Ogni record mostra:

- ID e subject;
- tipo;
- area;
- stato;
- capability collegate;
- exact head quando presente;
- confidence;
- fonte;
- data di osservazione;
- freshness policy.

### Semantica freshness

La UI non chiama “fresh” un'evidenza solo perché lo snapshot è recente.

- `CURRENT`: solo evidenza `TIME_BOUND` con scadenza valida e futura;
- `EXPIRED`: evidenza `TIME_BOUND` scaduta;
- `POLICY_BOUND`: freshness vincolata a `EVENT_BOUND`, `UNTIL_CHANGE`, `RUNTIME_BOUND` o `MANUAL_REVIEW`;
- `UNKNOWN`: freshness temporale non valutabile.

## Integrity

La vista risponde alla domanda:

> Ci sono incoerenze tra fonti, stato ed evidenze?

Non produce uno score complessivo.

Ogni controllo ha uno stato autonomo:

- `PASS`: la regola specifica non ha trovato incoerenze nei dati disponibili;
- `ISSUE`: la regola ha trovato una contraddizione o un requisito strutturale mancante;
- `NOT_EVALUABLE`: i dati disponibili non permettono di concludere.

`PASS` non costituisce certificazione, conformità generale o approvazione.

## Controlli v1

### INT-SOURCE-AVAILABILITY

Controlla se le fonti dichiarate nel source registry sono disponibili al collector.

### INT-REFERENCE-RESOLUTION

Controlla i riferimenti interni verificabili tra:

- fasi e gate;
- aree, evidenze e dipendenze;
- capability, maturity area, capability dependency, gate ed evidenze;
- dependency, gate ed evidenze;
- expansion candidate e relativi prerequisiti;
- evidence binding e capability.

### INT-EVIDENCE-FRESHNESS

Segnala evidenze `TIME_BOUND` scadute.

Una `TIME_BOUND` priva di scadenza valutabile produce `NOT_EVALUABLE`, non PASS.

### INT-GATE-EVIDENCE-BINDING

Per un gate in stato PASS con `requiredEvidenceTypes`, verifica esclusivamente binding espliciti nel campo `supports`.

Non deduce il binding dalla sola area o dalla vicinanza semantica.

Se non esistono gate PASS valutabili, il controllo è `NOT_EVALUABLE`.

### INT-RUNTIME-AUTHORIZATION

Se una capability dichiara un runtime attivo, richiede una `PROMOTION_DECISION` PASS esplicitamente bound alla capability.

Gli stati deferred/not-authorized/planned non sono trattati come runtime attivo.

### INT-CAPABILITY-EVIDENCE

Controlla:

- presenza di almeno un evidenceRef dichiarato per capability;
- coerenza di eventuali binding capability-specific.

Non trasforma la maturity dell'owner in una certificazione della capability.

## Vincoli di governance

Restano invariati:

- Control Center READ_ONLY;
- NO_SYNTHETIC_AUTHORITY;
- NO_AUTO_PROMOTION;
- NO_RUNTIME_AUTHORIZATION;
- nessun write cross-product;
- DOS-A1 resta RUNTIME_DEFERRED;
- Docente OS → Atlas resta FUTURE_NOT_AUTHORIZED / NOT_AUTHORIZED;
- nessun overall score;
- nessun claim di certificazione implicito.

## UI / mobile

La vista `control-center/evidence.html`:

- è accessibile dalla Home con un solo link specialistico;
- usa la stessa snapshot locale della Home;
- non effettua fetch GitHub diretti dal browser;
- è inclusa nella PWA shell;
- passa a layout a colonna singola su mobile;
- mantiene target interattivi minimi coerenti col design system;
- supporta offline tramite lo stesso service worker.

## Limiti attuali

La copertura dei controlli dipende dai dati esplicitamente presenti nello snapshot.

In particolare:

- evidence non capability-bound possono essere collegate tramite `capabilities[].evidenceRefs`, ma ciò non equivale a una prova capability-specific;
- un controllo `NOT_EVALUABLE` segnala una lacuna di copertura, non un errore;
- i controlli di integrità non sostituiscono review umane, audit professionali o certificazioni esterne.

## Definition of Done F5

- schema snapshot con `integrityChecks[]`;
- builder deterministico;
- Evidence Explorer filtrabile;
- vista Integrità senza overall score;
- semantica freshness esplicita;
- Home non allungata;
- PWA/offline;
- CI su schema, projection e browser JS;
- review indipendente;
- HUMAN EXACT-HEAD REVIEW prima del merge.
