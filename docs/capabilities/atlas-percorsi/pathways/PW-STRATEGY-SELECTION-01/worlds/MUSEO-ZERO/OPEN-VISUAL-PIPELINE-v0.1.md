# MUSEO ZERO — Open Visual Production Pipeline v0.1

**Candidate:** MZ-VF-001
**Selected visual direction:** Cinematic Editorial Illustration
**State:** PIPELINE_DEFINED / EXECUTION_NOT_YET_QUALIFIED
**Runtime:** NOT_AUTHORIZED
**Purpose:** reproduce the selected visual language without depending on chat-only generation

## 1. Decision

The Style Frame Sprint is closed.

Selected direction:
**Cinematic Editorial Illustration**

The next proof is not another visual-direction search. It is a reproducibility proof.

The Factory must create:
- one canonical Lia reference;
- one canonical Sala Zero reference;
- F3 — Too Late;
- F4 — Backstage Clue;

with stable identity, stable environment language and a recorded open workflow.

## 2. v0.1 reference toolchain

### Orchestration
**ComfyUI**

Reason:
- node-based reproducible workflows;
- workflow JSON can be stored;
- native Qwen-Image/Qwen-Image-Edit support exists;
- generation and editing can be separated cleanly;
- the operator can replace execution hardware without changing the product contract.

### Base image generation
**Qwen-Image**

Use for:
- first canonical character exploration;
- first canonical environment exploration;
- clean plates without learner-facing text.

### Controlled image editing / continuity
**Qwen-Image-Edit**

Use for:
- preserving visual appearance while changing scene state;
- producing F3/F4 from accepted references;
- controlled variation after Reference Lock.

Reference model licence:
Apache-2.0.

### Acceleration
Optional:
**Qwen-Image Lightning 4-step LoRA**

Use only if visual quality remains acceptable under the same review gate.

### Human refinement
**Krita**

Use for:
- anatomy/geometry repair;
- silhouette cleanup;
- palette harmonisation;
- removal of generative artefacts;
- layer preparation;
- final visual-plate cleanup.

Krita is not a cosmetic afterthought. Human refinement is part of the production process.

## 3. Execution boundary

The full Qwen-Image family is compute-heavy.

The official ComfyUI reference for the FP8 Qwen-Image workflow uses a 24 GB GPU-class reference system.

Therefore v0.1 defines:

- **REFERENCE_EXECUTION_PROFILE:** 24-GB-class GPU or an independently validated equivalent;
- **LOW_VRAM_QUANT_PROFILE:** NOT_YET_QUALIFIED;
- **CPU_ONLY_PROFILE:** NOT_ACCEPTED_FOR_PRODUCTION due to impractical iteration cost;
- **execution provider:** replaceable and not an authority layer.

Do not weaken the visual target merely to fit an unqualified device profile.

A lower-VRAM or Intel-specific route may be qualified later, but it must reproduce the same quality gate before becoming canonical.

## 4. Model package

Reference package:

- Qwen-Image or current ComfyUI-native Qwen-Image generation checkpoint;
- Qwen-Image-Edit FP8 ComfyUI-native checkpoint;
- Qwen2.5-VL 7B FP8 text encoder required by the official workflow;
- Qwen-Image VAE;
- optional Qwen-Image Lightning 4-step LoRA.

Exact file names and hashes MUST be captured at execution time because upstream artifacts may evolve.

## 5. Generation stages

### OP0 — Clean environment baseline

Generate Sala Zero only.

No characters.
No text.
No UI.

Acceptance:
- contemporary museum;
- stable architecture;
- plausible projection wall;
- new entrance threshold visible;
- warm/cool cinematic light;
- no cyberpunk overload;
- no schematic/dashboard appearance.

Select ONE environment master.

### OP1 — Character baseline

Generate Lia only against a neutral/simple background.

Requirements:
- believable adult museum crew member;
- practical contemporary clothing;
- stable silhouette;
- same apparent age across views;
- not student-coded;
- not mascot/anime-teen-coded;
- no embedded text.

Select ONE character master.

Omar and Teo follow only after Lia + Sala Zero prove the pipeline.

### OP2 — F3 Too Late

Inputs:
- accepted Sala Zero master;
- accepted Lia master;
- F3 composition constraints.

Required scene:
- Lia already past the new entrance;
- projection begins too late;
- spatial mismatch visible without caption;
- one crew reaction may be present only if identity can remain stable;
- no text/UI overlay inside the generated plate.

### OP3 — F4 Backstage Clue

Inputs:
- accepted world/art-direction reference;
- accepted character reference;
- F4 composition constraints.

Required scene:
- believable museum control booth;
- one simple mapping relation visible as part of the physical control surface;
- technical evidence remains diegetic;
- no floating teaching diagram;
- no generated explanatory prose.

### OP4 — Human cleanup

Open selected plates in Krita.

Required QA:
- remove malformed geometry;
- repair hands/props if visible;
- harmonise palette;
- ensure recurring architectural anchors match;
- remove accidental text;
- preserve clean export without UI copy.

### OP5 — Reference Lock Review

Pass only if:
- same Lia;
- same world;
- same visual direction;
- F3 understandable without prose;
- F4 technical but still inside the world;
- no HS02/HS03/HS04/HS05/HS07.

If PASS:
REFERENCE_LOCK_READY

If FAIL:
RETURN_TO_OP0_OR_OP1

Do not reopen the style-direction sprint.

## 6. Prompt policy

Prompts are implementation inputs, not authority.

Every accepted run stores:
- prompt;
- negative constraints;
- seed when meaningful;
- model file/hash;
- workflow JSON hash;
- image dimensions;
- sampler/steps/CFG;
- LoRA name/hash if used;
- source-reference hashes;
- output hash;
- selection/rejection reason.

No accepted asset may depend on a prompt remembered only from chat.

## 7. Text policy

Generated visual plates contain:
- no dialogue text;
- no learner instruction text;
- no final UI labels;
- no pedagogical explanation.

Text is composed later with normal typography.

Exception:
small diegetic markings may be introduced during human refinement if the scene requires them and they remain readable/controlled.

## 8. Iteration budget

Per stage:
- maximum 4 exploratory generations before review;
- at most 2 shortlist candidates;
- one accepted canonical master.

If 4 attempts cannot produce a viable Q2 candidate:
STOP AND DIAGNOSE.

Do not solve a systemic workflow problem through unlimited sampling.

## 9. Repository artefacts required after execution

Store:
- workflow JSON reference;
- recipe YAML;
- accepted master reference;
- rejected-candidate contact sheet or references where useful;
- human-refinement note;
- final PNG/WebP derivative;
- exact execution receipt;
- Human Reference Lock decision.

Large binary masters may live outside Git where repository policy requires it, but the governed record must preserve stable references and hashes.

## 10. Publication boundary

Pipeline qualification does not authorize:
- Atlas implementation;
- student use;
- publication;
- runtime;
- automated art acceptance.

It demonstrates that the Visual Factory can reproduce the selected language.

## 11. External reference basis

Official/current references:
- ComfyUI Qwen-Image native workflow;
- ComfyUI Qwen-Image-Edit native workflow;
- Qwen/Qwen-Image Apache-2.0 model card;
- Qwen/Qwen-Image-Edit Apache-2.0 model card.

These references are implementation inputs, not permanent authority.
