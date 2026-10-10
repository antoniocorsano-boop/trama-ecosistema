# ACCESS-01 Phase 1 — Professional Identity Contract Receipt

**Data:** 2026-10-10  
**PR:** #270 — `ACCESS-01 Phase 1 — professional identity contract plan`  
**Execution:** Native / TDD  
**Qualification head:** `af6a9ff03b4a7f4acf273422b30017cf51df14d8`  
**Governance:** run `38082630535` / #2119 — **PASS**

## Decision

Phase 1 qualifica il **contratto provider-neutral dell'identità professionale TRAMA** e il relativo threat model. Non crea né dimostra un runtime di autenticazione.

La state map conserva quindi:

- `professional_identity.state = DESIGNED`;
- `professional_identity.contractStatus = QUALIFIED`;
- `professional_identity.runtimeState = NOT_IMPLEMENTED`;
- `trama_access.state = DESIGNED`;
- nessun flow di federazione viene promosso a `REAL`.

## Artefatti qualificati

- `governance/access/trama-professional-identity-contract.v1.schema.json`;
- `governance/access/trama-professional-identity-contract.v1.json`;
- `docs/contracts/TRAMA-PROFESSIONAL-IDENTITY-01.md`;
- `scripts/validate-trama-professional-identity-contract.mjs`;
- `scripts/test-trama-professional-identity-contract-validator.mjs`;
- `governance/access/trama-professional-identity-threat-model.v1.json`;
- `docs/evidence/access-01/access-01-phase-1-professional-identity-threat-model.md`;
- `docs/evidence/access-01/access-01-phase-1-provider-candidate-decision.md`;
- `governance/access/trama-ecosystem-state-v0.2.json`.

## TDD evidence

### Task 1 — contratto provider-neutral

- RED `e6f074e1f344e3aa9a6bae264ba91b5a000b2356` — run `38081871223`: contratto canonico assente;
- RED `808b7bc6958bf7779bd2a281c25d00dd17a11488` — run `38081958905`: schema assente;
- RED `b06bd951ba0740b5b320d9522b75821cd8aee862` — run `38082009225`: documento normativo umano assente;
- GREEN `b0ab1ad434ee1dc5ffd6cfb227eab6b2506315d2` — run `38082069675`.

### Task 2 — validator fail-closed e casi avversari

- RED `460414c0de83dea173c26352efd1fc3fe911f65b` — run `38082122169`: validator assente;
- GREEN `83107654ecdc210de962f745810c931df369b701` — run `38082176800`.

I casi avversari coprono email/mutable metadata come authority, wildcard issuer/audience/redirect, flow implicito, assenza state/nonce, token in URL/localStorage, UUID globale condiviso, permessi fini centrali, applicazioni sconosciute, contaminazione learner, bypass step-up e outage che abbatte superfici pubbliche.

### Task 3 — threat model

- RED `6042002346a88516f22c4d07987d360de1fee720` — run `38082240428`: threat register assente;
- GREEN `dbd5575f61aecb5be1fefac5b518194c82d9f32e` — run `38082307351`.

Sono qualificati i threat `T01–T12`, inclusi token leakage, PKCE, redirect, CSRF/state, replay/nonce, issuer/audience confusion, account linking, escalation, provider outage, logout stale, governance step-up e learner contamination.

### Task 4 — provider candidate

Il decision record qualifica soltanto una **candidatura condizionata**:

- candidato Phase 2: progetto Supabase Auth dedicato a TRAMA;
- portability/exit option: Keycloak;
- gap aperti da provare in Phase 2: enforcement PKCE `S256`, semantics di logout federato, session expiry/revalidation, regione UE e assenza di coupling a dati/tabelle di prodotto.

Stato obbligatorio:

- `CANDIDATE_ONLY`;
- `NOT_RUNTIME_AUTHORIZED`;
- `NO PROJECT CREATED`;
- `NO COST AUTHORIZED`.

### Task 5 — Governance permanente e state integrity

Il workflow temporaneo TDD è stato rimosso. `.github/workflows/governance.yml` contiene ora in modo permanente:

- `Validate ACCESS-01 professional identity contract`;
- `Test ACCESS-01 professional identity contract adversarial cases`.

Sul qualification head `af6a9ff0…`, entrambi i gate sono **PASS** e l'intera Governance #2119 è **PASS**.

## Confini preservati

Phase 1 **non** ha:

- creato un identity provider o un progetto Supabase/Keycloak;
- autorizzato costi;
- configurato callback OAuth/OIDC reali;
- migrato utenti;
- creato una sessione TRAMA Access;
- federato Docente OS, Arena, Studio Atlas, Curricolo Atlas o Control Center;
- modificato database o RLS di prodotto;
- introdotto identità/account learner;
- reso `GOVERNANCE_OPERATOR` sufficiente per operazioni sensibili;
- attivato SSO o logout globale dichiarato come garantito.

## Stato dopo Phase 1

La Phase 1 rende **qualificato il contratto**, non il runtime.

Il prossimo fronte previsto dalla roadmap resta Phase 2 — TRAMA Access runtime minimo — e richiede una decisione separata prima di qualsiasi creazione di provider/progetto/costo.

**Merge:** non autorizzato da questo receipt.  
**Deploy:** non applicabile / non autorizzato.  
**Human closure gate:** richiesto dopo exact-head CI e review indipendente.
