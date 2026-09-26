# R4-P1 — Governed Entry Contract

Status: **PROPOSED / HUMAN REVIEW REQUIRED / RUNTIME NOT AUTHORIZED**

## 1. Scopo

Questo contratto definisce le condizioni di ingresso di **R4-P1 — Officina materiali specialistica**. Formalizza il percorso con cui il docente può progettare, riutilizzare, adattare o creare materiali didattici di qualità senza trasferire autorità editoriale, curricolare o decisionale a un sistema automatico.

R4-P1 è una capacità professionale **teacher-first**. Il presente documento autorizza esclusivamente analisi, progettazione, prototipazione e verifica governata. Non autorizza runtime cross-product, pubblicazione automatica o attivazione di DOS-A1.

## 2. Autorità e confini

- **Arena** resta autorità per baseline curricolare, provenienza, versione e stato di approvazione del curricolo.
- **Atlas** resta ambiente pubblico di navigazione, riuso e fruizione dei materiali pubblicati; non diventa fonte curricolare autorevole.
- **Docente OS** costruisce il brief didattico e sostiene il flusso professionale del docente; non assume decisioni editoriali autonome.
- **TRAMA** governa contratti, gate, interoperabilità e condizioni di avanzamento.
- Il **docente** decide se riutilizzare, adattare, creare, modificare, collegare alla lezione, sostituire, escludere o proporre alla pubblicazione un materiale.
- **DOS-A1 resta RUNTIME_DEFERRED** fino a distinta autorizzazione governata.

## 3. Flusso minimo governato

1. **Contesto didattico** — Docente OS prepara un brief esplicito, modificabile dal docente, collegabile alla lezione e alla baseline curricolare disponibile.
2. **Ricerca prima della generazione** — il sistema propone la ricerca in Atlas e rende esplicite le alternative **Riutilizza | Adatta | Crea nuova**.
3. **Produzione specialistica** — soltanto dopo la scelta del docente, il materiale può essere prodotto mediante un motore adeguato al tipo di artefatto.
4. **Anteprima e confronto** — il risultato è mostrato prima di qualsiasi collegamento o pubblicazione; il docente può modificarlo, rigenerarlo, sostituirlo o scartarlo.
5. **Collegamento alla lezione** — avviene soltanto dopo conferma esplicita e con feedback visibile di avanzamento, successo o errore.
6. **Pubblicazione separata** — l'eventuale pubblicazione in Atlas segue un atto distinto, governato da `LessonPublicationManifest` e `PublicationReceipt`.

## 4. Invarianti teacher-first

- nessuna generazione equivale ad approvazione;
- nessun materiale è collegato silenziosamente a una lezione;
- nessun materiale è pubblicato automaticamente;
- ogni operazione significativa produce feedback percepibile all'utente;
- il docente può sempre interrompere, modificare, sostituire o escludere il risultato;
- il sistema conserva la distinzione tra proposta, artefatto di lavoro, materiale collegato e materiale pubblicato;
- nessun dato personale dello studente è richiesto per la produzione o la pubblicazione ordinaria;
- la scelta del motore specialistico non modifica authority, provenance o stato curricolare.

## 5. Rapporto con Atlas e ATLAS-MAT-PUB-01

R4-P1 può riusare pattern, profili di oggetto di apprendimento e design profile Atlas quando pertinenti. Può inoltre riusare `ATLAS-MAT-PUB-01` come infrastruttura tecnica Git-first per normalizzazione, manifest, commit, deploy, smoke test e ricevuta tecnica.

Questo riuso **non attribuisce all'Officina capacità editoriale autonoma**. La decisione editoriale resta separata dall'esecuzione tecnica della pubblicazione.

Il canale canonico verso Atlas resta il contratto di pubblicazione governato; non sono ammessi canali paralleli che aggirino `LessonPublicationManifest` / `PublicationReceipt`.

## 6. Provenienza, diritti, accessibilità e qualità

Prima che un materiale possa essere considerato pubblicabile devono essere verificabili almeno:

- provenienza delle fonti e degli asset quando applicabile;
- diritti, licenze e condizioni di riuso;
- accessibilità coerente con il target **WCAG 2.2 AA**, con controlli automatici e verifica umana dove richiesta;
- qualità editoriale e adeguatezza del formato;
- assenza di dati personali non necessari;
- binding curricolare esplicito quando il materiale dichiara un collegamento al curricolo Arena.

Un gate non superato impedisce la pubblicazione ma non deve distruggere il lavoro del docente: il materiale può restare bozza modificabile con motivazione comprensibile.

## 7. Feedback e stati percepibili

Le azioni asincrone o potenzialmente fallibili devono rendere percepibili almeno gli stati:

`READY → IN_PROGRESS → NEEDS_DECISION | COMPLETED | ERROR`

Il feedback deve indicare che cosa è avvenuto e quale azione è disponibile. Il solo cambio visivo non testuale non è sufficiente per operazioni decisive.

## 8. Non autorizzazioni esplicite

Il presente contratto non autorizza:

- DOS-A1;
- scritture automatiche cross-product;
- pubblicazione automatica in Atlas;
- approvazione curricolare automatica;
- selezione autonoma definitiva di materiali da parte dell'IA;
- profilazione o tracking degli studenti;
- introduzione di account studente;
- modifica dell'autorità di Arena, Atlas, Docente OS o TRAMA.

## 9. Gate di ingresso a implementazione

Prima di qualsiasi implementazione runtime R4-P1 deve esistere una revisione umana governata che verifichi almeno:

1. coerenza con governance e contratti vigenti;
2. percorso teacher-first completo e reversibile;
3. feedback percepibile per conferma, avanzamento, errore e completamento;
4. separazione fra collegamento alla lezione e pubblicazione;
5. binding corretto ad Arena e Atlas;
6. gate provenance/diritti/accessibilità/qualità;
7. privacy-first e assenza di dati personali studente non necessari;
8. conferma che DOS-A1 resta `RUNTIME_DEFERRED`.

Esito possibile: `PASS`, `CHANGES REQUIRED` oppure `NOT EVALUABLE`.

## 10. Criterio di uscita della fase di ingresso

La fase di ingresso è completata soltanto quando:

- questo contratto è sottoposto a HUMAN EXACT-HEAD REVIEW;
- eventuali rilievi sono risolti sullo stesso ramo governato;
- la ricevuta della revisione è registrata come evidenza;
- l'eventuale successivo slice di prototipazione è aperto separatamente e mantiene `NO_RUNTIME` finché non interviene un gate esplicito.

Fino ad allora **R4-P1 resta PLANNED / HUMAN REVIEW REQUIRED / RUNTIME NOT AUTHORIZED**.
