# TRAMA-VALUE-01 — Verifica del valore della continuità professionale

**Data:** 2026-11-03  
**Stato:** PROPOSTA DI SPERIMENTAZIONE / HUMAN REVIEW PENDING / NO RUNTIME AUTHORIZATION  
**Baseline TRAMA:** `main@16b698781cdb91ba2818819dde7920652e7044b7`  
**Decisione richiesta:** approvare una fase di osservazione del lavoro reale, non un'estensione automatica dei prodotti.  
**Tipo:** discovery di prodotto / verifica degli esiti, non audit tecnico, promozione di maturità o rilascio.

## 1. Baseline strategica: non duplicare una vision esistente

La strategia normativa rimane [Strategia di prodotto TRAMA](../vision/product-strategy.md): **«Dal curricolo alla lezione, con il docente sempre al controllo»**. La [Filosofia in sviluppo](../vision/philosophy-in-development.md) conserva il criterio «il successo non coincide con il numero di funzioni» e il principio «continuità senza fusione delle autorità». Questo documento **non li sostituisce**.

Il pilota [ECO-02/P1](../pilots/ECO-02-P1-FINAL-HUMAN-ACCEPTANCE-2026-09-25.md) è già `CLOSED_VERIFIED / HUMAN REVIEW PASS`: ha verificato specifici percorsi teacher-first e la registrazione controllata. **Non lo si riapre** e non lo si usa come misura causale di produttività o di apprendimento degli studenti.

