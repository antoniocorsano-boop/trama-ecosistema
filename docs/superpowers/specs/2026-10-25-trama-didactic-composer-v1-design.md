# TRAMA Didactic Composer v1 — Governed didactic composition and product projections

**Data:** 2026-10-25  
**Capability:** `CAP-DIDACTIC-COMPOSER`  
**Shared capability candidate:** `didactic.composition.propose@1`  
**Repository:** `antoniocorsano-boop/trama-ecosistema`  
**Baseline TRAMA:** `main@d11112434bb45364e7bddbee6d4df1a86f9b351a`  
**Observed Arena:** `main@d8b1bf43388cb5c4cdcc940b0c558bb128976c4c`  
**Observed Registro Docente:** `main@38b7f0dd874806aaf56dd0ecef7e93d01ce34039`  
**Observed Docente OS:** `develop@1c50c1bc620cdd0b7bafcff0dc5c613367df3298`  
**Observed Atlas:** `main@c322b07a68d4508ec437941f8688012765e88848`  
**Status:** DESIGN MATERIALIZED · CROSS-CONTRACT VALIDATED · HUMAN DESIGN REVIEW PENDING · NO IMPLEMENTATION AUTHORIZED  
**Runtime:** NOT_AUTHORIZED  
**Authority change:** NONE  
**DOS-A1:** UNCHANGED / `RUNTIME_DEFERRED`

---

## 1. Intento

Definire una capability condivisa che trasformi un intento professionale del docente, fonti pertinenti e un contesto di curricolo governato in una **proposta di composizione didattica strutturata**: UDA, attività, lezione, laboratorio, verifica, recupero o estensione.

La capability deve permettere il riuso della stessa composizione tra Docente OS, Registro Docente, Studio Atlas/Atlas e document workspace senza introdurre una nuova authority centrale.

Il problema non è soltanto generare contenuti. Il disegno deve preservare contemporaneamente:

1. autorità del curricolo Arena;
2. decisione professionale del docente;
3. ownership e persistenza product-local;
4. privacy-first;
5. provenance e versioning;
6. distinzione tra progettazione, preparazione, pubblicazione, svolgimento, registrazione e valutazione.

---

## 2. Risultato della validazione

La direzione è valida soltanto nella forma seguente:

> **Shared capability stateless `PROPOSE_ONLY` + artifact di composizione immutabile/versionato + adoption receipt product-local + projection adapters governati.**

La validazione sui contratti correnti ha prodotto cinque correzioni sostanziali.

### V1 — Nessun nuovo prodotto centrale

OR-07 e OR-10 vietano che il layer condiviso diventi database, write authority o orchestratore centrale. Il Composer non può essere una nuova applicazione TRAMA con store canonico proprio.

### V2 — Registro e Studio Atlas richiedono una product identity esplicita

OR-07/OR-10 v0 enumerano i prodotti storici e non includono ancora `REGISTRO_DOCENTE` e `STUDIO_ATLAS` come caller identity.

Prima del wiring reale deve esistere una evoluzione additiva del contract registry/envelope che registri queste identità senza assimilarle a `DOCENTE_OS` o `ATLAS`.

### V3 — Drive non appartiene alla prima capability OR-07

OR-07 v0 ammette soltanto `READ_ONLY` e `PROPOSE_ONLY`. Un export Drive è `WRITE_EXTERNAL`.

Quindi Drive resta nel journey, ma l'export:

- è una slice separata;
- non fa parte del Core `didactic.composition.propose@1`;
- richiede un proprio write contract;
- richiede feedback percepibile e autorizzazione utente;
- non può assumere che l'attuale Intent Discovery esponga `WRITE_EXTERNAL`.

### V4 — Arena `TRANSITIONAL` deve essere preservato

Il contratto Arena → Registro distingue `applicabilityStatus = APPLICABLE | TRANSITIONAL`.

Il Composer può accettare `TRANSITIONAL` quando:

- `authorityState = APPROVED`;
- `vigencyStatus = VIGENTE`;
- il caller ha validato/accettato il contesto;
- `regimeRef` e `applicabilityStatus` vengono preservati nella provenance e nella composizione.

