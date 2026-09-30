# TRAMA Maturity Reconciliation — analysis and governed execution baseline

**Slice:** TRAMA-MATURITY-RECONCILIATION-01  
**Date:** 2026-09-29  
**Status:** IMPLEMENTATION SLICE / READ_ONLY OBSERVATION + CANONICAL RECONCILIATION / HUMAN REVIEW REQUIRED  
**Scope:** TRAMA · Arena · Atlas · Docente OS · Control Center  
**Runtime authority:** NONE  
**DOS-A1:** RUNTIME_DEFERRED

## 1. Why this slice exists

A review of the current roadmap, ecosystem snapshot, component evidence registry and live repository state exposed a semantic mismatch:

- some capabilities are already closed and human-reviewed;
- some product repositories contain substantially newer work than the canonical prose documents describe;
- maturity levels remain low because the evidence required by the maturity model is not yet bound to the corresponding area;
- component maturity currently covers only a small subset of the ecosystem.

The immediate risk is to interpret **missing evidence binding** as **low product quality or low functional maturity**.

This slice therefore reconciles state first and expands evidence later.

## 2. Facts established at the start of the slice

Canonical machine state already records:

- `ECO-02-P1 = CLOSED / HUMAN REVIEW PASS`;
- `R3-F0 = CLOSED / HUMAN REVIEW PASS`;
- `CC3-F1 = CLOSED / HUMAN REVIEW PASS`;
- `DOS-A1 = DEFERRED`;
- `R4-P1 = PLANNED`;
- `TRAMA-SA-01 = ACTIVE`;
- `TRAMA-BRAND = PLANNED`.

The ecosystem snapshot already records:

- R2 closed;
- R3 closed;
- no currently blocking gates;
- component evidence projection integrity PASS.

At the start of this reconciliation the area maturity projection was:

- Governance: L1;
- Arena: L0;
- Atlas: L0;
- Docente OS: L0.

These levels are conservative evidence-chain results. They MUST NOT be read as a statement that Arena, Atlas or Docente OS have no mature implementation.

## 3. Product reality versus evidence binding

### Governance

Governance already has canonical documents, approved decisions, exact-head reviews and closed human gates. The maturity engine currently consumes only a subset of these as area-bound evidence.

Target:
- bind existing evidence through L4 where the required proof is already governed;
- reserve L5 for regression history over time.

### Arena

Arena is operational and has the strongest isolated component-evidence infrastructure observed in INV-03.

Current component registry coverage includes:
- legacy and governed ConfirmDialog;
- legacy and governed Tabs;
- legacy Tooltip.

The two governed families are confirmed through BEHAVIOURAL.

Target:
- complete responsive/visual and accessibility evidence for governed dialog/tabs;
- retire or deprecate legacy equivalents only after governed replacements are qualified;
- bind product-level canonical/contract/test/review evidence to the Arena maturity area.

### Atlas

R3-F0 Product & Design Foundation is closed with human review and accessibility evidence.

Atlas has strong journey-level keyboard, responsive, Android/desktop/LIM and visual evidence, but little component-isolated addressability.

Target:
- bind existing R3-F0 documentary, exact-head, automated, accessibility and human evidence into product maturity;
- keep journey-first qualification;
- add component-level evidence only for reusable primitives where it adds diagnostic value;
- continue functional roadmap with R3-P2 and R3-P5 before broader runtime expansion.

### Docente OS

Docente OS is operational, teacher-first and has runtime/canary evidence, but its repository uses a split development topology:

- GitHub default/canonical branch: `main`;
- active development branch: `develop`.

On 2026-09-29, `develop` contained substantially newer qualified work than `main`.

Target:
- preserve `main` as canonical default branch identity;
- add explicit active-development-ref observation rather than pretending `develop` is the default branch;
- bind canonical contracts, automated tests, runtime canary and human review to the Docente OS maturity area;
- add bounded component evidence for AppShell, dialog/command palette, Alert/status and timetable interactive cells.

### Control Center

Control Center has strong evidence infrastructure and current responsive/public validation, but only one component family is currently registered at component level.

Target:
- qualify Context Help as a component family;
- keep component evidence separate from page-level qualification;
- use the Control Center to expose missing evidence, not manufacture it.

## 4. Maturity semantics

Product-area maturity and component maturity are separate models.

### Product-area maturity

Levels L0–L5 are evidence prerequisites.

A low level means only:

> the evidence chain required by the model is not yet completely bound for that area.

It does not mean:
- product quality is low;
- product functionality is absent;
- a closed capability is reopened;
- a later evidence type may leapfrog an earlier prerequisite.

### Component maturity

Ordered chain:

`REGISTERED → ISOLATED → BEHAVIOURAL → RESPONSIVE_VISUAL → ACCESSIBILITY`

Lifecycle remains independent.

A component can be STABLE and still have low evidence maturity; a TRIAL component can have stronger evidence than a legacy one.

## 5. First reconciliation tranche

This slice performs only the safe, deterministic part:

1. align canonical prose state with machine state for ECO-02/P1 and CC3-F1;
2. update the operational sequence so completed work is no longer presented as pending;
3. make maturity UI explicitly say that levels reflect **bound evidence**, not overall product quality;
4. expose evidence-binding coverage and the next missing evidence type per area;
5. add tests preventing canonical prose from regressing to the superseded states.

This tranche does **not** raise product maturity levels by assertion.

## 6. Subsequent evidence-binding tranche

After this reconciliation passes, the next governed slice should bind existing product evidence.

