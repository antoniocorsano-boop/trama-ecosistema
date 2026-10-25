# TRAMA-ADR-022 — Didactic Composer come capability condivisa stateless con proiezioni product-local

**Stato:** PROPOSED / HUMAN_REVIEW_REQUIRED  
**Data:** 2026-10-25  
**Perimetro:** TRAMA · Arena · Docente OS · Registro Docente · Studio Atlas · Atlas · Drive  
**Runtime:** NOT_AUTHORIZED  
**Authority change:** NONE  
**DOS-A1:** RUNTIME_DEFERRED

## Contesto

L'ecosistema deve poter trasformare un intento del docente, fonti professionali e contesto curricolare governato in una UDA/attività/lezione strutturata riusabile nei diversi prodotti.

Una soluzione ingenua introdurrebbe una nuova applicazione centrale o una singola copia mutabile della UDA condivisa da tutti i prodotti. Questo entrerebbe in conflitto con i principi già governati:

- Arena resta autorità curricolare;
- TRAMA governa contratti ma non diventa una quarta applicazione;
- Shared Capability Layer non è database, write authority o orchestratore centrale;
- ogni prodotto conserva stato, regole decisionali e persistenza del proprio dominio;
- Studio Atlas possiede l'authoring professionale dei Percorsi, mentre Atlas pubblico conserva il proprio publication state;
- Drive contiene documenti umani e copie dichiarate, non la replica tecnica autorevole;
- la decisione professionale resta del docente.

Registro Docente conserva inoltre intenzionalmente separati il dominio operativo `UdaRecord/UdaLesson` e il dominio annuale `PlanningStateV1`; Docente OS possiede già gate `planBinding`, generation/provenance e `READY_FOR_HUMAN_APPROVAL` che non devono essere bypassati.

La validazione cross-contract ha evidenziato tre ulteriori vincoli:

1. OR-07/OR-10 v0 non enumerano ancora `REGISTRO_DOCENTE` e `STUDIO_ATLAS` come caller identities: il wiring reale richiede una evoluzione additiva del contract registry;
2. OR-07 v0 ammette soltanto `READ_ONLY` e `PROPOSE_ONLY`: l'export Drive è `WRITE_EXTERNAL` e resta una slice separata e successiva;
3. il contesto Arena può essere `APPLICABLE` oppure `TRANSITIONAL`; il Composer deve preservare questa informazione e non normalizzarla silenziosamente.

## Decisione

È proposta `CAP-DIDACTIC-COMPOSER` come **shared capability stateless, provider-neutral e `PROPOSE_ONLY`**.

Identity iniziale:

```text
didactic.composition.propose@1
```

La capability:

1. riceve un contesto curricolare Arena già risolto/accettato dal prodotto chiamante;
2. accetta `applicabilityStatus = APPLICABLE | TRANSITIONAL` soltanto con `authorityState = APPROVED` e `vigencyStatus = VIGENTE`, preservando `regimeRef` e stato di applicabilità nella provenance;
3. riceve soltanto contesto professionale minimizzato e non personale;
4. produce una `DidacticCompositionProposalV1` strutturata, source-bound e authority-bound;
5. non persiste uno stato globale della composizione;
6. non assegna `APPROVED` globale;
7. non effettua write verso prodotti o servizi esterni;
8. non pubblica su Atlas;
9. non registra lezioni svolte;
10. non crea valutazioni;
11. non modifica Arena.

La formulazione «una UDA, più proiezioni» viene realizzata tramite una **versione immutabile/content-addressed della composizione**, riconoscibile tramite `compositionId`, `compositionVersion` e `contentDigest`.

Ogni prodotto mantiene la propria adozione e proiezione locale. Una decisione umana di adozione in un prodotto non promuove automaticamente gli altri.

## Prerequisito di identità prodotto

Prima del wiring runtime con Registro Docente o Studio Atlas, il contratto shared/integration deve registrare esplicitamente le due identità come prodotti distinti.

Direzione additiva prevista:

```text
ARENA
ATLAS
DOCENTE_OS
REGISTRO_DOCENTE
STUDIO_ATLAS
CONTROL_CENTER
```

Sono vietati alias semantici come:

```text
REGISTRO_DOCENTE = DOCENTE_OS
STUDIO_ATLAS = ATLAS
```

L'estensione dell'enum non trasferisce authority e deve restare backward-compatible con i consumer v0.

## Proiezioni governate

### Docente OS

La composizione ha due possibili livelli:

1. `UNBOUND_PLANNING_PROPOSAL` — nucleo didattico utilizzabile in `Progetta`, privo di un `planBinding` eseguibile;
2. `BOUND_HUMAN_TASK_CANDIDATE` — ammesso soltanto dopo che Docente OS ha risolto un blocco Piano coerente e ha superato i gate esistenti di candidate, binding e provenance.

Nessuna proiezione Composer può promuoversi direttamente a lesson runtime.

### Registro Docente

