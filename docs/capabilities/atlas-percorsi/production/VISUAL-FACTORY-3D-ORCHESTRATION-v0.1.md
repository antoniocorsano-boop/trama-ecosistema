# VF-3D-01 / SP-08.1a — Orchestrazione image-to-3D e finitura Blender

**Stato:** PROPOSED DESIGN / NOT EXECUTION AUTHORIZED  
**Perimetro:** TRAMA Visual Factory · Studio Atlas · Atlas  
**Baseline:** TRAMA main 4d9b7b487f3f920dad54593683b19a742d639b84; Atlas SP-07.5 be1b70b46a768c772bf6db58a9548b55d1ec9e17; studio SP-08 b0106d05fef61a25a8534297831279e940c8e0aa.  
**Pilota:** Storie — Il libro vivente (SP-08).

## 1. Decisione architetturale

Estendere la Visual Factory esistente, non costruire un secondo orchestratore generale. Il controllo della generazione 3D è una capacità specializzata, distinta dalla generazione 2D. Il contratto corrente `VisualGenerationPlan` e il preflight canonico Museo Zero sono specifici della generazione 2D e restano invariati: non forzare mesh o file binari dentro il contratto immagini. Definire un contratto figlio versionato per gli asset 3D, con riferimenti alla direzione artistica, al pacchetto e alla politica compute esistenti.

Riferimenti autoritativi:
- `docs/decisions/trama-adr-021-visual-factory-compute-orchestration.md`;
- `docs/superpowers/specs/2026-10-05-visual-factory-zero-cost-orchestrator-design.md`;
- `docs/capabilities/atlas-percorsi/production/TRAMA-COMPUTE-POLICY-v0.1.md`;
- `docs/capabilities/atlas-percorsi/production/VISUAL-FACTORY-COMPUTE-QUALIFICATION-v0.1.md`;
- `scripts/compile_visual_factory_compute_plan.py` per il filtro compute deterministico;
- `products/studio-atlas/lib/visual-factory-orchestrator.ts` come riferimento di semantica delle ricevute, tentativi e stati; non è un esecutore 3D già compatibile.

Il router decide **quale lavorazione/modello**; TRAMA Compute Policy decide **dove e se** può essere eseguito. SkyPilot resta il provisioner solo per infrastrutture già autorizzate; Space Gradio pubblico, CPU/GPU posseduta e adapter hosted sono percorsi distinti, ciascuno da qualificare. Nessun account, servizio o GPU viene creato da questa specifica. Nessun paid fallback, quality downgrade o cambio modello silenzioso. Il costo zero indica costo marginale autorizzato, non la gratuità universale di hardware, elettricità o servizio.

## 2. Capacità e ammissione degli strumenti

Il registro proposto `fixtures/visual-factory-3d/engine-registry.v0.1.json` distingue ruolo, formato, requisiti dichiarati, licenze e stato di ammissione. Le capacità sono dichiarazioni upstream da verificare mediante prove reali; non sono punteggi di merito.

| Motore | Ruolo | VRAM dichiarata | Decisione iniziale |
|---|---|---|---|
| TripoSR | Prototipo geometrico, colore per vertice o texture opzionale | circa 6 GB con impostazioni standard | candidato per prima qualificazione licenze e runtime |
| TRELLIS.2 | Forma e asset PBR, GLB | almeno 24 GB locali | solo valutazione/ricerca previa ammissione delle dipendenze e del servizio |
| TripoSG | Forma ad alta fedeltà, GLB | almeno 8 GB | BLOCCO UE: NOTICE e triposg/LICENSE indicano FlashVDM con esclusione territoriale; non eseguire finché il percorso esatto non sia lecitamente riammesso |
| Step1X-3D | Forma e texture separabili | 27 GB riportati per pipeline 1300m+texture, 29 GB variante label | HOLD: il README dichiara riuso di codice Hunyuan3D per il texture baker; audit di file, dipendenze e pesi richiesto |
| Blender | Modellazione controllata, riparazione, rifinitura, rendering, export | profilo CPU/GPU da misurare | riferimento già usato in Atlas; non qualifica automaticamente una nuova lavorazione |

