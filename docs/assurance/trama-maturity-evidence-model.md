# TRAMA — Maturity & Evidence Model v1

**Data:** 24 settembre 2026  
**Stato:** PROPOSTA DI MODELLO / ADVISORY / NO AUTOMATIC PROMOTION

## 1. Scopo

Definire un modello deterministico e spiegabile per rappresentare la maturità dell’ecosistema senza ridurla a un voto arbitrario.

## 2. Unità di valutazione

Ogni `MaturityArea` contiene:

- `id`;
- `name`;
- `ownerDomain`;
- `confirmedLevel`;
- `candidateLevel`;
- `confidence`;
- `status`;
- `evidenceRefs[]`;
- `blockingGateRefs[]`;
- `dependencies[]`;
- `lastEvaluatedAt`.

## 3. Livelli

### L0 — Non definito
Manca un perimetro stabile.

### L1 — Definito
Sono documentati scopo, ownership, authority e confini.

### L2 — Progettato
Sono disponibili specifiche, contratti, criteri di accettazione e gate.

### L3 — Implementato
La capacità è presente nella superficie prevista e produce output verificabile.

### L4 — Verificato
La capacità è stata verificata con il mix richiesto di test automatici, verifica umana e prova runtime/reale.

### L5 — Stabilizzato
La capacità ha evidenza nel tempo, gestione regressioni, manutenzione, documentazione e adozione coerente.

## 4. Evidence Class

Ogni evidenza ha:

```yaml
id: EV-...
type: HUMAN_REVIEW
area: atlas
subject: R3-F0/S3-V2
status: PASS
source:
  repository: antoniocorsano-boop/Curriculum-Atlas
  ref: exact-head-or-run-id
observedAt: 2026-09-24T...
freshness:
  policy: EVENT_BOUND
confidence: HIGH
supports:
  - gate: GATE-...
  - level: 4
```

## 5. Tipi di evidenza

| Tipo | Significato |
| --- | --- |
| DOCUMENT_CANONICAL | Stato o regola nella fonte canonica |
| CONTRACT_APPROVED | ADR/contratto approvato |
| PR_EXACT_HEAD | Modifica identificata da exact head |
| AUTOMATED_TEST | CI/test deterministico |
| SECURITY_GATE | Controllo sicurezza |
| ACCESSIBILITY_GATE | Controllo WCAG/HVA |
| RUNTIME_CANARY | Prova sul runtime |
| HUMAN_REVIEW | Review umana esplicita |
| REAL_CASE_VALIDATION | Caso reale end-to-end |
| PROMOTION_DECISION | Decisione umana che autorizza avanzamento |
| REGRESSION_HISTORY | Evidenza di stabilità o regressione |
| ADOPTION_EVIDENCE | Evidenza d’uso organizzativo |

## 6. Confidence

La confidenza non è la maturità.

### HIGH
Evidenze multiple, indipendenti e recenti; nessun conflitto aperto.

### MEDIUM
Evidenze sufficienti ma incomplete, indirette o non ancora provate nel contesto finale.

### LOW
Stato principalmente dichiarativo, evidenza vecchia, parziale o contestata.

## 7. Freshness

Politiche possibili:

- `EVENT_BOUND`: valida per quello specifico evento/head;
- `UNTIL_CHANGE`: valida finché non cambia la baseline;
- `TIME_BOUND`: scade dopo una finestra definita;
- `RUNTIME_BOUND`: richiede nuova verifica dopo deploy significativo;
- `MANUAL_REVIEW`: resta valida fino a revisione esplicita.

Una evidenza stale non viene cancellata, ma non può sostenere da sola un livello che richiede freschezza.

## 8. Gate

Un gate contiene:

- identificativo;
- ambito;
- tipo: automatico / runtime / umano / documentale;
- prerequisiti;
- evidenze richieste;
- stato;
- blocking=true/false;
- decision authority.

Stati:

- `OPEN`;
- `IN_PROGRESS`;
- `PASS`;
- `FAIL`;
- `WAIVED`;
- `NOT_APPLICABLE`.

`WAIVED` richiede sempre riferimento a decisione umana.

## 9. Regola di calcolo

Il `confirmedLevel` è il massimo livello per cui tutti i requisiti obbligatori risultano soddisfatti.

Il `candidateLevel` può essere superiore solo quando:

- l’implementazione è presente;
- mancano uno o più gate conclusivi;
- nessun vincolo di governance vieta la promozione.

Non si usano medie pesate tra dimensioni per nascondere una carenza critica.

## 10. Esempio: Atlas

Esempio illustrativo, non fotografia automatica:

```yaml
area: atlas
confirmedLevel: 3
candidateLevel: 4
confidence: HIGH
blockingGates:
  - F4_MOBILE_LIM
  - F5_EXIT
evidence:
  - F0_INTEGRATED
  - F1_INTEGRATED
  - F2_INTEGRATED
  - F3_INTEGRATED
```

## 11. Regola contro l’auto-promozione

Il maturity engine:

- raccoglie;
- verifica;
- calcola lo stato candidato;
- evidenzia conflitti;
- propone il prossimo gate.

Non può:

- approvare;
- integrare;
- chiudere un pilota;
- promuovere un ADR;
- autorizzare runtime;
- modificare authority.

## 12. Storico

Ogni snapshot deve essere append-only dal punto di vista dell’audit.

Campi minimi:

- timestamp;
- versione modello;
- hash input;
- livelli per ambito;
- gate;
- evidenze;
- conflitti;
- sorgenti non disponibili.

Lo storico serve a distinguere **avanzamento reale** da **attività intensa senza maturazione**.

## 13. Metriche derivate ammesse

Sono ammesse, purché spiegabili:

- gate closure rate;
- evidence freshness;
- regression recurrence;
- lead time tra implementazione e verifica;
- numero di aree bloccate da uno stesso gate;
- trend del livello confermato nel tempo.

Non è ammesso un “TRAMA score” unico usato come giudizio complessivo.
