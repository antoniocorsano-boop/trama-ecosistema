# Studio Atlas — standalone S1

Transitional standalone application slice for Studio Atlas.

This directory is intentionally isolated from the TRAMA Control Center and from Docente OS application code so it can be moved mechanically into a dedicated `studio-atlas` repository.

## What works

- Studio home
- create pathway from a plain-language idea
- local development persistence
- reopen/rename
- archive/restore
- authoring stage rail
- Idea editing with perceptible save feedback
- Story, World, Experience and Scene authoring
- explicit TRANSFER scene authoring
- Production request state
- explicit **Produzione in attesa** when no FREE_ONLY provider is bound
- governed **Vedi come studente** bridge to the real Atlas learner runtime

## Intentionally not faked

- professional authentication
- remote draft store
- Arena curriculum search
- story/world editors
- actual GPU execution
- public Atlas publication

## Stack

Aligned with Docente OS:

- Next 16.3.1
- React 19.2.8
- TypeScript 5.9.2
- Node 22

The S1 styling uses plain CSS to keep the bootstrap dependency surface small.

## Run

```bash
cd products/studio-atlas
npm install
npm run dev
```

## Extraction boundary

When the dedicated repository exists, move this directory root as-is, then replace the local draft adapter with the governed Studio Atlas draft-store/identity adapters.


## Learner preview

The Studio does not render a fake student mode.

`Vedi come studente`:

1. validates authoring readiness;
2. freezes an exact `studio-atlas.preview-snapshot/v0.1`;
3. opens the configured Atlas lab origin;
4. transfers the immutable snapshot over an origin-bound 192-bit nonce channel;
5. retries the exact snapshot for a bounded window;
6. completes only after Atlas validates it and returns ACK.

No authoring content is placed in the URL. Atlas does not persist the direct-preview snapshot.
