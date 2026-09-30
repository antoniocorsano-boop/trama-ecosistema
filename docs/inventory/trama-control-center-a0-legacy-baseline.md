# TRAMA Control Center — A0 Legacy Surface Baseline

**Document ID:** TRAMA-CC-A0-LEGACY-BASELINE-01  
**Status:** CURRENT BASELINE / READ_ONLY  
**Captured from:** main `c9c3031e022cab6b571b1ea323c938ab6090c353`  
**Purpose:** migration parity and rollback reference

## 1. Legacy production surfaces

| Surface | Blob SHA | Bytes | Lines | Current role |
|---|---|---:|---:|---|
| `control-center/index.html` | `89c4be3f0ade7522895743bcd20fdc51eb0ebf40` | 37,451 | 403 | Overview / Project Knowledge / assurance / attention / navigation |
| `control-center/maturity.html` | `a5301b684f3d09cc5d7cbc34a85cf7951aaee510` | 15,763 | 227 | Product and component maturity |
| `control-center/ecosystem.html` | `6aa299715e5d67253f61263bfc546ef0a18c3be3` | 18,962 | 197 | Capability / ecosystem map |
| `control-center/evidence.html` | `7f757c081d8e3639df1f7fe0fe53ef9a77ee9cc8` | 15,133 | 163 | Evidence Explorer / integrity |
| `control-center/operations.html` | `53e907d34f9dd75c3637b3d13050b63ac59dc1ae` | 12,832 | 127 | Operational path / governed timeline |

Supporting production assets:

| Asset | Blob SHA | Bytes | Lines | Role |
|---|---|---:|---:|---|
| `component-maturity.js` | `f26cb6f93f07b063d1ceb0089d107318b409af2f` | 15,687 | 382 | extracted maturity presentation logic |
| `project-knowledge-state.js` | `0d99b47c1d999861866eb3f77d41e0a267b106b7` | 9,354 | 179 | Project Knowledge state mapping |
| `sw.js` | `e51209ae7603d9c4a873aa28b269be1ccf4c3f61` | 2,111 | 57 | manual PWA cache/runtime strategy |
| `manifest.webmanifest` | `8e40ab750f6a21cd4e81fdac399bfde12679f40d` | 926 | 43 | installability metadata |

## 2. Build/deploy baseline

- Public build entrypoint: `scripts/build_control_center_render.sh`.
- Current build copies `control-center/.` into the Render public directory.
- Live component evidence and live Project Knowledge are materialized into the deploy workspace only.
- Production remains static and READ_ONLY.
- The modular app SHALL NOT replace this entrypoint before A7 Public Cutover Human Review.

## 3. Legacy PWA baseline

The manual service worker:

- precaches all five legacy HTML routes;
- precaches maturity/project-knowledge modules;
- uses network-first for navigations and governed data assets;
- falls back to `./index.html`;
- uses cache key `trama-control-center-v15`.

A1–A5 MUST NOT silently alter production PWA behavior.

A6 owns the Workbox/`injectManifest` replacement and parity proof.

## 4. CI coupling inventory

Current CI has implementation-coupled checks that MUST be migrated deliberately rather than deleted.

### `.github/workflows/control-center-pages.yml`

Contains string/markup assertions for:

- mobile width/spacing behavior;
- service worker registration;
- PWA manifest;
- cache version and route list;
- absence of direct GitHub API fetches in legacy HTML;
- contextual-help implementation details;
- existence of legacy specialist routes/modules.

### `.github/workflows/control-center-build.yml`

Contains artifact existence checks for:

- `maturity.html`;
- `evidence.html`;
- `operations.html`;
- ecosystem snapshot fields and reports.

### Runtime component evidence

Playwright is already used for isolated/runtime evidence of Control Center Context Help, but it is installed temporarily in CI. This is NOT yet the product frontend test supply chain.

A1 may introduce a local Playwright development/test dependency inside `apps/control-center/` only.

## 5. Parity obligations

Before any legacy route can be retired, the modular replacement must preserve or intentionally supersede:

- semantic question/task served by the route;
- governed data sources;
- READ_ONLY authority boundary;
- fresh/offline/stale state semantics;
- keyboard/focus behavior;
- mobile and LIM behavior;
- accessible equivalent for graph/table content;
- public Render deploy behavior;
- PWA install/offline behavior where applicable;
- existing evidence/provenance visibility.

Visual pixel parity is NOT required. Semantic and interaction parity is required.

## 6. Legacy freeze rule

During A0–A6, legacy files are production fallback.

Permitted legacy changes:

- correctness fixes;
- security fixes;
- accessibility regressions;
- migration parity fixes;
- required data-contract compatibility.

Not permitted:

- significant new product features;
- new architecture investment;
- new local interaction primitives when the modular target owns the replacement.

## 7. Retirement rule

A legacy surface may be retired only when:

1. its modular route has semantic parity evidence;
2. its replacement CI is semantic rather than string-coupled where feasible;
3. PWA/navigation links are updated;
4. rollback remains possible through the A7 stability window;
5. the retirement is recorded in the migration matrix.
