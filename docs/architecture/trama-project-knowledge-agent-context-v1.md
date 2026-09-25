# TRAMA Project Knowledge & Agent Context Architecture v1

**Data:** 24 settembre 2026  
**Stato:** PROPOSED / CC2-F1/E FOUNDATION / READ-ONLY  
**Perimetro:** TRAMA Control Center v2 · Arena · Atlas · Docente OS  
**Runtime:** NO NEW WRITE AUTHORITY / NO AUTO-PROMOTION

## 1. Scopo

Il TRAMA Control Center v2 deve diventare, oltre che osservatorio di maturità, la **memoria operativa governata dell'ecosistema** e il punto di ingresso per il recupero del contesto necessario al lavoro umano e agentico.

L'obiettivo è ridurre:

- ricostruzioni ripetute dello stato;
- riletture non necessarie di PR, ADR e conversazioni;
- consumo di token dovuto a contesto ridondante;
- rischio di usare decisioni superate;
- rilavorazioni su problemi già risolti o approcci già scartati.

Il Control Center non diventa una nuova authority. Mantiene una **proiezione read-only, derivata, versionata e verificabile** delle fonti governate.

## 2. Principio architetturale

> **La memoria conversa; la knowledge base verifica.**

Una memoria conversazionale può ricordare che TRAMA possiede una fonte operativa persistente, ma lo stato corrente di capability, gate, decisioni, exact head ed evidenze deve essere verificato attraverso la Project Knowledge Base governata.

## 3. Tre responsabilità distinte

### 3.1 Observatory

Risponde a domande quali:

- quanto è maturo un dominio;
- quali evidenze sostengono il livello;
- quali gate sono bloccanti;
- quali dipendenze impediscono la promozione.

### 3.2 Project Knowledge Base

Rappresenta:

- capability e workstream;
- decisioni e razionali;
- invarianti attivi;
- repository, PR, commit, release ed exact head;
- evidenze e relativa freshness;
- dipendenze;
- blocker e conflitti noti;
- stati storici significativi;
- decisioni negative o superate.

### 3.3 Context Provider

Produce un **TRAMA Context Pack** minimo e verificabile per una domanda o capability specifica, evitando di trasferire tutto il corpus documentale al consumatore.

Esempio concettuale:

```json
{
  "subject": "atlas-publication",
  "asOf": "2026-09-24T15:00:00Z",
  "facts": [],
  "activeInvariants": [],
  "decisions": [],
  "exactHeads": [],
  "blockingGates": [],
  "dependencies": [],
  "knownRejectedApproaches": [],
  "nextCandidateActions": [],
  "sourceRefs": []
}
```

## 4. Gerarchia delle fonti

La Project Knowledge Base non modifica la precedenza già governata.

1. ADR e contratti approvati;
2. `STATUS.md`;
3. piano operativo e `ROADMAP.md`;
4. specifiche integrate;
5. evidenze exact-head e runtime;
6. documenti di implementazione;
7. filosofia, dossier e materiali di supporto.

Una proiezione del Control Center è sempre subordinata alla propria fonte.

## 5. Entità minime

Il modello deve poter rappresentare almeno:

- `Capability`;
- `Workstream`;
- `Decision`;
- `Invariant`;
- `RepositoryState`;
- `PullRequestState`;
- `ReleaseState`;
- `Evidence`;
- `Gate`;
- `Dependency`;
- `KnownConflict`;
- `KnowledgeEvent`;
- `NextCandidateAction`;
- `SourceRef`.

## 6. Stati della conoscenza

Ogni elemento che può diventare obsoleto deve distinguere almeno:

- `CURRENT`;
- `SUPERSEDED`;
- `DEFERRED`;
- `REJECTED`;
- `EXPIRED`;
- `HISTORICAL`.

L'assenza di una voce dal contesto corrente non equivale alla sua cancellazione dalla memoria storica.

## 7. Knowledge Event

Le decisioni operative significative devono poter essere conservate come eventi strutturati, senza archiviare integralmente le conversazioni.

Campi minimi:

```json
{
  "eventId": "TRAMA-EVT-...",
  "type": "DECISION",
  "subject": "...",
  "statement": "...",
  "status": "CURRENT",
  "rationale": "...",
  "sourceRefs": [],
  "validFrom": "...",
  "supersedes": [],
  "invalidatedBy": []
}
```

