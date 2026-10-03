# Atlas Percorsi — Runtime Readiness Review — 2026-10-03

**Review ID:** RRT-01  
**Atlas runtime baseline:** `antoniocorsano-boop/Curriculum-Atlas@d51da8bc6a71ee43a8d5f2cd71c51151fa591196`  
**TRAMA baseline:** `antoniocorsano-boop/trama-ecosistema@f1b2ef316c6b95d0c7133117747b6ead8ab3d6e3`  
**Contract:** Atlas `docs/PERCORSI-G2-RUNTIME-QUALIFICATION.md` (Q1–Q9)  
**State:** `RUNTIME_READINESS_REVIEW_COMPLETE / REMEDIATION_REQUIRED / NOT_RUNTIME_AUTHORIZED`  
**Authority:** review/evidence only; no Q9 decision is made here  
**DOS-A1:** `RUNTIME_DEFERRED`

## 1. Decision

Neither governed pathway is currently eligible to be submitted to Q9.

- `PW-MISSING-INFORMATION-01`: `NOT_READY_FOR_Q9 / REMEDIATION_REQUIRED`.
- `PW-CONSTRAINTS-TRADEOFFS-01`: `NOT_READY_FOR_Q9 / REMEDIATION_REQUIRED`.

This result does not reverse `IMPLEMENTATION_QUALIFIED` for Experience Engine v1. It distinguishes implementation qualification from the stricter exact-identity runtime qualification contract.

## 2. Governing rule

Q9 may be presented to the final human publication authority only when Q1–Q8 are all PASS on one immutable `RuntimeCandidateIdentity` containing at least:

- `runtimeExactHead`;
- `pathwayId`;
- immutable `contentVersion`;
- `publicationId`;
- `publicationState=QUALIFIED`;
- `authorityRef`;
- qualification contract version.

Historical evidence may support a new run, but it is not automatically consumable as a Qn PASS after a runtime/content/route identity change.

## 3. PW-MISSING-INFORMATION-01

### Supporting evidence already present

- shared Experience Engine definition is on Atlas `main`;
- runtime state is `VOLATILE_MEMORY`;
- learner identity is not required;
- learner telemetry is disabled;
- browser conformance exercises branching, revision, transfer and completion;
- browser test observes zero POST/PUT/PATCH/DELETE learner network writes on the lab candidate;
- L/N presentation support is exercised;
- historical H1 pedagogical/editorial L/N review is PASS;
- public Percorsi catalog remains fail-closed and does not leak lab routes.

These are valuable supporting proofs but do not form a current Q1–Q8 QualificationReceipt.

### Runtime gate assessment

| Gate | Current assessment | Reason |
|---|---|---|
| Q1 public surface / entry | **BLOCKED** | Only the lab route is materialized for this candidate. The Q1 contract explicitly requires a real `SEALED_PREAUTH` adapter/runner bound to the actual candidate and intended public route; the repository contract states that a production candidate adapter was not yet installed. |
| Q2 anonymous/local/network | **PARTIAL_SUPPORT_ONLY** | Experience runtime and browser evidence show volatile state and zero learner writes, but no current exact-identity Q2 producer receipt exists. |
| Q3 offline/persistence/reset | **NOT_RUN_CURRENT_IDENTITY** | Volatile state reduces storage risk, but the required online/offline/update/withdrawal matrix and fail-closed offline authorization behavior are not recorded for a current publication identity. |
| Q4 compatibility/accessibility | **BLOCKED** | Automated/browser evidence exists, and historical H1 is PASS, but H2 human assistive-technology validation remains explicitly pending. The constitutional review also carries human developmental/accessibility implementation validation forward. |
| Q5 provenance/state/withdrawal | **BLOCKED** | Current portfolio entry does not yet define a complete runtime publication identity/state chain for this candidate; no candidate-bound transition receipt is present. |
| Q6 editorial admission | **BLOCKED** | No current exact-identity `QUALIFIED` admission receipt exists that can be consumed by Q1/Q9. |
| Q7 privacy/security | **PARTIAL_SUPPORT_ONLY** | Privacy invariants and no-write browser evidence are strong, but no current candidate-bound Q7 receipt/security capture is present. |
| Q8 rollback/kill-switch | **NOT_RUN_CURRENT_IDENTITY** | Generic catalog fixtures prove fail-closed withdrawn rendering, but there is no governed real-candidate withdrawal action plus propagation receipt/time observation. |

### PW-MISSING decision

`NOT_READY_FOR_Q9`.

The shortest path is not to redo the pedagogical design. It is to materialize a frozen runtime candidate identity and execute the runtime-specific Q1–Q8 chain on that identity, including H2.

## 4. PW-CONSTRAINTS-TRADEOFFS-01

### Supporting evidence already present

- exact TRAMA authority for implementation-candidate registration exists;
- generic Experience Engine factory and contracts reproduce/validate the candidate;
- materially different `EXPLORE → CONNECT → BUILD → REFRAME → TRANSFER` structure is demonstrated;
- runtime contract declares volatile memory, no learner identity and no telemetry;
- portfolio registration fails closed when governed authority is removed.

