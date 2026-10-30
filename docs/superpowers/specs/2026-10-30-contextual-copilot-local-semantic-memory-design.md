# LSM-01 — Contextual Copilot Local Semantic Memory

**Data:** 2026-10-30  
**Stato:** DESIGN — DOCS ONLY  
**Baseline TRAMA:** `main@d11112434bb45364e7bddbee6d4df1a86f9b351a`  
**Consumer osservato:** `registro-docente@d496b51a5a1677c1c6893010c28bea2ba43dc91b`  
**Autorità di implementazione:** separata per contratto, runtime e consumer

## 1. Intento

Realizzare una memoria semantica locale condivisibile dai prodotti TRAMA senza creare una seconda fonte di verità professionale e senza trasformare un modello di embedding o un indice vettoriale in autorità applicativa.

L'obiettivo operativo è consentire a Contextual Copilot, Biblioteca, Registro Docente, Docente OS e futuri consumer di recuperare localmente materiali, memorie professionali e riferimenti curricolari pertinenti tramite un unico confine semantico, mantenendo però la proprietà canonica dei dati nel prodotto che li governa.

Il profilo di riferimento iniziale è Android + Termux + `llama.cpp` + EmbeddingGemma 2, ma nessuno di questi elementi deve diventare dipendenza obbligatoria del Core o dei consumer.

## 2. Evidenze già esistenti da preservare

### 2.1 Contextual Copilot Core

TRAMA possiede già:

- `@trama/contextual-copilot-core@0.3.0`;
- `SemanticPort` provider-neutral con modalità `local | remote`;
- `IntentPort` separato dall'autorità applicativa;
- `@trama/contextual-copilot-intent-embedding@0.1.0`, local-only e stateless;
- policy fail-closed, capability filtering e dispatch sotto autorità del Core.

LSM-01 non deve modificare il significato di questi contratti né attribuire authority alla ricerca semantica.

### 2.2 Registro Docente

Registro possiede già un `embeddingService` con:

- endpoint locale esclusivamente loopback;
- supporto OpenAI-compatible `/v1/embeddings`, `llama.cpp /embedding` e Ollama `/api/embeddings`;
- classificazione del flusso dati locale/remoto;
- configurazione locale con modello `models/embeddinggemma-2.gguf`;
- ricerca semantica locale esplicita nella Biblioteca;
- `ProfessionalMemoryStateV1` persistente con provenienza, classificazione privacy, correzione docente e selezione di un working set contestuale.

Questi elementi dimostrano che il problema non è più "aggiungere embedding", ma introdurre un indice condiviso senza duplicare memoria, policy o resolver.

## 3. Principio di autorità

La memoria semantica locale è **derivata e ricostruibile**.

```text
PRODOTTI CANONICI
  ├─ Registro: Biblioteca / Professional Memory / Planning
  ├─ Docente OS: lezioni / materiali / preparazione
  ├─ Arena: curricolo autorizzato
  └─ altri corpus consentiti
          │
          │ export/projection governata
          ▼
LOCAL SEMANTIC MEMORY
  ├─ chunk normalizzati
  ├─ embedding
  ├─ indice vettoriale
  ├─ provenance pointer
  └─ namespace logico
          │
          ▼
RETRIEVAL / RANKING
          │
          ▼
Contextual Copilot / consumer
```

Il runtime locale:

- non diventa fonte canonica di UDA, lezioni, memoria professionale o curricolo;
- non corregge né consolida autonomamente i dati sorgente;
- non produce write canoniche;
- può essere eliminato e ricostruito dalle fonti autorizzate;
- restituisce riferimenti e frammenti con provenance sufficiente a risalire all'oggetto canonico.

## 4. Approcci considerati

### A. Indice separato in ogni prodotto

**Vantaggi:** implementazione iniziale minima; nessun nuovo processo locale.  
**Svantaggi:** duplicazione, nessuna memoria cross-app reale, modelli/configurazioni divergenti.  
**Decisione:** insufficiente come fondazione condivisa.

### B. Termux come archivio canonico unico

**Vantaggi:** modello semplice "one memory, every agent".  
**Svantaggi:** crea una seconda authority concorrente con Professional Memory, Biblioteca, Arena e stato applicativo; difficile governare correzioni, cancellazioni e provenance.  
**Decisione:** scartato.

### C. Runtime locale condiviso come indice derivato

**Vantaggi:** una sola superficie di retrieval, nessuna duplicazione di authority, rebuild possibile, privacy locale, riuso cross-app.  
**Svantaggi:** richiede protocollo di projection/invalidation e health/versioning rigorosi.  
**Decisione:** selezionato.

