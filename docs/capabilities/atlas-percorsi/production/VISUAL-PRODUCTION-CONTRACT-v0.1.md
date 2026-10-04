# Visual Factory — Production Request & Receipt Contract v0.1

**Status:** PROPOSED_MACHINE_READABLE_CONTRACT  
**Runtime publication:** NOT_AUTHORIZED  
**Date:** 2026-10-04

## Purpose

Close the machine-readable boundary between Studio Atlas authoring and Visual Factory execution.

The creator acts on scenes and assets.

The system emits a **VisualProductionRequest**.

The Factory/compute layer returns a **VisualProductionReceipt**.

Neither object grants publication authority.

## Request

A request binds production to:

- exact Pathway Authoring Package digest;
- one or more scene refs;
- operation: generate/edit/variant;
- quality profile;
- product form;
- art direction/reference lock when present;
- bounded variants/attempts;
- TRAMA Compute Policy.

Hard invariants:

- `paidComputeAuthorized=false`;
- `allowQualityDowngrade=false`;
- attempts are bounded.

The request contains creator intent, not provider selection.

## Receipt

The receipt reports operational truth:

- queued/waiting/running/succeeded/failed/cancelled;
- compute plan digest;
- orchestrator/provider/accelerator when selected;
- effective cost class;
- attempts;
- model/artifact refs;
- output asset hashes;
- failure category.

A normal no-compute state is represented as:

- request retained;
- receipt `WAITING_FOR_COMPUTE`;
- failure/hold category `NO_FREE_PROVIDER` when applicable.

Studio Atlas translates this as **Produzione in attesa**.

## Separation of authority

A successful receipt means:

> the requested production operation completed and produced exact outputs.

It does NOT mean:

- Visual Quality Bar PASS;
- Reference Lock PASS;
- Experience Quality PASS;
- publication candidate accepted;
- Atlas runtime authorised.

Outputs return to Human Review/Studio Atlas.

## End-to-end chain

`Pathway Authoring Package`
→ `VisualProductionRequest`
→ `Compute Entitlement Snapshot`
→ `TRAMA Compute Plan`
→ `SkyPilot dry-run`
→ `bounded execution`
→ `VisualProductionReceipt`
→ `asset review`
→ `Atlas Visual Candidate`

## Idempotency direction

Future implementation MUST bind retries to an idempotency key derived from:

- request payload digest;
- package digest;
- operation;
- exact scene refs.

Provider retry must not accidentally create unbounded variants.

## Storage

Studio Atlas may persist request/receipt state in its own authoring domain.

Governed milestones materialise exact receipts into repository evidence.

Routine queue state does not require a Git commit for every transition.
