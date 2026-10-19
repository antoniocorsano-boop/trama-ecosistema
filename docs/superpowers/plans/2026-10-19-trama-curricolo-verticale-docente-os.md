# Docente OS — Adozione del Curricolo Verticale Arena Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sostituire il recinto ECO-02/2C con una singola adozione del curricolo verticale Arena per workspace/anno e risolverne dinamicamente il segmento operativo per il docente, preservando i dati e i flussi attuali della secondaria.

**Architecture:** Docente OS introduce un repository di adozione a livello istituto, non per classe, e un `ProfessionalContext` universale. Il pacchetto Arena resta immutabile e versionato; il resolver combina baseline adottata + sezione/coorte + dominio + assegnazione e produce un riferimento operativo. Le vecchie `annual_plan_curriculum_adoptions` restano leggibili come storico/compatibilità durante la migrazione, ma il nuovo flusso non le popola a ventaglio.

**Tech Stack:** Next.js 16, TypeScript 5.9, Node `tsx --test`, Supabase/PostgreSQL/RLS/RPC, Playwright/CV2.

**Spec:** TRAMA `docs/superpowers/specs/2026-10-19-trama-curricolo-verticale-arena-docente-os-design.md`

## Global Constraints

- Baseline execution start: `develop@4e769f2999404752abfc1e095aca83f705820099` unless revalidated.
- Expected next migrations: `0104`, `0105`, `0106`; if any number is occupied at execution time, stop and renumber after replay inspection.
- No class-level fan-out of the institute package.
- No approved institutional authority may be accepted from an unverified local file.
- `PROVISIONAL_COMPLETE` is allowed only when Arena manifest says `SATISFIED` and the package is structurally valid.
- Infanzia has no fake grade/year.
- Current Technology secondary timetable/lesson flows must remain regression-green throughout.
- The existing `Curricolo da rivalidare` guard remains fail-closed.
- No production deploy.

## Review Focus

- First institute adoption binds the workspace to an Arena institution identity; later different institution identities must fail.
- A valid package from a different school year must fail before persistence.
- A teacher may browse a non-assigned segment but cannot use it to authorize a lesson.
- Existing secondaria rows must backfill losslessly; primary/infancy rows must not need legacy `grade`.
- A new Arena release must create `UPDATE_AVAILABLE`/new adoption receipt, not mutate historical lesson references.

---

### Task 1: Parse and validate the TRAMA vertical release

**Files:**
- Create: `product/src/core/domain/curricolo-verticale-release-v1.ts`
- Create: `product/src/core/domain/curricolo-verticale-release-v1.test.ts`
- Modify: `product/package.json` to include the new focused test in `npm test`.
- Keep unchanged: `product/src/core/domain/cml-local-handoff-v2.ts` as legacy compatibility.

**Interfaces:**
- `parseCurricoloVerticaleReleaseV1(serialized: string): CurricoloVerticaleReleaseV1`
- `validateCurricoloVerticaleReleaseV1(input: unknown): { valid: boolean; errors: string[] }`
- `curricoloVerticaleStructuralMaterial(release)` for deterministic footprint verification.
- Contract literal: `TRAMA_CURRICOLO_VERTICALE_RELEASE_V1`.

- [ ] **Step 1: Write RED tests from the TRAMA canonical fixtures**

Assertions:
- full valid release parses;
- infancy requires no numeric year;
- wrong primary/secondary bounds reject;
- invalid manifest/authority/downstream policy reject;
- structural footprint mismatch rejects;
- unknown extra authority claim does not silently pass.

- [ ] **Step 2: Run RED**

Run from `product/`:
`npx tsx --test src/core/domain/curricolo-verticale-release-v1.test.ts`
Expected: FAIL missing module.

- [ ] **Step 3: Implement parser/validator**

Mirror the published TRAMA schema semantically; do not import from Arena and do not infer missing values.

- [ ] **Step 4: Run GREEN and typecheck**

Run focused test + `npm run typecheck`.
Expected: PASS.

