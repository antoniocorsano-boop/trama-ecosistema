# TEACHER-YEAR-01 — Prima prova documentale curricolo → programmazione → UDA (Tecnologia 2026/2027)

**Data di osservazione:** 3 novembre 2026  
**Stato della prova:** DOCUMENTARY_PARTIAL / HUMAN_PEDAGOGICAL_REVIEW_REQUIRED / INSTITUTIONAL_QUALIFICATION_BLOCKED  
**Tipo:** verifica read-only su fonti storiche e correnti, senza registrazioni di classe, studenti o mutazioni dei sistemi.  
**Baseline TRAMA:** main@da90866310fa1404e23cee197bd2d4e34879c7ae  
**Baseline prodotto Docente OS osservata:** develop@93542e06975c09f5fdafd375d72dde927fa2669d; main@c1301f1f2910cba1ac9fc315cf5461af0fbad1db (lettura del medesimo modello Piano annuale, blob diversi).  
**Riferimento:** [TEACHER-YEAR-01](../strategy/TRAMA-TEACHER-YEAR-01-ciclo-professionale-e-programmazione-annuale-2026-11-03.md); [protocollo](./TRAMA-TEACHER-YEAR-01-protocollo-programmazione-annuale-2026-11-03.md).

## 0. Rettifica di metodo e fonte di autorità — Arena prima di Drive (3 novembre 2026)

**Decisione del docente confermata:** l'analisi di TEACHER-YEAR-01 parte dal curricolo **già realizzato in CurManLight Arena** per l'I.C. Calvario-Covotta «don Lorenzo Milani» di Ariano Irpino (AVIC849003). Non si ricostruisce né si adotta un nuovo curricolo dai documenti Drive; le matrici documentali delle sezioni 3–4 e 9.2 hanno valore **esplorativo e di confronto**, non sostituiscono la selezione dei segmenti/obiettivi/identificatori governati in Arena.

**Preesistenze software verificate in GitHub:**
- **Arena PR #347, merged 20/10/2026**, exact head `3b067af857af0598191e4e2b5b90f7426008acc5`: implementati la materializzazione canonica del master 1.3, il pacchetto `TRAMA_CURRICOLO_VERTICALE_RELEASE_V1`, manifest di copertura, versione, provenienza, impronta strutturale e stati di autorità. Repo: https://github.com/antoniocorsano-boop/CurManLight_arena/pull/347 .
- Il read-model `canonicalCurricoloReadModel.ts (modulo Arena per la lettura del curricolo)` espone in Arena la verticale per ordine, ambito, annualità, obiettivi e contenuti dal pacchetto verificato; `src/domain/transfer/curricoloVerticaleRepositoryExportV1.ts` produce la release dalla versione, dai segmenti, dai nodi e dai collegamenti memorizzati.
- **Docente OS PR #722, merged 21/10/2026**, exact head `253e6d287392cc6cdca945753818ff89857d459b`: consumer `selectArenaVerticalCurricoloSlice`, vincolato a istituto, anno, ordine, classe, disciplina, versione, impronta e provenienza Arena. Repo: https://github.com/antoniocorsano-boop/docente-os-2026-27/pull/722 .
- **Arena REG-CURR-00@1.13** registra `CAN-CURR-MASTER-00@1.3` con copertura documentale completa e **validazione professionale complessiva ancora OPEN, approvazione collegiale NOT_YET, vigenza NO**. Il consumer conserva `PROVISIONAL_BASELINE`; una release tecnicamente valida **non** attesta l'approvazione.
- **Perimetro di Arena:** 113 scope canonici del master v1.3 nella materializzazione; l'intake Docente OS ne seleziona solo i contenuti pertinenti alle assegnazioni, non crea copie o autorità curricolari autonome.

**Sequenza corretta del collaudo:**
1. Identificare e leggere **l'effettiva release/istanza di Arena** del Don Lorenzo Milani 2026/27, non una fixture di test o una bozza selezionata autonomamente in Drive; controllare identità istituto, versione, impronta, manifest, stato di autorità.
2. Estrarre i **segmenti, obiettivi, conoscenze e nodi Arena** di Tecnologia della secondaria per le classi I, II e III, distinguendo il regime delle coorti e le formulazioni di istituto dalle prescrizioni nazionali.
3. Confrontare **questi elementi Arena** con `CAN-PLAN-1/2/3`, `CAN-PRG-1/2/3` e le UDA esistenti; qualificare per ogni collegamento: riferimento Arena (versione, segmento, nodo/obiettivo), UDA, attività, evidenza **prevista**, criterio, copertura e revisione professionale.
4. Verificare in Docente OS il consumo della stessa release, senza scambiare il `manifest.coverageStatus = SATISFIED` (completezza strutturale del curricolo) per la copertura pedagogica degli obiettivi nel Piano annuale: sono due controlli distinti.
5. Esporre il solo eventuale gap di integrazione **verificato** sul prodotto; non aprire nuove UDA, generatori, registri paralleli o uno strato alternativo a Arena. Nessuna promozione automatica di autorità e nessun dato reale di classe.

**Punto da controllare sull'istanza reale, non da classificare come difetto già dimostrato:** il materiale di test e lo script di materializzazione riportano identificativi interni d'istituto diversi (`ic-calvario-covotta-don-milani` e `ics-lorenzo-milani`); verificare l'identità **effettivamente serializzata** nella release di Arena e quella selezionata dal consumer. Non inferire errore o proporre migrazioni da questi soli valori di test/script.

**Stato della presente PR:** il ciclo Arena→Docente OS è **IMPLEMENTED** e le PR tecniche citate sono già integrate; la **prova end-to-end sulla release effettiva e sul binding granulare Arena→Piano→UDA non è ancora stata eseguita in questo rapporto**. La qualificazione istituzionale resta distinta e OPEN; il precedente blocker formulato come «curricolo di altro istituto da acquisire» è **ritirato**.

