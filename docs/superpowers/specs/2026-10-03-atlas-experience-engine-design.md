# Atlas Experience Engine v1 — Design Specification

**Date:** 2026-10-03  
**Status:** SPEC_APPROVED / IMPLEMENTATION_QUALIFIED  
**Authority:** TRAMA cross-ecosystem design specification  
**Runtime:** NOT_RUNTIME_AUTHORIZED  
**Implementation:** IMPLEMENTATION_QUALIFIED — Atlas PR #69 @ `5227c5200b46c91230e66f7fe3a917666c8c77fb`  
**Student data posture:** privacy-first, anonymous/local-first by default  
**Arena authority:** unchanged  
**Atlas publication role:** unchanged  
**Docente OS role:** teacher-first operational consumer  
**DOS-A1:** RUNTIME_DEFERRED  
**Human review:** design/plan APPROVED 2026-10-03; implementation integration review remains required on exact evidence heads; runtime/merge remain separate decisions

---

## Implementation reconciliation — 2026-10-03

**Evidence:** `docs/evidence/atlas-experience-engine-v1-evidence.md`  
**Atlas implementation head:** `5227c5200b46c91230e66f7fe3a917666c8c77fb`  
**Atlas PR:** #69 — Draft / mergeable at evidence capture  
**Qualification:** `IMPLEMENTATION_QUALIFIED / NOT_RUNTIME_AUTHORIZED`

Observed evidence on the exact Atlas head:

- the canonical `Experience Engine` CI lane completed successfully, including contracts, grammar registry, generic factory, Percorsi factory, both Smart conformance cases, both Percorsi conformance cases, four-case generality, receipt reconciliation, typecheck, lint, production build and Chromium browser conformance;
- the public Percorsi catalog remains fail-closed for candidates without runtime authorization;
- the second Percorso is registered only against TRAMA PR #217 exact authority head `81534e352396ad858c7cf5ee00c7ec3b0756ae64`;
- the second Percorso remains an implementation candidate and is not authorized for student runtime;
- Smart publication receipt reconciliation remains canonical, SHA-bound, idempotent for equivalent later receipts, mismatch-fail-closed, draft-PR-only and preserves the human-decision flag;
- Arena authority is unchanged; Smart→Percorsi automatic promotion is not authorized;
- `DOS-A1` remains `RUNTIME_DEFERRED`.

This reconciliation records implementation evidence only. It does not authorize integration of Atlas PR #69, public student runtime for either Percorso, or any new authority transfer.

## 1. Decision

Adopt a single **Atlas Experience Engine** for student-facing interactive learning experiences, with two governed delivery lanes:

1. **Smart Activity** — short, lesson-oriented, rapid to prepare and publish.
2. **Percorso** — longer, transversal, narrative/branching, explicitly qualified before student runtime.

Smart and Percorsi are not separate applications and Smart is not a reduced or incomplete Percorso. They share the same underlying cognitive and presentation primitives while retaining different governance, publication and qualification gates.

The core model is:

```text
Challenge Kernel
      ↓
Experience Grammar
      ↓
Scene Graph
      ↓
Presentation Grammar
      ↓
Material Resolution
      ↓
Qualification Profile
      ↓
Smart lane OR Percorso lane
      ↓
Atlas Runtime
```

This specification does **not** authorize runtime promotion, automatic Smart→Percorso conversion, automatic Atlas→Arena authority, or any learner profiling.

---

## 2. Why this design is needed

The completion audit of Smart and Percorsi shows a mature but fragmented foundation:

- Smart SP-01 proves a real student-facing activity and a substantial asset/publication pipeline.
- SMART-FLOW-01 defines the end-to-end teacher request → activity flow, but the current qualification remains tied to the first pilot and is not yet proven across unrelated activities.
- Percorsi G2 has a real prototype engine, real branching, local/volatile state, accessibility work and evidence producers.
- The Percorsi portfolio factory can deterministically create structural candidates, but the generated experience is still too elementary to constitute a rich production process.
- Smart→Percorsi bridge infrastructure is complete but deliberately has no active governed binding.
- The public Percorsi product surface and runtime promotion remain incomplete.
- TRAMA still requires broader capability-level reconciliation before any student runtime authorization.

