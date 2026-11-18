# J07 BLENDER_FINISH — Contratto di sessione condiviso v0.1

Stato: CONTRACT_OFFLINE_PASS / SHARED_ADAPTER_EXTRACTED / SYNTHETIC_LIVE_PASS / NOT_PRODUCTION_ADMITTED. Raccordo a VF-3D-01, ADR-021, TRAMA #345 e Atlas #107. Il compilatore Visual Factory rimane l'unico punto di pianificazione; J07 è un adattatore figlio, non un secondo orchestratore.

## Conservazione e provenienza

Archivio riservato del 18 novembre 2026: TRAMA-VF3D-Archivio-B03-C1-C2-2026-11-18.zip (61 758 100 byte), SHA-256 50fc3a95d2324da47b67e27069327de582cc0f4845bc95db1a9361822fb3ce2c. Copia salvata nella Libreria privata; non inclusa in Git. Il manifesto separato e quello interno identificano cinque ZIP originali, tre master e i rendering; 18 confronti diretti sulle ricevute e sul trasporto fotografico C2, oltre alla verifica dei cinque ZIP e del riferimento. La copia non è una garanzia di conservazione perpetua; conservare anche un backup locale verificato.

| Revisione | SHA-256 master | Esito |
|---|---|---|
| B03 | b3f343002bb84612672620d139be5b23e4a6dfc39c654367796146950847677f | baseline congelata |
| C1 | 0db616058cf38a8747699fbb6f00fd502b3a8663305d685ac92611f15b18f662 | sperimentale |
| C2 | e3225c61357eafd1467c83b270086d669b6ba2602a364e5d0f2a89964a59e4df | migliore sperimentale / NO_PROMOTION |

RIF-06 SHA-256 949d7fa1e5a0c2d4a276cb19c427932ebf00ae3b215f5b3890b2be196f05822b: riservato; diritti di redistribuzione non accertati. Non depositare binari, immagini o riferimenti privati nel repository pubblico. Nessun C3.

## Confine implementato

Il modulo puro scripts/visual-factory/j07_session_contract.py valida il contratto trama.visual-3d-j07-session/v0.1 e la ricevuta trama.visual-3d-j07-receipt/v0.1. Nessun accesso a rete o processi. Identificatori opachi, digest canonici, limiti espliciti, profilo artist_directed, FREE_ONLY e autorità tutte false. I record positivi richiedono costo verificato, evidenza di isolamento, stesso processo, un master e almeno due render; STOPPED non ammette output promuovibili. I test sono sintetici e non dimostrano l'autenticità dei riferimenti, la disponibilità del compute, o il funzionamento live. Le ricevute storiche non devono essere riscritte come ricevute qualificate.

Operazioni ammesse: inspect, apply_reviewed_patch, render, snapshot, reopen. La patch deve essere un artefatto immutabile con digest e revisione esplicita, non testo Python arbitrario fornito dal client. Il server Qwen espone codice arbitrario: l'allowlist logica da sola non è isolamento. Il runtime deve verificare byte e digest degli input/output, autorizzazioni effettive, rete none, mount readonly, utente non privilegiato, assenza credenziali, timeout e stop. Nessuna invocazione live da questo contratto.

## Raccordo successivo

1. Estrarre da TRAMA #345 e Atlas #107 il bootstrap Docker, l'audit dipendenze e il trasporto MCP in un unico adattatore con revisione fissata, chiamabile solo da J07. Conservare le sequenze artistiche come ricette distinte, non nel bootstrap.
2. Collegare il verificatore ai riferimenti autoritativi di ammissione/diritti e alla ricevuta di costo; verificare freschezza e quota. Non convertire UNKNOWN in VERIFIED_ZERO.
3. Qualificare su scena sintetica con gli stessi limiti e conservazione delle evidenze; nessuna esecuzione artistica ulteriore su B03. Dimostrare arresto, ripresa da snapshot, integrità degli output, test negativi e assenza di chiamate esterne.
4. Completare verifica licenze, dipendenze di sistema e ammissione; revisione terza separata. Solo allora considerare il raccordo produttivo con il planner e un nuovo benchmark artistico. Autonomia agente, GLB/runtime e pubblicazione rimangono gate distinti.

Non autorizza merge, pubblicazione, spese, nuovo servizio o inferenza. La validazione del contratto non equivale al consolidamento dell'esecutore.

## Incremento P1 — adattatore operativo estratto

La procedura live TRAMA è stata ridotta a richiami ai file sotto scripts/visual-factory/mcp-blender: prepare-distribution.sh, audit-dependencies.sh, Dockerfile, blender-start.py, vendor-smoke.py, mcp-client.py, container-session.sh e run-isolated.sh. Il bootstrap, i controlli del profilo nativo e l'isolamento provengono dal collaudo precedente. Il workflow storico Atlas #107 non è stato riscritto, i suoi artefatti restano immutabili.