- [ ] **Step 5: Commit**

Commit: `feat(curricolo): parse vertical Arena release`

### Task 2: Institute-level adoption persistence

**Files:**
- Create: `product/supabase/migrations/0104_curricolo_verticale_adoptions.sql`
- Create: `product/src/core/infrastructure/supabase/supabase-curricolo-verticale-repository.ts`
- Create: `product/src/core/infrastructure/supabase/supabase-curricolo-verticale-repository.test.ts`
- Create: `product/src/core/domain/curricolo-verticale-adoption.ts`
- Create: `product/src/core/domain/curricolo-verticale-adoption.test.ts`
- Modify: `product/package.json` to include new tests.

**Interfaces:**
- Table `public.curricolo_verticale_adoptions` with at minimum:
  - `id`, `workspace_id`, `academic_year_id`;
  - `institution_ref` JSONB;
  - `school_year_ref`;
  - `arena_version_id`, `arena_version_number`;
  - `authority_state`, `requires_revalidation_on_approval`;
  - `structural_footprint` JSONB;
  - `manifest` JSONB;
  - immutable `release_payload` JSONB;
  - `acceptance_decision_id`, `accepted_by`, `accepted_at`;
  - `superseded_at`, `superseded_by_id` for controlled history.
- RPC `persist_curricolo_verticale_adoption_v1(...)`.
- RPC `curricolo_verticale_current(target_workspace_id, target_academic_year_id)`.
- Repository methods:
  - `adopt(input): Promise<CurricoloVerticaleAdoptionReceipt>`
  - `current(input): Promise<CurricoloVerticaleAdoptionSnapshot | null>`
  - `history(input): Promise<CurricoloVerticaleAdoptionReceipt[]>`

- [ ] **Step 1: Write domain RED tests**

Prove:
- exactly one logical current adoption per workspace/year;
- same footprint is idempotent;
- higher/new version becomes current and leaves old receipt historically readable;
- different institution identity after first binding rejects;
- school-year mismatch rejects;
- approved local-file claim is not accepted without trusted verification.

- [ ] **Step 2: Run RED**

Run the two new test files; expected FAIL.

- [ ] **Step 3: Write migration with RLS and DB invariants**

Rules:
- authenticated workspace member only;
- academic year belongs to workspace;
- release `schoolYearRef` equals selected year;
- manifest must be `SATISFIED` for adoption;
- package identity/fingerprint fields equal the persisted release payload;
- existing current institution identity cannot change;
- supersession is serialized (use transaction/locking inside RPC);
- anon has no access.

Do not insert rows into `annual_plan_curriculum_adoptions` here.

- [ ] **Step 4: Implement repository**

`SupabaseCurricoloVerticaleRepository` calls only the new RPCs for the new model. No ECO-02 environment identity.

- [ ] **Step 5: Run migration replay and GREEN**

Replay entire migration chain in the repository's existing Supabase CI/replay harness, then run focused tests/typecheck.
Expected: PASS.

- [ ] **Step 6: Commit**

Commit: `feat(curricolo): persist one institute vertical adoption`

### Task 3: Workspace-level human intake and adoption

**Files:**
- Create: `product/src/app/curricolo-arena/page.tsx`
- Create: `product/src/app/curricolo-arena/actions.ts`
- Create: `product/src/app/curricolo-arena/curricolo-arena-intake-client.tsx`
- Create: `product/src/app/curricolo-arena/curricolo-arena-intake.test.ts`
- Modify: `product/src/components/app-shell/navigation.tsx` only if the current navigation model supports one institutional reference entry without displacing the task-centric primary flow.
- Modify: legacy `product/src/app/classi/[sectionId]/curricolo-arena/page.tsx` and `actions.ts` only to mark/route the old ECO-02 intake as compatibility after the new flow is live.

**Interfaces:**
- `previewCurricoloVerticaleArena(formData)` validates package without persistence.
- `adoptCurricoloVerticaleArena(formData)` requires explicit confirmation and persists via Task 2 repository.
- Local upload may establish only provisional operational authority; an `APPROVED` package requires a server-verifiable authority mechanism and otherwise returns a truthful fail-closed message.

