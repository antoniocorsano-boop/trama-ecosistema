# CAP-DOS-ARGO-SYNC — Sincronizzazione didattica incrementale verso Argo

**Lifecycle:** ACTIVE_DISCOVERY  
**Current gate:** G0 Intake / G1 Discovery  
**Owning product candidate:** Docente OS  
**Ecosystem impact:** TRAMA / Docente OS; Arena and Atlas boundaries to be assessed at G2  
**Runtime:** NOT_AUTHORIZED  
**Human decision required:** YES  
**ADR candidate:** YES — formal classification required at G2

## 1. Problema

Il caricamento della didattica verso Argo tramite XLS/CSV non deve costringere il docente a ricostruire, riesportare e ricontrollare integralmente il programma a ogni modifica.

Il problema da risolvere è quindi la ripetizione del ciclo manuale:

```text
modifica didattica
→ ricostruzione file
→ ricontrollo completo
→ nuova importazione
```

anche quando la variazione riguarda solo pochi elementi.

## 2. Attori e valore atteso

### Attore primario

**Docente** che pianifica e aggiorna il programma scolastico e deve trasferire nel registro istituzionale solo le informazioni necessarie, senza duplicare il lavoro.

### Attori secondari

- **Dirigente / istituzione scolastica**, interessati alla correttezza e tracciabilità del dato istituzionale;
- **TRAMA governance**, che deve preservare authority, confini, provenance e human control;
- **Arena**, come authority curricolare;
- **Atlas**, per contenuti/materiali pubblicabili nel proprio perimetro;
- **Docente OS**, come ambiente operativo teacher-first;
- **Argo didUP**, come sistema istituzionale esterno di destinazione.

### Valore atteso

- riduzione del lavoro ripetitivo;
- verifica delle sole variazioni effettive;
- riuso tra classi e anni;
- tracciabilità della provenienza e delle versioni;
- reversibilità;
- nessuna promozione implicita o perdita di controllo umano.

## 3. Evidenza di partenza

Le indicazioni operative rilevanti sono state ricavate dal manuale Argo didUP 4.54.0, aggiornato al 07/09/2026, in particolare dalle sezioni **Programma Scolastico** (pp. 99–101) e **Richiamo agli Argomenti** nel Giornale di classe (pp. 20–21).

Il manuale documenta una struttura didattica gerarchica `classe → materia → modulo → argomenti`, il riuso tra classi e anni scolastici, l'importazione selettiva di singoli moduli, la gestione dello stato di svolgimento e un canale XLS di importazione/esportazione.

### 3.1 Struttura e campi documentati

Per i moduli:
- la **descrizione** è necessaria;
- l'**ordine** è opzionale;
- ogni modulo contiene una lista di argomenti.

Per gli argomenti:
- la **descrizione** è necessaria;
- **data di svolgimento** e **stato di svolgimento** sono facoltativi;
- data e stato possono essere aggiornati automaticamente quando l'argomento viene richiamato nelle **Attività svolte** del Giornale di classe.

### 3.2 Vincoli operativi documentati

- un argomento già utilizzato in una valutazione non può essere cancellato;
- il programma può essere importato da un'altra classe senza ricrearlo ex novo;
- la sorgente può appartenere anche a un anno scolastico precedente;
- è possibile importare l'intero programma oppure **solo alcuni moduli**;
- i moduli importati vengono aggiunti a quelli già presenti;
- l'XLS esportato da didUP è un artefatto condivisibile/importabile, ma il manuale sconsiglia vivamente di modificarne l'originale per evitare blocchi in importazione.

### 3.3 Conseguenze di discovery

Queste evidenze rafforzano quattro scelte candidate:

1. **modello canonico gerarchico** allineato a modulo/argomento;
2. **distinzione tra programmato e svolto**, perché lo stato di svolgimento evolve durante le lezioni;
3. **riuso nativo Argo per moduli** da preferire, quando sufficiente, rispetto alla manipolazione dell'XLS;
4. **conflitto governato sulle cancellazioni**, perché una rimozione locale non implica automaticamente cancellazione possibile in Argo.

La struttura interna dell'XLS (fogli, colonne, metadati, identificatori, regole sui duplicati) non è documentata nel manuale e resta una lacuna di G1.


