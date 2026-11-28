# TRAMA Contextual Copilot Core v0 — implementation plan

**Data:** 2026-10-24  
**Stato:** IMPLEMENTATION AUTHORIZED / NO MERGE / NO DEPLOY  
**Baseline:** `main@f666239cfdb359ecf52342ed3502f4a60233ea45`  
**Contratto canonico:** `docs/superpowers/specs/2026-10-24-trama-contextual-copilot-core-v0-contract.md`  
**Baseline di ricerca preservata:** ramo `docs/contextual-copilot-core`  
**Contratti subordinanti:** OR-07 Shared Capability Layer · OR-08 Runtime Portability

## Obiettivo

Materializzare il minimo nucleo headless condiviso necessario a Docente OS, `registro-docente` e futuri consumer senza creare un secondo prodotto, un server centrale o un'autorità sui dati di dominio.

Il risultato deve essere un artefatto importabile e versionato, privo di dipendenze da provider e da tipi verticali, che applichi l'ordine:

```text
Policy > capability dichiarate dall'app > stato > semantica > preferenze
```

## Collocazione

Il modulo vive in:

`shared/contextual-copilot-core/`

con un proprio `package.json` e nessuna dipendenza JavaScript alla radice di TRAMA.

Il pacchetto è `private` nel primo incremento: la qualifica riguarda il contratto e l'artefatto riproducibile, non la pubblicazione su un registro esterno.

## Vincoli

- nessun branching per `appId` nel Core;
- nessun import di route, componenti o tipi verticali;
- nessuna dipendenza da provider generativo, embedding o vector store;
- nessuna rete necessaria per i test;
- nessuna authority di write trasferita al Core;
- `INSTITUTIONAL_DECISION` sempre negata dal motore generico;
- `WRITE_REVERSIBLE` e `WRITE_EXTERNAL` richiedono gate umano prima dell'esecuzione;
- i guardrail minimi di rischio sono invarianti del Core e non sono indebolibili da policy iniettate;
- classi studente protette mai inviate automaticamente a provider remoto;
- ogni Semantic Port dichiara esplicitamente `local` o `remote`;
- un Semantic Port remoto non riceve contesto protetto o non autorizzato;
- la semantica può riordinare solo azioni già autorizzate, mai crearne di nuove;
- un errore semantico degrada al ranking deterministico;
- un errore della policy fallisce chiuso senza raggiungere l'esecutore;
- modalità senza provider generativo pienamente valida;
- nessun merge o deploy implicito.

## Task 1 — RED causale cross-app

Creare una suite con fixture Docente OS e `registro-docente` che richieda:

- stesso resolver per entrambi i consumer;
- filtraggio sulle capability dichiarate;
- policy prima del dispatch;
- nessuna esecuzione dopo deny;
- conferma umana prima di write reversibile;
- ranking semantico incapace di introdurre capability;
- assenza di identificatori applicativi nel sorgente del Core.

Il RED è valido quando fallisce per assenza dell'implementazione `src/index.js`.

## Task 2 — GREEN minimo

Implementare:

- vocabolari `CapabilityId`, `ActionRisk`, data classification;
- validazione `ContextSnapshot`;
- `ActionRegistry` deterministico;
- policy engine fail-closed;
- guardrail di rischio obbligatori applicati dal Core prima delle policy iniettate;
- risoluzione azioni provider-neutral;
- dispatch con secondo controllo policy e gate umano;
- Semantic Port con località esplicita e filtro privacy per i flussi remoti;
- ranking semantico opzionale limitato alle azioni già ammesse;
- isolamento dei guasti semantici e policy.

## Task 3 — superficie di import stabile

Esporre:

- `src/index.js` come runtime ESM;
- `index.d.ts` come contratto TypeScript pubblico;
- `package.json` con export esplicito;
- `README.md` con confini OR-07/OR-08 e modalità di verifica.

Nessuna nuova dipendenza esterna.

## Task 4 — qualifica dell'artefatto

Eseguire sul candidato esatto:

```bash
npm test
npm pack --dry-run
```

Il pacchetto deve includere soltanto runtime, tipi e README; nessuna fixture o documento di governance deve entrare nell'artefatto distribuibile.

## Task 5 — integrazione CI e review

Aggiungere il test del Core alla qualifica TRAMA esistente senza cambiare authority o runtime. Aprire PR Draft verso `main`, registrare RED e GREEN exact-SHA e attendere i gate automatici prima di qualunque decisione di integrazione.

La review finale deve includere prove causali che una policy permissiva non possa aggirare i guardrail del Core e che un Semantic Port remoto non riceva contesti protetti o non autorizzati.

## Criterio di uscita

CORE-01 v0 è tecnicamente candidato quando:

1. la prova cross-app è GREEN;
2. nessun branching applicativo compare nel Core;
3. policy, guardrail obbligatori e gate umano sono verificati;
4. località e privacy del Semantic Port sono verificate;
5. `npm pack --dry-run` produce un artefatto stabile;
6. il vocabolario è conforme a TERM-01;
7. i gate TRAMA dell'exact head risultano verdi;
8. nessun merge/deploy è stato eseguito.

Solo dopo questo confine `registro-docente` può avviare LIB-01B consumando l'artefatto condiviso, senza resolver sostitutivi locali.
