# CC2-F4 — Capability + Ecosystem Map

**Stato della slice:** IMPLEMENTATION CANDIDATE / HUMAN EXACT-HEAD REVIEW REQUIRED  
**Runtime:** READ_ONLY / SNAPSHOT_FIRST / NO NEW AUTHORITY

## Obiettivo

Rispondere a due domande senza trasformare il Control Center in una fonte autorevole:

1. **Cosa sa realmente fare oggi l'ecosistema?**
2. **Come sono collegate le parti e quale relazione è autorizzata?**

## Modello dati

Lo snapshot `ecosystem-snapshot` passa a schemaVersion `1.1.0` e aggiunge `capabilities[]`.

La proiezione nasce esclusivamente da `status/ecosystem-status.json`.

Per ogni capability sono esposti:

- id e label;
- ownerDomain;
- state;
- humanReview;
- runtimeState, solo quando dichiarabile in modo conservativo;
- maturityAreaRef;
- dependencyRefs;
- gateRefs;
- evidenceRefs;
- lastSignificantChange;
- sourceRef.

### Regola di non-inferenza

Un dato assente nella fonte non viene ricostruito per analogia.

In particolare:

- `lastSignificantChange = null` finché non esiste un registro capability-specific;
- `runtimeState = null` salvo stato esplicitamente `DEFERRED`;
- nessuna dependency capability-to-capability viene inventata;
- maturity è collegata per area/owner, non trasformata in punteggio della capability.

## Relazioni dell'ecosistema

Le tre relazioni governate già presenti acquistano un ID stabile e riferimenti:

- `DEP-ARENA-DOS-AUTHORITY`;
- `DEP-ARENA-ATLAS-DATA`;
- `DEP-DOS-ATLAS-FUTURE`.

Ogni relazione espone:

- from / to;
- kind;
- status;
- governanceRefs;
- gateRefs;
- evidenceRefs.

`Docente OS → Atlas` resta esplicitamente `FUTURE_NOT_AUTHORIZED / NOT_AUTHORIZED`.

## UI

La Home non viene trasformata in una vista onnivora.

Aggiunge soltanto un accesso dalla sezione **Ecosistema vivo** a:

`control-center/ecosystem.html`

La vista specialistica contiene due tab:

### Capability

- ricerca locale;
- filtro owner;
- filtro stato;
- card con stato, owner, human review, maturity collegata, runtime, gate, evidenze e fonte;
- nessun overall score.

### Mappa ecosistema

Desktop:
- mappa SVG dei domini;
- edge visualmente distinti;
- edge selezionabili da mouse/tastiera;
- detail panel con governance, gate ed evidenza.

Mobile:
- la mappa grafica non è necessaria per comprendere i dati;
- l'elenco equivalente delle relazioni è sempre disponibile;
- nessun overflow orizzontale obbligatorio;
- controlli >= 44 px.

## PWA

`ecosystem.html` entra nella shell PWA; cache bump a v6.

Navigazioni HTML restano network-first con fallback cache.

## Accessibilità

- tab native button con `aria-selected`;
- relazione grafica replicata da elenco equivalente;
- map edge focusabili e azionabili con Enter/Spazio;
- focus visibile;
- contenuto dinamico annunciato dove utile;
- `prefers-reduced-motion` rispettato.

## Gate automatici

La CI verifica:

- presenza della pagina specialistica;
- JavaScript valido;
- nessun fetch GitHub diretto;
- capability proiettate 1:1 dalla fonte canonica;
- nessuna data significativa inventata;
- runtimeState conservativo;
- dependency IDs stabili;
- relazione futura Docente OS → Atlas ancora NOT_AUTHORIZED;
- schema JSON valido.

## Invarianti

- READ_ONLY;
- NO_SYNTHETIC_AUTHORITY;
- NO_AUTO_PROMOTION;
- NO_RUNTIME_AUTHORIZATION;
- STATUS e ROADMAP restano canonici;
- Arena resta autorità curricolare;
- Docente OS resta autorità del contesto/decisione docente;
- Atlas conserva le authority già approvate nel proprio dominio;
- DOS-A1 resta RUNTIME_DEFERRED.