The missing capability is therefore not another special-case activity. It is a reusable **experience composition model** able to produce multiple Smart Activities and multiple materially different Percorsi without activity-specific infrastructure.

---

## 3. Design goals

The engine must:

- let one pedagogical kernel drive either a Smart Activity or a Percorso;
- reuse existing G2 concepts instead of replacing them;
- preserve the distinction between pedagogical intent and visual/narrative presentation;
- make transversal competence development possible without collapsing into quizzes;
- support genuine branching, revision and transfer;
- support mobile, LIM, keyboard and assistive technology;
- keep learner state local/volatile unless a later contract explicitly authorizes otherwise;
- avoid student accounts, telemetry, learner profiles and hidden scoring by default;
- keep publication provenance and qualification machine-addressable;
- prove generality through a second Smart Activity and a second Percorso with no dedicated engine code;
- keep human authority at every irreversible promotion or publication decision.

---

## 4. Non-goals

Version 1 will not:

- create an adaptive psychological or aptitude profile;
- infer learner traits, intelligence, motivation or competence from interaction traces;
- require login for student access;
- create an LMS replacement;
- introduce points, badges, XP, streaks or leaderboards as default motivation mechanics;
- automatically promote Smart content to Percorsi;
- automatically authorize student runtime;
- create eleven independent rendering engines for the current grammar registry;
- replace Arena curriculum authority;
- replace existing MaterialSet/publication contracts;
- activate DOS-A1.

---

## 5. Evidence-informed interaction principles

### 5.1 Active engagement over passive delivery

Interactive experiences should require the learner to inspect, decide, construct, compare or transfer rather than only consume information.

Relevant evidence:
- Deslauriers et al., *Measuring actual learning versus feeling of learning in response to being actively engaged in the classroom*, PNAS, 2019.
  - https://www.pnas.org/doi/10.1073/pnas.1821936116

### 5.2 Explicit support for self-regulation

The engine should make planning, monitoring, revision and reflection visible as actions rather than hiding them in a score.

Relevant evidence:
- Wong et al., *Supporting Self-Regulated Learning in Online Learning Environments and MOOCs: A Systematic Review*, 2019.
  - https://www.tandfonline.com/doi/full/10.1080/10447318.2018.1543084
- Meta-analytic evidence on metacognitive prompting in digital learning supports structured prompting, feedback and metacognitive support.
  - https://doi.org/10.1111/jcal.12650

### 5.3 Consequence and revision instead of score-first feedback

A choice should normally lead to a consequence, evidence or explanation, and the learner should be able to revise when pedagogically appropriate. The system should distinguish an incomplete or weakly supported decision from a moralized “wrong answer”.

### 5.4 Transfer is a first-class stage

A Percorso must not finish at recognition. At least one scene must require applying the underlying principle to a changed context when the learning objective claims transfer.

### 5.5 Gamification is optional, not foundational

The runtime must not depend on extrinsic reward mechanics. Narrative tension, meaningful choice, visible consequence, curiosity, construction and reflection are the preferred engagement mechanisms.

---

## 6. Product benchmarks and reusable patterns

The design borrows patterns, not implementations.

### H5P Branching Scenario

Useful patterns:
- visual branching model;
- decision → feedback/consequence;
- composition of reusable content types;
- explicit restart/remediation flows.

Reference:
- https://h5p.org/branching-scenario

Do not inherit:
- dependency on generic iframe embedding as the default Atlas runtime;
- third-party delivery/telemetry assumptions;
- LMS tracking as a core requirement.

### Twine

