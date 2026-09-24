# CC2-F3A — Stakeholder Assurance Model

**Data:** 24 settembre 2026  
**Stato:** ACTIVE / DATA MODEL IMPLEMENTED / NO RUNTIME AUTHORIZATION

## Scopo

Definire il modello dati e la prima vista di assurance per stakeholder istituzionali, separando chiaramente maturità del prodotto, evidenza interna, assessment indipendente e certificazione formale.

## Stakeholder target

- dirigente scolastico;
- DPO / referente privacy;
- referente accessibilità;
- responsabile tecnico / sicurezza;
- animatore digitale / team innovazione;
- organi di governance dell’istituto;
- valutatori esterni.

## Domini

- privacy e protezione dati;
- normativa scolastica e governance;
- accessibilità;
- usabilità / HVA;
- sicurezza tecnica;
- affidabilità operativa;
- certificazioni e assessment esterni.

## Modello dati minimo

Ogni record di assurance deve prevedere:

- `requirementId`;
- `domain`;
- `claimType`;
- `scope`;
- `status`;
- `evidenceRefs`;
- `reviewAuthority`;
- `assessor`;
- `standardRef`;
- `versionRef`;
- `verifiedAt`;
- `expiresAt`;
- `limitations`;
- `externalCertificateRef` se realmente esistente.

## Claim type

Valori iniziali:

- `EVIDENCE_BACKED_CLAIM`;
- `INDEPENDENT_ASSESSMENT`;
- `FORMAL_CERTIFICATION`.

Un test automatico o una review interna non può essere rappresentato come certificazione formale.

## Stato

Valori iniziali:

- DOCUMENTED;
- IMPLEMENTED;
- VERIFIED;
- THIRD_PARTY_VERIFIED;
- FORMALLY_CERTIFIED;
- PARTIAL;
- TO_VERIFY;
- NOT_APPLICABLE;
- BLOCKED.

## Invarianti

- nessun overall score;
- nessuna autocertificazione;
- nessun “GDPR compliant” generale derivato automaticamente;
- nessuna equivalenza tra maturity e compliance;
- ogni claim deve avere scope e provenance;
- ogni certificazione esterna deve avere riferimento verificabile;
- la UI è READ_ONLY.

## Sequenza proposta

1. schema assurance registry;
2. fixture positive/negative;
3. validator deterministico;
4. mapping iniziale delle evidenze già disponibili;
5. stakeholder summary view;
6. drill-down Privacy / Accessibility / Security / Usability;
7. eventuale registro certificazioni esterne.

## Dipendenze

- CC2-F1/D per binding/freshness;
- CC2-F2 per shell snapshot-first;
- evidenze di dominio reali prima di dichiarare stati VERIFIED o superiori.

## Gate

- schema PASS;
- negative fixtures PASS;
- nessuna auto-certificazione;
- review indipendente;
- HUMAN EXACT-HEAD REVIEW prima dell’integrazione.

## Implementazione F3A foundation

Sono ora presenti schema del registry, registry conservativo iniziale, validator deterministico, fixture positive/negative, workflow dedicato e sezione `assuranceClaims` nello snapshot. La UI stakeholder resta esclusa da questa tranche.
