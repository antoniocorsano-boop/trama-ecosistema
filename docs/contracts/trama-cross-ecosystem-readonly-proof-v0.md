# OR-06 — Cross-Ecosystem Read-Only Proof Contract

**Stato:** PROPOSED / IMPLEMENTATION-READY  
**Data:** 2026-09-30  
**Baseline:** OR-05 stacked head `bc285f4f9b7e11983265aafca2c38ced44ecd694`  
**Riferimenti:** TRAMA-ADR-019 · ECO-02/P1 · ECO-02/P9 · RuntimeGeneration · Local Connector · Runtime Adapter  
**Runtime authorization:** READ_ONLY PROOF ONLY  
**DOS-A1:** `RUNTIME_DEFERRED`  
**Cross-product writes:** FORBIDDEN

## 1. Scopo

Dimostrare che la capability infrastructure introdotta da OR-01/OR-04 può servire un workflow reale dell'ecosistema senza diventare il centro architetturale e senza acquisire authority.

Il proof scelto è **Preparazione della prossima lezione** perché dispone già di una baseline verificata nell'ecosistema e attraversa naturalmente Arena, Atlas e Docente OS.

Il proof non riapre ECO-02/P1 e non modifica la sua baseline validata. Usa gli invarianti già consolidati come vincoli.

## 2. Workflow di riferimento

```text
Arena
  governed CurriculumSnapshot / curriculum context
        |
        | READ
        v
Docente OS
  lesson preparation context
        |
        +---- optional READ ----> Atlas
        |                        candidate public resource
        |                              |
        +------------------------------+
        |
        v
TRAMA Shared Read-Only Capability
        |
        v
Runtime Adapter
        |
        v
Read-only evaluation / preparation observation
        |
        v
Evidence Envelope
        |
        +----> Docente OS presentation
        |      proposal only; no adoption
        |
        +----> Control Center observation
               READ_ONLY
```

Atlas non è passaggio obbligatorio tra Arena e Docente OS.

## 3. User intent

Intento utente canonico:

> **Prepara la prossima lezione usando il contesto curricolare disponibile e mostrami eventuali risorse pertinenti, senza modificare nulla finché non decido io.**

La UI non espone DSH, Codex, connector o generation come concetti necessari all'utente.

## 4. Input envelope

Il proof deve costruire un envelope read-only:

```ts
interface LessonPreparationReadEnvelope {
  proofId: string
  professionalContext: {
    schoolYear: string
    classRef: string
    disciplineRef: string
    lessonDate?: string
  }
  curriculum: {
    authority: "ARENA"
    snapshotRef: string
    version: string
    digest?: string
    approvalState: string
  }
  atlas?: {
    source: "ATLAS"
    resourceRefs: string[]
    publicationState: string
  }
  docenteOs: {
    preparationRef: string
    teacherDecisionState: "UNDECIDED" | "PROPOSED" | "ACCEPTED" | "DISMISSED"
  }
}
```

Regole:
- nessun dato personale studente;
- nessun secret;
- nessuna scrittura;
- Arena authority esplicita;
- Atlas source esplicita;
- Docente OS decision state esplicito.

## 5. Shared capability

Capability OR-06:

`lesson.preparation.observe`

Stato richiesto:

```text
supported  = true
available  = true in fixture/mock qualification
authorized = true only for READ
qualified  = false until proof gates PASS
```

Capability mutative correlate:

```text
lesson.preparation.apply      authorized=false
lesson.preparation.publish    authorized=false
lesson.preparation.persist    authorized=false
lesson.preparation.approve    authorized=false
```

## 6. Runtime behavior

Il runtime può:
- leggere l'envelope già materializzato;
- produrre una valutazione strutturata;
- indicare coerenza, gap, suggerimenti e resource relevance;
- produrre evidence refs;
- dichiarare NOT_VERIFIABLE quando mancano dati.

Il runtime non può:
- cambiare curriculum;
- selezionare definitivamente una risorsa;
- accettare una proposta;
- scrivere nel piano annuale;
- creare TeachingSession;
- pubblicare in Atlas;
- promuovere maturity;
- modificare stato applicativo.

## 7. Output envelope

```ts
interface LessonPreparationObservation {
  proofId: string
  runtime: {
    runtimeType: string
    runtimeId: string
    adapterId: string
    adapterVersion: string
    generationId?: string
  }
  observedAt: string
  status: "PASS" | "WARN" | "FAIL" | "NOT_VERIFIABLE"
  checks: Array<{
    id: string
    status: "PASS" | "WARN" | "FAIL" | "NOT_VERIFIABLE"
    message: string
    evidenceRefs: string[]
  }>
  suggestions: Array<{
    id: string
    kind: "LESSON_ADJUSTMENT" | "ATLAS_RESOURCE" | "MISSING_CONTEXT"
    text: string
    sourceRefs: string[]
    decisionState: "PROPOSED"
  }>
  evidenceRefs: string[]
}
```

