# TRAMA Audit v1.3 — Studio Atlas baseline design

**Date:** 2026-10-05  
**Baseline:** `main@36e7f105070ab69c09930ad27c64f05962ec170b`  
**Scope:** governance/status reconciliation only  
**Authority:** no runtime, publication, merge, production or autonomous authority is granted by this design

## 1. Purpose

TRAMA Audit v1.2 correctly records closure of P1, P2, P3 and P6 and keeps P4/P5 separate. It no longer fully represents the product architecture because Studio Atlas and the Visual Factory have become substantial, independently testable product capabilities after the v1.2 baseline.

Audit v1.3 must make that delta canonical without rewriting the historical A01–A41 findings and without promoting capabilities beyond the evidence actually available.

The resulting baseline must answer four questions unambiguously:

1. Which ecosystem domains are structurally established?
2. Which capabilities are implemented and automatically qualified but not yet product-complete?
3. Which human/product/runtime gates still prevent promotion?
4. What is the single next product path toward a learner-facing Atlas Percorso that is actually publishable?

## 2. Architectural decision

Studio Atlas becomes a first-level application domain in the ecosystem map.

Canonical topology:

`TRAMA governance`

- `Arena` — curriculum authority;
- `Docente OS` — teacher context, lesson/class state and professional decision;
- `Studio Atlas` — professional authoring and production of governed Atlas Percorsi;
- `Atlas` — learner/public navigation, preview/runtime surfaces and governed publication;
- shared evidence, knowledge, connector/runtime and assurance services remain subordinate capabilities, not new authorities.

Studio Atlas is not embedded domain ownership inside Docente OS. Docente OS remains the privileged professional entry path and must preserve lesson continuity through stable reusable Atlas references.

Studio Atlas does not own:

- Arena curriculum authority;
- Docente OS class, timetable, TeachingSession or lesson truth;
- Atlas public publication state;
- TRAMA governance authority;
- GPU/provider authority;
- student identity.

## 3. Audit model extension

The historical A01–A41 table remains unchanged except for explicit delta references where already supported by v1.2.

Audit v1.3 adds a new delta section and first-class rows for the Studio Atlas product line. The new rows must be additive and evidence-bound.

### A42 — Studio Atlas product boundary

Expected classification:

`IMPLEMENTED_CANDIDATE / PRODUCT_DOMAIN_ESTABLISHED / NOT_RUNTIME_AUTHORIZED`

Evidence must include the product foundation, standalone product boundary and current application surface under `products/studio-atlas/`.

### A43 — Studio Atlas authoring workflow

Expected classification:

`VERIFIED_BUILD / AUTHORING_SLICE_AVAILABLE / HUMAN_GATES_PRESERVED`

Required observed path:

`Idea → Storia → Human Story Review → Mondo → World Review → Esperienza → Scene → Storyboard → Produzione`

The audit must explicitly preserve the rule that automation cannot manufacture Story/World/Product Review PASS.

### A44 — Studio Atlas → Atlas learner preview

Expected classification:

`CROSS_PRODUCT_QUALIFIED / NON_PUBLIC / NOT_STUDENT_AUTHORIZED`

The evidence must distinguish technical preview qualification from public/runtime authorization.

Required invariants:

- immutable preview snapshot;
- exact-origin bridge;
- bounded nonce channel;
- no authoring content in URL;
- no Atlas persistence of the direct-preview snapshot;
- no learner identity;
- no telemetry;
- `runtimeAuthorized=false`;
- `studentAuthorized=false`;
- no public catalogue exposure.

### A45 — MUSEO ZERO product candidate

Expected classification:

`REMEDIATION_IMPLEMENTED / SECOND_HUMAN_PRODUCT_REVIEW_PENDING`

The frozen Human Product Review decision `REVISE` remains authoritative for its reviewed baseline. Later technical implementation must not retroactively convert that decision to PASS.