Licenza radice non equivale a licenza di tutta la filiera. Per TRELLIS.2, nvdiffrast e nvdiffrec hanno termini separati che limitano il loro impiego a ricerca/valutazione non commerciale. Verificare se siano necessarie per il percorso esatto e se le condizioni d'uso e distribuzione consentano la destinazione scolastica prevista. Per TripoSG sono presenti anche RMBG-1.4 e derivazioni HunyuanDiT. Per Step1X non dichiarare un divieto complessivo UE non dimostrato, ma non ammettere il percorso finché la catena non è verificata. Non aggirare restrizioni territoriali tramite servizi hosted o fork.

Fonti ufficiali (ricognizione 2026-11-17):
- https://github.com/VAST-AI-Research/TripoSR
- https://github.com/microsoft/TRELLIS.2
- https://github.com/NVlabs/nvdiffrast/blob/main/LICENSE.txt
- https://github.com/NVlabs/nvdiffrec/blob/main/LICENSE.txt
- https://github.com/VAST-AI-Research/TripoSG/blob/main/NOTICE
- https://github.com/VAST-AI-Research/TripoSG/blob/main/triposg/LICENSE
- https://github.com/stepfun-ai/Step1X-3D
- https://huggingface.co/docs/hub/spaces-zerogpu
- https://huggingface.co/spaces/microsoft/TRELLIS.2

Prima di ammettere un adattatore: fissare revisione sorgente e modello/pesi, impronte, dipendenze runtime e licenze (inclusi preprocessing, segmentazione, rasterizzatore, texture), condizioni del servizio, uso consentito nell'UE, data della verifica, destinazione e diritti sull'input/output. Distinguere EVALUATION_ONLY da PRODUCTION_ELIGIBLE. Non considerare il registro una allowlist esecutiva. Non scaricare codice o pesi a runtime senza piano approvato.

## 2bis. Ricognizione estesa e decisione ComfyUI (SP-08.1a+)

Il registro comprende ora 16 strumenti, non tutti generatori: forma rapida, alta fedeltà, parti modificabili, viste multiple, ricostruzione, texture, fotogrammetria, finitura, ottimizzazione. I due componenti di esecuzione ComfyUI e ComfyUI-3D-Pack sono separati dai modelli. Il catalogo è una ricognizione, non una classifica misurata né una allowlist.

| Nuovo strumento | Lavorazione da qualificare | Requisiti e cautela |
|---|---|---|
| SPAR3D | Mesh e nuvola di punti modificabile | 10,5 GB default, circa 7 GB low-VRAM; licenza Community e accesso pesi |
| Stable Fast 3D | Mesh con UV e separazione illuminazione | circa 6 GB default; licenza Community e accesso pesi |
| PartCrafter | Parti indipendenti, utile per Storie/Laboratori | MIT dichiarata; VAE TripoSG mantenuto fisso in addestramento e presente nel checkpoint, RMBG-1.4; HOLD catena derivativa |
| Direct3D-S2 | Master geometrico ad alta risoluzione, OBJ | 1024: circa 24 GB; 512: almeno 10 GB, qualità inferiore sconsigliata dagli autori |
| InstantMesh | Ricostruzione da viste multiple sintetiche | verificare modello Zero123++ e dipendenze |
| Unique3D | Ricostruzione mesh da viste sintetiche | verificare modello e dipendenze |
| CraftsMan3D | Generazione e affinamento geometrico | verificare variante e pesi |
| MV-Adapter | Viste multiple condizionate e texture su mesh | verificare modello base, UV e proiezione |
| Wonder3D | Viste RGB, normali, fusione in mesh | verificare modello, ricostruzione e dipendenze |
| Meshroom | Fotogrammetria da fotografie reali | alternativa per oggetti didattici acquisiti, non ricostruzione fedele da un'immagine generata |
| Meshoptimizer / gltfpack | Ottimizzazione mesh e glTF/GLB | verificare build, licenze e compatibilità glTF con Three.js r128; nessuna estensione di compressione senza prova decoder |

