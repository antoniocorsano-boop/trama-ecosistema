# TRAMA Runtime Adapter Contract v0

**Stato:** PROPOSED / OR-03 OUTPUT  
**Data:** 2026-09-30  
**Dipendenze:**  
- `docs/contracts/trama-runtime-generation-contract-v0.md`  
- `docs/contracts/trama-local-connector-contract-v0.md`  
**Perimetro:** Harness Pilot · Runtime Adapter · Local Connector  
**Authority:** nessuna nuova autorità di scrittura  
**DOS-A1:** `RUNTIME_DEFERRED`

## 1. Obiettivo

Definire il contratto che trasforma l'Harness Pilot da esecutore sperimentale a **candidato Runtime Adapter TRAMA**, mantenendolo dietro:
- `RuntimeGeneration`;
- `Local Connector`;
- capability esplicite;
- observation/evidence normalizzate;
- unsupported operations dichiarate.

L'adapter non diventa la piattaforma centrale e non decide authority.

## 2. Posizione architetturale

```text
Control Center READ_ONLY
        |
        v
Local Connector
        |
        v
Runtime Adapter
        |
        v
RuntimeGeneration
        |
        v
Native runtime / Harness execution surface
```

Il Runtime Adapter converte una superficie runtime specifica in un contratto stabile TRAMA.

## 3. Identità adapter

```ts
interface RuntimeAdapterDescriptor {
  adapterId: string
  adapterVersion: string
  runtimeType: string
  implementationType: string
  lifecycleContractVersion: string
  connectorContractVersion: string
  capabilities: RuntimeAdapterCapability[]
}
```

Invarianti:
- `adapterId` è stabile per l'implementazione;
- `runtimeType` identifica il provider;
- versione adapter e versione runtime nativo sono distinte;
- un adapter non può presentarsi come un altro runtimeType.

## 4. Lifecycle

Interfaccia minima:

```ts
interface RuntimeAdapter {
  describe(): Promise<RuntimeAdapterDescriptor>
  discoverProfiles(): Promise<RuntimeProfileRef[]>
  createGeneration(input: CreateRuntimeGenerationInput): Promise<RuntimeGeneration>
  observe(ref: RuntimeRef): Promise<RuntimeAdapterObservation>
  health(ref: RuntimeRef): Promise<RuntimeHealthObservation>
  evidence(ref: RuntimeRef): Promise<RuntimeEvidenceIndex>
}
```

Nel perimetro OR-03 non sono esposti metodi mutativi verso il Control Center.

## 5. Mapping Harness Pilot

Baseline del Pilot da preservare:
- esecuzione single-shot;
- snapshot read-only;
- `maxRetries = 0`;
- consumo marcato su disco;
- test zero-network;
- nessuna approvazione automatica;
- gate qualificati prima della misura;
- evidenze di regressione e failure-mode;
- runtime reale ancora non promosso come surface operativa TRAMA.

Questi elementi diventano **constraint dell'adapter**, non comportamento della piattaforma intera.

## 6. Adapter state

```ts
type RuntimeAdapterState =
  | 'UNAVAILABLE'
  | 'DISCOVERED'
  | 'READY'
  | 'QUALIFIED'
  | 'DEGRADED'
  | 'FAILED'
  | 'DEFERRED'
```

Regole:
- `QUALIFIED` richiede evidence ref esplicita;
- `READY` non implica `QUALIFIED`;
- `AVAILABLE` non implica `AUTHORIZED`;
- `DEFERRED` è uno stato valido e non equivale a failure.

## 7. Capability model

Capability minime:

```text
adapter.describe
adapter.profile.discover
adapter.observe
adapter.health
adapter.evidence.read
adapter.generation.create     // internal only
adapter.generation.release    // internal only
adapter.runtime.execute       // supported maybe, unauthorized
adapter.runtime.cancel        // supported maybe, unauthorized
adapter.runtime.configure     // unauthorized
adapter.runtime.install       // unauthorized
adapter.runtime.approve       // unsupported
```

Ogni capability espone:

```ts
interface RuntimeAdapterCapability {
  key: string
  supported: boolean
  available: boolean
  authorized: boolean
  reason?: string
}
```

Per OR-03, tutte le capability mutative verso l'esterno sono `authorized=false`.

## 8. Profile abstraction

