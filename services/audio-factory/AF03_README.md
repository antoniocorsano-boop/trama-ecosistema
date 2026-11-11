# AF-03 — Sintesi espressiva italiana, prova Qwen3 isolata

La PR AF-03 dipende da AF-01/02 e non modifica il ramo principale. Il codice permette verifiche senza pesi, rete o GPU.

Verifiche senza inferenza:
python services/audio-factory/qwen3_prosody.py --plan services/audio-factory/tests/fixtures/missione118_qwen3_natural.json --validate-only
python services/audio-factory/qwen3_prosody.py --plan services/audio-factory/tests/fixtures/missione118_qwen3_suspense.json --validate-only
python -m unittest discover -s services/audio-factory/tests -p 'test_*.py' -v

Esecuzione reale NON ancora autorizzata: richiede un'installazione opzionale isolata di requirements-qwen3-optional.txt, modello VoiceDesign già scaricato localmente, GPU gratuita qualificata, variabile TRAMA_AF03_FREE_GPU_AUTHORIZED=yes, --execute, --model-dir e --output. Il programma non scarica pesi né pubblica l'audio. Il risultato resta soggetto a revisione umana.

Decisione: docs/decisions/trama-af03-qwen3-prosody-pilot.md
