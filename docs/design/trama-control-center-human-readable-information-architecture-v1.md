# TRAMA Control Center — Human-readable Information Architecture v1

**Stato:** PROPOSED / PRODUCT-UX ANALYSIS / NO RUNTIME CHANGE  
**Data:** 2026-09-29  
**Perimetro:** TRAMA Control Center pubblico e superfici specialistiche  
**Authority:** nessuna nuova authority  
**Runtime:** invariato / READ_ONLY  
**DOS-A1:** RUNTIME_DEFERRED

## 1. Problema da risolvere

Il Control Center nasce per rendere comprensibile lo stato reale dell'ecosistema TRAMA senza obbligare l'utente a navigare repository, pull request, workflow, documenti di governance o identificatori tecnici.

L'evoluzione della superficie ha aumentato la quantità e la qualità delle informazioni disponibili, ma ha creato un nuovo rischio: la Home può diventare una rappresentazione fedele del modello interno invece che uno strumento di orientamento.

Una superficie pubblica deve essere utile contemporaneamente a:
- una persona che vuole capire che cos'è TRAMA e che cosa funziona oggi;
- un docente o altro utente operativo;
- un dirigente o stakeholder istituzionale;
- un referente privacy, accessibilità, sicurezza o qualità;
- un partner o valutatore esterno;
- uno sviluppatore o reviewer tecnico.

Questi utenti non richiedono versioni diverse della verità. Richiedono **livelli diversi di profondità**.

## 2. Decisione di architettura informativa

TRAMA SHALL usare una sola base informativa governata con progressive disclosure a quattro livelli.

### L0 — Sintesi universale

Deve essere comprensibile senza conoscere TRAMA, GitHub o DevOps.

Risponde a:
1. Che cos'è questo sistema?
2. Qual è la situazione attuale?
3. Che cosa è disponibile oggi?
4. C'è qualcosa che richiede attenzione?
5. Quanto sono aggiornate le informazioni?

Nessun termine tecnico interno è necessario.

### L1 — Ecosistema e capacità

Risponde a:
- quali parti compongono TRAMA;
- che cosa fa oggi ciascuna parte;
- che cosa è già disponibile;
- che cosa è in sviluppo o in verifica;
- quali relazioni funzionali esistono.

L'unità primaria è la **capacità comprensibile**, non il repository.

### L2 — Verifiche, copertura e decisioni

Serve a stakeholder, responsabili e valutatori.

Risponde a:
- che cosa è stato verificato;
- che cosa resta da verificare;
- quali decisioni umane o istituzionali sono richieste;
- quale copertura esiste per privacy, accessibilità, sicurezza, usabilità e affidabilità;
- quali limiti impediscono un claim più forte.

Il termine “assurance” può comparire nel dettaglio specialistico, non deve essere il nome primario della funzione.

Il termine **garanzia** non deve essere usato come sinonimo generale di assurance: può suggerire una certificazione o una certezza che il sistema non possiede. Nel livello primario usare **verifiche**, **copertura**, **limiti** e **decisioni richieste**.

### L3 — Dettaglio tecnico

Serve a sviluppatori, reviewer e auditor tecnici.

Può mostrare:
- repository;
- branch;
- exact head/SHA;
- pull request;
- workflow;
- gate;
- source refs;
- reason code;
- timestamp esatti;
- evidence IDs;
- enum tecnici;
- provenance.

L3 non deve essere necessario per comprendere L0–L2.

## 3. Principio: viste per domanda, non per ruolo

Il Control Center NON SHOULD obbligare l'utente a scegliere “Sono docente / Sono dirigente / Sono sviluppatore”.

Una stessa persona può cambiare bisogno nella stessa sessione.

La navigazione deve quindi essere costruita sulle domande:

- **Sintesi**
- **Ecosistema**
- **Attenzione**
- **Verifiche**
- **Cronologia**
- **Dettagli tecnici**

Le differenze tra utenti emergono dalla profondità a cui scelgono di arrivare, non da copie separate dell'app.

