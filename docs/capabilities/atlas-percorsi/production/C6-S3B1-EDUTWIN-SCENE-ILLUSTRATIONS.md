# C6/S3b.1 — Regia illustrata versionata
2026-11-14 — IMPLEMENTATION_CANDIDATE / LOCAL_ONLY / FREE_ONLY / NO_RUNTIME.
Dipendenze S1–S2c.1 integrate, issue #305. Atlas #87 resta separata e dipende dalla #81 ancora aperta.

## Raccordo
L'input conversazionale ammette sceneIllustrations, campo interno opzionale: sceneId, assetId IMAGE già registrato, alt descrittivo, role SETTING/CHARACTER/SCENE. Una sola associazione per scena; nessun URL, byte o autorizzazione in ingresso. Si mantiene nelle revisioni successive salvo sostituzione esplicita; una scena rimossa senza aggiornare il binding blocca la revisione. Il digest della revisione e sourceDigest includono il binding; i vecchi record senza campo conservano la serializzazione e il digest. Il contesto di revisione esportato conserva le associazioni.

Studio Atlas → Continua da ChatGPT → Storia illustrata: mostra la proposta scena per scena, recuperando i byte originali WebP tramite il resolver S2c.1 già integrato. Ricalcola le impronte, usa solo le risorse verificate e non sostituisce immagini mancanti. Il ruolo e l'alt distinguono una rappresentazione di riferimento da un'immagine dell'evento. Le scene senza associazione restano esplicitamente da illustrare. Nessuna nuova copia persistente dei media, nessun collegamento a URL esterni. La tavola narrativa è per il docente, non un'anteprima learner; non produce approvazioni e assetBytesVerified globale resta false.

## Prove
Due test di compilazione: vincolo alla revisione, continuità, rifiuto associazioni errate e URL arbitrari. Test resolver estesi per verificare byte e dimensioni esatte, nessun byte per risorse alterate. E2E esteso: una vera immagine sintetica verificata compare nella tavola, è conservata nel contesto e riappare dopo la revisione/ricarica. Qualificazione esatta e revisione indipendente necessarie.

## Caso reale
Missione 118: il pacchetto V9.1 conserva 8 immagini; confronto locale di tutti gli SHA-256 e delle rappresentazioni effettive con il JSON della bozza. Proposta di regia per 5 delle 6 scene (inclusa apertura); la conclusione è da illustrare. Nessuna immagine originale rappresenta esattamente il nuovo episodio nella sua interezza. Il JSON candidato locale non viene caricato sul repository. Non è una revisione di un progetto già archiviato: per quest'ultimo occorre il parent digest effettivo.

## Prossimo passo
S3b.2: trasferire associazioni e byte verificati tramite il bridge privato esistente (non nel link), vincolarli allo snapshot e ai gate di revisione, integrare la regia nel renderer già presente. Non promuovere una review DRAFT automaticamente. Le scelte testuali non equivalgono a un micromondo manipolabile: per questi ultimi servono meccaniche native e prove dedicate. Nessun nuovo servizio, spesa, pubblicazione o autorizzazione agli studenti.
