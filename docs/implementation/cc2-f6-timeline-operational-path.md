# CC2-F6 — Timeline + Operational Path

**Stato:** ACTIVE / implementation slice  
**Runtime:** READ_ONLY / SNAPSHOT_FIRST / NO NEW AUTHORITY  
**Principio:** il percorso operativo riflette fonti canoniche esistenti; la timeline registra solo eventi espliciti con provenienza.

## Scopo

CC2-F6 completa il primo ciclo del Control Center v2 con due viste specialistiche:

1. **Percorso operativo** — dove siamo, quali gate vengono dopo, quali incrementi dipendono da essi e quali defer restano espliciti.
2. **Cronologia governata** — come siamo arrivati allo stato attuale tramite eventi semantici con fonte dichiarata.

Nessuna delle due viste crea una roadmap concorrente.

## Percorso operativo

Il percorso operativo è derivato esclusivamente dallo snapshot corrente:

- attività correnti da fasi e capability in stato ACTIVE / IN_PROGRESS;
- prossimi gate dai gate bloccanti non PASS;
- prossimi incrementi dagli expansion candidate registrati;
- defer espliciti dalle capability DEFERRED;
- dipendenze non soddisfatte risolvendo i `dependencyRefs` contro gate, capability e dependency già presenti.

Non vengono inventati task, milestone o priorità non registrate.

## Cronologia governata

La timeline non è un log GitHub.

Usa `status/governed-events.json`, registrato nel source registry e validato da schema dedicato.

Event type ammessi:

- HUMAN_REVIEW;
- MERGE;
- ADR_APPROVAL;
- GATE_PASS;
- CAPABILITY_PROMOTION;
- RUNTIME_AUTHORIZATION;
- DEPRECATION;
- SUPERSESSION.

Ogni evento deve avere:

- timestamp;
- subjectRef;
- sourceRef;
- authority;
- versionRef quando disponibile;
- dettagli descrittivi.

## Copertura

La timeline iniziale usa:

`PARTIAL_EXPLICIT`

Questo significa che:

- mostra soltanto eventi esplicitamente registrati;
- non ricostruisce retroattivamente eventi storici mancanti;
- l'assenza di un evento dalla timeline non prova che l'evento non sia mai avvenuto;
- la UI deve mostrare sempre modalità e data di inizio copertura.

## Seed iniziale

Il registro v1 parte dagli eventi verificati:

- merge #81 — CC2-F1/E;
- merge #82 — Penpot MCP pilot refresh;
- merge #83 — Penpot design system refresh;
- merge #84 — CC2-F4;
- merge #85 — CC2-F5;
- supersession #70 → #81;
- supersession #78 → #82;
- supersession #79 → #83.

I timestamp sono bound alle date effettive delle PR.

## UI

`control-center/operations.html` espone due tab:

- Percorso operativo;
- Cronologia governata.

La Home mantiene un solo link specialistico dalla sezione Fasi.

La vista:

- usa lo stesso snapshot locale;
- non effettua fetch GitHub diretti;
- è disponibile offline nella PWA;
- ha layout mobile autonomo;
- mantiene target interattivi minimi;
- non offre azioni di write o approvazione.

## Invarianti

Restano invariati:

- Control Center READ_ONLY;
- NO_SYNTHETIC_AUTHORITY;
- NO_AUTO_PROMOTION;
- NO_RUNTIME_AUTHORIZATION;
- nessun overall score;
- DOS-A1 resta RUNTIME_DEFERRED;
- Docente OS → Atlas resta FUTURE_NOT_AUTHORIZED / NOT_AUTHORIZED;
- timeline e operational path sono proiezioni, non nuove fonti autorevoli.

## Definition of Done F6

- schema `governed-events`;
- source registry aggiornato;
- snapshot 1.3 con `operationalPath`, `timelineEvents` e `timelineCoverage`;
- builder deterministico;
- vista specialistica mobile/PWA;
- gate CI per schema, provenance, projection e drift;
- STATUS / ROADMAP riallineati;
- review indipendente;
- HUMAN EXACT-HEAD REVIEW prima del merge.
