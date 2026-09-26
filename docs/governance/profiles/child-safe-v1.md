# TRAMA Capability Profile — CHILD-SAFE v1

**Status:** PROPOSED  
**Applies to:** capabilities directly used by minors  
**Extends:** TRAMA Capability Lifecycle v1  
**Runtime authorization:** NONE

## Purpose

CHILD-SAFE adds mandatory evidence and design constraints when a TRAMA capability is directly accessible to minors. It does not replace legal assessment, pedagogical review, accessibility review or the base lifecycle.

## Core rule

A public minor-facing capability must be useful without requiring the minor to disclose personal data to Atlas. Data protection, child rights, safety, accessibility, inclusion, agency, cognitive accessibility and age-appropriate comprehension are design inputs, not end-stage compliance checks.

## Mandatory G1 evidence domains

Before G1 PASS, the capability record must contain retrievable evidence for:

1. pedagogical foundations and developmental appropriateness;
2. applicable Italian and European educational/normative frameworks;
3. children's rights and safeguards relevant to the digital experience;
4. privacy, data minimisation and protection-by-design/default;
5. accessibility, inclusion and age-appropriate language;
6. attention, working-memory/cognitive-load and multimedia risks where the experience is visually or interactively rich;
7. risks created by free text, uploads, external links, sharing or other disclosure surfaces;
8. teacher/adult mediation boundaries where applicable;
9. age-band differences relevant to interaction, reflection and narrative comprehension;
10. alternatives considered and negative knowledge.

Every source must record what design or governance question it informs. A bibliography without traceability is insufficient.

## Child-rights review lens

For a minor-facing capability, review together:

- best interests of the child;
- non-discrimination and meaningful access;
- protection from avoidable risks;
- privacy and data protection;
- participation and agency appropriate to the experience;
- understandable information and choices;
- cognitive accessibility, attention and freedom from manipulative engagement patterns.

A safety measure that unnecessarily excludes, identifies or removes meaningful agency requires justification and review.

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
- external services and links assessed before inclusion;
- no age-assurance mechanism unless necessity and proportionality are established.

Any exception requires an explicit governance decision, purpose/necessity analysis, data minimisation, child-safety assessment and applicable legal analysis. Product convenience is insufficient.

## Mandatory G2/G3 data-flow evidence

For every relevant event/surface, document:

`action → data created → storage → recipient → retention → deletion/reset → necessity → third party`.

Review must include browser/local storage, telemetry, logs, error reporting, CDN/network services, third-party assets/scripts, embeds and export metadata. Claims of anonymity must be evidenced rather than assumed.

## Child-facing content baseline

- instructions and notices use age-appropriate, comprehensible language;
- experiences do not ask minors to reveal sensitive or identifying personal experiences when pedagogically unnecessary;
- reflection prompts permit private/local reflection;
- no psychological diagnosis, personality labelling or identity scoring;
- no manipulative engagement loops or social comparison mechanics;
- progress representation avoids fixed personal labels;
- unsafe or unsuitable outbound content is not embedded merely because it is publicly reachable;
- metaphor/narrative never becomes necessary to understand a safety-critical choice.

## Cognitive and visual safety baseline

A minor-facing learning experience must not optimise for attention capture at the expense of comprehension, reflection or self-regulation.

Default constraints:

- one dominant pedagogical focus per state unless comparison/integration requires more;
- avoid decorative/seductive visual details that compete with the learning target;
- avoid rapid automatic replacement of learning-critical imagery;
- prefer learner-controlled pacing for learning-critical transitions;
- use signaling/cueing to show relevant relationships rather than making all elements visually salient;
- preserve stable visual anchors when recurrence supports meaning and memory;
- follow salient imagery with a meaningful cognitive action (retrieve, choose, explain, connect, compare, predict, reflect or transfer);
- provide pause, revisit and reorientation without penalty;
- preserve meaning under reduced-motion/no-audio/low-stimulation presentation;
- do not infer understanding or competence from visual attraction, clicks, dwell time or image recall alone;
- validate with intended age bands and diverse attention/learning needs before publication.

These constraints are educational/accessibility safeguards, not clinical claims or diagnostic rules.

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
- third-party scripts/services;
- age assurance, if proposed;
- reduced-motion/no-audio/non-visual alternatives;
- visual density and competing focal points;
- automatic transitions/autoplay;
- decorative animation and interactive hotspots;
- reorientation/recovery after distraction.

`NOT_APPLICABLE` requires rationale.

## Narrative and atmosphere

For experiential minor-facing capabilities, narrative design is a first-class product artefact when used. Document:

- metaphor and pedagogical function;
- audience/age range;
- literal meaning available independently of metaphor;
- world and atmosphere;
- subject/premise;
- narrative arc;
- recurring places, guides or symbols;
- stable visual anchors and visual-attention budget;
- interaction grammar;
- tone and vocabulary;
- progression rituals and representation of achievement;
- accessibility equivalents for animation, sound and visual metaphor;
- boundaries preventing manipulation, disclosure pressure, cognitive overload or obscured choices.

Narrative quality does not override privacy, accessibility, child rights, cognitive safety or human control.

## Child participation in validation

Where children participate in design/usability validation, the process itself must be governed and CHILD-SAFE. Participation should be meaningful but bounded to the design question, minimise data collection, avoid soliciting unnecessary personal histories, include appropriate adult/institutional mediation where required and document how feedback changes the design. A small participant group must not be treated as representative of all children.

## Evidence-to-decision traceability

Each material design decision should be traceable as:

`SOURCE/EVIDENCE → POPULATION/CONTEXT → FINDING → LIMITATION → DESIGN/GOVERNANCE IMPLICATION → D/SPEC/ADR`

Research findings remain evidence until a governed decision adopts them.

## Publication condition

A CHILD-SAFE capability cannot be publication-ready solely because code and UI are complete. Relevant lifecycle gates must contain current evidence for pedagogy, child rights, safety/privacy, accessibility/inclusion, cognitive/visual safety, age-appropriate narrative/content review where applicable, data-flow verification and human validation on the exact release candidate.