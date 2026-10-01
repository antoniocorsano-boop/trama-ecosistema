# CAP-DOS-ARGO-SYNC — G3 Specification v1

**Lifecycle:** G3 — Specification  
**Status:** IN_PROGRESS / REVIEWABLE  
**Runtime:** NOT_AUTHORIZED  
**Governance basis:** TRAMA-ADR-020 APPROVED  
**Owning product:** Docente OS

## 1. Capability goal

A teacher who has completed and consolidated the annual didactic programming for a class and subject must be able to generate, from Docente OS, an Argo-compatible `.xls` file for manual upload into didUP.

The capability must be teacher-facing, not tool-facing.

The teacher must not need to know about BIFF8, CDFV2, LibreOffice internals, workbook profiles or mapping rules.

## 2. Primary user journey

```text
Annual programming
→ teacher completes modules and arguments
→ teacher consolidates programming
→ "Prepara file per Argo" becomes available
→ preview and validation
→ generate Argo-compatible .xls
→ teacher manually imports file in Argo
→ teacher verifies result in Argo
→ teacher confirms import in Docente OS
→ synchronization baseline advances
```

## 3. Entry point

The capability MUST be available inside the annual programming surface for a specific:

- school year;
- class;
- subject.

Primary action label:

**Prepara file per Argo**

The action MUST NOT be presented as a generic technical utility detached from the programming workflow.

## 4. Availability rule

### Before consolidation

State:

`DRAFT`

Behavior:
- teacher may edit freely;
- optional preview may be available;
- definitive Argo file generation is disabled or clearly marked as non-final.

### After consolidation

State:

`CONSOLIDATED`

Behavior:
- `Prepara file per Argo` is enabled;
- the system validates the complete annual program;
- the teacher can review what will be exported.

### If programming changes after consolidation

State:

`CHANGED_SINCE_CONSOLIDATION`

Behavior:
- any previously generated artifact is marked `SUPERSEDED`;
- the teacher must reconsolidate before generating a new definitive Argo file;
- previous confirmed synchronization baseline is not altered.

## 5. State model

```text
DRAFT
  ↓ consolidate
CONSOLIDATED
  ↓ prepare
READY_FOR_ARGO
  ↓ generate
ARGO_FILE_GENERATED
  ↓ manual import outside Docente OS
AWAITING_IMPORT_CONFIRMATION
  ↓ teacher confirms verified result
SYNC_CONFIRMED
```

Exceptional states:

```text
VALIDATION_BLOCKED
GENERATION_FAILED
IMPORT_FAILED
IMPORT_RESULT_UNKNOWN
SUPERSEDED
CONFLICT
```

### State transition rules

- `DRAFT → CONSOLIDATED`: explicit teacher action.
- `CONSOLIDATED → READY_FOR_ARGO`: validation passes.
- `READY_FOR_ARGO → ARGO_FILE_GENERATED`: artifact generated successfully.
- `ARGO_FILE_GENERATED → AWAITING_IMPORT_CONFIRMATION`: artifact delivered to teacher.
- `AWAITING_IMPORT_CONFIRMATION → SYNC_CONFIRMED`: explicit teacher confirmation after checking Argo.
- any content edit after `CONSOLIDATED` invalidates readiness and moves to `CHANGED_SINCE_CONSOLIDATION`.
- no automatic transition to `SYNC_CONFIRMED`.

## 6. Initial annual export scope

Version 1 MUST support a complete initial export of the consolidated annual program.

Output scope:

```text
class
subject
modules[]
  order
  description
  arguments[]
    order
    description
    performedStatus?
    performedAt?
```

For a newly prepared annual program, the default package mode is:

`FULL_PROGRAM_INITIAL_EXPORT`

This is the safe primary use case established by current evidence.

## 7. Subsequent update scope

The canonical model and delta contract support incremental comparison.

However, because changed-record update semantics in Argo are not yet fully evidenced, version 1 MUST distinguish:

- `FULL_PROGRAM_INITIAL_EXPORT` — enabled when appropriate;
- `DELTA_REVIEW` — enabled for teacher review;
- `DELTA_PACKAGE` — disabled unless the active Argo profile explicitly proves safe update semantics.

No hidden fallback to full re-import is allowed.

## 8. Export preview

Before generation, the teacher must see a readable summary including:

- class;
- subject;
- school year;
- number of modules;
- number of arguments;
- warnings/conflicts;
- whether the package is initial full export or later synchronization candidate.

The preview SHOULD allow expansion by module.

The preview MUST not expose technical workbook internals by default.

