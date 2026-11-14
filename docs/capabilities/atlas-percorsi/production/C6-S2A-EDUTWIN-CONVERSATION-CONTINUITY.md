# C6/S2a — Continuità conversazione, bozza e revisione
2026-11-14 — IMPLEMENTATION_CANDIDATE / OFFLINE / NO_RUNTIME / FREE_ONLY.
Dipendenza: C6/S1 #323, commit 2544864f257ab906ba55617d20a6faf4a8f5de87. Questa tranche non sostituisce #321 o #322 e non ne implica approvazione.

## Contratto operativo
Il dialogo in ChatGPT viene tradotto in un brief minimizzato (tema, fascia, intento docente, durata, vincoli), contenuto di authoring strutturato, decisioni, correzioni e riferimenti di asset per digest. Non trasferire il transcript o dati personali; le stringhe libere richiedono controllo umano/privacy, non presumere che una validazione strutturale le anonimizza.
La funzione compileConversationRevision riceve tale input e compila il PathwayProject mediante C6/S1. Il risultato include un Pathway Authoring Package v0.1 in stato AUTHORING, scene e destinazioni esatte, worldAfter, sourceDigest, publicationCandidate DRAFT, runtime false. Non introduce un nuovo contratto di scambio, non dichiara binding Arena, review o riferimenti a evidenze non esistenti. Il package non è REVIEWABLE.
Ogni revisione mantiene projectId e data di creazione, incrementa il numero, conserva decisioni e riferimenti alle risorse e si lega al digest atteso della precedente. Il chiamante locale deve custodire l'archivio delle revisioni e il digest atteso in modo affidabile; un hash non autentica il docente. La funzione non salva né modifica alcun archivio.
Una correzione è associata alla revisione precedente esatta. Una risposta del generatore è proposta e non risolve il REWORK; reviewRequired rimane true. Asset già registrati non si sovrascrivono; nuovi asset hanno id distinto. Le impronte sono riferimenti dichiarati, non prova dei byte; assetBytesVerified resta false.

## Esecuzione e limiti
- Da products/studio-atlas: npx --no-install tsx scripts/compile-edutwin-conversation.ts <input JSON minimizzato> <project-id> <ISO-time> [<parent.json> <expected-parent-digest>]
- Nessuna rete, modello AI, segreto, provider, nuova dipendenza, scrittura automatica o costo.
- Validazione a lista chiusa dei campi in ingresso e delle strutture annidate, limiti dimensionali, blocco campi inattesi (incluse presunte approvazioni e transcript), destinatari coerenti, digest, identità e grafo tramite S1. Non è un endpoint pubblico; nessuna garanzia di anonimizzazione, sicurezza o qualità semantica.
- Supporta il sottoinsieme SUMMARY/CHOICE e stati del mondo già qualificati. Stage/workbench non supportati in questo adapter vengono respinti, non ridotti silenziosamente. S3 dovrà colmare le capacità mancanti prima di renderizzare un'esperienza complessa.
- Il docente finale non esegue la CLI. Questa è l'API interna di sviluppo, non una connessione live a ChatGPT o una superficie di importazione attiva.

## Prove
Test deterministici: compilazione e contratto draft; continuità tra tre revisioni; rifiuto campi inattesi/autorità; parent alterato o obsoleto; sovrascrittura asset e riferimenti feedback falsi; mismatch fascia/digest/orientamento. Le risorse di test sono sintetiche. Nessuna risorsa privata di Missione 118 viene caricata.

## Prossima tranche
S2b: raccordare il dialogo ChatGPT a questo ingresso, con una sola decisione docente e archivio locale delle versioni, verifica dei byte delle risorse e revisione governata; non dichiarare generazione semantica disponibile prima della prova reale. S3: solo dopo qualificazione e review, passaggio al bridge esistente e prova a contesto zero; nessuna produzione estesa se il risultato resta un quiz. Costo zero e autorizzazioni distinti.
