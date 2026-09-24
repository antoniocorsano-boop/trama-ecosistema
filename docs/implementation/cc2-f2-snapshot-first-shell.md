# CC2-F2 — Snapshot-first Control Center shell

**Data:** 24 settembre 2026  
**Stato:** IMPLEMENTATION SLICE / READ_ONLY / HUMAN REVIEW REQUIRED

## Scopo

Portare il Control Center v2 dalla foundation dati a una prima superficie utente coerente con la specifica UI/UX, usando lo snapshot governato come sorgente primaria.

## Contenuto

- Phase Rail R1–R5;
- KPI derivati dallo snapshot;
- matrice di maturità L0–L5;
- pannello Attenzione richiesta per gate bloccanti;
- vista delle dipendenze dell’ecosistema;
- pannello Espansioni con prerequisiti;
- elenco evidenze con provenienza e freshness;
- PWA responsive desktop/mobile;
- fallback offline sull’ultimo snapshot locale;
- snapshot statico incluso nel pacchetto PWA.

## Vincoli

- READ_ONLY;
- nessuna API GitHub chiamata dal browser;
- nessun token;
- nessuna write;
- nessun overall score;
- nessuna auto-promozione;
- nessuna nuova authority;
- nessuna autorizzazione runtime.

## Nota architetturale

Il browser consuma esclusivamente `control-center/data/ecosystem-snapshot.json`.
La generazione/aggiornamento dello snapshot resta responsabilità del layer collector/build governato, non della UI.

## Gate

- Validate TRAMA Control Center PASS;
- Governance PASS;
- review indipendente;
- HUMAN EXACT-HEAD REVIEW — PASS.
