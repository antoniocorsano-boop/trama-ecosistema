# CAP-DOS-ARGO-SYNC — G5 Implementation Plan v1

**Lifecycle:** G5 — Implementation Planning  
**Status:** READY_FOR_AUTHORIZATION  
**Runtime:** NOT_AUTHORIZED  
**Target product:** Docente OS  
**Target repository:** `antoniocorsano-boop/docente-os-2026-27`

## 1. Purpose

Translate the approved G3/G4 capability into bounded implementation slices against the **real current Docente OS codebase**, without creating a parallel product surface.

This document authorizes no code change by itself.

## 2. Real integration baseline

Current Docente OS evidence establishes:

- AppShell: `product/src/components/app-shell/app-shell.tsx`;
- navigation: `product/src/components/app-shell/navigation.ts`;
- Progetta route: `product/src/app/progetta/page.tsx`;
- Piano annuale route: `product/src/app/piano-annuale/page.tsx`;
- Piano annuale client: `product/src/app/piano-annuale/AnnualPlanClient.tsx`;
- annual plan model: `product/src/app/piano-annuale/model.ts`;
- annual execution domain: `product/src/core/domain/annual-plan-execution.ts`;
- annual execution persistence: `product/src/core/infrastructure/supabase/supabase-annual-plan-execution-repository.ts`.

The existing Piano annuale already persists section status and block execution state. It is therefore the correct operational host for the Argo handoff, but **its 33-block execution model is not itself the Argo module/argument model**.

## 3. Critical implementation distinction

Do not derive Argo rows mechanically from the 33 execution blocks.

The approved Argo model is:

```text
Program
→ Module
→ Argument
```

while the current Piano annuale operational model is:

```text
Grade
→ Section
→ 33 execution blocks
```

Therefore implementation needs an explicit, testable **Programma Scolastico projection** between the canonical annual programming and the Argo adapter.

This prevents an accidental one-block = one-argument mapping that has never been governed or evidenced.

## 4. Proposed implementation architecture

```text
Canonical programming / Progetta
        ↓
ArgoProgramProjection
        ↓
validation
        ↓
ArgoProgramXlsProfileV1
        ↓
.xls generator
        ↓
human import
        ↓
confirmation receipt
```

Piano annuale provides:
- class/section context;
- confirmation state;
- entry point;
- synchronization status.

It does not become the source of curriculum authority.

## 5. Slice G5-A — Pure domain projection

**Goal:** introduce no UI, DB or file generation yet.

Proposed Docente OS files:

- `product/src/core/domain/argo-program.ts`
- `product/src/core/application/build-argo-program-projection.ts`
- `product/src/core/application/build-argo-program-projection.test.ts`

Candidate domain:

```ts
type ArgoProgram = {
  schoolYear: string
  classRef: string
  subjectRef: string
  sourceGenerationId: string
  modules: ArgoProgramModule[]
}

type ArgoProgramModule = {
  id: string
  order?: string
  description: string
  arguments: ArgoProgramArgument[]
}

type ArgoProgramArgument = {
  id: string
  order?: string
  description: string
  performedStatus?: 'NOT_PERFORMED' | 'PARTIALLY_PERFORMED' | 'PERFORMED'
  performedAt?: string
}
```

### G5-A acceptance

- deterministic projection;
- stable IDs;
- no dependency on XLS libraries;
- no Supabase write;
- no new route;
- no runtime effect;
- tests cover empty/missing/invalid programming.

## 6. Slice G5-B — Profile validator

**Goal:** implement the normative `ARGO_PROGRAM_XLS_PROFILE_v1` validator as pure logic.

Proposed files:

- `product/src/core/domain/argo-xls-profile.ts`
- `product/src/core/application/validate-argo-program.ts`
- `product/src/core/application/validate-argo-program.test.ts`

Checks:

- module description required;
- module description <= 200 chars;
- argument description required;
- state literal supported;
- date valid;
- orphan argument impossible in canonical structure;
- no student fields;
- deterministic finding codes.

No workbook is generated in this slice.

## 7. Slice G5-C — XLS writer proof

**Goal:** generate a real LibreOffice-compatible `.xls` from synthetic canonical data.

This is the first slice with file-generation behavior and must be separately authorized.

Requirements:

- true legacy XLS/BIFF-compatible output;
- sheet `Dati`;
- six exact headers;
- module/argument row grammar;
- no macros/formulas/external links;
- round-trip parser/validator test;
- artifact SHA-256.

### Library decision

Do not select a spreadsheet writer ad hoc.

Before implementation, verify:
- maintenance status;
- BIFF8 write support;
- LibreOffice compatibility;
- browser/server runtime compatibility;
- license;
- security posture.

A library that only writes XLSX is unacceptable.

## 8. Slice G5-D — Teacher preview UI