- [ ] **Step 1: Write RED for full-package preview**

Assert visible summary includes:
- Arena version;
- school year;
- three school orders;
- authority state;
- manifest status;
- diff/update status if a baseline already exists.

- [ ] **Step 2: Write RED for explicit acceptance**

No persistence on preview; persistence only after confirm action.

- [ ] **Step 3: Implement minimal institutional intake**

Reuse existing application shell and feedback conventions; no new design system.

- [ ] **Step 4: Add compatibility notice on class-level ECO-02 surface**

When an institute baseline exists, the old class intake must not invite a second adoption.

- [ ] **Step 5: Run focused tests + Product CI subset**

Expected: PASS.

- [ ] **Step 6: Commit**

Commit: `feat(curricolo): add human-controlled institute adoption`

### Task 4: Universal ProfessionalContext schema migration

**Files:**
- Create: `product/supabase/migrations/0105_professional_context_school_orders.sql`
- Create: `product/src/core/domain/professional-context.ts`
- Create: `product/src/core/domain/professional-context.test.ts`
- Modify: `product/src/core/domain/annual-plan-execution.ts`
- Modify: `product/src/core/infrastructure/supabase/supabase-annual-plan-execution-repository.ts`
- Modify: `product/src/core/domain/timetable.ts`
- Modify readers/writers that deserialize `annual_plan_sections` or teaching-domain rows.

**Interfaces:**
- `SchoolOrder = 'INFANZIA' | 'PRIMARIA' | 'SECONDARIA_I_GRADO'`.
- `ProfessionalSectionContext`:
  - `schoolOrder`;
  - `yearLevel: null | 1 | 2 | 3 | 4 | 5` with order-specific validator;
  - `sectionId`, `sectionCode`, optional `cohortRef`.
- `TeachingDomainKind = 'DISCIPLINA' | 'CAMPO_ESPERIENZA' | 'AMBITO_TRASVERSALE'`.
- `ProfessionalContext` binds section + teaching domain + assignment.
- Existing `AnnualPlanGrade` becomes a secondary-school compatibility projection, not universal identity.

- [ ] **Step 1: Write RED domain tests**

Assertions:
- secondaria PRIMA/SECONDA/TERZA maps exactly to year 1/2/3;
- primary accepts 1–5 and has no legacy `AnnualPlanGrade`;
- infancy requires `yearLevel=null`;
- field-of-experience is a valid teaching domain kind;
- impossible combinations reject.

- [ ] **Step 2: Run RED**

Expected: FAIL missing universal model.

- [ ] **Step 3: Write migration**

For `annual_plan_sections`:
- add `school_order` and `year_level`;
- backfill all current rows as `SECONDARIA_I_GRADO` + 1/2/3 from `grade`;
- relax legacy `grade` to nullable after backfill;
- add order/year/legacy-grade consistency check;
- replace unique/index identity with order + nullable year + section code semantics;
- update immutable-identity trigger.

For existing teaching-domain storage (`teaching_disciplines`):
- add `domain_kind` default `DISCIPLINA`;
- add nullable stable `arena_domain_ref`;
- preserve all existing ids and assignment foreign keys.

Do not rename/drop existing tables in this tranche.

- [ ] **Step 4: Adapt TypeScript readers with a legacy bridge**

Current secondary code can call a helper such as `asLegacySecondaryGrade(section)` only after proving `schoolOrder === 'SECONDARIA_I_GRADO'`; primary/infancy code must not fabricate a legacy grade.

- [ ] **Step 5: Run migration replay + existing annual-plan/timetable tests**

Run focused new test plus `npm test` once compile is green.
Expected: no current secondary regression.

- [ ] **Step 6: Commit**

Commit: `feat(context): generalize school order and teaching domain`

### Task 5: Professional assignment resolver

