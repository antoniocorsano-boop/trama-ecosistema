# Atlas Experience Engine v1 — Evidence Record

**Date:** 2026-10-03  
**State:** IMPLEMENTATION_QUALIFIED / NOT_RUNTIME_AUTHORIZED  
**Atlas repository:** `antoniocorsano-boop/Curriculum-Atlas`  
**Atlas PR:** #69 — Draft  
**Exact implementation head:** `5227c5200b46c91230e66f7fe3a917666c8c77fb`  
**TRAMA design/plan source:** PR #216 @ `aef2df1642f5b68728ae82ac63c002ca142b6f1a`  
**TRAMA second-pathway authority:** PR #217 @ `81534e352396ad858c7cf5ee00c7ec3b0756ae64`  
**Audit source:** PR #215 @ `0a215b2b536eb79fec338c8e64e1c7134f2d8f74`  
**Arena authority:** unchanged  
**DOS-A1:** RUNTIME_DEFERRED

## 1. What this evidence establishes

The Atlas Experience Engine v1 is implemented and qualified as an implementation candidate on the exact Atlas head above. The evidence demonstrates one shared engine/runtime contract across two Smart cases and two Percorsi cases, with deterministic factories, fail-closed authority boundaries, canonical publication receipt reconciliation, production build and browser conformance.

This record does **not** authorize merge, public student runtime for Percorsi, Smart→Percorsi automatic promotion, learner profiling, or any transfer of curriculum authority from Arena.

## 2. Four conformance cases

| Lane | Case | Role in proof | Evidence state |
|---|---|---|---|
| Smart | `sistema-tecnologico` (SP-01) | compatibility case | PASS in canonical Experience Engine lane and SMART-FLOW qualification |
| Smart | `fonte-digitale` — “Una fonte digitale è affidabile?” | materially unrelated Smart generality case | PASS through shared builder/runtime contracts |
| Percorso | `pw-missing-information-01` | compatibility case for the governed Percorsi foundation | PASS through shared ExperienceDefinition/runtime validation |
| Percorso | `pw-constraints-tradeoffs-01` — “Una soluzione, molti vincoli” | materially different Percorso generality case | PASS; exact-head authority-bound implementation candidate; NOT_RUNTIME_AUTHORIZED |

The second Percorso exercises the governed primitive sequence `EXPLORE → CONNECT → BUILD → REFRAME → TRANSFER` and is generated/validated through shared generic infrastructure rather than a pathway-specific engine.

## 3. Canonical CI evidence on exact Atlas head

Primary current-head canonical lane:

- **Experience Engine / push:** run **37144776481** — PASS on exact head `5227c5200b46c91230e66f7fe3a917666c8c77fb`.
- The previous pull-request qualification run **37144151493** and push run **37144148146** were PASS on immediate predecessor `bfa9746e81fb413133887742a4825eeba7fa90f9` before synchronizing one unrelated `main` commit.

The canonical lane executes and passed:

1. Experience contracts;
2. Experience grammar registry;
3. generic Experience factory;
4. Percorsi portfolio factory;
5. Smart material contracts;
6. both Smart conformance cases;
7. Percorsi G2 contracts;
8. explicit four-case generality proof;
9. Smart publication reconciliation;
10. TypeScript typecheck;
11. lint;
12. production build;
13. Chromium browser conformance.

Current exact-head run URL:
- https://github.com/antoniocorsano-boop/Curriculum-Atlas/actions/runs/37144776481

Pre-sync qualification run URLs:
- https://github.com/antoniocorsano-boop/Curriculum-Atlas/actions/runs/37144151493
- https://github.com/antoniocorsano-boop/Curriculum-Atlas/actions/runs/37144148146

## 4. Additional evidence from the immediate predecessor

The following workflows passed on `bfa9746e81fb413133887742a4825eeba7fa90f9`, the immediate predecessor of the current implementation head. The synchronization delta to `5227c5200b46c91230e66f7fe3a917666c8c77fb` contains only main commit `d3e8a8f7d07c6f90703a180614a170b2cd899aa6`, which changes `.github/workflows/arena-curriculum-sync.yml` by setting `package-manager-cache: false`; it does not modify Experience Engine, Percorsi, Smart, runtime, catalog, receipt, mobile/LIM or visual-evidence implementation files. These runs are therefore retained as supporting evidence, but are not mislabeled as current exact-head runs.

