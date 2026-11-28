# FD-05/A — Primo incremento di automazione della distribuzione

Data: 2026-11-14. Stato: IMPLEMENTATION_CANDIDATE / READ_ONLY / NO_DEPLOY. Riferimento: issue #315; ADR-022 in PR #314 non ancora integrata.

## Perimetro
Separare preparazione, verifica, distribuzione e decisione editoriale. Recupero della pipeline Atlas .github/workflows/atlas-pr-preview-cloudflare.yml (run 36396987217 SUCCESS 28/09). Il token storico non è verificato oggi; preview pubblica non equivale a riservatezza. Non riusare per risorse private. Nessun nuovo account o secret, nessuna API di scrittura Cloudflare.

Il comando scripts/free_deploy_fixture.py prepare verifica SHA-256 dell'archivio sintetico 1.0.1, sei file esatti, dimensioni, digest, assenza di extra e crea una cartella nuova; non distribuisce. verify-live effettua soltanto GET del sito sintetico già online, con URL fisso, timeout, rifiuto redirect, MIME e digest di ciascuna risorsa; non carica nulla. Ricevuta JSON non autorizza deploy, privacy, spesa o studenti.

## Verifiche
Eseguite localmente con Python 3.13.5: 8/8 unit test PASS; archivio reale 1.0.1, 32465 byte, cd15460469fcec08cefe5b304bd30eb3f73e22849e1e007245fcbce2c4daa8da, preparazione 6/6 PASS. Blob locali script 329572ca17b823574fec64398af2c474ec778e4d e test 7d0aac910ef08b358bfd0e9d0d77d60acd061661. CI 43571231411 sul primo head: 8/8 PASS; GET reale HTTP 403, job 132375885367. DNS locale non disponibile. La verifica remota resta BLOCKED: nessun retry automatico, bypass o esito positivo inferito dal collaudo Android. La CI di contratto esegue i soli test deterministici; il workflow separato free-deploy-live-verification.yml è read-only, esclusivamente workflow_dispatch, esegue gli stessi test prima dei GET, fallisce in caso di rifiuto e non sarà avviato fino a risoluzione legittima del blocco. Entrambi hanno timeout 3 min, runner standard pubblico, nessun secret. Il PASS di contratto non implica qualificazione del provider. Un futuro adapter di distribuzione deve richiedere evidenza live positiva, fresca e riferita al medesimo artefatto, oltre ai gate di costo e autorizzazione. Non prova ascolto, LIM o costi.

## Incremento successivo
1. Qualificare separatamente il contratto sul commit esatto; conservare il blocco live fino a soluzione autorizzata. Nessuna distribuzione se il gate remoto manca.
2. Verificare l'entitlement FREE_ONLY e le autorizzazioni attuali del distributore storico (soltanto metadati, mai segreti in chat); valutare trigger governato già disponibile. Non usare provider con addebiti potenziali per il Lab.
3. Progettare adapter di distribuzione statico limitato a fixture esatta, con dipendenze bloccate, destinazione fissa, nessuna Functions/Workers/R2, autorizzazione separata al singolo deploy, receipt e rollback. Nessuna attivazione in questa PR.
4. Per contenuti privati, collaudo locale automatizzato finché accesso e costo non sono qualificati. Per prodotti approvati: destinazione pubblica Atlas, previa autorizzazione editoriale e disposizioni scolastiche.

UX obiettivo: docente apre, valuta, approva; sistema prepara, verifica e restituisce il collegamento. Nessun obbligo di upload manuale per ogni prodotto. Il pilota FD-02 è sintetico; Missione 118 resta privata.
