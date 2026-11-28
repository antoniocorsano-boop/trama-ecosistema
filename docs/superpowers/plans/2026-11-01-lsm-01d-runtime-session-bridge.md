# LSM-01D Runtime Session Bridge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** aggiungere a `trama-memoryd` un bootstrap di sessione locale che emetta capacità bearer effimere legate all’origine, eliminando la necessità di esporre il master token al browser.

**Architecture:** il master token su file `0600` resta invariato. Un nuovo store in-memory emette capacità casuali con TTL e binding all’`Origin`; `/v1/session` è accessibile solo da origini CORS esplicitamente ammesse e restituisce capacità + health. Gli endpoint POST esistenti accettano master token oppure capacità effimera valida per la stessa origine.

**Tech Stack:** Python 3 stdlib, `http.server`, `secrets`, `hmac`, `datetime/time`, `unittest`, runtime LSM-01B esistente.

**Spec:** `docs/superpowers/specs/2026-11-01-lsm-01d-local-trust-bridge-design.md`

## Global Constraints

- Bind esclusivamente loopback (`127.0.0.1`, `localhost`, `::1`); nessun `0.0.0.0` o LAN.
- `TRAMA_MEMORY_ALLOWED_ORIGINS` resta whitelist esatta; `*` continua a essere vietato.
- Il master token resta su file privato e non viene mai restituito via HTTP.
- Le capacità di sessione non vengono persistite su disco o SQLite.
- TTL default: **28800 secondi (8 ore)**; configurabile con `TRAMA_MEMORY_SESSION_TTL_SECONDS`; valori ammessi **60..86400**.
- Una capacità è valida solo per l’`Origin` che l’ha richiesta.
- Il restart del daemon invalida tutte le capacità.
- `/v1/session` non sincronizza, non indicizza e non modifica proiezioni.
- Nessuna modifica alle classi dati, CAS, indice o provider embedding.

## Review Focus

1. **Origin assente su `/v1/session`:** deve fallire; un client CLI può usare il master token sugli endpoint storici ma non ottenere una sessione browser senza Origin.
2. **Capacità valida con Origin diverso:** deve fallire prima di invocare il servizio applicativo.
3. **Capacità scaduta:** deve fallire come non autorizzata e venire rimossa dallo store.
4. **Master token storico:** deve continuare a funzionare per richieste loopback senza Origin e con Origin ammessa.
5. **Health del servizio in errore durante bootstrap:** non deve emettere una sessione utilizzabile né restituire token in una risposta 5xx.

---

### Task 1: Store in-memory delle capacità effimere

**Files:**
- Create: `runtime/local-semantic-memory/session_auth.py`
- Create: `runtime/local-semantic-memory/tests/test_session_auth.py`

**Interfaces:**
- Consumes: nessuna dipendenza nuova oltre stdlib.
- Produces: `SessionCapabilityStore(ttl_seconds: int, now_fn: Callable[[], float] = time.time)`, `issue(origin: str) -> SessionCapability`, `matches(token: str, origin: str | None) -> bool`, `active_count() -> int`.
- Produces: `SessionCapability(token: str, origin: str, expires_at_epoch: float)`.

- [ ] **Step 1: Write failing unit tests**

Aggiungere test che fissano:

```python
store = SessionCapabilityStore(ttl_seconds=60, now_fn=clock)
cap = store.issue('http://127.0.0.1:4173')
assert len(cap.token) >= 43
assert store.matches(cap.token, 'http://127.0.0.1:4173') is True
assert store.matches(cap.token, 'http://localhost:4173') is False
```

Aggiungere test per expiry, rimozione lazy delle capability scadute, token diversi su due `issue()`, e nuovo store vuoto dopo “restart” simulato.

- [ ] **Step 2: Run RED**

Run:

```bash
python3 -m unittest runtime/local-semantic-memory/tests/test_session_auth.py -v
```

Expected: FAIL perché `session_auth` non esiste.

- [ ] **Step 3: Implement minimal store**

Creare `SessionCapability` frozen dataclass e `SessionCapabilityStore` con `secrets.token_urlsafe(32)`, `hmac.compare_digest`, dizionario bounded in-memory e purge delle entry scadute. Nessuna scrittura file.