### V5 — Docente OS necessita due livelli di proiezione

Una composizione didattica nuova non coincide automaticamente con una Human Task legata a un blocco Piano/PACK.

La proiezione distingue:

1. `UNBOUND_PLANNING_PROPOSAL` — nucleo didattico per `Progetta`, non ancora eseguibile;
2. `BOUND_HUMAN_TASK_CANDIDATE` — possibile soltanto quando Docente OS risolve un `planBinding` coerente e supera i gate correnti.

---

## 3. Vincoli canonici non riapribili

- Arena resta l'autorità del curricolo.
- TRAMA governa decisioni e contratti trasversali senza diventare una quarta applicazione.
- Shared Capability Layer non è domain store, write authority o orchestratore centrale.
- Ogni prodotto conserva stato, regole decisionali, persistenza e UI propri.
- Il docente mantiene accetta/modifica/sostituisci/escludi.
- Docente OS resta teacher-first e proprietario dello stato operativo lezione/classe.
- Registro Docente resta proprietario di programmazione, consuntivo e valutazione nel proprio dominio.
- Studio Atlas possiede l'authoring professionale dei Percorsi.
- Atlas pubblico possiede identity/version/publication state delle proprie risorse.
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

Il Composer non introduce write verso Arena.

### 4.2 Registro Docente

Il repository mantiene due domini distinti:

- `UdaRecord` / `UdaLesson`: dominio operativo oggi usato;
- `PlanningStateV1`: profili annuali, contesto Arena e strutture future `MasterProgram` / `ClassProgramInstance`.

Il primo adapter Composer non anticipa la migrazione a `MasterProgram`.

### 4.3 Docente OS

La pipeline Human Task corrente usa:

- `candidateId` legato a generazioni esatte;
- `planBinding`;
- source alignment;
- provenance UDA/PACK;
- `READY_FOR_HUMAN_APPROVAL`;
- promozione separata con decisione umana.

Il Composer entra prima o accanto a tali gate, non li sostituisce.

### 4.4 Studio Atlas / Atlas

Studio Atlas è dominio professionale di authoring; Atlas pubblico resta learner/public facing.

Il percorso corretto per un nuovo Percorso è:

```text
composition → Studio Atlas seed → authoring/review/preview → publication candidate → Atlas publication gate
```

### 4.5 Contextual Copilot

Il Core separa intent discovery, policy e dispatch. Il Composer non implementa un secondo chatbot/parser.

---

## 5. Approcci considerati

### A. Nuovo prodotto/store centrale

**Scartato.** Introduce nuova authority pratica, conflitto con OR-07/OR-10 e sincronizzazione permanente.

### B. Composer separato in ogni prodotto

**Scartato.** Produce drift semantico, policy duplicate e provenance frammentata.

### C. Shared capability stateless + artifact versionato + adapter product-local

**Selezionato.**

Vantaggi:

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

`ownerDomain: TRAMA` significa ownership del contratto condiviso, non autorità didattica o del curricolo.

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
               autorità del curricolo
                         │
              contesto accettato/valido
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

Conseguenze:

- progettato non significa preparato;
- preparato non significa svolto;
- pubblicato non significa usato;
- svolto non significa consuntivato;
- evidenza raccolta non significa voto;
- interazione Atlas non significa valutazione del Registro;
- adozione in un prodotto non significa adozione negli altri.

---

