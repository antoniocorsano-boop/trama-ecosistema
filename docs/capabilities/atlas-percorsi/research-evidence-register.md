# CAP-ATLAS-PERCORSI — Research & Evidence Register

**Gate:** G1 — Discovery  
**Status:** IN_PROGRESS / AUTHORITATIVE_BASELINE_EXPANDED  
**Rule:** research is evidence, not approval.

## Evidence record schema

Every material source is recorded with: `EVIDENCE-ID`; authority/source; source type; date/version; stable reference; population/context; relevant finding; applicability; limitations/uncertainty; design/governance questions informed; decision link; freshness state.

## Evidence quality rules

1. Prefer primary legislation, official institutional frameworks and peer-reviewed synthesis/reviews.
2. Never generalise evidence from adults/university students directly to children without an age/population limitation note.
3. A framework name is not a design decision: record the specific implication it supports.
4. Legal/supervisory material is evidence for G2 analysis, not an automatic legal conclusion.
5. Narrative evidence supports experimentation; it does not justify decorative immersion or engagement maximisation.
6. G1 PASS requires stable sources and explicit limitations, not bibliography volume.

## Authoritative and scholarly records

### FRAME-001 — LifeComp
- **Authority:** European Commission, Joint Research Centre.
- **Reference:** https://joint-research-centre.ec.europa.eu/scientific-activities/key-competences-lifelong-learning/lifecomp_en
- **Context/finding:** conceptual, non-prescriptive framework describing nine learnable personal, social and learning-to-learn competences and usable as a basis for curricula and learning activities.
- **Atlas applicability:** strong candidate reference for competence taxonomy/pathway design.
- **Limitation:** does not prescribe age progression, assessment, Italian alignment or Atlas UX.
- **State:** VERIFIED_SOURCE; checked 2026-09-25.

### FRAME-002 — EU Key Competences Recommendation 2018
- **Authority:** Council of the European Union / EUR-Lex.
- **Reference:** https://eur-lex.europa.eu/legal-content/IT/ALL/?uri=CELEX:32018H0604(01)
- **Finding:** Member States are invited to support development of key competences from an early age and throughout life, including personal, social and learning-to-learn competence.
- **Atlas applicability:** establishes European policy context and supports early, progressive competence development.
- **Limitation:** recommendation/framework, not an Atlas progression model or assessment rubric.
- **State:** VERIFIED_SOURCE; checked 2026-09-25.

### FRAME-IT-001 — Italian National Curriculum Guidelines 2025/2026 transition
- **Authority:** Ministero dell'Istruzione e del Merito; official publication in Gazzetta Ufficiale.
- **Instrument:** Decreto 9 dicembre 2025, n. 221, Regolamento recante indicazioni nazionali per il curricolo della scuola dell'infanzia e del primo ciclo d'istruzione.
- **Official reference:** https://www.gazzettaufficiale.it/eli/id/2026/01/27/26G00021/SG
- **Finding:** the regulation adopts new national curriculum guidelines replacing those attached to D.M. 254/2012; from school year 2026/2027 schools adopt them beginning with first classes of primary and lower-secondary school, with gradual curriculum revision.
- **Atlas applicability:** this is the current Italian first-cycle normative baseline that Atlas Percorsi must map against, while representing the transitional/gradual implementation correctly.
- **Limitation:** G1 must still perform content-level mapping of the annexed Guidelines to candidate pathways; adoption timing must not be simplified into an all-classes-at-once assumption.
- **Informs:** Italian curriculum mapping; age-band progression; Arena relationship at G2.
- **State:** VERIFIED_PRIMARY_SOURCE; checked 2026-09-25.

### PED-001 — Panadero 2017: Self-Regulated Learning models review
- **Author:** Ernesto Panadero.
- **Title:** A Review of Self-regulated Learning: Six Models and Four Directions for Research.
- **Publication:** Frontiers in Psychology 8:422 (2017); DOI 10.3389/fpsyg.2017.00422.
- **Reference:** https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2017.00422/full
- **Finding:** SRL integrates cognitive, metacognitive, behavioural, motivational and emotional/affective dimensions; the review compares six major models and notes differential effects by developmental stage/educational level.
- **Atlas applicability:** supports a multidimensional, reflective learning model and cautions against one undifferentiated pathway across ages.
- **Limitation:** a review of SRL models is not evidence that the current Atlas cycle is uniquely correct; age-specific design requires further evidence/validation.
- **Informs:** pedagogical cycle; age progression; evidence model.
- **State:** VERIFIED_SCHOLARLY_SOURCE; checked 2026-09-25.

### CHILD-001 — Specific protection of children under GDPR
- **Authority:** European Data Protection Board.
- **Reference:** https://www.edpb.europa.eu/topics/key-gdpr-concepts/children_en
- **Finding:** children receive specific protection; information should be clear, easy to understand and age-appropriate, with visual support where useful.
- **Atlas applicability:** supports CHILD-SAFE requirements for comprehensible interaction and stronger default protection.
- **Limitation:** high-level synthesis; does not replace processing-specific analysis.
- **State:** VERIFIED_AUTHORITY_SOURCE; checked 2026-09-25.

