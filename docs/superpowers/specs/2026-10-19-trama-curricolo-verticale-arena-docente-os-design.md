# TRAMA — Adozione del curricolo verticale di istituto Arena → Docente OS

**Status:** HUMAN REVIEW APPROVED / IMPLEMENTATION PLANNED / NO_RUNTIME  
**Date:** 2026-10-19  
**Scope:** TRAMA · Arena · Docente OS  
**Authority:** Arena per il dominio curricolare; Docente OS per l'operatività docente  
**Human review:** APPROVED 2026-10-19  
**Runtime authorization:** NONE

## 1. Scopo

Questa specifica definisce il modo canonico con cui Docente OS adotta come propria baseline operativa il **curricolo verticale di istituto proveniente da Arena**, nella sua interezza e per l'anno scolastico pertinente.

La baseline comprende tutto il primo ciclo rappresentato dall'istituto:

- scuola dell'infanzia;
- scuola primaria, classi 1ª–5ª;
- scuola secondaria di primo grado, classi 1ª–3ª;
- tutte le discipline, i campi di esperienza e gli ambiti trasversali governati da Arena;
- le relazioni verticali tra segmenti e versioni;
- provenienza, stato di autorità, applicabilità e vincoli di rivalidazione.

La specifica nasce da un problema runtime reale emerso nella Human Review di Docente OS: una lezione della 3ª E può essere preparata e corredata di materiali, ma non può entrare in conduzione quando manca la baseline Arena adottata per il contesto curricolare. Il difetto non è nel gate: è nella catena incompleta Arena → adozione Docente OS.

L'obiettivo non è risolvere una singola classe con una nuova eccezione. L'obiettivo è eliminare definitivamente il modello a pilota e introdurre un solo meccanismo valido per l'intero curricolo verticale di istituto.

## 2. Decisione architetturale

TRAMA stabilisce la seguente direzione:

> **Arena pubblica una versione governata del curricolo verticale di istituto. Docente OS la adotta come baseline operativa unica per istituto e anno scolastico. Le superfici operative di Docente OS ne derivano proiezioni limitate alle classi, sezioni, campi e discipline effettivamente assegnati al docente.**

Conseguenze vincolanti:

1. Arena resta l'unica autorità sul contenuto curricolare, sulla sua provenienza, applicabilità, versione e stato istituzionale.
2. Docente OS non duplica il curricolo per ogni classe e non crea una seconda autorità curricolare.
3. L'adozione in Docente OS significa **accettazione operativa di una versione Arena**, non approvazione istituzionale del contenuto.
4. Una baseline provvisoria completa può essere usata per la programmazione quando Arena la dichiara utilizzabile; resta marcata come soggetta a rivalidazione.
5. Una baseline approvata conserva l'autorità istituzionale dichiarata da Arena; Docente OS non può promuovere autonomamente una baseline provvisoria ad approvata.
6. Nessuna scrittura cross-product è automatica o implicita.

## 3. Invarianti protetti

### 3.1 Arena — GOVERN

Arena è owner di:

- versione del curricolo verticale di istituto;
- segmenti per ordine, classe/anno quando applicabile, disciplina o campo di esperienza;
- fonti e provenienza;
- quadro normativo applicabile;
- stato istituzionale;
- revisione e approvazione;
- regole di transizione;
- completezza della versione;
- relazioni verticali e trasversali;
- emissione di snapshot/handoff versionati verso Docente OS.

Arena non scrive direttamente lezioni, registrazioni, materiali operativi o avanzamento di classe in Docente OS.

### 3.2 Docente OS — OPERATE

Docente OS è owner di:

- contesto professionale del docente;
- cattedre, sezioni e assegnazioni;
- orario;
- programmazione annuale operativa;
- percorsi/UDA equivalenti;
- preparazione, conduzione, osservazione e registrazione;
- materiali operativi;
- evidenze professionali;
- avanzamento e riprogettazione.

