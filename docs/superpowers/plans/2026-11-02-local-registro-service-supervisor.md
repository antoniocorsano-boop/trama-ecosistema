# LOCAL-REG-02 Registro Termux Service Supervisor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Supervise an already-built Registro Docente production checkout on Android/Termux at `127.0.0.1:4173` so ordinary use requires only tapping the app shortcut.

**Architecture:** A separate `runtime/local-registro-service/` runtime installs one runit service, one CLI wrapper, one non-secret config file, logging, and optional Termux:Boot support. It never builds, updates, or downloads the application.

**Tech Stack:** Python 3, POSIX shell runit/termux-services, Node/Bun runtime supplied by the device, existing TRAMA Governance workflow.

**Spec:** `docs/superpowers/specs/2026-11-02-local-registro-service-supervisor-design.md`

## Global Constraints

- Service name: `trama-registro`.
- Bind host: exactly `127.0.0.1`.
- Default port: exactly `4173`.
- No Git/build/install/download operation from `start`, boot script, or generated run script.
- Required prebuilt artifact: `dist/index.html`.
- Install records an exact candidate SHA, requires a clean tracked worktree, freezes the complete `dist/` digest, and rejects identity drift.
- Installed controller Python modules are frozen under `$PREFIX/libexec/trama-registro`; the wrapper never executes a mutable TRAMA source checkout.
- No automatic Local Semantic Memory activation.
- Existing LSM services/boot script remain independently managed.

## Review Focus

- Existing legacy process on 4173 must never be killed automatically.
- A supervised process that releases 4173 slowly must not be misclassified as external.
- Missing/stale `dist/` must fail closed rather than trigger a build.
- Shell quoting must preserve application paths containing spaces/shell metacharacters.
- Boot script must coexist with `20-trama-memory-services`, route through guarded `trama-registro start`, and not infer LSM authority.
- `status` must never report HTTP ready when candidate identity verification fails.

---

### Task 1: Pure Registro service configuration and run rendering

**Files:**
- Create: `runtime/local-registro-service/registro_supervisor.py`
- Create: `runtime/local-registro-service/tests/test_registro_supervisor.py`

**Interfaces:**
- Produces: `RegistroSupervisorConfig`, `render_registro_run(config)`, `render_registro_boot(prefix)`.

- [ ] **Step 1: Write failing tests**

Cover exact defaults 127.0.0.1/4173, invalid ports, reserved 8080/8765 rejection, shell quoting, required exports, direct execution of configured runtime + `server.ts`, and absence of `git`, `install`, `build`, `pull` commands.

- [ ] **Step 2: Run RED**

Expected: module/functions absent.

- [ ] **Step 3: Implement pure configuration/rendering**

No filesystem mutation in this module.

- [ ] **Step 4: Run GREEN**

Expected: focused tests PASS.

- [ ] **Step 5: Commit**

Commit pure rendering slice.

### Task 2: Atomic installation and exact-checkout validation

**Files:**
- Create: `runtime/local-registro-service/trama_registro.py`
- Create: `runtime/local-registro-service/tests/test_trama_registro_install.py`

**Interfaces:**
- Consumes: Task 1 renderers/config.
- Produces: `install_service(...) -> InstalledRegistro` and `load_installed(...)`.

- [ ] **Step 1: Write failing install tests**

Cover missing app dir/server/package/dist, non-executable runtime, candidate SHA mismatch, dirty tracked worktree, complete `dist/` digest drift, frozen controller publication, atomic config/wrapper/down/log/run publication, mode bits, rollback after late write failure, and no checkout mutation.

- [ ] **Step 2: Run RED**

Expected: installer absent.

- [ ] **Step 3: Implement minimum installer**

Reuse LSM-01E atomic-write/rollback patterns without importing its private implementation.

- [ ] **Step 4: Run GREEN**

Expected: focused installer suite PASS.

- [ ] **Step 5: Commit**

Commit installer slice.

### Task 3: Lifecycle, ownership, status, smoke

**Files:**
- Modify: `runtime/local-registro-service/trama_registro.py`
- Create: `runtime/local-registro-service/tests/test_trama_registro_lifecycle.py`

