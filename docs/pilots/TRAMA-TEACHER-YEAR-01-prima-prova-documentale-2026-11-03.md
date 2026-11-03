# TEACHER-YEAR-01 — Prima prova documentale curricolo → programmazione → UDA (Tecnologia 2026/2027)

**Data di osservazione:** 3 novembre 2026  
**Stato della prova:** DOCUMENTARY_PARTIAL / HUMAN_PEDAGOGICAL_REVIEW_REQUIRED / INSTITUTIONAL_QUALIFICATION_BLOCKED  
**Tipo:** verifica read-only su fonti storiche e correnti, senza registrazioni di classe, studenti o mutazioni dei sistemi.  
**Baseline TRAMA:** main@da90866310fa1404e23cee197bd2d4e34879c7ae  
**Baseline prodotto Docente OS osservata:** develop@93542e06975c09f5fdafd375d72dde927fa2669d; main@c1301f1f2910cba1ac9fc315cf5461af0fbad1db (lettura del medesimo modello Piano annuale, blob diversi).  
**Riferimento:** [TEACHER-YEAR-01](../strategy/TRAMA-TEACHER-YEAR-01-ciclo-professionale-e-programmazione-annuale-2026-11-03.md); [protocollo](./TRAMA-TEACHER-YEAR-01-protocollo-programmazione-annuale-2026-11-03.md).

## 1. Risultato verificabile e limite di autorità

La risposta principale non è «occorre costruire una programmazione da zero». Le programmazioni **CAN-PRG-1**, **CAN-PRG-2** e **CAN-PRG-3** esistono già nella raccolta professionale, con 66 ore per annualità; esiste anche la **CAN-TEACHER-CYCLE-MAP-DOS-01**, mappa canonica di lavoro del ciclo docente dal curricolo alla riprogettazione (18 settembre 2026). In Docente OS esistono il Piano annuale a 33 blocchi × 2 ore, le UDA e il passaggio contestuale Classe → Progetta. Si deve **riutilizzare**, non ricostruire in parallelo.

**Vincolo documentale decisivo:** il registro maestro curricolare **REG-CURR-00 v1.13** identifica **CAN-CURR-MASTER-00 v1.3, 6 settembre 2026** come «baseline curricolare canonica integrale materializzata», ma **DA VALIDARE PROFESSIONALMENTE / NON VIGENTE**. Lo stesso registro precisa: READY_FOR_COLLEGIO NOT_YET; approvazione collegiale NOT_YET; promozione a curricolo vigente NOT_AUTHORIZED. Gli esiti del pilota multipersona Tecnologia prima non equivalgono a delibera del Collegio.

**Provenienza:** il fascicolo curricolare e il precedente pacchetto «Tecnologia v1.0» sono intestati all'istituto indicato nei documenti d'origine. Il loro utilizzo come curricolo **di un'altra istituzione** non è autorizzato dalla sola disponibilità nel Drive del docente. Nessun curricolo formalmente approvato della scuola effettivamente oggetto della prova è stato acquisito e verificato in questo esame. La successiva validazione istituzionale richiede la fonte autentica e il relativo stato.

**Regime nazionale:** D.M. 9 dicembre 2025 n. 221 art. 1, pubblicato nella G.U. 27 gennaio 2026, https://www.normattiva.it/atto/caricaDettaglioAtto?atto.codiceRedazionale=26G00021&atto.dataPubblicazioneGazzetta=2026-01-27 . Per il 2026/27 la prima della secondaria I grado avvia le IN2025; la seconda/terza conclude gradualmente il percorso precedente nell'ambito del regime transitorio. I contenuti annualizzati contenuti nel master sono **elaborazioni d'Istituto**, non trascrizioni di OSA annuali ministeriali.

## 2. Riconciliazione fra versioni: storico ≠ corrente

| Fonte | Prima | Seconda | Terza | Lettura ammessa |
| --- | --- | --- | --- | --- |
| «Programmazione annuale Tecnologia v1.0» del 12 giugno 2026, **bozza precedente** | 4 UDA, 60h | 4 UDA, 60h | 4 UDA, 66h | Input storico, non baseline corrente da correggere automaticamente |
| **CAN-PRG-1/2/3**, 20 agosto 2026 | 8 UDA, 66h | 8 UDA, 66h | 9 UDA, 66h | Riferimento operativo professionale più recente, **non equivale** a curricolo d'istituto approvato |
| **CAN-PLAN** nel modello Docente OS (main + develop osservati) | 8 UDA distinte, 11 segmenti, 33 blocchi, 66h | 8 UDA, 9 segmenti, 33 blocchi, 66h | 9 UDA, 10 segmenti, 33 blocchi, 66h | Corrispondenza strutturale delle ore e identità UDA; non prova curricolare/pedagogica |