Ogni suggerimento resta `PROPOSED`.

## 8. Proof fixture

La prima qualifica OR-06 deve essere deterministica e non di rete.

Caso di riferimento:
- disciplina: Tecnologia;
- classe: 2C;
- contesto: “Agricoltura come sistema tecnologico”;
- curriculum source: Arena;
- preparazione source: Docente OS;
- Atlas: zero o più resource refs, opzionali;
- teacher decision: UNDECIDED;
- runtime source: contract fixture / qualified adapter mock.

La fixture usa soltanto dati non personali e già compatibili con ECO-02.

## 9. Required checks

### CE-01 — Authority preservation
Arena deve restare unica authority curricolare.

### CE-02 — Atlas optionality
Assenza di Atlas non deve invalidare il proof.

### CE-03 — Teacher ownership
Ogni output didattico deve restare PROPOSED fino a decisione docente.

### CE-04 — Read-only runtime
Nessuna capability mutativa autorizzata.

### CE-05 — Provenance
Ogni suggerimento deve avere sourceRefs/evidenceRefs.

### CE-06 — Stale/unknown honesty
Dati mancanti o stale devono produrre WARN/NOT_VERIFIABLE, non inferenze silenziose.

### CE-07 — Provider replaceability
L'output non deve dipendere da campi provider-specific.

### CE-08 — Control Center non-authority
Il Control Center può mostrare il proof ma non promuoverlo né applicarlo.

### CE-09 — No personal student data
Fixture ed evidence devono restare non personali.

### CE-10 — Determinism
Con stessa fixture e stesso adapter mock, l'observation envelope deve essere serializzabile deterministicamente.

## 10. Product presentation

### Docente OS
Mostra:
- origine Arena;
- eventuale risorsa Atlas;
- suggerimenti proposti;
- evidence/provenance;
- stato “da decidere”.

Non mostra come azione automatica:
- applica tutto;
- approva;
- pubblica.

### Atlas
Nessuna modifica richiesta per il proof. Le risorse sono lette solo se già pubblicate/consultabili.

### Arena
Nessuna modifica richiesta per il proof. Lo snapshot è consumato in lettura.

### Control Center
Mostra:
- proof id;
- componenti coinvolti;
- adapter/version;
- check status;
- evidence refs;
- READ_ONLY.

## 11. Implementation shape

Prima implementazione raccomandata in TRAMA:
1. fixture JSON governata;
2. validator deterministico;
3. mock adapter read-only;
4. observation JSON;
5. mapping Control Center in Evidence/Operations;
6. test negativi su authority/mutation.

Nessuna connessione live ai tre prodotti è richiesta per qualificare la forma contrattuale.

## 12. Negative tests obbligatori

Il proof deve fallire se:
- authority curriculum != ARENA;
- suggestion decisionState != PROPOSED;
- una capability mutativa è authorized=true;
- Atlas viene trattato come curriculum authority;
- manca provenance di un suggerimento;
- persisted/stale viene dichiarato live;
- compaiono identificatori personali studente nella fixture;
- Control Center produce promotion/apply action.

## 13. Exit criteria

OR-06 è PASS solo quando:
1. fixture e schema validano;
2. validator positivo PASS;
3. almeno 7 negative fixture FAIL correttamente;
4. output deterministico;
5. nessuna rete nei test;
6. nessuna write surface;
7. Control Center può consumare l'observation;
8. Human Review conferma che il proof rappresenta un workflow reale e preserva i confini di prodotto.

## 14. Explicit DEFER / REJECT

### DEFER
- connessione live Arena;
- connessione live Atlas;
- connessione live Docente OS;
- runtime DSH reale;
- runtime Codex reale;
- applicazione di suggerimenti;
- publication candidate;
- qualunque credential transport.

### REJECT in OR-06
- runtime che scrive nel prodotto;
- Atlas obbligatorio nel percorso Arena → Docente OS;
- auto-accept;
- auto-publish;
- auto-maturity promotion;
- student profiling.

## 15. Chiusura analitica

Non restano domande architetturali necessarie per implementare il proof offline.

La prima slice implementativa è:
**OR-06-P1 — deterministic cross-ecosystem read-only fixture + validator**.

Questa slice può essere implementata interamente nel repository TRAMA senza modificare Arena, Atlas o Docente OS.