## 1. Risultato verificabile e limite di autorità

La risposta principale non è «occorre costruire una programmazione da zero». Il riferimento curricolare operativo per la verifica è **Arena**, con master e release governati; Drive serve alla documentazione e al confronto, senza costituire una seconda autorità. Le programmazioni **CAN-PRG-1**, **CAN-PRG-2** e **CAN-PRG-3** esistono già nella raccolta professionale, con 66 ore per annualità; esiste anche la **CAN-TEACHER-CYCLE-MAP-DOS-01**, mappa canonica di lavoro del ciclo docente dal curricolo alla riprogettazione (18 settembre 2026). In Docente OS esistono il Piano annuale a 33 blocchi × 2 ore, le UDA e il passaggio contestuale Classe → Progetta. Si deve **riutilizzare**, non ricostruire in parallelo.

**Vincolo documentale decisivo:** il registro maestro curricolare **REG-CURR-00 v1.13** identifica **CAN-CURR-MASTER-00 v1.3, 6 settembre 2026** come «baseline curricolare canonica integrale materializzata», ma **DA VALIDARE PROFESSIONALMENTE / NON VIGENTE**. Lo stesso registro precisa: READY_FOR_COLLEGIO NOT_YET; approvazione collegiale NOT_YET; promozione a curricolo vigente NOT_AUTHORIZED. Gli esiti del pilota multipersona Tecnologia prima non equivalgono a delibera del Collegio.

**Provenienza — rettifica dell'istituto (03/11/2026):** il contesto da qualificare è l'I.C. Calvario-Covotta «don Lorenzo Milani» di Ariano Irpino (AVIC849003), non l'I.C. «P.S. Mancini». Nel Drive sono già presenti proposte disciplinari esplicitamente intestate al Don Lorenzo Milani, dunque **non è corretta l'asserzione che tutta la documentazione provenga da un'altra istituzione**. È ancora necessario distinguere la proposta di lavoro dal curricolo formalmente adottato, verificarne gli atti di approvazione e la decorrenza. I dettagli di provenienza e le fonti istituzionali sono nella §9.1.

**Regime nazionale:** D.M. 9 dicembre 2025 n. 221 art. 1, pubblicato nella G.U. 27 gennaio 2026, https://www.normattiva.it/atto/caricaDettaglioAtto?atto.codiceRedazionale=26G00021&atto.dataPubblicazioneGazzetta=2026-01-27 . Per il 2026/27 la prima della secondaria I grado avvia le IN2025; la seconda/terza conclude gradualmente il percorso precedente nell'ambito del regime transitorio. I contenuti annualizzati contenuti nel master sono **elaborazioni d'Istituto**, non trascrizioni di OSA annuali ministeriali.

## 2. Riconciliazione fra versioni: storico ≠ corrente

| Fonte | Prima | Seconda | Terza | Lettura ammessa |
| --- | --- | --- | --- | --- |
| «Programmazione annuale Tecnologia v1.0» del 12 giugno 2026, **bozza precedente** | 4 UDA, 60h | 4 UDA, 60h | 4 UDA, 66h | Input storico, non baseline corrente da correggere automaticamente |
| **CAN-PRG-1/2/3**, 20 agosto 2026 | 8 UDA, 66h | 8 UDA, 66h | 9 UDA, 66h | Riferimento operativo professionale più recente, **non equivale** a curricolo d'istituto approvato |
| **CAN-PLAN** nel modello Docente OS (main + develop osservati) | 8 UDA distinte, 11 segmenti, 33 blocchi, 66h | 8 UDA, 9 segmenti, 33 blocchi, 66h | 9 UDA, 10 segmenti, 33 blocchi, 66h | Corrispondenza strutturale delle ore e identità UDA; non prova curricolare/pedagogica |

**Diagnosi:** il precedente delta di 6 ore nelle prime e seconde deriva dal confronto fra generazioni documentali differenti. La baseline più recente è strutturalmente coerente con Docente OS sul monte ore **indicativo**. **Non** occorre aggiungere automaticamente ore o modificare database. Il monte ore effettivo va calibrato su calendario reale e cattedra.

Codice osservato: `antoniocorsano-boop/docente-os-2026-27/product/src/app/piano-annuale/model.ts`, blocchi B01–B33, modello per la verticale Tecnologia. Il fatto che i 66h coincidano **non** prova che gli obiettivi del curricolo vigente siano coperti.

## 3. TY-1 — Prima secondaria, IN2025: riconciliazione preliminare

**Fonte normativa:** IN2025.  
**Fonte curricolare di lavoro (NON VIGENTE):** CAN-CURR-MASTER-00@1.3, sezione Tecnologia I, con BOZZA-CURR-TEC-01 v1.2 e revisione R2.  
**Gruppi di obiettivi annualizzati nella proposta:**
- **N1** «Vedere, osservare e sperimentare»: bisogni/oggetti, misure, prove sui materiali, strumenti di disegno, informazioni.
- **N2** «Prevedere, immaginare e progettare»: problema, requisiti/vincoli, alternative, progettazione e criteri di verifica.
- **N3** «Intervenire, trasformare e produrre»: procedure, prodotti/modelli, controllo, riuso, sicurezza, trasformazioni.
- **N4/asse integrato** Informatica e sistemi digitali: hardware/software, dati, procedura/algoritmo, rete/servizi, protezione dati. **È un asse annualizzato d'Istituto da validare**, non una quarta disciplina nazionale.
Queste sigle sintetizzano la proposta e **non** attestano una deliberazione.

