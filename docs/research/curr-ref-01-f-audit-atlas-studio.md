# CURR-REF-01/F — Audit pedagogico di Atlas e Studio Atlas

**Data:** 2026-11-19  
**Stato:** READ_ONLY_REPOSITORY_AUDIT / CANDIDATE_FINDINGS / NO_RUNTIME_AUTHORIZATION  
**Riferimento:** [CURR-REF-01 v0.1](../../governance/pedagogy/curr-ref-01-v0.1.json); [audit Arena](curr-ref-01-e-audit-arena.md).  
**Atlas exact head:** d2938378c9384c5122adb8379396dbad5b4385fe. **Studio Atlas/TRAMA exact head:** 99879f3e7edc4097f71a7e66060280a4be7b8e88. Rami paralleli separati, non trattati come integrati.

## Metodo

Confronto statico di codice, documentazione e bundle; riproduzione deterministica della generazione degli identificativi sul JSON effettivo. Nessuna prova browser o modifica di Atlas/Studio Atlas, pubblicazione, dato individuale o autorizzazione. Riferimento formativo Perla: dispensa pp. 3–5, 9–10, 26–29 del PDF; presentazione pp. 15–17, 21–24. Le regole proposte sono derivazioni TRAMA, non risultati empirici della fonte.

## 1. F-R0: difetto prioritario di identità

F02 ha blob SHA d1ab3fd860db9c043452e62359e404e4c9b94bfd identico al bundle Arena esaminato in E; impronta b355be71, master 1.3, PROVISIONAL_COMPLETE. F01 genera ID e codice degli obiettivi usando disciplina, slug del nome della classe e posizione, senza ordine scolastico; anche gli ID degli argomenti condividono il prefisso. F05 usa tali ID nelle rotte statiche; F01 restituisce la prima corrispondenza e F04 riutilizza l'ID per nodi e archi.

Riproduzione: per tutte le discipline/campi ordinari del bundle, escludendo tre assi trasversali, iterare le fasce e le rispettive voci, applicare la stessa funzione slug e costruire la chiave disciplina-classe-posizione. Risultato: 106 fasce con ID sorgente distinti, 549 voci, 399 ID distinti, 150 ID duplicati e 300 voci coinvolte (due per ciascuna collisione). Esempio tecnologia-classe-i-o1 per primaria I e secondaria I. Nessuna fascia ha attivato il ramo di ripiego per obiettivi assenti. Non sono conteggi di OSA ministeriali. Difetto confermato nel modello; effetto sull'istanza distribuita non provato nel browser.

**Priorità P0:** correggere la proiezione, non il bundle Arena. Riutilizzare l'identità univoca della fascia o altro riferimento canonico disponibile; non spacciare ID posizionali per OSA ufficiali. Verificare unicità di obiettivi, argomenti, nodi, archi e rotte; risoluzione di ogni voce, regressione primaria/secondaria, risorse collegate e compatibilità delle vecchie rotte. Le vecchie chiavi ambigue non devono redirigere silenziosamente a una sola destinazione. PR isolata, nessuna pubblicazione automatica.

## 2. Matrice Atlas

| ID | Aspetto | Riscontro | Azione candidata |
| --- | --- | --- | --- |
| F-A1 | Autorità e provenienza | PRESENT F01–F02 | Mantenere stato non vigente e impronta |
| F-A2 | Continuità verticale | PARTIAL F04–F06 | Adiacenza delle fasce non prova sviluppo pedagogico; distinguere legami Arena revisionati |
| F-A3 | Identità | DEFECT_CONFIRMED F01–F05 | F-R0 |
| F-A4 | Conoscenze, abilità, competenze | PARTIAL F01,F03,F05 | Competenze di fascia confluiscono in skills mostrato come Abilità; preservare categoria e granularità |
| F-A5 | Profilo, OGPF, nuclei, evidenze | PARTIAL F01–F03,F05 | Non dimostrata rappresentazione distinta; l'array evidence esiste nel bundle ma non nel modello obiettivo |
| F-A6 | Raccordi puntuali | PARTIAL F01,F04 | Dati di fascia assegnati a ogni obiettivo; non sono legami specifici validati |
| F-A7 | Accessibilità | PRESENT_DESIGN F06 | Mappa ed elenco equivalenti; prova assistiva separata |
| F-A8 | Obiettivi sintetici | RISK_LATENT F01 | Ripiego da testo di progressione/sorgente crea una voce se mancano obiettivi; esplicitare assenza, nessun caso attivo nel bundle |

## 3. Matrice Studio Atlas