**Interfaces:**
- Produces: `start_service`, `stop_service`, `status_service`, `smoke_service`.

- [ ] **Step 1: Write RED lifecycle tests**

Cover free port + down service, free port + active old config restart, occupied external listener fail-closed, occupied supervised listener causal stop/release/restart, delayed release bounded polling, identity drift fail-closed in `status`, cleanup on start failure, and no `kill`/`pkill`.

- [ ] **Step 2: Run RED**

Expected: lifecycle interfaces absent.

- [ ] **Step 3: Implement lifecycle**

Mirror the already-qualified LSM-01E ownership semantics, scoped only to `trama-registro`/4173.

- [ ] **Step 4: Add smoke RED/GREEN**

Smoke uses proxy-disabled loopback GET `/`, requires HTTP 200 and HTML `id="root"`, and performs no mutation.

- [ ] **Step 5: Run GREEN**

Expected: lifecycle + smoke tests PASS.

- [ ] **Step 6: Commit**

Commit lifecycle slice.

### Task 4: CLI, boot installation, and runbook

**Files:**
- Modify: `runtime/local-registro-service/trama_registro.py`
- Create: `runtime/local-registro-service/tests/test_trama_registro_cli.py`
- Create: `runtime/local-registro-service/README.md`

**Interfaces:**
- Produces CLI: `install`, `start`, `stop`, `status`, `smoke`, `install-boot`.

- [ ] **Step 1: Write RED CLI/boot tests**

Assert wrapper command behavior, frozen controller path, bounded supervisor wait, boot path `~/.termux/boot/30-trama-registro`, guarded `trama-registro start` before any `sv up`, and no build/update/LSM commands.

- [ ] **Step 2: Run RED**

- [ ] **Step 3: Implement CLI + boot installer + concise runbook**

Runbook must state that production `dist` is prepared separately and that the browser shortcut is `http://127.0.0.1:4173`.

- [ ] **Step 4: Run GREEN**

Expected: all local-registro-service tests PASS.

- [ ] **Step 5: Commit**

Commit CLI/runbook slice.

### Task 5: Governance qualification and final review

**Files:**
- Modify/create only governance tests required by `trama-ecosistema` impact classification.

- [ ] **Step 1: Add runtime to governance coverage using RED→GREEN discipline**

Ensure new guarded files cannot bypass Governance.

- [ ] **Step 2: Run complete Governance exact-SHA suite**

Expected: PASS with no regression in LSM-01D/01E.

- [ ] **Step 3: Fresh whole-branch independent review**

Expected: 0 Critical / 0 Important.

### Post-review hardening incorporated before hardware qualification

The whole-branch review added and qualified these fail-closed guarantees without widening runtime authority:

- deterministic digest of the entire `dist/` tree rather than `dist/index.html` alone;
- atomic rollback, persisted-config restart, and delayed port-release regressions;
- frozen installed copies of both controller Python modules;
- Termux:Boot routed through guarded `trama-registro start`;
- `status` identity verification before HTTP readiness;
- rejection of staged/unstaged changes to tracked Registro files at install/start/status/smoke.

### Task 6: Android/Termux hardware qualification

**Files:** none in candidate.

- [ ] **Step 1: Prepare exact Registro production build separately**

Use integrated Registro candidate with LOCAL-REG-01 and record exact SHA; no build occurs inside the supervisor.

- [ ] **Step 2: Install exact LOCAL-REG-02 candidate on Android**

- [ ] **Step 3: Prove `trama-registro start`, `status`, and `smoke`**

Expected: service active, HTTP ready, exact configured candidate reported, smoke PASS.

- [ ] **Step 4: Install optional Termux:Boot and cold-start device/session proof**

Expected: service becomes ready after Termux:Boot without manual terminal commands.

- [ ] **Step 5: Human-use proof**

Open the Android home-screen shortcut to `http://127.0.0.1:4173` without opening Termux; then explicitly activate Local Semantic Memory inside Registro and verify it remains a separate gesture.

- [ ] **Step 6: Record hardware receipt; no merge/deploy until exact evidence is attached**