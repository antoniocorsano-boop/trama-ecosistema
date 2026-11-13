# AF-10 — Missione 118: regia narrativa V9

Stato: EDITORIAL_DRAFT / HUMAN_REVIEW_PENDING / NO_INFERENCE / NO_PUBLICATION.
Baseline immutabile AF-09: 9c192f3dcc3afb6756e036829bf17bbc04b1d45e; V7: services/audio-factory/tests/fixtures/missione118_v7_script.md. V8, AF-08 e AF-09 rimangono conservati. La V9 è una variante editoriale, non una sostituzione approvata.

## Principio AF-10

Mantenere il significato educativo e la causalità narrativa. Adattare il parlato alla voce, trasferire i dettagli nominali/numerici alla grafica quando opportuno, preservare i contenuti anche in una trascrizione accessibile. Non ripetere alla cieca la sintesi. Una sola voce sintetica per tutte le scene, Nicola come candidato, non approvato per prosodia. Nessun campione personale, nessuna clonazione. Le indicazioni di regia non sono input parlato e non implicano che il motore sappia eseguirle.

## Copione candidato, unità di senso, regia

Le durate e pause sono ipotesi di montaggio; l'allineamento effettivo deriva dall'audio reale. Ogni unità resta intera per preservare il legato; pause dopo unità e ai cambi scena, non dopo ogni parola. Le barre verticali nelle indicazioni sono separatori editoriali, non input. Le illustrazioni originali sono vincolanti: nessuna sostituzione o generazione di nuovi asset. Verificare corrispondenza degli elementi visivi prima del montaggio.

### S1 — 2045. Una città sempre connessa

- S1U1: Nel futuro, gli schermi e gli assistenti digitali ci seguono ovunque.
- S1U2: Dovevano aiutarci. Ma qualcosa non va.
- Regia: apertura calma, contrasto crescente nella seconda unità, enfasi naturale su “qualcosa non va”.
- Pausa aggiuntiva proposta tra unità: 350 ms.
- Visuale: illustrazione originale della città; mantenere o sovrapporre “2045” e rendere leggibili schermi e sistemi automatici.
- Durata orientativa: 10–13 s.

### S2 — Il progetto di Teo

- S2U1: Teo deve finire il suo progetto. Ogni nuovo messaggio lo distrae.
- S2U2: Ma se spegne tutto, può perdere un avviso importante.
- S2U3: Come può tornare a concentrarsi?
- Regia: inquietudine quotidiana, non allarmismo; evidenziare il contrasto fra distrazione e utilità; domanda finale rivolta allo spettatore.
- Pause aggiuntive proposte: 250 ms, 450 ms.
- Visuale: illustrazione originale di Teo al progetto; messaggi/avvisi, senza nuove immagini. Eventuale testo “Distrazioni o informazioni utili?”.
- Durata orientativa: 13–17 s.

### S3 — Una risposta troppo sicura

- S3U1: Teo chiede aiuto al suo piccolo robot. La risposta sembra giusta.
- S3U2: Ma non torna con ciò che vede.
- S3U3: Anche una macchina può sbagliare. Come può Teo accorgersene?
- Regia: fiducia iniziale, svolta breve e credibile, chiusura interrogativa. Non scandire artificialmente i nomi.
- Pause aggiuntive proposte: 350 ms, 300 ms.
- Visuale: illustrazione originale di Teo e del robot; identificatore “AX-118” solo a schermo; risposta del robot e dato osservato, se già presenti nell'asset.
- Durata orientativa: 13–17 s.

### S4 — Quando mancano informazioni

- S4U1: Nora scopre lo stesso problema nella città. Due dati raccontano storie diverse.
- S4U2: Se mancano informazioni, anche una macchina deve saper dire: non lo so.
- S4U3: E chiedere un controllo.
- Regia: tono riflessivo, pausa naturale prima di “non lo so”, chiusura ferma ma non declamatoria.
- Pause aggiuntive proposte: 300 ms, 300 ms.
- Visuale: illustrazione originale di Nora e modello della città. Eventuale testo “Dati da verificare”.
- Durata orientativa: 13–17 s.

### S5 — Il tentativo numero 118

- S5U1: Nora manda un messaggio nel passato. Ha già provato tante volte, senza riuscirci.
- S5U2: Ora tocca a voi.
- S5U3: Per cambiare il futuro servono tre cose: attenzione, verifica e responsabilità.
- Regia: inizio raccolto, appello diretto, conclusione con speranza e senso di responsabilità. Le tre parole finali formano un'unica frase.
- Pause aggiuntive proposte: 450 ms, 400 ms.
- Visuale: illustrazione originale del messaggio; “117 tentativi falliti”, “Missione 118”, “Attenzione · Verifica · Responsabilità”. Le informazioni solo visive devono essere presenti anche nella descrizione accessibile.
- Durata orientativa: 14–18 s.

## Montaggio e accessibilità

Transizione fra scene: 500 ms aggiuntivi come prima proposta, da verificare sul segnale reale. Non sommare due volte i silenzi presenti nell'audio. Nessuna accelerazione o compressione per imporre le durate. Durata totale indicativa: 65–84 s, comprese quattro transizioni di 500 ms; una stima, non un vincolo. Associare ciascuna scena all'asset originale tramite identificatore e hash prima di produrre il video. Titoli di scena non pronunciati. Sottotitoli corrispondenti esattamente alle parole dette, temporizzati solo dopo sintesi; niente guide fonetiche nei sottotitoli. Separare didascalie grafiche e descrizione accessibile dai sottotitoli. Preservare l'identità dei personaggi e tutte le versioni precedenti. Non alterare le illustrazioni originali: eventuali sovrimpressioni su livelli separati.

## Verifica semantica

- S1: tecnologia per aiutare le persone, non garanzia di correttezza.
- S2: distrazioni e rischio di perdere informazioni utili; scelta consapevole.
- S3: risposta automatica fallibile, confronto con osservazione.
- S4: dati discordanti, incertezza da dichiarare e verifica da richiedere.
- S5: viaggio nel passato, 117 tentativi falliti, nuovo tentativo, responsabilità della squadra, tre principi invariati.
- Identità AX-118, anno 2045 e numerazione 117/118 preservati in grafica e descrizione accessibile.

## Piano di prova, non autorizzazione di esecuzione

1. Revisione editoriale del copione e mappatura verificata sulle cinque illustrazioni esistenti.
2. Candidato pilota con sole S3U3 e S5U3, stessa voce e configurazione AF-09: interrogazione e chiusura retorica. L'ASR controlla corrispondenza testuale ma non certifica la qualità espressiva.
3. Ascolto umano su pronuncia, naturalezza, gruppi di senso, pause e timbro. Se necessario, una riscrittura mirata prima di una nuova autorizzazione; niente retry automatici.
4. Solo dopo approvazione del pilota: produzione V9 una tantum su CPU pubblica gratuita, previo controllo licenze e autorizzazione vincolata al commit. Conservazione WAV di ogni unità, scene, montaggio, ricevute, hash e confronto ASR.
5. Montaggio con asset originali, sottotitoli allineati, verifica accessibilità e confronto con V8; pubblicazione separatamente autorizzata.

Nessun avvio di sintesi, modifica di main, merge, deploy o pubblicazione autorizzati da questo documento.
