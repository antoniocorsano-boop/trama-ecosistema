# TRAMA-SA-01/R2 — Run 001 TypeSafe

Stato: **PROVIDER_RUN_COMPLETE / HUMAN_REVIEW_COMPLETE / CANDIDATE**

## Identificazione

- GitHub Actions run: `35647283383`
- workflow: `TRAMA-SA-01 TypeSafe Pilot R2`
- exact head: `0e26a28cd4c39d7ffb646a7a05f2fbc58141ecdb`
- corpus: `1.0.0`
- provider: TypeSafe
- SDK: `typesafe-sdk 0.7.1`
- modello richiesto: `jev-latest`
- modello effettivo: `jev-1.13.0`
- risultati: `10/10`
- provider errors: `0`
- artefatto temporaneo: `trama-sa01-typesafe-r2-raw`

L'artefatto grezzo non viene copiato nel repository. TRAMA conserva risultati aggregati e conclusioni governate.

## Risultati rispetto alle etichette umane preregistrate

| Caso | Etichetta umana | R2 | Evidence sufficient | Alignment |
| --- | --- | --- | ---: | --- |
| SA01-001 | ALIGNED | ALIGNED | 0.93 | 0.99 |
| SA01-002 | PARTIAL | PARTIAL | 0.77 | 0.99 |
| SA01-003 | CONTRADICTORY | CONTRADICTORY | 0.87 | 1.00 |
| SA01-004 | INSUFFICIENT_EVIDENCE | INSUFFICIENT_EVIDENCE | 0.10 | non eseguito |
| SA01-005 | ALIGNED | ALIGNED | 0.84 | 0.96 |
| SA01-006 | PARTIAL | PARTIAL | 0.88 | 0.58 |
| SA01-007 | CONTRADICTORY | CONTRADICTORY | 0.88 | 0.99 |
| SA01-008 | INSUFFICIENT_EVIDENCE | INSUFFICIENT_EVIDENCE | 0.27 | non eseguito |
| SA01-011 | ALIGNED | ALIGNED | 0.92 | 0.95 |
| SA01-012 | CONTRADICTORY | CONTRADICTORY | 0.85 | 1.00 |

Aggregati:

- accordo esatto con etichette preregistrate: `10/10 = 100%`;
- falsi passaggi `ALIGNED`: `0`;
- casi `INSUFFICIENT_EVIDENCE` correttamente instradati prima dell'allineamento: `2/2`;
- provider errors: `0`;
- input token complessivi: `11835`;
- output token complessivi: `640`;
- latenza media client: circa `335.5 ms/caso`.

## Confronto con Run 001 / R1

R1 aveva prodotto:

- accordo esatto: `8/10`;
- falsi passaggi `ALIGNED`: `1`;
- input token: `8033`;
- output token: `783`;
- latenza media: circa `176 ms/caso`.

R2 mostra sul corpus corrente:

- miglioramento da `80%` a `100%` di accordo;
- falsi passaggi ridotti da `1` a `0`;
- incremento input token di circa `47%`;
- riduzione output token di circa `18%`;
- latenza media circa `1.9x` R1.

Questi dati sono descrittivi del solo corpus pilota e non autorizzano generalizzazioni di produzione.

## Finding

La separazione fra:
1. sufficienza dell'evidenza;
2. allineamento semantico;

ha corretto i due errori osservati in R1 sul corpus corrente.

Il boundary `0.5` ha funzionato come meccanismo di routing nel campione corrente, ma **non è validato come soglia generale**. Il campione è troppo piccolo per promuoverlo a policy runtime.

## Punto di attenzione

`SA01-006` è classificato correttamente `PARTIAL`, ma con confidence `0.58` nel Choice di allineamento. Questo è un caso utile da mantenere come segnale di incertezza per la successiva calibrazione.

## Warning Actions

Resta il warning non bloccante relativo alla transizione GitHub Actions da Node.js 20 a Node.js 24 per le action correnti. Il run e l'upload dell'artefatto sono comunque conclusi con successo.

## Revisione umana finale

La revisione umana del 21 settembre 2026 conferma tutte le 10 etichette R2, compresi:

- `SA01-004 = INSUFFICIENT_EVIDENCE`;
- `SA01-008 = INSUFFICIENT_EVIDENCE`;
- le altre otto etichette come risultanti dal run.

Outcome R2: **CANDIDATE**.

`CANDIDATE` significa soltanto che il disegno R2 merita una decisione TRAMA successiva per un eventuale uso limitato. Non equivale ad approvazione, non autorizza runtime e non modifica automaticamente `TRAMA-ADR-009`.

## Stato di governance

- human review R2: **COMPLETE**;
- outcome R2: **CANDIDATE**;
- `TRAMA-ADR-009`: **PROPOSED**;
- runtime nei prodotti: **NOT_AUTHORIZED**;
- `DOS-A1`: **RUNTIME_DEFERRED**.