Tipi iniziali:

- `DECISION`;
- `CONSTRAINT`;
- `REJECTION`;
- `DEFERMENT`;
- `FAILURE_LEARNING`;
- `PROMOTION`;
- `CLOSURE`.

## 8. Regole di validità

### SOURCE-BOUND

Ogni fatto deve indicare almeno una fonte identificabile.

### VERSION-BOUND

Ogni fatto dipendente dal codice o da una verifica tecnica deve essere associato, quando pertinente, a repository, capability, release ed exact head.

### FRESHNESS-AWARE

Un'evidenza scaduta o riferita a una versione superata non può sostenere lo stato corrente.

### NO SYNTHETIC AUTHORITY

Una sintesi, inferenza, Context Pack o visualizzazione non diventa automaticamente una decisione di governance.

### NEGATIVE KNOWLEDGE RETENTION

Approcci rifiutati, differiti, superati o falliti devono rimanere ricercabili per prevenire rilavorazioni.

### RATIONALE PRESERVATION

Una decisione importante deve conservare non solo il risultato, ma anche il razionale e il proprio ambito di validità.

## 9. ProjectContextSnapshot

Lo snapshot di maturità e lo snapshot di contesto sono distinti.

Il **Maturity Snapshot** risponde a: “quanto è maturo?”.

Il **ProjectContextSnapshot** risponde a: “che cosa devo sapere ora per lavorare correttamente?”.

Campi minimi:

```text
generatedAt
snapshotVersion
currentPhase
activeCapabilities[]
activeWorkstreams[]
canonicalDecisions[]
activeInvariants[]
repositories[]
openPullRequests[]
activeExactHeads[]
blockingGates[]
pendingHumanReviews[]
dependencies[]
knownConflicts[]
recentlyCompleted[]
knownRejectedApproaches[]
nextCandidateActions[]
knowledgeSources[]
```

## 10. TRAMA Context Pack

Il Context Pack è una vista derivata e mirata dello snapshot.

Requisiti:

- deve essere piccolo rispetto all'intero corpus;
- deve dichiarare `asOf`;
- deve contenere solo elementi pertinenti alla richiesta;
- deve conservare provenance;
- deve distinguere fatto, decisione, evidenza e azione suggerita;
- non deve occultare blocker o stati di incertezza;
- non deve produrre promozioni automatiche.

## 11. Uso agentico

Un agente che lavora su TRAMA dovrebbe seguire il protocollo:

1. identificare capability o dominio;
2. leggere il Context Pack pertinente;
3. verificare solo le informazioni volatili necessarie;
4. eseguire l'azione;
5. registrare nuove evidenze o eventi attraverso i normali flussi governati;
6. non trattare mai il Context Pack come autorizzazione implicita.

## 12. Riduzione del consumo di contesto

Il sistema deve favorire il recupero selettivo:

```text
domanda
→ capability resolver
→ ProjectContextSnapshot
→ filtro per pertinenza
→ Context Pack
→ consumatore umano/agentico
```

La riduzione di token è un effetto della **selezione del contesto**, non della perdita di provenance.

## 13. Confini di sicurezza e governance

- nessun dato personale studente;
- nessun profilo docente necessario alla Project Knowledge Base;
- nessuna write nei prodotti osservati;
- nessun merge o review automatico;
- nessuna promozione ADR;
- nessuna chiusura automatica dei piloti;
- DOS-A1 resta `RUNTIME_DEFERRED`;
- R3-P4 resta soggetto ai propri gate;
- Arena, Atlas e Docente OS conservano le rispettive authority.

## 14. Evoluzione

La foundation viene introdotta come **CC2-F1/E** dopo l'hardening evidenziale di CC2-F1/D.

Sequenza proposta:

- F1/D — binding, freshness, dependencies;
- F1/E — Project Knowledge Foundation;
- F2 — collector governati dai repository;
- F3 — Context Pack generator;
- F4 — ricerca e interrogazione nel Control Center;
- F5 — interfaccia agentica read-only;
- F6 — consolidamento, audit e adozione.

## 15. Criterio di successo

Il sistema è efficace quando una nuova sessione può rispondere a “dove siamo e cosa governa questa attività?” leggendo un pacchetto ristretto, verificabile e aggiornato, senza ricostruire manualmente la storia del progetto.
