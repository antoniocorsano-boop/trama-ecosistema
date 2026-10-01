# CAP-DOS-ARGO-SYNC — G2 Governance Impact Record v1

**Lifecycle:** G2 — Governance
**Status:** READY_FOR_HUMAN_DECISION
**Runtime:** NOT_AUTHORIZED
**ADR classification:** REQUIRED
**ADR candidate:** TRAMA-ADR-020

## 1. Ownership and authority

- **Owning product:** Docente OS.
- **Arena:** remains the authoritative curriculum source.
- **Docente OS:** operational teacher-facing authority for planning, selection, delta review and sync confirmation.
- **Argo didUP:** external institutional destination and authoritative record for what is actually present in the register after import.
- **Atlas:** no new authority or runtime contract.
- **TRAMA:** governs contracts, boundaries, evidence and lifecycle; it does not become a content authority.

A synchronization baseline in Docente OS is state evidence, not a new curriculum or institutional authority.

## 2. Product impacts

### Arena
**BOUNDED / AUTHORITY_PRESERVED.** No write, no publication, no new curriculum source of truth. Curriculum-derived values must retain provenance when applicable.

### Atlas
**NO_NEW_RUNTIME_CONTRACT.** Atlas publication/material responsibilities are unchanged.

### Docente OS
**PRIMARY PRODUCT.** Candidate responsibilities: canonical operational model, stable identity/lineage, delta/conflict review, Argo artifact preparation, human confirmation, sync receipt.

### TRAMA
**GOVERNANCE / CONTRACT ONLY.** TRAMA governs model, delta, adapter/profile, receipts and human-control rules. It must not write to Argo, hold Argo credentials, auto-promote sync state or activate DOS-A1.

## 3. Data and minimization

Current scope is limited to institutional didactic metadata: school year, class reference, subject reference, module/argument, order, performed state/date, lineage, version/hash and sync receipt metadata.

Explicitly out of scope: student identifiers, grades, attendance, disciplinary notes, health/special-category data and Argo credentials.

## 4. Privacy and security

**Privacy:** low impact in current scope, contingent on strict exclusion of student data.

**Security:** material interoperability risk, but no credential risk in the current design. Main risks are malformed/incompatible XLS, stale packages, false baseline confirmation and ambiguous update/delete semantics.

Required mitigations before runtime: fail-closed validation, exact digest binding, immutable receipts, no macros/formulas in generated profiles unless explicitly justified, explicit human import and confirmation, no Argo credentials.

## 5. Human control

**Classification: STRENGTHENED.**

1. Teacher reviews delta/conflicts.
2. Teacher chooses what is ready for Argo.
3. System prepares but does not import.
4. Teacher imports manually in Argo.
5. Teacher verifies the result.
6. Only then may the confirmed baseline advance.

File generation alone never equals successful synchronization.

## 6. Accessibility

G3/G4 must require keyboard-operable diff review, non-color-only states, screen-reader labels, accessible bulk review, perceptible success/error/waiting feedback and a clear recovery path.

## 7. Runtime

**NOT_AUTHORIZED.** G2 approval would authorize governance only. Runtime requires G3–G7.

## 8. Affected contracts

1. Canonical Didactic Model.
2. Delta Contract.
3. Argo Program XLS Profile.
4. Sync Receipt.
5. baseline advancement state machine.
6. human confirmation contract.

No cross-product write contract is introduced.

## 9. Persistence boundary

Persistent synchronization state is architecturally relevant and ADR-governed. Candidate persisted data: stable operational IDs, lineage, confirmed baseline version/hash and receipts.

Exact storage location/technology is deferred to later gates and must remain inside the Docente OS operational boundary unless a later ADR changes that boundary.

## 10. Adapter boundary

The Argo adapter is replaceable interoperability infrastructure. Current evidence constrains it to .xls, LibreOffice-compatible production, the observed BIFF8/CDFV2 profile, six-field Programma Scolastico mapping, version/profile detection and fail-closed behavior on unknown profiles.

## 11. External-write boundary

Docente OS prepares/validates artifact → human imports in Argo → human verifies → human confirms in Docente OS.

Prohibited in this capability version: browser automation, direct API writes, credential storage/use, unattended import and automatic confirmation.

## 12. DOS-A1

**DOS-A1 remains RUNTIME_DEFERRED.** This capability neither activates nor depends on DOS-A1.

## 13. Negative knowledge

**Reject:** XLS as canonical editable source; baseline advancement on generation; silent conflict resolution; automatic external deletion when eligibility is unknown.

**Defer:** browser/API automation; bidirectional sync; student-linked register domains; modified-file round-trip beyond governed evidence.

## 14. G2 Definition of Done

- [x] owning product/domain identified;
- [x] authoritative source identified;
- [x] Arena impact assessed;
- [x] Atlas impact assessed;
- [x] Docente OS impact assessed;
- [x] TRAMA impact assessed;
- [x] data handled identified/minimized;
- [x] privacy/security impact classified;
- [x] human-control impact classified;
- [x] accessibility implications identified;
- [x] runtime impact declared;
- [x] affected contracts identified;
- [x] ADR need decided;
- [x] DOS-A1 non-activation verified.

## 15. Human decision requested

Approve or require changes to these governance points: Docente OS ownership; Arena curriculum authority preserved; Argo as external institutional destination; Atlas unchanged; TRAMA governance-only; runtime NOT_AUTHORIZED; manual/human-confirmed import; ADR-governed baseline/receipt persistence; LibreOffice-compatible .xls adapter boundary; DOS-A1 remains deferred.

If approved, G2 becomes PASS and G3 specification may begin. Approval does not authorize runtime.