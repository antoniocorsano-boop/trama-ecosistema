# VPC-01 — Visual Preflight Compiler v0.1

**Status:** PROPOSED DESIGN / HUMAN REVIEW REQUIRED  
**Date:** 2026-10-05  
**Applies to:** TRAMA · Studio Atlas · Visual Factory v0.2 · VF-ORCH-01  
**Baseline:** `main@1f750393d9df6ad1a93bd6567e94d6a4cbbd4adf` / Audit v1.4  
**Runtime/publication/student authority:** NOT GRANTED  
**Cost doctrine:** NO IMAGE-PROVIDER CALL BEFORE PREFLIGHT PASS

## 1. Purpose

VPC-01 moves visual reasoning, critique and prompt refinement **before** any scarce image-generation call.

The current Visual Factory has already proven a governed FREE_ONLY real reference-generation path. Audit v1.4 also proves that technical generation success is not the same as visual acceptance: the first real canonical references required art-direction remediation and regeneration before Human Visual Review/reference lock could succeed.

The remaining product bottleneck is therefore not provider discovery or compute orchestration. It is the quality and completeness of the generation instruction before inference begins.

VPC-01 changes the production model from:

`idea → free-form prompt → image → visual rejection → prompt edit → image → ...`

into:

`approved story/world/storyboard → canonical visual specification → deterministic lint → zero-cost semantic critique when available → provider-specific prompt compilation → preflight receipt → one bounded generation attempt → Human Visual Review`

The image provider becomes an execution backend. It is not the place where TRAMA discovers composition, narrative function, continuity, forbidden patterns or quality criteria.

## 2. Shared understanding and success criteria

The intended outcome is a Visual Factory that can sustain high visual quality without consuming scarce free-provider quotas through aesthetic trial-and-error.

VPC-01 is successful when:

1. every canonical visual job originates from a structured visual specification rather than a hand-written provider prompt;
2. narrative purpose, subject identity, environment continuity, composition, camera, lighting, required visual facts and forbidden patterns are explicit before generation;
3. contradictions and missing constraints fail before any provider call;
4. the five canonical MUSEO ZERO references — Lia, Omar, Teo, Sala Zero and Cabina regia — act as the first regression/qualification corpus;
5. provider-specific prompts are deterministic compiled artifacts with stable digests;
6. an optional local semantic critic may improve or reject a specification without calling a remote paid/token API;
7. absence of the local critic never silently degrades quality: it yields deterministic-only review plus an explicit human preflight requirement where necessary;
8. VF-ORCH-01 may execute a canonical job only when a valid preflight receipt is attached;
9. canonical generation defaults to one visual variant per approved instruction; provider fallback may recover technical failure but may not trigger automatic aesthetic retries;
10. Human Visual Review and reference lock remain authoritative after generation;
11. no part of VPC-01 grants runtime, publication, learner or student authority.

## 3. Architectural decision

### 3.1 Selected approach — first-class TRAMA Visual Preflight Compiler

Implement the preflight layer as a native Studio Atlas / Visual Factory domain component with stable contracts and deterministic compilation.

External/open-source tools may support development and evaluation, but they do not become the authoritative production contract.

Canonical flow:

`Controlled Storyboard`
`→ VisualIntentSpec`
`→ deterministic lint + cross-reference checks`
`→ optional LocalSemanticCritic`
`→ PromptCompiler(provider family)`
`→ VisualPreflightReceipt`
`→ VisualGenerationPlan`
`→ VF-ORCH-01`
`→ provider`
`→ VisualExecutionReceipt`
`→ Human Visual Review`

### 3.2 Promptfoo-only approach — rejected as architecture

Promptfoo is useful as an open-source local/CI evaluation harness for prompt regression, assertions and matrix comparison. It is not the canonical domain model because:

- it should not own TRAMA story/world/reference authority;
- a generic evaluation configuration is weaker than typed Visual Factory contracts;
- production should not depend on a development evaluation framework being present;
- the same compiler must remain callable directly from Studio Atlas and tests.

Decision: Promptfoo may be introduced as a **development/qualification harness**, not as runtime authority.

### 3.3 Mandatory local-LLM approach — rejected for v0.1

A local model can add useful semantic critique, but making it mandatory would introduce browser/WebGPU compatibility, model-download, cache, memory and CI-duration risks before the deterministic compiler is proven.

