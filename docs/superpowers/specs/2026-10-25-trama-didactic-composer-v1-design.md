# TRAMA Didactic Composer v1 — Governed didactic composition and product projections

**Data:** 2026-10-25  
**Capability:** `CAP-DIDACTIC-COMPOSER`  
**Shared capability candidate:** `didactic.composition.propose@1`  
**Repository:** `antoniocorsano-boop/trama-ecosistema`  
**Baseline TRAMA:** `main@d11112434bb45364e7bddbee6d4df1a86f9b351a`  
**Observed Arena:** `antoniocorsano-boop/CurManLight_arena@d8b1bf43388cb5c4cdcc940b0c558bb128976c4c`  
**Observed Registro Docente:** `antoniocorsano-boop/registro-docente@38b7f0dd874806aaf56dd0ecef7e93d01ce34039`  
**Observed Docente OS develop:** `antoniocorsano-boop/docente-os-2026-27@1c50c1bc620cdd0b7bafcff0dc5c613367df3298`  
**Observed Atlas main:** `antoniocorsano-boop/Curriculum-Atlas@c322b07a68d4508ec437941f8688012765e88848`  
**Status:** DESIGN MATERIALIZED · CROSS-CONTRACT VALIDATED · HUMAN DESIGN REVIEW PENDING · NO IMPLEMENTATION AUTHORIZED  
**Runtime:** NOT_AUTHORIZED  
**Authority change:** NONE  
**DOS-A1:** UNCHANGED / `RUNTIME_DEFERRED`

---

## 1. Intento

Definire una capability condivisa che trasformi un intento professionale del docente, fonti pertinenti e un contesto curricolare governato in una **proposta di composizione didattica strutturata**: UDA, attività, lezione, laboratorio, verifica, recupero o estensione.

La capability deve permettere il riuso della stessa composizione tra Docente OS, Registro Docente, Studio Atlas/Atlas e document workspace senza introdurre una nuova authority centrale.

Il problema non è soltanto generare contenuti. Il problema architetturale è preservare contemporaneamente:

1. autorità curricolare Arena;
2. decisione professionale del docente;
3. ownership e persistenza product-local;
4. privacy-first;
5. provenance e versioning;
6. distinzione tra progettazione, preparazione, pubblicazione, svolgimento, registrazione e valutazione.

---

## 2. Risultato della validazione

La direzione è valida soltanto nella forma seguente:

> **Shared capability stateless `PROPOSE_ONLY` + artifact di composizione immutabile/versionato + adoption receipt product-local + projection adapters governati.**

La validazione sui repository e contratti correnti ha prodotto cinque correzioni rispetto a una prima formulazione più semplice.

### V1 — Nessun nuovo prodotto centrale

OR-07 e OR-10 vietano che il layer condiviso diventi database, write authority o orchestratore centrale. Il Composer non può quindi essere una nuova applicazione TRAMA con store canonico proprio.

### V2 — Registro e Studio Atlas richiedono un'estensione esplicita dei caller contracts

OR-07/OR-10 v0 enumerano i prodotti storici e **non includono ancora `REGISTRO_DOCENTE` e `STUDIO_ATLAS` come caller identity**.

Questa specifica può definire i consumer futuri, ma **nessuna implementazione/runtime cross-product può considerarli già autorizzati**.

Prima del wiring reale deve esistere una evoluzione additiva del contract registry/envelope che registri esplicitamente queste product identities senza assimilarle impropriamente a `DOCENTE_OS` o `ATLAS`.

### V3 — Drive non appartiene alla prima capability OR-07

OR-07 v0 ammette soltanto `READ_ONLY` e `PROPOSE_ONLY`. Un export Drive è `WRITE_EXTERNAL`.

Quindi:

- Drive resta nel disegno complessivo;
- l'export è una **slice separata e successiva**;
- non fa parte del primo Core `didactic.composition.propose@1`;
- richiede un proprio write contract, feedback percepibile e autorizzazione utente;
- non è discoverable automaticamente tramite l'attuale percorso Contextual Copilot che esclude `WRITE_EXTERNAL` dalla prima Intent Discovery.

