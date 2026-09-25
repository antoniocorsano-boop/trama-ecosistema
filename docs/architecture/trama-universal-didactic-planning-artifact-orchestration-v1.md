# TRAMA — Universal Didactic Planning & Artifact Orchestration v1

**Status:** PROPOSED / NO_RUNTIME  
**Date:** 2026-09-25  
**Scope:** TRAMA · Arena · Docente OS · Curriculum Atlas · Officina materiali · provider esterni  
**Human review:** REQUIRED  
**Runtime authorization:** NONE  
**DOS-A1:** RUNTIME_DEFERRED  
**R3-P4 Docente OS → Atlas:** NOT AUTHORIZED

## 1. Purpose

Questo documento consolida l'analisi trasversale sul futuro ambiente di progettazione didattica dell'ecosistema TRAMA.

L'obiettivo è definire una direzione architetturale coerente e generalizzabile per il primo ciclo, capace di sostenere:

- programmazione didattica;
- UDA o percorsi equivalenti;
- sequenze di apprendimento;
- singole lezioni;
- attività;
- materiali;
- evidenze;
- riflessione e riprogettazione;
- eventuale produzione specialistica di artefatti;
- eventuale pubblicazione in Atlas.

La specifica evita di introdurre una nuova authority, un nuovo centro del sistema o una dipendenza strutturale da NotebookLM o da qualunque altro provider.

## 2. Executive decision

La direzione proposta è:

> **Docente OS è l'ambiente operativo universale della professionalità docente. Arena fornisce il contesto curricolare governato. Atlas rende il curricolo e le risorse pubbliche navigabili. L'Officina materiali orchestra provider specialistici, tra cui eventualmente NotebookLM, senza acquisire authority.**

NotebookLM non è un prerequisito, né una destinazione obbligatoria. È un possibile **Source/Knowledge Provider** e/o **Artifact Provider** dentro un'architettura multi-provider.

La progettazione didattica deve essere possibile anche:

- al primo accesso;
- senza fonti personali;
- con fonti incomplete;
- con un corpus documentale ricco;
- in qualunque disciplina;
- nell'infanzia, primaria e secondaria di primo grado, con adattamento del lessico e delle strutture.

## 3. Protected invariants — elementi intoccabili

Le seguenti regole sono vincolanti e non vengono modificate da questa proposta.

### 3.1 Arena — GOVERN

Arena resta l'autorità per:

- fonti curricolari canoniche e provenienza;
- applicabilità istituzionale;
- revisione, validazione e adozione;
- baseline curricolare approvata o provvisoria;
- requisiti e vincoli curricolari;
- snapshot e handoff versionati.

Arena non deve riassorbire:

- programmazione operativa docente;
- authoring UDA;
- sequenza quotidiana delle lezioni;
- materiali del docente;
- evidenze operative;
- calendario o TeachingSession.

### 3.2 Curriculum Atlas — NAVIGATE / PUBLISH

Atlas resta:

- atlante navigabile del curricolo;
- superficie di comprensione, progressione e relazioni;
- sede di Learning Object e risorse pubblicate;
- Student Learning Hub quando autorizzato;
- authority per identità, versione e stato dei propri oggetti pubblicati.

Atlas non deve:

- diventare una seconda fonte curricolare;
- scrivere nel contesto operativo Docente OS;
- approvare UDA;
- diventare il laboratorio operativo del docente;
- ricevere pubblicazioni automatiche senza gate espliciti.

### 3.3 Docente OS — OPERATE

Docente OS resta owner di:

- contesto professionale;
- classi e cattedre;
- orario;
- programmazione annuale operativa;
- UDA/percorsi del docente;
- preparazione e conduzione della lezione;
- materiali operativi;
- evidenze;
- avanzamento;
- riflessione e riprogettazione;
- decisione del docente sull'adozione, modifica, esclusione e uso.

### 3.4 Officina materiali

L'Officina:

- riceve un brief didattico;
- può usare motori differenti;
- produce candidati;
- non approva curricolo;
- non adotta materiali;
- non pubblica autonomamente;
- non diventa authority professionale o editoriale.

### 3.5 Human control

Restano obbligatori:

- nessuna adozione automatica;
- nessuna pubblicazione automatica;
- proposta ≠ decisione;
- generazione ≠ validazione;
- grounding ≠ approvazione;
- pubblicabilità ≠ uso in lezione;
- nessuna scrittura cross-product implicita.

## 4. Current-state audit

### 4.1 Cosa esiste già

L'ecosistema dispone già di elementi sostanziali:

