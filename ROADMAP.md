# Roadmap TRAMA

## R1 Fondazione del governo

- struttura del repository;
- registro delle decisioni;
- contratti iniziali tra prodotti;
- schemi e verifica automatica;
- quadro di stato unico.

Esito atteso: una fonte comune leggibile e verificabile, senza duplicazione delle basi di conoscenza.

## R2 Pilota ECO-02/P1

Stato corrente: **CLOSED_VERIFIED / HUMAN REVIEW PASS**. Il caso reale Tecnologia 2C è chiuso; la chiusura non autorizza DOS-A1.

- prova reale controllata in Tecnologia 2C;
- vincolo con classe, data e collocazione oraria;
- provenienza del curricolo Arena;
- proposta Atlas sostituibile o escludibile;
- feedback visibile per trasferimento, accettazione, errore e completamento;
- rapporto umano sul valore didattico.

Esito atteso: dimostrazione del percorso curricolo verso preparazione verso lezione, con controllo docente.

## R3 Consolidamento Atlas

Gli identificativi canonici di roadmap sono quelli **R3-***. Gli identificativi **ATLAS-*** sono alias di prodotto e non aprono una seconda sequenza di stato o maturità.

| Canonico TRAMA | Alias Atlas | Capacità |
| --- | --- | --- |
| R3-F0 | ATLAS-F0 | Product & Design Foundation |
| R3-P2 | ATLAS-P2 | Curriculum pubblico |
| R3-P3 | ATLAS-P3 | Student Learning Hub |
| R3-P4 | ATLAS-P4 | Docente OS → Atlas Publication |
| R3-P5 | ATLAS-P5 | Smart Navigation |
| R3-P6 | ATLAS-P6 | Curriculum Health |

Regola: avanzamento, gate e dipendenze sono registrati una sola volta sull'identificativo canonico R3-*.

Obiettivi trasversali:
- convergenza su una base stabile;
- percorso Materiali → oggetto di apprendimento → Proietta;
- prove Android, desktop e LIM;
- tastiera, fuoco visibile, contrasto e ridisposizione;
- stati editoriali espliciti.

### R3-F0 / ATLAS-F0 — Product & Design Foundation

Stato corrente: **CLOSED / START GATE PASS / EXIT GATE HUMAN REVIEW PASS**.

Primo incremento integrato: **R3-F0/S1 — Information Architecture + Visual Grammar**, con HUMAN EXACT-HEAD REVIEW PASS; resta esclusivamente prodotto/design e `NO_RUNTIME`.

Secondo incremento integrato: **R3-F0/S2 — Design Core & Accessible Primitives**, con HUMAN EXACT-HEAD REVIEW PASS e `NO_RUNTIME`.

Terzo incremento: **R3-F0/S3 — Journey Prototypes & 2D Map POC**. Il pacchetto statico è integrato con HUMAN EXACT-HEAD REVIEW PASS e `NO_RUNTIME`. **R3-F0/S3-V1 — Rendered Prototype Validation** resta valido come harness tecnico/accessibilità. **R3-F0/S3-V2 — Atlas Product Experience Prototype** è ora **CLOSED / HUMAN EXACT-HEAD REVIEW PASS**: F0 Foundation, F1 Curricolo verticale d’istituto + Materiali pubblici, F2 Esplora relazionale, F3 Materiali+Risorse, F4 Mobile+LIM e F5 Exit sono integrati. L’uscita finale è validata sull’exact head `bc11577eeeeeed9c43ad62ac43fb7561e1197246`, merge Atlas #32 `423444be9dd883f4c35c6c1c89e94f6b0e5405fa`. R3-F0 è quindi CLOSED; questa chiusura non autorizza R3-P4, DOS-A1 o runtime cross-product.

