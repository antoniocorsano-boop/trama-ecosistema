# Docente OS — Adozione del Curricolo Verticale Arena Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sostituire il recinto ECO-02/2C con una singola adozione del curricolo verticale Arena per workspace/anno e risolverne dinamicamente il segmento operativo per il docente, preservando i dati e i flussi attuali della secondaria.

**Architecture:** Docente OS introduce un'adozione a livello istituto, non per classe, più un `ProfessionalContext` universale. Il pacchetto Arena resta immutabile e versionato; un resolver combina baseline adottata + ordine/annualità/sezione + dominio + assegnazione e restituisce il segmento operativo. Le vecchie `annual_plan_curriculum_adoptions` restano storico/compatibilità e non vengono popolate a ventaglio dal nuovo flusso.

**Tech Stack:** Next.js 16, TypeScript 5.9, Node `tsx --test`, Supabase/PostgreSQL/RLS/RPC, Playwright/CV2.

**Spec:** TRAMA `docs/superpowers/specs/2026-10-19-trama-curricolo-verticale-arena-docente-os-design.md`

## Global Constraints

- Baseline execution start: `develop@4e769f2999404752abfc1e095aca83f705820099` unless revalidated.
- Expected next migrations: `0104`, `0105`, `0106`; if occupied at execution time, stop and renumber only after migration-lineage review.
- No class-level fan-out of the institute package.
- Local upload can establish only `PROVISIONAL_COMPLETE`; `APPROVED` requires an exact server-side verified Arena authority receipt.
- The client cannot create, update or delete verified Arena authority receipts.
- `PROVISIONAL_COMPLETE` is usable only when Arena manifest says `SATISFIED` and the package is structurally valid.
- Infanzia has no fake grade/year.
- Current Technology secondary timetable/lesson flows remain regression-green throughout.
- `Curricolo da rivalidare` remains fail-closed.
- Existing preparation receipts remain append-only; historical teaching sessions never float to a newer Arena version.
- No production deploy.

## Review Focus

- First institute adoption binds the workspace/year to one Arena institution identity; a different institution identity must fail.
- `APPROVED` without an exact private verified receipt must fail, even if the uploaded JSON claims approval.
- A teacher may browse a non-assigned segment but cannot use it to authorize a lesson.
- Existing secondaria rows must backfill losslessly; primary/infanzia rows must not need legacy `grade`.
- A new Arena release creates an update/new adoption receipt and never rewrites preparation or execution history.

---

### Task 1: Parse and validate the TRAMA vertical release

**Files:**
- Create: `product/src/core/domain/curricolo-verticale-release-v1.ts`
- Create: `product/src/core/domain/curricolo-verticale-release-v1.test.ts`
- Modify: `product/package.json`
- Keep unchanged: `product/src/core/domain/cml-local-handoff-v2.ts`

**Interfaces:**
- `parseCurricoloVerticaleReleaseV1(serialized: string): CurricoloVerticaleReleaseV1`
- `validateCurricoloVerticaleReleaseV1(input: unknown): { valid: boolean; errors: string[] }`
- `curricoloVerticaleStructuralMaterial(release)`
- Contract literal: `TRAMA_CURRICOLO_VERTICALE_RELEASE_V1`.

- [ ] **Step 1: Write RED from the canonical TRAMA fixtures**

Assert valid full release parses; infancy has no numeric year; invalid primary/secondary bounds, authority, manifest, downstream policy and structural footprint all reject.

- [ ] **Step 2: Run RED**

Run: `npx tsx --test src/core/domain/curricolo-verticale-release-v1.test.ts`
Expected: FAIL missing module.

- [ ] **Step 3: Implement parser/validator**

Mirror the published TRAMA schema; do not import Arena code and do not infer omitted values.

- [ ] **Step 4: Run GREEN + typecheck**

Run focused test and `npm run typecheck`.

- [ ] **Step 5: Commit**

`feat(curricolo): parse vertical Arena release`

### Task 2: Institute-level adoption persistence and verified authority boundary

**Files:**
- Create: `product/supabase/migrations/0104_curricolo_verticale_adoptions.sql`
- Create: `product/src/core/domain/curricolo-verticale-adoption.ts`
- Create: `product/src/core/domain/curricolo-verticale-adoption.test.ts`
- Create: `product/src/core/infrastructure/supabase/supabase-curricolo-verticale-repository.ts`
- Create: `product/src/core/infrastructure/supabase/supabase-curricolo-verticale-repository.test.ts`
- Modify: `product/package.json`

