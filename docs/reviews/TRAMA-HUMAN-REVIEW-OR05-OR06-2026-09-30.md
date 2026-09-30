# TRAMA Human Review Package — OR-05 / OR-06

**Stato:** AWAITING_HUMAN_DECISION  
**Data:** 2026-09-30  
**Scope:** OR-05-I1 · OR-05-I2 · OR-06-P1  
**Merge automatico:** VIETATO  
**DOS-A1:** RUNTIME_DEFERRED  
**Authority change:** NONE

## 1. Decisione richiesta

La Human Review deve decidere separatamente se integrare:

1. **Arena #344 — OR-05-I2 dead legacy UI removal**
2. **Docente OS #644 — OR-05-I1 Radix dialog mechanics reuse**
3. **TRAMA #200 — OR-06-P1 deterministic cross-ecosystem read-only proof**

Le tre slice sono tecnicamente indipendenti sul piano prodotto; #200 è parte di una catena stacked TRAMA e richiede il mantenimento dell'ordine dei parent #198 → #199 → #200.

## 2. Arena #344

- repository: `antoniocorsano-boop/CurManLight_arena`
- exact head: `4244d9a0840040c2878745d22fb84dc537dca677`
- base: `main@a89553c0a3daa71555b6a9ec3a07c3edbf19a176`
- changed files: 3
- diff: **0 additions / 93 deletions**
- stato: Draft / mergeable=true
- open review threads: 0
- review submissions: 0

### Cambia
- rimozione del legacy `src/components/ui/ConfirmDialog.tsx`;
- rimozione del legacy `src/components/ui/Tabs.tsx`;
- rimozione dei due export legacy dal barrel.

### Non cambia
- `UiConfirmDialog`;
- `UiTabs`;
- call site produttivi;
- curriculum authority;
- dati;
- runtime;
- dipendenze.

### Evidenze
- CurManLight Product CI: **PASS**
- Beta Release Contract: **PASS**
- TRAMA Perceptible Write: **PASS**
- ECC Security Evidence: **PASS**

### Rilievo neutrale
ECC segnala assenza di browser coverage specifica per i file UI rimossi. La repository search sulla baseline non ha trovato call site produttivi dei due componenti legacy. Il rilievo resta informativo e non prova una regressione.

### Valutazione per Human Review
Rischio principale: riferimento dinamico/non indicizzato ai due export legacy.  
Mitigazione: Product CI PASS + ricerca repository + rimozione limitata a dead code.

## 3. Docente OS #644

- repository: `antoniocorsano-boop/docente-os-2026-27`
- exact head: `caa76dd01dc448c14e97dbc6fb5bd38eefba786e`
- base: `develop@1d8c4ee7c1209f624b412db1b11e666c2de25aaa`
- changed files: 1
- stato: Draft / mergeable=true
- open review threads: 0
- review submissions: 0
- visual classification: **COMPATIBLE**

### Cambia
- Timetable context dialog usa la primitive Radix Dialog già presente nel prodotto;
- Timetable editor dialog usa la stessa primitive;
- rimossa la gestione duplicata custom di Escape/backdrop;
- aggiunta description accessibile all'editor.

### Non cambia
- azioni di dominio;
- copy;
- classi visuali;
- dati;
- teacher decision;
- authority;
- dipendenze;
- DOS-A1.

### Evidenze
- Product CI: **PASS**
- Browser Certification Orchestrator: **PASS**
- Design Policy Gate: **PASS**
- ASVS 5.0 Assurance: **PASS**
- Human Interaction Model: **PASS**
- TRAMA Perceptible Write: **PASS**
- Governed MFA Queue Hygiene: **PASS**
- Certification Impact Classifier: **PASS**
- Human + Visual Acceptance interno al browser gate: **PASS**

### Valutazione per Human Review
Rischio principale: differenze sottili nei focus/portal mechanics rispetto agli overlay custom.  
Mitigazione: Radix è già supply chain del prodotto; Browser Certification e HVA PASS.

## 4. TRAMA #200

