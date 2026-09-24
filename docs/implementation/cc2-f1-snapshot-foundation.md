# CC2-F1 — Snapshot & Evidence Foundation

**Data:** 24 settembre 2026  
**Stato:** IMPLEMENTATION SLICE / READ_ONLY / HUMAN REVIEW REQUIRED

## Scopo

Introdurre il primo elemento eseguibile del Control Center v2 senza sostituire la v1 e senza assegnare ancora livelli di maturità automatizzati.

## Contenuto del primo slice

- catalogo macchina delle fonti locali autorizzate;
- builder deterministico dello snapshot;
- Phase Rail R1–R5 derivato da `status/ecosystem-status.json`;
- gate ECO-02/P1 e R3-F0 Exit;
- provenance/hash delle fonti;
- evidenze canoniche di base;
- dipendenze principali;
- candidati di espansione;
- workflow di validazione dedicato.

## Scelta conservativa

`areas` resta inizialmente vuoto.

Il sistema **non calcola ancora** `confirmedLevel` o `candidateLevel` dei domini finché:

1. i requisiti di ciascun livello non sono formalizzati per area;
2. le evidenze richieste non sono tipizzate;
3. esistono fixture PASS/PARTIAL/STALE/BLOCKED;
4. la regola è stata sottoposta a review umana.

Questa scelta evita una falsa precisione nella prima automazione.

## Fonti iniziali

- `STATUS.md`;
- `ROADMAP.md`;
- `status/ecosystem-status.json`;
- `docs/decisions/decision-register.json`.

Nessuna chiamata di rete è necessaria in questo slice.

## Contratto read-only

Il builder:

- legge file locali;
- calcola hash;
- produce JSON;
- non effettua chiamate esterne;
- non crea o modifica PR;
- non modifica documenti canonici;
- non promuove ADR;
- non autorizza runtime.

## Gate di uscita CC2-F1/A

- script Python sintatticamente valido;
- snapshot costruibile;
- riferimenti gate risolti;
- fonti mancanti marcabili come BLOCKED;
- workflow PASS;
- HUMAN EXACT-HEAD REVIEW — PASS.

## Slice successivo CC2-F1/B

Solo dopo il PASS:

- introdurre `MaturityAreaDefinition`;
- requisiti L0–L5 per le prime 3–4 aree;
- fixture e test deterministici;
- nessun frontend v2 ancora necessario.
