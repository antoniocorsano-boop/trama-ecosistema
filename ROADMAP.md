# Roadmap TRAMA

## R1 Fondazione del governo

- struttura del repository;
- registro delle decisioni;
- contratti iniziali tra prodotti;
- schemi e verifica automatica;
- quadro di stato unico.

Esito atteso: una fonte comune leggibile e verificabile, senza duplicazione delle basi di conoscenza.

## R2 Pilota ECO-02/P1

- prova reale controllata in Tecnologia 2C;
- vincolo con classe, data e collocazione oraria;
- provenienza del curricolo Arena;
- proposta Atlas sostituibile o escludibile;
- feedback visibile per trasferimento, accettazione, errore e completamento;
- rapporto umano sul valore didattico.

Esito atteso: dimostrazione del percorso curricolo verso preparazione verso lezione, con controllo docente.

## CC2 — TRAMA Control Center v2

Obiettivo: trasformare il Control Center in osservatorio read-only di maturità, evidenze e dipendenze e, progressivamente, in **Project Knowledge Base governata** e **Context Provider** per il lavoro umano e agentico.

### CC2-F0 — baseline

Integrata: modello di maturità, evidence model, architettura snapshot-first, UI/UX target e piano F0→F6.

### CC2-F1 — Snapshot, Evidence & Project Knowledge Foundation

- **F1/A** — snapshot foundation: integrata;
- **F1/B** — maturity definitions: integrata;
- **F1/C** — conservative maturity wiring: integrata;
- **F1/D** — evidence binding & freshness hardening: attivo, separato;
- **F1/E** — Project Knowledge Foundation: proposta documentale.

F1/E introduce, senza nuova authority:

- `ProjectContextSnapshot`;
- `TRAMA Context Pack`;
- knowledge events;
- source/version binding;
- freshness;
- supersession;
- negative knowledge retention;
- next candidate actions come informazione, non automazione.

### Evoluzione successiva proposta

- **CC2-F2** — collector governati dai repository;
- **CC2-F3** — Context Pack generator;
- **CC2-F4** — ricerca/interrogazione nel Control Center;
- **CC2-F5** — interfaccia agentica read-only;
- **CC2-F6** — audit, consolidamento e adozione.

Regola: il Control Center può **spiegare e recuperare** il quadro corrente, ma non approva, non promuove, non chiude gate e non autorizza runtime.

## R3 Consolidamento Atlas

Gli identificativi canonici di roadmap sono quelli **R3-***. Gli identificativi **ATLAS-*** sono alias di prodotto e non aprono una seconda sequenza di stato o maturità.

| Canonico TRAMA | Alias Atlas | Capacità |
| --- | --- | --- |
| R3-F0 | ATLAS-F0 | Product & Design Foundation |
| R3-P2 | ATLAS-P2 | Curriculum pubblico |
| R3-P3 | ATLAS-P3 | Student Learning Hub |
| R3-P4 | ATLAS-P4 | Docente OS → Atlas Publication |
| R3-P5 | ATLAS-P5 | Smart Navigation |
| R3-P6 | ATLAS-P6 | Curriculum Health |

Regola: avanzamento, gate e dipendenze sono registrati una sola volta sull'identificativo canonico R3-*.

Obiettivi trasversali:
- convergenza su una base stabile;
- percorso Materiali → oggetto di apprendimento → Proietta;
- prove Android, desktop e LIM;
- tastiera, fuoco visibile, contrasto e ridisposizione;
- stati editoriali espliciti.

### R3-F0 / ATLAS-F0 — Product & Design Foundation

Stato corrente: **ACTIVE / START GATE HUMAN REVIEW PASS / EXIT REVIEW PENDING**.

Primo incremento integrato: **R3-F0/S1 — Information Architecture + Visual Grammar**, con HUMAN EXACT-HEAD REVIEW PASS; resta esclusivamente prodotto/design e `NO_RUNTIME`.

Secondo incremento integrato: **R3-F0/S2 — Design Core & Accessible Primitives**, con HUMAN EXACT-HEAD REVIEW PASS e `NO_RUNTIME`.