Docente OS può:

- consultare l'intero curricolo verticale adottato;
- derivare il riferimento pertinente per ogni assegnazione professionale;
- richiedere una nuova adozione quando Arena emette una versione successiva;
- impedire l'esecuzione quando la baseline necessaria non è valida o non è adottata.

Docente OS non può:

- modificare il contenuto canonico Arena;
- inventare segmenti mancanti;
- attestare approvazioni istituzionali;
- usare come equivalenti segmenti di ordine, classe o disciplina differenti;
- aggirare un requisito di rivalidazione.

## 4. Unità canonica di adozione

L'unità di adozione non è la singola classe e non è il singolo segmento.

È una **Versione del curricolo verticale di istituto** identificata almeno da:

- istituto;
- anno scolastico o intervallo di validità;
- identificatore stabile della versione;
- impronta strutturale;
- stato di autorità;
- insieme completo dei segmenti inclusi;
- manifest di copertura;
- riferimenti di provenienza.

Docente OS conserva una sola **adozione corrente** per istituto/workspace e anno scolastico, oltre allo storico delle adozioni precedenti.

Una nuova versione Arena non sovrascrive silenziosamente la precedente. Viene presentata come nuova candidata e richiede un atto esplicito di adozione operativa.

## 5. Segmenti del curricolo verticale

Ogni versione è composta da segmenti governati. Un segmento identifica il contesto minimo necessario per derivare il riferimento operativo.

### 5.1 Scuola dell'infanzia

Il segmento deve rappresentare:

- ordine `infanzia`;
- campo di esperienza o altro dominio educativo canonico Arena;
- eventuale coorte/sezione quando necessaria all'applicabilità;
- **nessun obbligo di classe numerica**;
- traguardi, obiettivi, evidenze e vincoli propri del modello dell'infanzia.

Docente OS non deve trasformare l'infanzia in una falsa struttura “disciplina + classe + ore”.

### 5.2 Scuola primaria

Il segmento deve rappresentare:

- ordine `primaria`;
- classe 1ª–5ª;
- disciplina o dominio trasversale;
- quadro applicabile;
- contenuti, requisiti e provenienza del segmento.

### 5.3 Scuola secondaria di primo grado

Il segmento deve rappresentare:

- ordine `secondaria`;
- classe 1ª–3ª;
- disciplina o dominio trasversale;
- quadro applicabile;
- contenuti, requisiti e provenienza del segmento.

### 5.4 Ambiti trasversali

Educazione civica e altri domini trasversali non devono essere duplicati artificialmente per ogni disciplina. Arena ne mantiene la struttura canonica; Docente OS ne deriva i riferimenti operativi nel contesto delle attività e delle assegnazioni effettive.

## 6. Manifest di completezza

Ogni versione Arena destinata a Docente OS deve includere un **manifest di completezza**.

Il manifest dichiara almeno:

- ordini scolastici inclusi;
- annualità previste per ciascun ordine;
- discipline/campi/ambiti attesi;
- segmenti presenti;
- segmenti intenzionalmente non applicabili;
- relazioni verticali richieste;
- stato di copertura;
- impronta della versione.

Docente OS non possiede un elenco hard-coded delle discipline che pretende di trovare. Valida invece che ciò che Arena dichiara come perimetro istituzionale atteso sia effettivamente presente e coerente.

Una versione può essere adottata come **baseline verticale completa** soltanto se il manifest dichiara copertura soddisfatta per l'intero perimetro istituzionale previsto.

Se la copertura è incompleta:

- l'intero curricolo resta consultabile come candidato, se sicuro;
- la baseline non diventa “completa”;
- le proiezioni operative che dipendono da segmenti mancanti restano fail-closed;
- nessun segmento viene inventato da Docente OS.

## 7. Stati di autorità e uso operativo

Docente OS deve conservare senza reinterpretazione lo stato ricevuto da Arena.

Sono previsti almeno due casi funzionali:

