# TRAMA-ADR-010 — Atlas integrale e separazione dell'Officina materiali

**Stato:** APPROVED  
**Data:** 2026-09-22  
**Perimetro:** TRAMA · Arena · Atlas · Docente OS · Officina materiali  
**Runtime:** NOT AUTHORIZED

## Contesto

Le prove reali di preparazione delle lezioni mostrano due esigenze distinte: Atlas deve restare l'atlante integrale del curricolo e non ridursi a deposito di materiali; nello stesso tempo la produzione di artefatti didattici di qualità richiede motori specialistici e non deve essere caricata sul renderer interno di Docente OS.

## Decisione approvata

1. **Atlas integrale** è la superficie di visualizzazione e navigazione intelligente del curricolo: mappa curricolare, progressioni, percorsi, prerequisiti, relazioni, ricerca semantica, Student Learning Hub, Learning Object e risorse pubblicate.
2. La biblioteca educativa è un dominio di Atlas, non la sua definizione complessiva.
3. **Docente OS** resta il workspace e l'orchestratore del lavoro docente: costruisce il contesto e il brief, presenta alternative e conserva la decisione umana; non è il motore grafico/editoriale generalista.
4. È introdotto come concetto architetturale **Officina materiali**, capacità specialistica di produzione di artefatti. Può utilizzare servizi/motori differenti e pattern/risorse Atlas, ma non possiede autorità curricolare, editoriale o professionale.
5. Prima di generare un nuovo artefatto si applica il principio **riusa prima di generare**: Atlas viene interrogato e il docente sceglie fra Riutilizza, Adatta e Crea nuova.
6. Un materiale collegato a una lezione in Docente OS non diventa automaticamente risorsa Atlas. La pubblicazione resta esplicita, versionata e reversibile attraverso `LessonPublicationManifest` e `PublicationReceipt`.
7. Ogni materiale candidato alla pubblicazione deve mantenere provenance e superare i gate applicabili di coerenza didattica, qualità editoriale, accessibilità, diritti/licenze e revisione umana.

## Confini

- Arena resta l'unica autorità curricolare.
- Atlas non intermedia il percorso autorevole Arena → Docente OS.
- L'Officina materiali non approva il curricolo e non pubblica autonomamente.
- Docente OS non converte una generazione in adozione senza decisione del docente.
- Nessun dato personale studente è richiesto dalla capacità di produzione.
- `DOS-A1` resta `RUNTIME_DEFERRED`.

## Flusso target

`Arena → contesto curricolare → Docente OS → ricerca/riuso Atlas → brief → Officina materiali → revisione docente → lezione → eventuale pubblicazione Atlas`

## Impatto sul controllo umano

**STRENGTHENED.** Il docente sceglie se riusare, adattare, generare, adottare, sostituire, scartare e pubblicare.

## Stato implementativo

Questa ADR è approvata come decisione di governance sulla separazione dei ruoli e sul modello target. Non autorizza API, provider, dipendenze, persistenze, automazioni o pubblicazione runtime. Ogni implementazione richiede slice, gate ed exact-head review dedicati.

## Evidenza di approvazione

- PR: #26
- exact head sottoposto a review umana: `ac2f40865115a27912e0e0edc3776eba37f50370`
- esito: HUMAN REVIEW — PASS
- merge commit: `9d08a1d3382e1491da242157ee2c0d598e3b49fe`

L'approvazione riguarda la decisione architetturale. **Runtime Officina materiali, pubblicazione automatica e DOS-A1 restano non autorizzati.**
