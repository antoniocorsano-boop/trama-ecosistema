# ECO-STATE v0.3 — November governed admission receipt

**Date:** 2026-11-03  
**Scope:** 3 node records + 3 flow records, additive to the 15 nodes/16 flows of 2026-10-17.  
**Decision:** Human scope/admission approval in the 2026-11-03 TRAMA discussion, following approved and merged [ECO-STATE-REBASE-01 / #294](https://github.com/antoniocorsano-boop/trama-ecosistema/pull/294).  
**Technical merge and live Control Center deployment:** NOT AUTHORIZED BY THIS RECEIPT.  
**Authority:** `governance/access/trama-ecosystem-state-v0.3.json` only after qualified integration. Existing v0.2/v0.3 evidence is preserved.

## Evidence and bounded claims

### 1. Registro Docente (REAL node, maturityRef=null)

- [Registro #103](https://github.com/antoniocorsano-boop/registro-docente/pull/103): UX governance and canonical teacher flow baseline approved and integrated;
- [Registro #114](https://github.com/antoniocorsano-boop/registro-docente/pull/114): FLOW-04 integrated, product/browser/Human Review PASS and post-merge PREDEPLOY PASS;
- [TRAMA #293](https://github.com/antoniocorsano-boop/trama-ecosistema/pull/293): dedicated Android/Termux Registro loopback supervisor, exact build/checkout/HTTP cold-start evidence, merged.

**Proved:** independent professional app and bounded teacher workflow in its own application authority.  
**Not proved:** cross-product federation, Docente OS → Registro canonical projection, or a new maturity level.

### 2. Contextual Copilot Core (REAL node only as a shared library, maturityRef=null)

- [TRAMA #279](https://github.com/antoniocorsano-boop/trama-ecosistema/pull/279): shared headless Contextual Copilot Core with policy/capability/confirmation/privacy guardrails and qualified cross-app fixtures;
- [TRAMA #283](https://github.com/antoniocorsano-boop/trama-ecosistema/pull/283): v0.3 intent discovery implementation integrated;
- [Registro source](https://github.com/antoniocorsano-boop/registro-docente/blob/main/src/library/contextualCoreAdapter.ts): product-local consumer uses the shared module within its own authority.

**Proved:** reusable library implementation and bounded consumption.  
**Not proved:** central Copilot server, common product data store, autonomous actions, transferable authority, or all possible consuming journeys.

### 3. Local Semantic Memory (PARTIAL ecosystem node, maturityRef=null)

- [TRAMA #291](https://github.com/antoniocorsano-boop/trama-ecosistema/pull/291): LSM-01D local session bridge and offline Android/Termux hardware qualification;
- [TRAMA #292](https://github.com/antoniocorsano-boop/trama-ecosistema/pull/292): LSM-01E supervised service / hardware smoke;
- [Registro #99](https://github.com/antoniocorsano-boop/registro-docente/pull/99): explicit zero-token same-origin browser activation.

**Proved:** derived, rebuildable local semantic index and bounded opt-in Registro consumer path.  
**Not proved:** broad production adoption, invisible automatic activation, remote federation, or authority over source teaching data.

### 4. Registro → Contextual Copilot Core (PARTIAL flow)

Registro includes the shared core as versioned vendored dependency and has qualified Copilot teaching-context paths. This does not imply all workflows are certified. No separate semantic authority arises from library import.

### 5. Registro → Local Semantic Memory (PARTIAL flow)

The loopback-only session and explicit activation are qualified for the bounded Android/Termux/Registro path. Full professional usage/adoption across sessions and products is a separate qualification; nothing starts automatically.

### 6. Docente OS → Registro (DESIGNED flow)

The interoperability producer and qualification remain unmerged, including [Docente OS #770](https://github.com/antoniocorsano-boop/docente-os-2026-27/pull/770) and [#774](https://github.com/antoniocorsano-boop/docente-os-2026-27/pull/774).

No source-code or proposed-contract existence is sufficient to promote this data flow to PARTIAL or REAL.

## Preserved boundaries

- Docente OS: product REAL and independently L5 in the maturity registry; no implied runtime integration.
- Arena: autorità del curricolo di istituto and Arena → Curricolo Atlas REAL path are unchanged.
- TRAMA Access: PARTIAL, Access federation flows DESIGNED; no forced login or new identity authority.
- Studio Atlas: PARTIAL, Docente OS → Studio Atlas DESIGNED.
- Control Center: read-only derived projection, never graph authority.
- DOS-A1: `RUNTIME_DEFERRED`.
- No nominal student tracking, no new provider credential, no autonomous writes and no Production promotion.

## Acceptance

The record justifies the *bounded* proposed graph states and their human-reviewed scope. Full technical acceptance still requires v0.3 validator + regression + snapshot-drift + Control Center browser/accessibility/visual gates on the exact final head and a final independent review.
