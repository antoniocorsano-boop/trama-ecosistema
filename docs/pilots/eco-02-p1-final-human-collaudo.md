# ECO-02/P1 — Runbook collaudo umano finale

**Stato:** READY_FOR_HUMAN_EXECUTION_V2 / PILOT_STILL_ACTIVE  
**Perimetro:** Tecnologia · classe 2C · sequenza «Agricoltura come sistema tecnologico»  
**Dati personali:** non richiesti  
**Automazione autonoma:** non autorizzata

## Scopo

Eseguire una sola prova integrata del percorso reale già consolidato tecnicamente, senza interventi correttivi durante il test.

Il collaudo deve verificare l'esperienza professionale del docente, non ripetere i test tecnici di persistenza o CI.

## Precondizioni

Prima di iniziare devono risultare:

- baseline Arena valida per classe + disciplina + anno + versione;
- accesso Docente OS alla classe 2C;
- superficie «Prima della lezione» disponibile;
- proposta/risorsa Atlas visibile come proposta e non come adozione;
- P9 disponibile con una sola rappresentazione della proposta;
- registrazione TeachingSession operativa in Beta;
- Runtime Health Beta verde;
- TRAMA-PW-01 integrato;
- Product CI, P6 Performance Runtime e HVA Runtime post-merge PASS sul Beta Docente OS;
- nessun intervento tecnico pianificato durante la prova.

Se una precondizione manca, il collaudo si ferma e non viene classificato come FAIL didattico.

## Percorso da eseguire

### 1. Apertura della classe

Verificare:

- classe corretta;
- disciplina corretta;
- lezione/sequenza riconoscibile;
- data e collocazione coerenti nel dominio Docente OS.

### 2. Baseline Arena e gate «Approva e procedi»

Verificare il comportamento ordinario previsto dal modello persistente Arena → Docente OS.

La prova deve mostrare realmente:

- baseline corretta già associata a classe + disciplina + anno + versione, quando corrente;
- provenienza Arena chiaramente riconoscibile;
- stato della baseline comprensibile;
- nessun nuovo trasferimento manuale richiesto per la singola lezione;
- gate reale «Approva e procedi» soltanto quando il flusso lo richiede;
- nessuna approvazione implicita derivante dal solo trasporto, dalla persistenza o dalla navigazione.

Se una vera azione di acquisizione o rivalidazione è necessaria nel caso reale, allora devono essere percepibili intenzione, stato in corso quando pertinente, esito, stato risultante e prossimo passo secondo TRAMA-PW-01. Non va forzato un refresh artificiale soltanto per produrre evidenza.

Il trasferimento manuale .cml-handoff.json resta ammesso solo come interoperabilità, pilota o ripiego; non è una procedura ordinaria e non deve essere ripetuto per ogni lezione.

### 3. Contesto curricolare

Dopo il gate verificare che il docente riconosca:

- provenienza Arena;
- obiettivo/i rilevanti;
- stato della baseline;
- persistenza per classe + disciplina + anno + versione;
- assenza di richiesta di un nuovo trasferimento manuale per la singola lezione.

### 4. Prima della lezione

Aprire la superficie di preparazione e verificare:

- una sola rappresentazione per ciascuna proposta;
- provenienza della proposta;
- testo comprensibile;
- possibilità di modifica;
- possibilità di esclusione o sostituzione.

### 5. P9 — accettazione, modifica e riconferma

Eseguire esplicitamente nell'ordine seguente:

1. scegliere una proposta ancora non adottata;
2. confermarla una prima volta con l'azione esplicita prevista;
3. verificare che risulti effettiva nella lezione;
4. modificare il testo dell'elemento già accettato;
5. verificare che la precedente accettazione decada e che l'elemento torni in stato da riesaminare;
6. verificare che la versione modificata non sia già effettiva nella lezione;
7. confermare nuovamente con un'azione esplicita;
8. verificare che solo dopo la seconda conferma la versione modificata risulti effettiva.

Esito minimo:
- prima accettazione visibile;
- modifica visibile;
- invalidazione esplicita dell'accettazione precedente;
- stato da riesaminare dopo la modifica;
- nuova conferma necessaria;
- nessun doppione percettivo.

### 6. Decisione sulla risorsa Atlas

Registrare una delle sole decisioni ammesse:

- RIUTILIZZA;
- ADATTA;
- SOSTITUISCI;
- ESCLUDI.

