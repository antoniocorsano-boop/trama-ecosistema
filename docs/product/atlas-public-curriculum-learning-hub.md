# TRAMA-ATLAS-01 — Ruolo prodotto, curricolo pubblico, Student Learning Hub e modello di pubblicazione

**Stato:** APPROVED_GOVERNANCE / NOT_IMPLEMENTED / NOT_AUTHORIZED_FOR_RUNTIME  
**Data:** 21 settembre 2026  
**Perimetro:** TRAMA · Arena · Atlas · Docente OS  
**Decisioni collegate:** TRAMA-ADR-007, TRAMA-ADR-008

## 1. Scopo

Questa proposta consolida il ruolo di Curriculum Atlas alla luce dell'architettura TRAMA già approvata:

**Arena governa il curricolo; Atlas lo rende intelligibile e pubblica risorse/pagine; Docente OS rende operativo il lavoro docente. I trasferimenti tra i tre prodotti restano quattro flussi distinti, non una pipeline che sposta l'autorità.**

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
- identità, versione e stato delle proprie risorse;
- proiezioni navigabili e rappresentazioni visuali;
- catalogo materiali;
- identità, versione e stato delle proprie pagine/pubblicazioni;
- `PublicationReceipt` e stato editoriale Atlas;
- collegamenti curricolo ↔ LO ↔ materiali ↔ lezioni pubblicate.

Questa autorità Atlas non si estende a fonti, obiettivi, applicabilità, stato approvativo o versioni curricolari, che restano sotto Arena.

### TRAMA

Governa:
- contratti;
- confini;
- decisioni trasversali;
- stati di maturità;
- assurance comune.

## 4. Pubblicazione docente

Atlas non deve avere un secondo editor didattico concorrente a Docente OS.

Il modello distingue quattro flussi:
1. **Arena → Atlas**: proiezione pubblicabile del curricolo, sempre vincolata ai riferimenti Arena;
2. **Arena → Docente OS**: baseline curricolare autorevole per progettazione e preparazione;
3. **Atlas → Docente OS**: proposta di LO/materiali, sempre modificabile, sostituibile o escludibile;
4. **Docente OS → Atlas**: richiesta esplicita di pubblicazione.

Il flusso n. 4 è:

**Docente OS → anteprima → conferma docente → LessonPublicationManifest → Atlas → PublicationReceipt**

`LessonPublicationManifest` e `PublicationReceipt` sono oggetti diversi:
- il manifest esprime l'intenzione editoriale confermata dal docente;
- la receipt esprime l'esito autorevole di Atlas sull'operazione richiesta.

La pubblicazione deve essere:
- esplicita;
- versionata;
- idempotente;
- reversibile;
- minimizzata;
- verificabile;
- vincolata alla fonte Arena;
- eleggibile per diritti/licenze e accessibilità;
- priva di dati personali degli studenti.

Il docente deve poter:
- pubblicare;
- aggiornare;
- sostituire;
- ritirare.

La pubblicazione non equivale ad approvazione curricolare o istituzionale.

## 5. LessonPublicationManifest e PublicationReceipt

### 5.1 LessonPublicationManifest

È la richiesta versionata inviata da Docente OS dopo anteprima e conferma.

Campi minimi proposti:
- `manifestId`;
- `manifestVersion`;
- `idempotencyKey`;
- `operation: CREATE | UPDATE | WITHDRAW`;
- `sourceLessonRef`;
- `sourceDocenteOsRef`;
- `publicationId`/ `expectedPublicationVersion` quando applicabili;
- `discipline`;
- `grade`;
- `schoolYear` solo quando necessario;
- `sectionScope` opzionale e **omesso per impostazione predefinita**;
- `sequenceLabel` preferito alla data esatta;
- `lessonDate` opzionale e **omessa per impostazione predefinita**;
- `title`;
- `summaryForStudents`;
- `visibility`;
- `curriculumBinding`;
- `learningObjectRefs[]`;
- `materialRefs[]`;
- `provenance`;
- `requestedAt`.

`curriculumBinding` deve includere:
- `authority: Arena`;
- `curriculumVersionRef`;
- `authorityState`;
- `authorityReceiptRef` quando applicabile;
- `curriculumObjectiveRefs[]`.