- information architecture pubblica;
- Visual Grammar of Curriculum;
- design token TRAMA/Atlas;
- primitive accessibili e component catalogue;
- target WCAG 2.2 AA;
- test automatici + verifica umana dell'accessibilità;
- prototipo di prodotto S3-V2 coerente con il target visuale Atlas approvato;
- frontend foundation con stack maturo e component system governato;
- POC di mappa 2D professionale evoluto in RelationCanvas navigabile;
- conservazione di Galaxy/Spatial come vista specialistica.

### R3-P2 / ATLAS-P2 — Curriculum pubblico

- vista per famiglie, studenti e comunità;
- progressione leggibile per annualità;
- schemi grafici coerenti con la semantica;
- provenance su richiesta;
- binding esplicito alle versioni Arena;
- nessuna seconda copia autorevole del curricolo.

### R3-P3 / ATLAS-P3 — Student Learning Hub

- selezione minimizzata del contesto;
- classe/grado e disciplina;
- sezione e data soltanto quando necessarie;
- vista per lezioni;
- vista per obiettivi;
- materiali pubblicabili.

### R3-P4 / ATLAS-P4 — Docente OS verso Atlas Publication

- anteprima;
- conferma esplicita;
- `LessonPublicationManifest`;
- `PublicationReceipt` distinta;
- binding Arena con `curriculumVersionRef`, `authorityState` e `authorityReceiptRef` quando applicabile;
- pubblicazione, aggiornamento e ritiro;
- controllo di versione e idempotenza;
- visibility/minimization policy;
- gate diritti/licenze;
- gate WCAG 2.2 AA con verifica automatica + umana;
- nessun dato personale studente;
- substrato asset Git-first secondo `ATLAS-MAT-PUB-01`: normalizzazione, manifest, commit, deploy, smoke test e receipt tecnica separati dalla decisione editoriale.

### R3-P5 / ATLAS-P5 — Smart Navigation

- Chiedi ad Atlas;
- navigazione per disciplina → annualità → nucleo → obiettivi → evidenze → risorse;
- “Segui il concetto” lungo la progressione verticale;
- prerequisiti, raccordi e relazioni interdisciplinari;
- Perspectives;
- semantic zoom;
- Visuale | Elenco.

### R3-P6 / ATLAS-P6 — Curriculum Health

- coverage;
- gap/overlap;
- readiness editoriale;
- eventuali esiti aggregati soltanto dopo distinta autorizzazione TRAMA.

## R4 Esperienza professionale guidata

Obiettivi generali R4:

- eliminazione del trasferimento quotidiano opaco;
- anteprima e conferma esplicita;
- avanzamento e risultato visibili;
- gestione di rifiuto, sostituzione e ripetizione;
- ricevuta comprensibile all'utente.

### R4-P1 — Officina materiali specialistica

Stato proposto: **HUMAN REVIEW REQUIRED / RUNTIME NOT AUTHORIZED**.

- Docente OS costruisce il brief didattico, non il rendering definitivo;
- ricerca Atlas e scelta **Riutilizza | Adatta | Crea nuova** prima della generazione;
- produzione con motore specialistico adeguato al tipo di artefatto;
- uso dei pattern/LO/design profile Atlas quando pertinenti;
- anteprima, confronto e modifica sotto controllo del docente;
- collegamento alla lezione soltanto dopo decisione docente;
- pubblicazione in Atlas separata e governata da `LessonPublicationManifest` / `PublicationReceipt`;
- riuso del publisher Git-first `ATLAS-MAT-PUB-01` come infrastruttura tecnica, senza attribuire capacità editoriale autonoma all'Officina;
- provenance, diritti/licenze, accessibilità e qualità editoriale come gate;
- nessuna pubblicazione o adozione automatica.


### R4-P2 — Professional Practice

Stato: **DESIGN AUTHORIZED / RUNTIME NOT AUTHORIZED**.

Obiettivo: consolidare Docente OS come ambiente di professionalità docente continua, mantenendo il docente come decisore e l'IA come capacità advisory.

Primo slice: **R4-P2/S1 — Reflective Lesson Continuity**.

