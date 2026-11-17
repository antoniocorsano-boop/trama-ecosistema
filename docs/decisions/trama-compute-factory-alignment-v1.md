# TRAMA — Compute Factory / CF-06B ALIGN

Date: 2026-11-17. Status: proposed for review; offline implementation slice. Runtime, cost and publication authority: NONE.

## Architectural decision
One production system, not three factories. This decision extends ADR-021 and does not supersede its FREE_ONLY gates or select a new provisioner. References: ADR-021; TRAMA-COMPUTE-POLICY-v0.1; VISUAL-PRODUCTION-CONTRACT-v0.1; TRAMA PR #338 (open at baseline); Atlas PR #105 (parallel work).

- Arena: authority over the curricolo; unchanged.
- Studio Atlas: educational intent, art direction, references, required quality and human acceptance.
- Atlas Smart Production: candidate lineage, dependency planning, cache/reuse and incremental production; its existing cache is the source of truth, not copied to Compute Factory.
- Visual Factory / Audio Factory and specialized engines: method, model, pipeline, quality requirements, licenses and engine qualification. The existing VF-3D registry and compiler retain selection authority. No silent substitution of model or quality.
- Compute Factory: shared capability for resource policy, bounded execution, admission, quota accounting, recovery and evidence. Extend the existing compiler and entitlement contract, do not introduce a competing registry or provider router.
- SkyPilot: existing selected provisioner for compatible, admitted infrastructure only; no automatic provisioning. Other execution adapters remain separate. Prefect is an unqualified optional workflow engine, not a second authority.
- Control Center: observe and review evidence; no implicit permission to execute.
- Atlas: consumes separately approved assets; no production receipt grants publication.

## Interface
Existing VisualProductionRequest / 3D child request -> existing specialized plan -> existing compute policy -> bounded execution (future, separately authorized) -> existing receipt -> quality review -> candidate -> separate publication gate.

Smart Production can first resolve a verified reusable candidate, otherwise request only the missing work. Its cache and quality decisions remain authoritative. Compute Factory does not assign artistic merit. CPU procedural production is a method option owned by the specialist; the compute layer cannot trade away quality to save GPU. Reuse requires exact lineage, rights and validation, not simply a matching name.

CF-06B.1 adds a pure offline handoff envelope over existing plan outputs. A 3D plan must bind its own digest, request digest, request ID and quality to the exact supplied request. A v0.1 compute plan does not contain a request digest: its association is explicitly POLICY_ONLY_UNBOUND; it can never be presented as a request-bound receipt. Both are review references only, not evidence of trusted origin, fresh entitlement, license or execution. No network, subprocess, provisioning or publishing. No changes to PR #338 or Atlas.

## Invariants
FREE_ONLY; paid fallback forbidden; unknown eligibility fails closed; no quality downgrade; no student personal data; no implicit account or service activation; bounded attempts; atomic reservations before any future execution; unknown outcome retains reservation and blocks retry until reconciliation; review separate from production; no publication authority; hashes identify bytes/objects but do not authenticate origin.

## Sequence
1. CF-06B.1: this decision, offline handoff and tests.
2. CF-06B.2: after #338 and Atlas candidate interfaces stabilize, bind real fixture outputs from both branches, reuse exact Smart Production cache metadata (no duplicate cache); reconcile compute entitlement units and atomic accounting; independent review.
3. CF-06B.3: connect one local procedural motor via the existing specialized registry, with isolated synthetic inputs; preserve CF-06A as lab evidence, not a second production core. First common pilot: Storie / Il libro vivente, respecting reference lock.
4. CF-07: independent qualification of security, authentication, provenance, concurrency, isolation and recovery. CF-05B remains blocked; no external execution.
5. CF-08: integration after explicit review; no automatic publication.

The CF-02–06A laboratory reports local tests only; those counts do not establish repository integration. No claim of external GPU capacity, actual admission or zero cost entitlement is made by this change.


## CF-06B.2a — pinned convergence, 2026-11-17