Useful patterns:
- graph-of-passages mental model;
- lightweight web runtime;
- flexible branching;
- separation between narrative node and link structure.

Reference:
- https://twinery.org/

Do not inherit:
- unrestricted scripting as the standard authoring surface;
- accessibility depending on arbitrary story format choices.

### Articulate Rise 360

Useful patterns:
- modular block authoring;
- responsive learner presentation;
- highly constrained authoring for consistency;
- strong attention to accessibility in learner output.

Reference:
- https://www.articulate.com/360/rise

Do not inherit:
- cloud-only authoring/runtime assumptions;
- learner identity and LMS persistence as the default;
- proprietary runtime dependency.

---

## 7. Core domain model

### 7.1 ChallengeKernel v1

A **ChallengeKernel** is the smallest reusable pedagogical unit that can survive changes in subject, narrative skin and delivery lane.

Required fields:

```ts
type ChallengeKernel = {
  schema: "atlas.challenge-kernel/v1";
  kernelId: string;
  title: string;
  situation: string;
  generativeQuestion: string;
  competenceTargets: CompetenceTarget[];
  evidenceModel: {
    availableEvidence: EvidenceDescriptor[];
    intentionallyMissingEvidence?: EvidenceDescriptor[];
    misconceptions?: MisconceptionDescriptor[];
  };
  decisionModel: {
    decisions: DecisionDescriptor[];
    consequencePolicy: "EXPLANATORY" | "BRANCHING" | "CONSTRUCTIVE";
    revisionAllowed: boolean;
  };
  transferPrinciple: string;
  completionEvidence: CompletionEvidenceDescriptor[];
  provenanceRefs: string[];
};
```

A kernel contains no visual theme, score, runtime authorization or curriculum authority.

### 7.2 ExperienceMode

```ts
type ExperienceMode = "SMART" | "PATHWAY";
```

The mode changes scope and governance, not the underlying cognitive primitives.

### 7.3 ExperienceDefinition v1

```ts
type ExperienceDefinition = {
  schema: "atlas.experience/v1";
  experienceId: string;
  kernelRef: string;
  mode: ExperienceMode;
  sceneGraph: SceneGraph;
  presentationGrammarRef: string;
  materialSetRef?: string;
  qualificationProfileRef: string;
  runtimeStatePolicy: "VOLATILE_MEMORY" | "LOCAL_DEVICE";
  learnerIdentityRequired: false;
  telemetryAllowed: false;
};
```

Version 1 fixes `learnerIdentityRequired=false` and `telemetryAllowed=false`.

---

## 8. Experience Grammar v1

The current research registry of multiple narrative/interaction labels should be normalized into a small set of **cognitive primitives** rather than implemented as eleven independent engines.

Version 1 primitives:

1. **Explore** — inspect a situation, source, model, image, map, dataset or system.
2. **Choose** — make a decision or select a course of action.
3. **Connect** — identify relations, dependencies, causes, patterns or sequences.
4. **Build** — order, compose, design, assemble, transform or propose.
5. **Investigate** — formulate and test a hypothesis using evidence.
6. **Reframe** — reconsider the same problem from a different perspective or with new evidence.
7. **Transfer** — apply the principle to a materially changed context.

**Reflect** is a transversal capability available to all primitives, not a mandatory independent scene type.

Each primitive must define:
- expected learner action;
- allowed inputs;
- completion condition;
- accessible interaction equivalent;
- possible feedback form;
- whether revision is allowed;
- whether it can branch.

---

## 9. Presentation Grammar

Presentation Grammar controls **how** a cognitive scene is expressed without changing **what** the learner is required to do.

Existing registry labels such as:
- sequential visual narrative;
- audiovisual;
- branching-consequences;
- inquiry-evidence;
- construction-lab;
- simulation-microworld;
- theatre-viewpoints;
- reflective-notebook;
- map-exploration;
- shared-construction;
- environmental-narrative

