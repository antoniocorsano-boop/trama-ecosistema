# CAP-ART-DIRECTION-01 — Specifica artistica applicabile e verificabile

**Stato:** PROPOSTA GOVERNATA / PILOTA IN ATLAS — NON ADOTTATA  
**Data:** 23 novembre 2026  
**Capacità condivisa:** `visual.art-direction.propose` — modalità OR-07 `PROPOSE_ONLY`  
**Esecuzione locale del pilota:** Blender su copia derivata, solo con perimetro e sorgente espliciti  
**Collegamenti:** [Visual Factory VF1](../atlas-percorsi/production/VISUAL-FACTORY-v0.1.md), [VPC-01](../../superpowers/specs/2026-10-05-visual-preflight-compiler-design.md), [Lifecycle](../../governance/capability-lifecycle-v1.md), [OR-07](../../contracts/trama-shared-capability-layer-contract-v0.md)

## 1. Problema e valore (G0)

Il lavoro visivo dell'ecosistema non deve evolvere tramite prove estemporanee di materiali, luci, texture e camere. La decisione artistica deve precedere il programma che la applica; una prova tecnica non è una prova di qualità percettiva.

**Destinatari:** direzione artistica umana, produttore Visual Factory, revisore, implementatore Atlas e, in futuro, altri prodotti che richiedono una scena visiva controllata.

**Valore:** specifica leggibile da persone e macchine, modifiche riproducibili, rifiuto delle premesse non verificate, immagini e manifesti di confronto, controllo umano prima dell'adozione.

**Non-obiettivi:** nuova applicazione, automatica approvazione dell'arte, generazione indiscriminata di varianti, dominio curricolare, modifiche agli originali, servizi a pagamento, pubblicazione scolastica.

## 2. Architettura e responsabilità (G1-G2)

- **TRAMA:** governa identità, semantica, contratto di scambio, prove richieste e stato della capacità; non conserva binari artistici.
- **Visual Factory VF1 / VPC-01:** possiedono rispettivamente ingresso della direzione artistica e controllo preventivo delle istruzioni visive. CAP-ART-DIRECTION-01 ne è una specializzazione per scene tridimensionali; non duplica la generazione immagini.
- **Atlas:** possiede l'intento visivo delle proprie scene, la specifica concreta, l'adattatore Blender, i rendering, la derivazione GLB e le prove WebGL.
- **Revisore umano:** sceglie o rifiuta la proposta, giudica i rendering e autorizza espressamente la promozione. Il compilatore non decide il gusto né pubblica.
- **Control Center:** solo lettura; Arena resta autorità curricolare; Docente OS non fornisce dati studente né perde autorità.

L'identità semantica della capacità non contiene il nome del programma. Blender è un **adattatore** dell'applicazione della specifica; un futuro adattatore può essere sostituito senza alterare il contratto.

