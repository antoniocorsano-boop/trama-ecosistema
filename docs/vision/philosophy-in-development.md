# TRAMA — Filosofia in sviluppo

**Data di prima formalizzazione:** 23 settembre 2026  
**Stato:** LIVING DOCUMENT / NON NORMATIVE UNLESS EXPLICITLY MARKED  
**Perimetro:** TRAMA · Arena · Atlas · Docente OS

## 1. Scopo

TRAMA dispone già di decisioni, contratti, roadmap, stato, architettura e documenti di prodotto. Questi artefatti descrivono soprattutto **che cosa è stato deciso**.

Questo documento conserva invece:
- perché una direzione è stata scelta;
- quale problema si stava cercando di risolvere;
- quali alternative sono state escluse;
- quali frasi hanno sintetizzato una svolta concettuale;
- quali principi sono diventati invarianti;
- quali idee restano ipotesi da validare.

Non sostituisce ADR, contratti o governance. Quando una frase o un principio diventa vincolante, deve essere promosso nel documento normativo appropriato.

## 2. Visione di fondo

TRAMA nasce per ricomporre una frattura tipica del lavoro scolastico:

**curricolo → progettazione → lezione → materiali → esperienza dello studente**

spesso distribuiti in strumenti, documenti e momenti separati.

La vision è rendere questo percorso continuo e verificabile, senza trasformarlo in una catena automatica e senza spostare l'autorità dalle persone e dagli organi competenti al software.

### V1 — Visione sintetica

> **TRAMA trasforma il curricolo verticale dell'istituto in un sistema operativo didattico: Arena ne custodisce l'autorità, Docente OS lo traduce nell'azione professionale del docente, Atlas lo rende pubblico attraverso navigazione, materiali e attività di apprendimento accessibili.**

**Contesto:** ricostruzione della vision durante ATLAS-PERCHÉ, 23 settembre 2026.  
**Significato:** sintetizza il passaggio da tre prodotti separati a un ecosistema coerente per autorità, azione professionale e fruizione pubblica.  
**Stato:** DIRECTIONAL PRINCIPLE.  
**Nota:** “sistema operativo didattico” è una metafora di prodotto, non una definizione tecnica.

## 3. Tre responsabilità, una sola continuità

### V2 — Ruoli

> **Arena → definisce e autorizza**  
> **Docente OS → prepara e adatta**  
> **Atlas → pubblica, organizza e rende fruibile**

**Contesto:** chiarimento del ruolo dei tre prodotti durante la ricostruzione della vision.  
**Stato:** CONSISTENT WITH APPROVED GOVERNANCE.

La sintesi va letta insieme agli invarianti:
- Arena resta autorità curricolare;
- Docente OS resta il luogo della decisione professionale;
- Atlas resta la superficie pubblica, navigabile ed editoriale per le proprie risorse e pubblicazioni;
- TRAMA governa contratti e confini;
- Atlas non è un passaggio obbligatorio tra Arena e Docente OS.

## 4. Dal documento statico al curricolo vivo

### V3 — Curricolo vivo

> **Il curricolo non deve restare un documento statico: deve diventare una struttura viva che orienta progettazione docente, materiali, lezioni e percorsi di apprendimento pubblici.**

**Contesto:** ricostruzione della vision, 23 settembre 2026.  
**Stato:** DIRECTIONAL PRINCIPLE.

Il curricolo acquisisce valore operativo quando può:
- orientare una preparazione;
- collegarsi a una lezione reale;
- rendere visibili progressioni e raccordi;
- essere attraversato da materiali e attività;
- restare comprensibile anche fuori dal workspace professionale;
- mantenere provenance e autorità verificabili.

## 5. Il docente resta al centro

### V4 — Promessa di valore

> **Dal curricolo alla lezione, con il docente sempre al controllo.**

**Contesto:** strategia di prodotto TRAMA.  
**Stato:** PRODUCT PROMISE / DA VALIDARE ESTERNAMENTE.

