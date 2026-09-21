# TRAMA-SA-01/R3B — Validazione stratificata

Stato: **DEVELOPMENT_COMPLETE / HOLDOUT_GATE_PREPARED_NOT_YET_EXECUTED**

## Autorizzazione

R3B è autorizzato il 21 settembre 2026 come prosecuzione metodologica di R3.

L'autorizzazione riguarda esclusivamente:
- dati sintetici;
- lo split DEVELOPMENT;
- output advisory-only;
- nessuna scrittura runtime;
- revisione umana obbligatoria.

Non modifica `TRAMA-ADR-009`, non autorizza TypeSafe nei prodotti e non modifica `DOS-A1`.

## Perché R3B

R3 DEVELOPMENT ha ottenuto 32/32 sullo split eseguito, ma lo split non era stratificato:
- DEVELOPMENT: 12 ALIGNED, 12 PARTIAL, 8 CONTRADICTORY, 0 INSUFFICIENT_EVIDENCE;
- HOLDOUT: 4 CONTRADICTORY, 12 INSUFFICIENT_EVIDENCE.

R3B corregge il disegno **senza riutilizzare i casi osservati di R3**.

## Corpus

48 nuovi casi sintetici preregistrati:
- 12 ALIGNED;
- 12 PARTIAL;
- 12 CONTRADICTORY;
- 12 INSUFFICIENT_EVIDENCE.

Domini:
- Tecnologia;
- Matematica;
- Scienze;
- Geografia.

## Split stratificato

DEVELOPMENT: 32 casi
- 8 ALIGNED;
- 8 PARTIAL;
- 8 CONTRADICTORY;
- 8 INSUFFICIENT_EVIDENCE.

HOLDOUT: 16 casi
- 4 ALIGNED;
- 4 PARTIAL;
- 4 CONTRADICTORY;
- 4 INSUFFICIENT_EVIDENCE.

I 16 HOLDOUT sono congelati e richiedono una nuova autorizzazione umana dopo l'analisi DEVELOPMENT.

## Disegno semantico

R3B conserva il disegno R2/R3:
1. pre-gate deterministico;
2. giudizio `evidence_sufficient`;
3. solo se sufficiente, giudizio `alignment`;
4. nessun output autorizza azioni;
5. `advisoryOnly=true`;
6. digest dello stato valutato;
7. revisione umana.

Boundary sperimentale: `0.5`, solo per query routing.

Fascia di attenzione:
- evidence Noul tra 0.4 e 0.6;
- alignment confidence < 0.7;
- qualunque disaccordo con l'etichetta preregistrata.

## Gate DEVELOPMENT

Prima di proporre lo sblocco HOLDOUT devono essere verificati almeno:
- 32 risultati o fallimento esplicito;
- 0 errori provider non gestiti;
- 0 falsi ALIGNED su casi non ALIGNED;
- analisi separata dei casi INSUFFICIENT_EVIDENCE;
- confusion matrix;
- casi incerti;
- token e latenza;
- review umana.

## Holdout

Il workflow corrente non esegue HOLDOUT.

L'harness rifiuta `--split HOLDOUT` salvo autorizzazione esplicita codificata in una modifica successiva.

## Governance

- `TRAMA-ADR-009 = PROPOSED`;
- runtime TypeSafe = NOT_AUTHORIZED;
- `DOS-A1 = RUNTIME_DEFERRED`.


## Post-DEVELOPMENT adjudication e gate HOLDOUT

Il DEVELOPMENT è chiuso con esito **PASS_WITH_ONE_ADJUDICATED_ERROR**.

- TypeSafe vs ground truth preregistrato: 32/32;
- dopo adjudication umana di `SA01-R3B-003 = PARTIAL`: 31/32;
- corpus, prompt, boundary e 16 casi HOLDOUT restano invariati;
- nessun tuning è stato effettuato sui casi HOLDOUT.

La modifica successiva abilita tecnicamente un workflow separato HOLDOUT. L'esecuzione resta un gate distinto e non modifica ADR-009 né autorizza runtime.