- repository: `antoniocorsano-boop/trama-ecosistema`
- exact head: `4a2247a9a52bc5310f6c2afd9a069b53faa27156`
- base: branch OR-06 contract (#199)
- changed files: 4
- stato: Draft / mergeable=true
- open review threads: 0
- review submissions: 0

### Cambia
- introduce fixture OR-06-P1 read-only;
- introduce 8 fixture avversariali;
- introduce validator fail-closed;
- introduce test unitari;
- aggiunge due step al workflow Governance.

### Non cambia
- nessun runtime reale;
- nessuna rete nel proof;
- nessuna connessione live Arena/Atlas/Docente OS;
- nessuna write surface;
- nessuna authority;
- nessun dato personale studente;
- Control Center resta READ_ONLY;
- DOS-A1 resta RUNTIME_DEFERRED.

### Invarianti verificati
- CE-01 Arena authority preservation;
- CE-02 Atlas optionality;
- CE-03 teacher ownership;
- CE-04 no mutative authorization;
- CE-05 provenance;
- CE-06 stale/unknown honesty;
- CE-07 provider replaceability;
- CE-08 Control Center non-authority;
- CE-09 no personal student data;
- CE-10 deterministic serialization.

### Evidenze
- Governance sul precedente exact head P1: **PASS**
- Governance sul riallineamento exact head `4a2247a9...`: **PASS**
- ECC Security Evidence: **PASS**
- ECC Config Audit: **PASS**
- ECC Harness Audit: **PASS**
- Hosted Promotion Readiness: **PASS**

### Rilievi neutrali
ECC segnala taxonomy review per modifica a workflow CI e mancanza di corpus generici non specifici del proof. Il proof possiede però fixture positive/negative dedicate e viene eseguito nel gate Governance.

### Valutazione per Human Review
Rischio principale: rendere il validator una falsa proxy di integrazione reale.  
Mitigazione: il contratto dichiara esplicitamente che P1 qualifica soltanto la **forma offline**; connessioni live e runtime reali restano DEFER.

## 5. Verifica ecosystem-first

| Invariante | #344 | #644 | #200 |
|---|---|---|---|
| Arena resta authority curricolare | invariato | invariato | PASS CE-01 |
| Atlas non diventa authority | invariato | invariato | PASS CE-02 |
| Docente OS teacher-first | invariato | rafforzato | PASS CE-03 |
| Control Center READ_ONLY | invariato | invariato | PASS CE-08 |
| Runtime sostituibile | n/a | n/a | PASS CE-07 |
| Nuove write authority | NO | NO | NO |
| DOS-A1 | DEFERRED | DEFERRED | DEFERRED |

## 6. Ordine di integrazione proposto

### Product-local
Arena #344 e Docente OS #644 possono essere valutate indipendentemente.

### TRAMA stacked
Per la linea TRAMA l'ordine deve restare:
1. #197 — baseline OR + ecosystem-first;
2. #198 — OR-05 ecosystem component reuse;
3. #199 — OR-06 proof contract;
4. #200 — OR-06-P1 implementation.

Nessun child deve essere integrato prima del parent da cui dipende.

## 7. Human Review checklist

Per ciascuna PR:
- [ ] exact head coincide con quello indicato;
- [ ] tutti i gate richiesti sono PASS;
- [ ] nessun thread aperto;
- [ ] nessuna authority drift;
- [ ] nessuna capability mutativa introdotta;
- [ ] diff coerente con il perimetro dichiarato.

Per la catena TRAMA:
- [ ] ADR-019 ecosystem-first accettabile;
- [ ] OR-05 no-global-UI-library accettabile;
- [ ] OR-06 lesson-preparation read-only proof rappresenta correttamente un workflow reale;
- [ ] P1 resta qualificazione offline e non viene interpretato come runtime readiness.

## 8. Stato finale del pacchetto

**READY FOR HUMAN INTEGRATION DECISION.**

Questo pacchetto non approva, non promuove e non integra automaticamente alcuna PR.
