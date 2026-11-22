# TRAMA-ADR-022 — Audio Factory come capacità condivisa

**Stato:** IMPLEMENTATION_PILOT / HUMAN_PRODUCT_REVIEW_PENDING
**Data:** 2026-11-11
**Perimetro:** TRAMA, Studio Atlas, Visual Factory, Atlas, Docente OS
**Pubblicazione / runtime condiviso:** NON AUTORIZZATI

## Decisione di confine
La produzione vocale è un servizio condiviso in services/audio-factory, non una libreria installata nel sito Atlas pubblico né un sottosistema di Docente OS. Studio Atlas richiede audio tramite un piano versionato; una ricevuta tecnica produce soltanto un asset candidato. Il docente approva il contenuto e autorizza, con processo separato, l'eventuale pubblicazione.

## Invarianti
1. Arena mantiene l'autorità curricolare; Studio Atlas l'autorialità narrativa; Atlas la distribuzione di contenuti approvati; Docente OS la scelta d'uso nella lezione.
2. FREE_ONLY e nessun fallback a pagamento; nessun invio automatico a provider esterni o avvio di server persistenti.
3. Nessuna clonazione di voce, voce di studenti o dati personali nel piano AF-01.
4. File WAV/MP3 con trascrizione e impronte; l'asset non è adottabile se falliscono durata, integrità o controllo umano.
5. Audio non obbligatorio: trascrizioni e controlli di pausa, ripresa, salto e ascolto ripetuto.
6. Una decisione di revisione umana è distinta da una ricevuta di esecuzione.
7. Modelli e pesi non vengono archiviati in Git; licenze di codice, pesi e voci sono valutate separatamente.

## Prima esecuzione
Kokoro-82M (Apache 2.0), CPU locale e due voci italiane: im_nicola / if_sara. Importazioni pesanti e download sono fuori dai test. In nessun caso la sola disponibilità di una voce dimostra la qualità dell'italiano. Un problema upstream segnala uscite italiane troncate; il prototipo le respinge.

## Gate per una prova realmente qualificata
- Qualifica del sistema locale, dipendenze e fonti dei pesi.
- Generazione reale di uno stesso breve testo italiano con entrambe le voci.
- Misura della durata e controllo della fedeltà al testo.
- Ascolto umano di pronuncia, pause, timbro e accessibilità.
- Valutazione Qwen3-TTS solo dopo prova Kokoro e disponibilità hardware gratuita reale.
- Nessuna integrazione in Studio Atlas o pubblicazione Atlas senza nuova revisione e autorizzazione.

Riferimenti: TRAMA-ADR-020, TRAMA-ADR-021, TRAMA-ADR-013 e specifica AF-01.
