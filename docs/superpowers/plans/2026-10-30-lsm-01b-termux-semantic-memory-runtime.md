# LSM-01B Termux Semantic Memory Runtime Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** costruire un daemon locale di riferimento per Android/Termux che indicizzi proiezioni semantiche autorizzate in SQLite, ottenga embedding da un endpoint loopback locale e offra ricerca semantica tramite API loopback autenticata.

**Architecture:** servizio Python 3 senza dipendenze Python obbligatorie, conforme a LSM-01A. SQLite è indice derivato e ricostruibile; il backend vettoriale lineare garantisce correttezza, `sqlite-vec` è accelerazione opzionale. Le revisioni sono token opachi: upsert/remove sono compare-and-swap tramite `expectedRevision`, non confronti temporali.

**Tech Stack:** Python 3.12+, `sqlite3`, `http.server.ThreadingHTTPServer`, `urllib.request`, `hashlib`, `secrets`, `array`, `unittest`; endpoint embedding OpenAI-compatible loopback; `sqlite-vec` opzionale.

**Spec:** `docs/superpowers/specs/2026-10-30-contextual-copilot-local-semantic-memory-design.md`

## Global Constraints

- Bind v1 solo loopback, default `127.0.0.1`; nessun `0.0.0.0`, LAN bind o discovery.
- Embedding URL solo `localhost`/`127.0.0.1`/`::1`; nessun fallback remoto.
- POST `upsert`, `remove`, `search` protetti da token locale casuale >=32 byte; token mai esposto da endpoint/log.
- Token file `0600` quando supportato.
- CORS solo origini esplicitamente configurate; mai wildcard sugli endpoint autenticati.
- JSON obbligatorio sui POST, body <=1 MiB, timeout bounded.
- Data class ammesse: `PUBLIC_APP`, `TEACHER_PROFESSIONAL`, `CURRICOLO`, `AGGREGATED_NON_IDENTIFIABLE`.
- `revision` è opaca; il runtime non la ordina.
- Upsert/remove richiedono `expectedRevision` e falliscono con conflict se lo stato corrente non coincide.
- Nessun endpoint SQL, filesystem, shell, arbitrary URL, download modello o write canonico.
- SQLite è derivato e ricostruibile.
- Cambio `modelId` o dimensione su indice popolato => `rebuild-required`; mai vettori misti.
- Query vuota => `hits: []` senza embedding call.
- No-match distinto da errore embedding/storage/protocollo.
- LSM-01B non modifica Registro, Docente OS, Arena o Contextual Copilot Core.
- La PWA non esegue probe loopback automatici al caricamento: primo collegamento solo da gesto esplicito dell'utente.

## Review Focus

- Web origin non autorizzata: nessuna lettura/modifica, anche se conosce la porta locale.
- Consumer con `expectedRevision` obsoleta: conflict atomico, nessun rollback a una vecchia projection.
- Provider embedding cambia dimensione: indice non corrotto, health `rebuild-required`.
- Database perso: daemon sano con indice vuoto, rebuild possibile dalle fonti canoniche.
- Body eccessivo/JSON errato/timeout embedding: failure bounded e nessun write parziale.

---

### Task 1: Runtime shell, configurazione e confine locale

**Files:**
- Create: `runtime/local-semantic-memory/__init__.py`
- Create: `runtime/local-semantic-memory/config.py`
- Create: `runtime/local-semantic-memory/auth.py`
- Create: `runtime/local-semantic-memory/server.py`
- Create: `runtime/local-semantic-memory/tests/test_runtime_security.py`

**Interfaces:**
- Produces: `RuntimeConfig`, `load_runtime_config()`, `load_or_create_local_token()`, `create_server(config, service)`.

- [ ] **Step 1: RED sicurezza**

Testare default host `127.0.0.1`; rifiuto di `0.0.0.0`/LAN/hostname non-loopback; token creato una volta e non loggato; health senza segreti/path/contenuti; POST senza bearer -> 401; origin non allowlisted -> 403 prima del service; OPTIONS soltanto per origin allowlisted.

- [ ] **Step 2: eseguire RED**

`python3 -m unittest discover -s runtime/local-semantic-memory/tests -p 'test_runtime_security.py' -v`  
Expected: FAIL.

- [ ] **Step 3: implementare configurazione minima**

```text
TRAMA_MEMORY_HOST=127.0.0.1
TRAMA_MEMORY_PORT=8765
TRAMA_MEMORY_DB=<app-data>/semantic-memory.sqlite3
TRAMA_MEMORY_TOKEN_FILE=<app-data>/semantic-memory.token
TRAMA_MEMORY_ALLOWED_ORIGINS=<csv>
TRAMA_EMBEDDING_URL=http://127.0.0.1:8080
TRAMA_EMBEDDING_MODEL=<modello locale>
TRAMA_SQLITE_VEC_PATH=<opzionale>
```

- [ ] **Step 4: GREEN e commit**

Run test Task 1; poi commit `feat(memoryd): add secure loopback runtime shell`.

