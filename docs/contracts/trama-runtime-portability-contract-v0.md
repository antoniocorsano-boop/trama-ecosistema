# TRAMA OR-08 — Runtime Portability Contract v0

**Stato:** PROPOSED / CONTRACT-ONLY  
**Data:** 2026-09-30  
**Perimetro:** Shared Capability Layer · Runtime Adapter · provider portability  
**Authority change:** NONE  
**DOS-A1:** RUNTIME_DEFERRED

## 1. Scopo

OR-08 definisce come dimostrare che una capability condivisa TRAMA non dipende da un singolo runtime o provider.

La portabilità è qualificata quando lo stesso contratto di capability può essere soddisfatto da almeno due adapter indipendenti senza modificare:
- capability identity;
- request envelope;
- authority context;
- result semantics;
- evidence contract;
- decision owner.

## 2. Principio

```text
Shared Capability Contract
        |
        +--> Adapter A --> Provider A
        |
        +--> Adapter B --> Provider B
```

Il prodotto chiamante NON deve conoscere il provider scelto.

## 3. Portability unit

L'unità di portabilità è il binding:

```ts
interface PortableCapabilityBinding {
  capabilityId: string
  capabilityVersion: string
  adapterId: string
  adapterVersion: string
  providerType: string
  providerId: string
  supported: boolean
  available: boolean
  authorized: boolean
  qualified: boolean
  evidenceRefs: readonly string[]
}
```

## 4. Condizioni minime

Una capability è portable soltanto se:

1. almeno due adapter distinti implementano la stessa `capabilityId`;
2. gli adapter non richiedono modifiche provider-specifiche al request envelope;
3. gli output sono semanticamente equivalenti secondo il contratto della capability;
4. provenance e provider identity restano visibili;
5. failure semantics sono normalizzate;
6. freshness/stale semantics sono normalizzate;
7. la sostituzione del provider non cambia authority;
8. nessun caller importa API proprietarie del provider.

## 5. Portability classes

### PORTABLE_CONTRACT
Due adapter simulati o offline soddisfano lo stesso contratto.

### PORTABLE_QUALIFIED
Due adapter reali sono stati qualificati separatamente contro lo stesso contratto.

### PORTABLE_OPERATIONAL
La selezione/sostituzione governata dei provider è stata provata in runtime autorizzato.

OR-08 v0 può raggiungere al massimo `PORTABLE_CONTRACT`.

## 6. Candidate adapters

Per la prima verifica:

- Adapter A: profilo DSH-compatible;
- Adapter B: profilo Codex-compatible.

Questi nomi identificano candidati di implementazione, non authority né capability identity.

OR-08 non sceglie un provider preferito.

## 7. Request invariance

La request deve restare byte-equivalent nella rappresentazione canonica, salvo campi di correlazione temporalmente variabili espressamente esclusi dal digest.

Sono vietati nel request envelope:
- model name proprietario;
- provider command;
- endpoint proprietario;
- token/secret;
- runtime-specific flags non normati dal capability contract.

## 8. Result equivalence

Gli output non devono essere testualmente identici quando il dominio ammette variabilità, ma devono essere equivalenti sulle proprietà normative.

Per `lesson.preparation.observe`:
- `decisionState = PROPOSAL`;
- source refs preservati;
- nessuna mutazione;
- owner decisionale Docente OS invariato;
- evidence refs presenti;
- output schema identico.

## 9. Provider selection

La selezione provider:
- NON appartiene al prodotto chiamante;
- NON crea authority;
- NON può cambiare decision owner;
- deve essere osservabile tramite provenance;
- resta fuori dal runtime operativo finché DOS-A1 è deferred.

## 10. Failure normalization

Gli adapter devono normalizzare almeno:

```text
SUCCEEDED
FAILED
UNAVAILABLE
UNAUTHORIZED
STALE
```

Errori proprietari possono essere conservati come dettaglio tecnico, ma non sostituire lo stato canonico.

## 11. Evidence

Ogni adapter qualificato deve produrre evidence refs sufficienti a collegare:
- capability contract;
- adapter identity/version;
- provider identity;
- request identity;
- qualification result.

## 12. Security e privacy

OR-08 non:
- persiste segreti;
- include credenziali nelle fixture;
- introduce dati personali studente;
- abilita rete nei proof offline;
- autorizza runtime mutativo.

## 13. Invarianti OR-08

**RP-01 — Same capability identity**  
Gli adapter condividono la stessa capability identity.

**RP-02 — Same request contract**  
Nessun campo provider-specifico nel request envelope.

**RP-03 — Semantic result equivalence**  
I risultati rispettano le stesse proprietà normative.

**RP-04 — Provider provenance visible**  
Provider e adapter restano distinguibili.

**RP-05 — Failure normalization**  
Gli errori vengono mappati sugli stati canonici.

**RP-06 — Authority invariance**  
Il cambio provider non cambia authority o decision owner.

**RP-07 — Caller isolation**  
Il caller non importa API proprietarie.

**RP-08 — Offline qualification first**  
La prima qualifica è interamente offline.

**RP-09 — No secret leakage**  
Nessun segreto entra in fixture/evidence.

**RP-10 — DOS-A1 unchanged**  
La portabilità non autorizza esecuzione runtime.

## 14. Exit OR-08 v0

OR-08 v0 è documentalmente completo quando:
- questo contratto è registrato;
- esiste un manifest machine-readable;
- Governance CI è PASS;
- OR-07-P1 resta qualificato;
- nessun cambio di authority è introdotto.

Next slice: **OR-08-P1 — deterministic portability matrix**, con due adapter offline che soddisfano lo stesso Shared Capability Contract.