## 5. Decomposizione del lavoro

LSM-01 è diviso in tre incrementi indipendenti:

1. **LSM-01A — Shared Contract**: envelope, policy, provenance, client/port e test di confine in TRAMA.
2. **LSM-01B — Termux Reference Runtime**: servizio loopback locale, SQLite + indice vettoriale, adapter verso endpoint embedding locale.
3. **LSM-01C — Consumer Adoption**: primo consumer Registro, poi Docente OS, con proiezioni governate e nessuna duplicazione della persistenza canonica.

Ogni incremento richiede qualificazione propria. LSM-01C non è autorizzato da LSM-01A/B.

## 6. Contratto dati LSM-01A

### 6.1 Projection document

```ts
export type SemanticMemoryDataClass =
  | 'PUBLIC_APP'
  | 'TEACHER_PROFESSIONAL'
  | 'CURRICULUM'
  | 'AGGREGATED_NON_IDENTIFIABLE';

export interface SemanticMemoryProjectionV1 {
  schema: 'trama.semantic-memory-projection/v1';
  sourceAppId: string;
  sourceType: string;
  sourceId: string;
  revision: string;
  namespace: string;
  title?: string;
  text: string;
  dataClass: SemanticMemoryDataClass;
  canonicalRef: string;
  updatedAt: string;
  metadata?: Readonly<Record<string, string>>;
}
```

Regole:

- `sourceAppId + sourceType + sourceId` identifica la sorgente logica;
- `revision` deve cambiare quando cambia il contenuto semantico proiettato;
- `canonicalRef` è obbligatorio e rimanda all'oggetto canonico;
- `text` contiene solo il testo autorizzato alla proiezione;
- metadata è allowlist string-to-string, mai payload arbitrario;
- `STUDENT_PERSONAL`, `STUDENT_SENSITIVE`, `INSTITUTIONAL` e classificazioni ambigue non appartengono al tipo ammesso v1.

### 6.2 Hit di retrieval

```ts
export interface SemanticMemoryHitV1 {
  sourceAppId: string;
  sourceType: string;
  sourceId: string;
  revision: string;
  namespace: string;
  canonicalRef: string;
  chunkId: string;
  text: string;
  score: number;
  dataClass: SemanticMemoryDataClass;
  metadata: Readonly<Record<string, string>>;
}
```

Uno hit è evidenza di pertinenza, non authority.

### 6.3 Port

```ts
export interface LocalSemanticMemoryPort {
  mode: 'local';
  health(): Promise<SemanticMemoryHealthV1>;
  upsert(projection: SemanticMemoryProjectionV1): Promise<SemanticMemoryUpsertReceiptV1>;
  remove(source: SemanticMemorySourceRefV1): Promise<SemanticMemoryRemoveReceiptV1>;
  search(request: SemanticMemorySearchRequestV1): Promise<readonly SemanticMemoryHitV1[]>;
}
```

Il package shared non implementa SQLite, rete, modello o file system. Può fornire validatori puri e un client loopback separato soltanto se il protocollo di rete è esplicitamente configurato dal consumer.

## 7. Protocollo locale LSM-01B

Il runtime di riferimento espone esclusivamente loopback.

Endpoint v1:

```text
GET    /v1/health
POST   /v1/projections/upsert
POST   /v1/projections/remove
POST   /v1/search
```

Vincoli:

- bind predefinito `127.0.0.1`;
- nessun bind `0.0.0.0` nel profilo di riferimento;
- nessun accesso remoto, discovery LAN o telemetria;
- payload JSON con schema/versione espliciti;
- limiti di dimensione e timeout definiti;
- errori tecnici distinti dal no-match (`hits: []`);
- nessun endpoint generico di SQL, file read o arbitrary path.

## 8. Persistenza locale

Il runtime usa SQLite come store derivato.

Schema logico minimo:

```text
projections
  source_app_id
  source_type
  source_id
  revision
  namespace
  canonical_ref
  data_class
  title
  updated_at
  metadata_json
  content_hash

chunks
  chunk_id
  source identity
  ordinal
  text
  text_hash

vectors
  chunk_id
  model_id
  dimensions
  embedding
```

L'indice vettoriale può usare `sqlite-vec` quando disponibile. L'implementazione deve avere un adapter di storage isolato così da poter usare una ricerca lineare controllata nei test e come fallback di sviluppo senza cambiare il contratto.

