# VF-3D / L0 — Evidenza di preflight del laboratorio
Data: 2026-11-17. Stato: PARTIAL / STOP_NO_CLIENT / STOP_UNQUALIFIED_DEPENDENCIES. Nessun PASS live, nessuna installazione/esecuzione upstream.
 
## Ambiente di questa sessione
Misurazione diretta shell: Linux x86_64; Xvfb presente; uv/uvx e Python3 presenti; 5 CPU visibili, quota cgroup 400000/100000 = 4 equivalenti; memory.max 4294967296 byte; disco libero 29.83 GiB. Blender, bpy, codex CLI e pacchetto mcp assenti. Richieste HTTP HEAD a GitHub, download.blender.org e PyPI fallite per risoluzione DNS (curl 6/28). Non tentare aggiramenti di rete. Non esiste un tool Blender MCP collegato a questa chat. Questo ambiente non è ammesso per la prova live.
 
## Runner esistente: evidenza riutilizzata, non nuova esecuzione
TRAMA #344, revisione c90826ff23f5e5e067afce6adb8247499f982fad; https://github.com/antoniocorsano-boop/trama-ecosistema/actions/runs/44158173090 ; job 134304452260. Log effettivo: HOST_SCREEN_PASS, 4 CPU, memoria limite 16760344576 byte, memoria disponibile 15906766848 byte, disco libero 91545931776 byte, Python 3.12.3. Il controllo prova risorse per screening CPU, non il collegamento agente, né costo/isolamento del nuovo carico. Otto workflow del commit conclusi success; non attribuire questi esiti al laboratorio Blender. Un runner batch può supportare la prova tecnica, ma non è automaticamente un ambiente interattivo accessibile da questa chat.
 
## Ricognizione sorgenti alla release
Candidato: QwenLM/Qwen-MM-Plugins, tag qwen-mm-plugins-blender-v1.2.0, risoluzione via lettura file GitHub riuscita. Blob verificati (identificatori Git, non SHA256 degli artefatti):
- pyproject.toml aa0bb1bc8b861e1f26d2d6c4d160f61771b811cc: Apache-2.0, Python >=3.10; extra blender vuoto, runtime base mcp>=1,<2; anyio>=4,<5; docstring-parser>=0.18,<0.19; pydantic>=2.11,<3; pillow<12; openai>=1,<2. Intervalli non costituiscono lock; verificare dipendenze transitive, incluse quelle del processo Blender.
- src/capabilities/blender/NOTICE.md 9f377d1c5458c895f1a211cb5d6d355d87322d8b: componenti derivati MIT.
- src/capabilities/blender/qwen_mm_plugins_blender/loader.py 98fa6cfbdd713d153b1f440c56e33f21a9f0b41f: socket TCP persistente, serializzazione I/O, timeout 180s; necessita sessione GUI/Xvfb, non blender -b; reconnect non prova persistenza scena.
- src/capabilities/blender/qwen_mm_plugins_blender/__main__.py da9a9facd08ff13a8d64f933053fd86b96f27052: entry point MCP.
- src/capabilities/blender/qwen_mm_plugins_blender/vendor/addon.py 77ec1f85083b39030c12e94e188a7c5a70229744: righe 47,128 bind host/port; 289–317 integrazioni esterne; 500–510 exec arbitrario; chiamate requests. Default localhost non è sandbox; mantenere isolamento e no rete/credenziali. I servizi esterni devono rimanere disabilitati. Nessuna chiamata reale. 
Fonti: https://github.com/QwenLM/Qwen-MM-Plugins/tree/qwen-mm-plugins-blender-v1.2.0 ; https://qwenlm.github.io/qwen-mm-plugins-hub/plugins/blender/ ; https://qwenlm.github.io/qwen-mm-plugins-hub/plugins/blender/cookbook/ .
 
## Decisione di avanzamento
Non ampliare il catalogo, non duplicare CI P3. Prima di L1 identificare un host che possa eseguire Blender 4.2.23 e client MCP nello stesso ambiente, con canale immagini e accesso agente reale; escludere nuove API a pagamento, download automatico, endpoint pubblici. Opzione preferita: sessione Codex locale isolata, se disponibile un computer compatibile e accesso già incluso; non presumerli. Alternativa: runner standard già usato, esclusivamente test tecnico controllato, non prova di agente interattivo. Resta da fissare commit release, hash binario e lock completo, verificare entitlement per il carico e ammissione. Nessuna inferenza o prova artistica B03/RIF-06, nessuna modifica main o pubblicazione.
