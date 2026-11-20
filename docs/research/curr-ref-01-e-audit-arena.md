# CURR-REF-01/E — Audit pedagogico di Arena

**Data:** 2026-11-19  
**Stato:** READ_ONLY_REPOSITORY_AUDIT / CANDIDATE_FINDINGS / NO_RUNTIME_AUTHORIZATION  
**Riferimento:** [CURR-REF-01 v0.1](../../governance/pedagogy/curr-ref-01-v0.1.json)  
**Arena exact head:** [d8b1bf43388cb5c4cdcc940b0c558bb128976c4c](https://github.com/antoniocorsano-boop/CurManLight_arena/commit/d8b1bf43388cb5c4cdcc940b0c558bb128976c4c)

## Metodo e confini

Confronto statico di codice, documentazione e bundle versionato nel repository; nessuna esecuzione del prodotto, nessuna modifica ad Arena, nessuna lettura di registri individuali. Non è un audit di conformità normativa né una validazione collegiale. Il documento formativo di Perla (dispensa PDF pp. 9–10, 26–29; presentazione pp. 15–17) costituisce il riferimento pedagogico, non una nuova autorità. La verifica non ha interrogato il master Drive corrente: i risultati riguardano la revisione esaminata del repository, non garantiscono lo stato esterno del documento.

Classi: PRESENT = struttura riscontrata; PARTIAL = raccordo presente ma non dimostrato integralmente; NOT_DEMONSTRATED = evidenza insufficiente nella superficie analizzata; OUT_OF_SCOPE = altra responsabilità o fase. Non equiparare assenza di prova a lacuna normativa.

## 1. Baseline e perimetro

A01 documenta il master CAN-CURR-MASTER-00 v1.3 come materializzato con copertura documentale OSA, ma non vigente, con validazione professionale e revisione verticale aperte. A05 impone 113 ambiti; A06 ne proietta i contenuti senza promuoverne l'autorità. A14, blob d1ab3fd860db9c043452e62359e404e4c9b94bfd, è stato letto direttamente: authorityState PROVISIONAL_COMPLETE, sourceState MATERIALIZED_HUMAN_VALIDATION_OPEN_NOT_IN_FORCE, masterVersion 1.3. Non è stato ispezionato alcun atto collegiale.

La granularità del bundle A14 (15 fasce infanzia, 55 primaria, 36 secondaria e 3 assi trasversali) non è la stessa unità di conteggio dei 113 ambiti del materializzatore: non confrontare i numeri come percentuali di copertura.

## 2. Matrice delle corrispondenze

| ID | Concetto | Stato | Evidenza Arena | Implicazione |
| --- | --- | --- | --- | --- |
| E-01 | Profilo dello studente | PARTIAL | A09, A12, A14 | Profilo di uscita disciplinare locale e competenze chiave esistono; non dimostrato il raccordo versionato tra Profilo nazionale e nodi del master |
| E-02 | Obiettivi generali del processo formativo | PARTIAL | A02, A07, A08, A14 | Categoria GENERAL_OBJECTIVE nel contratto di passaggio; nel modello produttivo obiettivo generico; manca prova di tipizzazione e raccordo end-to-end nella materializzazione esaminata |
| E-03 | Competenze disciplinari attese | PRESENT | A02, A03, A08, A14 | Tipi e contenuti esistenti; verificare distinzione benchmark nazionali/annualizzazioni locali |
| E-04 | OSA | PRESENT | A01, A03, A07, A08, A14 | Copertura documentale registrata; non dimostra qualità delle annualizzazioni |
| E-05 | Conoscenze | PRESENT | A03, A05, A07, A14 | Struttura esplicita; nessun automatismo conoscenza = competenza |
| E-06 | Nuclei fondanti | PRESENT | A03, A05, A09 | Esistono collezione, nodi core-theme e pilota con nuclei; da verificare granularità e legami con OSA e conoscenze |
| E-07 | Snodi e applicabilità | PRESENT | A01, A02, A14, A15 | Scope e transizione espliciti; distinguere snodo nazionale e scelta di istituto |
| E-08 | Continuità e spirale | PARTIAL | A02, A04, A05, A09 | Relazioni e progressioni previste; il materializzatore collega ancore di segmento con stato proposto, non prova tutte le relazioni semantiche tra singoli nodi |
| E-09 | Infanzia | PRESENT | A05, A06, A11, A14, A15 | Cinque campi nativi, scope di ordine; fasce di età come progressione locale; non forzare struttura disciplinare |
| E-10 | Evidenze | PRESENT | A03, A05, A14 | Evidenze previste dal curricolo, non prove individuali raccolte |
| E-11 | Allineamento semantico | PARTIAL | A10 | Meccanismo di revisione per Tecnologia esistente; non esaminati esiti umani correnti |
| E-12 | Certificazione | PARTIAL | A12, A13 | Matrice di lavoro esplicitamente non validata; nessuna certificazione automatica |
| E-13 | UdA e valutazione del percorso | OUT_OF_SCOPE | A07, A09 | Raccordo da verificare in Docente OS e Registro Docente; nessuna nuova funzione in Arena |
| E-14 | Autorità e provenienza | PRESENT | A01, A07, A08, A15, A16 | Conservare stati, fonti e decisioni; nessuna promozione implicita |
| E-15 | Curricolo reale, informale e nascosto | OUT_OF_SCOPE | A01, A03 | Non ridurre l'esperienza scolastica al dataset curricolare né classificare gli alunni |

## 3. Banco di prova Tecnologia

A14 contiene 8 fasce (5 primaria, 3 secondaria). Tutte presentano collezioni non vuote di competenze, obiettivi, conoscenze, evidenze e connessioni. Il campo progression è non vuoto in 4/8 fasce (primaria II–V) e vuoto nelle altre quattro. Questo è un rilievo sul campo esportato, non prova di assenza della progressione nel master: altre descrizioni o legami possono conservarla. Le otto fasce non provano la validità pedagogica degli apprendimenti.

| Fascia | Regime riportato dal bundle | Competenze | Obiettivi | Conoscenze | Evidenze | Progression non vuoto |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| Primaria I | 2025 | 6 | 6 | 1 | 4 | no |
| Primaria II | 2012 transitorio | 1 | 5 | 1 | 4 | sì |
| Primaria III | 2012 transitorio | 3 | 5 | 6 | 4 | sì |
| Primaria IV | 2012 transitorio | 1 | 6 | 6 | 4 | sì |
| Primaria V | 2012 transitorio | 5 | 6 | 7 | 4 | sì |
| Secondaria I | 2025 | 6 | 7 | 8 | 6 | no |
| Secondaria II | 2012 transitorio | 5 | 6 | 6 | 4 | no |
| Secondaria III | 2012 transitorio conclusivo | 6 | 8 | 7 | 6 | no |

Conteggi degli array nel bundle, non conteggi ufficiali di OSA. A09 costruisce una progressione I–III per nuclei e un profilo locale, ma mantiene il pacchetto non autorevole. A10 distingue inventario nazionale, testo verificato e giudizio umano: riusare questo meccanismo, senza duplicare le revisioni né promuovere bozze.

## 4. Principi CURR-REF-01

P01, P05, P12: priorità per il raccordo Profilo / OGPF / competenze / OSA / conoscenze. P02–P03: strutture esistenti, qualità semantica da accertare. P04: nuclei disponibili, selezione motivata da verificare. P09: confini di autorità riscontrati; non equivale a prova del giudizio professionale. P06–P08, P10–P11: rinviati alle verifiche Docente OS, Studio Atlas e Registro Docente; non costituiscono lacune di Arena per il solo fatto di essere esterni.

## 5. Priorità correttive proposte (nessun cambiamento applicato)

1. **E-R1 — mappa semantica in sola lettura.** Verificare nel master corrente se Profilo, obiettivi generali e snodi possiedono identificativi, testo, provenienza e collegamenti risolvibili. Distinguere ciò che è assente dal master da ciò che è perso nella proiezione. Iniziare da Tecnologia, verificando una catena per ciascun regime effettivamente applicabile. Non utilizzare la mappa generica disciplina/competenza chiave come prova.
2. **E-R2 — nuclei e progressione.** Ricondurre i nuclei esistenti ai nodi pertinenti e alle relazioni già disponibili. Prima chiarire perché quattro campi progression del bundle sono vuoti; recuperare soltanto contenuti realmente presenti nel master. Controllare continuità, sviluppo e approfondimento con motivazione, senza validare automaticamente i legami proposti.
3. **E-R3 — infanzia.** Verificare in uno dei cinque campi il raccordo con la transizione alla primaria e con il Profilo secondo lo specifico quadro, conservando identità, età e linguaggio propri.
4. **E-R4 — riesame professionale.** Collegare le eventuali correzioni alla procedura esistente di validazione del master 1.3. Ogni esito deve riferire versione, revisione, fonte, nodi coinvolti, motivazione ed esito del revisore. Niente curricolo parallelo.

Gate prima di proporre modifiche: evidenza di una lacuna effettiva (non mero campo vuoto); conferma della fonte normativa primaria pertinente; riuso del modello Arena; compatibilità dei contratti; revisione umana. Nessuna nuova tabella, migrazione, scrittura, pubblicazione o modifica dei contratti autorizzata da questo audit.

## 6. Esito

La base di Arena è riutilizzabile. Il lavoro prioritario è rendere dimostrabile la catena di allineamento, non aumentare meccanicamente i contenuti. Il presente audit statico è consegnato; E-R1–E-R4 sono proposte aperte, non esiti di collaudo o approvazione. La fase F può svolgere analisi in sola lettura su Atlas/Studio Atlas in parallelo, usando gli stessi confini.

## 7. Registro evidenze Arena

- A01: [docs/curriculum/REG-CURR-00_MASTER_ALIGNMENT.md](https://github.com/antoniocorsano-boop/CurManLight_arena/blob/d8b1bf43388cb5c4cdcc940b0c558bb128976c4c/docs/curriculum/REG-CURR-00_MASTER_ALIGNMENT.md) — Master 1.3, copertura OSA documentale, annualizzazioni e vigenza.
- A02: [src/domain/curriculum/types.ts](https://github.com/antoniocorsano-boop/CurManLight_arena/blob/d8b1bf43388cb5c4cdcc940b0c558bb128976c4c/src/domain/curriculum/types.ts) — Tipi nodo, ambiti, stati e relazioni.
- A03: [src/domain/curriculum/segment.ts](https://github.com/antoniocorsano-boop/CurManLight_arena/blob/d8b1bf43388cb5c4cdcc940b0c558bb128976c4c/src/domain/curriculum/segment.ts) — Collezioni del segmento e riferimenti di applicabilità.
- A04: [src/domain/curriculum/verticalLink.ts](https://github.com/antoniocorsano-boop/CurManLight_arena/blob/d8b1bf43388cb5c4cdcc940b0c558bb128976c4c/src/domain/curriculum/verticalLink.ts) — Relazioni motivate con stato e riferimenti ai nodi.
- A05: [src/domain/transfer/curricoloVerticaleMasterMaterializationV1.ts](https://github.com/antoniocorsano-boop/CurManLight_arena/blob/d8b1bf43388cb5c4cdcc940b0c558bb128976c4c/src/domain/transfer/curricoloVerticaleMasterMaterializationV1.ts) — Materializzatore, 113 ambiti, nodi e relazioni proposte.
- A06: [src/features/curriculum/data/canonicalCurricoloReadModel.ts](https://github.com/antoniocorsano-boop/CurManLight_arena/blob/d8b1bf43388cb5c4cdcc940b0c558bb128976c4c/src/features/curriculum/data/canonicalCurricoloReadModel.ts) — Proiezione della baseline non vigente.
- A07: [src/domain/transfer/interopCurriculumContextV2.ts](https://github.com/antoniocorsano-boop/CurManLight_arena/blob/d8b1bf43388cb5c4cdcc940b0c558bb128976c4c/src/domain/transfer/interopCurriculumContextV2.ts) — Distinzione dei requisiti nel passaggio a Docente OS.
- A08: [src/domain/curriculum/national/elementBindings.ts](https://github.com/antoniocorsano-boop/CurManLight_arena/blob/d8b1bf43388cb5c4cdcc940b0c558bb128976c4c/src/domain/curriculum/national/elementBindings.ts) — Provenienza, tipo di elemento e verifica del testo.
- A09: [src/domain/curriculum/technology/technologyOperationalPilot.ts](https://github.com/antoniocorsano-boop/CurManLight_arena/blob/d8b1bf43388cb5c4cdcc940b0c558bb128976c4c/src/domain/curriculum/technology/technologyOperationalPilot.ts) — Pilota Tecnologia, nuclei e progressione, finalità e profilo di uscita locale.
- A10: [docs/architecture/ARENA_R7C3_P3_V2_SEMANTIC.md](https://github.com/antoniocorsano-boop/CurManLight_arena/blob/d8b1bf43388cb5c4cdcc940b0c558bb128976c4c/docs/architecture/ARENA_R7C3_P3_V2_SEMANTIC.md) — Revisione semantica umana elemento per elemento.
- A11: [docs/architecture/ARENA_R7C4_INFANZIA_NATIVE_RUNTIME.md](https://github.com/antoniocorsano-boop/CurManLight_arena/blob/d8b1bf43388cb5c4cdcc940b0c558bb128976c4c/docs/architecture/ARENA_R7C4_INFANZIA_NATIVE_RUNTIME.md) — Confini dell'infanzia nativa.
- A12: [src/lib/competencies.ts](https://github.com/antoniocorsano-boop/CurManLight_arena/blob/d8b1bf43388cb5c4cdcc940b0c558bb128976c4c/src/lib/competencies.ts) — Otto competenze e associazioni disciplinari generiche.
- A13: [src/features/progettazione/components/CertificazioneTab.tsx](https://github.com/antoniocorsano-boop/CurManLight_arena/blob/d8b1bf43388cb5c4cdcc940b0c558bb128976c4c/src/features/progettazione/components/CertificazioneTab.tsx) — Matrice locale non validata, non certificazione.
- A14: [exports/atlas-curriculum/current.json](https://github.com/antoniocorsano-boop/CurManLight_arena/blob/d8b1bf43388cb5c4cdcc940b0c558bb128976c4c/exports/atlas-curriculum/current.json) — Export effettivo, stato provvisorio e otto fasce Tecnologia.
- A15: [src/domain/transfer/curricoloVerticaleReleaseV1.ts](https://github.com/antoniocorsano-boop/CurManLight_arena/blob/d8b1bf43388cb5c4cdcc940b0c558bb128976c4c/src/domain/transfer/curricoloVerticaleReleaseV1.ts) — Perimetro, autorità e politica di accettazione.
- A16: [docs/architecture/ARENA_ATLAS_CURRICULUM_SYNC_V1.md](https://github.com/antoniocorsano-boop/CurManLight_arena/blob/d8b1bf43388cb5c4cdcc940b0c558bb128976c4c/docs/architecture/ARENA_ATLAS_CURRICULUM_SYNC_V1.md) — Distinzione fra pubblicabilità e vigenza.
