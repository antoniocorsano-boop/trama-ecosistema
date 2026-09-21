# Flussi dei dati

## Principio

I quattro flussi tra Arena, Atlas e Docente OS sono **distinti per autorità, payload e finalità**. Nessun flusso può essere usato come scorciatoia per assorbire il ruolo di un altro prodotto.

## Flussi consentiti e proposti

| Flusso | Finalità | Contenuto minimo | Autorità preservata | Stato |
| --- | --- | --- | --- | --- |
| **Arena → Atlas** | proiezione pubblicabile del curricolo | riferimenti/versione Arena, relazioni pubblicabili, stato e provenance | Arena resta fonte curricolare; Atlas pubblica una proiezione non sostitutiva | consentito secondo stato editoriale |
| **Arena → Docente OS** | baseline curricolare per il lavoro professionale | curricolo, applicabilità, stato, impronta, provenienza, riferimenti di autorità | Arena resta fonte curricolare; Docente OS conserva il contesto docente | consentito, esplicito e verificabile |
| **Atlas → Docente OS** | proposta di LO e materiali | identificativo, versione, stato, accesso, provenance della risorsa | Atlas è fonte della risorsa; il docente decide uso/adattamento/esclusione | consentito come proposta, mai adozione automatica |
| **Docente OS → Atlas** | pubblicazione didattica esplicita | `LessonPublicationManifest` minimizzato, binding Arena, riferimenti LO/materiali, visibilità | Docente OS decide; Atlas governa solo lo stato della pubblicazione; Arena resta fonte del curricolo | **APPROVED_CONTRACT / NOT_IMPLEMENTED / NOT_AUTHORIZED_FOR_RUNTIME** |

La risposta Atlas all'ultimo flusso è una `PublicationReceipt`, distinta dal `LessonPublicationManifest`; certifica l'esito dell'operazione Atlas e non crea un nuovo canale curricolare.

## 1. Arena → Atlas

Scopo:
- rendere il curricolo approvato comprensibile e navigabile;
- alimentare relazioni pubbliche tra curricolo, percorsi e risorse.

Vincoli:
- ogni proiezione deve conservare `curriculumVersionRef`, stato di autorità e provenance;
- Atlas non può promuovere una copia a fonte curricolare;
- eventuali testi duplicati sono rappresentazioni derivate, non autorità indipendente.

## 2. Arena → Docente OS

Scopo:
- fornire la baseline curricolare autorevole usata nella preparazione e nella progettazione.

Vincoli:
- trasferimento esplicito e verificabile;
- baseline persistente per classe + disciplina + anno scolastico + versione;
- cambi significativi devono essere rivalidabili;
- nessun trasferimento equivale automaticamente ad approvazione del lavoro docente.

## 3. Atlas → Docente OS

Scopo:
- proporre Learning Object e materiali alla preparazione della lezione.

Vincoli:
- identità/versione/provenance della risorsa sempre disponibili;
- il docente può accettare, modificare, sostituire o escludere;
- la risorsa non riceve il contesto completo della classe;
- proposta, uso e pubblicazione restano eventi distinti.

Riferimento:
`docs/contracts/atlas-docente-os.md`.

## 4. Docente OS → Atlas — pubblicazione didattica

Stato: **APPROVED_CONTRACT / NOT_IMPLEMENTED / NOT_AUTHORIZED_FOR_RUNTIME**.

Contenuto minimo:
- `LessonPublicationManifest` versionato;
- `operation` e `idempotencyKey`;
- riferimenti a LO e materiali;
- `curriculumBinding` verso Arena con `curriculumVersionRef`, `authorityState` e `authorityReceiptRef` quando applicabile;
- riferimenti agli obiettivi Arena, senza duplicarne una seconda copia autorevole;
- contesto scolastico solo nella misura autorizzata dalla policy di minimizzazione;
- titolo, sintesi per studenti, visibilità e provenance.

Condizioni:
- anteprima prima della pubblicazione;
- conferma esplicita del docente;
- nessun dato personale studente;
- gate diritti/licenze;
- gate accessibilità con target WCAG 2.2 AA e controlli automatici + umani;
- aggiornamento e ritiro reversibili;
- controllo di versione;
- idempotenza;
- nessuna autorità curricolare trasferita ad Atlas.

Esito:
- Atlas restituisce una `PublicationReceipt` distinta dal manifest;
- la receipt contiene stato, versione Atlas ed eventuali motivi di rifiuto;
- la receipt non certifica approvazione curricolare o istituzionale.

Riferimento:
`docs/contracts/docente-os-atlas-publication.md`.

## Policy di minimizzazione per la pubblicazione

- `grade`: ammesso come contesto didattico;
- `schoolYear`: incluso solo quando necessario;
- `sectionScope`: **omesso per impostazione predefinita**;
- `lessonDate`: **omessa per impostazione predefinita**; preferire una sequenza/etichetta;
- identificativi interni di classe, registro o calendario: non pubblicabili;
- ogni livello di visibilità deve essere realmente applicato prima del runtime.

## Dati che non attraversano i confini

- nomi e dati degli studenti;
- identificativi personali degli studenti;
- annotazioni personali del docente;
- diario completo della classe;
- calendario dettagliato non necessario;
- credenziali e segreti;
- dati di valutazione individuale.

## Errori e indisponibilità

Un trasferimento o una pubblicazione deve rendere visibili almeno:

- avvio;
- elemento selezionato;
- provenienza;
- avanzamento;
- esito;
- errore comprensibile;
- possibilità di ripetere, sostituire o annullare quando semanticamente ammesso.

## Esiti aggregati verso Atlas

Stato: **DEFERRED / NOT_AUTHORIZED**.

Un futuro `OutcomeAggregateSnapshot` potrà essere valutato soltanto dopo distinta decisione TRAMA, privacy review e definizione di soglie di aggregazione adeguate. Non sono ammessi esiti individuali, ranking del docente, ranking della classe o score sintetici della scuola.
