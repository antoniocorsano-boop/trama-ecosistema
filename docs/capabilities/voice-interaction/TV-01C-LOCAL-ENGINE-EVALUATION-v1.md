# TV-01C — Selezione motori vocali locali e prova isolata

Data: 2026-11-15. Stato: CANDIDATE / EXPERIMENT_ONLY / NO_PRODUCT_INTEGRATION.
Dipendenza: TV-01A/B, PR #334 (7 controlli automatici superati; riesame indipendente ancora richiesto).
Nessuna autorità, pubblicazione, provider remoto o modifica dei prodotti.

## Scelta motivata (non qualificazione)

| Candidato | Proprietà documentate | Ruolo |
|---|---|---|
| [Vosk](https://alphacephei.com/vosk/) + [small-it-0.22](https://alphacephei.com/vosk/models) | Italiano, streaming, offline, Android, Apache-2.0 per motore e modello, modello 48 MB; WER pubblicato 16,88% Common Voice, 25,87% MLS, 17,01% mTEDx, non riferito ai comandi TRAMA | Primo candidato comandi brevi; test Linux isolato iniziale, poi Android nativo |
| [Vosk-Browser](https://github.com/lichess-org/vosk-browser) | WASM in Web Worker, Apache-2.0, caricamento modello locale; wrapper da riesaminare, non equivalente al binding Android | Candidato web; richiede verifica manutenzione, dipendenze, packaging, memoria, worker e zero egress |
| [whisper.cpp](https://github.com/ggml-org/whisper.cpp) | MIT; Android, WASM, modelli multilingua; tiny 75 MiB, base 142 MiB (quantizzati più piccoli), maggiore costo computazionale | Comparatore per parlato libero e fallback locale solo dopo qualifica; nessun modello .en |
| [Android SpeechRecognizer](https://developer.android.com/reference/android/speech/SpeechRecognizer) | createOnDeviceSpeechRecognizer da API 31; disponibilità non garantita, lingua da verificare | Comparatore nativo leggero; mai createSpeechRecognizer remoto come fallback |
| [Web Speech processLocally](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition/available_static) | Richiede disponibilità locale e pacchetto linguistico; supporto eterogeneo, [compatibilità](https://github.com/mdn/browser-compat-data/blob/main/api/SpeechRecognition.json) non garantita su Android | Ottimizzazione opzionale desktop, non baseline cross-platform |

Per sintesi vocale: candidato nativo Android con [Voice.isNetworkConnectionRequired](https://developer.android.com/reference/android/speech/tts/Voice), candidato web con [SpeechSynthesisVoice.localService](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisVoice/localService); solo voce italiana locale verificata, prova offline e fallback testuale. Nessuna scelta di voce definitiva. Il test usa eSpeak NG esclusivamente per fixture sintetiche, non come voce definitiva. Nessuna conclusione di accuratezza comparativa prima delle misure.

## Primo esperimento riproducibile

Workflow pull_request dedicato, un job Ubuntu limitato a 8 minuti, senza segreti, permessi contents:read; non pubblica né distribuisce nulla. Installa Vosk 0.3.45 e strumenti di sintesi/conversione, acquisisce modello ufficiale versionato, registra SHA-256 osservato (non firma o digest verificato indipendentemente; requisito aperto per produzione). Durante inferenza disabilita rete con namespace separato e usa esclusivamente frasi sintetiche, nessuna registrazione utente. Non conserva WAV né audio reale. Report JSON con digest, versioni, WER, esiti semantici euristici, tempi misurati. Fallimento di qualità indicato esplicitamente; nessun PASS runtime dedotto dal solo successo CI.

Il banco non esegue azioni applicative: riconosce testo e classifica soltanto etichette sintetiche. Misura due velocità di parlato sintetico, silenzio, frase fuori dominio; riconoscimento spontaneo senza grammatica chiusa per evitare bias. Le euristiche non sono il resolver TRAMA. La soglia preliminare è >= 80% dei comandi sintetici riconosciuti semanticamente (non precisione su voce umana), zero false attivazioni nei due negativi. Rilevare WER e p95, senza fissare un requisito prestazionale mobile da Linux.

## Gate successivi

1. Leggere report reale; eventuale REWORK se soglia non raggiunta; non accettare output mancanti.
2. Ripetere con più voci sintetiche e registrazioni volontarie non personali, confronto Whisper multilingua; rumore, accenti, parole simili, frasi ambigue.
3. Qualificare modello e dipendenze con digest atteso, licenze, SBOM, revisione sicurezza, offline reale.
4. Android nativo e browser/WebView reali: tempi freddo/caldo, RAM, batteria, gestione microfono, pausa/stop/revoca/background, egress, pacchetto locale installabile, accessibilità. Proposta iniziale p95 risposta comando <= 2 s dopo fine parlato su dispositivo target, da misurare e rivedere. Nessun fallback cloud.
5. Solo dopo TV-01A/B riesame e TV-01C qualifica: adapter del Contextual Copilot, poi Docente OS. Nessuna mutazione di dominio, dati studente o pubblicazione.

Fonti consultate 2026-11-15. [Vosk model list](https://github.com/alphacep/vosk-space/blob/master/models.md), [PyPI 0.3.45](https://pypi.org/project/vosk/0.3.45/), [Whisper WASM](https://github.com/ggml-org/whisper.cpp/tree/master/examples/whisper.wasm), [modelli quantizzati](https://huggingface.co/ggerganov/whisper.cpp).