**Norme tecniche:** [esportatore glTF ufficiale Blender 4.5](https://docs.blender.org/manual/it/4.5/addons/import_export/scene_gltf2.html), [materiali PBR Khronos](https://www.khronos.org/gltf/pbr/), [specifica glTF 2.0](https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html). Shader procedurali Blender non equivalgono automaticamente a texture portabili; l'adattatore web richiede esportazione e verifica distinta.

**Alternative scartate:** regolazioni arbitrarie runtime come unica fonte della resa; espansione incontrollata delle varianti; dipendenza da effetti non esportabili; chiamate a fornitori esterni prima della specifica; sostituzione del modello fonte.

## 3. Contratto `visual.art-direction.spec/v1` (G3)

È valido solo con:
1. identificativo di scena, digest SHA-256 del master e identificativo esatto del documento di direzione;
2. congelamento geometrico, divieto di sovrascrittura dell'originale e politica di derivazione;
3. materiali descritti per famiglia, selettori oggetto univoci, base color, metallic, roughness, alpha e trasmissione quando applicabile;
4. strategia dell'atmosfera/cielo e del rig luminoso, con valori misurabili;
5. camere canoniche per desktop e telefono con output e rapporto prospettico espliciti;
6. obiettivi prestazionali, quattro aree di navigazione funzionali, alternativa accessibile e nessun dato personale;
7. criteri di accettazione artistica, tecnica, riproducibilità e tracciabilità;
8. stati di rilascio dichiarati **false** per preflight, approvazione artistica, pubblicazione e integrazione.

Lo schema normativo è [visual-art-direction-v1.schema.json](../../contracts/visual-art-direction-v1.schema.json). La proposta viene respinta se manca un campo, i range PBR sono invalidi, il SHA del master non corrisponde o la camera attesa non esiste.

### Ciclo della capacità

`BRIEF → DRAFT_SPEC → PREFLIGHT_VALID → HUMAN_SPEC_REVIEW → APPLY_TO_DERIVATIVE → BLENDER_RENDER → VISUAL_REVIEW → WEB_TRANSLATION → DEVICE_QUALIFICATION → EXPLICIT_ADOPTION`

**Preflight:** non modifica binari; controlla fonti, schema, materiali, compromessi e compatibilità.  
**Applicazione:** non modifica la fonte; crea `.blend` derivato e una ricevuta con hash, cambiamenti e limiti dichiarati. È autorizzata come prova privata Atlas, non come capacità mutativa OR-07 esposta ad altri prodotti.  
**Revisione:** immagini comparabili a camera fissa e rapporto uguale, giudizio su materiale, gerarchia, cielo, portali e composizione mobile.  
**Traduzione web:** è una fase separata, con controllo che la resa in glTF preservi l'intento. Il render Cycles non è la prova del WebGL.  
**Rilascio:** richiede verifiche generali, dispositivi fisici quando previsti, prova umana sull'HEAD esatto e consenso specifico.

## 4. Soglie verificabili

| Ambito | Soglia della candidata Atlas |
|---|---|
| Geometria | Nessuna variazione alle coordinate dei vertici o alla topologia degli originali; fonte SHA invariato |
| Architettura | 4 livelli, raggio oculo 6,25 unità Blender, quattro pannelli selezionabili invariati |
| Materiali | 5 famiglie principali motivate, valori PBR nel dominio [0,1], niente modifiche non dichiarate |
| Luce | Preset con origine, intensità, colore e dimensione; nessuna luce casuale |
| Cielo | Ambiente Blender fisicamente modellato e verificato in Cycles; web distinto e qualificato |
| Vista | Confronti desktop e telefono, codice telecamera associato a ciascuna immagine |
| Prestazioni | Bilancio triangoli, dimensioni texture, memoria e tempo di caricamento verificati nel web |
| Accessibilità | Portali alternativi e preferenza movimento ridotto mantenuti |
| Adozione | Non ammessa senza ART_FINAL_PASS umano e verifiche necessarie |

Il punteggio estetico non si ricava dalla sola compilazione né dai controlli del navigatore. Si registrano separatamente esito tecnico e decisione artistica.

## 5. Primo adattatore: Atlas Atlas P3B/R3

- Sorgente selezionata P3A/R2; master originale SHA-256 `35371d226c289bd348a1137f63bfd14c74ee79389c4c1b53b522759ca0246d30`.
- Geometria immutabile: piano terra + tre gallerie, oculo circolare r=6,25 BU, quattro portali esistenti.
- `Atlas` PR #188 è la candidata di integrazione privata e rimane non integrata.
- Il prototipo di questa capacità **applica i materiali e l'illuminazione solo a una copia Blender**; la pubblicazione e l'esportazione WebGL aggiornata sono fasi successive.
- Archivio dei rendering e delle ricevute nel progetto Atlas già esistente, non in nuovi spazi.
- Nessuna spesa, nessun dato personale di studenti e nessun automatismo di pubblicazione.

## 6. Stato del ciclo di vita

- G0: identificazione e perimetro **documentati**.
- G1: fonti tecniche, alternative e rischi **documentati**; qualità visiva ancora da qualificare.
- G2: autorità, minimizzazione, impatto e limite di mutazione **proposti**; decisione di adozione ecosistemica non ancora ottenuta.
- G3: contratto/versione e criteri di accettazione **proposti**.
- G4-G6: esecuzione pilota Atlas e qualifiche riferite alla singola derivazione; non promosse per analogia.
- G7: validazione estetica umana **PENDING**.
- G8: adozione/integrazione **NOT_AUTHORIZED**.
- G9: nuove osservazioni solo tramite specifiche versionate, senza perdere le decisioni negative.

**Prossimo gate:** verifica del primo adattatore Blender su una derivazione identificata, confronto visivo con il master e richiesta di decisione artistica umana. Nessun passaggio silenzioso da proposta a prodotto pubblico.
