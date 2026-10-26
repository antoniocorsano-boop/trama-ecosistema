# TRAMA DC-01 — Didactic Composer Core Contract v1

**Stato:** IMPLEMENTATION CANDIDATE / OFFLINE QUALIFICATION  
**Data:** 2026-10-26  
**Decisione:** `TRAMA-ADR-022`  
**Capability:** `didactic.composition.propose@1`  
**Mode:** `PROPOSE_ONLY`  
**Runtime live:** NOT_AUTHORIZED  
**Authority change:** NONE  
**DOS-A1:** `RUNTIME_DEFERRED`

## 1. Scopo

DC-01 rende verificabile offline il Core del Didactic Composer approvato. Il Core riceve un intento professionale, fonti professionali e un contesto di curricolo Arena già accettato dal caller e produce una proposta di composizione didattica strutturata.

Il Core non adotta, non pubblica, non registra lo svolto, non assegna voti e non scrive su sistemi esterni.

## 2. Caller supportati

La request è accettabile solo se il product id è presente nel registro DC-00 e appartiene al set v1:

- `DOCENTE_OS`;
- `REGISTRO_DOCENTE`;
- `STUDIO_ATLAS`.

Un product id sconosciuto fallisce come `DC-01`. Un prodotto registrato ma non supportato dal Core fallisce come `DC-02`. `OTHER_GOVERNED` non è un caller valido.

La request deve inoltre dichiarare esattamente l'envelope v1: `contract = DIDACTIC_COMPOSITION_REQUEST_V1` e `contractVersion = 1`. Contract identity o versioni diverse/future falliscono chiuse con `DC-14`.

## 3. Privacy-first

`privacyClass` deve essere `PROFESSIONAL_NON_PERSONAL`.

La request fallisce chiusa se contiene, anche annidati, campi personali studente come `studentName`, `studentId`, `studentEmail`, `grade`, `diagnosis` o `healthData`.

Il riferimento alla classe è ammesso come contesto professionale di sezione e non identifica uno studente.

## 4. Binding Arena

Il Core accetta contesto autorevole solo quando:

- `authorityProduct = ARENA`;
- `authorityState = APPROVED`;
- `acceptedContextRef` è una stringa concreta, non vuota, che identifica il contesto Arena accettato dal prodotto chiamante;
- `vigencyStatus = VIGENTE`;
- `applicabilityStatus = APPLICABLE | TRANSITIONAL`;
- `regimeRef` è presente;
- source refs e item di curricolo sono presenti.

L'assenza di `acceptedContextRef` nella request è un errore `DC-04`.

La proposta deve mantenere lo stesso `acceptedContextRef` nel proprio `curricoloBinding`; assenza o mismatch rispetto alla request falliscono chiusi con `DC-08`.

`TRANSITIONAL` deve essere preservato nella proposta; non può essere appiattito a `APPLICABLE`.

## 5. Proposta

La proposta deve dichiarare esattamente l'envelope v1: `contract = DIDACTIC_COMPOSITION_PROPOSAL_V1` e `contractVersion = 1`. Contract identity o versioni diverse/future falliscono chiuse con `DC-14`.

La proposta deve restare `status = PROPOSAL` e mantenere il binding al contesto di curricolo della request, incluso lo stesso `acceptedContextRef`, lo stesso `applicabilityStatus` e lo stesso `regimeRef`.

`projectionHints.driveExport` deve essere esattamente `DEFERRED_WRITE_SLICE`. Qualunque promozione a write esterno nel Core fallisce chiusa.

La provenance deve mantenere request id, capability id/version e riferimenti provider/adapter distinti dalla semantica della composizione.

## 6. Identità e digest

Una versione della composizione è identificata da:

```text
compositionId
compositionVersion
contentDigest
```

`contentDigest` è SHA-256 del JSON canonico delle sole chiavi semantiche:

```text
requestedKind
title
rationale
curricoloBinding
design
projectionHints
review
```

Sono esclusi dal digest provider/adapter, timestamp, receipt metadata, `compositionId` e `compositionVersion`.

Due fake adapter con provenance diversa devono quindi produrre la stessa semantica e lo stesso digest.

## 7. Adoption receipt locale

L'adozione è attestata fuori dalla capability con `DIDACTIC_COMPOSITION_ADOPTION_RECEIPT_V1`.

Regole:

- `decidedBy = HUMAN`;
- decisione tra `ADOPTED | REJECTED | SUPERSEDED`;
- id/version/digest corrispondono alla proposta;
- `receipt.product` deve essere esattamente uguale a `request.caller.product`;
- il receipt vale soltanto per quel prodotto chiamante e non può essere riutilizzato per un altro consumer;
- non esiste approvazione globale o adozione automatica degli altri prodotti.

Un receipt associato a un prodotto diverso dal caller fallisce chiuso con `DC-13`.

## 8. Codici fail-closed

- `DC-01` — unknown caller;
- `DC-02` — registered but unsupported caller;
- `DC-03` — personal student data;
- `DC-04` — Arena authority/context invalid o `acceptedContextRef` mancante nella request;
- `DC-05` — Arena vigency invalid;
- `DC-06` — applicability invalid;
- `DC-07` — regime ref required;
- `DC-08` — accepted-context/transitional binding state not preserved;
- `DC-09` — non-proposal state;
- `DC-10` — write escalation;
- `DC-11` — provider semantic drift;
- `DC-12` — content digest mismatch;
- `DC-13` — non-human/global/cross-product adoption;
- `DC-14` — request/proposal envelope, content identity o provenance mismatch.

## 9. Qualification

DC-01 è qualificabile soltanto offline con:

- almeno due fake adapter con `adapterRef` distinti e non vuoti;
- semantic equivalence provider-neutral;
- digest deterministico;
- copertura dichiarata esattamente `DC-01`…`DC-14`, non soltanto un conteggio minimo di casi;
- privacy ricorsiva;
- `acceptedContextRef` Arena obbligatorio e preservato;
- `TRANSITIONAL` preservato;
- adoption receipt umano e product-local, legato esattamente al caller corrente;
- Governance completa verde sullo stesso exact SHA.

## 10. Non-obiettivi

DC-01 non implementa adapter Docente OS, Registro o Studio Atlas; non invoca provider live; non effettua export Drive; non pubblica su Atlas; non esegue lezioni; non consuntiva automaticamente; non valuta studenti; non attiva DOS-A1.