**Interfaces:**
- `public.curricolo_verticale_adoptions`: `id`, `workspace_id`, `academic_year_id`, `institution_ref`, `school_year_ref`, `arena_version_id`, `arena_version_number`, `authority_state`, `requires_revalidation_on_approval`, `structural_footprint`, `manifest`, immutable `release_payload`, acceptance decision/actor/time, supersession fields.
- `private.arena_curricolo_verified_authority_receipts`: exact trusted tuple `{workspace_id, academic_year_id, institution_ref, arena_version_id, structural_footprint_hash, authority_receipt_ref, verified_at, verification_source}`. No grants to `anon` or `authenticated`; local intake has no mutation path to this table.
- RPC `persist_curricolo_verticale_adoption_v1(...)`.
- RPC `curricolo_verticale_current(target_workspace_id, target_academic_year_id)`.
- Repository methods `adopt`, `current`, `history`.

- [ ] **Step 1: Write RED domain/persistence tests**

Prove:
- one logical current adoption per workspace/year;
- same footprint is idempotent;
- new version supersedes without deleting history;
- institution/year mismatch rejects;
- `PROVISIONAL_COMPLETE + SATISFIED` may persist without a verified authority receipt;
- `APPROVED` fails with no private receipt;
- `APPROVED` passes only with an exact private receipt matching workspace/year/institution/version/fingerprint/authorityReceiptRef;
- near-match receipt (wrong version, fingerprint or institution) fails.

- [ ] **Step 2: Run RED**

Run the two new test files; expected FAIL.

- [ ] **Step 3: Write migration with RLS and DB invariants**

Rules:
- authenticated workspace member required for adoption;
- academic year belongs to workspace and matches `schoolYearRef`;
- manifest must be `SATISFIED`;
- package identity/fingerprint fields equal immutable `release_payload`;
- institution binding cannot silently change;
- supersession is serialized transactionally;
- `APPROVED` branch performs exact lookup in `private.arena_curricolo_verified_authority_receipts`;
- `PROVISIONAL_COMPLETE` must not carry institutional approval authority;
- no client grants on trusted receipt table;
- anon has no access.

The mechanism that populates a trusted receipt from a future signed/server-to-server Arena channel is outside the local-upload path; until such evidence exists, `APPROVED` correctly remains fail-closed.

Do not insert rows into `annual_plan_curriculum_adoptions`.

- [ ] **Step 4: Implement repository**

Use only the new RPCs. No ECO-02 environment identity.

- [ ] **Step 5: Replay migrations + GREEN**

Run the repository's full Supabase replay harness, focused tests and typecheck.

- [ ] **Step 6: Commit**

`feat(curricolo): persist one verified institute adoption`

### Task 3: Workspace-level human intake and adoption

**Files:**
- Create: `product/src/app/curricolo-arena/page.tsx`
- Create: `product/src/app/curricolo-arena/actions.ts`
- Create: `product/src/app/curricolo-arena/curricolo-arena-intake-client.tsx`
- Create: `product/src/app/curricolo-arena/curricolo-arena-intake.test.ts`
- Modify: `product/src/components/app-shell/navigation.tsx` only if one reference entry fits the existing navigation model.
- Modify: `product/src/app/classi/[sectionId]/curricolo-arena/page.tsx`
- Modify: `product/src/app/classi/[sectionId]/curricolo-arena/actions.ts`

**Interfaces:**
- `previewCurricoloVerticaleArena(formData)` validates but never persists.
- `adoptCurricoloVerticaleArena(formData)` persists only after explicit confirmation.
- Uploaded `APPROVED` package may be previewed but adoption fails unless Task 2 finds the exact private verified receipt.

- [ ] **Step 1: RED for full-package preview**

Show version, school year, all three orders, authority state, manifest status and update/diff state.

- [ ] **Step 2: RED for explicit acceptance**

No write on preview; write only on confirmation.

- [ ] **Step 3: Implement minimal institutional intake**

Reuse AppShell and existing feedback patterns; no new design system.

- [ ] **Step 4: Retire class-level intake as primary path**

When an institute baseline exists, old ECO-02 page must not invite a second class adoption.

- [ ] **Step 5: GREEN + Product CI subset**

- [ ] **Step 6: Commit**

`feat(curricolo): add human-controlled institute adoption`

### Task 4: Universal ProfessionalContext schema migration

**Files:**
- Create: `product/supabase/migrations/0105_professional_context_school_orders.sql`
- Create: `product/src/core/domain/professional-context.ts`
- Create: `product/src/core/domain/professional-context.test.ts`
- Modify: `product/src/core/domain/annual-plan-execution.ts`
- Modify: `product/src/core/infrastructure/supabase/supabase-annual-plan-execution-repository.ts`
- Modify: `product/src/core/domain/timetable.ts`
- Modify readers/writers that deserialize `annual_plan_sections` or `teaching_disciplines`.

