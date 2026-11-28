# Contextual Copilot Core Distribution v1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** rendere `@trama/contextual-copilot-core@0.1.0` consumabile cross-repository tramite snapshot vendorizzato, versionato e verificabile senza registry esterni.

**Architecture:** TRAMA resta la fonte canonica e pubblica un `distribution.json` con exact source commit, file set e SHA-256. I consumer materializzano quei file come package locale `file:` e verificano provenienza/digest; nessuna rete è richiesta in build/runtime.

**Tech Stack:** JSON, Python unittest, npm pack dry-run, GitHub Actions Governance.

**Spec:** `docs/superpowers/specs/2026-10-24-contextual-copilot-core-distribution-v1-contract.md`

## Global Constraints

- baseline esatta `main@4de1de1daf2a68ebee4d52b0140420b45ae1ef3e`;
- package `@trama/contextual-copilot-core@0.1.0` invariato;
- nessun registry esterno;
- nessuna dipendenza JavaScript root-level;
- nessun deploy/publish;
- superficie importabile invariata a quattro file;
- exact-SHA qualification.

## Review Focus

- drift tra manifesto e file reali del package → deve fallire chiuso;
- file extra nel manifesto o nel pack → deve fallire;
- source commit/semantic version mancanti o mobili → deve fallire;
- cambio di package name → deve fallire;
- requisito involontario di rete/registry → deve fallire.

---

### Task 1: RED del contratto di distribuzione

**Files:**
- Create: `tests/test_contextual_copilot_core_distribution.py`

**Interfaces:**
- Consumes: package già integrato in `shared/contextual-copilot-core/`.
- Produces: contratto eseguibile del manifesto v1.

- [ ] Scrivere il test che richiede `distribution.json`, schema/version/source exact, file set chiuso, digest SHA-256 e pack surface invariata.
- [ ] Eseguire Governance sul test-only commit e verificare RED causale per manifesto assente.

### Task 2: Manifesto canonico

**Files:**
- Create: `shared/contextual-copilot-core/distribution.json`

**Interfaces:**
- Consumes: test Task 1.
- Produces: fonte canonica di versioning/provenienza per i consumer.

- [ ] Calcolare SHA-256 dei quattro file canonici sul source commit integrato.
- [ ] Materializzare il manifesto con `consumerMode = vendored-file-package`, `networkRequiredAtBuild = false`, `externalRegistryRequired = false`.
- [ ] Rieseguire Governance e ottenere GREEN sullo stesso contratto.

### Task 3: Qualification e integrazione

**Files:** nessun nuovo file salvo eventuali correzioni causali.

- [ ] Verificare exact head, TERM-01, OR-07, OR-08, full `Run tests` e package surface.
- [ ] Review del diff finale.
- [ ] Integrare soltanto su decisione umana già fornita per la sequenza CORE-01 → CORE-DIST-01 → LIB-01B; nessun auto-merge.
