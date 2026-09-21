# Contratto Docente OS verso Atlas — pubblicazione didattica

**Stato:** PROPOSED
**Data:** 21 settembre 2026
**Scope:** Docente OS → Atlas
**Decisione collegata:** TRAMA-ADR-008

## Scopo

Consentire al docente di pubblicare in Atlas contenuti e materiali già preparati nel proprio workspace professionale, senza duplicare l'editor didattico e senza trasferire dati personali degli studenti.

## Principio

**preparazione ≠ pubblicazione**

La preparazione resta in Docente OS.
La pubblicazione richiede una decisione esplicita del docente.
Atlas riceve soltanto il minimo necessario per rappresentare la lezione e i materiali pubblicabili.

## Flusso target

Docente OS
→ anteprima di pubblicazione
→ conferma docente
→ LessonPublicationManifest
→ Atlas
→ pagina pubblicata/versionata

Azioni successive ammesse:
- aggiornare;
- sostituire;
- ritirare.

## Campi minimi proposti

- publicationId;
- sourceLessonRef;
- schoolYear;
- grade;
- sectionScope opzionale;
- discipline;
- sequenceOrDateLabel;
- title;
- learningObjectives;
- curriculumRefs;
- learningObjectRefs;
- materialRefs;
- summaryForStudents;
- visibility;
- publicationVersion;
- sourceDocenteOsRef;
- provenance;
- publishedAt;
- withdrawnAt opzionale.

## Vincoli

Non devono transitare:
- nomi studenti;
- identificativi personali studenti;
- valutazioni individuali;
- annotazioni personali del docente;
- diario completo;
- calendario personale o non necessario;
- credenziali;
- segreti.

## Autorità

Docente OS:
- decide se pubblicare;
- decide cosa includere tra i contenuti pubblicabili;
- mantiene il contesto professionale completo.

Atlas:
- conserva identità e versione della pubblicazione;
- rende la pubblicazione navigabile;
- collega la pubblicazione a curricolo, obiettivi, LO e materiali;
- consente ritiro/versionamento secondo il contratto.

Arena:
- resta autorevole per il curricolo e la sua applicabilità.

## Controllo umano

La pubblicazione non può essere implicita.
La conferma docente è obbligatoria.

Pubblicare non equivale a:
- approvazione curricolare;
- approvazione istituzionale;
- validazione automatica del materiale;
- adozione definitiva.

## Compatibilità

Il contratto non sostituisce Atlas → Docente OS, che continua a governare la proposta di risorse Atlas verso la preparazione.

Le due direzioni sono distinte:
- Atlas → Docente OS: proposta di risorsa;
- Docente OS → Atlas: pubblicazione didattica esplicita.

## Stato implementativo

**NOT_IMPLEMENTED / NOT_AUTHORIZED_FOR_RUNTIME**

L'adozione finale richiede:
- schema versionato;
- privacy review;
- security review;
- UX della preview/conferma;
- receipt;
- pilot umano;
- recepimento separato nei repository Atlas e Docente OS.
