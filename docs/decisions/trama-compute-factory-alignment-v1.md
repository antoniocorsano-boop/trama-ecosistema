# TRAMA — Compute Factory / CF-06B ALIGN

Data: 17 novembre 2026. Stato: proposta in revisione; implementazione sperimentale senza accesso ai servizi esterni. Autorità di esecuzione, spesa e pubblicazione: NESSUNA.

## Decisione architetturale

Un solo sistema produttivo, non tre filiere autonome. La presente decisione estende ADR-021 senza sostituire i vincoli FREE_ONLY né scegliere un nuovo strumento di predisposizione delle risorse. Riferimenti: ADR-021; TRAMA-COMPUTE-POLICY-v0.1; VISUAL-PRODUCTION-CONTRACT-v0.1; PR TRAMA #338 (aperta alla revisione di riferimento); PR Atlas #105 (lavorazione parallela).

- Arena: autorità sul curricolo, invariata.
- Studio Atlas: finalità educativa, direzione artistica, riferimenti, qualità richiesta e accettazione umana.
- Atlas Smart Production: provenienza della candidata, pianificazione delle dipendenze, memoria di riuso e produzione incrementale. La memoria esistente rimane la fonte autorevole e non viene duplicata nella Compute Factory.
- Visual Factory / Audio Factory e motori specialistici: metodo, modello, filiera, requisiti qualitativi, licenze e qualificazione dei motori. Il registro e il compilatore VF-3D esistenti conservano l'autorità di selezione. Nessuna sostituzione implicita di modello o qualità.
- Compute Factory: capacità condivisa per la politica delle risorse, l'esecuzione limitata, l'ammissione, la contabilità delle quote, il recupero e le evidenze. Estendere il compilatore e il contratto di disponibilità esistenti; non introdurre un registro concorrente o un secondo selettore di fornitori.
- SkyPilot: strumento già selezionato per la predisposizione delle sole infrastrutture compatibili e ammesse; nessuna attivazione automatica. Gli altri adattatori di esecuzione rimangono separati. Prefect è uno strumento facoltativo non qualificato per la gestione dei flussi, non una seconda autorità.
- Control Center: osservazione e riesame delle evidenze; nessun permesso implicito di esecuzione.
- Atlas: utilizza risorse approvate separatamente; nessuna ricevuta produttiva conferisce autorità di pubblicazione.

## Interfaccia

VisualProductionRequest esistente / richiesta 3D derivata → piano specialistico esistente → politica di calcolo esistente → esecuzione limitata (futura, autorizzata separatamente) → ricevuta esistente → verifica qualitativa → candidata → controllo separato di pubblicazione.

Smart Production può individuare anzitutto una candidata verificata e riutilizzabile; altrimenti richiede soltanto le lavorazioni mancanti. Conserva l'autorità sulla memoria di riuso e sulle decisioni qualitative. Compute Factory non attribuisce valore artistico. La produzione procedurale su CPU è un'opzione metodologica di competenza dello specialista; la gestione delle risorse non può ridurre la qualità per risparmiare GPU. Il riuso richiede provenienza esatta, diritti e validazione, non la sola corrispondenza del nome.

CF-06B.1 aggiunge una busta di raccordo deterministica, senza accesso alla rete, a partire dai risultati dei piani esistenti. Un piano 3D deve vincolare la propria impronta, l'impronta della richiesta, il suo identificatore e la qualità alla richiesta esatta. Il piano di calcolo v0.1 non contiene l'impronta della richiesta: l'associazione è esplicitamente POLICY_ONLY_UNBOUND e non può essere presentata come ricevuta vincolata alla richiesta. Entrambi sono riferimenti per il riesame, non prove di origine attendibile, disponibilità attuale, licenza o esecuzione. Nessuna rete, sottoprocesso, attivazione infrastrutturale o pubblicazione. Nessuna modifica alla PR #338 o ad Atlas.

## Invarianti

FREE_ONLY; vietato il ricorso a risorse a pagamento; blocco conservativo se l'ammissibilità è ignota; nessuna riduzione qualitativa; nessun dato personale degli studenti; nessuna attivazione implicita di account o servizi; tentativi limitati; prenotazioni atomiche prima di qualsiasi futura esecuzione; l'esito incerto trattiene la quota e blocca nuovi tentativi fino alla riconciliazione; riesame separato dalla produzione; nessuna autorità di pubblicazione; le impronte identificano byte e oggetti ma non ne autenticano l'origine.

## Sequenza

