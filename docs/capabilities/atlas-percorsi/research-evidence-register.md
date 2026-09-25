# CAP-ATLAS-PERCORSI — Research & Evidence Register

**Gate:** G1 — Discovery  
**Status:** IN_PROGRESS / AUTHORITATIVE_BASELINE_STARTED  
**Rule:** research is evidence, not approval.

## Evidence record schema

Every material source is recorded with:

- `EVIDENCE-ID`;
- source/title/author or issuing authority;
- source type;
- publication/version/date;
- stable reference;
- topic;
- population/context;
- relevant finding (paraphrased, not copied unnecessarily);
- applicability to Atlas Percorsi;
- limitations/uncertainty;
- design/governance questions informed;
- related candidate or approved D/SPEC/ADR;
- review/freshness state.

## Authoritative baseline records

### FRAME-001 — LifeComp

- **Authority:** European Commission, Joint Research Centre.
- **Title:** LifeComp: The European framework for the personal, social and learning to learn key competence.
- **Type:** EU conceptual competence framework.
- **Stable reference:** https://joint-research-centre.ec.europa.eu/scientific-activities/key-competences-lifelong-learning/lifecomp_en
- **Context:** formal, informal and non-formal education; intended to establish shared understanding of personal, social and learning-to-learn competence.
- **Finding:** LifeComp is explicitly non-prescriptive and describes nine learnable competences; the JRC states that it can serve as a basis for curricula and learning activities.
- **Atlas applicability:** strong candidate reference for competence taxonomy and pathway design, especially self-regulation, social competence and learning-to-learn.
- **Limitation:** it does not by itself define the age progression, assessment model, Italian curriculum alignment or Atlas interaction model.
- **Informs:** pedagogical model; competence taxonomy; progression research.
- **Decision state:** EVIDENCE_ONLY — no direct adoption yet.
- **Freshness:** checked 2026-09-25.

### FRAME-002 — EU Key Competences ecosystem

- **Authority:** European Commission, Joint Research Centre.
- **Title:** Key competences for lifelong learning.
- **Type:** EU framework family/context page.
- **Stable reference:** https://joint-research-centre.ec.europa.eu/scientific-activities/key-competences-lifelong-learning_en
- **Finding:** the JRC maintains competence frameworks including LifeComp, DigComp, GreenComp and EntreComp to support competence development and related educational work.
- **Atlas applicability:** establishes the broader framework family in which Atlas Percorsi should map transversal experiences without collapsing distinct frameworks into one taxonomy.
- **Limitation:** framework presence does not imply every framework is relevant to every pathway.
- **Informs:** framework mapping and future source selection.
- **Decision state:** EVIDENCE_ONLY.
- **Freshness:** checked 2026-09-25.

### CHILD-001 — Specific protection of children under GDPR

- **Authority:** European Data Protection Board (EDPB).
- **Title:** Children — key GDPR concepts.
- **Type:** supervisory authority guidance/topic synthesis.
- **Stable reference:** https://www.edpb.europa.eu/topics/key-gdpr-concepts/children_en
- **Finding:** children receive specific protection; organisations should take extra care with children's personal data and provide information that is clear, easy to understand and age-appropriate, with visual support where useful.
- **Atlas applicability:** supports CHILD-SAFE requirements for comprehensible notices, age-appropriate interaction and stronger default protection.
- **Limitation:** this source is a high-level synthesis and does not replace assessment of specific processing or Italian implementation questions.
- **Informs:** CHILD-SAFE profile; content/notice design; G2 privacy review.
- **Decision state:** EVIDENCE_ONLY.
- **Freshness:** checked 2026-09-25.

### CHILD-002 — Age assurance proportionality and privacy

- **Authority:** European Data Protection Board.
- **Title:** Statement 1/2025 on Age Assurance.
- **Date:** 12 February 2025.
- **Stable reference:** https://www.edpb.europa.eu/our-work-tools/our-documents/statements/statement-12025-age-assurance_en
- **Finding:** age-assurance processing must remain compatible with GDPR principles; the EDPB frames age assurance as a child-safety measure that itself requires data-protection safeguards and proportionality.
- **Atlas applicability:** reinforces the design preference not to introduce identity/age-verification machinery unless the final experience actually requires an age threshold and the mechanism is necessary/proportionate.
- **Limitation:** Atlas Percorsi has not yet established a need for age assurance; this source must not be read as requiring it.
- **Informs:** negative knowledge against unnecessary identity collection; G2 assessment if age-gating is ever proposed.
- **Decision state:** EVIDENCE_ONLY.
- **Freshness:** checked 2026-09-25.