### V4 — Arena `TRANSITIONAL` deve essere preservato

Il contratto Arena → Registro distingue `applicabilityStatus = APPLICABLE | TRANSITIONAL`.

Il Composer v1 può accettare un contesto `TRANSITIONAL` quando:

- `authorityState = APPROVED`;
- `vigencyStatus = VIGENTE`;
- il caller lo ha validato/accettato con il proprio contratto;
- `regimeRef` e `applicabilityStatus` vengono preservati nella provenance e nella composizione.

`TRANSITIONAL` non deve essere normalizzato silenziosamente in `APPLICABLE`.

### V5 — Docente OS necessita due livelli di proiezione

Una composizione didattica nuova non coincide automaticamente con una Human Task già legata a un blocco CAN-PLAN/PACK.

La proiezione Docente OS deve quindi distinguere:

1. **UNBOUND_PLANNING_PROPOSAL** — nucleo didattico utilizzabile in `Progetta`, ma non ancora collegato a un `planBinding` eseguibile;
2. **BOUND_HUMAN_TASK_CANDIDATE** — possibile soltanto quando il prodotto risolve un blocco Piano coerente e supera i gate esistenti.

La presenza del Composer non crea un bypass alla Human Task pipeline.

---

## 3. Vincoli canonici non riapribili

- Arena resta l'autorità curricolare.
- TRAMA governa decisioni e contratti trasversali senza diventare una quarta applicazione.
- Shared Capability Layer non è domain store, write authority o orchestratore centrale.
- Ogni prodotto conserva stato, regole decisionali, persistenza e UI propri.
- Il docente mantiene accetta/modifica/sostituisci/escludi.
- Docente OS resta teacher-first e proprietario dello stato operativo lezione/classe.
- Registro Docente resta proprietario di programmazione, consuntivo e valutazione nel proprio dominio.
- Studio Atlas possiede l'authoring professionale dei Percorsi.
- Atlas pubblico possiede identity/version/publication state delle proprie risorse, non l'authoring professionale.
- Drive ospita documenti umani e copie dichiarate, non una replica tecnica autorevole completa.
- Control Center osserva soltanto.
- DOS-A1 resta `RUNTIME_DEFERRED`.

---

## 4. Stato osservato dei consumer

### 4.1 Arena

`ARENA_REGISTRO_PLANNING_CONTEXT_V1` è qualificato con:

```text
importMode = PREVIEW_ONLY
acceptanceRequired = true
automaticWriteAllowed = false
applicabilityStatus = APPLICABLE | TRANSITIONAL
```

Il Composer non introduce un nuovo write verso Arena.

### 4.2 Registro Docente

Il repository mantiene due domini intenzionalmente distinti:

- `UdaRecord` / `UdaLesson`: dominio operativo realmente usato;
- `PlanningStateV1`: profili annuali, contesto Arena e strutture future `MasterProgram` / `ClassProgramInstance`.

`MasterProgram` non è ancora la fonte operativa canonica. La prima integrazione Composer non deve anticipare quella migrazione.

### 4.3 Docente OS

La pipeline Human Task corrente usa:

- `candidateId` legato a generazioni esatte;
- `planBinding`;
- source alignment;
- provenance UDA/PACK;
- `READY_FOR_HUMAN_APPROVAL`;
- promozione separata con decisione umana.

Il Composer deve entrare prima o accanto a tali gate, non sostituirli.

### 4.4 Studio Atlas / Atlas

Studio Atlas è un dominio professionale separabile per authoring; Atlas pubblico resta learner/public facing.

Il percorso corretto per un nuovo Percorso è:

```text
composition → Studio Atlas seed → authoring/review/preview → publication candidate → Atlas publication gate
```

### 4.5 Contextual Copilot

Il Core separa intent discovery, policy e dispatch. Il Composer non implementa un secondo chatbot/parser.

---

## 5. Approcci considerati

### A. Nuovo prodotto/store centrale “TRAMA Composer”

**Scartato.**

Pro: un solo store e una sola UI.

Contro:

