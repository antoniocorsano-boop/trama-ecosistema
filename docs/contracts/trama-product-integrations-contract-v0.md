# TRAMA OR-10 — Product Integrations Contract v0

**Stato:** PROPOSED / NO_RUNTIME  
**Data:** 2026-09-30  
**Perimetro:** Arena · Atlas · Docente OS · Shared Capability Layer  
**Authority change:** NONE  
**DOS-A1:** RUNTIME_DEFERRED

## 1. Scopo

OR-10 definisce come le capability condivise possano essere integrate nelle superfici di prodotto senza spostare logica di dominio o authority fuori dai prodotti.

OR-10 v0 è esclusivamente contrattuale e NO_RUNTIME.

## 2. Principio

Ogni integrazione parte dall'intento di dominio del prodotto:

- Arena espone contesto autorevole e workflow curricolari;
- Atlas espone navigazione, risorse e pubblicazione governata;
- Docente OS espone workflow professionali teacher-first;
- Shared Capability Layer fornisce capacità riusabili;
- Control Center osserva soltanto.

## 3. Product-local ownership

Ogni prodotto mantiene:
- stato di dominio;
- regole decisionali;
- persistenza proprietaria;
- UI finale;
- authority del proprio perimetro.

Il layer condiviso non diventa store centrale né orchestration authority.

## 4. Integration envelope

Ogni integrazione prodotto-capability deve dichiarare almeno:
- product;
- surface;
- capabilityId/version;
- input mapping;
- output mapping;
- decision owner;
- authority refs;
- provenance/evidence refs;
- failure/fallback behavior;
- runtime authorization state.

## 5. Arena integration rule

Arena può:
- fornire contesto curricolare autorevole;
- esporre version/ref/state;
- ricevere osservazioni non mutative quando utili.

Arena non delega l'autorità curricolare alla capability.

## 6. Atlas integration rule

Atlas può:
- fornire resource discovery;
- presentare learning objects;
- ricevere proposte di arricchimento;
- integrare capability di navigazione/lettura.

La pubblicazione resta governata da contratti Atlas specifici e non viene autorizzata da OR-10 v0.

## 7. Docente OS integration rule

Docente OS può:
- invocare capability PROPOSE_ONLY;
- presentare proposte;
- consentire accetta/modifica/sostituisci/escludi;
- collegare output a lesson preparation.

La decisione professionale resta del docente.

## 8. Control Center

Può mostrare:
- integrazione disponibile/non disponibile;
- provenance;
- freshness;
- readiness;
- evidence.

Non può avviare l'integrazione o autorizzarla.

## 9. First integration slices

Ordine proposto:

1. **OR-10-A — Arena context adapter, READ_ONLY**
2. **OR-10-D — Docente OS lesson preparation surface, PROPOSE_ONLY**
3. **OR-10-T — Atlas optional resource adapter, READ_ONLY**
4. **OR-10-X — Cross-product presentation/evidence alignment**

Queste slice possono essere preparate in parallelo quando non modificano runtime o authority.

## 10. Invarianti OR-10

**PI-01 — Product ownership preserved**  
Il prodotto mantiene stato e decisioni di dominio.

**PI-02 — Arena authority preserved**  
Nessuna capability modifica l'autorità curricolare.

**PI-03 — Atlas optionality preserved**  
Atlas non diventa passaggio obbligatorio per Docente OS.

**PI-04 — Teacher decision preserved**  
Le proposte restano modificabili/escludibili.

**PI-05 — Shared layer stateless for domain authority**  
Nessun domain store autorevole centrale.

**PI-06 — Provenance visible**  
Ogni output condiviso mantiene provenienza.

**PI-07 — Failure isolation**  
Il fallimento della capability non blocca automaticamente il prodotto.

**PI-08 — Control Center non-authority**  
Solo osservazione.

**PI-09 — NO_RUNTIME in v0**  
Nessuna integrazione live in questa fase.

**PI-10 — DOS-A1 unchanged**  
`RUNTIME_DEFERRED` resta invariato.

## 11. Exit OR-10 v0

OR-10 v0 è completo quando:
- contratto registrato;
- integration slices definite;
- mapping prodotto/capability esplicito;
- Governance PASS;
- nessuna runtime authorization emessa.

Le implementazioni reali delle slice prodotto richiedono la relativa qualifica e, quando attraversano runtime live, Human Review separata.
