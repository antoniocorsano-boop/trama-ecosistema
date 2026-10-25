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

Inoltre, Registro Docente conserva intenzionalmente separati il dominio operativo `UdaRecord/UdaLesson` e il dominio annuale `PlanningStateV1`; Docente OS possiede già gate `planBinding` e `READY_FOR_HUMAN_APPROVAL` che non devono essere bypassati.

## Decisione

È proposta `CAP-DIDACTIC-COMPOSER` come **shared capability stateless, provider-neutral e `PROPOSE_ONLY`**.

Identity iniziale:

```text
didactic.composition.propose@1
```

La capability:

1. riceve un contesto curricolare Arena già risolto/accettato dal prodotto chiamante;
2. riceve soltanto contesto professionale minimizzato e non personale;
3. produce una `DidacticCompositionProposalV1` strutturata, source-bound e authority-bound;
4. non persiste uno stato globale della composizione;
5. non assegna `APPROVED` globale;
6. non effettua write verso prodotti o servizi esterni;
7. non pubblica su Atlas;
8. non registra lezioni svolte;
9. non crea valutazioni;
10. non modifica Arena.

La formulazione «una UDA, più proiezioni» viene realizzata tramite una **versione immutabile/content-addressed della composizione**, riconoscibile tramite `compositionId`, `compositionVersion` e `contentDigest`.

Ogni prodotto mantiene la propria adozione e proiezione locale. Una decisione umana di adozione in un prodotto non promuove automaticamente gli altri.

## Proiezioni governate

### Docente OS

La composizione può diventare soltanto un candidato/proposta operativa. L'adapter deve conservare i gate correnti di Piano, `planBinding`, generation/provenance e Human Approval. Nessuna proiezione Composer può promuoversi direttamente a lesson runtime.

### Registro Docente

La composizione entra inizialmente come `PREVIEW_ONLY`, con accettazione richiesta e write automatico vietato. Il primo adapter non forza la migrazione `UdaRecord` → `MasterProgram`.

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

Drive riceve copie/documenti professionali tramite write esplicito dell'utente. Non acquisisce authority sulla composizione o sulle proiezioni di prodotto.

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

## Compatibilità

Questa decisione:

- non modifica l'autorità Arena;
- non modifica OR-07/OR-10, ma li specializza per la composizione didattica;
- non modifica il Contextual Copilot Core: il Core può invocare il Composer tramite adapter consumer-local;
- non migra il Registro;
- non cambia i recipe Docente OS esistenti;
- non cambia il publication state Atlas;
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

## Conseguenze

Positive:

- una semantica comune riusabile da Registro, Docente OS e futuri consumer;
- nessuna nuova authority centrale;
- provenance/versioning confrontabili tra prodotti;
- compatibilità con la privacy-first architecture;
- evoluzione indipendente degli adapter.

Costi accettati:

- nessuna sincronizzazione automatica tra copie adottate;
- ogni target conserva i propri gate;
- una revisione produce una nuova versione e può rendere stale proiezioni precedenti;
- gli adapter product-local devono gestire mapping e compatibilità.

## Stato di autorizzazione

Questa ADR è esclusivamente una proposta architetturale.

Non autorizza:

- implementazione;
- nuovi write cross-product;
- schema migration;
- merge;
- deploy;
- pubblicazione Atlas;
- runtime Docente OS;
- DOS-A1.

L'implementazione richiede design approval, implementation plan separato e qualification per slice.