L'evidenza, le assunzioni e le lacune conoscitive sono registrate in `research-evidence-register.md`.

## 4. Ipotesi architetturale

Docente OS mantiene un **modello didattico canonico** e genera verso Argo solo artefatti compatibili con il formato richiesto.

```text
Arena / curricolo
        ↓
Atlas / contenuti e materiali
        ↓
Docente OS / pianificazione e attuazione
        ↓
Sincronizzazione didattica
        ↓
Argo / registro istituzionale
```

Argo resta il sistema istituzionale di destinazione. Non acquisisce authority sul curricolo o sulla progettazione didattica dell'ecosistema.

Questa è una **ipotesi di discovery**, non ancora un'architettura approvata.

## 5. Alternative considerate a G1

### A. Rigenerazione completa a ogni modifica

**Vantaggio:** semplicità concettuale.  
**Criticità:** lavoro ripetitivo, ricontrollo completo, rischio di sovrascrittura e scarsa scalabilità.  
**Stato:** candidato da rigettare a G2 salvo evidenza contraria.

### B. Modifica diretta del file XLS esportato da Argo

**Vantaggio:** apparente immediatezza.  
**Criticità:** contrasta con la raccomandazione del manuale Argo di non modificare il file originale; lega il modello interno a un formato esterno fragile.  
**Stato:** candidato negativo; non autorizzato.

### C. Sincronizzazione incrementale con modello canonico e adattatore

**Vantaggio:** separa la didattica dal formato Argo, abilita delta, idempotenza, provenance e riuso.  
**Criticità:** richiede identità persistente, baseline, mapping e gestione conflitti.  
**Stato:** ipotesi principale da verificare.

### D. Automazione diretta/browser/API verso Argo

**Vantaggio:** ridurrebbe ulteriormente le azioni manuali.  
**Criticità:** introduce credenziali, write authority esterna, fragilità e rischi non governati.  
**Stato:** fuori perimetro e non autorizzato.

## 6. Principio di sincronizzazione candidato

La sincronizzazione dovrebbe essere **incrementale, idempotente, non distruttiva e human-confirmed**.

Prima acquisizione:

```text
Didattica corrente
→ normalizzazione
→ baseline Argo A
→ pacchetto di esportazione A
```

Aggiornamenti successivi:

```text
Didattica corrente B
        ↕
Baseline Argo A
        ↓
delta
        ↓
anteprima
        ↓
pacchetto Argo
        ↓
conferma umana
        ↓
Baseline Argo B
```

## 7. Identità persistente candidata

Gli elementi didattici non devono essere identificati dal numero di riga del foglio.

Ogni entità deve avere un identificatore stabile, ad esempio:

```text
UDA-TEC-2-01
MOD-TEC-2-01
ARG-TEC-2-01-001
```

Campi minimi candidati:

```text
id
anno_scolastico
classe
disciplina
uda
modulo
argomento
descrizione
ordine
stato
data_prevista
data_svolgimento
fonte
versione
updated_at
```

## 8. Change Detection Engine candidato

Il motore deve distinguere tra **struttura pianificata** e **stato di attuazione**. Una variazione dello stato `svolto/non svolto` o della data di svolgimento non deve essere interpretata come modifica strutturale del contenuto.



Il confronto avviene per entità persistente e non per posizione di cella.

Stati candidati del delta:

- `NEW`;
- `MODIFIED`;
- `UNCHANGED`;
- `REMOVED`;
- `PERFORMANCE_STATUS_CHANGED`;
- `MOVED`;
- `CONFLICT`.

Ogni entità può esporre un `contentHash` deterministico per riconoscere rapidamente gli elementi invariati.

Stesso file o stesso contenuto già acquisito deve produrre `NO_OP`.

## 9. Formati

### XLSX docente

Formato umano, modificabile e validabile, destinato al lavoro del docente e agli aggiornamenti massivi.

### CSV

Formato semplice di scambio e automazione. Non è il formato principale di lavoro umano.

### XLS Argo

Artefatto generato dall'adattatore Argo e trattato come **output controllato**. Non deve diventare il documento sorgente che il docente modifica ordinariamente.

