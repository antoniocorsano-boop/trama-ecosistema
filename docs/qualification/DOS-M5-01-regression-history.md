# DOS-M5-01 — Docente OS L5 regression history

**Stato:** DRAFT / EVIDENCE_READY / HUMAN_REVIEW_PENDING  
**Data:** 17 ottobre 2026  
**Ambito:** Docente OS product maturity  
**Contratto:** `docs/qualification/DOS-M5-00-evidence-contract.md`  
**Authority effect:** NONE  
**Production effect:** NONE  
**DOS-A1:** RUNTIME_DEFERRED

## 1. Obiettivo

Costruire la `REGRESSION_HISTORY` richiesta per Docente OS L5, distinguendo regressioni di prodotto, test harness e infrastruttura, documentando remediation e non ricorrenza e acquisendo almeno due checkpoint post-L4 realmente distinti secondo il contratto DOS-M5-00.

DOS-M5-01 non promuove L5, non modifica il maturity registry e non genera automaticamente una evidenza `REGRESSION_HISTORY` canonica finché la Human Review conclusiva non è PASS sul medesimo exact head.

## 2. Baseline canonica

Baseline TRAMA di apertura:

- repository: `antoniocorsano-boop/trama-ecosistema`;
- ref: `main`;
- exact head all'apertura: `dd8bfab5032137a8591c209004bbd643bf23e8cd`;
- DOS-M5-00: `CONTRACT_APPROVED / HUMAN_REVIEW_PASS / INTEGRATED`.

Baseline prodotto L4:

- repository: `antoniocorsano-boop/docente-os-2026-27`;
- exact head L4: `39bce05fa2e87f3746ee3b6dcd7433065cb2d876`;
- runtime canary DOS-M4-01: PASS;
- `Docente OS confirmedLevel = 4`;
- next target: `5`;
- next required evidence: `REGRESSION_HISTORY + ADOPTION_EVIDENCE`.

Baseline prodotto congelata dopo i checkpoint post-L4 e il closeout lean:

- `develop@3f2b4fbac475109fdc331415aa16af680fd96c87`;
- merge #716 `DOS-CLOSE-01`;
- nessun nuovo ciclo funzionale autorizzato;
- DOC-04 completo resta residuo separato e non viene usato per gonfiare il livello di maturità.

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

**Remediation.** Colonne derivate dagli elementi renderizzati e regression contract sul selettore reale della bottom navigation.

**Non ricorrenza / ricertificazione.** PR #688 registra HR-01 `CLOSED / PASS` sull'exact head `97239044…`, con Product CI e gate visuali/di accessibilità PASS prima del merge `2039bb97…`.

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

**Root cause.** Harness H1 rimasto al percorso AAL1 mentre l'applicazione usava già MFA/TOTP.

**Remediation.** H1 riallineato al supporto canonico di login + TOTP. Nessuna modifica al prodotto o all'autenticazione applicativa.

**Non ricorrenza / ricertificazione.** La regressione AAL2 non ricorre nella successiva baseline `39bce05f…`, dove H1 è PASS.

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

**Sintomo osservato.** Dopo il corretto login AAL2, H1 continuava ad aspettare la tabella desktop visibile su mobile, mentre la vista canonica usava la lista verticale mobile.

**Root cause.** Aspettativa del test non aggiornata alla rappresentazione mobile già qualificata; nessun difetto della UI prodotto.

**Remediation.** H1 verifica la rappresentazione mobile canonica, la tabella desktop nascosta e l'assenza di scroll laterale.

**Non ricorrenza / ricertificazione.** Sul merge commit `39bce05f…` H1, Product CI, Human Interaction Model e X3 risultano PASS.

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

### DOS-M5-01-CP1 — MATERIAL-CORE-01

```yaml
checkpointId: DOS-M5-01-CP1
status: COMPLETE
observedAt: 2026-10-17T03:27:50Z
triggerType: COMPATIBLE_CHANGE
triggerRef: github:docente-os-2026-27/pull/712:merge:83e98f8955b52e02367f4c166b3df65e1c0d9de6
exactHead: 7e0eca972e3fe2b823e0369272bb0635a8163b6b
mergeCommit: 83e98f8955b52e02367f4c166b3df65e1c0d9de6
evidenceRefs:
  - github:docente-os-2026-27/pull/712
  - github-actions:docente-os-2026-27/run/38997476198
  - github-actions:docente-os-2026-27/run/38997820114
verdict: NO_REGRESSION
```

**Perché è ammissibile.** #712 è una modifica prodotto post-L4 distinta, classificata `COMPATIBLE`, integrata dopo qualificazione exact-head. Il Product CI finale `38997476198` è PASS con typecheck, suite completa, lint, build e replay dell'intera catena Supabase. La Candidate Qualification `38997820114` è PASS sullo stesso exact head, includendo HVA, WCAG 2.2 AA, ASVS, K1, P6, X3/X4 e DB assurance.