Decision: local semantic critique is a replaceable adapter. Deterministic preflight is mandatory; semantic critic availability is explicit.

## 4. Product doctrine

### 4.1 Specification first, prompt second

The provider prompt is not source material. It is a compiled derivative of a governed visual specification.

Editing a generated prompt directly is not a canonical production action. Desired changes must be expressed in the source specification and recompiled.

### 4.2 One semantic attempt, bounded technical fallback

For canonical references and shots:

- default `maxVariants = 1` after preflight PASS;
- no automatic “try another style” behaviour;
- no automatic prompt mutation after a visually poor result;
- VF-ORCH-01 may use another eligible provider only for bounded technical/provider failure while preserving the same preflight-qualified semantic instruction;
- a visual rejection returns to the specification/review layer, not to an unbounded generation loop.

### 4.3 Quality constraints are data

The following must be representable as structured data rather than buried in prose:

- identity anchors;
- narrative function;
- learner-visible action/consequence;
- world anchors;
- composition hierarchy;
- camera language;
- environment facts;
- lighting/mood;
- continuity references;
- forbidden tropes;
- text/signage restrictions;
- age-dignity constraints;
- accessibility-relevant visual facts;
- provider-independent success criteria.

## 5. Canonical contracts

### 5.1 `VisualIntentSpec`

Proposed schema identity:

`atlas.visual-intent-spec/v0.1`

Required fields:

- `specId`
- `pathwayId`
- `packageDigest`
- `purpose`: `CHARACTER_REFERENCE | ENVIRONMENT_REFERENCE | SCENE_FRAME`
- `subjectRefs[]`
- `sceneRef?`
- `shotId?`
- `narrativeFunction`
- `requiredVisualFacts[]`
- `worldAnchors[]`
- `identityAnchors[]`
- `composition`
  - `dominantSubject`
  - `foreground[]`
  - `midground[]`
  - `background[]`
  - `spatialRelation`
- `camera`
  - `shotScale`
  - `viewpoint`
  - `lensLanguage`
  - `continuityFamily?`
- `lightingMood`
- `materialTextureLanguage[]`
- `interactionState?`
- `continuityRefs[]`
- `negativeConstraints[]`
- `forbiddenTextPatterns[]`
- `qualityCriteria[]`
- `targetAspectRatio`
- `artDirectionVersion`

The schema contains semantic production facts only. It must not contain provider credentials, provider quota state or publication authority.

### 5.2 `VisualPreflightFinding`

Each check returns a typed finding:

- `code`
- `severity`: `ERROR | WARNING | INFO`
- `dimension`
- `message`
- `sourcePath?`
- `suggestedResolution?`
- `checkerVersion`

### 5.3 `VisualPreflightReceipt`

Proposed schema identity:

`atlas.visual-preflight-receipt/v0.1`

Fields:

- `receiptId`
- `specId`
- `packageDigest`
- `specDigest`
- `compilerVersion`
- `artDirectionVersion`
- `deterministicChecks`
- `semanticCritic`
  - `mode`: `LOCAL_BROWSER | LOCAL_CI | NOT_AVAILABLE`
  - `modelRef?`
  - `modelDigest?`
  - `result`: `PASS | REVISE | NOT_RUN`
  - `findings[]`
- `humanPreflightRequired`
- `humanPreflightDecision?`: `PASS | REVISE`
- `compiledPrompts[]`
- `finalState`: `PREFLIGHT_PASS | PREFLIGHT_REVISE`
- authority flags fixed to false

A receipt is valid only for the exact `specDigest`, `compilerVersion`, `artDirectionVersion` and package digest. Any source change invalidates it.

### 5.4 `CompiledVisualPrompt`

Provider-specific compiled output:

- `providerFamily`
- `workflowFamily`
- `positivePrompt`
- `negativePrompt`
- `referenceInputs[]`
- `aspectRatio`
- `maxVariants: 1`
- `promptDigest`
- `sourceSpecDigest`
- `compilerVersion`

No provider adapter may invent semantic content not present in `VisualIntentSpec`.

## 6. Deterministic preflight

Deterministic checks are the mandatory v0.1 core and run without network/API/model access.

### 6.1 Structural completeness

Reject when required fields are absent or empty.

Examples:

