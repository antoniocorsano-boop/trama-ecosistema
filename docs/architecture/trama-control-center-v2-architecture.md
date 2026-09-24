# TRAMA Control Center v2 — Architettura

**Data:** 24 settembre 2026  
**Stato:** PROPOSTA ARCHITETTURALE / READ_ONLY / NO WRITE AUTHORITY

## 1. Decisione architetturale

La v2 deve superare l’attuale pagina HTML monolitica e diventare una piccola applicazione modulare, mantenendo deploy statico e comportamento read-only.

Stack target:

- React;
- TypeScript;
- Vite;
- shadcn/ui;
- Radix UI;
- Tailwind CSS;
- Apache ECharts;
- XYFlow / React Flow;
- TanStack Table;
- Lucide;
- Motion solo per micro-transizioni;
- Zod e/o JSON Schema;
- Playwright;
- axe-core;
- vite-plugin-pwa.

## 2. Motivo

L’attuale `control-center/index.html` include:

- struttura;
- CSS;
- logica;
- chiamate GitHub;
- rendering;
- stato offline.

È adeguato alla v1, ma non scala bene verso:

- matrice di maturità;
- grafo relazionale;
- drill-down;
- storico;
- test visuali;
- design system;
- molteplici viste.

## 3. Architettura dati target

```text
GitHub + documenti canonici + receipts pubbliche
        │
        ▼
Collector deterministico
        │
        ▼
Normalizer / Evidence Registry
        │
        ▼
Maturity Engine
        │
        ▼
ecosystem-snapshot.json
        │
        ├── current
        └── history/
               │
               ▼
TRAMA Control Center v2
```

## 4. Collector

Il collector legge soltanto fonti autorizzate e pubbliche/appropriate:

- repository TRAMA;
- Arena;
- Atlas;
- Docente OS;
- workflow;
- PR;
- exact head;
- STATUS.md;
- ROADMAP.md;
- documenti canonici dichiarati.

Il collector non prende decisioni di maturità.

## 5. Normalizer

Trasforma le fonti in oggetti stabili:

- Product;
- Program;
- Phase;
- Gate;
- Evidence;
- Dependency;
- MaturityArea;
- ExpansionCandidate.

## 6. Maturity Engine

Input:

- modello versionato;
- evidenze normalizzate;
- gate;
- dipendenze;
- blocchi di governance.

Output:

- livello confermato;
- livello candidato;
- confidence;
- gate residui;
- motivazione macchina leggibile;
- stato di freschezza.

Non modifica le fonti.

## 7. Snapshot

Formato logico minimo:

```json
{
  "schemaVersion": "1",
  "generatedAt": "...",
  "sourceState": {},
  "phases": [],
  "areas": [],
  "gates": [],
  "evidence": [],
  "dependencies": [],
  "expansionCandidates": []
}
```

## 8. Strategia di aggiornamento

Preferenza:

- GitHub Actions genera lo snapshot;
- la UI legge un unico endpoint/static asset;
- fallback locale all’ultimo snapshot valido;
- lo snapshot conserva riferimenti alle fonti originali.

Vantaggi:

- meno rate-limit nel browser;
- rendering deterministico;
- test più semplici;
- audit riproducibile;
- storico possibile;
- nessun token GitHub nel browser.

## 9. Frontend

Struttura proposta:

```text
control-center/
  src/
    app/
    components/
    features/
      maturity/
      ecosystem/
      evidence/
      gates/
      roadmap/
      history/
    data/
    design-system/
    accessibility/
  public/
  tests/
```

## 10. Componenti principali

- `PhaseRail`;
- `MaturityMatrix`;
- `MaturityAreaDrawer`;
- `EcosystemGraph`;
- `AttentionPanel`;
- `ExpansionPanel`;
- `EvidenceTable`;
- `GateTimeline`;
- `FreshnessIndicator`;
- `SourceHealth`;
- `HistoryTrend`.

## 11. Accessibilità

Requisiti:

- WCAG 2.2 AA;
- tastiera completa;
- focus percepibile;
- alternative tabellari per grafici;
- nessuna informazione affidata soltanto al colore;
- contrasto non-text;
- reflow 320 CSS px;
- reduced motion;
- nomi accessibili per nodi e controlli.

## 12. PWA e offline

La v2 conserva:

- installabilità;
- shell offline;
- ultimo snapshot valido;
- indicazione esplicita della freschezza;
- nessuna persistenza di dati personali.

Offline non significa “dati attuali”: la UI deve mostrare timestamp e stato stale.

## 13. Sicurezza

Vincoli:

- nessun token GitHub nel browser;
- nessuna API di scrittura;
- nessun endpoint amministrativo;
- allowlist delle fonti;
- schema validation dello snapshot;
- escaping e sanitizzazione dei contenuti;
- Content Security Policy compatibile con hosting statico.

## 14. Test

### Unit
- maturity engine;
- normalizer;
- freshness;
- dipendenze.

### Component
- stati empty/loading/error/stale;
- keyboard;
- screen reader semantics.

### End-to-end
- desktop;
- mobile;
- LIM;
- offline;
- degraded source.

### Visual regression
Screenshot baseline per:

- 1440 desktop;
- smartphone Android-like;
- LIM;
- dark mode canonica.

Ogni delta visuale significativo deve essere reviewabile.

## 15. Migrazione dalla v1

La migrazione deve essere incrementale:

1. congelare la v1 come fallback;
2. introdurre snapshot v1;
3. creare shell React v2;
4. replicare funzionalità v1;
5. aggiungere maturity/evidence;
6. aggiungere grafo e storico;
7. sostituire il deploy solo dopo parity + review.

Nessun “big bang”.
