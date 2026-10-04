# Studio Atlas ↔ Atlas — Ephemeral Learner Preview Bridge v0.1

**Status:** CROSS_PRODUCT_CONTRACT_IMPLEMENTED / BUILD_PASS / NOT_STUDENT_AUTHORIZED  
**Date:** 2026-10-04  
**Products:** Studio Atlas · Atlas  
**Runtime publication:** NOT_AUTHORIZED

## Purpose

Enable the professional action:

**Vedi come studente**

without:

- embedding the learner runtime inside Studio Atlas;
- putting the authoring snapshot in the URL;
- requiring a learner account;
- introducing a persistent preview database for direct creator preview;
- publishing the pathway;
- reusing the deprecated Phaser spike as product runtime.

## Architecture

`Studio Atlas authoring state`
→ exact `studio-atlas.preview-snapshot/v0.1`
→ browser-to-browser ephemeral bridge
→ Atlas `/percorsi/lab/studio-atlas-preview/`
→ snapshot validation
→ `PathwayRuntimeSurface`
→ `ExperienceRuntime`.

Atlas remains the learner-runtime owner.

Studio Atlas remains the authoring owner.

## Why browser-to-browser

Atlas PR/public channels can operate as static export.

A server-only preview API would make direct preview depend on a new runtime service.

For the immediate creator-preview use case, persistence is unnecessary.

The bridge therefore uses a short-lived window relationship and an unpredictable channel nonce.

## Studio Atlas behaviour

On an explicit human click:

1. verify preview blockers are empty;
2. open a new window synchronously;
3. create the exact snapshot and SHA-256 package digest;
4. create a random 24-byte channel value;
5. navigate the new window to the configured Atlas preview origin;
6. wait for READY from the exact Atlas origin and exact opened window;
7. send the snapshot using `postMessage(snapshot, atlasOrigin)`.

Required public configuration:

`NEXT_PUBLIC_ATLAS_PREVIEW_ORIGIN`.

If missing, Studio Atlas fails closed and does not pretend a preview exists.

## Atlas behaviour

Atlas preview route:

`/percorsi/lab/studio-atlas-preview/?channel=<nonce>`.

The URL contains only the random channel nonce, never the authoring content.

Atlas requires:

- `window.opener`;
- configured Studio Atlas origin;
- matching `event.origin`;
- matching `event.source`;
- matching channel;
- valid preview snapshot.

Required public configuration:

`NEXT_PUBLIC_STUDIO_ATLAS_ORIGIN`.

Wildcard postMessage target origins are prohibited.

## Snapshot invariants

The bridge accepts only:

`studio-atlas.preview-snapshot/v0.1`.

Mandatory:

- exact package digest;
- `runtimeAuthorized=false`;
- `studentAuthorized=false`;
- complete scene set;
- at least one explicit `TRANSFER` scene.

TRANSFER is authored by the creator and is never inferred by Atlas.

## Privacy/state

For direct preview:

- snapshot is transferred in memory;
- Atlas does not persist the snapshot;
- session state is volatile;
- learner identity is false;
- telemetry is false;
- no public catalogue entry is created.

Closing the preview window ends the handoff.

## Security properties

The bridge uses:

- high-entropy random channel;
- exact target origin;
- exact sender origin;
- exact sender window;
- fail-closed snapshot validation.

The bridge must never use:

`postMessage(..., "*")`.

## Failure states

Human-facing failures remain explicit:

- preview origin not configured;
- popup blocked;
- handshake timeout;
- invalid snapshot;
- preview opened outside Studio Atlas.

None of these failures authorise publication or fallback to a weaker path.

## Shared/asynchronous review

This v0.1 contract covers **direct creator preview only**.

A future shared-review URL may add a short-lived opaque capability broker.

That is a separate capability and must not replace the simpler direct preview path unless justified.

## Implementation evidence

### Studio Atlas

Repository context: `trama-ecosistema`, transitional standalone slice:

- `products/studio-atlas/lib/preview.ts`
- `products/studio-atlas/lib/preview-bridge.ts`
- `products/studio-atlas/components/PathwayWorkspace.tsx`

Studio build/typecheck/product-boundary gate: PASS after bridge corrections.

### Atlas

PR #80 — `Studio Atlas: add governed learner preview adapter`.

Implementation:

- `studio-atlas-preview-adapter.ts`
- `studio-atlas-preview-bridge.tsx`
- `/percorsi/lab/studio-atlas-preview/`
- dedicated preview CI.

Atlas preview adapter, Experience Engine, UX Collaudo and related qualification gates: PASS.

## Authority

This contract does not:

- publish a Percorso;
- authorise students;
- grant Atlas publication authority;
- change Arena authority;
- activate DOS-A1;
- authorise Visual Factory compute.
