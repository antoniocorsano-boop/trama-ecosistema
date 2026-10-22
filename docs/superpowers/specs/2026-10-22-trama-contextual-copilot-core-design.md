# TRAMA Contextual Copilot Core — design di riuso cross-app

**Data:** 2026-10-22  
**Stato:** DRAFT — RESEARCH BASELINE / HUMAN REVIEW REQUIRED  
**Baseline TRAMA:** `main@f666239cfdb359ecf52342ed3502f4a60233ea45`  
**Consumatori iniziali:** Docente OS, registro-docente  
**Autorità di implementazione:** NON CONCESSA da questo documento  

## 1. Scopo

Definire un sottosistema riusabile che unifichi:

- azioni contestuali esposte da FAB, barra, menu o pannello;
- assistente/copilota contestuale;
- ricerca semantica e retrieval locali;
- instradamento degli intenti;
- policy di accesso e human-in-the-loop;
- adapter applicativi per domini differenti.

Il componente non deve essere un “FAB intelligente” specifico di Docente OS. Il FAB è una superficie di presentazione di un motore più generale. Il core deve poter essere riusato in `registro-docente` e in futuri prodotti senza duplicare logica, provider o policy.

## 2. Esito atteso

Il primo incremento è riuscito quando la stessa libreria/core può:

1. ricevere un contesto reale da Docente OS e proporre azioni coerenti;
2. ricevere un contesto reale da registro-docente e proporre azioni coerenti;
3. farlo senza introdurre `if (app == ...)` o dipendenze dai domini verticali nel core;
4. funzionare senza provider generativo configurato;
5. mantenere ogni write sotto policy esplicita e controllo umano;
6. usare, quando disponibile, un servizio semantico locale senza rendere il modello una dipendenza del dominio.

## 3. Baseline esistente da preservare

### 3.1 Docente OS

Docente OS possiede già una decisione architetturale accettata per l’assistente contestuale:

- `assistant-ui` è il layer collaborativo iniziale;
- il dominio non dipende dalla libreria UI;
- l’integrazione passa da adapter/presentation layer e `AiOrchestratorPort`;
- i provider sono intercambiabili;
- Ollama è un adapter opzionale, non una dipendenza del prodotto;
- il sistema deve continuare a funzionare senza provider AI;
- le azioni AI sono classificate per livello di rischio e le write sono soggette a preview/undo o conferma.

Il presente design **non sostituisce** questa ADR. La generalizza verso un contratto cross-app e deve rimanere compatibile con essa.

### 3.2 registro-docente

registro-docente possiede già una linea concreta di embedding locale:

- servizio `embeddingService` esistente;
- supporto per endpoint locali loopback;
- strategie compatibili con OpenAI `/v1/embeddings`, llama.cpp `/embedding` e Ollama `/api/embeddings`;
- fallback proxy;
- configurazione locale/remote esplicita;
- data classification e controllo del flusso verso provider locale o remoto;
- configurazione UI per motore embedding locale Termux / llama.cpp / Ollama;
- modello locale configurabile, con default corrente che include `models/embeddinggemma-2.gguf` per la strategia OpenAI-compatible.

Il presente design deve **riusare o estrarre** questi concetti, non reimplementarli in parallelo.

## 4. Principio architetturale

Separare nettamente quattro livelli:

```text
Application / Domain
        │
        ▼
Context Adapter
        │
        ▼
Contextual Copilot Core
  ├─ Context Engine
  ├─ Action Registry
  ├─ Intent Resolver
  ├─ Policy Engine
  └─ Copilot Orchestrator
        │
        ├───────────────┐
        ▼               ▼
Semantic Port       Generative Port
        │               │
        ▼               ▼
Local/remote        Local/remote
embedding/RAG       model provider

Presentation Adapters
  ├─ FAB
  ├─ action sheet
  ├─ chat/panel
  └─ future voice surface
```

Il dominio non importa provider AI, librerie di chat, vector store o componenti FAB.

## 5. Contratto di contesto comune

Il core riceve uno snapshot minimale e provider-neutral.

```ts
export interface ContextSnapshot {
  appId: string
  surface: string
  entities: ContextEntity[]
  capabilities: CapabilityId[]
  permissions: PermissionId[]
  privacy: PrivacyContext
  temporal?: TemporalContext
  state?: string
}
```

Regole:

- `appId` identifica il consumatore ma non deve generare branching nel core;
- `surface` è semantica, non una route tecnica;
- `entities` porta riferimenti minimi alle entità del contesto corrente;
- `capabilities` dichiara ciò che l’app consente in quella superficie;
- `permissions` e `privacy` delimitano ciò che è lecito leggere, proporre o scrivere;
- nessun oggetto provider-specifico entra nel contratto.

## 6. Vocabolario delle capability

Il core lavora su capability/intenti generali. Primo set candidato:

```text
ASK
SEARCH
OPEN
CREATE
ANNOTATE
SUMMARIZE
PREPARE
CONTINUE
REMIND
LINK
IMPORT
REVIEW
EXPLAIN
```

