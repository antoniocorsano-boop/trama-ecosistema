# TRAMA OR-09 — Qualified Execution Readiness Contract v0

**Stato:** PROPOSED / PRE-AUTHORIZATION ONLY  
**Data:** 2026-09-30  
**Perimetro:** Shared Capability Layer · Runtime Portability · governed execution readiness  
**Authority change:** NONE  
**DOS-A1:** RUNTIME_DEFERRED

## 1. Scopo

OR-09 definisce i prerequisiti che devono essere soddisfatti prima che TRAMA possa autorizzare una qualunque esecuzione runtime qualificata.

OR-09 v0 NON autorizza esecuzione live. Costruisce soltanto il pacchetto di readiness necessario a una futura Human Review.

## 2. Principio

Nessuna capacità passa da contract/offline proof a runtime execution per semplice continuità tecnica.

La transizione richiede:

```text
contract qualified
-> provider portability qualified
-> execution profile frozen
-> security/privacy gates PASS
-> failure/recovery gates PASS
-> exact-head evidence package
-> explicit Human Review
-> only then: runtime authorization
```

## 3. Execution profile

Ogni futura esecuzione autorizzabile DEVE dichiarare:

```ts
interface QualifiedExecutionProfile {
  executionProfileId: string
  capabilityId: string
  capabilityVersion: string
  adapterId: string
  adapterVersion: string
  providerType: string
  providerId: string
  runtimeProfileRef: string
  mode: 'READ_ONLY' | 'PROPOSE_ONLY' | 'MUTATIVE'
  networkPolicy: 'DENY' | 'ALLOWLIST'
  retryPolicy: {
    maxRetries: number
  }
  timeoutMs: number
  evidencePolicyRef: string
  authorityDecisionRef?: string
}
```

Per OR-09 v0:
- mode massimo: `PROPOSE_ONLY`;
- networkPolicy: `DENY`;
- maxRetries: `0`;
- nessuna mutazione;
- nessuna authorityDecisionRef attiva.

## 4. Readiness states

```text
NOT_READY
CONTRACT_READY
PORTABILITY_READY
EXECUTION_PROFILE_READY
AWAITING_HUMAN_AUTHORIZATION
AUTHORIZED_FOR_QUALIFIED_EXECUTION
```

OR-09 v0 può raggiungere al massimo:

`AWAITING_HUMAN_AUTHORIZATION`

e NON può produrre automaticamente lo stato successivo.

## 5. Mandatory gates

Prima di qualsiasi autorizzazione futura devono essere PASS:

1. capability contract qualification;
2. portability qualification con almeno due adapter;
3. exact execution profile;
4. zero implicit mutation audit;
5. no-secret leakage audit;
6. no personal student data audit;
7. deterministic evidence serialization;
8. cancellation/timeout semantics;
9. process/resource cleanup qualification;
10. provider identity and provenance;
11. stale/failure normalization;
12. Control Center READ_ONLY verification;
13. rollback/recovery policy when mutation will ever be considered;
14. Human exact-head review.

## 6. Authority gate

Qualunque passaggio a runtime live deve dichiarare esplicitamente:
- chi autorizza;
- cosa viene autorizzato;
- per quale capability;
- con quale provider/adapter;
- con quali limiti temporali e tecnici;
- con quale rollback/revocation path.

Assenza di una authority decision valida significa:

`UNAUTHORIZED`

anche se tutti i gate tecnici sono PASS.

## 7. Network boundary

Per OR-09 v0:
- rete vietata;
- nessun endpoint live;
- nessun token;
- nessun secret;
- nessun pairing;
- nessuna autenticazione remota.

Qualunque futura rete richiede profilo allowlist e decisione separata.

## 8. Mutation boundary

Le capability `MUTATIVE` restano fuori dal perimetro OR-09 v0.

Una futura capability mutativa richiede almeno:
- receipt pre-mutation;
- snapshot/restore;
- rollback;
- idempotenza;
- explicit Human Review;
- separazione tra proposta, approvazione ed esecuzione.

## 9. Evidence package

Ogni futura decisione di autorizzazione deve basarsi su un pacchetto exact-head che includa:
- capability contract;
- adapter/provider identity;
- execution profile;
- test report;
- security/privacy report;
- failure/cleanup evidence;
- known limitations;
- unresolved risks;
- Human Review checklist.

## 10. Control Center

Il Control Center può mostrare:
- readiness state;
- gate status;
- provider/adapter provenance;
- freshness;
- missing evidence.

Non può:
- autorizzare;
- avviare;
- fermare;
- riconfigurare;
- selezionare autonomamente un provider.

## 11. Invarianti OR-09

**QE-01 — No implicit authorization**  
PASS tecnico non equivale ad autorizzazione.

**QE-02 — Exact execution profile**  
Ogni futura esecuzione deve avere un profilo immutabile/versionato.

**QE-03 — Authority explicit**  
L'autorità deve essere dichiarata e tracciabile.

**QE-04 — Network denied by default**  
Nessuna rete senza decisione separata.

**QE-05 — Mutation excluded in v0**  
OR-09 v0 non autorizza mutation.

**QE-06 — Evidence before execution**  
L'evidence package precede qualunque runtime authorization.

**QE-07 — Failure and cleanup qualified**  
Timeout, cancel e cleanup devono essere provati.

**QE-08 — Provider provenance preserved**  
Provider e adapter restano espliciti.

**QE-09 — Control Center non-authority**  
Il Control Center osserva soltanto.

**QE-10 — DOS-A1 unchanged**  
DOS-A1 resta `RUNTIME_DEFERRED` fino a Human Review separata.

## 12. Exit OR-09 v0

OR-09 v0 è completo quando:
- contratto e manifest sono registrati;
- readiness state machine è definita;
- mandatory gate list è congelata;
- Governance CI è PASS;
- nessuna runtime authorization è stata emessa.

Next slice: **OR-09-P1 — deterministic readiness package validator**, interamente offline.

Il successivo passaggio oltre OR-09-P1 richiede Human Review esplicita prima di qualsiasi live execution.