**Interfaces:**
- `SchoolOrder = 'INFANZIA' | 'PRIMARIA' | 'SECONDARIA_I_GRADO'`.
- `ProfessionalSectionContext = { schoolOrder; yearLevel: null|1|2|3|4|5; sectionId; sectionCode; cohortRef? }` with order-specific validator.
- `TeachingDomainKind = 'DISCIPLINA' | 'CAMPO_ESPERIENZA' | 'AMBITO_TRASVERSALE'`.
- Existing `AnnualPlanGrade` becomes secondary-only compatibility projection.

- [ ] **Step 1: RED domain tests**

Secondary PRIMA/SECONDA/TERZA maps 1/2/3; primary accepts 1–5; infancy requires null; field of experience is valid; impossible combinations reject.

- [ ] **Step 2: Run RED**

- [ ] **Step 3: Write migration**

For `annual_plan_sections`:
- add `school_order`, `year_level`;
- backfill all current rows to `SECONDARIA_I_GRADO` + 1/2/3;
- relax legacy `grade` to nullable after backfill;
- add order/year/legacy-grade consistency constraint;
- replace unique identity/index with order + nullable year + section code semantics;
- update immutable identity trigger.

For `teaching_disciplines`:
- add `domain_kind` default `DISCIPLINA`;
- add nullable stable `arena_domain_ref`;
- preserve IDs and assignment FKs.

Do not rename/drop legacy tables in this tranche.

- [ ] **Step 4: Adapt readers with a legacy bridge**

`asLegacySecondaryGrade(section)` may run only after proving `SECONDARIA_I_GRADO`; primary/infanzia never fabricate a legacy grade.

- [ ] **Step 5: Replay + annual-plan/timetable regression suite**

- [ ] **Step 6: Commit**

`feat(context): generalize school order and teaching domain`

### Task 5: Professional assignment resolver

**Files:**
- Create: `product/src/core/application/professional-context-resolver.ts`
- Create: `product/src/core/application/professional-context-resolver.test.ts`
- Modify: `product/src/core/infrastructure/supabase/supabase-teaching-assignment-reader.ts`
- Modify: `product/src/app/classi/class-workspace-model.ts` only as required.

**Interfaces:**
- `resolveProfessionalContext(input): ProfessionalContext`
- `canOperateInProfessionalContext(context, actorAssignments): boolean`

- [ ] **Step 1: RED assigned vs browse-only**

Matching assignment is operational; same institute but unassigned section/domain is browse-only; existing assignment status rules remain authoritative; infancy resolves without year.

- [ ] **Step 2: Implement without changing timetable authority**

- [ ] **Step 3: Focused + class/settings/timetable regressions**

- [ ] **Step 4: Commit**

`feat(context): resolve teacher operational assignment`

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

- [ ] **Step 1: RED from real 3ª E/B01 semantics**

3ª E + Technology assignment + adopted lower-secondary year-3 segment must eventually return `READY`.

- [ ] **Step 2: RED adversarial cases**

Wrong year/order/domain; unassigned teacher; incomplete manifest; infancy school-level field.

- [ ] **Step 3: Implement deterministic scope matching**

Support Arena `school-level`, `grade`, `grade-range` directly; never fan out range segments.

- [ ] **Step 4: GREEN + typecheck**

- [ ] **Step 5: Commit**

`feat(curricolo): resolve adopted vertical segment`

### Task 7: Bind lesson approval and immutable execution history to the institute baseline

**Files:**
- Create: `product/supabase/migrations/0106_curricolo_lesson_receipt_identity.sql`
- Modify: `product/src/core/application/lesson-preparation-approval.ts`
- Create or extend: `product/src/core/application/lesson-preparation-approval.test.ts`
- Modify: `product/src/app/classi/[sectionId]/lezioni/[blockId]/page.tsx`
- Modify: `product/src/core/infrastructure/supabase/supabase-lesson-preparation-approval-repository.ts`
- Modify the canonical TeachingSession recording repository/action that calls the current registration RPC after locating it on the execution head.

**Interfaces:**
- Extend append-only `lesson_preparation_receipts` with:
  - `curricolo_verticale_adoption_id uuid references public.curricolo_verticale_adoptions(id) on delete restrict`;
  - `arena_version_id text`;
  - `arena_version_footprint_hash text`;
  - `arena_segment_id text`.
