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

Stato proposto: HUMAN REVIEW REQUIRED.

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
- Perspectives;
- semantic zoom;
- Visuale | Elenco.

### R3-P6 / ATLAS-P6 — Curriculum Health

- coverage;
- gap/overlap;
- readiness editoriale;
- eventuali esiti aggregati soltanto dopo distinta autorizzazione TRAMA.

## R4 Esperienza professionale guidata

- eliminazione del trasferimento quotidiano opaco;
- anteprima e conferma esplicita;
- avanzamento e risultato visibili;
- gestione di rifiuto, sostituzione e ripetizione;
- ricevuta comprensibile all'utente.

## R5 Preparazione all'adozione

- verifica del nome TRAMA;
- identità visiva accessibile;
- dossier di prodotto e protezione dati;
- modello di assistenza e formazione;
- stima dei costi e validazione della domanda;
- pilota di istituto.

## Gate di promozione ADR-007

Quando TRAMA-ADR-007 sarà eventualmente promossa ad `APPROVED`, lo stesso pacchetto deve aggiornare `docs/knowledge/source-registry.json` per dichiarare Atlas autorità delle proprie pagine/pubblicazioni e del relativo stato editoriale, lasciando invariata Arena come autorità del curricolo e Docente OS come autorità del contesto professionale.

`DOS-A1` può cambiare stato soltanto mediante una decisione esplicita successiva alle evidenze del pilota.