- Arena come authority curricolare;
- handoff Arena → Docente OS;
- Class Workspace in Docente OS;
- Human Task Model con intenti ACT_NOW / PREPARE / TEACH / RECORD / REVIEW / EXPLORE;
- modalità EXPLORE / GUIDED / FOCUSED;
- Piano annuale;
- UDA;
- Knowledge Base;
- Progetta;
- Lesson Workspace;
- materiali operativi;
- TeachingSession e registrazione;
- continuità verso riflessione e riprogettazione;
- Atlas come superficie navigabile e pubblica;
- ADR-010 per la separazione dell'Officina materiali;
- contratti di pubblicazione Atlas separati da decisione e adozione.

### 4.2 Limite reale corrente

La principale criticità non è la mancanza di funzioni di base, ma la **generalizzazione**.

La copertura didattica concreta oggi è ancora fortemente verticalizzata su Tecnologia nella secondaria di primo grado, con elementi come:

- CAN-PRG;
- CAN-UDA;
- CAN-PACK;
- blocchi B01–B33;
- monte ore e progressione specifici.

Questi elementi possono restare validi come verticale e pilota, ma non devono diventare il modello universale dell'intero primo ciclo.

## 5. Universal didactic spine

Si propone una spina dorsale indipendente da disciplina e ordine:

```text
ProfessionalContext
  ↓
PlanningFrame
  ↓
LearningPath / UDA-equivalent
  ↓
LearningSequence
  ↓
Lesson
  ↓
Activity
  ↓
Evidence
  ↓
Artifact / Material
  ↓
Reflection / Replanning
```

Il modello deve permettere differenti ingressi.

### Top-down

```text
Programmazione
→ UDA/percorso
→ sequenza
→ lezioni
```

### Bottom-up

```text
Lezione imminente
→ sequenza
→ percorso/UDA
→ programmazione
```

Non è richiesto formalizzare un'intera UDA prima di preparare una singola lezione.

## 6. Applicabilità a tutto il primo ciclo

La semantica deve adattarsi, senza forzature, a:

### Infanzia

Possibili unità operative:

- campi di esperienza;
- esperienze;
- contesti;
- osservazioni;
- documentazione educativa.

Non deve essere imposto un modello disciplina + ore + UDA standard.

### Primaria

Deve sostenere:

- discipline;
- percorsi interdisciplinari;
- nuclei;
- sequenze;
- laboratori;
- unità;
- progettazione flessibile di classe.

### Secondaria di primo grado

Deve sostenere:

- discipline;
- UDA;
- programmazione annuale;
- sequenze;
- lezioni;
- progetti;
- raccordi interdisciplinari.

### Educazione civica

Deve restare trasversale e non generare duplicazioni artificiali. Il quadro approvato resta Arena; l'attuazione resta Docente OS.

## 7. First-access model

Il primo accesso non deve essere bloccato da una richiesta di caricamento fonti.

La domanda iniziale deve essere orientata al compito:

> **Che cosa vuoi preparare?**

Il sistema deve poter partire dal minimo:

- ordine;
- classe/sezione o gruppo;
- disciplina/campo;
- periodo o data;
- obiettivo/intento del docente.

Le fonti sono un arricchimento progressivo, non una barriera.

## 8. Source readiness model

Si distinguono tre condizioni.

### S0 — No personal sources

Disponibili solo:

- contesto professionale;
- curricolo Arena quando presente;
- input del docente;
- capacità generativa generale.

L'output deve dichiarare il livello di grounding.

### S1 — Partial sources

Sono disponibili alcune fonti:

- PDF;
- libro;
- appunti;
- Drive;
- pagina web;
- materiali precedenti;
- documenti di istituto.

Il sistema usa ciò che è disponibile senza pretendere un corpus completo.

### S2 — Governed corpus

È disponibile un corpus robusto e selezionato.

In questo caso sono possibili:

- sintesi grounded;
- citazioni;
- derivazione tracciabile;
- produzione specialistica fondata sulle fonti.

## 9. Provider abstraction

NotebookLM non deve essere codificato come dipendenza strutturale.

Si propone un contratto provider-agnostic.

### 9.1 Source / Knowledge Provider

Responsabilità possibili:

- fornire fonti;
- indicizzare;
- recuperare passaggi rilevanti;
- restituire provenance;
- associare citazioni;
- produrre sintesi grounded.

Provider possibili:

- Knowledge Base Docente OS;
- Google Drive;
- NotebookLM;
- repository;
- provider futuri.

### 9.2 Artifact Provider

Responsabilità possibili:

- generare presentazioni;
- infografiche;
- quiz;
- flashcard;
- guide;
- documenti;
- audio;
- video;
- immagini;
- altri artefatti.

