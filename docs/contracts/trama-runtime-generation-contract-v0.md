# TRAMA Runtime Generation Contract v0

**Stato:** PROPOSED / OR-01 OUTPUT  
**Data:** 2026-09-30  
**Origine di riuso:** `anywhere-labs/dsh-desktop@85b79816c6ac0ae07df51d138da67d7c7baf7167` — MIT  
**Perimetro:** Harness Pilot · futuro Local Connector · Runtime Adapter  
**Authority:** nessuna nuova autorità di scrittura  
**DOS-A1:** `RUNTIME_DEFERRED`

## 1. Obiettivo

Definire il minimo contratto di lifecycle che un runtime adapter TRAMA deve rispettare per essere avviato, osservato, arrestato e sostituito senza lasciare stato operativo residuo.

Il contratto adatta i pattern verificati in DSH Desktop senza importare Electron, BrowserWindow, tray o dettagli di presentazione.

## 2. Principio centrale: una generazione possiede tutto ciò che crea

Una **RuntimeGeneration** rappresenta un'istanza completa e delimitata del runtime adapter.

Ogni generazione DEVE possedere esclusivamente:
- processi e sottoprocessi creati durante il proprio lifecycle;
- listener, timer, stream e handle aperti dalla generazione;
- riferimenti a profilo/configurazione risolti per quella generazione;
- capability temporanee e token locali generati per quella generazione;
- evidenze operative prodotte durante la generazione.

Nessun handle vivo DEVE essere riutilizzato dalla generazione successiva.

## 3. Interfaccia minima

```ts
interface RuntimeGeneration {
  readonly id: string
  readonly profile: RuntimeProfileRef
  readonly state: RuntimeGenerationState

  start(): Promise<RuntimeGenerationStartResult>
  observe(): Promise<RuntimeGenerationObservation>
  cancel(reason: RuntimeCancellationReason): Promise<void>
  release(): Promise<void>
}
```

`release()` DEVE essere:
- idempotente;
- utilizzabile sia dopo startup completo sia dopo startup parziale;
- l'unico percorso autorizzato per liberare le risorse possedute dalla generazione;
- completato solo dopo la chiusura/settlement delle risorse lifecycle-owned.

## 4. Stati

```text
CREATED
  -> STARTING
  -> READY
  -> RUNNING
  -> STOPPING
  -> RELEASED

STARTING -> FAILED -> RELEASING -> RELEASED
READY    -> FAILED -> RELEASING -> RELEASED
RUNNING  -> FAILED -> RELEASING -> RELEASED
```

Stati terminali:
- `RELEASED`
- `FAILED_RELEASED` solo se il cleanup produce un errore registrato ma nessuna risorsa resta intenzionalmente attiva.

Una generazione non può tornare da `RELEASED` a uno stato attivo.

## 5. Startup atomico rispetto alla generazione

`start()` DEVE:
1. risolvere il profilo/configurazione senza mutarlo per semplice discovery;
2. creare le risorse sotto ownership della nuova generazione;
3. registrare i servizi/capability necessari;
4. avviare il runtime;
5. verificare un criterio minimo di readiness;
6. produrre l'osservazione iniziale;
7. diventare `READY` solo dopo il completamento dei gate minimi.

Se qualsiasi passo fallisce, lo stesso `release()` usato nello shutdown normale DEVE liberare anche le risorse parzialmente create.

## 6. Confine tra discovery e selection

Il profilo attivo DEVE essere ottenuto da una fonte canonica del runtime adapter.

È vietato inferire il profilo da:
- argomenti non canonici;
- URL;
- variabili accidentali di processo;
- directory convenzionali non contrattuali.

Operazioni equivalenti a `list()` DEVONO essere read-only.

Una futura operazione equivalente a `select()`:
- deve registrare una destinazione pending;
- non deve riscrivere implicitamente il profilo durante la discovery;
- deve completarsi attraverso una nuova generazione;
- resta fuori dal perimetro operativo attuale perché DOS-A1 è deferred.

## 7. Boundary di sostituzione

La sostituzione di profilo, modalità o adapter DEVE seguire:

```text
current.cancel()
-> current.release()
-> verify no live owned resource
-> create next generation
-> next.start()
```

