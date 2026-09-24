# CC2-F1/C — Snapshot Maturity Wiring

**Data:** 24 settembre 2026  
**Stato:** IMPLEMENTATION SLICE / CONSERVATIVE / HUMAN REVIEW REQUIRED

## Scopo

Collegare le definizioni di maturità integrate con CC2-F1/B allo snapshot generato da CC2-F1/A, senza introdurre candidate promotion o falsa precisione.

## Regole di questo slice

Per le aree iniziali Governance, Arena, Atlas e Docente OS:

- `confirmedLevel` deriva soltanto dalle evidenze PASS effettivamente presenti nello snapshot;
- `candidateLevel = confirmedLevel`;
- `status = PARTIAL`;
- `confidence = LOW`;
- i gate bloccanti non PASS sono collegati all'area quando il relativo `gate.area` coincide;
- nessuna evidenza mancante viene inferita.

## Motivazione

Il collector corrente copre ancora soprattutto fonti canoniche locali. Non raccoglie in modo completo PR exact-head, CI, accessibility, runtime canary e review dei repository di dominio. Per questo motivo un livello basso nello snapshot CC2-F1/C significa **copertura evidenziale incompleta**, non una valutazione negativa del prodotto.

## Cosa non fa

- non legge GitHub o API esterne;
- non calcola candidate level superiore al confirmed;
- non chiude gate;
- non promuove ADR;
- non autorizza runtime;
- non sostituisce STATUS.md o ROADMAP.md.

## Gate

- schema snapshot PASS;
- wiring delle quattro aree PASS;
- candidate == confirmed;
- status PARTIAL;
- confidence LOW;
- Governance PASS;
- review indipendente;
- HUMAN EXACT-HEAD REVIEW — PASS.