La composizione entra inizialmente come `PREVIEW_ONLY`, con accettazione richiesta e write automatico vietato. Il primo adapter non forza la migrazione `UdaRecord` → `MasterProgram` e non effettua fan-out automatico su tutte le classi.

Il Registro deve mantenere separati:

```text
planned != taught != recorded != assessed
```

### Studio Atlas / Atlas

Per un Percorso/esperienza il flusso corretto è:

```text
Didactic Composition
→ Studio Atlas seed/handoff
→ authoring + review + learner preview
→ publication candidate
→ Atlas publication gate
```

Il Composer non pubblica direttamente su Atlas pubblico e non sostituisce i contratti Docente OS → Atlas già esistenti.

### Drive

Drive è parte del journey ma non del primo Core `PROPOSE_ONLY`.

L'export richiede una futura slice distinta:

```text
mode = WRITE_EXTERNAL
requiresExplicitUserWrite = true
```

Essa dovrà avere contratto di write, feedback percepibile, destinazione esplicita, idempotenza/failure semantics e non potrà assumere che l'attuale Intent Discovery abiliti `WRITE_EXTERNAL`.

Drive non acquisisce authority sulla composizione o sulle proiezioni di prodotto.

## Invariante cross-product

```text
PLANNED
!= PREPARED
!= PUBLISHED
!= TAUGHT
!= RECORDED
!= ASSESSED
```

Nessun passaggio è implicito.

## Human control

Il Composer introduce un solo gate proprio:

**Adotta composizione** — decisione umana nel prodotto corrente.

Questa decisione può produrre un receipt locale e candidati/preview di proiezione, ma non implica pubblicazione agli studenti, esecuzione di lezione, consuntivo, valutazione o export Drive.

La pubblicazione agli studenti resta nel prodotto competente e nei contratti di pubblicazione esistenti. I write locali successivi restano governati dai prodotti target.

## Privacy

Il contract v1 del Composer accetta soltanto `PROFESSIONAL_NON_PERSONAL`.

Sono esclusi:

- identità studenti;
- voti individuali;
- diagnosi/PEI/PDP nominativi;
- note disciplinari individuali;
- dati sanitari;
- submission Atlas identificabili.

Le esigenze inclusive possono essere espresse soltanto in forma aggregata/progettuale quando necessarie.

Eventuali `evidenceRefs` futuri possono essere soltanto professionali/non personali oppure opaque refs target-local che il Composer non dereferenzia.

## Compatibilità

Questa decisione:

- non modifica l'autorità Arena;
- preserva `APPLICABLE | TRANSITIONAL` del contesto Arena;
- specializza OR-07/OR-10 senza considerare già autorizzati caller che v0 non enumera;
- non modifica il Contextual Copilot Core: il Core può invocare il Composer tramite adapter consumer-local dopo i relativi gate;
- non migra il Registro;
- non cambia i recipe Docente OS esistenti;
- non cambia il publication state Atlas;
- rinvia Drive a una write slice separata;
- non attiva DOS-A1.

## Alternative scartate

### Nuovo prodotto/store centrale

Scartato perché introdurrebbe una nuova authority pratica e sincronizzazione cross-product permanente.

### Composer duplicato in ogni prodotto

Scartato perché produrrebbe drift semantico, duplicazione e contratti incompatibili.

### Composer → Atlas pubblico diretto

Scartato perché bypasserebbe Studio Atlas e i gate di pubblicazione.

### Drive come fonte canonica della UDA

Scartato perché contraddice la knowledge architecture federata: Drive resta workspace/document archive.

### Alias dei nuovi prodotti dentro product ids esistenti

Scartato perché nasconderebbe confini di ownership e authority: Registro Docente non è Docente OS e Studio Atlas non è Atlas pubblico.

## Conseguenze

Positive:

- una semantica comune riusabile da Registro, Docente OS e futuri consumer;
- nessuna nuova authority centrale;
- provenance/versioning confrontabili tra prodotti;
- compatibilità con la privacy-first architecture;
- evoluzione indipendente degli adapter;
- mantenimento esplicito del regime transitorio curricolare.

Costi accettati:

- nessuna sincronizzazione automatica tra copie adottate;
- ogni target conserva i propri gate;
- una revisione produce una nuova versione e può rendere stale proiezioni precedenti;
- gli adapter product-local devono gestire mapping e compatibilità;
- il primo wiring cross-product richiede prima l'estensione delle product identities;
- Drive richiede governance distinta come write esterno.

## Stato di autorizzazione

Questa ADR è esclusivamente una proposta architetturale.

Non autorizza:

- implementazione;
- estensione runtime automatica dei product ids;
- nuovi write cross-product;
- schema migration;
- merge;
- deploy;
- export Drive;
- pubblicazione Atlas;
- runtime Docente OS;
- DOS-A1.

L'implementazione richiede Human Design Review, ADR approval, implementation plan separato e qualification per slice.