### Task 2: SQLite projection store con CAS

**Files:**
- Create: `runtime/local-semantic-memory/contracts.py`
- Create: `runtime/local-semantic-memory/storage.py`
- Create: `runtime/local-semantic-memory/tests/test_projection_store.py`

**Interfaces:**
- Produces: `ProjectionStore.upsert(request)`, `ProjectionStore.remove(request)`, `get_projection()`, `list_indexable()`.

- [ ] **Step 1: RED storage/CAS**

Testare:

- create con `expectedRevision=null` su sorgente assente -> `inserted`;
- create con `expectedRevision=null` su sorgente esistente -> `RevisionConflictError`;
- stessa identity/revision/hash con expected corrente -> `unchanged`;
- replace con expected corrente -> `replaced`;
- expected diverso dalla revision corrente -> conflict, nessuna modifica;
- stessa revision con payload diverso -> `RevisionConflictError`;
- remove con expected corrente -> `removed`;
- remove assente con expected null -> `absent`;
- remove con expected errato -> conflict;
- data class vietata -> rifiuto prima dell'INSERT;
- failure durante refresh chunk/vector -> rollback completo.

- [ ] **Step 2: eseguire RED**

`python3 -m unittest runtime/local-semantic-memory/tests/test_projection_store.py -v`

- [ ] **Step 3: implementare schema/transaction**

Tabelle: `runtime_meta`, `projections`, `chunks`, `vectors`. Identity unica `(source_app_id, source_type, source_id)`. `content_hash = sha256` del payload semantico validato.

- [ ] **Step 4: GREEN e commit**

Commit `feat(memoryd): persist CAS-safe semantic projections`.

### Task 3: Chunking deterministico e embedding loopback

**Files:**
- Create: `runtime/local-semantic-memory/chunking.py`
- Create: `runtime/local-semantic-memory/embedding.py`
- Create: `runtime/local-semantic-memory/tests/test_chunking.py`
- Create: `runtime/local-semantic-memory/tests/test_embedding_client.py`

**Interfaces:**
- Produces: `chunk_projection_text(text, *, max_chars=1800, overlap_chars=200)` e `LocalEmbeddingClient.embed(text)`.

- [ ] **Step 1: RED chunking**

Test: <=1800 un chunk; chunk lunghi <=1800; overlap <=200; preferenza boundary whitespace/newline dopo 1200; stesso input => stessi chunk/hash; whitespace-only => zero chunk.

- [ ] **Step 2: RED embedding client**

Fake loopback: POST `/v1/embeddings`; URL non-loopback rifiutato prima della rete; vettore vuoto/non-array/non-finito rifiutato; HTTP failure/timeout tecnico; nessun fallback; model id e dimensione preservati.

- [ ] **Step 3: RED run**

```bash
python3 -m unittest runtime/local-semantic-memory/tests/test_chunking.py -v
python3 -m unittest runtime/local-semantic-memory/tests/test_embedding_client.py -v
```

- [ ] **Step 4: implementare e GREEN**

```py
class LocalEmbeddingClient:
    def embed(self, text: str) -> EmbeddingResult: ...
```

`EmbeddingResult(vector, model_id, dimensions)`.

- [ ] **Step 5: commit**

Commit `feat(memoryd): add deterministic chunks and local embeddings`.

### Task 4: Indicizzazione atomica e compatibilità modello

**Files:**
- Create: `runtime/local-semantic-memory/indexer.py`
- Modify: `runtime/local-semantic-memory/storage.py`
- Create: `runtime/local-semantic-memory/tests/test_indexer.py`

**Interfaces:**
- Produces: `SemanticIndexer.upsert(request)`, `remove(request)`, `health()`.

- [ ] **Step 1: RED**

Test: classi negate => zero embedding; unchanged => zero re-embedding; replace CAS riuscito => vecchi chunks/vectors sostituiti atomicamente; conflict => zero embedding/write; primo indice fissa `model_id`/dimensione; cambio incompatibile => nessun write + `rebuild-required`; remove CAS cancella projection/chunks/vectors.

- [ ] **Step 2: eseguire RED**

`python3 -m unittest runtime/local-semantic-memory/tests/test_indexer.py -v`

- [ ] **Step 3: implementare**

Failure embedding lascia invariata la projection precedente; niente retry infinito.

- [ ] **Step 4: GREEN e commit**

Commit `feat(memoryd): index projections with model compatibility`.

### Task 5: Retrieval lineare corretto e bounded

**Files:**
- Create: `runtime/local-semantic-memory/search.py`
- Create: `runtime/local-semantic-memory/tests/test_search.py`

**Interfaces:**
- Produces: `SemanticSearchService.search(request) -> SearchResponse`.

- [ ] **Step 1: RED retrieval**

Test: query vuota -> zero embedding; namespace/data class filter; limit 1..20; cosine stabile; dimension mismatch tecnico; score finito; order score desc + tie-break `(sourceAppId, sourceType, sourceId, chunkId)`; nessun candidato -> hits vuoti; hit con canonicalRef/identity/revision/namespace/dataClass.

