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

Terzo incremento: **R3-F0/S3 — Journey Prototypes & 2D Map POC**. Il pacchetto statico è integrato con HUMAN EXACT-HEAD REVIEW PASS e `NO_RUNTIME`; restano PENDING le verifiche device/accessibilità che richiedono un prototipo renderizzato, quindi S3 non è ancora chiuso.

- information architecture pubblica;
- Visual Grammar of Curriculum;
- design token TRAMA/Atlas;
- primitive accessibili e component catalogue;
- target WCAG 2.2 AA;
- test automatici + verifica umana dell'accessibilità;
- prototipo di prodotto;
- POC di mappa 2D professionale;
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
- nessun dato personale studente.

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
- provenance, diritti/licenze, accessibilità e qualità editoriale come gate;
- nessuna pubblicazione o adozione automatica.


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
