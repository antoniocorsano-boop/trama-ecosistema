# LSM-01 — Contextual Copilot Local Semantic Memory

**Data:** 2026-10-30  
**Stato:** DESIGN — DOCS ONLY  
**Baseline TRAMA:** `main@d11112434bb45364e7bddbee6d4df1a86f9b351a`  
**Consumer osservato:** `registro-docente@d496b51a5a1677c1c6893010c28bea2ba43dc91b`  
**Autorità di implementazione:** separata per contratto, runtime e consumer

## 1. Intento

Realizzare una memoria semantica locale condivisibile dai prodotti TRAMA senza creare una seconda fonte di verità professionale e senza trasformare embedding o indice vettoriale in autorità applicativa.

L'obiettivo è consentire a Contextual Copilot e ai consumer di recuperare localmente materiali, memorie professionali e riferimenti curricolari pertinenti tramite un unico confine semantico, mantenendo la proprietà canonica dei dati nel prodotto che li governa.

Il profilo di riferimento iniziale è Android + Termux + `llama.cpp` + EmbeddingGemma 2, ma nessuno di questi elementi diventa dipendenza obbligatoria del Core o dei consumer.

## 2. Baseline da preservare

TRAMA possiede già `@trama/contextual-copilot-core@0.3.0`, `SemanticPort`, `IntentPort`, policy fail-closed e `@trama/contextual-copilot-intent-embedding@0.1.0`. Registro Docente possiede già un `embeddingService` loopback con supporto OpenAI-compatible/llama.cpp/Ollama, configurazione `embeddinggemma-2.gguf`, ricerca semantica locale della Biblioteca e una `ProfessionalMemoryStateV1` canonica con provenance, privacy e correzione docente.

Quindi LSM-01 non aggiunge un secondo resolver né una seconda memoria professionale: introduce un indice condiviso, derivato e ricostruibile.

## 3. Principio di autorità

```text
PRODOTTI CANONICI
  ├─ Registro: Biblioteca / Professional Memory / Planning
  ├─ Docente OS: lezioni / materiali / preparazione
  ├─ Arena: curricolo autorizzato
  └─ altri corpus consentiti
          │
          │ projection governata
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
- restituisce riferimenti e frammenti con provenance verso l'oggetto canonico.

## 4. Approcci considerati

### A. Indice separato in ogni prodotto

Rapido, ma duplica modelli, configurazioni e retrieval e non crea memoria cross-app. **Scartato come fondazione condivisa.**

### B. Termux come archivio canonico unico

Semplice come metafora “one memory, every agent”, ma crea authority concorrente con Professional Memory, Biblioteca, Arena e stato applicativo. **Scartato.**

### C. Runtime locale condiviso come indice derivato

Una sola superficie di retrieval, rebuild possibile, privacy locale e nessuna duplicazione di authority. Richiede protocollo rigoroso di projection, concorrenza e invalidation. **Selezionato.**

## 5. Decomposizione

1. **LSM-01A — Shared Contract**: envelope, provenance, concurrency contract, validatori e distribution receipt.
2. **LSM-01B — Termux Reference Runtime**: loopback locale, SQLite, embedding locale e retrieval.
3. **LSM-01C — Consumer Adoption**: Registro per primo, poi Docente OS, senza duplicare persistenza canonica.

Ogni incremento richiede qualificazione e decisione umana separate.

## 6. Contratto dati LSM-01A

### 6.1 Data class

Il vocabolario LSM si allinea al Core TRAMA dove esiste già un equivalente:

```ts
export type SemanticMemoryDataClass =
  | 'PUBLIC_APP'
  | 'TEACHER_PROFESSIONAL'
  | 'CURRICOLO'
  | 'AGGREGATED_NON_IDENTIFIABLE';
```

`CURRICOLO` è l'unico termine canonico per questa classe nel contratto LSM. I consumer che usano etichette verticali pregresse per la pianificazione devono mapparle esplicitamente nel proprio adapter; il runtime non inventa la mappatura.

### 6.2 Projection

```ts
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
- `revision` è un token opaco che cambia quando cambia il contenuto semantico proiettato;
- `canonicalRef` rimanda all'oggetto canonico;
- `text` contiene solo testo autorizzato alla proiezione;
- metadata è string-to-string e mai payload arbitrario;
- classi studente, `INSTITUTIONAL`, `UNKNOWN` e `AMBIGUOUS` sono negate in v1.

### 6.3 Concorrenza e upsert

Poiché `revision` è opaca, il runtime **non ordina** revisioni e non presume che timestamp o hash siano monotoni.