### V5 — Separazione tra proposta e decisione

> **La proposta automatica non equivale ad adozione; la generazione non equivale ad approvazione; la pubblicazione non equivale ad approvazione curricolare.**

**Contesto:** sintesi trasversale dei confini Arena / Docente OS / Atlas.  
**Stato:** GOVERNANCE PRINCIPLE.

## 6. Atlas non è una biblioteca di file

Atlas è il luogo pubblico in cui la struttura curricolare può essere compresa, esplorata, attraversata e collegata a lezioni, materiali e attività.

### V6 — Atlas integrale

> **La biblioteca è una dimensione di Atlas, non la definizione di Atlas.**

**Contesto:** TRAMA-ATLAS-01, addendum Atlas integrale.  
**Stato:** APPROVED GOVERNANCE PRINCIPLE.

### V7 — Superficie pubblica e didattica

> **Atlas non deve evolvere come semplice collezione di card o come visualizzazione del curricolo: deve diventare la superficie pubblica e didattica dell'ecosistema.**

**Contesto:** TRAMA-ATLAS-01.  
**Stato:** APPROVED PRODUCT DIRECTION.

## 7. Dai materiali alle attività

Il lavoro F3 Materiali + Risorse ha fatto emergere una domanda nuova:

> **Un materiale Atlas può essere non soltanto un file, ma un'attività interattiva, pubblica, offline, curricolarmente collegata e priva di account?**

**Contesto:** nascita di ATLAS-PERCHÉ.  
**Stato:** RESEARCH QUESTION.

Ne deriva una possibile scala dei contenuti Atlas:

1. **Risorsa semplice** — immagine, PDF, infografica, slide, video, link;
2. **Materiale di lezione** — insieme organizzato di risorse;
3. **Attività didattica** — esperienza guidata con mosse cognitive e fasi;
4. **Percorso di apprendimento** — sequenza di attività collegata al curricolo.

### V8 — Estensione F3

> **Atlas pubblica materiali → Atlas può pubblicare anche attività didattiche eseguibili.**

**Contesto:** relazione tra F3 e ATLAS-PERCHÉ.  
**Stato:** PRODUCT HYPOTHESIS / DA VALIDARE.

## 8. “Perché?” come caso pilota, non come deviazione

ATLAS-PERCHÉ non nasce come prodotto autonomo. Nasce come reference implementation per verificare se Atlas può ospitare attività curricolarmente collegate, pubbliche, senza credenziali, progressive per età, fruibili su LIM e dispositivi, offline e accessibili.

### V9 — Ruolo di ATLAS-PERCHÉ

> **“Perché?” non è principalmente un progetto separato sul pensiero critico: è il primo laboratorio con cui verifichiamo una Learning Activity nativa di Atlas.**

**Contesto:** riallineamento di ATLAS-PERCHÉ con la roadmap complessiva.  
**Stato:** CONTEXTUAL PRODUCT PRINCIPLE.

### V10 — Significato del prototipo offline

> **Il test offline non è il fine: è una verifica infrastrutturale per capire se una nuova categoria di materiale può esistere davvero in Atlas.**

**Contesto:** lavoro sul prototipo ATLAS-PERCHÉ.  
**Stato:** IMPLEMENTATION CONTEXT.

## 9. Tecnologia che restituisce attenzione al mondo

### V11 — Riduzione dello schermo

> **Lo schermo deve poter dire: adesso smetti di guardarmi e vai a osservare, misurare, costruire, discutere o esplorare.**

**Contesto:** progettazione della grammatica ATLAS-PERCHÉ.  
**Stato:** DESIGN PRINCIPLE / DA VALIDARE PER FASCIA.

Il digitale deve poter innescare, orientare e poi lasciare spazio al mondo reale.

## 10. Privacy come forma del prodotto

### V12 — Priorità privacy

> **Privacy by design e data minimization precedono personalizzazione, analytics e convenience.**