Il manifest **non contiene una seconda copia autorevole degli obiettivi curricolari**. Eventuali etichette leggibili sono proiezioni derivate; un eventuale intento didattico del docente deve avere un campo semanticamente distinto.

Stati locali:
`DRAFT → PREVIEWED → CONFIRMED → SUBMITTED`.
Una modifica dopo la submission produce una nuova versione del manifest.

### 5.2 PublicationReceipt

Atlas restituisce una receipt distinta con almeno:
- `receiptId`;
- `manifestId`;
- `idempotencyKey`;
- `publicationId`;
- `publicationVersion`;
- `status: PUBLISHED | UPDATED | WITHDRAWN | REJECTED`;
- `contentDigest`;
- `processedAt`;
- versione sostituita quando applicabile;
- motivi di rifiuto quando applicabili;
- provenance Atlas.

La receipt certifica soltanto l'esito dell'operazione Atlas.

### 5.3 Regole operative

- stessa `idempotencyKey` + stesso payload → stesso esito, nessun duplicato;
- stessa `idempotencyKey` + payload diverso → rifiuto;
- update/withdraw richiedono la versione Atlas attesa;
- il ritiro è tracciabile e non cancella la storia;
- una ripubblicazione richiede una nuova intenzione esplicita.

### 5.4 Visibilità e minimizzazione

- `grade`: contesto didattico ammesso;
- `schoolYear`: solo quando necessario;
- `sectionScope`: omesso di default;
- `lessonDate`: omessa di default;
- nessun identificativo interno di classe/registro/calendario;
- ogni visibilità deve essere realmente applicata: nessuna “riservatezza” soltanto nominale.

### 5.5 Gate di eleggibilità

Prima di `PUBLISHED/UPDATED`:
- diritti o base d'uso dichiarati per ogni materiale;
- licenza/attribuzione ove richiesta;
- nessun materiale con diritti sconosciuti;
- target **WCAG 2.2 AA** per superfici e materiali controllabili;
- controlli automatici pertinenti **più verifica umana** per gli aspetti non automatizzabili.

Un asset non eleggibile deve essere escluso, sostituito o determinare `REJECTED`.

La forma finale dei due schemi richiede distinta revisione cross-product.

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

Navigazione primaria proposta per Atlas integrale:

- **Curricolo**
- **Percorsi**
- **Risorse**
- **Esplora**

La vista **Lezioni** resta una superficie contestuale dello Student Learning Hub, insieme alla vista **Obiettivi**; non sostituisce la navigazione curricolare primaria.

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
1. scegliere il percorso didattico disponibile;
2. scegliere classe/grado quando necessario;
3. scegliere disciplina;
4. esplorare per lezione o per obiettivo;
5. aprire materiali senza conoscere la struttura tecnica del sistema.

**Minimizzazione:** la sezione e la data esatta della lezione non sono informazioni pubbliche predefinite. Devono comparire soltanto se necessarie alla comprensione/routing e compatibili con la visibility policy.

### 9.1 Privacy-first per gli studenti

Atlas adotta come invariante di prodotto il principio **no student authentication**.

Lo Student Learning Hub deve essere fruibile senza:
- account studente;
- login individuale;
- profilo persistente;
- identificatore personale stabile;
- cronologia personale;
- tracciamento o profilazione individuale;
- dati di valutazione o esiti individuali.

La selezione del contesto deve usare soltanto informazioni non identificanti e strettamente necessarie, come:
- disciplina;
- grado/annualità;
- percorso o sequenza pubblicata;
- eventuali filtri di contenuto non personali.

Se una risorsa richiede identità individuale, autenticazione o dati personali per essere fruita, **non appartiene allo Student Learning Hub di Atlas** e deve restare nel sistema competente, soggetto alla propria governance.

La sezione e la data esatta restano omesse per impostazione predefinita. Non si introduce autenticazione studente come scorciatoia per ottenere personalizzazione o visibilità selettiva.

Regola architetturale: **privacy by design e data minimization precedono personalizzazione, analytics e convenience**.

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
- target **WCAG 2.2 AA**;
- test automatici di accessibilità + verifica umana;
- test da tastiera, focus, contrasto, ridisposizione e tecnologie assistive nei journey critici;
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

