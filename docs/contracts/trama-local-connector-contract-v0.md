# TRAMA Local Connector Contract v0

**Stato:** PROPOSED / OR-02 OUTPUT  
**Data:** 2026-09-30  
**Origine concettuale:** Agents Anywhere contracts/connector @ `ea27e0b45701c59ba93695617d901433ba8f68b0` — REFERENCE_ONLY salvo `dsh-bridge/` MIT  
**Dipendenza:** `docs/contracts/trama-runtime-generation-contract-v0.md`  
**Perimetro:** Control Center · Local Connector · Runtime Adapter  
**Authority:** nessuna nuova autorità di scrittura  
**DOS-A1:** `RUNTIME_DEFERRED`

## 1. Obiettivo

Definire il confine trasporto-indipendente tra il Control Center e uno o più runtime locali, mantenendo:
- osservazione read-only come superficie attiva;
- identità stabili;
- capability esplicite;
- errori indipendenti e ritentabili;
- mutazioni rigorosamente separate e disabilitate nel perimetro corrente.

Il contratto NON copia il codice o gli schemi non licenziati di Agents Anywhere: ne reimplementa i pattern concettuali compatibili con TRAMA.

## 2. Modello

```text
Control Center READ_ONLY
        |
        v
TRAMA Local Connector
        |
        +--> Runtime Adapter A --> RuntimeGeneration
        |
        +--> Runtime Adapter B --> RuntimeGeneration
```

Il Connector:
- conosce i runtime disponibili;
- espone stato e capability;
- produce osservazioni normalizzate;
- non decide authority;
- non promuove maturità;
- non esegue mutazioni nel profilo corrente.

## 3. Identità

Separare sempre tipo e istanza:

```ts
interface RuntimeRef {
  runtimeType: string       // es. dsh, codex
  runtimeId: string         // identità immutabile dell'istanza
  name?: string             // etichetta modificabile, non identity
}
```

Regole:
- `runtimeType` è immutabile per la vita dell'istanza;
- `runtimeId` è immutabile;
- `name` non può essere usato come chiave tecnica;
- ogni osservazione e ogni futura richiesta deve includere entrambe le identità;
- il Connector deve rifiutare mismatch tra runtimeId e runtimeType conosciuti.

## 4. Discovery

La discovery è read-only e restituisce descrittori di provider:

```ts
interface RuntimeTypeDescriptor {
  runtimeType: string
  available: boolean
  reason?: string
  implementationType?: string
  instancePolicy: 'single' | 'multiple'
  maxInstances?: number | null
  capabilities: Record<string, boolean>
  configRevision?: number
}
```

Invarianti:
- discovery non avvia runtime;
- discovery non cambia configurazioni;
- discovery non abilita implicitamente capability;
- `available=false` richiede una ragione;
- fallimento della discovery non invalida automaticamente osservazioni persistite precedenti.

## 5. Capability declaration

Le capability sono dichiarative e separate dall'autorità.

Capability iniziali TRAMA:

```text
runtime.observe
runtime.health
runtime.sessions.read
runtime.evidence.read
runtime.start        // declared but disabled
runtime.stop         // declared but disabled
runtime.cancel       // declared but disabled
runtime.configure    // declared but disabled
runtime.mutate       // declared but disabled
```

Regola:
`supported=true` NON significa `authorized=true`.

Il Connector deve poter rappresentare almeno:
- supportata/non supportata;
- disponibile/non disponibile;
- autorizzata/non autorizzata.

## 6. Observation surface attiva

OR-02 abilita solo metodi read-only:

```ts
interface LocalConnectorReadApi {
  discover(): Promise<RuntimeTypeDescriptor[]>
  listInstances(): Promise<RuntimeInstanceObservation[]>
  getInstance(ref: RuntimeRef): Promise<RuntimeInstanceObservation>
  getHealth(ref: RuntimeRef): Promise<RuntimeHealthObservation>
  getGeneration(ref: RuntimeRef): Promise<RuntimeGenerationObservation | null>
  getEvidence(ref: RuntimeRef): Promise<RuntimeEvidenceIndex>
}
```

## 7. RuntimeInstanceObservation

```ts
interface RuntimeInstanceObservation {
  runtimeType: string
  runtimeId: string
  name?: string
  implementationType?: string
  availability: 'AVAILABLE' | 'UNAVAILABLE' | 'UNKNOWN'
  lifecycle: 'STOPPED' | 'STARTING' | 'READY' | 'RUNNING' | 'STOPPING' | 'ERROR' | 'UNKNOWN'
  generationId?: string
  desiredActive?: boolean
  health: 'UNKNOWN' | 'READY' | 'DEGRADED' | 'FAILED'
  capabilities: RuntimeCapabilityState[]
  observedAt: string
  evidenceRefs: string[]
}
```

## 8. Capability state

```ts
interface RuntimeCapabilityState {
  key: string
  supported: boolean
  available: boolean
  authorized: boolean
  reason?: string
}
```

Per OR-02:
- tutte le capability mutative hanno `authorized=false`;
- `runtime.observe`, `runtime.health`, `runtime.evidence.read` possono essere autorizzate se il runtime adapter è qualificato.

## 9. Health

Health è osservazione, non giudizio di authority.

```ts
interface RuntimeHealthObservation {
  runtimeType: string
  runtimeId: string
  status: 'UNKNOWN' | 'READY' | 'DEGRADED' | 'FAILED'
  checkedAt: string
  checks: {
    key: string
    status: 'PASS' | 'WARN' | 'FAIL' | 'NOT_VERIFIABLE'
    detail?: string
  }[]
}
```