Fonti primarie nel registro. Per PartCrafter, il checkpoint MIT riporta TripoSGVAEModel e pretrained_weights/TripoSG: ciò impone verifica, non dimostra automaticamente un divieto complessivo. SPAR3D/SF3D: non confondere licenza Community con MIT; non acquisire pesi gated in modo automatico. Risoluzione di Direct3D-S2 non è numero di vertici.

### Esecutore a grafo: scelta condizionata

ComfyUI è un candidato **esecutore locale** per i processi a nodi, subordinato alla regia Visual Factory e alla Compute Policy esistenti. Non sostituisce il selettore, la politica di ammissione, la revisione umana o Blender. L'adapter diretto CLI/Python resta disponibile come alternativa, in particolare quando un nodo o l'intero pacchetto non è ammesso. Non introdurre nuova infrastruttura cloud. Verificare obblighi GPL-3.0 per eventuali distribuzioni o modifiche a ComfyUI.

Ricognizione effettiva del 17 novembre 2026: MrForExample/ComfyUI-3D-Pack @ 9e8096e50c5bcf35e1f3e34c6ae06216101f8a11. Cinque grafi JSON upstream ispezionati, con blob Git e classi nodo conservati in `fixtures/visual-factory-3d/comfyui-recipe-catalog.v0.1.json`: TripoSR, PartCrafter, MV-Adapter texturing, Zero123++/InstantMesh, TRELLIS v1. Sono grafi UI di esempio, non payload API già eseguibili. Nessuna evidenza in questa ricognizione per TRELLIS.2, SPAR3D, SF3D, Direct3D-S2 o Step1X-3D nel pack. Il README documenta inoltre Unique3D, Wonder3D, Era3D, Stable3DGen, CRM, altri modelli: inventario successivo solo per i percorsi pertinenti e ammissibili.

Rilievi:
- Il pack contiene implementazioni Hunyuan3D e TripoSG non ammesse. Il suo __init__.py importa l'intero modulo nodes e registra tutte le classi; la scelta di un grafo non garantisce isolamento delle dipendenze. requirements.txt contiene dipendenze non fissate, incluse due URL Git senza revisione; install.py può scaricare e compilare componenti. **Non installare il pack completo**, né usare Install Missing Nodes, installazione automatica o download dinamico di modelli.
- Per la prima prova usare l'adapter diretto TripoSR, se qualificato; in parallelo progettuale isolare il percorso nodo minimo TripoSR o MV-Adapter senza importare codice escluso. Solo dopo audit statico, revisione dipendenze/diritti, build isolata e smoke test si può abilitare l'adapter a grafo. Se l'isolamento non è praticabile, mantenere CLI diretta, senza dipendenza obbligatoria da ComfyUI.
- Fissare commit ComfyUI, revisione nodi, modello/pesi, dipendenze e ambiente prima della build; verificare compatibilità reale e assenza di codice vietato. Non usare la sola dichiarazione MIT del pack. Eseguire solo in ambiente isolato senza privilegi, senza credenziali, con limiti CPU/GPU/RAM/disco/tempo e uscita di rete negata durante inferenza; il flag offline da solo non è un confine di sicurezza per custom nodes. Disabilitare nodi partner/API a pagamento secondo la versione fissata. Non aprire porte pubbliche. Non accettare grafi da client né classi arbitrarie.
- L'adapter futuro opera su istanza dedicata loopback: GET /system_stats, /object_info e /queue per preflight; POST /prompt solo per un grafo API bloccato dal digest, validato contro schema e allowlist esatti; GET /history/{prompt_id} per esito e output associati; timeout e cancellazione del proprio lavoro su istanza esclusiva (non interrompere job altrui); raccolta locale controllata delle mesh e hash; nessun URL di output arbitrario. Le API sono documentate upstream ma **non sono state chiamate** contro un'istanza operativa. Il formato UI deve essere tradotto e confrontato con il grafo API reale prima dell'ammissione.
- La ricetta lega engineId, role, backend, graphRevision/graphDigest, classi nodo ammesse, parametri, checkpoint e pesi bloccati, entitlement, limiti e contratto output. Nodi di preview non sostituiscono il salvataggio effettivo. Per materiali: stessa mesh o corrispondenza dimostrata.
- Meshoptimizer opera solo sul derivato; non sostituisce master Blender, né è automaticamente compatibile con decoder/versione del runtime. Verifica visiva e tecnica prima/dopo.

