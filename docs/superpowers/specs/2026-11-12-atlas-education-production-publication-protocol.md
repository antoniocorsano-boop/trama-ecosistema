# ATLAS-EDU-01 — Protocollo di produzione e pubblicazione educativa da ChatGPT

**Data:** 12 novembre 2026  
**Stato:** PROPOSTA / NON AUTORIZZA RUNTIME O PUBBLICAZIONE  
**Nome di lavoro del plugin:** Studio Atlas Education.

## 1. Decisione e perimetro

ChatGPT è l'ambiente obbligatorio di progettazione e produzione, incluse le elaborazioni deterministiche avviate nel suo ambiente di lavoro. Il plugin non introduce un generatore IA autonomo né chiamate a pagamento. Studio Atlas acquisisce, conserva e verifica i prodotti; Atlas espone il catalogo e distribuisce le versioni autorizzate. Arena resta l'autorità sugli obiettivi curricolari; Docente OS collega esplicitamente prodotti a UDA e lezioni. Per “Astra” si assume Atlas, da confermare nella revisione del documento. Nessuna piattaforma parallela.

Riuso: docs/contracts/activity-package-v1.md e relativo schema sperimentale; LOI-01 TRAMA #305/#306 (intake v0.1, ancora draft); Atlas #84 e #85 (Missione 118); governance ATLAS-MAT-PUB-01 già richiamata dal contratto. Non duplicare ActivityPackage, intake o meccanismi di pubblicazione. Verificare la loro compatibilità prima di qualsiasi estensione. Separare acquisizione della bozza, associazione curricolare, qualificazione, pubblicazione e autorizzazione alla fruizione.

## 2. Famiglie di prodotto

Avventura interattiva, microcorso, laboratorio/simulazione, videolezione narrativa, racconto/fumetto, sfida progettuale. Per ogni famiglia: modello didattico distinto e stesso involucro di consegna. Supportare attività offline/fuori schermo, lavoro individuale, di gruppo e classe. Non trasformare tutto in quiz o obbligare a un attestato. Pubblico giovane: adeguatezza all'età, inclusione, rispetto e sicurezza, niente meccanismi manipolativi o graduatorie.

## 3. Protocollo comune

P0 — Brief: destinatari/fascia d'età, durata, contesto, prerequisiti, problema formativo, modalità di fruizione, accessibilità, vincolo FREE_ONLY; minimizzare dati.  
P1 — Progetto pedagogico: obiettivi osservabili (2–4 per microcorso come valore proposto), contenuti, azioni dello studente, evidenze attese e riflessione/trasferimento. Ricerca riferimenti Arena; se non reperiti, dichiarare proposta e binding PENDING, mai inventare identificativi o approvazioni.  
P2 — Progetto narrativo/didattico: sequenza, storyboard quando pertinente, esercizi con feedback e spiegazioni, ruolo del docente; fonti e diritti.  
P2a — Gate obbligatorio di regia educativa per tutte le famiglie: brief, fonti, sceneggiatura integrale, storyboard o sequenza editoriale equivalente, direzione artistica e piano docente; storia/mondo quando narrativi, motivazione esplicita altrimenti. Revisione umana esplicita della versione esatta prima della produzione. Il controllo strutturale check_preproduction.py rifiuta artefatti o revisioni mancanti, non PASS o impronte mutate; non autentica il revisore e non concede autorità. Nessun generico «procedi» sostituisce una revisione; se bloccato, consegnare solo progetto/static storyboard.  
P3 — Produzione in ChatGPT: produrre file reali, non descrizioni; testo, immagini, sottotitoli, audio/video, HTML autonomo o materiali statici a seconda del tipo. Per ogni asset conservare origine, strumento/versione quando disponibile, input editoriale, licenza e hash. Nessuna voce personale/clonazione, dati alunni o risorse a pagamento. Se un asset non è ottenibile, dichiarare mancante; non simulare generazione.  
P4 — Confezionamento: ActivityPackage v1 se rappresentabile, manifesto di acquisizione e asset verificabili; sorgenti editabili, guida docente, materiale studente, alternative accessibili, ricevuta di verifica. Non inserire file di chat temporanei come URL di distribuzione.  
P5 — Acquisizione: trasferimento esplicito della bozza a Studio Atlas tramite canale autorizzato; verifica formato/hash, duplicati e conflitti, sicurezza file, storage e quote. Versione immutabile; correzioni creano nuova versione. Ricevuta di acquisizione. Nessuna assegnazione automatica.  
P6 — Qualificazione: verifica disciplinare/pedagogica, diritti, sicurezza/privacy, accessibilità WCAG 2.2 AA come target, runtime offline quando dichiarato, browser/mobile reali ove richiesti; prova end-to-end e anteprima docente. Per audio/video: fedeltà, pronuncia, sottotitoli e sincronizzazione; ascolto umano.  
P7 — Revisione umana: PASS/REWORK/REJECT sul pacchetto e hash esatti, con ambito ed evidenze. PASS è necessario ma non sostituisce il gate pubblicazione esistente.  
P8 — Pubblicazione: comando distinto, esplicito e autorizzato, verifica server-side dei prerequisiti (incluso binding ove richiesto dalla policy, diritti e review non scaduta), versione esatta, visibilità e ricevuta. Se gate non soddisfatto resta bozza. Ritirare/sostituire solo per azione autorizzata, con storico.  
P9 — Fruizione: solo asset approvati, nessun account studente obbligatorio, nessuna telemetria/profilazione, nessuna IA remota in runtime; offline verificato per prodotti dichiarati offline. Progressi minimi sul dispositivo, reset e portabilità espliciti. Attestato facoltativo di completamento locale, non voto o certificazione ufficiale, non identità verificata. Nessuna trasmissione automatica delle risposte a Docente OS.