- nuova authority pratica;
- conflitto con OR-07/OR-10;
- sincronizzazione cross-product permanente;
- duplicazione di Progetta/Programmazione/Studio Atlas.

### B. Composer separato in ogni prodotto

**Scartato.**

Pro: ownership locale semplice.

Contro:

- drift semantico;
- prompt/policy duplicati;
- risultati incompatibili;
- provenance frammentata.

### C. Shared capability stateless + artifact versionato + adapter product-local

**Selezionato.**

Pro:

- una semantica condivisa;
- nessun nuovo store autorevole;
- product ownership preservata;
- versioning e provenance confrontabili;
- riuso con Contextual Copilot;
- rollout per slice indipendenti.

Trade-off accettato: nessun sync mutativo automatico. Ogni revisione produce una nuova versione che ogni consumer può adottare o rifiutare.

---

## 6. Decisione architetturale

### 6.1 Capability identity

Candidate identity:

```text
didactic.composition.propose@1
```

Candidate descriptor:

```ts
{
  capabilityId: 'didactic.composition.propose',
  version: '1',
  mode: 'PROPOSE_ONLY',
  ownerDomain: 'TRAMA',
  evidenceRequired: true,
  providerPortable: true,
  authorityClass: 'HUMAN_REQUIRED'
}
```

`ownerDomain: TRAMA` significa ownership del contratto condiviso, non curriculum/didactic authority.

### 6.2 “Una UDA, più proiezioni”

Non significa un database condiviso.

Significa una singola **versione immutabile/content-addressed** della composizione, identificabile tramite:

```text
compositionId
compositionVersion
contentDigest
```

Ogni prodotto può persistere uno snapshot locale e il relativo adoption/projection state.

### 6.3 Authority della composizione

La capability produce soltanto `PROPOSAL`.

L'adozione è:

- umana;
- catturata nel prodotto corrente;
- attestata da un receipt locale;
- non ereditata automaticamente dagli altri consumer.

Non esiste un `APPROVED` globale emesso dalla capability.

---

## 7. Modello concettuale

```text
                         ARENA
                 curriculum authority
                         │
             accepted/validated context
                         ▼
                 CALLING PRODUCT
            Docente OS / Registro / future
                         │
               intent + sources + context
                         ▼
            didactic.composition.propose@1
                    PROPOSE_ONLY
                         │
                         ▼
            DidacticCompositionProposalV1
                         │
                    HUMAN DECISION
                         │
               local adoption receipt
                         │
        ┌────────────────┼─────────────────┐
        ▼                ▼                 ▼
   DOCENTE OS        REGISTRO          STUDIO ATLAS
 planning/runtime    planning          authoring seed
 projection          preview               │
        │                │                 ▼
        │                │            publication candidate
        │                │                 │
        ▼                ▼                 ▼
 execution          consuntivo          ATLAS PUBLIC
 observation        after human         publication gate
        │            confirmation
        └──────────────► │

DRIVE EXPORT = separate later WRITE_EXTERNAL slice, not Core v1.
```

---

## 8. Invariante principale

```text
PLANNED
!= PREPARED
!= PUBLISHED
!= TAUGHT
!= RECORDED
!= ASSESSED
```

Conseguenze normative:

- una fase progettata non è preparata;
- una lezione preparata non è svolta;
- una risorsa pubblicata non è necessariamente usata;
- una lezione svolta non è automaticamente consuntivata;
- un'evidenza raccolta non è un voto;
- un'interazione Atlas non è una valutazione del Registro;
- una composizione adottata in un prodotto non è adottata negli altri.

---

## 9. OR-07 / OR-10 product identity extension prerequisite

Prima del wiring reale con Registro o Studio Atlas deve essere approvata un'evoluzione additiva del product/caller registry.

Candidate future identity set:

```ts
type GovernedProductId =
  | 'ARENA'
  | 'ATLAS'
  | 'DOCENTE_OS'
  | 'REGISTRO_DOCENTE'
  | 'STUDIO_ATLAS'
  | 'CONTROL_CENTER'
```

Regole:

