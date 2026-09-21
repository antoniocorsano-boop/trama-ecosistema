# TRAMA-SA-01/R3B — Terza valutazione indipendente

Stato: **AI_CROSS_REVIEW_COMPLETE / HUMAN_ADJUDICATION_REQUIRED / HOLDOUT_LOCKED**

Data: 21 settembre 2026  
Ambito: R3B DEVELOPMENT, 32 casi  
Natura: **AI cross-review indipendente**. Non è una review umana e non sostituisce il gate umano.

## Metodo

La valutazione è stata effettuata rileggendo per ciascun caso:

- obiettivo/evidenza;
- sintesi candidata;
- definizione delle quattro etichette;
- risultato preregistrato;
- risultato TypeSafe.

Non è stato modificato il corpus e non sono stati osservati o eseguiti i 16 casi HOLDOUT.

## Esito aggregato

- 28 casi: **CONFIRM**;
- 3 casi: **CONFIRM_WITH_NOTE**;
- 1 caso: **DISPUTE**;
- accordo stretto della terza valutazione con le etichette preregistrate: **31/32 = 96.875%**;
- HOLDOUT: ancora **LOCKED / NOT_EXECUTED**.

La discrepanza non viene retroattivamente corretta nel corpus preregistrato.

## Caso contestato

### SA01-R3B-003

Etichetta preregistrata e TypeSafe: `ALIGNED`.

Terza valutazione: **PARTIAL**.

Motivo: l'obiettivo richiede di confrontare gli imballaggi considerando:
1. protezione;
2. **quantità di materiale**;
3. fine vita.

La sintesi conserva protezione e fine vita, ma usa `materiale impiegato`, formulazione che non garantisce il criterio quantitativo. Con il criterio rigoroso applicato agli altri casi `PARTIAL`, questa può essere considerata un'omissione rilevante.

TypeSafe sul caso:
- evidence sufficient: `0.92`;
- label: `ALIGNED`;
- confidence: `0.96`;
- distribuzione: `ALIGNED 0.98 / PARTIAL 0.02 / CONTRADICTORY 0.00`.

Questo è un finding importante perché mostra che **alta confidence non elimina un possibile difetto di ground truth o di interpretazione**.

## Casi confermati con nota

- `SA01-R3B-013`: ALIGNED confermato; il contesto concreto non è esplicito ma il nucleo semantico è preservato.
- `SA01-R3B-026`: ALIGNED confermato; sono citati alcuni passaggi di stato, ma resta preservata la relazione con le variazioni di temperatura.
- `SA01-R3B-038`: ALIGNED confermato; è il caso con confidence TypeSafe più bassa tra gli alignment (`0.76`).

## Validità del corpus

R3B è più corretto metodologicamente di R3 per lo split stratificato, ma resta un corpus sintetico relativamente separabile:

- molte contraddizioni sono esplicite;
- molti casi PARTIAL dichiarano direttamente l'omissione;
- molti casi INSUFFICIENT_EVIDENCE combinano obiettivi generici con affermazioni assolute.

Quindi il risultato provider è forte **nel dominio del test costruito**, ma non misura ancora la robustezza su casi autentici, più impliciti o linguisticamente rumorosi.

## Tabella completa

