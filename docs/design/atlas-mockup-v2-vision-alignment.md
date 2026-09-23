# Atlas Mockup V2 — Vision Alignment Specification

**Data:** 23 settembre 2026  
**Stato:** DESIGN DIRECTION / IMPLEMENTATION SPEC / NO_RUNTIME_AUTHORIZATION  
**Parent:** R3-F0/S3-V2 — Atlas Product Experience  
**Riferimenti:** Atlas Design System v1 · Filosofia in sviluppo · Evoluzione metafora atomica · TRAMA-ATLAS-01 · ATLAS-PERCHÉ

## 1. Scopo

Questa specifica traduce la vision TRAMA consolidata nel target visuale e interattivo del prossimo mockup Atlas.

Non crea un secondo design system e non modifica i confini di autorità.

Il mockup V2 deve rendere visibile una evoluzione precisa:

> **da rappresentazione di struttura a rappresentazione di trasformazione educativa.**

La UI deve continuare a mostrare Arena, Atlas e Docente OS come domini distinti, ma deve anche rendere percepibile il percorso con cui il curricolo diventa:
- comprensione;
- preparazione;
- lezione;
- materiale;
- attività;
- esperienza di apprendimento.

## 2. Principio guida

> **TRAMA non collega soltanto prodotti; mette in movimento il curricolo.**

Nel mockup questo principio non va rappresentato con una pipeline lineare.

Deve emergere attraverso:
- relazioni non obbligatorie;
- progressive disclosure;
- contesto curricolare sempre riconoscibile;
- passaggi tra conoscenza, materiali e attività;
- apertura di Atlas verso l'esperienza pubblica e reale.

## 3. Semantica visuale dei domini

### Arena — autorità e struttura

Arena deve apparire come:
- fonte;
- provenienza;
- versione;
- stato curricolare;
- riferimento autorevole.

Deve essere riconoscibile senza invadere l'esperienza Atlas.

Pattern:
- provenance badge;
- source panel;
- breadcrumb curricolare;
- version/status disclosure.

Non usare Arena come destinazione primaria dello studente.

### Docente OS — trasformazione professionale

Nel mockup Atlas pubblico Docente OS non diventa una superficie operativa.

Quando necessario va rappresentato come:
- origine della decisione editoriale;
- contesto di preparazione;
- riferimento alla decisione del docente.

Non mostrare azioni professionali Docente OS come se fossero disponibili allo studente.

### Atlas — membrana pubblica

Atlas deve essere la parte dell'ecosistema che si apre verso:
- studenti;
- classi;
- famiglie;
- LIM;
- tablet e smartphone;
- materiali;
- attività;
- mondo reale.

Formula visuale:

> **Atlas rende il curricolo visibile, accessibile e praticabile.**

## 4. Modello dei contenuti Atlas

Il mockup deve distinguere chiaramente quattro classi:

### L1 — Risorsa

Esempi:
- immagine;
- PDF;
- slide;
- video;
- infografica;
- link.

### L2 — Materiale di lezione

Gruppo di risorse collegato a:
- classe/grado;
- disciplina;
- lezione;
- obiettivi.

### L3 — Attività didattica

Esperienza con:
- stimolo;
- sequenza;
- interazioni;
- fasi off-screen;
- eventuale stato locale;
- conclusione/riflessione.

### L4 — Percorso

Sequenza di attività/materiali collegata a:
- progressione;
- obiettivi;
- concetti;
- annualità.

Il mockup non deve presentare L1–L4 come semplici card equivalenti.

## 5. Home Atlas V2

La home non deve sembrare una dashboard SaaS.

Deve comunicare tre ingressi principali:

1. **Esplora il curricolo**
2. **Vai ai materiali della tua classe**
3. **Scopri percorsi e attività**

Hero:
- messaggio editoriale breve;
- ricerca;
- accesso immediato ai tre ingressi;
- elemento visuale della rete curricolare.

Evitare:
- KPI;
- statistiche decorative;
- widget amministrativi;
- account/avatar studente.

## 6. Curricolo

La vista Curricolo deve rendere esplicito che si tratta del **curricolo verticale di istituto**.

Struttura:
- istituto;
- ordine;
- area/dipartimento;
- disciplina;
- annualità;
- nucleo;
- obiettivo;
- raccordi;
- prerequisiti;
- risorse/attività collegate.

La progressione non va visualizzata come elenco piatto.

Pattern preferiti:
- progression rail;
- vertical river;
- matrix quando serve confronto;
- outline accessibile equivalente.

## 7. Esplora

Esplora deve essere la manifestazione più evidente della metafora evoluta.

Non una mappa decorativa, ma una rete navigabile in cui si percepisce:
- origine curricolare;
- progressione;
- connessioni;
- risorse;
- attività;
- percorsi.

Le entità devono avere gerarchie e forme differenti.

La selezione di un nodo deve poter mostrare:
- cosa rappresenta;
- da dove deriva;
- dove porta;
- materiali;
- attività;
- collegamenti.

Mappa ed elenco devono restare equivalenti.

## 8. Materiali

Journey pubblico principale:

**classe → disciplina → lezione → materiali**

La pagina deve distinguere:
- materiale;
- tipo;
- funzione nella lezione;
- accessibilità;
- licenza quando utile;
- azione primaria.

Una lezione deve apparire come unità didattica e non come cartella di file.

