# TRAMA-ADR-019 — Ecosystem-first architecture: runtime e agenti subordinati ai domini TRAMA

**Stato:** PROPOSED  
**Data:** 2026-09-30  
**Perimetro:** TRAMA · Arena · Atlas · Docente OS · Control Center · Runtime/Agent Infrastructure  
**Runtime:** NO NEW WRITE AUTHORITY / DOS-A1 RUNTIME_DEFERRED

## Contesto

Il lavoro OR-00/OR-04 ha definito lifecycle, Local Connector, Runtime Adapter e observation runtime. Questo lavoro è utile ma introduce un rischio di prospettiva: leggere il runtime layer come nuovo centro architetturale dell'ecosistema.

TRAMA esiste invece per coordinare prodotti e domini distinti:
- Arena come autorità curricolare;
- Atlas come superficie pubblica, di navigazione e learning-object;
- Docente OS come ambiente operativo teacher-first;
- Control Center come osservatorio read-only di governance, maturità, evidenze e contesto.

Runtime, agenti, connector e adapter sono infrastruttura al servizio di questi domini. Non costituiscono un nuovo prodotto centrale e non ridefiniscono le authority.

## Decisione proposta

1. TRAMA adotta un principio **ecosystem-first**.
2. Arena, Atlas e Docente OS restano i domini di prodotto che determinano i bisogni e i flussi.
3. Il Control Center osserva e rende leggibile lo stato dell'ecosistema, ma non diventa orchestration authority.
4. Local Connector, Runtime Adapter, RuntimeGeneration, DSH, Codex o altri runtime sono **capability infrastructure subordinata**.
5. Nessun runtime può diventare fonte di authority curricolare, editoriale o professionale.
6. Ogni proof significativo successivo al livello contrattuale deve dimostrare valore almeno su un flusso di ecosistema, non soltanto sulla catena tecnica runtime.
7. Quando una capability è riusabile trasversalmente, deve essere esposta come servizio/contratto condiviso senza trasformare i prodotti in un monolite.
8. Ogni futura integrazione runtime deve mantenere sostituibilità del provider e separazione tra supported, available, authorized e qualified.
9. La UI utente deve esporre intenti di dominio ("prepara la lezione", "pubblica", "sincronizza", "verifica") e non obbligare l'utente a comprendere il runtime sottostante.
10. DOS-A1 resta `RUNTIME_DEFERRED` fino a distinta decisione.

## Architettura di riferimento

```text
                         TRAMA
                 governance / contratti
                         │
          ┌──────────────┼──────────────┐
          │              │              │
        ARENA          ATLAS        DOCENTE OS
     autorità        pubblico /       operativo
    curricolare      navigazione     teacher-first
          │              │              │
          └──────────────┼──────────────┘
                         │
                capability services
                         │
       ┌─────────────────┼─────────────────┐
       │                 │                 │
 Project Knowledge   Connector/Runtime   Sync/Import
                         │
                 DSH / Codex / altri
```

## Conseguenza sulla roadmap OR

OR-00/OR-04 restano validi.

Da OR-05 in avanti il lavoro deve essere letto in chiave di ecosistema:

- **OR-05 — Ecosystem component reuse:** riuso di primitive/componenti maturi attraverso le superfici di prodotto, coerente con la Component Strategy TRAMA.
- **OR-06 — Cross-ecosystem read-only proof:** prova di un flusso Arena → Atlas/Docente OS → capability runtime → evidence, senza nuove write authority.
- **OR-07 — Shared capability layer:** consolidamento di capability riusabili senza accentramento dei domini.
- **OR-08 — Runtime portability:** almeno due adapter compatibili con lo stesso contratto.
- **OR-09 — Qualified execution:** esecuzione governata solo dopo nuovi gate/authority.
- **OR-10 — Product integrations:** integrazioni concrete Arena/Atlas/Docente OS orientate ai workflow utente.

## Regola per i proof

Un proof runtime-only può qualificare infrastruttura, ma non è sufficiente a dimostrare valore di ecosistema.

Il proof di ecosistema deve preservare:
- authority Arena;
- publication/navigation role Atlas;
- teacher decision Docente OS;
- Control Center READ_ONLY;
- provenance/evidence;
- provider runtime sostituibile.

## Impatto sul Project Knowledge

Ogni Session Bootstrap relativo a runtime, agenti, connector, adapter o automation DEVE includere prima:
1. confini Arena/Atlas/Docente OS;
2. stato DOS-A1;
3. roadmap cross-ecosystem pertinente;
4. solo dopo, stato runtime/adapter.

Questo ordine evita che una sessione tecnicamente locale perda il contesto dell'ecosistema.

## Compatibilità

Questa ADR rafforza e non sostituisce:
- ADR-001 — TRAMA come governo comune;
- ADR-002 — Arena autorità curricolare;
- ADR-007 — Atlas superficie pubblica/didattica;
- ADR-014 — Control Center osservatorio read-only;
- ADR-015 — Project Knowledge / Context Provider;
- ADR-017 — Project Knowledge dual-speed.

## Non-obiettivi

Questa ADR non:
- autorizza runtime;
- autorizza write cross-product;
- impone DSH o Codex;
- crea un orchestratore centrale;
- modifica authority di dominio;
- modifica DOS-A1.

## Human control

**STRENGTHENED.**

Il principio impedisce che la crescita dell'infrastruttura agentica sposti implicitamente authority o priorità lontano dai workflow umani e dai prodotti dell'ecosistema.

## Gate

Prima di promuovere questa ADR:
1. coerenza con ADR-001/002/007/014/015/017;
2. aggiornamento roadmap OR;
3. indicizzazione nel Governed Document Registry;
4. bootstrap rule nel Second Brain;
5. Governance CI;
6. HUMAN EXACT-HEAD REVIEW.
