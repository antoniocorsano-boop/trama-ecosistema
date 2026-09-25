# TRAMA Capability Profile — CHILD-SAFE v1

**Status:** PROPOSED  
**Applies to:** capabilities directly used by minors  
**Extends:** TRAMA Capability Lifecycle v1  
**Runtime authorization:** NONE

## Purpose

CHILD-SAFE adds mandatory evidence and design constraints when a TRAMA capability is directly accessible to minors. It does not replace legal assessment, pedagogical review, accessibility review or the base lifecycle.

## Core rule

A public minor-facing capability must be useful without requiring the minor to disclose personal data to Atlas. Data protection, safety, accessibility and age-appropriate comprehension are design inputs, not end-stage compliance checks.

## Mandatory G1 evidence domains

Before G1 PASS, the capability record must contain retrievable evidence for:

1. pedagogical foundations and developmental appropriateness;
2. applicable Italian and European educational/normative frameworks;
3. children's rights and safeguards relevant to the experience;
4. privacy, data minimisation and protection-by-design;
5. accessibility, inclusion and age-appropriate language;
6. risks created by free text, uploads, external links, sharing or other disclosure surfaces;
7. teacher/adult mediation boundaries where applicable;
8. alternatives considered and negative knowledge.

Every source must record what design or governance question it informs. A bibliography without traceability to decisions is insufficient.

## Data-safety baseline

For Atlas public student experiences, the default design is:

- no student account or authentication;
- no server-side personal student profile;
- no individual behavioural tracking;
- no requirement to provide name, email, school, class, precise location or other identifying information;
- no open-ended submission to Atlas unless separately governed and demonstrably necessary;
- no dark patterns encouraging disclosure;
- no public sharing surface for a minor's personal artefact by default;
- local-first state when progress/personal reflection can be retained on the device;
- voluntary export/download under user control when an artefact is useful;
- clear local reset/deletion where local state is retained;
- external services and links assessed before inclusion.

Any exception requires a new explicit governance decision, purpose/necessity analysis, data minimisation, safety assessment and applicable legal basis. It cannot be inferred from product convenience.

## Child-facing content baseline

- instructions and notices use age-appropriate, comprehensible language;
- experiences do not ask minors to reveal sensitive or identifying personal experiences when pedagogically unnecessary;
- reflection prompts are designed to permit private/local reflection;
- no psychological diagnosis, personality labelling or identity scoring;
- no manipulative engagement loops or social comparison mechanics;
- progress representation must avoid turning developing competences into fixed personal labels;
- unsafe or unsuitable outbound content is not embedded merely because it is publicly reachable.

## Mandatory design surfaces review

Before G4 PASS, explicitly review:

- text input;
- file/image upload;
- microphone/camera/location permissions;
- clipboard/share actions;
- download/export;
- external links/embeds;
- local storage and reset;
- analytics/telemetry;
- error messages and logs;
- third-party scripts/services.

`NOT_APPLICABLE` requires rationale.

## Narrative and atmosphere

For experiential minor-facing capabilities, narrative design is a first-class product artefact when used. The capability should document:

- metaphor and its pedagogical function;
- audience/age range;
- world and atmosphere;
- subject/premise;
- narrative arc;
- recurring places, guides or symbols;
- interaction grammar;
- tone and vocabulary;
- progression rituals and representation of achievement;
- accessibility equivalents for animation, sound and visual metaphor;
- boundaries preventing the narrative from manipulating disclosure or obscuring choices.

Narrative quality does not override privacy, accessibility or human control.

## Evidence-to-decision traceability

Each material design decision should be traceable as:

`SOURCE/EVIDENCE → FINDING → DESIGN/GOVERNANCE IMPLICATION → D/SPEC/ADR`

Research findings remain evidence until a governed decision adopts them.

## Publication condition

A CHILD-SAFE capability cannot be considered publication-ready solely because code and UI are complete. The relevant lifecycle gates must contain current evidence for pedagogy, safety/privacy, accessibility/inclusion, narrative/content review where applicable, and human validation on the exact release candidate.