- nessun alias `REGISTRO_DOCENTE → DOCENTE_OS`;
- nessun alias `STUDIO_ATLAS → ATLAS`;
- l'espansione dell'enum non trasferisce authority;
- Control Center resta non-caller per mutazioni/proposte operative se non esplicitamente consentito da contratto;
- la compatibilità con consumer v0 va preservata.

Questa prerequisite è **governance/contract work**, non implementation del Composer.

---

## 10. Request contract candidate

```ts
interface DidacticCompositionRequestV1 {
  contract: 'DIDACTIC_COMPOSITION_REQUEST_V1'
  contractVersion: 1
  requestId: string

  caller: {
    product: 'DOCENTE_OS' | 'REGISTRO_DOCENTE' | 'STUDIO_ATLAS' | 'OTHER_GOVERNED'
    surface: string
  }

  intent: {
    message: string
    requestedKind:
      | 'UDA'
      | 'ACTIVITY'
      | 'LESSON'
      | 'LAB'
      | 'ASSESSMENT'
      | 'RECOVERY'
      | 'EXTENSION'
      | 'AUTO'
  }

  teachingContext: {
    schoolYear: string
    schoolOrder: string
    subjectCode: string
    gradeLevel: number
    classRef?: string
    currentWorkRef?: string
  }

  curriculumContext: {
    authorityProduct: 'ARENA'
    acceptedContextRef: string
    authorityState: 'APPROVED'
    vigencyStatus: 'VIGENTE'
    applicabilityStatus: 'APPLICABLE' | 'TRANSITIONAL'
    regimeRef: string
    sourceRefs: readonly string[]
    curriculumItems: readonly CurriculumContextItem[]
  }

  professionalSources: readonly ProfessionalSourceRef[]

  constraints?: {
    durationMinutes?: number
    inclusionNeedsAggregate?: readonly string[]
    availableResources?: readonly string[]
    requestedOutputs?: readonly string[]
  }

  privacyClass: 'PROFESSIONAL_NON_PERSONAL'
}
```

### 10.1 Request rules

- no student names/ids;
- no grades;
- no diagnoses or named PEI/PDP;
- no individual behavior/health notes;
- `classRef` may identify a teaching section but not an individual student;
- `TRANSITIONAL` is allowed and preserved;
- `PROVISIONAL_COMPLETE` or `NON_VIGENTE` is not accepted as authoritative input v1;
- stale/ambiguous Arena context fails closed;
- the caller is responsible for qualified resolution/acceptance of Arena context;
- the Composer never writes Arena;
- remote provider access remains subject to caller/Core privacy and consent gates.

---

## 11. Proposal contract candidate

```ts
interface DidacticCompositionProposalV1 {
  contract: 'DIDACTIC_COMPOSITION_PROPOSAL_V1'
  contractVersion: 1

  compositionId: string
  compositionVersion: number
  contentDigest: string
  status: 'PROPOSAL'

  requestedKind: DidacticKind
  title: string
  rationale: string

  curriculumBinding: {
    acceptedContextRef: string
    applicabilityStatus: 'APPLICABLE' | 'TRANSITIONAL'
    regimeRef: string
    sourceRefs: readonly string[]
    selectedItemRefs: readonly string[]
  }

  provenance: {
    requestId: string
    capabilityId: 'didactic.composition.propose'
    capabilityVersion: '1'
    providerRef: string
    adapterRef: string
    professionalSourceRefs: readonly string[]
  }

  design: {
    drivingQuestion?: string
    competencies: readonly string[]
    objectives: readonly string[]
    knowledge: readonly string[]
    phases: readonly DidacticPhaseV1[]
    evidencePlan: readonly EvidencePlanV1[]
    assessmentPlan?: AssessmentPlanV1
    inclusionPlan?: InclusionPlanV1
    interdisciplinaryLinks?: readonly InterdisciplinaryLinkV1[]
  }

  projectionHints: {
    docenteOs: ProjectionHintV1
    registro: ProjectionHintV1
    studioAtlas: ProjectionHintV1
    driveExport: 'DEFERRED_WRITE_SLICE'
  }

  review: {
    blockingIssues: readonly ReviewIssueV1[]
    warnings: readonly ReviewIssueV1[]
    assumptions: readonly string[]
  }

  producedAt: string
}
```

