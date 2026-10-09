# TRAMA-TERM-01 — Evidenze di esecuzione Fase 1

**Perimetro:** governance TRAMA e guardrail terminologico  
**Stato:** IN_EXECUTION / TASK_4_VERIFICATION_PENDING

## Baseline

- base PR: `main@dd8bfab5032137a8591c209004bbd643bf23e8cd`;
- PR: `#263`;
- branch: `feat/trama-term-01-curricolo-vocabulary`;
- nessun merge automatico autorizzato.

## Evidenze TDD

### Task 1 — registro machine-readable

- RED `db98a360846cba7d25e39550a96c59f2679f41c0`: Governance #1889 FAIL esclusivamente per registro assente;
- GREEN `dd3090892c0dc33b5f7b362723a953d5bb2807ad`: Governance #1890 PASS.

### Task 2 — validator diff-aware

- RED `d31c28c80e7a92466eaa61c3ba42b6d34e4fd5bd`: Governance #1891 FAIL sui soli test del validator assente;
- GREEN `d9ab43d2358138e5ab1a0ebc63e10d9bb2afc516`: Governance #1893 PASS.

### Task 3 — enforcement nel gate Governance

- RED `47aa4d526c3b600e9f2f1d846c957eff3f33a17d`: Governance #1894 FAIL esclusivamente perché il workflow non applicava ancora il guardrail;
- GREEN `05192a0751f1a9393790beb1c8d864fdc096f050`: Governance #1895 PASS.

### Task 4 — superfici attive

- RED `22d945d457182f0af1f04e4b4a9c1d3affee599f`: Governance #1896 FAIL esclusivamente sul controllo dei testi attivi;
- candidato GREEN `7665aa165c384cab1babc7dd24f98696276db483`: riallineate in un commit atomico le superfici attive previste; verifica exact-head ancora da acquisire.

## Invarianti preservati

- Arena resta unica autorità curricolare;
- nessun contratto v1 viene rinominato o reinterpretato;
- nessuna superficie persistente viene rimossa;
- gli slug infrastrutturali legacy restano invariati finché non esiste una migrazione esplicita;
- `DOS-A1` resta `RUNTIME_DEFERRED`;
- la PR resta Draft e non mergiata.
