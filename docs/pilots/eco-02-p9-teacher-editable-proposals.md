# ECO-02/P9 — Controllo docente sulle proposte didattiche

Status: **CANDIDATE / HUMAN REVIEW REQUIRED**

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

## Implementazione candidata

Docente OS PR #571.

TRAMA non promuove questo stato a IMPLEMENTED finché non esiste evidenza di:
1. gate automatici conclusi;
2. exact-head review umana;
3. merge effettivo nel prodotto;
4. verifica Beta del comportamento mobile corretto.


## Riproposizione dopo scarto

Lo scarto è una decisione auditabile, non una cancellazione tecnica della storia.

Dopo uno scarto:
- la precedente proposta resta registrata come `DISMISSED`;
- non viene riattivata o riscritta;
- il docente può creare una nuova proposta per la stessa lezione;
- il vincolo di unicità riguarda soltanto le proposte attive;
- il sistema non deve trasformare il nuovo tentativo in un no-op silenzioso.

Questa regola rende effettivo il principio di reversibilità senza perdere tracciabilità.
