# DOS-M4-01 — Docente OS L3 → L4 runtime-canary qualification

**Stato:** CANARY_PASS / L4_PROJECTED — HUMAN_EXACT_HEAD_REVIEW_PENDING
**Data:** 7 ottobre 2026
**Ambito:** Docente OS product maturity
**Authority effect:** NONE
**DOS-A1:** RUNTIME_DEFERRED

## 1. Obiettivo

Chiudere in modo evidence-bound il gap formale che separava Docente OS da L4 nel modello TRAMA, acquisendo una `RUNTIME_CANARY` reale, version-bound e verificabile.

La qualificazione non autorizza Production, non cambia authority, non abilita DOS-A1 e non riapre superfici UX deliberate come legacy.

## 2. Baseline osservata

- repository prodotto: `antoniocorsano-boop/docente-os-2026-27`;
- active development ref: `develop`;
- exact product head: `39bce05fa2e87f3746ee3b6dcd7433065cb2d876`;
- Beta canonica Render: deploy `dep-db2ke2ajnfac73f3qoog`, LIVE sullo stesso SHA;
- `/api/build-info`: exact-head binding PASS prima della mutazione;
- AAL2 governato: PASS tramite credenziali tecniche E2E;
- workflow finale: `https://github.com/antoniocorsano-boop/docente-os-2026-27/actions/runs/37560864731`;
- artifact finale: `11457120823` (`sha256:8bfab50dd0505a8a1b05c84f16c5ba3fa4610b9f7fa62a122afcaf07cf62ccc1`).

La prova resta `RUNTIME_BOUND`: un futuro drift del prodotto richiede una nuova canary e non consente il riuso sintetico di questa evidenza.

## 3. Percorso professionale verificato

La canary ha eseguito sul runtime Beta reale:

1. apertura di **Orario**;
2. modifica persistente di un dato reale nel workspace tecnico E2E;
3. impostazione della decorrenza;
4. **Metti in uso** con mutazione reale Supabase;
5. riapertura e reload della vista;
6. verifica della persistenza del marker;
7. verifica browser della nuova bozza derivata dalla versione attiva;
8. seconda sostituzione reale per produrre lineage osservabile;
9. verifica read-only indipendente del datastore: `ACTIVE + DRAFT + ARCHIVED`, con conservazione dei marker nelle versioni precedenti.

Esito: **PASS**.

## 4. Evidenza browser

Ricevuta prodotta dal run `37560864731`:

```yaml
id: EV-MAT-DOS-RUNTIME-CANARY-BROWSER-2026-10-07
type: RUNTIME_CANARY_BROWSER
area: docente-os
status: PASS
source:
  repository: antoniocorsano-boop/docente-os-2026-27
  ref: dep-db2ke2ajnfac73f3qoog
observedAt: "2026-10-07T02:13:36.899Z"
freshness:
  policy: RUNTIME_BOUND
confidence: HIGH
binding:
  areaRef: docente-os
  releaseRef: dep-db2ke2ajnfac73f3qoog
  exactHead: 39bce05fa2e87f3746ee3b6dcd7433065cb2d876
evidence:
  workflowRun: "https://github.com/antoniocorsano-boop/docente-os-2026-27/actions/runs/37560864731"
  aal2: true
  realSupabase: true
  persistedAfterReload: true
  replacementPerformed: true
  nextDraftCopyObserved: true
  activationCount: 2
  finalMarker: "DOS-M4-CANARY-1791339228338-HISTORY"
  effectiveFrom: 2026-10-08
```

## 5. Verifica indipendente di lineage e storico

Una query **read-only** sul progetto Supabase effettivamente usato dalla Beta ha verificato, per il marker finale della canary:

- una versione `ACTIVE` con decorrenza `2026-10-08` e marker finale presente;
- una nuova versione `DRAFT` con copia del marker finale;
- più versioni `ARCHIVED` con intervalli di efficacia chiusi;
- conservazione del marker precedente nelle versioni storiche;
- nessuna perdita dello storico osservato.

La lettura Supabase non ha effettuato mutazioni: tutte le scritture della canary sono avvenute esclusivamente attraverso il flusso browser del prodotto.

## 6. Nota sulla route legacy `/orario/gestisci`

La route non costituisce un blocker DOS-M4. PR Docente OS #684 l'ha deliberatamente trasformata in compatibilità verso `/orario/aggiorna?fase=controllo` per preservare il flusso semplice:

`Orario → Modifica → Data → Controlla → Metti in uso → Orario`.

La qualificazione non reintroduce la vecchia UI tecnica: lineage e storico sono stati verificati senza alterare l'esperienza approvata.

## 7. Evidenza canonica promossa nel registry

Questa PR aggiunge al maturity evidence registry:

```yaml
id: EV-MAT-DOS-RUNTIME-CANARY-2026-10-07
type: RUNTIME_CANARY
area: docente-os
status: PASS
observedAt: "2026-10-07T02:13:36.899Z"
freshness:
  policy: RUNTIME_BOUND
confidence: HIGH
supports:
  - level: 4
binding:
  areaRef: docente-os
  releaseRef: dep-db2ke2ajnfac73f3qoog
  exactHead: 39bce05fa2e87f3746ee3b6dcd7433065cb2d876
```

La proiezione resta read-only e `automaticPromotion=false`.

## 8. Risultato di maturità atteso

Con la `RUNTIME_CANARY` version-bound disponibile insieme alle evidenze già canoniche, la proiezione deterministica deve risultare:

- `Docente OS confirmedLevel = 4`;
- `nextTargetLevel = 5`;
- `nextRequiredEvidenceTypes = REGRESSION_HISTORY + ADOPTION_EVIDENCE`;
- `DOS-A1 = RUNTIME_DEFERRED` invariato.

L4 non implica Production né runtime authorization aggiuntiva.

## 9. Criterio di uscita della PR

DOS-M4-01 può diventare `CLOSED / L4 VERIFIED` soltanto quando, sul **medesimo exact head TRAMA** della PR:

- registry e snapshot proiettano deterministicamente `confirmedLevel = 4`;
- i gate automatici richiesti sono PASS;
- la riconciliazione è coerente con L4;
- una Human Exact-Head Review conclusiva attesta coerenza tra product SHA `39bce05fa2e87f3746ee3b6dcd7433065cb2d876`, deploy `dep-db2ke2ajnfac73f3qoog`, run `37560864731`, evidenza Supabase read-only e proiezione di maturità;
- `DOS-A1=RUNTIME_DEFERRED` resta invariato;
- nessuna promozione Production viene derivata implicitamente.

Fino a quella review finale, lo stato resta **CANARY_PASS / L4_PROJECTED — HUMAN_EXACT_HEAD_REVIEW_PENDING**.
