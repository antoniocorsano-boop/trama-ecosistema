# TRAMA Stage E3 — Human-use Validation Protocol v1

**Stato:** PROPOSED / HUMAN VALIDATION / READ_ONLY  
**Data:** 2026-09-29  
**Perimetro:** TRAMA Control Center · Project Knowledge state communication  
**Base:** E0 communication contract · E1 visual prototype · E2 real UI implementation  
**Runtime impact:** NONE  
**Live Overlay activation:** NOT AUTHORIZED  
**DOS-A1:** RUNTIME_DEFERRED

## 1. Scopo

E3 verifica se la superficie reale introdotta in E2 viene compresa e usata correttamente da persone che non sono tenute a conoscere repository, SHA, CI, DevOps o la terminologia interna di Project Knowledge.

E3 non misura “quanto piace” la UI. Misura comportamento osservabile:

- che cosa l'utente ritiene affidabile;
- che cosa ritiene recente;
- se pensa di dover agire;
- quale conseguenza attribuisce allo stato;
- se distingue incertezza, assenza di aggiornamenti, blocco ed errore;
- se attribuisce o meno al Control Center authority che non possiede;
- se riesce a trovare il dettaglio tecnico solo quando serve.

## 2. Metodo di riferimento

Il protocollo adotta una prova moderata orientata a compiti:

- compiti con obiettivo realistico;
- formulazione neutrale che non suggerisce la risposta;
- osservazione di comportamento, esitazioni, interpretazioni ed errori;
- think-aloud facoltativo e non obbligatorio;
- domande di verifica dopo il compito;
- note strutturate;
- nessun punteggio complessivo di “bravura” dell'utente.

Riferimenti esterni consultati:
- GOV.UK Service Manual — moderated usability testing;
- GOV.UK — user research in beta / usability benchmarking;
- W3C WAI — involving users in evaluating accessibility.

Il protocollo TRAMA usa questi riferimenti come benchmark metodologico, non come authority di prodotto.

## 3. Unità di validazione

L'unità primaria è il **use case**, non la persona.

Catalogo canonico:

`governance/human-use/stage-e3-use-case-catalog.json`

Ogni use case dichiara:
- stato o situazione;
- dimensioni osservate;
- compito neutro;
- risultato atteso;
- interpretazioni critiche da intercettare;
- criteri PASS osservabili.

## 4. Tipi di use case

### A. State comprehension
NORMAL, LOADING, EMPTY, PARTIAL, REVIEW_REQUIRED, BLOCKED, NO_ACCESS, OFFLINE_CACHED e UNAVAILABLE.

### B. Cross-cutting
- progressive disclosure;
- current vs history;
- responsive/mobile;
- keyboard/focus;
- assistive technology;
- low digital confidence.

Gli use case cross-cutting impediscono che un singolo layout desktop “verde” venga usato come prova generale.

## 5. Profili di partecipante

E3 deve includere persone plausibili per il Control Center.

### Cohort A — non-technical institutional user
Persone che possono dover leggere stato, affidabilità e decisioni ma non lavorano abitualmente con SHA, CI o repository.

Profili possibili:
- docente;
- dirigente o funzione organizzativa;
- referente di istituto;
- stakeholder assurance/privacy/accessibilità non sviluppatore.

### Cohort B — technical/assurance reader
Persona che può avere bisogno del livello di dettaglio:
- referente tecnico;
- sviluppatore/reviewer;
- accessibility/security/privacy reviewer tecnico.

Serve a verificare che la progressive disclosure non nasconda ciò che serve al controllo approfondito.

### Cohort C — inclusion/accessibility
Persone con diversa modalità di accesso o diversa confidenza digitale.

Esempi:
- uso abituale di tastiera;
- screen reader o ingrandimento;
- bassa confidenza digitale;
- dispositivo mobile come modalità primaria.

Non assumere che una singola persona rappresenti un'intera categoria.

## 6. Dimensionamento della prova

E3 è **formative validation**, non benchmark statistico.

Prima iterazione consigliata:
- 5–8 partecipanti complessivi;
- almeno 3 profili diversi;
- prevalenza di utenti non tecnici;
- almeno una verifica dedicata tastiera/focus;
- almeno una verifica assistive-technology quando disponibile.

