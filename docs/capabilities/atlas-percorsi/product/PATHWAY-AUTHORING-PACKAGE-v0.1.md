# Atlas Percorsi — Pathway Authoring Package v0.1

**Status:** PROPOSED_CROSS_PRODUCT_CONTRACT / HUMAN_REVIEW_REQUIRED  
**Runtime:** NOT_AUTHORIZED  
**Date:** 2026-10-04

## 1. Purpose

Define the durable, provider-independent handoff produced by Studio Atlas while a Percorso moves from professional authoring to governed review and eventual Atlas publication.

The package exists so that:

- the product UI is not the source of truth;
- ChatGPT/AI/provider state is not the source of truth;
- repository files are generated from structured authoring rather than edited by creators;
- Studio Atlas can be embedded or standalone without changing the content contract;
- Atlas implementation can consume a stable package independent of the authoring UI.

## 2. It is not a publication receipt

The Pathway Authoring Package is distinct from:

- `LessonPublicationManifest`;
- Atlas `PublicationReceipt`;
- runtime authorization;
- Arena curriculum authority;
- Git commit/PR state.

A package may be complete while publication remains unauthorised.

## 3. Lifecycle

Working package:

`SEED → AUTHORING → REVIEWABLE → REVISION_REQUIRED → PUBLISH_CANDIDATE`

Submission snapshot:

`PUBLISH_CANDIDATE → REVIEWED → ACCEPTED_FOR_ATLAS_HANDOFF | REJECTED | SUPERSEDED`

Public Atlas state is separate.

Every submission snapshot is immutable.

Further edits create a new package version.

## 4. Minimum identity

Required:

- `schemaVersion`;
- `packageId`;
- `packageVersion`;
- `pathwayId`;
- `title`;
- `authoringState`;
- `createdAt`;
- `updatedAt`;
- `sourceDigest`.

Professional creator identity is referenced by a governed internal subject/workspace ref and MUST NOT become public Atlas metadata by default.

## 5. Source seed

The package records how authoring started:

- `CURRICULUM_TARGET`;
- `PLAIN_IDEA`;
- `DOCENTE_OS_ACTIVITY`;
- `EXISTING_PATHWAY`;
- `EXISTING_STORY_WORLD`;
- `OTHER_GOVERNED_SOURCE`.

For a Docente OS seed, only minimised reusable material enters the package.

Forbidden by default:

- student names;
- student identifiers;
- section-specific private notes;
- individual assessment data;
- diary/calendar detail not necessary to the reusable product.

## 6. Curriculum binding

The package references Arena rather than copying authority.

Minimum candidate shape:

- `authority: "Arena"`;
- `curriculumVersionRef`;
- `authorityState`;
- `authorityReceiptRef` when required;
- `curriculumObjectiveRefs[]`;
- optional non-authoritative human-readable projections.

Creator-authored intent MUST remain semantically distinct from Arena objectives.

## 7. Story section

The package records:

- story concept;
- story version;
- hook;
- world/setting;
- characters;
- character goals;
- disruption;
- learner role;
- unknown/curiosity;
- escalation;
- turning point;
- ending;
- emotional register;
- age-dignity declaration;
- Human Story Review receipt/reference.

No progression to reviewed world design without the required story decision.

## 8. World/experience section

Includes governed structured representations of:

- World Brief;
- learner role;
- agency;
- information distribution;
- consequence model;
- experiential grammar selection;
- rejected/deferred grammar candidates;
- rationale.

## 9. Scene model

Each scene has stable identity and version.

Minimum candidate fields:

- `sceneId`;
- `order`;
- `purpose`;
- `interaction` when the scene contains an authored interaction;
- `learnerVisibleSituation`;
- `availableInformation`;
- `learnerActions[]`;
- `consequences[]`;
- `informationRevealed[]`;
- `continuityAnchors[]`;
- `nextSceneRefs[]`;
- optional `world` state with place, current status and observable signals;
- for a choice scene, `choices[]` with stable `choiceId`, learner-visible `label`, consequence `feedback`, exact `targetSceneId` and optional `worldAfter`;
- accessibility/alternate-mode declarations.

`nextSceneRefs[]` describes graph reachability but does not replace choice routing. A conforming export/import MUST preserve the binding between each authored choice and its `targetSceneId`; otherwise two semantically different branches could collapse into the same sequential path.

When present, `world` and `worldAfter` are part of the semantic experience contract: they describe what the learner can observe changing in the world. They MUST remain presentation-neutral, textual/semantic enough for an accessible equivalent, and MUST NOT encode learner telemetry or identity.

Generated visual prompts are production metadata, not canonical learner content.

## 10. Visual production section

Records:

- selected art direction;
- Reference Lock state;
- canonical character/environment refs;
- asset candidate refs;
- asset hashes;
- generation/edit provenance;
- human refinements;
- licence/base-of-use declarations;
- quality review;
- Visual Quality Bar result.

Model/provider identifiers may be stored in technical provenance but are not part of the creator-facing product language.

## 11. Safeguards

Package declares/references:

- child-safety review;
- privacy/minimisation review;
- agent/character relational-boundary review when applicable;
- accessibility review;
- low-stimulation/reduced-motion equivalents;
- rights/licensing;
- data-flow classification;
- free-text input state.

Blocking safeguards prevent promotion.

## 12. Learner preview

A reviewed candidate includes a preview record:

- preview build/version ref;
- package digest;
- exact candidate runtime;
- device/form-factor checks;
- automated evidence;
- Human Use Review decision;
- unresolved findings.

A preview is not public publication.

## 13. Review receipts

Review records are append-only references, not editable checkboxes.

Candidate review types:

- `STORY_REVIEW`;
- `WORLD_REVIEW`;
- `CHILD_SAFETY_REVIEW`;
- `ACCESSIBILITY_REVIEW`;
- `VISUAL_REFERENCE_LOCK_REVIEW`;
- `EXPERIENCE_QUALITY_REVIEW`;
- `HUMAN_USE_REVIEW`;
- `PUBLICATION_CANDIDATE_REVIEW`.

The package points to exact review evidence and decision state.

## 14. Compute receipts

Visual/AI production may add bounded technical receipts.

A compute receipt may record:

- request ID;
- provider/orchestrator;
- model/artifact hashes;
- cost class;
- execution state;
- output hashes;
- failure reason.

Compute receipts never carry publication authority.

## 15. Separation from Git

The package is the semantic contract.

Git may materialise/package it as:

- JSON/YAML;
- generated prose dossiers;
- assets;
- manifests;
- review records.

A Git commit is evidence of a package version, not a replacement for package semantics.

## 16. Submission snapshot

When the creator chooses **Invia per pubblicazione**:

1. Studio Atlas validates deterministic requirements;
2. unresolved blockers are shown;
3. creator confirms the exact candidate;
4. system creates immutable submission snapshot;
5. snapshot receives content digest;
6. governance/review consumes that exact digest;
7. edits after submission create a new package version.

## 17. Atlas handoff

Only an accepted package snapshot may be handed to Atlas implementation/publication.

Atlas then remains authoritative for:

- Atlas resource identity;
- Atlas version;
- publication state;
- public route/runtime state;
- withdrawal history.

The package cannot set those states by itself.

## 18. Portability requirement

A conforming Studio Atlas implementation MUST be able to export/import a Pathway Authoring Package without depending on:

- Docente OS class data;
- one AI vendor;
- one GPU provider;
- one repository branch;
- one authoring UI.

This requirement preserves the option for Studio Atlas to become a standalone product.