**Finding interno gestito.** La review finale ha individuato un problema di composizione cross-block prima dell'integrazione. È stato osservato un RED specifico, corretto e ricertificato sul final head `7e0eca…`; non resta una regressione critica aperta nel checkpoint integrato.

Verdetto CP1: **stabilità preservata dopo un cambiamento sostanziale dell'autorità canonica dei materiali, con finding reale gestito prima dell'integrazione**.

### DOS-M5-01-CP2 — MATERIAL-TASK-UX-01

```yaml
checkpointId: DOS-M5-01-CP2
status: COMPLETE
observedAt: 2026-10-17T05:11:50Z
triggerType: COMPATIBLE_CHANGE
triggerRef: github:docente-os-2026-27/pull/713:merge:0b1dca72a940d02961cbc2a9ba3f7365dda43e2f
exactHead: 0adc4817590c7a1855eea6510b63163123f5e1a4
mergeCommit: 0b1dca72a940d02961cbc2a9ba3f7365dda43e2f
evidenceRefs:
  - github:docente-os-2026-27/pull/713
  - github-actions:docente-os-2026-27/run/39002587011
  - github-actions:docente-os-2026-27/run/39004275203
  - github-actions:docente-os-2026-27/run/39004275305
verdict: NO_REGRESSION
```

**Perché è ammissibile.** #713 è un secondo cambiamento post-L4, distinto da #712 e costruito sopra il relativo merge commit. Introduce la UX teacher-first `Riutilizza / Adatta / Crea nuovo` senza cambiare schema o autorità. Sul final head `0adc481…` risultano PASS Product CI `39002587011`, DOS-CRM QL-1 `39004275203` e CV2 Candidate Qualification `39004275305`, oltre ai gate di design, interazione, sicurezza e vocabolario governato.

**Finding harness gestito.** La prima verifica ha mostrato che i test UX non venivano realmente selezionati per l'interpretazione dei bracket come glob. Il contratto è stato corretto fino a ottenere un RED reale sulla UX mancante e successivo GREEN. Questo finding è classificato come problema del test harness/contratto di esecuzione, non come falsa regressione prodotto.

Verdetto CP2: **secondo checkpoint indipendente con ricertificazione completa e corretta distinzione fra difetto prodotto e test harness**.

## 7. Verifica successiva di congelamento

Il checkpoint di chiusura prodotto #716 **non viene contato come CP3** e non riusa i trigger CP1/CP2. Serve solo come evidenza di non ricorrenza successiva:

```yaml
verificationId: DOS-M5-01-FREEZE-VERIFY
productBaseline: develop@3f2b4fbac475109fdc331415aa16af680fd96c87
verifiedCheckpointHead: 1d01e715c2e736819c4370b05ffdd0152b8b1792
sourceRef: github:docente-os-2026-27/pull/716
evidenceRef: github-actions:docente-os-2026-27/run/39017397468
result: PASS
role: NON_COUNTING_STABILITY_CONFIRMATION
```

La regressione completa sul checkpoint di closeout ha confermato Product CI PASS con typecheck, product tests, lint, build e runtime release preflight. Il deep replay Supabase è stato selettivamente omesso perché la PR era esclusivamente documentale e non conteneva mutazioni prodotto/schema.

## 8. Anti-gaming decision

I requisiti post-L4 sono soddisfatti senza rerun artificiali:

- CP1 e CP2 derivano da **due PR prodotto integrate differenti**;
- i `triggerRef` sono distinti;
- gli exact head sono distinti;
- CP2 nasce sopra il merge di CP1 e non è un retry dello stesso cambiamento;
- i workflow usati come evidenza appartengono ai rispettivi trigger e non vengono doppio-contati;
- #716 è conservata come sola conferma di stabilità successiva e **non aumenta il conteggio dei checkpoint**.

## 9. Valutazione contro il criterio DOS-M5-00

- baseline M4 presente: **PASS**;
- almeno due checkpoint post-L4: **PASS**;
- `checkpointId` e `triggerRef` distinti: **PASS**;
- nessuna regressione prodotto critica aperta nelle evidenze riesaminate: **PASS**;
- regressioni harness distinte dai difetti prodotto: **PASS**;
- checkpoint bound a exact head e workflow verificabili: **PASS**;
- non ricorrenza supportata anche dalla regressione di closeout: **PASS**;
- Human Review conclusiva: **PENDING**.

Stato tecnico del dossier: **EVIDENCE_READY**.

`REGRESSION_HISTORY` può diventare evidenza canonica **solo** dopo Human Review PASS sul medesimo exact head di questa PR.

## 10. Confini invariati

DOS-M5-01 non autorizza:

- promozione L5;
- modifica del maturity registry o snapshot prima di DOS-M5-03;
- Production;
- cambio authority;
- modifica di `DOS-A1`;
- tracking studente;
- creazione artificiale di eventi prodotto o workflow run per soddisfare la soglia.