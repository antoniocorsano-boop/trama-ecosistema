# ACCESS-01 Phase 0 — Safe Public Gateway Receipt

**Data:** 2026-10-10  
**PR:** #269 — `ACCESS-01 Phase 0 — safe public Gateway`  
**Parent design:** PR #268 — `TRAMA ACCESS-01 — Ecosystem access architecture`  
**Execution:** Native / TDD

## Decision

La Phase 0 implementa un solo confine: il TRAMA Gateway deve rimanere una superficie pubblica visibile e funzionante anche quando non esiste ancora una destinazione professionale canonica.

L'assenza di `VITE_TRAMA_ENTRY_HREF` non provoca più un'eccezione di bootstrap. In produzione, la destinazione mancante viene rappresentata come `null`; `Entra in TRAMA` e `Accedi` diventano controlli disabilitati e non navigabili. Quando una destinazione configurata esiste, il comportamento link resta invariato.

Non è stato introdotto alcun URL temporaneo verso Docente OS, Studio Atlas, Arena, Curricolo Atlas o altre superfici.

## TDD evidence

### Task 1 — resolver configurazione

RED exact head: `bf1a9b8780b688bbc927a75dafb36b2a95bbb1c2`

Il Gateway CI ha fallito esattamente perché `resolveGatewayEntryHref` non esisteva ancora.

GREEN: `resolveGatewayEntryHref(configuredHref, production)` ora applica queste regole:

- valore configurato non vuoto → valore trim;
- produzione senza valore → `null`;
- non-produzione senza valore → `/preview`.

### Task 2 — CTA fail-closed non distruttiva

RED exact head: `5f69a6dc0ee32a80f7256beded7755daba76f102`

Il typecheck ha dimostrato che il nuovo `string | null` non era ancora rappresentabile da `TramaGlassAction`.

GREEN exact head: `4897f18bf66258462426bbdd455df255a7a689fa`

TRAMA Gateway run `38079601394` / run #154: **PASS** con destinazione configurata `/ecosistema`.

### Task 3 — doppia Browser Certification

Proof exact head: `86939ac41aaeadabb861dcfde35f0e93c4a1dcfd`

TRAMA Gateway run `38079870875` / run #158:

- typecheck/unit/build: **PASS**;
- Browser Certification configurata: **PASS**;
- No-entry Browser Certification: **PASS**;
- materializzazione evidenze UI: **PASS**.

La prova no-entry verifica esplicitamente che:

- la landing e il suo heading siano visibili;
- `Entra in TRAMA` e `Accedi` siano controlli disabilitati con `aria-disabled="true"`;
- non esistano anchor equivalenti quando Access è indisponibile;
- `Ecosistema`, `Curricolo` e `Guida` continuino a puntare alle rispettive sezioni;
- non venga emesso alcun page error dovuto alla configurazione mancante.

## State-map delta autorizzato dall'evidenza

Promozioni registrate in `governance/access/trama-ecosystem-state-v0.2.json`:

- `gateway.runtimeState`: `BLOCKED_ENTRY` → `PUBLIC_SAFE_ENTRY_UNAVAILABLE`;
- `public_to_gateway.state`: `PARTIAL` → `REAL`.

Resta invariato:

- `gateway_to_trama_access.state`: `DESIGNED`.

Questa Phase 0 **non** dimostra né crea TRAMA Access, SSO, identity provider o federazione di prodotto.

## Terminologia

La qualificazione Governance ha inoltre rilevato forme lessicali non canoniche nei nuovi documenti ACCESS-01. La baseline è stata corretta affinché documenti, metadati e state map usino coerentemente **Curricolo Atlas** e **curricolo di istituto**.

## Confini preservati

- nessun identity provider creato;
- nessun utente migrato;
- nessun database modificato;
- nessun account learner introdotto;
- nessuna authority di prodotto trasferita;
- nessun link professionale fittizio;
- nessun merge automatico;
- nessun deploy automatico autorizzato da questa Phase 0;
- `DOS-A1` resta `RUNTIME_DEFERRED`.

## Condizione di chiusura

La Phase 0 è qualificabile per la decisione umana quando l'exact head finale della PR #269 presenta contemporaneamente:

- TRAMA Gateway: **PASS**, incluse entrambe le Browser Certification;
- Governance: **PASS**, incluso TERM-01;
- PR ancora aperta, Draft e non mergiata.

Il merge e l'eventuale deploy restano decisioni separate.
