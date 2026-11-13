# TRAMA — Filiera dei contenuti C1–C6
Data: 13 novembre 2026. Stato: proposta operativa da consolidare; nessuna autorizzazione runtime o pubblicazione.

## Obiettivo
Produrre contenuti didatticamente leggibili, riutilizzabili e accessibili da Padlet in Atlas senza registrazione dello studente. Le schede visuali devono rendere evidente cosa si può fare e perché, non esporre procedure tecniche. Arena rimane autorità curricolare; Studio Atlas è il luogo di produzione/revisione; Atlas è la superficie pubblica; Docente OS colloca le risorse nella didattica. ADR-020 e Student Library Product Contract v1 rimangono invariati. L'inventario è un documento di coordinamento, non un secondo registro pubblico.

## C1 — Inventario iniziale verificato
Baseline TRAMA main db075a867783e008261628b95694106bf0505ef3; Atlas main c322b07a68d4508ec437941f8688012765e88848.
| Prodotto | Famiglia | Fonte verificata | Stato e prossima azione |
|---|---|---|---|
| Missione 118 — Il futuro è da riprogettare | EduTwin narrativo | Atlas #84 @ f0c29655632a7edc6d78c78d48d006aa8da020a2, content/staging/missione-118/intake.json | HTML V5, 8 WebP, guida; acquisizione in bozza; priorità C2, revisione narrativa, scientifica, diritti, accessibilità, riferimenti Arena e sicurezza. |
| Missione 118 — La luce giusta | Laboratorio | MEDIA-01 ZIP 0.1.1-draft, SHA-256 a4a6ea4727eedbce6e1d56b6cb08246a8dcff3faecabf9f48e1d6bfb69d1ba77; TRAMA #309 | Sei asset, prova tecnica effettuata; feedback umano REWORK sull'orientamento iniziale e prerequisiti geometrici. Non promuovere. |
| Museo Zero — La sala che non torna | Percorso narrativo | products/studio-atlas/lib/canonical/museo-zero.ts; MUSEO-ZERO/STUDIO-ATLAS-PILOT-RECEIPT-v0.1.md | Pilota authoring materializzato, bridge qualificato; revisione prodotto/asset e autorizzazione da accertare. |
| Prima di decidere, cosa manca? | Percorso trasversale | Atlas governance/percorsi-portfolio.json; content/experiences/pathways/pw-missing-information-01.v1.json | Implemented candidate 1.1.0, NOT_RUNTIME_AUTHORIZED. |
| Una soluzione, molti vincoli | Percorso trasversale | Atlas governance/percorsi-portfolio.json; content/experiences/pathways/pw-constraints-tradeoffs-01.v1.json | Implementation candidate 1.1.0, NOT_RUNTIME_AUTHORIZED. |
| Fonte digitale | Attività SMART | Atlas content/experiences/smart/fonte-digitale.v1.json | Definizione implementata; stato pubblico da verificare, binding Percorsi vuoto. |
| Sistema tecnologico | Attività SMART | Atlas content/experiences/smart/sistema-tecnologico.v1.json | Definizione implementata; stato pubblico da verificare, binding Percorsi vuoto. |

Materiali ordinari (agricoltura, energia, disegno tecnico, plastici rurali), prodotti audiovisivi e altri asset: coda di recupero, non conteggiati come prodotti completi. Per ciascuno individuare originale, versione, tipologia, fonte, licenza, obiettivi proposti, eventuale guida e stato. Non inventare asset mancanti. Riferimenti a curricolo e UDA restano per riferimento, mai duplicati.

## C2 — Primo prodotto
Missione 118 V5 è il candidato prioritario. Preservare il pacchetto esatto e le otto illustrazioni; separare qualsiasi revisione come nuova versione. Manifesto: durata suggerita 55 min; Tecnologia/Educazione civica; ambienti notifiche, IA, incrocio intelligente; Nora, Teo, AX-118. Obiettivi dichiarati, non ancora collegati a ID Arena. La relazione al film è dichiarata tematica, diritti PENDING. Verificare anche eventuali audio reali e loro diritti; il nome del file non dimostra che siano presenti.

Prova editoriale unica: entro il primo minuto, il lettore comprende situazione, ruolo, obiettivo, primo gesto e perché conta. Ogni scena introduce solo le conoscenze necessarie all'azione, anticipa i prerequisiti con esempi concreti, mostra la conseguenza, consente correzione e applicazione successiva. Linguaggio per studenti, non termini di governance. Evitare quiz puramente decorativi; preservare storia e scelte. Guida docente distinta, con evidenze osservabili. Revisione scientifica, accessibilità, diritti, privacy, contenuti adatti all'età; verifica sicurezza del runtime controllato. Nessun dato personale o telemetria. Nessun punteggio cognitivo automatico. Nessun PASS umano inventato.

La luce giusta: prima mostrare il disegno in ombra e far muovere la lampada; spiegare in situazione che inclinazione e direzione cambiano il fascio; solo dopo introdurre angoli, confronto delle configurazioni e trasferimento. Percentuale = copertura geometrica, non intensità luminosa o sicurezza meccanica. Tenere la versione esistente intatta.

## C3–C6 — Ordine
C3: estendere/riconciliare i contratti esistenti ActivityPackage v1, Pathway Authoring Package e ATLAS-MAT-PUB-01; distinguere schede, video, simulazioni, percorsi, asset; nessun nuovo standard parallelo. Arena fornisce ID verificati, non sostituibili con testo libero. Riconciliare handoff UDA #262.
C4: biblioteca visuale Atlas, copertine originali, scorrimento orizzontale per temi, poche scelte per vista, titolo e azione comprensibili; accesso anonimo solo ai prodotti esplicitamente autorizzati, link stabili. Bozze restano fuori dal pubblico. Completare il primo percorso intero prima di estendere il catalogo.
C5: consolidare acquisizione, revisione, approvazione, pubblicazione, ricevuta, ritiro, versionamento e controlli; riutilizzare LOI-01/02 già integrati, LOI-03 #310 qualificata ma non integrata. Anteprima Vercel non è un prerequisito della revisione editoriale; niente deploy in questa fase.
C6: EduTwin Studio in ChatGPT, dialogo adattivo e approvazioni; riuso dei mondi e degli asset; interoperabilità con Studio Atlas, non pubblicazione automatica.

## Percorso visibile dell'autore
Una schermata alla volta: scegli contenuto → chiarisci il pubblico e lo scopo → verifica la storia o il compito → prova → collega al curricolo → invia per revisione. Mostrare sempre una sola azione principale e il passo successivo. Per lo studente: scegli dalla biblioteca visuale → scopri la situazione → fai la prima azione → osserva cosa cambia → continua. Queste sono regole UX, non autorizzazione all'implementazione pubblica.

## Esito C1
Inventario iniziale di sette candidati verificati, non inventario esaustivo né elenco di pubblicazioni. Priorità C2 su Missione 118. Nessun cambiamento di codice, diritti, curricolo o runtime. Prossima consegna: scheda di revisione editoriale del prodotto esatto e decisione motivata PASS/REWORK, prima della conversione a contratto pubblicabile.