## 4. Home — contenuto minimo

La Home deve tornare a essere una superficie di orientamento.

### 4.1 Identità

Titolo:
**TRAMA Control Center**

Descrizione breve:
> Stato dell'ecosistema TRAMA: cosa è disponibile, cosa è stato verificato e cosa richiede ancora attenzione.

La descrizione non deve presupporre che l'utente sappia cosa siano maturity, assurance, gate o evidence.

### 4.1.1 Spiegazione pubblica

Per una persona che arriva senza contesto deve essere disponibile, nello stesso primo schermo o immediatamente sotto, una spiegazione di una frase:

> **TRAMA coordina il curricolo, la pubblicazione dei contenuti e gli strumenti di lavoro dell'ecosistema Arena · Atlas · Docente OS.**

La formulazione finale va validata con utenti reali. L'obiettivo è evitare che “ecosistema TRAMA” sia un prerequisito di comprensione.

### 4.2 Situazione attuale

Un unico blocco compatto e testuale.

Esempi:
- **Nessun blocco attivo.** Le informazioni pubblicate sono disponibili e non risultano decisioni urgenti.
- **Ci sono elementi da verificare.** Le parti già verificate restano utilizzabili.
- **Serve una decisione.** Una specifica attività non può avanzare finché non viene completata la verifica indicata.

Non usare un overall score.

Non comprimere in un unico semaforo dimensioni diverse.

### 4.3 Cosa è disponibile oggi

Mostrare le principali capacità dell'ecosistema in linguaggio funzionale.

Esempio di struttura:

**Curricolo e governance**
- fonte autorevole del curricolo;
- stato: disponibile / in verifica / non ancora disponibile.

**Esplorazione e materiali**
- consultazione pubblica del curricolo e delle risorse;
- stato comprensibile.

**Lavoro del docente**
- preparazione e organizzazione operativa;
- stato comprensibile.

I nomi Arena / Atlas / Docente OS possono comparire come nome del prodotto, ma la funzione deve essere spiegata.

### 4.4 Da verificare

La sezione appare solo se esiste qualcosa che richiede attenzione.

Per ogni elemento:
- cosa riguarda;
- perché conta;
- chi deve intervenire, se governato;
- cosa resta comunque utilizzabile;
- link “Vedi dettagli”.

Se non esiste nulla:
> **Nessuna verifica richiesta in questo momento.**

Non mostrare “0 gate” come KPI se non porta informazione utile.

### 4.5 Verifiche e qualità

La Home mostra una sintesi leggibile, non la matrice completa.

Domini primari:
- Privacy e dati;
- Accessibilità;
- Sicurezza;
- Usabilità;
- Affidabilità operativa.

La Home non deve mostrare necessariamente cinque card permanenti. Nel livello L0 deve evidenziare solo:
- verifiche con impatto rilevante per la comprensione o l'adozione;
- limiti aperti;
- cambiamenti recenti significativi.

La matrice completa dei domini appartiene a L2. Questo evita che la Sintesi torni a essere una dashboard specialistica.

Per ciascuno, massimo:
- stato comprensibile;
- ultima verifica;
- eventuale limite rilevante.

Esempi:
- **Accessibilità — verificata parzialmente.** Desktop e smartphone controllati; resta da completare la prova con tecnologia assistiva.
- **Privacy — impostazione documentata.** Nessun account studente previsto nella superficie pubblica; restano le verifiche istituzionali indicate.
- **Sicurezza — controlli automatici attivi.** Il dettaglio tecnico è disponibile nella sezione Verifiche.

Termini come `ASSURE-PRIV-001`, `DOCUMENTED → VERIFIED`, `VERSION_BOUND_TEST` appartengono al drill-down.

### 4.6 Aggiornamento

Mostrare:
> **Ultimo controllo:** oggi alle 10:15

Se cached/offline:
> **Ultimo stato disponibile:** oggi alle 10:15. Non è stato possibile controllare una versione più recente.