| ID | Aspetto | Riscontro | Azione candidata |
| --- | --- | --- | --- |
| F-S1 | Esperienza attiva | PRESENT F07–F12,F15–F16 | Riusare azioni, scelte, conseguenze e riflessione |
| F-S2 | Trasferimento | PRESENT F07–F10,F16 | Scena esplicita obbligatoria; non equivale a competenza dimostrata |
| F-S3 | Progressione e mediazione | PARTIAL F11,F15 | Esplicitare concreto/astratto, supporti, continuità |
| F-S4 | Raccordo Arena | PARTIAL F13–F17 | Contratto con raccordo opzionale; modello e compilatore da idea libera non provano raccordo end-to-end |
| F-S5 | Progettazione a ritroso | PARTIAL F07,F15–F16 | Dossier contempla evidenze; blocco produzione esaminato non dimostra vincolo sui risultati/criteri a monte |
| F-S6 | Parità e accessibilità | PRESENT_DESIGN F08–F10 | Non generalizzare precedente H1 né confonderlo con prova assistiva |
| F-S7 | Mondo 3D | PARTIAL F15,F19 | Resa artistica e tecnica non provano beneficio pedagogico |
| F-S8 | Valutazione formativa | PARTIAL F07–F11,F18 | Feedback e revisione, non certificazione o registrazione personale |

## 4. Lavori paralleli da riusare