Provider possibili:

- NotebookLM;
- generatore immagini;
- generatore presentazioni;
- generatore documenti;
- altri motori specialistici.

L'utente docente non deve essere obbligato a conoscere quale provider ha svolto l'operazione, salvo richiesta di trasparenza o necessità di provenance.

## 10. NotebookLM role

NotebookLM è considerato un provider specialistico potenzialmente utile per:

- grounded synthesis;
- report;
- guide allo studio;
- quiz;
- flashcard;
- mappe;
- presentazioni;
- infografiche;
- overview multimediali;
- altri output derivati da un corpus.

Non deve essere assunto come:

- authority;
- validatore automatico;
- motore obbligatorio;
- repository canonico di Docente OS;
- canale diretto di pubblicazione Atlas.

## 11. Artifact lifecycle

Si propone un ciclo di vita esplicito.

```text
SourceSet
  ↓
Generation
  ↓
CandidateArtifact
  ↓
Validation
  ↓
TeacherDecision
  ↓
LessonArtifact
  ↓
[optional]
PublicationCandidate
  ↓
Publication Gate
  ↓
AtlasArtifact
```

### 11.1 Origin

Valori indicativi:

- teacher;
- Docente OS;
- NotebookLM;
- external-provider;
- Atlas reuse;
- adapted-existing.

### 11.2 Grounding state

- curriculum-bound;
- source-grounded;
- partially-grounded;
- generated;
- teacher-authored.

### 11.3 Validation state

- pending;
- checked;
- issues-found;
- teacher-reviewed;
- accepted;
- rejected.

### 11.4 Destination state

- private;
- lesson;
- reusable;
- publication-candidate;
- published;
- withdrawn.

## 12. Validation is layered

### Lesson-use gate

Per uso privato o interno alla lezione:

- coerenza con obiettivi;
- correttezza disciplinare;
- leggibilità;
- adeguatezza al livello;
- revisione docente.

### Reuse gate

Per riuso professionale:

- provenance;
- versione;
- contesto di origine;
- stato di validazione;
- riusabilità dichiarata.

### Atlas publication gate

In aggiunta:

- diritti/licenze;
- accessibilità;
- minimizzazione;
- metadati;
- stato editoriale;
- alt text dove applicabile;
- checksum/fingerprint;
- binding al contesto;
- PublicationManifest;
- PublicationReceipt;
- revoca/ritiro.

## 13. User experience principle

Non si propone una nuova applicazione separata chiamata "NotebookLM" o "Studio".

La superficie naturale resta **Progetta** e, quando il contesto è specifico, **Prima della lezione / Classe / Lesson Workspace**.

L'utente deve vedere il compito, non l'infrastruttura.

Esempi:

- "Prepara la lezione di domani";
- "Costruisci una sequenza di 4 lezioni";
- "Progetta una UDA";
- "Riorganizza la programmazione";
- "Prepara materiale per gli studenti".

Il sistema deriva il livello necessario.

## 14. Human Task Model compatibility

La proposta è compatibile con il modello esistente.

### PREPARE

Può riferirsi a:

- programmazione;
- percorso;
- UDA;
- sequenza;
- lezione;
- materiale;
- adattamento.

### TEACH

Usa soltanto materiali adottati o esplicitamente selezionati.

### RECORD

Registra ciò che è realmente avvenuto.

### REVIEW

Analizza copertura, coerenza, scostamenti ed evidenze.

### EXPLORE

Permette la consultazione ampia di curricolo, conoscenza e risorse.

## 15. Collision matrix

| Area | Cosa mantenere | Cosa generalizzare | Cosa evitare |
| --- | --- | --- | --- |
| Arena | authority curricolare | handoff più ricco se necessario | authoring operativo |
| Docente OS | contesto, Progetta, Classe, Lezione | modello multi-disciplina/multi-ordine | modello rigido Tecnologia |
| Atlas | curricolo, LO, risorse pubbliche | migliore riuso e discovery | workspace operativo |
| Officina | separazione dei ruoli | provider abstraction | authority o pubblicazione autonoma |
| NotebookLM | capacità grounded e output | adapter/provider | dipendenza obbligatoria |
| Knowledge | asset e fonti | source readiness | obbligo di corpus iniziale |
| Materiali | uso docente | lifecycle universale | generazione=adozione |
| Pubblicazione | manifest/receipt | supporto nuovi artefatti | automatismo cross-product |

## 16. Protected work in progress

Questa proposta non deve interferire con:

