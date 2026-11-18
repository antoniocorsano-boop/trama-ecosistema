# J07 BLENDER_FINISH — Contratto di sessione condiviso v0.1

Stato: CONTRACT_IMPLEMENTED / CI_PENDING / LIVE_ADAPTER_NOT_CONSOLIDATED. Raccordo a VF-3D-01, ADR-021, TRAMA #345 e Atlas #107. Il compilatore Visual Factory rimane l'unico punto di pianificazione; J07 è un adattatore figlio, non un secondo orchestratore.

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
