# Atlas Percorsi — Student Library Product Contract v1

**Status:** PRODUCT_RECOVERY_CANDIDATE / NOT_RUNTIME_AUTHORIZED  
**Date:** 2026-10-03  
**Authority basis:** recovered package `ATLAS-PERCORSI-G1-PR96` @ `dfb5b106708bee88016907c13ee0d104c093e7ca`

## 1. Recovery decision

The Experience Engine is infrastructure. It is not the product definition of Atlas Percorsi.

Every learner-facing Percorso MUST be derived from the recovered PR #96 product knowledge package before implementation. Passing engine contracts, browser tests, build or runtime-readiness gates is necessary but never sufficient to classify a pathway as student-product ready.

The mandatory product chain is:

`territory → competence need → dossier → evidence → experiential grammar → narrative identity → safeguards → controlled storyboard/screenplay → consequence review → validation plan → implementation → human product review → runtime authorization`.

A generic graph that skips subject/premise, storyboard, narrative/interaction rationale or progression evidence is a **technical fixture**, not a completed student Percorso.

## 2. Student library

Percorsi is an open library, not a fixed set of eight courses. The recovered PR #96 package currently proposes six **candidate organisational territories** as a provisional navigation/design hypothesis:

1. **Conosci te stesso** — self-awareness without personality profiling;
2. **Impara a imparare** — metacognition, organisation, attention and strategy selection;
3. **Incontra gli altri** — listening, communication, collaboration, perspective and conflict management;
4. **Affronta problemi** — critical thinking, uncertainty, decision making, creativity and problem solving;
5. **Agisci nel mondo** — responsibility, citizenship, sustainability and digital/information participation;
6. **Progetta** — goals, initiative, planning and turning intention into action.

These territories are **not an approved taxonomy and are not binding authority**. Until a separate governance decision approves or replaces them, Atlas may use them only for provisional lab/navigation grouping and pathway discovery. Authors MUST preserve their candidate status, MUST NOT present them as authoritative learner classifications, and MUST NOT infer psychological dimensions or learner labels from them. The product process in this contract is binding for recovery work; the six-territory hypothesis is not.

## 3. Experience quality floor

A student-facing pathway must make the following immediately understandable without reading governance text:

- what situation the learner has entered;
- what the learner can do now;
- why the action matters;
- what changed because of the action;
- what strategy is becoming visible;
- where that strategy is tested again in a changed context;
- what evidence of growth the learner may choose to keep locally.

The common educational grammar remains:

`CONTEXT → ORIENT → NOTICE → ACT/CHOOSE → CONSEQUENCE → RECONSIDER → NAME/RECOGNISE STRATEGY → CHANGED CONTEXT → TRANSFER → LEARNER-CONTROLLED TRACE`.

The grammar is functional, not a mandatory screen count.

### 3.1 Mandatory Experience Quality Gate

Pedagogical correctness, safety, accessibility and technical validity are necessary but **not sufficient** for an Atlas Percorso.

A learner-facing pathway fails the product gate if it is experienced primarily as a sequence of generic cards, forms, quizzes, explanatory panels or automatically assembled prompts, even when those elements are individually correct.

Before implementation handoff, every pathway MUST define and survive human review for:

- **mise-en-scène** — a coherent situation/world in which the learner understands where they are, what is happening and why their action matters;
- **pathway-specific visual identity** — recognizable composition, visual language and atmosphere derived from the competence and subject, not from a universal Atlas skin;
- **experiential rhythm** — intentional alternation of orientation, action, consequence, pause, reconsideration and transfer rather than constant prompt-response cadence;
- **continuity** — stable visual/narrative anchors across scenes so the experience feels like one evolving situation rather than disconnected screens;
- **meaningful variation** — interaction forms vary only when the cognitive action changes; repetition and novelty must both have a reason;
- **learner pleasure without manipulation** — curiosity, agency, discovery, mastery and aesthetic care may make the experience enjoyable; streaks, reward harvesting, artificial urgency, addictive loops and empty gamification may not;
- **non-generic composition** — cards, panels, chips and buttons may be components, but they must not become the product's visible organising idea by default;
- **authored scene design** — generated text/assets may assist production, but no automatically generated stack of scenes/cards is accepted as a finished Percorso without deliberate human composition;
- **age-appropriate dignity** — the experience must avoid both infantilisation and sterile institutional tone for its intended developmental band;
- **visual/interaction purpose** — salient media, movement, illustration and transitions must serve orientation, meaning, consequence, viewpoint, evidence or atmosphere; decorative churn is not product quality.