Non è ammesso:
- avviare la nuova generazione mentre la precedente possiede ancora processi;
- mantenere riferimenti a servizi della generazione precedente;
- riutilizzare stream, listener, timer o token della generazione precedente.

## 8. Subprocess ownership

Ogni operazione che avvia un processo DEVE restituire un handle lifecycle-owned equivalente a:

```ts
interface RuntimeProcessHandle {
  readonly stdout: ReadableStreamLike
  readonly stderr: ReadableStreamLike
  readonly done: Promise<RuntimeProcessOutcome>
  cancel(reason?: string): void
}

interface RuntimeProcessOutcome {
  exitCode: number | null
  signal: string | null
}
```

Regole:
- gli argomenti devono essere passati come argv strutturato, non come stringa shell concatenata;
- stdout e stderr devono essere drenati o consumati;
- ogni chiamante deve applicare una deadline esplicita quando l'operazione non è naturalmente bounded;
- il successo richiede sia exit code accettabile sia assenza di segnale inatteso;
- `release()` deve cancellare e poi attendere `done`;
- il settlement deve rappresentare l'intero albero dei processi, non soltanto il processo padre.

## 9. Cancellation

La cancellazione è una richiesta di terminazione, non prova di cleanup.

`cancel()`:
- può essere chiamato durante STARTING/READY/RUNNING;
- deve essere idempotente;
- deve propagarsi a tutte le operazioni lifecycle-owned;
- non sostituisce `release()`.

Il completamento affidabile avviene solo dopo `release()`.

## 10. Recovery e last-known-good

Il modello DSH Desktop separa selezione pending e last-known-good. TRAMA adotta il principio ma non autorizza ancora mutazioni runtime.

Per una futura generazione mutativa:
- una nuova configurazione/profilo può essere `pending`;
- diventa `lastKnownGood` solo dopo readiness qualificata;
- fallimento di una configurazione pending può autorizzare un rollback deterministico al precedente last-known-good;
- il rollback non deve creare loop infiniti;
- la prova di recupero deve essere collegata a una receipt/evidence identity.

Nel perimetro attuale read-only, questa sezione resta **contract-ready / runtime-disabled**.

## 11. Recovery receipt per operazioni mutative future

Pattern riusato da DSH Desktop:
- persistere l'intento prima della mutazione;
- correlare operazione e recovery con un'unica identity;
- snapshot prima dell'operazione;
- seal dopo successo;
- restore dopo fallimento;
- settlement soltanto dopo seal/restore;
- riconciliazione receipt al riavvio.

TRAMA aggiunge:
- Human Review quando l'operazione attraversa un authority boundary;
- provenance dell'azione;
- digest/evidence ref;
- nessuna auto-approvazione.

Questa capacità non è attiva in OR-01.

## 12. Observation contract

Ogni generazione deve poter produrre almeno:

```ts
interface RuntimeGenerationObservation {
  generationId: string
  adapterId: string
  adapterVersion: string
  profileId: string
  lifecycleState: RuntimeGenerationState
  startedAt?: string
  readyAt?: string
  processCount: number
  health: 'UNKNOWN' | 'READY' | 'DEGRADED' | 'FAILED'
  capabilitySet: readonly string[]
  evidenceRefs: readonly string[]
}
```

L'osservazione:
- non crea authority;
- non promuove automaticamente uno stato;
- è adatta a essere resa nel Control Center come stato derivato/read-only.

## 13. Invarianti

**RG-01 — Single owner**  
Ogni risorsa viva appartiene a una sola generazione.

**RG-02 — No cross-generation caching**  
Nessun handle operativo può sopravvivere alla propria generazione.

**RG-03 — Idempotent release**  
Ripetere `release()` non crea effetti ulteriori.

**RG-04 — Partial-start cleanup**  
Startup fallito e shutdown normale usano lo stesso cleanup.

**RG-05 — Process-tree settlement**  
Una generazione non è rilasciata finché i processi owned non sono terminati/settled.

**RG-06 — Read-only discovery**  
Enumerare profili/capability non modifica il runtime.

**RG-07 — Canonical profile identity**  
Il profilo attivo proviene dal servizio canonico, non da inferenze.

