# CAP-ATLAS-PERCORSI — Productive Pathway Workflow & Repository Model v1

**Gate:** G1 — Discovery / capability industrialisation
**Status:** CONSOLIDATED_WORKFLOW_HYPOTHESIS / NOT_RUNTIME_AUTHORIZATION
**Purpose:** turn the current experimental research/design process into a repeatable repository-driven production workflow that does not depend on ChatGPT or any single AI product.

## Core decision

The knowledge being created for Atlas Percorsi must live in the governed repository as **portable, inspectable project assets**: schemas, templates, evidence registers, decision records, validation gates and reusable narrative-grammar catalogues.

ChatGPT, Sider Scholar or another agent may assist a workflow, but they are **replaceable operators**. They are not the source of truth and must not be required to create a new pathway.

## Repository as operational memory

The repository should preserve four distinct layers:

1. **policy/constitution** — rules that every pathway must obey;
2. **research library** — reusable evidence and design reasoning;
3. **grammar/catalogue library** — reusable experiential/narrative patterns and their suitability/risks;
4. **pathway dossiers** — the governed record for each concrete pathway.

## Proposed structure

```text
docs/capabilities/atlas-percorsi/
├── constitution/
│   ├── child-safety.md
│   ├── privacy-data-minimisation.md
│   ├── accessibility-low-stimulation.md
│   ├── emotional-development.md
│   ├── attention-memory.md
│   └── sustainability-consequence-principle.md
├── research/
│   ├── common/
│   ├── japanese-visual-narrative/
│   ├── interactive-narrative/
│   ├── inquiry-mystery/
│   ├── simulation-microworlds/
│   ├── construction-workshop/
│   ├── theatre-perspective/
│   ├── environmental-storytelling/
│   └── visual-multimodal-literacy/
├── grammars/
│   ├── registry.yaml
│   ├── sequential-visual-narrative.md
│   ├── branching-consequence.md
│   ├── inquiry-evidence.md
│   ├── construction-workshop.md
│   ├── simulation-microworld.md
│   ├── viewpoint-theatre.md
│   ├── reflective-notebook.md
│   ├── map-exploration.md
│   ├── shared-construction.md
│   └── environmental-storytelling.md
├── templates/
│   ├── PATHWAY-DOSSIER-TEMPLATE.md
│   ├── EVIDENCE-RECORD-TEMPLATE.md
│   ├── NARRATIVE-CONCEPT-TEMPLATE.md
│   ├── CHARACTER-BIBLE-TEMPLATE.md
│   ├── CONSEQUENCE-REVIEW-TEMPLATE.md
│   └── VALIDATION-PLAN-TEMPLATE.md
├── pathways/
│   └── <pathway-id>/
│       ├── dossier.md
│       ├── evidence.yaml
│       ├── decisions.md
│       ├── narrative-concept.md
│       ├── characters.md
│       ├── safeguards.md
│       ├── storyboard.md
│       ├── validation.md
│       └── manifest.yaml
└── workflow/
    ├── productive-pathway-workflow-v1.md
    ├── gates.yaml
    └── checks/
```

The exact physical migration of existing documents should be governed separately; this tree is the target information architecture, not permission for a bulk move.

## Machine-readable pathway manifest

Each pathway should eventually have a small manifest independent of prose:

```yaml
schemaVersion: 1
pathwayId: TBD
title: TBD
competenceTerritories: []
ageBands: []
status: idea
mediation: autonomous_public
narrativeGrammars: []
requiredEvidence: []
safeguardProfile: TBD
validationPlan: TBD
runtimeAuthorized: false
```

This allows repository checks, future authoring tools and alternative agents to operate without reconstructing meaning from chat history.

## Productive workflow

### W0 — Intake

Input can be a human idea, curriculum need, teacher proposal or evidence finding.

Create a pathway ID and dossier from the template. No interface design yet.

### W1 — Competence classification

Declare competence territory, age band, observable learning actions, boundaries and what must never be inferred about the learner.

**Gate:** no identity/psychological trait is accepted as a competence measurement proxy.

### W2 — Evidence resolution

Search the reusable research library first. Add new research only for unresolved questions.

Every material finding becomes an evidence record with population/context, supported claim, limitations and design relevance.

**Efficiency rule:** do not repeatedly research a settled common question for every pathway; link governed evidence.

### W3 — Grammar selection

Consult the experiential-grammar registry. Rank candidate grammars by fit to the required cognitive action, not by popularity or visual attractiveness.

