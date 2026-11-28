# Missione 118 V6 — ricevuta del candidato editoriale C2

Data: 13 novembre 2026. Stato: LOCAL_CANDIDATE / HUMAN_REVIEW_PENDING / NO_PUBLICATION.

V5 originale recuperata dalla libreria e SHA-256 verificato: 22971583a2a7dc2d45947b4ce19a843a057b05864b9a2b896762728c9519175e. Tutti gli otto WebP coincidono byte per byte con gli asset V5 incorporati e con le impronte del manifesto Atlas #84. Nessuna rigenerazione. V5 e PR Atlas #84 invariati.

## Artefatti consegnati nella conversazione
| Nome | Byte | SHA-256 |
|---|---:|---|
| Missione_118_V6_anteprima.html | 820370 | 55d6dea0ff8a2c39ee36919d57b3476c785ef2501329a2d1389c9bb10deda551 |
| Missione_118_V6_guida.html | 4362 | 8a8f434c3ae0c4011ae6b406721e93b0ce385362f974711f360a9bb7ce3874f6 |
| Missione_118_V6_Studio_Atlas.zip | 1218636 | 7279a41e5ae4e9a84e34e3dd03c11922654940ac54125f8a8222f285594f9791 |
| intake.json nel ZIP | 4760 | d9732b1f621171c9b35d91a9345a79fb8fc75b5c763b7fd8c77d39f16f718f22 |

Versione 0.2.0-draft, stesso activityId trama-missione-118-2026. ZIP: manifesto + 10 risorse (otto immagini, esperienza, guida). Integrità ZIP e corrispondenza degli SHA di tutte le risorse e immagini incorporate verificate localmente. Artefatti locali/conversazionali: non ancora acquisiti in repository Atlas o Studio Atlas. L'importatore effettivo non è stato rieseguito su questo ZIP; l'attuale allowlist non autorizza V6 all'esecuzione in Studio Atlas.

## Cambiamenti
- Ruolo, obiettivo e primo gesto nell'apertura; prologo opzionale; azione principale più evidente.
- Filtro configurabile con risultato calcolato, correzione e variazione della priorità quando cambia il contesto.
- Confronto illustrativo luce/assenza di luce, spiegazione fotovoltaico e accumulo prima della scelta sulla risposta IA.
- Tutor con due comportamenti e confronto osservabile.
- Terzo ambiente: modello astratto di dati incompleti e necessità di verifica umana; nessuna istruzione operativa per impianti reali.
- Scelta finale senza punteggio; progetto su carta e guida V6 coerente.
- Navigazione indietro, focus sul titolo, stato in memoria volatile; nessuna richiesta di rete, identità, telemetria o storage. Nessuna funzione di authoring visibile allo studente.
- Narrazione testuale: tracce audio V5 non disponibili, nessuna affermazione di audio professionale.

## Prove
Chromium reale headless, contenuto caricato con set_content in ambiente locale a rete bloccata (le navigazioni file/URL di questo ambiente sono vietate). Quattro viewport: 360x640, 393x873, 1280x720, 1920x1080. In ciascuno percorso completo, scelte alternative ed effetti, correzione, navigazione/tastiera, assenza di overflow orizzontale nei punti controllati, assenza richieste esterne ed errori di pagina, riapertura/reset PASS. Controllo statico assenza API storage. Screenshot ispezionato per accorciare la prima schermata mobile; prove ripetute sulla versione finale. Non equivalgono a collaudo Android/LIM fisici, audit WCAG, test iframe Studio Atlas o approvazione umana.

## Gate residui
Revisione umana didattica V6, eventuale recupero audio e diritti, binding Arena autentico, import reale ZIP, revisione sicurezza e runtime controllato, pubblicazione esplicita. Nessun merge, deploy, pubblicazione o cambio autorizzazioni. Non dichiarare C2 completato prima di review umana.