| UDA CAN-PRG-1 | Ore | Connessione preliminare agli obiettivi della bozza | Evidenze pertinenti da verificare nella UDA operativa |
| --- | ---: | --- | --- |
| 1-00 — Entrare nel laboratorio della Tecnologia | 4 | N1, N3; prerequisiti, strumenti, sicurezza | osservazione iniziale, scheda strumenti, procedura di sicurezza |
| 1-01 — Tecnologia, bisogni, risorse e sistemi | 8 | N1, N2 | analisi di oggetto, mappa bisogno-funzione-risorsa, schema di sistema |
| 1-02 — Materiali: dalla risorsa al prodotto | 12 | N1, N3 e selezione motivata N2 | prova comparativa e tabella materiali, scelta e ciclo di vita |
| 1-03 — Disegnare per comprendere e comunicare | 14 | N1, rappresentazione a supporto N2 | tavole e controlli di precisione/procedura |
| 1-04 — Rifiuti, recupero ed economia circolare | 6 | N3, osservazione N1; raccordi di cittadinanza | schema del ciclo di vita e scelta di riduzione/riuso |
| 1-05 — Dal problema al progetto | 10 | N2, N3 | requisiti, alternative, piano, modello/prodotto verificato |
| 1-06 — Informazioni, dati e sistemi digitali | 6 | asse integrato N4, rappresentazione informazioni | tabella/grafico, procedura/algoritmo, scelta digitale responsabile |
| 1-07 — Progetto tecnologico sostenibile | 6 | N2 + N3, possibile uso pertinente N1/N4 | progetto, controllo, documentazione e decisione motivata |
| **Totale** | **66** | **Tutte le aree hanno almeno una UDA candidata** | **Copertura solo preliminare, non competenze raggiunte** |

**Giudizio TY-1:** `DOCUMENTARY_PARTIAL`. Sono presenti riferimenti annuali e UDA operative compatibili, ma manca una matrice granularmente certificata **obiettivo della fonte vigente ↔ criteri ↔ fasi UDA ↔ evidenze**, nonché il profilo professionale della classe e il calendario effettivo. L'identità «N1–N4» è della bozza annualizzata; non promuoverla come norma nazionale.

## 4. TY-2 — Seconda secondaria, IN2012 transitorio: riconciliazione preliminare

**Fonte nazionale:** Indicazioni 2012 per coorte in esaurimento.  
**Fonte di lavoro (NON VIGENTE):** CAN-CURR-MASTER-00@1.3, sezione Tecnologia II; BOZZA-CURR-TEC-01 v1.2 (annualizzazione transitoria).  
**Cluster della proposta:** rilievo/misure/scale e proiezioni; materiali/filiere e trasformazioni; leggere abitare/territorio/sistemi; problemi e soluzioni progettuali; dati e documentazione. Le etichette di seguito sono **gruppi interpretativi per questa verifica**, non codici ministeriali.

| UDA CAN-PRG-2 | Ore | Connessione preliminare alla proposta d'Istituto | Evidenze pertinenti da verificare |
| --- | ---: | --- | --- |
| 2-01 — Agricoltura, suolo e produzioni sostenibili | 8 | filiere, trasformazioni e impatti | schema di filiera, confronto argomentato |
| 2-02 — Alimenti, trasformazione e conservazione | 8 | filiere, processi, dati e consumo | mappa processo, analisi di conservazione/risorse |
| 2-03 — Territorio, città e pianificazione | 8 | abitare/territorio, infrastrutture e servizi | lettura di spazio/servizio, schemi |
| 2-04 — Edificio, strutture e materiali da costruzione | 10 | strutture, materiali, sicurezza | analisi di edificio e scelta giustificata |
| 2-05 — Abitazione, impianti, sicurezza ed efficienza | 8 | sistemi dell'abitare, sicurezza/efficienza | scheda di analisi e miglioramento |
| 2-06 — Rilievo, scale e proiezioni ortogonali | 14 | rilievo, misura, rappresentazione | rilievo e tavola coerente con scala/proiezioni |
| 2-07 — Progettare uno spazio o un semplice oggetto | 6 | problema, vincoli, alternative, proposta | progetto e motivazione della scelta |
| 2-08 — Dati, rappresentazione digitale e modellazione introduttiva | 4 | organizzazione di dati e documentazione | tabella/grafico o modello, fonte dei dati |
| **Totale** | **66** | **Aree della proposta rappresentate** | **Copertura e criteri ancora da verificare** |

**Giudizio TY-2:** `DOCUMENTARY_PARTIAL`. Le UDA rappresentano il percorso operativo proposto, ma non si deve attribuire automaticamente ai benchmark IN2012 l'intera annualizzazione locale. I raccordi digitali e tecnologici aggiuntivi sono proposte del curricolo d'Istituto quando non direttamente tracciati alle IN2012.

## 5. Mappa del ciclo docente: esiste già

Fonte di lavoro: `CAN-TEACHER-CYCLE-MAP-DOS-01`, 18 settembre 2026, preesistente al presente studio. Percorso documentato: **CURRICOLO → PROGRAMMAZIONE ANNUALE → UDA → PREPARAZIONE → LEZIONE → ATTIVITÀ STUDENTE → EVIDENZE → REGISTRAZIONE → RIFLESSIONE → RIPROGETTAZIONE → NUOVA PREPARAZIONE**.

Il documento individua già due limiti particolarmente pertinenti:
1. **P01 curricolo → programmazione:** identificatori stabili e provenienza non ancora uniformi;
2. **P02 programmazione → UDA:** binding curricolo↔Piano non completamente esplicito, pur esistendo un Piano e collegamenti con UDA.

**Regola:** non creare una seconda mappa canonica concorrente. TEACHER-YEAR-01 rafforza la validazione pedagogica di P01/P02 e alimenta le evidenze del ciclo già definito.

## 6. Distinzione dei risultati e condizioni per la prossima prova

