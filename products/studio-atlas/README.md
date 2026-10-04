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
- Production request state
- explicit **Produzione in attesa** when no FREE_ONLY provider is bound

## Intentionally not faked

- professional authentication
- remote draft store
- Arena curriculum search
- story/world editors
- actual GPU execution
- learner preview
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
