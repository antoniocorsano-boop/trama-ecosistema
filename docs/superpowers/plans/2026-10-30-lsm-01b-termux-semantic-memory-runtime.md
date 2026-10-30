# LSM-01B Termux Semantic Memory Runtime Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** costruire un daemon locale di riferimento per Android/Termux che indicizzi proiezioni semantiche autorizzate in SQLite, ottenga embedding da un endpoint loopback locale e offra ricerca semantica governata tramite un protocollo HTTP loopback autenticato.

**Architecture:** servizio Python 3 senza dipendenze Python obbligatorie, separato dal package shared LSM-01A e conforme ai suoi envelope. SQLite è un indice derivato e ricostruibile; la ricerca vettoriale lineare è il backend di correttezza iniziale, mentre `sqlite-vec` è un'accelerazione opzionale attivata solo tramite feature probe. Il daemon non possiede dati canonici e non espone write professionali.

**Tech Stack:** Python 3.12+, `sqlite3`, `http.server.ThreadingHTTPServer`, `urllib.request`, `hashlib`, `secrets`, `array`, `unittest`; endpoint embedding OpenAI-compatible loopback; `sqlite-vec` opzionale come estensione SQLite locale.

**Spec:** `docs/superpowers/specs/2026-10-30-contextual-copilot-local-semantic-memory-design.md`

## Global Constraints

- Bind predefinito e consentito v1: `127.0.0.1`; nessun `0.0.0.0`, LAN bind o discovery.
- Endpoint embedding consentiti: solo `http://localhost`, `http://127.0.0.1`, `http://[::1]` / `http://::1`; nessun fallback remoto.
- API protetta da token locale casuale per `upsert`, `remove` e `search`; il token non è mai restituito da un endpoint.
- Token creato con almeno 32 byte casuali e file con permessi `0600` quando il sistema lo consente.
- CORS: solo origini esplicitamente configurate; mai `Access-Control-Allow-Origin: *` per endpoint autenticati.
- Richieste mutative/search: `Content-Type: application/json`, size limit `1 MiB`, metodo esatto, schema/versione validati.
- Classi memorizzabili v1: `PUBLIC_APP`, `TEACHER_PROFESSIONAL`, `CURRICULUM`, `AGGREGATED_NON_IDENTIFIABLE` soltanto.
- Nessun endpoint per SQL, filesystem arbitrario, shell, download modello, rete generica o modifica dati canonici.
- SQLite è derivato; cancellarlo non deve perdere informazioni canoniche.
- Cambio `modelId` o dimensionalità rispetto all'indice popolato => `rebuild-required`; mai mescolare vettori incompatibili.
- No-match = risposta valida con `hits: []`; errori embedding/storage/protocollo = errore tecnico distinto.
- Query vuota => `hits: []` senza chiamare il provider embedding.
- LSM-01B non modifica Registro Docente, Docente OS, Arena o Contextual Copilot Core.
- Il browser consumer dovrà chiedere accesso loopback in risposta a un gesto esplicito; nessuna connessione automatica al caricamento della PWA.

## Review Focus

- Pagina web non autorizzata che prova a usare il daemon locale: deve fallire per origine e/o token prima di leggere o modificare memoria.
- Projection con `revision` più vecchia dopo una più nuova: non deve ripristinare contenuti obsoleti.
- Provider embedding che cambia improvvisamente dimensione: nessun vettore misto; health `rebuild-required`.
- Database cancellato o vuoto: daemon sano, indice vuoto, nessuna falsa perdita canonica; rebuild possibile.
- Input molto grande, JSON errato, `Content-Type` errato o timeout embedding: failure bounded e nessun write parziale.

---

### Task 1: Runtime shell, configurazione sicura e health

**Files:**
- Create: `runtime/local-semantic-memory/__init__.py`
- Create: `runtime/local-semantic-memory/config.py`
- Create: `runtime/local-semantic-memory/auth.py`
- Create: `runtime/local-semantic-memory/server.py`
- Create: `runtime/local-semantic-memory/tests/test_runtime_security.py`

**Interfaces:**
- Produces: `RuntimeConfig`, `load_runtime_config()`, `load_or_create_local_token()`, `create_server(config, service)`.