Gli identificativi **canonici TRAMA** sono quelli `R3-*`. Le sigle `ATLAS-*` sono alias di prodotto e non costituiscono una seconda roadmap.

| Canonico TRAMA | Alias Atlas | Capacità |
| --- | --- | --- |
| `R3-F0` | `ATLAS-F0` | Product & Design Foundation |
| `R3-P2` | `ATLAS-P2` | Curriculum pubblico |
| `R3-P3` | `ATLAS-P3` | Student Learning Hub |
| `R3-P4` | `ATLAS-P4` | Docente OS → Atlas Publication |
| `R3-P5` | `ATLAS-P5` | Smart Navigation |
| `R3-P6` | `ATLAS-P6` | Curriculum Health |

Regola: stato, gate e dipendenze sono registrati una sola volta sul codice canonico `R3-*`; gli alias Atlas servono soltanto alla leggibilità nel contesto del prodotto.

### R3-F0 / ATLAS-F0 — Product & Design Foundation
- information architecture;
- Visual Grammar;
- design token;
- primitive accessibili;
- component catalogue;
- prototipo;
- POC mappa 2D.

### R3-P2 / ATLAS-P2 — Curriculum pubblico
- famiglie;
- studenti;
- pubblico;
- progressione;
- schemi grafici;
- provenance su richiesta.

### R3-P3 / ATLAS-P3 — Student Learning Hub
- selezione minimizzata del contesto;
- vista Lezioni;
- vista Obiettivi;
- materiali.

### R3-P4 / ATLAS-P4 — Docente OS → Atlas Publication
- preview;
- `LessonPublicationManifest`;
- `PublicationReceipt`;
- publish/update/withdraw;
- binding Arena;
- policy visibilità/minimizzazione;
- gate diritti/licenze;
- gate WCAG 2.2 AA.

### R3-P5 / ATLAS-P5 — Smart Navigation
- Chiedi ad Atlas;
- Perspectives;
- semantic zoom;
- Visuale | Elenco.

### R3-P6 / ATLAS-P6 — Curriculum Health
- coverage;
- gap/overlap;
- readiness;
- eventuali esiti aggregati solo dopo distinta autorizzazione.

## 16. Gate di maturità

Ogni capacità deve essere valutata separatamente secondo il modello TRAMA M0–M5.

Gate trasversali:
- correttezza funzionale;
- usabilità;
- accessibilità con target WCAG 2.2 AA;
- verifica automatica + umana dell'accessibilità;
- provenance;
- diritti/licenze dei materiali pubblicati;
- sicurezza/privacy;
- minimizzazione e visibility enforcement;
- controllo umano;
- reversibilità;
- versionamento e idempotenza per la pubblicazione;
- binding autorevole ad Arena;
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
- esclude l'autenticazione studenti come principio architetturale privacy-first;
- non autorizza nuove dipendenze runtime.

## 18. Decisioni approvate e limiti di efficacia

Con la promozione governata di TRAMA-ADR-007 e TRAMA-ADR-008 sono approvati:

1. Atlas come superficie pubblica e didattica di TRAMA;
2. Student Learning Hub come dominio Atlas;
3. Docente OS come unico workspace editoriale professionale per la decisione di pubblicazione docente;
4. separazione formale tra `LessonPublicationManifest` e `PublicationReceipt`;
5. binding obbligatorio alle fonti Arena senza seconda copia autorevole degli obiettivi;
6. policy di visibilità/minimizzazione e gate diritti/licenze + WCAG 2.2 AA;
7. Visual Grammar e Atlas Design Core come fondazione prima dell'ampliamento delle feature;
8. mapping canonico `R3-*` ↔ alias `ATLAS-*`;
9. aggiornamento contestuale di `docs/knowledge/source-registry.json`, con Atlas autorevole per proprie risorse, pagine, pubblicazioni e relativo stato editoriale;
10. mantenimento di Arena come autorità curricolare e di Docente OS come autorità del contesto e delle decisioni professionali.

**Limiti invarianti dopo l'approvazione:**
- `OutcomeAggregateSnapshot` resta `DEFERRED / NOT_AUTHORIZED`;
- il runtime Docente OS → Atlas resta `NOT_IMPLEMENTED / NOT_AUTHORIZED_FOR_RUNTIME`;
- DOS-A1 resta differita;
- nessuna autenticazione studenti o nuova dipendenza runtime è autorizzata;
- ogni futura implementazione richiede i gate tecnici, privacy, sicurezza, accessibilità e collaudo umano previsti dai contratti.


