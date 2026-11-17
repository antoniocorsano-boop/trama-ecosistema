# QF-02 — Ricognizione dei contratti di qualificazione dei quattro prodotti
Data: 17 novembre 2026. Stato: DOCUMENTARY_INVENTORY / PROPOSED. Complemento a QF-01 (PR #342). Nessun nuovo collaudo, configurazione, autorizzazione o modifica applicativa. Non è un audit esaustivo di tutti i test né una certificazione dello stato corrente dei prodotti.

## 1. Fonti consultate
Le impronte sotto sono identificatori Git dei contenuti letti, non commit qualificati né ricevute di esecuzione. I documenti storici descrivono i rispettivi perimetri; non estendere il loro verdetto allo stato odierno.

| Prodotto | Fonte nel repository autorevole | Blob Git |
| --- | --- | --- |
| Arena, main | docs/architecture/ARENA_R7_END_TO_END_ADOPTION_VALIDATION_2026-09-01.md | 3945560290c231e63f2e17c9d1e87b2bab30e608 |
| Arena, main | docs/architecture/ARENA_M4_EVIDENCE_REGISTRY_2026-09-19.md | a9a9b3fac3254706297583e99540a07cd715e321 |
| Arena, main | docs/evidence/ARENA_HVA_LOCAL_RECORDER_V1.md | 1e1ca01d33391b930c2d60d5344697f9b2c906b9 |
| Atlas, main | docs/PERCORSI-G2-RUNTIME-QUALIFICATION.md | 4351ae3cbcd38e06d4225f0a7b6d832e39719c32 |
| Atlas, main | docs/TRAMA-CONTRACT-MATERIALIZATION-GOVERNANCE.md | 938e9a83b444ded4bb09c500c2ff437b49557174 |
| Atlas, main | docs/qualification/SMART-FLOW-SP01-QUALIFICATION.md | 1b15a183a0834dba3e6470c2f8080e8b33f820b0 |
| Docente OS, develop | ops/runtime-release-contract.json | 5091c79f2fc756e525c394c5e73278cd555d7cb0 |
| Docente OS, develop | product/design/HUMAN-EXPERIENCE-CONTRACT.md | 7e5cf1df8d6557cc4edd52b2a5d7e7686e4df3f6 |
| Docente OS, develop | product/design/VISUAL-ACCEPTANCE.md | 8e39f928f0bf131bb3a67aa06b8d6122e02dcc71 |
| Docente OS, develop | .github/workflows/product-ci.yml (sola osservazione requisiti) | fc9f4592aa63e91f02cc4ea593155a1a2ecc8ed1 |
| Registro Docente, main | docs/qualification/OPERATING_PROTOCOL.md | 8dc83508c6a940b85a1ee75c93eab7862ec7a53c |

Repository: antoniocorsano-boop/CurManLight_arena, Curriculum-Atlas, docente-os-2026-27, registro-docente. Per Registro Docente, il riferimento STAB-06 resta esclusivamente il piano collegato in QF-01. Il blocco #307 resta vincolante.

## 2. Matrice delle responsabilità
| Dimensione | Arena | Atlas | Docente OS | Registro Docente |
| --- | --- | --- | --- | --- |
| Identità | SHA e release effettiva | SHA + identità percorso/contenuto/pubblicazione/autorità | SHA e ambiente, schema DB/lineage quando pertinente | SHA, base, invarianti interessate |
| Verifiche deterministiche | Invarianti di dominio e processi | Validatori, casi negativi, identità e dipendenze | Typecheck, test, lint, build e contratti | Registro invarianti, impatto, ereditarietà |
| Verifiche applicative | Percorsi critici dei ruoli | Navigazione, accessibilità, esperienza e confini pubblici | Browser, HVA, costi del compito, mobile | Browser smoke, regressioni, conservazione dati |
| Ambiente reale | Beta identificata, smoke e accettazione umana | Reachability secondo contratto, separazione laboratorio/pubblicazione | Runtime e migrazioni DB, fixture isolate | Android nativo, copie e recupero locale |
| Autorità finale | Decisione istituzionale e accettazione umana | Q9 e autorità editoriale distinte | Controllo professionale, rilascio separato | Revisione, consenso e decisione di rilascio |

Il nucleo comune è un metodo di qualificazione, non una nuova semantica di maturità. Non è lecito ridurre una identità composta al solo SHA: in Atlas contano anche contenuto e pubblicazione, in Docente OS ambiente e schema. Arena e Registro conservano i confini specifici. Il riferimento Arena R7 del 1–2 settembre riguarda il primo ciclo; nessuna conclusione sullo stato odierno di infanzia.

## 3. Riuso e divergenze
| Capacità già presente | Riuso concettuale | Limite |
| --- | --- | --- |
| Registro: impactPaths, stable invariant IDs, inherited regression, exact-SHA manifest | Mappare il cambiamento alle garanzie da preservare | Non sostituire i registri locali |
| Atlas: conseguenze normative, mutazioni negative, identità composta | Esplicitare le condizioni di rifiuto prima della review | Proposta con perimetro specifico; non estenderla senza decisione |
| Docente OS: certificazione a livelli e impatto selettivo | Distinguere preflight veloce e verifiche profonde pertinenti | Non interpretare come esenzione dai gate locali |
| Arena: registro evidenze, staleness, accettazione umana | Conservare storia, distinguere release osservata da candidata | Stato hosting storico da ri-osservare prima di un uso operativo |

Sovrapposizioni concettuali confermate: identità esatta, contratti/invarianti, verifiche progressive, evidenze verificabili, decisione umana separata. Non è dimostrata duplicazione implementativa: le suite hanno domini diversi. Non unificare fisicamente i test.

Lacune osservate nel perimetro letto:
- termini e strutture di evidenza locali non omogenei; es. WATCH/REVIEW_REQUIRED Docente OS, NOT_RUN/PASS/FAIL/BLOCKED Atlas, staleness Arena, manifest Registro;
- le identità locali hanno granularità diversa: un riepilogo comune troppo povero perderebbe il significato;
- costi, tempi e disponibilità non sono deducibili da un PASS storico;
- Registro STAB-06: la disponibilità autorizzata del collaudo è distinta dal candidato e resta irrisolta. Nessuna diagnosi analoga viene attribuita agli altri prodotti.
Non si afferma che manchino strumenti ulteriori nei repository non esaminati.

## 4. Indicazione QF-03, da sottoporre a revisione
Limitare l'eventuale raccordo a un modello di lettura documentale che conservi gli stati e le identità originali, collegando i riferimenti verificabili già prodotti alle autorità del registro evidenze esistente. Una sintesi non è una nuova ricevuta né un'autorizzazione; conservare contesto e granularità del prodotto, non trasformare risultati storici/parziali in PASS, non equiparare NOT_APPLICABLE e NOT_RUN. Verificare la compatibilità con Component Evidence Lane e Maturity Evidence Binding prima di ogni modifica. Non progettare esecuzione alternativa per il blocco STAB-06; nessuna modifica di workflow o adattatori esecutivi.

## 5. Esito
QF-02: ricognizione documentale iniziale completata, da riesaminare insieme a QF-01. Nessun nuovo stato di maturità, modifica dei quattro prodotti, test o attivazione. QF-03 non avviata. QF-04 resta non autorizzata.