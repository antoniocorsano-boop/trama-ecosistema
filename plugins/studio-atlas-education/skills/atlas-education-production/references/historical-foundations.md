# ATLAS-QE-01 — Fondamenti recuperati e raccordo operativo
Data: 12 novembre 2026. Ricognizione documentale e proposta di raccordo, non nuovo corpus di ricerca, non promozione di ipotesi a standard scientifici o autorizzazione runtime. Nome prodotto: Curricolo Atlas. Studio Atlas Education riusa CAP-ATLAS-PERCORSI; non crea un secondo ecosistema o un nuovo motore.

## 1. Fonti canoniche da consultare prima di progettare
Percorsi sotto `docs/capabilities/atlas-percorsi/` salvo indicazione diversa. L'indice canonico è l'entrata per aggiornamenti e stati: `workflow/CANONICAL-INDEX-v1.md`. Riferimenti recuperati dal ramo main o dalle PR storiche; gli hash blob qui indicati fissano le revisioni effettivamente ispezionate. Non equivalgono a nuova revisione scientifica esterna.

| Fonte | Riferimento/versione | Uso |
|---|---|---|
| PR TRAMA #96, integrata | b4b2fd92d42d51d2848ba9bde2e22fc45738ae1e | Pacchetto ricerca, pedagogia, narrazione e salvaguardie |
| Indice canonico | workflow/CANONICAL-INDEX-v1.md, blob def58d9ca68c2a81fdf62968c300622475f891e8 | Autorità, stati, evidenze, esperimenti, rinvii |
| Registro ricerche | research-evidence-register.md; research/evidence-first-research-program-v1.md | Fonte→finding→limite→decisione→test; gerarchia delle evidenze |
| Modello pedagogico | pedagogical-model.md | Ipotesi di autoregolazione, scaffolding, progressione e trasferimento |
| Manuale narrativo | narrative-experience-bible.md | Metafora, soggetto, atmosfera, linguaggio, sequenza |
| Costituzione | governance/CHILD-SAFE-LEARNING-EXPERIENCE-CONSTITUTION-v1.md, blob e5ac20c603c71852ff3625101e63fe62a6eebb81 | Salvaguardie, dignità, autonomia, privacy, attenzione, errore, agenti |
| Produzione Percorsi | architecture/productive-pathway-workflow-v1.md; templates/PATHWAY-DOSSIER-TEMPLATE.md | Dossier, evidenze, grammatica, storyboard, revisione |
| Biblioteca | product/STUDENT-LIBRARY-PRODUCT-CONTRACT-v1.md, blob cb8988fbb513b2a1a4d8e0f65d00176bb18c9818; TRAMA #222 | Quality floor, gate umano, sei territori solo candidati |
| Esperienza primo ciclo | product/FIRST-CYCLE-LEARNER-EXPERIENCE-SPEC-v1.md, blob 3b36bb1f26c9d1cee3bae8c30a7dd7d907c39c2c | Prima apertura, linguaggio concreto, rappresentazione, manipolazione, feedback |
| Mondo compatto | product/COMPACT-LEARNING-WORLD-SPEC-v1.md, blob 41e90b4ec016cc7ff484255ab88a9eaaa92426f2 | Ruolo, esplorazione, informazione distribuita, conseguenze |
| Narrazione prima dell'interfaccia | product/STORYTELLING-FIRST-AUTHORING-CONTRACT-v1.md, blob d597e62a7e2d11217a8fedf3e498419ba4074183 | Story review prima del mondo e delle schermate; eccezione non narrativa motivata |
| Grammatiche | grammars/registry.yaml, blob 1faa26c2bc61bbca1692b6bb73e732c2a500ad91 | 11 grammatiche candidate, non effetti o modelli approvati |
| Ricerca UX didattica | research/common/first-cycle-digital-learning-experience-screening-v1.md, blob b653fd94a36051c40004ce1f48cf36296184b38d | Scaffolding, manipolazione, inquiry, precedenti progettuali |
| Benchmark mondi | research/common/game-world-learning-experience-benchmark-v1.md, blob b1fef33143b82d19ac611f8a095ee9773dd03ffc | Game design, agency, narrativa distribuita e precedenti |
| Studio Atlas | product/STUDIO-ATLAS-PRODUCT-FOUNDATION-v0.1.md, blob b4489b6b34fa57cce81a768b80fb0d8cdd2e8a18 | Dominio authoring, journey, autorità, contratti esistenti |
| Visual Factory | production/VISUAL-FACTORY-v0.1.md, blob 029c713cadb41074af6adcd1b63462425c181b11 | Produzione da storyboard, asset e ricette riproducibili |
| Visual Quality Bar | production/VISUAL-QUALITY-BAR-v0.1.md, blob e31b3451f222cb821bd2a80453e14b229da5f464 | Livelli visivi Q0–Q4, obiettivo Q3, hard stops HS01–HS10 e 8 dimensioni |
| VPC-01 | TRAMA #251, head 9632889c466b738b44b263d18313160b049ba027; docs/superpowers/specs/2026-10-05-visual-preflight-compiler-design.md | Preflight prima del provider, non riaprire orchestratore; FREE_ONLY |
| Motore e anteprima | TRAMA #216/#219; Atlas #69/#80 | Infrastruttura e ponte già sviluppati, non equivalenti a qualità del prodotto |
| Audit | TRAMA #242, head 9dbebff3a7b7cfa5676ad932780ebd2a26a13226 | Riconciliazione storica; non dedurre stato attuale runtime |
| Piloti attuali | TRAMA #307, Atlas #84/#85 | Missione 118 e Energia; qualificazione ancora aperta |