Fonti ComfyUI: https://docs.comfy.org/development/comfyui-server/comms_routes ; https://github.com/Comfy-Org/ComfyUI ; https://github.com/MrForExample/ComfyUI-3D-Pack/tree/9e8096e50c5bcf35e1f3e34c6ae06216101f8a11 . Evidenza PartCrafter: https://github.com/wgsxm/PartCrafter#training ; https://huggingface.co/wgsxm/PartCrafter/blob/69a0ffc1dad5e48e7e5ed91c0609f2b1276eb31f/model_index.json .

### Priorità aggiornate

1. Qualificare ammissione TripoSR e adattatore CLI semplice; non bloccare il primo risultato su un'installazione generale.
2. Valutare isolamento ComfyUI come backend riutilizzabile (nessuna dipendenza imposta al controller).
3. Qualificare un secondo motore di alta fedeltà: Direct3D-S2/TRELLIS.2 o SPAR3D/SF3D se licenze, quota e hardware lo permettono; non presumere una graduatoria prima delle prove.
4. PartCrafter rimane candidato strategico per le parti, ma sospeso. MV-Adapter può diventare lavorazione separata per materiali dopo audit.
5. Meshoptimizer come utensile finale, dopo verifica della resa.
6. Per ciascun ruolo conservare alternative ammissibili, non lanciare tutti i modelli.

SP-08.1b deve partire dalla matrice estesa di capacità e dal contratto dei backend, senza cambiare gli invarianti già definiti. Questa ricognizione non qualifica alcuna esecuzione.

## 3. Ordine dei job e regole di selezione

| Job | Input | Output | Condizione |
|---|---|---|---|
| J00 LOCK_REFERENCE | brief + immagine originale | riferimento con SHA-256, revisione umana | obbligatorio |
| J01 PREFLIGHT | registro, richiesta, ammissioni | matrice di lavori e motivi di esclusione | nessuna inferenza |
| J02 COMPUTE_ADMISSION | profilo di ogni lavoro + entitlement fresco | piano FREE_ONLY | prima di ogni lavoro; quota prenotata senza doppio conteggio |
| J03 GENERATE_SHAPE | medesima immagine, seme e parametri fissati | mesh/GLB originale | un tentativo per motore ammesso |
| J04 INSPECT_NORMALIZE | sorgente + derivato | report mesh e versione Blender importabile | non alterare l'originale |
| J05 REVIEW_FORM | viste neutre comparabili | fino a due candidate selezionate | revisione umana, nessuna promozione |
| J06 MATERIALIZE | mesh selezionata + guida | variante materiali | stessa topologia o corrispondenza dimostrata; adapter texture qualificato |
| J07 BLENDER_FINISH | mesh/variante + regia artistica | .blend, render, GLB master | finitura ripetibile |
| J08 OPTIMIZE_RUNTIME | master approvato in revisione | GLB derivato e rapporto di perdita | profilo Atlas |
| J09 CONTEXT_REVIEW | GLB + biblioteca candidata | screenshot, metriche, giudizio | viste e dispositivi, autorità false |

Per il pilota si selezionano uno o due motori realmente ammissibili, non quattro chiamate obbligatorie. Matrice teorica: TripoSR per la bozza, TRELLIS.2 per confronto in valutazione, TripoSG e Step1X sospesi. L'esecuzione parallela è ammessa solo con risorse e quota indipendenti accertate; altrimenti sequenziale. Un solo lavoro GPU contemporaneo come default prudente. La stessa richiesta può includere massimo quattro tentativi complessivi, ciascun motore/stadio un tentativo nel piano iniziale; ogni nuovo tentativo o cambio di parametri richiede nuova decisione registrata. Non usare output sintetici di test come candidati reali. Confronto multiplo esplicitamente richiesto non è un fallback o cambio silenzioso di modello; indisponibilità di un ramo non autorizza sostituzioni.