Record selected, rejected and deferred candidates and why.

### W4 — Narrative concept

Define subject, world, narrative engine, character roles, information-release rhythm, atmosphere, local metaphorical devices and transfer logic.

### W5 — Safeguard review

Apply child safety, emotional-development, privacy, accessibility, attention/memory and sustainability controls.

**Gate:** blockers stop progression before polished visual work.

### W6 — Controlled storyboard

Create literal instructions, scenes, actions, consequences, reconsideration, strategy recognition and transfer. Generate visuals only after the structural storyboard is reviewable.

### W7 — Consequence review

Record foreseeable beneficial/adverse consequences, uncertainty, preventability and controls.

### W8 — Validation plan

State hypotheses, comparison/baseline, supporting/rejecting evidence and human-validation safeguards before validation occurs.

### W9 — Product specification handoff

Only evidence-supported, safeguard-passed decisions become implementation requirements.

### W10 — Runtime authorization

Separate governance explicitly authorizes implementation/publication. Research/design completion alone cannot set `runtimeAuthorized: true`.

## Agent independence

A compliant implementation of this workflow may be executed by:

- a human multidisciplinary team;
- repository scripts/forms;
- an internal Atlas authoring interface;
- a local/open model;
- ChatGPT;
- another research/design agent;
- combinations of these.

The operator must read/write the same governed artefacts and pass the same gates. No workflow rule may exist only in a proprietary prompt or chat memory.

## Future automation opportunities

Once schemas stabilize, repository automation can check mechanically:

- required dossier files exist;
- manifest schema is valid;
- age bands and competence territories are declared;
- grammar IDs exist in the registry;
- safeguard review is linked;
- evidence records include limitations/context;
- validation plan exists before status advances;
- `runtimeAuthorized` remains false without explicit governance receipt;
- no pathway claims completion with unresolved blocking controls;
- generated visual assets have a scenario-fidelity review.

These are deterministic checks and should not require an LLM.

AI-assisted checks may later inspect semantic coherence, but they must be advisory unless a governed rule defines otherwise.

## Experiential grammar registry model

Each grammar record should capture:

```yaml
id: branching-consequence
name: Branching / consequence narrative
cognitiveActions:
  - compare alternatives
  - anticipate consequences
  - reconsider
potentialCompetenceFit:
  - decision-responsibility
ageConsiderations: []
strengths: []
risks: []
accessibilityControls: []
childSafetyControls: []
resourceProfile: TBD
evidenceRefs: []
status: research
```

This turns today's exploratory discussion about manga, inquiry, theatre, simulation, workshop and other approaches into a reusable design-selection instrument.

## Research-library rule

Research must be reusable but not overgeneralised.

Each record declares:

- source;
- study/review type;
- population and age;
- country/cultural context;
- intervention/material;
- outcome/claim supported;
- limitations;
- confidence/uncertainty;
- applicable grammar IDs;
- applicable competence territories;
- design consequence;
- date reviewed.

Japanese manga/visual-narrative evidence therefore enters the same system as other traditions rather than becoming a privileged aesthetic default.

## Human authoring target

A future Atlas Percorsi authoring tool should guide a teacher/designer through this workflow using structured forms and governed defaults:

1. describe the competence need;
2. inspect/reuse evidence;
3. compare suitable grammars;
4. compose the narrative concept;
5. run safeguard checks;
6. storyboard;
7. define validation;
8. export a complete pathway package.

The user should be able to complete this without writing prompts and without knowing which AI, if any, is used behind the interface.

## Definition of workflow maturity

The experimental process becomes production-ready when:

- the pathway dossier schema is stable;
- the grammar registry has governed entries;
- evidence records are reusable and traceable;
- gate criteria are machine-readable where feasible;
- at least two structurally different pathways have successfully used the same workflow;
- a pathway can be created from repository templates without chat history;
- deterministic repository checks catch missing governance artefacts;
- changing the AI assistant does not change the required process or source of truth.

## Immediate next work

1. Create the first machine-readable `grammars/registry.yaml`.
2. Seed it with the currently identified grammar families, marking them `research`, not approved.
3. Create the evidence-record template.
4. Reclassify the current shared-decision experiment into a concrete pathway dossier.
5. Use a second, cognitively different pathway to test whether the workflow is genuinely reusable.
6. Only after these tests design the authoring interface/automation around the proven workflow.