remain valuable, but are treated as presentation/narrative strategies rather than separate pedagogical engines.

A Presentation Grammar may select layout, imagery, disclosure, navigation pattern, narrative voice and visual metaphor, but may not silently alter:
- competence target;
- decision semantics;
- completion evidence;
- privacy posture;
- accessibility obligations;
- runtime authorization.

---

## 10. Scene Graph

The existing G2 `SceneNode` concept remains canonical and evolves rather than being replaced.

The minimum supported graph structure is:

```text
entry
  ↓
explore
  ↓
choose ───────┐
 ↓             ↓
consequence A  consequence B
   \           /
     reframe
       ↓
     transfer
       ↓
     terminal
```

A valid Percorso must support at least one semantically meaningful branch whose downstream content is not merely different copy for the same path.

A Smart Activity may be linear or lightly branching.

Scene transitions must be deterministic from the current local session state and declared learner action. Hidden remote personalization is prohibited in v1.

---

## 11. Feedback model

Feedback is modeled as **process evidence**, not primarily as score.

Supported feedback categories:

- `EVIDENCE_SUPPORTED`
- `EVIDENCE_INCOMPLETE`
- `DECISION_PREMATURE`
- `ALTERNATIVE_PLAUSIBLE`
- `MODEL_NEEDS_REVISION`
- `TRANSFER_SUCCESSFUL`

A scene may use “correct/incorrect” only when the domain genuinely has a binary factual answer and the pedagogical design requires it.

Scores are not part of the v1 core contract.

---

## 12. Student experience

The student-facing product should feel like an editorial interactive experience, not an LMS dashboard.

Rules:

- one primary cognitive task per screen;
- one clear primary action;
- minimal navigation chrome;
- no requirement to understand curriculum metadata;
- no technical identifiers, manifests, digests or governance labels in the normal learner view;
- visible ability to revisit a decision when the design permits it;
- completion should summarize what changed in the learner’s reasoning, not produce a rank;
- progress may be represented as a subtle path indicator, not a performance meter;
- restart must be explicit and understandable;
- mobile is a first-class target, not a responsive afterthought.

---

## 13. Teacher experience

The teacher-facing workflow remains consistent with SMART-FLOW-01:

```text
request
  ↓
intent
  ↓
ChallengeKernel candidate
  ↓
experience composition
  ↓
materials
  ↓
preview
  ↓
qualification/readiness
  ↓
teacher decision
  ↓
publish/use
```

The teacher should not be required to interact with:
- Git;
- SHA/digest values;
- file-system paths;
- manifests;
- workflow internals;
- Q-stage names.

Human decisions must remain visible when they change:
- publication status;
- curricular authority;
- Smart→Percorso promotion;
- materially important content;
- runtime authorization.

---

## 14. Smart lane

A Smart Activity is optimized for immediate teaching use.

Default characteristics:

- approximately 5–15 minutes of learner interaction;
- small scene graph;
- public anonymous access;
- no account;
- local/volatile state;
- mobile + LIM;
- one lesson or immediate learning objective;
- fast qualification profile;
- no automatic promotion to Percorsi.

The Smart lane reuses:
- ChallengeKernel;
- SceneNode;
- Experience Grammar;
- Presentation Grammar;
- MaterialSet/publication;
- accessibility checks;
- public reachability checks.

The current SP-01 implementation becomes a **reference conformance case**, not a special engine.

---

## 15. Percorso lane

A Percorso is a governed transversal experience.

Default characteristics:

- multiple cognitive phases;
- meaningful branching or constructive transformation;
- explicit transfer scene;
- dossier and provenance;
- child-safety/privacy/accessibility qualification;
- runtime promotion separated from content creation;
- withdrawal/rollback semantics;
- visible version/provenance in an appropriate learner-facing form.

A Percorso may draw on multiple disciplinary contexts while targeting a competence that is not reducible to one disciplinary fact set.

---

## 16. What “transversal” means

