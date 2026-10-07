# DOS-M5-01 — Docente OS L5 regression history

**Stato:** DRAFT / CHECKPOINTS_PENDING  
**Data:** 7 ottobre 2026  
**Ambito:** Docente OS product maturity  
**Contratto:** `docs/qualification/DOS-M5-00-evidence-contract.md`  
**Authority effect:** NONE  
**Production effect:** NONE  
**DOS-A1:** RUNTIME_DEFERRED

## 1. Obiettivo

Costruire la `REGRESSION_HISTORY` richiesta per Docente OS L5, distinguendo regressioni di prodotto, test harness e infrastruttura, documentando remediation e non ricorrenza e acquisendo almeno due checkpoint post-L4 realmente distinti secondo il contratto DOS-M5-00.

DOS-M5-01 non promuove L5, non modifica il maturity registry e non genera automaticamente una evidenza `REGRESSION_HISTORY` canonica finché tutti i criteri PASS non sono soddisfatti.

## 2. Baseline canonica

Baseline TRAMA di apertura:

- repository: `antoniocorsano-boop/trama-ecosistema`;
- ref: `main`;
- exact head: `dd8bfab5032137a8591c209004bbd643bf23e8cd`;
- DOS-M5-00: `CONTRACT_APPROVED / HUMAN_REVIEW_PASS / INTEGRATED`.

Baseline prodotto L4:

- repository: `antoniocorsano-boop/docente-os-2026-27`;
- active ref: `develop`;
- exact head: `39bce05fa2e87f3746ee3b6dcd7433065cb2d876`;
- `develop` verificato ancora sul medesimo SHA all'apertura di DOS-M5-01;
- runtime canary DOS-M4-01: PASS;
- `Docente OS confirmedLevel = 4`;
- next target: `5`;
- next required evidence: `REGRESSION_HISTORY + ADOPTION_EVIDENCE`.

Poiché `develop` non è avanzato oltre `39bce05f…`, all'apertura di questo dossier **non esiste ancora una modifica prodotto post-L4** che possa essere usata onestamente come checkpoint `COMPATIBLE_CHANGE`.

## 3. Regole applicate

Un finding usa una sola classificazione:

- `PRODUCT_REGRESSION`;
- `TEST_HARNESS_REGRESSION`;
- `INFRASTRUCTURE_REGRESSION`;
- `NO_REGRESSION`.

Un checkpoint post-L4 deve avere:

- `checkpointId` univoco;
- `observedAt`;
- `triggerType` in `HUMAN_REAL_USE_PERIOD | COMPATIBLE_CHANGE | REGRESSION_REMEDIATION | PERIODIC_RECERTIFICATION`;
- `triggerRef` univoco e non riutilizzabile;
- `exactHead` e/o `runtimeRef` quando applicabili;
- `evidenceRefs` verificabili.

Più run/retry dello stesso trigger valgono come un solo checkpoint. Rerun consecutivi creati solo per aumentare il numero di prove non sono ammissibili.

## 4. Ledger storico pre-L4

Le voci di questa sezione sono parte della storia richiesta dal contratto, ma **non sostituiscono i due checkpoint post-L4**.

### RH-HIST-688 — bottom navigation mobile

```yaml
ledgerId: RH-HIST-688
classification: PRODUCT_REGRESSION
observedAt: 2026-10-06
surface: mobile bottom navigation
sourceRef: github:docente-os-2026-27/pull/688
implementationHead: 97239044a9d833a254dddbd0a662fd7eb2218219
mergeCommit: 2039bb97f4a80d8a4baa3d2582f8839243e1caa9
status: CLOSED
```

**Sintomo osservato.** La UI rendeva cinque destinazioni, ma la regola CSS usava ancora un numero di colonne fisso; il contratto approvato richiedeva che il layout derivasse dagli elementi effettivamente renderizzati.

**Root cause.** Assunzione statica nel layout (`repeat(5, …)`) non coerente con membership dinamica della bottom navigation.

