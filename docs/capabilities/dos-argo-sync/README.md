# CAP-DOS-ARGO-SYNC — Sincronizzazione didattica incrementale verso Argo

**Lifecycle:** ACTIVE_DISCOVERY  
**Current gate:** G0 Intake / G1 Discovery  
**Owning product candidate:** Docente OS  
**Ecosystem impact:** TRAMA / Docente OS; Arena and Atlas boundaries to be assessed at G2  
**Runtime:** NOT_AUTHORIZED  
**Human decision required:** YES

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

## 2. Evidenza di partenza

Il manuale Argo didUP 4.54.0 (aggiornato al 07/09/2026), nella sezione **Programma Scolastico**:

- consente di importare moduli e argomenti da un'altra classe e anche da un anno scolastico precedente;
- consente l'importazione/esportazione tramite file XLS;
- raccomanda espressamente di non modificare il file XLS originale prodotto da didUP, per evitare blocchi in fase di importazione.

Questa evidenza porta a trattare il file Argo come **artefatto di interoperabilità**, non come fonte operativa primaria della didattica.

## 3. Ipotesi architetturale

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

## 4. Principio di sincronizzazione

La sincronizzazione deve essere **incrementale, idempotente, non distruttiva e human-confirmed**.

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

## 5. Identità persistente

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

## 6. Change Detection Engine

Il confronto avviene per entità persistente e non per posizione di cella.

Stati candidati del delta:

- `NEW`;
- `MODIFIED`;
- `UNCHANGED`;
- `REMOVED`;
- `MOVED`;
- `CONFLICT`.

Ogni entità può esporre un `contentHash` deterministico per riconoscere rapidamente gli elementi invariati.

Stesso file o stesso contenuto già acquisito deve produrre `NO_OP`.

## 7. Formati

### XLSX docente

Formato umano, modificabile e validabile, destinato al lavoro del docente e agli aggiornamenti massivi.

### CSV

Formato semplice di scambio e automazione. Non è il formato principale di lavoro umano.

### XLS Argo

Artefatto generato dall'adattatore Argo e trattato come **output controllato**. Non deve diventare il documento sorgente che il docente modifica ordinariamente.

## 8. Profilo Argo persistente

La mappatura richiesta da Argo deve essere configurata o appresa una sola volta e conservata come profilo versionato.

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

Una variazione del formato Argo produce una nuova versione del profilo senza alterare il modello didattico canonico.

## 9. Stati operativi candidati

```text
DRAFT
READY_FOR_ARGO
SYNC_CONFIRMED
```

- **DRAFT**: contenuto ancora in lavorazione;
- **READY_FOR_ARGO**: contenuto validato e predisponibile per l'esportazione;
- **SYNC_CONFIRMED**: l'utente ha confermato l'avvenuta importazione nel sistema istituzionale.

La sola generazione del file non autorizza il passaggio a `SYNC_CONFIRMED`.

## 10. Human control

Il docente deve poter esaminare esclusivamente le variazioni rilevate e, per ciascuna, scegliere almeno:

- accetta;
- mantieni precedente;
- modifica;
- escludi.

I conflitti devono essere fail-closed e non possono essere risolti implicitamente.

## 11. Sync Receipt

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

## 12. Riuso tra classi e anni

Il modello deve supportare:

- riuso da anno precedente;
- riuso tra classi parallele;
- derivazione da un programma master;
- override locali per singola classe;
- conservazione della lineage.

Il riuso non deve produrre duplicazioni non tracciabili.

## 13. Invarianti candidate

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

## 14. ADR classification

La capability tocca:

- persistenza di baseline;
- identità e lineage;
- confine Docente OS ↔ sistema istituzionale esterno;
- contratto di esportazione;
- human confirmation;
- gestione dei conflitti.

Pertanto a G2 deve essere valutata formalmente come **ADR-required** prima di qualsiasi implementazione runtime.

## 15. Non-obiettivi iniziali

- automazione browser di Argo;
- uso di credenziali Argo da parte del sistema;
- scrittura diretta su Argo;
- scraping del registro;
- sincronizzazione bidirezionale non governata;
- sostituzione del registro elettronico;
- auto-approvazione o auto-promozione delle baseline.

## 16. Primo slice candidato

Prima di qualunque runtime:

1. acquisire un XLS reale esportato da Argo;
2. descriverne struttura e vincoli senza modificarlo;
3. definire il Canonical Didactic Model v1;
4. definire il mapping canonico → Argo;
5. simulare due versioni successive della stessa didattica;
6. verificare che il motore produca solo il delta;
7. verificare idempotenza e gestione conflitti;
8. redigere ADR e specifica G2/G3;
9. sottoporre a Human Review.

## 17. Criterio di successo

La capability è valida quando una modifica limitata della didattica richiede al docente di verificare soltanto le variazioni effettive, senza ricostruire o ricontrollare l'intero programma, mantenendo piena tracciabilità, reversibilità e controllo umano.

## 18. Stato decisionale

Questo documento consolida l'analisi come **capability proposal G0/G1**.

Non autorizza runtime, persistenza, automazione di Argo, nuove write authority o merge automatici.
