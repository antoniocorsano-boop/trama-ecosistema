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

## Primo risultato reale — ciclo f2623e77

Run [43758444027](https://github.com/antoniocorsano-boop/trama-ecosistema/actions/runs/43758444027): Governance PASS, screening ASR REWORK. Vosk free: 5/12 intenti corretti (41,67%), WER 27,59%, 0/4 false attivazioni, p95 0,494 s, caricamento 0,349 s. Rete: sola interfaccia lo. SHA-256 osservato: 9ec65e75861d1c6c2e457cccd932705340dcdf233f5b239f00733b4de0bf3267. Il report originale è conservato come artefatto temporaneo del run; nessuna qualifica Android o voce umana. Il vecchio test resta rosso per qualità insufficiente; non mascherare il risultato.

### Secondo ciclo: confronto appaiato

Il workflow dedicato `TV-01C Paired Local ASR` confronta Vosk libero, Vosk con vocabolario contestuale e [whisper.cpp v1.7.6](https://github.com/ggml-org/whisper.cpp/tree/v1.7.6) con modello base multilingua (142 MiB, SHA-1 pubblicato dal [progetto](https://github.com/ggml-org/whisper.cpp/blob/master/models/README.md)). Lo stesso campione sintetico viene passato a tutti i motori in un namespace senza rete; 20 positivi (8 varianti holdout), 14 negativi (silenzio, negazione, fuori dominio, ambiguità e comandi mutativi), due velocità. Il vocabolario non contiene esattamente le frasi di prova e comprende [unk]; il classificatore è diagnostico, non autorizzativo. Soglie provvisorie: >=80% positivi, >=75% holdout, zero false attivazioni. Il confronto misura anche WER e p95, ma il CLI Whisper include caricamento del modello a ogni invocazione: non equiparare direttamente a latenza warm di Vosk. Digest Vosk fissato al precedente download osservato (non verifica indipendente), digest Whisper confrontato con SHA-1 documentato, SHA-256 registrato. Nessuna acquisizione di dati reali, nessuna integrazione. I risultati effettivi determinano il passo successivo; anche un PASS sintetico richiederà prova umana/Android.

## Risultato comparativo — ciclo fc667fdb

Run [43758757066](https://github.com/antoniocorsano-boop/trama-ecosistema/actions/runs/43758757066). Tutte e tre le configurazioni REWORK; Governance PASS. Per ciascun motore 20 positivi, 14 negativi (inclusi 8 holdout positivi).
| Motore | Accuratezza | Holdout | False attivazioni | WER | p95 |
|---|---:|---:|---:|---:|---:|
| Vosk libero | 50% | 62,5% | 2 | 26,53% | 0,456 s |
| Vosk contestuale | 90% | 75% | 2 | 46,94% | 0,034 s |
| Whisper Base | 5% | 12,5% | 0 | 70,41% | 1,508 s |

Il motore contestuale perde la negazione in entrambi i campioni «non aprire il calendario», trascritti «apri calendario». Il motore libero perde il secondo intento nella frase ambigua. Il risultato vieta l'esecuzione automatica sulla sola trascrizione. La prestazione Whisper su queste voci sintetiche e questo classificatore non dimostra inferiorità su parlato umano; non promuovere né scartare definitivamente il motore.

### Dimostratore di interazione controllata — esperimento separato

`experiments/tv-01c/review-demo/index.html` (servire mediante HTTP localhost o HTTPS, non aprire direttamente come file): modalità testuale e riconoscimento del browser esclusivamente quando l'API standard dichiara disponibile it-IT con processLocally=true. Nessun download di pacchetto implicito, nessun fallback remoto. La verifica del browser non è prova indipendente dell'assenza di egress: serve prova su dispositivo senza rete. Sintesi di una frase fittizia soltanto con voce italiana localService=true. Nessun modello Vosk/Whisper incorporato nel dimostratore; la prova riguarda l'interazione e la disponibilità del motore del dispositivo, non la qualifica Vosk. Solo testo modificabile, lista chiusa di intenti dimostrativi, conferma esplicita a schermo, ricevuta SIMULATED; nessuna route reale o modifica dati. Test del guard: mancata conferma, negazione, ambiguità, modifica testo, target errato, conferma ripetuta e invalidazione. Nessuna pubblicazione, nessun dato reale. Prova manuale futura su Android in contesto locale: permessi, interruzione/background, disponibilità italiana, assenza egress, accessibilità; rivalutazione separata del riconoscimento su campioni umani non personali. Riferimenti: [MDN available](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition/available_static), [MDN localService](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisVoice/localService).

### Semplificazione dell'interfaccia — richiesta utente

La superficie sperimentale presenta un solo comando microfono (Parla/Interrompi), richiesta modificabile, esempi rapidi, Continua e conferma contestuale visibile solo quando necessaria. Le informazioni tecniche e la prova della sintesi sono in una sezione espandibile. La disponibilità della voce viene verificata su gesto esplicito; nessuna acquisizione remota. Nuova richiesta, modifica, annullamento e uscita invalidano l'approvazione precedente; risultati troppo lunghi vengono rifiutati anziché troncati. La conferma resta una simulazione, non apre applicazioni. Aggiunta prova automatica in Chromium a larghezze 320/390/768 px, modalità testuale e riconoscimento simulato, con acquisizione schermate: non equivale a una prova di microfono reale o Android. Nessuna distribuzione pubblica.