- [ ] **Step 1: scrivere il RED sicurezza/bootstrap**

Testare:

- default host `127.0.0.1`;
- configurazione `0.0.0.0`, indirizzo LAN o hostname non-loopback rifiutata;
- token mancante creato una sola volta con >=32 byte di entropia e non loggato;
- `GET /v1/health` non contiene token, path locali o contenuti indicizzati;
- endpoint protetti senza `Authorization: Bearer ...` -> `401`;
- origine non allowlisted -> `403` prima del service call;
- `OPTIONS` risponde soltanto per origine allowlisted e header/metodi minimi.

- [ ] **Step 2: eseguire RED**

Run: `python3 -m unittest discover -s runtime/local-semantic-memory/tests -p 'test_runtime_security.py' -v`  
Expected: FAIL perché runtime assente.

- [ ] **Step 3: implementare configurazione, token e server minimale**

Configurazione v1 da variabili ambiente:

```text
TRAMA_MEMORY_HOST=127.0.0.1
TRAMA_MEMORY_PORT=8765
TRAMA_MEMORY_DB=<app-data>/semantic-memory.sqlite3
TRAMA_MEMORY_TOKEN_FILE=<app-data>/semantic-memory.token
TRAMA_MEMORY_ALLOWED_ORIGINS=<lista separata da virgola>
TRAMA_EMBEDDING_URL=http://127.0.0.1:8080
TRAMA_EMBEDDING_MODEL=<nome modello locale>
TRAMA_SQLITE_VEC_PATH=<opzionale>
```

`TRAMA_MEMORY_HOST` deve normalizzarsi solo a loopback.

- [ ] **Step 4: GREEN sicurezza/bootstrap**

Run: test Task 1.  
Expected: PASS.

- [ ] **Step 5: commit**

```bash
git add runtime/local-semantic-memory
git commit -m "feat(memoryd): add secure loopback runtime shell"
```

### Task 2: SQLite projection store revision-aware

**Files:**
- Create: `runtime/local-semantic-memory/contracts.py`
- Create: `runtime/local-semantic-memory/storage.py`
- Create: `runtime/local-semantic-memory/tests/test_projection_store.py`

**Interfaces:**
- Consumes: LSM-01A schema names and allowed classes.
- Produces: `ProjectionStore.upsert(projection)`, `ProjectionStore.remove(source_ref)`, `ProjectionStore.get_projection(...)`, `ProjectionStore.list_indexable()`.

- [ ] **Step 1: scrivere RED storage**

Testare transazioni per:

- insert nuovo -> `inserted`;
- stessa identity + stessa revision + stesso hash -> `unchanged`;
- stessa identity + nuova revision -> `replaced`;
- stessa identity + revision vecchia -> `StaleRevisionError` e nessuna modifica;
- stessa revision ma payload diverso -> `RevisionConflictError`;
- remove presente -> `removed`, remove assente -> `absent`;
- data class vietata -> rifiuto prima dell'INSERT;
- failure nel refresh chunk/vector futuro -> rollback completo.

- [ ] **Step 2: eseguire RED**

Run: `python3 -m unittest runtime/local-semantic-memory/tests/test_projection_store.py -v`  
Expected: FAIL.

- [ ] **Step 3: implementare schema SQLite e operazioni atomiche**

Tabelle minime:

```text
runtime_meta
projections
chunks
vectors
```

Vincolo univoco projection: `(source_app_id, source_type, source_id)`.

`content_hash = sha256` del payload semantico canonico validato, esclusi campi operativi non semantici.

- [ ] **Step 4: GREEN storage**

Run: test Task 2.  
Expected: PASS.

- [ ] **Step 5: commit**

```bash
git add runtime/local-semantic-memory/contracts.py runtime/local-semantic-memory/storage.py runtime/local-semantic-memory/tests/test_projection_store.py
git commit -m "feat(memoryd): persist revision-aware semantic projections"
```

### Task 3: Chunking deterministico e embedding loopback

**Files:**
- Create: `runtime/local-semantic-memory/chunking.py`
- Create: `runtime/local-semantic-memory/embedding.py`
- Create: `runtime/local-semantic-memory/tests/test_chunking.py`
- Create: `runtime/local-semantic-memory/tests/test_embedding_client.py`

