# AF-03 — Sintesi espressiva italiana, prova Qwen3 isolata

La PR AF-03 dipende da AF-01/02 e non modifica il ramo principale. Il codice permette verifiche senza pesi, rete o GPU.

Verifiche senza inferenza:
python services/audio-factory/qwen3_prosody.py --plan services/audio-factory/tests/fixtures/missione118_qwen3_natural.json --validate-only
python services/audio-factory/qwen3_prosody.py --plan services/audio-factory/tests/fixtures/missione118_qwen3_suspense.json --validate-only
python -m unittest discover -s services/audio-factory/tests -p 'test_*.py' -v

Esecuzione **locale** del modello NON ancora qualificata né autorizzata: richiede un'installazione opzionale isolata di requirements-qwen3-optional.txt, modello VoiceDesign già scaricato localmente, GPU gratuita qualificata, variabile TRAMA_AF03_FREE_GPU_AUTHORIZED=yes, --execute, --model-dir e --output. Il programma non scarica pesi né pubblica l'audio. Il risultato resta soggetto a revisione umana.

Decisione: docs/decisions/trama-af03-qwen3-prosody-pilot.md

## Esito dimostrativo e profilo selezionato

La prova pubblica [GitHub #43063968782](https://github.com/antoniocorsano-boop/trama-ecosistema/actions/runs/43063968782) ha prodotto due file Qwen3 reali: naturale e suspense. L'utente ha selezionato **narrazione naturale**. La diagnostica offline distingue ora un singolo campione prossimo al massimo digitale da sequenze prolungate e il percorso di esecuzione locale applica un margine prima della codifica PCM16. La correzione in codice non costituisce una nuova prova vocale.

Il profilo fisso `TRAMA_AF03_QWEN3_NATURAL_V1` è definito in `narrative_voice_profile.py` per preparare la narrazione di scene successive. La coerenza del timbro tra scene resta da valutare all'ascolto: questo modulo **non** clona la voce e non genera audio.

La PR #304 rimane bozza. Nessun pagamento, nuova inferenza, pubblicazione o integrazione automatica.