Altri approfondimenti indicizzati nella PR #96 e nell'indice: cognitive load/attention/multimedia, sviluppo esecutivo e metacognitivo, emozione/errore/agenti, recupero e trasferimento, manga e letteratura visuale giapponese, comparazione di metafore, storyboard, prototipi multiscena, salvaguardie e sostenibilità. Consultare anche i record normalizzati e la costituzione integrale. Questa ricognizione ha letto direttamente le fonti principali elencate, non tutti i documenti o ogni paper individualmente; gli altri sono riferimenti da riesaminare quando pertinenti.

## 2. Dalla ricerca a decisioni verificabili
Non ricercare a posteriori per giustificare scelte già fatte. Il registro storico comprende LifeComp, autoregolazione (Panadero), carico cognitivo/multimedia, trasferimento, e gli screening citano Shao et al. 2023 (scaffolding), Peffer et al. 2015 (inquiry), Xie et al. 2018 (touchscreen 0–5, non generalizzare), Clark et al. 2016 (game design), Naul e Liu 2019 (narrativa), Huynh et al. 2020 (11–13), Joshi et al. 2024 (agency). Questi riferimenti derivano dai documenti storici, non da nuova verifica delle pubblicazioni. Distinguere popolazione, metodologia, esito misurato e limiti. PhET, Brilliant e Labster sono precedenti di progettazione, non prova di efficacia di Atlas. Non riprodurre asset o contenuti protetti. Nuova ricerca solo per lacune reali; registrare evidenze negative e claims non supportati.

## 3. Principi trasversali da applicare
- Prima competenza, evidenza e azione cognitiva; poi grammatica adatta, storia quando funzionale, mondo, storyboard, media, interfaccia. Per Percorsi narrativi mantenere Story Review e World Review distinte; per microcorsi/schede non forzare una storia, documentare eccezione ove il contratto Percorsi la richiede.
- Apertura: situazione, materiale, cosa accadrà, azione concreta comprensibili rapidamente (regola dei primi 10 secondi come lente umana, non soglia cronometrica). Una gerarchia leggibile; elemento visivo significativo; comando primario proporzionato; no schermata amministrativa, pulsanti duplicati, pannelli generici o sovradimensionati; controlli secondari discreti e raggiungibili. Se video, poster coerente prima della riproduzione, controlli accessibili, nessun autoplay obbligatorio; sottotitoli/trascrizione e alternativa equivalente; mantenere asset approvati.
- Rappresentazione prima di spiegazione: agire sullo stesso oggetto che esprime il concetto (sequenza, relazione, modello, confronto, indizio), con alternative accessibili. No interazioni decorative, no quiz travestito; riscontro visibile nella situazione, possibilità di correggere e spiegare.
- Mondo narrativo: personaggi persistenti e funzionali, motivazioni, ruolo autentico del discente, indizi/informazioni distribuiti, conseguenze osservabili, curiosità non manipolativa. Non confondere un mondo 2D con necessità di 3D o motore nuovo.
- Ritmo: alternare orientamento, azione, conseguenza, pausa, revisione, nuovo contesto. Limitare ridondanza testo/voce/immagine, rumore visuale, movimento inutile e sovraccarico; segnalare ciò che conta; segmentare con controllo del ritmo.
- Dignità e inclusione: linguaggio concreto per discente; termini tecnici quando sono oggetto di apprendimento, non interfaccia amministrativa. Età non è diagnosi. Supporti accessibili, no infantilizzazione. Personaggi artificiali trasparenti, domande legate al compito, nessuna richiesta di informazioni intime, dipendenza o profilo.
- Estetica: composizione intenzionale, tipografia, spazi, contrasto, asset rifiniti, continuità identitaria; Q3 Visual Quality Bar come livello obiettivo quando applicabile. Mobile composto, non semplicemente compresso; controlli su dispositivo e ingrandimento quando pertinenti. Attestati e guide coerenti con l'identità.
- Riflessione e trasferimento: esperienza→azione→conseguenza→revisione→applicazione a caso nuovo. Dossier docente prima/durante/dopo, matrice obiettivo-azione-evidenza-criterio; nessun punteggio, tempo, badge o completamento equivale ad apprendimento certificato. Riscontri di sperimentazione separati e non identificanti.

