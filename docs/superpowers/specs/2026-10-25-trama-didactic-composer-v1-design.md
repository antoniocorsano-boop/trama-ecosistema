# TRAMA Didactic Composer v1 — Governed didactic composition and product projections

**Data:** 2026-10-25  
**Capability:** `CAP-DIDACTIC-COMPOSER`  
**Shared capability:** `didactic.composition.propose@1`  
**Repository:** `antoniocorsano-boop/trama-ecosistema`  
**Baseline TRAMA:** `main@d11112434bb45364e7bddbee6d4df1a86f9b351a`  
**Observed Arena:** `antoniocorsano-boop/CurManLight_arena@d8b1bf43388cb5c4cdcc940b0c558bb128976c4c`  
**Observed Registro Docente:** `antoniocorsano-boop/registro-docente@38b7f0dd874806aaf56dd0ecef7e93d01ce34039`  
**Observed Docente OS develop:** `antoniocorsano-boop/docente-os-2026-27@1c50c1bc620cdd0b7bafcff0dc5c613367df3298`  
**Observed Atlas main:** `antoniocorsano-boop/Curriculum-Atlas@c322b07a68d4508ec437941f8688012765e88848`  
**Status:** DESIGN MATERIALIZED · HUMAN DESIGN REVIEW PENDING · NO IMPLEMENTATION AUTHORIZED  
**Runtime:** NOT_AUTHORIZED  
**Authority change:** NONE  
**DOS-A1:** UNCHANGED / `RUNTIME_DEFERRED`

---

## 1. Intento

Definire una capability condivisa che trasformi un intento professionale del docente e un contesto curricolare governato in una **proposta di composizione didattica strutturata**, inizialmente centrata su UDA, attività, lezioni, laboratori, verifiche, recuperi ed estensioni.

La capability deve evitare quattro errori architetturali:

1. creare un nuovo prodotto centrale che duplichi Arena, Docente OS, Registro Docente o Studio Atlas;
2. trasformare una proposta generativa in decisione professionale o curricolare;
3. usare la stessa copia mutabile della UDA come store condiviso tra prodotti;
4. confondere ciò che è progettato con ciò che è preparato, pubblicato, svolto, registrato o valutato.

La prima applicazione di riferimento è la composizione di una UDA a partire da un intento del docente, da fonti professionali/private pertinenti e da un contesto curricolare Arena già accettato dal prodotto chiamante.

---

## 2. Risultato della validazione architetturale

La direzione selezionata è compatibile con i contratti esistenti soltanto se il Composer resta una **shared capability stateless `PROPOSE_ONLY`**.

### 2.1 Vincoli già canonici che non devono essere riaperti

- Arena resta l'autorità curricolare.
- TRAMA governa i contratti trasversali ma non diventa una quarta applicazione.
- Shared Capability Layer non è database, write authority o orchestratore centrale.
- Ogni prodotto mantiene stato di dominio, regole decisionali, persistenza proprietaria e UI finale.
- Il docente conserva la decisione professionale su adozione, modifica, esclusione, sostituzione e pubblicazione.
- Atlas pubblico non è un editor professionale.
- Studio Atlas possiede l'authoring dei Percorsi e produce publication candidates; la pubblicazione Atlas resta un gate separato.
- Drive ospita documenti umani e copie dichiarate, non una replica tecnica autorevole dell'ecosistema.
- DOS-A1 resta `RUNTIME_DEFERRED`.

### 2.2 Vincoli osservati nei prodotti

**Docente OS** possiede già un modello rigoroso di proiezione Human Task: il draft può raggiungere `READY_FOR_HUMAN_APPROVAL`, conserva `planBinding`, generation/provenance e non può essere promosso implicitamente al runtime.

**Registro Docente** contiene oggi due domini separati:

- `UdaRecord` / `UdaLesson`, operativo e realmente usato;
- `PlanningStateV1`, che contiene il contesto annuale Arena e strutture future `MasterProgram` / `ClassProgramInstance`.

La separazione è intenzionale: il Composer non deve forzare una migrazione tra i due domini.

