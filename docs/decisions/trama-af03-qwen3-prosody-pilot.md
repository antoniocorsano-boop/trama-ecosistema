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