```ts
export interface SemanticMemoryUpsertRequestV1 {
  schema: 'trama.semantic-memory-upsert-request/v1';
  projection: SemanticMemoryProjectionV1;
  expectedRevision: string | null;
}
```

Semantica:

- prima creazione: `expectedRevision = null`; se la sorgente esiste già -> conflict;
- sostituzione: `expectedRevision` deve coincidere con la revision corrente;
- stessa projection/revision/hash può risultare `unchanged`;
- mismatch -> `REVISION_CONFLICT`, nessun confronto “più vecchio/più nuovo” e nessuna modifica;
- rebuild completo può usare un percorso amministrativo locale esplicito, non un bypass implicito del CAS.

La stessa regola vale per `remove`, che deve poter includere `expectedRevision` per non cancellare una versione aggiornata da un altro consumer.

### 6.4 Hit

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

### 6.5 Port

```ts
export interface LocalSemanticMemoryPort {
  mode: 'local';
  health(): Promise<SemanticMemoryHealthV1>;
  upsert(request: SemanticMemoryUpsertRequestV1): Promise<SemanticMemoryUpsertReceiptV1>;
  remove(request: SemanticMemoryRemoveRequestV1): Promise<SemanticMemoryRemoveReceiptV1>;
  search(request: SemanticMemorySearchRequestV1): Promise<SemanticMemorySearchResponseV1>;
}
```

Il package shared contiene soltanto tipi/validatori puri: niente SQLite, rete, modello, file system o branch verticali.

## 7. Protocollo locale LSM-01B

Endpoint v1:

```text
GET    /v1/health
POST   /v1/projections/upsert
POST   /v1/projections/remove
POST   /v1/search
```

Vincoli:

- bind predefinito e consentito `127.0.0.1`/loopback;
- nessun `0.0.0.0`, LAN sharing, discovery o telemetria;
- POST autenticati con token locale casuale;
- CORS solo per origini esplicitamente configurate, mai wildcard sugli endpoint autenticati;
- JSON versionato, limite payload e timeout bounded;
- nessun endpoint generico SQL, file, shell o arbitrary path;
- errori tecnici distinti da no-match.

Per PWA pubbliche, la connessione iniziale al loopback deve essere avviata da un gesto esplicito dell'utente e il consumer deve rispettare il moderno modello di Loopback Network Access/CORS del browser. Nessun probe automatico all'avvio della pagina.

## 8. Persistenza derivata

SQLite conserva almeno:

```text
runtime_meta
projections
chunks
vectors
```

`projections` mantiene identity, revision, namespace, canonicalRef, dataClass, updatedAt, metadata e content hash. `chunks` conserva chunk deterministici. `vectors` conserva chunkId, modelId, dimensions ed embedding.

`sqlite-vec` può accelerare il retrieval quando disponibile; la correttezza v1 deve esistere anche con backend lineare controllato. SQLite non è un backup professionale.

## 9. Chunking

V1 è text-only:

- deterministico e riproducibile;
- nessuna dipendenza dal tokenizer del modello;
- overlap piccolo e fisso;
- chunk id derivato da identity + revision + ordinal + text hash;
- sostituzione CAS riuscita aggiorna projection/chunk/vector in un'unica unità atomica.

I valori esatti sono fissati dal piano LSM-01B.

## 10. Embedding runtime

Profilo di riferimento:

```text
Android / Termux
  ├─ llama-server (embedding locale)
  └─ trama-semantic-memoryd
       ├─ SQLite
       └─ embedding adapter loopback
```

Requisiti:

- endpoint embedding esclusivamente loopback;
- nessun fallback remoto;
- model id e dimensionalità registrati nell'indice;
- cambio modello/dimensione su indice popolato -> `rebuild-required`;
- failure embedding non diventa no-match.

EmbeddingGemma 2 è il modello di riferimento, non il contratto. V1 conserva la dimensionalità restituita dal provider; l'eventuale riduzione MRL a 256d richiede benchmark separato sul corpus reale.

## 11. Privacy

Ammesse v1:

```text
PUBLIC_APP
TEACHER_PROFESSIONAL
CURRICOLO
AGGREGATED_NON_IDENTIFIABLE
```

Negate v1:

```text
STUDENT_PERSONAL
STUDENT_SENSITIVE
INSTITUTIONAL
UNKNOWN
AMBIGUOUS
```

La classificazione arriva dal consumer canonico ed è rivalidata dal runtime. Namespace e pertinenza non possono rendere ammesso un dato vietato. Nessun contenuto indicizzato viene inviato a provider remoto dal runtime v1.

## 12. Namespace

Esempi:

```text
shared-professional
registro/library
registro/professional-memory
docente-os/materials
curricolo/approved
```

Il namespace organizza e restringe query; non autorizza.

## 13. Rebuild e invalidation