### Additional deficits

Unlike PW-MISSING, this candidate currently has no dedicated learner route or pathway-specific browser journey in the qualified implementation. Its TRAMA dossier also states:

- developmental band remains `HUMAN_VALIDATION_REQUIRED`;
- final contexts/wording require pedagogical/developmental human review;
- accessibility requirements are design requirements, not a conformance claim.

### Runtime gate assessment

| Gate | Current assessment | Reason |
|---|---|---|
| Q1 | **BLOCKED** | No candidate route/public entry surface and no real `SEALED_PREAUTH` run. |
| Q2 | **NOT_RUN_CURRENT_IDENTITY** | Contract declares the intended privacy posture, but there is no candidate-specific browser/network receipt. |
| Q3 | **NOT_RUN_CURRENT_IDENTITY** | No candidate-specific offline/reset/update/withdrawal matrix. |
| Q4 | **BLOCKED** | No pathway-specific browser matrix, no final developmental/pedagogical human validation, and no human assistive-technology validation. |
| Q5 | **BLOCKED** | Portfolio has version/authority/runtime boundary metadata but not a complete candidate publication identity and transition receipt chain. |
| Q6 | **BLOCKED** | No current exact-identity `QUALIFIED` admission receipt. |
| Q7 | **NOT_RUN_CURRENT_IDENTITY** | Privacy constraints are declared but not verified through candidate-specific runtime/security evidence. |
| Q8 | **NOT_RUN_CURRENT_IDENTITY** | No real-candidate withdrawal/kill-switch propagation proof. |

### PW-CONSTRAINTS decision

`NOT_READY_FOR_Q9`.

This candidate must first reach the same controlled implementation-validation maturity already achieved by PW-MISSING before the runtime-specific qualification chain can be completed.

## 5. Cross-cutting finding

The Experience Engine v1 work correctly solved reuse, generality, fail-closed catalog behavior and privacy-by-contract. It did **not** and should not have silently satisfied Q1–Q9.

The main reusable runtime-qualification infrastructure exists for Q5/Q6/Q1 logic, negative tests and invalidation rules, but the governing Q1 specification explicitly distinguishes synthetic adapters/tests from a real candidate `SEALED_PREAUTH` execution.

Therefore no status-only promotion is permitted.

## 6. Canonical remediation sequence

### RRT-02 — Freeze candidate identities and publication metadata

For each pathway, define a complete candidate binding without public exposure:

- exact Atlas runtime head;
- immutable content version;
- publication ID;
- `publicationState=QUALIFIED` only after governed admission;
- authority reference;
- intended non-lab public route;
- surface artifact digest.

No `RUNTIME_AUTHORIZED` field may be introduced.

### RRT-03 — Materialize the sealed preauthorization surface

Implement the real `SEALED_PREAUTH` adapter/runner and candidate route boundary so Q1 can exercise the exact artifact intended for activation while `publicExposure=false`.

Activation after a future Q9 must be activation-only; rebuild/content/route changes invalidate Q1.

### RRT-04 — Produce exact-identity automated receipts

Execute candidate-bound Q2, Q3, Q5, Q6 and Q7 evidence, including:

- network capture;
- storage/reset/offline matrix;
- provenance/state transition validation;
- editorial admission;
- privacy/security checks.

### RRT-05 — Human validation

For PW-MISSING:
- complete H2 with real assistive technology on the frozen candidate;
- close remaining constitutional developmental/privacy implementation checks on final learner-facing wording/interface.

For PW-CONSTRAINTS:
- first complete final pedagogical/developmental review;
- then execute browser/accessibility matrix and H2 on its implemented route.

Any resulting implementation change invalidates affected exact-head evidence and requires rerun.

### RRT-06 — Withdrawal / kill-switch proof

On each exact candidate, demonstrate governed `PUBLISHED → WITHDRAWN` behavior in a non-student qualification environment:

- disable new launches;
- no lab fallback;
- index/manifest/public surface propagation;
- measured propagation time;
- stale/offline behavior fails closed.

This is evidence only and must not publish the candidate.

### RRT-07 — Aggregate and independently review

Build the machine-readable `QualificationReceipt` only when Q1–Q8 all PASS on the same immutable candidate identity. Perform independent exact-head review.

Only then may the package be submitted to the separate Q9 Human Review.

## 7. Explicit exclusions

This review does not:

- set `RUNTIME_AUTHORIZED`;
- create public student links;
- move a candidate to `PUBLISHED`;
- create Smart→Percorsi bindings;
- change Arena authority;
- activate DOS-A1;
- treat merge, deployment or CI success as runtime authority.

## 8. Next canonical tranche

Proceed with **RRT-02** first, for both candidates, because every later Q gate depends on stable identity/publication metadata. RRT-02 is preparatory and reversible and must end at `QUALIFIED / NOT_RUNTIME_AUTHORIZED` at most.
