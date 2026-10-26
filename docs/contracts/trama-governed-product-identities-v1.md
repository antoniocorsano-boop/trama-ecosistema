# TRAMA DC-00 — Governed Product Identities v1

**Stato:** IMPLEMENTATION CANDIDATE / NO_RUNTIME  
**Data:** 2026-10-25  
**Decisione:** TRAMA-ADR-022  
**Authority change:** NONE  
**DOS-A1:** `RUNTIME_DEFERRED`

## 1. Scopo

Questo contratto introduce un registro esplicito delle identità prodotto che possono comparire come caller nel Shared Capability Layer. Il registro definisce **identità**, non autorizzazioni operative.

Essere registrato non concede write authority, non abilita runtime live e non trasferisce autorità tra prodotti.

## 2. Identità governate

Il set v1 è chiuso e contiene esattamente:

- `ARENA` — `CURRICOLO_AUTHORITY`;
- `ATLAS` — `PUBLIC_LEARNER_SURFACE`;
- `DOCENTE_OS` — `TEACHER_OPERATIONAL`;
- `REGISTRO_DOCENTE` — `TEACHER_RECORD`;
- `STUDIO_ATLAS` — `PROFESSIONAL_AUTHORING`;
- `CONTROL_CENTER` — `READ_ONLY_OBSERVER`.

`REGISTRO_DOCENTE` e `STUDIO_ATLAS` sono identità di prima classe. Non sono alias rispettivamente di `DOCENTE_OS` e `ATLAS`.

`OTHER_GOVERNED` non è una identity valida in v1. Un prodotto futuro richiede un'evoluzione esplicita e governata di questo contratto.

## 3. Record machine-readable

Schema: `trama.governed-product-identities/v1`.

Ogni record contiene esattamente:

```text
id
domainRole
sharedCapabilityCaller
controlClass
aliasOf
```

Regole:

- `sharedCapabilityCaller = true` per tutte le sei identità;
- `aliasOf = null` per tutte le identità;
- `CONTROL_CENTER.controlClass = READ_ONLY`;
- per gli altri prodotti `controlClass = DOMAIN_BOUND`;
- `DOMAIN_BOUND` descrive il confine del prodotto e **non** costituisce un permesso di scrittura;
- nessun record introduce una nuova write authority.

## 4. Authority boundary

Il registro non modifica le authority esistenti:

- Arena resta autorità del curricolo;
- Docente OS resta teacher-first nel proprio dominio operativo;
- Registro Docente resta proprietario del proprio dominio di programmazione, consuntivo e valutazione;
- Studio Atlas resta superficie professionale di authoring;
- Atlas pubblico mantiene i propri gate di pubblicazione;
- Control Center resta esclusivamente `READ_ONLY`.

Il Shared Capability Layer continua a essere privo di domain store centrale e di write authority.

## 5. Fail-closed

La validazione rifiuta:

- schema non riconosciuto;
- identità mancanti, duplicate o estranee al set chiuso;
- domain role mancanti, duplicati o non coerenti;
- alias;
- `CONTROL_CENTER` non read-only;
- caller flag assente o falso.

## 6. Compatibilità e non-obiettivi

DC-00 preserva le identità storiche `ARENA`, `ATLAS`, `DOCENTE_OS` e `CONTROL_CENTER` e aggiunge soltanto `REGISTRO_DOCENTE` e `STUDIO_ATLAS`.

DC-00 non:

- abilita `didactic.composition.propose@1`;
- autorizza adapter o provider live;
- abilita export Drive;
- pubblica su Atlas;
- crea sincronizzazione mutativa cross-product;
- attiva DOS-A1.

Il passo successivo collega OR-07 e OR-10 a questo registro e deve restare fail-closed per caller non registrati.