- VF-3D source: TRAMA PR #338 head `05935f5ef73b532e0b3dd2aaa83ca82e21381d84`; successful run 44117809444, artifact 14343342807. CI checks out this exact revision separately and runs its actual pure planner with its synthetic Storie bundle, registry and recipe catalog. Expected WAITING_FOR_REFERENCE, zero planned jobs. No model download or inference. The SHA is pinned; future upstream changes require a new review.
- Atlas PR #105 head `be1b70b46a768c772bf6db58a9548b55d1ec9e17`, run 44103958943, job 134111802184: actual logged SP-02 restore receipt, dependency key `007ea6703701dd30187fe538a733fd26ab58d0d43ac00769c2539b6ca4aec231`, ten verified dependency files, candidateReused false. The observed receipt is copied as a small review fixture, not the cached assets. Atlas remains the cache authority. The adapter checks receipt shape and exact key; it does not independently verify the artifact bytes or trusted origin, grant reuse, or qualify a candidate.
- The same Atlas run has a deliberate failure in job 134116899314: SP-05 preview only, visual acceptance pending. It is not a failed cache restore. No candidate approval is inferred from the successful preview or cache.
- New tests cover actual planner output, deterministic replay, request and plan tampering, and cache receipt boundaries. The existing compute CI performs the checks; no separate orchestration service.
- This is an offline convergence slice, not live execution or final CF-06B.2 qualification. Remaining: candidate-bound acceptance, actual cache handoff with authenticated source/byte evidence, unified resource quota accounting, concurrency and independent review. No modification to parallel branches.


## CF-06B.2b — synthetic quota ledger

Port the local CF-03 transaction and lease principles and CF-05 explicit unit boundary into the existing compute capability. The new ledger is an offline SQLite reference implementation, not a new scheduler, provider registry or executor. It accepts review-only handoffs with ready source decisions, but the plan is NOT evidence of entitlement. All buckets must use synthetic identifiers and typed simulated units; the fixed capacity and expiry cannot be changed by reseeding. No conversion between neurons, weighted GPU seconds and CPU seconds is assumed. All amounts are explicitly synthetic.

Reserve atomically in one database transaction (BEGIN IMMEDIATE); one reservation per request digest. Repeated identical reservation returns the existing state; changed parameters or reference fail. A reserved job expiring before simulated start releases its reservation; a simulated running job expiring becomes UNCERTAIN and retains the whole reservation. A completed simulation retains the reservation. No automatic retry or reset, no real resource activation. Time is caller-supplied for deterministic tests. The identity is not authentication.

The existing CI adds 16 tests for quota bounds, concurrent distinct and duplicate requests, unit mismatch, rollback, restart persistence, blocked/tampered plans and recovery. The earlier convergence tests remain in place.

Open gates: actual provider entitlement authentication and hard cost caps, accounting windows and units verified per service, stable cross-plan identity and reconciliation authorization, trusted clock, audit receipts and independent review. The synthetic ledger has no remote interface, no process execution, no credentials and no authority to publish. Do not attach it to external execution. Future multi-host accounting requires separately qualified transactional storage. No claim of production readiness.


## CF-06B.3a — procedural evidence, not engine admission

CF-06A generated original armillary GLBs with Python/Trimesh, not Blender. The pinned VF-3D registry has blender-procedural with EXISTING_ATLAS_PIPELINE_REFERENCE_ONLY and a pending toolchain/license gate; do not relabel Trimesh results as Blender qualification or create a second registry. The new read-only adapter checks GLB header, chunk framing, JSON identity, no external buffer/image URI, exact reported byte length, SHA-256 and mesh count. It records reported triangles/GPU time separately; neither is independently measured by the adapter. Source hash identifies supplied bytes, not authorship or trusted provenance. No geometry, artistic, license or runtime admission is granted. The two original GLBs were inspected locally; their observed hashes and sizes are preserved as a small fixture, not a copy of their binary assets. CI adds nine synthetic boundary tests.

Next: coordinate exact procedural engine profile with VF-3D owner after #338 stabilizes, audit dependencies and rights, provide pinned toolchain and reference lock; run an isolated candidate for Storie only after this gate. Existing Atlas Smart Production remains responsible for cache and candidate review. No external execution, no publication, no new account or resource.