### 3.1 Direzione artistica e continuità multimediale (requisito trasversale P0–P7)

Definire una direzione artistica e un'identità visiva, narrativa e sonora appropriate al tema, agli obiettivi formativi, all'età dei destinatari e alla tipologia di esperienza. Applicare tale identità in modo coerente a tutti gli elementi del prodotto, dall'introduzione alla restituzione finale, compresi video, illustrazioni, interfacce, materiali stampabili ed eventuali attestati. Preservare gli elementi multimediali già approvati, senza sostituirli arbitrariamente.

Prima della produzione definire e conservare una scheda di direzione artistica: atmosfera e stile, palette con contrasti accessibili, tipografia, composizione e componenti, identità dei personaggi e ambienti (quando pertinenti), regia audiovisiva, adattamento mobile e stampa. Il tema determina il linguaggio grafico: non imporre lo stesso stile a prodotti diversi. Se un video approvato è previsto come modalità principale, mantenerlo nella fruizione principale; testo, trascrizione e sottotitoli sono alternative accessibili, non sostituzioni automatiche. Se il video è indisponibile dichiarare il blocco e non qualificare come equivalente una sostituzione non approvata. Attestati e altri materiali finali, se previsti, devono riprendere l'identità dell'esperienza, essere leggibili e impaginati per il formato di destinazione; mantenere le diciture di restituzione non ufficiale e i vincoli privacy. La verifica visiva e audiovisiva su artefatti reali è obbligatoria prima di PASS; incoerenze, impaginazione inadeguata o asset approvati mancanti richiedono REWORK.

Il pilota Missione 118 richiede verifica della resa mobile del prologo, mantenimento del video già prodotto come modalità principale, testo alternativo accessibile e riprogettazione grafica della restituzione Custode del futuro. Questa prescrizione non costituisce accettazione del pilota né autorizzazione alla pubblicazione.

### 3.2 Fascicolo didattico e qualificazione del prodotto (requisito trasversale P0–P7)

Ogni esperienza deve avere un fascicolo didattico docente obbligatorio, utilizzabile anche indipendentemente dal prodotto digitale, e un rapporto di qualificazione della versione esatta. Progettare insieme esperienza, mediazione didattica e verifica del valore dello strumento. Distinguere la qualità del prodotto, la sua efficacia osservata in contesto e gli apprendimenti individuali: il completamento digitale non certifica competenze, livelli o voti. Il docente può raccogliere evidenze e valutare in classe con strumenti propri, senza trasferire dati degli studenti ad Atlas.