A Percorso is transversal only if the same competence kernel can operate across materially different contexts.

Example kernel:

> “Do I have enough evidence to decide?”

Possible contexts:
- Tecnologia — select a material;
- Scienze — interpret an experiment;
- Geografia — judge a territorial transformation;
- Educazione civica — assess a source;
- Matematica — decide whether the available data support a conclusion.

Merely mentioning several subjects in one experience does not qualify as transversal.

---

## 17. Smart → Percorsi promotion

Promotion is not conversion.

A Smart Activity may propose a candidate relationship to a Percorso only when all of the following exist:

- a governed target pathway identity;
- an explicit pedagogical association;
- a human promotion/association decision;
- a material reuse plan;
- provenance and authority evidence;
- a complete Percorsi candidate dossier.

The existing Smart→Percorsi bridge remains the enforcement boundary.

No lexical, semantic-similarity or AI-only association may activate a binding.

---

## 18. Material and publication integration

No second material readiness system may be created.

Experience Engine consumes the existing governed material/publication chain:

```text
asset candidate
  ↓
registration + provenance + digest
  ↓
canonical Atlas publication
  ↓
anonymous verification
  ↓
publication receipt
  ↓
MaterialSet readiness
  ↓
ExperienceDefinition
```

An experience requiring public student assets is not READY while any required public reference or receipt remains unresolved.

---

## 19. Runtime state and privacy

Version 1 runtime constraints:

- no learner account;
- no learner identifier;
- no response API;
- no database write for learner choices;
- no analytics/profiling;
- no advertising or third-party trackers;
- no free-text learner collection by default;
- no microphone, camera, location or contact access;
- no cross-site tracking;
- state held in page memory or local device storage only when the experience explicitly requires resume;
- a visible reset/restart mechanism;
- no hidden remote adaptive model.

The system may collect **non-learner build/publication evidence** for qualification and operations.

---

## 20. Accessibility

Every primitive must have an accessible interaction contract.

Required v1 properties:

- keyboard operability;
- deterministic focus movement;
- semantic headings/regions;
- native controls when suitable;
- no information conveyed by colour alone;
- readable zoom/reflow;
- sufficient touch targets;
- reduced-motion compatibility where motion is used;
- meaningful alternative representation for visual interaction;
- L/N equivalence where the dual grammar applies;
- no inaccessible drag-only essential task.

Qualification must test actual interaction, not only static markup.

---

## 21. Failure handling

Fail closed when:

- required material provenance is missing;
- a required public asset is not anonymously reachable;
- a material digest mismatches;
- a required accessibility equivalence is absent;
- a Pathway candidate lacks authority evidence;
- runtime authorization is missing;
- a Smart→Percorsi binding is not governed;
- the generated graph has an unreachable required scene;
- the terminal scene cannot be reached through at least one valid path;
- a v1 experience attempts learner identity, telemetry or network response storage.

The learner-facing runtime must degrade to a clear unavailable/not-ready state, never silently bypass qualification.

---

## 22. Factory redesign

The existing structural factory evolves from a skeleton generator into this governed pipeline:

```text
Intent
  ↓
Challenge Kernel
  ↓
Competence Target
  ↓
Experience Grammar
  ↓
Scene Graph
  ↓
Presentation Grammar
  ↓
Material Resolver
  ↓
Accessibility + Safety checks
  ↓
Teacher Preview
  ↓
Qualification
  ↓
Publication / runtime gate
```

The factory may propose:
- kernel structure;
- scenes;
- branches;
- narrative treatments;
- candidate materials;
- misconceptions;
- transfer tasks;
- accessibility alternatives.

The factory may not decide:
- curriculum authority;
- final publication;
- Smart→Percorso promotion;
- learner psychological interpretation;
- runtime authorization.

---

## 23. Backward compatibility

The implementation plan must preserve existing qualified work.

### Smart