**Interfaces:**
- Produces: `chunk_projection_text(text, *, max_chars=1800, overlap_chars=200)` e `LocalEmbeddingClient.embed(text)`.

- [ ] **Step 1: RED chunking**

Testare:

- testo <=1800 -> un chunk;
- testo lungo -> chunk <=1800 caratteri con overlap deterministico <=200;
- preferenza per confine whitespace/newline dopo il carattere 1200 quando disponibile;
- stesso input -> stessi chunk id/hash;
- whitespace-only -> zero chunk.

- [ ] **Step 2: RED embedding client**

Testare con server finto loopback:

- POST `/v1/embeddings` con `input` e `model`;
- URL non-loopback rifiutato prima della rete;
- vettore non array/vuoto/non finito -> failure;
- HTTP failure/timeout -> failure tecnica;
- nessun fallback a URL alternativo/remoto;
- modello restituito registrabile insieme alla dimensione.

- [ ] **Step 3: eseguire RED Tasks 3**

Run:

```bash
python3 -m unittest runtime/local-semantic-memory/tests/test_chunking.py -v
python3 -m unittest runtime/local-semantic-memory/tests/test_embedding_client.py -v
```

Expected: FAIL.

- [ ] **Step 4: implementare chunker e client OpenAI-compatible**

Firma client:

```py
class LocalEmbeddingClient:
    def embed(self, text: str) -> EmbeddingResult: ...
```

`EmbeddingResult` espone `vector: tuple[float, ...]`, `model_id: str`, `dimensions: int`.

- [ ] **Step 5: GREEN Tasks 3**

Run: i due test.  
Expected: PASS.

- [ ] **Step 6: commit**

```bash
git add runtime/local-semantic-memory/chunking.py runtime/local-semantic-memory/embedding.py runtime/local-semantic-memory/tests/test_chunking.py runtime/local-semantic-memory/tests/test_embedding_client.py
git commit -m "feat(memoryd): add deterministic chunks and local embeddings"
```

### Task 4: Indicizzazione e model/dimension compatibility

**Files:**
- Create: `runtime/local-semantic-memory/indexer.py`
- Modify: `runtime/local-semantic-memory/storage.py`
- Create: `runtime/local-semantic-memory/tests/test_indexer.py`

**Interfaces:**
- Consumes: `ProjectionStore`, chunker, `LocalEmbeddingClient`.
- Produces: `SemanticIndexer.index_projection(projection)`, `remove_projection(source_ref)`, `health()`.

- [ ] **Step 1: RED indicizzazione**

Testare:

- data class negata => zero embedding call;
- upsert `unchanged` => zero re-embedding;
- nuova revision => nuovi chunks/vectors e rimozione atomica dei vecchi;
- modelId/dimensions coerenti => indice `ready`;
- nuovo modelId o dimensions su indice popolato => nessuna scrittura, health `rebuild-required`;
- database nuovo => primo embedding fissa `model_id` + `dimensions` in `runtime_meta`;
- remove cancella projection/chunks/vectors in transazione.

- [ ] **Step 2: eseguire RED**

Run: `python3 -m unittest runtime/local-semantic-memory/tests/test_indexer.py -v`  
Expected: FAIL.

- [ ] **Step 3: implementare `SemanticIndexer`**

L'indicizzatore non possiede retry infinito; una failure embedding lascia invariata la precedente revision indicizzata.

- [ ] **Step 4: GREEN indicizzazione**

Run: test Task 4.  
Expected: PASS.

- [ ] **Step 5: commit**

```bash
git add runtime/local-semantic-memory/indexer.py runtime/local-semantic-memory/storage.py runtime/local-semantic-memory/tests/test_indexer.py
git commit -m "feat(memoryd): index projections with model compatibility"
```

### Task 5: Retrieval vettoriale lineare corretto e bounded

**Files:**
- Create: `runtime/local-semantic-memory/search.py`
- Create: `runtime/local-semantic-memory/tests/test_search.py`

**Interfaces:**
- Consumes: `ProjectionStore`, `LocalEmbeddingClient`.
- Produces: `SemanticSearchService.search(request) -> SearchResponse`.

