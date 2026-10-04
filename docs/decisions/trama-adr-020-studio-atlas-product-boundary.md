# TRAMA-ADR-020 — Studio Atlas come dominio di prodotto separabile per l'authoring dei Percorsi

**Stato:** PROPOSED / HUMAN_DIRECTION_APPROVED  
**Data:** 2026-10-04  
**Perimetro:** TRAMA · Arena · Atlas · Docente OS · Studio Atlas  
**Runtime:** NOT_AUTHORIZED

## Contesto

Il lavoro su Atlas Percorsi ha prodotto una catena di authoring sempre più completa:

`competenza → storytelling → mondo → esperienza → scene → produzione visuale → prova studente → revisione → candidato alla pubblicazione`.

I contratti esistenti stabiliscono già che:

- Arena resta l'autorità curricolare;
- Atlas è la superficie pubblica/didattica e l'autorità su identità/versione/stato delle proprie risorse;
- Docente OS è il workspace operativo professionale e possiede già autenticazione e contesto docente;
- Atlas non deve introdurre un secondo editor professionale concorrente;
- gli studenti usano Atlas senza autenticazione individuale.

Manca però una definizione esplicita del prodotto con cui professionisti creano nuovi Percorsi Atlas.

## Decisione proposta

1. **Studio Atlas** è definito come dominio di prodotto dedicato all'authoring professionale dei Percorsi Atlas.

2. Studio Atlas ha semantica e ciclo di vita propri. Non coincide con:
   - classe;
   - orario;
   - lezione;
   - Progetta;
   - Atlas pubblico;
   - repository Git;
   - Visual Factory.

3. Studio Atlas nasce come **applicazione standalone** con proprio dominio di authoring, proprio deploy e proprio ciclo di rilascio.

4. Docente OS è un **ingresso professionale privilegiato** tramite identità federata/condivisa e deep link, ad esempio:
   `Docente OS → Crea → Studio Atlas`.
   Una lezione o un materiale può creare un handoff minimizzato come seed.

5. La distribuzione standalone **non assegna a Studio Atlas la proprietà del dominio lezione**. Il Percorso resta un prodotto riutilizzabile, mentre Docente OS resta il luogo in cui il docente decide se e come usare Percorsi/materiali nella lezione.

6. Studio Atlas deve rimanere compatibile con identità professionale condivisa senza richiedere una seconda registrazione per utenti già autenticati.

7. Studio Atlas può evolvere senza modificare:
   - Pathway Authoring Package;
   - ruoli/authority;
   - workflow di storytelling;
   - Atlas runtime;
   - Arena authority.

8. Atlas pubblico **non acquisisce un login professionale/editor amministrativo** come requisito dell'authoring.

9. Il contratto di handoff principale di Studio Atlas è il **Pathway Authoring Package**, distinto da:
   - LessonPublicationManifest;
   - PublicationReceipt;
   - runtime authorization.

10. Repository, CI, AI, Visual Factory e compute provider sono infrastruttura subordinata e devono risultare invisibili nel journey ordinario del creator.

11. La produzione visuale/interattiva usa richieste asincrone provider-independent. Mancanza di compute non blocca story/world/scene authoring e non autorizza downgrade qualitativo o acquisto automatico.

12. L'azione umana **Invia per pubblicazione** produce un `PUBLISH_CANDIDATE`, non pubblicazione immediata.

## Motivazione

Questa separazione:

- evita un secondo account professionale in Atlas;
- evita di trasformare Docente OS in un CMS Atlas;
- protegge Atlas come prodotto pubblico privacy-first;
- consente a creator non legati a una classe specifica di creare Percorsi;
- rende l'authoring portabile;
- permette una futura applicazione Studio Atlas autonoma;
- mantiene Git/AI/GPU come dettagli infrastrutturali;
- preserva Human Review e authority esistenti.

## Alternative

### A. Editor professionale direttamente in Atlas

**REJECTED AS DEFAULT.**

Rischi:
- duplica autenticazione/workspace;
- mescola pubblico e backoffice;
- aumenta superficie privacy/security;
- contraddice la separazione già approvata tra Atlas pubblico e workspace professionale.

### B. Percorsi come funzione interna di Progetta/lezione in Docente OS

**REJECTED AS DOMAIN MODEL.**

Utile come ingresso/seed, ma insufficiente perché:
- un Percorso è riutilizzabile;
- può essere creato da profili non legati alla singola classe;
- ha story/world/visual production/review propri.

### C. Studio Atlas standalone con adapter di identità e integrazione privilegiata Docente OS

**SELECTED DIRECTION.**

Studio Atlas è un prodotto autonomo; Docente OS lo apre senza duplicare l'identità e può inviare/ricevere riferimenti minimizzati a Percorsi e materiali. La lezione resta governata da Docente OS.

## Impatto su controllo umano

**STRENGTHENED.**

- creator intent resta umano;
- story/quality/publication review restano umane;
- AI è assistente;
- compute è infrastruttura;
- pubblicazione richiede decisione esplicita sull'exact package digest.

## Compatibilità

La decisione:

- non attiva DOS-A1;
- non modifica Arena authority;
- non autorizza Atlas runtime;
- non implementa una nuova identità;
- non autorizza un nuovo servizio persistente;
- non richiede immediata estrazione di Studio Atlas da Docente OS.

## Artefatti collegati

- `CREATOR-STUDIO-PRODUCT-VISION-v0.1.md`
- `CREATOR-JOURNEY-v0.1.md`
- `PATHWAY-AUTHORING-PACKAGE-v0.1.md`
- `CREATOR-ROLES-AUTHORITY-v0.1.md`
- `STORYTELLING-FIRST-AUTHORING-CONTRACT-v1.md`
- `VISUAL-FACTORY-v0.1.md`

## Gate prima dell'implementazione UI sostanziale

1. Human Review della boundary di prodotto;
2. schema machine-readable del Pathway Authoring Package;
3. decisione sul draft storage;
4. definizione dell'identity adapter;
5. user journey mobile/desktop;
6. threat/privacy review del confine professionale;
7. prototipo thin-shell senza dipendenza dalla Visual Factory.


## Invariante di continuità della lezione

La scelta standalone non deve spezzare il circuito didattico.

Deve restare sempre possibile:

`Percorso/materiale Atlas → riferimento stabile → Docente OS → preparazione/lezione`

e, in senso opposto:

`lezione/materiale Docente OS → seed minimizzato → Studio Atlas`.

Studio Atlas non gestisce classe, orario o TeachingSession; Docente OS non diventa autorevole sul contenuto Atlas. L'implementazione dettagliata del binding è differita, ma l'invariante è vincolante.