SP-01 remains a valid reference activity. It should be migrated by adaptation to the new contracts, not rewritten solely for architectural purity.

### Percorsi G2

Existing:
- `PathwayDefinition`;
- `SceneNode`;
- `PresentationGrammar`;
- local `SessionState`;
- L/N equivalence;
- G2 validation/evidence producers

remain inputs to Experience Engine v1.

Experience Engine extends and composes these contracts rather than invalidating them.

### Material pipeline

Existing material registration, publication receipt and readiness contracts remain authoritative.

---

## 24. First vertical slice

The first canonical Percorso vertical slice remains:

**PW-MISSING-INFORMATION-01 — “Prima di decidere, cosa manca?”**

It must be rebuilt/adapted as a conformance example that proves:

1. one governed ChallengeKernel;
2. 5–7 meaningful scenes;
3. at least one genuine branch;
4. consequence-based feedback;
5. revision after new evidence;
6. transfer to a changed context;
7. accessible interaction;
8. volatile/local-only learner state;
9. no tracking;
10. mobile + desktop + LIM;
11. canonical public publication only after required runtime gate.

The current prototype label remains until the relevant TRAMA promotion gate is satisfied.

---

## 25. Generality proof

The architecture is **not considered generalized** after the first vertical slice.

Two independent proofs are required:

### Proof A — second Smart Activity

A new real teacher request unrelated to “sistema tecnologico” must travel through:

```text
request → intent → kernel → experience → materials → preview → qualification → publication/readiness
```

without a new activity-specific workflow, validator or orchestration script.

### Proof B — second Percorso

A second Percorso must:
- belong to a different competence territory or materially different kernel;
- use a meaningfully different scene composition;
- be generated from the same contracts/factory;
- require no new pathway-specific engine logic.

If either proof requires dedicated infrastructure code, the abstraction is incomplete.

---

## 26. Public Percorsi product surface

A runtime promotion plan must include an actual public `/percorsi` product surface with:

- discoverable catalog/list;
- understandable pathway title and purpose;
- version/provenance disclosure appropriate to the user;
- start/resume/restart semantics;
- withdrawn/unavailable state;
- anonymous access;
- mobile-first interaction;
- no placeholder-only foundation copy.

This surface is separate from authoring/governance tooling.

---

## 27. Qualification model

Experience qualification uses profiles rather than a single universal checklist.

### SMART_FAST_V1

Must prove at minimum:
- anonymous load;
- no login;
- no learner response transmission;
- local/volatile state;
- completion/restart;
- mobile + desktop;
- keyboard/focus;
- required material public verification;
- no collision with Percorsi authority.

### PATHWAY_G2_PLUS_V1

Must additionally prove:
- meaningful branching;
- transfer;
- presentation equivalence;
- complete dossier;
- provenance;
- child-safety/privacy/accessibility evidence;
- withdrawal/rollback behavior;
- exact-head validation;
- explicit runtime authorization before student release.

Q1/Q5/Q6/Q9 evidence remains separate from runtime authority.

---

## 28. Test strategy

Implementation must be TDD-first and include:

### Contract tests
- ChallengeKernel schema;
- ExperienceDefinition schema;
- graph validity;
- primitive constraints;
- privacy invariants.

### Graph tests
- unreachable nodes;
- dead ends;
- terminal reachability;
- branch identity;
- revision loops;
- transfer presence for Percorsi.

### Runtime tests
- keyboard-only completion;
- focus sequence;
- reset/restart;
- local-state corruption recovery;
- no network learner writes;
- responsive mobile viewport;
- LIM/desktop viewport.

### Publication tests
- required public refs;
- receipt/digest consistency;
- withdrawn asset handling;
- package readiness derivation.

### Generality tests
- SP-01 compatibility;
- second Smart Activity with no new orchestration;
- PW-MISSING-INFORMATION-01 compatibility;
- second Percorso with no new engine logic.

---

## 29. Migration strategy