Se non è possibile raccogliere evidenza con tecnologia assistiva o con un profilo necessario, l'esito E3 deve restare `PARTIAL`, non essere convertito artificialmente in PASS.

Una dichiarazione quantitativa di benchmark comparabile nel tempo richiede un esercizio separato e campione più ampio; non appartiene al gate E3 iniziale.

## 7. Carico della sessione

Per evitare affaticamento e apprendimento artificiale:
- massimo 5 compiti per partecipante;
- non mostrare tutti gli stati alla stessa persona;
- distribuire gli use case sulla coorte;
- alternare stati ordinari e anomali;
- non spiegare in anticipo la tassonomia interna;
- non correggere l'utente durante il compito salvo blocco della sessione.

Una sessione completa dovrebbe restare indicativamente entro 30–60 minuti.

## 8. Preparazione

Prima della prima sessione:
1. exact head/build da testare definito;
2. gate tecnici E2 verdi;
3. stato/fixture del caso riproducibile;
4. smartphone e desktop disponibili secondo il piano;
5. browser e zoom verificati;
6. nessun dato personale reale necessario;
7. guida del moderatore provata almeno una volta internamente;
8. raccolta evidenze predisposta.

## 9. Presentazione del compito

Una consegna valida:
- descrive un obiettivo;
- non usa il nome tecnico dello stato;
- non contiene la risposta;
- non dice dove cliccare;
- evita parole come “errore”, “blocco”, “offline”, “verificato” quando proprio queste sono l'oggetto da comprendere, salvo il contesto le richieda naturalmente.

Esempio corretto:
> “Guarda questa schermata come se stessi controllando lo stato del progetto. Dimmi che cosa sai con certezza e se devi fare qualcosa.”

Esempio non valido:
> “Controlla il banner giallo e dimmi se lo stato PARTIAL richiede un'azione.”

## 10. Osservazione

Per ogni use case registrare:

- taskCompleted: sì / con aiuto / no;
- interpretationCorrect: sì / parziale / no;
- actionDecisionCorrect: sì / non applicabile / no;
- technicalDetailNeededUnexpectedly: sì / no;
- facilitatorIntervention: nessuna / chiarimento / aiuto sostanziale;
- hesitationOrDetour;
- observedMisinterpretations[];
- accessibilityIssue[];
- responsiveIssue[];
- userWording[] solo in forma anonima e breve;
- findingIds[].

Non registrare valutazioni sulla persona.

## 11. Domande post-task

Dopo il comportamento osservato è possibile chiedere:

- “Che cosa consideri ancora affidabile?”
- “Quanto sono recenti queste informazioni?”
- “Devi fare qualcosa adesso?”
- “Che cosa succede se non fai nulla?”
- “Dove cercheresti maggiori dettagli?”
- “Questa schermata secondo te può approvare o modificare qualcosa?”

Le domande servono a verificare il modello mentale, non a insegnare la risposta.

## 12. Classificazione dei finding

### CRITICAL
Errore che può produrre:
- falsa fiducia;
- falso allarme;
- falsa authority;
- azione quando non richiesta;
- mancata azione quando esplicitamente necessaria;
- dato cached/offline interpretato come live;
- blocked interpretato come autorizzato.

**Tolleranza per la chiusura E3: zero finding CRITICAL aperti.**

### HIGH
Il compito principale non viene completato indipendentemente oppure l'azione richiesta non viene individuata.

### MEDIUM
Il compito viene completato ma con esitazione, percorso improprio o terminologia confusa.

### LOW
Difetto cosmetico/preferenziale senza impatto materiale.

## 13. Regole di esito

### KEEP
- nessun CRITICAL aperto;
- i compiti core di comprensione sono completabili senza correzione del moderatore;
- non emerge un pattern sistematico di errore;
- copertura richiesta completata.

### REVISE
Il modello è valido, ma copy, gerarchia, responsive, accessibilità o disclosure richiedono correzioni.

Dopo una correzione materiale, i use case interessati devono essere ripetuti.

### REJECT
Il modello comunicativo produce sistematicamente un errore CRITICAL oppure richiede una riprogettazione fondamentale.