**Files:**
- Create: `product/src/core/application/professional-context-resolver.ts`
- Create: `product/src/core/application/professional-context-resolver.test.ts`
- Modify: `product/src/core/infrastructure/supabase/supabase-teaching-assignment-reader.ts`
- Modify: `product/src/app/classi/class-workspace-model.ts` only as needed to consume the universal context.

**Interfaces:**
- `resolveProfessionalContext(input: { section; assignment; domain }): ProfessionalContext`
- `canOperateInProfessionalContext(context, actorAssignments): boolean`

- [ ] **Step 1: RED for assigned versus browse-only contexts**

Assert:
- matching assignment → operational;
- same institute but unassigned section/domain → browse-only;
- inactive/provisional assignment behavior follows existing assignment status policy;
- infancy field context resolves with no year.

- [ ] **Step 2: Implement resolver without changing timetable authority**

Teaching assignments remain the operational permission source.

- [ ] **Step 3: Run focused + class workspace/settings/timetable regression tests**

Expected: PASS.

- [ ] **Step 4: Commit**

Commit: `feat(context): resolve teacher operational assignment`

### Task 6: Resolve adopted vertical baseline into the operative segment

**Files:**
- Create: `product/src/core/application/curricolo-operativo-resolver.ts`
- Create: `product/src/core/application/curricolo-operativo-resolver.test.ts`
- Modify: `product/src/core/infrastructure/supabase/supabase-curricolo-verticale-repository.ts`

**Interfaces:**

```ts
resolveCurricoloOperativo(input: {
  adoption: CurricoloVerticaleAdoptionSnapshot | null;
  professionalContext: ProfessionalContext;
}):
  | { status: 'READY'; baseline; segment; nodes; verticalLinks; authority }
  | { status: 'NOT_PRESENT' | 'UPDATE_REQUIRED' | 'SEGMENT_MISSING' | 'OUTSIDE_ASSIGNMENT' | 'REVALIDATION_REQUIRED'; reason: string }
```

- [ ] **Step 1: Write the key RED from 3ª E/B01**

Fixture: 3ª E + Technology assignment + valid adopted Arena lower-secondary year-3 segment.
Before implementation, resolver is missing/fails; after implementation it must return READY.

- [ ] **Step 2: Add adversarial RED cases**

- year 2 segment cannot satisfy year 3;
- primary cannot satisfy secondary;
- wrong domain cannot satisfy Technology;
- unassigned teacher returns OUTSIDE_ASSIGNMENT;
- manifest not satisfied returns REVALIDATION_REQUIRED;
- infancy school-level field resolves without year.

- [ ] **Step 3: Implement deterministic scope matching**

Support Arena `school-level`, `grade`, and `grade-range` semantics directly. Do not copy/fan-out grade-range segments.

- [ ] **Step 4: Run GREEN**

Focused tests + typecheck.

- [ ] **Step 5: Commit**

Commit: `feat(curricolo): resolve adopted vertical segment`

### Task 7: Replace lesson gate input without weakening it

**Files:**
- Modify: `product/src/core/application/lesson-preparation-approval.ts`
- Create or extend: `product/src/core/application/lesson-preparation-approval.test.ts`
- Modify: `product/src/app/classi/[sectionId]/lezioni/[blockId]/page.tsx`
- Modify: preparation approval persistence snapshot only if needed to store vertical version/segment identity.
- Create migration `product/supabase/migrations/0106_curricolo_lesson_receipt_identity.sql` if DB receipt columns are required.

**Interfaces:**
- New approval snapshot records:
  - institute adoption id;
  - Arena version id/fingerprint;
  - exact segment id;
  - authority state/revalidation flag.
- Legacy class-context baseline remains fallback only when no institute adoption exists during migration window.

- [ ] **Step 1: RED: current 3ª E/B01 with new READY resolver still hits old class-baseline requirement**

Prove the failure before editing the gate.

- [ ] **Step 2: Refactor approval input to consume `READY` operative curricolo**