Implementation should proceed incrementally:

### Phase 1 — Contracts
Add ChallengeKernel and ExperienceDefinition while retaining current G2/Smart runtime.

### Phase 2 — Compatibility adapters
Map SP-01 and PW-MISSING-INFORMATION-01 onto the new contracts without changing their authority state.

### Phase 3 — Generic composer
Replace pilot-specific orchestration with reusable composition/validation.

### Phase 4 — Generality proofs
Run the second Smart Activity and second Percorso.

### Phase 5 — Public product
Only after qualification, implement/promote the governed public Percorsi surface.

No phase grants runtime authorization by itself.

---

## 30. Acceptance criteria for Experience Engine v1

Experience Engine v1 is complete only when all of the following are demonstrated:

- one shared engine supports Smart and Percorsi;
- no duplicated readiness system exists;
- SP-01 works through the shared model;
- a second unrelated Smart Activity works without special infrastructure;
- PW-MISSING-INFORMATION-01 works through the shared model;
- a second materially different Percorso works without special engine logic;
- Experience Grammar and Presentation Grammar are independently replaceable;
- all required accessibility interactions pass;
- learner runtime makes no network write;
- no learner identity/profile is required;
- publication readiness is receipt-derived;
- Smart→Percorsi requires explicit governed association;
- runtime promotion remains a distinct human decision;
- Arena authority is unchanged;
- DOS-A1 remains RUNTIME_DEFERRED unless separately authorized.

---

## 31. Architectural invariants

1. **Arena remains curriculum authority.**
2. **Atlas remains the public/navigation/learning-experience surface.**
3. **Docente OS remains teacher-first operational software.**
4. **TRAMA governs cross-system contracts and evidence.**
5. **No student tracking is introduced by Experience Engine v1.**
6. **No automatic authority transfer is allowed.**
7. **No automatic Smart→Percorsi promotion is allowed.**
8. **No runtime authorization is inferred from successful CI.**
9. **No second readiness or publication truth is allowed.**
10. **DOS-A1 remains RUNTIME_DEFERRED.**

---

## 32. Research and benchmark provenance

Research/benchmark inputs used to shape this specification:

- Deslauriers et al. (2019), active learning.
- Wong et al. (2019), self-regulated learning support in online environments.
- Meta-analytic work on metacognitive prompting in digital learning (J. Computer Assisted Learning; DOI above).
- H5P Branching Scenario interaction model.
- Twine graph/passages model.
- Articulate Rise 360 modular responsive learner experience.

These sources inform interaction and authoring principles only. They do not create authority over TRAMA contracts or runtime decisions.

---

## 33. Relationship to current governed work

This specification consolidates and must remain compatible with the current lines of work for:

- SP-01 Smart Prototyping;
- SMART-FLOW-01;
- SMART-ASSET-01;
- SMART-PUBLISH-01;
- Percorsi G2;
- Percorsi evidence producers;
- Percorsi Portfolio Factory;
- Smart→Percorsi bridge/resolver/binding registry;
- the 2026-10-03 TRAMA completion audit and capability closure plan.

A future implementation plan must cite exact current heads before changing any of these artifacts.

---

## 34. Human-review boundary

The conceptual direction approved on 2026-10-03 means:

- this written specification may be formalized and reviewed;
- implementation planning begins only after explicit human review of this written specification;
- existing runtime status does not change;
- existing authority status does not change;
- no student release is authorized;
- no merge is automatically authorized;
- no production deploy is automatically authorized.

Each irreversible authority/runtime action remains separately reviewable.

---

## 35. Next governed step

After human review of this written specification:

1. create a detailed implementation plan;
2. map exact files/contracts/tests in Atlas and TRAMA;
3. preserve existing qualified heads and compatibility;
4. implement with TDD in an isolated branch/worktree;
5. request independent code/design review;
6. demonstrate the two generality proofs;
7. only then evaluate runtime promotion separately.

