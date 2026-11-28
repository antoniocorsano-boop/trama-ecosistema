# C2 — Missione 118: revisione editoriale V5 e prescrizioni V6
Data: 13 novembre 2026. Stato: EDITORIAL_REWORK_CANDIDATE / NO_PUBLICATION.
Revisione documentale del codice sorgente, non prova browser né approvazione umana.

## Fonte congelata
Atlas PR #84 @ f0c29655632a7edc6d78c78d48d006aa8da020a2.
experience.html Git blob 09c16f9501bcfcf76bccd4624568a99d676ad645; SHA-256 dichiarato nel manifesto 22971583a2a7dc2d45947b4ce19a843a057b05864b9a2b896762728c9519175e.
teacher/guida_docente.html Git blob a8e32ebb8a193d9486962548145e78f50f7d0f92; SHA-256 dichiarato ef7fdb31395901843fd844341399d052ee8cb42c859b7425c0f94e3d8bac8541.
intake.json Git blob 62fd9e379055daaca8c12bdfce48e74132d03303.
Otto immagini originali incorporate (cover, city, lab, traffic, end, Nora, Teo, AX-118); nessuna rigenerazione, nessuna modifica alla V5.

## Esito: REWORK mirato
Punti forti: mondo riconoscibile, prologo coerente, tre contesti vicini all'esperienza digitale, una decisione per schermata, possibilità di correzione senza timer, principio finale liberamente scelto, produzione conclusiva fuori dallo schermo, guida per gruppi. Non ricominciare da zero.

| Rilievo | Evidenza nel sorgente | Modifica V6 | Priorità |
|---|---|---|---|
| C2-01 Orientamento | Cinque scene di prologo prima del briefing; nella prima scena è assente il ruolo concreto del partecipante. | Apertura: richiesta diretta di Nora, problema di Teo, ruolo di squadra, prima azione comprensibile. Prologo breve e facoltativamente ascoltabile; mantenere mondo e immagini. | Alta |
| C2-02 IA e conoscenze | claims propone quattro frasi da dichiarare corrette/errate; risposte corrette generiche, indizio della fase claims non fornisce sempre evidenza scientifica. | Materiale di consultazione originale e breve: confronto fra pannello illuminato e oscurato, batteria come accumulo di energia; chiedere quale evidenza giustifica il giudizio; feedback specifici. Nessuna API esterna. | Alta |
| C2-03 Conseguenze | chooseAnswer accetta solo risposte attese, mostra feedback, poi ripete/avanza; notifiche e semaforo descrivono conseguenze più che mostrarle; principio finale libero. | Rendere osservabile il risultato nel mondo: riepilogo del filtro, esempio di risposta del tutor con indizi, stato illustrato e chiaramente simulato dell'incrocio. Inserire una variazione di contesto e motivazione libera non valutata automaticamente. | Alta |
| C2-04 Audio | narrationTracks contiene {} (0/5 tracce); interfaccia studente mostra impostazioni, caricamento audio, esportazione HTML; selezione voce privilegia anche online. | Recuperare e verificare registrazioni originali prima di dichiarare audio professionale. Separare authoring e fruizione; testo sempre disponibile; voce registrata revisionata o assenza di audio dichiarata; non promettere offline/privacy per voci remote. | Alta |
| C2-05 Coerenza editoriale | Guida docente si identifica come V3, esperienza V5. Guida indica 45–55 min, manifesto 55. | Guida V6 allineata, durata indicativa, obiettivi ed evidenze; non cambiare valori senza motivazione. | Media |
| C2-06 Accessibilità | render sostituisce app.innerHTML; non trasferisce focus dopo aggiornamento. CSS <=580px di altezza nasconde .voice: rischio perdita di dialoghi, istruzioni e feedback. | Focus sul nuovo titolo, tastiera e lettore di schermo, dialoghi essenziali sempre leggibili, reflow e contrasto; verificare in browser/Android/LIM. | Alta |
| C2-07 Salvataggio e dati | localStorage salva stato incluso errors; ripristino azzera feedback ma lascia phase result, response() ricade in play. In iframe opaco storage può fallire. | Usare stato volatile per prima pubblicazione, reset esplicito; rimuovere conteggio correzioni dalla restituzione pubblica; nessun punteggio cognitivo, nessun dato personale, nessuna telemetria. Se si vuole ripresa locale, qualificarla separatamente. | Alta |
| C2-08 Pubblicazione | manifest rights, accessibility, mobileProduct, teacher, curricolo PENDING; ID Arena vuoti; quattro autorizzazioni false. | Verificare diritti, accuratezza scientifica, accessibilità, associazione Arena autentica, runtime controllato e decisione umana. | Bloccante |

## Regia V6: sette passaggi, non sette schermate obbligatorie
1. Messaggio da Nora: la squadra deve aiutare Teo a riprendere il controllo del suo ambiente digitale; anticipare le tre missioni e il gesto iniziale. Azione: Entra nella città.
2. Città: prima un esempio concreto di interruzione; poi costruisci e prova il filtro. Distinguere priorità e contesto, non una classificazione universale delle notifiche. Variazione: un promemoria può aspettare se lo studio è in corso e non urgente. Azione: Prova il filtro.
3. Laboratorio: AX-118 formula una spiegazione; mostra materiali di verifica prima del giudizio. Azione: Controlla con gli indizi. Nessun accesso a servizi di IA.
4. Tutor: confronta un aiuto che offre la soluzione con uno che stimola il ragionamento; configura il tutor e osserva un esempio. Azione: Prova il tuo tutor.
5. Incrocio: modello puramente didattico e astratto; osserva incompatibilità e incertezza, simula una scelta e la necessità del controllo umano. Non presentare la sequenza come procedura applicabile a un impianto reale. Azione: Verifica il modello.
6. Finale: scegli un principio e spiega perché, osserva come collega le tre situazioni; codice eventualmente mantenuto come elemento narrativo, non prova di competenza.
7. Trasferimento: progetta con il gruppo una tecnologia, disegno fuori schermo, problema, soluzione, possibile errore e controllo. Nessun invio di risposte, nomi, valutazioni o dati personali. Guida per la discussione.

## Esempio di apertura originale per V6
Titolo: Una richiesta dal futuro.
Nora: «Teo sta cercando di finire il suo progetto. Ma il suo schermo continua a interromperlo e il suo assistente gli dà risposte che non riesce a controllare. Ci aiuti a capire quali sistemi dobbiamo cambiare?»
Obiettivo visibile: «Aiuta la squadra a rendere la tecnologia più utile e controllabile.»
Prima azione: «Entra nella città».
Proposta di testo da rivedere, non sostituzione automatica del prologo esistente.

## Gate della successiva revisione
- Test di comprensione iniziale: un lettore identifica situazione, ruolo, obiettivo e primo gesto senza spiegazioni esterne.
- Ogni ambiente: informazione utile prima della richiesta, azione significativa, conseguenza visibile, correzione, cambio di contesto almeno una volta nell'esperienza.
- Guida allineata; audio 0/5 non presentato come completo; prove di accessibilità, privacy, runtime e diritti distinte.
- Esatte otto immagini V5 conservate; versionamento V6 separato.
- Nessun merge, deploy, pubblicazione o cambio di authorizzazione. C3 può preparare mapping ma non assegnare ID curricolari non verificati.