**Remediation.** Colonne derivate implicitamente dalle destinazioni renderizzate tramite `grid-auto-flow: column` e `grid-auto-columns: minmax(0,1fr)`; aggiunto il regression contract sul selettore reale della bottom navigation.

**Non ricorrenza / ricertificazione.** PR #688 registra HR-01 `CLOSED / PASS` sull'exact head `97239044…`, con Product CI, Design Policy, Browser Certification/HVA, WCAG, P6, X3 e X4 PASS prima del merge. Il merge in `develop` è `2039bb97…`.

Verdetto storico: **regressione prodotto reale identificata, corretta e ricertificata**.

### RH-HIST-689 — H1 e login AAL2

```yaml
ledgerId: RH-HIST-689
classification: TEST_HARNESS_REGRESSION
observedAt: 2026-10-06
surface: H1 mobile comfort gate / authentication harness
sourceRef: github:docente-os-2026-27/pull/689
baseHead: 2039bb97f4a80d8a4baa3d2582f8839243e1caa9
head: de5cc74bd5747945d10e1746443028058cb47cbb
mergeCommit: 5d2afea7ab03c13892e2b16cc774f25cc5a4b35b
status: CLOSED
```

**Sintomo osservato.** H1 attendeva direttamente `/workspace` dopo password; il runtime Beta applicava correttamente AAL2 e redirigeva a `/mfa?next=/workspace`.

**Root cause.** Harness H1 rimasto al percorso AAL1 mentre l'applicazione e gli altri gate governati usavano già MFA/TOTP.

**Remediation.** H1 è stato riallineato al supporto canonico `loginE2E()` + TOTP e alla concurrency MFA governata. Nessuna modifica al prodotto o all'autenticazione applicativa.

**Non ricorrenza / ricertificazione.** Sul merge commit `5d2afea7…`, Product CI, Human Interaction Model e X3 risultano PASS. H1 supera il confine AAL2 e fallisce successivamente sul Piano annuale, rivelando un finding differente poi isolato in #690. La regressione AAL2 non ricorre nella successiva baseline `39bce05f…`, dove H1 è PASS.

Verdetto storico: **regressione del test harness, non regressione prodotto**.

### RH-HIST-690 — H1 e Piano annuale mobile

```yaml
ledgerId: RH-HIST-690
classification: TEST_HARNESS_REGRESSION
observedAt: 2026-10-06
surface: H1 mobile comfort gate / Annual Plan assertion
sourceRef: github:docente-os-2026-27/pull/690
baseHead: 5d2afea7ab03c13892e2b16cc774f25cc5a4b35b
head: 4c67ed244d04aac184513bfaf33aff08313f18d0
mergeCommit: 39bce05fa2e87f3746ee3b6dcd7433065cb2d876
status: CLOSED
```

**Sintomo osservato.** Dopo il corretto login AAL2, H1 continuava ad aspettare `.annualTable` visibile su mobile, mentre la vista canonica sotto `760px` mostrava `.annualMobileBlockList` / `.annualMobileBlockCard` e nascondeva la tabella desktop.

**Root cause.** Aspettativa del test non aggiornata alla rappresentazione mobile già qualificata; nessun difetto della UI prodotto.

**Remediation.** H1 verifica la prima `.annualMobileBlockCard`, contenuto didattico visibile, tabella desktop nascosta e assenza di scroll laterale.

**Non ricorrenza / ricertificazione.** Sul merge commit `39bce05f…` risultano PASS almeno:

- H1 Human Task Comfort Gate — run `37516630871`;
- Product CI — run `37516630876`;
- Human Interaction Model — run `37516630932`;
- X3 E2E Mobile Gate — run `37516630967`.

Verdetto storico: **regressione del test harness chiusa sulla baseline L4**.

## 5. Checkpoint zero — baseline stabilizzata L4