The next product review must evaluate the complete v0.2 experience against the already defined product criteria, including world presence, meaningful agency, representation manipulation, visible consequence, transfer legitimacy, rhythm and narrative closure.

### A46 — Visual Factory

Expected classification:

`IMPLEMENTATION_ADVANCED / AUTOMATED_QUALIFICATION_AVAILABLE / REAL_VISUAL_RUN_PENDING`

The audit must record the existence of:

- machine-readable Visual Bible;
- reference locking;
- Lia, Omar, Teo, Sala Zero and Cabina regia canon;
- shot plan F1–F6;
- deterministic generation-plan compilation;
- provider-neutral FREE_ONLY policy;
- same-origin server gateway;
- provenance receipts;
- Human Visual Review requirement.

Completion is not allowed until a real governed generation proves the sequence:

`canonical references → Human Visual Review/reference lock → F1–F6 generated scenes → continuity review → learner-experience integration`.

### A47 — VF-ORCH-01 zero-cost orchestration

Expected classification:

`CORE_IMPLEMENTED / PLAN_INCOMPLETE`

The audit must distinguish the implemented core modules from the still-missing plan outputs.

Observed implemented surface includes:

- pure provider orchestration policy;
- Hugging Face ZeroGPU adapter;
- Cloudflare Workers AI adapter;
- route configuration boundary;
- orchestration tests/evidence structures.

The plan is not complete until its explicit manual execution/qualification surface is present, including the dedicated orchestrator command/runner and governed manual workflow required by VF-ORCH-01.

### A48 — Studio Atlas product durability

Expected classification:

`DEVELOPMENT_PERSISTENCE_ONLY / PROFESSIONAL_RUNTIME_FOUNDATION_PENDING`

Local browser storage proves the authoring lifecycle only. It does not prove:

- professional authentication/SSO;
- remote durable draft storage;
- multi-device persistence;
- collaboration;
- production data durability.

These remain S6 readiness work and must not block MUSEO ZERO product validation unless required by the test itself.

### A49 — Studio Atlas ↔ Docente OS lesson continuity

Expected classification:

`CONTRACT_DIRECTION_ESTABLISHED / RUNTIME_BINDING_DEFERRED`

Invariant:

`Studio Atlas/Atlas reusable resource → stable reference → Docente OS lesson/material slot`

Docente OS decides whether and how the resource is used in a lesson. Studio Atlas must not acquire TeachingSession, class or timetable authority.

## 4. Existing state carried forward

Audit v1.3 must preserve the current v1.2 closure state unless fresh evidence contradicts it:

- P1 Orario/PWA application scope: closed; device-native installation residual remains non-blocking;
- P2 Arena→Atlas: VERIFIED / INTEGRATED;
- P3 evidence/distribution reconciliation: CLOSED / BASELINE_RECONCILED;
- P6 gh-aw T0: CLOSED / INTEGRATED;
- P4 Argo G5-C: real LibreOffice/didUP proof still pending;
- P5 QE-01: requalification is a separate controlled lane; no runtime execution is authorized by the audit;
- DOS-A1: `RUNTIME_DEFERRED`.

## 5. Completion model

No overall completion percentage is introduced.

For every capability, v1.3 continues to separate:

- declaration;
- implementation;
- automated verification;
- human/product verification;
- real-use proof;
- distribution;
- authority;
- evidence integration.

A capability may be complete inside a NO_RUNTIME perimeter while remaining intentionally unauthorized for live execution.

A green CI suite is never sufficient evidence for Human Product Review PASS, Human Visual Review PASS, learner/public authorization or production promotion.

## 6. Canonical operational sequence after v1.3

The audit must establish the following order without opening new technical fronts:

1. reconcile Studio Atlas/Visual Factory into the canonical audit and ecosystem map;
2. consolidate overlapping Studio Atlas/Visual Factory PRs into one current line and mark superseded intermediate surfaces explicitly;
3. close the bounded VF-ORCH-01 residual without expanding scope;
4. execute the first governed real visual production for Lia, Omar, Teo, Sala Zero and Cabina regia;
5. lock accepted references through Human Visual Review;
6. generate and review MUSEO ZERO F1–F6 scene assets;
7. assemble the complete MUSEO ZERO v0.2 learner experience;
8. perform one consolidated second Human Product Review with only `PASS`, `REWORK` or `REJECT` as product decisions;
9. only after PASS, complete Studio Atlas S5 publication-candidate/handoff work;
10. then complete S6 professional identity, durable draft storage and standalone deployment readiness;
11. P4/P5 real-environment work proceeds independently when the required local environment is available.

## 7. PR consolidation policy

Audit v1.3 must not merge product branches merely because they are mentioned by the audit.

It should classify current overlapping work as follows:

- Studio Atlas/Visual Factory branches containing intermediate generations must either become the selected current integration line or be marked `SUPERSEDED / DO NOT MERGE` after useful evidence is preserved;
- Atlas preview/product PRs remain separate from TRAMA governance until their own exact-head review is complete;
- no automatic merge;
- no product/runtime authorization is derived from documentation integration.

## 8. Canonical files to reconcile in the implementation plan

The later implementation plan may modify only the minimal governed set required to project the new baseline, expected to include:

- `docs/audits/TRAMA-AUDIT-2026-10-03.md` — append v1.3 delta; preserve historical findings;
- `STATUS.md` — add Studio Atlas as a first-level domain and update the operational reading;
- `status/project-knowledge-events.json` — add a current v1.3 baseline event without deleting historical events;
- `control-center/data/ecosystem-snapshot.json`;
- `control-center/data/project-context-snapshot.json`;
- `control-center/data/context-packs/project-knowledge.json`;
- focused regression tests required by existing snapshot/status alignment mechanisms.

No product implementation belongs in the audit reconciliation PR.

## 9. Acceptance criteria for Audit v1.3

The reconciliation is acceptable only if all of the following are true:

1. Studio Atlas appears as a first-level application domain in the current ecosystem representation.
2. Arena, Docente OS, Studio Atlas and Atlas responsibilities are mutually non-overlapping and authority-preserving.
3. A42–A49 are recorded as additive audit findings/delta, not as a rewrite of A01–A41.
4. MUSEO ZERO remains `SECOND_HUMAN_PRODUCT_REVIEW_PENDING`, not PASS.
5. Visual Factory remains incomplete until a real governed visual run and review are evidenced.
6. VF-ORCH-01 is explicitly marked incomplete until the remaining planned execution surface exists.
7. P1/P2/P3/P6 are not reopened without contradictory fresh evidence.
8. P4/P5 remain separate lanes.
9. `DOS-A1=RUNTIME_DEFERRED` remains invariant.
10. Control Center remains READ_ONLY.
11. No student identity, tracking or telemetry is introduced.
12. No merge, runtime authorization, public publication or Production promotion is implied by the audit.
13. Snapshot, Project Knowledge and STATUS projections agree semantically after reconciliation.
14. Existing governance/snapshot/Control Center checks remain green on the exact head before Human Review.

## 10. Non-goals

Audit v1.3 does not:

- implement missing VF-ORCH-01 tasks;
- generate visual assets;
- approve MUSEO ZERO;
- merge Studio Atlas or Atlas product PRs;
- create Studio Atlas authentication or remote storage;
- authorize student runtime;
- authorize QE-01 execution;
- perform Argo/didUP real-device qualification;
- activate DOS-A1;
- promote any product to Production.

## 11. Human review boundary

The audit reconciliation PR may become ready for Human Review after its governed projections and checks pass on one exact head.

Human Review of Audit v1.3 approves only the truthfulness and consistency of the ecosystem baseline. It does not approve the pending product/runtime decisions represented inside that baseline.