- [ ] **Step 1: RED retrieval**

Testare:

- query vuota -> `hits=[]`, zero embedding calls;
- namespace/data class filter applicati prima della selezione finale;
- `limit` 1..20;
- cosine similarity numericamente stabile per vettori finiti;
- dimension mismatch stored/query -> failure tecnica;
- score non finito impossibile in output;
- ordinamento score decrescente, tie-break `(sourceAppId, sourceType, sourceId, chunkId)` crescente;
- nessun candidato -> `hits=[]`;
- ogni hit contiene `canonicalRef`, identity, revision, namespace, chunkId e dataClass.

- [ ] **Step 2: eseguire RED**

Run: `python3 -m unittest runtime/local-semantic-memory/tests/test_search.py -v`  
Expected: FAIL.

- [ ] **Step 3: implementare ricerca lineare**

Persistenza vettore v1: float32 BLOB + dimensione; calcolo cosine con scaling/norma robusta e validation dei valori finiti.

Hard cap: 20 hit.

- [ ] **Step 4: GREEN retrieval**

Run: test Task 5.  
Expected: PASS.

- [ ] **Step 5: commit**

```bash
git add runtime/local-semantic-memory/search.py runtime/local-semantic-memory/tests/test_search.py
git commit -m "feat(memoryd): add bounded local semantic retrieval"
```

### Task 6: API HTTP v1 completa, autenticazione e CORS

**Files:**
- Modify: `runtime/local-semantic-memory/server.py`
- Create: `runtime/local-semantic-memory/service.py`
- Create: `runtime/local-semantic-memory/tests/test_http_api.py`

**Interfaces:**
- Consumes: indexer + search service + auth/config.
- Produces gli endpoint canonici v1.

- [ ] **Step 1: RED API**

Testare:

```text
GET  /v1/health
POST /v1/projections/upsert
POST /v1/projections/remove
POST /v1/search
```

Richiedere:

- Bearer token per tutti i POST;
- exact allowed Origin per richieste browser;
- JSON Content-Type obbligatorio;
- `Content-Length` <= 1 MiB;
- body JSON malformato -> 400;
- schema invalid -> 422;
- stale revision -> 409;
- embedding/storage failure -> 503 con error code non contenente testo indicizzato;
- no-match -> 200 con `hits: []`;
- metodi/path non previsti -> 404/405;
- nessuna risposta include token, DB path o stack trace.

- [ ] **Step 2: eseguire RED**

Run: `python3 -m unittest runtime/local-semantic-memory/tests/test_http_api.py -v`  
Expected: FAIL.

- [ ] **Step 3: implementare route e mapping errori**

Header browser per origine consentita:

```text
Access-Control-Allow-Origin: <origine esatta>
Vary: Origin
Access-Control-Allow-Headers: Authorization, Content-Type
Access-Control-Allow-Methods: GET, POST, OPTIONS
```

Nessun wildcard.

- [ ] **Step 4: GREEN API**

Run: test Task 6.  
Expected: PASS.

- [ ] **Step 5: commit**

```bash
git add runtime/local-semantic-memory/server.py runtime/local-semantic-memory/service.py runtime/local-semantic-memory/tests/test_http_api.py
git commit -m "feat(memoryd): expose authenticated loopback API"
```

### Task 7: `sqlite-vec` feature probe opzionale senza cambiare semantica

**Files:**
- Create: `runtime/local-semantic-memory/vector_backend.py`
- Create: `runtime/local-semantic-memory/tests/test_vector_backend.py`
- Modify: `runtime/local-semantic-memory/config.py`
- Modify: `runtime/local-semantic-memory/search.py`

**Interfaces:**
- Produces: `LinearVectorBackend` canonico e `SqliteVecBackend` opzionale selezionabile solo se il probe è PASS.

- [ ] **Step 1: RED feature probe**

Testare:

- nessun `TRAMA_SQLITE_VEC_PATH` -> linear backend;
- path non assoluto/non esistente -> rifiutato, senza fallback silenzioso a libreria diversa;
- extension load/probe failure -> health `degraded`, linear backend ancora corretto;
- probe PASS -> backend sqlite-vec restituisce stesso ordine/hit del linear backend sulle fixture;
- backend non altera identity, filtering, limit o score contract.