1. CF-06B.1: presente decisione, raccordo senza rete e prove.
2. CF-06B.2: dopo la stabilizzazione delle interfacce di #338 e delle candidate Atlas, vincolare i risultati effettivi delle risorse di prova dei due rami, riutilizzare i metadati esatti di Smart Production senza duplicarne la memoria; raccordare le unità di disponibilità delle risorse e la contabilità atomica; revisione indipendente.
3. CF-06B.3: collegare un motore procedurale locale attraverso il registro specialistico esistente, con ingressi sintetici isolati; conservare CF-06A come evidenza di laboratorio, non come secondo nucleo produttivo. Primo pilota comune: Storie / Il Libro vivente, rispettando il vincolo sul riferimento.
4. CF-07: qualificazione indipendente di sicurezza, autenticazione, provenienza, concorrenza, isolamento e recupero. CF-05B rimane bloccata; nessuna esecuzione esterna.
5. CF-08: integrazione dopo revisione esplicita; nessuna pubblicazione automatica.

Il laboratorio CF-02–06A documenta soltanto prove locali; i relativi conteggi non dimostrano integrazione nel repository. Questa modifica non attesta capacità GPU esterna, ammissione effettiva o disponibilità a costo zero.

## CF-06B.2a — Convergenza a revisioni fissate, 17 novembre 2026

- Sorgente VF-3D: PR TRAMA #338, revisione `05935f5ef73b532e0b3dd2aaa83ca82e21381d84`; esecuzione 44117809444 positiva, artefatto 14343342807. Il controllo automatico acquisisce separatamente la revisione esatta ed esegue il pianificatore deterministico effettivo con il pacchetto sintetico Storie, il registro e il catalogo delle ricette. Esito atteso WAITING_FOR_REFERENCE, zero lavorazioni pianificate. Nessuna acquisizione di modelli o inferenza. L'impronta è fissata; future variazioni della sorgente richiedono nuovo riesame.
- PR Atlas #105, revisione `be1b70b46a768c772bf6db58a9548b55d1ec9e17`, esecuzione 44103958943, attività 134111802184: ricevuta SP-02 effettivamente registrata, chiave delle dipendenze `007ea6703701dd30187fe538a733fd26ab58d0d43ac00769c2539b6ca4aec231`, dieci file verificati, candidateReused false. Si conserva la ricevuta osservata come piccola risorsa di prova, non le risorse memorizzate. Atlas mantiene l'autorità sul riuso. L'adattatore controlla struttura e chiave esatta della ricevuta; non verifica indipendentemente i byte degli artefatti o l'origine attendibile, non autorizza il riuso né qualifica una candidata.
- La stessa esecuzione Atlas presenta un arresto intenzionale nell'attività 134116899314: SP-05, sola anteprima, accettazione visiva in sospeso. Non è un errore di ripristino della memoria. Il successo dell'anteprima o del ripristino non implica approvazione della candidata.
- Le nuove prove riguardano il risultato del pianificatore effettivo, la riproduzione deterministica, l'alterazione di richiesta e piano e i limiti della ricevuta di riuso. I controlli appartengono alla procedura di qualificazione di calcolo esistente; nessun servizio di orchestrazione separato.
- Questo incremento dimostra convergenza senza rete, non esecuzione reale o qualificazione finale CF-06B.2. Restano: accettazione vincolata alla candidata, raccordo effettivo del riuso con evidenze autenticate di origine e byte, contabilità unificata delle quote, concorrenza e revisione indipendente. Nessuna modifica ai rami paralleli.

## CF-06B.2b — Registro sintetico delle quote

Trasferire i principi locali di transazione e scadenza di CF-03 e di separazione esplicita delle unità di CF-05 nella capacità di calcolo esistente. Il registro è un'implementazione di riferimento SQLite senza rete, non un nuovo pianificatore, registro dei fornitori o esecutore. Accetta raccordi di solo riesame con decisioni sorgente pronte, ma il piano NON attesta la disponibilità effettiva. I contenitori delle quote devono avere identificatori sintetici e unità simulate tipizzate; capacità e scadenza fissate non possono essere cambiate reinizializzando il contenitore. Nessuna conversione presunta tra neuroni, secondi GPU ponderati e secondi CPU. Tutti gli importi sono esplicitamente sintetici.

Prenotare atomicamente in una transazione (BEGIN IMMEDIATE); una prenotazione per impronta della richiesta. La ripetizione identica restituisce lo stato esistente, anche dopo la scadenza; parametri o riferimenti diversi sono rifiutati. Una prenotazione nuova scaduta è rifiutata. Se una prenotazione scade prima dell'avvio simulato, libera la quota; se scade durante l'esecuzione simulata diventa UNCERTAIN e trattiene l'intera quota. La simulazione completata trattiene la quota. Nessun nuovo tentativo o ripristino automatico, nessuna attivazione di risorse reali. Il tempo è fornito dal chiamante per le prove deterministiche. L'identità non equivale ad autenticazione.

La qualificazione esistente aggiunge inizialmente 16 prove per limiti di quota, concorrenza di richieste distinte e duplicate, unità incompatibili, annullamento della transazione, persistenza al riavvio, piani bloccati o alterati e recupero. Restano le precedenti prove di convergenza.

