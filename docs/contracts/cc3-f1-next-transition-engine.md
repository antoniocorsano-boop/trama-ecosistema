# CC3-F1 — Next Transition Engine

## Scopo

CC3-F1 introduce una derivazione **deterministica, source-bound e read-only** delle transizioni possibili a partire dallo snapshot governato TRAMA.

Il motore non prevede quale evento accadrà. Espone soltanto ciò che può diventare eleggibile se cambiano gate o dipendenze già dichiarati.

## Input autorevole

- `control-center/data/ecosystem-snapshot.json`;
- gate espliciti;
- dipendenze esplicite;
- capability e stati già presenti nello snapshot.

Nessuna nuova fonte di autorità viene introdotta.

## Output

Ogni candidato usa il contratto `governed-forecast.schema.json` e deve dichiarare:

- soggetto e stato corrente;
- transizione candidata;
- gate bloccanti e dipendenze;
- evidence refs;
- confidence qualitativa riferita alla **certezza della derivazione**, non alla probabilità dell'esito;
- rationale e invalidators;
- impatto canonico, authority e runtime sempre `NONE`.

## Regole di derivazione F1

1. Un gate blocking non PASS produce una transizione candidata `ELIGIBLE_AFTER_GATE_PASS` per il gate stesso.
2. Una expansion candidate con dipendenza non soddisfatta produce `ELIGIBLE_WHEN_DEPENDENCIES_PASS`.
3. Nessun candidato è un ordine di priorità.
4. Nessun candidato implica che il gate passerà.
5. Nessuna transizione viene applicata automaticamente.
6. Il cambio dello snapshot invalida il forecast precedente.

## Guardrail

Restano vietati:

- probabilità o likelihood numeriche;
- score e overall score;
- ranking automatico;
- auto-promotion;
- mutation di stato, gate o maturity;
- write cross-product;
- runtime authorization;
- attivazione di DOS-A1.

## Gate di uscita

`GATE-CC3-F1-HUMAN` può passare solo dopo:

- validazione deterministica del motore;
- fixture con gate aperti e dipendenze non soddisfatte;
- verifica che output identico derivi da input identico;
- conferma umana che i candidati non siano presentati come previsioni di esito o priorità;
- exact-head review.

CC3-F2–F5 restano PLANNED.