- ECO-02/P1;
- PR aperte necessarie al collaudo;
- Lesson Workspace in validazione;
- apertura dei materiali nel percorso reale;
- stato R3-P4;
- stato DOS-A1;
- CC3;
- autorizzazioni runtime correnti.

In particolare, fino alla chiusura del pilota ECO-02/P1, le modifiche a:

- "Prima della lezione";
- decisione materiali;
- Lesson Workspace;
- collegamenti materiali;
- TeachingSession;

devono essere considerate ad alto rischio di collisione e richiedono un gate separato.

## 17. Implementation strategy

### Phase A — Architecture only

- consolidare questo documento;
- verificare coerenza con ADR-010;
- verificare compatibilità con Human Task Model;
- nessun runtime.

### Phase B — Universal domain model

Definire tipi astratti per:

- ProfessionalContext;
- PlanningFrame;
- LearningPath;
- LearningSequence;
- Lesson;
- Activity;
- Evidence;
- Artifact;
- Reflection.

Nessuna rimozione dei modelli Tecnologia esistenti.

### Phase C — UX prototype

Prototipare almeno:

- nuovo docente senza fonti;
- docente con contesto già noto;
- preparazione di singola lezione;
- sequenza di lezioni;
- percorso/UDA;
- programmazione.

NO_RUNTIME.

### Phase D — Provider contracts

Formalizzare:

- SourceProvider;
- ArtifactProvider;
- provenance;
- capability declaration;
- failure mode;
- fallback;
- export/import contract.

### Phase E — Generality pilots

Prima di dichiarare il modello universale, testare almeno:

- una disciplina della primaria;
- una disciplina diversa da Tecnologia nella secondaria di primo grado;
- un caso interdisciplinare o Educazione civica;
- un caso senza fonti personali.

### Phase F — Material Studio runtime

Solo con nuova autorizzazione.

### Phase G — Atlas publication runtime

Solo dopo gate R3-P4 e relativi controlli.

## 18. Acceptance criteria

La proposta è considerata architetturalmente valida quando:

1. non modifica le authority esistenti;
2. non richiede NotebookLM per funzionare;
3. consente il primo utilizzo senza fonti personali;
4. supporta infanzia, primaria e secondaria di primo grado senza forzare la stessa ontologia operativa;
5. consente ingresso da programmazione, UDA/percorso, sequenza o singola lezione;
6. mantiene generazione, grounding, validazione, adozione e pubblicazione distinti;
7. mantiene il docente come decisore;
8. non introduce scritture cross-product implicite;
9. non attiva DOS-A1;
10. non autorizza R3-P4;
11. non modifica il runtime ECO-02 durante il collaudo;
12. rende i provider sostituibili;
13. conserva provenance e tracciabilità;
14. mantiene il carico cognitivo dell'utente inferiore alla complessità tecnica sottostante.

## 19. Non-goals

Questo documento non:

- implementa provider;
- collega NotebookLM;
- autorizza API;
- crea nuove tabelle;
- modifica UI runtime;
- modifica Arena;
- modifica Atlas;
- modifica Docente OS;
- promuove ADR;
- cambia ROADMAP;
- cambia STATUS;
- autorizza pubblicazione;
- autorizza automazione autonoma.

## 20. Architectural conclusion

La direzione più coerente non è aggiungere un nuovo sistema, ma completare la struttura già esistente.

Il modello target è:

```text
Arena
  ↓ governed curriculum context
Docente OS
  ↓ professional planning and teacher decision
Knowledge / Source Providers
  ↓
Officina / Artifact Providers
  ↓ candidate artifacts
Validation
  ↓
Teacher decision
  ├─ use in lesson
  └─ publication candidate
         ↓ explicit publication gate
       Atlas
```

Il principio di prodotto risultante è:

> **Il docente lavora in un unico ambiente professionale. Le fonti e i motori specialistici entrano quando servono, senza diventare il centro dell'esperienza e senza alterare le authority dell'ecosistema.**

## 21. Review checklist

La review umana deve verificare in particolare:

- assenza di collisioni con ECO-02/P1;
- compatibilità con ADR-010;
- compatibilità con authority boundaries;
- assenza di assunzioni specifiche di Tecnologia nel modello universale;
- adeguatezza per infanzia, primaria e secondaria di primo grado;
- chiarezza del source readiness model;
- correttezza della separazione SourceProvider / ArtifactProvider;
- correttezza del ciclo CandidateArtifact → TeacherDecision → LessonArtifact → PublicationCandidate;
- nessuna autorizzazione implicita di R3-P4 o DOS-A1;
- sostenibilità futura rispetto a provider diversi da NotebookLM.
