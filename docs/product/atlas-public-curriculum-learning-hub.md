# TRAMA-ATLAS-01 — Ruolo prodotto, curricolo pubblico, Student Learning Hub e modello di pubblicazione

**Stato:** PROPOSED_CANONICAL / HUMAN_REVIEW_REQUIRED  
**Data:** 21 settembre 2026  
**Perimetro:** TRAMA · Arena · Atlas · Docente OS  
**Decisioni collegate:** TRAMA-ADR-007, TRAMA-ADR-008

## 1. Scopo

Questa proposta consolida il ruolo di Curriculum Atlas alla luce dell'architettura TRAMA già approvata:

**Arena governa → Atlas rende intelligibile, navigabile e pubblicabile → Docente OS rende operativo.**

Atlas non deve evolvere come semplice collezione di card o come visualizzazione 3D del curricolo. Deve diventare la superficie pubblica e didattica dell'ecosistema: il luogo in cui il curricolo approvato viene compreso, esplorato e collegato a percorsi, lezioni e materiali pubblicabili.

La proposta non modifica l'autorità curricolare di Arena e non trasforma Atlas in LMS, registro elettronico o repository di dati personali degli studenti.

## 2. Ruolo target di Atlas

Atlas assolve a quattro domini funzionali sullo stesso modello semantico.

### 2.1 Curriculum pubblico

Rende comprensibili a famiglie, studenti, docenti e comunità:
- cosa si apprende;
- come progredisce l'apprendimento tra annualità;
- quali competenze e obiettivi sono coinvolti;
- quali attività e prodotti significativi sono previsti;
- quali raccordi esistono tra discipline, nuclei e annualità;
- quali fonti e versioni sostengono la rappresentazione.

### 2.2 Student Learning Hub

Rende disponibili agli studenti contenuti e materiali pubblicati per:
- anno scolastico;
- classe;
- eventuale sezione;
- disciplina.

La stessa base contenutistica deve poter essere esplorata almeno con due viste equivalenti:

**Vista per lezioni**
- sequenza cronologica;
- titolo;
- cosa impariamo;
- cosa facciamo;
- materiali;
- da ricordare;
- approfondimenti.

**Vista per obiettivi**
- obiettivo formativo;
- lezioni collegate;
- Learning Object;
- materiali;
- attività;
- approfondimenti.

La vista per lezioni risponde a “che cosa abbiamo fatto?”.
La vista per obiettivi risponde a “dove e come ho imparato questo?”.

### 2.3 Biblioteca educativa

Atlas organizza oggetti e artefatti pubblicabili:
- Learning Object;
- schemi;
- infografiche;
- materiali LIM;
- schede studente;
- PDF;
- immagini;
- video;
- eventuali contenuti interattivi interoperabili.

Ogni risorsa mantiene:
- identità;
- versione;
- provenance;
- stato editoriale;
- relazione con curricolo e lezioni.

### 2.4 Esplorazione e qualità

Atlas abilita viste intelligenti dello stesso grafo:
- Verticale;
- Timeline;
- Matrice;
- Mappa 2D;
- rete interdisciplinare;
- Galaxy/Spatial;
- Visuale | Elenco;
- ricerca semantica / “Chiedi ad Atlas”.

In futuro può presentare indicatori aggregati di copertura e qualità dell'offerta, purché privi di dati personali e senza punteggi sintetici riferiti a singoli studenti, docenti o classi.

## 3. Confini di autorità

### Arena

Resta autorevole per:
- fonti curricolari;
- baseline;
- applicabilità;
- revisioni;
- stato approvativo;
- decisioni istituzionali;
- versioni curricolari.

Atlas può pubblicare il curricolo ma non diventa la fonte curricolare di Docente OS.

### Docente OS

Resta autorevole per:
- classe e contesto professionale;
- calendario e orario;
- preparazione;
- TeachingSession;
- scelta e adattamento dei materiali;
- decisione di pubblicare;
- evidenze e riflessione professionale.

### Atlas

È autorevole per:
- identità/versione/stato delle proprie risorse;
- proiezioni navigabili;
- rappresentazioni visuali;
- catalogo materiali;
- pagine pubblicate;
- collegamenti curricolo ↔ LO ↔ materiali ↔ lezioni pubblicate.

### TRAMA

Governa:
- contratti;
- confini;
- decisioni trasversali;
- stati di maturità;
- assurance comune.

## 4. Pubblicazione docente