Un export Argo reale è stato ispezionato e ha confermato un file **BIFF8/CDFV2 .XLS** con foglio `Dati` e sei colonne semantiche. Resta da verificare la compatibilità di qualunque file ricostruito/modificato mediante round-trip controllato prima di qualsiasi G3.

## 10. Profilo Argo persistente candidato

La mappatura richiesta da Argo dovrebbe essere configurata o appresa una sola volta e conservata come profilo versionato.

Campi candidati:

```text
istituto
anno_scolastico
classe
materia
versione_formato
mappatura_campi
vincoli
```

Una variazione del formato Argo dovrebbe produrre una nuova versione del profilo senza alterare il modello didattico canonico.

## 11. Stati operativi candidati

```text
DRAFT
READY_FOR_ARGO
SYNC_CONFIRMED
```

- **DRAFT**: contenuto ancora in lavorazione;
- **READY_FOR_ARGO**: contenuto validato e predisponibile per l'esportazione;
- **SYNC_CONFIRMED**: l'utente ha confermato l'avvenuta importazione nel sistema istituzionale.

La sola generazione del file non autorizza il passaggio a `SYNC_CONFIRMED`.

## 12. Human control

Il docente deve poter esaminare esclusivamente le variazioni rilevate e, per ciascuna, scegliere almeno:

- accetta;
- mantieni precedente;
- modifica;
- escludi.

I conflitti devono essere fail-closed e non possono essere risolti implicitamente.

## 13. Sync Receipt candidata

Ogni sincronizzazione candidata deve poter produrre una ricevuta immutabile/version-bound contenente almeno:

```text
syncId
baseline precedente
delta
entità interessate
file prodotto
file hash
classe
disciplina
adapter version
timestamp
stato
```

La conferma umana dell'importazione chiude il ciclo e abilita la nuova baseline.

## 14. Riuso tra classi e anni

Il manuale documenta già un meccanismo nativo di riuso in Argo: selezione di classe/materia sorgente, anche da anno scolastico precedente, e importazione dell'intero programma o di soli moduli selezionati.

Conseguenza: la strategia di integrazione deve adottare una **preferenza nativa-first**:

```text
1. riuso/importazione nativa Argo per moduli, se sufficiente;
2. XLS come canale di interoperabilità qualificato;
3. nessuna manipolazione arbitraria dell'XLS originale.
```



Il modello dovrebbe supportare:

- riuso da anno precedente;
- riuso tra classi parallele;
- derivazione da un programma master;
- override locali per singola classe;
- conservazione della lineage.

Il riuso non deve produrre duplicazioni non tracciabili.

## 15. Assunzioni di discovery

Le seguenti assunzioni non sono ancora decisioni approvate:

1. il docente dispone di un file XLS esportato da didUP utilizzabile come campione;
2. il formato XLS conserva una struttura sufficientemente deterministica da consentire un adattatore versionato;
3. il docente beneficia maggiormente di un XLSX umano rispetto a un CSV come superficie primaria di lavoro;
4. la conferma dell'avvenuta importazione in Argo può restare manuale senza compromettere il valore della capability;
5. il programma scolastico è il primo dominio di interoperabilità da qualificare, prima di eventuali altre aree del registro.

## 16. Rischi e incertezze

- duplicazione di moduli quando un'importazione nativa aggiunge elementi già presenti;
- impossibilità di cancellare argomenti già collegati a valutazioni;
- disallineamento tra programma pianificato in Docente OS e stato di svolgimento aggiornato direttamente nel Giornale di classe;


- formato Argo non documentato come contratto stabile;
- possibile differenza di struttura tra versioni didUP, istituti o configurazioni;
- perdita di identità in round-trip se l'XLS Argo non conserva identificatori esterni;
- cancellazioni o spostamenti potenzialmente ambigui;
- rischio di falsa conferma della baseline se l'importazione Argo fallisce parzialmente;
- necessità di distinguere contenuto curricolare autorevole, programmazione operativa e dato istituzionale;
- rischio di trasformare la baseline in una nuova authority sintetica;
- possibile necessità di gestire più file/profili per classi o discipline differenti.

## 17. Open questions per G1/G2

