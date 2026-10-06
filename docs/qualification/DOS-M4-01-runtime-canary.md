# DOS-M4-01 — Docente OS L3 → L4 runtime-canary qualification

**Stato:** PREPARED / RUNTIME-BASELINE-BOUND — CANARY_PENDING  
**Data:** 6 ottobre 2026  
**Ambito:** Docente OS product maturity  
**Authority effect:** NONE  
**DOS-A1:** RUNTIME_DEFERRED

## 1. Obiettivo

Chiudere il solo gap formale che oggi separa Docente OS da L4 nel modello TRAMA: una evidenza `RUNTIME_CANARY` forte, version-bound e verificabile.

Nessun nuovo sviluppo funzionale è richiesto da questo pacchetto. La qualificazione non autorizza Production, non cambia authority e non abilita DOS-A1.

## 2. Baseline candidata

- repository: `antoniocorsano-boop/docente-os-2026-27`;
- active development ref: `develop`;
- exact head candidato: `39bce05fa2e87f3746ee3b6dcd7433065cb2d876`;
- Beta canonica Render: deploy `dep-db2ke2ajnfac73f3qoog`, LIVE sullo stesso SHA;
- `/api/build-info`: binding exact-head verificato dal gate H1 post-merge;
- H1 Human Task Comfort Gate: PASS completo sul runtime Beta exact-head, incluse AAL2, Piano annuale mobile e Progetta.

La canary deve essere acquisita su questa baseline. In caso di drift successivo, la prova deve essere ribasata sul nuovo exact head e non riutilizzata sinteticamente.

## 3. Gap L4 corrente

Per Docente OS L4 il modello richiede cumulativamente:

- `DOCUMENT_CANONICAL` — disponibile;
- `CONTRACT_APPROVED` — disponibile;
- `PR_EXACT_HEAD` — disponibile;
- `AUTOMATED_TEST` — disponibile;
- `HUMAN_REVIEW` — disponibile;
- `RUNTIME_CANARY` — mancante nel registry canonico.

La promozione resta evidence-bound e non automatica.

## 4. Canary minima

La canary deve verificare sul runtime Beta un percorso professionale reale e persistente:

1. aprire **Orario**;
2. modificare un dato reale;
3. impostare o verificare la decorrenza;
4. confermare / mettere in uso;
5. riaprire la vista;
6. verificare persistenza, lineage/versioning e assenza di perdita dello storico.

Esito ammesso: `PASS` oppure `FAIL`, senza reinterpretazioni manuali.

## 5. Ricevuta minima richiesta

La ricevuta della canary deve contenere almeno:

```yaml
id: EV-MAT-DOS-RUNTIME-CANARY-2026-10-06
type: RUNTIME_CANARY
area: docente-os
status: PASS
source:
  repository: antoniocorsano-boop/docente-os-2026-27
  ref: dep-db2ke2ajnfac73f3qoog
observedAt: <timestamp UTC>
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

La ricevuta deve essere supportata da prova osservabile della versione runtime, non da una dichiarazione di branch.

## 6. Chiusura formale

Dopo la canary PASS:

1. inserire la nuova evidenza `RUNTIME_CANARY` nel maturity evidence registry;
2. aggiornare o aggiungere i test deterministici affinché la proiezione attesa diventi `Docente OS confirmedLevel = 4`;
3. rigenerare snapshot e riconciliazione;
4. eseguire i gate GitHub Actions richiesti sullo stesso exact head;
5. registrare una Human Exact-Head Review conclusiva che attesti coerenza fra SHA, runtime osservato, risultato della canary e proiezione di maturità;
6. integrare solo dopo PASS coerenti e assenza di drift.

## 7. Stato GitHub Actions

I gate post-merge sono operativi. Product CI e H1 sono PASS sulla baseline corrente; H1 ha verificato anche il binding della Beta all'exact head corrente.

La chiusura formale L4 resta sospesa fino alla `RUNTIME_CANARY` professionale reale e al completamento coerente dei gate richiesti sul perimetro finale.

## 8. Criterio di uscita

DOS-M4-01 è `CLOSED / L4 VERIFIED` soltanto quando:

- la `RUNTIME_CANARY` è PASS e version-bound;
- tutti gli altri tipi di evidenza L4 restano validi;
- snapshot/registry calcolano deterministically `confirmedLevel = 4`;
- i gate automatici richiesti sono PASS sullo stesso perimetro;
- Human Exact-Head Review è PASS;
- `DOS-A1=RUNTIME_DEFERRED` resta invariato;
- nessuna promozione Production è stata implicitamente derivata.
