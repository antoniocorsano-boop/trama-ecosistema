# ActivityPackage v1 — contratto sperimentale

**Data:** 23 settembre 2026  
**Stato:** EXPERIMENTAL / NO_RUNTIME_AUTHORIZATION  
**Parent:** ATLAS-PERCHÉ-01/02/03

## Decisione

Lo schema sperimentale deve rappresentare tutti i cinque pilot senza introdurre dati personali, punteggi cognitivi o dipendenze da account.

File canonico sperimentale: `activity-package-v1.schema.json`.

## Invarianti

- binding curricolare per riferimento ad Arena;
- nessuna copia autorevole degli obiettivi;
- nessun nome/ID/e-mail studente;
- risposte locali opzionali;
- nessuna sincronizzazione obbligatoria;
- diritti/licenze espliciti;
- target WCAG 2.2 AA;
- supporto a fasi `OFFSCREEN`;
- modalità `CLASS | STUDENT | BOTH`;
- offline dichiarato, non implicito;
- nessun punteggio sulla qualità del pensiero.

## Validazione rispetto ai pilot

- P1 Infanzia: `CLASS`, `OFFSCREEN`, nessuno stato persistente;
- P2 Primaria 2ª: `CLASS/BOTH`, indizi, risposta orale o locale;
- P3 Primaria 5ª: `BOTH`, confronto evidenze, stato locale;
- P4 Secondaria 1ª: costruzione fisica fuori schermo, revisione locale;
- P5 Secondaria 3ª: `STUDENT`, fonti/materiali con rights gate e annotazioni locali.

## Punto aperto

`$id` usa un dominio segnaposto finché non viene definito il namespace canonico di schema TRAMA. Prima del runtime deve essere sostituito.

## Gate

Lo schema non diventa contratto runtime finché non supera:
- review cross-product;
- test con esempi validi/invalidi;
- security/privacy review;
- rights review;
- implementazione prototipale Atlas;
- test offline/browser;
- review umana exact-head.