### 11.1 Proposal rules

La proposta non è:

- curriculum Arena;
- adozione professionale;
- lesson runtime;
- consuntivo;
- pubblicazione Atlas;
- voto;
- write authorization.

---

## 12. Adozione locale

```ts
interface DidacticCompositionAdoptionReceiptV1 {
  contract: 'DIDACTIC_COMPOSITION_ADOPTION_RECEIPT_V1'
  contractVersion: 1
  compositionId: string
  compositionVersion: number
  contentDigest: string
  product: string
  decision: 'ADOPTED' | 'REJECTED' | 'SUPERSEDED'
  decidedBy: 'HUMAN'
  decidedAt: string
  localRef?: string
  supersedesReceiptRef?: string
}
```

Regole:

- il receipt è product-local;
- non modifica la proposta originale;
- non promuove altri prodotti;
- una revisione adottata produce una nuova composition version/receipt;
- una versione precedente resta storico e può diventare stale/superseded localmente.

---

## 13. Proiezione Docente OS

### 13.1 Due modalità

```text
UNBOUND_PLANNING_PROPOSAL
BOUND_HUMAN_TASK_CANDIDATE
```

#### UNBOUND_PLANNING_PROPOSAL

Usata quando la composizione è pertinente a `Progetta` ma non esiste ancora un `planBinding` valido.

Può supportare:

- nucleo comune di grado;
- progettazione/bozza;
- selezione di materiali;
- successivo raccordo umano al Piano.

Non può entrare in `Conduci`.

#### BOUND_HUMAN_TASK_CANDIDATE

Possibile solo dopo risoluzione product-local di:

- grade;
- block;
- `planBinding`;
- UDA/pack/segment/title richiesti dal contratto corrente;
- generation/provenance delle fonti;
- Human Task candidate gate.

### 13.2 Blocking rules

Fallire chiuso se:

- anno/grado/disciplina divergono;
- il block non esiste;
- `planBinding` diverge;
- composition version è stale;
- l'adapter inventa attività/materiali/tempi non sostenuti;
- si tenta promozione runtime senza Human Approval;
- si tenta di presentare il Composer come sostituto dei recipe/gate correnti.

### 13.3 State ownership

`IN_PREPARATION`, `IN_PROGRESS`, `PARTIAL`, `COMPLETED` sono Docente OS-owned e derivano da evidenza operativa reale, non dal Composer.

---

## 14. Proiezione Registro Docente

### 14.1 Contract candidate

```text
DIDACTIC_COMPOSITION_REGISTRO_PREVIEW_V1
importMode = PREVIEW_ONLY
acceptanceRequired = true
automaticWriteAllowed = false
```

### 14.2 Transitional mapping

La prima integrazione può proporre mapping a `UdaRecord` senza cambiare `PlanningStateV1`.

Regole:

- nessuna migrazione implicita a `MasterProgram`;
- nessun write prima di accettazione locale;
- nessun fan-out automatico verso tutte le classi;
- una composizione grade-common può produrre preview per una classe soltanto quando il target class è scelto esplicitamente;
- local override/adattamento di classe resta separato dal common nucleus.

### 14.3 Planned vs taught

Le `phases` possono diventare lezioni **previste**, non `UdaLesson` svolte.

Per materializzare un consuntivo reale serve un evento/observation confermato dal docente.

### 14.4 Assessment boundary

`EvidencePlan` e `AssessmentPlan` non possono generare automaticamente:

- `Grade`;
- `BehaviorRecord`;
- competence level;
- online test score;
- giudizio individuale.

---

## 15. Proiezione Studio Atlas / Atlas

### 15.1 Seed contract candidate

```text
DIDACTIC_COMPOSITION_STUDIO_ATLAS_SEED_V1
mode = PROPOSE_ONLY
publicPublicationAllowed = false
classIndependent = true
```

### 15.2 Allowed seed data