La base SQLite non è un backup professionale e non deve essere inclusa automaticamente nei backup canonici dei prodotti.

## 9. Chunking

V1 è text-only.

Regole iniziali:

- preservare il testo originale della projection a livello di hash, non come authority;
- chunk deterministici e riproducibili;
- limite espresso in caratteri UTF-8 o token stimati senza dipendere dal tokenizer del modello;
- overlap piccolo e deterministico;
- chunk id derivato da identità sorgente + revision + ordinal + text hash;
- cambio `revision` invalida tutti i chunk precedenti della stessa sorgente in una transazione.

I valori esatti sono fissati dal piano di implementazione, non dal Core.

## 10. Embedding runtime

Il runtime non incorpora EmbeddingGemma 2 nel contratto.

Profilo di riferimento:

```text
Android
  └─ Termux
      ├─ llama-server / altro endpoint locale embeddings
      └─ trama-semantic-memoryd
           ├─ SQLite
           └─ adapter embedding loopback
```

Requisiti:

- endpoint embedding esclusivamente loopback;
- modello e dimensione rilevati dal risultato/configurazione e registrati con l'indice;
- nessun fallback remoto automatico;
- cambio modello o dimensione rende l'indice incompatibile e richiede rebuild esplicito;
- failure del modello non viene tradotta in no-match.

EmbeddingGemma 2 è il modello di riferimento perché è progettato per embedding locali e supporta testo/codice con encoder dedicato; il protocollo rimane però compatibile con qualunque provider locale conforme.

V1 **non forza la truncation a 256 dimensioni**. Conserva la dimensionalità restituita dal runtime locale. L'ottimizzazione MRL a 256d può essere valutata in un incremento successivo con benchmark sul corpus reale.

## 11. Privacy

LSM-01 applica un allowlist di classi memorizzabili.

Ammesse v1:

```text
PUBLIC_APP
TEACHER_PROFESSIONAL
CURRICULUM
AGGREGATED_NON_IDENTIFIABLE
```

Negate v1:

```text
STUDENT_PERSONAL
STUDENT_SENSITIVE
INSTITUTIONAL
AMBIGUOUS / UNKNOWN
```

Principi:

- la classificazione è fornita dal consumer canonico; il runtime non la inventa;
- il runtime rivalida l'allowlist e fallisce chiuso;
- un namespace non può rendere ammesso un dato vietato;
- il retrieval non restituisce hit di classi diverse da quelle richieste/consentite;
- nessun contenuto indicizzato viene inviato a provider remoto dal runtime v1.

## 12. Namespace

Il namespace organizza, non autorizza.

Esempi candidati:

```text
shared-professional
registro/library
registro/professional-memory
docente-os/materials
curriculum/approved
```

Le query possono limitare i namespace, ma policy e data class restano controlli separati.

## 13. Rebuild e invalidation

Il runtime deve supportare questi casi senza residui:

1. nuovo oggetto canonico -> upsert projection;
2. stesso oggetto, stessa revision -> operazione idempotente;
3. stesso oggetto, revision nuova -> sostituzione atomica chunk/vector;
4. cancellazione canonica -> remove per identity;
5. cambio modello/dimensione -> indice dichiarato stale e rebuild;
6. database locale perso/cancellato -> rebuild completo dai consumer, senza perdita canonica.

La sincronizzazione automatica continua non è richiesta in v1. Il primo consumer può usare refresh esplicito o projection-on-change.

## 14. Retrieval

`search()` riceve almeno:

```ts
export interface SemanticMemorySearchRequestV1 {
  query: string;
  namespaces: readonly string[];
  allowedDataClasses: readonly SemanticMemoryDataClass[];
  limit: number;
}
```

Regole:

- query vuota -> `[]` senza embedding call;
- `limit` con hard cap;
- risultati ordinati per score decrescente e tie-break deterministico;
- nessun match -> `[]`;
- errore embedding/storage/protocollo -> eccezione/failure tipizzata;
- il caller decide come usare gli hit e resta soggetto al Core/policy prima di qualsiasi azione.

## 15. Scritture professionali

LSM-01 non espone `remember`, `adopt`, `update UDA`, `register lesson` o equivalenti.

Se il Copilot trova un contenuto utile:

```text
semantic hit
   -> canonicalRef
   -> consumer apre/recupera l'oggetto canonico
   -> eventuale proposta
   -> policy Core
   -> conferma docente dove richiesta
   -> write nel prodotto proprietario
   -> nuova projection/revision verso LSM
```

Il ciclo impedisce che l'indice diventi un canale di write laterale.

