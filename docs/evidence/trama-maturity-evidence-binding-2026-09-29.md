# TRAMA-MATURITY-EVIDENCE-BINDING-01 — External evidence verification receipt

**Date:** 2026-09-29  
**Status:** VERIFIED INPUT / READ_ONLY OBSERVATION / HUMAN REVIEW REQUIRED FOR INTEGRATION  
**Purpose:** durable source record for product-area maturity evidence binding  
**Authority effect:** NONE

## 1. Verification rule

This receipt records only evidence that was directly verified against repository state, governed TRAMA receipts, or exact GitHub workflow results.

It does not create maturity by declaration. The maturity engine remains deterministic and cumulative.

## 2. Governance

### CC3-F1

Governed human-review receipt:

`docs/reviews/CC3-F1-HUMAN-REVIEW-2026-09-26.md`

Verified:
- capability: `CC3-F1`;
- decision: HUMAN REVIEW PASS;
- reviewed exact head: `686fe01b91b5e5b38a9956198e79c5ff713b0b8f`;
- deterministic/read-only semantics preserved.

This exact head is eligible to support:
- `PR_EXACT_HEAD`;
- `HUMAN_REVIEW`.

The approved governance contract evidence is supplied separately by `TRAMA-ADR-001`.

## 3. Arena

Repository:

`antoniocorsano-boop/CurManLight_arena`

Verified PR:

`#312 — ECO-01/S3 — validate Technology I/II/III curriculum-source profile`

Exact head:

`65a7f5b820b344ec61f8e09d7559012aae521bbc`

Merge commit:

`0d931c2c20a2c47c7a72c077faacf499feda6908`

Exact-head workflow evidence:
- CurManLight Product CI — run `35512448131` — PASS;
- Beta Release Contract — run `35512448242` — PASS.

Explicit human cross-review:
- GitHub issue comment `5750603947`;
- author: `antoniocorsano-boop`;
- text records `HUMAN CROSS-REVIEW PASS`;
- review is explicitly rebound to Arena exact head `65a7f5b820b344ec61f8e09d7559012aae521bbc`;
- the reviewed scope confirms Arena curriculum authority and the Technology I/II/III source profile while keeping DOS-A1 deferred.

This set is eligible to support:
- `PR_EXACT_HEAD`;
- `AUTOMATED_TEST`;
- `HUMAN_REVIEW`.

Arena PR #341 remains valuable component-level evidence for Dialog/Tabs but is intentionally **not** used as the product-area Human Review in this registry.

The canonical product authority and approved contract evidence are supplied by:
- `docs/knowledge/source-registry.json#curriculum`;
- `TRAMA-ADR-002`.

## 4. Atlas

Repository:

`antoniocorsano-boop/Curriculum-Atlas`

Verified PR:

`#32 — S3-V2/F5 — Exit refresh sulla main corrente`

Exact head:

`bc11577eeeeeed9c43ad62ac43fb7561e1197246`

Merge commit:

`423444be9dd883f4c35c6c1c89e94f6b0e5405fa`

Exact-head workflow evidence:
- TRAMA Perceptible Write — run `36093494263` — PASS;
- R3-F0 S3-V2 F4 Mobile LIM Evidence — run `36093494414` — PASS;
- R3-F0 S3-V2 F5 Exit — run `36093494130` — PASS.

The governed event `EVT-R3-F0-S3V2-MERGE-32` records:
- Atlas merge + HUMAN exact-head review;
- F4 Mobile/LIM PASS;
- F5 Exit PASS;
- R3-F0 exit satisfied.

This set is eligible to support:
- `PR_EXACT_HEAD`;
- `AUTOMATED_TEST`.

The existing snapshot projector already derives version-bound:
- `ACCESSIBILITY_GATE`;
- `HUMAN_REVIEW`;

from the same governed R3-F0 closeout event.

Canonical and approved contract evidence are supplied by:
- `docs/knowledge/source-registry.json#learning-resources`;
- `docs/knowledge/source-registry.json#atlas-publication`;
- `TRAMA-ADR-007`.

## 5. Docente OS

Repository:

`antoniocorsano-boop/docente-os-2026-27`

