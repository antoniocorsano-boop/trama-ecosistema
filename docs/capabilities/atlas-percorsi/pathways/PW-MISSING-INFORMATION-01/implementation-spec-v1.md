# PW-MISSING-INFORMATION-01 — Implementation Specification v1

**Gate:** G1 — controlled implementation / validation preparation  
**Status:** IMPLEMENTATION_SPEC_CANDIDATE  
**Constitutional document review:** `constitutional-review-g1-v2.md` — DOCUMENT_PASS / HUMAN_VALIDATION_PENDING  
**Runtime:** NOT_AUTHORIZED

## 1. Objective
Build one controlled prototype with two equivalent presentation conditions so the narrative metaphor can be tested rather than assumed:

- **Condition N — Narrative/Journey:** restrained crossroads/journey representation for continuity and consequence;
- **Condition L — Literal:** non-metaphorical panels using the same facts, choices, consequences and wording.

The pedagogical construct, option count, answer logic, order of information and feedback content must remain equivalent. Presentation condition must never alter scoring because no learner score is authorised.

## 2. Non-negotiable architecture
Static/client-side prototype. No login, account, learner identifier, cookies for learner profiling, response API, database write, telemetry, analytics, free text, microphone, camera, location, advertising, third-party behavioural tracking or generative/conversational agent.

Learner choices live in volatile client state and disappear when the session ends/reloads. The optional strategy trace is a fixed, non-personal document generated locally; save/discard is learner-controlled and equally easy.

Any deviation is a material governance change and blocks implementation until reviewed.

## 3. Common state model
States: `S1_ORIENT`, `S2_MISSING_INFO`, `S3_CHOOSE_PROCESS`, `S4_CONSEQUENCE`, `S5_REVISE`, `S6_NAME_STRATEGY`, `S7_CHANGED_CONTEXT`, `S8_TRANSFER_PROBE`, `S9_TRACE_CONTROL`, `DONE`.

Allowed session state only:
- presentationCondition: N | L;
- currentScene: enum;
- selectedProcess: A | B | C | null;
- revisionDecision: KEEP | REVISE | null;
- boundedAnswers: map of question-id to enum;
- traceDecision: KEEP_LOCAL | DISCARD | null.

Forbidden state: name, email, age/date of birth, class/student identifier, biography, emotion label, psychological inference, free text, stable device identifier, cross-session history.

## 4. Scene contract
Each scene renders in this order: scene heading → known facts → one learner task → bounded options → informational consequence/feedback → navigation. Only one meaningful change is introduced per scene.

### S1 Orientation
Candidate text: “Osserva la situazione. Che cosa sta succedendo?” Present fictional group and decision using ordinary low-intensity context. No learner-personal analogy prompt.

### S2 Missing information
“Prima di decidere, quale informazione manca?” Bounded evidence options. Existing facts remain visible.

### S3 Process choice
“Quale modo di decidere vuoi provare?” Maximum three short, equally salient process options. No moral labels, green/red correctness coding or preferred spatial position.

### S4 Consequence
“Che cosa cambia dopo questa scelta?” Show an inspectable consequence/trade-off. Feedback describes what the process did and what remains unresolved; never “bravo”, “sbagliato”, “sei stato…”.

### S5 Revision
“Vuoi tenere questa scelta o provarne un’altra?” KEEP and REVISE equal prominence/effort. Revision carries no penalty.

### S6 Strategy abstraction
“Quale strategia aiuta a controllare ciò che mancava?” Introduce concise literal strategy label. Narrative condition may retain visual context but essential abstraction is textual.

### S7 Changed context
“La stessa strategia può servire anche qui?” New surface situation, same missing-information relation. Earlier answer position/colour must not predict the intended reasoning.

### S8 Transfer probe
“Prima di decidere, che cosa conviene controllare?” Move outside original social surface to information/source evaluation. Bounded options; no claim of durable transfer.

### S9 Trace control
“Vuoi conservare questa traccia sul tuo dispositivo o eliminarla?” Explain explicitly: the trace contains the fixed strategy summary, not the learner's route/history; nothing is sent to Atlas. KEEP_LOCAL and DISCARD equal salience.