| Asserzione | Stato | Ragione |
| --- | --- | --- |
| Regime normativa prima/seconda identificato | **VERIFIED** | D.M. 221/2025 e matrice di provenienza per annualità |
| Esistono progressioni e obiettivi annuali **proposti** per I e II | **VERIFIED** | Master v1.3 e proposta Tecnologia v1.2 |
| Le CAN-PRG-1/2/3 e CAN-PLAN hanno 66h e identità UDA coerenti | **VERIFIED_STRUCTURAL** | File di lavoro e modello Docente OS letto su main/develop |
| Programmazione corrente istituzionalmente approvata, per il contesto scolastico effettivo | **BLOCKED / NON DIMOSTRATA** | Proposte riferite al Don Lorenzo Milani, incluse le versioni disciplinari, da validare; atto di adozione, versione e decorrenza ancora non verificati |
| Ogni UDA copre in modo pedagogicamente valido un obiettivo vigente | **PARTIAL / DA VERIFICARE** | Connessioni proposte in questa prova, non gate curricolare completato |
| Piano adeguato al calendario/classi correnti | **NOT_RUN** | Manca calendario effettivo autorizzato e profilo della classe |
| Studenti hanno acquisito determinate competenze | **NON VALUTATO** | Impossibile dedurlo dalla pianificazione o dalla presenza di asset |
| Interscambio integrato Docente OS → Registro Docente | **DESIGNED** | Stato del grafo canonico TRAMA v0.3, non promosso |

**Prossimo intervento consentito e prioritario:**
- acquisire e confrontare **curricolo vigente formalmente adottato dell'istituto utilizzatore** con la proposta annuale e la matrice di versione;
- costruire o qualificare **riferimenti obiettivo↔UDA↔evidenze** riusando gli identificatori già esistenti e senza alterare le autorità;
- calibrare tempi e progressione sul calendario/assegnazioni/classi reali;
- solo a seguito di Human Review scegliere se è necessario un miglioramento di visibilità o un contratto specifico, **non un nuovo sistema**.

## 7. Non obiettivi della prova

