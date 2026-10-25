# Arena — Curricolo Verticale Institute Release Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fare di Arena il sender produttivo e deterministico dell'intera versione del curricolo verticale di istituto, conforme a `TRAMA_CURRICOLO_VERTICALE_RELEASE_V1`.

**Architecture:** Il nuovo exporter legge esclusivamente il modello produttivo Arena (`InstituteCurriculumVersion`, `CurriculumSegment`, `CurriculumNode`, `VerticalCurriculumLink`) tramite i repository esistenti. Il pacchetto verticale è additivo ai CML handoff class-context v1/v2 e non li sostituisce; manifest e fingerprint sono costruiti in modo puro e validati prima della serializzazione. Arena, non Docente OS, è responsabile della semantica di completezza: `SATISFIED` significa non solo “segmento presente”, ma perimetro atteso coperto e segmenti richiesti utilizzabili per la programmazione secondo lo stato/applicabilità governati da Arena.

**Tech Stack:** TypeScript, Vitest, existing Arena curriculum persistence repositories, existing deterministic serialization/signature helpers.

**Spec:** TRAMA `docs/superpowers/specs/2026-10-19-trama-curricolo-verticale-arena-docente-os-design.md`

## Global Constraints

- Baseline execution start: `CurManLight_arena@189ebe9da05c737c37654a450adf46910888e25e` unless revalidated.
- No second curricolo store.
- New domain naming uses `curricolo` terminology; legacy CML compatibility identifiers remain untouched.
- Infanzia is represented by school-level/cohort scope without invented numeric class.
- Package release requires explicit institutional perimeter input; “present segments” alone may not define completeness.
- `manifest.coverageStatus = SATISFIED` requires both scope coverage and Arena-owned planning usability/applicability of every mandatory segment; Docente OS must not reconstruct this judgment downstream.
- Approved authority is accepted only when it is already present in Arena's governed version/evidence; the exporter never infers approval.
- Output has `acceptanceRequired=true` and `automaticWriteAllowed=false`.

## Review Focus

- Persisted nodes/links from another version must be rejected.
- A missing expected segment or a required segment not usable for planning must produce `INCOMPLETE`, never `SATISFIED`.
- Grade-range segments must cover requested years without expanding them into fake copies.
- Empty mandatory content cannot be declared complete.
- Same semantic input with different repository iteration order must produce same fingerprint.

---

### Task 1: Pure vertical release domain

**Files:**
- Create: `src/domain/transfer/curricoloVerticaleReleaseV1.ts`
- Create: `src/__tests__/curricolo-verticale-release-v1.test.ts`
- Reuse: `src/domain/curriculum/version.ts`
- Reuse: `src/domain/curriculum/segment.ts`
- Reuse: `src/domain/curriculum/node.ts`
- Reuse: `src/domain/curriculum/verticalLink.ts`
- Reuse: `src/domain/transfer/signatures.ts`

**Interfaces:**
- `type CurricoloVerticaleExpectedScopeV1 = { schoolOrder; scope; domainId; domainKind }`
- `type CurricoloVerticalePerimeterV1 = { expected: CurricoloVerticaleExpectedScopeV1[]; intentionallyNotApplicable: CurricoloVerticaleExpectedScopeV1[] }`
- `buildCurricoloVerticaleManifestV1(input) -> manifest`
- `createCurricoloVerticaleReleaseV1(input) -> release`
- `validateCurricoloVerticaleReleaseV1(input) -> { valid: boolean; errors: readonly string[] }`
- `serializeCurricoloVerticaleReleaseV1(release) -> string`

- [ ] **Step 1: Write RED tests for the canonical three-order package**

Tests create one version with:
- infancy school-level field segment;
- primary grade and/or grade-range segments covering 1–5;
- lower-secondary segments covering 1–3;
- at least one node and one cross-order vertical link.

Assertions:
- release names all three orders;
- infancy has no numeric year level;
- manifest is `SATISFIED` only when every expected scope is represented or explicitly N/A **and** every mandatory represented segment satisfies the Arena-owned planning-usability/applicability rule;
- one expected-but-not-usable segment forces `INCOMPLETE`;
- downstream policy is immutable human-control policy.

- [ ] **Step 2: Run RED**

Run: `npm test -- --run src/__tests__/curricolo-verticale-release-v1.test.ts`
Expected: FAIL because module/functions do not exist.

- [ ] **Step 3: Implement manifest builder**

Normalize segment identity from productive `CurriculumSegment.scope`:
- `{type:'school-level'}` → no year;
- `{type:'grade', grade}` → exact year;
- `{type:'grade-range', grades}` → range/set without fan-out copies.

Manifest comparison must use canonical keys sorted lexicographically. Planning usability must be derived only from Arena's governed segment/applicability state; it must not be guessed from UI labels or from mere row presence.

- [ ] **Step 4: Implement release creation and validation**

Release input signature:

```ts
createCurricoloVerticaleReleaseV1(input: {
  institutionId: string;
  schoolYearRef: string;
  version: InstituteCurriculumVersion;
  segments: readonly CurriculumSegment[];
  nodes: readonly CurriculumNode[];
  verticalLinks: readonly VerticalCurriculumLink[];
  perimeter: CurricoloVerticalePerimeterV1;
  authority: {
    state: 'PROVISIONAL_COMPLETE' | 'APPROVED';
    authorityReceiptRef?: string;
    requiresRevalidationOnApproval: boolean;
  };
  issuedAt?: string;
}): CurricoloVerticaleReleaseV1
```