A technical-details disclosure MAY show:
- adapter/profile version;
- artifact format;
- validation status;
- digest.

## 9. Validation rules

Generation is blocked when:

- no consolidated programming exists;
- module description is missing;
- argument description is missing;
- unsupported state value is present;
- workbook profile cannot be selected safely;
- unresolved conflict exists;
- canonical model is stale relative to consolidation;
- active adapter/profile is unknown or unsupported.

Warnings that do not block generation must be explicitly distinguished from blocking errors.

## 10. Argo artifact contract

Output MUST satisfy the active versioned Argo profile.

Current candidate constraints:

- file extension: `.xls`;
- LibreOffice-compatible production;
- observed worksheet: `Dati`;
- fields:
  - `ORD. MODULO`;
  - `MODULO`;
  - `ORD. ARGOMENTO`;
  - `ARGOMENTO`;
  - `STATO SVOLGIMENTO`;
  - `DATA SVOLGIMENTO`.

The implementation MUST NOT generate a renamed `.xlsx`.

The artifact MUST NOT contain:
- macros;
- formulas not required by the profile;
- student data;
- hidden user metadata not required for interoperability.

## 11. State mapping

Canonical performed states:

```text
NOT_PERFORMED
PARTIALLY_PERFORMED
PERFORMED
UNKNOWN
```

Argo-facing literals:

```text
NOT_PERFORMED       → Non Svolto
PARTIALLY_PERFORMED → Parzialmente Svolto
PERFORMED           → Svolto
UNKNOWN             → blank or validation block according to profile rule
```

The profile MUST preserve raw literals where imported evidence is involved.

## 12. Date mapping

Teacher-facing canonical date uses an actual date type.

Argo-facing representation is profile-controlled.

Current documented display format:

`DD-MM-YYYY`

The implementation MUST NOT infer that display format equals binary storage type.

## 13. Order handling

Order is a semantic ordering value, not entity identity.

Rules:
- stable IDs survive reorder;
- row number MUST NOT become identity;
- raw source order values are retained in provenance when imported;
- numeric normalization is allowed only when the source value is demonstrably numeric.

## 14. Artifact identity

Every generated artifact must bind to:

```text
artifactId
programId
programVersion
consolidationVersion
adapterProfileVersion
generatedAt
artifactSha256
deltaDigest?
packageMode
```

The artifact digest MUST be available to the synchronization receipt.

## 15. Sync receipt

A synchronization receipt must record at least:

```text
syncId
programId
classRef
subjectRef
schoolYear
baselineVersion
programVersion
artifactId
artifactSha256
adapterProfileVersion
packageMode
generatedAt
importConfirmationState
confirmedAt?
result
```

Candidate result states:

```text
PREPARED
AWAITING_CONFIRMATION
CONFIRMED
FAILED
UNKNOWN
SUPERSEDED
```

## 16. Baseline advancement

The confirmed synchronization baseline advances only when:

1. the teacher has imported the exact generated artifact;
2. the teacher has verified the result in Argo;
3. the teacher explicitly confirms success in Docente OS;
4. the confirmation binds to the exact artifact/delta digest;
5. the local programming state has not changed since generation.

If any condition fails, baseline does not advance.

## 17. Teacher confirmation

After generating the file, Docente OS must show:

**Hai importato e verificato questo file in Argo?**

Actions:

- `Conferma importazione riuscita`
- `Segnala problema`
- `Non ancora`

No default affirmative selection is allowed.

## 18. Failure and recovery states

### Validation blocked

Show:
- blocking reason;
- affected module/argument;
- direct path back to fix it.

### Generation failed

Show:
- explicit failure;
- no false ready state;
- retry action when safe.

### Import failed

Teacher can record:
- import rejected;
- partial/unknown outcome;
- duplicate/unexpected behavior.

Baseline remains unchanged.

### Unknown outcome

State:

`IMPORT_RESULT_UNKNOWN`

No automatic retry or baseline promotion.

### Superseded artifact

If programming changes after generation:

- artifact remains in history;
- it is marked `SUPERSEDED`;
- confirmation is blocked unless revalidated against the current state.

## 19. Perceptible feedback

Every user-initiated state-changing action must expose:

- intention;
- in-progress state when asynchronous;
- success or failure;
- resulting state;
- next action.

This includes:
- consolidate;
- prepare;
- generate;
- confirm import;
- report import problem.

## 20. Accessibility requirements

At minimum:

- full keyboard operation;
- WCAG 2.2 AA target;
- no state conveyed by color alone;
- accessible names for all actions;
- screen-reader announcement for validation/generation result;
- table/diff semantics for modules and arguments;
- conflict/error focus management;
- visible focus;
- accessible technical-details disclosure;
- bulk review controls with clear scope.