j07_adapter.py espone inspect, apply_reviewed_patch, snapshot e render in un profilo sintetico. La patch di prova è una ricetta interna identificata da ID e digest; non si accettano codice, URL o percorsi dal chiamante. j07-synthetic.py esercita realmente MCP, una scena di fabbrica, snapshot iniziale, due rendering Cycles CPU, ritorno dei byte attraverso MCP, modifica consentita, rifiuto di patch non registrata, hash errato, percorso arbitrario e secondo tentativo. La riapertura avviene in un processo Blender separato nello stesso contenitore. Il codice dell'adattatore viene montato in sola lettura. L'API interna di trasporto non è un confine di sicurezza per codice ostile.

La ricevuta contrattuale della prova resta esplicitamente un fixture sintetico STOPPED / UNKNOWN / STOP_NO_COST_EVIDENCE; il risultato tecnico ha un'evidenza distinta, non è una ricevuta di produzione. Non si dichiara ammissione compute reale, approvazione artistica, autonomia o integrazione nel planner. L'estrazione non sostituisce ancora i client storici Atlas e non implementa un caricatore di master di produzione. Dopo il collaudo: verificare costi/diritti, unificare l'interfaccia con il planner e migrare soltanto le future ricette Atlas, senza rieseguire C1/C2. Nessun nuovo provider, nessun C3.


## P2 — decisione di ammissione del 18 novembre 2026

Evidenza tecnica: run 44245216222, artifact 14400823924; ciclo sintetico, salvataggio/riapertura e trasporto fotografico positivi. Non trasformare il fixture STOPPED in ricevuta positiva.

- GitHub Actions: entrambi i repository sono pubblici (verifica API); il runner standard ubuntu-24.04 è gratuito per il calcolo nei repository pubblici. Documenti ufficiali consultati: https://docs.github.com/en/billing/concepts/product-billing/github-actions ; https://docs.github.com/en/actions/reference/runners/github-hosted-runners ; https://docs.github.com/en/site-policy/github-terms/github-terms-for-additional-products-and-features . Il servizio è destinato allo sviluppo e collaudo del software e alle attività consentite associate. NON usare come render farm generale o backend di produzione per gli utenti. Il profilo diagnostico ha guardia repository pubblico; costi storage e altri consumi non attestati. Nessun VERIFIED_ZERO retroattivo.
- Blender: GPL, utilizzo libero, output artistici non automaticamente assoggettati a GPL; separare diritti sull'input/output e obblighi su software/add-on/script distribuiti. https://www.blender.org/about/license/ ; https://www.blender.org/support/faq/ .
- Qwen-MM-Plugins: commit 33a54695774020e5da2d6b1ed13119d4014f848f; LICENSE blob d645695673349e3947e8e5ae42332d0ac3164cd7 Apache-2.0; NOTICE Blender blob 9f377d1c5458c895f1a211cb5d6d355d87322d8b e vendor/LICENSE blob 82e98f0ee1ef20d31f852ad43c91020cc51f82ea MIT. Preservare attribuzioni e testi; nessuna affermazione di completa compatibilità di redistribuzione con Blender GPL. Il profilo non invoca API cloud.
- Inventario nuovo: inventory-evidence.py rileva pacchetti binari e versioni sorgente Ubuntu dall'immagine effettiva, metadati e digest dei 35 wheel, licenze upstream. OSV Ubuntu:24.04:LTS sui pacchetti sorgente; https://documentation.ubuntu.com/security/security-updates/osv/ . Evidenza diagnostica, non copre tutte le librerie incluse in Blender, kernel host o Ubuntu Pro. Eventuali segnalazioni richiedono triage, non sono automaticamente prova di sfruttabilità. La revisione licenze delle dipendenze rimane da chiudere.

Decisione: CI_DIAGNOSTIC_ONLY / PRODUCTION_STOP_NO_FREE_PROVIDER. Non esiste un entitlement produttivo verificato né un provider J07 ammesso. Il laboratorio resta strumento di sviluppo; l'adattatore deve essere trasferibile su capacità autorizzata, eventualmente locale se disponibile e verificata. Non aprire account, servizi, porte pubbliche, né acquistare crediti. Il planner canonico resta l'unico responsabile dell'ammissione e della quota. Nessuna modifica ai master artistici, nessun C3, nessuna pubblicazione.


## P2.1 — Consolidamento circoscritto del sistema Ubuntu

