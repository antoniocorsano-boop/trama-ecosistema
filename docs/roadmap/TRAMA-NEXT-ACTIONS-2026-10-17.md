# TRAMA — Next Actions Roadmap

**Data:** 2026-10-17  
**Stato:** CURRENT / OPERATIONAL PRIORITY SOURCE  
**Baseline TRAMA:** `main@f666239cfdb359ecf52342ed3502f4a60233ea45`  
**Scopo:** mantenere una sola sequenza operativa leggibile e impedire l'apertura accidentale di fronti non prioritari.

## Ruolo del documento

Questo documento è la **fonte operativa corrente delle priorità TRAMA**. Non sostituisce ADR, contratti, registri di autorità, evidenze, maturity registry o il grafo canonico dell'ecosistema.

Regole:

1. Prima di aprire un nuovo fronte TRAMA si verifica questa roadmap.
2. Si mantengono **al massimo due fronti attivi contemporaneamente**.
3. Un fronte successivo non diventa attivo finché il criterio di uscita del precedente non è soddisfatto, salvo blocker necessario e documentato.
4. Si correggono prima i **blocker dimostrati**; non si aprono refactor o feature speculative.
5. Il Control Center / Ecosystem State si aggiorna solo per cambiamenti materiali di nodi, relazioni, autorità o stato; non viene usato come task manager.
6. Questo documento si aggiorna solo quando cambia materialmente una priorità, un blocker, una decisione o un criterio di uscita.

---

## PRIORITÀ A — Docente OS: chiusura e freeze del prodotto

**Stato:** ACTIVE — PRIORITÀ 1  
**Repository:** `antoniocorsano-boop/docente-os-2026-27`  
**Baseline corrente:** `develop@3f2b4fbac475109fdc331415aa16af680fd96c87`  
**Decisione già integrata:** DOS-CLOSE-01 / lean product closure.

### Obiettivo

Chiudere Docente OS come prodotto docente coerente e stabile **senza aprire un nuovo ciclo di funzionalità**.

### Prossima azione autorizzata

**DOS-CLOSE-02 — qualificazione finale dell'attuale baseline**, senza modifica preventiva del prodotto.

Eseguire:

1. regressione sull'exact baseline corrente;
2. Human Review di quattro percorsi rappresentativi reali:
   - `Oggi → prossima lezione → preparazione → materiali`;
   - `Materiali → Riutilizza / Adatta / Crea nuovo`;
   - `Svolgimento lezione → registrazione → Prossima attività`;
   - `Riapertura Classe/Diario → continuità disponibile senza ricostruzione manuale del contesto`;
3. correggere **solo** eventuali blocker realmente osservati;
4. ripetere il percorso interessato dopo ogni correzione;
5. congelare la baseline quando i quattro percorsi sono PASS.

### Criterio di uscita

`DOCENTE_OS_PRODUCT_CLOSURE = PASS` quando:

- regressione exact-baseline PASS;
- i quattro percorsi ricevono Human Review PASS;
- nessun blocker dimostrato resta aperto;
- la baseline viene congelata/qualificata senza nuova macro-feature.

### Stop rule

Fino al PASS non aprire:

- nuova macro-view o redesign navigazione;
- IUI reimplementation;
- DOC-04 con persistence inventata o authority parallela;
- nuove integrazioni provider-specifiche;
- lavoro Argo come sostituto della product closure.

---

## PRIORITÀ B — Studio Atlas / MUSEO ZERO: recupero e completamento di un Percorso reale

**Stato:** ACTIVE — PRIORITÀ 2  
**Repository:** `antoniocorsano-boop/Curriculum-Atlas`  
**Main corrente:** `c322b07a68d4508ec437941f8688012765e88848`  
**Linea da recuperare:** PR #81 `MUSEO ZERO v0.2 — cinematic investigation experience`  
**Head storico della PR #81:** `db383929118ba817bd1a936f43bd1cd98d853317`.

### Obiettivo

Ottenere **un Percorso completo e realmente valutabile**, con qualità narrativa e didattica sufficiente, senza riaprire più spike o motori in parallelo.

### Prossima azione autorizzata

**ATLAS-MZ-RECOVERY-01 — audit di recuperabilità della PR #81 contro la `main` corrente.**

L'audit deve decidere, prima di modificare il prodotto:

1. quali parti della #81 sono ancora valide;
2. quali parti confliggono con la baseline corrente;
3. se il percorso corretto è:
   - salvage/rebase controllato; oppure
   - riproduzione del delta minimo su nuovo branch dalla `main` corrente.

### Vincolo di prodotto

MUSEO ZERO deve essere giudicato come esperienza, non come dimostrazione tecnica. La review deve verificare almeno:

- storia e tensione narrativa;
- ruolo reale dello studente;
- leggibilità del mondo;
- scelte e conseguenze;
- ramificazione significativa;
- transfer;
- ritmo dell'esperienza;
- chiusura narrativa;
- assenza di "quiz travestito".

### Criterio di uscita

`MUSEO_ZERO_PRODUCT_PATH = PASS` quando:

- la linea #81 è recuperata su baseline corrente senza debito storico ambiguo;
- esiste un unico Percorso end-to-end completo;
- review tecnica exact-head PASS;
- Human Product Review PASS.

### Stop rule

Non riaprire come fronti paralleli:

- PR #79 Phaser spike;
- PR #78 workbench prototype;
- vecchie linee Experience Engine già supersedute/integrate;
- nuovi motori o framework finché MUSEO ZERO non dimostra un blocker reale.

---

## PRIORITÀ C — Collegamento reale Arena / Studio Atlas / Docente OS

**Stato:** QUEUED — bloccata da A + B  
**Riferimento storico:** TRAMA PR #262 `Studio Atlas — UDA material handoff v0.1`.

### Decisione corrente

Non completare la PR #262 sulla sua vecchia baseline. Il suo design resta materiale di riferimento, ma l'implementazione deve essere riesaminata solo dopo la chiusura di Docente OS e la qualificazione di MUSEO ZERO.

### Condizione di ingresso

Attivare questa priorità solo quando:

- Priorità A = PASS;
- Priorità B = PASS.

### Obiettivo

Verificare il **minimo handoff reale** che colleghi autorità curricolare, produzione/esperienza Atlas e uso docente, senza duplicazioni di authority o persistence.

### Criterio di uscita

Un flusso governato dimostra che un contenuto/risorsa coerente con Arena può essere prodotto/usato in Studio Atlas e richiamato da Docente OS con provenienza ed esplicita scelta docente.

---

## PRIORITÀ D — TRAMA Access minimo

**Stato:** PARKED / ON-DEMAND

### Decisione corrente

Access non è un programma autonomo. Si attiva solo quando un requisito concreto dei prodotti chiusi/qualificati richiede autenticazione o accesso governato.

### Consentito

Solo il minimo necessario per usare concretamente i prodotti, mantenendo:

- privacy-first;
- nessun tracking studenti;
- nessuna federazione estesa senza necessità dimostrata;
- nessun ruolo/permission model sofisticato anticipato.

### Criterio di ingresso

Blocker concreto di accesso a un prodotto prioritario.

---

## PRIORITÀ E — Integrazioni esterne e automazioni

**Stato:** PARKED

Comprende:

- Argo/didUP e prova BIFF8 (#647 / pacchetto TRAMA correlato);
- import Drive e automazioni esterne non necessarie alla product closure;
- gh-aw;
- QE-01;
- automazioni agentiche ulteriori;
- evoluzioni Visual Factory non richieste da un asset concreto di MUSEO ZERO.

### Regola di riattivazione

Un elemento torna attivo solo quando A–D lo rendono necessario o quando elimina un costo operativo ripetitivo già stabilizzato e misurabile.

---

## Parcheggio esplicito — non dimenticare, non attivare

| Elemento | Stato | Motivo del parcheggio |
| --- | --- | --- |
| Docente OS #702 — Operational Continuity Rule | PARKED | documentazione operativa, non product blocker |
| Docente OS #647 — Argo BIFF8 proof | PARKED | integrazione esterna, prova locale richiesta |
| TRAMA #262 — Studio Atlas material handoff | PARKED / REBASE_REQUIRED | baseline storica; riesaminare dopo A+B |
| DOC-04 Relazione finale completa | PARKED RESIDUAL | dipendenza da MaterialUsageReceipt autorevole non ancora integrata |
| IUI | PARKED | non necessaria alla chiusura Docente OS |
| Visual Factory | ON-DEMAND | riattivare solo per asset richiesti dal Percorso reale |
| TRAMA Access esteso | PARKED | evitare infrastruttura anticipata |
| gh-aw / QE-01 | PARKED | automazione subordinata al prodotto |
| Control Center evolution | MAINTENANCE ONLY | aggiornare solo per cambiamenti materiali del grafo |

---

## Sequenza canonica sintetica

`A. Docente OS closure → B. MUSEO ZERO complete path → C. ecosystem handoff → D. minimum Access → E. external integrations / automation`

## Next action

**NEXT = DOS-CLOSE-02 / Exact-baseline regression + Human Review dei quattro percorsi docente.**

Non iniziare implementazione preventiva. Se la Human Review non dimostra un blocker, il risultato corretto è **freeze**, non nuova feature.