Atlas non deve avere un secondo editor didattico concorrente a Docente OS.

Il flusso target è:

**Docente OS → anteprima → conferma docente → LessonPublicationManifest → Atlas**

La pubblicazione deve essere:
- esplicita;
- versionata;
- reversibile;
- minimizzata;
- verificabile;
- priva di dati personali degli studenti.

Il docente deve poter:
- pubblicare;
- aggiornare;
- sostituire;
- ritirare.

La pubblicazione non equivale ad approvazione curricolare o istituzionale.

## 5. LessonPublicationManifest — proposta di contratto

Campi minimi proposti:
- publicationId;
- sourceLessonRef;
- schoolYear;
- grade;
- sectionScope opzionale;
- discipline;
- sequence/date label pubblicabile;
- title;
- learningObjectives[];
- curriculumRefs[];
- learningObjectRefs[];
- materialRefs[];
- summaryForStudents;
- visibility;
- publicationVersion;
- sourceDocenteOsRef;
- provenance;
- publishedAt;
- withdrawnAt opzionale.

Vincoli:
- nessun nome studente;
- nessuna valutazione individuale;
- nessuna annotazione personale docente;
- nessun calendario personale;
- nessuna credenziale.

La forma finale del contratto richiede distinta revisione cross-product.

## 6. Visual Grammar of Curriculum

La rappresentazione non deve essere guidata dal componente “card”, ma dalla struttura semantica.

| Informazione | Rappresentazione primaria |
| --- | --- |
| disciplina → nucleo → obiettivi | albero / outline visuale |
| progressione per annualità | percorso verticale / ladder / river |
| sequenza didattica | timeline |
| obiettivi × classi | matrice |
| raccordi interdisciplinari | network graph |
| obiettivo → lezioni → materiali | percorso collegato |
| processo tecnologico | flow diagram |
| sistema e relazioni causali | system map |
| singola risorsa o lezione | card/list item, solo quando appropriato |

Regola:
**la forma grafica deve derivare dal tipo di relazione educativa, non da un template estetico generico.**

## 7. Information Architecture target

Navigazione primaria proposta:

- **Curricolo**
- **Percorsi**
- **Lezioni**
- **Materiali**
- **Esplora**

“Fonti” resta disponibile come provenance/disclosure, non come destinazione primaria.

“Mappa” diventa una modalità di Esplora, non l'information architecture del prodotto.

Dentro Esplora:
- Verticale;
- Timeline;
- Matrice;
- Rete;
- Galaxy;
- Elenco.

## 8. Esperienza famiglie e pubblico

La vista pubblica deve privilegiare:
- linguaggio comprensibile;
- schemi e progressioni;
- esempi di attività;
- prodotti significativi;
- collegamenti tra annualità;
- spiegazioni brevi;
- fonti disponibili su richiesta.

Dettagli tecnici come SHA, manifest e receipt devono restare sotto progressive disclosure.

## 9. Esperienza studenti

Lo studente deve poter:
1. scegliere anno scolastico;
2. scegliere classe;
3. scegliere eventuale sezione quando necessaria;
4. scegliere disciplina;
5. esplorare per lezione o per obiettivo;
6. aprire materiali senza conoscere la struttura tecnica del sistema.

Per il pilota iniziale non è richiesto un account studente se la pubblicazione può restare priva di dati personali e ad accesso pubblico/controllato per percorso.

Qualsiasi futura autenticazione o personalizzazione richiede una distinta valutazione privacy, sicurezza e base giuridica.

## 10. Esiti e qualità dell'offerta formativa

Non è autorizzato alcun trasferimento di esiti individuali verso Atlas.

Capacità futura proposta:
**OutcomeAggregateSnapshot**

Potrebbe includere soltanto indicatori sufficientemente aggregati e minimizzati per analizzare:
- copertura degli obiettivi;
- disponibilità dei LO;
- materiali effettivamente adottati in forma aggregata;
- validazioni didattiche;
- gap o sovrapposizioni;
- readiness editoriale.

Stato:
**DEFERRED / NOT_AUTHORIZED**.

Non devono essere prodotti:
- ranking del docente;
- ranking della classe;
- score globale della scuola;
- esposizione di dati individuali.

## 11. Design direction

Atlas deve essere un prodotto educativo/editoriale, non una dashboard SaaS generica.

