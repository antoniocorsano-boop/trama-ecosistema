# LSM-01E Termux Service Supervisor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** rendere EmbeddingGemma + `trama-memoryd` un servizio Termux supervisionato e ridurre configurazione/smoke a un solo comando `trama-memory`.

**Architecture:** la logica di configurazione e rendering dei servizi vive in un modulo Python testabile su CI; un CLI Python gestisce install/start/stop/status/smoke e genera due servizi runit per `termux-services`. Il consumer Registro LSM-01D non cambia.

**Tech Stack:** Python 3 stdlib, shell POSIX per i run script generati, `termux-services`/runit, Termux:Boot opzionale.

**Spec:** `docs/superpowers/specs/2026-11-01-lsm-01e-termux-service-supervisor-design.md`

## Global Constraints

- bind esclusivo `127.0.0.1` per embedding e memoryd;
- origini CORS esatte, wildcard vietata;
- nessun download automatico di modelli/binari;
- nessun master token in config, stdout, log o browser;
- nessun auto-sync/probe browser;
- smoke solo sintetico e con cleanup;
- nessun merge/deploy.

## Review Focus

- origine con wildcard/path/query: install deve fallire;
- percorso modello o `llama-server` non valido: install deve fallire senza creare servizi parziali;
- embedding non raggiungibile: `start` deve fallire prima di memoryd;
- capability/sessione non deve finire in output persistente;
- smoke interrotto deve tentare cleanup della proiezione sintetica.

---

### Task 1: Configurazione e rendering servizi

**Files:**
- Create: `runtime/local-semantic-memory/termux_supervisor.py`
- Create: `runtime/local-semantic-memory/tests/test_termux_supervisor.py`

**Interfaces:**
- Produces: `SupervisorConfig`, `validate_origin(origin)`, `render_embedding_run(config)`, `render_memoryd_run(config)`, `render_boot_script(prefix)`.

- [ ] **Step 1: Write the failing tests** per validazione origine, loopback nei run script, assenza download e wait embedding.
- [ ] **Step 2: Run** `python3 -m unittest runtime/local-semantic-memory/tests/test_termux_supervisor.py -v`; expected RED per modulo assente.
- [ ] **Step 3: Implement minimal module** con sole funzioni pure e dataclass di configurazione.
- [ ] **Step 4: Re-run test**; expected PASS.
- [ ] **Step 5: Commit** `feat(lsm-01e): add Termux service renderer`.

### Task 2: CLI `trama-memory`

**Files:**
- Create: `runtime/local-semantic-memory/trama_memory.py`
- Extend: `runtime/local-semantic-memory/tests/test_termux_supervisor.py`

**Interfaces:**
- Consumes Task 1 render/validation functions.
- Produces CLI commands `install`, `start`, `stop`, `status`, `install-boot`.

- [ ] **Step 1: Add failing CLI tests** usando directory temporanee e binari fittizi; verificare install atomico, wrapper, service dirs e nessun token.
- [ ] **Step 2: Run targeted tests**; expected RED per CLI assente.
- [ ] **Step 3: Implement CLI** con `argparse`, `subprocess.run`, polling health e output sintetico.
- [ ] **Step 4: Run targeted tests**; expected PASS.
- [ ] **Step 5: Commit** `feat(lsm-01e): add trama-memory service CLI`.

### Task 3: Smoke hardware in un comando

**Files:**
- Create: `runtime/local-semantic-memory/hardware_smoke.py`
- Create: `runtime/local-semantic-memory/tests/test_hardware_smoke.py`
- Modify: `runtime/local-semantic-memory/trama_memory.py`

**Interfaces:**
- Produces: `run_smoke(base_url, origin, control)` e comando `trama-memory smoke`.

- [ ] **Step 1: Add failing smoke tests** con server HTTP fittizio: session bootstrap, upsert sintetico, search, restart/invalidation, nuova sessione, persistenza, remove cleanup.
- [ ] **Step 2: Run smoke tests**; expected RED per modulo assente.
- [ ] **Step 3: Implement smoke** senza stampare bearer e con cleanup in `finally`.
- [ ] **Step 4: Run smoke tests + runtime suite**; expected PASS.
- [ ] **Step 5: Commit** `feat(lsm-01e): add one-command hardware smoke`.

### Task 4: Installazione una tantum e documentazione

**Files:**
- Modify: `runtime/local-semantic-memory/README.md`
- Modify: `runtime/local-semantic-memory/tests/test_runbook_contract.py`

**Interfaces:**
- Documents official flow: `pkg install termux-services` once, `trama-memory install ...`, optional `trama-memory install-boot`, then daily browser-only usage.

- [ ] **Step 1: Extend runbook contract** to require one-command lifecycle, Termux:Boot script and no automatic model download.
- [ ] **Step 2: Run runbook test**; expected RED before README update.
- [ ] **Step 3: Update README** with one-time setup and daily UX; cite no secrets in config.
- [ ] **Step 4: Run full runtime suite and root Governance suite**.
- [ ] **Step 5: Commit** `docs(lsm-01e): document invisible Termux runtime`.

### Task 5: Exact-SHA qualification

**Files:** none unless a causal repair is required.

- [ ] Open stacked Draft PR on `feat/lsm-01d-session-bridge`.
- [ ] Confirm Governance exact-SHA PASS and nested runtime suite PASS.
- [ ] Perform independent whole-branch review for secret persistence, LAN exposure, wildcard CORS and destructive install paths.
- [ ] Keep Android/Termux service/boot smoke explicitly PENDING until run on the real device.