### CHILD-002 — EDPB Statement 1/2025 on Age Assurance
- **Authority:** European Data Protection Board.
- **Date:** 12 February 2025, with later minor corrections.
- **Reference:** https://www.edpb.europa.eu/system/files/2025-04/edpb_statement_20250211ageassurance_v1-2_en.pdf
- **Finding:** age assurance can be a child-safety measure but must itself respect data-protection principles and proportionality.
- **Atlas applicability:** supports avoiding identity/age-verification machinery unless actually necessary.
- **Limitation:** does not establish that Atlas Percorsi requires age assurance.
- **State:** VERIFIED_AUTHORITY_SOURCE; checked 2026-09-25.

### CHILD-003 — UN Committee on the Rights of the Child, General Comment No. 25
- **Authority:** UN Committee on the Rights of the Child.
- **Instrument:** General comment No. 25 (2021) on children's rights in relation to the digital environment, CRC/C/GC/25.
- **Reference:** https://docstore.ohchr.org/SelfServices/FilesHandler.ashx?enc=6NryZJ6Nb2eroc9R7Z2SLdxkeoHPKm2F2XbXpOzFgtsvC20o6u%2FNdFYjfsfkqTMamCVcCjfICtEJ2W4uwn4SJQ%3D%3D
- **Finding:** children's rights apply in the digital environment; digital inclusion, protection, participation and the child's best interests must be considered together.
- **Atlas applicability:** CHILD-SAFE must not be reduced to privacy alone: access, participation, agency and protection must be balanced.
- **Limitation:** rights framework, not a detailed Atlas technical specification.
- **Informs:** child-rights impact lens; accessibility/inclusion; human agency.
- **State:** VERIFIED_PRIMARY_INSTITUTIONAL_SOURCE; checked 2026-09-25.

### PRIV-001 — GDPR principles and data minimisation
- **Authority:** European Union / EUR-Lex.
- **Reference:** https://eur-lex.europa.eu/eli/reg/2016/679
- **Relevant provisions:** Article 5 includes purpose limitation, data minimisation and storage limitation; Article 25 requires data protection by design/default.
- **Atlas applicability:** authoritative baseline. Architecture should first test whether personal-data processing can be avoided instead of seeking a basis for unnecessary collection.
- **Limitation:** final applicability depends on actual data flows, purposes and architecture.
- **State:** VERIFIED_PRIMARY_LEGISLATION; checked 2026-09-25.

### PRIV-IT-001 — Garante: Minori
- **Authority:** Garante per la protezione dei dati personali.
- **Reference:** https://www.garanteprivacy.it/temi/minori
- **Finding:** minors merit specific protection; privacy information directed to them must be concise, transparent, intelligible, accessible and expressed in clear language appropriate to minors.
- **Atlas applicability:** reinforces no-unnecessary-data direction and age-appropriate privacy communication.
- **Limitation:** thematic guidance must be combined with GDPR and concrete processing analysis.
- **State:** VERIFIED_ITALIAN_AUTHORITY_SOURCE; checked 2026-09-25.

### PRIV-IT-002 — Garante: La scuola a prova di privacy
- **Authority:** Garante per la protezione dei dati personali.
- **Reference:** https://www.garanteprivacy.it/scuola
- **Finding:** current school guidance addresses protection of personal data in educational contexts and digital technologies, including AI and online publication/disclosure risks.
- **Atlas applicability:** useful Italian supervisory baseline for school-facing integration and teacher-mediated uses.
- **Limitation:** Atlas public student use is not automatically identical to processing performed by a school as controller; roles must be resolved at G2.
- **State:** VERIFIED_ITALIAN_AUTHORITY_SOURCE; checked 2026-09-25.

### A11Y-001 — WCAG 2.2
- **Authority:** W3C Web Accessibility Initiative.
- **Reference:** https://www.w3.org/TR/WCAG22/
- **Finding:** testable accessibility baseline across desktop/mobile; conformance alone does not cover every cognitive/language/learning need.
- **Atlas applicability:** future G3/G4 acceptance baseline.
- **Limitation:** requires complementary cognitive and age-appropriate usability validation.
- **State:** VERIFIED_STANDARDS_SOURCE; checked 2026-09-25.

### A11Y-002 — W3C cognitive accessibility: clear content
- **Authority:** W3C WAI supplemental guidance.
- **Reference:** https://www.w3.org/WAI/WCAG2/supplemental/objectives/o3-clear-content/
- **Finding:** clear words, short sentences, small blocks, unambiguous content, supportive visuals and clear layout improve comprehension.
- **Atlas applicability:** directly constrains prompts, narrative text, instructions and notices.
- **Limitation:** informative guidance, not a complete child usability standard.
- **State:** VERIFIED_STANDARDS_GUIDANCE; checked 2026-09-25.

