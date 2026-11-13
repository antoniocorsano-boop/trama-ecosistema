# AF-04 — Regia narrativa con voce sintetica predefinita

## Decisione prodotto, 12 novembre 2026
Missione 118 ha superato l'importazione e il collaudo interattivo (PR #306). La narrazione AF-03 continua di 77,347 s (run 43164933629) è stata rifiutata dall'utente per qualità espressiva. Non ripetere il generatore VoiceDesign né considerare il WAV approvato. Nicola resta riferimento di pronuncia, non di espressività.

Separare sceneggiatura canonica, regia, voce sintetica predefinita, sintesi, montaggio e ascolto. Nessuna registrazione personale necessaria; vietati campioni personali, clonazione e servizi a pagamento. Nessuna pubblicazione o assegnazione automatica.

## Prima tranche implementata
- Compilatore deterministico `narrative_direction.py`: testo e impronta invariati, un unico identificatore del narratore predefinito, istruzioni espressive per scena, pause di montaggio separate.
- Fixture di regia per le cinque scene effettive del prologo V5, collegate alla sorgente esatta della PR Atlas #84.
- Test offline: fedeltà, stabilità, copertura, ordine, rifiuto input personali/istruzioni arbitrarie, nessuna autorità di generazione.
- Il compilatore non sintetizza audio e non dimostra che il motore rispetti le istruzioni.

## Candidato di prova, non adottato
Qwen3-TTS 12Hz 1.7B CustomVoice, speaker integrato Ryan, lingua Italian, istruzioni di stile. La scheda ufficiale conferma voci fisse, italiano e controllo espressivo; Ryan ha lingua nativa inglese, quindi l'accento italiano è un rischio concreto. Non adottare prima della prova. La versione 0.6B non offre il medesimo controllo per istruzione. Fonti: https://qwen.ai/blog?id=qwen3tts-0115 e https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice .

## Prossimi gate
1. Prova breve a testo identico con una voce predefinita, solo dopo verifica del costo zero e autorizzazione esplicita. Confrontare con Nicola e il prologo naturale precedente. Non generare subito cinque scene.
2. Pronuncia italiana, fedeltà parola per parola, pause, accento, naturalezza; approvazione di ascolto. Identità fissa dichiarata non equivale a continuità percepita.
3. Generare due scene consecutive soltanto se la prova breve passa; verificare continuità. Poi cinque scene con ricomposizione senza modifica del timbro.
4. Nuova versione dell'attività con impronte per i media, mantenendo V5 intatta; revisione Android, accessibilità, diritti e raccordo al curricolo/lezione.
5. Interfaccia Studio Atlas soltanto quando la capacità è qualificata: testo, tono, ascolto, correzione della singola scena, approvazione. Nessun tecnicismo nella vista docente.

Stato: OFFLINE_DIRECTION_COMPILER / CANDIDATE_NOT_ACOUSTICALLY_QUALIFIED / NO_INFERENCE / NO_PUBLICATION.