```ts
interface RuntimeProfileRef {
  profileId: string
  displayName?: string
  source: 'canonical' | 'configured' | 'detected'
  readOnly: boolean
}
```

L'adapter:
- deve usare una fonte canonica;
- non deve inferire identità da cwd o convenzioni implicite;
- discovery non modifica profili;
- switching resta non esposto.

Per il Pilot attuale può esistere un solo profilo canonico.

## 9. Generation creation

```ts
interface CreateRuntimeGenerationInput {
  runtimeType: string
  runtimeId: string
  profile: RuntimeProfileRef
  mode: 'READ_ONLY_PROBE' | 'QUALIFIED_MEASUREMENT'
  requestId: string
}
```

Per il perimetro attuale:
- `READ_ONLY_PROBE` è consentito concettualmente;
- `QUALIFIED_MEASUREMENT` richiede gate qualificati;
- modalità mutative non esistono.

## 10. Harness adapter constraints

### RA-H1 — Single-shot
Una generazione del Pilot esegue al massimo un run qualificato.

### RA-H2 — No retry
`maxRetries=0` resta default vincolante finché un contratto successivo non autorizza diversamente.

### RA-H3 — Read-only input
La sorgente osservata è snapshot/read-only.

### RA-H4 — Consumption marker
Il consumo di una prova/run deve poter essere marcato in modo persistente e verificabile.

### RA-H5 — Zero-network test mode
La suite di qualifica deve mantenere una modalità senza rete.

### RA-H6 — Explicit evidence
Ogni run qualificato deve produrre riferimenti a evidenze.

### RA-H7 — No implicit model substitution
Il runtime/model identity deve essere esplicito; fallback silenziosi non sono ammessi.

### RA-H8 — No auto-approval
Un risultato tecnico non genera approvazione umana o authority.

## 11. Runtime identity

```ts
interface NativeRuntimeIdentity {
  runtimeType: string
  runtimeVersion?: string
  modelProvider?: string
  modelId?: string
  executionSurface?: string
}
```

Se model/runtime identity non è verificabile:
- health può restare READY/DEGRADED secondo i check;
- qualification deve essere `NOT_VERIFIABLE` o `DEFERRED`;
- nessun dato misurato deve essere attribuito a un modello non verificato.

## 12. Run identity

```ts
interface RuntimeRunIdentity {
  requestId: string
  generationId: string
  runId: string
  runtimeId: string
  profileId: string
}
```

Una run identity non sostituisce la generation identity.

Relazione:
```text
Runtime instance
  -> RuntimeGeneration
      -> single Pilot Run
```

## 13. Observation

```ts
interface RuntimeAdapterObservation {
  descriptor: RuntimeAdapterDescriptor
  runtime: RuntimeRef
  adapterState: RuntimeAdapterState
  generation?: RuntimeGenerationObservation
  nativeRuntime?: NativeRuntimeIdentity
  observedAt: string
  source: 'live' | 'persisted'
  stale: boolean
  evidenceRefs: string[]
}
```

## 14. Evidence envelope

```ts
interface RuntimeEvidenceEnvelope {
  evidenceId: string
  requestId: string
  generationId: string
  runId?: string
  runtimeType: string
  runtimeId: string
  adapterId: string
  adapterVersion: string
  createdAt: string
  evidenceType: string
  digest?: string
  refs: string[]
}
```

Requisiti:
- correlazione completa run/generation/adapter;
- provenance esplicita;
- digest quando disponibile;
- nessuna semantica di approval incorporata.

## 15. Health checks

Set minimo candidato:

```text
adapter.loaded
profile.canonical
runtime.identity
generation.cleanup
subprocess.ownership
network.policy
retry.policy
snapshot.readonly
consumption.marker
evidence.complete
```

Ogni check produce PASS / WARN / FAIL / NOT_VERIFIABLE.

## 16. Unsupported operations

OR-03 richiede che l'adapter dichiari esplicitamente come non supportate o non autorizzate:

- runtime install/uninstall;
- plugin install/update/remove;
- profile mutation;
- model credential mutation;
- arbitrary filesystem writes;
- remote takeover;
- unattended approval;
- Human Review bypass;
- automatic retry;
- automatic rollback mutativo;
- runtime control dal Control Center.

Nessuna operazione unsupported può essere simulata come successo.

## 17. Cancellation semantics

