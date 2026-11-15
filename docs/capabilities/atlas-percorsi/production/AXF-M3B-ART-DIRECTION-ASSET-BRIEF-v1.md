# AXF-M3-B — Brief artistico e composizione degli asset
15 novembre 2026 — PREPARATION_ONLY / HUMAN_W6A_REVIEW_REQUIRED / NOT_RUNTIME_AUTHORIZED.
Preparazione consentita senza anticipare l'esito M3-A (#97 head 8ff6ece6dc487dc5341881066db6bace5a49d27e). Non è generazione di immagini, non è una nuova scena eseguibile, non è approvazione. Il [piano](../workflow/ATLAS-MASTER-PLAN-v1.md), [storyboard E01–E07](AXF-M1-ENERGIA-STORYBOARD-v1.md), [target](AXF-M1-ENERGIA-VISUAL-TARGET-v1.svg) e [profili](AXF-M2D-PROFILE-REVIEW-v1.md) governano questa preparazione.
## Identità e risorse già disponibili
Recuperare dal commit Atlas abef350ea4b93730081bbea87d14ac33a0753747, content/staging/biblioteca/poesia-energia. Conservare integralmente tavola-originale.png e PE-01/02/03/04.webp, senza ridisegnare o tagliare le immagini in modo incoerente. Hash e semantica in M1; verificare prima di produrre. Matteo maglione blu scuro, Elena cardigan ruggine, Samir verde salvia; plastico di cartone, ponte, fiume, campanile, lampione, tavolo della biblioteca; pittorico cinematografico, luce calda. Nessun personaggio nuovo necessario. PE-02 è illustrazione della mappa, non prova sperimentale.
## Pacchetto di composizione da sottoporre a review
| ID | Risorsa da produrre dopo review | Funzione e vincoli |
|---|---|---|
| E02-BG | Veduta 2.5D dell'atelier, tavolo e ambiente della biblioteca | 1600×960 candidato; sfondo senza scritte o controlli; piazza, quaderno e banco leggibili, non quiz |
| E02-OBJ | Piazza/lampione, quaderno, banco come elementi interattivi separati | PNG/WebP con trasparenza se necessaria, stessa prospettiva e ombre; stati normali e focus gestiti via codice; non alterare gli originali PE |
| E03-BG | Inquadratura ravvicinata del banco coerente con E02 | 1500×1000 candidato; spazio per tre modelli e stazione virtuale; non dispositivi reali né cablaggi |
| E03-ABC | Tre modelli di lampada virtuale e stazione | Asset separati, etichette A/B/C in DOM o renderer; nessuna inferenza visiva di rendimento, stessa luce utile in tutte le misure |
| E03-FLOW | Sovrapposizioni dinamiche ingresso/luce/calore | Geometrie native con valori/scala comune; niente testo raster; alternative testuali equivalenti |
| E04-NOTE | Quaderno delle prove consultabile e confronto | Componente DOM, non screenshot; conserva i dati in memoria e non obbliga allo scroll lungo |
| E05 | PE-03 originale + scheda della raccomandazione | Risultato del modello separato dall'illustrazione; non promettere riparazione |
| E06 | Tavola del caso pompa virtuale | Sospesa fino a verifica scientifica del modello distinto e review |
| E07 | PE-04 originale | Chiusura, nuova dimostrazione non causata dalla simulazione |
Dimensioni proposte, non requisito già convalidato: derivare asset responsivi da master intatto, misurare leggibilità e peso. Nessuna nuova illustrazione decorativa senza azione/ruolo. Nessun file personale o nuova spesa.
## Strumenti e sequenza operativa
1. Visual Factory: recupero Reference Lock, brief per nuovi originali, prova di coerenza artistica e conservazione con hash. Generazione solo dopo W6A pertinente, con entitlement FREE_ONLY e diritti verificati; nessuna promessa di provider.
2. Tiled: mappa oggetti/zone e coordinate autore unica, export riproducibile; mappa di riferimento 640×384 e zone minime target piazza/quaderno/banco. La nuova composizione può cambiare coordinate dopo review, non la semantica. La variante M2-D non è un layout artistico.
3. GDevelop: E02 candidato, scena illustrata con hit area sugli oggetti e risposta contestuale, export locale e opt-out verificato; non caricare codice da package. Alternativa Phaser se non emerge vantaggio di composizione/avventura o integrazione.
4. Phaser: E03/E04, riuso modello puro e verifier, oggetti del banco e flussi; spostare azione primaria dentro la scena, non creare un nuovo modello fisico.
5. Renderer narrativo/HTML: E01/E05/E07, testi e focus, ritorno e consultazione; solo un renderer attivo e stato temporaneo sotto controllo host. E06 separato.
## Criteri visivi e funzionali per la review
- Prima schermata mobile: scena al centro, azione primaria vicina all'oggetto; niente elenco di pannelli a scorrimento come forma principale. In orizzontale non sacrificare uscita e comandi. Zoom 200% e alternative leggibili senza blocco.
- Tre oggetti riconoscibili come parti dello stesso mondo; indicazioni contestuali, focus visibile, touch non dipendente solo da trascinamento; nessun obbligo audio.
- In E03 il modello reagisce e mantiene 20 J di luce utile a parità di servizio; confronto con scala comune. Ritorno a E02/E05 coerente, traccia verificata, reset/uscita; nessun voto.
- Coerenza narrativa, scientifica, linguistica, artistica e accessibilità; review umana W6A e Reference Lock prima della generazione finale, revisione indipendente e prove fisiche prima della promozione.
## Stato
M3-A resta la priorità attiva. Il brief è una dipendenza preparatoria M3-B, non una seconda linea d'implementazione. Nessun asset nuovo generato o pubblicato in questa fase.