La freschezza deve essere separata dalla qualità del contenuto.

### 4.7 Cosa è cambiato

Solo cambiamenti semantici recenti e comprensibili:
- nuova funzione disponibile;
- verifica completata;
- decisione richiesta;
- blocco rimosso;
- documento o policy sostanzialmente modificati.

Non mostrare rumore di commit ordinari.

## 5. Cosa deve uscire dalla Home primaria

I seguenti elementi non devono occupare il primo livello:

- “Fasi R1–R5” come concetto primario;
- maturity levels L0–L5;
- “Stakeholder Assurance” come etichetta principale;
- codici `ASSURE-*`;
- `CURRENT_STATE`, `DOCUMENT_CANONICAL`, `EVENT_BOUND`;
- SHA;
- nomi di workflow;
- repository;
- source path;
- dependency IDs;
- gate IDs;
- enum tecnici;
- relazione `FUTURE_NOT_AUTHORIZED` come copy grezzo.

Queste informazioni restano disponibili nei livelli L2/L3.

## 6. Navigazione proposta

### Desktop

1. Sintesi
2. Ecosistema
3. Attenzione
4. Verifiche
5. Cronologia
6. Tecnico

### Smartphone

Bottom navigation stabile, massimo 5 elementi:
- Sintesi
- Ecosistema
- Attenzione
- Verifiche
- Altro

“Altro” contiene:
- Cronologia;
- Dettagli tecnici;
- documenti/report.

La voce **Attenzione** può mostrare un indicatore numerico solo quando il numero ha significato azionabile.

Ogni elemento deve dichiarare esplicitamente **chi** è chiamato ad agire. “Richiede attenzione” non equivale automaticamente a “richiede un'azione da parte di chi sta leggendo”.

## 7. Vocabolario primario

Preferire:

| Tecnico/interno | Primario |
|---|---|
| maturity | maturità / livello di sviluppo (solo nel dettaglio quando serve) |
| functional availability | disponibile ora / non ancora disponibile |
| verification state | verificato / parziale / da verificare |
| assurance | verifiche e garanzie |
| evidence | prove / verifiche disponibili |
| gate | condizione da completare |
| blocking gate | elemento che impedisce di proseguire |
| capability | funzione / capacità |
| current state | stato attuale |
| exact head | versione verificata |
| source refs | fonti e riferimenti |
| semantic drift | informazioni cambiate da verificare |
| deployment | versione pubblicata |
| workflow | controllo automatico |

Il termine tecnico può restare nel dettaglio quando serve precisione.

## 8. Stato di servizio vs stato del prodotto

TRAMA MUST distinguere:

### Disponibilità tecnica
Il sito/app è raggiungibile e funziona.

### Disponibilità funzionale
Una capacità esiste ed è utilizzabile.

Ogni stato di disponibilità deve indicare il **perimetro** quando rilevante:
- pubblico;
- pilota;
- beta;
- preview;
- interno;
- non ancora autorizzato.

“Disponibile” senza scope non deve essere usato quando potrebbe far credere che una funzione sia disponibile a tutti.

### Stato di verifica
Una capacità è stata verificata rispetto a requisiti definiti.

### Stato di governance
Una decisione/autorizzazione richiesta è stata o non è stata concessa.

Queste dimensioni non devono essere fuse.

La **maturità** è una quinta dimensione, utile soprattutto a L2/L3. Non deve essere usata come sinonimo né di disponibilità né di verifica. Una funzione può essere disponibile in pilota ma non matura; una funzione matura può non essere autorizzata in un determinato perimetro.

“Il sito è online” non significa “la funzione è approvata”.
“Il test è PASS” non significa “il prodotto è certificato”.
“Una funzione è in sviluppo” non significa “il sistema è guasto”.

## 9. Pattern di presentazione

### Sintesi prima, dettaglio dopo
Adottato da sistemi maturi che mostrano stato corrente e consentono drill-down.