- [ ] **Step 4: Run GREEN**

Run lo stesso comando. Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add runtime/local-semantic-memory/session_auth.py runtime/local-semantic-memory/tests/test_session_auth.py
git commit -m "feat(lsm-01d): add ephemeral session capability store"
```

---

### Task 2: Configurazione TTL fail-closed

**Files:**
- Modify: `runtime/local-semantic-memory/config.py`
- Modify: `runtime/local-semantic-memory/tests/test_runtime_security.py`

**Interfaces:**
- Consumes: `RuntimeConfig` esistente.
- Produces: `RuntimeConfig.session_ttl_seconds: int` con default `28800`.

- [ ] **Step 1: Write failing config tests**

Aggiungere assert:

```python
self.assertEqual(load_runtime_config(env).session_ttl_seconds, 28800)
self.assertEqual(load_runtime_config({**env, 'TRAMA_MEMORY_SESSION_TTL_SECONDS':'3600'}).session_ttl_seconds, 3600)
```

e rifiuto per `0`, `59`, `86401`, `abc`.

- [ ] **Step 2: Run RED**

```bash
python3 -m unittest runtime/local-semantic-memory/tests/test_runtime_security.py -v
```

Expected: FAIL sul nuovo attributo/validazione.

- [ ] **Step 3: Implement config**

Aggiungere il campo a `RuntimeConfig` e parsing di `TRAMA_MEMORY_SESSION_TTL_SECONDS` con range inclusivo 60..86400.

- [ ] **Step 4: Run GREEN**

Stesso comando. Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add runtime/local-semantic-memory/config.py runtime/local-semantic-memory/tests/test_runtime_security.py
git commit -m "feat(lsm-01d): configure bounded session capability ttl"
```

---

### Task 3: Endpoint `/v1/session` con Origin obbligatoria

**Files:**
- Modify: `runtime/local-semantic-memory/server.py`
- Modify: `runtime/local-semantic-memory/tests/test_http_api.py`
- Modify: `runtime/local-semantic-memory/tests/test_runtime_security.py`

**Interfaces:**
- Consumes: `SessionCapabilityStore.issue(origin)` e `RuntimeConfig.session_ttl_seconds`.
- Produces: `POST /v1/session` → `trama.semantic-memory-session/v1` con `token`, `expiresAt`, `health`.

- [ ] **Step 1: Write failing HTTP tests**

Aggiungere test reali sul server che fissano:

- `POST /v1/session` senza `Origin` → `403 origin_forbidden`;
- Origin non ammessa → `403`;
- Origin ammessa → `200`, schema esatto, token non vuoto, `health.status == ready`, `expiresAt` ISO-8601 UTC;
- risposta contiene `Access-Control-Allow-Origin` esatto;
- `OPTIONS /v1/session` è ammesso solo per Origin whitelist;
- se `svc.health()` fallisce → `503 service_unavailable` e nessun `token` nel payload.

- [ ] **Step 2: Run RED**

```bash
python3 -m unittest runtime/local-semantic-memory/tests/test_http_api.py runtime/local-semantic-memory/tests/test_runtime_security.py -v
```

Expected: FAIL perché route e session store server-side non esistono.

- [ ] **Step 3: Implement route**

In `server.py`:

- includere `/v1/session` in `KNOWN_PATHS`;
- creare `SessionCapabilityStore` in `create_server()` usando il TTL di config;
- esporlo come `server.runtime_sessions`;
- aggiungere proprietà handler `sessions`;
- gestire `/v1/session` prima delle route mutative storiche;
- richiedere `Origin` non nullo e whitelist esatta;
- chiamare `svc.health()` prima di `issue()`;
- emettere capacità solo dopo health riuscita.

- [ ] **Step 4: Run GREEN**

