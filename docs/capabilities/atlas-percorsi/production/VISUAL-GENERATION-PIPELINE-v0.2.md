# Studio Atlas / Visual Factory — Visual Generation Pipeline v0.2

**Status:** PROPOSED_IMPLEMENTABLE_PIPELINE / HUMAN_REVIEW_REQUIRED  
**Runtime:** NOT_AUTHORIZED  
**Purpose:** make Studio Atlas produce character-driven visual assets and scene frames, rather than simulate them with UI.

## Product correction

The learner-facing surface must not be a landing page or a dashboard pretending to be a story.

Studio Atlas must produce the visual world itself:

`story → visual bible → character/environment reference lock → shot plan → generation → continuity review → scene composition`

The product runtime then composes approved visual assets with bounded interaction.

## Selected production architecture

### Authoring / orchestration
- Studio Atlas owns the Visual Bible and shot intent.
- Visual Factory compiles deterministic generation jobs.
- The generation contract is provider-neutral and does not expose cloud/model credentials to the browser.
- ComfyUI remains a candidate canonical workflow engine for governed GPU execution and deeper controlled editing.
- Hugging Face Gradio/ZeroGPU is the first opportunistic pilot executor adapter.
- Execution provider remains replaceable.

### Model family — v0.2

Visual Factory v0.2 uses one primary open model family:

**FLUX.2 [klein] 4B**
- reference candidates: text-to-image;
- production scenes: native image-conditioned / multi-reference generation;
- character and environment reference images are mandatory inputs for recurring production scenes;
- the same locked Lia/Sala Zero references are reused where continuity requires them;
- pose/depth/edge controls remain optional future refinements, not prerequisites for the first qualification slice.

Using one model family for both stages reduces model-switch drift between reference sheets and production scenes.

FaceID / InsightFace-dependent routes are not canonical v0.2 dependencies and require separate licence qualification before any future adoption.

## Reference-lock pipeline

### VG0 — Visual Bible
Studio Atlas materialises:
- style family;
- finish level;
- palette and lighting;
- camera/composition language;
- forbidden tropes;
- character definitions;
- environment definitions;
- continuity anchors.

### VG1 — Character candidate generation
For each recurring character:
- generate a bounded candidate set;
- select one human-approved identity;
- produce a canonical reference sheet;
- freeze stable clothing/silhouette/age anchors;
- record model/workflow/seed/provenance.

No downstream production shot may rely on prompt text alone once a character is locked.

### VG2 — Environment reference lock
Generate and approve:
- Sala Zero master;
- new entrance threshold;
- projection wall;
- control booth;
- recurring material/palette anchors.

Production scenes reference these masters.

### VG3 — Shot compiler
The controlled storyboard is compiled into exact shot jobs.

Each production shot binds:
- scene ref;
- narrative beat;
- character refs;
- environment ref;
- camera;
- optional composition/pose controls;
- visual continuity anchors;
- negative constraints;
- aspect ratio;
- workflow family;
- bounded variant count.

### VG4 — Generation
The executor receives only a compiled job.

It may not:
- invent new recurring characters;
- replace a locked character identity;
- silently change model family;
- remove continuity references;
- fall back to prompt-only production;
- lower quality automatically.

### VG5 — Continuity review
Automation may detect:
- missing refs;
- wrong aspect ratio;
- broken manifests;
- absent outputs;
- gross reference mismatch metrics.

Human Review decides:
- identity continuity;
- believable body/pose;
- scene coherence;
- age dignity;
- visual finish;
- whether the world feels authored rather than AI-generic.

### VG6 — Composition
Approved images become the dominant learner-facing surface.

Atlas overlays only interaction needed for action:
- inspect;
- choose;
- manipulate;
- replay;
- compare.

The image/world remains primary. Interface chrome remains secondary.

## MUSEO ZERO application

MUSEO ZERO requires three locked character identities:
- Lia — exhibition layout / visitor flow;
- Omar — installation;
- Teo — control/rehearsal.

It requires two environment masters:
- Sala Zero;
- Cabina regia.

The first production batch remains F1–F6 from the existing Visual Production Pack.

The same Lia reference must be bound to F1, F2, F3 and F6.
The same Sala Zero reference must be bound to F1, F2, F3 and F6.
F2/F3/F6 should share the same camera family so the timing change is readable visually.

## Free-compute execution

The production contract is provider-neutral.

Two execution classes are recognised:

1. **CANONICAL_GPU** — governed provider through TRAMA Compute Policy / SkyPilot.
2. **OPPORTUNISTIC_FREE** — bounded pilot executor such as a Hugging Face ZeroGPU Space, permitted only when:
   - the account already has an eligible hosting/compute entitlement;
   - the next run has zero authorised marginal cost;
   - no paid overage or automatic subscription action can occur;
   - output provenance is preserved;
   - lack of hosting entitlement, quota or capacity returns `WAITING_FOR_COMPUTE`.

ZeroGPU is therefore an executor technology, **not evidence of free entitlement**. The adapter may be deployed only to an explicitly configured Space. Hardware/entitlement selection is outside the automatic deploy script.

## Model / licensing posture

- `black-forest-labs/FLUX.2-klein-4B`: v0.2 primary generation candidate; Apache-2.0 model release.
- ComfyUI: candidate canonical graph/workflow engine for governed GPU execution.
- Diffusers: pilot ZeroGPU execution implementation.
- FaceID / InsightFace-dependent identity routes: EXPERIMENTAL_ONLY until separate licence qualification.
- Any third-party checkpoint/style LoRA requires explicit provenance and licence review before use.

## Storage boundary

The pilot ZeroGPU adapter may return ephemeral candidate file URLs.

This is sufficient to test:
- generation;
- reference selection;
- continuity binding;
- Human Product Review.

Ephemeral provider output is **not** sufficient for `PUBLISH_CANDIDATE`. Before that state, accepted assets require durable governed storage or a reproducible regeneration path bound to exact provenance.

## Non-negotiable product rule

A successful visual pathway cannot be reconstructed as a page made mostly of cards, labels and buttons.

If the learner cannot see the characters, place, action and consequence without reading interface text, the Visual Factory has not completed its job.

## Definition of Done for v0.2

The pipeline is demonstrated only when:

1. Studio Atlas owns a machine-readable Visual Bible;
2. Lia, Omar and Teo each have one locked reference sheet;
3. Sala Zero and control booth each have one locked environment master;
4. F1–F6 compile into exact generation jobs;
5. production shots cannot compile when required references are unlocked/missing;
6. one qualified executor returns assets with provenance;
7. the same character/environment refs are reused across dependent shots;
8. Atlas can compose returned assets without replacing the story with dashboard UI;
9. Human Product Review judges the generated scene sequence;
10. no runtime/publication authority is implied.
