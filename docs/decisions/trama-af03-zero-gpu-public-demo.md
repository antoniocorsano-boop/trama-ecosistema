# AF-03 — Prova dimostrativa gratuita Qwen3 ZeroGPU

Questa è un'unica prova esterna di ascolto, NON un provider Audio Factory di produzione. La registrazione invia esclusivamente lo script narrativo fittizio di Missione 118 e due descrizioni vocali al dimostratore ufficiale https://huggingface.co/spaces/Qwen/Qwen3-TTS . ZeroGPU prevede quote anonime gratuite; nessun token, password, pagamento o dato degli studenti sarà trasmesso.

Il modello richiesto è VoiceDesign, 1,7B. Si usa la lingua Auto del dimostratore perché la scelta italiana non è esposta nell'interfaccia, benché il modello supporti ufficialmente l'italiano. Due condizioni: natural_narration e restrained_suspense, testo invariato rispetto al provino Nicola. Tentativi massimi: due, senza ripetizioni in caso di errore o quota esaurita.

Il flusso GitHub si attiva esclusivamente con etichetta af03-demo-autorizzato sulla PR #304, su esecutore standard e massimo nove minuti. La risposta viene qualificata come audio mono 24 kHz, con ricevute e impronte SHA. Un eventuale stato CANDIDATE non equivale all'approvazione narrativa. Nessun merge, nessun deploy, nessun fallback a pagamento e nessuna clonazione vocale.


## Esito prima prova e correzione della conservazione

L'esecuzione GitHub #43062991707 ha raggiunto il dimostratore Qwen3 e ottenuto l'audio della variante `natural_narration`, ma il file è stato respinto per `CLIPPING_DETECTED` e cancellato; la seconda variante non è stata richiesta. La versione successiva conserva l'originale come `source-clipped.wav` e genera una copia a volume ridotto solo per l'ascolto. Lo stato resta esplicitamente `LISTENING_ONLY_UNQUALIFIED`, con impronte di entrambi i file e frazione dei campioni saturi. Ridurre il volume non recupera una distorsione preesistente e non costituisce approvazione tecnica.
