# CAP-ATLAS-PERCORSI — Atlas Percorsi

**Lifecycle:** ACTIVE_DISCOVERY  
**Current gate:** G1 — Discovery  
**Owning product candidate:** Atlas  
**Ecosystem impact:** TRAMA / Atlas; Arena and Docente OS impacts to be assessed at G2  
**Runtime:** NOT_AUTHORIZED  
**Lifecycle authority:** TRAMA Capability Lifecycle v1, adopted via PR #95  
**Safety profile:** CHILD-SAFE v1 PROPOSED

## Problem

Atlas needs a coherent environment in which students can progressively develop transversal competences through meaningful experiences, beginning from self-awareness and moving toward learning regulation, relationships, problem solving, responsible participation and personal planning.

The capability must not become a collection of isolated soft-skill lessons, a profiling/scoring system or a data-bearing student service.

## Public/minor-facing constraint

Atlas Percorsi is intended for public use and may be used directly by minors. The working architecture therefore requires meaningful use without a student account or the disclosure of personal information to Atlas. Personal reflection/progress should remain learner-controlled and local-first where persistence is useful; voluntary download/export is preferred over upload/synchronisation.

These directions are discovery constraints pending authoritative evidence consolidation and G2 governance.

## Discovery hypothesis

Candidate learning cycle:

`SELF-AWARENESS → CHOICE → ACTION → OBSERVATION → REFLECTION → TRANSFER`

Candidate experience territories:

1. Me;
2. Me as a learner;
3. Me and others;
4. Me facing problems;
5. Me in the world;
6. Me as a planner/agent.

Candidate experience formats:

- short prompt/trigger;
- challenge;
- multi-experience pathway.

These are discovery hypotheses, not approved specifications.

## Durable G1 artefacts

- `research-evidence-register.md` — source/evidence structure and traceability;
- `pedagogical-model.md` — preserved pedagogical working model;
- `safety-privacy.md` — minor protection, privacy and disclosure-surface analysis;
- `narrative-experience-bible.md` — metaphor, subject, atmosphere, script and interaction design structure;
- `../../governance/profiles/child-safe-v1.md` — proposed reusable lifecycle profile for minor-facing capabilities.

## Evidence already gathered

Initial scholarly exploration has considered research on:

- self-regulated learning and metacognition;
- learner agency;
- social-emotional competence;
- autonomy, competence and relatedness;
- reflection and transfer of learning;
- transversal and 21st-century competences.

Relevant starting points identified include Panadero, Pintrich, Vansteenkiste/Ryan/Soenens and van Laar et al. Exact works, stable references, populations, limitations and applicability must be consolidated in the evidence register before G1 PASS.

Authoritative evidence families must also cover applicable Italian/EU competence frameworks, children's safeguards, GDPR/privacy-by-design, accessibility/inclusion and narrative/experiential design.

## Candidate principles requiring decision

- start from the learner's self-awareness without psychological profiling;
- competence is developed through experience, action, feedback, reflection and transfer;
- avoid identity-like numerical scores for personal competences;
- represent progress through evidence and demonstrated use in different situations;
- preserve Atlas privacy-first constraints;
- personal reflection should remain under learner control and should not imply centralized student accounts or tracking;
- transversal pathways must remain connectable to curriculum and learning materials without becoming owned by a single school subject;
- narrative/metaphor, when adopted, must have pedagogical purpose and accessible equivalents;
- technology/library selection follows experience requirements rather than defining them.

None of these items is APPROVED merely by appearing here.

## G1 open work

- [ ] consolidate scholarly evidence and exact bibliography;
- [ ] map candidate model to applicable first-cycle competence frameworks and current Italian/EU reference frameworks;
- [ ] consolidate authoritative child-safety/privacy sources and applicability;
- [ ] define age progression across primary and lower-secondary levels;
- [ ] distinguish competence development from psychological assessment;
- [ ] consolidate accessibility and inclusion evidence/requirements;
- [ ] identify teacher mediation modes and student autonomy boundaries;
- [ ] define evidence model candidates;
- [ ] research narrative-learning/metaphor alternatives;
- [ ] evaluate metaphor candidates against pedagogical, age, accessibility and privacy criteria;
- [ ] document alternatives and negative knowledge;
- [ ] prepare G1 review package.

## G2 preview — not yet resolved

Before governance PASS the project must decide:

- authoritative ownership of pathway definitions and published experiences;
- relationship with Arena curriculum authority;
- relationship with Docente OS planning and teacher confirmation;
- local-device state, export and deletion model;
- data minimization and privacy architecture;
- outbound-link/third-party service policy;
- whether any new cross-product contract is needed;
- whether an ADR is required;
- explicit confirmation that DOS-A1 remains unaffected.

## Negative knowledge — initial

### NK-001 — Numerical identity scoring

**State:** CANDIDATE_REJECTION  
Do not treat a student's transversal competence as a stable identity score such as `collaboration 72/100`. Research and pedagogical rationale must be consolidated before formal rejection, but the current direction is evidence-based progression rather than personal ranking.

### NK-002 — Course catalogue model

**State:** CANDIDATE_REJECTION  
Do not reduce Atlas Percorsi to video/lesson/quiz/completed sequences. The current hypothesis requires experience, decision, action, reflection and transfer.

### NK-003 — Data-bearing personalisation

**State:** CANDIDATE_REJECTION  
Do not equate personalisation with server-side student identity, profile or tracking. The current direction is learner-controlled/local-first state and optional export.

### NK-004 — Library-first design

**State:** CANDIDATE_REJECTION  
Do not select animation/UI/game libraries first and shape the experience around their affordances. Define pedagogy, metaphor, script, interaction and accessibility requirements first; select open-source technology afterward.

## Next governed action

Populate the G1 evidence register with stable scholarly and authoritative sources, applicability/limitations and traceability. In parallel, investigate narrative/metaphor alternatives without freezing visual design or selecting implementation libraries.