Pattern:
- lesson header;
- learning intent;
- material groups;
- attività;
- approfondimenti;
- provenance sotto progressive disclosure.

## 9. Attività

Nuovo pattern Atlas V2:

**LearningActivity**

Componenti minimi:
- titolo;
- obiettivo leggibile;
- durata indicativa;
- modalità Classe / Studente;
- stato offline quando disponibile;
- sequenza a fasi;
- step OFFSCREEN;
- feedback locale percepibile;
- nessun account richiesto.

Il player deve poter dire esplicitamente:

> **Ora lascia lo schermo.**

e offrire istruzioni per:
- osservare;
- misurare;
- costruire;
- discutere;
- esplorare.

Il ritorno all'attività deve essere semplice e non richiedere autenticazione.

## 10. Percorsi

I Percorsi devono rappresentare trasformazione nel tempo.

Pattern:
- timeline;
- learning journey;
- tappe;
- attività;
- risorse;
- concetti;
- obiettivi;
- collegamenti verticali.

Una sequenza non deve essere ridotta a una griglia di card.

## 11. La metafora atomica nella UI

La metafora atomica non va necessariamente mostrata in ogni pagina.

Deve diventare un principio di composizione:

- nuclei distinti;
- relazioni leggibili;
- nessuna fusione delle autorità;
- movimento tra forme della conoscenza;
- apertura verso l'esperienza.

Nel mockup istituzionale/di ecosistema può essere rappresentata esplicitamente con:
- Arena;
- Docente OS;
- Atlas;
- orbite governate;
- trasformazione curricolo → esperienza;
- apertura verso mondo reale.

## 12. Componenti da aggiungere al Design System

Senza creare un secondo design system, Atlas DS v1 va esteso con componenti Tier 2:

- LearningActivityCard
- LearningActivityPlayer
- ActivityStep
- OffscreenStep
- LearningJourney
- LessonHeader
- LearningIntent
- MaterialRoleBadge
- OfflineAvailability
- PublicContextSelector
- CurriculumBindingDisclosure

Tier 3:
- StudentHubLayout
- LessonPublicLayout
- LearningActivityLayout
- LearningJourneyLayout

## 13. Mobile

Mobile non è desktop ridotto.

Principi:
- una decisione primaria per schermata;
- contenuto lineare;
- filtri in sheet;
- bottom nav;
- step attività full-height quando utile;
- nessun canvas obbligatorio;
- elenco equivalente;
- stato offline visibile;
- touch target ≥44px;
- nessuna dipendenza da hover.

Journey minimo mobile:
**Home → Materiali → classe → disciplina → lezione → materiale/attività**

## 14. LIM

La LIM è un contesto di classe, non un desktop grande.

Modalità presentazione:
- tipografia più grande;
- densità ridotta;
- un concetto/step principale per schermata;
- controlli grandi;
- guide docente;
- attività Classe;
- prompt per discussione;
- step off-screen.

## 15. Feedback

Ogni write o azione persistente deve avere stato percepibile.

Per attività locali:
- salvato localmente;
- disponibile offline;
- errore;
- rimozione/reset quando previsto.

Nessuna write critica deve essere toast-only.

## 16. Privacy

Il mockup non deve mostrare:
- login studente;
- avatar personale;
- dashboard individuale;
- ranking;
- cronologia personale server-side;
- analytics individuale.

La selezione classe/disciplina è contesto pubblico, non identità.

## 17. Accessibilità

Target: WCAG 2.2 AA.

Ogni nuova superficie deve avere:
- tastiera;
- focus visibile;
- screen reader;
- reflow;
- riduzione movimento;
- contrasto;
- equivalente testuale per visualizzazioni complesse;
- niente informazione affidata solo al colore;
- istruzioni comprensibili.

## 18. Relazione con F3–F5

### F3 — Materiali + Risorse

Deve implementare:
- lesson-as-context;
- materiali organizzati per funzione;
- catalogo risorse;
- base per LearningActivity.

### F4 — Mobile + LIM

Deve validare:
- Student Hub;
- attività;
- off-screen;
- offline;
- responsive reale.

### F5 — Exit

La review finale deve verificare anche:
- coerenza con la metafora evoluta;
- chiarezza del percorso curricolo → esperienza;
- assenza di segnali visivi che confondano le authority;
- Student Hub senza account;
- attività non ridotte a semplici file/card.

## 19. Non obiettivi

Questa specifica non autorizza:
- R3-P4 runtime;
- pubblicazione automatica;
- account studenti;
- tracking individuale;
- DOS-A1;
- analytics personali;
- trasferimento di autorità da Arena;
- editor professionale Docente OS dentro Atlas.

## 20. Acceptance criteria del mockup V2

Il mockup è coerente con la vision quando un osservatore può capire, senza spiegazione tecnica, che:

1. Atlas appartiene a un ecosistema ma ha un ruolo distinto;
2. il curricolo è verticale e navigabile;
3. il curricolo conduce a lezioni, materiali e attività;
4. i materiali non sono solo una biblioteca di file;
5. alcune attività portano fuori dallo schermo;
6. lo studente non deve creare un account;
7. il docente resta il decisore professionale;
8. Arena resta la fonte curricolare;
9. mobile e LIM sono esperienze progettate;
10. la UI mostra continuità senza suggerire automazione incontrollata.