**Arena → Registro** usa già `ARENA_REGISTRO_PLANNING_CONTEXT_V1` con `PREVIEW_ONLY`, `acceptanceRequired=true` e `automaticWriteAllowed=false`.

**Contextual Copilot Core** distingue semantic discovery, policy e dispatch. Il Composer non deve introdurre un secondo stack conversazionale: può essere invocato tramite il Core, ma resta utilizzabile anche headless.

---

## 3. Decisione architetturale

### 3.1 Il Composer non è un prodotto

`CAP-DIDACTIC-COMPOSER` è una capability cognitiva condivisa e provider-neutral.

Identity iniziale:

```text
didactic.composition.propose@1
```

Descriptor previsto:

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

`ownerDomain: 'TRAMA'` identifica la proprietà del **contratto condiviso**, non un'autorità didattica o curricolare di TRAMA.

### 3.2 Una UDA condivisa non è uno store condiviso

La formulazione «una UDA, più proiezioni» viene resa tecnicamente come:

> una singola **versione immutabile e content-addressed di composizione didattica**, adottabile localmente dai prodotti e proiettabile attraverso contratti espliciti.

Il Shared Capability Layer non persiste uno stato globale della UDA.

Ogni prodotto può conservare una copia/snapshot locale della versione adottata e deve conservarne:

- `compositionId`;
- `compositionVersion`;
- `contentDigest`;
- `sourceRefs`;
- `authorityRefs`;
- `adoptionReceiptRef` quando adottata;
- `producedAt` / freshness;
- adapter/versione usati per la proiezione.

Una modifica alla composizione produce una **nuova versione**, non una mutazione silenziosa delle proiezioni già adottate.

### 3.3 L'autorità della composizione è professionale e locale

Il Composer produce soltanto una proposta.

L'adozione è una decisione umana catturata dal prodotto in cui avviene l'adozione. Non esiste un `APPROVED` globale assegnato dalla capability.

Un altro prodotto che riceve la stessa composizione può:

- riconoscerne identità e digest;
- mostrare una preview;
- proporre un mapping;
- richiedere la propria adozione/accettazione se il proprio dominio lo richiede.

Non eredita automaticamente lo stato decisionale del prodotto sorgente.

---

## 4. Approcci considerati

### A. Nuovo prodotto centrale “TRAMA Composer” con database proprio

**Scartato.**

Vantaggio: una sola UI e un solo store.

Problemi:

- crea una nuova authority pratica;
- contraddice OR-07/OR-10 e ADR-001;
- duplica progettazione, UDA, lesson preparation e publishing;
- aumenta sincronizzazione e conflict resolution tra prodotti.

### B. Composer distinto dentro ogni prodotto

**Scartato.**

Vantaggio: ownership semplice e locale.

Problemi:

- replica logica, prompt, policy e contratti;
- produce drift tra Registro, Docente OS e Studio Atlas;
- rende difficile riusare la stessa composizione e la stessa provenance.

### C. Shared capability stateless + artifact versionato + projection adapters product-local

**Selezionato.**

Vantaggi:

- una semantica di composizione condivisa;
- nessuna nuova authority centrale;
- ogni prodotto conserva stato e decisioni propri;
- compatibilità con Contextual Copilot Core;
- possibilità di evolvere i consumer indipendentemente;
- composizioni confrontabili e tracciabili tramite digest/versione.

Trade-off accettato: non esiste sincronizzazione mutativa automatica tra prodotti; le revisioni devono essere proposte come nuove versioni e adottate esplicitamente.

---

## 5. Modello concettuale

```text
                       ARENA
              curriculum authority
                       │
             accepted/validated ref
                       ▼
             calling product context
        Registro / Docente OS / future host
                       │
                       │ intent + sources + context
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
       ┌───────────────┼────────────────┬──────────────────┐
       ▼               ▼                ▼                  ▼
  DOCENTE OS      REGISTRO          STUDIO ATLAS         DRIVE
 operational      planning/         authoring seed       human docs /
 projection       consuntivo        / candidate          declared copy
       │               │                │
       │               │                ▼
       │               │           Atlas publication
       │               │           governed separately
       │               │
       ▼               ▼
 execution         teacher-confirmed
 observation  ───► consuntivo preview
```

