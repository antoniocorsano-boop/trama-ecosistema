# TRAMA — Protocollo di progettazione narrativa educativa v0.1

Data: 14 novembre 2026.
Stato: **PROPOSTA OPERATIVA PER REVISIONE UMANA / HOLD PRODUZIONE / NON AUTORIZZA RUNTIME O PUBBLICAZIONE**.
Ambito: storie educative del primo ciclo destinate a possibile adattamento in Studio Atlas / EduTwin. Il protocollo attua, senza sostituirlo, [Storytelling First Authoring Contract v1](STORYTELLING-FIRST-AUTHORING-CONTRACT-v1.md) e rispetta la [Costituzione Child-Safe](../governance/CHILD-SAFE-LEARNING-EXPERIENCE-CONSTITUTION-v1.md).

## 1. Decisione e motivazione

La prova sullo smartphone di Missione 118 ha confermato che navigazione e immagini integre non equivalgono a qualità narrativa. Nelle scene successive al prologo il pannello «Stato della scena», le etichette MISMATCH/OFF/ACTIVE e le opzioni radio occupano il primo piano; la storia e l'azione arrivano dopo. Due avvisi «chiuso fino alle 15» e «aperto dalle 15» sono compatibili, quindi non costituiscono da soli un conflitto credibile. Il problema non si risolve con nuovi pulsanti, altri sfondi o ulteriori scene.

**Decisione di indirizzo espressa dall'autore:** sospendere gli interventi incrementali e fondare la produzione su una metodologia narrativa matura, con origine educativa esplicita. Conservare senza alterazioni materiali, immagini, audio, motore e revisioni già prodotti. Il giudizio sulla storia rimane REWORK; i PASS tecnici esistenti restano evidenze tecniche, non approvazioni editoriali. Non integrare ulteriori modifiche al motore per inseguire il prototipo durante questa fase. Non cancellare né dichiarare completate le attività aperte.

Principio: prima si definisce il bisogno educativo; poi si scrive una storia che abbia valore come racconto autonomo; soltanto dopo si progetta il modo in cui l'allievo può abitarla e modificarla.

## 2. Riferimenti verificati e loro funzione