Il fascicolo contiene identità/versione, destinatari, durata, finalità, fonti disciplinari e pedagogiche pertinenti (distinguere fonti effettivamente consultate da ipotesi), riferimenti Arena autentici o esplicito stato non verificato, prerequisiti, obiettivi osservabili, matrice obiettivo→azione→evidenza→criterio, sequenza prima/durante/dopo, ruolo del docente, inclusione, risorse, attività di trasferimento e strumenti facoltativi di osservazione/verifica con criteri e indicazioni per interpretarli. Consegnare scheda sintetica, guida operativa e materiali pronti all'uso; proporzionare l'estensione alla tipologia, senza duplicare contratti. Il rapporto distingue qualità progettuale verificata, prove tecniche, revisione disciplinare e pedagogica umana e sperimentazione in classe (non eseguita / in corso / documentata). Registrare versione/hash, contesto non identificante, criteri, metodo, evidenze, limiti, esiti e azioni correttive. Un PASS progettuale non dimostra efficacia empirica: dichiarare risultati solo se effettivamente documentati e non attribuire causalità senza metodo adeguato. Non inventare esiti, raccogliere dati personali, telemetria, risposte o identificatori di studenti; conservare solo riscontri qualitativi o aggregati non identificanti volontariamente forniti, separati dal runtime e subordinati a verifica privacy; nessun tracciamento automatico o obbligo di rendicontazione docente. La qualificazione interna non è certificazione ufficiale o accreditamento. Fascicolo assente o non adeguato: REWORK; pubblicazione sempre distinta e governata.

### 3.3 Qualità espressiva e comunicativa (requisito trasversale P0–P7)

Definire la qualità espressiva e comunicativa come requisito autonomo: progettare lingua, narrazione, dialoghi, consegne, riscontri e, quando pertinente, interpretazione vocale in funzione del tema, degli obiettivi, del pubblico e del medium. Usare un registro naturale, preciso, inclusivo e adeguato all'età senza infantilizzare, sovraccaricare o sacrificare il rigore disciplinare. La forma espressiva deve sostenere comprensione, curiosità e autonomia, non manipolare o trattenere l'utente.

Predisporre una scheda editoriale proporzionata al prodotto: registro e destinatari, terminologia da mantenere e spiegare, punto di vista, ritmo e continuità narrativa quando pertinenti, differenziazione delle voci dei personaggi, consegne orientate all'azione, feedback che spiega senza umiliare. Distinguere i testi per studenti da quelli professionali per docenti. Per audio/video conservare testo canonico, partitura di regia (intenzione, gruppi di senso, pause, accenti, pronuncia di termini/sigle, ritmo e continuità tra scene), media e sottotitoli coerenti. Controllare la resa effettiva con lettura e, per la voce, ascolto integrale e verifica umana, non solo del copione o di campioni; documentare rilievi con posizione/scena e correggere senza sostituire asset approvati arbitrariamente. Verificare anche comprensibilità delle consegne e riscontri nel prodotto fruibile. Errori di significato, pronunce problematiche, registro inadeguato o incoerenze espressive materiali comportano REWORK; dimensioni non pertinenti motivate, non valutate per obbligo. Nessuna pretesa di efficacia empirica basata sulla sola qualità editoriale.

### 3.4 Standard di qualità educativa Atlas

Adottare come proposta di riferimento interno [ATLAS-QE-01 v0.1](2026-11-12-atlas-educational-quality-standard.md), con dodici dimensioni Q01–Q12, matrice delle evidenze e criteri non compensabili. La qualificazione progettuale richiede tutte le dimensioni PASS e revisione umana sulla versione esatta. Sperimentazione e apprendimenti restano distinti; nessun PASS autorizza pubblicazione. Applicare ai due piloti prima di qualificare il plugin.

## 4. Plugin proposto

Architettura conforme alla documentazione OpenAI Plugins: istruzioni riutilizzabili (skills) + eventuale server MCP per azioni controllate + interfaccia opzionale. Prima versione skill-first: progettazione, produzione, collaudo, confezionamento, istruzioni di acquisizione tramite LOI-01 esistente. Nessuna dipendenza da MCP scrivente finché disponibilità, autenticazione e trasferimento binario non provati. La modalità sviluppatore MCP completa ha restrizioni di piano/workspace; verificare l'effettiva disponibilità della connessione privata o distribuzione plugin e non presumere la compatibilità mobile. Nessuna chiave segreta nel plugin o nel pacchetto.