L'adapter distingue:
- richiesta di cancel;
- runtime termination;
- generation release;
- evidence finalization.

Sequenza:

```text
cancel requested
-> child/process termination requested
-> process tree settled
-> evidence finalized
-> generation.release()
```

Cancel non equivale a release.

## 18. Error model

```ts
interface RuntimeAdapterError {
  code: string
  message: string
  phase:
    | 'DISCOVERY'
    | 'STARTUP'
    | 'EXECUTION'
    | 'CANCELLATION'
    | 'RELEASE'
    | 'EVIDENCE'
  retryable: boolean
  evidenceRefs?: string[]
}
```

Per il Pilot:
- retryable può essere `true` come proprietà informativa;
- l'adapter non deve effettuare retry automatico se `maxRetries=0`.

## 19. Qualification states

```text
NOT_ASSESSED
-> TEST_HARNESS_QUALIFIED
-> RUNTIME_IDENTITY_VERIFIED
-> MEASUREMENT_QUALIFIED
```

Un fallimento può produrre:
- `TEST_HARNESS_NOT_QUALIFIED`;
- `RUNTIME_IDENTITY_NOT_VERIFIABLE`;
- `MEASUREMENT_NOT_QUALIFIED`.

L'assenza di misure reali non va convertita in stima qualificata.

## 20. Mapping P0 -> Runtime Adapter

| Pilot P0 | Runtime Adapter |
|---|---|
| single-shot | one run per generation |
| frozen/read-only snapshot | READ_ONLY_PROBE input |
| maxRetries 0 | retry policy invariant |
| disk consumption marker | evidence/consumption state |
| zero-network tests | network policy qualification |
| dry-run | adapter qualification mode |
| E2E qualification | adapter/generation gate |
| model execution | native runtime execution surface |
| measurement run | QUALIFIED_MEASUREMENT |
| findings | evidence envelope |

## 21. Gaps chiusi da OR-03

**G1 Generation identity**  
Chiuso a livello contrattuale: generationId distinto da runId.

**G2 Unified release**  
Chiuso a livello contrattuale tramite RuntimeGeneration.

**G3 Process-tree ownership**  
Chiuso come requisito di qualifica, non ancora come implementazione.

**G4 Profile abstraction**  
Chiuso a livello contrattuale con RuntimeProfileRef.

**G5 Cancellation semantics**  
Chiuso a livello contrattuale.

**G6 Recovery**  
Non gap attuale: DEFER esplicito.

**G7 Control Center observation**  
Interface disponibile; rendering resta OR-04.

## 22. Qualification gate per implementazione adapter

Prima di considerare un adapter `QUALIFIED`:
1. descriptor deterministico;
2. profile discovery read-only;
3. runtime identity esplicita;
4. generation identity distinta da run identity;
5. release idempotente;
6. cleanup dopo startup parziale;
7. process tree settlement verificato;
8. zero auto-retry;
9. zero-network test mode PASS;
10. consumption marker persistente;
11. evidence envelope completo;
12. unsupported operations negative-tested;
13. mutation capability unauthorized;
14. no authority promotion;
15. repeated run blocked o governato dal marker secondo policy.

## 23. Backlog closure / DEFER register

OR-03 non lascia backlog analitico implicito.

**DEFER-03-A — DSH concrete adapter implementation**  
Differita alla prima slice implementativa.

**DEFER-03-B — Codex portability adapter**  
Differita finché il contratto DSH non è verificato in implementazione.

**DEFER-03-C — model/provider credentials**  
Fuori dal contratto adapter read-only.

**DEFER-03-D — retries > 0**  
Non autorizzati.

**DEFER-03-E — runtime recovery mutation**  
Dipende da authority contract futuro.

**DEFER-03-F — measurement KPI target validation**  
Richiede esecuzione reale qualificata; nessuna stima viene promossa.

Non esistono altre domande necessarie per OR-04.

## 24. Decisione operativa

**OR-03: PASS documentale.**

Il livello di astrazione runtime è ora completo:
1. RuntimeGeneration;
2. Local Connector;
3. Runtime Adapter.

Il Pilot può essere evoluto in adapter senza diventare il centro architetturale.

Il prossimo passo è **OR-04 — Control Center Observation Integration**, limitato alla rappresentazione read-only di dati mock/contract-compliant, senza controllo operativo.