0. Qual è la semantica esatta dei duplicati quando Argo aggiunge moduli importati a quelli già presenti?


1. Quanto è stabile, tra esportazioni diverse, la struttura XLS osservata nel campione reale (BIFF8/CDFV2, foglio `Dati`, sei colonne)?
2. Quali campi sono obbligatori e quali tollerano valori aggiuntivi?
3. Argo importa solo file originariamente esportati da didUP o accetta file ricostruiti fedelmente?
4. Come si comporta Argo in caso di record duplicati, modificati, rimossi o riordinati?
5. È possibile aggiornare selettivamente moduli/argomenti senza duplicare quelli già presenti?
6. Qual è il corretto confine tra dati curricolari Arena, materiali Atlas e pianificazione Docente OS?
7. Dove deve vivere la baseline persistente e quale retention è necessaria?
8. Quale livello di reversibilità è possibile prima e dopo la conferma umana?
9. Quale feedback deve vedere il docente su successo, errore, conflitto e stato incerto?
10. Quali requisiti di accessibilità devono applicarsi al confronto delta e alla revisione massiva?

## 18. Invarianti candidate

1. Il file Argo non è la source of truth della didattica dell'ecosistema.
2. Nessuna modifica locale deve richiedere una reimportazione completa se il delta è determinabile.
3. Una sincronizzazione identica deve essere idempotente.
4. Nessuna baseline viene promossa senza conferma umana dell'avvenuta importazione.
5. I conflitti non vengono risolti automaticamente.
6. Arena conserva l'autorità curricolare.
7. Atlas conserva il proprio perimetro di pubblicazione/materiali.
8. Docente OS resta l'ambiente operativo teacher-first.
9. Nessuna capability differita, incluso DOS-A1, viene attivata implicitamente.
10. Nessuna automazione scrive direttamente su Argo in questa fase.

## 19. Privacy, accessibilità e inclusione

### Privacy/data minimization

Il primo perimetro è il **Programma Scolastico**. Non richiede dati personali degli studenti. Qualunque estensione futura a dati riferiti ad alunni deve riaprire la valutazione dal gate appropriato.

### Accessibilità

La capability comporta una futura interfaccia di confronto e revisione. A G3/G4 dovranno essere specificati almeno:

- navigazione completa da tastiera;
- differenze non comunicate dal solo colore;
- annunci comprensibili degli stati;
- gestione accessibile di tabelle/diff;
- feedback percettibile per ogni write o conferma.

### Età/inclusione

La capability è uno strumento per il docente e non una superficie destinata direttamente a minori. I requisiti child-facing sono quindi **NOT_APPLICABLE nel perimetro G1 corrente**, salvo futuri cambi di scope.

## 20. ADR classification

La capability tocca:

- persistenza di baseline;
- identità e lineage;
- confine Docente OS ↔ sistema istituzionale esterno;
- contratto di esportazione;
- human confirmation;
- gestione dei conflitti.

Pertanto a G2 deve essere valutata formalmente come **ADR-required** prima di qualsiasi implementazione runtime.

## 21. Non-obiettivi iniziali / negative knowledge candidata

- automazione browser di Argo;
- uso di credenziali Argo da parte del sistema;
- scrittura diretta su Argo;
- scraping del registro;
- sincronizzazione bidirezionale non governata;
- sostituzione del registro elettronico;
- auto-approvazione o auto-promozione delle baseline;
- uso dell'XLS Argo come fonte primaria editabile.

Questi punti restano candidati a `REJECTED` o `DEFERRED` a G2; non vengono cancellati dalla memoria progettuale.

## 22. Primo slice di discovery

La discovery va ora separata in due filoni:

### Filone A — comportamento nativo documentato
1. formalizzare il mapping modulo/argomento;
2. formalizzare la distinzione planned/performed;
3. definire la regola `REMOVED → CONFLICT` quando l'argomento risulta valutato o non cancellabile;
4. modellare il riuso nativo Argo come strategia preferenziale.

### Filone B — formato XLS non documentato

Completato in G1:

1. [x] acquisizione di un XLS reale esportato da Argo;
2. [x] ispezione read-only del contenitore e dello schema visibile;
3. [x] mapping semantico iniziale verso il modello canonico;
4. [x] definizione di un profilo XLS candidato vincolato al campione.