```yaml
checkpointId: DOS-M5-01-CP0-L4-BASELINE
observedAt: 2026-10-07T02:13:36.899Z
triggerType: REGRESSION_REMEDIATION
triggerRef: DOS-M4-01-RUNTIME-CANARY-37560864731
exactHead: 39bce05fa2e87f3746ee3b6dcd7433065cb2d876
runtimeRef: dep-db2ke2ajnfac73f3qoog
evidenceRefs:
  - docs/qualification/DOS-M4-01-runtime-canary.md
  - github-actions:docente-os-2026-27/run/37560864731
verdict: NO_REGRESSION
role: L4_BASELINE_ONLY
```

CP0 è la baseline iniziale stabilizzata prevista da DOS-M5-00. **Non conta come uno dei due checkpoint post-L4.**

## 6. Checkpoint post-L4

### DOS-M5-01-CP1

```yaml
checkpointId: DOS-M5-01-CP1
status: PENDING
observedAt: null
triggerType: null
triggerRef: null
exactHead: null
runtimeRef: null
evidenceRefs: []
verdict: null
```

Condizione di popolamento: il primo evento successivo alla baseline L4 che soddisfa realmente uno dei trigger ammessi dal contratto.

### DOS-M5-01-CP2

```yaml
checkpointId: DOS-M5-01-CP2
status: PENDING
observedAt: null
triggerType: null
triggerRef: null
exactHead: null
runtimeRef: null
evidenceRefs: []
verdict: null
```

Condizione di popolamento: un secondo evento indipendente, con `triggerRef` diverso da CP1 e non derivato dallo stesso run, retry o occasione professionale.

## 7. Trigger ammissibili per i checkpoint mancanti

Il dossier può usare, quando avvengono realmente:

1. **HUMAN_REAL_USE_PERIOD** — un periodo/occasione professionale reale con binding positivo; può essere condiviso con DOS-M5-02 solo se il `triggerRef` rimane univoco nel ledger e l'evidenza non viene doppio-contata;
2. **COMPATIBLE_CHANGE** — una modifica compatibile integrata in Docente OS, con nuovo exact head e ricertificazione appropriata;
3. **REGRESSION_REMEDIATION** — un finding reale successivo a L4, correttamente classificato, corretto e ricertificato;
4. **PERIODIC_RECERTIFICATION** — una ricertificazione separata da un trigger operativo indipendente, non un rerun consecutivo creato per soddisfare la soglia.

## 8. Anti-gaming decision

Alla data di apertura di DOS-M5-01:

- `develop` è ancora `39bce05f…`;
- non è presente un nuovo compatible product head;
- non sono stati identificati due trigger post-L4 indipendenti già qualificabili;
- eseguire ora due H1/X3 consecutivi sulla stessa baseline con il solo scopo di riempire CP1/CP2 violerebbe il contratto DOS-M5-00.

Per questo il dossier resta correttamente `CHECKPOINTS_PENDING`.

## 9. Criterio di uscita

DOS-M5-01 può diventare `REGRESSION_HISTORY_PASS` soltanto quando:

- il ledger storico #688/#689/#690 rimane verificabile e coerente;
- CP0 è conservato come baseline L4;
- CP1 e CP2 sono entrambi `COMPLETE`;
- CP1 e CP2 hanno `triggerRef` distinti e non condividono lo stesso run/attempt/evento;
- ogni finding è classificato correttamente;
- nessuna regressione prodotto critica rimane aperta;
- le remediation, quando presenti, hanno evidenza di non ricorrenza;
- una Human Review conclude che la storia dimostra stabilità nel tempo e capacità di gestione delle regressioni;
- solo allora può essere preparata una evidenza canonica `REGRESSION_HISTORY` per DOS-M5-03.

Fino ad allora:

**stato = DRAFT / CHECKPOINTS_PENDING**.

## 10. Confini invariati

DOS-M5-01 non autorizza:

- promozione L5;
- modifica del maturity registry o snapshot come se `REGRESSION_HISTORY` fosse già PASS;
- Production;
- cambio authority;
- modifica di `DOS-A1`;
- tracking studente;
- creazione artificiale di eventi prodotto o workflow run per soddisfare la soglia.