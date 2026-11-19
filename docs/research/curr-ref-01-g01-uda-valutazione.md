# CURR-REF-01/G01 — Raccordo fra curricolo, UdA ed evidenze valutative
**Data:** 19 novembre 2026. **Stato:** READ_ONLY_DESIGN_REVIEW_NO_PRODUCT_INTEGRATION.
[Ricevuta con revisioni e fonti](curr-ref-01-g01-uda-valutazione.json). Questa verifica non altera Arena, Docente OS, Registro Docente o il master.

## 1. Confini pedagogici e di autorità
- **Arena:** detiene il master curricolare e i dati di provenienza, applicabilità e vigenza. La versione 1.3 è materializzata, non approvata e non vigente. Un contenuto didattico non può promuovere l'autorità di Arena.
- **Docente OS:** organizza il piano annuale, la UdA, le fasi operative e le **evidenze attese**. La pipeline Human Task e i casi B23–B27 conservano fonti e revisioni, con controllo umano prima della proiezione didattica. L'approvazione di una lezione è distinta dall'approvazione del curricolo d'istituto.
- **Registro Docente:** il contratto VAL-01 espone localmente obiettivi, criteri, prove, osservazioni, revisioni e conferma del docente. Una prova individuale è un fatto osservato nel contesto, non una competenza automaticamente desunta; la mancata osservazione non equivale a valutazione negativa.
- **TRAMA:** documenta il significato condiviso e i collegamenti verificabili senza diventare fonte di voti o di curricolo.

Il consumatore Arena di Registro Docente richiede PREVIEW_ONLY e accettazione esplicita. Accetta in anteprima un master provvisorio **non vigente**, ma il risolutore del contesto curricolare autorevole richiede contemporaneamente APPROVED e VIGENTE. Pertanto **il master Arena 1.3 non si deve presentare come cornice approvata in Registro**. Non trasformare il CML_LOCAL_HANDOFF_V2 destinato a Docente OS nel contratto ARENA_REGISTRO_PLANNING_CONTEXT_V1: destinatario, modello e finalità differiscono.

## 2. Caso concreto: Tecnologia I, UdA 1-05, blocco B25
Docente OS conserva già una proiezione operativa approvata per la lezione «Confrontare e scegliere», durata 120 minuti. Il piano CAN-PLAN-1 e la fonte CAN-UDA-1-05 alimentano l'attività. È una composizione documentata; CAN-PACK-1C resta legame strutturale ma non va indicato come fonte diretta dei passaggi B25. L'obiettivo operativo chiede di confrontare alternative mediante funzionalità, fattibilità, materiali, sicurezza, costo indicativo e sprechi e di motivare la decisione; il prodotto atteso è una **matrice di scelta motivata**. La fonte non prescrive punteggi né pesi per la matrice.

In Arena la fascia di **Tecnologia I secondaria** contiene fra le competenze locali «confrontare soluzioni». Il collegamento fra quella voce e B25 è **candidato**, non una corrispondenza curricolare vigente o un obiettivo nazionale individuale. Lo scopo di un compito e l'autorità della sua fonte restano separati.

### Criteri di osservazione proposti, senza schede individuali
1. **Processo:** confronta almeno due alternative con criteri pertinenti, riconoscibili nella matrice.
2. **Argomentazione:** motiva una scelta collegandola a bisogni, vincoli e informazioni disponibili, anziché basarsi esclusivamente su preferenze.

Nella pratica il docente può esaminare il prodotto, osservare il processo e richiedere una spiegazione anche orale; gli eventuali supporti sono parte del contesto, non penalità. La decisione sul criterio e sull'eventuale giudizio spetta al docente; nessun voto, livello o profilo dello studente è generato dal raccordo. Un prodotto di gruppo non viene automaticamente replicato come evidenza individuale.

## 3. Riscontro tecnico
| Controllo | Esito | Implicazione |
| --- | --- | --- |
| UdA, blocco e obiettivi in Docente OS | PRESENTE | Riusare proiezione B25 effettiva e fonti |
| Evidenza attesa e osservazione individuale in Registro | PRESENTI SEPARATAMENTE | Conservarle nelle rispettive superfici |
| Raccordo automatico UdA → Registro verificato | NON DIMOSTRATO | Non introdurre import/export dati senza contratto |
| Curricolo Arena approvato e vigente | NO | Non attestare riferimenti autoritativi |
| Osservazione → competenza / voto automatici | VIETATI DAL PERIMETRO | Docente e criteri restano decisori |
| Trasferimento di dati individuali nell'ecosistema | NON AUTORIZZATO | Nessun identificatore individuale o dato reale qui |

Le due applicazioni non hanno un contratto comune di interscambio fra *proiezione didattica di una UdA* ed *evidenza individuale revisionata* qualificato da questa analisi. Un ulteriore modello di dominio andrebbe evitato: prima confrontare i produttori e consumatori realmente esistenti, la granularità dei riferimenti e le regole di destinazione.

## 4. Prossimo intervento circoscritto
**G02:** costruire un prototipo di *raccordo editoriale in sola lettura*, versione e fonti esatte, che colleghi il piano B25 ai criteri proposti e a una struttura simulata di osservazione, senza importare dati reali. Verificare che nessuna fonte provvisoria sia presentata come ufficiale e che la revisione della lezione non cambi silenziosamente la prova. Il prototipo non dovrà diventare un nuovo canale di trasferimento di dati fra prodotti.

**Dipendenze:** la validazione professionale E-R4 continua separatamente; una futura integrazione operativa richiede decisioni sui contratti e autorizzazioni esplicite. Gli esiti tecnici non costituiscono delibera.

**Nessuna modifica al master, ai prodotti, all'applicazione Android, alle valutazioni o alla Biblioteca Atlas.**
