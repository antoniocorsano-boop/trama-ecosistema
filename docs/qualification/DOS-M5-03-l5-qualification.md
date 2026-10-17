# DOS-M5-03 — Docente OS L5 qualification

**Stato:** CANDIDATE / HUMAN_EXACT_HEAD_REVIEW_PENDING  
**Data:** 17 ottobre 2026  
**Ambito:** Docente OS product maturity  
**Authority effect:** NONE  
**Production effect:** NONE  
**DOS-A1:** RUNTIME_DEFERRED

## 1. Scopo

Chiudere il passaggio Docente OS da L4 a L5 esclusivamente tramite riconciliazione delle evidenze canoniche già approvate, senza introdurre nuove capability, runtime, telemetria o tracking studente.

## 2. Baseline prodotto congelata

- repository: `antoniocorsano-boop/docente-os-2026-27`;
- ref: `develop`;
- frozen closure baseline: `3f2b4fbac475109fdc331415aa16af680fd96c87`;
- DOS-CLOSE-01: Human Review PASS / integrated;
- nessun nuovo ciclo funzionale autorizzato.

## 3. Evidenze L5 integrate

### REGRESSION_HISTORY

- dossier: `docs/qualification/DOS-M5-01-regression-history.md`;
- PR TRAMA: #260;
- Human Review: PASS;
- merge commit: `e4e911bdc73d5bbcfd480bf4d1fbeab89d341878`;
- due checkpoint post-L4 distinti: MATERIAL-CORE-01 / #712 e MATERIAL-TASK-UX-01 / #713;
- nessuna regressione prodotto critica aperta nel perimetro del dossier.

### ADOPTION_EVIDENCE

- dossier: `docs/qualification/DOS-M5-02-adoption-evidence.md`;
- PR TRAMA: #261;
- Human Review: PASS;
- merge commit: `9f0c4c0522ec372e21cdb4319cb331d9c2bcf6f7`;
- due occasioni `HUMAN_REAL_USE` distinte con `positiveBindingRef` distinti;
- nessun tracking studente, nessuna nuova analytics pipeline, nessuna mutazione del datastore per costruire la prova.

## 4. Registrazione nel maturity evidence registry

M5-03 registra nel registry canonico:

- `EV-MAT-DOS-REGRESSION-HISTORY-2026-10-17` → `REGRESSION_HISTORY` / PASS / support level 5;
- `EV-MAT-DOS-ADOPTION-EVIDENCE-2026-10-17` → `ADOPTION_EVIDENCE` / PASS / support level 5.

Entrambe sono bound alla baseline prodotto congelata `3f2b4fba…` e non modificano runtime, Production o authority.

## 5. Reconciliation deterministica

La definizione canonica di Docente OS L5 richiede:

- `DOCUMENT_CANONICAL`;
- `CONTRACT_APPROVED`;
- `PR_EXACT_HEAD`;
- `AUTOMATED_TEST`;
- `RUNTIME_CANARY`;
- `HUMAN_REVIEW`;
- `REGRESSION_HISTORY`;
- `ADOPTION_EVIDENCE`.

Il test `scripts/test_maturity_reconciliation.py` è aggiornato per fallire se la proiezione non restituisce esattamente:

```text
confirmedLevel = 5
candidateLevel = 5
evidenceBindingStatus = COMPLETE
nextTargetLevel = null
nextRequiredEvidenceTypes = []
```

Non viene introdotta alcuna regola speciale per Docente OS: il livello deve emergere dal valutatore di maturità esistente e dalle evidenze registrate.

### Control Center projection reconciliation

Lo snapshot `control-center/data/ecosystem-snapshot.json` è stato rigenerato dal builder canonico della repository dopo la registrazione delle due evidenze L5. Le proiezioni `project-context-snapshot` e `project-knowledge` sono state riallineate dal normale workflow governato al nuovo hash dello snapshot. Gli helper temporanei usati esclusivamente per materializzare e normalizzare le proiezioni sono stati rimossi e non fanno parte del candidato finale.

### Visual baseline reconciliation

Il passaggio Docente OS a L5 modifica intenzionalmente il contenuto governato reso dal Control Center nelle superfici **Maturità** ed **Evidenze**, senza modificare componenti, CSS o interaction model. La regressione visuale A6 ha quindi rilevato baseline statiche obsolete, mentre typecheck, test unitari, build, PWA parity e browser funzionale risultavano PASS.

Le baseline sono state rigenerate con lo stesso runner Playwright/Linux della CI mantenendo invariata la soglia `maxDiffPixelRatio`. Un guard esplicito ha autorizzato esclusivamente sei file già identificati dal RED:

- `maturity-desktop-linux.png`;
- `maturity-lim-linux.png`;
- `evidence-desktop-linux.png`;
- `evidence-lim-linux.png`;
- `evidence-phone-linux.png`;
- `evidence-reflow-320-linux.png`.

Qualsiasi ulteriore modifica visuale avrebbe fatto fallire il refresh. L'helper temporaneo di rigenerazione è stato rimosso e non fa parte del candidato finale.

Il candidato è quindi congelato sul contenuto governato finale: registry, reconciliation, test, snapshot, proiezioni derivate e baseline visuali sono coerenti tra loro; qualsiasi ulteriore variazione richiede una nuova exact-head verification.

## 6. Confini

M5-03 non autorizza:

- Production promotion;
- nuove feature Docente OS;
- riapertura PWA/installazione Android;
- attivazione di DOS-A1;
- modifiche di authority;
- tracking studente;
- soglie artificiali di utenti;
- promozione automatica oltre L5.

## 7. Gate finale

Il candidato può essere dichiarato `L5_QUALIFIED` solo se:

1. Governance e test di riconciliazione risultano PASS sull'exact head della PR M5-03;
2. la proiezione deterministica restituisce `confirmedLevel = 5`;
3. le due evidence ID L5 sono presenti nello snapshot generato;
4. nessun altro livello di maturità viene promosso incidentalmente;
5. una Human Exact-Head Review approva il medesimo head;
6. il merge resta una decisione umana separata.

Fino a quel momento:

**stato = CANDIDATE / HUMAN_EXACT_HEAD_REVIEW_PENDING**.