### Componenti comprensibili
Le parti mostrate devono corrispondere a ciò da cui l'utente dipende, non all'architettura interna.

### Nome umano prima del riferimento
Mostrare “Curricolo e governance” prima di un ID interno.

### Stato corrente separato da storico
La Home dice cosa vale adesso; la cronologia spiega come ci siamo arrivati.

### Decisione separata dal controllo tecnico
Una CI verde non equivale a decisione umana o autorizzazione.

## 10. Notification policy

Banner e popover devono essere rari.

### Banner
Solo per:
- condizione globale rilevante;
- blocco che cambia ciò che l'utente può fare;
- modalità speciale come E3.

### Aiuto contestuale
- appare solo su richiesta;
- non deve coprire persistentemente il contenuto;
- su mobile preferire disclosure inline o bottom sheet facilmente dismissibile;
- la chiusura deve essere chiara;
- non riapparire automaticamente durante lo scroll.

Il comportamento osservato con il popover “Gap assurance” persistente è un anti-pattern da correggere: interferisce con la lettura e trasforma un'informazione secondaria in ostacolo permanente.

Su mobile:
- nessun popover persistente deve coprire il contenuto durante lo scroll;
- la bottom navigation deve lasciare spazio sufficiente al contenuto e rispettare safe-area;
- il focus da tastiera/tecnologia assistiva non deve finire dietro elementi sticky;
- help e disclosure devono essere prevedibili e facilmente chiudibili.

Questi requisiti sono coerenti con WCAG 2.2 **Focus Not Obscured** e con la guidance W3C sulla riduzione delle interruzioni.

## 11. Superficie E3

E3 non deve testare la capacità del partecipante di comprendere l'intero lessico interno di TRAMA.

La validazione va divisa per livello:

### E3-L0
Comprensione della Sintesi universale.

### E3-L1
Comprensione delle capacità e dello stato dell'ecosistema.

### E3-L2
Comprensione di verifiche, limiti e decisioni da parte di stakeholder.

### E3-L3
Reperibilità del dettaglio tecnico per utenti esperti.

Il partecipante non deve vedere i codici dello scenario prima del compito.

Il moderatore può vedere NORMAL / PARTIAL / REVIEW_REQUIRED ecc.; il partecipante deve vedere soltanto il contenuto utente risultante.

## 12. Audience needs

### Persona non tecnica / pubblico interessato
Deve poter capire:
- che cosa è TRAMA;
- cosa è disponibile;
- se esistono problemi o limiti;
- quanto sono recenti le informazioni;
- dove approfondire.

### Docente / utente operativo
In aggiunta:
- quali funzioni può usare oggi;
- cosa è ancora in preparazione;
- cosa cambia per il proprio lavoro.

### Dirigente / stakeholder istituzionale
In aggiunta:
- quali verifiche esistono;
- quali decisioni competono all'istituto;
- quali aspetti privacy/accessibilità/sicurezza sono ancora aperti;
- quali claim sono supportati e quali no.

### Reviewer / auditor
In aggiunta:
- scope;
- versione;
- data;
- evidenza;
- autorità della verifica;
- limiti.

### Sviluppatore
In aggiunta:
- exact head;
- PR;
- CI;
- source refs;
- reason code;
- dipendenze;
- log tecnico.

## 13. Acceptance targets da validare

Questi sono target di ricerca, non PASS automatici finché non osservati.

Una persona non tecnica SHOULD riuscire, dalla Sintesi, a rispondere senza aprire il dettaglio tecnico:
- che cosa è disponibile;
- se c'è qualcosa da verificare;
- se le informazioni sono recenti;
- che cosa resta utilizzabile.

Uno stakeholder SHOULD raggiungere:
- stato privacy/accessibilità/sicurezza;
- principali limiti;
- decisioni richieste;
senza leggere codici tecnici.

Uno sviluppatore SHOULD poter raggiungere l'exact head e la relativa evidenza con un percorso breve dal dettaglio della stessa informazione, senza cercare in una dashboard separata.