- didactic idea/problem;
- objectives;
- minimized curriculum binding;
- narrative seed;
- reusable material refs with rights/provenance;
- learning-object intent;
- evidence/provenance refs.

### 15.3 Forbidden seed data

- student identity;
- grades;
- personal class notes;
- TeachingSession state;
- Registro student data;
- automatic publication instruction.

### 15.4 Public publication

`PUBLISHED` remains Atlas-owned.

The Composer does not supersede the already governed Docente OS → Atlas publication contract. It only adds the Studio Atlas authoring route when a new pathway/experience must be created.

---

## 16. Drive export — deferred write slice

Drive remains part of the user journey but **outside Core v1 implementation**.

Future candidate:

```text
DIDACTIC_COMPOSITION_DRIVE_EXPORT_V1
mode = WRITE_EXTERNAL
requiresExplicitUserWrite = true
authorityClass = NONE
```

Preconditions before implementation:

1. explicit write contract outside OR-07 v0 or governed OR-07 evolution;
2. perceptible-write feedback;
3. explicit user target/destination;
4. idempotence/duplicate behavior defined;
5. failure/retry semantics;
6. no assumption that Intent Discovery current version exposes `WRITE_EXTERNAL`;
7. no Drive-to-product automatic sync.

Drive copies may carry composition/version/digest metadata, but editing a Drive file does not mutate adopted product state. Re-import is a new professional source and produces a new proposal/version.

---

## 17. Execution observation / closing the loop

Conceptual contract:

```ts
interface DidacticExecutionObservationV1 {
  contract: 'DIDACTIC_EXECUTION_OBSERVATION_V1'
  contractVersion: 1
  compositionId: string
  compositionVersion: number
  phaseRef: string
  sourceProduct: 'DOCENTE_OS'
  classRef: string
  observedAt: string
  completion: 'NOT_STARTED' | 'PARTIAL' | 'COMPLETED'
  actualDurationMinutes?: number
  continuationNote?: string
  evidenceRefs?: readonly string[]
  teacherConfirmed: true
  privacyClass: 'PROFESSIONAL_NON_PERSONAL'
}
```

### 17.1 Privacy rule for evidence refs

`evidenceRefs` may contain only:

- professional/non-personal evidence; or
- opaque target-local references whose protected content is **not dereferenced by the Composer**.

Student-personal evidence remains inside the owning product.

### 17.2 Registro consumption

Registro may use the observation as **consuntivo preview**.

Teacher confirmation is still required for the Registro write.

### 17.3 Continuity

An observation may become professional context for a later composition request such as «prepara la prossima attività», but the previous composition version remains immutable.

---

## 18. Independent state axes

No single global `status`.

### Composition

```text
PROPOSAL
ADOPTED_LOCAL
REJECTED_LOCAL
SUPERSEDED_LOCAL
```

### Docente OS projection

```text
NOT_PROJECTED
UNBOUND_PLANNING_PROPOSAL
BOUND_HUMAN_TASK_CANDIDATE
READY_FOR_HUMAN_APPROVAL
ADOPTED_IN_PRODUCT
```

Operational states remain product-owned.

### Registro

```text
NOT_PROJECTED
PREVIEW
ADOPTED_IN_PLANNING
CONSUNTIVO_PREVIEW
```

Actual recorded state remains Registro-owned.

### Studio Atlas

```text
NOT_SEEDED
SEED_CANDIDATE
ADOPTED_IN_AUTHORING
PUBLICATION_CANDIDATE
```

`PUBLISHED` is Atlas-owned.

### Drive

```text
NOT_EXPORTED
EXPORTED_COPY
OUTDATED_COPY
```

No authority semantics.

---

## 19. Contextual Copilot integration

The Composer is headless and does not require conversational UI.

A consumer using Contextual Copilot may:

1. discover intent (`PREPARE` or equivalent);
2. apply caller policy;
3. build `DidacticCompositionRequestV1`;
4. invoke the proposal capability;
5. show the proposal;
6. request local human adoption;
7. offer only target projections currently allowed by target contracts.

Rules:

