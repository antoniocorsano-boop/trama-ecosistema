# TRAMA Control Center Live Component Evidence R1

**Contract ID:** CC-COMP-LIVE-01  
**Status:** PROPOSED / READ_ONLY / DEPLOY-BUNDLE-ONLY  
**Parent:** TRAMA-COMPONENT-EVIDENCE-LANE-02 · CC-MAT-COMP-01  
**Runtime product impact:** NONE

## Decision

The Control Center deploy bundle may compose the governed Component Evidence Registry with a read-only Live Component Evidence Overlay before projecting component maturity.

The canonical governed snapshot remains generated from governed repository sources only.

Live component evidence is materialized only in the deploy workspace/bundle and is discarded after the build.

## First source

Atlas R1 component-isolation evidence is verified from public GitHub Actions metadata for the already qualified immutable run and artifact.

No GitHub App, token or write permission is required.

## Presentation semantics

- a live evidence item may display `PRESENT`;
- its provenance is marked `LIVE_VERIFIED`;
- lifecycle remains governed;
- confirmed maturity does not advance through a live-only prerequisite;
- candidate maturity may use the effective evidence chain;
- unavailable live evidence falls back to the governed snapshot.

## Safety boundary

The live adapter cannot:
- write to any repository;
- mutate the governed component registry;
- authorize runtime or dependency adoption;
- change lifecycle;
- merge or promote;
- create a canonical checkpoint automatically.