| Evidence | Run | Result |
|---|---:|---|
| Percorsi Portfolio Factory | 37144151492 | PASS |
| Percorsi G2 Validator | 37144151490 | PASS |
| Percorsi G2 UX Collaudo | 37144151545 | PASS |
| Mobile/LIM Evidence F4 | 37144151548 | PASS |
| Visual Evidence F1 | 37144151528 | PASS |
| Visual Evidence F2 | 37144151513 | PASS |
| Visual Evidence F3 | 37144151523 | PASS |
| F5 Exit | 37144151522 | PASS |
| TRAMA Perceptible Write | 37144151506 | PASS |
| TRAMA Atlas Component Isolation R1 | 37144151453 | PASS |
| SMART-FLOW SP-01 Qualification | 37144151608 | PASS |
| MAT-PUB-A Material Manifest | 37144151488 | PASS |
| MAT-PUB-B Image Normalization | 37144151479 | PASS |
| SMART Export Pre-Merge | 37144151549 | PASS |

`Percorsi G1 Collaudo` was skipped on this head because the qualified lane is G2/shared-engine based; no PASS is inferred from that skipped run.

## 5. Authority and runtime boundary

TRAMA PR #217 exact head `81534e352396ad858c7cf5ee00c7ec3b0756ae64` received Human Review PASS only for:

`GOVERNED_PATHWAY_TARGET_APPROVED_FOR_IMPLEMENTATION_CANDIDATE / NOT_RUNTIME_AUTHORIZED`.

Atlas binds `pw-constraints-tradeoffs-01` to that exact authority head. The authority guard is tested fail-closed by removing the governed registration in an isolated portfolio and requiring the factory to reject the candidate.

Neither known Percorso is promoted to public student runtime by this evidence. The public Percorsi catalog remains fail-closed unless a real entry carries explicit `RUNTIME_AUTHORIZED` state and valid public provenance/path information.

## 6. Smart publication receipt reconciliation

The current exact-head canonical Experience Engine lane (run `37144776481`) passed the receipt reconciliation regression suite. The tests demonstrate that:

- a matching receipt updates the canonical MaterialSet and persists canonical receipt proof beside it;
- the existing `humanDecisionRequired` flag remains true;
- a missing receipt leaves canonical state untouched;
- receipts for a different material set or version do not mutate the manifest;
- digest, audience, provenance or byte-size mismatch fails closed;
- an equivalent later receipt is idempotent and does not rewrite the first canonical proof;
- the post-deploy workflow may create a **draft PR** only when canonical files change;
- no `gh pr merge` or auto-merge path is admitted;
- receipt scratch data is not committed as a parallel evidence root.

This remains the existing MaterialSet readiness chain; no second readiness state has been introduced.

## 7. Privacy, safety and accessibility posture

Observed implementation constraints remain:

- no learner account required by ExperienceDefinition v1;
- no learner telemetry in the shared contract;
- Percorsi learner state uses volatile memory for the qualified candidates;
- no hidden learner scoring/profile is introduced by the engine;
- accessibility/browser evidence is part of the qualified lane and separate G2 UX/mobile/LIM evidence is PASS;
- no runtime promotion is inferred from accessibility or CI success.

## 8. Integration review and remaining gates

Joint exact-head review has completed with **PASS FOR HUMAN INTEGRATION DECISION** for Atlas PR #69 and this TRAMA evidence PR. The canonical decision records remain the PR review records; this does not alter runtime authority.

The following remain explicitly open:

1. Merge/integration decision for Atlas PR #69 and TRAMA evidence remains separate from the review.
2. Any public student runtime promotion for a Percorso requires a separate governed runtime decision.
3. Smart→Percorsi association remains separately governed; no automatic binding is active.
4. Arena curriculum authority remains unchanged.
5. `DOS-A1` remains `RUNTIME_DEFERRED`.
6. The broader audit item P7 requiring a genuinely **public authorized Percorso** is not closed by implementation qualification alone.

## 9. Reconciliation decision

The evidence supports moving Atlas A14/Percorsi from the earlier “partial infrastructure” description to:

`IMPLEMENTATION_QUALIFIED / NOT_RUNTIME_AUTHORIZED`.

It does not support `RUNTIME_AUTHORIZED`, “public Percorso complete”, or any stronger claim.

**Integration review:** PASS FOR HUMAN INTEGRATION DECISION. Integration itself remains a separate action.