Proposta di strumenti MCP futuri (nomi indicativi, non implementati):
- cerca_obiettivi: sola lettura Arena, riferimento esatto e stato approvazione;
- valida_pacchetto: controlli non mutativi, report strutturato;
- acquisisci_bozza: scrittura autorizzata e idempotente con hash dei file; mai URL temporanei o accesso arbitrario;
- stato_revisione: sola lettura di bozza/versione/evidenze;
- prepara_pubblicazione: verifica eligibility e restituisce anteprima del comando, nessuna pubblicazione;
- pubblica_versione: azione distinta con conferma umana, autorizzazione server-side e ricevuta;
- collega_attivita: azione distinta per Docente OS con contesto esplicito e conferma, senza dati alunni.

Il server non si fida di asserzioni di approvazione generate dal modello. Separare permessi lettura/scrittura/pubblicazione; autenticazione professionale e audit minimo non personale, limiti dimensione/tempo, convalida contenuti e path, protezione da SSRF e archive traversal, niente esecuzione server-side di HTML ricevuto. Conservare bytes reali in archivio governato; download verificabile dopo scadenza link di chat. L'anteprima editoriale è isolata, distinta dal runtime locale. Il passaggio di asset binari dal contesto ChatGPT non è ancora qualificato; MVP usa consegna pacchetto esplicita e intake controllato.

## 5. Consegna e livelli qualitativi

Usare ActivityPackage v1 per i campi già previsti: ID, versione, titolo, età/livello, modalità, cognitive moves, archetipi, riferimenti Arena, fasi, offline, accessibilità, diritti e provenienza. Integrare con il manifesto intake già esistente per elenco asset e impronte, senza ridefinire lo schema in questa fase. Materiali: prodotto fruibile, guida docente, sorgenti, asset e report; eventuale attestato locale e transcript/sottotitoli. Verifica fattuale e test reali, non autocertificazione del modello. La revisione di diritti include contenuti generati, fonti e licenze dei modelli e delle registrazioni; non presumere che free compute = libera redistribuzione.

Stati concettuali da mappare sugli stati esistenti, non nuovo contratto: IDEA → PROGETTO → PRODUZIONE → PACCHETTO → BOZZA ACQUISITA → REVISIONE → CANDIDATO → PUBBLICATO / RITIRATO. Non saltare gate. Un esito strutturale positivo non abilita pubblicazione.

## 6. Piano e criteri di accettazione

A — Specifica e ricognizione contratti/gate esistenti (questa proposta).  
B — Skill di produzione v0.1 e modelli di brief/progetto/guida/controlli; test di conformità, senza servizio nuovo.  
C — Missione 118: chiudere R2/R3/R4 (ripresa, attestato, Android/privacy/accessibilità) e audio/video con review; acquisizione end-to-end come bozza, nessuna approvazione implicita.  
D — Microcorso pilota su argomento STEM, ad es. energia e trasformazioni: produzione reale in ChatGPT, obiettivi osservabili, attività, feedback, guida e prova di trasferimento. Verificare portabilità indipendente dalla tipologia avventura.  
E — Qualificare archivio condiviso e trasferimento reale dei file grandi (video) con autenticazione e quote, poi MCP di sola lettura/validazione; solo dopo aggiungere scritture e pubblicazione, sempre con gate.  
F — Primo candidato di pubblicazione dopo decisione umana distinta e policy esistente. Installazione/distribuzione plugin solo dopo collaudo e verifica requisiti OpenAI.

Accettazione: due tipologie prodotte in ChatGPT con file reali, validazione ripetibile, import idempotente, rifiuto asset manomessi e contenuti non approvati, anteprima reale, fruizione offline senza richieste esterne quando dichiarata, conservazione dopo scadenza link temporanei, prova di mancata pubblicazione in assenza di autorizzazione. Nessun costo aggiuntivo autorizzato.

## 7. Riferimenti e limiti

OpenAI: https://developers.openai.com/plugins/concepts/plugins ; https://developers.openai.com/plugins/build/plugins ; https://developers.openai.com/plugins/plan/tools ; https://help.openai.com/en/articles/12584461-developer-mode-and-full-mcp-connectors-in-chatgpt . Distinguere distribuzione del plugin da pubblicazione dei materiali Atlas. La disponibilità delle superfici e delle azioni scriventi va verificata al momento del collaudo. Studio Atlas PR #306 è bozza con persistenza locale; non è ancora archivio remoto condiviso. Questa specifica non modifica runtime, autorizzazioni, main, deploy, né pubblica alcun contenuto didattico.