- diario riflessivo strutturato collegato alle lezioni;
- distinzione tra osservazione, riflessione e decisione;
- continuità verso la preparazione successiva;
- collegamento contestuale con Conoscenza;
- assistente professionale contestuale teacher-editable;
- `KnowledgeResource != TeachingMaterial`;
- nessuna scrittura silenziosa;
- nessun nuovo runtime cross-product;
- DOS-A1 resta `RUNTIME_DEFERRED`.

La progettazione e la prototipazione `NO_RUNTIME` sono autorizzate in parallelo ai cantieri correnti. L'implementazione runtime richiede un gate distinto.

Riferimento: `docs/product/r4-p2-professional-practice.md`.

### TRAMA-SA-01 — TypeSafe semantic assurance pilot

Stato proposto: HUMAN REVIEW REQUIRED.

- provider semantico opzionale e advisory-only;
- nessuna nuova autorità e nessuna scrittura automatica;
- pre-gate deterministico obbligatorio;
- casi sintetici, pubblici o minimizzati e nessun dato personale;
- giudizi tipizzati usati per coerenza, evidenza e casi ambigui;
- revisione umana di ogni caso durante il pilota;
- soglie definite soltanto dopo calibrazione sul dominio;
- report finale con accordo umano, falsi passaggi, casi non decidibili, latenza, costo e failure mode;
- ogni eventuale integrazione runtime richiede una decisione TRAMA distinta.

Riferimenti: `TRAMA-ADR-009`, `docs/assurance/typesafe-semantic-assurance.md`, `docs/pilots/trama-sa-01-typesafe.md`.



## TRAMA Control Center v2

Sequenza governata del Control Center read-only:

1. **CC2-F0 — Baseline di maturità ed evidenze** — INTEGRATA via #65.
2. **CC2-F1/A–D — Snapshot & Evidence Foundation** — INTEGRATA via #66–#69: snapshot deterministico, maturity definitions, wiring conservativo, binding delle evidenze e freshness.
3. **CC2-F1/E — Project Knowledge & Agent Context Foundation** — INTEGRATA via #81. ADR-015 resta PROPOSED e non crea nuova authority.
4. **CC2-F2 — Snapshot-first Home** — INTEGRATA via #71.
5. **CC2-F3A — Stakeholder Assurance Model** — INTEGRATA via #72.
6. **CC2-F3B — Stakeholder Summary, Contextual Help & Living Dossier** — INTEGRATA via #73.
7. **CC2-F3C — Mobile-first Control Center** — INTEGRATA via #74, con hardening strutturale #75–#77 e rifinitura caroselli mobile #80.
8. **CC2-F4 — Capability + Ecosystem Map** — INTEGRATA via #84.
9. **CC2-F5 — Evidence Explorer + Integrity** — INTEGRATA via #85; snapshot 1.2, filtri evidenziali e controlli di integrità PASS / ISSUE / NOT_EVALUABLE, senza overall score.
10. **CC2-F6 — Timeline + Operational Path** — INTEGRATA via #86; snapshot 1.3, percorso operativo derivato e timeline semantica a copertura PARTIAL_EXPLICIT.

Baseline di design/tooling già integrata prima di F4/F5:
- Penpot MCP pilot — INTEGRATO via #82;
- TRAMA Penpot design system — INTEGRATO via #83.

### CC2-F1/E — Project Knowledge & Agent Context

Obiettivo: rendere TRAMA utilizzabile come base di conoscenza verificabile per lavoro umano e agentico senza trasformare il Control Center in una nuova fonte autorevole.

Principi vincolanti:
- `READ_ONLY`;
- `SOURCE_BOUND`;
- `VERSION_BOUND` quando applicabile;
- `FRESHNESS_AWARE`;
- `NO_SYNTHETIC_AUTHORITY`;
- conservazione di `SUPERSEDED`, `REJECTED`, `DEFERRED` e failure learning;
- rationale preservation;
- Context Pack derivato, non canonico;
- nessuna promozione automatica di stato;
- nessuna autorizzazione runtime;
- `DOS-A1` resta `RUNTIME_DEFERRED`.