## CF-06B.3b — procedural profile review, Storie

Atlas already owns the procedural Storie sculpture in star_sculpture.py, with adaptive_identity.py and knowledge_composition.py. Do not introduce a duplicate book generator, a second cache, or an independent artistic direction. The CF-06A armillary is separate lab evidence and is not a Blender qualification.

Pin Atlas PR #105 at be1b70b46a768c772bf6db58a9548b55d1ec9e17 and VF-3D PR #338 at 05935f5ef73b532e0b3dd2aaa83ca82e21381d84. The observed Atlas run 44103958943, plan job 134111159477, reports a bounded four-attempt adaptation; Storie scale .94, 165 vertices, 310 triangles, five closed oriented components, depth .430205 m, radius .620902 m and mesh SHA-256 7617e41bafc305afc9c841d057c7972af178be2bce0d03386916688b6e36532d. This is a procedural geometry evidence record, not an accepted candidate. The actual run retained a visual acceptance hold.

The existing Compute Policy CI resolves the Atlas repository from the existing enrollment registry, checks out the two pinned sources without persisting upstream credentials, verifies exact source revisions and three geometry-source Git blobs, and replays the Atlas-owned deterministic CPU geometry and the VF-3D catalog checks. Eight new tests cover exact observed geometry, original generator replay, broken geometry, bounded determinism, registry and missing reference-lock gates, and zero authority escalation. No Blender invocation, rendering, generation model installation, provider API or provisioning. No modification to either parallel branch.

The historical Atlas Blender profile (4.2.23, archive SHA-256 bea0eb3146be13eae6225409a117b215184f41b7f79e799f97cb3abb8f6dc404) is a candidate toolchain reference only. VF-3D still marks blender-procedural EXISTING_ATLAS_PIPELINE_REFERENCE_ONLY and PENDING_EXACT_TOOLCHAIN_AND_INPUT_REVIEW. The synthetic VF-3D Storie fixture has no actual reference lock, admissions or pools. Do not claim engine admission or reference-lock approval. A candidate profile must be approved in the existing registry, including exact toolchain, rights, environment, input/output and evidence binding, before a new bounded production run. Preserve Atlas artistic hold; continue toward shared review and qualification rather than another independent engine.


## CF-07a — assurance review and qualification hardening

Reviewed baseline 3fd8eb075abeeef42f38480cde253553645f0fa6: four jobs PASS, compute workflow 44126271266 reports 65/65 specific tests including eight exact Storie geometry tests. ECC security evidence, changed configuration and harness comments report success for that revision; ECC cannot publish checks with its current permissions. These are automated external checks, not an independent human approval. PR reviews list empty at review time.

Findings:
- CF-R01: mandatory cross-source suites used unittest skipUnless; a missing prerequisite could return success with skipped tests. Current baseline did execute all tests, but future false-green risk is real. Fix: require exact expected test counts, no skips, no failures or expected failures, and no unexpected successes; use a dedicated test gate with six adversarial tests.
- CF-R02: main checkout retained default credentials while importing pinned upstream code. Fix: persist-credentials false on main checkout as already set on upstream checkouts; read-only permissions unchanged.
- CF-R03: synthetic SQLite accounting has no trusted clock, authenticated entitlement or multi-host authority. Intentional limitation, production remains blocked.
- CF-R04: GLB reference only checks framing and reported metadata; it is not full geometry validation or authenticated provenance. No admission implied.
- CF-R05: exact source replays use immutable revisions and observed receipt claims; no full candidate byte validation, reference-lock approval, artistic acceptance or Blender runtime qualification. Keep the visual hold. Before integration, reviewers must confirm durable availability of pinned upstream commits, or update pins with an exact evidence replay. Do not weaken the pins or request broader credentials to fix access.
- CF-R06: no independent reviewer approval recorded. Require a review of the final exact head, distinct from author-side checks, before integration. No automatic merge.

This increment is a hardening slice, not final CF-07 approval. Re-run all controls on the new head; six new tests expected (71 total if all prior tests execute). No live execution, account activation, publication, provider authorization or changes to parallel branches.