Il Control Center può renderizzare health ma non tradurlo automaticamente in maturità o approvazione.

## 10. Evidence

```ts
interface RuntimeEvidenceIndex {
  runtimeType: string
  runtimeId: string
  generationId?: string
  evidenceRefs: string[]
  observedAt: string
}
```

Ogni evidence ref deve essere:
- immutabile o content-addressed quando possibile;
- collegabile alla generazione che l'ha prodotta;
- privo di authority implicita.

## 11. Failure isolation

Pattern adottato:
- un errore di una richiesta non invalida l'intero Connector;
- un provider indisponibile non invalida gli altri provider;
- discovery fallita non impedisce letture da stato persistito, se chiaramente marcato come stale;
- richieste future possono ritentare.

Error contract minimo:

```ts
interface ConnectorError {
  code: string
  message: string
  retryable: boolean
  runtimeType?: string
  runtimeId?: string
  detail?: Record<string, unknown>
}
```

## 12. Freshness e stato persistito

Una osservazione deve dichiarare:
- `observedAt`;
- provenienza;
- se è live o persisted;
- eventuale `stale=true`.

Non è ammesso presentare stato persistito come live.

## 13. Local ownership

Il Connector deve avere una sola istanza proprietaria delle risorse locali per utente/macchina per il medesimo scope operativo.

OR-02 adotta il principio di:
- identity d'istanza;
- PID/process-start verification;
- nessun affidamento a sola età del file;
- record stale distinguibile da processo vivo;
- nessun token o segreto nei record condivisi di ownership.

Implementazione e path concreti restano DEFERRED a OR-03/implementation.

## 14. Transport neutrality

Il contratto non prescrive:
- HTTP;
- WebSocket;
- JSON-RPC;
- stdio;
- named pipe.

Il trasporto è un adapter separato.

Requisiti indipendenti dal trasporto:
- request identity;
- runtime scope esplicito;
- errori strutturati;
- timeout;
- cancellation futura;
- provenance;
- autenticazione/authorization separata.

## 15. Explicit mutation boundary

Metodi mutativi futuri:

```text
runtime.validateConfig
runtime.start
runtime.stop
runtime.cancel
runtime.configure
runtime.install
runtime.approve
```

Sono **NON ATTIVI** in OR-02.

Qualunque futura attivazione richiede:
1. authority contract dedicato;
2. Human Review;
3. receipt/evidence identity;
4. idempotenza;
5. rollback/recovery quando applicabile;
6. audit trail;
7. test di negative authorization.

## 16. Mapping Agents Anywhere -> TRAMA

| Pattern AA | TRAMA | Esito |
|---|---|---|
| provider type vs runtime instance | runtimeType + runtimeId | **ADOPT concept** |
| immutable instance identity | immutable RuntimeRef | **ADOPT concept** |
| runtime.discover | discover() read-only | **ADAPT** |
| capability map | RuntimeCapabilityState | **ADAPT** |
| independent request failures | failure isolation | **ADOPT concept** |
| persisted snapshot when provider unavailable | live/persisted + stale marker | **ADAPT** |
| single/multiple instance policy | instancePolicy | **ADOPT concept** |
| local startup ownership | connector ownership principle | **REFERENCE/ADAPT** |
| server-driven local mutations | explicit mutation boundary | **REJECT now / DEFER** |
| shared connector credentials | outside OR-02 | **DEFER** |
| remote pairing/account flows | outside TRAMA core | **REJECT for core now** |

## 17. Mapping OR-01 -> OR-02

| OR-01 RuntimeGeneration | OR-02 Connector |
|---|---|
| generationId | generationId in observations |
| RuntimeProfileRef | instance/config metadata |
| observe() | getGeneration()/getInstance() |
| health | getHealth() |
| evidenceRefs | getEvidence() |
| cancel/release | hidden behind mutation boundary |
| profile switching | not exposed in active API |

## 18. Qualification gates

Prima di una implementazione:
1. discovery is read-only;
2. runtimeType/runtimeId mismatch rejected;
3. one provider failure does not break other providers;
4. stale persisted state marked explicitly;
5. all mutation capabilities unauthorized by default;
6. unknown capability keys do not enable behavior;
7. health cannot promote maturity automatically;
8. no secrets in shared ownership observation;
9. deterministic serialization of observations;
10. Control Center can consume mock observations without runtime activation.

## 19. Backlog closure / DEFER register

OR-02 non lascia analisi aperte implicite.

**DEFER-02-A — Transport selection**  
Decisione differita perché prematura. Nessun impatto sul contratto.

**DEFER-02-B — Authentication/pairing**  
Differita: non necessaria al proof read-only locale.

**DEFER-02-C — Concrete machine-state file format**  
Differita all'implementazione del Local Connector.

**DEFER-02-D — Multi-user/multi-host remote control**  
Fuori perimetro attuale.

**DEFER-02-E — Runtime mutation API**  
Bloccata da DOS-A1 RUNTIME_DEFERRED e authority non definita.

Non esistono altre domande aperte necessarie per procedere a OR-03.

## 20. Decisione operativa

**OR-02: PASS documentale.**

È definito un confine read-only sufficiente per:
- scoprire runtime;
- osservare istanze;
- rappresentare health;
- collegare evidence;
- mantenere le mutazioni disabilitate.

Il prossimo passo è **OR-03 — Runtime Adapter Contract**, che deve trasformare l'Harness Pilot in un adapter candidato dietro questi due contratti, senza ancora avviare un runtime reale.