**Diagnosi:** il precedente delta di 6 ore nelle prime e seconde deriva dal confronto fra generazioni documentali differenti. La baseline più recente è strutturalmente coerente con Docente OS sul monte ore **indicativo**. **Non** occorre aggiungere automaticamente ore o modificare database. Il monte ore effettivo va calibrato su calendario reale e cattedra.

Codice osservato: \`antoniocorsano-boop/docente-os-2026-27/product/src/app/piano-annuale/model.ts\`, blocchi B01–B33, modello per la verticale Tecnologia. Il fatto che i 66h coincidano **non** prova che gli obiettivi del curricolo vigente siano coperti.

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

**Giudizio TY-1:** \`DOCUMENTARY_PARTIAL\`. Sono presenti riferimenti annuali e UDA operative compatibili, ma manca una matrice granularmente certificata **obiettivo della fonte vigente ↔ criteri ↔ fasi UDA ↔ evidenze**, nonché il profilo professionale della classe e il calendario effettivo. L'identità «N1–N4» è della bozza annualizzata; non promuoverla come norma nazionale.

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

**Giudizio TY-2:** \`DOCUMENTARY_PARTIAL\`. Le UDA rappresentano il percorso operativo proposto, ma non si deve attribuire automaticamente ai benchmark IN2012 l'intera annualizzazione locale. I raccordi digitali e tecnologici aggiuntivi sono proposte del curricolo d'Istituto quando non direttamente tracciati alle IN2012.

## 5. Mappa del ciclo docente: esiste già

Fonte di lavoro: \`CAN-TEACHER-CYCLE-MAP-DOS-01\`, 18 settembre 2026, preesistente al presente studio. Percorso documentato: **CURRICOLO → PROGRAMMAZIONE ANNUALE → UDA → PREPARAZIONE → LEZIONE → ATTIVITÀ STUDENTE → EVIDENZE → REGISTRAZIONE → RIFLESSIONE → RIPROGETTAZIONE → NUOVA PREPARAZIONE**.

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
| Programmazione corrente istituzionalmente approvata, per il contesto scolastico effettivo | **BLOCKED / NON DIMOSTRATA** | Master di origine da validare/non vigente; manca fonte deliberata applicabile |
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

**Esito complessivo:** \`DOCUMENTARY_PARTIAL / READ_ONLY\`. L'analisi di compatibilità è positiva **per la struttura della programmazione Tecnologia**, non per l'approvazione istituzionale né per il raggiungimento di apprendimenti.  
**Decisione professionale necessaria:** riconoscere il curricolo vigente del contesto scolastico di applicazione e confermare le priorità didattiche del piano.  
**Autorizzazione runtime:** nessuna.  
**Human Pedagogical Review:** pendente.  
**Stato del collaudo in classe:** \`NOT_RUN\`.

La prima prova ha dimostrato che il lavoro annuale è **già in parte costruito**; il collo di bottiglia prioritario è la **validità e tracciabilità del riferimento curricolare all'origine**, non la mancanza di UDA o il numero di ore.


---

## 9. Secondo collaudo: autorità istituzionale e obiettivi → UDA → evidenze (03/11/2026)

**Metodo:** sola lettura di fonti documentali e pagine pubbliche; nessun dato studente, nessuna prova in classe, nessuna modifica a piani o servizi. La sezione integra, ma non sostituisce, i gate delle sezioni precedenti.

### 9.1 Identità dell'istituto utilizzatore e limiti della fonte

Istituto di applicazione: **I.C. Statale «Pasquale Stanislao Mancini» di Ariano Irpino**, codice meccanografico **AVIC86200D**. Sito ufficiale: https://www.istitutocomprensivocardito.edu.it/ . Le pagine istituzionali dell'offerta formativa documentano **2 ore settimanali di Tecnologia** sia per il tempo normale sia per quello prolungato:
- https://www.istitutocomprensivocardito.edu.it/indirizzo-di-studio/tempo-normale-30h-settimanali/
- https://www.istitutocomprensivocardito.edu.it/indirizzo-di-studio/tempo-prolungato-40h-settimanali/

È disponibile la scheda del **PTOF 2025–2028**, https://www.istitutocomprensivocardito.edu.it/documento/aggiornamento-ptof-2024-25/ , ma nel materiale effettivamente verificato non si è potuta stabilire la **versione analitica di curricolo Tecnologia 2026/27 formalmente adottata** per questo istituto, con atto, decorrenza e obiettivi annuali. Il PTOF pubblicato non è qui equiparato automaticamente a un curricolo analitico approvato.

Distinguere quattro livelli di provenienza:
1. **Norma:** D.M. 221/2025, articoli 1 e 5; IN2025 per le classi prime 2026/27, IN2012 transitorie per seconde e terze. https://www.normattiva.it/atto/caricaDettaglioAtto?atto.codiceRedazionale=26G00021&atto.dataPubblicazioneGazzetta=2026-01-27
2. **Fonte istituzionale del P.S. Mancini:** conferma identità e quadro orario generale, non ancora gli obiettivi analitici del curricolo approvato.
3. **Proposta curricolare di un altro istituto:** CAN-CURR-MASTER-00@1.3, master esplicitamente **NON VIGENTE**, sezioni 7.3.8, 15.4 e 16.2. Può orientare il confronto; non può essere trasferito come fonte adottata del P.S. Mancini.
4. **Progettazione professionale:** CAN-PRG e CAN-PLAN; 33 × 2h = 66h annue è un modello **indicativo**, non il calendario effettivo delle singole sezioni.

### 9.2 Due riscontri su UDA autentiche, non su descrizioni ipotetiche

| Caso | Collegamento alla proposta (NON VIGENTE) | Attività/prestazione previste nell'UDA reale | Evidenza e criterio espliciti | Giudizio |
| --- | --- | --- | --- | --- |
| **Prima, CAN-UDA-1-06, 6 ore** | Master §7.3.8: organizzazione dei dati; §15.4: progressione d'Istituto Informatica | Raccogliere e classificare dati, costruire tabella e grafico, interpretare risultati; rappresentare input–elaborazione–output–memoria | Tabella, grafico, interpretazione, schema funzionale; osservazione, prova individuale, rubrica | **TRACCIABILE NELLA PROPOSTA**; corrispondenza a curricolo approvato non dimostrata |
| **Seconda, CAN-UDA-2-01, 8 ore** | Master §7.3.8: leggere filiere e processi, distinguere risorse e conseguenze, formulare proposte | Analisi dell'agricoltura come sistema, mappa di filiera, confronto pratiche, scheda visuale con proposta di miglioramento | Sequenza corretta di filiera, lessico tecnico, relazioni riconosciute e motivazione; elaborato, osservazione, breve prova, restituzione orale | **TRACCIABILE NELLA PROPOSTA**; corrispondenza a curricolo approvato non dimostrata |

Le evidenze elencate sono **prodotti e verifiche progettati**, NON risultati raccolti o livelli di competenza conseguiti. Il collegamento sopra è una ricostruzione istruttoria, non una corrispondenza già deliberata.

**Rilievo di provenienza verificabile:** CAN-UDA-1-06 reca l'intestazione «Nuclei IN25 prevalenti: N4 Informatica e sistemi digitali integrati». Ma la fonte di lavoro stessa e l'audit R2 qualificano **N4 come asse integrato annualizzato d'Istituto**, distinto dai tre nuclei nazionali della Tecnologia: la dicitura va disambiguata prima di una certificazione. CAN-UDA-2-01 reca invece il riferimento generico «IN25/NOR/CUR/DID/CLS da validare»: non prova affatto che la seconda sia assoggettata alle IN2025; resta applicabile il regime IN2012 transitorio. Non editare automaticamente i documenti.

**Non interpretare la singola UDA come l'intera copertura annuale:** algoritmi, reti, sicurezza e protezione dei dati nel ponte §15.4 devono essere verificati su tutte le UDA della prima; la sola CAN-UDA-1-06 non dimostra né esclude la loro copertura complessiva.

### 9.3 Un divario prioritario: P01 — provenienza del legame curricolo → UDA

Il passo prioritario **non è una nuova UDA** e neppure una modifica applicativa non ancora dimostrata. È qualificare la **fonte curricolare** di ciascun obiettivo con istituto, documento, versione, data, regime della coorte, rango (norma / curricolo adottato / proposta / programmazione del docente), posizione e riferimento alla delibera **solo se effettivamente verificati**. Collega poi tale obiettivo a UDA, attività, evidenza **prevista**, criterio e stato della validazione.

Regola di accettazione: **senza un curricolo formalmente adottato e attribuibile all'I.C. P.S. Mancini, lo stato resta PROPOSTA_DA_VALIDARE**. Le etichette di proposta non diventano codici ministeriali; l'esistenza di una verifica non diventa un risultato di apprendimento.

**Gate di chiusura:** acquisire la fonte istituzionale autentica (comprensiva di versione/atto applicabile), qualificare una matrice obiettivo → UDA → prestazione → evidenza → criterio con decisione professionale, quindi verificare il comportamento di Docente OS rispetto alla provenienza. Solo un difetto osservato sul prodotto può autorizzare una modifica funzionale separata. Calendario effettivo e prova di classe sono verifiche distinte.

**Esito invariato:** DOCUMENTARY_PARTIAL / INSTITUTIONAL_QUALIFICATION_BLOCKED / HUMAN_PEDAGOGICAL_REVIEW_PENDING / CLASSROOM_NOT_RUN. Nessun merge, deploy o promozione; nessuna scrittura in Arena, Docente OS o dati professionali.