## 5. Condition N — Journey representation
Use a stable spatial composition only where it aids orientation. Crossroads represent alternative processes, not good/bad identities. Consequence changes occur locally. Characters are fictional participants and never speak to the learner as friends/confidants.

Prohibited visual semantics: halo/reward glow on one route; danger/shame coding for another; size/contrast imbalance suggesting correct route; emotional facial reactions that praise/blame learner choice; automatic motion designed to retain attention; collectible/reward loops.

## 6. Condition L — Literal representation
Use neutral cards/panels for known facts, missing information, process options, consequence and revision. Preserve the same wording, option order randomisation policy, information availability and interaction count as Condition N. Literal condition is a full pedagogical equivalent, not an accessibility fallback with reduced content.

## 7. Feedback grammar
Allowed: describe evidence, consequence, unresolved constraint, comparison or possible next action.

Examples of form (not final script): “Con questa scelta il gruppo decide subito, ma questa informazione resta sconosciuta.” / “Ora conosciamo X; prima di decidere manca ancora Y.”

Prohibited: identity judgement, emotional diagnosis, moral praise/blame, manipulation, urgency, loss framing, relational reassurance, comparison with peers.

## 8. Accessibility implementation acceptance criteria
Before any human learner use:
- full keyboard operation and logical focus order;
- visible focus at all interactive controls;
- semantic headings, groups and button/control names;
- screen-reader reading order equal to visual task order;
- no colour-only essential meaning;
- measured text/control contrast against governing baseline;
- usable text zoom/reflow without horizontal task loss;
- mobile target sizing/spacing checked;
- no essential motion and reduced/no-motion equivalence;
- all meaningful images have appropriate text alternatives or are programmatically decorative;
- Condition L demonstrates construct equivalence without metaphor;
- final Italian wording receives cognitive-language/developmental review.

No WCAG/AgID conformance label before measured implementation testing.

## 9. Privacy/security acceptance criteria
Network inspection during the learner interaction must show no learner-response request. No third-party analytics/tracking scripts. No response data in URL/query string, logs intentionally produced by the application, localStorage, IndexedDB or cookies. Session state should remain in memory only. If local trace download is implemented, content is fixed strategy text and contains no response history or identifier.

A Content Security Policy and dependency review are implementation concerns; they cannot weaken the no-data architecture.

## 10. Developmental/pedagogical validation packet
Reviewers receive both conditions and record, separately:
- comprehension of each prompt;
- whether options are distinguishable without adult explanation;
- whether any route appears morally/correctness-coded before reasoning;
- whether consequence feedback supports reconsideration;
- whether Journey improves orientation/continuity, adds distraction, or changes interpretation;
- whether images displace relevant textual/causal information;
- whether S7/S8 require the intended relation rather than memorised answer position;
- whether wording invites unintended personal disclosure despite bounded inputs.

No biometric, emotional-state or covert behavioural inference is part of validation.

## 11. Narrative-vs-literal decision rule
Journey is retained only if human/implementation evidence shows a functional benefit or at least no material degradation in comprehension, accessibility, cognitive continuity and transfer-probe validity. It is revised/rejected if it introduces answer cues, distraction, metaphor dependence, excess memory demand or weaker accessibility. Engagement/liking alone cannot justify retention.

## 12. Implementation review triggers
Reopen governance before merge if implementation adds or changes: free text; personal prompts; persistence/synchronisation; server response transmission; analytics; adaptive profiling/scoring; generative agent; emotional/relational retention; option count/complexity; learner-facing script; developmental band; route salience; character affect; essential motion; teacher claim ceiling.

## 13. Required implementation evidence bundle
An implementation candidate must provide:
1. exact commit SHA;
2. file/change inventory;
3. screenshots at representative desktop/mobile widths for N and L;
4. keyboard/focus evidence;
5. accessibility test results and known limitations;
6. network/no-response-data evidence;
7. dependency/security check;
8. final learner-facing script;
9. reviewer packet/results for pedagogical, developmental and child-safety/privacy review;
10. explicit statement that runtime remains unauthorised until governance promotion.

## 14. Definition of done for this phase
This specification phase is complete when the implementation team can build both conditions without inventing new learner-data, pedagogical, narrative or relational behaviour. It does not authorise public deployment or learner testing. Any ambiguity that would require such invention must return to the dossier/contract rather than being resolved silently in code.