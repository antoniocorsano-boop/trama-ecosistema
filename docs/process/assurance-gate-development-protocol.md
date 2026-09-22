# TRAMA Assurance Gate Development Protocol

## Scopo

Evitare il ciclo costoso e fragile:

**regola → implementazione euristica → gate verde → review tardiva → nuova correzione → rilancio completo**

Ogni nuovo gate trasversale deve essere sviluppato e validato come un prodotto di assurance autonomo prima del rollout nei repository applicativi.

## Principio

Un gate non è considerato affidabile perché è verde sul proprio codice. Deve dimostrare di:

- intercettare i casi che dichiara di coprire;
- non bloccare casi leciti;
- fallire chiuso quando manca il contesto necessario;
- produrre evidenza ripetibile;
- avere costo computazionale proporzionato al rischio.

## Sequenza obbligatoria

### G0 — Contratto

Definire prima dell'implementazione:
- invariante da proteggere;
- superfici incluse ed escluse;
- cosa costituisce PASS;
- cosa costituisce FAIL;
- quali casi devono restare human-only;
- confini che il gate non può autorizzare.

### G1 — Matrice avversariale

Prima del rollout devono esistere almeno:
- true positive;
- true negative;
- false-positive trap;
- false-negative trap;
- deletion/regression case;
- missing-context case;
- cross-file evidence mismatch case;
- caso di compatibilità con codice storico.

Per TRAMA-PW-01 sono casi canonici:

| Caso | Atteso |
| --- | --- |
| HTTP POST senza feedback | FAIL |
| axios.patch senza feedback | FAIL |
| write con role=status ma senza test | FAIL |
| write con test non correlato contenente error | FAIL |
| form di sola ricerca | PASS |
| eliminazione del test dichiarato | FAIL |
| rimozione del manifest mantenendo la source write | FAIL |
| run manuale senza base/head | FAIL |
| validator che contiene parole di mutation | non deve auto-classificarsi |

### G2 — Self-test del gate

Il workflow deve eseguire i test del classifier prima dell'enforcement.
Un gate che non supera i propri test non deve avviare pipeline applicative più costose.

### G3 — Shadow validation

Prima di renderlo required:
- eseguirlo su diff rappresentativi;
- confrontare risultato automatico con review umana;
- registrare falsi positivi/falsi negativi;
- correggere il classifier;
- solo dopo promuoverlo a fail-closed.

### G4 — Rollout leggero

Preferire un workflow dedicato e rapido.
Un gate semantico locale non deve avviare build, browser suite, database replay o deploy se non sono necessari al rischio che verifica.

### G5 — Rollout cross-product

Ordine:
1. contratto TRAMA;
2. validator + test avversariali;
3. un prodotto canary;
4. review terza;
5. correzione;
6. solo dopo replica agli altri prodotti;
7. review exact-head per ogni repository.

È vietato propagare contemporaneamente una prima implementazione non ancora stress-testata a tutti i prodotti.

### G6 — Baseline storica separata

L'enforcement sulle nuove/modificate superfici e l'audit del codice storico sono attività distinte.
Il gate nuovo protegge subito il futuro; la baseline esistente viene inventariata e bonificata senza fingere che sia già certificata.

## Criterio di economia computazionale

Ogni gate deve usare il livello minimo di compute sufficiente:
1. parsing/static check;
2. unit test;
3. integration test;
4. browser/E2E;
5. runtime/deploy.

Si sale di livello soltanto se il rischio non è verificabile al livello precedente.

## Regola di chiusura

Un assurance gate può essere dichiarato stabile solo quando:
- self-test PASS;
- matrice avversariale completa;
- nessun rilievo P1/P2 aperto sulla logica del gate;
- almeno una review indipendente;
- costo e trigger documentati;
- nessun confine di autorità ampliato implicitamente.
