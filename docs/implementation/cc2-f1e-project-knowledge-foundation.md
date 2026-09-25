# CC2-F1/E — Project Knowledge Foundation

**Data:** 24 settembre 2026  
**Stato:** PROPOSED IMPLEMENTATION SLICE / DOCUMENTATION FOUNDATION  
**Dipende da:** CC2-F1/D  
**Runtime:** READ-ONLY / NO NEW AUTHORITY / HUMAN REVIEW REQUIRED

## Obiettivo

Preparare il TRAMA Control Center v2 a funzionare come knowledge base operativa e context provider governato per il lavoro umano e agentico.

## Deliverable

### D1 — Project Knowledge Architecture

Documento: `docs/architecture/trama-project-knowledge-agent-context-v1.md`.

Definisce:

- Observatory;
- Project Knowledge Base;
- Context Provider;
- knowledge events;
- negative knowledge;
- provenance;
- uso agentico.

### D2 — ProjectContextSnapshot v1

Documento: `docs/contracts/project-context-snapshot-v1.md`.

Definisce il contratto della memoria operativa corrente, distinto dallo snapshot di maturità.

### D3 — Decisione di governance

TRAMA-ADR-015 propone il Control Center come memoria operativa read-only e provider di contesto, senza modificarne le authority.

### D4 — Source Registry

Il registro delle fonti deve includere il dominio `project-knowledge-projection`, dichiarando esplicitamente che la proiezione appartiene a TRAMA ma deriva dalle fonti autorevoli dei singoli domini.

### D5 — Context Pack

Deve essere specificato un output minimo per richieste focalizzate, con provenance e `asOf`.

## Lavoro tecnico successivo

Questa slice documentale non introduce ancora collector o API.

Una successiva implementazione F1/E dovrà prevedere:

1. schema JSON di `ProjectContextSnapshot`;
2. schema dei `KnowledgeEvent`;
3. builder deterministico read-only;
4. fixture positive/negative;
5. rilevamento di supersession;
6. retention degli stati REJECTED/DEFERRED/SUPERSEDED;
7. generatore di Context Pack;
8. fail-closed sulle fonti obbligatorie;
9. workflow di validazione.

## Criteri di accettazione

- nessun conflitto con ADR-003 sulla base di conoscenza federata;
- nessun conflitto con ADR-014 sull'osservatorio read-only;
- nessuna nuova authority;
- nessuna promozione automatica;
- provenance obbligatoria;
- freshness applicabile;
- exact-head binding per informazioni tecniche forti;
- distinzione tra stato corrente e memoria storica;
- negative knowledge preservata;
- `ProjectContextSnapshot != MaturitySnapshot`;
- Context Pack derivato, non canonico;
- HUMAN EXACT-HEAD REVIEW — PASS.

## Anti-pattern esplicitamente esclusi

- copiare integralmente tutte le fonti in un secondo repository di verità;
- salvare trascrizioni di chat come knowledge base canonica;
- considerare la memoria conversazionale come stato tecnico;
- mantenere SHA o stato PR senza freshness/version binding;
- eliminare le decisioni rifiutate dal corpus;
- usare retrieval semantico non governato come prova di stato;
- autorizzare azioni perché “il cruscotto dice che è pronto”.

## Efficienza attesa

Il risultato atteso non è una riduzione artificiale dei documenti, ma una riduzione del contesto necessario per ogni operazione:

```text
intero corpus
   ↓
ProjectContextSnapshot
   ↓
Context Pack mirato
   ↓
azione informata
```

Ogni ottimizzazione deve preservare verificabilità e possibilità di risalire alla fonte.