| Riferimento | Contributo effettivo | Uso in TRAMA e limite |
|---|---|---|
| [Pixar in a Box — The art of storytelling](https://www.khanacademy.org/partner-content/pixar/before-the-story/storytelling) | Percorso didattico su idea, personaggi, desideri e bisogni, ostacoli, trasformazione, posta in gioco, struttura in atti, linguaggio visivo e revisione. | Riferimento metodologico di scrittura, consultabile gratuitamente; non è un generatore di racconti né una prova di efficacia educativa di EduTwin. |
| Yang, Klein, Peng, Tian (2023), [DOC: Improving Long Story Coherence With Detailed Outline Control](https://aclanthology.org/2023.acl-long.190/) — DOI 10.18653/v1/2023.acl-long.190 | Pianificazione gerarchica e controllo dell'aderenza del testo alla scaletta. La ricerca riporta guadagni assoluti rispetto a Re3 in valutazioni umane di coerenza (22,5 punti percentuali), aderenza alla scaletta (28,2) e interesse (20,7). | Adottare la separazione premessa → piano → stesura → verifica. I risultati riguardano storie lunghe generate, non apprendimenti scolastici. |
| [DOC Story Generation V2](https://github.com/facebookresearch/doc-storygen-v2) | Codice Apache 2.0, passaggi Premise/Plan/Story, richiede configurazione dei modelli e infrastruttura di inferenza; documenta limiti di varietà e alcune opzioni non ben testate. | Riferimento tecnico riproducibile da valutare eventualmente; non installarlo ora. Codice aperto non significa inferenza gratuita. Non dichiarare implementato o qualificato DOC mediante un semplice dialogo con un LLM. |
| [Manuskript](https://github.com/olivierkes/manuskript/blob/develop/README.md) | Software libero GPL-3.0 o successiva, espansione progressiva della premessa, organizzazione di personaggi, mondi, trama e capitoli. | Strumento opzionale per scrittura locale e portabilità; il metodo di lavoro è riutilizzabile anche con documenti testuali. Nessuna adozione obbligatoria o integrazione software. |
| Naul e Liu (2020), [Why Story Matters: A Review of Narrative in Serious Games](https://doi.org/10.1177/0735633119859904) | Revisione della letteratura: distribuzione narrativa, integrazione intrinseca della finzione nell'apprendimento, personaggi empatici e responsività. | Criteri per adattamento educativo. Evidenze eterogenee, non dimostrazione dell'efficacia del nostro metodo. |
| [Supporting Narrative Design in Video Games: Proposal and Case Study with an Educational Video Game](https://doi.org/10.1080/10447318.2024.2440143) (2024, pubblicazione online) | Processo proposto con struttura narrativa, fasi e documenti per videogiochi, illustrato in un caso educativo. | Riferimento per distinguere artefatti e responsabilità. Non assumere che sia uno standard universale. |
| [Ink](https://github.com/inkle/ink) / [Inky](https://github.com/inkle/inky), [documentazione ufficiale](https://www.inklestudios.com/ink/) | Linguaggio narrativo e ambiente di scrittura/prova ramificata, licenza MIT; uso dichiarato nei giochi inkle. | Valutare solo a racconto approvato, per scelte, stato, convergenze e conseguenze. Non sostituire il motore Atlas né imporre una nuova grammatica. |

Fonti consultate il 14 novembre 2026 (documentazione primaria e abstract delle ricerche; non revisione sistematica autonoma). Riferimenti esterni per l'autore: non incorporare corsi, testi o immagini protetti da copyright senza diritti. Il metodo combinato è un'ipotesi di progettazione TRAMA da verificare; non un prodotto già validato. Nessun servizio, credenziale, GPU o API a pagamento è richiesto per il primo ciclo. Utilizzare ChatGPT già disponibile e testo portabile, senza presumere disponibilità illimitata o gratuità di ogni modello.

## 3. Ciclo di lavoro: origine, racconto, adattamento

Le fasi seguenti dettagliano la sequenza già stabilita in Storytelling First. Non sono nuove autorità, stati eseguibili o un secondo formato di pubblicazione.

| Fase | Elaborato da conservare | Condizione per avanzare |
|---|---|---|
| N0 — Origine educativa | Scheda di intenzione formativa | Obiettivo preciso, età, contesto, conoscenze, preconoscenze, fonti, vincoli e prestazione osservabile. Docente conferma. |
| N1 — Ideazione narrativa | Tre premesse realmente differenti, ciascuna con protagonista, desiderio, ostacolo, posta in gioco, possibile trasformazione e nesso educativo | L'autore seleziona una premessa motivatamente, oppure le respinge. Nessun mondo imposto. |
| N2 — Fondamenti della storia | Documento di mondo e personaggi; domanda narrativa; sintesi con inizio, sviluppo e fine; scaletta causale | Ogni evento deriva da azioni, regole o conseguenze precedenti; nessuna conoscenza o tecnologia inventata senza indicarla come finzione. |
| N3 — Stesura e continuità | Racconto integrale in prosa, con dialoghi ove utili, non sceneggiatura di schermate; registro di continuità e fonti | Revisione integrale rispetto a scaletta, lingua, personaggi, mondo, cronologia, informazioni possedute e risoluzione. Correggere anche la scaletta se emerge un cambiamento creativo, senza introdurre contraddizioni nascoste. |
| N4 — Revisione editoriale | Racconto leggibile senza apparato didattico o multimediale; valutazione motivata e versione esatta | Solo Human Story Review PASS, comprensivo dei criteri del §5, autorizza il passaggio a World Brief. Se REWORK, tornare a N1/N2/N3 secondo la causa; non a UI o sviluppo. |
| N5 — Adattamento educativo | World Brief, ruolo e agency, distribuzione delle informazioni, modello delle conseguenze, coreografia dell'esperienza, mappa delle evidenze | Il docente verifica che le azioni siano autentiche rispetto alla storia e necessarie per l'obiettivo. Una scelta reale modifica il mondo e consente di osservare e rivedere. |
| N6 — Produzione | Pacchetto di authoring esistente, regia, risorse originali, prove d'uso, guida docente | Solo dopo N4 e N5; usare Studio Atlas, Visual/Audio Factory e il motore esistente. I gate CQP, sicurezza, privacy, accessibilità, diritti e autorizzazione Atlas rimangono obbligatori. |

Il racconto N3 è il primo prodotto creativo. N0–N3 sono lavorabili con strumenti testuali; non si attivano generazione multimediale o implementazione per compensare una storia debole. Il ruolo interattivo può essere ipotizzato in N2, ma non deve trasformare il racconto in una sequenza di istruzioni.

## 4. Scheda minima di origine e dossier narrativo (modello riutilizzabile)

### A. Origine educativa (N0)

- Titolo provvisorio; classe/fascia d'età; durata indicativa; disciplina/contesto.
- Problema formativo: quale difficoltà o interrogativo rende utile l'esperienza?
- Obiettivo: quale conoscenza o strategia comprendere/applicare? Quale prestazione sarebbe osservabile?
- Prerequisiti reali e sostegni; concetti e fonti da verificare. Riferimento curricolare Arena, se verificato; altrimenti «da collegare», mai inventare un identificativo.
- Situazione significativa per i destinatari; possibilità di trasferimento in altro contesto; limite delle inferenze sulla competenza.
- Vincoli di linguaggio, inclusione, sicurezza emotiva, privacy, accessibilità; nessun dato identificativo degli studenti.

### B. Carta d'identità della storia (N1–N2)

- Premessa in una frase; tema espresso attraverso l'azione, non come spiegazione scolastica.
- Regole del mondo, luogo ed epoca, situazione ordinaria prima dell'evento.
- Protagonista: desiderio concreto, bisogno, punti di forza/limiti, relazioni, responsabilità; personaggi di supporto con motivazioni autonome.
- Evento perturbatore, posta in gioco proporzionata all'età, ostacoli progressivi.
- Domanda che suscita curiosità e informazioni inizialmente sconosciute.
- Sviluppo causale: desiderio → azione → ostacolo → scelta → conseguenza → nuova situazione.
- Svolta, risoluzione, trasformazione; perché l'esito conta per il protagonista.
- Legame con l'obiettivo educativo: spiegare perché la conoscenza è indispensabile nella vicenda e quale alternativa impoverirebbe la storia.
- Ipotesi di ruolo del partecipante e ragione plausibile per intervenire (senza decidere pulsanti e interfaccia).

### C. Scaletta gerarchica (N2)

Scrivere prima una sintesi dell'intera storia, poi gli snodi, poi le scene letterarie. Per ogni snodo annotare: evento precedente, intenzione del personaggio, azione, ostacolo, conseguenza, informazione acquisita, cambiamento, successivo evento motivato. Se si possono scambiare gli snodi senza alterare il senso, riesaminare la causalità. Distinguere fatto scientifico, finzione dichiarata e dato incerto.

### D. Racconto e registro di continuità (N3)

Conservare la prosa intera come testo indipendente dal gioco. Mantenere schede essenziali di luoghi, personaggi, regole, cronologia, oggetti, fonti e informazioni conosciute da ciascun personaggio. Dopo la stesura, leggere il racconto dall'inizio alla fine e confrontarlo con la pianificazione. Nessun termine di motore, schermata di stato o menu nella narrazione. Un lettore deve poter capire chi agisce, perché e cosa succede dopo senza la guida di chi ha progettato il prodotto.

## 5. Revisione prima dell'adattamento (N4)

La revisione è qualitativa, con evidenze testuali e stati PASS / REWORK / NON VALUTATO per criterio. Nessuna media numerica compensa un requisito essenziale mancante; nessun punteggio automatico conferisce approvazione. Il giudizio complessivo è umano e legato alla versione esatta.

| Criterio | Domanda da verificare leggendo il racconto |
|---|---|
| Origine educativa | L'obiettivo è specifico, adeguato, corretto e realmente utile nella vicenda? |
| Comprensione | Il lettore sa dove si trova, chi sono i personaggi, che cosa accade e perché importa, senza spiegazioni esterne? |
| Motivazione | Il protagonista ha un desiderio concreto e una posta in gioco credibile anche senza lezione? |
| Curiosità | Nasce una domanda narrativa non banale, diversa dall'indovinare una risposta attesa? |
| Causalità | Gli eventi dipendono da scelte, ostacoli e conseguenze plausibili? |
| Coerenza | Mondo, cronologia, regole, dialoghi e conoscenze dei personaggi restano coerenti? |
| Trasformazione | Una svolta modifica la situazione e/o il modo di agire del protagonista? Il finale risolve o rielabora il problema iniziale? |
| Qualità espressiva | Il testo si legge fluidamente; mostra eventi e motivazioni invece di elencarli come consegne? |
| Integrazione educativa | Se si elimina la conoscenza/strategia oggetto di apprendimento, il problema narrativo diventa realmente più difficile da risolvere? |
| Adeguatezza e correttezza | Lingua, concetti e fonti sono verificati e proporzionati all'età; sono rispettati i vincoli costituzionali? |

Prova di lettura: far leggere il racconto senza illustrazioni, pulsanti né presentazione preventiva; chiedere a un lettore adulto indipendente di rievocare protagonista, desiderio, ostacolo, posta in gioco, svolta e conclusione, e indicare dove si è perso o dove avrebbe voluto continuare. Non suggerire le risposte durante la lettura. Registrare osservazioni concrete, non impressioni di gradimento soltanto. Questo è un controllo editoriale, non uno studio sperimentale sugli studenti. Eventuali prove con minori richiedono il percorso autorizzativo e la mediazione scolastica già previsti.

La revisione narrativa non approva automaticamente il prodotto, il runtime, la pubblicazione o il binding curricolare. Se lo scopo è meglio servito da un laboratorio non narrativo, usare l'eccezione motivata del contratto Storytelling First: non forzare ogni obiettivo in una storia.

## 6. Passaggio dalla storia all'esperienza (solo dopo N4)

Per ogni snodo approvato, scegliere se il lettore deve semplicemente assistere, esplorare, confrontare, decidere, costruire o sperimentare. Non trasformare ogni paragrafo in una domanda.

Mappa di adattamento: snodo letterario → cosa osserva il partecipante → obiettivo funzionale → gesto concretamente possibile → cambiamento nel mondo → informazione nuova → eventuale riflessione → evidenza osservabile. Il mondo mostra le conseguenze nella narrazione: un messaggio cambia, una persona modifica il proprio piano, un oggetto assume una nuova configurazione. I codici tecnici appartengono alla regia, non al racconto.

La scena di trasferimento deve cambiare una dimensione significativa del problema, conservando la struttura della strategia; annotare contesto iniziale, contesto nuovo, cosa resta invariato, sostegno, azione e limite dell'evidenza. Una conclusione narrativa o un quiz identico non costituiscono trasferimento. Il partecipante deve poter sbagliare e rimediare senza giudizi personali, pressione a proseguire o profilazione. Le immagini e i suoni devono avere un ruolo narrativo o cognitivo; il riuso è subordinato alla coerenza, non viceversa.

Usare i contratti già esistenti (Pathway Authoring Package, ActivityPackage, Content Quality Flow, Studio Atlas e autorizzazione Atlas). Nessun nuovo formato, nessun motore alternativo, nessuna produzione automatica prima del giudizio editoriale.

## 7. Operatività in ChatGPT: tre decisioni umane, non una procedura amministrativa

L'assistente raccoglie solo i dati educativi mancanti e propone eventuali assunzioni esplicite. Prepara in autonomia gli elaborati, le alternative e la revisione di continuità. Il docente mantiene tre decisioni essenziali: conferma l'origine educativa, sceglie la direzione narrativa, legge e approva o richiede revisione del racconto intero. Nessun obbligo di copiare manualmente schede tra strumenti. Archiviare elaborati e revisioni in testo portabile secondo il registro esistente; preservare versioni e motivi di modifica. Non richiedere al docente di maneggiare JSON, codice, prompt tecnici o servizi di inferenza.

Istruzione operativa riutilizzabile per l'assistente:
> Agisci come progettista narrativo educativo e autore. Dall'obiettivo e dai destinatari ricava il bisogno formativo e proponi tre premesse realmente diverse. Non partire da interfacce, quiz o risorse disponibili. Dopo la scelta, definisci mondo, desideri, ostacoli e struttura causale; pianifica l'intero arco e poi scrivi il racconto completo in italiano. Verifica fonti, continuità, credibilità, registro e integrazione della conoscenza nella vicenda. Consegna prima la storia come testo leggibile autonomamente, poi una scheda di revisione con rilievi concreti. Non produrre scene interattive o approvare il racconto al posto del docente. Se manca una decisione essenziale, chiedila in modo conciso; se non manca, procedi senza richieste ripetute.

## 8. Prima prova del metodo e condizioni di ripresa

P0: una prova a basso costo con un nuovo tema circoscritto e un lettore adulto indipendente, senza vincolo di riusare i personaggi o le scene di Missione 118. Usare lo stesso obiettivo per confrontare premesse diverse, scegliere quella più solida, scriverla, leggerla e revisionarla. Conservare anche motivi di esclusione. Nessuna illustrazione, codice, pubblicazione o installazione necessaria. Obiettivo della prova: stabilire se il procedimento produce una storia autonoma comprensibile e coinvolgente, non misurare apprendimento o dichiarare superiorità statistica.

Evidenze di uscita: origine educativa confermata; racconto completo e versionato; controllo di continuità; fonti; giudizio umano motivato sui criteri §5; rilievi risolti o decisione REWORK. Solo un PASS esplicito consente di avviare N5. Dopo la prova valutare se il protocollo merita consolidamento canonico e se applicarlo a Missione 118 come nuova opera/revisione, conservando gli originali.

**HOLD:** mantenere congelata la produzione di Missione 118 e lo sviluppo incrementale del motore finché il metodo non sia provato con una storia autonoma. Non scambiare la revisione del presente documento o un controllo CI con il superamento della prova narrativa. Nessuna nuova pubblicazione, spesa o autorizzazione agli studenti.