## 4. Raccordo con le 12 dimensioni ATLAS-QE-01
| Dimensione | Fonte/metodo riusato | Evidenza operativa |
|---|---|---|
| Q01 Pedagogica | modello, LifeComp come riferimento non prescrittivo, dossier | obiettivi/azioni, mediazione, riferimenti Arena autentici |
| Q02 Disciplinare | registro/evidence-first | fonti e controllo delle affermazioni; distinguere finzione |
| Q03 Cognitiva | grammatiche, carico, scaffolding | azioni significative, rappresentazione, indizi e revisione |
| Q04 Espressiva | learner-language, bible, regia vocale | lettura/ascolto integrale; azioni chiare e registro |
| Q05 Artistica | Visual Factory, Visual Quality Bar | direzione, composizione, primo fotogramma, continuità, PDF |
| Q06 Narrativa | storytelling-first, compact world | story/world review, sceneggiatura, ritmo; eccezione motivata |
| Q07 Interattiva | quality floor, world, direct manipulation | ingresso, conseguenze, navigazione, ergonomia mobile |
| Q08 Emotiva | costituzione, motivazione, agency | errore recuperabile, curiosità non manipolativa |
| Q09 Inclusiva | costituzione, UX, Visual Quality Bar | alternative significative, focus, zoom, contrasto, media |
| Q10 Tecnica | Experience Engine, preview, Factory/VPC | prove e integrità, asset versionati, offline ove previsto |
| Q11 Etica | costituzione e review contract | diritti, privacy, limiti agenti, nessuna inferenza identitaria |
| Q12 Trasferibilità | ricerca transfer e claim calibration | compito in contesto nuovo, criterio e claim ceiling |

Non confondere Q01–Q12 (dimensioni) con Q0–Q4 (maturità visiva) o D1–D8 (rubrica visuale). Per la qualificazione complessiva non compensare difetti: mantenere tutti i gate applicabili e hard stops; l'eventuale soglia numerica della rubrica visiva storica non sostituisce i 12 PASS, non autorizza pubblicazione. Una proposta storica resta proposta; la tassonomia a sei territori è candidata, non autorità. In caso di conflitto documentare decisione umana separata; non declassare salvaguardie. ChatGPT è ambiente scelto per la produzione del nuovo plugin; artefatti, contratti e conoscenza restano portabili e indipendenti dal provider secondo il workflow storico, senza introdurre un secondo sistema di authoring. Studio Atlas acquisisce/revisiona, Curricolo Atlas pubblica autorizzato, Arena resta fonte curricolare, Docente OS mantiene continuità della lezione.

## 5. Applicazione ai piloti e memoria negativa
- MUSEO ZERO (vedi indice e PW-STRATEGY-SELECTION-01): spike Phaser tecnicamente valido, ma prodotto Q1; riprendere lezioni di revisione, non il motore né il progetto GPU. Rifiutare la riduzione a leggi/scegli/continua. Stato storico: story approvata per world design; non dedurre approvazione mondo, esperienza o runtime.
- Missione 118: HPR ha rilevato pulsante di riproduzione duplicato/dilatato, copertina mancante e attestato amministrativo. Il nuovo ingresso cinematografico corregge quei rilievi specifici; non prova qualità complessiva. Valutare interi tre ambienti: se decisioni si riducono a risposte su pannelli, verificare possibilità di agire sulle rappresentazioni e mostrare conseguenze, senza buttare asset approvati. Verificare voce, sincronizzazione, accessibilità, mobile fisico, guida, Arena e diritti.
- Energia in movimento: usare grammatica simulation-microworld/construction-workshop solo come candidata motivata, non narrativa artificiale. Modello manipolabile, previsione→osservazione→spiegazione→trasferimento. Confrontare con precedenti PhET solo per principi, non copiare. Fascicolo, rigore del modello, mobile, revisione umana e sperimentazione distinta.
- Per entrambi: dossier, matrice Q01–Q12, evidenze esatte e gap; nessun PASS ricavato da questo documento. Non riprogettare Engine o Studio Atlas per qualificare due contenuti. Non integrare, distribuire o pubblicare senza gate.

## 6. Checklist prima di produrre / rivedere
1. Consultare indice, fonti pertinenti e dossier storico; annotare riferimenti, stato, gap e limiti.
2. Dichiarare famiglia, azione cognitiva e grammatica motivata; per Percorsi applicare gate storia/mondo/esperienza.
3. Prima schermata e storyboard: orientamento, gerarchia, funzione degli elementi e accessibilità, prova su mobile.
4. Produrre asset reali, inventario, regia, diritti, sorgenti; niente sostituzioni arbitrarie.
5. Collaudare l'esperienza intera e il fascicolo; applicare matrice, salvaguardie e hard stops storici; documentare eventuali N/A specialistici.
6. Revisione umana, correzioni, nuova versione e nuova prova; sperimentazione e pubblicazione restano distinte.