- intent discovery != authorization;
- proposal generation != write permission;
- current `WRITE_EXTERNAL` discovery limitation remains unchanged;
- no new Core capability is authorized by this design alone.

---

## 20. Privacy and minimization

### Composer v1 privacy class

```text
PROFESSIONAL_NON_PERSONAL only
```

Forbidden input/output payload content:

- student names/ids;
- individual grades;
- diagnoses;
- named PEI/PDP details;
- health data;
- individual behavior notes;
- identifiable learner submissions.

Inclusive needs may be represented only in aggregate/progettuale form when necessary.

Products may own richer data internally but must minimize before Composer invocation.

Atlas learner access remains anonymous/local-first according to Atlas contracts; the Composer does not create student accounts or identified telemetry.

---

## 21. Provenance, versioning, freshness

Every proposal must be traceable to:

- request id;
- capability id/version;
- provider/adapter identity;
- accepted Arena context ref;
- `applicabilityStatus` + `regimeRef`;
- selected curriculum item refs;
- professional source refs;
- producedAt;
- content digest.

### 21.1 Revision semantics

- `compositionId` identifies the logical composition lineage;
- `compositionVersion` increments for material revisions;
- `contentDigest` identifies exact content;
- revisions never overwrite prior adopted projections silently.

### 21.2 Stale triggers

At minimum:

- Arena authority/vigency/applicability materially changes;
- professional source revision changes;
- composition digest/version changes;
- Docente OS `planBinding` changes;
- consumer teaching identity changes;
- adapter contract major version changes.

Stale snapshots remain readable as history but cannot be represented as current.

---

## 22. Failure semantics

### Composer result reasons

```text
SUCCEEDED
FAILED
UNAVAILABLE
UNAUTHORIZED
STALE_CONTEXT
AMBIGUOUS_CONTEXT
REVIEW_REQUIRED
```

### Projection adapter reasons

```text
SOURCE_STALE
IDENTITY_MISMATCH
AUTHORITY_CONTEXT_INVALID
TARGET_CONTRACT_MISMATCH
TARGET_STATE_CONFLICT
HUMAN_APPROVAL_REQUIRED
UNSUPPORTED_MAPPING
PLAN_BINDING_REQUIRED
```

No implicit mutative fallback.

---

## 23. Human control

### Gate C1 — Adopt composition

Human/product-local decision.

Allows local adoption receipt and target **preview/candidate** generation only.

Does not imply:

- Atlas publication;
- lesson execution;
- Registro consuntivo;
- grades;
- Drive export.

### Gate C2 — Student publication

Not owned by Composer.

Uses existing/future target publication gates:

- Docente OS → Atlas publication contract where applicable;
- Studio Atlas → publication candidate → Atlas gate for authored pathways.

No extra global micro-approval layer is introduced for normal product-local actions that already have qualified write semantics.

---

## 24. UX principles

The teacher should see human actions, not infrastructure:

```text
Usa questa proposta
Prepara la prossima lezione
Aggiungi alla programmazione
Crea un percorso/materiale per gli studenti
Archivia una copia dei documenti
```

Technical detail is progressive disclosure:

- composition id/version;
- digest;
- authority refs;
- provenance;
- adapter version;
- stale reason.

User-initiated writes must have perceptible feedback under the relevant write contract.

---

## 25. Negative knowledge / explicit prohibitions

V1 must not:

- create a central TRAMA UDA database;
- add a new student account system;
- automatically sync adopted copies across products;
- use Drive as technical source of truth;
- use Atlas public as professional editor;
- bypass Studio Atlas for authored pathways;
- bypass Docente OS plan/projection gates;
- auto-map an unbound composition directly into `Conduci`;
- migrate Registro `UdaRecord` to `MasterProgram`;
- fan out one UDA to all classes automatically;
- treat planned lesson as taught;
- treat evidence plan as grade;
- send student-personal content to Composer;
- dereference protected student evidence refs;
- mutate Arena;
- activate DOS-A1;
- authorize merge/deploy/runtime.

---

## 26. Compatibility strategy

### Arena

Reuse caller-accepted context. No new Arena transport required for first Core slice.

### Registro

