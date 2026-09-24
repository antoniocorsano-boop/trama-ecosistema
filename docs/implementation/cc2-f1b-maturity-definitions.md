# CC2-F1/B — Maturity Area Definitions

**Data:** 24 settembre 2026  
**Stato:** IMPLEMENTATION SLICE / DECLARATIVE / HUMAN REVIEW REQUIRED

## Scopo

Formalizzare le prime quattro aree di maturità del Control Center v2 in modo dichiarativo, deterministico e testabile.

## Aree iniziali

- Governance e authority;
- Arena;
- Atlas;
- Docente OS.

## Regola

Il livello confermato è il massimo livello consecutivo per il quale tutti i tipi di evidenza obbligatori sono presenti con stato PASS.

Il motore di questo slice:

- non cerca evidenze su GitHub;
- non modifica snapshot canonici;
- non calcola candidateLevel;
- non chiude gate;
- non promuove ADR;
- non autorizza runtime.

## Perché niente candidateLevel ancora

Il livello candidato dipende da gate conclusivi, freshness e vincoli di governance. Questi elementi vanno integrati in un successivo incremento per evitare scorciatoie semantiche.

## Fixture iniziale

La fixture dimostra deliberatamente stati diversi:

- governance → L4;
- Arena → L3;
- Atlas → L3 nonostante accessibilità PASS, perché manca HUMAN_REVIEW per L4;
- Docente OS → L3 nonostante canary PASS, perché manca HUMAN_REVIEW per L4.

Questo dimostra che evidenze avanzate non consentono di saltare prerequisiti.

## Gate di uscita

- valutazione deterministica PASS;
- nessun salto di livello;
- nessuna auto-promozione;
- Governance workflow PASS;
- review indipendente;
- HUMAN EXACT-HEAD REVIEW — PASS.
