# TRAMA-ADR-015 — Control Center come Project Knowledge Base e Context Provider read-only

**Stato:** PROPOSED  
**Data:** 2026-09-24  
**Perimetro:** TRAMA · Arena · Atlas · Docente OS  
**Runtime:** NO NEW WRITE AUTHORITY / NO AUTO-PROMOTION

## Contesto

Il Control Center v2 sta evolvendo da cruscotto dinamico a osservatorio strutturato di maturità, evidenze, gate e dipendenze.

Durante lo sviluppo emerge una seconda esigenza: evitare di ricostruire a ogni sessione lo stato del progetto, le decisioni vigenti, gli exact head verificati, i gate ancora aperti, gli approcci già scartati e i lavori paralleli rilevanti.

La memoria conversazionale non è una fonte tecnica sufficientemente stabile per questi dati. Una replica completa delle fonti creerebbe invece una seconda authority e aumenterebbe il rischio di divergenza.

## Decisione proposta

1. Il TRAMA Control Center può mantenere una **Project Knowledge Base read-only, derivata e governata**.
2. La Project Knowledge Base non sostituisce ADR, contratti, STATUS, ROADMAP, repository o evidenze exact-head.
3. Il Control Center può generare un `ProjectContextSnapshot` che rappresenta il contesto operativo corrente.
4. Il Control Center può generare `TRAMA Context Pack` mirati per consumo umano o agentico.
5. Ogni fatto significativo deve essere source-bound e, quando dipende dal codice, version-bound.
6. La freshness delle evidenze deve essere rispettata.
7. Decisioni e approcci `SUPERSEDED`, `REJECTED`, `DEFERRED` o falliti devono restare recuperabili come negative knowledge.
8. Le decisioni significative devono conservare razionale, scope e relazioni di supersession.
9. Nessun Context Pack costituisce autorizzazione, approvazione o promozione.
10. Un agente può usare il Control Center come **fonte primaria di contesto operativo**, ma deve risalire alle fonti canoniche quando la decisione o l'evidenza lo richiedono.

## Relazione con ADR-003

ADR-003 resta invariata: la base di conoscenza dell'ecosistema è federata e ogni dominio conserva la propria fonte autorevole.

La Project Knowledge Base è una **proiezione indicizzata** di tali fonti, non una copia autorevole concorrente.

## Relazione con ADR-014

ADR-014 propone il Control Center come osservatorio read-only di maturità ed evidenze.

ADR-015 estende il ruolo read-only con due capacità complementari:

- memoria operativa governata;
- fornitura selettiva del contesto.

Non modifica il modello di maturità né introduce authority.

## Invarianti

- Arena resta autorità curricolare.
- Docente OS resta autorità del contesto e delle decisioni professionali.
- Atlas conserva le authority già approvate sulle proprie risorse e pubblicazioni.
- STATUS e ROADMAP restano fonti canoniche per stato e sequenza.
- Nessuna chat costituisce fonte tecnica canonica.
- Nessun retrieval semantico costituisce da solo evidenza di stato.
- DOS-A1 resta `RUNTIME_DEFERRED`.
- R3-P4 resta soggetto ai propri gate.
- Nessun dato personale studente è richiesto.

## Impatto sul controllo umano

**STRENGTHENED.**

La decisione riduce il rischio che un agente o una persona operi su informazioni superate e rende più leggibile la provenienza delle scelte.

## Documenti collegati

- `docs/architecture/trama-project-knowledge-agent-context-v1.md`
- `docs/contracts/project-context-snapshot-v1.md`
- `docs/contracts/trama-context-pack-v1.md`
- `docs/implementation/cc2-f1e-project-knowledge-foundation.md`

## Gate di approvazione

Prima della promozione:

1. coerenza con ADR-003 e ADR-014;
2. validazione del modello di provenance;
3. validazione freshness e supersession;
4. conferma che non esista una seconda authority;
5. definizione dello schema machine-readable;
6. fixture negative per informazioni scadute e decisioni superate;
7. review indipendente;
8. HUMAN EXACT-HEAD REVIEW — PASS.