Un generatore che produce forma e texture congiuntamente viene valutato come tale. Non si trapiantano texture fra mesh arbitrarie; trasferimento/riproiezione è una lavorazione separata, con verifica di UV, corrispondenze e perdita di qualità. Step1X texture ha dipendenza esplicita dal proprio input mesh; un eventuale uso su mesh esterna è ipotesi da qualificare. Blender procedurale può rappresentare una candidata di controllo esplicitamente richiesta, non il risultato fittizio di un motore IA indisponibile.

## 4. Contratti e struttura artefatti

Un `atlas.visual-3d-request/v0.1` lega: requestId, subjectRef, packageDigest, artDirectionRef, sourceRevision, input.sha256 e dimensioni, eventuale mask.sha256, inputRightsRef, referenceReviewRef, roleRequested, qualityProfile Q4/Q3 esplicito, allowedEngineIds, modelRevision e artifactDigest per ogni motore ammesso, parametri/seed, budgetRaw e budgetRuntime distinti, computePolicyRef, maxAttempts, maxConcurrentGpuJobs, costClass FREE_ONLY e authority flags false. Nessun percorso di file arbitrario, token, URL scaricabile fornito dal client o dato personale. Accetta solo PNG/JPEG locale verificato o riferimento di archivio autorizzato. Un input senza hash o riferimento umano è `WAITING_FOR_REFERENCE`, non un piano eseguibile.

Un `atlas.visual-3d-candidate/v0.1` registra: requestId, candidateId, stage, engineId, providerId, exactSourceRevision, exactModelRevision, dependency/license evidence, inputDigest, paramsDigest, computePlanDigest, attempt, timestamps, costo verificato/stato, output con MIME/byte/SHA-256, metriche geometriche effettive e misurazione, modifiche rispetto all'originale, importReport, qualityReviewRef (null finché assente), status e authority false. Nessun campo hasTexture dedotto dalla sola estensione; analizzare GLB/materiali e accessori. Non dichiarare costo zero se la ricevuta di costo è ignota.

Struttura:
```text
<run-id>/
  request.json
  input/source.png
  input/reference-lock.json
  preflight/engine-plan.json
  preflight/compute-admissions/
  candidates/<engine-id>/<attempt-id>/
    original/
    normalized/
    metadata.json
    inspection.json
    logs/
    views/
  comparison/
    matrix.json
    review.json
  selected/
    master.blend
    master.glb
    render/
    runtime.glb
    runtime-review.json
  receipt.json
```
Ogni artefatto è immutabile per digest, log ripuliti di segreti; ogni derivato lega l'hash del genitore. Nessun modello/peso binario nel Git, nessuna risorsa esterna nel runtime Atlas. Consegna interna non equivale a pubblicazione. Archivio diagnostico distinto in caso di errore.

## 5. Controlli e confronto

Preflight tecnico obbligatorio: input/lock/hash, licenza, hardware, quota e costo, piano esatto, nessun privilegio o dato personale; import in ambiente isolato senza esecuzione di script incorporati. Limitare byte, memoria, dimensioni e decompressione; timeout per processo, no rete nell'import. GLB self-contained verificato strutturalmente, URI esterni rifiutati. Ispezionare vertici, facce, degenerazioni, componenti, bordi non-manifold, normali, spessore, eventuali autointersezioni, materiali, UV e texture. Una mesh aperta intenzionale è distinta da difetto; riparabilità motivata, non auto-chiusura distruttiva.

Per SP-08, a parità di scala, camere, fondo, illuminazione e materiale neutro, produrre fronte, tre quarti, lato, retro e dettaglio. Misure: silhouette e landmark confrontati con riferimento nella vista coerente, non indice di accuratezza reale del retro; densità e qualità topologica; silhouette leggibile in monocromia. Il retro inferito è ipotesi, non dato recuperato. La qualità artistica richiede giudizio umano separato: identità/curvatura, coerenza del volume su più lati, qualità costruttiva e dei raccordi, resa materica, presenza scenografica. Scala 1–4 già prevista da Atlas per gli astri; 4/4 per identità e qualità scultorea. Non sostituire il Quality Bar TRAMA, che resta distinto. Nessun punteggio automatico di estetica o vincitore sulla base di soli conteggi.

