# TRAMA-TERM-01 — Vocabolario canonico «curricolo di istituto»

**Data:** 2026-10-09  
**Stato:** SPEC APPROVED / IMPLEMENTATION PLAN READY  
**Baseline TRAMA:** `main@dd8bfab5032137a8591c209004bbd643bf23e8cd`  
**Perimetro:** TRAMA, CurManLight Arena, Atlas, Studio Atlas, Docente OS  
**Tipo di intervento:** migrazione semantica cross-ecosystem con compatibilità legacy

## 1. Decisione di dominio

Nell'ecosistema TRAMA il termine canonico è **curricolo**. Quando il riferimento è al documento e al modello istituzionale della scuola, la forma preferita e non ambigua è **curricolo di istituto**; quando la verticalità è rilevante, **curricolo verticale di istituto**.

Il termine **curriculum** non è più ammesso come nuovo termine di dominio, di prodotto o di interfaccia per rappresentare il curricolo scolastico italiano. Le occorrenze storiche o tecniche esistenti sono classificate come **legacy compatibility surface** e non costituiscono precedente per nuovo codice.

La decisione riguarda il linguaggio ubiquitario dell'ecosistema, non una sola traduzione dell'interfaccia.

## 2. Motivazione

TRAMA opera nel dominio della scuola italiana. Il modello istituzionale, i documenti fondativi di Arena e le superfici pubbliche di Atlas usano già correttamente «curricolo» e «curricolo di istituto». Al contrario, una parte significativa dei tipi, dei contratti, degli script, dei percorsi e della persistenza usa ancora `Curriculum*`/`curriculum_*`.

Questa doppia terminologia crea quattro rischi:

1. disallineamento tra linguaggio istituzionale e modello software;
2. ambiguità tra Indicazioni nazionali/quadro nazionale e curricolo elaborato dall'istituzione scolastica;
3. propagazione del termine legacy nei nuovi contratti e nelle nuove funzionalità;
4. costi di migrazione crescenti man mano che l'ecosistema evolve.

## 3. Vocabolario canonico

| Concetto | Forma canonica | Forma legacy da non introdurre ex novo |
|---|---|---|
| modello istituzionale complessivo | Curricolo di istituto | Institute Curriculum / Curriculum |
| articolazione verticale | Curricolo verticale di istituto | Vertical Curriculum |
| unità del modello | Unità curricolare / `CurricoloUnit` | Curriculum Unit / `CurriculumUnit` |
| nodo | Nodo curricolare / `CurricoloNode` | Curriculum Node / `CurriculumNode` |
| versione | Versione del curricolo / `curricoloVersionRef` | Curriculum Version |
| revisione | Revisione del curricolo / `CurricoloReviewCase` | Curriculum Review |
| contesto | Contesto curricolare / `CurricoloContext` | Curriculum Context |
| riferimento dalla progettazione | Riferimento curricolare / `CurricoloReference` | Curriculum Binding |
| autorità | Autorità curricolare | Curriculum Authority |
| fotografia/versione trasferibile | `CurricoloSnapshot` | `CurriculumSnapshot` |
| quadro nazionale | Indicazioni nazionali / quadro nazionale di riferimento | National Curriculum quando ambiguo |
| prodotto pubblico | Atlas | Curriculum Atlas |

### 3.1 Regola su Indicazioni nazionali e curricolo

Le **Indicazioni nazionali** o altro quadro normativo nazionale sono fonti e riferimenti del curricolo; non sono sinonimi del **curricolo di istituto**. I modelli e le interfacce devono mantenere questa distinzione.

## 4. Regole permanenti

### 4.1 Interfaccia utente e testi pubblici

Tutte le nuove etichette devono usare «Curricolo», «Curricolo di istituto» o una forma più specifica coerente con il contesto.

Sono vietate nuove etichette utente con «Curriculum» riferito al dominio scolastico di TRAMA.

### 4.2 Documentazione

I nuovi documenti devono usare il vocabolario canonico. I documenti storici possono mantenere identificatori legacy quando necessari a ricostruire evidenze, commit, contratti o migrazioni, ma devono qualificare tali identificatori come legacy alla prima occorrenza pertinente.

### 4.3 Codice di dominio

I nuovi tipi, interfacce, variabili, cartelle di dominio e API interne devono usare `Curricolo*` / `curricolo*`.

Non è richiesto tradurre genericamente ogni termine tecnico in italiano: la regola riguarda il **concetto di curricolo scolastico**, che resta espresso con il termine istituzionale italiano anche negli identificatori tecnici.

### 4.4 Contratti cross-ecosystem

I contratti già pubblicati sono **immutabili** e non vengono rinominati in place.

`CurriculumSnapshot v1`, `CML_CURRICULUM_RELEASE_CONTRACT_V1`, `CML_CURRICULUM_CONTEXT_V1`, `ARENA_ATLAS_CURRICULUM_EXPORT_V1` e campi v1 associati restano validi esclusivamente come identificatori legacy di compatibilità.

Qualsiasi nuova versione deve adottare il nuovo vocabolario. Il profilo successivo sarà progettato come **`CurricoloSnapshot v2`** e userà identificatori `CURRICOLO`/`curricolo` salvo necessità di compatibilità documentata.

Non è autorizzato un cambio silenzioso della semantica di un contratto v1.

### 4.5 Database e persistenza

Non sono autorizzate rinomine distruttive immediate di tabelle, colonne, funzioni SQL o payload persistiti `curriculum_*`.

La migrazione segue il modello:

1. inventario delle superfici persistenti legacy;
2. introduzione additiva delle superfici canoniche o di adapter espliciti;
3. migrazione dei consumer;
4. doppia lettura o vista di compatibilità dove necessaria;
5. deprecazione misurabile;
6. rimozione soltanto con prova di assenza di consumer e Human Review.

