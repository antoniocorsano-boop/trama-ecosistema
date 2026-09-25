# CAP-ATLAS-PERCORSI — Safety, Privacy & Minor Protection

**Gate:** G1 — Discovery  
**Status:** CANDIDATE_CONSTRAINTS  
**Profile:** CHILD-SAFE proposed

## Safety objective

Atlas Percorsi is intended for public use and may be used directly by minors. The product should therefore be designed so that meaningful participation does not depend on disclosing personal information.

## Candidate non-negotiable direction for G2 review

- no student account;
- no student authentication;
- no server-side personal student profile;
- no individual behavioural tracking;
- no request for name, email, school/class, address or precise location;
- avoid open free-text submission to Atlas;
- no default public/social sharing of personal artefacts;
- no psychological profiling or diagnosis;
- no competence/personality identity scores;
- no advertising or manipulative engagement mechanics in the learning experience;
- no external service may silently introduce tracking or disclosure surfaces.

These items must be tested against authoritative legal/privacy evidence and formally governed at G2; this G1 document does not itself create new legal conclusions.

## Local-first personal artefacts

Candidate model:

1. Atlas serves the public learning experience without identifying the learner.
2. Personal reflection/progress that needs persistence remains on the learner's device where feasible.
3. The learner may voluntarily export/download an artefact (for example a journey notebook/map/document) to the device.
4. Local state must have a comprehensible reset/delete mechanism.
5. Export does not imply upload back to Atlas.
6. Any future synchronization proposal requires a separate governance cycle and cannot inherit authorization from the local-only model.

## Disclosure-surface inventory

Every implementation specification must explicitly classify:

| Surface | Default |
| --- | --- |
| Name/email/profile fields | PROHIBITED / not needed |
| Open free text sent to server | PROHIBITED by default |
| File/image upload | PROHIBITED by default |
| Camera/microphone | NOT_REQUIRED by default |
| Precise location | PROHIBITED / not needed |
| Analytics identifying a learner | PROHIBITED |
| Local storage | ALLOWED only when purpose/minimisation/reset are specified |
| Download/export | CANDIDATE_ALLOWED under learner control |
| External links | REVIEW_REQUIRED |
| Third-party embeds/scripts | REVIEW_REQUIRED |
| Share API | OFF by default; separate review if proposed |

## Content safety

Prompts must not pressure a minor to disclose traumatic, medical, family, sexual, religious, political or other sensitive personal information. Reflection should be possible without submitting the response to Atlas.

Where a pedagogical activity touches emotions, identity, relationships or difficult experiences, the design must distinguish educational self-reflection from psychological assessment and identify when teacher/adult mediation is appropriate.

## Logs and diagnostics

Technical logs must be designed not to become an accidental student-data collection channel. G3 must specify allowed diagnostic fields and prohibited payloads before runtime implementation.

## Open G1/G2 questions

- exact authoritative Italian/EU legal and supervisory sources applicable to the final architecture;
- whether any strictly anonymous aggregate operational metrics are necessary at all;
- local-state retention/reset semantics;
- safe export formats and metadata minimisation;
- outbound-link policy for minors;
- content review/escalation model for sensitive pedagogical themes;
- age-band differentiation and adult mediation rules.
