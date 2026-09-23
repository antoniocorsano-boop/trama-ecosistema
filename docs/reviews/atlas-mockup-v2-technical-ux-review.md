# Review tecnica/UX indipendente — Atlas Mockup V2

**Data:** 23 settembre 2026  
**PR:** TRAMA #61  
**Scope:** specifica di design/UX, nessuna autorizzazione runtime

## Esito iniziale

**CHANGES REQUIRED**

Rilievo principale:
- la prima versione della specifica rischiava di trasformare la direzione futura `LearningActivity` in un requisito implicito per la chiusura R3-F0/S3-V2, ampliando F3–F5 senza decisione esplicita.

Rilievi secondari:
- gli shortcut Home potevano essere letti come nuova IA primaria, in conflitto con `Curricolo · Percorsi · Risorse · Esplora`;
- la presenza di Docente OS nelle superfici pubbliche andava limitata a progressive disclosure / viste ecosistema;
- `LearningIntent` andava distinto semanticamente dagli obiettivi curricolari autorevoli Arena;
- il contesto pubblico doveva esplicitare l'omissione predefinita di sezione, identificativi interni e data esatta.

## Correzioni applicate

1. aggiunto uno **Scope guard** esplicito;
2. confermato che F3/F4/F5 mantengono scope ed exit criteria già approvati;
3. ATLAS-PERCHÉ / LearningActivity resta reference implementation sperimentale e non nuovo exit criterion;
4. preservata l'IA canonica;
5. limitata la presenza Docente OS nelle superfici studente/pubbliche;
6. distinto `LearningIntent` dagli obiettivi Arena;
7. rafforzata la minimizzazione del contesto pubblico;
8. resi condizionali gli acceptance criteria relativi alle attività.

## Esito dopo correzione

**PASS WITH SCOPE PRESERVED**

La specifica è coerente con:
- Atlas Design System v1;
- R3-F0/S3-V2;
- TRAMA-ATLAS-01;
- filosofia in sviluppo;
- evoluzione della metafora atomica.

Non risultano:
- nuova authority;
- nuova roadmap;
- autorizzazione R3-P4;
- obbligo di runtime LearningActivity;
- account/tracking studente;
- inclusione del workspace Docente OS in Atlas.

La specifica può procedere alla review exact-head della PR #61.