Baseline verificata direttamente nell'artifact 14400774892, SHA-256 9d7166a4d206275aa984b49de96b21428e36013fdb3adf725efe976e56118e28: 171 segnalazioni OSV, 32 sorgenti interessate, 145 sorgenti analizzate, 211 pacchetti binari. Il collaudo funzionale era positivo; ammissione produttiva negata.

Intervento unico: mantenere Ubuntu 24.04 e la base fissata; applicare gli aggiornamenti standard APT anche ai pacchetti già installati; conservare le simulazioni di aggiornamento e rimozione. Non eliminare librerie grafiche/audio o componenti base senza prova della loro non necessità. Non abilitare ESM/Pro, non acquistare crediti e non modificare il profilo Blender, i master o il lock Python. La nuova immagine viene nuovamente inventariata e collaudata.

Il triage registra priorità Ubuntu, versione di correzione standard quando indicata, dati mancanti, e confronto quantitativo con la baseline. Fonte: https://documentation.ubuntu.com/security/security-updates/osv/ . Le segnalazioni non sono automaticamente vulnerabilità sfruttabili. Una correzione pubblicata non dimostra installazione o disponibilità. La variazione dei conteggi non prova da sola la risoluzione perché anche il feed può cambiare. L'applicabilità residua resta da valutare; nessun esito automatico concede produzione. Nessuna rimozione automatica. Esito in attesa del nuovo collaudo; evitare ulteriori cicli di aggiornamento indiscriminati prima di valutarne i risultati.


## P2.2 — Raccordo con Compute Factory e verifica risorse

CF-06B è già integrata in main (PR #339, merge 3ba2faee582b7d6b96fb818cce2f74bd4e3b67ec). Non introdurre un altro selettore, registro di disponibilità o contabilità. Il pianificatore canonico VF-3D e il raccordo esistente compile_compute_factory_handoff.py restano invariati.

Riesame dell'archivio effettivo 14402068388 (SHA-256 32fa49c299e8af2e8b21de221ef297ccea112dce508679218fb38dbe06f972c3), revisione e8f4afcf8f8b4161ddc9963d641787fbe4133f86: 162 segnalazioni, 147 medie, 12 basse, 3 trascurabili, 159 senza correzione standard indicata e 3 ritirate da riconciliare. Simulazione aggiornamento e rimozione: zero pacchetti. Non ripetere aggiornamenti indiscriminati. L'isolamento osservato limita esposizione a rete/privilegi, ma non dimostra l'assenza di rischi nell'elaborazione locale. Il profilo resta diagnostico; vietare ingressi esterni o non verificati, esecuzione automatica di codice incorporato, credenziali e rete esterna. Accettazione dei rischi residui, librerie integrate in Blender e licenze di redistribuzione non ancora chiuse.

Risorse: GitHub runner standard pubblico = DIAGNOSTIC_ONLY. Capacità CPU locale = prima candidata metodologica, ma nessuna attestazione fresca di host produttivo, disponibilità, controllo amministrativo, quota o costo marginale. Il laboratorio CF-02–06A e la contabilità SQLite sintetica non attestano un host persistente. Oracle e altri servizi esterni non hanno ammissione documentata per J07; i percorsi Cloudflare/HF per altri motori non dimostrano un runtime Blender compatibile. Non creare risorse, account o servizi. Numero di pool produttivi verificati: zero.

Le risorse fixtures/visual-factory-3d/j07-diagnostic-review.v0.1.json e j07-admission-review.json collegano impronte e metadati effettivi del master sintetico alla richiesta offline di valutazione; nessun input artistico o personale. tests/test_j07_compute_review.py esercita cinque casi attraverso il planner canonico, il raccordo CF e il registro sintetico esistenti: STOP_NO_ADMISSIBLE_ENGINE, richiesta vincolata al digest, nessuna prenotazione, rifiuto di alterazioni e autorità di spesa. Nessuna modifica al registro di ammissione motori, ai master o al planner. Le prove verificano coerenza strutturale delle fixture, non autenticazione dell'origine o disponibilità futura. Esito atteso STOP_NO_ADMISSIBLE_ENGINE: licenza e profilo non ammessi, nessuna ammissione; ricevuta live storica STOP_NO_COST_EVIDENCE resta immutata.

Gate successivo, circoscritto: identificare una sola capacità CPU già posseduta e autorizzata, verificare sul suo host architettura, CPU/RAM/disco, isolamento e disponibilità per una sessione limitata, attestare costo marginale e durata della disponibilità; conservare evidenza locale e riferirla alla politica/contabilità esistente. Nessuna installazione o esecuzione produttiva prima di tale attestazione e del riesame dei rischi e diritti. In assenza di host attestabile, fermare la qualificazione produttiva anziché ripetere i collaudi GitHub. Direzione artistica Atlas non bloccata.
