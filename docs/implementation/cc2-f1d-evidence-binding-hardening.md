# CC2-F1/D — Evidence Binding & Hardening

**Data:** 24 settembre 2026  
**Stato:** IMPLEMENTATION SLICE / READ-ONLY / HUMAN REVIEW REQUIRED

## Scopo

Rafforzare il modello evidenziale del Control Center v2 senza aumentare artificialmente i livelli di maturità.

## Cambiamenti

- evidenze forti (`PR_EXACT_HEAD`, test/gate, runtime canary, human review) richiedono binding esplicito a capability, release ed exact head;
- freshness valutata realmente:
  - `TIME_BOUND` scaduta non contribuisce;
  - `EVENT_BOUND` richiede un riferimento evento/exact head;
  - `RUNTIME_BOUND` richiede release + exact head;
  - `MANUAL_REVIEW` richiede `reviewedAt`;
  - `UNTIL_CHANGE` richiede una sorgente/versione identificabile;
- dipendenze per-area esplicite;
- schema dedicato per le maturity definitions;
- fixture positive/negative per binding e scadenza.

## Invarianti

- read-only;
- nessuna API esterna;
- nessuna auto-promozione;
- nessuna chiusura automatica di gate;
- nessuna nuova authority;
- nessun runtime autorizzato;
- candidate level non supera il confirmed level.

## Limiti intenzionali

Il collector locale non inventa PR, CI, runtime o human review dei repository di dominio. F1/D rende il modello pronto a rifiutare evidenza debole/non vincolata quando tali collector saranno aggiunti.

## Gate

- Governance PASS;
- snapshot/schema PASS;
- maturity-definitions schema PASS;
- negative fixture unbound REJECTED;
- expired evidence EXCLUDED;
- read-only contract PASS;
- review indipendente;
- HUMAN EXACT-HEAD REVIEW — PASS.
