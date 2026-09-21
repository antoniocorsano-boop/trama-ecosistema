# ECO-02/P1 — Runbook collaudo umano finale

**Stato:** READY_FOR_HUMAN_EXECUTION / PILOT_STILL_ACTIVE  
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
- nessun intervento tecnico pianificato durante la prova.

Se una precondizione manca, il collaudo si ferma e non viene classificato come FAIL didattico.

## Percorso da eseguire

### 1. Apertura della classe

Verificare:

- classe corretta;
- disciplina corretta;
- lezione/sequenza riconoscibile;
- data e collocazione coerenti nel dominio Docente OS.

### 2. Contesto curricolare

Verificare che il docente riconosca:

- provenienza Arena;
- obiettivo/i rilevanti;
- stato della baseline;
- assenza di richiesta di nuovo trasferimento manuale .cml-handoff.json per la singola lezione.

### 3. Prima della lezione

Aprire la superficie di preparazione e verificare:

- una sola rappresentazione per ciascuna proposta;
- provenienza della proposta;
- testo comprensibile;
- possibilità di modifica;
- possibilità di esclusione o sostituzione.

### 4. P9 — modifica e riconferma

Eseguire esplicitamente:

1. modificare una proposta;
2. verificare che l'accettazione precedente non resti valida in modo silenzioso;
3. confermare nuovamente con un'azione esplicita;
4. verificare che solo dopo la conferma l'elemento risulti effettivo nella lezione.

Esito minimo:
- modifica visibile;
- stato da riesaminare dopo la modifica;
- nuova conferma necessaria;
- nessun doppione percettivo.

### 5. Decisione sulla risorsa Atlas

Registrare una delle sole decisioni ammesse:

- RIUTILIZZA;
- ADATTA;
- SOSTITUISCI;
- ESCLUDI.

La proposta Atlas non deve risultare automaticamente adottata.

Annotare in forma sintetica il motivo della scelta senza dati personali.

### 6. Uso della preparazione

Verificare se, al momento di usarla in classe, la preparazione risulta:

- leggibile;
- sufficiente;
- modificabile;
- coerente con il tempo disponibile;
- priva di passaggi manuali opachi.

### 7. Registrazione della lezione

Al termine:

- registrare la TeachingSession;
- verificare il feedback utente;
- verificare che la registrazione dei minuti sia distinta dalla decisione di completamento del blocco;
- non confermare automaticamente il completamento se il docente non lo ritiene didatticamente concluso.

### 8. Chiusura del test

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
- decisione sulla risorsa Atlas;
- esito P9;
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

1. Origine curricolare chiara?
2. Obiettivo della lezione chiaro?
3. Risorsa Atlas realmente controllabile?
4. P9 modifica + riconferma comprensibili?
5. Preparazione pronta all'uso senza lavoro tecnico?
6. Registrazione della lezione comprensibile?
7. Completamento del blocco correttamente separato dalla registrazione?
8. Flusso complessivo più semplice del percorso manuale precedente?
9. Qualità didattica sufficiente per l'uso reale?
10. Il docente mantiene il controllo in ogni passaggio?

## Criterio di chiusura ECO-02/P1

Il pilota può essere proposto per chiusura soltanto se:

- non emergono blocker;
- i punti 1, 3, 4, 6, 7 e 10 sono PASS;
- nessuna adozione o approvazione avviene automaticamente;
- il rapporto umano finale è registrato;
- una successiva PR TRAMA propone esplicitamente la chiusura;
- una nuova HUMAN EXACT-HEAD REVIEW approva quella chiusura.

La chiusura non attiva DOS-A1 e non autorizza nuovi runtime cross-product.

## Stati finali ammessi

- PASS — candidato alla chiusura governata;
- PARTIAL — pilota resta ACTIVE con rilievi circoscritti;
- FAIL — pilota resta ACTIVE e richiede correzione prima di una nuova prova;
- BLOCKED — prova non valida per precondizione tecnica mancante.
