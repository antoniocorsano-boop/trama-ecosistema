# TRAMA-ADR-020 — Docente OS → Argo: interoperabilità didattica human-confirmed

**Status:** PROPOSED
**Date:** 2026-10-01
**Capability:** CAP-DOS-ARGO-SYNC
**Scope:** TRAMA · Docente OS · Arena · Atlas · Argo didUP
**Runtime authorization:** NOT_AUTHORIZED

## Context

G1 established the Argo module/argument model, execution-state semantics, a real didUP .xls specimen, current UI guidance that import accepts .xls produced with LibreOffice, and an exact identical re-import with no duplicate visible content for the tested specimen.

The ecosystem must avoid creating a second curriculum authority, hiding external writes or promoting a synchronization baseline without evidence of successful human import.

## Decision

If approved:

1. Docente OS owns the operational synchronization workflow.
2. Arena remains the authoritative curriculum source.
3. Argo didUP remains the external institutional destination and authoritative record for what is actually present in the register after import.
4. Atlas receives no new authority or write contract.
5. TRAMA governs models, contracts, evidence and boundaries without becoming an operational data authority.
6. Docente OS may maintain a canonical operational program model and confirmed synchronization baseline; that baseline is state evidence, not curriculum authority.
7. The Argo boundary is versioned, validated, LibreOffice-compatible .xls interoperability.
8. External import remains human-operated in Argo.
9. Baseline advancement requires explicit human confirmation bound to the exact prepared delta/artifact.
10. Conflicts and unsafe deletions fail closed.
11. Argo credentials, browser automation, direct API writes and unattended import are outside this decision.
12. DOS-A1 remains RUNTIME_DEFERRED.

## Persistence

Architecturally permitted, subject to later gates: stable operational IDs, lineage, confirmed baseline version/hash, synchronization receipts and adapter/profile version.

Prohibited: exported XLS as canonical source, duplication of Arena authority, auto-confirmed synchronization, storage of Argo credentials.

## Human-control invariant

prepare → preview → teacher decision → artifact → manual Argo import → teacher verifies → explicit confirmation → baseline advance

Any interruption before explicit confirmation leaves the previous confirmed baseline authoritative for synchronization state.

## Security/privacy

Current scope excludes student-personal data. Future student-linked scope requires a new governance assessment.

## Rejected/deferred alternatives

Rejected: XLS as source of truth; full reimport as default for every small change; automatic baseline promotion; silent conflict/duplicate resolution; automatic delete with unknown eligibility.

Deferred: browser automation; Argo credential handling; direct API integration; bidirectional synchronization; student-linked domains; DOS-A1 involvement.

## Compatibility constraint

Current evidence supports a candidate Programma Scolastico profile with .xls extension, LibreOffice-compatible generation, observed BIFF8/CDFV2 container, sheet Dati and fields for module order/description, argument order/description, performed state/date.

G3 must define version/profile detection and fail-closed handling without assuming a permanent undocumented vendor contract.

## Runtime

Approval of this ADR does not authorize runtime. Runtime requires subsequent governed specification, implementation, verification and human validation.

## Relationship to existing decisions

This ADR does not supersede TRAMA-ADR-002, TRAMA-ADR-004, TRAMA-ADR-006 or TRAMA-ADR-019. It specializes those boundaries for Docente OS → Argo interoperability.