- [ ] **Step 2: eseguire RED**

`python3 -m unittest runtime/local-semantic-memory/tests/test_search.py -v`

- [ ] **Step 3: implementare**

Float32 BLOB + dimensione; hard cap 20.

- [ ] **Step 4: GREEN e commit**

Commit `feat(memoryd): add bounded local semantic retrieval`.

### Task 6: API HTTP v1, auth e CORS

**Files:**
- Modify: `runtime/local-semantic-memory/server.py`
- Create: `runtime/local-semantic-memory/service.py`
- Create: `runtime/local-semantic-memory/tests/test_http_api.py`

**Interfaces:**
- Produces:

```text
GET  /v1/health
POST /v1/projections/upsert
POST /v1/projections/remove
POST /v1/search
```

- [ ] **Step 1: RED API**

Richiedere bearer per POST; origin esatta; JSON; body <=1 MiB; malformed ->400; schema ->422; revision conflict ->409; embedding/storage failure ->503 senza contenuto indicizzato; no-match ->200/hits[]; path/metodo non previsto ->404/405; nessuna risposta con token/path/stack trace.

- [ ] **Step 2: eseguire RED**

`python3 -m unittest runtime/local-semantic-memory/tests/test_http_api.py -v`

- [ ] **Step 3: implementare mapping**

```text
Access-Control-Allow-Origin: <origine esatta>
Vary: Origin
Access-Control-Allow-Headers: Authorization, Content-Type
Access-Control-Allow-Methods: GET, POST, OPTIONS
```

- [ ] **Step 4: GREEN e commit**

Commit `feat(memoryd): expose authenticated loopback API`.

### Task 7: Accelerazione `sqlite-vec` opzionale

**Files:**
- Create: `runtime/local-semantic-memory/vector_backend.py`
- Create: `runtime/local-semantic-memory/tests/test_vector_backend.py`
- Modify: `runtime/local-semantic-memory/config.py`
- Modify: `runtime/local-semantic-memory/search.py`

**Interfaces:**
- Produces: `LinearVectorBackend` canonico e `SqliteVecBackend` opzionale dietro feature probe.

- [ ] **Step 1: RED probe**

Test: path assente -> linear; path non assoluto/non esistente -> rifiuto; extension probe failure -> health degraded + linear corretto; probe PASS -> stessi hit/order/filtri del backend lineare; nessuna semantica sqlite-vec trapela nel contratto.

- [ ] **Step 2: eseguire RED**

`python3 -m unittest runtime/local-semantic-memory/tests/test_vector_backend.py -v`

- [ ] **Step 3: implementare adapter isolato**

DDL/query specifiche dell'estensione restano nel backend. Test real-extension opt-in; suite ordinaria usa fixture/fake probe.

- [ ] **Step 4: GREEN e commit**

Commit `feat(memoryd): add optional sqlite-vec acceleration`.

### Task 8: Runbook Termux e qualificazione

**Files:**
- Create: `runtime/local-semantic-memory/README.md`
- Create: `runtime/local-semantic-memory/run_termux.sh`
- Create: `runtime/local-semantic-memory/tests/test_runbook_contract.py`
- Create: `tests/test_local_semantic_memory_runtime_boundary.py`

**Interfaces:**
- Produces: percorso riproducibile senza download automatici di modelli/binari.

- [ ] **Step 1: RED boundary**

Vietare `0.0.0.0`, host embedding remoti, CORS wildcard, endpoint SQL/file/shell, download+execute remoti, token hardcoded.

- [ ] **Step 2: runbook Termux**

Documentare: prerequisiti Python/SQLite; build recente llama.cpp compatibile con embedding Gemma 2; modello GGUF locale; avvio embedding su `127.0.0.1:8080`; configurazione DB/token/origini; daemon su `127.0.0.1:8765`; health; primo accesso PWA da gesto utente con Loopback Network Access/CORS; rebuild esplicito.

- [ ] **Step 3: smoke automatico senza modello reale**

Daemon + fake embedding loopback: create due projection sintetiche tramite CAS, search, replace CAS, remove CAS, restart su stesso SQLite, riverifica.

- [ ] **Step 4: smoke reale manuale**

Termux + llama.cpp + EmbeddingGemma 2: health ready, corpus sintetico non personale, ricerca coerente, indexing/search offline dopo disponibilità locale dei file, restart persistente, cambio intenzionale modello/dimensione => rebuild-required. Registrare build/model/dimensione/dispositivo/ABI/latenza; mai commit di modello/token.

- [ ] **Step 5: qualification completa**

```bash
python3 -m unittest discover -s runtime/local-semantic-memory/tests -v
python3 -m unittest tests.test_local_semantic_memory_runtime_boundary -v
python3 -m unittest discover -s tests -v
```

Expected: PASS.

- [ ] **Step 6: candidate e Draft PR separata**

Aprire LSM-01B solo dopo integrazione LSM-01A. Fermarsi prima di merge/deploy/consumer wiring.
