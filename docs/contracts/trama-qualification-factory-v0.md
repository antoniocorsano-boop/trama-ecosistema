# TRAMA QF-01 — Qualification Factory: contratto comune di qualificazione
Data: 17 novembre 2026. Stato: PROPOSED / GOVERNANCE_ONLY. Nessuna autorità di esecuzione, rete, spesa, mutazione di prodotto, rilascio o pubblicazione. DOS-A1 rimane RUNTIME_DEFERRED.

## 1. Obiettivo
Separare il giudizio sulla qualità di un candidato dalla capacità di calcolo e dalla decisione di rilascio. Ridurre la frammentazione dei microinterventi e il costo di ricostruzione delle evidenze, non i requisiti di sicurezza. QF è una capacità trasversale di metodo, non una nuova applicazione, un nuovo orchestratore o un ambiente di esecuzione.

## 2. Raccordo con le autorità esistenti
- GOVERNANCE.md e registro delle decisioni: uniche fonti dei contratti approvati e delle autorizzazioni.
- OR-09 (docs/contracts/trama-qualified-execution-readiness-contract-v0.md): prerequisiti e limiti dell'esecuzione qualificata, immutati. QE-01 non è riattivata.
- Compute Factory CF-06B (docs/decisions/trama-compute-factory-alignment-v1.md, PR #339 integrata): politica risorse, ammissione e contabilità già previste; FREE_ONLY, nessun provider o nuova esecuzione autorizzati da QF. Non introdurre un secondo selettore.
- Registro evidenze e proiezione maturity (docs/contracts/trama-maturity-evidence-binding-v1.md): autorità sui riferimenti consolidati. Component Evidence Lane v2: osservazione read-only di evidenze immutabili, distinta dallo stato governato.
- Repository dei prodotti: fonte dei candidati, prove e ricevute tecniche. QF non ne duplica i dati.
- Control Center: sola consultazione; non avvia, riconfigura, autorizza o promuove prodotti.
- Revisione indipendente: verifica separata dal produttore dell'intervento. L'autorità umana decide separatamente l'accettazione e l'eventuale rilascio.

## 3. Modello di qualificazione
Ogni obiettivo di stabilizzazione ha un candidato identificato almeno da repository e SHA completo, oltre a tutti gli attributi obbligatori dell'identità prevista dal contratto locale (contenuto, pubblicazione, ambiente, schema, autorità o altre dimensioni pertinenti). Il nome del ramo o la PR sono contesto, non prova di versione. Il prodotto conserva la propria suite e le ricevute. La decisione di consolidare un candidato non autorizza il collaudo. L'esecuzione richiede i prerequisiti, le politiche del servizio e le autorizzazioni applicabili; in presenza di un rifiuto non si tenta il trasferimento o la ripetizione dell'operazione per eludere il controllo.

Livelli logici, non nuovi livelli maturity:
1. Verifica statica, deterministica e contratti.
2. Verifica applicativa/browser e conservazione dati.
3. Verifica ambiente reale, ove pertinente.
4. Regressioni, sicurezza, recupero, revisione indipendente.
5. Decisione umana su integrazione e rilascio.
I livelli sono categorie logiche, non una sequenza rigida di distribuzione: i prodotti conservano l'ordine dei propri gate, comprese eventuali distribuzioni di verifica espressamente autorizzate prima dell'accettazione finale. Nessuna distribuzione di verifica implica rilascio operativo o pubblicazione agli studenti. I prodotti possono avere prove differenti e ulteriori gate; nessun livello sostituisce quelli precedenti o riduce i requisiti locali.

## 4. Evidenze e interpretazione
Un riepilogo di qualificazione indica: prodotto, repository, SHA, riferimento alla suite/prova, esito osservato, ambiente/versione, identità locale completa, fonte verificabile, data dell'evento e dell'osservazione; per artefatti disponibili anche identificativo e digest secondo i contratti esistenti. Non creare un nuovo registro. Distinguere PASS effettivo sul candidato, evidenza storica, prova equivalente parziale, mancata esecuzione, FAIL e BLOCKED. Non sommare conteggi eterogenei né trasformare assenza di esecuzione in PASS. Un'evidenza precedente resta valida per il suo oggetto; l'analisi di impatto può motivarne la pertinenza, ma non dichiarare una nuova esecuzione. Stato conflittuale o incerto resta aperto. La promozione di stato richiede il processo governato.

## 5. Pilota di metodo: Registro Docente STAB-06
Riferimento (solo link, nessuna duplicazione di ricevute): https://github.com/antoniocorsano-boop/registro-docente/pull/310
Piano del prodotto: https://github.com/antoniocorsano-boop/registro-docente/blob/docs/val-01-stab06-qualification-freeze/docs/superpowers/plans/2026-11-17-val-01-stab06-qualification-freeze.md
Blocco aperto: https://github.com/antoniocorsano-boop/registro-docente/issues/307

Il pilota è documentale, non esecutivo. STAB-06 resta congelata e non qualificata. Il blocco G0 richiede risoluzione autorizzata nel servizio interessato. Nessuna istruzione per ripetere l'operazione rifiutata su altri rami, sistemi o fornitori; nessun collegamento automatico alla Compute Factory per tale operazione. Le condizioni di accettazione specifiche restano nel repository del prodotto. Non includere dati di studenti, segreti o ricevute tecniche del prodotto nel repository TRAMA.

## 6. Progressione proposta
QF-01: riesame del contratto comune, coerenza con OR-09, CF-06B, registro evidenze e governo TRAMA; approvazione separata.
QF-02: ricognizione documentale dei contratti di qualificazione dei quattro prodotti, mappatura delle sovrapposizioni e lacune, senza cambiare configurazioni né avviare prove.
QF-03: eventuale raccordo al modello di osservazione esistente, solo dopo approvazione e verifica del perimetro; nessun nuovo registro o esecutore.
QF-04: eventuale sperimentazione di qualificazione autorizzata, con profilo e risorse verificati; non ammessa ora. Ogni rifiuto resta vincolante.
QF-05: adozione progressiva nei prodotti con decisioni e verifiche specifiche.

## 7. Criteri di accettazione di QF-01
- Revisione che confermi assenza di duplicazione delle autorità e compatibilità con i contratti esistenti.
- Nessun cambiamento a governance canonica, maturity, codice, workflow, servizi o autorizzazioni in questa proposta.
- Nessuna spesa, nessuna pubblicazione, nessun accesso a dati personali.
- Nessun PASS di qualificazione applicativa attribuito dalla formalizzazione.
- Proposta soggetta a revisione e approvazione secondo GOVERNANCE.md.