Ancora necessario prima di chiudere G1:

5. [ ] secondo export più ricco per verificare la variabilità del formato;
6. [ ] evidenza di valori reali per ordine, stato svolgimento e data svolgimento;
7. [ ] round-trip non modificato, se operativamente sicuro;
8. [ ] comportamento su duplicati/aggiornamenti/import parziale;
9. [ ] conferma o revisione del profilo `ARGO_PROGRAM_XLS_PROFILE_v1`.

Solo dopo G1: classificazione ADR a G2 e specifica normativa a G3.

## 23. Criterio di successo

La capability è valida quando una modifica limitata della didattica richiede al docente di verificare soltanto le variazioni effettive, senza ricostruire o ricontrollare l'intero programma, mantenendo piena tracciabilità, reversibilità e controllo umano.

## 24. Gate review G0/G1

### G0 — Intake

- [x] stable capability ID assigned;
- [x] problem/opportunity stated without prescribing implementation;
- [x] intended users/actors identified;
- [x] expected value stated;
- [x] initial scope and explicit non-goals recorded;
- [x] known product/ecosystem touchpoints listed;
- [x] runtime state declared `NOT_AUTHORIZED`;
- [x] next discovery action identified.

**G0 assessment:** COMPLETE / ready for governed review.

### G1 — Discovery

- [x] initial evidence source recorded;
- [x] user/context assumptions recorded;
- [x] candidate alternatives compared;
- [x] risks and uncertainties recorded;
- [x] open questions explicit;
- [x] candidate negative knowledge retained;
- [x] privacy/data-minimization impact considered;
- [x] accessibility implications identified;
- [x] child-facing applicability explicitly classified;
- [x] discovery conclusions separated from approved decisions;
- [x] real Argo XLS sample inspected;
- [ ] format variability tested;
- [x] initial mapping feasibility demonstrated;
- [ ] reviewable evidence package complete.

**G1 assessment:** IN_PROGRESS / BLOCKED ONLY BY FORMAT VARIABILITY AND ROUND-TRIP/IMPORT SEMANTICS. G2 is not authorized yet.

## 25. Stato decisionale

Questo documento consolida l'analisi come **capability proposal G0/G1**.

Non autorizza runtime, persistenza, automazione di Argo, nuove write authority o merge automatici.


## 26. Artefatti di discovery collegati

- `research-evidence-register.md` — evidenze, assunzioni, lacune e negative knowledge;
- `canonical-didactic-model-candidate-v1.md` — modello canonico candidato, separato dai formati XLS/XLSX/CSV;
- `delta-contract-candidate-v1.md` — contratto candidato per confronto incrementale, idempotenza, conflitti e baseline advancement;
- `g1-delta-test-matrix-v1.md` — matrice di 35 casi G1 per delta, idempotenza, duplicati, rimozioni, lineage e baseline;
- `g1-reference-oracle-v1.md` — oracolo deterministico indipendente dall’implementazione;
- `fixtures/g1-delta-reference-cases-v1.json` — fixture di riferimento macchina-leggibili per i casi core.

Questi artefatti restano **G1 candidate** e non autorizzano persistenza o runtime.


## 27. Evidenza XLS reale

È stato ispezionato in sola lettura un export reale didUP:

- `evidence/argo-xls-sample-001.md` — evidenza binaria e semantica del campione reale;
- `argo-program-xls-profile-candidate-v0.1.md` — profilo XLS candidato, vincolato al campione.

Risultati principali:
- il file è **BIFF8/CDFV2 .XLS**, non XLSX;
- contiene un solo foglio visibile `Dati`;
- schema osservato a 6 colonne: `ORD. MODULO`, `MODULO`, `ORD. ARGOMENTO`, `ARGOMENTO`, `STATO SVOLGIMENTO`, `DATA SVOLGIMENTO`;
- il mapping semantico al modello canonico è diretto;
- la compatibilità di un XLS ricostruito non è ancora provata.

G1 chiude ora l'evidenza "real sample inspected" e "initial mapping feasibility", ma resta aperto per variabilità formato e round-trip/import semantics.