Le verticali realizzano queste capability tramite adapter.

Esempi:

- Docente OS `ANNOTATE` → annotazione sulla lezione corrente;
- registro-docente `ANNOTATE` → annotazione professionale su classe/UDA/data;
- Docente OS `PREPARE` → preparazione della lezione;
- registro-docente `REVIEW` → lettura guidata di dati/andamento con evidenze.

Il core non deve conoscere `Lesson`, `UDA`, `ClassDiary`, `Analytics` o altre entità verticali.

## 7. Action Registry e resolver

```ts
export interface ContextualAction {
  id: string
  capability: CapabilityId
  label: string
  priority: number
  risk: ActionRisk
  requiresGenerativeAI: boolean
  requiresSemanticSearch: boolean
}
```

L’`ActionResolver` combina:

1. capability dichiarate dall’app;
2. stato corrente;
3. policy;
4. segnali semantici opzionali;
5. preferenze d’uso locali opzionali.

Ordine di autorità:

```text
Policy > capabilities app > stato > semantica > preferenze
```

Un embedding o un modello generativo non può abilitare una capability che l’app non ha dichiarato.

## 8. FAB come presentation adapter

Il FAB non contiene logica di dominio.

Riceve soltanto azioni già risolte:

```ts
<ContextualFab actions={resolvedActions} onAction={dispatch} />
```

Sul mobile può mostrare 3–4 azioni ad alta pertinenza e un ingresso esplicito al copilota. Su desktop lo stesso set può essere reso come toolbar o action sheet.

La riusabilità richiesta è quindi del **motore**, non della sola geometria/animazione del FAB.

## 9. Copilota contestuale

Il copilota usa lo stesso `ContextSnapshot` delle azioni rapide.

```ts
export interface CopilotRequest {
  context: ContextSnapshot
  message: string
  allowedCapabilities: CapabilityId[]
}
```

Il copilota può:

- rispondere;
- cercare;
- spiegare;
- sintetizzare;
- preparare una proposta di azione.

Non può trasformare autonomamente una proposta in write se la policy non lo consente.

## 10. Human-in-the-loop

Si preserva la classificazione già introdotta da Docente OS:

```text
READ_ONLY
PROPOSE
WRITE_REVERSIBLE
WRITE_EXTERNAL
INSTITUTIONAL_DECISION
```

Regole minime:

- `READ_ONLY`: nessuna mutazione;
- `PROPOSE`: output non persistito finché il docente non accetta;
- `WRITE_REVERSIBLE`: preview e/o undo secondo la verticale;
- `WRITE_EXTERNAL`: conferma esplicita obbligatoria;
- `INSTITUTIONAL_DECISION`: mai delegata al modello; conferma/autorità umana esplicita.

Le policy sono valutate **prima** del dispatch dell’azione.

## 11. Semantic Port condivisa

Il core non dipende da EmbeddingGemma, Ollama, llama.cpp o da un vector store specifico.

```ts
export interface SemanticPort {
  embed(text: string, context: SemanticDataContext): Promise<number[]>
  search(request: SemanticSearchRequest): Promise<SemanticHit[]>
  classify?(request: IntentClassificationRequest): Promise<IntentScore[]>
  rank?(request: ActionRankingRequest): Promise<RankedAction[]>
}
```

Adapter possibili:

```text
LocalLlamaCppSemanticAdapter
LocalOllamaSemanticAdapter
RemoteSemanticAdapter
NoSemanticAdapter
```

La baseline esistente di registro-docente costituisce il riferimento operativo iniziale per endpoint loopback, fallback e classificazione del flusso dati.

## 12. Local Semantic Runtime

Obiettivo architetturale:

```text
Android / Desktop
      │
      ▼
Local Semantic Runtime
  ├─ embedding endpoint
  ├─ retrieval/index
  ├─ namespace isolation
  └─ optional local generator
```

Il runtime può essere servito in sviluppo da Termux + llama.cpp/Ollama, ma questa combinazione non diventa una dipendenza del prodotto.

Namespace iniziali candidati:

```text
shared-professional/
docente-os/
registro-docente/
curriculum/
```

La separazione logica dei namespace non sostituisce la data classification: un dato vietato non può essere indicizzato o recuperato solo perché esiste un namespace dedicato.

## 13. Privacy e data classification

Il sistema deve distinguere almeno:

```text
PUBLIC_APP
TEACHER_PROFESSIONAL
CURRICULUM
STUDENT_PERSONAL
STUDENT_SENSITIVE
INSTITUTIONAL
```

Il set definitivo deve essere armonizzato con le classificazioni già presenti in registro-docente e con le policy di Docente OS.

Principio fail-closed:

- corpus professionale/curricolare può essere indicizzato se consentito;
- dati studente non entrano automaticamente nel corpus semantico;
- ogni passaggio verso provider remoto richiede policy esplicita;
- il modello non decide la classificazione di autorità;
- assenza di una regola = deny per classi protette.

