# TRAMA-ADR-018 — Human-readable system state and progressive technical disclosure

**Stato:** PROPOSED  
**Data:** 2026-09-29  
**Perimetro:** TRAMA Control Center · Project Knowledge v2 UI  
**Runtime:** NO NEW WRITE AUTHORITY / NO UI ACTIVATION

## Contesto

Project Knowledge v2 separates Governed Core, Live Observation Plane and Effective Context View.

Those distinctions are necessary internally but are not an acceptable default vocabulary for end users. TRAMA users may be teachers, school leaders, reviewers or other stakeholders without repository/DevOps expertise.

Directly exposing internal states such as semantic drift, repository head, overlay, SHA or promotionRequired would preserve technical correctness while degrading product comprehension.

Mature systems provide useful precedent:
- GitHub separates check status/conclusion from details;
- GitLab separates environment/deployment state, history and approval requirements;
- Backstage separates readable entity presentation from raw references and may preserve last valid entity data while reporting processing problems separately.

## Decision proposed

TRAMA SHALL maintain a strict separation between:

1. **internal state vocabulary**, used by contracts, logs and technical details;
2. **user-facing communication vocabulary**, used by primary UI.

The primary UI SHALL communicate:
- what information is verified;
- how recent the latest observation is;
- whether anything requires attention or action.

Technical identifiers SHALL use progressive disclosure.

## Human communication rules

1. Normal state SHOULD be visually quiet.
2. Uncertainty MUST NOT be presented as an error.
3. A recent operational change MUST NOT automatically appear as a problem.
4. A blocking condition MUST say what is blocked and what action is required.
5. Color MUST NOT be the sole carrier of meaning.
6. Valid governed information MUST remain visibly usable when live observation is partial or unavailable.
7. Technical details MUST remain accessible to expert users without being required for primary comprehension.
8. Internal enums MUST NOT be copied directly into user-facing labels without an explicit communication mapping.

## Required Stage E sequence

Stage E SHALL proceed as:

- E0 — Human Communication & Interaction Contract;
- E1 — Visual prototype;
- E2 — Implementation;
- E3 — Human-use validation.

Implementation SHALL NOT precede an E0 communication contract and E1 prototype review.

## Benchmark rule

Significant Stage E patterns SHALL be compared with mature products and documented before adoption.

Baseline references:
- GitHub Status Checks and Deployments;
- GitLab Environments, Deployments and Deployment Approvals;
- Backstage Well-known Statuses and Entity Presentation.

TRAMA adopts the information architecture patterns while translating them into a less technical language appropriate to its user population.

## Accessibility

User-facing state communication SHALL:
- preserve meaning without color;
- support keyboard/focus semantics;
- expose meaningful accessible labels;
- remain semantically equivalent on desktop/mobile;
- distinguish stale/cached data from newly verified data.

## Compatibility

- ADR-017 dual-speed architecture remains unchanged.
- Governed Core remains authoritative.
- Live Overlay remains non-authoritative.
- EffectiveProjectContext remains derived.
- Existing technical enums and schemas remain valid.
- No GitHub App is introduced.
- No automatic promotion/review/merge is introduced.
- DOS-A1 remains `RUNTIME_DEFERRED`.

## Non-goals

This ADR does not:
- authorize UI runtime activation;
- define final visual styling;
- select a component library;
- authorize live polling;
- modify promotion semantics;
- create new product authority.

## Qualification

Before E2 implementation:
1. E0 contract reviewed;
2. desktop/mobile E1 prototype reviewed;
3. normal/partial/review-required/blocked/offline states represented;
4. non-technical comprehension test criteria defined;
5. accessibility semantics defined;
6. technical-details disclosure defined;
7. independent review;
8. HUMAN EXACT-HEAD REVIEW — PASS.

## References

- `docs/architecture/trama-stage-e0-human-communication-ui-contract-v1.md`
- `docs/architecture/trama-project-knowledge-dual-speed-v2.md`
- `docs/decisions/trama-adr-017-project-knowledge-dual-speed.md`
- https://docs.github.com/en/pull-requests/reference/status-checks
- https://docs.github.com/en/rest/deployments/statuses
- https://docs.gitlab.com/ci/environments/
- https://docs.gitlab.com/ci/environments/deployments/
- https://docs.gitlab.com/ci/environments/deployment_approvals/
- https://backstage.io/docs/features/software-catalog/well-known-statuses/
- https://backstage.io/docs/features/software-catalog/entity-presentation/