- [TRAMA PR #336 ATL-KB-01](https://github.com/antoniocorsano-boop/trama-ecosistema/pull/336), head 3cd7f034b2cbdd8da38af56c1c362f9a8dc3a103: modello concetto–risorsa–esperienza e mapping Arena candidato; evitare un secondo modello.
- [TRAMA PR #332 AXF-F1](https://github.com/antoniocorsano-boop/trama-ecosistema/pull/332), head 1f47247fd96e3cb819a24d22bf98773b7759c065: authoring specializzato v0.2 di anteprima.
- [Atlas PR #136 AWC](https://github.com/antoniocorsano-boop/Curriculum-Atlas/pull/136), head fc2deefe44ed45a53e77086532268e919549c777: infrastruttura unificata dei mondi, Biblioteca prioritaria; innestare motivazione pedagogica senza nuovo orchestratore.
- [Atlas PR #142 ASC](https://github.com/antoniocorsano-boop/Curriculum-Atlas/pull/142), head aeeab27f48fc69b75d6fae2be68fa4ae215378db: qualificazione materica candidata, non prova educativa.
- [TRAMA PR #346 DE-01](https://github.com/antoniocorsano-boop/trama-ecosistema/pull/346), head cc0998ab5a1e3cfada2288cbaae4742934d93afe: dossier decisionale candidato, collegare evidenze senza duplicarle.

## 5. Scheda pedagogica candidata (innesto nel dossier esistente)

Prima della produzione esplicitare tipo di esperienza (curricolare riferita ad Arena oppure trasversale/idea autonoma dichiarata), versione e riferimenti disponibili, stato di autorità, domanda generativa, apprendimento atteso, saperi indispensabili, azioni osservabili, mediazione docente/pari, supporti, progressione e ritorno sul concetto, micro-prodotti, criteri distinti di prestazione e prodotto, trasferimento in altro contesto, alternativa accessibile, motivazione della scelta 3D/2D/testo, revisione professionale e prove. Nessun riferimento inventato né dato alunno, diagnosi, punteggio personale o automatismo certificativo.

Comenio (gradualità), Dewey (esperienza e sapere), Vygotskij (mediazione), Bruner (spirale) e cognizione incarnata (interazione con ambiente) informano la progettazione; non provano che il 3D sia necessario o superiore. Biblioteca: distinguere orientamento/accesso a risorse da apprendimento. Laboratori: un cambiamento di stato deve avere conseguenza osservabile, significato didattico e alternativa accessibile. Una scena può avere funzione narrativa senza forzare un obiettivo specifico.

## 6. Sequenza

F-R0 integrità ID Atlas; F-R1 proiezione semantica e provenienza coordinata con E-R1 e ATL-KB-01; F-R2 raccordo dossier/authoring, primo caso Missione 118 (riferimenti Arena effettivi da verificare); F-R3 scheda Biblioteca/AWC; F-R4 prova comparativa di una singola esperienza immersiva e alternativa accessibile, criteri definiti a monte. Distinguere qualificazioni tecnica, artistica e pedagogica. Fase G può avanzare in sola lettura. Tutti gli interventi sono proposte aperte; nessun cambiamento di contratti, integrazione o pubblicazione autorizzati da questo audit.

## Registro evidenze

- F01: [F01](https://github.com/antoniocorsano-boop/Curriculum-Atlas/blob/d2938378c9384c5122adb8379396dbad5b4385fe/src/features/curriculum/arena-projected.ts) — Proiezione, identità, ricerca.
- F02: [F02](https://github.com/antoniocorsano-boop/Curriculum-Atlas/blob/d2938378c9384c5122adb8379396dbad5b4385fe/src/features/curriculum/arena-curriculum-export.json) — Pacchetto effettivo.
- F03: [F03](https://github.com/antoniocorsano-boop/Curriculum-Atlas/blob/d2938378c9384c5122adb8379396dbad5b4385fe/src/features/curriculum/model.ts) — Modello obiettivo.
- F04: [F04](https://github.com/antoniocorsano-boop/Curriculum-Atlas/blob/d2938378c9384c5122adb8379396dbad5b4385fe/src/features/explore/graph.ts) — Grafo e progressione.
- F05: [F05](https://github.com/antoniocorsano-boop/Curriculum-Atlas/blob/d2938378c9384c5122adb8379396dbad5b4385fe/src/app/obiettivi/[id]/page.tsx) — Rotte statiche e risoluzione.
- F06: [F06](https://github.com/antoniocorsano-boop/Curriculum-Atlas/blob/d2938378c9384c5122adb8379396dbad5b4385fe/docs/S3-V2-F2-ESPLORA.md) — Equivalenza mappa/elenco.
- F07: [F07](https://github.com/antoniocorsano-boop/Curriculum-Atlas/blob/d2938378c9384c5122adb8379396dbad5b4385fe/docs/percorsi/PATHWAY-DOSSIER-TEMPLATE.md) — Dossier ed evidenze.
- F08: [F08](https://github.com/antoniocorsano-boop/Curriculum-Atlas/blob/d2938378c9384c5122adb8379396dbad5b4385fe/docs/percorsi/PERCORSI-G2-CONTRACT.md) — Grafo semantico e parità.
- F09: [F09](https://github.com/antoniocorsano-boop/Curriculum-Atlas/blob/d2938378c9384c5122adb8379396dbad5b4385fe/docs/percorsi/PERCORSI-G2-H1-PEDAGOGICAL-REVIEW.md) — Riesame precedente circoscritto.
- F10: [F10](https://github.com/antoniocorsano-boop/Curriculum-Atlas/blob/d2938378c9384c5122adb8379396dbad5b4385fe/docs/STUDIO-ATLAS-PREVIEW-ADAPTER-v0.1.md) — Anteprima e trasferimento.
- F11: [F11](https://github.com/antoniocorsano-boop/trama-ecosistema/blob/99879f3e7edc4097f71a7e66060280a4be7b8e88/docs/capabilities/atlas-percorsi/pedagogical-model.md) — Ipotesi pedagogiche.
- F12: [F12](https://github.com/antoniocorsano-boop/trama-ecosistema/blob/99879f3e7edc4097f71a7e66060280a4be7b8e88/docs/capabilities/atlas-percorsi/product/STUDIO-ATLAS-PRODUCT-FOUNDATION-v0.1.md) — Confini e progettazione.
- F13: [F13](https://github.com/antoniocorsano-boop/trama-ecosistema/blob/99879f3e7edc4097f71a7e66060280a4be7b8e88/docs/capabilities/atlas-percorsi/product/PATHWAY-AUTHORING-PACKAGE-v0.1.md) — Raccordo Arena previsto.
- F14: [F14](https://github.com/antoniocorsano-boop/trama-ecosistema/blob/99879f3e7edc4097f71a7e66060280a4be7b8e88/schemas/atlas-pathway-authoring-package.v0.1.schema.json) — Raccordo opzionale.
- F15: [F15](https://github.com/antoniocorsano-boop/trama-ecosistema/blob/99879f3e7edc4097f71a7e66060280a4be7b8e88/products/studio-atlas/lib/model.ts) — Progetto e scene.
- F16: [F16](https://github.com/antoniocorsano-boop/trama-ecosistema/blob/99879f3e7edc4097f71a7e66060280a4be7b8e88/products/studio-atlas/lib/production.ts) — Blocchi produzione e digest.
- F17: [F17](https://github.com/antoniocorsano-boop/trama-ecosistema/blob/99879f3e7edc4097f71a7e66060280a4be7b8e88/products/studio-atlas/lib/edutwin-conversation.ts) — Compilazione da idea libera.
- F18: [F18](https://github.com/antoniocorsano-boop/trama-ecosistema/blob/99879f3e7edc4097f71a7e66060280a4be7b8e88/docs/capabilities/atlas-percorsi/production/CQP-07-MISSIONE-118-V91-TEACHER-PREVIEW.md) — Evidenze del candidato V9.1.
- F19: [F19](https://github.com/antoniocorsano-boop/trama-ecosistema/blob/99879f3e7edc4097f71a7e66060280a4be7b8e88/docs/capabilities/atlas-percorsi/production/VISUAL-FACTORY-3D-ORCHESTRATION-v0.1.md) — Produzione 3D governata.