---

## 6. Invariante principale

```text
PLANNED
!= PREPARED
!= PUBLISHED
!= TAUGHT
!= RECORDED
!= ASSESSED
```

In termini di prodotto:

- progettare una fase non significa che Docente OS l'abbia preparata;
- preparare una lezione non significa che sia stata svolta;
- pubblicare una risorsa non significa che sia stata usata in classe;
- svolgere una lezione non significa che il Registro l'abbia consuntivata;
- raccogliere evidenze non significa assegnare una valutazione;
- risultati o interazioni Atlas non diventano automaticamente valutazioni del Registro.

Nessuna transizione tra questi concetti è implicita.

---

## 7. Input contract del Composer

Il Composer riceve il minimo contesto necessario.

```ts
interface DidacticCompositionRequestV1 {
  contract: 'DIDACTIC_COMPOSITION_REQUEST_V1'
  requestId: string
  caller: {
    product: 'DOCENTE_OS' | 'REGISTRO_DOCENTE' | 'STUDIO_ATLAS' | 'OTHER_GOVERNED'
    surface: string
  }
  intent: {
    message: string
    requestedKind: 'UDA' | 'ACTIVITY' | 'LESSON' | 'LAB' | 'ASSESSMENT' | 'RECOVERY' | 'EXTENSION' | 'AUTO'
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
    sourceRefs: string[]
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

### 7.1 Regole input

- Il Composer non accetta student names, identifiers, grades, diagnoses o note individuali.
- `classRef` può essere una sezione/identità professionale non personale quando necessaria per contesto operativo.
- Il Composer non accetta un contesto Arena `PROVISIONAL`, `NON_VIGENTE`, ambiguo o stale come base autorevole v1.
- Il caller conserva la responsabilità di aver risolto/accettato il contesto Arena secondo il proprio contratto qualificato.
- Il Composer non effettua un write verso Arena.
- Le fonti private restano referenziate; il trasferimento di contenuto a provider remoti è soggetto ai guardrail del caller/Core e al consenso previsto.

---

## 8. Output contract: proposta

```ts
interface DidacticCompositionProposalV1 {
  contract: 'DIDACTIC_COMPOSITION_PROPOSAL_V1'
  compositionId: string
  compositionVersion: 1
  contentDigest: string
  status: 'PROPOSAL'
  requestedKind: DidacticKind
  title: string
  rationale: string
  curriculumBinding: {
    acceptedContextRef: string
    sourceRefs: string[]
    selectedItemRefs: string[]
  }
  provenance: {
    requestId: string
    capabilityId: 'didactic.composition.propose'
    capabilityVersion: '1'
    providerRef: string
    adapterRef: string
    professionalSourceRefs: string[]
  }
  design: {
    drivingQuestion?: string
    competencies: string[]
    objectives: string[]
    knowledge: string[]
    phases: DidacticPhaseV1[]
    evidencePlan: EvidencePlanV1[]
    assessmentPlan?: AssessmentPlanV1
    inclusionPlan?: InclusionPlanV1
    interdisciplinaryLinks?: InterdisciplinaryLinkV1[]
  }
  projectionHints: {
    docenteOs: ProjectionHintV1
    registro: ProjectionHintV1
    studioAtlas: ProjectionHintV1
    drive: ProjectionHintV1
  }
  review: {
    blockingIssues: ReviewIssueV1[]
    warnings: ReviewIssueV1[]
    assumptions: string[]
  }
  producedAt: string
}
```

### 8.1 Output non autoritativo

La proposta:

- non è curricolo Arena;
- non è una UDA già adottata dal docente;
- non è una lezione pronta nel runtime Docente OS;
- non è una registrazione del Registro;
- non è una pubblicazione Atlas;
- non è una valutazione;
- non autorizza write esterni.

---

## 9. Adozione locale

Ogni consumer che consente adozione deve produrre un receipt locale.

```ts
interface DidacticCompositionAdoptionReceiptV1 {
  contract: 'DIDACTIC_COMPOSITION_ADOPTION_RECEIPT_V1'
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

Il receipt non promuove gli altri prodotti.

---

## 10. Proiezione Docente OS

### 10.1 Scopo

Tradurre una composizione adottata in un candidato utilizzabile nel flusso `Progetta → Prepara → Conduci → Osserva → Continua`, senza bypassare il Piano annuale e la Human Task pipeline esistente.

### 10.2 Contratto

```text
DIDACTIC_COMPOSITION_DOCENTE_OS_PROJECTION_V1
mode = PROPOSE_ONLY
promotion = HUMAN_APPROVAL_REQUIRED
```

### 10.3 Regole bloccanti

La proiezione Docente OS deve fallire chiusa se:

- il grado/anno/discipline non coincidono;
- non esiste un blocco Piano coerente quando il flusso richiede `planBinding`;
- UDA/pack/segment/title correnti divergono dal binding richiesto;
- la composizione tenta di creare contenuti operativi non sostenuti da fonti/adoption snapshot;
- la versione sorgente è stale/superseded;
- la proiezione tenta di promuoversi direttamente a runtime.

La presenza di una UDA del Composer non sostituisce i gate correnti di `HumanTaskProjectionDraft`.

### 10.4 Stato

Il Composer non imposta stati come `IN_PREPARATION`, `IN_PROGRESS` o `COMPLETED`.

Questi appartengono a Docente OS e possono esistere soltanto quando il prodotto possiede evidenza operativa reale.

---

## 11. Proiezione Registro Docente

### 11.1 Scopo

Consentire al Registro di leggere una composizione come proposta di programmazione e, in seguito, distinguere il consuntivo reale dalla pianificazione.

### 11.2 Vincolo transitorio

Il Registro contiene attualmente:

- `UdaRecord` / `UdaLesson` come dominio operativo;
- `PlanningStateV1` come dominio annuale futuro/gradualmente adottato.

Il v1 non autorizza una migrazione o fusione dei due domini.

### 11.3 Contratto iniziale

```text
DIDACTIC_COMPOSITION_REGISTRO_PREVIEW_V1
importMode = PREVIEW_ONLY
acceptanceRequired = true
automaticWriteAllowed = false
```

L'adapter può proporre mapping verso i campi attuali `UdaRecord`, ma il write richiede un'azione/decisione del Registro già governata.

### 11.4 Divieto planned → taught

Le fasi del Composer possono diventare **lezioni previste**, ma non `UdaLesson` consuntivate come realmente svolte soltanto perché presenti nella composizione.

Il passaggio a consuntivo richiede un evento reale confermato dal docente.

### 11.5 Valutazioni

`EvidencePlan` / `AssessmentPlan` sono intenzioni progettuali.

Non possono creare automaticamente:

- `Grade`;
- comportamento;
- livello di competenza;
- esito di verifica;
- giudizio individuale.

---

## 12. Proiezione Studio Atlas / Atlas

### 12.1 Confine corretto

Il Composer non pubblica direttamente su Atlas pubblico.

Per oggetti che richiedono authoring di esperienza/percorso, il flusso è:

```text
DidacticComposition
→ Studio Atlas seed/handoff
→ authoring/review/learner preview
→ publication candidate
→ Atlas publication gate
```

### 12.2 Contratto

```text
DIDACTIC_COMPOSITION_STUDIO_ATLAS_SEED_V1
mode = PROPOSE_ONLY
publicPublicationAllowed = false
```

Il seed è minimizzato e class-independent.

Può contenere:

- obiettivo/idea didattica;
- contesto disciplinare e curricolare minimizzato;
- narrativa o problema generatore;
- materiali riusabili autorizzati;
- learning-object intent;
- source/provenance refs.

Non contiene:

- identità studenti;
- voti;
- note di classe personali;
- stato TeachingSession;
- dati di Registro non necessari.

### 12.3 Contratti Atlas esistenti

La specifica non sostituisce il contratto Docente OS → Atlas già governato per publication preview/confirmation. Il nuovo seed serve soltanto quando è necessario passare per il dominio di authoring Studio Atlas.

---

## 13. Export Drive

### 13.1 Scopo

Materializzare documentazione professionale leggibile e modificabile: guida docente, fascicolo studente, rubriche, presentazioni, allegati e versioni dichiarate.

### 13.2 Regola

Drive è **archivio/document workspace**, non authority della composizione.

```text
DIDACTIC_COMPOSITION_DRIVE_EXPORT_V1
mode = WRITE_EXTERNAL
requiresExplicitUserWrite = true
authorityClass = NONE
```

Un file Drive può conservare `compositionId`, `compositionVersion`, digest e provenance in metadata/document footer non invasivi, ma modificare il file Drive non modifica automaticamente la composizione adottata nei prodotti.

Un eventuale re-import è una nuova fonte professionale e richiede una nuova proposta/versione.

---

## 14. Chiusura del ciclo: execution observation

Il v1 definisce il contratto concettuale per riportare dal lavoro reale informazioni utili senza trasformarle in valutazioni automatiche.

```ts
interface DidacticExecutionObservationV1 {
  contract: 'DIDACTIC_EXECUTION_OBSERVATION_V1'
  compositionId: string
  compositionVersion: number
  phaseRef: string
  sourceProduct: 'DOCENTE_OS'
  classRef: string
  observedAt: string
  completion: 'NOT_STARTED' | 'PARTIAL' | 'COMPLETED'
  actualDurationMinutes?: number
  continuationNote?: string
  evidenceRefs?: string[]
  teacherConfirmed: true
  privacyClass: 'PROFESSIONAL_NON_PERSONAL'
}
```

### 14.1 Uso nel Registro

Il Registro può ricevere l'observation come **consuntivo preview**, non come write automatico.

Il docente decide se registrare:

- data/ore realmente svolte;
- argomento;
- attività;
- nota di continuità.

### 14.2 Uso nel Composer

Una observation può diventare contesto per una nuova richiesta, per esempio «prepara la prossima attività», ma non muta la versione precedente.

Il Composer produce una nuova proposta collegata alla precedente tramite provenance.

---

## 15. Stati: assi indipendenti

Non viene introdotto un unico `status` cross-product.

### Composition

```text
PROPOSAL
ADOPTED_LOCAL          (receipt product-local)
REJECTED_LOCAL
SUPERSEDED_LOCAL
```

### Docente OS projection

```text
NOT_PROJECTED
PROJECTION_CANDIDATE
READY_FOR_HUMAN_APPROVAL
ADOPTED_IN_PRODUCT
```

Gli stati operativi successivi restano Docente OS-owned.

### Registro projection

```text
NOT_PROJECTED
PREVIEW
ADOPTED_IN_PLANNING
```

Il consuntivo reale è separato.

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

Questi stati non sono authority didattica.

---

## 16. Contextual Copilot integration

Il Composer non implementa un parser/chat engine proprio.

Un consumer che usa `@trama/contextual-copilot-core` può:

1. riconoscere l'intento `PREPARE`/equivalente tramite Intent Discovery;
2. risolvere policy e capability consentite;
3. costruire il `DidacticCompositionRequestV1`;
4. invocare `didactic.composition.propose@1`;
5. mostrare la proposta;
6. richiedere decisione umana;
7. soltanto dopo avviare gli adapter di proiezione esplicitamente consentiti.

`discoverRequestIntent()` non autorizza il Composer e il Composer non autorizza i write downstream.

---

## 17. Privacy e minimizzazione

### 17.1 Composer

V1 accetta esclusivamente `PROFESSIONAL_NON_PERSONAL`.

Vietati nel request/result persistibile:

- nomi/cognomi studenti;
- identificativi studente;
- voti individuali;
- diagnosi/PEI/PDP nominativi;
- note disciplinari individuali;
- dati sanitari;
- submission Atlas riconducibili a un'identità.

Esigenze inclusive sono espresse soltanto in forma aggregata/progettuale, quando necessarie.

### 17.2 Atlas

L'accesso learner resta anonimo/local-first secondo i contratti Atlas. Il Composer non crea student accounts né un ritorno telemetrico identificato.

### 17.3 Registro / Docente OS

I prodotti possono possedere dati più ricchi nel proprio dominio, ma devono inviare al Composer soltanto il minimo contesto ammesso.

---

## 18. Provenance, versioning e freshness

Ogni proposta deve essere ricostruibile a partire da:

- request id;
- capability id/version;
- adapter/provider identity;
- accepted curriculum context ref;
- selected curriculum item refs;
- professional source refs;
- producedAt;
- digest del contenuto.

### 18.1 Stale rules

Una proiezione diventa almeno `STALE/REVIEW_REQUIRED` quando cambia materialmente uno dei seguenti:

- contesto Arena/vigenza;
- source asset revision usata;
- composition version/digest;
- planBinding Docente OS;
- identità anno/ordine/discipline/grade del consumer;
- contratto adapter major version.

Stale non equivale a cancellazione: l'ultimo snapshot resta leggibile come storico, ma non come corrente.

---

## 19. Failure semantics

### Composer

Output standard:

```text
SUCCEEDED
FAILED
UNAVAILABLE
UNAUTHORIZED
STALE_CONTEXT
AMBIGUOUS_CONTEXT
REVIEW_REQUIRED
```

Un fallimento non modifica dati di prodotto.

### Projection adapters

Ogni adapter deve distinguere almeno:

- `SOURCE_STALE`;
- `IDENTITY_MISMATCH`;
- `AUTHORITY_CONTEXT_INVALID`;
- `TARGET_CONTRACT_MISMATCH`;
- `TARGET_STATE_CONFLICT`;
- `HUMAN_APPROVAL_REQUIRED`;
- `UNSUPPORTED_MAPPING`.

Nessun fallback mutativo implicito.

---

## 20. Human control model

Due decisioni trasversali sono sufficienti nel Composer:

### Gate C1 — Adotta composizione

Il docente accetta la composizione nel prodotto corrente.

Permette di creare receipt e, se richiesto, **preview/candidate di proiezione**.

Non implica pubblicazione agli studenti né consuntivo.

### Gate C2 — Pubblica agli studenti

Non appartiene al Composer.

È eseguito dal prodotto/contratto di pubblicazione competente:

- Docente OS → Atlas publication contract, quando applicabile;
- Studio Atlas → publication candidate → Atlas gate, per Percorsi/esperienze.

Non aggiungere un terzo gate globale per ogni sistema: i normali write locali continuano a usare i gate già definiti dai prodotti.

---

## 21. UX principle

Il docente non deve vedere l'architettura cross-product come una sequenza tecnica.

La superficie primaria può mostrare azioni umane come:

```text
Usa questa proposta
Prepara la prossima lezione
Aggiungi alla programmazione
Crea materiale per gli studenti
Archivia i documenti
```

Dettagli come `compositionId`, digest, authority refs, adapter version e receipt restano disponibili tramite progressive disclosure/evidence details.

Ogni write user-initiated deve produrre feedback percepibile secondo TRAMA-PW-01 quando quel contratto è applicabile.

---

## 22. Negative knowledge / divieti espliciti

V1 non deve:

- introdurre un database TRAMA centrale delle UDA;
- creare un nuovo account studente;
- sincronizzare automaticamente modifiche tra prodotti;
- usare Drive come source of truth tecnico;
- usare Atlas pubblico come editor professionale;
- bypassare Studio Atlas per Percorsi che richiedono authoring;
- bypassare `planBinding`/Human Task gates in Docente OS;
- migrare `UdaRecord` nel futuro `MasterProgram` del Registro;
- trasformare lesson plan in lesson taught;
- trasformare evidenza prevista in voto;
- trasferire dati studente al Composer;
- mutare Arena;
- attivare DOS-A1;
- autorizzare deploy, merge o runtime cross-product.

---

## 23. Compatibility strategy

### Arena

Riusa il contesto già accettato dal caller. Nessun nuovo transport Arena è necessario per il primo slice.

### Registro

Adapter transitorio su `UdaRecord`/`UdaLesson` in preview-only. La futura migrazione a `MasterProgram` è un capability/change separato.

### Docente OS

Adapter additivo davanti alla pipeline esistente; non modificare la semantica dei recipe correnti né promuovere direttamente a runtime.

### Studio Atlas

Usare seed/handoff minimizzato; non introdurre public publish nel Composer.

### Contextual Copilot

Riusa Core/IntentPort; nessuna modifica obbligatoria al Core per definire il Composer contract.

---

## 24. Candidate implementation slices — NON AUTORIZZATE

Queste slice sono soltanto una decomposizione di progettazione. Non costituiscono implementation plan né autorizzazione.

1. **DC-01 — Contract core**  
   Request/proposal types + deterministic digest + offline fake provider.

2. **DC-02 — Adoption receipt**  
   Generic human decision receipt, product-neutral.

3. **DC-03 — Registro preview adapter**  
   Mapping proposal → preview `UdaRecord`, no write.

4. **DC-04 — Docente OS projection adapter**  
   Mapping guarded by current plan/candidate/projection gates.

5. **DC-05 — Studio Atlas seed adapter**  
   Class-independent minimized seed only.

6. **DC-06 — Drive export adapter**  
   Explicit user-initiated document export.

7. **DC-07 — Execution observation**  
   Teacher-confirmed Docente OS observation → Registro consuntivo preview.

8. **DC-08 — Contextual Copilot consumer wiring**  
   Consumer-local discover/resolve/handoff, no new Core authority.

L'ordine reale deve essere deciso soltanto dopo approvazione del design e implementation plan separato.

---

## 25. Acceptance criteria del design

Il design è accettabile se una futura implementazione può dimostrare che:

1. la capability produce solo proposte e non persiste authority globale;
2. ogni proposta è source-bound, authority-bound, versionata e digestabile deterministicamente;
3. un contesto Arena stale/ambiguo/non vigente fallisce chiuso;
4. nessun dato personale studente entra nel Composer;
5. Registro riceve solo preview prima della decisione locale;
6. Docente OS non può ricevere una lezione runtime bypassando `planBinding` e Human Approval;
7. Studio Atlas riceve un seed, non una pubblicazione;
8. Drive riceve copie dichiarate, non la fonte tecnica autorevole;
9. `planned != taught` è dimostrato con negative tests;
10. `evidence planned != grade` è dimostrato con negative tests;
11. una nuova composition version non sovrascrive silenziosamente proiezioni della versione precedente;
12. failure/stale semantics non producono mutation;
13. Contextual Copilot discovery non equivale ad execution authorization;
14. ogni write downstream resta governato dal target product;
15. DOS-A1 resta invariato.

---

## 26. Open questions

Non risultano domande bloccanti per la formalizzazione v1.

Decisioni deliberatamente rinviate alla fase successiva:

- formato esatto del digest (`sha256` è il candidato naturale ma va qualificato nel contract core);
- storage locale concreto dell'adoption snapshot nei singoli prodotti;
- transport cross-product definitivo;
- mapping completo a `MasterProgram` quando il dominio annuale del Registro diventerà operativo;
- semantica di un eventuale sync manuale tra revisioni già adottate;
- UI specifica di ciascun consumer.

Queste decisioni non modificano il confine di authority definito qui.

---

## 27. Builder check

Un implementatore deve poter pianificare il Core senza dover decidere:

- chi possiede l'autorità curricolare;
- se il Composer può scrivere;
- se esiste uno store centrale;
- se Atlas può essere pubblicato direttamente;
- se un piano equivale a consuntivo;
- se dati studente sono ammessi;
- se Docente OS può bypassare il proprio `planBinding`.

Tutti questi punti sono chiusi dalla presente specifica.

---

## 28. Prossimo gate

**STOP dopo Human Design Review.**

Se il design viene approvato:

1. registrare/approvare l'ADR cross-product associato;
2. invocare il workflow di implementation planning;
3. definire contratti/schema v1 della prima slice;
4. ottenere RED causali sui confini di authority/privacy;
5. implementare soltanto la prima slice approvata;
6. nessun merge/deploy/runtime senza i gate già previsti dall'ecosistema.