- New receipt snapshot schemaVersion `2` contains the same four fields; existing schemaVersion `1` rows remain readable.
- Extend `teaching_sessions` with nullable `lesson_preparation_receipt_id uuid references public.lesson_preparation_receipts(id) on delete restrict` for backward-compatible legacy/manual history.
- The task-centric registration boundary requires the preparation receipt and validates same workspace/year/section plus exact block/projection context before recording.

- [ ] **Step 1: RED: new READY resolver still hits old class-baseline gate**

Prove before editing readiness logic.

- [ ] **Step 2: RED historical identity contract**

Assert a preparation receipt cannot persist mismatched adoption/version/fingerprint/segment fields; an execution session linked to it remains bound after a newer institute adoption becomes current.

- [ ] **Step 3: Write migration 0106**

Add the columns above; enforce all-null for legacy v1 or all-set for vertical v2; update receipt insert invariant trigger so snapshot v2 fields equal columns and referenced adoption matches workspace/year; add teaching-session FK and same-context validation. Do not mutate existing receipts/sessions.

- [ ] **Step 4: Refactor readiness to consume `READY` operative curricolo**

Require current adoption, `manifest.coverageStatus='SATISFIED'`, exact assigned segment, internally consistent authority and no pending update/revalidation state. Do not recreate Arena completeness logic in Docente OS.

- [ ] **Step 5: Persist snapshot schemaVersion 2**

Preparation fingerprint includes adoption/version/segment identity. New Arena adoption therefore invalidates future stale preparation approval without changing old receipt contents.

- [ ] **Step 6: Link task-centric teaching registration to the preparation receipt**

The registered lesson obtains historical Arena identity through the immutable receipt FK. Legacy/manual registrations may remain null only where the existing product semantics already allow them.

- [ ] **Step 7: GREEN focused tests + Product CI**

Assert provisional-complete READY can authorize; mismatch stays fail-closed; 3ª E/B01 enters teach mode; history remains pinned after update. Run `npm run typecheck`, `npm test`, `npm run build`.

- [ ] **Step 8: Commit**

`fix(curricolo): bind lesson lifecycle to institute baseline`

### Task 8: ECO-02 compatibility migration and deprecation

**Files:**
- Do not delete migrations `0023`, `0064`, `0065`, `0066`.
- Modify: `product/src/core/domain/cml-discipline-binding.ts`
- Modify: `product/src/core/infrastructure/supabase/supabase-annual-plan-curriculum-repository.ts`
- Extend existing CML persistence/binding tests plus one compatibility test.

**Interfaces:**
- Old 2C receipts remain readable/auditable.
- New vertical resolver takes precedence when an institute baseline exists.
- No new `eco02_curriculum_intake_scopes` are required for any other class.

- [ ] **Step 1: RED: 2C and 3ª E resolve from one institute adoption**

- [ ] **Step 2: Implement precedence/compatibility bridge**

- [ ] **Step 3: Keep legacy tests GREEN**

- [ ] **Step 4: Commit**

`refactor(curricolo): retire ECO-02 as general intake path`

### Task 9: Cross-order UI and browser qualification

**Files:**
- Modify only required class/settings/reference labels.
- Create: `product/e2e/experience/curricolo-verticale-adoption.spec.mjs`
- Extend existing 3ª E task-centric spec only for resume-at-CONDUCI proof if needed.

**Interfaces:**
- Institutional page browses all orders.
- Operational CTAs appear only for assigned contexts.

- [ ] **Step 1: Browser RED cases**

Infanzia without numeric year; primary 1 and 5; secondary 1 and 3; browse-only unassigned segment; update available; 3ª E/B01 teach transition.

- [ ] **Step 2: Minimal presentation adaptations**

No redesign of the primary task flow.

- [ ] **Step 3: Run CV2/HVA/WCAG and inspect real Playwright logs**

Never call HVA PASS from wrapper status alone.

- [ ] **Step 4: Exact-head engineering verdict**

- [ ] **Step 5: Stop before Beta promotion unless separately authorized**

### Task 10: Beta adoption and resumed Human Review

**Files:**
- No code changes unless Human Review produces a reproducible finding.

**Interfaces:**
- Consumes exact Arena release artifact and exact qualified Docente OS Beta.

- [ ] **Step 1: Adopt the real institute package in Beta through authenticated human action**

- [ ] **Step 2: Verify 3ª E/B01 resolves from the institute adoption, not a class copy/ECO-02 scope**

- [ ] **Step 3: Resume directly at `CONDUCI`**

Continue `CONDUCI → OSSERVA → REGISTRA → CONTINUA`; do not repeat OGGI→VISUALIZZA unless regression evidence requires it.

- [ ] **Step 4: Record `ENGINEERING QUALIFIED` separately from Human Review `PASS/REWORK`**

No production deployment.