### 7.1 Baseline approvata

Condizioni:

- Arena attesta l'approvazione istituzionale;
- l'evidenza di autorità è verificabile;
- la copertura richiesta è soddisfatta.

Effetti in Docente OS:

- adozione operativa consentita;
- uso nei flussi di programmazione e lezione consentito;
- nessuna rivalidazione dovuta al solo stato di autorità.

### 7.2 Baseline provvisoria completa

Condizioni:

- Arena non dichiara approvazione istituzionale;
- il contenuto è completo per la programmazione;
- il modello transitorio è esplicitamente utilizzabile;
- la copertura richiesta è soddisfatta.

Effetti in Docente OS:

- adozione operativa consentita;
- preparazione e uso professionale consentiti entro i gate esistenti;
- lo stato resta visibilmente provvisorio;
- la rivalidazione futura resta obbligatoria quando Arena produce l'autorità richiesta.

Un file o payload locale non può trasformare da solo una baseline provvisoria in baseline approvata.

## 8. Protocollo di adozione Arena → Docente OS

Il protocollo è composto da cinque fasi.

### A. Emissione Arena

Arena produce una versione governata del curricolo verticale con:

- identità della versione;
- manifest di completezza;
- segmenti;
- provenienza;
- stato di autorità;
- impronta verificabile;
- regola di utilizzo downstream;
- divieto di scrittura automatica nel prodotto consumer.

### B. Acquisizione Docente OS

Docente OS riceve il pacchetto e valida:

- istituto/workspace;
- anno scolastico;
- firma/impronta strutturale;
- completezza del manifest;
- coerenza dei segmenti;
- ordine, annualità e dominio;
- stato di autorità;
- assenza di claim istituzionali non verificabili.

### C. Revisione umana

Docente OS presenta la versione da adottare con un riepilogo comprensibile:

- quale versione;
- per quale anno;
- quali ordini;
- stato approvato/provvisorio;
- eventuali differenze rispetto alla baseline corrente;
- eventuali obblighi di rivalidazione.

### D. Adozione operativa

Un docente autorizzato nel workspace conferma esplicitamente l'adozione operativa.

La decisione crea una ricevuta tracciabile contenente almeno:

- versione Arena adottata;
- impronta strutturale;
- attore;
- data/ora;
- workspace e anno scolastico;
- stato di autorità ricevuto;
- stato di completezza;
- versione precedente sostituita, se esiste.

### E. Proiezione operativa

Dopo l'adozione, Docente OS non copia l'intera baseline dentro ogni classe. Risolve dinamicamente il segmento pertinente a partire da:

- ordine della scuola;
- classe/annualità quando prevista;
- sezione/coorte quando rilevante;
- disciplina, campo di esperienza o ambito trasversale;
- assegnazione del docente;
- anno scolastico.

## 9. Separazione tra baseline istituzionale e contesto professionale

L'intero curricolo verticale è consultabile come riferimento istituzionale nel workspace.

L'operatività è invece limitata dal **ProfessionalContext** del docente.

Regola:

> **Visibilità istituzionale ampia; capacità operativa strettamente assegnata.**

Esempi:

- un docente della secondaria può consultare la progressione primaria → secondaria, ma non registrare una lezione in una classe primaria non assegnata;
- un docente della primaria può usare i segmenti pertinenti alle proprie classi e discipline/ambiti assegnati;
- un docente dell'infanzia opera sulle proprie sezioni e campi di esperienza senza che Docente OS imponga una falsa classe numerica;
- l'accesso all'intero curricolo non attribuisce diritti di modifica su Arena.

## 10. Generalizzazione del ProfessionalContext di Docente OS

Il tipo operativo attuale `PRIMA | SECONDA | TERZA` non può diventare il modello universale.

La nuova architettura separa almeno:

