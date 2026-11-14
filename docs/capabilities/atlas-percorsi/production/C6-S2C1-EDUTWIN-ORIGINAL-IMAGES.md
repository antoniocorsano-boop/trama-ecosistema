# C6/S2c.1 — Raccordo alle illustrazioni originali
2026-11-14 — IMPLEMENTATION_CANDIDATE / LOCAL_ONLY / FREE_ONLY / NO_RUNTIME.
S1 #323, S2a #324, S2b #325 integrate. Issue #305.

## Obiettivo
Eseguire un vero handoff di una bozza conversazionale senza riscrivere le decisioni; recuperare per digest le illustrazioni già acquisite nell'archivio attività di Studio Atlas. Riutilizzare ActivityDraft e verifica WEBP_HEADER_V1 esistenti. Nessun secondo archivio media, nessun download remoto, nessuna nuova generazione. L'utente importa il file JSON prodotto da ChatGPT con la funzione già qualificata; se il pacchetto attività originale è già presente nello stesso browser, il nuovo raccordo verifica automaticamente le immagini al momento di aprire la revisione.

## Confini
Il resolver verifica nuovamente i byte WebP, non si fida del marker di galleria o del digest dichiarato. Match per digest esatto, non per nome o somiglianza; conserva i riferimenti alla versione e alla risorsa sorgente. Se il pacchetto manca o è corrotto, nessun match; se esiste un'altra copia valida dei medesimi byte, può essere riutilizzata. I formati non supportati sono dichiarati esplicitamente. Nessun PASS di revisione, nessuna attribuzione diritti, nessuna modifica ai candidati né assetBytesVerified globale. Il risultato è informativo per la revisione selezionata; non è ancora binding di scene o compilazione del renderer.

Il primo handoff concreto è un file locale, non un nuovo endpoint e non una connessione live ChatGPT. Le risorse originali rimangono fuori dal repository; nessun upload del pacchetto privato. L'automazione diretta di invio, l'acquisizione di audio/video, la verifica di disponibilità e la copia di sicurezza completa restano tranche successive. Non pubblicare a studenti.

## Verifica
Quattro prove unitari: risoluzione byte esatti, manomissione nonostante marker, riferimento mancante e audio non supportato, copia valida alternativa. Browser E2E esteso con WebP sintetico nello stesso IndexedDB: importazione, verifica risorsa, revisione, riapertura dopo reload, storico e blocco revisione obsoleta. Nessuna evidenza di collaudo Android o validazione narrativa. Qualificazione e revisione indipendente sul commit esatto prima dell'integrazione.

## Priorità successiva
S2c.2 deve portare al flusso realmente utilizzabile: handoff automatico autorizzato o trasporto locale singolo con conservazione risorse, evitando infrastrutture a pagamento e nuove credenziali. S3: raccordare le scene al renderer Atlas, gestendo le interazioni effettivamente supportate e la revisione umana del prodotto. Non sostituire un mondo narrativo con una serie di quiz. 