### PARTIAL
La copertura di profili, dispositivi o accessibilità è incompleta.

PARTIAL non autorizza la chiusura di E3 come PASS.

## 14. Gate di comprensione critica

Sono invarianti E3:

1. NORMAL non deve essere interpretato come problema.
2. EMPTY non deve essere interpretato come mancato caricamento.
3. PARTIAL non deve invalidare mentalmente la base verificata.
4. REVIEW_REQUIRED non deve essere interpretato come approvazione automatica.
5. BLOCKED deve rendere chiaro che cosa non può proseguire.
6. NO_ACCESS non deve essere interpretato come perdita dei dati.
7. OFFLINE/CACHED non deve essere interpretato come controllo appena eseguito.
8. UNAVAILABLE pre-live non deve essere interpretato come errore del sistema.
9. La UI non deve far credere che il Control Center possa approvare o scrivere.
10. Il dettaglio tecnico non deve essere necessario per rispondere alle domande primarie.

Una violazione sistematica di uno di questi punti è CRITICAL.

## 15. Mobile

La prova mobile non consiste nel ridurre la finestra desktop.

Deve verificare:
- gerarchia iniziale;
- assenza di overflow orizzontale della pagina;
- leggibilità;
- ordine semantico;
- touch target;
- disclosure;
- visibilità dello stato;
- assenza di dipendenza dalla sidebar desktop.

Almeno UC-08 e UC-11 devono avere evidenza smartphone.

## 16. Accessibilità

E3 include osservazione umana ma non sostituisce audit WCAG.

Minimo:
- keyboard-only su UC-12;
- stato dinamico/disclosure su UC-13 con tecnologia assistiva quando disponibile;
- zoom/reflow coerente con il contratto UI evidence;
- colore mai unico portatore di significato.

Problemi di codice/accessibilità devono essere distinti da problemi di comprensione.

## 17. Privacy della ricerca

La receipt E3 non deve contenere:
- nome/cognome;
- email;
- account;
- identificativi personali;
- registrazioni audio/video non governate;
- informazioni sanitarie;
- profili individuali persistenti.

Usare solo:
- participantProfileId astratto, per esempio `NONTECH-01`;
- ruolo/categoria non identificante;
- device/access mode rilevanti;
- osservazioni necessarie alla UX.

## 18. Receipt

Ogni sessione produce una receipt conforme a:

`governance/human-use/stage-e3-human-use-receipt.schema.json`

La receipt lega:
- exact head/build;
- data;
- profilo astratto;
- use case eseguiti;
- evidenze;
- finding;
- esito.

La receipt non modifica automaticamente lo stato governato del prodotto.

## 19. Evidence aggregation

Dopo una tornata:
- aggregare per use case e finding, non per “voto medio”;
- cercare pattern ricorrenti;
- separare problemi di copy, layout, interaction, accessibility, data-state e governance;
- non nascondere CRITICAL/HIGH dietro percentuali aggregate;
- dichiarare esplicitamente copertura mancante.

## 20. Criterio di chiusura E3

E3 può essere proposto per chiusura solo quando:

- catalogo tipizzato validato;
- almeno una tornata human-use completata;
- use case CRITICAL coperti;
- UC-12 keyboard/focus coperto;
- UC-13 assistive-tech coperto oppure E3 resta PARTIAL;
- mobile coverage presente;
- zero CRITICAL aperti;
- ogni HIGH ha stato RESOLVED o motivazione governata che impedisce la chiusura;
- exact head/build della superficie è dichiarato;
- review indipendente conclusiva;
- HUMAN EXACT-HEAD REVIEW — PASS.

## 21. Non autorizzazioni

E3 non autorizza:
- Live Overlay;
- polling;
- GitHub App;
- write/approval;
- telemetria individuale;
- promozione automatica;
- DOS-A1.

## 22. Passo successivo

Dopo E3:
- se KEEP → Stage E può essere considerato human-validated per il perimetro testato;
- se REVISE → correggere E2 e ritestare i casi impattati;
- se REJECT → tornare a E0/E1 per il modello comunicativo;
- se PARTIAL → completare la copertura mancante.

Nessun esito E3 va generalizzato a superfici o stakeholder non testati.