Condizioni aperte: autenticazione della disponibilità effettiva dei fornitori e limiti rigidi di spesa, finestre contabili e unità verificate per servizio, identità stabile tra piani e autorizzazione alla riconciliazione, orologio attendibile, ricevute di verifica e revisione indipendente. Il registro sintetico non ha interfaccia remota, esecuzione di processi, credenziali o autorità di pubblicazione. Non collegarlo a esecuzioni esterne. La futura contabilità su più macchine richiede persistenza transazionale qualificata separatamente. Nessuna dichiarazione di prontezza produttiva.

## CF-06B.3a — Evidenze procedurali, non ammissione del motore

CF-06A ha generato i GLB originali della sfera armillare con Python/Trimesh, non Blender. Il registro VF-3D fissato contiene blender-procedural con EXISTING_ATLAS_PIPELINE_REFERENCE_ONLY e verifica degli strumenti/licenze ancora aperta; non attribuire a Blender la qualifica di Trimesh e non creare un secondo registro. Il nuovo adattatore in sola lettura controlla intestazione GLB, struttura dei blocchi, identità JSON, assenza di URI esterni per buffer e immagini, lunghezza esatta dichiarata, SHA-256 e numero di mesh. Registra separatamente triangoli e tempo GPU dichiarati, senza misurarli indipendentemente. L'impronta del sorgente identifica i byte forniti, non l'autore o la provenienza attendibile. Non conferisce qualificazione geometrica, artistica, di licenza o ammissione all'esecuzione. I due GLB originali sono stati ispezionati localmente; le impronte e dimensioni osservate sono conservate in una piccola risorsa di prova, non come copia dei file binari. Si aggiungono nove prove sintetiche dei limiti del contratto.

Prossimo passo: coordinare il profilo esatto del motore procedurale con il responsabile VF-3D dopo la stabilizzazione di #338, verificare dipendenze e diritti, fissare strumenti e riferimento; eseguire una candidata isolata per Storie soltanto dopo tale controllo. Smart Production di Atlas resta responsabile del riuso e del riesame delle candidate. Nessuna esecuzione esterna, pubblicazione, nuovo account o risorsa.

## CF-06B.3b — Riesame del profilo procedurale Storie

Atlas possiede già la scultura procedurale Storie in star_sculpture.py, con adaptive_identity.py e knowledge_composition.py. Non introdurre un generatore duplicato del libro, una seconda memoria di riuso o una direzione artistica indipendente. La sfera armillare CF-06A è evidenza di laboratorio distinta e non qualifica Blender.

Fissare la PR Atlas #105 a be1b70b46a768c772bf6db58a9548b55d1ec9e17 e la PR VF-3D #338 a 05935f5ef73b532e0b3dd2aaa83ca82e21381d84. L'esecuzione Atlas osservata 44103958943, attività di pianificazione 134111159477, documenta un adattamento limitato a quattro tentativi: scala Storie 0,94, 165 vertici, 310 triangoli, cinque componenti chiuse e orientate, profondità 0,430205 m, raggio 0,620902 m e SHA-256 della mesh 7617e41bafc305afc9c841d057c7972af178be2bce0d03386916688b6e36532d. È una registrazione di evidenza geometrica procedurale, non una candidata accettata. L'esecuzione effettiva ha mantenuto il blocco dell'accettazione visiva.

La procedura Compute Policy esistente risolve il repository Atlas tramite il registro di adesione esistente, acquisisce le due revisioni fissate senza conservare le credenziali delle sorgenti, verifica le revisioni esatte e tre impronte Git dei file geometrici, riproduce la geometria deterministica CPU di Atlas e verifica il catalogo VF-3D. Otto nuove prove riguardano geometria osservata esatta, riproduzione con il generatore originale, geometria danneggiata, determinismo limitato, registro, mancanza del riferimento fissato e assenza di ampliamento delle autorizzazioni. Nessuna invocazione di Blender, produzione di immagini, installazione di modelli, API dei fornitori o predisposizione di infrastrutture. Nessuna modifica ai rami paralleli.

Il profilo storico Blender di Atlas (4.2.23, SHA-256 archivio bea0eb3146be13eae6225409a117b215184f41b7f79e799f97cb3abb8f6dc404) è soltanto un riferimento candidato degli strumenti. VF-3D indica ancora blender-procedural come EXISTING_ATLAS_PIPELINE_REFERENCE_ONLY e PENDING_EXACT_TOOLCHAIN_AND_INPUT_REVIEW. La risorsa di prova sintetica VF-3D per Storie non possiede riferimento effettivo fissato, ammissioni o gruppi di risorse. Non dichiarare ammissione del motore o approvazione del riferimento. Prima di una nuova esecuzione produttiva limitata, il profilo candidato deve essere approvato nel registro esistente con strumenti esatti, diritti, ambiente, ingressi/uscite e vincolo delle evidenze. Conservare il blocco artistico Atlas e proseguire verso il riesame e la qualificazione condivisi, non verso un altro motore indipendente.