- NON trascrivere integralmente documenti Drive privati dentro un repository di governo;
- NON importare, approvare o modificare un curricolo in Arena;
- NON creare/aggiornare programmazioni e UDA nei dati di produzione;
- NON sostituire il modello CAN-PLAN o cambiare le 33 attività per conseguire una falsa congruenza;
- NON assumere che la 2C o altre classi specifiche siano state autorizzate per questa prova;
- NON promuovere lo stato REAL di flussi interprodotto, livelli competenza o osservazioni studente;
- NON assorbire in questa PR il programma VALUE-01 (#298), ancora distinto;
- nessun cambio al limite DOS-A1: RUNTIME_DEFERRED.

## 8. Gate e decisione finale

**Esito complessivo:** `DOCUMENTARY_PARTIAL / READ_ONLY`. L'analisi di compatibilità è positiva **per la struttura della programmazione Tecnologia**, non per l'approvazione istituzionale né per il raggiungimento di apprendimenti.  
**Decisione professionale necessaria:** riconoscere il curricolo vigente del contesto scolastico di applicazione e confermare le priorità didattiche del piano.  
**Autorizzazione runtime:** nessuna.  
**Human Pedagogical Review:** pendente.  
**Stato del collaudo in classe:** `NOT_RUN`.

La prima prova ha dimostrato che il lavoro annuale è **già in parte costruito**; il collo di bottiglia prioritario è la **validità e tracciabilità del riferimento curricolare all'origine**, non la mancanza di UDA o il numero di ore.


---

## 9. Secondo collaudo: autorità istituzionale e obiettivi → UDA → evidenze (03/11/2026)

**Metodo:** sola lettura di fonti documentali e pagine pubbliche; nessun dato studente, nessuna prova in classe, nessuna modifica a piani o servizi. La sezione integra, ma non sostituisce, i gate delle sezioni precedenti.

### 9.1 Identità dell'istituto utilizzatore, fonti istituzionali e stato delle proposte

**Rettifica fattuale (3 novembre 2026):** l'istituto di applicazione è l'**Istituto Comprensivo Calvario-Covotta «don Lorenzo Milani» di Ariano Irpino (AV)**, codice meccanografico **AVIC849003**, sede istituzionale in via Marconi 25. Sito ufficiale https://www.icdonmilaniariano.edu.it/ ; la scuola secondaria di primo grado **plesso Covotta** è identificata dal codice **AVMM849047**: https://www.icdonmilaniariano.edu.it/struttura/secondaria-di-primo-grado-ariano-plesso-covotta/ . **Il precedente riferimento al P.S. Mancini e al codice AVIC86200D era errato e viene ritirato integralmente.**

Il sito ufficiale pubblica **PTOF 2025–2028** (scheda con allegato AVIC849003-202528-202425-20241227, pubblicazione 14/05/2025): https://www.icdonmilaniariano.edu.it/documento/ptof-25-28/ . Questo è un riferimento dell'istituto corretto; non attesta però, senza verifica dell'allegato e dei successivi atti, che una determinata proposta curricolare di Tecnologia del 2026 sia stata recepita e deliberata per l'a.s. 2026/27.

**Documenti di lavoro nel Drive che appartengono al contesto «don Lorenzo Milani»:**
- `Curricolo_verticale_Tecnologia_IC_Don_Milani_Ariano_v2-1.docx`: intestato I.C. Calvario-Covotta «don Lorenzo Milani»; **bozza istituzionale verificata, 08/06/2026**; dichiarata destinata a Dipartimento, commissione curricolo e successivo iter deliberativo; non fonte vigente per il solo titolo.
- `curricolo_verticale_tecnologia_istituzionale_IC_Don_Milani_v0_2.docx`: menziona espressamente **AVIC849003**; dichiara che la validità formale richiede delibere degli organi collegiali; **bozza per validazione interna**.
- `Curricolo_verticale_Dipartimento_Scientifico_Matematico_Tecnologico_2026_2027_v3_1_READY_DIPARTIMENTO.docx`: curricolo verticale area SMT, con Informatica e STEM; stato dichiarato **proposta per esame e validazione dipartimentale/collegiale**. «QA completata» non è sinonimo di approvazione.
- `CAN-CURR-MASTER-00@1.3`: intestato I.C. «Lorenzo Milani», ma **NON VIGENTE** per registro maestro; la coincidenza nominale con l'istituto corretto non dimostra da sola corrispondenza di documento/atto/approvazione. Esaminare il rapporto di provenienza con le proposte specificamente intestate AVIC849003.

**Riconciliazione di autorità:**
1. **Normativa nazionale:** D.M. 221/2025 (prima IN2025 nel 2026/27, seconde e terze nel regime transitorio IN2012); https://www.normattiva.it/atto/caricaDettaglioAtto?atto.codiceRedazionale=26G00021&atto.dataPubblicazioneGazzetta=2026-01-27 .
2. **Fonte scolastica pubblica:** sito ufficiale Don Lorenzo Milani + PTOF 2025–2028; identità istituzionale verificata, ma collegamento di una specifica versione di curricolo disciplinare ancora da verificare negli atti.
3. **Proposte disciplinari del medesimo contesto:** v2-1, v0.2, SMT v3.1 e master v1.3; sono **materiale pertinente e non presumibilmente esterno**, ma il loro livello di approvazione è distinto.
4. **Programmazioni personali:** CAN-PRG e CAN-PLAN (33 × 2h = 66h annue indicative) da correlare alla versione curricolare approvata e al calendario effettivo.

**Correzione del blocker P01:** non è più «provenienza da istituto diverso»; è **reperimento e verifica dell'atto/versione che renda vigente il curricolo del Don Lorenzo Milani e tracciabilità dei collegamenti con gli obiettivi delle UDA**. Non promuovere documenti in bozza sulla sola base del nome dell'istituto, della revisione tecnica o dell'esistenza nel fascicolo Drive.

### 9.2 Due riscontri su UDA autentiche, non su descrizioni ipotetiche

| Caso | Collegamento alla proposta (NON VIGENTE) | Attività/prestazione previste nell'UDA reale | Evidenza e criterio espliciti | Giudizio |
| --- | --- | --- | --- | --- |
| **Prima, CAN-UDA-1-06, 6 ore** | Master §7.3.8: organizzazione dei dati; §15.4: progressione d'Istituto Informatica | Raccogliere e classificare dati, costruire tabella e grafico, interpretare risultati; rappresentare input–elaborazione–output–memoria | Tabella, grafico, interpretazione, schema funzionale; osservazione, prova individuale, rubrica | **TRACCIABILE NELLA PROPOSTA**; corrispondenza a curricolo approvato non dimostrata |
| **Seconda, CAN-UDA-2-01, 8 ore** | Master §7.3.8: leggere filiere e processi, distinguere risorse e conseguenze, formulare proposte | Analisi dell'agricoltura come sistema, mappa di filiera, confronto pratiche, scheda visuale con proposta di miglioramento | Sequenza corretta di filiera, lessico tecnico, relazioni riconosciute e motivazione; elaborato, osservazione, breve prova, restituzione orale | **TRACCIABILE NELLA PROPOSTA**; corrispondenza a curricolo approvato non dimostrata |

Le evidenze elencate sono **prodotti e verifiche progettati**, NON risultati raccolti o livelli di competenza conseguiti. Il collegamento sopra è una ricostruzione istruttoria, non una corrispondenza già deliberata.

**Rilievo di provenienza verificabile:** CAN-UDA-1-06 reca l'intestazione «Nuclei IN25 prevalenti: N4 Informatica e sistemi digitali integrati». Ma la fonte di lavoro stessa e l'audit R2 qualificano **N4 come asse integrato annualizzato d'Istituto**, distinto dai tre nuclei nazionali della Tecnologia: la dicitura va disambiguata prima di una certificazione. CAN-UDA-2-01 reca invece il riferimento generico «IN25/NOR/CUR/DID/CLS da validare»: non prova affatto che la seconda sia assoggettata alle IN2025; resta applicabile il regime IN2012 transitorio. Non editare automaticamente i documenti.

**Non interpretare la singola UDA come l'intera copertura annuale:** algoritmi, reti, sicurezza e protezione dei dati nel ponte §15.4 devono essere verificati su tutte le UDA della prima; la sola CAN-UDA-1-06 non dimostra né esclude la loro copertura complessiva.

### 9.3 Un divario prioritario: P01 — provenienza del legame curricolo → UDA

Il passo prioritario **non è una nuova UDA** e neppure una modifica applicativa non ancora dimostrata. È leggere **l'obiettivo curricolare effettivamente serializzato in Arena**, e qualificarne la **fonte governata** con istituto, documento, versione, data, regime della coorte, rango (norma / curricolo adottato / proposta / programmazione del docente), posizione e riferimento alla delibera **solo se effettivamente verificati**. Collega poi tale obiettivo a UDA, attività, evidenza **prevista**, criterio e stato della validazione.

Regola di accettazione: **senza una versione del curricolo formalmente adottata e attribuibile all'I.C. Calvario-Covotta «don Lorenzo Milani» (AVIC849003), con atto e decorrenza verificati, lo stato resta PROPOSTA_DA_VALIDARE**. Le etichette di proposta non diventano codici ministeriali; l'esistenza di una verifica non diventa un risultato di apprendimento.

**Gate di chiusura:** acquisire la release/istanza Arena corrente del Don Lorenzo Milani e verificarne identità, versione, manifest e stato di autorità; qualificare su segmenti/obiettivi Arena una matrice obiettivo → UDA → prestazione → evidenza → criterio con decisione professionale; verificare poi il comportamento di Docente OS rispetto alla stessa release. Solo per affermare approvazione e vigenza occorre inoltre verificare e collegare l'atto istituzionale competente. Solo un difetto osservato sul prodotto può autorizzare una modifica funzionale separata. Calendario effettivo e prova di classe sono verifiche distinte.

**Esito invariato:** DOCUMENTARY_PARTIAL / INSTITUTIONAL_QUALIFICATION_BLOCKED / HUMAN_PEDAGOGICAL_REVIEW_PENDING / CLASSROOM_NOT_RUN. Nessun merge, deploy o promozione; nessuna scrittura in Arena, Docente OS o dati professionali.

---

## 10. Terzo collaudo — verifica Arena e 25 UDA (3 novembre 2026)

**Fonte primaria realmente letta:** esportazione versionata di Arena per Atlas, documento current.json su Arena main@d8b1bf43388cb5c4cdcc940b0c558bb128976c4c. Master **CAN-CURR-MASTER-00 v1.3**; impronta di sorgente dichiarata **fnv1a:b355be71**; autorità **PROVISIONAL_COMPLETE**, senza ricevuta di approvazione. Per Tecnologia della secondaria sono presenti tre fasce, con regime 2025 in I, 2012 transitorio in II e 2012 transitorio conclusivo in III. **Non confondere questo documento con il distinto pacchetto verticale di trasferimento ad uso Docente OS**, di cui non è stata acquisita un'istanza produttiva.

**Fonti secondarie realmente lette:** Piano annuale di Docente OS (develop@93542e06975c09f5fdafd375d72dde927fa2669d, main@c1301f1f2910cba1ac9fc315cf5461af0fbad1db); CAN-PRG-1/2/3 e tutti i **25 documenti CAN-UDA**, classi I–III, nel fascicolo professionale. Nessun dato studente, nessuna prova di attuazione.

### 10.1 Identità, ore e ambiti

| Annualità | UDA Piano e documenti | Segmenti Piano | Blocchi | Ore Piano | Ore UDA | Regime Arena |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| Prima | 8/8 | 11 | 33 | 66 | 66 | 2025 |
| Seconda | 8/8 | 9 | 33 | 66 | 66 | 2012 transitorio |
| Terza | 9/9 | 10 | 33 | 66 | 66 | 2012 transitorio conclusivo |

La coincidenza delle 25 durate previste con il Piano è **verificata**, non dedotta dalla sola somma delle ore. Le 66 ore sono indicative e non attestano ore effettivamente svolte.

### 10.2 Matrice proposta: obiettivi testuali di Arena → UDA → prestazione attesa

Gli obiettivi nella colonna centrale sono **formulazioni effettivamente presenti nell'esportazione Arena, sezione 7.3.8**. L'associazione alla UDA è un **giudizio istruttorio da sottoporre a validazione**, non un collegamento già registrato in Arena o Docente OS. I prodotti nella terza colonna sono **previsti**, non osservati.

**Prima (8 UDA, 66 ore)**

| UDA | Obiettivo Arena candidato | Prestazione/evidenza prevista |
| --- | --- | --- |
| 1-00 (4h) | analizzare oggetti/materiali; seguire procedure | Scheda di osservazione iniziale; riconoscimento strumenti e regole |
| 1-01 (8h) | analizzare oggetti/materiali; organizzare dati | Schema bisogni–risorse–processo; scheda di un sistema |
| 1-02 (12h) | osservare/misurare; analizzare oggetti/materiali | Prove sui materiali, tabella comparativa e scelta motivata |
| 1-03 (14h) | produrre rappresentazioni; seguire procedure | Tavole geometriche e controllo degli errori |
| 1-04 (6h) | riconoscere sicurezza e impatti | Scheda sul percorso dallo scarto alla nuova risorsa |
| 1-05 (10h) | realizzare/verificare; produrre rappresentazioni | Dossier di progetto con requisiti, modello e verifica |
| 1-06 (6h) | organizzare dati; seguire procedure | Tabella, grafico, interpretazione e schema di sistema digitale |
| 1-07 (6h) | realizzare/verificare; riconoscere sicurezza e impatti | Dossier progettuale sostenibile, scelta e verifica |

**Seconda (8 UDA, 66 ore)**

| UDA | Obiettivo Arena candidato | Prestazione/evidenza prevista |
| --- | --- | --- |
| 2-01 (8h) | leggere processi produttivi | Scheda di filiera agricola, criticità e miglioramento |
| 2-02 (8h) | leggere processi produttivi; organizzare informazioni | Infografica sulla filiera alimentare |
| 2-03 (8h) | interpretare elementi di territorio/abitare | Mappa ragionata del territorio e delle funzioni |
| 2-04 (10h) | analizzare proprietà/cicli dei materiali; interpretare elementi di territorio/abitare | Scheda tecnica di edificio e materiali |
| 2-05 (8h) | interpretare elementi di territorio/abitare | Guida per abitazione sicura ed efficiente |
| 2-06 (14h) | produrre rappresentazioni più rigorose | Tavola di rilievo, scala, viste e quote |
| 2-07 (6h) | progettare semplici soluzioni | Progetto di spazio/oggetto con requisiti e modello |
| 2-08 (4h) | organizzare informazioni | Rappresentazione digitale di dati, grafico e interpretazione |

**Terza (9 UDA, 66 ore)**

| UDA | Obiettivo Arena candidato | Prestazione/evidenza prevista |
| --- | --- | --- |
| 3-01 (8h) | analizzare sistemi energetici/produttivi; usare dati | Diagramma commentato di un sistema energetico |
| 3-02 (8h) | confrontare impatti; usare dati | Matrice comparativa di fonti energetiche |
| 3-03 (8h) | analizzare sistemi energetici/produttivi; documentare | Schema tecnico della filiera elettrica |
| 3-04 (8h) | verificare; analizzare sistemi energetici/produttivi | Pannello/simulazione documentata di circuito |
| 3-05 (8h) | analizzare sistemi energetici/produttivi | Modello o scheda funzionale di macchina |
| 3-06 (12h) | rappresentare soluzioni | Tavola tridimensionale con assonometria e sezione |
| 3-07 (6h) | progettare; usare dati | Diagramma/prototipo di sistema automatico |
| 3-08 (4h) | confrontare impatti | Valutazione multicriterio con decisione motivata |
| 3-09 (4h) | progettare; verificare; documentare; motivare scelte e interessi professionali | Dossier conclusivo, autovalutazione e orientamento |

### 10.3 Risultati, limiti e unica priorità

- Le **21 formulazioni di obiettivo** di Tecnologia presenti nelle tre fasce di Arena (7 in I, 6 in II, 8 in III) hanno **almeno una UDA candidata** nella matrice. È **copertura interpretativa proposta**, non copertura pedagogica approvata.
- Le **25/25 UDA** prevedono un prodotto/evidenza osservabile; non sono stati acquisiti risultati di apprendimento né livelli attribuiti agli studenti.
- **0/25 associazioni** risultano qui confermate come collegamenti persistenti e approvati con identificatore puntuale di obiettivo Arena; il documento di esportazione dispone di identificativi delle fasce, ma gli obiettivi sono riportati testualmente. Non inventare codici nazionali.
- Il vecchio riferimento a **N4** come nucleo nazionale va mantenuto distinto dall'asse integrato d'Istituto di Informatica; le classi II e III restano nel regime 2012, anche quando una UDA utilizza il marcatore generico IN25/NOR/CUR/DID/CLS.
- **Rischio di identità non ancora verificato sull'istanza:** l'esportazione Arena→Atlas riporta un nome d'istituto, ma non un institutionId/codice meccanografico; gli script/fixture tecnici utilizzano alias interni differenti. La coincidenza effettiva fra Arena e il selettore Docente OS deve essere provata con lo stesso pacchetto verticale, versione e impronta.

**Verdetto:** STRUCTURAL_MATCH_25_OF_25 / OBJECTIVE_MAPPING_PROPOSED_21_OF_21 / PEDAGOGICAL_REVIEW_OPEN / VERTICAL_RELEASE_RUNTIME_NOT_RUN. Arena è l'unica autorità del curricolo; la vigenza è **NON VIGENTE** fino al necessario atto istituzionale. La differenza fra «manifest completo» e «obiettivi coperti dalla programmazione» resta obbligatoria.

**Prossimo gate:** acquisire la release verticale effettivamente emessa da Arena per l'I.C. Don Lorenzo Milani 2026/27; verificare istituto, anno, fascia, segmento, obiettivo, impronta e stato d'autorità nel selettore di Docente OS; quindi confermare professionalmente la matrice e introdurre soltanto l'eventuale collegamento mancante. **Nessuna nuova UDA, nessuna riscrittura del curricolo, nessun merge/deploy o modifica di dati reali.**


---

## 11. Quarto collaudo — compatibilità impronta della release verticale completa Arena → Docente OS (03/11/2026)

**Codice effettivamente ispezionato:** Arena main@d8b1bf43388cb5c4cdcc940b0c558bb128976c4c; Docente OS develop@93542e06975c09f5fdafd375d72dde927fa2669d.

**Tre formati da non confondere:**
1. Esportazione Arena → Atlas già reperita: versione master 1.3, impronta `fnv1a:b355be71`, autorità `PROVISIONAL_COMPLETE`. Il contratto è diverso da quello accettato da Docente OS; non rappresenta una prova di consegna.
2. Arena `curricoloVerticaleReleaseV1.ts`: mittente per il contratto verticale base `TRAMA_CURRICOLO_VERTICALE_RELEASE_V1`, con nodi, segmenti, manifest e impronta.
3. Arena `curricoloVerticaleCompleteReleaseV1.ts`: mittente per il **pacchetto completo** con `sourceMaster` e `sourceSnapshot`, che nel calcolo dell'impronta esterna esclude il metadato annidato `sourceSnapshot.contentFootprint.computedAt` pur lasciandolo nel messaggio serializzato.

**Difetto circoscritto nel consumer:** Docente OS `cml-discipline-binding.ts`, funzione `assertArenaStructuralFootprintMatches`, ricostruisce l'impronta escludendo solo `structuralFootprint` e `issuedAt`, ma **non** il metadato annidato. La verifica differenziale in JavaScript, con la stessa serializzazione canonica/FNV-1a e dati sintetici rappresentativi, produce **hash mittente `2c15d25b` ≠ hash destinatario `4e4c7993`**. Il risultato è limitato al pacchetto *completo* e non prova un fallimento del pacchetto base.

**Ciclo RED → GREEN concluso per il difetto circoscritto:** [PR Docente OS #778](https://github.com/antoniocorsano-boop/docente-os-2026-27/pull/778), **Draft**, base `develop@93542e06975c09f5fdafd375d72dde927fa2669d`. **RED causale:** Product CI #41713778011, exact head **test-only** `8baa60e9fb89be20148f2c71a1399e454597cabf`, **1.074 PASS / 1 FAIL**, con errore `Arena structural footprint rejected: footprint does not match release material` esclusivamente nel nuovo test. **GREEN exact-head:** commit `880386cc4102c5b49445ac114596e619943fe376`, Product CI **#41714368565 PASS**, **1.075 PASS / 0 FAIL**, typecheck, lint e build **PASS**; altri gate di impatto/terminologia attivati **PASS**. Il replay delle migrazioni Supabase è **SKIPPED** dal selettore, non certificato in questa prova. Il delta del prodotto è limitato al consumer per il pacchetto completo e alla regressione sull'impronta del contenuto; il percorso base resta invariato. Nessuna review indipendente o Human Review attestata sulla PR #778, che resta non integrata.

**Identità d'istituto da verificare:** lo script di materializzazione del master in Arena imposta `ics-lorenzo-milani`; le fixture del selettore Docente OS riportano `ic-calvario-covotta-don-milani`. Il confronto del consumer è esatto. Le due stringhe differenti sono un rischio d'interoperabilità **non ancora dimostrato su un'istanza realmente trasferita**; non effettuare migrazioni o normalizzazioni automatiche. Il riferimento istituzionale confermato è I.C. Calvario-Covotta «don Lorenzo Milani», Ariano Irpino (AVIC849003).

**Stato separato:** proiezione Arena per Atlas `AVAILABLE`; contratti mittente/destinatario `IMPLEMENTED`; compatibilità di codice sulla release completa `RED_CONFIRMED / GREEN_EXACT_HEAD_PRODUCT_CI_PASS`; consegna effettiva su workspace scolastico `NOT_VERIFIED`; master `PROVISIONAL_COMPLETE / NON_VIGENTE`. Le prove automatizzate precedenti usano fixture; non è stato acquisito un pacchetto verticale completo serializzato effettivamente emesso per l'istituto.

**Perimetro:** nessun merge, deploy, promozione, credenziale, dato di classe o modifica al prodotto in questa PR.


---

## 12. Quinto collaudo — provenienza effettiva del master e coerenza autorità (03/11/2026)

### 12.1 Master effettivamente recuperato, ma non confuso con una release trasferita

Letto tramite Google Drive il documento nativo **CAN-CURR-MASTER-00 — Curricolo verticale integrale unificato 3–14, 2026/27**, identificativo `12eWTPUZBJxZixd6-p8drNAaW5_eL8qWpXZUSDyZZAv4` (documento: https://docs.google.com/document/d/12eWTPUZBJxZixd6-p8drNAaW5_eL8qWpXZUSDyZZAv4/edit). Drive ha confermato:
- **revisione corrente 27**, precedente 26, ultima modifica 06/09/2026 ore 18:47 UTC;
- intestazione sorgente `CAN-CURR-MASTER-00`, **versione 1.3**, anno `2026/2027` e istituto `Istituto Comprensivo Statale “Lorenzo Milani”`;
- stato testuale **MATERIALIZZATA — DA VALIDARE PROFESSIONALMENTE — NON VIGENTE**, distinto da `APPROVED`.

Il percorso di generazione effettivamente presente in Arena, `scripts/materialize-canonical-curricolo-v1.mjs`, usa questo ID Drive, la versione 1.3, l'anno 2026/27 e il parametro `--revision-id`, ma produce un `ARENA_CANONICAL_CURRICOLO_ARTIFACT_V1`: **non** un `TRAMA_CURRICOLO_VERTICALE_RELEASE_V1` pronto per il consumer di Docente OS. Il generatore implementa uno schema canonico a 113 scope con `institutionId=ics-lorenzo-milani`; lo schema della release completa e il suo generatore sono moduli separati. L'albero GitHub di Arena main non ha mostrato una release verticale completa già serializzata e consegnabile. Il materiale Drive è **fonte effettiva**, non una *prova di esecuzione del trasferimento*.

**Conseguenza per la fase B:** per dichiarare `REAL_SOURCE_TRANSFER_VERIFIED` serve una release verticale serializzata generata dal master autentico/revisione 27, verificata con il contratto Arena e consumata nelle tre classi Docente OS, senza caricare automaticamente il testo del master in repository pubblici né dedurre `institutionId` dalle fixture. L'eventuale normalizzazione dell'identità richiede una decisione esplicita basata sul target effettivo del workspace, non una sostituzione alla cieca.

### 12.2 Revisione del ricevitore: secondo RED causale e GREEN

La revisione del delta [Docente OS PR #778](https://github.com/antoniocorsano-boop/docente-os-2026-27/pull/778) ha individuato un caso indipendente dal disallineamento di impronta: il primo fix verificava la consistenza dell'hash, ma non tutti gli invarianti di `sourceMaster`. Una release dichiarata `PROVISIONAL_COMPLETE` poteva contenere un `sourceMaster` che sosteneva `curricoloVigente=true` e `INSTITUTE_APPROVED_CURRICOLO` senza essere rifiutata. Il validatore completo in Arena impone, invece, coerenza con la fonte non vigente.

- **Secondo RED verificato:** commit test-only `705b2a59251416c060095017db5b2f4a5b0d4073`, Product CI **#41716363906 FAIL**, 1.075 test PASS / 1 test FAIL (`Missing expected exception` sul caso `rejects complete Arena source provenance contradicting provisional authority`).
- **Fix circoscritto:** controllo dei riferimenti non vuoti e dello stato dichiarato del `sourceMaster`, mantenendo `curricoloVigente=false` e `INSTITUTE_CANONICAL_WORKING_BASELINE` per intake provvisorio.
- **Secondo GREEN exact-head:** `22d2b7a6d868fbf0eec52639ad301d5101461055`, Product CI **#41716663850 PASS**, **1.076 test PASS / 0 FAIL**; typecheck, lint, build PASS; gate impatto/terminologia PASS. Migrazioni Supabase **SKIPPED**, non usate come prova.
- PR #778 sempre `Draft`, 2 soli file modificati, non integrata. Nessuna review indipendente/human receipt acquisita. Il controllo FNV-1a è un'impronta strutturale, non una firma crittografica né autenticazione del mittente.

**Stato dopo il quinto collaudo:** `SOURCE_MASTER_V1_3_REV27_READ_VERIFIED / CONSUMER_CODE_RED_GREEN_PASS / REAL_VERTICAL_RELEASE_NOT_FOUND / WORKSPACE_IDENTITY_NOT_VERIFIED / PEDAGOGICAL_REVIEW_OPEN / NON_VIGENTE`. Nessun merge, deploy, promozione o scrittura di dati.