**Contesto:** TRAMA-ATLAS-01.  
**Stato:** APPROVED ARCHITECTURAL PRINCIPLE.

### V13 — Confine dello Student Learning Hub

> **Se una risorsa richiede identità individuale per essere fruita, non appartiene allo Student Learning Hub pubblico di Atlas.**

**Contesto:** TRAMA-ATLAS-01.  
**Stato:** APPROVED PRODUCT BOUNDARY.

## 11. La forma segue la relazione educativa

### V14 — Visual Grammar

> **La forma grafica deve derivare dal tipo di relazione educativa, non da un template estetico generico.**

**Contesto:** Visual Grammar of Curriculum.  
**Stato:** APPROVED DESIGN PRINCIPLE.

## 12. Riutilizzare prima di produrre

### V15 — Officina materiali

> **Riutilizza → Adatta → Crea nuova.**

**Contesto:** Officina materiali.  
**Stato:** APPROVED OPERATING PRINCIPLE.

La generazione entra soltanto quando riuso e adattamento non sono sufficienti.

## 13. Il successo non coincide con il numero di feature

### V16 — Priorità di prodotto

> **Stabilità reale → Atlas utile → continuità d'esperienza → qualità dei materiali → adozione.**

**Contesto:** principio operativo del 22 settembre 2026.  
**Stato:** APPROVED STRATEGIC PRIORITY.

### V17 — Criterio di successo

> **Il criterio di successo non è il numero di funzioni implementate, ma la capacità del docente di completare un percorso reale dal contesto curricolare alla lezione con meno attrito, senza duplicazioni, senza write silenziose e senza interventi tecnici.**

**Contesto:** strategia di prodotto.  
**Stato:** APPROVED OPERATING CRITERION.

Principio complementare emergente lato studente:

> **Una funzione Atlas ha valore se rende più accessibile un'esperienza di apprendimento senza trasformare lo studente in una fonte di dati.**

**Stato:** EMERGING PRINCIPLE.

## 14. La continuità non è una pipeline di autorità

### V18 — Continuità senza fusione

> **TRAMA deve collegare i prodotti senza fondere le loro autorità.**

**Contesto:** sintesi della governance ECO-00 / TRAMA-ATLAS-01.  
**Stato:** GOVERNANCE INVARIANT.

I flussi Arena → Atlas, Arena → Docente OS, Atlas → Docente OS e Docente OS → Atlas restano distinti.

## 15. Dalla generazione alla qualità verificabile

### V19 — Generazione subordinata

> **La capacità generativa è subordinata alla qualità didattica, alla provenienza, ai diritti, all'accessibilità e alla decisione umana.**

**Contesto:** materiali, Officina e pubblicazione.  
**Stato:** CROSS-PRODUCT DESIGN PRINCIPLE.

La traiettoria desiderata è:

**contesto → bisogno → riuso → adattamento/generazione → revisione → uso → eventuale pubblicazione**

## 16. Filosofia della verifica

- una decisione non è una implementazione;
- una implementazione non è un deploy verificato;
- un deploy non è una esperienza valida;
- un test automatico non sostituisce il collaudo umano;
- un pilot non dimostra da solo efficacia educativa.

### V20 — Assurance

> **Automatizzare la verifica dove possibile; mantenere umana la decisione dove conta.**

**Stato:** EMERGING ASSURANCE PRINCIPLE.

## 17. Filosofia ATLAS-PERCHÉ

La grammatica cognitiva è:

**SCOPRI → OSSERVA → DOMANDA → IPOTIZZA → CERCA → METTI ALLA PROVA → SPIEGA → CONTROLLA → RIFLETTI → RIAPRI**

La finalità non è chiedere “perché?” all'infinito, ma sviluppare persistenza epistemica fino a quando lo studente, in modo appropriato all'età:
- sa spiegare con parole proprie;
- sa usare o applicare la spiegazione;
- sa indicare l'evidenza che la sostiene;
- sa riconoscere ciò che non è ancora compreso.