- [ ] **Step 2: eseguire RED**

Run: `python3 -m unittest runtime/local-semantic-memory/tests/test_vector_backend.py -v`  
Expected: FAIL.

- [ ] **Step 3: implementare feature probe e backend adapter**

Non fissare nel contratto una sintassi sqlite-vec esterna al backend. Isolare completamente DDL/query specifiche dell'estensione.

- [ ] **Step 4: GREEN backend**

Run: test Task 7; se l'estensione non è installata, i test di equivalenza usano un fake/probe controllato e i test real-extension restano opt-in.

- [ ] **Step 5: commit**

```bash
git add runtime/local-semantic-memory/vector_backend.py runtime/local-semantic-memory/config.py runtime/local-semantic-memory/search.py runtime/local-semantic-memory/tests/test_vector_backend.py
git commit -m "feat(memoryd): add optional sqlite-vec acceleration"
```

### Task 8: Termux runbook, smoke locale e browser loopback boundary

**Files:**
- Create: `runtime/local-semantic-memory/README.md`
- Create: `runtime/local-semantic-memory/run_termux.sh`
- Create: `runtime/local-semantic-memory/tests/test_runbook_contract.py`
- Create: `tests/test_local_semantic_memory_runtime_boundary.py`

**Interfaces:**
- Produces: percorso riproducibile di avvio su Termux senza download automatici di modelli/binari.

- [ ] **Step 1: RED runbook/boundary**

Repository test deve vietare:

- `0.0.0.0` come bind di runtime;
- URL `https://` o host non-loopback nel client embedding;
- `Access-Control-Allow-Origin: *`;
- endpoint generici SQL/file/shell;
- comandi che scaricano/eseguono binari remoti nel runbook;
- segreti/token hardcoded.

- [ ] **Step 2: scrivere runbook Termux**

Documentare, senza download automatico:

1. prerequisiti Python/SQLite e build recente di `llama.cpp` con supporto embedding Gemma 2;
2. modello GGUF locale scelto dall'utente;
3. avvio `llama-server` in modalità embedding su `127.0.0.1:8080`;
4. configurazione `TRAMA_EMBEDDING_URL`, modello, DB/token path, origini PWA consentite;
5. avvio daemon su `127.0.0.1:8765`;
6. test health;
7. nota browser: il primo collegamento da una PWA pubblica a loopback deve partire da un gesto esplicito e il consumer deve usare il meccanismo moderno di Loopback Network Access/CORS; nessuna richiesta automatica all'avvio;
8. procedura rebuild quando health è `rebuild-required`.

- [ ] **Step 3: smoke senza modello reale**

Avviare daemon + fake embedding loopback, upsert due projection sintetiche, search, remove, restart su stesso SQLite e riverificare persistenza derivata.

- [ ] **Step 4: smoke reale separato e manuale**

Con Termux + build llama.cpp compatibile + EmbeddingGemma 2 locale:

- health `ready`;
- upsert corpus sintetico non personale;
- ricerca semantica restituisce hit coerente;
- rete esterna disabilitata dopo disponibilità dei binari/modello: indexing/search continuano;
- riavvio daemon conserva indice;
- cambio intenzionale modello/dimensione produce `rebuild-required`.

Registrare modello, dimensione, build llama.cpp, dispositivo/ABI e latenza; non committare file modello o token.

- [ ] **Step 5: qualificazione completa**

Run:

```bash
python3 -m unittest discover -s runtime/local-semantic-memory/tests -v
python3 -m unittest tests.test_local_semantic_memory_runtime_boundary -v
python3 -m unittest discover -s tests -v
```

Expected: PASS.

- [ ] **Step 6: commit candidate e Draft PR separata**

```bash
git add runtime/local-semantic-memory tests/test_local_semantic_memory_runtime_boundary.py
git commit -m "docs(memoryd): qualify Termux reference runtime"
```

Aprire Draft PR LSM-01B solo dopo integrazione LSM-01A. Fermarsi prima di merge/deploy e prima di qualunque consumer wiring.