### PRIV-001 — GDPR authoritative text

- **Authority:** European Union / EUR-Lex.
- **Title:** Regulation (EU) 2016/679 (General Data Protection Regulation).
- **Type:** binding EU legislation.
- **Stable reference:** https://eur-lex.europa.eu/eli/reg/2016/679/oj
- **Relevant provisions to map in G2:** principles including data minimisation (Article 5), conditions concerning children's consent in relation to information-society services (Article 8), and data protection by design/default (Article 25).
- **Atlas applicability:** authoritative legal baseline for any personal-data processing analysis. The architecture should first test whether personal-data processing can be avoided rather than inventing a legal basis for unnecessary collection.
- **Limitation:** legal applicability depends on actual processing purposes, architecture and Italian context; G1 does not make a final legal determination.
- **Informs:** Safety/Privacy document; CHILD-SAFE profile; G2 data-flow and necessity analysis.
- **Decision state:** EVIDENCE_ONLY.
- **Freshness:** checked 2026-09-25.

### A11Y-001 — WCAG 2.2

- **Authority:** W3C Web Accessibility Initiative.
- **Title:** Web Content Accessibility Guidelines (WCAG) 2.2.
- **Status/date:** W3C Recommendation, 5 October 2023.
- **Stable reference:** https://www.w3.org/TR/WCAG22/
- **Finding:** WCAG 2.2 provides testable success criteria for accessible web content across desktop and mobile and addresses a broad range of disabilities, while explicitly noting that not all cognitive/language/learning needs are covered by conformance alone.
- **Atlas applicability:** baseline for future G3/G4 acceptance criteria; narrative, animation and interaction cannot be considered accessible merely because a visual prototype works.
- **Limitation:** WCAG conformance alone is insufficient for all cognitive and learning needs relevant to children.
- **Informs:** accessibility acceptance criteria; narrative alternatives; mobile interaction.
- **Decision state:** EVIDENCE_ONLY; conformance target to be fixed at G2/G3.
- **Freshness:** checked 2026-09-25.

### A11Y-002 — Cognitive accessibility: clear and understandable content

- **Authority:** W3C WAI supplemental cognitive accessibility guidance.
- **Stable reference:** https://www.w3.org/WAI/WCAG2/supplemental/objectives/o3-clear-content/
- **Finding:** clear words, short sentences, small text blocks, unambiguous content, supportive visuals and clear layout improve access for people with cognitive and learning disabilities.
- **Atlas applicability:** directly relevant to child-facing prompts, reflection instructions, narrative text and safety/privacy explanations.
- **Limitation:** supplemental guidance is informative and goes beyond the normative WCAG success criteria.
- **Informs:** narrative bible; age-appropriate language; G4 content review.
- **Decision state:** EVIDENCE_ONLY.
- **Freshness:** checked 2026-09-25.

### A11Y-003 — Cognitive accessibility: orientation and focus

- **Authority:** W3C WAI supplemental cognitive accessibility guidance.
- **Stable references:** https://www.w3.org/WAI/WCAG2/supplemental/objectives/o1-understandable/ ; https://www.w3.org/WAI/WCAG2/supplemental/objectives/o2-find/ ; https://www.w3.org/WAI/WCAG2/supplemental/objectives/o5-user-focus/
- **Finding:** familiar patterns, clear hierarchy/signposting and limited distraction help users understand, orient and maintain focus.
- **Atlas applicability:** narrative atmosphere must not become visual noise; exploration should retain clear orientation and predictable interaction.
- **Limitation:** these are design principles, not a complete age-specific usability validation.
- **Informs:** narrative/interaction grammar; future usability tests.
- **Decision state:** EVIDENCE_ONLY.
- **Freshness:** checked 2026-09-25.

