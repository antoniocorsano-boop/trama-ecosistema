# QE-01 Pre-Live Gate Contract v1

**Stato:** PRE-LIVE / NO MODEL INVOCATION  
**Capability:** `lesson.preparation.observe`  
**Authority:** `TRAMA-ADR-020`  
**Mode:** `PROPOSE_ONLY`  
**DOS-A1:** `RUNTIME_DEFERRED`

## 1. Scopo

Chiudere i gate tecnici che devono essere verificati prima della Human exact-head review e prima di qualsiasi Qualified Execution reale.

Questo contratto non autorizza né esegue il modello.

## 2. Network policy

QE-01 usa una allowlist stretta:

- scheme: `https`;
- host: `integrate.api.nvidia.com`;
- API prefix: `/v1`;
- execution path consentito, solo dopo Human exact-head review: `/v1/chat/completions`;
- nessun altro host;
- nessun redirect cross-host;
- nessun fallback provider;
- nessun endpoint dinamico derivato da input utente.

Il modello congelato è `nvidia/nemotron-3-ultra-550b-a55b`.

## 3. Secret policy

La credenziale:
- è referenziata come `NVIDIA_API_KEY`;
- non è salvata nel repository;
- non è copiata in fixture, receipt o evidence;
- non è stampata nei log;
- non è serializzata negli errori;
- non viene restituita al Control Center;
- può essere letta solo al momento del probe/esecuzione autorizzata;
- un valore assente produce fail-closed.

## 4. Credential-access probe

Il probe è un gate separato dall'esecuzione QE-01.

Requisiti:
- usa la stessa identità provider del profilo congelato;
- non invia contenuti didattici;
- non invia dati personali;
- usa esclusivamente il path documentato `/v1/chat/completions` con un payload intenzionalmente non valido, così da non costituire una richiesta di generazione valida;
- considera `401/403` come credenziale respinta e una risposta di validazione non-auth come sola evidenza che la credenziale non è stata respinta a quel confine;
- non prova l'entitlement del modello né la riuscita di una generazione;
- non promuove automaticamente lo stato a executable;
- produce solo esito normalizzato + timestamp + endpoint class + status category;
- non conserva response body potenzialmente sensibili.

Fino al completamento del probe, `CREDENTIAL_ACCESS_PROBE=false`.

## 5. Timeout / cancel / cleanup

- request timeout: 30 s massimo;
- `maxRetries=0`;
- una sola invocazione;
- timeout => terminal failure;
- cancel => nessun retry;
- cleanup deve finalizzare evidence locale;
- nessun fallback provider/model;
- nessuna seconda richiesta automatica.

## 6. Failure normalization

Classi ammesse:
- `CREDENTIAL_MISSING`;
- `CREDENTIAL_REJECTED`;
- `ENDPOINT_NOT_ALLOWED`;
- `PROVIDER_UNAVAILABLE`;
- `MODEL_UNAVAILABLE`;
- `TIMEOUT`;
- `CANCELLED`;
- `RESPONSE_INVALID`;
- `EVIDENCE_INCOMPLETE`;
- `STALE_BINDING`.

Ogni failure:
- è terminale per la run;
- non abilita retry;
- non cambia provider/modello;
- non modifica Arena/Atlas/Docente OS;
- lascia disponibile il fallback manuale Docente OS.

## 7. Evidence receipt contract

La receipt prevede:
- executionId;
- exactHead;
- capabilityId;
- providerId;
- modelId;
- adapterId/version;
- runtimeProfileRef;
- startedAt / finishedAt;
- outcome;
- failureClass opzionale;
- requestCount;
- retryCount;
- mutationObserved;
- personalStudentDataObserved;
- secretMaterialObserved;
- evidenceDigest.

Non deve contenere prompt completo, risposta completa, token o secret.

## 8. Gate semantics

La presenza e qualifica di questo contratto può chiudere:
- `NETWORK_SECRET_POLICY`;
- `TIMEOUT_CANCEL_CLEANUP`;
- `EVIDENCE_RECEIPT`;
- `STALE_FAILURE_NORMALIZATION`.

Non chiude:
- `CREDENTIAL_ACCESS_PROBE`;
- `HUMAN_EXACT_HEAD_REVIEW`.

Nessun profilo è executable finché tutti i gate richiesti non sono true.