- character reference without identity anchors;
- environment reference without world anchors/spatial relation;
- scene frame without narrative function;
- shot using a subject without continuity reference after that subject is locked;
- F1–F6 without scene/shot identifiers.

### 6.2 Contradiction checks

Reject mechanically detectable conflicts, including:

- required text and forbidden text simultaneously;
- day/night or interior/exterior contradictions;
- incompatible subject-presence requirements;
- mutually exclusive camera instructions;
- locked identity anchor contradicted by new instruction;
- a scene described as diegetic while requesting a detached dashboard as dominant surface.

### 6.3 MUSEO ZERO quality invariants

Initial hard/soft rules include:

- no dashboard/SaaS-card aesthetic as dominant composition;
- no floating avatar-head composition;
- no chibi/mascot treatment;
- no generic cyberpunk-neon default;
- no technical diagram as dominant scene;
- no large educational captions;
- no decorative AI clutter;
- character-present scene must identify physical placement and action;
- environment reference must express believable spatial depth and architecture;
- Cabina regia must remain physically connected to the museum world, not become an abstract control panel;
- Sala Zero must remain a narrative physical space;
- F2/F3/F6 must declare continuity family and preserve threshold/spatial logic;
- F4/F5 must declare same control-surface continuity family and one bounded state change.

### 6.4 Prompt-risk lint

Warn/reject prompt structures known to create ambiguity or dilution:

- long unprioritised adjective chains;
- repeated conflicting style terms;
- unnamed pronoun references;
- implicit spatial relations that should be explicit;
- too many simultaneous focal actions;
- negative constraints duplicated as positive goals;
- instructions to render legible interface text when exact text is not necessary;
- provider-specific syntax in the canonical spec.

The lint validates instruction quality, not image quality.

## 7. Local semantic critic

### 7.1 Role

The semantic critic does not generate images and does not own art direction. It reviews the structured specification for issues difficult to detect with deterministic rules:

- unclear narrative hierarchy;
- likely visual ambiguity;
- insufficient identity distinctiveness;
- weak relationship between action and visible consequence;
- scene drifting toward a promotional/landing-page composition;
- under-specified spatial relationships;
- redundant or low-value prompt content.

### 7.2 Zero-cost implementations

V0.1 defines an interface rather than a single mandatory engine.

Preferred order for qualification experiments:

1. `LOCAL_BROWSER`: pinned open model executed locally in the author browser through a WebGPU-capable runtime;
2. `LOCAL_CI`: pinned quantized small model on a standard public GitHub Actions runner, only if runtime/memory/download measurements are acceptable;
3. `NOT_AVAILABLE`: no silent PASS; deterministic findings remain authoritative and `humanPreflightRequired=true` for canonical jobs needing semantic review.

No OpenAI/Anthropic/Google/other paid or token-metered remote API belongs to VPC-01.

### 7.3 Output discipline

The critic returns structured findings only. It may propose field-level amendments, but it may not directly rewrite the provider prompt as an opaque string.

Any accepted proposal modifies `VisualIntentSpec`, invalidates the previous receipt and triggers deterministic revalidation/recompilation.

## 8. Prompt compiler

The compiler is deterministic for a given:

`VisualIntentSpec + providerFamily + compilerVersion + artDirectionVersion`.

Compilation order:

1. medium/style family;
2. narrative/world context;
3. subject identity anchors;
4. required action/state;
5. spatial composition;
6. camera language;
7. lighting/material language;
8. continuity instructions;
9. provider-adaptation hints;
10. negative constraints.

Provider adapters may change syntax/order/weighting but not meaning.

Initial provider families remain compatible with the existing allowlisted FLUX.2 Klein 4B workflow used by VF-ORCH-01.

## 9. Generation gate integration

`VisualGenerationPlan` is extended with:

- `preflightReceiptId`
- `preflightSpecDigest`
- `compiledPromptDigest`
- `preflightState: PREFLIGHT_PASS`

`compileReferenceJobs` and `compileShotJobs` may no longer emit executable canonical jobs directly from hard-coded free-form prompts.

They must:

1. load/derive the relevant `VisualIntentSpec`;
2. obtain a valid `VisualPreflightReceipt`;
3. verify exact digests/version alignment;
4. copy only the corresponding compiled prompt into the generation job;
5. set `maxVariants = 1`;
6. fail closed when the receipt is absent/stale/REVISE.