Expected targets:

| Area | Evidence already known to exist | Expected reachable level after valid binding |
| --- | --- | --- |
| Governance | canonical docs, contracts/ADRs, exact-head and human review | L4 candidate |
| Arena | canonical authority, approved contracts, exact-head/test/human evidence | L4 candidate |
| Atlas | R3-F0 canonical contract, exact head, automated + accessibility + human evidence | L4 candidate |
| Docente OS | canonical contracts, tests, runtime canary, human evidence | L4 candidate |

No area is promoted until the individual evidence records satisfy the schema and exact-head/freshness requirements.

## 7. Component evidence backlog

Current machine registry coverage is incomplete by product.

Immediate component evidence plan:

1. Arena governed dialog → responsive/visual + accessibility;
2. Arena governed tabs → responsive/visual + accessibility;
3. decide Tooltip legacy replacement/deprecation path before investing in qualification;
4. Control Center Context Help → isolated + behavioural + responsive/visual + accessibility;
5. Atlas reusable primitives → add addressability while preserving journey-first tests;
6. Docente OS → AppShell, command/dialog, Alert/status, timetable cells.

## 8. Functional roadmap after reconciliation

Completed work must not remain at the top of the active sequence.

The next product sequence remains:

1. R3-P2 — Curriculum pubblico;
2. R3-P5 — Smart Navigation / Percorsi;
3. continuity across Arena ↔ Docente OS ↔ Atlas without making Atlas mandatory;
4. R4-P1 — Officina materials specialistica;
5. R3-P3 — Student Learning Hub;
6. R3-P4 only after a new human/runtime authorization;
7. R3-P6 — Curriculum Health;
8. R5 — identity, adoption and institute pilot.

R4-P2/S1 may continue as NO_RUNTIME design/prototype work in parallel.

## 9. L4 and L5 interpretation

L4 is the first meaningful operational maturity target:
- governed contract;
- version-bound implementation;
- automated evidence;
- accessibility/runtime evidence when required;
- human review.

L5 requires evidence that cannot be manufactured by more implementation work alone:
- regression history;
- adoption evidence where required.

Therefore L5 should be reached through stable use, not by weakening the maturity model.

## 10. Materialized reconciliation checkpoint

After deterministic regeneration on this slice, the snapshot is `1.5.0` and preserves the conservative levels:

- Governance: L1, evidence binding PARTIAL, next missing type `CONTRACT_APPROVED`;
- Arena: L0, evidence binding NONE, next missing type `DOCUMENT_CANONICAL`;
- Atlas: L0, evidence binding PARTIAL, next missing type `DOCUMENT_CANONICAL`;
- Docente OS: L0, evidence binding NONE, next missing type `DOCUMENT_CANONICAL`.

This is the intended reconciliation result. No product maturity level was promoted.

The semantic timeline now explicitly includes:
- ECO-02/P1 final human closeout;
- CC3-F1 human closeout.

All snapshot integrity checks remain PASS at materialization time.

## 11. Non-authorizations

This analysis and reconciliation do not authorize:

- DOS-A1;
- Docente OS → Atlas runtime publication;
- component migration;
- component lifecycle promotion;
- autonomous publication/adoption;
- student accounts/tracking;
- synthetic evidence;
- automatic maturity promotion.


## 12. Component evidence expansion checkpoint — 2026-09-30

`TRAMA-COMPONENT-EVIDENCE-EXPANSION-01` closes the **product coverage/addressability** gap identified in this analysis without claiming that component qualification is complete.

Registry coverage after the slice:

- Arena — covered;
- Atlas — covered through RelationExplorer and CurriculumTree disclosure targets;
- Docente OS — covered through AppShell, Alert/status and Timetable interactive-cell targets;
- Control Center — covered through Context Help.

Registry size moves from 6 to 11 machine-addressable targets.

Important distinction:

> all products are now machine-addressable at component-evidence level, but qualification remains partial.

In particular:

- Arena governed Dialog/Tabs remain confirmed BEHAVIOURAL until responsive/accessibility evidence is executed on the component exact head;
- Atlas targets remain confirmed REGISTERED because isolated component evidence is not yet present, despite strong journey evidence;
- Docente OS AppShell/Timetable have strong browser evidence but remain confirmed REGISTERED because isolated component evidence is not yet present;
- Control Center Context Help remains confirmed REGISTERED pending CS-S1 qualification.

The evidence receipt is:

`docs/evidence/trama-component-evidence-expansion-2026-09-30.md`

The governing contract is:

`docs/contracts/trama-component-evidence-expansion-v1.md`


## Qualification addendum — 2026-09-30

The earlier reconciliation correctly kept Arena governed Dialog/Tabs at confirmed BEHAVIOURAL while responsive/accessibility evidence was missing.

That gap is now closed by Arena PR #343 on exact head `6a04455139a9a2161c723fdcef5358161aff66c4` with exact-head browser/accessibility evidence.

Current projection therefore changes only those two governed Arena primitives:
- `ARENA.DIALOG_CONFIRM.GOVERNED` → confirmed ACCESSIBILITY / QUALIFIED;
- `ARENA.TABS.GOVERNED` → confirmed ACCESSIBILITY / QUALIFIED.

Their lifecycle remains TRIAL; product maturity area remains L4 because L5 still requires regression history.

Control Center CS-S1 also completed successfully in isolation, but the deployed Context Help remains REGISTERED until a separate governed runtime-remediation slice is integrated. No synthetic promotion is inferred from candidate evidence.