Terzo incremento: **R3-F0/S3 — Journey Prototypes & 2D Map POC**. Il pacchetto statico è integrato con HUMAN EXACT-HEAD REVIEW PASS e `NO_RUNTIME`. **R3-F0/S3-V1 — Rendered Prototype Validation** resta valido come harness tecnico/accessibilità. La HUMAN PRODUCT REVIEW ha portato a **R3-F0/S3-V2 — Atlas Product Experience Prototype**. In V2 sono ora integrati **F0 Foundation**, **F1 Curricolo verticale d’istituto + Materiali pubblici di base**, **F2 Esplora relazionale** e **F3 Materiali+Risorse**; F2 include XYFlow/React Flow, zoom semantico, filtri, pannello contestuale, Mappa/Elenco equivalente e layout mobile dedicato. F3 è integrato in Curriculum-Atlas con merge `2a0f88b64e5002197cceeb2f82b06a5efd1edaee`. Restano **F4 Mobile+LIM e F5 Exit**. S3 resta ACTIVE fino alla chiusura verificata di V2. Il target F3–F5 incorpora ora **Mockup V2 — Vision Alignment**: Atlas deve rendere visibile il passaggio dal curricolo a lezioni, materiali, attività e percorsi, senza creare una nuova roadmap o modificare i confini di autorità.

- information architecture pubblica;
- Visual Grammar of Curriculum;
- design token TRAMA/Atlas;
- primitive accessibili e component catalogue;
- target WCAG 2.2 AA;
- test automatici + verifica umana dell'accessibilità;
- prototipo di prodotto S3-V2 coerente con il target visuale Atlas approvato;
- frontend foundation con stack maturo e component system governato;
- POC di mappa 2D professionale evoluto in RelationCanvas navigabile;
- conservazione di Galaxy/Spatial come vista specialistica.

### R3-P2 / ATLAS-P2 — Curriculum pubblico

- vista per famiglie, studenti e comunità;
- progressione leggibile per annualità;
- schemi grafici coerenti con la semantica;
- provenance su richiesta;
- binding esplicito alle versioni Arena;
- nessuna seconda copia autorevole del curricolo.

### R3-P3 / ATLAS-P3 — Student Learning Hub

- selezione minimizzata del contesto;
- classe/grado e disciplina;
- sezione e data soltanto quando necessarie;
- vista per lezioni;
- vista per obiettivi;
- materiali pubblicabili.

### R3-P4 / ATLAS-P4 — Docente OS verso Atlas Publication

- anteprima;
- conferma esplicita;
- `LessonPublicationManifest`;
- `PublicationReceipt` distinta;
- binding Arena con `curriculumVersionRef`, `authorityState` e `authorityReceiptRef` quando applicabile;
- pubblicazione, aggiornamento e ritiro;
- controllo di versione e idempotenza;
- visibility/minimization policy;
- gate diritti/licenze;
- gate WCAG 2.2 AA con verifica automatica + umana;
- nessun dato personale studente;
- substrato asset Git-first secondo `ATLAS-MAT-PUB-01`: normalizzazione, manifest, commit, deploy, smoke test e receipt tecnica separati dalla decisione editoriale.

### R3-P5 / ATLAS-P5 — Smart Navigation

- Chiedi ad Atlas;
- navigazione per disciplina → annualità → nucleo → obiettivi → evidenze → risorse;
- “Segui il concetto” lungo la progressione verticale;
- prerequisiti, raccordi e relazioni interdisciplinari;
- Perspectives;
- semantic zoom;
- Visuale | Elenco.

### R3-P6 / ATLAS-P6 — Curriculum Health

- coverage;
- gap/overlap;
- readiness editoriale;
- eventuali esiti aggregati soltanto dopo distinta autorizzazione TRAMA.

## R4 Esperienza professionale guidata

Obiettivi generali R4:

- eliminazione del trasferimento quotidiano opaco;
- anteprima e conferma esplicita;
- avanzamento e risultato visibili;
- gestione di rifiuto, sostituzione e ripetizione;
- ricevuta comprensibile all'utente.

### R4-P1 — Officina materiali specialistica

Stato proposto: **HUMAN REVIEW REQUIRED / RUNTIME NOT AUTHORIZED**.

- Docente OS costruisce il brief didattico, non il rendering definitivo;
- ricerca Atlas e scelta **Riutilizza | Adatta | Crea nuova** prima della generazione;
- produzione con motore specialistico adeguato al tipo di artefatto;
- uso dei pattern/LO/design profile Atlas quando pertinenti;
- anteprima, confronto e modifica sotto controllo del docente;
- collegamento alla lezione soltanto dopo decisione docente;
- pubblicazione in Atlas separata e governata da `LessonPublicationManifest` / `PublicationReceipt`;
- riuso del publisher Git-first `ATLAS-MAT-PUB-01` come infrastruttura tecnica, senza attribuire capacità editoriale autonoma all'Officina;
- provenance, diritti/licenze, accessibilità e qualità editoriale come gate;
- nessuna pubblicazione o adozione automatica.


### R4-P2 — Professional Practice

Stato: **DESIGN AUTHORIZED / RUNTIME NOT AUTHORIZED**.

