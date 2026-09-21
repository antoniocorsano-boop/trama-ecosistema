# ECO-02/P9 — Controllo docente sulle proposte didattiche

Status: **IMPLEMENTED / BETA RECHECK REQUIRED**

Date: 2026-09-21

## Origine

Evidenza umana raccolta sulla Beta Docente OS dopo ECO-02/P8.

Il docente ha rilevato:
- duplicazione percettiva della stessa domanda fra strumento e sequenza;
- qualità insufficiente della domanda guida automatica;
- assenza di modifica diretta della proposta.

## Contratto di esperienza

Il modello canonico diventa:

`disponibile → proposta → eventuale modifica → conferma docente → sequenza`.

Una proposta non può essere mostrata contemporaneamente come strumento ancora disponibile e come elemento già adottato.

La modifica è una decisione distinta dall'accettazione:
- modifica prima dell'accettazione: resta da confermare;
- modifica dopo l'accettazione: invalida l'efficacia della precedente accettazione e richiede una nuova conferma.

## Confini

- Arena resta autorità curricolare;
- Atlas resta eventuale fonte di risorse/proposte, non autorità;
- Docente OS governa preparazione e decisione del docente;
- la proiezione canonica non viene riscritta;
- nessun inserimento o ri-approvazione automatici;
- `DOS-A1` resta `RUNTIME_DEFERRED`.

## Implementazione

Docente OS PR #571 è stata integrata il 21 settembre 2026.

- exact head revisionata: `10662211f8a13300685f2c27dcbf245c82044175`;
- HUMAN EXACT-HEAD REVIEW: **PASS**;
- merge commit: `bbe3d55dddaaea34983ed356abe6a8ffe1891fba`;
- gate automatici: **PASS**;
- thread aperti al merge: **0**.

La capacità è quindi **IMPLEMENTED** nel prodotto. Resta distinto il collaudo Beta post-merge, necessario per chiudere l'evidenza di esperienza mobile del pilota.


## Riproposizione dopo scarto

Lo scarto è una decisione auditabile, non una cancellazione tecnica della storia.

Dopo uno scarto:
- la precedente proposta resta registrata come `DISMISSED`;
- non viene riattivata o riscritta;
- il docente può creare una nuova proposta per la stessa lezione;
- il vincolo di unicità riguarda soltanto le proposte attive;
- il sistema non deve trasformare il nuovo tentativo in un no-op silenzioso.

Questa regola rende effettivo il principio di reversibilità senza perdere tracciabilità.