| Caso | Dominio | Preregistrato | Terza valutazione | Esito | Nota |
| --- | --- | --- | --- | --- | --- |
| SA01-R3B-002 | Tecnologia | ALIGNED | ALIGNED | CONFIRM | Etichetta preregistrata semanticamente coerente. |
| SA01-R3B-003 | Tecnologia | ALIGNED | PARTIAL | DISPUTE | L'obiettivo richiede esplicitamente la quantità di materiale; la sintesi dice solo 'materiale impiegato'. In lettura stretta, il criterio quantitativo non è preservato. |
| SA01-R3B-004 | Tecnologia | PARTIAL | PARTIAL | CONFIRM | Etichetta preregistrata semanticamente coerente. |
| SA01-R3B-006 | Tecnologia | PARTIAL | PARTIAL | CONFIRM | Etichetta preregistrata semanticamente coerente. |
| SA01-R3B-007 | Tecnologia | CONTRADICTORY | CONTRADICTORY | CONFIRM | Etichetta preregistrata semanticamente coerente. |
| SA01-R3B-008 | Tecnologia | CONTRADICTORY | CONTRADICTORY | CONFIRM | Etichetta preregistrata semanticamente coerente. |
| SA01-R3B-011 | Tecnologia | INSUFFICIENT_EVIDENCE | INSUFFICIENT_EVIDENCE | CONFIRM | Etichetta preregistrata semanticamente coerente. |
| SA01-R3B-012 | Tecnologia | INSUFFICIENT_EVIDENCE | INSUFFICIENT_EVIDENCE | CONFIRM | Etichetta preregistrata semanticamente coerente. |
| SA01-R3B-013 | Matematica | ALIGNED | ALIGNED | CONFIRM_WITH_NOTE | Il riferimento alle situazioni concrete non è esplicito nella sintesi, ma 'situazioni di proporzionalità diretta' conserva il nucleo dell'obiettivo. |
| SA01-R3B-015 | Matematica | ALIGNED | ALIGNED | CONFIRM | Etichetta preregistrata semanticamente coerente. |
| SA01-R3B-016 | Matematica | PARTIAL | PARTIAL | CONFIRM | Etichetta preregistrata semanticamente coerente. |
| SA01-R3B-017 | Matematica | PARTIAL | PARTIAL | CONFIRM | Etichetta preregistrata semanticamente coerente. |
| SA01-R3B-020 | Matematica | CONTRADICTORY | CONTRADICTORY | CONFIRM | Etichetta preregistrata semanticamente coerente. |
| SA01-R3B-021 | Matematica | CONTRADICTORY | CONTRADICTORY | CONFIRM | Etichetta preregistrata semanticamente coerente. |
| SA01-R3B-022 | Matematica | INSUFFICIENT_EVIDENCE | INSUFFICIENT_EVIDENCE | CONFIRM | Etichetta preregistrata semanticamente coerente. |
| SA01-R3B-024 | Matematica | INSUFFICIENT_EVIDENCE | INSUFFICIENT_EVIDENCE | CONFIRM | Etichetta preregistrata semanticamente coerente. |
| SA01-R3B-025 | Scienze | ALIGNED | ALIGNED | CONFIRM | Etichetta preregistrata semanticamente coerente. |
| SA01-R3B-026 | Scienze | ALIGNED | ALIGNED | CONFIRM_WITH_NOTE | La sintesi cita alcuni passaggi di stato, non necessariamente tutti; il nucleo relazione passaggio di stato-variazione di temperatura resta però preservato. |
| SA01-R3B-029 | Scienze | PARTIAL | PARTIAL | CONFIRM | Etichetta preregistrata semanticamente coerente. |
| SA01-R3B-030 | Scienze | PARTIAL | PARTIAL | CONFIRM | Etichetta preregistrata semanticamente coerente. |
| SA01-R3B-031 | Scienze | CONTRADICTORY | CONTRADICTORY | CONFIRM | Etichetta preregistrata semanticamente coerente. |
| SA01-R3B-033 | Scienze | CONTRADICTORY | CONTRADICTORY | CONFIRM | Etichetta preregistrata semanticamente coerente. |
| SA01-R3B-034 | Scienze | INSUFFICIENT_EVIDENCE | INSUFFICIENT_EVIDENCE | CONFIRM | Etichetta preregistrata semanticamente coerente. |
| SA01-R3B-035 | Scienze | INSUFFICIENT_EVIDENCE | INSUFFICIENT_EVIDENCE | CONFIRM | Etichetta preregistrata semanticamente coerente. |
| SA01-R3B-038 | Geografia | ALIGNED | ALIGNED | CONFIRM_WITH_NOTE | Etichetta corretta; è anche il caso con confidence TypeSafe più bassa tra gli alignment (0.76), quindi utile come sentinella. |
| SA01-R3B-039 | Geografia | ALIGNED | ALIGNED | CONFIRM | Etichetta preregistrata semanticamente coerente. |
| SA01-R3B-040 | Geografia | PARTIAL | PARTIAL | CONFIRM | Etichetta preregistrata semanticamente coerente. |
| SA01-R3B-042 | Geografia | PARTIAL | PARTIAL | CONFIRM | Etichetta preregistrata semanticamente coerente. |
| SA01-R3B-043 | Geografia | CONTRADICTORY | CONTRADICTORY | CONFIRM | Etichetta preregistrata semanticamente coerente. |
| SA01-R3B-044 | Geografia | CONTRADICTORY | CONTRADICTORY | CONFIRM | Etichetta preregistrata semanticamente coerente. |
| SA01-R3B-047 | Geografia | INSUFFICIENT_EVIDENCE | INSUFFICIENT_EVIDENCE | CONFIRM | Etichetta preregistrata semanticamente coerente. |
| SA01-R3B-048 | Geografia | INSUFFICIENT_EVIDENCE | INSUFFICIENT_EVIDENCE | CONFIRM | Etichetta preregistrata semanticamente coerente. |

## Giudizio della terza valutazione

**R3B DEVELOPMENT: PASS_WITH_ADJUDICATION_REQUIRED.**

Significato:

- il disegno `evidence_sufficient → alignment` resta supportato;
- non emergono errori sistematici;
- esiste però un caso di ground-truth/semantic-boundary che richiede una decisione umana prima del gate HOLDOUT;
- non è giustificata alcuna promozione di `TRAMA-ADR-009`;
- non è autorizzato alcun runtime;
- `DOS-A1` resta `RUNTIME_DEFERRED`.

## Gate suggerito

Prima di sbloccare HOLDOUT:

1. adjudicare umanamente `SA01-R3B-003` come `ALIGNED` o `PARTIAL`;
2. non modificare prompt, boundary o casi HOLDOUT sulla base del risultato;
3. registrare la decisione come annotazione post-preregistration;
4. solo dopo, valutare una distinta autorizzazione HOLDOUT.