### V21 — Comprensione come stato riapribile

> **Capire non significa arrivare a una risposta finale; significa arrivare a una spiegazione sufficientemente buona da poter essere usata, controllata e riaperta.**

**Contesto:** filosofia cognitiva di ATLAS-PERCHÉ.  
**Stato:** PEDAGOGICAL DIRECTION / DA VALIDARE.

## 18. Registro sintetico

| ID | Sintesi | Contesto | Stato |
| --- | --- | --- | --- |
| V1 | TRAMA come sistema operativo didattico | vision | directional |
| V2 | Arena definisce · DOS prepara · Atlas pubblica | ruoli | governance-consistent |
| V3 | curricolo vivo | curriculum | directional |
| V4 | docente sempre al controllo | product promise | da validare |
| V5 | proposta ≠ adozione; generazione ≠ approvazione | confini | governance |
| V6 | biblioteca ≠ definizione di Atlas | Atlas integrale | approved |
| V7 | Atlas superficie pubblica e didattica | ruolo Atlas | approved |
| V8 | materiali → attività eseguibili | F3 | hypothesis |
| V9 | Perché? come primo laboratorio Atlas | ATLAS-PERCHÉ | contextual |
| V10 | offline come mezzo, non fine | prototipo | context |
| V11 | lo schermo rimanda al mondo reale | UX didattica | design |
| V12 | privacy prima di personalization/analytics | privacy | approved |
| V13 | identità individuale fuori dallo Student Hub pubblico | boundary | approved |
| V14 | forma grafica dalla relazione educativa | design | approved |
| V15 | Riutilizza → Adatta → Crea nuova | materiali | approved |
| V16 | stabilità → utilità → continuità → qualità → adozione | strategia | approved |
| V17 | successo ≠ numero di feature | strategia | approved |
| V18 | collegare senza fondere autorità | governance | invariant |
| V19 | generazione subordinata a qualità e decisione | AI/materiali | design |
| V20 | verifica automatica, decisione umana | assurance | emerging |
| V21 | comprensione usabile, controllabile, riapribile | pedagogia | directional |

## 19. Regola di manutenzione

Quando emerge una nuova frase o un principio che cambia la comprensione del prodotto:

1. registrarlo qui con data e contesto;
2. classificarlo come INVARIANT, APPROVED PRINCIPLE, DIRECTIONAL PRINCIPLE, EMERGING PRINCIPLE, PRODUCT HYPOTHESIS o RESEARCH QUESTION;
3. collegarlo al documento operativo o normativo interessato;
4. non trasformare una buona formulazione in regola vincolante senza review;
5. promuoverlo in ADR, contratto o governance quando diventa normativo.

## 20. Collegamenti

- [Strategia di prodotto](./product-strategy.md)
- [TRAMA-ATLAS-01](../product/atlas-public-curriculum-learning-hub.md)
- [ATLAS-PERCHÉ-01](../product/atlas-perche-verticale.md)
- [Matrice ATLAS-PERCHÉ 3–14](../product/atlas-perche-matrice-3-14.md)
- [Cinque pilot](../product/atlas-perche-five-pilots.md)
- [Protocollo pilot](../product/atlas-perche-pilot-protocol.md)
- [Piano operativo atomico](../strategy/atomic-operating-plan-2026-09-22.md)

## 21. Criterio di conservazione della filosofia

Questo documento deve consentire, anche a distanza di tempo, di rispondere a quattro domande:

1. **Che cosa stavamo cercando di costruire?**
2. **Perché abbiamo scelto questa direzione?**
3. **Quali principi volevamo proteggere mentre il sistema cresceva?**
4. **Quali idee erano invarianti, quali decisioni e quali semplici ipotesi?**

Se queste quattro risposte restano ricostruibili, la filosofia del prodotto non viene persa mentre cambia l'implementazione.