Obiettivo: consolidare Docente OS come ambiente di professionalità docente continua, mantenendo il docente come decisore e l'IA come capacità advisory.

Primo slice: **R4-P2/S1 — Reflective Lesson Continuity**.

- diario riflessivo strutturato collegato alle lezioni;
- distinzione tra osservazione, riflessione e decisione;
- continuità verso la preparazione successiva;
- collegamento contestuale con Conoscenza;
- assistente professionale contestuale teacher-editable;
- `KnowledgeResource != TeachingMaterial`;
- nessuna scrittura silenziosa;
- nessun nuovo runtime cross-product;
- DOS-A1 resta `RUNTIME_DEFERRED`.

La progettazione e la prototipazione `NO_RUNTIME` sono autorizzate in parallelo ai cantieri correnti. L'implementazione runtime richiede un gate distinto.

Riferimento: `docs/product/r4-p2-professional-practice.md`.

### TRAMA-SA-01 — TypeSafe semantic assurance pilot

Stato proposto: HUMAN REVIEW REQUIRED.

- provider semantico opzionale e advisory-only;
- nessuna nuova autorità e nessuna scrittura automatica;
- pre-gate deterministico obbligatorio;
- casi sintetici, pubblici o minimizzati e nessun dato personale;
- giudizi tipizzati usati per coerenza, evidenza e casi ambigui;
- revisione umana di ogni caso durante il pilota;
- soglie definite soltanto dopo calibrazione sul dominio;
- report finale con accordo umano, falsi passaggi, casi non decidibili, latenza, costo e failure mode;
- ogni eventuale integrazione runtime richiede una decisione TRAMA distinta.

Riferimenti: `TRAMA-ADR-009`, `docs/assurance/typesafe-semantic-assurance.md`, `docs/pilots/trama-sa-01-typesafe.md`.

## R5 Preparazione all'adozione

- verifica del nome TRAMA;
- identità visiva accessibile;
- dossier di prodotto e protezione dati;
- modello di assistenza e formazione;
- stima dei costi e validazione della domanda;
- pilota di istituto.

## Gate di promozione ADR-007/008

**Gate soddisfatto nel pacchetto di promozione governata:** TRAMA-ADR-007 e TRAMA-ADR-008 sono portati ad `APPROVED` insieme all'aggiornamento di `docs/knowledge/source-registry.json`.

Il registro dichiara Atlas autorevole per identità/versione/stato delle proprie risorse e per pagine/pubblicazioni Atlas, versioni, stato editoriale e receipt. Restano invariati Arena come autorità del curricolo e Docente OS come autorità del contesto e delle decisioni professionali.

Questa promozione non cambia lo stato implementativo di R3-P4: il runtime Docente OS → Atlas resta `NOT_IMPLEMENTED / NOT_AUTHORIZED_FOR_RUNTIME`.

`DOS-A1` può cambiare stato soltanto mediante una decisione esplicita successiva alle evidenze del pilota.


## Sequenza operativa trasversale — Piano atomico

Il piano dettagliato è in [docs/strategy/atomic-operating-plan-2026-09-22.md](docs/strategy/atomic-operating-plan-2026-09-22.md).

La roadmap deve essere letta con questa priorità:

1. chiusura verificata di ECO-02/P1;
2. chiusura R3-F0/S3;
   - in parallelo è consentita la sola progettazione NO_RUNTIME di R4-P2/S1 Professional Practice;
3. R3-P2 Curriculum pubblico;
4. R3-P5 Smart Navigation;
5. continuità d'esperienza Docente OS ↔ Arena ↔ Atlas senza rendere Atlas un passaggio obbligatorio;
6. R4-P1 Officina materiali;
7. R3-P3 Learning Hub;
8. R3-P4 solo dopo superfici Atlas mature e nuova autorizzazione;
9. R3-P6 Curriculum Health;
10. identità prodotto, adozione e pilota di istituto.

### Regola di portafoglio

Un nuovo cantiere non deve essere promosso soltanto perché tecnicamente possibile. Prima devono essere disponibili, per il cantiere precedente:

- evidenza automatica;
- evidenza runtime quando pertinente;
- verifica umana;
- decisione di promozione;
- aggiornamento della documentazione canonica.

Questa regola serve a ridurre rilavorazioni, duplicazioni, regressioni già note e consumo di risorse dovuto a problemi ripetuti.

### Nota architetturale

La sequenza di investimento non trasforma i prodotti in una pipeline. Restano distinti i quattro flussi governati tra Arena, Atlas e Docente OS. In particolare, Arena → Docente OS resta necessario e Atlas resta opzionale rispetto alla preparazione ordinaria del docente.