La proposta Atlas non deve risultare automaticamente adottata.

Annotare in forma sintetica il motivo della scelta senza dati personali.

### 7. Uso della preparazione

Verificare se, al momento di usarla in classe, la preparazione risulta:

- leggibile;
- sufficiente;
- modificabile;
- coerente con il tempo disponibile;
- priva di passaggi manuali opachi.

### 8. Registrazione della lezione

Al termine:

- registrare la TeachingSession;
- verificare il feedback utente;
- verificare che la registrazione dei minuti sia distinta dalla decisione di completamento del blocco;
- non confermare automaticamente il completamento se il docente non lo ritiene didatticamente concluso.

### 9. Chiusura del test

Senza modificare il sistema durante il collaudo, registrare:

- cosa ha funzionato;
- cosa ha richiesto interpretazione;
- eventuali passaggi ridondanti;
- eventuali errori;
- decisione finale del docente.

## Evidenza minima

Il rapporto umano deve contenere soltanto:

- data del test;
- classe 2C;
- disciplina Tecnologia;
- sequenza testata;
- esito del flusso Arena → Docente OS e del gate «Approva e procedi»;
- decisione sulla risorsa Atlas;
- esito P9 accettazione → modifica → riconferma;
- esito registrazione TeachingSession;
- tempo percepito di preparazione;
- problemi osservati;
- valutazione finale.

Non devono comparire:

- nomi studenti;
- identificativi personali;
- valutazioni individuali;
- screenshot contenenti dati personali non necessari.

## Domande finali al docente

Rispondere con PASS / PARTIAL / FAIL e una nota breve:

1. Baseline Arena, stato e provenienza comprensibili senza trasferimenti superflui?
2. Origine curricolare e obiettivo della lezione chiari?
3. Gate «Approva e procedi» esplicito e non implicito?
4. Risorsa Atlas realmente controllabile?
5. P9 accettazione → modifica → riconferma comprensibili?
6. Preparazione pronta all'uso senza lavoro tecnico?
7. Registrazione della lezione comprensibile?
8. Completamento del blocco correttamente separato dalla registrazione?
9. Flusso complessivo più semplice del percorso manuale precedente e qualità didattica sufficiente?
10. Il docente mantiene il controllo in ogni passaggio?

## Criterio di chiusura ECO-02/P1

Il pilota può essere proposto per chiusura soltanto se:

- non emergono blocker;
- **tutte e 10 le domande finali sono PASS**;
- lo stato complessivo del collaudo è PASS;
- nessuna adozione o approvazione avviene automaticamente;
- il comportamento reale Arena → Docente OS è stato verificato senza forzare trasferimenti o refresh non necessari, e il gate «Approva e procedi» è stato esercitato solo quando pertinente;
- il ciclo P9 accettazione → modifica → riconferma è stato realmente esercitato;
- il rapporto umano finale è registrato;
- una successiva PR TRAMA propone esplicitamente la chiusura;
- una nuova HUMAN EXACT-HEAD REVIEW approva quella chiusura.

Qualunque risposta PARTIAL o FAIL mantiene ECO-02/P1 ACTIVE e impedisce la proposta di chiusura finché il rilievo non è risolto e nuovamente verificato.

La chiusura non attiva DOS-A1 e non autorizza nuovi runtime cross-product.

## Stati finali ammessi

- PASS — candidato alla chiusura governata;
- PARTIAL — pilota resta ACTIVE con rilievi circoscritti;
- FAIL — pilota resta ACTIVE e richiede correzione prima di una nuova prova;
- BLOCKED — prova non valida per precondizione tecnica mancante.

## Ricevuta finale proposta

In caso di PASS pieno, il rapporto umano deve produrre una ricevuta sintetica con:

- identificativo `ECO-02/P1`;
- data del collaudo;
- perimetro Tecnologia 2C;
- esito `PASS`;
- conferma `NO_TECHNICAL_INTERVENTION_DURING_RUN`;
- conferma `TEACHER_CONTROL_PRESERVED`;
- conferma `TRAMA_PW_01_OBSERVED`;
- conferma `NO_IMPLICIT_APPROVAL`;
- conferma `DOS_A1_REMAINS_RUNTIME_DEFERRED`.

Solo dopo integrazione della PR di chiusura e HUMAN EXACT-HEAD REVIEW PASS lo stato canonico può diventare `CLOSED_VERIFIED`.