La tabella di confronto riporta PASS/REVISE/REJECT/NOT_RUN, valori misurati, assenze motivate, immagini/hash, tempi effettivi, stato licenze e osservazioni. Nessuna media compensa un hard stop. Filtro tecnico → confronto delle forme → scelta umana di al massimo due → materiali/Blender. Master ad alta densità conservato separatamente dal GLB runtime. Budget finale del modulo astri: <= 1 MiB, <= 18000 vertici, <= 3 primitive, nessuna risorsa esterna; non applicarlo indiscriminatamente alla mesh grezza. Il budget di ingest grezzo deve essere definito e convalidato prima dell'esecuzione, in relazione al profilo hardware. Prima e dopo ottimizzazione, confrontare render e dettaglio, non ridurre automaticamente la qualità per stare nel budget. Se incompatibile: REVISE.

## 6. Pilota e criteri di avanzamento

Storie, riferimento artistico SP-08: libro vivente con ali di pagine curve e sottili, dorso riconoscibile, finiture sobrie, non blocco monolitico o icona. Il riferimento originale deve essere creato e bloccato prima della generazione. La candidata SP-07.5 rimane intatta. Nessuna modifica ai quattro astri qualificati tecnicamente, alla Home o ai portali durante questo studio.

Sequenza:
- SP-08.1a: specifica e registro, nessuna inferenza.
- SP-08.1b: contratti JSON, compilatore puro e prove negative; scelta/ammissione del primo adapter, verifica di runtime e quota; immagine originale bloccata.
- SP-08.1c: primo smoke run esplicitamente autorizzato, zero costo provato, un candidato reale. Solo se ammissibile, secondo ramo.
- SP-08.1d: confronto con il master SP-07.5 e decisione umana su forma e materiali.
- SP-08.1e: import e finitura Blender, verifica WebGL contestuale; generalizzare ai restanti astri e agli oggetti didattici solo con evidenza positiva.

Test prima di live: input senza hash, licenza UE bloccata, licenza ignota, entitlement scaduto/ignoto, quota insufficiente, due job che competono per la stessa quota, timeout, formato invalido, URI esterno, fallimento import, perdita di texture, budget superato, ricevuta con authority true, tentativo oltre limite, modello non fissato, esito senza costo verificato. Nessuna rete o inferenza in CI di contratto. Gli adapter live devono riusare la semantica di ammissione esistente; non attivare la route Studio 2D per eseguire 3D.

## 7. Stato reale

SPECIFIED / NOT IMPLEMENTED / NOT LIVE QUALIFIED. La specifica non è un controller funzionante, non prova la disponibilità di compute, non autorizza un provider, non è una valutazione artistica. Il catalogo include motori bloccati a scopo di tracciamento, non di esecuzione. Il gate infrastrutturale noto di TRAMA è NO_SKYPILOT_FREE_ONLY_PROVIDER_BOUND, da rivalutare con evidenze fresche. Le quote ZeroGPU dipendono da account e disponibilità; la demo gratuita non implica API automatizzabile a costo garantito. Nessuna autorizzazione runtime, studenti, merge o pubblicazione.


## 8. SP-08.1b — Compilatore offline di selezione (incremento implementativo)

Stato: PLANNER_IMPLEMENTED / CI_PENDING / NOT LIVE QUALIFIED. L'incremento non implementa ancora gli adapter o l'esecuzione di modelli. La sezione 7 descrive lo stato storico SP-08.1a.