**Goal:** integrate the approved flow into the real `Piano annuale` surface.

Primary affected files:

- `product/src/app/piano-annuale/AnnualPlanClient.tsx`
- `product/src/app/piano-annuale/annual-plan.css`

Potential supporting component:

- `product/src/app/piano-annuale/ArgoExportPanel.tsx`

Rules:

- no new top-level navigation;
- appears only with a selected section;
- uses current AppShell;
- primary action only when annual programming is eligible/consolidated;
- technical details collapsed;
- validation findings accessible.

## 9. Slice G5-E — Artifact delivery

**Goal:** connect validated projection to workbook generation and download.

Candidate server boundary:

- server action or route handler under `piano-annuale`;
- generated artifact is ephemeral unless persistence is explicitly required;
- exact canonical version/profile/digest bound to generated response.

Security:
- authenticated workspace/academic-year/section check;
- no user-provided arbitrary workbook payload;
- no external network call to Argo;
- content-disposition filename sanitized.

## 10. Slice G5-F — Confirmation receipt persistence

**Goal:** persist human-confirmed synchronization state.

This slice requires a DB migration and is therefore independently governed.

Candidate data:

```text
sync_id
workspace_id
academic_year_id
section_id
subject_ref
program_generation_id
artifact_sha256
profile_version
package_mode
state
generated_at
confirmed_at
confirmed_by
```

Candidate states:

- PREPARED
- AWAITING_CONFIRMATION
- CONFIRMED
- FAILED
- UNKNOWN
- SUPERSEDED

No receipt may set CONFIRMED automatically on file generation.

## 11. Slice G5-G — Progetta contextual entry

**Goal:** add a secondary entry from Progetta without duplicating the workflow.

Affected file:
- `product/src/app/progetta/page.tsx`

Behavior:
- when section context exists, expose contextual action/link;
- route to the same Piano annuale Argo flow;
- no duplicate state machine or generator.

## 12. Slice ordering

Required order:

```text
G5-A projection
→ G5-B validation
→ G5-C XLS proof
→ G5-D preview UI
→ G5-E artifact delivery
→ G5-F receipt persistence
→ G5-G Progetta secondary entry
```

Rationale:
- prove semantics before file generation;
- prove file before UI;
- prove UI before persistence;
- keep each slice independently reviewable.

## 13. Existing code reuse

Reuse:

- AppShell;
- AnnualPlanClient section context;
- current workspace/year repository boundaries;
- existing server actions pattern;
- current perceptible save-state conventions;
- current responsive shell.

Do not duplicate:

- navigation;
- section selectors;
- workspace/year resolution;
- Supabase client/auth context;
- mobile shell.

## 14. Required pre-implementation clarification

Before G5-A implementation, the exact source of **module/argument structure** must be bound.

Current annual plan code exposes segments/blocks/UDA/pack/focus, but not a governed explicit Argo module/argument hierarchy.

Acceptable source options:

1. a structured canonical programming asset already present in Docente OS;
2. a deterministic projection specification approved from canonical UDA/programming data;
3. a new structured programming model introduced by specification.

Not acceptable:

- treating each 2-hour block as an Argo argument by convenience;
- parsing free-form document text at runtime;
- inferring module boundaries from display headings without a contract.

## 15. Tests required by slice

### G5-A
- deterministic projection;
- ID stability;
- class/year/subject binding;
- missing source fails closed.

### G5-B
- 200-character module limit;
- supported/unsupported states;
- dates;
- empty descriptions;
- stable finding codes.

### G5-C
- true XLS signature;
- sheet name;
- headers;
- row grammar;
- LibreOffice reopen/read check;
- no formulas/macros/external links.

### G5-D
- action visibility by state;
- keyboard flow;
- validation focus;
- stale artifact UI.

### G5-E
- auth/context isolation;
- filename sanitization;
- artifact digest binding;
- no external network write.

### G5-F
- baseline only after explicit confirmation;
- stale artifact cannot confirm;
- failed/unknown does not advance;
- idempotent repeated confirmation.

## 16. First authorized implementation candidate

Recommended first code slice:

**G5-A + G5-B only.**

Why:
- pure domain/application logic;
- no DB migration;
- no file generation;
- no UI mutation;
- no external write;
- lowest regression risk;
- exposes any source-model mismatch before expensive implementation.

## 17. Authorization boundary

This plan is ready for human authorization.

Recommended authorization statement:

`Autorizzo G5-A/G5-B di CAP-DOS-ARGO-SYNC sul repository Docente OS, limitato a projection model e validator, senza UI, DB, XLS generation o runtime esterno.`

Until that approval:
- do not open implementation PR in Docente OS;
- do not add migrations;
- do not introduce spreadsheet libraries;
- do not alter runtime behavior.