## 9. Product identity extension prerequisite

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
- l'espansione non trasferisce authority;
- compatibilità con consumer v0 preservata.

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

  curricoloContext: {
    authorityProduct: 'ARENA'
    acceptedContextRef: string
    authorityState: 'APPROVED'
    vigencyStatus: 'VIGENTE'
    applicabilityStatus: 'APPLICABLE' | 'TRANSITIONAL'
    regimeRef: string
    sourceRefs: readonly string[]
    curricoloItems: readonly CurricoloContextItem[]
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
- `classRef` may identify a teaching section but not a student;
- `TRANSITIONAL` is allowed and preserved;
- `PROVISIONAL_COMPLETE` or `NON_VIGENTE` is not accepted as authoritative input v1;
- stale/ambiguous Arena context fails closed;
- caller responsible for qualified resolution/acceptance;
- Composer never writes Arena;
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

  curricoloBinding: {
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

La proposta non è curricolo Arena, adozione professionale, lesson runtime, consuntivo, pubblicazione Atlas, voto o write authorization.

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

Il receipt è product-local e non promuove altri prodotti.

---

## 13. Proiezione Docente OS

### 13.1 Due modalità

```text
UNBOUND_PLANNING_PROPOSAL
BOUND_HUMAN_TASK_CANDIDATE
```

`UNBOUND_PLANNING_PROPOSAL` supporta `Progetta`, il nucleo comune di grado e la selezione di materiali. Non può entrare in `Conduci`.

`BOUND_HUMAN_TASK_CANDIDATE` è possibile solo dopo risoluzione product-local di grade, block, `planBinding`, UDA/PACK/segment/title e provenance delle fonti.

### 13.2 Blocking rules

Fallire chiuso se:

- anno/grado/disciplina divergono;
- block non esiste;
- `planBinding` diverge;
- composition version è stale;
- adapter inventa attività/materiali/tempi non sostenuti;
- si tenta promozione runtime senza Human Approval.

Gli stati operativi `IN_PREPARATION`, `IN_PROGRESS`, `PARTIAL`, `COMPLETED` restano Docente OS-owned.

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
- target class scelto esplicitamente;
- local override di classe separato dal common nucleus.

### 14.3 Planned vs taught

Le `phases` possono diventare lezioni previste, non lezioni svolte.

Per il consuntivo reale serve un evento/observation confermato dal docente.

### 14.4 Assessment boundary

`EvidencePlan` e `AssessmentPlan` non generano automaticamente `Grade`, comportamento, livello di competenza, test score o giudizio individuale.

---

## 15. Proiezione Studio Atlas / Atlas

### 15.1 Seed contract candidate

```text
DIDACTIC_COMPOSITION_STUDIO_ATLAS_SEED_V1
mode = PROPOSE_ONLY
publicPublicationAllowed = false
classIndependent = true
```

Allowed:

- didactic idea/problem;
- objectives;
- minimized curricolo binding;
- narrative seed;
- reusable material refs with rights/provenance;
- learning-object intent;
- evidence/provenance refs.

Forbidden:

- student identity;
- grades;
- personal class notes;
- TeachingSession state;
- Registro student data;
- automatic publication instruction.

`PUBLISHED` remains Atlas-owned.

---

## 16. Drive export — deferred write slice

Drive remains part of the user journey but outside Core v1 implementation.

Future candidate:

```text
DIDACTIC_COMPOSITION_DRIVE_EXPORT_V1
mode = WRITE_EXTERNAL
requiresExplicitUserWrite = true
authorityClass = NONE
```

Preconditions:

1. explicit write contract outside OR-07 v0 or governed OR-07 evolution;
2. perceptible-write feedback;
3. explicit user destination;
4. idempotence/duplicate behavior;
5. failure/retry semantics;
6. no assumption that current Intent Discovery exposes `WRITE_EXTERNAL`;
7. no Drive-to-product automatic sync.

Editing a Drive copy does not mutate adopted product state. Re-import is a new professional source and produces a new proposal/version.

---

## 17. Execution observation / closing the loop

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

`evidenceRefs` possono essere soltanto professionali/non personali oppure opaque target-local refs che il Composer non dereferenzia.

Registro può usare l'observation come consuntivo preview. Il write finale resta una decisione del Registro/docente.

Una observation può alimentare una richiesta successiva come «prepara la prossima attività», ma non muta la composizione precedente.

---

## 18. Independent state axes

Non esiste un unico global status.

### Composition

```text
PROPOSAL
ADOPTED_LOCAL
REJECTED_LOCAL
SUPERSEDED_LOCAL
```

### Docente OS

```text
NOT_PROJECTED
UNBOUND_PLANNING_PROPOSAL
BOUND_HUMAN_TASK_CANDIDATE
READY_FOR_HUMAN_APPROVAL
ADOPTED_IN_PRODUCT
```

### Registro

```text
NOT_PROJECTED
PREVIEW
ADOPTED_IN_PLANNING
CONSUNTIVO_PREVIEW
```

### Studio Atlas

```text
NOT_SEEDED
SEED_CANDIDATE
ADOPTED_IN_AUTHORING
PUBLICATION_CANDIDATE
```

`PUBLISHED` resta Atlas-owned.

### Drive

```text
NOT_EXPORTED
EXPORTED_COPY
OUTDATED_COPY
```

---

## 19. Contextual Copilot integration

Il Composer è headless.

Un consumer può:

1. discover intent;
2. applicare caller policy;
3. costruire `DidacticCompositionRequestV1`;
4. invocare la proposal capability;
5. mostrare la proposta;
6. chiedere local human adoption;
7. offrire soltanto proiezioni consentite dai target contracts.

Intent discovery non equivale ad authorization. Proposal generation non equivale a write permission.

---

## 20. Privacy and minimization

Composer v1 accetta soltanto:

```text
PROFESSIONAL_NON_PERSONAL
```

Forbidden:

- student names/ids;
- individual grades;
- diagnoses;
- named PEI/PDP details;
- health data;
- individual behavior notes;
- identifiable learner submissions.

Inclusive needs possono essere rappresentati solo in forma aggregata/progettuale.

---

## 21. Provenance, versioning, freshness

Ogni proposta deve essere traceable a:

- request id;
- capability id/version;
- provider/adapter identity;
- accepted Arena context ref;
- `applicabilityStatus` + `regimeRef`;
- selected curricolo item refs;
- professional source refs;
- producedAt;
- content digest.

Revision semantics:

- `compositionId` identifica la lineage logica;
- `compositionVersion` incrementa per revisioni materiali;
- `contentDigest` identifica contenuto esatto;
- revisioni non sovrascrivono proiezioni precedenti.

Stale triggers includono cambi materiali a Arena authority/vigency/applicability, source revisions, composition digest/version, Docente OS `planBinding`, consumer teaching identity o adapter major version.

---

## 22. Failure semantics

Composer reasons:

```text
SUCCEEDED
FAILED
UNAVAILABLE
UNAUTHORIZED
STALE_CONTEXT
AMBIGUOUS_CONTEXT
REVIEW_REQUIRED
```

Projection adapter reasons:

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

Nessun fallback mutativo implicito.

---

## 23. Human control

### Gate C1 — Adopt composition

Decisione umana/product-local. Consente local adoption receipt e preview/candidate di proiezione.

Non implica Atlas publication, lesson execution, Registro consuntivo, grades o Drive export.

### Gate C2 — Student publication

Non appartiene al Composer.

Usa i gate target esistenti/futuri:

- Docente OS → Atlas publication contract quando applicabile;
- Studio Atlas → publication candidate → Atlas gate per Percorsi.

---

## 24. UX principles

La superficie primaria usa azioni umane:

```text
Usa questa proposta
Prepara la prossima lezione
Aggiungi alla programmazione
Crea un percorso/materiale per gli studenti
Archivia una copia dei documenti
```

Dettagli tecnici sono progressive disclosure: composition id/version, digest, authority refs, provenance, adapter version e stale reason.

---

## 25. Negative knowledge / explicit prohibitions

V1 non deve:

- creare un database centrale TRAMA delle UDA;
- aggiungere student accounts;
- sincronizzare automaticamente copie adottate;
- usare Drive come technical source of truth;
- usare Atlas pubblico come editor professionale;
- bypassare Studio Atlas per Percorsi authored;
- bypassare Docente OS plan/projection gates;
- portare una unbound composition direttamente in `Conduci`;
- migrare Registro `UdaRecord` a `MasterProgram`;
- fan-out automatico di una UDA a tutte le classi;
- trattare planned lesson come taught;
- trattare evidence plan come grade;
- inviare student-personal content al Composer;
- dereferenziare protected student evidence refs;
- mutare Arena;
- attivare DOS-A1;
- autorizzare merge/deploy/runtime.

---

## 26. Compatibility strategy

- **Arena:** reuse caller-accepted context; nessun nuovo transport nel primo Core.
- **Registro:** preview adapter verso current operational UDA domain; annual-domain migration separata.
- **Docente OS:** unbound planning first; bound Human Task solo dopo current gates.
- **Studio Atlas:** minimized seed; no public publish.
- **Contextual Copilot:** reuse discovery/policy/dispatch; no second parser/chat engine.
- **Drive:** deferred explicit write slice.

---

## 27. Candidate slices — NOT AUTHORIZED

- **DC-00 — Product identity contract evolution:** registrare `REGISTRO_DOCENTE` e `STUDIO_ATLAS` come identità distinte.
- **DC-01 — Contract Core:** request/proposal types, validation, deterministic serialization/digest, fake provider.
- **DC-02 — Adoption receipt:** formato product-neutral, persistenza local.
- **DC-03 — Registro preview adapter:** proposal → `UdaRecord` preview, target class esplicita, no write/migration.
- **DC-04A — Docente OS unbound planning adapter:** proposal → Progetta common nucleus candidate.
- **DC-04B — Docente OS bound Human Task adapter:** solo con real `planBinding` e candidate gates.
- **DC-05 — Studio Atlas seed adapter:** minimized class-independent seed.
- **DC-06 — Drive export:** deferred `WRITE_EXTERNAL`.
- **DC-07 — Execution observation:** teacher-confirmed summary → Registro consuntivo preview.
- **DC-08 — Contextual Copilot wiring:** consumer-local intent → Composer handoff, no new Core authority.

Actual order is decided only after Human Design Review and a separate implementation plan.

---

## 28. Acceptance criteria

A future implementation must prove:

1. Composer is `PROPOSE_ONLY` and has no domain store;
2. proposal is source-bound, authority-bound, versioned and deterministically digestable;
3. `TRANSITIONAL` is preserved;
4. stale/ambiguous/non-vigente context fails closed;
5. no student-personal data enters Composer;
6. product identity expansion happens before Registro/Studio Atlas runtime wiring;
7. Registro remains preview-only before local acceptance;
8. grade-common composition does not auto-fan-out to classes;
9. Registro planning does not imply taught/recorded;
10. assessment plan does not create grades;
11. Docente OS unbound proposals cannot enter runtime;
12. bound Docente OS projections cannot bypass `planBinding`/Human Approval;
13. Studio Atlas receives a seed, not a publication;
14. Atlas `PUBLISHED` remains target-owned;
15. Drive export is excluded from Core v1;
16. new composition version does not silently overwrite old projections;
17. execution observations contain no student-personal payload;
18. failure/stale paths cause no mutation;
19. Contextual Copilot discovery does not equal execution authorization;
20. DOS-A1 remains unchanged.

---

## 29. Builder check

Un implementatore non deve dover scegliere o indovinare:

- chi possiede l'autorità del curricolo;
- se il Composer memorizza uno stato UDA canonico;
- se l'adozione è globale;
- se Registro/Studio Atlas sono già caller OR-07;
- se Drive appartiene al primo Core;
- come viene trattato `TRANSITIONAL`;
- se una composizione unbound Docente OS può raggiungere runtime;
- se Atlas può essere pubblicato direttamente;
- se planned significa taught;
- se evidence plan significa grade;
- se student data sono ammessi.

Decisioni implementation-local intenzionalmente aperte:

- exact digest algorithm qualification (`sha256` candidate);
- exact local snapshot stores;
- transport mechanism;
- UI per consumer;
- later `MasterProgram` mapping;
- manual revision/sync UX.

Nessuna modifica i confini di authority.

---

## 30. Next gate

**STOP after Human Design Review.**

Se approvato:

1. approvare/registrare ADR-022;
2. invocare implementation-planning workflow;
3. decidere se DC-00 è prerequisite slice o evoluzione OR-07/OR-10 separata;
4. definire schema/validator esatto per DC-01;
5. ottenere causal RED tests per authority/privacy/versioning;
6. implementare soltanto la prima slice autorizzata;
7. nessun merge/deploy/runtime senza i gate esistenti.
