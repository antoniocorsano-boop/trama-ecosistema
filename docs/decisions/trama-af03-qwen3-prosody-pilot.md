# AF-03 — Prova di prosodia italiana con Qwen3 VoiceDesign

Stato: CANDIDATE_IMPLEMENTED / OFFLINE_TESTS_ONLY / GPU_NOT_QUALIFIED / NO_REAL_QWEN_AUDIO / NO_PUBLICATION.

## Motivo
Il collaudo AF-02 della PR #303 ha prodotto due WAV tecnicamente validi. All'ascolto, Nicola è preferito per la pronuncia italiana ma non per il ritmo, la cadenza e l'andamento melodico della frase. La revisione umana è REWORK.

## Baseline e confronto
Sorgente: services/audio-factory/tests/fixtures/missione118_provino.json.
Nicola 24 kHz, 10,75 s, SHA-256: 6ca6e6e7644c983ce25a084e15f3b7061e5bbebd19c4bf6eda4e30143898e6d9.
I due piani Qwen3 devono ripetere le medesime parole, senza inserimenti o modifiche:
- natural_narration: cadenza naturale, pause semantiche, intonazione umana.
- restrained_suspense: tensione narrativa in crescita, enfasi contenuta e conclusione espressiva.
Le descrizioni sono parametri interni in lingua inglese; la voce deve parlare in italiano.

## Modello e licenza
Fonte ufficiale: https://github.com/QwenLM/Qwen3-TTS
Pesi: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign
Licenza del modello Apache-2.0. Supporta italiano e controllo tramite istruzioni. Archivio pesi circa 4,52 GB, di cui circa 3,83 GB per il file principale. La memoria reale di inferenza non è ancora misurata.

## Vincoli tecnici
- Niente clonazione vocale, niente dati degli studenti, soltanto testi narrativi fittizi.
- FREE_ONLY: nessuna GPU o API a pagamento, nessun fallback commerciale, nessun deploy.
- Nessun modello o componente GPU viene installato dai controlli automatici.
- Inferenza consentita solo manualmente con comando --execute, modello già presente in directory locale, GPU CUDA, attestazione TRAMA_AF03_FREE_GPU_AUTHORIZED=yes e controllo prudenziale di 12 GiB. Tale soglia è interna, non una specifica ufficiale.
- HF_HUB_OFFLINE e TRANSFORMERS_OFFLINE attivi prima dell'import dei modelli; local_files_only=True.
- La validazione e le prove a sintetizzatore fittizio sono eseguibili esclusivamente con la libreria standard Python.
- Ogni risultato resta CANDIDATE e richiede ascolto umano prima di qualsiasi pubblicazione.

## Decisione da prendere prima della sintesi reale
Qualificare una GPU effettivamente gratuita, con memoria e durata sufficienti e senza addebiti. Non assumere che l'esecutore standard GitHub o ZeroGPU soddisfino già tali requisiti. Non attivare prove reali o distribuire modelli finché questa condizione non è documentata.

## Accettazione del prodotto
Pronuncia e accento italiani, cadenza delle frasi, pause coerenti, profilo tonale, espressività controllata, fedeltà testuale, continuità del timbro. PASS soltanto con valutazione umana documentata.


# AF-03 — Fissazione della narrazione naturale e controllo del segnale

**Esito umano acquisito:** Qwen3 VoiceDesign, variante \`natural_narration\`, è preferita a \`restrained_suspense\` per *Missione 118*. Questo seleziona lo stile di prosodia, **non** certifica identità stabile, interpretazione completa o idoneità alla pubblicazione.

## Diagnosi della saturazione nell'artefatto #13875750466

Ispezione dei due WAV **originali**, non delle copie attenuate, registrati nell'esecuzione GitHub #43063968782.

| Variante | Durata | Campioni prossimi al massimo | Lunghezza massima consecutiva |
| --- | ---: | ---: | ---: |
| Naturale | 10,377 s | 1 su 249045 | 1 |
| Suspense | 12,377 s | 1 su 297045 | 1 |

Il precedente controllo \`CLIPPING_DETECTED\` si attivava su ogni picco al limite anche isolato. Un solo campione a fondo scala non dimostra una deformazione udibile; la precedente indicazione di clipping deve essere interpretata come **allarme conservativo**, non prova conclusiva di distorsione.

**Interventi sul codice:**
- \`audio_signal.py\` produce numero di campioni a fondo scala, frazione e massima sequenza consecutiva; lascia esplicitamente il giudizio di distorsione all'ascolto e a misure ulteriori.
- \`qwen3_prosody.py\`: prima di convertire in PCM16, il percorso locale (se e quando autorizzato) attenua il segnale in virgola mobile per ottenere un margine di picco ≤0,85 e ne conserva la misura nel resoconto. Non elimina deformazioni già prodotte dal modello o dal dimostratore.
- \`af03_public_demo.py\`: in caso di allarme conserva WAV originale e copia per ascolto come **non qualificata**, registrando anche la diagnostica del picco. Nessun nuovo invio al servizio è autorizzato da queste modifiche.

## Continuità narrativa oltre il breve provino

Il profilo \`TRAMA_AF03_QWEN3_NATURAL_V1\` definisce modello, lingua, versione e impronta dell'istruzione espressiva. Il manifesto delle scene richiede il medesimo profilo per ogni unità narrativa, mantiene il testo integro e vieta clonazione o invii automatici. **Usare lo stesso testo descrittivo non garantisce una voce identica tra generazioni**: la continuità di timbro e ritmo va collaudata all'ascolto su più scene, idealmente evitando frammentazioni eccessive.

## Vincoli di rilascio

\`ENGINEERING_TESTS_PASS\` non equivale a \`VOICE_PRODUCT_APPROVED\`. La PR rimane bozza; nessun merge, deploy, servizio a pagamento, dato personale o nuova inferenza è incluso. Per una futura approvazione occorrono prova di voce naturale senza artefatti udibili, accuratezza testuale e verifica della continuità narrativa su più scene.
