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

3. La **prima modalità di distribuzione preferita** riusa il confine di autenticazione professionale già presente in Docente OS e rende Studio Atlas accessibile come modalità distinta, ad esempio:
   `Docente OS → Crea → Studio Atlas`.

4. Questa scelta di distribuzione **non assegna a Docente OS la proprietà semantica del dominio Studio Atlas**. Il Percorso resta un prodotto riutilizzabile, non un oggetto di classe/lezione.

5. Studio Atlas deve essere **separabile** in futuro come applicazione autonoma senza modificare:
   - Pathway Authoring Package;
   - ruoli/authority;
   - workflow di storytelling;
   - Atlas runtime;
   - Arena authority.

6. Atlas pubblico **non acquisisce un login professionale/editor amministrativo** come requisito dell'authoring.

7. Il contratto di handoff principale di Studio Atlas è il **Pathway Authoring Package**, distinto da:
   - LessonPublicationManifest;
   - PublicationReceipt;
   - runtime authorization.

8. Repository, CI, AI, Visual Factory e compute provider sono infrastruttura subordinata e devono risultare invisibili nel journey ordinario del creator.

9. La produzione visuale/interattiva usa richieste asincrone provider-independent. Mancanza di compute non blocca story/world/scene authoring e non autorizza downgrade qualitativo o acquisto automatico.

10. L'azione umana **Invia per pubblicazione** produce un `PUBLISH_CANDIDATE`, non pubblicazione immediata.

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

### C. Studio Atlas separabile con adapter di identità

**SELECTED DIRECTION.**

La UI può iniziare embedded per ridurre costi e duplicazioni, mantenendo un confine di prodotto autonomo.

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