VF-ORCH-01 remains responsible for compute/provider eligibility and technical fallback. VPC-01 does not duplicate quota or provider routing logic.

## 10. State machine

Proposed preflight states:

`SPEC_DRAFT`
→ `DETERMINISTIC_REVIEW`
→ `SEMANTIC_REVIEW` or `HUMAN_PREFLIGHT_REVIEW`
→ `PREFLIGHT_REVISE` or `PREFLIGHT_PASS`
→ existing Visual Factory generation state

Transitions:

- any `ERROR` → `PREFLIGHT_REVISE`;
- semantic critic `REVISE` → `PREFLIGHT_REVISE`;
- semantic critic unavailable on a canonical job that requires semantic evaluation → `HUMAN_PREFLIGHT_REVIEW`;
- deterministic PASS + semantic PASS → `PREFLIGHT_PASS`;
- deterministic PASS + required human preflight PASS → `PREFLIGHT_PASS`;
- any source/art-direction/compiler version change invalidates PASS.

Human Visual Review remains after image generation and is not replaced by human preflight review.

## 11. MUSEO ZERO golden qualification corpus

The first corpus is exactly:

1. Lia — canonical character reference;
2. Omar — canonical character reference;
3. Teo — canonical character reference;
4. Sala Zero — canonical environment reference;
5. Cabina regia — canonical environment reference.

After reference lock, F1–F6 become the continuity corpus.

For each fixture store:

- canonical input spec;
- expected deterministic findings;
- expected PASS/REVISE state;
- compiled-prompt snapshot/digest;
- mutation cases that must fail;
- art-direction version.

The corpus tests the compiler. It does not substitute for generated-image Human Visual Review.

## 12. Prompt evaluation harness

Promptfoo may be added under a repository-local development/qualification directory to provide:

- regression matrices;
- declarative assertions;
- comparison of compiler versions;
- custom deterministic evaluators;
- optional local-model evaluation;
- CI-readable reports.

Rules:

- no Promptfoo cloud sharing required;
- no remote LLM provider required by the canonical test suite;
- no secrets required for deterministic qualification;
- Promptfoo failure may block compiler qualification but does not become a new governance authority;
- the native TypeScript tests remain sufficient to validate core contracts even if Promptfoo is removed later.

## 13. Evidence

Each preflight qualification records:

- package/spec/prompt digests;
- compiler and art-direction versions;
- deterministic findings;
- semantic critic mode/model/digest when used;
- human preflight decision when required;
- compiled provider prompt digest;
- final preflight state;
- creation timestamp;
- authority flags all false.

Generation evidence remains in the existing VisualExecutionReceipt/VF-ORCH evidence path.

This creates a traceable chain:

`story/world/storyboard`
→ `VisualIntentSpec digest`
→ `preflight receipt`
→ `compiled prompt digest`
→ `generation receipt`
→ `asset SHA-256`
→ `Human Visual Review`
→ `reference lock`.

## 14. Security, privacy and authority

VPC-01:

- processes no student identity;
- adds no student tracking or telemetry;
- stores no provider credential client-side;
- grants no curriculum authority;
- grants no publication/runtime authority;
- grants no reference lock automatically;
- never authorizes paid compute;
- never silently calls a remote language or image model during deterministic CI.

Local semantic model assets must be pinned and provenance-recorded if/when enabled.

## 15. Error handling

Representative fail-closed errors:

- `VISUAL_PREFLIGHT_SPEC_INVALID`
- `VISUAL_PREFLIGHT_CONTRADICTION`
- `VISUAL_PREFLIGHT_IDENTITY_INCOMPLETE`
- `VISUAL_PREFLIGHT_WORLD_INCOMPLETE`
- `VISUAL_PREFLIGHT_STALE_RECEIPT`
- `VISUAL_PREFLIGHT_COMPILER_VERSION_MISMATCH`
- `VISUAL_PREFLIGHT_ART_DIRECTION_VERSION_MISMATCH`
- `VISUAL_PREFLIGHT_SEMANTIC_REVIEW_REQUIRED`
- `VISUAL_PREFLIGHT_NOT_PASSED`
- `VISUAL_PREFLIGHT_PROMPT_DIGEST_MISMATCH`

A preflight error preserves authoring state and performs zero image-provider calls.

## 16. Testing strategy

Implementation must use real TDD RED → GREEN.

