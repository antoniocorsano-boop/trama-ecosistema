# TRAMA Ecosystem State Assessment v0.2

**Date:** 2026-10-10  
**Scope:** AS-IS ecosystem reality versus ACCESS-01 target architecture  
**Authority:** analytical evidence supporting `TRAMA ACCESS-01`  
**Machine-readable source:** `governance/access/trama-ecosystem-state-v0.2.json`

## Executive conclusion

The ecosystem already contains several real and mature nodes, but the connective tissue between them is not yet uniformly real.

The central finding is therefore:

> **A real node does not imply a real integration.**

TRAMA today is best described as an ecosystem with substantial real products/capabilities and some real canonical chains, while several cross-product user flows remain partial or designed. ACCESS-01 is the architecture for turning those existing systems into a coherent user experience without collapsing their independent authorities.

## What is already real

- **Docente OS** exists as the teacher-first operating environment with its own real identity/workspace authorization model.
- **Arena** is the authority for the curricolo di istituto.
- **Curricolo Atlas** is a real public navigation/consultation surface for curricolo, materials and resources.
- **Arena → Curricolo Atlas** is a real governed chain; Curricolo Atlas does not become curricular authority.
- **Studio Atlas** has real standalone authoring capability, although important professional-runtime capabilities remain incomplete.
- **Atlas learner** supports bounded learner/preview experiences and preserves the no-personal-account default.
- **Materials** already exist in real product surfaces.
- **Control Center pubblico** is a real public status/evidence/transparency surface.
- **TRAMA governance** is a real authority layer for contracts, boundaries, lifecycle and evidence.

## What is partial

- **TRAMA Gateway** is real as a public UI/soglia, but its professional entry flow is not yet available; production behavior must be made safe so an absent Access destination cannot blank the public surface.
- **Studio Atlas** remains partial as an ecosystem product because canonical professional federation, remote persistence/publication boundaries and other capabilities are not all complete.
- **Studio Atlas → Atlas learner** is directionally and partially real through governed preview/experience paths, but should not be represented as a universally complete publication chain.
- **Docente OS → Curricolo Atlas/Arena** orchestration is not yet uniformly certified as a cross-product runtime flow.
- **Material Contract ecosistemico** is incomplete: materials exist, but shared identity/ownership/provenance/reference semantics are not yet fully qualified across products.
- **Classi/Gruppi → Atlas learner** needs a complete privacy-first bounded assignment contract.

## What is designed, not yet runtime reality

- **TRAMA Access** as the canonical professional login/launcher.
- **One professional TRAMA identity / SSO** across products.
- **TRAMA Access → Docente OS / Studio Atlas / Arena / Curricolo Atlas professional** federation paths.
- **Control Center privilegiato** with dedicated governance entitlement and step-up/MFA.
- **Gateway → TRAMA Access** as the canonical professional entry path.

## Canonical chains

### Curricular chain

`Arena → Curricolo Atlas`

- Arena = authority for the curricolo di istituto.
- Curricolo Atlas = consultation/navigation/intelligibility.
- Product existence and access do not grant curricular mutation authority outside Arena-governed paths.

### Experience chain

`Studio Atlas → Atlas learner`

- Studio Atlas = professional authoring.
- Atlas learner = learner experience/fruizione.
- The learner plane remains accountless by default and does not receive the professional session.

## Critical interpretation rule

The state map distinguishes:

1. **node state** — whether an application/service/capability exists within its stated boundary;
2. **flow state** — whether the integration/user journey between nodes has been demonstrated end-to-end.

Examples:

- Docente OS can be `REAL` while `Docente OS → Studio Atlas` remains `DESIGNED`.
- Curricolo Atlas can be `REAL` while `TRAMA Access → Curricolo Atlas professional` remains `DESIGNED`.
- Control Center pubblico can be `REAL` while Control Center privilegiato remains `DESIGNED`.

This distinction is mandatory in future progress reporting.

## Gateway-specific note

The public Gateway must not be treated as unfinished merely because the professional Access destination does not exist yet.

The correct boundary is:

- public threshold/UI: real;
- professional entry destination: not yet real;
- behavior with missing destination: must fail closed **without destroying the public experience**.

A blank public screen is not an acceptable interpretation of fail-closed.

## Materials-specific note

`Materiali` must not be represented as a single binary node.

The accurate model is:

- materials/resources in real products: `REAL`;
- shared ecosystem material contract with stable identity, ownership, provenance and references: `PARTIAL` until qualified.

## Student/class/group-specific note

Teacher-side class/group organization is not the same as learner identity.

The target boundary is:

`teacher class/group → bounded assignment reference/ticket/code → Atlas learner`

without exporting a nominal class register or requiring a personal learner account by default.

## Control Center-specific note

The public and privileged Control Center surfaces must remain logically distinct.

- Public Control Center: status/evidence/transparency, potentially unauthenticated.
- Privileged Control Center: only real when there are explicit protected governance operations, a dedicated entitlement, and appropriate step-up/MFA/audit controls.

## Visual evidence rule

The AS-IS/TARGET infographic is a **derived view** of this assessment and the machine-readable state file.

It is not the authority by itself.

A future infographic update must follow a state/evidence update, not precede it. In particular, a green `REAL` arrow must have a retrievable evidence reference for the exact boundary it claims.

## Operational consequence

The next work should not be a broad multi-app implementation sprint.

The canonical roadmap is:

`Baseline/Gateway safety → Identity contract → TRAMA Access → Docente OS pilot → Studio Atlas → Curricolo Atlas → Arena → Assignment/Learner → Materials → Privileged Control Center → Cross-app hardening → Gateway cutover → Ecosystem qualification`

Only one implementation phase is active at a time. Every phase closes with implementation, tests, evidence, human review where appropriate, and a state-map delta.
