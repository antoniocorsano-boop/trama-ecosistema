# CQP-03 — Raccordo Audio Factory e regia vocale di Missione 118
Stato: IMPLEMENTATION_CANDIDATE / READ_ONLY / VOICE_NOT_QUALIFIED / NO_PUBLICATION
Data: 13 novembre 2026.

## Identità e conservazione
Candidato: trama-missione-118-2026, 0.3.0-draft, manifestDigest 407299aa62ac3a190ff6755ac35bf4874d786cab0255e1f8dee426415315f395. CQP-02 riguarda dieci risorse originali; V7 non contiene audio. Copione recuperato dalla conversazione: 2007 byte, SHA-256 5d66b16b503d4d1c85b153dd32fc4ad3f8abd209d9515c7f5d61f9b9d357aeed. [Copia conservativa](MISSIONE-118-V7-COPIONE-VOCE.md). Non è un'approvazione editoriale. Non alterare V7, le otto illustrazioni o le ricevute CQP-02. Una versione con audio richiede nuovo manifesto e nuova verifica.

## Evidenze storiche AF-01/AF-02
[PR #303](https://github.com/antoniocorsano-boop/trama-ecosistema/pull/303), head d9a69e22c14e1e12649db3fca7679e4a16664809; [run 43056204146](https://github.com/antoniocorsano-boop/trama-ecosistema/actions/runs/43056204146); [ricevuta della generazione](https://github.com/antoniocorsano-boop/trama-ecosistema/pull/303#issuecomment-6801093981); [revisione umana REWORK](https://github.com/antoniocorsano-boop/trama-ecosistema/pull/303#issuecomment-6801143197).
- Kokoro im_nicola: 10,75 s; SHA-256 6ca6e6e7644c983ce25a084e15f3b7061e5bbebd19c4bf6eda4e30143898e6d9.
- Kokoro if_sara: 9,80 s; SHA-256 a342536ed6625cec1536b5720e7273ac309b5ed1f18c108e341e2dfa78571bad.
- Generazione reale superata; revisione umana REWORK per prosodia. Nicola riferimento di articolazione, non voce definitiva. Artefatto storico 13871363498 con conservazione dichiarata di sette giorni: non assumere disponibilità permanente. Nessuno dei provini è una traccia V7.
- Le ricevute AF-01 sono candidate, legate alla richiesta e al digest del piano, non alla versione finale. Non convertirle in VOICE_TECH o VOICE_LISTEN. PR #303 non integrata. Azzurra e altre soluzioni restano candidate, senza scelta automatica o nuova inferenza.

## Regia proposta da sottoporre a revisione
Una voce narrante coerente nelle cinque scene. Durate nominali, non limiti rigidi; regolare immagini e pause sull'audio effettivo. Testo leggibile invariato; pronunce e indicazioni di regia separate, mai lette come testo. Lettura proposta di AX-118: «a iks centodiciotto», da verificare all'ascolto. Leggere i numeri per esteso.

| Scena | Intento | Regia | Controllo specifico |
|---|---|---|---|
| 01 (12 s) | Scoperta e dubbio | Apertura calma; pausa prima di «Ma qualcosa» | Cadenza e contrasto finale |
| 02 (13 s) | Empatia per Teo | Ritmo naturale; domanda finale non meccanica | Notifiche, concentrazione |
| 03 (13 s) | Dubbio e verifica | Pausa dopo la risposta; rilievo su «non significa» | AX-118 e senso scientifico |
| 04 (12 s) | Comprendere il limite | Tono riflessivo; spazio a «riconoscere il dubbio» | Chiarezza della conseguenza |
| 05 (13 s) | Invito ad agire | Crescita controllata; tre principi distinti | Centodiciassette, finale deciso |

## Raccordo operativo
Riutilizzare AudioGenerationPlan e AudioExecutionReceipt AF-01 per i motori compatibili; non estendere implicitamente il contratto Kokoro. Il futuro adattatore governato associa per scena ID attività, versione e digest del candidato, digest del copione e segmento, ID richiesta, digest piano e ricevuta, motore/modello/voce/lingua, licenze, digest dei byte della traccia, durata reale, trascrizione ed esito tecnico. Cinque segmenti e montaggio finale necessari. Conservare originali e derivati; revisione separata con identità/ruolo verificati, decisione, motivazione, timestamp e digest di traccia/montaggio ascoltati. Sostituzione selettiva: nuova impronta, nuova verifica della scena e del montaggio; rivalutare il pacchetto esatto. Nessuna voce mancante, errata, duplicata, obsoleta o non verificata può dare PASS.

## Proiezione Studio Atlas
Quando CQP-02 ha verificato le risorse V7, mostrare in Produci il contesto: copione conservato, cinque scene, audio non qualificato, prossimo passo editoriale. Non è una nuova evidenza di qualità né un comando di generazione; VOICE_TECH e VOICE_LISTEN restano PENDING. Nessuna approvazione umana dedotta da documento, provini precedenti, JSON importato o trascrizione. La vista non esegue richieste esterne.

## Confini
FREE_ONLY, no clonazione, no dati personali, no inferenza automatica, no merge/deploy/pubblicazione. Prima approvare copione/regia e scegliere esplicitamente una voce candidata; poi produrre cinque tracce, conservarle e sottoporle ad ascolto integrale. Completare l'adattatore autentico con fonti effettive, non segnaposto. CQP-03 non qualifica alcun audio del prodotto.