Registro Docente possiede la propria [UX-GOV-01](https://github.com/antoniocorsano-boop/registro-docente/blob/main/docs/ux/UX-GOV-01-registro-docente-user-flow-baseline-v1.md) e ha integrato FLOW-04 / Rivedi ([PR #114](https://github.com/antoniocorsano-boop/registro-docente/pull/114)). La proposta INT-01 ([PR #116](https://github.com/antoniocorsano-boop/registro-docente/pull/116)) è **aperta / non mergiata** nell'osservazione del 2026-11-03: non è un prerequisito implicitamente soddisfatto.

Il [grafo ecosistema canonico v0.3](../../governance/access/trama-ecosystem-state-v0.3.json) distingue 18 nodi e 19 flussi. `docente_os_to_registro_docente` resta `DESIGNED`, `trama_access` resta `PARTIAL`. Docente OS è L5 come maturità **del prodotto**, non come prova di beneficio professionale né di integrazione end-to-end. DOS-A1 resta `RUNTIME_DEFERRED`.

## 2. Problema professionale e ipotesi

**Problema** — Il docente ripete selezioni di classe, UDA, obiettivo e materiale; ricostruisce il contesto dopo la lezione; trasferisce manualmente elementi fra preparazione, conduzione, registrazione e revisione. Tali attriti vanno **osservati**, non presunti o quantificati a priori.

**Ipotesi VAL-H1** — Per un caso di insegnamento reale, un percorso che preserva in modo esplicito, minimo e revocabile il contesto autorizzato permette al docente di eseguire `Prepara → Conduci → Registra → Rivedi → Prepara successivo` con meno riselezioni e passaggi rispetto al percorso attuale, senza peggiorare comprensione, qualità didattica, privacy o autonomia.

**Ipotesi VAL-H2 (alternativa)** — L'attuale articolazione per prodotti è già sufficientemente efficace per il caso: un ulteriore strato adattivo non produce un beneficio significativo; in tal caso non va realizzato.

**Ipotesi VAL-H3 (alternativa)** — La complessità risiede principalmente in un solo passaggio interprodotto, nel recupero di materiali o nel contesto UDA: è preferibile correggere quel confine anziché introdurre una nuova vista universale.

Non si assume che l'IA sia necessaria: la prima prova usa le capacità deterministiche disponibili.

## 3. Destinatari e campo di verifica

- **Utente primario:** docente della secondaria di primo grado in un'attività effettiva, con responsabilità e consenso professionale.
- **Caso iniziale candidato:** una classe e una UDA di Tecnologia già in corso; `Tecnologia 2C / Agricoltura come sistema tecnologico` è un riferimento **storico ECO-02**, non la selezione automatica della sperimentazione corrente.
- **Prima ampiezza:** un docente; tre episodi di lavoro comparabili quando disponibili; valutazione esplorativa, non generalizzabile all'intera scuola.
- **Dati:** tempi, conteggi dei passaggi, giudizi del docente, categorie di errore; nessun identificatore nominativo, valutazione individuale o schermata con informazioni personali degli studenti.
- **Condizione di avvio:** scelta esplicita del caso reale da parte del docente e verifica delle autorizzazioni delle superfici utilizzate.

## 4. Unità di valore e misure

L'unità di osservazione non è una visita alla pagina ma il **ciclo professionale di un'attività**:
`obiettivo curricolare consultabile → preparazione → utilizzo in classe → documentazione → revisione e prossimo passo`.

| Misura | Definizione osservabile | Come rilevarla |
|---|---|---|
| Esito del compito | L'azione prevista è completata e verificata dal docente | Sì / parziale / no, motivo |
| Tempo attivo | Tempo dedicato al compito, escluse interruzioni esterne | Cronometraggio manuale facoltativo, con note di contesto |
| Riselezioni | Numero di volte in cui deve reimpostare un contesto già noto e autorizzato | Conteggio per classe / UDA / attività / fonte |
| Transizioni | Passaggi fra superfici/prodotti per il compito | Conteggio e motivo |
| Recupero | Capacità di ritrovare materiali, decisioni e punto di ripresa | Esito e numero di tentativi |
| Autonomia e comprensione | Il docente capisce perché una proposta compare e come correggerla | Giudizio 1–5 con breve motivazione |
| Integrità | Nessuna mutazione silenziosa; nessuna perdita di autorità, dati o provenienza | Esito di controllo obbligatorio |

I confronti devono usare lo stesso tipo di compito e registrare differenze di complessità, orario e circostanze; tempi isolati o percezioni non sono prove causali. La dichiarazione ECO-02 di risparmio percepito maggiore di 15 minuti **non è** un valore baseline trasferibile.

**Segnali di successo proposti, da negoziare prima della prova comparativa:** compiti completati senza peggioramento didattico, integrità e privacy 100% rispettate, riduzione osservabile delle riselezioni; un calo di tempo o di transizioni supporta la decisione solo se ripetuto e motivato. Non fissare soglie percentuali arbitrarie come promesse di efficacia.

## 5. Fasi decisionali e autorizzazioni

**Fase A — Osserva l'AS IS (senza codice):** identificare il docente e una sola UDA, scegliere 2–3 compiti tipici; ripercorrerli con gli strumenti **così come sono**, registrando manualmente attriti e risultati. Non intervenire durante l'osservazione.

**Fase B — Localizza il problema:** classificare le frizioni come `CONTEXT_REENTRY`, `CROSS_PRODUCT_HANDOFF`, `MATERIAL_RETRIEVAL`, `UNCLEAR_ACTION`, `UNAVAILABLE_CAPABILITY`, `OTHER`; distinguere regressione tecnica, incapacità del prodotto e bisogno formativo.

**Gate B — Decide:** scegliere uno soltanto fra:
- `NO_CHANGE`: il percorso corrente è già valido;
- `UX_ONLY`: migliorare l'esposizione delle azioni in un prodotto senza nuovi flussi;
- `CONTRACT_FIRST`: qualificare un handoff specifico (es. Docente OS → Registro);
- `PROJECTION_EXPERIMENT`: sperimentare una vista adattiva limitata, con catalogo di componenti approvati e nessuna nuova authority.

**Fase C — Eventuale prova mirata:** solo dopo una distinta Human Review, creare una superficie sperimentale deterministica e confrontare con AS IS su compiti comparabili; nessun nuovo prodotto, portale generale, runtime interprodotto o azione autonoma per impostazione predefinita.

**Gate C — Decide:** `ADOPT`, `ADAPT`, `STOP`, `NEED_MORE_EVIDENCE`. Una prova negativa o non conclusiva è un esito valido e deve poter fermare lo sviluppo.

## 6. Ruoli e controlli

- **Responsabile prodotto / docente pilota:** definisce il compito, giudica pertinenza e utilità, autorizza eventuali scritture.
- **Analista di esperienza utente:** osserva frizioni senza introdurre soluzioni durante la misura.
- **Architetto di ecosistema:** verifica fonte, confini, adapter e dati; non presume `REAL` per archi `PARTIAL/DESIGNED`.
- **Revisore indipendente:** contesta inferenze, misura e condizioni di adozione; controlla privacy e accessibilità.

I ruoli possono essere concentrati in una squadra ridotta, ma la **revisione finale dei risultati non deve consistere nell'autovalutazione del solo sviluppatore**.

## 7. Vincoli non negoziabili

1. Arena mantiene l'autorità del curricolo; Docente OS e Registro mantengono le loro autorità professionali e dati.
2. Nessuna trasmissione automatica di dati personali degli studenti; minimizzazione e autorizzazione precedono qualsiasi uso della memoria.
3. Il Copilota può consigliare, non registrare, approvare o valutare autonomamente.
4. Nessun nuovo accesso federato assunto come esistente; TRAMA Access rimane separato.
5. Nessuna promozione di maturità o dello stato del grafo in assenza di prove end-to-end.
6. Nessuna modifica a runtime, Production, credenziali o `DOS-A1=RUNTIME_DEFERRED` tramite questo documento.

## 8. Uscita del programma VALUE-01

Il programma è pronto per una decisione tecnica solo se esistono:
- almeno un resoconto AS IS su compito reale, con limiti espliciti;
- classificazione delle frizioni e distinzione fra problemi ripetuti e incidenti;
- proposta di **un solo** intervento, oppure decisione `NO_CHANGE`;
- criteri per giudicare il miglioramento e ripetere la prova;
- Human Review del risultato, separata dai test di prodotto.

**Riferimento pratico:** [Protocollo di osservazione VAL-01](../pilots/TRAMA-VALUE-01-teacher-continuity-observation-2026-11-03.md). La prima azione è osservare: **non si autorizza nuovo codice**.