Riferimenti:
- `docs/architecture/trama-project-knowledge-agent-context-v1.md`;
- `docs/contracts/project-context-snapshot-v1.md`;
- `docs/contracts/trama-context-pack-v1.md`;
- `docs/decisions/trama-adr-015-project-knowledge-context-provider.md`;
- `docs/design/trama-control-center-v2-view-architecture.md`.

## Maturity reconciliation — 2026-09-29

Il maturity engine misura **evidenze bound**, non qualità percepita o quantità di funzionalità.

Conseguenze operative:
- un livello L0 può significare che le prove non sono ancora collegate all'area;
- un'evidenza successiva non può saltare un prerequisito precedente;
- product-area maturity, component maturity e lifecycle restano assi distinti;
- L4 è il primo target operativo serio;
- L5 richiede regression history e, dove previsto, adoption evidence.

La baseline e il backlog governato sono:
- `docs/analysis/trama-maturity-reconciliation-2026-09-29.md`;
- `governance/maturity/trama-maturity-reconciliation-v1.json`.

La prima tranche riconcilia stato canonico e semantica della maturità senza promuovere livelli. La tranche successiva collegherà solo evidenze già governate e version-bound.

## Control Center modular application migration

The current multi-page HTML implementation is now a **legacy production surface**. New significant Control Center feature development should target the modular application architecture unless required for correctness, security or migration parity.

Canonical references:
- `docs/architecture/trama-control-center-modular-app-architecture-v1.md`;
- `docs/strategy/trama-control-center-modular-app-migration-a0-a7.md`.

Governed migration sequence:

1. **A0 — Architecture lock** — LOCKED / HUMAN REVIEW APPROVED 2026-09-30; architecture, dependency policy, package boundary, rollback rules and machine-enforced legacy baseline materialized;
2. **A1 — Application foundation** — QUALIFIED; React/TypeScript/Vite shell, governed data validation, committed lockfile and browser smoke in isolated preview; production legacy unchanged;
3. **A2 — Maturity feature** — QUALIFIED; first modular vertical slice with Evidence Lane parity, axe, canonical viewport evidence and A1 regression PASS; legacy production unchanged;
4. **A3 — Overview + navigation** — QUALIFIED; modular Home orientation, Project Knowledge presentation, progressive navigation and canonical viewport evidence; legacy production unchanged;
5. **A4 — Ecosystem + Evidence** — QUALIFIED; governed capability/relationship explorer, lazy accessible React Flow graph, Evidence Explorer and Integrity with A1/A2/A3 regression PASS; legacy production unchanged;
6. **A5 — Operations + Assurance** — governed timeline, operational path and stakeholder assurance;
7. **A6 — PWA + security + accessibility + parity** — candidate qualification;
8. **A7 — Public cutover** — explicit Human Review before switching the Render production entrypoint.

Permanent constraints:
- Control Center remains READ_ONLY;
- JSON Schema remains contract authority;
- no GitHub authority inference in the browser;
- no automatic lifecycle/maturity promotion;
- legacy production remains rollback-capable until parity and cutover review;
- DOS-A1 remains `RUNTIME_DEFERRED`.

## CC3 Governed Forecast & Readiness

CC3 estende il Control Center senza modificare la roadmap R1–R5 e senza introdurre una nuova authority.

Sequenza governata:

1. **CC3-F0 — Forecast Contract & Guardrails** — INTEGRATA / HUMAN EXACT-HEAD REVIEW PASS via #88. Definisce ADR-016, policy, schema, confidence qualitativa, invalidators, scenario read-only e ForecastReceipt. ADR-016 resta PROPOSED.
2. **CC3-F1 — Next Transition Engine** — CLOSED / HUMAN EXACT-HEAD REVIEW PASS. Derivazione deterministica delle sole transizioni possibili da gate e dipendenze correnti; nessuna previsione di esito, ranking o mutazione.
3. **CC3-F2 — Scenario Explorer** — PLANNED. Simulazione controfattuale senza mutazione dello snapshot canonico.
4. **CC3-F3 — Bottleneck & Dependency Forecast** — PLANNED. Individuazione dei colli di bottiglia senza ranking automatico di priorità.
5. **CC3-F4 — Adoption Readiness Forecast** — PLANNED. Prerequisiti verso R5 senza percentuali non calibrate.
6. **CC3-F5 — Forecast Calibration & Backtesting** — PLANNED. Confronto forecast/esiti tramite ForecastReceipt prima di qualunque futura metrica quantitativa.

Vincoli permanenti:

- forecast ≠ stato canonico;
- confidence ≠ probabilità;
- nessun overall score;
- nessuna auto-promotion;
- nessuna runtime authorization;
- nessuna modifica delle authority Arena / Atlas / Docente OS;
- DOS-A1 resta `RUNTIME_DEFERRED`.

## R5 Preparazione all'adozione

- verifica del nome TRAMA;
- identità visiva accessibile;
- dossier di prodotto e protezione dati;
- modello di assistenza e formazione;
- stima dei costi e validazione della domanda;
- pilota di istituto.

## Gate di promozione ADR-007/008

**Gate soddisfatto nel pacchetto di promozione governata:** TRAMA-ADR-007 e TRAMA-ADR-008 sono portati ad `APPROVED` insieme all'aggiornamento di `docs/knowledge/source-registry.json`.

Il registro dichiara Atlas autorevole per identità/versione/stato delle proprie risorse e per pagine/pubblicazioni Atlas, versioni, stato editoriale e receipt. Restano invariati Arena come autorità del curricolo e Docente OS come autorità del contesto e delle decisioni professionali.

Questa promozione non cambia lo stato implementativo di R3-P4: il runtime Docente OS → Atlas resta `NOT_IMPLEMENTED / NOT_AUTHORIZED_FOR_RUNTIME`.

`DOS-A1` può cambiare stato soltanto mediante una decisione esplicita successiva alle evidenze del pilota.


## Sequenza operativa trasversale — Piano atomico

Il piano dettagliato è in [docs/strategy/atomic-operating-plan-2026-09-22.md](docs/strategy/atomic-operating-plan-2026-09-22.md).

La roadmap deve essere letta con questa priorità:

Prerequisiti già chiusi: **ECO-02/P1** e **R3-F0/S3-V2**.

1. R3-P2 Curriculum pubblico;
2. R3-P5 Smart Navigation / Percorsi;
3. continuità d'esperienza Docente OS ↔ Arena ↔ Atlas senza rendere Atlas un passaggio obbligatorio;
4. R4-P1 Officina materiali;
   - in parallelo resta consentita la progettazione NO_RUNTIME di R4-P2/S1 Professional Practice;
5. R3-P3 Learning Hub;
6. R3-P4 solo dopo superfici Atlas mature e una nuova autorizzazione umana/runtime;
7. R3-P6 Curriculum Health;
8. identità prodotto, adozione e pilota di istituto.

### Regola di portafoglio

Un nuovo cantiere non deve essere promosso soltanto perché tecnicamente possibile. Prima devono essere disponibili, per il cantiere precedente:

- evidenza automatica;
- evidenza runtime quando pertinente;
- verifica umana;
- decisione di promozione;
- aggiornamento della documentazione canonica.

Questa regola serve a ridurre rilavorazioni, duplicazioni, regressioni già note e consumo di risorse dovuto a problemi ripetuti.

### Nota architetturale

La sequenza di investimento non trasforma i prodotti in una pipeline. Restano distinti i quattro flussi governati tra Arena, Atlas e Docente OS. In particolare, Arena → Docente OS resta necessario e Atlas resta opzionale rispetto alla preparazione ordinaria del docente.
