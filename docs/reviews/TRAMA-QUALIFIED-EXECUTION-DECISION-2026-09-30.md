# TRAMA — Prima Qualified Execution reale: dossier decisionale

**Stato:** HUMAN_APPROVED / AUTHORIZED_PENDING_PROVIDER_QUALIFICATION  
**Data:** 2026-09-30  
**Runtime live:** AUTHORIZED_CONDITIONALLY / NOT_YET_EXECUTABLE  
**DOS-A1:** RUNTIME_DEFERRED  
**Authority change:** LIMITED_QE01_AUTHORIZATION_ONLY

## 1. Perché esiste questo dossier

La catena OR-07→OR-10 ha qualificato:
- contratto capability condiviso;
- portabilità provider-neutral;
- readiness pre-autorizzativa;
- confini prodotto Arena / Atlas / Docente OS;
- evidenze e gate NO_RUNTIME.

Questo NON equivale a autorizzazione all'esecuzione reale.

Il presente dossier definisce il solo punto decisionale successivo.

## 2. Decisione da prendere

La futura Human Review dovrà scegliere tra:

### A — MANTENERE_DEFERRED

Nessun runtime live viene autorizzato. Le capability restano pronte ma inattive.

### B — AUTORIZZARE_PRIMA_QUALIFIED_EXECUTION_LIMITATA

Autorizzare una sola esecuzione governata, con perimetro congelato e revocabile.

Nessuna scelta viene effettuata da questo documento.

## 3. Candidato minimo ammissibile

Se l'opzione B verrà scelta, il candidato iniziale DEVE restare:

- capability: `lesson.preparation.observe`;
- mode: `PROPOSE_ONLY`;
- decision owner: docente in Docente OS;
- Arena: sola authority curricolare;
- Atlas: risorsa opzionale;
- Control Center: osservazione READ_ONLY;
- mutazioni: vietate;
- retry: `0`;
- timeout: esplicito;
- execution profile: exact/versionato;
- provider/adapter: espliciti e sostituibili;
- evidence receipt: obbligatoria.

## 4. Network e credenziali

OR-09 ha qualificato il percorso con network DENY.

Una prima esecuzione reale con provider esterno richiederebbe una decisione separata su:
- endpoint allowlist;
- tipo di credenziale;
- secret storage;
- redaction/logging;
- revocation;
- timeout;
- data minimization;
- provider retention/training policy quando applicabile.

Nessun secret può entrare in repository, fixture o evidence persistente.

## 5. Dati ammessi

Prima esecuzione proposta:
- nessun dato personale studente;
- nessun profilo studente;
- nessun tracking;
- solo contesto curricolare/professionale minimo necessario;
- source refs e provenance obbligatori.

## 6. Failure boundary

La Qualified Execution DEVE fallire chiusa:
- provider unavailable → `UNAVAILABLE`;
- auth failure → `UNAUTHORIZED`;
- timeout → `FAILED` con cleanup;
- evidence incompleta → risultato non promuovibile;
- stale source → `STALE`;
- nessun fallback silenzioso verso un provider diverso.

Il flusso manuale Docente OS resta sempre disponibile.

## 7. Cosa NON può autorizzare la prima esecuzione

- scrittura automatica in Arena;
- pubblicazione automatica in Atlas;
- registrazione automatica nel diario;
- approvazione curricolare;
- auto-adozione della proposta;
- capability MUTATIVE;
- sequenze agentiche autonome;
- accesso a dati personali studente;
- attivazione generale di DOS-A1.

## 8. DOS-A1

La prima Qualified Execution, se autorizzata, NON deve essere interpretata come attivazione generale di DOS-A1.

Una eventuale transizione di DOS-A1 da `RUNTIME_DEFERRED` richiede una decisione normativa distinta che definisca:
- perimetro;
- authority;
- capacità abilitate;
- revoca;
- audit;
- rollback;
- responsabilità operative.

## 9. Gate prima di una futura autorizzazione

Devono essere PASS e legati allo stesso exact head:

- execution profile frozen;
- provider/adapter identity frozen;
- network/secret policy;
- privacy/data-minimization review;
- timeout/cancel/cleanup qualification;
- no-mutation tests;
- evidence receipt validation;
- stale/failure tests;
- Control Center observe-only verification;
- product fallback/manual path verification;
- Human exact-head review.

## 10. Stato attuale

**HUMAN_APPROVED / AUTHORIZED_PENDING_PROVIDER_QUALIFICATION.**

Decisione esplicita ricevuta il 2026-09-30: **AUTORIZZARE_PRIMA_QUALIFIED_EXECUTION_LIMITATA**.

L'autorizzazione è limitata a QE-01 e diventa eseguibile soltanto quando lo stesso exact head qualifica:
- provider reale e adapter reale;
- execution profile congelato;
- policy rete/secret;
- failure/cleanup;
- evidence receipt;
- no-mutation e no-student-data;
- Control Center observe-only.

Finché questi gate non sono PASS, nessuna chiamata runtime reale può partire.


## 11. Qualification retrigger

Dopo la sincronizzazione automatica dello snapshot canonico da parte di GitHub Actions, la qualifica della presente PR viene rieseguita su un nuovo exact head umano. Questo passaggio non modifica stato, authority, runtime authorization o perimetro del dossier.


## 12. Esito Human Review

Decisione: **APPROVED_LIMITED_QE01**.

Perimetro:
- capability: `lesson.preparation.observe`;
- mode: `PROPOSE_ONLY`;
- one-shot;
- maxRetries: `0`;
- mutation: vietata;
- dati personali studenti: vietati;
- decision owner: docente;
- Control Center: READ_ONLY;
- DOS-A1: resta `RUNTIME_DEFERRED`.

Stato operativo al momento della decisione:
`AUTHORIZED_PENDING_PROVIDER_QUALIFICATION`.

Motivo del blocco residuo: nessun provider reale è ancora qualificato nel repository; `offline-dsh-fixture` è una fixture e non può essere usata come provider live.