## 16. Relazione con Professional Memory

`ProfessionalMemoryStateV1` resta canonico nel Registro.

LSM può ricevere projection solo di `ProfessionalMemoryEntryV1` attive e consentite, con:

- `sourceType = professional-memory-entry`;
- `sourceId = entry.id`;
- `revision` derivata da `updatedAt` + hash del summary autorizzato;
- `canonicalRef` verso la entry Registro;
- testo = summary, non eventi grezzi salvo futura decisione esplicita.

La correzione o rimozione docente produce invalidation/upsert; LSM non consolida inferenze proprie nella Professional Memory.

## 17. Relazione con Biblioteca

Le fonti Biblioteca restano canoniche nel Registro.

V1 può indicizzare soltanto fonti con contenuto testuale già disponibile localmente e classificazione ammessa. URL prive di contenuto, `unknown`, dati studente e payload non normalizzati restano fuori dall'indice.

La provenance deve permettere di tornare sempre alla fonte Biblioteca originale.

## 18. Termux come profilo di riferimento, non requisito prodotto

Il primo runtime qualificato può essere distribuito come script/servizio Termux per Android ARM64.

Questo profilo serve a dimostrare:

- loopback locale reale;
- modello embedding reale;
- indice persistente locale;
- query da browser/PWA locale quando consentito dalla piattaforma;
- nessuna rete esterna durante indexing/search.

Successivamente lo stesso contratto può essere implementato nativamente su Android/LiteRT/ML Kit o desktop senza modificare i consumer.

## 19. Failure modes obbligatori

Il design deve restare corretto quando:

- il daemon non è in esecuzione;
- l'endpoint embedding è irraggiungibile;
- il modello non supporta embedding o cambia dimensione;
- SQLite è vuoto o ricostruito;
- una projection ha data class negata;
- una revision vecchia arriva dopo una più nuova;
- un consumer richiede namespace non presenti;
- un hit punta a un canonicalRef ormai non valido;
- un browser non può raggiungere il loopback per policy/CORS;
- il runtime riceve input oltre i limiti.

Il prodotto deve degradare verso le funzioni non semantiche già disponibili, non verso provider remoti impliciti.

## 20. Non-obiettivi v1

Fuori scope:

- multimodalità immagini/audio/video;
- OCR o captioning automatico;
- generazione locale;
- chat history come memoria canonica;
- dati personali studente;
- sync cloud dell'indice;
- LAN sharing;
- agenti autonomi che scrivono memoria;
- GraphRAG o knowledge graph;
- ANN obbligatorio;
- compressione/quantizzazione vettori obbligatoria;
- selezione definitiva di 128/256/512 dimensioni;
- sostituzione di Professional Memory, Biblioteca, Planning o Arena.

## 21. Criteri di accettazione LSM-01A

Il contratto shared è qualificabile quando:

1. rifiuta classi non ammesse e payload malformati;
2. rende identity/revision/provenance obbligatorie;
3. distingue no-match da failure tecnica;
4. non contiene dipendenze SQLite, modello, rete o consumer verticali;
5. non crea capability/authority;
6. dispone di test cross-app con due `sourceAppId` senza branching applicativo;
7. ha una distribution receipt exact-SHA coerente con il modello TRAMA esistente.

## 22. Criteri di accettazione LSM-01B

Il runtime Termux di riferimento è qualificabile quando:

1. fa bind solo su loopback per default;
2. upsert/search/remove sono idempotenti e revision-aware;
3. SQLite può essere cancellato e ricostruito senza perdita canonica;
4. il provider embedding è locale-only e non ha fallback remoto;
5. modello/dimensione incompatibili richiedono rebuild;
6. data class negate non vengono persistite né embeddizzate;
7. query vuota non chiama il modello;
8. no-match e failure tecnica restano distinti;
9. i test non richiedono un modello reale, ma esiste uno smoke separato per Termux + embedding reale;
10. nessun endpoint permette accesso generico a file, SQL o rete.

## 23. Sequenza raccomandata

```text
LSM-01 design
  -> LSM-01A shared contract
  -> qualification + human integration
  -> LSM-01B Termux reference runtime
  -> qualification + real-device smoke
  -> Registro projection adapter
  -> authentic teacher validation
  -> Docente OS projection adapter
  -> eventuale multimodalità / runtime Android nativo
```

Questa sequenza preserva la regola centrale: **un solo indice semantico locale può servire molti agenti, ma nessun agente acquisisce per questo la proprietà dei dati professionali.**
