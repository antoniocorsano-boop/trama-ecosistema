# ProjectContextSnapshot v1 — contratto governato

**Data:** 24 settembre 2026  
**Stato:** PROPOSED / READ-ONLY / NO_RUNTIME_AUTHORIZATION  
**Owner:** TRAMA Control Center v2

## Scopo

Definire il contratto minimo del `ProjectContextSnapshot`, distinto dall'`ecosystem-snapshot` di maturità.

Il contratto serve a rappresentare il contesto operativo corrente necessario per lavorare su una capability senza dover ricostruire manualmente decisioni, gate, PR, exact head e dipendenze.

## Principio

`ProjectContextSnapshot` è una **proiezione derivata**. Non crea authority e non sostituisce le fonti canoniche.

## Struttura logica

```json
{
  "schemaVersion": "1.0.0",
  "generatedAt": "2026-09-24T00:00:00Z",
  "project": "TRAMA",
  "currentPhase": null,
  "activeCapabilities": [],
  "activeWorkstreams": [],
  "canonicalDecisions": [],
  "activeInvariants": [],
  "repositories": [],
  "openPullRequests": [],
  "activeExactHeads": [],
  "blockingGates": [],
  "pendingHumanReviews": [],
  "dependencies": [],
  "knownConflicts": [],
  "recentlyCompleted": [],
  "knownRejectedApproaches": [],
  "nextValidActions": [],
  "knowledgeSources": []
}
```

## Campi obbligatori per elemento derivato

Ogni elemento significativo deve poter riportare:

- `id`;
- `subject`;
- `status`;
- `sourceRefs[]`;
- `observedAt` o `validFrom`;
- `scope`;
- `freshness` quando pertinente.

Per informazioni tecniche forti:

- `repositoryRef`;
- `capabilityRef`;
- `releaseRef` quando esiste;
- `exactHead` quando esiste.

## Stati consentiti

Per gli elementi di conoscenza:

- `CURRENT`;
- `SUPERSEDED`;
- `DEFERRED`;
- `REJECTED`;
- `EXPIRED`;
- `HISTORICAL`.

Per gate e review si riusano gli stati canonici già governati dal relativo dominio.

## Regole di popolamento

1. Nessun fatto senza fonte.
2. Nessun exact head inventato o inferito.
3. Nessun gate chiuso per assenza di evidenza contraria.
4. Nessuna decisione proposta elevata ad approvata dalla proiezione.
5. Informazioni scadute possono restare nello storico ma non sostenere `CURRENT`.
6. Una decisione `SUPERSEDED` resta recuperabile con collegamento alla decisione sostitutiva.
7. Un approccio `REJECTED` o `FAILURE_LEARNING` deve poter essere restituito quando una nuova proposta rischia di ripeterlo.

## NextValidAction

`nextValidActions[]` descrive azioni consentite dal quadro corrente; non sono comandi automatici.

Campi raccomandati:

```json
{
  "id": "NVA-...",
  "subject": "...",
  "action": "...",
  "preconditions": [],
  "blockedBy": [],
  "sourceRefs": []
}
```

## KnownConflict

Serve a rappresentare lavoro parallelo che può invalidare o rendere prematura un'azione.

Campi raccomandati:

- `id`;
- `subjects[]`;
- `severity`;
- `reason`;
- `resolutionRule`;
- `sourceRefs[]`.

## Provenance

`knowledgeSources[]` deve dichiarare le fonti effettivamente usate per generare lo snapshot, con:

- tipo;
- repository/documento;
- ref/versione;
- hash quando disponibile;
- timestamp di osservazione.

## Consistenza

La generazione deve fallire in modo esplicito quando:

- una fonte obbligatoria non è leggibile;
- una struttura richiesta è invalida;
- un elemento forte manca del binding previsto;
- una decisione corrente presenta riferimenti contraddittori non risolti.

In tali casi è preferibile uno snapshot `PARTIAL` esplicito a una sintesi apparentemente completa.

## Relazione con ecosystem-snapshot

`ecosystem-snapshot` continua a descrivere maturità, evidenze, gate e dipendenze.

`ProjectContextSnapshot` può riferenciarlo, ma non deve duplicarne arbitrariamente la logica di valutazione.

## Privacy

Il contratto non richiede:

- dati personali studente;
- account studente;
- profili individuali;
- dati personali del docente per funzionare.

## Gate

Prima di qualunque uso agentico operativo:

- schema JSON dedicato;
- fixture positive e negative;
- validazione provenance;
- test freshness;
- test supersession;
- test negative-knowledge retention;
- review indipendente;
- HUMAN EXACT-HEAD REVIEW — PASS.