**RG-08 — Explicit switching boundary**  
Ogni cambio profilo/modalità crea una nuova generazione.

**RG-09 — Evidence before promotion**  
Readiness/qualification richiedono evidenza; non sono dedotte dalla sola assenza di errore.

**RG-10 — Authority unchanged**  
Il lifecycle runtime non può promuovere o aggirare authority TRAMA.

## 14. Mapping DSH Desktop -> TRAMA

| DSH Desktop | TRAMA v0 | Azione |
|---|---|---|
| `ElectronShellGeneration` | `RuntimeGeneration` | **ADAPT** |
| `release()` idempotente | release unico e idempotente | **ADOPT concept / ADAPT code** |
| window/tray/listener ownership | process/listener/timer/stream ownership | **ADAPT** |
| `desktopProfiles.current` | canonical RuntimeProfileRef | **ADAPT** |
| profile `list()` read-only | discovery read-only | **ADOPT principle** |
| pending + lastKnownGood | future runtime profile recovery | **ADAPT / DEFER** |
| `DesktopPnpmHandle` | RuntimeProcessHandle | **ADAPT** |
| cancel + await done | cancel + settlement | **ADOPT principle** |
| process-tree ownership | whole-tree settlement | **ADOPT principle** |
| install snapshot/WAL/receipt | future mutative receipt contract | **REFERENCE/ADAPT later** |
| Electron/native shell | nessun equivalente richiesto | **REJECT for core** |

## 15. Gap list rispetto all'Harness Pilot

### G1 — Generation identity
Il pilota single-shot ha run identity/evidence, ma non ancora una esplicita `RuntimeGeneration` con ownership di tutte le risorse.

**Gap:** introdurre una identity di generazione distinta dalla sola richiesta/run.

### G2 — Unified release
I gate P0 qualificano cleanup e one-shot behavior, ma OR-01 richiede un'unica `release()` idempotente valida anche per startup parziale.

**Gap:** formalizzare e testare un solo disposer.

### G3 — Complete process-tree ownership
Il pilota ha vincoli forti di esecuzione e zero-network nei test, ma non è ancora qualificato come supervisor generale di process tree.

**Gap:** adapter process supervisor.

### G4 — Profile abstraction
Il pilota usa ambiente/configurazione fissati per la misura.

**Gap:** introdurre `RuntimeProfileRef` canonico e discovery read-only senza attivare switching.

### G5 — Cancellation semantics
Single-shot e `maxRetries=0` limitano la complessità, ma non sostituiscono un contratto cancellazione + settlement.

**Gap:** separare cancel request da release completion.

### G6 — Recovery
Il pilota evita mutazioni e quindi non necessita WAL/rollback.

**Gap:** nessuno per il perimetro attuale; capability deliberatamente deferred.

### G7 — Control Center observation
Le evidenze esistono, ma non sono ancora proiettate tramite un observation contract di generazione.

**Gap:** definire mapper read-only in OR-04, non ora.

## 16. Gate di qualifica per una futura implementazione

Una implementazione di RuntimeGeneration non può essere qualificata senza prove di:
1. doppio `release()` innocuo;
2. cleanup dopo errore a metà startup;
3. nessun processo residuo dopo release;
4. cancellazione durante processo attivo;
5. timeout con cleanup completo;
6. stderr/stdout non bloccanti;
7. switch simulato con zero handle cross-generation;
8. discovery profili read-only;
9. observation deterministica;
10. nessuna mutazione o authority promotion durante i test read-only.

## 17. Non-obiettivi di OR-01

OR-01 non:
- implementa il connector;
- attiva DSH come runtime TRAMA;
- abilita switching reale;
- introduce Electron;
- abilita installazioni/plugin mutation;
- aggiunge controllo remoto;
- modifica Control Center;
- modifica DOS-A1.

## 18. Decisione operativa

**OR-01: PASS documentale.**

Il modello DSH Desktop è sufficientemente stabile e compatibile per essere riusato come base del lifecycle TRAMA. Il prossimo passo è OR-02, che deve definire il Local Connector sopra questo lifecycle senza ancora implementare un runtime reale.
