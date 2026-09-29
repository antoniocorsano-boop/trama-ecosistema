# CAP-ATLAS-PERCORSI — Safety, Privacy & Minor Protection

**Gate:** G1 — Discovery  
**Status:** CANDIDATE_CONSTRAINTS / AUTHORITATIVE_EVIDENCE_LINKED  
**Profile:** CHILD-SAFE proposed

## Safety objective

Atlas Percorsi is intended for public use and may be used directly by minors. Meaningful participation should therefore not depend on disclosing personal information.

The evidence base now includes GDPR Articles 5/25, EDPB child-protection and age-assurance guidance, Italian Garante material on minors/schools, and UN CRC General Comment No. 25 on children's rights in the digital environment. These sources strengthen the direction but final processing roles/legal conclusions remain G2 work.

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

## Rights-based extension

CHILD-SAFE is not only a privacy profile. Consistent with the UN child-rights digital-environment framework, design review must consider together:

- protection;
- meaningful access and inclusion;
- participation/agency;
- comprehensibility;
- privacy;
- best interests of the child.

Safety controls must not unnecessarily remove meaningful educational agency or create exclusion.

## Local-first personal artefacts

Candidate model:

1. Atlas serves the public learning experience without identifying the learner.
2. Personal reflection/progress that needs persistence remains on the learner's device where feasible.
3. The learner may voluntarily export/download an artefact to the device.
4. Local state must have a comprehensible reset/delete mechanism.
5. Export does not imply upload back to Atlas.
6. Any future synchronization proposal requires a separate governance cycle and cannot inherit authorization from the local-only model.

## Disclosure-surface inventory

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
| Age assurance | NOT_REQUIRED unless a governed necessity is demonstrated |

## Data-flow proof obligation for G2/G3

Before implementation, produce a data-flow table for every browser/runtime surface:

`event/action → data created → storage location → recipient → retention → deletion/reset → necessity → third party`.

A blank assumption such as “anonymous” is insufficient. Telemetry, error reporting, CDN/server logs, third-party fonts/media, embedded content and export metadata must be considered explicitly.

## Content safety

Prompts must not pressure a minor to disclose traumatic, medical, family, sexual, religious, political or other sensitive personal information. Reflection should be possible without submitting the response to Atlas.

Where an activity touches emotions, identity, relationships or difficult experiences, design must distinguish educational self-reflection from psychological assessment and identify when teacher/adult mediation is appropriate.

## Logs and diagnostics

Technical logs must not become an accidental student-data collection channel. G3 must specify allowed diagnostic fields and prohibited payloads before runtime implementation. Error messages shown to users must not expose technical identifiers or encourage disclosure of personal information.

## Italian school-context boundary

Garante school guidance is relevant when Atlas is used in/through schools, but Atlas public use and school institutional processing are not assumed to have identical controller/processor roles. G2 must model the actual deployment and actors rather than importing school roles by analogy.

## Age-assurance boundary

The EDPB recognises age assurance as a possible child-safety mechanism in some contexts while requiring data-protection safeguards and proportionality. Atlas Percorsi currently has no established need for age verification. Therefore age assurance must not be added merely because users are minors.

## Open G1/G2 questions

- whether any aggregate operational metrics are necessary at all and, if so, whether they can avoid personal data;
- local-state retention/reset semantics;
- safe export formats and metadata minimisation;
- outbound-link policy for minors;
- content review/escalation model for sensitive pedagogical themes;
- age-band differentiation and adult mediation rules;
- third-party asset/service policy;
- concrete role allocation if schools embed or recommend Atlas;
- child-rights impact checklist derived from authoritative sources without creating a new authority.