The review must answer from the **student point of view**, not from governance documents:

1. Would a learner immediately understand the situation and want to see what happens next?
2. Does each scene feel causally connected to the previous one?
3. Is there a recognizable identity that belongs to this pathway?
4. Does the rhythm create anticipation, action, consequence and reflection rather than repeated questioning?
5. Are interactions doing cognitive work rather than merely collecting answers?
6. Would removing the card/container styling reveal an actual experience, or only a questionnaire?
7. Is enjoyment produced by agency, curiosity, consequence and craft rather than points/rewards/retention pressure?
8. Does the transfer scene feel like a meaningful new situation rather than a reskinned exercise?

A pathway that fails this review returns to narrative/storyboard design. It must not proceed merely because engine contracts, CI, accessibility automation or content validation pass.

Experience-quality judgement is a **mandatory Human Review**. Repository automation may verify that the required artefacts and declarations exist, but it MUST NOT auto-certify that a pathway is engaging, coherent or aesthetically successful.

**No grandfathering:** existing pathway candidates, including `PW-MISSING-INFORMATION-01` and `PW-CONSTRAINTS-TRADEOFFS-01`, must pass this gate on their actual learner-facing experience before any future Q9/runtime-authorization request. Prior technical qualification or product recovery does not substitute for this review.

## 4. Local personal growth

Atlas MAY provide a learner-controlled local growth record, but it MUST NOT become an account, remote profile, score, ranking or psychometric identity.

Allowed persisted evidence is bounded to educational accomplishments such as:

- **Inizia a riconoscere**;
- **Usa con supporto**;
- **Usa in autonomia**;
- **Sceglie quando usarla**;
- **Trasferisce in una nuova situazione**.

A badge/traguardo is evidence that a bounded action occurred in a specific pathway/version. It is not a statement about intelligence, personality, maturity or stable competence.

Local-growth requirements:

- stored on the learner device only;
- no name, email, student/class identifier or cross-device identity;
- explicit local-only explanation;
- reset/delete control;
- export/download may be offered;
- no server synchronization by default;
- no streaks, loot/reward harvesting, public leaderboard or peer comparison;
- no single global score;
- a pathway completion alone cannot automatically promote the learner to a stable competence level;
- transfer evidence is represented separately from simple completion.

Any server sync, teacher dashboard, cross-device profile, adaptive scoring or individual analytics requires a separate governed change.

## 5. Reference pathway recovery

`PW-MISSING-INFORMATION-01` is the first recovery target because its canonical dossier and implementation specification already define nine controlled states:

`S1_ORIENT → S2_MISSING_INFO → S3_CHOOSE_PROCESS → S4_CONSEQUENCE → S5_REVISE → S6_NAME_STRATEGY → S7_CHANGED_CONTEXT → S8_TRANSFER_PROBE → S9_TRACE_CONTROL`.

Compressing this specification into a shorter generic graph is not product-equivalent unless a human product/pedagogical review explicitly accepts the change.

`PW-CONSTRAINTS-TRADEOFFS-01` remains a valid second governed target, but its implementation must be completed as an authored lower-secondary design situation, not merely as an Experience Engine generality fixture.

## 6. Product gate

Before a future Q9 request, the review packet for each pathway MUST include:

1. dossier/spec references;
2. learner-facing subject/premise;
3. scene/storyboard inventory;
4. declared experiential grammar(s);
5. competence target plus any provisional/candidate territory placement with its governance status;
6. visible consequence/revision/transfer evidence;
7. local-growth evidence mapping, if used;
8. privacy/accessibility/child-safety checks;
9. **Experience Quality Gate** review of mise-en-scène, pathway-specific visual identity, rhythm, continuity, meaningful interaction variation and anti-card-stack compliance;
10. human pedagogical/product review of the actual learner experience from the student point of view;
11. exact-head technical qualification.

Q9 remains separate. This contract does not authorize student runtime.