## Evidence families still to consolidate

### PED — Pedagogy and learning sciences

Required exact scholarly records:

- self-regulated learning and metacognition;
- learner agency;
- motivation and autonomy/competence/relatedness;
- social-emotional competence development;
- reflection and transfer;
- authentic/situated learning;
- transversal competence development and evidence of competence.

Named starting points already surfaced include Panadero, Pintrich, Vansteenkiste/Ryan/Soenens and van Laar et al. Exact works, editions/DOIs/URLs, populations and applicability notes remain required before G1 PASS.

### FRAME — Italian and additional EU mapping

Still required:

- applicable/current Italian first-cycle curriculum/guideline framework;
- current civic education framework where materially relevant;
- DigComp, GreenComp or EntreComp only for pathways where they add actual mapping value;
- age/progression interpretation rather than framework-name accumulation.

### CHILD/PRIV — Italian supervisory and implementation layer

Still required:

- applicable Garante per la protezione dei dati personali guidance;
- Italian implementation details where material;
- concrete data-flow/third-party analysis once G2 architecture candidates exist.

### A11Y — inclusion and age-specific validation

Still required:

- Italian public-sector accessibility obligations applicable to the final Atlas deployment;
- inclusive design evidence for different learning/communication needs;
- reduced-motion, audio alternatives, keyboard/touch and assistive technology requirements;
- validation with age-appropriate tasks rather than standards-only compliance.

### NARR — Narrative/experiential design

Research and benchmarks still required for:

- narrative learning and experiential framing;
- metaphor comprehension across age bands;
- intrinsic rather than manipulative motivation;
- interaction patterns that preserve agency;
- visual/audio atmosphere without making content inaccessible;
- progressive worlds/maps/artefacts as alternatives to scores and leaderboards.

## Traceability table

| Evidence ID | Domain | Finding | Atlas implication | Decision link | State |
| --- | --- | --- | --- | --- | --- |
| FRAME-001 | framework | LifeComp is non-prescriptive and supports curriculum/activity design | strong candidate competence reference | future D/SPEC | VERIFIED_SOURCE |
| FRAME-002 | framework | EU competence frameworks form a related family | map selectively, do not merge indiscriminately | future D | VERIFIED_SOURCE |
| CHILD-001 | child safety | children require specific protection and age-appropriate information | CHILD-SAFE content/privacy baseline | future D/SPEC | VERIFIED_SOURCE |
| CHILD-002 | child safety/privacy | age assurance itself must be proportionate/privacy-preserving | avoid unnecessary age/identity machinery | NK / future ADR if proposed | VERIFIED_SOURCE |
| PRIV-001 | privacy | GDPR supplies binding minimisation/design/default/children baseline | avoid unnecessary personal-data processing | future D/ADR | VERIFIED_SOURCE |
| A11Y-001 | accessibility | WCAG 2.2 is testable baseline but not sufficient for all cognitive needs | standards + cognitive/usability validation | future SPEC | VERIFIED_SOURCE |
| A11Y-002 | cognitive accessibility | clear/simple content improves comprehension | child-facing narrative/instructions must be concise and clear | future SPEC | VERIFIED_SOURCE |
| A11Y-003 | cognitive accessibility | orientation, familiarity and focus matter | atmosphere cannot obscure navigation/task | future SPEC | VERIFIED_SOURCE |
| PED-TBD | pedagogy | exact bibliography still required | do not freeze pedagogical model yet | — | OPEN |
| FRAME-IT-TBD | Italian framework | authoritative mapping required | Italian curriculum alignment remains open | — | OPEN |
| PRIV-IT-TBD | Italian privacy | supervisory/implementation mapping required | final G2 legal/privacy analysis remains open | — | OPEN |
| NARR-TBD | narrative | research/benchmarks required | metaphor selection deferred | — | OPEN |

## G1 completion rule

No open evidence family may be treated as satisfied merely because it was discussed in chat. G1 PASS requires stable, retrievable sources, applicability/limitations and traceability to the pedagogical/domain model or to an explicit open decision. Legal sources are recorded as evidence; final legal conclusions depend on the governed architecture and must not be inferred prematurely.