## 14. Terza lettura multiprofessionale — criteri integrati

La presente architettura è sottoposta a una lettura indipendente da più prospettive. I criteri non sono intercambiabili.

### Product / Information Architecture

Valuta:
- se la Home risponde a bisogni reali e non replica la struttura interna;
- se l'information scent porta al livello successivo corretto;
- se la progressive disclosure riduce complessità senza nascondere informazioni essenziali.

### Dirigente / stakeholder istituzionale

Valuta:
- chiarezza di disponibilità, limiti e decisioni;
- distinzione tra evidenza interna, review indipendente e certificazione;
- ownership delle azioni richieste;
- possibilità di capire il perimetro senza leggere dettagli DevOps.

### Docente / utente operativo

Valuta:
- comprensione delle funzioni realmente disponibili;
- chiarezza di cosa cambia per il lavoro;
- assenza di sovrapposizione con Docente OS;
- terminologia scolastica comprensibile.

### Accessibilità / cognitive accessibility

Valuta:
- orientamento;
- gerarchia;
- chiarezza lessicale;
- riduzione delle interruzioni;
- prevedibilità dei controlli;
- focus non oscurato;
- equivalenza semantica mobile/desktop.

### Privacy / security / governance

Valuta:
- minimizzazione;
- assenza di dati non pubblicabili;
- separazione fra presentation boundary e authorization boundary;
- assenza di claim di conformità/certificazione non dimostrati;
- nessuna nuova authority introdotta dalla UI.

### Sviluppatore / auditor tecnico

Valuta:
- tracciabilità claim → evidence → exact version;
- provenienza;
- freshness;
- reversibilità del drill-down;
- stabilità degli identificatori tecnici;
- possibilità di diagnosticare senza contaminare L0.

Una review multiprofessionale è PASS solo se non esiste un rilievo bloccante in nessuna di queste prospettive.

## 15. Benchmark e adattamento

### Atlassian Statuspage
Pattern osservato:
- stato complessivo sintetico;
- componenti selezionati in base a ciò da cui gli utenti dipendono;
- gruppi espandibili;
- storico separato.

Adattamento TRAMA:
- sintesi universale;
- capacità funzionali comprensibili;
- stato attuale separato da cronologia.

### GitHub / GitLab
Pattern osservato:
- stato corrente separato dal dettaglio;
- deployment/environment history separata;
- approval/blocking state distinto dal risultato tecnico.

Adattamento TRAMA:
- verifica tecnica distinta da decisione umana;
- blocco descritto per conseguenza;
- dettaglio tecnico progressivo.

### Backstage
Pattern osservato:
- presentazione umana delle entità;
- riferimenti grezzi mantenuti per il dettaglio;
- modello di sistemi/componenti distinto dalla rappresentazione.

Adattamento TRAMA:
- funzione/nome comprensibile prima di repository e ID;
- ecosistema presentato come capacità e relazioni comprensibili.

### GOV.UK
Pattern osservato:
- progettare attorno ai bisogni dell'utente;
- linguaggio breve e diretto;
- non esporre strutture interne;
- banner usati con parsimonia;
- interfacce che non richiedono spiegazioni per essere comprese.

Adattamento TRAMA:
- question-based navigation;
- copy primario non tecnico;
- niente gergo come requisito di comprensione;
- aiuto contestuale non invasivo.

## 16. Confine pubblico e sicurezza

La progressive disclosure è un pattern di presentazione, **non un controllo di accesso**.

Se L3 è pubblicamente raggiungibile:
- nessun dato sensibile, segreto o personale deve entrare nello snapshot o nel bundle pubblico;
- nascondere un campo nella UI non costituisce protezione;
- i dati non pubblicabili devono essere esclusi a monte dalla pipeline;
- eventuali future superfici riservate richiedono un vero confine di autorizzazione separato.

L'assenza di telemetria e credenziali nel browser resta un vincolo del Control Center pubblico.