Artefatti:
- `schemas/trama-visual-3d-planning-input.v0.1.schema.json`: contratto del bundle con richiesta, asset, job, ammissioni e pool di calcolo; schema strutturale, non prova di autenticità delle evidenze.
- `scripts/compile_visual_factory_3d_plan.py`: compilatore deterministico solo stdlib, senza rete, provisioning, shell o inferenza. Input strettamente validati, digest canonicalizzati, riferimenti a licenza, qualificazione e piano compute; produce `trama.visual-3d-plan/v0.1` con motivi di esclusione.
- `fixtures/visual-factory-3d/storie-planning-example.json`: esempio **sintetico** senza riferimento artistico né quota, non richiesta operativa; atteso WAITING_FOR_REFERENCE.
- `tests/test_visual_factory_3d_plan.py` e workflow `Visual Factory — 3D planning contract`: 32 prove offline, compresa verifica dell'attuale catalogo non ammesso; qualificazioni e quote positive esclusivamente sintetiche.

Decisioni:
- Ogni job indica ruolo, input e ordine esplicito dei motori alternativi. La matrice comparativa può contenere fino a quattro job espliciti. Un motore alternativo è ammesso solo se nominato nel job, con lo stesso profilo Q3/Q4; nessuna degradazione silenziosa. Il compilatore non è un classificatore estetico: non attribuisce punteggi di qualità prima delle prove.
- Per ciascun ruolo, il registro autoritativo deve indicare licenseGate PRODUCTION_ELIGIBLE o EVALUATION_ONLY e executionGate QUALIFIED_FOR_PLANNING, più qualifiedProfiles esatti (ruolo, backend/revisione, sorgente, peso/artefatto, ambiente, parametri, riferimenti evidenza licenza/qualificazione, qualità, risorse minime e durata prenotata). Un record di ammissione nel bundle da solo non può scavalcare un blocco del registro. Il registro reale resta invariato e nessun profilo live è qualificato.
- I pool sono riferimenti a evidenze del piano compute TRAMA esistente, con osservazione/validità, capienza e costo marginale verificato. Scadenza conservativa 15 minuti, una riserva per job, un pool per provider, una sola esecuzione concorrente. Il compilatore sottrae le riserve condivise per evitare doppio conteggio nel singolo piano. I dati di pool devono essere deduplicati a monte anche quando diversi provider condividono lo stesso entitlement. Il budget in secondi è una normalizzazione futura di evidenze quota, non prova che il compiler SkyPilot attuale esponga tale dato. Non modifica TRAMA Compute Policy, né autorizza uso di credito o risorse.
- Le soglie VRAM del registro sono usate prudentemente come limiti inferiori iniziali in assenza di un aggiornamento auditato del profilo (non misure di minimo assoluto); anche RAM, disco e quota devono essere compatibili.
- Backend CLI preferito quando entrambi ammessi; ComfyUI richiede inoltre revisione backend qualificata e ricetta API esatta qualificata con graphDigest. Il pacchetto completo non è un backend ammesso. Nessuna importazione o conversione automatica dei grafi UI upstream.
- Gli asset sono identificati tramite hash dichiarato, riferimento di diritti/revisione e classe NONPERSONAL; il planner non legge i loro byte. Un job privo degli input richiesti rimane WAITING_FOR_REFERENCE; texture su mesh richiede immagine e mesh, fotogrammetria richiede almeno due fotografie come prerequisito strutturale (non garanzia di qualità). La verifica effettiva di MIME, dimensioni, hash, provenienza e input non personali è un gate separato per l'adapter.
- Esiti: PLAN_READY_FOR_REVIEW, PARTIAL_PLAN_FOR_REVIEW, WAITING_FOR_REFERENCE, STOP_NO_ADMISSIBLE_ENGINE. Anche un piano completo è **soltanto una proposta**: executionAuthorized=false, humanReviewRequired=true, referenceBytesVerified=false, liveEvidenceVerified=false e tutte le autorità false. I digest legano esattamente i dati consumati, non ne certificano la veridicità; l'adapter futuro deve ricaricare cataloghi da revisione fidata, verificare byte, evidenze e quota fresca e ricevere approvazione per il piano esatto. Nessuna esecuzione di piani parziali implicita.

Resta da qualificare: prima ricetta diretta TripoSR (licenza/pesi e hardware), eventuale secondo motore, riferimento Storie reale, adattamento dei ricevitori compute live e controllo import Blender. La qualifica del compilatore non elimina questi blocchi e non sostituisce le verifiche artistiche.