Casi richiesti:

1. nuovo oggetto -> create con `expectedRevision = null`;
2. replay identico -> `unchanged`;
3. aggiornamento -> replace solo con `expectedRevision` coincidente;
4. conflict -> nessun write;
5. remove -> CAS sulla revision corrente;
6. modello/dimensione incompatibile -> `rebuild-required`;
7. database perso -> rebuild completo dai consumer, senza perdita canonica.

La sincronizzazione continua non è richiesta in v1; il primo consumer può usare refresh esplicito o projection-on-change.

## 14. Retrieval

```ts
export interface SemanticMemorySearchRequestV1 {
  schema: 'trama.semantic-memory-search-request/v1';
  query: string;
  namespaces: readonly string[];
  allowedDataClasses: readonly SemanticMemoryDataClass[];
  limit: number;
}
```

Regole:

- query vuota -> `hits: []` senza embedding call;
- hard cap `limit`;
- score decrescente + tie-break deterministico;
- nessun candidato -> `hits: []`;
- errori embedding/storage/protocollo -> failure tecnica;
- caller/Core restano responsabili di policy e azioni successive.

## 15. Scritture professionali

LSM-01 non espone `remember`, `adopt`, `update UDA`, `register lesson` o equivalenti.

```text
semantic hit
 -> canonicalRef
 -> consumer recupera l'oggetto canonico
 -> eventuale proposta
 -> policy Core
 -> conferma docente dove richiesta
 -> write nel prodotto proprietario
 -> nuova projection CAS verso LSM
```

## 16. Professional Memory e Biblioteca

`ProfessionalMemoryStateV1` resta canonica nel Registro. LSM può ricevere solo entry attive e consentite; proietta il `summary`, non eventi grezzi. Correzione/rimozione docente produce replace/remove CAS.

Le fonti Biblioteca restano canoniche nel Registro. V1 indicizza soltanto fonti con testo già disponibile localmente e classificazione ammessa. URL senza contenuto, `unknown`, dati studente e payload non normalizzati restano fuori.

## 17. Termux è riferimento, non requisito prodotto

LSM-01B serve a dimostrare loopback reale, embedding locale, indice persistente e retrieval senza rete esterna. In seguito lo stesso contratto potrà essere implementato nativamente su Android o desktop senza cambiare i consumer.

## 18. Failure mode obbligatori

Il sistema deve degradare in modo sicuro quando:

- daemon assente;
- endpoint embedding irraggiungibile;
- modello non compatibile o dimensionalità cambiata;
- SQLite vuoto/perso;
- data class negata;
- `expectedRevision` non coincide;
- namespace assente;
- canonicalRef non più valido;
- browser nega accesso loopback/CORS;
- input eccede i limiti.

Il prodotto degrada verso funzioni non semantiche già disponibili, mai verso provider remoto implicito.

## 19. Non-obiettivi v1

Fuori scope: multimodalità, OCR/captioning, generazione locale, chat history canonica, dati personali studente, cloud sync, LAN sharing, agenti autonomi che scrivono memoria, GraphRAG, ANN obbligatorio, dimensione vettoriale fissa e sostituzione di Professional Memory/Biblioteca/Planning/Arena.

## 20. Criteri di accettazione LSM-01A

1. rifiuta classi non ammesse e payload malformati;
2. identity/revision/provenance sono obbligatorie;
3. upsert/remove sono CAS tramite `expectedRevision`;
4. no-match e failure tecnica restano distinti;
5. package senza storage/rete/modello/consumer verticali;
6. nessuna capability/authority creata;
7. prova cross-app senza branching;
8. distribution receipt exact-SHA.

## 21. Criteri di accettazione LSM-01B

1. bind loopback only;
2. API autenticata e CORS allowlist;
3. upsert/remove idempotenti e CAS-safe;
4. SQLite ricostruibile;
5. provider embedding local-only senza fallback remoto;
6. model/dimension mismatch -> rebuild;
7. classi negate non persistite né embeddizzate;
8. query vuota non chiama embedding;
9. no-match distinto da failure;
10. nessun endpoint generico file/SQL/shell;
11. test senza modello reale + smoke separato Termux/EmbeddingGemma 2.

## 22. Sequenza

```text
LSM-01 design
 -> LSM-01A shared contract
 -> qualification + human integration
 -> LSM-01B Termux runtime
 -> qualification + real-device smoke
 -> Registro projection adapter
 -> authentic teacher validation
 -> Docente OS projection adapter
 -> eventuale multimodalità / runtime Android nativo
```

Regola centrale: **un solo indice semantico locale può servire molti agenti, ma nessun agente acquisisce per questo la proprietà dei dati professionali.**