## 19. Addendum — Atlas integrale e Officina materiali

**Stato:** PROPOSED / HUMAN REVIEW REQUIRED / RUNTIME NOT AUTHORIZED  
**Decisione collegata:** TRAMA-ADR-010

### 19.1 Atlas integrale

Atlas non è una biblioteca di file né un semplice visualizzatore Spatial. Il prodotto target unifica, sullo stesso modello semantico:
- mappa navigabile del curricolo;
- progressioni verticali e orizzontali;
- prerequisiti, raccordi e percorsi concettuali;
- ricerca e navigazione intelligente (“Chiedi ad Atlas”);
- Student Learning Hub;
- biblioteca educativa di Learning Object e risorse;
- collegamenti curricolo ↔ obiettivi ↔ UDA/lezioni pubblicate ↔ materiali;
- provenance e versioni Arena sotto progressive disclosure.

Regola: **la biblioteca è una dimensione di Atlas, non la definizione di Atlas**.

### 19.2 Officina materiali

La produzione di infografiche, schede, presentazioni, immagini, mappe, verifiche e altri artefatti di qualità è una capacità specialistica distinta dalla regia didattica di Docente OS e dall'autorità editoriale di Atlas.

Flusso target:

`Arena → contesto curricolare → Docente OS → ricerca/riuso Atlas → brief didattico → Officina materiali → revisione docente → uso nella lezione → eventuale pubblicazione in Atlas`.

L'Officina materiali:
- riceve un brief strutturato da Docente OS;
- può usare pattern, Learning Object, design profile e risorse di Atlas;
- può selezionare motori specialistici diversi per tipo di artefatto;
- non approva curricolo, lezioni o pubblicazioni;
- non persiste automaticamente il risultato come risorsa Atlas;
- restituisce proposte modificabili/sostituibili/scartabili;
- conserva provenance del processo di produzione e dei materiali sorgente.

### 19.3 Docente OS non è il motore grafico

Docente OS resta il workspace e l'orchestratore professionale. Deve:
- conoscere classe, lezione, obiettivi, sequenza e materiali già disponibili;
- cercare prima il riuso in Atlas;
- costruire il brief di produzione quando serve un nuovo artefatto;
- mostrare anteprima e alternative;
- consentire modifica, rigenerazione parziale, sostituzione o esclusione;
- collegare il materiale approvato alla lezione;
- richiedere una pubblicazione Atlas soltanto dopo decisione esplicita del docente.

Non deve diventare un editor grafico generalista né produrre autonomamente asset definitivi tramite un unico renderer interno.

### 19.4 Riusa prima di generare

Prima di una nuova produzione, il sistema deve verificare se Atlas contiene una risorsa compatibile con nodo curricolare, annualità, disciplina, funzione e contesto d'uso.

Esiti ammessi per il docente:
- **Riutilizza**;
- **Adatta**;
- **Crea nuova**.

La scelta resta umana. La similarità semantica o una proposta automatica non equivalgono ad adozione.

### 19.5 Pubblicazione e qualità

Un materiale della lezione e una risorsa Atlas pubblicata sono oggetti distinti. Un artefatto può restare locale/provvisorio in Docente OS; per entrare nella biblioteca Atlas deve superare almeno:
- coerenza didattica e curricolare;
- leggibilità e qualità editoriale;
- accessibilità applicabile;
- provenienza;
- diritti/licenze;
- revisione e conferma docente.

La pubblicazione continua a usare il confine `LessonPublicationManifest → PublicationReceipt`; l'Officina materiali non lo bypassa.

### 19.6 Invarianti

Questo addendum:
- non sposta l'autorità curricolare da Arena;
- non rende Atlas fonte curricolare di Docente OS;
- non crea una seconda copia autorevole degli obiettivi;
- non autorizza runtime autonomo dell'Officina materiali;
- non autorizza pubblicazione automatica;
- non modifica `DOS-A1 = RUNTIME_DEFERRED`;
- non introduce dati personali degli studenti nel flusso pubblico.