## CF-07a — Riesame e rafforzamento della qualificazione

Revisione di riferimento 3fd8eb075abeeef42f38480cde253553645f0fa6: quattro attività PASS; procedura di calcolo 44126271266, 65/65 prove specifiche, comprese otto prove della geometria esatta di Storie. I commenti ECC su evidenze di sicurezza, configurazione e sistema di collaudo riportano esito positivo per tale revisione; ECC non può pubblicare controlli con i permessi attuali. Sono controlli automatici esterni, non approvazione umana indipendente. Al momento del riesame l'elenco delle revisioni della PR era vuoto.

Rilievi:
- CF-R01: le prove obbligatorie tra sorgenti utilizzavano unittest skipUnless; un prerequisito assente poteva restituire successo con prove saltate. La revisione di riferimento ha effettivamente eseguito tutte le prove, ma il rischio futuro di falso positivo è reale. Correzione: esigere il numero esatto di prove attese, nessuna prova saltata, nessun fallimento o fallimento atteso e nessun successo inatteso; controllo dedicato con sei prove avversariali.
- CF-R02: l'acquisizione del repository principale conservava le credenziali predefinite durante l'importazione del codice sorgente fissato. Correzione: persist-credentials false anche per l'acquisizione principale, come già previsto per le sorgenti; permessi di sola lettura invariati.
- CF-R03: la contabilità sintetica SQLite non dispone di orologio attendibile, disponibilità autenticata o autorità su più macchine. Limite intenzionale, produzione bloccata.
- CF-R04: il riferimento GLB verifica soltanto struttura e metadati dichiarati; non equivale a validazione geometrica completa o provenienza autenticata. Nessuna ammissione implicita.
- CF-R05: le riproduzioni dei sorgenti usano revisioni immutabili e dichiarazioni di ricevute osservate; non costituiscono verifica integrale dei byte della candidata, approvazione del riferimento fissato, accettazione artistica o qualificazione dell'esecuzione Blender. Conservare il blocco visivo. Prima dell'integrazione i revisori devono confermare la disponibilità durevole delle revisioni sorgente fissate o aggiornarle con riproduzione esatta delle evidenze. Non indebolire il vincolo delle revisioni né chiedere credenziali più ampie per risolvere problemi di accesso.
- CF-R06: nessuna approvazione di un revisore indipendente registrata al momento. Richiedere riesame dell'esatta revisione finale, distinto dai controlli dell'autore, prima dell'integrazione. Nessuna integrazione automatica.

Questo incremento rafforza la qualificazione, non costituisce l'approvazione finale CF-07. Ripetere tutti i controlli sulla nuova revisione; sei nuove prove previste (71 complessive se tutte le precedenti sono eseguite). Nessuna esecuzione reale, attivazione di account, pubblicazione, autorizzazione di fornitori o modifica dei rami paralleli.

## CF-07b/c — Revisione indipendente e correzioni

Revisione esaminata: 61dccd029d8565c5e6978a3ce33363571da2aaaf. Quattro attività positive, 71/71 prove specifiche, nessuna prova saltata. Codex Review completata senza rilievi; Devin Review ha segnalato due aspetti. I controlli automatici ECC sono positivi, senza possibilità di pubblicarne l'esito come controllo GitHub con i permessi attuali. Nessuna approvazione umana indipendente registrata.

- CF-R07: ripetizione identica di una prenotazione dopo la scadenza rifiutata prima della consultazione dello stato esistente. Correzione: mantenere la validazione dei tipi e degli intervalli, consultare prima la prenotazione esistente nella stessa transazione, applicare il vincolo temporale alle sole nuove prenotazioni. Quattro nuove prove: ripetizione dopo la scadenza negli stati CANCELLED, UNCERTAIN e SIMULATED_DONE; rifiuto di nuove richieste scadute e ripetizioni alterate. Verificare anche che le quote non siano riaddebitate o liberate impropriamente.
- CF-R08: documento decisionale prevalentemente in inglese, non conforme a CONTRIBUTING.md. Correzione: traduzione integrale della parte discorsiva in italiano, conservando identificatori tecnici, revisioni, evidenze, invarianti e distinzione tra capacità attuali e future.

La nuova revisione deve superare nuovamente tutti i controlli (75 prove specifiche previste) e la revisione indipendente. Rimane aperta la conservazione durevole delle sorgenti fissate di #338 e Atlas #105. Non integrare automaticamente. Nessuna estensione dell'autorità di calcolo, spesa o pubblicazione.
