# PW-CONSTRAINTS-TRADEOFFS-01 — Una soluzione, molti vincoli

**Gate:** G1 — proposal for governed pathway registration  
**Status:** PROPOSED / HUMAN_REVIEW_PENDING / NOT_RUNTIME_AUTHORIZED  
**Developmental band:** LOWER_SECONDARY_CANDIDATE / HUMAN_VALIDATION_REQUIRED  
**Territories:** `design`, `world`  
**Runtime:** NOT_AUTHORIZED

## 1. Purpose

Create a materially different transversal pathway for the Atlas Experience Engine generality proof.

The learner is asked to design or select a solution under multiple constraints, make trade-offs explicit, and revise the solution when one requirement changes.

Target competence:

> Progettare una soluzione valutando vincoli e compromessi e rivederla quando cambia un requisito.

This is not a second version of `PW-MISSING-INFORMATION-01`. Its intended cognitive structure is:

`EXPLORE → CONNECT → BUILD → REFRAME → TRANSFER`

rather than a missing-information / decision-first sequence.

## 2. Intended observable performances

The pathway may support bounded evidence that the learner can:

- identify multiple relevant constraints in the presented task;
- connect a design choice to more than one consequence;
- construct or select a candidate solution under explicit constraints;
- explain a trade-off in task terms;
- revise the candidate when a requirement changes;
- apply the same constraint/trade-off strategy in a changed context.

Completion does not establish durable transversal competence. Changed-context success is a transfer probe, not proof of stable transfer.

## 3. Claim ceiling and prohibited inferences

The pathway must not infer personality, creativity as a stable trait, intelligence, maturity, motivation, risk attitude, emotional state, social value or psychological profile.

No route, choice, revision frequency or completion pattern may be converted into a learner score or trait.

## 4. Candidate scene grammar

The implementation candidate should demonstrate a composition that is structurally different from the first pathway:

1. **EXPLORE** — inspect a design situation and its explicit constraints;
2. **CONNECT** — relate alternatives to consequences across several constraints;
3. **BUILD** — assemble/select a candidate solution;
4. **REFRAME** — introduce one changed requirement and require revision;
5. **TRANSFER** — apply the same reasoning pattern to a materially different context;
6. terminal reflection/summary may be used only to name the strategy already exercised.

At least one choice must create a meaningful downstream consequence. A cosmetic branch does not qualify.

## 5. Candidate contexts

Initial context candidate: design a small shared solution where cost, durability, resource use and usability cannot all be maximised simultaneously.

Transfer context candidate: a different domain surface with a changed set of constraints, so the learner must transfer the method rather than remember an answer.

Final contexts and wording require pedagogical/developmental human review.

## 6. Privacy and child-safety boundary

Version 1 requires:

- no learner account or identifier;
- no server-side learner-response write;
- no analytics or behavioural profiling;
- no score, leaderboard or hidden performance metric;
- no sensitive or personal disclosure;
- no microphone, camera, location or contacts;
- no generative conversational agent;
- no relational or pseudo-therapeutic framing;
- learner choices held in volatile local session state only;
- explicit restart/reset;
- no persistence unless separately governed.

Any change to these conditions is a material governance change and reopens constitutional review.

## 7. Interaction/data-flow candidate

| Interaction | Input | Processing | Server | Retention |
|---|---|---|---|---|
| inspect constraints | none | client | no | none |
| compare alternatives | bounded choice | client | no | session |
| build/select candidate | bounded construction/choice | client | no | session |
| inspect consequence | none/bounded | client | no | session |
| revise after changed requirement | bounded choice | client | no | session |
| transfer probe | bounded choice | client | no | session |

Free text is not required for the first implementation candidate.

## 8. Accessibility boundary

The candidate must preserve the Experience Engine requirements already approved in TRAMA PR #216:

- complete keyboard operation;
- deterministic focus movement;
- semantic headings and grouping;
- native controls when suitable;
- no essential colour-only distinction;
- zoom/reflow support;
- touch-target suitability;
- reduced-motion compatibility;
- meaningful alternative representation for visual content.

No accessibility conformance claim is created by this dossier.

## 9. Relationship to existing authority

- Arena remains curriculum authority.
- TRAMA governs this cross-system pathway proposal.
- Atlas may register the pathway only after explicit Human Review of an exact TRAMA head.
- Registration in Atlas would create an implementation candidate only.
- Successful implementation/CI/Q evidence does not imply student runtime authorization.
- Smart→Percorsi association remains separately governed.
- DOS-A1 remains `RUNTIME_DEFERRED`.

## 10. Generality-proof role

If this proposal is approved for registration, Atlas must implement it using the same:

- ChallengeKernel v1;
- ExperienceDefinition v1;
- seven cognitive primitives;
- generic composer/factory;
- shared ExperienceRuntime;
- qualification infrastructure.

No `pw-constraints-tradeoffs-01` literal may enter generic engine/composer/workflow logic.

The generality proof fails if pathway-specific engine infrastructure is needed.

## 11. Human Review questions

Human Review should decide only whether this exact proposal is suitable to become a governed **Atlas implementation candidate**.

Review should check:

1. whether the target competence and claim ceiling are acceptable;
2. whether the design/world territories are appropriate;
3. whether the proposed cognitive structure is materially different enough to test generality;
4. whether the lower-secondary developmental candidate is reasonable for implementation testing;
5. whether privacy/child-safety boundaries are sufficient at proposal level;
6. whether the proposal may receive a governed pathway identity in Atlas.

This review does **not** decide runtime promotion.

## 12. Decision requested

Requested state after a PASS:

`GOVERNED_PATHWAY_TARGET_APPROVED_FOR_IMPLEMENTATION_CANDIDATE / NOT_RUNTIME_AUTHORIZED`

If approved, Atlas may register `pw-constraints-tradeoffs-01` with the exact TRAMA authority head and proceed with the second-pathway generality proof.

Until that exact-head decision exists, Atlas must continue to reject this pathway as unregistered.

