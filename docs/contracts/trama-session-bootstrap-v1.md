# TRAMA Session Bootstrap v1

**Contract ID:** TRAMA-SESSION-BOOTSTRAP-01
**Date:** 2026-09-29
**Status:** IMPLEMENTATION SLICE / READ_ONLY / HUMAN REVIEW REQUIRED
**Parent:** TRAMA Development Continuity Protocol v1 · ProjectContextSnapshot v1 · TRAMA Context Pack v1
**Runtime impact:** NONE
**DOS-A1:** RUNTIME_DEFERRED

## 1. Purpose

Make development continuity executable instead of relying on conversational recall.

Before substantial discovery work, a TRAMA work session can resolve the current subject, retrieve governed context already available, identify relevant governed documents and negative knowledge, and state explicitly whether live verification is still required.

The bootstrap does not create a new knowledge base. It composes existing Project Knowledge assets.

## 2. Inputs

The bootstrap reads only existing governed or derived read-only inputs:

- ProjectContextSnapshot;
- TRAMA Context Pack builder;
- governed document registry;
- subject-resolution configuration;
- optional EffectiveProjectContext v1.

## 3. Required sequence

The executable sequence is:

request -> subject resolution -> governed context retrieval -> governed document retrieval -> negative knowledge check -> optional effective/live context -> bootstrap receipt -> work

The process principle is **retrieve before discover**.

Discovery, repository inspection and external research remain available after bootstrap, but should be used to verify volatile facts or fill real gaps rather than reconstruct already governed knowledge.

## 4. Subject resolution

config/session-bootstrap-subjects.json maps common human terms to the stable subject vocabulary already used by Project Knowledge and the governed document registry.

The resolver:

- is deterministic;
- supports an explicit subject override;
- may resolve multiple related context subjects;
- always includes the minimal continuity context;
- returns PARTIAL rather than inventing a subject when no rule matches.

The resolver configuration is routing metadata, not a new source of product truth.

## 5. Session Bootstrap Receipt

The receipt is machine-readable and validated by schemas/session-bootstrap-receipt.schema.json.

Allowed states:

- READY — governed context is usable and a usable effective/live context was supplied;
- READY_LIVE_CHECK_REQUIRED — governed context is usable but volatile repository/workflow facts still need a live check;
- PARTIAL_CONTEXT — the subject is not fully resolved or governed context is itself partial;
- BLOCKED — no qualifying governed context can be recovered.

The receipt exposes:

- resolved subjects;
- relevant governed documents;
- selected facts, decisions and invariants;
- exact heads and blocking gates already known;
- conflicts and rejected approaches;
- negative-knowledge check status;
- live-verification requirement;
- provenance;
- explicit non-authority flags.

## 6. Fail-closed rules

The bootstrap must fail or degrade explicitly when:

- snapshot identity is invalid;
- governed document registry identity is invalid;
- subject resolver identity is invalid;
- effective context identity is invalid;
- authority flags would imply write, runtime or promotion authority;
- no governed context is recoverable.

Unknown natural-language input must not be silently treated as a known workstream.

## 7. Authority boundary

The bootstrap is read-only.

It does not authorize:

- repository writes;
- merge or pull-request decisions;
- runtime activation;
- publication;
- lifecycle or maturity promotion;
- changes to product authority;
- DOS-A1.

A receipt is evidence of recovered context, not evidence that an action is approved.

## 8. Human and stakeholder value

The same mechanism supports different consumers without duplicating knowledge:

- **developer/agent** — starts from prior decisions, constraints, rejected approaches and exact-head context;
- **product owner** — can recover current workstream state without replaying chat history;
- **stakeholder** — can receive a traceable summary derived from the same governed sources;
- **Control Center** — can later surface bootstrap health and context provenance without becoming a second authority.

Human-facing presentation remains a projection of the same receipt/context, not a separate knowledge store.

## 9. Acceptance criteria

The slice is qualified when:

1. a Control Center maturity/components query recovers the existing UI and component-evidence documents without manual rediscovery;
2. missing live context yields READY_LIVE_CHECK_REQUIRED, not false freshness;
3. a usable EffectiveProjectContext yields READY;
4. an unknown subject yields PARTIAL_CONTEXT;
5. an explicit known subject such as atlas-percorsi recovers its prior evidence;
6. negative knowledge is checked;
7. schema validation and automated tests pass;
8. no write/runtime/promotion authority is introduced.

## 10. Next use

After qualification, the first real operational use is the Control Center maturity-visualization workstream. The bootstrap receipt should identify the already-governed UI architecture, component strategy, component evidence registry and Project Knowledge constraints before new research begins.