### Contract tests

- schema-valid VisualIntentSpec accepted;
- incomplete/contradictory specs rejected;
- stale receipt rejected;
- digest changes invalidate receipt;
- authority flags remain false.

### Compiler tests

- same input/version produces identical prompt/digest;
- provider adaptation preserves semantic facts;
- no provider-only syntax leaks into canonical spec;
- `maxVariants` fixed to one for canonical jobs.

### MUSEO ZERO regression tests

- five canonical references PASS expected invariant set;
- deliberate landing-page/dashboard mutations fail;
- identity-anchor removal fails;
- Sala Zero spatial-depth removal fails;
- Cabina regia detached-dashboard mutation fails;
- F2/F3/F6 continuity mutation fails after shot corpus is enabled.

### Integration tests

- no VisualGenerationPlan canonical job without valid preflight receipt;
- exact preflight prompt digest reaches executor;
- VF-ORCH provider fallback cannot mutate prompt semantics;
- no provider fetch occurs when preflight fails;
- Human Visual Review/reference lock behaviour remains unchanged.

### Optional local semantic critic qualification

Before any adapter becomes an accepted default, measure:

- model download size/cache behaviour;
- wall-clock latency;
- peak memory;
- deterministic/structured-output reliability;
- false-positive/false-negative rate on golden/mutation fixtures;
- browser compatibility or CI runner reliability.

The adapter is not promoted merely because it is free.

## 17. Migration from current v0.2

Current `MUSEO_ZERO_VISUAL_SUBJECTS`, `MUSEO_ZERO_SHOTS` and `COMMON_NEGATIVE` contain useful canonical knowledge embedded inside free-form prompt strings.

Migration sequence:

1. extract those facts into typed VisualIntentSpec fixtures;
2. preserve current art-direction v0.3 remediation intent;
3. introduce deterministic compiler/lint without changing provider routing;
4. prove prompt snapshots/digests on five references;
5. wire preflight receipt into reference-job compilation;
6. regenerate the five references only after preflight PASS;
7. perform Human Visual Review/reference lock;
8. extend the same mechanism to F1–F6;
9. only then evaluate whether the optional local semantic critic materially improves the rejection rate before generation.

This avoids another infrastructure detour before the product proof.

## 18. Explicit non-goals

VPC-01 does not:

- replace VF-ORCH-01;
- add new image providers;
- increase free-provider quota;
- guarantee that every generated image passes Human Visual Review;
- auto-approve reference locks;
- create a second storytelling system;
- redesign Studio Atlas UI beyond the minimum preflight surface;
- introduce paid inference;
- introduce student identity or telemetry;
- authorize Atlas runtime/publication;
- solve S5/S6 Studio Atlas durability/deployment.

## 19. Acceptance criteria

VPC-01 implementation is complete only when all are true:

1. typed VisualIntentSpec and VisualPreflightReceipt contracts exist;
2. deterministic linter/compiler are covered by tests;
3. five canonical MUSEO ZERO references are migrated from prompt strings to specs;
4. known bad mutations are rejected before generation;
5. compiled prompts are reproducible and digest-bound;
6. canonical generation plan cannot be produced without current PREFLIGHT_PASS;
7. canonical maxVariants is one;
8. VF-ORCH-01 provider selection/fallback remains unchanged in authority and boundedness;
9. preflight failure proves zero image-provider invocation in tests;
10. generation receipt can be traced back to exact preflight/spec/prompt digests;
11. Human Visual Review and reference lock remain mandatory;
12. full existing Studio Atlas / Visual Factory / governance suites remain PASS.

## 20. Recommended v0.1 implementation boundary

Implement now:

- contracts;
- deterministic linter;
- deterministic prompt compiler;
- receipt/digest logic;
- five-reference golden corpus and mutation tests;
- generation-plan gate;
- minimal Studio Atlas preflight status surface;
- repository-local evaluation configuration only where it adds regression value.

Defer behind an adapter boundary until measured:

- mandatory WebGPU local critic;
- mandatory CI CPU local model;
- large model downloads in normal CI;
- automated prompt rewriting;
- model-generated visual art-direction decisions.

This boundary captures the economic benefit immediately: the Visual Factory stops spending scarce image quota on defects that can be detected from the instruction itself, while keeping future local semantic critique available without making it a prerequisite for the first useful release.