### NARR-001 — Wu & Chen systematic review of educational digital storytelling
- **Authors:** Jing Wu, Der-Thanq Victor Chen.
- **Publication:** Computers & Education; DOI 10.1016/j.compedu.2019.103786.
- **Reference:** https://doi.org/10.1016/j.compedu.2019.103786
- **Population/context:** systematic review of 57 educational digital storytelling studies across primary, secondary and higher education.
- **Finding:** digital storytelling has been used with multiple pedagogical orientations and outcome types; the review also warns against an overly positive/undifferentiated interpretation of reported outcomes.
- **Atlas applicability:** supports treating narrative as a pedagogical design candidate with multiple functions, not decoration.
- **Limitation:** heterogeneous studies, contexts and outcomes; does not validate a particular Atlas metaphor or interface.
- **State:** VERIFIED_SCHOLARLY_SYNTHESIS; checked 2026-09-25.

### NARR-002 — Recent systematic review/meta-analysis of educational digital storytelling (2014–2024)
- **Type:** systematic review combining meta-analysis and meta-synthesis.
- **Reference:** https://www.sciencedirect.com/org/science/article/abs/pii/S174156592500019X
- **Population:** quantitative synthesis of 17 interventions/683 participants and qualitative synthesis of 48 studies/2,162 participants.
- **Finding:** reported small-to-medium positive cognitive and affective effects, alongside benefits such as reflection/creativity/collaboration and practical challenges such as technical difficulty and production time.
- **Atlas applicability:** supports careful prototyping of narrative experiences and measuring pedagogical value rather than assuming immersion is beneficial.
- **Limitation:** heterogeneous educational populations/designs; publication/context limitations require caution; not an age-specific Atlas prescription.
- **State:** VERIFIED_RECENT_SYNTHESIS; checked 2026-09-25.

## Current evidence-to-design implications

| Evidence | Finding | Current implication | Status |
| --- | --- | --- | --- |
| FRAME-IT-001 | new Italian Guidelines replace 2012 framework with gradual 2026/27 adoption | map Atlas against current framework and represent transition explicitly | G1 WORK |
| PED-001 | SRL is multidimensional and developmentally sensitive | design age-band progression; do not freeze one universal interaction | G1 WORK |
| CHILD-001/003 | minors require protection, comprehension, participation and inclusion | CHILD-SAFE is broader than privacy; preserve agency and accessibility | G1 WORK |
| PRIV-001/IT-001 | minimisation/design-by-default + minor-specific safeguards | no-account/no-profile/local-first remains preferred architecture candidate | G2 DECISION PENDING |
| A11Y-001/002 | standards + cognitive clarity needed | narrative cannot obscure task, orientation or comprehension | G3/G4 INPUT |
| NARR-001/002 | narrative can support learning but evidence is heterogeneous | test metaphor pedagogically; do not optimise for spectacle/engagement | G1/G4 INPUT |

## Negative-knowledge candidates strengthened by evidence

- **NK-001 numerical identity scoring:** remains candidate rejection; competence development is not a stable personality label.
- **NK-003 data-bearing personalisation:** strengthened; personalisation must not be equated with server-side identity/tracking.
- **NK-004 library-first design:** strengthened; narrative evidence does not justify choosing a technical effect/library before pedagogical purpose.
- **NK-005 age-uniform experience:** NEW candidate rejection. Do not assume one identical cognitive/narrative interaction is developmentally appropriate from early primary through lower secondary.
- **NK-006 immersion-as-value:** NEW candidate rejection. Do not equate richer animation, sound or narrative density with better learning; atmosphere must prove pedagogical and accessibility value.

## Remaining G1 evidence gaps

1. **Age progression:** primary vs lower-secondary developmental/learning evidence, with particular attention to self-regulation, reflection, agency and metaphor comprehension.
2. **Italian Guidelines content mapping:** inspect the annexed 2025 Guidelines at competence/discipline/profile level rather than citing only the adoption decree.
3. **Civic education:** include current Italian framework only where a pathway materially touches citizenship/responsibility.
4. **Accessibility law/deployment:** map Italian public-sector accessibility obligations to the eventual Atlas deployment model.
5. **Narrative/metaphor by age:** find age-sensitive evidence and benchmarks; avoid extrapolating from university populations.
6. **Local-first technical privacy:** at G2, model actual browser storage/export/reset/telemetry/third-party data flows before any legal conclusion.
7. **Child-rights impact review:** convert CHILD-003 into a practical review checklist without inventing a new authority.

## G1 completion rule

G1 does not pass because sources have been collected. It passes only when the evidence is sufficient to support a reviewable pedagogical/domain model, age progression, child-safety/privacy constraints, accessibility/inclusion constraints, narrative decision criteria, documented alternatives/negative knowledge and explicit open questions. Any material conclusion must remain traceable to source, population/context, limitation and governed implication.