Stesso comando. Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add runtime/local-semantic-memory/server.py runtime/local-semantic-memory/tests/test_http_api.py runtime/local-semantic-memory/tests/test_runtime_security.py
git commit -m "feat(lsm-01d): add origin-bound session bootstrap endpoint"
```

---

### Task 4: Autenticazione dual-path master/sessione

**Files:**
- Modify: `runtime/local-semantic-memory/auth.py`
- Modify: `runtime/local-semantic-memory/server.py`
- Modify: `runtime/local-semantic-memory/tests/test_http_api.py`
- Modify: `runtime/local-semantic-memory/tests/test_runtime_security.py`

**Interfaces:**
- Consumes: `SessionCapabilityStore.matches(token, origin)`.
- Produces: `bearer_authorized(header: str | None, master_token: str, sessions: SessionCapabilityStore, origin: str | None) -> bool`.

- [ ] **Step 1: Write failing authorization tests**

Fissare:

- master token valido continua ad autorizzare POST;
- session token valido + stessa Origin autorizza POST;
- stesso token + Origin diversa fallisce;
- session token senza Origin fallisce;
- token scaduto fallisce;
- un fallimento auth non incrementa `svc.calls`.

- [ ] **Step 2: Run RED**

```bash
python3 -m unittest runtime/local-semantic-memory/tests/test_http_api.py runtime/local-semantic-memory/tests/test_runtime_security.py -v
```

Expected: FAIL sul nuovo dual-path.

- [ ] **Step 3: Implement dual-path**

`bearer_authorized` usa `bearer_matches` per il master token e, in alternativa, estrae il bearer e delega allo store sessione. Il server mantiene `_origin_ok()` prima dell’autenticazione.

- [ ] **Step 4: Run GREEN**

Stesso comando. Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add runtime/local-semantic-memory/auth.py runtime/local-semantic-memory/server.py runtime/local-semantic-memory/tests/test_http_api.py runtime/local-semantic-memory/tests/test_runtime_security.py
git commit -m "feat(lsm-01d): authorize origin-bound session capabilities"
```

---

### Task 5: Runbook Termux e configurazione origine

**Files:**
- Modify: `runtime/local-semantic-memory/README.md`
- Modify: `runtime/local-semantic-memory/tests/test_runbook_contract.py`

**Interfaces:**
- Consumes: variabili runtime esistenti + `TRAMA_MEMORY_SESSION_TTL_SECONDS`.
- Produces: procedura documentata per origine consumer esatta e zero token browser.

- [ ] **Step 1: Write failing runbook contract**

Aggiungere assert che README contenga:

- `TRAMA_MEMORY_ALLOWED_ORIGINS=http://127.0.0.1:4173` come esempio smoke locale;
- divieto wildcard;
- `TRAMA_MEMORY_SESSION_TTL_SECONDS=28800`;
- `/v1/session`;
- nota esplicita che il master token non va copiato nel browser.

- [ ] **Step 2: Run RED**

```bash
python3 -m unittest runtime/local-semantic-memory/tests/test_runbook_contract.py -v
```

Expected: FAIL.

- [ ] **Step 3: Update README**

Documentare bootstrap, TTL, CORS esatto, master token CLI-only/administrativo e journey Android.

- [ ] **Step 4: Run GREEN**

Stesso comando. Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add runtime/local-semantic-memory/README.md runtime/local-semantic-memory/tests/test_runbook_contract.py
git commit -m "docs(lsm-01d): document zero-token local session bootstrap"
```

---

### Task 6: Regressione runtime completa

**Files:**
- No product changes unless a causal regression is found.

**Interfaces:**
- Consumes: Tasks 1–5.
- Produces: exact-SHA runtime candidate qualificabile dal consumer.

- [ ] **Step 1: Run full runtime suite**

```bash
python3 -m unittest discover -s runtime/local-semantic-memory/tests -p 'test_*.py' -v
```

Expected: all PASS.

- [ ] **Step 2: Static syntax check**

```bash
python3 -m compileall -q runtime/local-semantic-memory
```

Expected: exit 0.

- [ ] **Step 3: Real loopback smoke**

Avviare daemon con Origin `http://127.0.0.1:4173`; verificare `OPTIONS`, `POST /v1/session`, poi `POST /v1/search` con la capability ottenuta. Non stampare il token in evidenze persistenti.

Expected: session 200, search autenticata non 401, origin diversa 403.

- [ ] **Step 4: Freeze exact SHA**

Registrare SHA, suite, runtime profile e nessun merge/deploy.