Repository topology verified on 2026-09-29:
- GitHub/default branch: `main`;
- active development branch used by current product work: `develop`.

Observed current heads at verification time:
- `main`: `f0b7e5c01620d4cc87587081859cbf270cc1d033`;
- `develop`: `1f551431af20bbf5ff99f479c4659d72af61cc8e`.

The default branch remains `main`. The active development branch must be represented separately and must not replace the repository default identity.

### Runtime Release Contract evidence

Verified PR:

`#579 — Runtime Release — detect missing migration lineage before Beta startup`

Exact head:

`06410a7360ccd7eb55e049154c0c3657e6a24714`

Merge commit:

`0e0916445bf5eb729aab883275d62e5968ad7601`

Exact-head workflow evidence includes:
- Product CI — run `35760485652` — PASS;
- Production Readiness Review — PASS;
- Release Engineering Policy — PASS;
- Operational Security Gate — PASS;
- Browser Certification Orchestrator — PASS.

This set is eligible to support:
- `PR_EXACT_HEAD`;
- `AUTOMATED_TEST`.

### Final real-case/human evidence

Verified PR:

`#600 — ECO-02/P1 — make attached materials usable in lesson mode`

Exact head:

`91bba74acc45f2958fa856f3e8ae4f0b526a2edf`

Merge commit:

`02cfe7accee9abe63dc7c7d936ce1f3e0b7b8d7d`

Exact-head Product CI run:
- `36098516116` — PASS.

The governed receipt:

`docs/pilots/ECO-02-P1-FINAL-HUMAN-ACCEPTANCE-2026-09-25.md`

states that PR #600 closed the observed blocker and that the final human retest confirmed material opening, internal consultation and contextual return. The final decision is `CLOSED_VERIFIED / HUMAN REVIEW PASS`.

This is eligible to support `HUMAN_REVIEW`.

### Runtime canary limitation

Historical TRAMA documentation says that Runtime Health Beta, P6 Performance Runtime and HVA Runtime were PASS. During this evidence-binding pass, those signals could not be reconstructed with a sufficiently certain exact-head binding through the available repository evidence.

Therefore:

**no `RUNTIME_CANARY` evidence is promoted by this slice.**

Docente OS must remain below L4 until a version-bound runtime canary is produced or recovered.

Canonical and implemented-contract evidence are supplied by:
- `docs/knowledge/source-registry.json#teacher-context`;
- `TRAMA-ADR-006` — status `IMPLEMENTED`.

## 6. Current branch observations are not historical maturity evidence

Current product heads are useful for live development context but do not supersede the exact historical heads above.

At verification time:
- Arena `main`: `acf781af64cb097fcf80c3bce9fdf56274f9bbde`;
- Atlas `main`: `1295f2817b640f3bcb9c5da9053a4f85b027cc71`;
- Docente OS `main`: `f0b7e5c01620d4cc87587081859cbf270cc1d033`;
- Docente OS `develop`: `1f551431af20bbf5ff99f479c4659d72af61cc8e`.

Live branch heads and maturity evidence serve different purposes.

## 7. Non-authorizations

This receipt does not:
- promote an ADR;
- authorize runtime;
- activate DOS-A1;
- authorize Docente OS → Atlas publication;
- change component lifecycle;
- create adoption evidence;
- create regression-history evidence.


## 8. Adversarial evidence correction checkpoint

A final evidence-scope review rejected Arena PR #341 as the product-area Human Review because its reviewed scope is intentionally limited to Dialog/Tabs component evidence.

Arena product-area maturity is instead bound to ECO-01/S3 PR #312, which is a curriculum-source/cross-product review and therefore matches the Arena maturity area:

- exact head: `65a7f5b820b344ec61f8e09d7559012aae521bbc`;
- Product CI run `35512448131`: PASS;
- Beta Release Contract run `35512448242`: PASS;
- HUMAN CROSS-REVIEW PASS comment `5750603947`, explicitly bound to the same Arena exact head.

The deterministic snapshot was regenerated after this correction and preserves:
- Governance L4;
- Arena L4;
- Atlas L4;
- Docente OS L3;
- no Docente OS RUNTIME_CANARY;
- all integrity checks PASS.

This correction strengthens evidence scope without changing any maturity definition or product authority.