- `schoolOrder`: infanzia | primaria | secondaria di primo grado;
- `yearLevel`: assente per l'infanzia quando non semanticamente richiesto, 1–5 primaria, 1–3 secondaria;
- `section/cohort`;
- `teachingDomain`: disciplina | campo di esperienza | ambito trasversale;
- `assignment` del docente.

Le attuali strutture specifiche della secondaria possono restare come compatibilità durante la migrazione, ma non sono la fonte canonica del nuovo modello universale.

## 11. Versionamento e rivalidazione

Docente OS deve distinguere almeno:

- `NOT_PRESENT` — nessuna baseline adottata;
- `ADOPTED_CURRENT` — baseline corrente e coerente;
- `UPDATE_AVAILABLE` — Arena ha emesso una versione successiva;
- `REVALIDATION_REQUIRED` — la baseline adottata non è più sufficiente per un'azione che richiede nuova autorità/coerenza;
- `SUPERSEDED` — baseline storica sostituita.

Una versione nuova non modifica retroattivamente:

- lezioni già registrate;
- ricevute di preparazione;
- evidenze già acquisite;
- riferimenti storici alla versione usata.

Le nuove preparazioni devono invece usare la baseline corrente adottata o fermarsi con un messaggio fail-closed comprensibile.

## 12. Effetto sui flussi Docente OS

Dopo l'adozione verticale, i flussi devono usare un unico resolver di contesto curricolare.

### OGGI / PREPARA

Risoluzione automatica del segmento pertinente all'assegnazione e alla lezione.

### MATERIALI / VISUALIZZA

Il materiale mantiene il contesto della lezione, ma non diventa fonte curricolare.

### CONDUCI

Consentito quando:

- esiste una baseline verticale adottata;
- il segmento richiesto è presente e applicabile;
- la preparazione richiesta è approvata;
- gli eventuali requisiti di rivalidazione sono soddisfatti secondo lo stato Arena.

### OSSERVA / REGISTRA / CONTINUA

La ricevuta di esecuzione mantiene il riferimento alla versione Arena e al segmento utilizzato, in modo da garantire tracciabilità storica senza copiare l'intero curricolo nella registrazione.

## 13. Compatibilità e migrazione

### 13.1 ECO-01 v1

Il contratto v1 esistente resta immutabile come superficie di compatibilità. La nuova architettura non lo riscrive retroattivamente.

### 13.2 ECO-02/P1

Il pilota Tecnologia 2C cessa di essere il modello generale. Diventa una precedente istanza compatibile del nuovo flusso e deve poter essere migrato senza perdere la ricevuta esistente.

### 13.3 Baseline 3ª E

La 3ª E non riceve un'eccezione dedicata. Dopo l'attivazione del nuovo modello, il suo contesto viene risolto attraverso la stessa baseline verticale adottata usata da ogni altra classe.

### 13.4 Dati operativi esistenti

Nessuna migrazione può invalidare:

- sezioni esistenti;
- orario;
- materiali;
- progressi;
- lezioni registrate;
- ricevute di adozione precedenti.

## 14. Sicurezza e privacy

La baseline contiene esclusivamente dati curricolari e professionali non personali.

Vincoli:

- nessun dato studente nel pacchetto Arena;
- nessun tracking studente;
- nessuna propagazione automatica di dati operativi da Docente OS verso Arena;
- autenticazione richiesta per l'adozione;
- autorizzazione limitata al workspace;
- fail-closed su mismatch di istituto, anno, ordine, annualità o dominio;
- nessuna secret nel client;
- ricevute di adozione auditabili.

## 15. Non-obiettivi

Questa specifica non autorizza:

- deploy di produzione;
- merge automatici;
- scrittura autonoma Arena → Docente OS;
- modifica automatica della programmazione docente;
- pubblicazione automatica in Atlas;
- trasformazione di Docente OS in autorità curricolare;
- estensione dei permessi del docente oltre le assegnazioni reali;
- creazione automatica di classi o cattedre a partire dal curricolo.

