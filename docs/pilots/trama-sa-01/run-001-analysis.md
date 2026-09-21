# TRAMA-SA-01 — Run 001 TypeSafe

Stato: **PROVIDER_RUN_COMPLETE / HUMAN_REVIEW_COMPLETE / REVISE**

## Identificazione

- GitHub Actions run: `35646198555`
- workflow run number: `1`
- exact head: `e05e2e59f17361122a6a112f351926c5f7aebf37`
- corpus: `1.0.0`
- provider: TypeSafe
- SDK: `typesafe-sdk 0.7.1`
- modello effettivo restituito: `jev-1.13.0`
- modello richiesto: `jev-latest`
- artefatto temporaneo: `trama-sa01-typesafe-raw`
- provider errors: `0`
- risultati semantici: `10/10`

Il file grezzo non viene copiato nel repository TRAMA. Il repository conserva soltanto risultati aggregati e conclusioni governate.

## Pre-gate

Il corpus ha superato il validatore:

- 12 casi totali;
- 10 casi inviati al provider;
- 2 casi respinti deterministicamente prima del provider;
- nessun dato personale inviato.

## Confronto con le etichette attese preregistrate

Le etichette attese sono state confermate nella revisione umana finale del Run 001.

| Caso | Atteso nel corpus | TypeSafe | Confidence | Claim support |
| --- | --- | --- | ---: | ---: |
| SA01-001 | ALIGNED | ALIGNED | 1.00 | 0.89 |
| SA01-002 | PARTIAL | PARTIAL | 0.98 | 0.63 |
| SA01-003 | CONTRADICTORY | CONTRADICTORY | 1.00 | 0.02 |
| SA01-004 | INSUFFICIENT_EVIDENCE | ALIGNED | 0.50 | 0.16 |
| SA01-005 | ALIGNED | ALIGNED | 0.98 | 0.65 |
| SA01-006 | PARTIAL | PARTIAL | 0.74 | 0.08 |
| SA01-007 | CONTRADICTORY | CONTRADICTORY | 0.99 | 0.04 |
| SA01-008 | INSUFFICIENT_EVIDENCE | PARTIAL | 0.37 | 0.08 |
| SA01-011 | ALIGNED | ALIGNED | 0.99 | 0.92 |
| SA01-012 | CONTRADICTORY | CONTRADICTORY | 1.00 | 0.03 |

Risultati aggregati rispetto alle etichette preregistrate:

- accordo esatto: `8/10 = 80%`;
- falsi passaggi `ALIGNED` rispetto all'atteso: `1` (`SA01-004`);
- secondo scarto: `SA01-008`, `PARTIAL` invece di `INSUFFICIENT_EVIDENCE`;
- input token complessivi: `8033`;
- output token complessivi: `783`;
- latenza media misurata dal client: circa `176 ms/caso`;
- errori provider: `0`.

## Finding principale

Entrambi gli scarti riguardano l'opzione `INSUFFICIENT_EVIDENCE`.

In `SA01-004`, il Choice seleziona `ALIGNED` ma:
- confidence = `0.50`;
- `claimSupportNoul = 0.16`.

In `SA01-008`, il Choice seleziona `PARTIAL` ma:
- confidence = `0.37`;
- `claimSupportNoul = 0.08`.

Il run mostra quindi che trattare **evidenza insufficiente come quarta alternativa concorrente nello stesso Choice** non è ancora robusto. Il giudizio indipendente di supporto dell'affermazione segnala invece correttamente una forte criticità in entrambi i casi.

## Proposta per TRAMA-SA-01/R2

Prima di qualunque soglia o promozione di ADR-009, sperimentare una decomposizione distinta:

1. giudizio indipendente `evidence_sufficient` con `Noul`;
2. soltanto quando l'evidenza è sufficiente, `Choice` tra `ALIGNED`, `PARTIAL`, `CONTRADICTORY`;
3. la policy resta nel codice;
4. nessuna probabilità produce un permesso;
5. le soglie restano da calibrare dopo dati di prova;
6. ogni caso continua a richiedere revisione umana nel pilota.

Questa è una proposta di revisione del disegno, non una promozione automatica.

## Warning GitHub Actions

Il run contiene un warning non bloccante relativo alla transizione dei runner GitHub Actions da Node.js 20 a Node.js 24 per `actions/checkout@v4`, `actions/setup-python@v5` e `actions/upload-artifact@v4`.

Il warning non ha alterato il run: job e artifact upload sono conclusi con successo. Va trattato come manutenzione separata.

## Revisione umana finale

Conferma del 21 settembre 2026:

- `SA01-004`: `INSUFFICIENT_EVIDENCE` confermato;
- `SA01-008`: `INSUFFICIENT_EVIDENCE` confermato;
- le altre otto etichette preregistrate sono confermate;
- esito del Run 001: **REVISE**.

La revisione non promuove `TRAMA-ADR-009`; autorizza soltanto il passaggio al disegno sperimentale R2.

## Stato di governance

- `TRAMA-ADR-009`: resta `PROPOSED`;
- human review Run 001: **COMPLETE**;
- outcome: **REVISE**;
- runtime TypeSafe nei prodotti: **NOT_AUTHORIZED**;
- `DOS-A1`: resta `RUNTIME_DEFERRED`.
