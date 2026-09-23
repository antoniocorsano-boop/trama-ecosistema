# TRAMA-DOS-PP-01 — Pratica professionale e sviluppo professionale assistiti dall’IA

**Data:** 2026-09-23  
**Stato:** DESIGN AUTHORIZED / RUNTIME NOT AUTHORIZED  
**Perimetro:** TRAMA · Docente OS · Arena · Atlas  
**Roadmap:** R4-P2 — Professional Practice  
**Fonte di approfondimento:** Med Kharbach, *AI for Teacher Professional Development* (2026), cap. 9 di *Teaching with AI*.

## Decisione

TRAMA adotta il principio secondo cui l’intelligenza artificiale sostiene lo sviluppo professionale continuo del docente senza assumere funzioni di autorità curricolare, valutazione autonoma o decisione professionale.

> L’IA osserva, collega, ricerca, propone e aiuta a riflettere. Il docente interpreta, modifica, decide e autorizza.

Questa decisione non crea un nuovo prodotto e non autorizza un nuovo runtime cross-product.

## Confini di autorità

### Arena
Resta autorità del curricolo, delle fonti curricolari, dell’applicabilità, delle versioni e degli stati approvativi.

### Docente OS
È il workspace della professionalità docente: progettazione, preparazione, lezioni, materiali, conoscenza professionale, riflessione, continuità didattica e sviluppo professionale.

### Atlas
Resta superficie di navigazione, accesso e fruizione del curricolo e dei materiali pubblicati. Non diventa memoria professionale del docente, sistema di valutazione o profilo persistente dello studente.

### TRAMA
Governa autorità, provenance, contratti, versioni, responsabilità, stati e interoperabilità.

## Invariante HUMAN PROFESSIONAL JUDGMENT

Ogni capacità di IA relativa alla professionalità docente deve:

- operare su fonti e contesto identificabili;
- presentare proposte come proposte;
- consentire modifica, contestazione e rigetto;
- distinguere fatti, inferenze e suggerimenti;
- mantenere visibile la provenienza quando rilevante;
- non trasformare un suggerimento in decisione senza azione esplicita del docente;
- non pubblicare automaticamente;
- non modificare autonomamente il curricolo;
- non produrre valutazioni automatiche del docente;
- lasciare al docente la responsabilità professionale finale.

## Capacità adottate

### 1. Assistente professionale contestuale — ADOPT
Nel perimetro autorizzato può utilizzare disciplina, classe, anno scolastico, baseline Arena, progettazione, UDA, lezioni precedenti, materiali, osservazioni e decisioni del docente.

### 2. Diario riflessivo strutturato — ADOPT NOW
Ciclo canonico:

`Preparazione → Lezione → Osservazione → Riflessione → Evidenza → Decisione → Adattamento → Lezione successiva`

Dati minimi:
- previsto;
- effettivamente svolto;
- evidenze osservate;
- difficoltà;
- elementi riusciti;
- elementi non completati;
- adattamenti;
- questioni da riprendere;
- decisione per il seguito.

### 3. Pattern longitudinali — ADOPT WITH CONSTRAINTS
L’IA può evidenziare ricorrenze e segnali da interpretare, ma non formulare diagnosi, giudizi sugli studenti o attribuzioni causali certe.

### 4. Sistema personale della conoscenza — CONSOLIDATE
`Acquisizione → Trasformazione → Indicizzazione → Classificazione → Collegamento → Recupero contestuale → Riuso`.

### 5. Separazione conoscenza/materiali — INVARIANT
`KnowledgeResource != TeachingMaterial`.

La conoscenza professionale resta nel dominio docente. I materiali didattici possono essere pubblicati verso Atlas soltanto tramite i contratti governati.

### 6. Ricerca professionale assistita — LATER PHASE
`Osservazione → Quesito professionale → Ricerca → Fonti → Sintesi → Ipotesi operative → Decisione docente`.

### 7. Sviluppo professionale — ADOPT
Evoluzione dall’archivio attestati a un’area che comprenda formazione, attestati, corsi, letture, ricerche, sperimentazioni, riflessioni e obiettivi professionali.

### 8. Simulazione professionale — RECORD / DO NOT IMPLEMENT NOW
`Simulation != Operational Action`.

## Non adottato

Non sono autorizzati:

- secondo curricolo in Docente OS;
- seconda memoria curricolare in Atlas;
- profilo individuale persistente dello studente in Atlas;
- valutazioni automatiche degli studenti o del docente;
- pubblicazione automatica;
- trasformazione automatica della riflessione in decisione;
- nuove pipeline obbligatorie tra prodotti;
- dipendenza obbligatoria da Atlas per lavorare in Docente OS;
- nuovi runtime cross-product;
- duplicazioni non governate della base di conoscenza.

## Primo slice di progettazione

**R4-P2/S1 — Reflective Lesson Continuity**

Ambito:
1. diario riflessivo strutturato collegato alla lezione;
2. distinzione tra fatto osservato, riflessione e decisione;
3. continuità esplicita verso la preparazione successiva;
4. collegamento contestuale con Conoscenza;
5. assistenza IA solo advisory e teacher-editable;
6. nessuna scrittura silenziosa;
7. nessuna modifica automatica di Arena o pubblicazione verso Atlas.

### Gate di progettazione S1

Prima di implementazione runtime devono esistere:

- modello dati minimale;
- stati e transizioni;
- regole privacy/minimizzazione;
- UX dei momenti di riflessione;
- contratto di provenance;
- test di non-silent-write;
- criteri di verifica umana;
- verifica di non collisione con ECO-02/P1 e R3-F0/S3.

## Relazione con i gate correnti

- ECO-02/P1 resta attivo fino al collaudo umano finale.
- R3-F0/S3 resta attivo fino alla propria exit review.
- DOS-A1 resta `RUNTIME_DEFERRED`.
- R4-P2 autorizza ora soltanto progettazione, specifica e prototipazione NO_RUNTIME.
- L’implementazione runtime di R4-P2 richiederà un gate successivo esplicito.

## Modello funzionale di riferimento

Docente OS:

- Oggi
- Orario
- Classi
  - Piano annuale
  - Progetta
  - Lezioni
  - Materiali
- Conoscenza
  - Fonti
  - Documenti
  - Ricerche
  - Collegamenti
- Pratica professionale
  - Diario
  - Riflessioni
  - Pattern
  - Decisioni
- Sviluppo professionale
  - Formazione
  - Attestati
  - Letture
  - Obiettivi
  - Percorso professionale

L’assistente IA è una capacità trasversale, non una sezione autonoma.