The approval readiness check requires:
- current adopted baseline;
- `manifest.coverageStatus === 'SATISFIED'`;
- exact segment resolved for assigned context;
- authority pair internally consistent;
- no pending update/revalidation condition.

Do not mark a missing/incomplete release ready.

- [ ] **Step 3: Pin historical identity into the preparation/lesson receipt**

A later institute adoption changes future preparation fingerprints, not already registered execution receipts.

- [ ] **Step 4: GREEN focused tests**

Assert:
- valid provisional complete baseline can authorize preparation while preserving revalidation metadata;
- missing/mismatch remains `CURRICULUM_REQUIRED` / fail-closed;
- 3ª E/B01 can enter teach mode after preparation approval.

- [ ] **Step 5: Run Product CI suite**

Run:
`npm run typecheck`
`npm test`
`npm run build`
Expected: PASS.

- [ ] **Step 6: Commit**

Commit: `fix(curricolo): bind lesson gate to institute baseline`

### Task 8: ECO-02 compatibility migration and deprecation

**Files:**
- Modify/add migration only if necessary to record deprecation/mapping; do not delete `0023`/`0065` history.
- Modify: `product/src/core/domain/cml-discipline-binding.ts` to remove ECO-02 from the new path while preserving legacy parser/tests.
- Modify: `product/src/core/infrastructure/supabase/supabase-annual-plan-curriculum-repository.ts` to mark legacy-only use.
- Tests: existing `cml-discipline-binding.test.ts`, `cml-annual-plan-curriculum-persistence.test.ts`, new migration compatibility test.

**Interfaces:**
- Old 2C receipts stay readable.
- New vertical resolver takes precedence when institute baseline exists.
- No new `eco02_curriculum_intake_scopes` rows are required for other classes.

- [ ] **Step 1: RED that 2C and 3ª E must resolve from one adopted institute release**

- [ ] **Step 2: Implement precedence and compatibility bridge**

- [ ] **Step 3: Keep legacy tests GREEN without treating ECO-02 as general architecture**

- [ ] **Step 4: Commit**

Commit: `refactor(curricolo): retire ECO-02 as general intake path`

### Task 9: Cross-order UI/reference qualification

**Files:**
- Modify class/settings/reference surfaces only where required to display universal school order/year/domain labels.
- Create focused browser spec: `product/e2e/experience/curricolo-verticale-adoption.spec.mjs`.
- Extend existing 3ª E task-centric spec for resume-at-CONDUCI proof only if necessary.

**Interfaces:**
- Institutional curricolo page can browse all orders.
- Operational CTAs appear only for assigned contexts.

- [ ] **Step 1: Browser RED fixtures/cases**

Required cases:
- infancy field, no numeric year label;
- primary year 1 and 5;
- secondary year 1 and 3;
- browse-only unassigned segment;
- `UPDATE_AVAILABLE` state;
- 3ª E/B01 teach transition.

- [ ] **Step 2: Implement minimum presentation adaptations**

No redesign of Docente OS primary task flow.

- [ ] **Step 3: Run CV2/HVA/WCAG and inspect real Playwright logs**

Do not call HVA PASS from wrapper status alone.

- [ ] **Step 4: Engineering verdict**

Only exact-head evidence may produce `ENGINEERING QUALIFIED`.

- [ ] **Step 5: Stop before Beta promotion unless separately authorized**

### Task 10: Beta adoption and resumed Human Review

**Files:**
- No code changes unless Human Review produces a new reproducible finding.

**Interfaces:**
- Consumes exact Arena release artifact and exact qualified Docente OS Beta.

- [ ] **Step 1: Adopt the real institute vertical package in Beta through the authenticated human action**

- [ ] **Step 2: Verify 3ª E/B01 resolver references the institute adoption, not a class-copy or ECO-02 scope**

- [ ] **Step 3: Resume Human Review directly at `CONDUCI`**

Continue: `CONDUCI → OSSERVA → REGISTRA → CONTINUA`.

- [ ] **Step 4: Record PASS/REWORK separately from technical qualification**

No production deployment.