Direzione coerente con TRAMA:
- avorio / superfici chiare per contenuto pubblico;
- verde petrolio per conoscenza e navigazione Atlas;
- indaco per autorità curricolare Arena quando necessario;
- terracotta per azione didattica Docente OS;
- oro tenue per raccordi e connessioni.

Dark mode:
- opzionale;
- appropriata per Galaxy/Universe e alcune viste immersive;
- non baseline obbligatoria per curriculum pubblico o Student Hub.

## 12. Atlas Design Core

Fondazione proposta:
- design token condivisi TRAMA;
- tipografia editoriale e scolastica;
- spacing/radius/focus/status coerenti;
- primitive accessibili;
- componenti propri Atlas;
- Storybook/catalogo componenti;
- test automatici + test umani;
- nessun secondo design system sovrapposto.

Riferimenti tecnici da valutare:
- React Aria o primitive equivalenti per interaction/accessibility;
- Style Dictionary per token condivisi;
- Lucide per iconografia;
- Storybook + axe;
- Playwright per journey;
- Cytoscape.js per mappa 2D professionale;
- Three.js mantenuto per Galaxy/Universe.

L'adozione di librerie non è autorizzata da questa proposta: richiede spike tecnico separato.

## 13. Strumenti di progettazione

Separazione consigliata:
- **Figma**: prodotto digitale, wireframe, component library, prototipi e design handoff;
- **Canva**: Visual Library, schemi didattici, infografiche, materiali studente e controllo brand.

Gli strumenti non diventano fonti autorevoli dei dati.

## 14. Benchmark utilizzati

Benchmark di curriculum/public learning:
- Australian Curriculum;
- NSW Curriculum;
- Oak National Academy.

Benchmark di accessibility/design:
- GOV.UK Design System;
- U.S. Web Design System.

Benchmark tecnici:
- React Aria;
- Storybook/axe;
- Playwright;
- Cytoscape.js;
- H5P per possibili asset interattivi interoperabili.

I benchmark orientano pattern e qualità; non costituiscono specifiche da copiare.

## 15. Roadmap proposta

### ATLAS-F0 — Product & Design Foundation
- information architecture;
- Visual Grammar;
- design token;
- primitive accessibili;
- component catalogue;
- prototipo Figma;
- POC Cytoscape 2D.

### ATLAS-P2 — Curriculum pubblico
- famiglie;
- studenti;
- pubblico;
- progressione;
- schemi grafici;
- provenance su richiesta.

### ATLAS-P3 — Student Learning Hub
- selezione anno/classe/sezione/disciplina;
- vista Lezioni;
- vista Obiettivi;
- materiali.

### ATLAS-P4 — Docente OS → Atlas Publication
- preview;
- LessonPublicationManifest;
- publish/update/withdraw;
- receipt.

### ATLAS-P5 — Smart Navigation
- Chiedi ad Atlas;
- Perspectives;
- semantic zoom;
- Visuale | Elenco.

### ATLAS-P6 — Curriculum Health
- coverage;
- gap/overlap;
- readiness;
- eventuali esiti aggregati solo dopo distinta autorizzazione.

## 16. Gate di maturità

Ogni capacità deve essere valutata separatamente secondo il modello TRAMA M0–M5.

Gate trasversali:
- correttezza funzionale;
- usabilità;
- accessibilità;
- provenance;
- sicurezza/privacy;
- controllo umano;
- reversibilità;
- sostenibilità operativa;
- chiarezza pubblica;
- qualità editoriale/visuale.

## 17. Compatibilità

Questa proposta:
- preserva Arena come fonte curricolare;
- preserva Docente OS come workspace docente;
- preserva Atlas come conoscenza/materiali navigabili;
- estende Atlas alla pubblicazione didattica senza introdurre dati personali;
- non attiva DOS-A1;
- non autorizza OutcomeAggregateSnapshot;
- non autorizza autenticazione studenti;
- non autorizza nuove dipendenze runtime.

## 18. Decisioni richieste

Per passare da PROPOSED ad APPROVED occorre confermare:
1. Atlas come superficie pubblica e didattica di TRAMA;
2. Student Learning Hub come dominio Atlas;
3. Docente OS come unico workspace editoriale professionale per la pubblicazione docente;
4. LessonPublicationManifest come direzione contrattuale;
5. Visual Grammar come principio di rappresentazione;
6. Atlas Design Core prima dell'ampliamento delle feature;
7. OutcomeAggregateSnapshot ancora differito.