## 21. Privacy and minimization

The v1 artifact contains no student-personal data.

Any future field that introduces student data invalidates this privacy assumption and requires governance reopening.

## 22. Performance requirements

For a normal annual program:

- preview must feel immediate under ordinary classroom-network conditions;
- validation must not require network access to Argo;
- generation must be deterministic for the same canonical state/profile;
- repeated generation of identical input must produce semantically identical output and stable metadata rules.

Exact numeric performance budgets are deferred to implementation benchmarking in G5/G6.

## 23. Offline/network behavior

Argo file preparation SHOULD not require an active Argo session.

If Docente OS supports local/offline preparation, generation MAY operate without network access as long as the active adapter profile is already available and current.

Import into Argo remains external and manual.

## 24. Security requirements

- no Argo credentials stored;
- no browser automation;
- no direct external write;
- generated files contain no macros;
- generated files contain no active external links;
- imported source files, if future support is added, are untrusted input and require validation;
- unknown workbook profiles fail closed.

## 25. UX copy baseline

Primary labels:

- `Consolida programmazione`
- `Prepara file per Argo`
- `Genera file .xls per Argo`
- `Conferma importazione riuscita`
- `Segnala problema`
- `Rigenera dopo le modifiche`

Avoid technical labels such as:
- BIFF8;
- CDFV2;
- adapter digest;
- workbook profile

in the primary teacher flow.

## 26. Acceptance criteria

### AC-01 — Action appears at the correct moment

Given a class/subject annual programming in `DRAFT`,  
when it is explicitly consolidated,  
then `Prepara file per Argo` becomes available.

### AC-02 — No definitive export from stale programming

Given consolidated programming,  
when any module/argument is edited,  
then the state becomes `CHANGED_SINCE_CONSOLIDATION` and a previously generated artifact is marked `SUPERSEDED`.

### AC-03 — Full initial export

Given valid consolidated programming with no confirmed prior Argo baseline,  
when the teacher prepares the Argo file,  
then the package mode is `FULL_PROGRAM_INITIAL_EXPORT`.

### AC-04 — Teacher preview

Before generation, the teacher can inspect class, subject, year, module count, argument count and any warnings/conflicts.

### AC-05 — Valid file contract

Generated artifact uses the active LibreOffice-compatible `.xls` profile and is not a renamed XLSX.

### AC-06 — No student data

The generated artifact contains no student-personal data.

### AC-07 — Human import boundary

Generating the file does not perform any write to Argo.

### AC-08 — Explicit confirmation

Baseline cannot advance without explicit teacher confirmation after external verification.

### AC-09 — Exact artifact binding

Confirmation binds to the exact artifact hash/version that the teacher generated.

### AC-10 — Failure does not masquerade as success

Generation/import failure leaves the previous confirmed baseline unchanged and provides recovery guidance.

### AC-11 — Idempotent exact state

Repeated preparation from the same consolidated program/profile does not create a new semantic delta.

### AC-12 — Accessibility

The complete prepare/generate/confirm flow is keyboard-operable and exposes state changes to assistive technology.

### AC-13 — Hidden technical complexity

A teacher can complete the flow without knowledge of XLS internals.

### AC-14 — No unsafe delta package

If safe changed-record semantics are not proven for the active profile, `DELTA_PACKAGE` is unavailable and the UI explains the limitation without silently performing a full re-import.

## 27. G3 Definition of Done assessment

- [x] functional requirements are testable;
- [x] non-functional requirements are testable;
- [x] states and transitions are defined;
- [x] data model/ownership are defined at specification level;
- [x] contracts/interfaces are versioned conceptually;
- [x] failure/empty/waiting/recovery states are specified;
- [x] perceptible feedback is specified;
- [x] privacy/minimization requirements appear in acceptance criteria;
- [x] accessibility requirements appear in acceptance criteria;
- [x] acceptance criteria trace to approved G2 governance and G1 evidence;
- [ ] exact generated-workbook conformance validator remains to be defined as a versioned contract artifact;
- [ ] UX interaction specification remains for G4.

## 28. Current G3 assessment

**IN_PROGRESS / CORE PRODUCT SPECIFICATION COMPLETE.**

The teacher-facing capability, states, boundaries and acceptance criteria are now explicit.

Next specification artifact:
- versioned `ARGO_PROGRAM_XLS_PROFILE_v1` conformance contract and validator expectations.

No runtime is authorized by this specification.