Validator must reject:
- version-id mismatch on segments/nodes/links;
- link endpoints absent from included nodes;
- invalid authority combinations;
- `SATISFIED` manifest with unresolved expected scopes or a mandatory segment not planning-usable;
- no usable segments.

- [ ] **Step 5: Implement deterministic footprint**

Use the repository's canonical serialization/signature utility; footprint material excludes `issuedAt` so repeated export of identical semantic version remains structurally identical. Do not describe this as an institutional digital signature.

- [ ] **Step 6: Run GREEN**

Run: `npm test -- --run src/__tests__/curricolo-verticale-release-v1.test.ts`
Expected: PASS.

- [ ] **Step 7: Commit**

Commit: `feat(curricolo): define institute vertical release v1`

### Task 2: Productive repository exporter

**Files:**
- Create: `src/domain/transfer/curricoloVerticaleRepositoryExportV1.ts`
- Create: `src/__tests__/curricolo-verticale-repository-export-v1.test.ts`
- Reuse: `src/domain/curriculum/persistence/repositories.ts`
- Reuse: `src/domain/curriculum/validation-legacy.ts`

**Interfaces:**
- `exportCurricoloVerticaleFromRepositoriesV1(input)` consumes `CurriculumRepositories`, `versionId`, institution/year, perimeter and authority evidence.
- Produces exactly the same release type from Task 1.

- [ ] **Step 1: Write RED with repository order deliberately shuffled**

Create an in-memory persistence backend fixture containing one version, segments, nodes and links in non-canonical insertion order.

Assert:
- exporter loads only the requested version;
- sorts semantic collections deterministically;
- validates the existing domain graph before release;
- output footprint equals the pure builder fixture.

- [ ] **Step 2: Run RED**

Run: `npm test -- --run src/__tests__/curricolo-verticale-repository-export-v1.test.ts`
Expected: FAIL module missing.

- [ ] **Step 3: Implement exporter using existing repositories**

Use:
- `InstituteCurriculumVersionRepository.getById()`;
- `CurriculumSegmentRepository.listByVersion()`;
- `CurriculumNodeRepository.listByVersion()`;
- `VerticalCurriculumLinkRepository.listByVersion()`.

Do not read UI state or legacy `curriculumKB` as authority when productive version data exists.

- [ ] **Step 4: Reject graph, perimeter or planning-usability incompleteness before serialization**

Return/throw a typed release validation error; do not emit a superficially complete package.

- [ ] **Step 5: Run GREEN**

Run focused test; then `npm test -- --run src/__tests__/curriculum-domain/curriculum-domain.test.ts`.
Expected: PASS.

- [ ] **Step 6: Commit**

Commit: `feat(curricolo): export productive vertical version`

### Task 3: Institutional perimeter adapter

**Files:**
- Create: `src/domain/transfer/curricoloVerticalePerimeterV1.ts`
- Create: `src/__tests__/curricolo-verticale-perimeter-v1.test.ts`
- Modify only the productive Arena session/application adapter that currently selects institute/version context; identify exact caller before editing.

**Interfaces:**
- `buildCurricoloVerticalePerimeterV1(...)` returns expected scopes and intentional N/A scopes from Arena-owned institutional configuration/source profile.
- Must not infer “complete” merely by enumerating persisted segments.

- [ ] **Step 1: RED for a source profile that expects a missing primary segment**

Assert manifest becomes `INCOMPLETE`.

- [ ] **Step 2: RED for infancy field scoped at school-level**

Assert no grade placeholder is generated.

- [ ] **Step 3: Implement adapter against Arena-owned scope/profile**

If execution-time inspection shows no single authoritative perimeter object yet, stop and add the smallest Arena-owned perimeter projection from the current version configuration; do not hard-code Docente OS expectations inside Arena.

- [ ] **Step 4: Run focused tests**

Run: `npm test -- --run src/__tests__/curricolo-verticale-perimeter-v1.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

Commit: `feat(curricolo): derive governed institute perimeter`

### Task 4: Export surface and cross-contract qualification

**Files:**
- Modify: the existing Arena export/download surface discovered from current main (do not create a second export UX if one exists).
- Test: extend existing export/preflight tests, including `src/__tests__/c2p-golden-path-preflight-v1.test.ts` only for regression, not by changing its legacy contract.

**Interfaces:**
- Human action produces serialized `TRAMA_CURRICOLO_VERTICALE_RELEASE_V1` file/package.
- Legacy class-context handoff remains available until Docente OS migration is complete.

- [ ] **Step 1: Write RED that asks the existing export surface for the vertical package**

Assert:
- target product Docente OS;
- package is preview/adoption candidate, not remote write;
- version/perimeter/authority visible before export.

- [ ] **Step 2: Implement one additive export option/action**

No automatic push.

- [ ] **Step 3: Run existing interop regression tests**

Run:
`npm test -- --run src/__tests__/interop-runtime-binding-v2.test.ts src/__tests__/interop-runtime-context-scope.test.ts src/__tests__/curriculum-release-contract-v1.test.ts src/__tests__/c2p-golden-path-preflight-v1.test.ts`
Expected: all PASS unchanged in meaning.

- [ ] **Step 4: Run full Arena test suite and build**

Run: `npm test`
Run: `npm run build`
Expected: PASS.

- [ ] **Step 5: Validate an emitted fixture against the TRAMA JSON Schema**

Use the exact schema commit recorded by the master plan; expected no schema errors.

- [ ] **Step 6: Commit and record exact Arena head**

Commit: `feat(curricolo): expose vertical release for Docente OS adoption`
