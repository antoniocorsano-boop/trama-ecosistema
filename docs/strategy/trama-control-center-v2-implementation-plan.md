# TRAMA Control Center v2 — Piano di implementazione

**Data:** 24 settembre 2026  
**Stato:** PROPOSTA OPERATIVA / NO RUNTIME AUTHORIZATION

## 1. Obiettivo

Portare il Control Center dalla v1 attuale alla v2 senza perdere stabilità, PWA, accessibilità e capacità di fallback.

## 2. Regola di lavoro

Ogni fase deve chiudersi con:

1. output verificabile;
2. test automatici;
3. evidenza visuale;
4. review umana;
5. aggiornamento documentale.

Nessuna fase successiva sostituisce la chiusura della precedente.

## 3. Fase CC2-F0 — Baseline e contratti

Output:

- specifica prodotto v2;
- maturity model;
- architettura;
- UI spec;
- schema snapshot;
- catalogo fonti.

Gate:

- nessuna contraddizione con STATUS/ROADMAP;
- nessuna nuova authority;
- maturity model spiegabile;
- approvazione umana del perimetro.

## 4. Fase CC2-F1 — Snapshot & Evidence Foundation

Output:

- collector;
- normalizer;
- evidence registry;
- `ecosystem-snapshot.json`;
- JSON Schema;
- snapshot fixture per test.

Gate:

- stessa informazione fondamentale della v1;
- nessun token browser;
- fallimento parziale gestito;
- provenance completa.

## 5. Fase CC2-F2 — Frontend Foundation

Output:

- React/TypeScript/Vite;
- design token;
- shadcn/Radix;
- routing;
- shell PWA;
- component catalogue.

Gate:

- parity funzionale con v1;
- mobile;
- offline;
- tastiera;
- axe;
- nessuna regressione di sicurezza.

## 6. Fase CC2-F3 — Maturity & Evidence

Output:

- Phase Rail;
- Maturity Matrix;
- dettaglio area;
- Gate Panel;
- Evidence Table;
- freshness.

Gate:

- nessun valore non spiegabile;
- drill-down da ogni stato alle evidenze;
- fixture con casi PASS/PARTIAL/STALE/BLOCKED;
- review umana del modello.

## 7. Fase CC2-F4 — Ecosystem Intelligence

Output:

- grafo XYFlow;
- dipendenze;
- espansioni candidate;
- attenzione richiesta;
- vista elenco equivalente.

Gate:

- nessuna relazione inventata;
- edge type derivati da dati;
- navigazione tastiera;
- mobile semplificato;
- leggibilità LIM.

## 8. Fase CC2-F5 — History & Regression Intelligence

Output:

- snapshot storico;
- trend;
- regressioni riaperte;
- evidence aging;
- confronto tra due snapshot.

Gate:

- nessuna interpretazione causale non supportata;
- distinzione attività/maturazione;
- storicizzazione append-only.

## 9. Fase CC2-F6 — Exit

Checklist:

- desktop;
- mobile;
- LIM;
- PWA;
- offline;
- fonte degradata;
- WCAG 2.2 AA;
- visual regression;
- performance;
- security;
- documentazione;
- human exact-head review.

Esito:

- v2 pronta a sostituire v1;
- v1 mantenuta temporaneamente come rollback.

## 10. Ordine delle PR

PR piccole e verificabili:

1. documentazione e schemi;
2. snapshot foundation;
3. frontend foundation;
4. design system;
5. maturity matrix;
6. graph;
7. history;
8. exit/hardening.

Non un’unica PR monolitica.

## 11. Definition of Done per componente

Ogni componente è completo quando:

- dati reali o fixture tipizzata;
- loading/empty/error/stale;
- tastiera;
- accessibilità;
- responsive;
- test;
- screenshot;
- documentazione.

## 12. Rischi e contromisure

### Rischio: dashboard bella ma non affidabile
Contromisura: ogni dato deriva da snapshot tipizzato.

### Rischio: maturity score arbitrario
Contromisura: livelli a prerequisiti, niente media unica.

### Rischio: duplicazione di STATUS.md
Contromisura: STATUS resta fonte canonica; il Control Center sintetizza e collega.

### Rischio: overload informativo
Contromisura: vista strategica separata da vista tecnica.

### Rischio: nuovo collo di bottiglia
Contromisura: collector resiliente, fallback snapshot, fonti indipendenti.

### Rischio: regressione grafica
Contromisura: baseline Playwright e review screenshot.

### Rischio: librerie eccessive
Contromisura: adottare solo dipendenze con funzione chiara; wrappers TRAMA per i componenti critici.

## 13. Sequenza rispetto ai cantieri TRAMA

La v2 può partire in **design/documentation e foundation read-only** senza modificare l’ordine canonico di prodotto.

Non deve:

- anticipare R3-P4;
- autorizzare DOS-A1;
- ritardare la chiusura ECO-02/P1;
- sostituire F4/F5 Atlas.

Le fasi implementative pesanti vanno pianificate evitando conflitto con i gate già prioritari.

## 14. Prima iterazione consigliata

Primo incremento implementativo dopo approvazione documentale:

**CC2-F1 + shell minima CC2-F2**

Obiettivo:

- produrre uno snapshot unico;
- visualizzare Phase Rail;
- mostrare 3–4 aree di maturità;
- mantenere la v1 disponibile;
- validare il modello prima di costruire tutto il cruscotto.

## 15. Criterio di arresto

Se il modello non riesce a spiegare chiaramente perché un livello è assegnato, non si procede ad aggiungere nuove visualizzazioni: si corregge il modello dati prima della UI.