## 14. Adapter iniziali

### 14.1 Docente OS adapter

Primo contesto di prova:

```text
surface = LESSON_CONDUCT
capabilities = [ANNOTATE, OPEN, REVIEW, ASK]
```

Azioni attese, a titolo di esempio:

- annota;
- apri materiale;
- segna da riprendere;
- chiedi al copilota.

L’adapter deve rispettare `AiOrchestratorPort` e l’ADR esperienza già accettata.

### 14.2 registro-docente adapter

Primo contesto di prova:

```text
surface = CLASS_OR_UDA
capabilities = [ANNOTATE, SEARCH, REVIEW, ASK]
```

Azioni attese, a titolo di esempio:

- annotazione professionale;
- ricerca attività/materiali;
- revisione guidata;
- chiedi al copilota.

Il primo adapter non deve estendere l’accesso ai dati studente oltre ciò che l’applicazione già autorizza.

## 15. Modalità senza IA generativa

Il sistema deve fornire valore anche con `NoGenerativeProvider`.

Esempi che possono essere risolti con contesto + semantica + applicazione:

- trovare un materiale;
- aprire una risorsa pertinente;
- classificare una richiesta in un insieme chiuso di intenti;
- ordinare azioni candidate;
- recuperare una nota professionale.

Questo riduce latenza, costi, dipendenza da rete e superficie di rischio.

## 16. Personalizzazione

La personalizzazione è opzionale e subordinata alla policy.

Prima fase:

- contesto deterministico;
- stato dell’attività;
- capability dichiarate.

Seconda fase eventuale:

- frequenza d’uso locale;
- riordinamento delle azioni entro l’insieme già consentito.

La personalizzazione non deve creare nuove capability né inviare telemetria comportamentale per funzionare.

## 17. Approcci considerati

### A. FAB specifico per ogni applicazione

**Vantaggio:** implementazione iniziale rapida.  
**Svantaggio:** duplicazione immediata di contesto, intenti, AI e policy.  
**Decisione:** scartato come fondazione.

### B. Libreria UI condivisa con logica applicativa separata

**Vantaggio:** riuso grafico.  
**Svantaggio:** duplica la parte più costosa, cioè semantica, policy e orchestrazione.  
**Decisione:** insufficiente da sola.

### C. Core headless condiviso + adapter verticali + presentation adapter

**Vantaggio:** riuso della logica senza imporre UI, provider o dominio.  
**Svantaggio:** richiede contratti iniziali più rigorosi.  
**Decisione raccomandata:** sì.

## 18. Non-obiettivi del primo incremento

Non fanno parte della prima implementazione:

- valutazione rapida del singolo alunno;
- indicizzazione indiscriminata dei dati studente;
- agente autonomo;
- generative UI complessa;
- memoria conversazionale cloud obbligatoria;
- voice assistant completo;
- multimodalità completa;
- scelta definitiva del modello generativo;
- migrazione del dominio delle applicazioni nel core condiviso.

## 19. Prova di riusabilità obbligatoria

Il primo incremento deve includere una prova automatizzata equivalente a:

```text
Given Docente OS LESSON_CONDUCT
When Contextual Core resolves actions
Then actions are valid for declared capabilities

Given registro-docente CLASS_OR_UDA
When the same Contextual Core resolves actions
Then actions are valid for declared capabilities

And the core contains no app-specific branch
And no action forbidden by policy is returned
```

Il test deve fallire se il core introduce dipendenze da route, componenti o tipi verticali.

## 20. Criteri di uscita del design

Il design può passare a implementation planning quando:

1. è confermato il confine `core / adapter / semantic / presentation`;
2. è confermato il riuso dei principi già esistenti in Docente OS e registro-docente;
3. è definita la classificazione minima dei dati;
4. è accettata la regola `Policy > app capabilities > state > semantic > preferences`;
5. è accettato che il sistema funzioni senza provider generativo;
6. è accettata la prova cross-app come gate obbligatorio.

## 21. Fallback se la riusabilità completa non regge

La strategia non è “tutto condiviso oppure fallimento”.

Se la prova reale mostra differenze sostanziali:

- si mantiene condiviso il core che resta semanticamente stabile;
- si spostano le differenze negli adapter verticali;
- si possono avere presentation adapter differenti;
- semantic runtime e provider restano condivisi solo dove il beneficio è dimostrato.

Non si conserva un’astrazione soltanto per eleganza. Il confine viene spostato verso il punto in cui le due applicazioni divergono realmente.

## 22. Decisione proposta

Adottare come direzione di progetto:

**Contextual Copilot Core headless, provider-neutral, privacy-first, riusabile da Docente OS e registro-docente, con Local Semantic Runtime opzionale e UI intercambiabili.**

Nessuna implementazione è autorizzata da questo documento prima della Human Review della specifica e del successivo implementation plan.