## 16. Strategia di implementazione

L'implementazione deve essere suddivisa in tranche verificabili, senza aprire fronti indipendenti.

### Tranche A — Contratto verticale Arena

Produrre e validare la versione di istituto completa con manifest di copertura, usando il modello versionato Arena già esistente e senza duplicarlo.

### Tranche B — Ricezione e adozione Docente OS

Sostituire il recinto del pilota 2C con un ingresso generico governato per la baseline verticale di istituto, mantenendo accettazione umana, provenance e fail-closed.

### Tranche C — ProfessionalContext universale

Separare ordine scolastico, annualità, sezione/coorte e dominio di insegnamento, preservando la compatibilità con le attuali classi della secondaria.

### Tranche D — Proiezione operativa

Collegare Piano annuale e Lesson Workspace al resolver unico della baseline verticale adottata.

### Tranche E — Migrazione e Human Review

Migrare la baseline pilota esistente, materializzare la versione Arena reale dell'istituto e validare almeno:

- infanzia;
- primaria;
- secondaria di primo grado;
- caso transitorio/provvisorio;
- caso approvato;
- caso mismatch fail-closed;
- percorso reale 3ª E/B01 da CONDUCI a CONTINUA.

## 17. Criteri di accettazione architetturali

La soluzione è accettabile soltanto se sono contemporaneamente vere le seguenti condizioni:

1. Docente OS possiede una sola baseline verticale corrente per istituto/workspace e anno scolastico.
2. La baseline copre infanzia, primaria 1ª–5ª e secondaria di primo grado 1ª–3ª secondo il manifest Arena.
3. Nessuna disciplina/campo previsto da Arena viene perso durante il trasferimento.
4. Infanzia non richiede una falsa classe numerica.
5. L'utente può consultare l'intera verticale ma operare solo sulle proprie assegnazioni.
6. Arena resta l'unica autorità sul contenuto e sullo stato istituzionale.
7. Docente OS può usare una baseline provvisoria completa senza elevarla ad approvata.
8. Un aggiornamento Arena produce una nuova candidata e non un overwrite silenzioso.
9. Le lezioni storiche restano legate alla versione usata al momento dell'esecuzione.
10. Il gate `Curricolo da rivalidare` continua a bloccare quando la baseline è realmente assente/incoerente e smette di bloccare quando il contesto è validamente adottato.
11. Il vecchio pilota 2C non resta una dipendenza architetturale del nuovo flusso.
12. La 3ª E/B01 può completare `CONDUCI → OSSERVA → REGISTRA → CONTINUA` senza bypass e con riferimento alla baseline Arena adottata.

## 18. Evidenze richieste prima dell'attivazione

Prima di qualunque promozione runtime sono richiesti:

- test del manifest verticale completo;
- test per tutti gli ordini scolastici;
- test di tutte le annualità numeriche previste;
- test infanzia senza annualità numerica obbligatoria;
- test multi-dominio;
- test stato approvato/provvisorio;
- test aggiornamento e rivalidazione;
- test mismatch istituto/anno/ordine/annualità/dominio;
- replay database delle migration;
- Product CI;
- qualificazione browser focalizzata;
- Human Review autenticata sulla Beta;
- nessun deploy di produzione senza autorizzazione separata.

## 19. Esito atteso

Al termine, il rapporto tra i prodotti deve essere leggibile così:

```text
ARENA
  governa e versiona il curricolo verticale di istituto
        ↓
VERSIONE ARENA ADOTTATA IN DOCENTE OS
  baseline istituzionale unica + manifest + provenance
        ↓
PROFESSIONAL CONTEXT
  ordine + annualità/coorte + sezione + dominio + assegnazione
        ↓
PROIEZIONE OPERATIVA
  piano annuale → preparazione → conduzione → osservazione → registrazione
```

Il curricolo verticale resta uno. Le sue applicazioni operative possono essere molte. L'autorità non si duplica.
