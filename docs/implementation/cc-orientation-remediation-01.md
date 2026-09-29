# CC-ORIENTATION-REMEDIATION-01 — Mobile orientation and live-context remediation

**Date:** 2026-09-29  
**Status:** IMPLEMENTATION SLICE / HUMAN REVIEW REQUIRED  
**Scope:** TRAMA Control Center Home, maturity destination, Render public deployment  
**Authority:** existing Control Center orientation architecture and Project Knowledge contracts  
**Runtime write authority:** NONE  
**DOS-A1:** RUNTIME_DEFERRED

## 1. Trigger

A real mobile inspection of the public Render surface exposed four concrete problems:

1. the Home again behaved like a long specialist dashboard;
2. the component maturity graph required horizontal scrolling before its meaning was understandable;
3. internal enum/implementation vocabulary leaked into the primary reading layer;
4. the public Render site served the current UI commit but the committed Project Knowledge fallback remained dated 2026-09-28 because Render copied `control-center/` without executing the already-qualified live-context materializer.

These findings are not new product requirements. They are implementation gaps against already governed orientation, progressive-disclosure and Project Knowledge decisions.

## 2. Home placement correction

The full maturity matrix and component graph are removed from the Home.

The Home exposes only:

- number of observed maturity areas;
- number of tracked components;
- a short explanation;
- a direct link to the dedicated Maturity destination.

This implements the existing rule that the Home is an overview/launch point rather than the full specialist report.

## 3. Dedicated Maturity destination

`control-center/maturity.html` becomes the specialist maturity surface.

Desktop order:

1. governed summary;
2. area maturity;
3. component filters;
4. graph + detail;
5. equivalent list.

Mobile order for components:

1. equivalent readable list;
2. selected component detail;
3. optional collapsed graphical map.

The graph remains available, but a user is never forced to horizontally scroll it merely to understand the component state.

## 4. Human-readable primary vocabulary

Visible Home labels translate internal enums where the information remains on Home.

Examples:

- AUTHORITY → Autorità;
- DATA_FLOW → Flusso dati;
- FUTURE_NOT_AUTHORIZED → Futuro non autorizzato;
- PLANNED → Pianificata;
- DOCUMENT_CANONICAL → Documento canonico;
- UNTIL_CHANGE → Valido fino a modifica.

Raw identifiers remain available through contextual/technical detail when needed.

## 5. Empty phase behavior

If no phase is ACTIVE or IN_PROGRESS, mobile no longer leaves an unexplained empty vertical region.

It shows an explicit neutral message and points to the complete chronology.

## 6. Render live Project Knowledge alignment

The Render service currently builds by copying `control-center/` directly.

That means the GitHub Actions deploy bundle can contain a live Effective Context while the Render site still serves the committed fallback pack.

The governed build entrypoint becomes:

`bash scripts/build_control_center_render.sh`

It:

1. copies the static Control Center to the publish directory;
2. attempts the existing public-anonymous read-only repository overlay;
3. materializes Project Knowledge into the publish directory only;
4. never writes back to the repository;
5. uses no GitHub App, GitHub token or arbitrary network destination;
6. falls back to the governed committed Project Knowledge pack if live observation/materialization is unavailable.

The fail-closed fallback remains explicit in the UI.

## 7. Network boundary

The Render build does not introduce a new collector.

It invokes the already governed chain:

`run_live_repository_overlay.py` → `run_public_anonymous_repository_observation.py` → `public_anonymous_transport.py`

The transport remains limited to:

- api.github.com;
- explicitly enrolled public repositories;
- GET-only predefined repository/ref/commit/open-PR operations;
- deterministic request/resource budgets;
- no redirects;
- no credential material.

## 8. Acceptance criteria

The slice passes when:

- Home has no full component maturity graph;
- Maturity is reachable as a dedicated destination;
- mobile component reading works without opening the graph;
- graph is collapsed by default on narrow screens;
- lifecycle/source/evidence labels are human-readable;
- no-active-phase state is explicit;
- Render build contract is testable offline;
- live materialization is optional and fail-closed;
- current Control Center, Project Knowledge and Governance suites remain green.

## 9. Boundaries

This remediation does not:

- change maturity calculations;
- change evidence or lifecycle authority;
- add authentication;
- add a GitHub App;
- add runtime write capability;
- promote observed live facts to governed knowledge;
- change product repositories;
- authorize DOS-A1.
