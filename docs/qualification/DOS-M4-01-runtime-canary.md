# DOS-M4-01 — Docente OS L3 → L4 runtime-canary qualification

**Stato:** PREPARED / ACTIONS-DEPENDENT CLOSEOUT  
**Data:** 5 ottobre 2026  
**Ambito:** Docente OS product maturity  
**Authority effect:** NONE  
**DOS-A1:** RUNTIME_DEFERRED

## 1. Obiettivo

Chiudere il solo gap formale che oggi separa Docente OS da L4 nel modello TRAMA: una evidenza `RUNTIME_CANARY` forte, version-bound e verificabile.

Nessun nuovo sviluppo funzionale è richiesto da questo pacchetto. La qualificazione non autorizza Production, non cambia authority e non abilita DOS-A1.

## 2. Baseline candidata

- repository: `antoniocorsano-boop/docente-os-2026-27`;
- active development ref: `develop`;
- exact head candidato: `09a3a3600b81992f3675be82d1d2f188f1643909`;
- Beta canonica registrata dall'audit corrente: deploy Render `dep-db180cavcj2c739v6lc0`, LIVE sullo stesso SHA.

Prima della chiusura formale occorre riconfermare che la versione distribuita osservata durante la canary corrisponda ancora a questo exact head. In caso di drift, la prova deve essere ribasata sul nuovo exact head e non riutilizzata sinteticamente.

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
id: EV-MAT-DOS-RUNTIME-CANARY-2026-10-05
type: RUNTIME_CANARY
area: docente-os
status: PASS
source:
  repository: antoniocorsano-boop/docente-os-2026-27
  ref: <runtime/deploy receipt>
observedAt: <timestamp UTC>
freshness:
  policy: RUNTIME_BOUND
confidence: HIGH
supports:
  - level: 4
binding:
  areaRef: docente-os
  releaseRef: <Docente OS release/deploy ref>
  exactHead: <40-hex exact head osservato>
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

## 7. Incidente GitHub Actions

Al momento della preparazione di DOS-M4-01 GitHub Actions presenta un incidente esterno sui runner hosted. Ritardi, code o mancata assegnazione dei runner non devono essere interpretati come regressioni Docente OS.

Finché Actions resta degradato è ammesso preparare il pacchetto, verificare la baseline e raccogliere la canary runtime. La chiusura formale L4 resta sospesa fino al ritorno operativo di Actions e al completamento dei gate richiesti.

## 8. Criterio di uscita

DOS-M4-01 è `CLOSED / L4 VERIFIED` soltanto quando:

- la `RUNTIME_CANARY` è PASS e version-bound;
- tutti gli altri tipi di evidenza L4 restano validi;
- snapshot/registry calcolano deterministically `confirmedLevel = 4`;
- i gate automatici richiesti sono PASS sullo stesso perimetro;
- Human Exact-Head Review è PASS;
- `DOS-A1=RUNTIME_DEFERRED` resta invariato;
- nessuna promozione Production è stata implicitamente derivata.