## 17. Tracciabilità bidirezionale

Ogni claim human-readable rilevante SHOULD avere un percorso di approfondimento verso:
- scope;
- versione;
- data/freshness;
- evidenza;
- authority/reviewer;
- limiti.

In senso inverso, il dettaglio tecnico SHOULD indicare quale claim umano supporta.

Questa relazione evita due rischi:
- una Home semplice ma non auditabile;
- un dettaglio tecnico corretto ma scollegato dal significato mostrato all'utente.

## 18. Perimetro del docente

Il Control Center può spiegare a un docente **quali capacità dell'ecosistema sono disponibili e verificate**, ma non deve diventare il suo ambiente operativo quotidiano.

Calendario, preparazione della lezione, attività, materiali e flussi di lavoro appartengono a Docente OS/Atlas secondo i rispettivi confini.

Il Control Center resta una superficie di orientamento, stato e verificabilità dell'ecosistema.

## 19. Obiettivi temporali di lettura da validare

Non sono SLA né risultati già dimostrati. Sono target per la ricerca E3:

- **colpo d'occhio:** capire se esiste qualcosa di rilevante/critico senza scorrere una dashboard tecnica;
- **circa un minuto:** capire cosa è disponibile, cosa richiede attenzione e quanto è recente l'informazione;
- **approfondimento:** raggiungere verifiche o dettaglio tecnico senza perdere il contesto.

I tempi finali devono essere misurati, non presunti.

## 20. Impatto sui documenti esistenti

Questa architettura:
- rafforza `trama-control-center-v2-view-architecture.md`;
- estende E0/ADR-018 dal solo Project Knowledge all'intera gerarchia del Control Center;
- non modifica i contratti dati;
- non modifica authority;
- non abilita Live Overlay;
- non modifica DOS-A1.

## 21. Sequenza proposta

1. approvare questa architettura informativa;
2. produrre wireframe mobile/desktop della nuova Sintesi;
3. rimappare i dati esistenti senza cambiare source of truth;
4. correggere help/popover;
5. realizzare la nuova Home in slice incrementale;
6. validare E3-L0 prima;
7. poi E3-L1/L2;
8. mantenere E3-L3 come verifica esperta separata.

Nessun big bang e nessuna duplicazione della verità.
## 22. Refinement — orientation-first architecture (2026-09-29)

La ricerca `docs/research/trama-control-center-orientation-state-of-art-2026-09-29.md` modifica il modo in cui L0 deve essere composto, senza cambiare la base informativa governata.

### Decisione aggiuntiva

L0 NON SHOULD essere una lunga sequenza verticale di sezioni progressive.

L0 SHOULD essere composto come:

1. **shell persistente** — identità del prodotto + area corrente + navigazione stabile;
2. **overview breve** — situazione corrente + freshness;
3. **modello dell’ecosistema** — relazione percepibile Arena → Atlas → Docente OS;
4. **massimo tre destinazioni primarie** verso aree specialistiche;
5. **progressive navigation** verso Ecosistema, Verifiche, Cronologia/Tecnico;
6. progressive disclosure solo per il dettaglio dell’oggetto corrente.

### Conseguenza sul prototipo L0 v1

Il prototipo `docs/prototypes/TRAMA-CONTROL-CENTER-L0-REALISTIC.html` resta una prova di fattibilità visuale con il design esistente, ma è classificato come **design probe**. Non è il target finale per E3-L0.

Il prossimo target progettuale è **L0 v2**, più vicino alla semplicità del mockup originario e con orientamento leggibile nel primo viewport.

### Criterio first-screen

Prima di esplorare, una persona non tecnica deve poter rispondere a:
- dove sono;
- che cos’è TRAMA;
- qual è la situazione corrente;
- quanto sono recenti le informazioni;
- come si collegano Arena, Atlas e Docente OS;
- dove andare per approfondire.

Se servono più sezioni verticali per rispondere, L0 non è ancora conforme all’architettura.