Le nuove strutture persistenti devono usare `curricolo_*`.

### 4.6 Nomi dei prodotti e repository

Il nome di prodotto canonico è **Atlas**. «Curriculum Atlas» è legacy naming.

La rinomina fisica del repository `Curriculum-Atlas` è **differita**: URL, GitHub Pages, workflow, badge, dipendenze e riferimenti devono essere prima inventariati e migrati. Fino ad allora il nome del repository è un identificatore infrastrutturale legacy, non il nome di prodotto.

## 5. Strategia di migrazione

La migrazione è suddivisa in fasi ordinate. Ogni fase deve restare reversibile fino alla Human Review.

### Fase A — Governance TRAMA e guardrail

- registrare questa decisione come regola canonica;
- aggiungere un controllo automatico che impedisca nuove occorrenze non autorizzate di `curriculum` nei file modificati;
- mantenere una allowlist motivata per identificatori legacy immutabili e citazioni storiche;
- riallineare README, roadmap, status e documenti di strategia attivi.

### Fase B — Arena: lessico di dominio

- introdurre i nomi canonici per nuovi tipi e API;
- migrare progressivamente i tipi `Curriculum*` verso `Curricolo*` con alias/deprecazioni temporanee quando necessario;
- rinominare moduli/cartelle solo quando i consumer sono coperti dai test;
- mantenere immutati i contratti v1 esterni.

### Fase C — Arena: persistenza

- censire tabelle, colonne, RPC, migration e payload `curriculum_*`;
- progettare migrazioni additive `curricolo_*` o adapter compatibili;
- non eliminare superfici legacy nello stesso passo che introduce le canoniche;
- produrre prova di round-trip e compatibilità.

### Fase D — Atlas

- mantenere e completare l'UI già basata su `/curricolo`;
- migrare model, feature package e componenti da `Curriculum*` a `Curricolo*`;
- aggiornare gli adapter Arena → Atlas per consumare v1 legacy e produrre il modello canonico interno;
- utilizzare «Atlas» come nome prodotto in README, metadati e documenti attivi;
- trattare la rinomina del repository come intervento separato e successivo.

### Fase E — Studio Atlas e Docente OS

- eliminare riferimenti testuali residui a “Arena curriculum search” o equivalenti;
- usare «ricerca nel curricolo» / `curricolo` nei nuovi adapter;
- verificare che Docente OS non introduca nuovamente `curriculum` tramite nuovi contratti o generatori documentali.

### Fase F — Contratti v2

- introdurre `CurricoloSnapshot v2` soltanto quando esiste almeno un consumer reale pronto;
- specificare mapping v1 → v2;
- evitare dual authority: Arena resta unica autorità curricolare;
- non rendere v2 runtime-authorized senza prova end-to-end e Human Review.

## 6. Guardrail automatico

TRAMA deve possedere un controllo di regressione terminologica con queste proprietà:

- analizza almeno i file modificati rispetto alla base della PR;
- blocca nuove occorrenze case-insensitive di `curriculum` e derivati quando non presenti in allowlist;
- non richiede la bonifica immediata dell'intera storia del repository;
- distingue tra nuova introduzione e legacy preesistente;
- l'allowlist contiene percorso, pattern e motivazione;
- l'aggiunta di una nuova eccezione all'allowlist richiede revisione esplicita.

Questo rende la decisione permanente senza costringere una migrazione big-bang.

## 7. Criteri di accettazione

TRAMA-TERM-01 è qualificato quando:

1. il vocabolario canonico è documentato in TRAMA;
2. esiste un test/guardrail che fallisce su una nuova occorrenza non autorizzata di `curriculum`;
3. i documenti TRAMA attivi usano «curricolo» salvo identificatori legacy espliciti;
4. Arena ha una mappa completa di tipi, contratti e persistenza legacy con strategia di compatibilità;
5. Atlas usa «Curricolo» nella UI e `Curricolo*` nel nuovo dominio interno, con adapter verso v1 legacy;
6. Docente OS e Studio Atlas non introducono nuovi riferimenti non canonici;
7. nessun contratto v1 viene rotto o rinominato in place;
8. nessuna tabella o RPC legacy viene rimossa senza prova di assenza consumer;
9. i gate esistenti dei repository coinvolti restano PASS;
10. le modifiche cross-repository restano in PR separate, senza auto-merge.

## 8. Non obiettivi

TRAMA-TERM-01 non autorizza:

- la riscrittura della storia Git;
- la rinomina immediata del repository `Curriculum-Atlas`;
- la cancellazione immediata di campi/tabelle/contratti legacy;
- modifiche all'autorità curricolare di Arena;
- modifiche funzionali ai flussi didattici non necessarie alla migrazione terminologica;
- l'introduzione di `CurricoloSnapshot v2` senza consumer e piano di compatibilità.

## 9. Ordine operativo canonico

1. TRAMA governance + guardrail;
2. Arena dominio applicativo;
3. Arena persistenza;
4. Atlas dominio interno e adapter;
5. Studio Atlas / Docente OS verifica regressioni;
6. eventuale contratto v2;
7. eventuale rinomina infrastrutturale del repository Atlas.

Ogni fase deve essere completata e verificata prima di rendere distruttivo il passo successivo.

## 10. Decisione finale

Da questa specifica in avanti, **«curricolo di istituto» è il concetto canonico permanente dell'ecosistema TRAMA**. `curriculum` è consentito soltanto come identificatore legacy necessario alla compatibilità, alla tracciabilità storica o a una fonte esterna che lo imponga. Nuovo prodotto, nuovo dominio, nuova persistenza e nuovi contratti devono usare **curricolo**.