Preview adapter against current operational UDA domain; annual-domain migration remains separate.

### Docente OS

Unbound planning proposal first; bound Human Task candidate only after current product gates resolve.

### Studio Atlas

Minimized seed; no direct public publication.

### Contextual Copilot

Reuse discovery/policy/dispatch separation. No second parser/chat engine.

### Drive

Deferred explicit write slice.

---

## 27. Candidate slices — NOT AUTHORIZED

These are decomposition candidates only, not an implementation plan.

### DC-00 — Product identity contract evolution

Register `REGISTRO_DOCENTE` and `STUDIO_ATLAS` as distinct governed product identities in the shared integration envelope. Preserve v0 compatibility.

### DC-01 — Contract Core

Request/proposal types, validation, deterministic serialization/digest, fake provider, no external write.

### DC-02 — Adoption receipt

Product-neutral receipt format; consumer persists locally.

### DC-03 — Registro preview adapter

Proposal → `UdaRecord` preview only; explicit target class; no write/migration.

### DC-04A — Docente OS unbound planning adapter

Proposal → Progetta common nucleus candidate.

### DC-04B — Docente OS bound Human Task adapter

Only after real `planBinding` and existing candidate gates.

### DC-05 — Studio Atlas seed adapter

Minimized class-independent seed.

### DC-06 — Drive export

Deferred `WRITE_EXTERNAL`; separate governance/authorization.

### DC-07 — Execution observation

Teacher-confirmed Docente OS summary → Registro consuntivo preview.

### DC-08 — Contextual Copilot wiring

Consumer-local intent → Composer handoff; no new Core authority.

Actual order must be decided only after human design approval and implementation planning.

---

## 28. Acceptance criteria

A future implementation must prove:

1. Composer is `PROPOSE_ONLY` and has no domain store;
2. proposal is source-bound, authority-bound, versioned and deterministically digestable;
3. `TRANSITIONAL` Arena context is preserved rather than collapsed;
4. stale/ambiguous/non-vigente context fails closed;
5. no student-personal data enters the Composer;
6. OR-07/OR-10 product identity expansion happens before real Registro/Studio Atlas wiring;
7. Registro remains preview-only before local acceptance;
8. grade-common composition does not auto-fan-out to classes;
9. Registro planning does not imply taught/recorded;
10. assessment plan does not create grades;
11. Docente OS unbound proposals cannot enter runtime;
12. bound Docente OS projections cannot bypass `planBinding`/Human Approval;
13. Studio Atlas receives a seed, not a publication;
14. Atlas `PUBLISHED` remains target-owned;
15. Drive export is excluded from Core v1 and requires separate write authorization;
16. new composition version does not silently overwrite old projections;
17. execution observations contain no student-personal payload;
18. failure/stale paths cause no mutation;
19. Contextual Copilot discovery does not equal execution authorization;
20. DOS-A1 remains unchanged.

---

## 29. Builder check

An implementer should not have to guess:

- who owns curriculum authority;
- whether the Composer stores canonical UDA state;
- whether adoption is global;
- whether Registro/Studio Atlas are already OR-07 callers;
- whether Drive belongs to the first Core capability;
- how `TRANSITIONAL` is treated;
- whether an unbound Docente OS composition can reach runtime;
- whether Atlas can be published directly;
- whether planned means taught;
- whether evidence plan means grade;
- whether student data are allowed.

These are closed here.

Implementation-local decisions intentionally left open:

- exact digest algorithm qualification (`sha256` candidate);
- exact local snapshot stores;
- transport mechanism;
- UI per consumer;
- later `MasterProgram` mapping;
- manual revision/sync UX.

None changes authority boundaries.

---

## 30. Next gate

**STOP after Human Design Review.**

If approved:

1. approve/register ADR-022;
2. invoke implementation-planning workflow;
3. decide whether DC-00 is prerequisite implementation slice or separate OR-07/OR-10 evolution;
4. define exact schema/validator for DC-01;
5. obtain causal RED tests for authority/privacy/versioning;
6. implement only the first authorized slice;
7. no merge/deploy/runtime without existing ecosystem gates.
