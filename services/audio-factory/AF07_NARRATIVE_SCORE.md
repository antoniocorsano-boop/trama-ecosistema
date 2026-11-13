# AF-07 — Partitura narrativa, revisione localizzata e controllo del parlato
Decisione 12 novembre 2026. Il prologo Azzurra è generato in cinque scene; prime due approvate nella sequenza 739c278bc7ed8019ec424962c4dcab84e5d850318481dfdd603eaea0d542a823; prologo completo in REWORK, non pubblicabile. Nessuna rigenerazione globale. Preservare gli asset e il testo canonico, distinguere testo mostrato e narrato.

## Riferimenti verificati
- Speech Studio, soniqo/speech-studio @ 202b9aaa5a8551bb1bafc90788d8e570cc19014c, Apache-2.0: README e useSynthesizeAll.ts descrivono battute, montaggio, motore residente, verifica ASR e revisione. Riferimento architetturale, non importare il prodotto o le funzioni di clonazione.
- WhisperX, m-bain/whisperX @ 5d3678b8535698a2826a5db9eb3e4105aef85dd9, BSD-2-Clause: CPU int8, allineamento italiano; ASR può normalizzare errori di pronuncia, numeri e nomi; allineamento forzato non prova che il testo sia stato pronunciato. No diarizzazione o token necessari per il nostro caso.
- VoxCPM, OpenBMB/VoxCPM @ 300e4260b509066151d623dc9c0aa922cf82232b, Apache-2.0: italiano e istruzioni di stile in Voice Design senza riferimenti audio. README indica llama.cpp-omni (https://github.com/tc-mb/llama.cpp-omni) per GGUF CPU; risorse, fedeltà, voce stabile e controllo espressivo non ancora provati.
- OmniVoice e MOSS-TTS-Nano: candidati secondari, non adottati; no campioni personali o clonazione.

## AF-07A — Decisione architetturale
Sceneggiatura canonica → partitura per battuta (intento, pausa, enfasi, pronuncia, capacità del motore) → motore sostituibile → ASR indipendente → confronto lessicale → allineamento temporale e montaggio non distruttivo → ascolto umano → approvazione. Distinguere valori richiesti da parametri realmente applicati. Pause gestibili in post-produzione, regia emotiva non garantita. Nessun feedback automatico illimitato, nessuna pubblicazione o sostituzione implicita.

## AF-07B.1 — Primo componente effettivo
af07_lexical_review.py confronta trascrizione fornita e testo canonico, verifica impronta della sorgente, identifica inserimenti, omissioni, sostituzioni, conserva accenti e segnala numeri/sigle non equivalenti. Non produce trascrizioni, non calcola WER ottimale, non certifica fonetica o tempistica; ogni esito richiede revisione. Nessuna richiesta di rete. CLI: python services/audio-factory/af07_lexical_review.py --scene 5 --transcript transcript.txt .
Test deterministici su fixture canonica e difetti simulati, non evidenza di ASR reale.

## Ordine dei prossimi gate
B.2: qualificare un trascrittore CPU gratuito (WhisperX o faster-whisper per la prima trascrizione; allineamento italiano solo dopo confronto indipendente) sul prologo già esistente, incluse differenze note. Conservare SHA dell'audio, versione/pesi e parametri, transcript e intervalli; nessuna normalizzazione nascosta.
C: solo dopo prova di risorse, VoxCPM2 Voice Design con voce sintetica e un testo breve, nessun audio di riferimento.
D: partitura narrativa con pause misurabili e capacità esplicite, correzione selettiva, tracciabilità dei segmenti.
E: editor Studio Atlas, nessun tecnicismo nella vista docente. Missione 118: integrazione solo dopo ascolto e verifica licenza, conservazione degli asset e collaudo Android.
FREE_ONLY, nessuna risorsa pagante, nessun dato studenti, nessun campione vocale personale, no clonazione, no merge/deploy/publication. Stato AF07_ARCHITECTURE_CONSOLIDATED / LEXICAL_COMPARATOR_IMPLEMENTED / ASR_NOT_QUALIFIED / SYNTHESIS_NOT_AUTHORIZED.
