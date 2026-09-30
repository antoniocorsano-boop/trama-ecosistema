# TRAMA Human Review Package — OR-05 / OR-06

**Stato:** HUMAN_APPROVED / INTEGRATED  
**Data:** 2026-09-30  
**Scope:** OR-05-I1 · OR-05-I2 · OR-06-P1  
**Merge automatico:** VIETATO  
**DOS-A1:** RUNTIME_DEFERRED  
**Authority change:** NONE

## 1. Decisione umana

La Human Review ha autorizzato l'integrazione delle seguenti slice:

1. **Arena #344 — OR-05-I2 dead legacy UI removal**
2. **Docente OS #644 — OR-05-I1 Radix dialog mechanics reuse**
3. **TRAMA #200 — OR-06-P1 deterministic cross-ecosystem read-only proof**

Le tre slice sono state integrate rispettando i confini di prodotto e l'ordine stacked TRAMA. La decisione umana è stata eseguita il 30 settembre 2026.

## 2. Arena #344

- repository: `antoniocorsano-boop/CurManLight_arena`
- exact head: `4244d9a0840040c2878745d22fb84dc537dca677`
- base: `main@a89553c0a3daa71555b6a9ec3a07c3edbf19a176`
- changed files: 3
- diff: **0 additions / 93 deletions**
- stato al momento della decisione: Draft / mergeable=true
- merge commit: `ac04058b689075a607fba050c706a8f222d0cca1`
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
- stato al momento della decisione: Draft / mergeable=true
- merge commit: `18fe45cb88989bddf2666560ecc17b3cc0025f02`
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
- stato al momento della decisione: Draft / mergeable=true
- merge commit: `2bca36fdb5b70683cb95a27e6540e4a39ac3cf70`
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

## 6. Ordine di integrazione eseguito

### Product-local
- Arena #344 → `ac04058b689075a607fba050c706a8f222d0cca1`
- Docente OS #644 → `18fe45cb88989bddf2666560ecc17b3cc0025f02`

### TRAMA stacked
Per la linea TRAMA l'ordine è stato rispettato:
1. #197 → `013fc443e3caa85e3ffd9cacfc270899a35e61ad`;
2. #198 → `c3d09aaacde88417508bbde7a47b36fd513ef574`;
3. #199 → `f52520ddc2aa3353b110bf5599b9db99302def6b`;
4. #200 → `2bca36fdb5b70683cb95a27e6540e4a39ac3cf70`.

## 7. Human Review checklist

Per ciascuna PR:
- [x] exact head coincide con quello indicato;
- [x] tutti i gate richiesti sono PASS;
- [x] nessun thread aperto;
- [x] nessuna authority drift;
- [x] nessuna capability mutativa introdotta;
- [x] diff coerente con il perimetro dichiarato.

Per la catena TRAMA:
- [x] ADR-019 ecosystem-first accettabile;
- [x] OR-05 no-global-UI-library accettabile;
- [x] OR-06 lesson-preparation read-only proof rappresenta correttamente un workflow reale;
- [x] P1 resta qualificazione offline e non viene interpretato come runtime readiness.

## 8. Stato finale del pacchetto

**HUMAN APPROVED / INTEGRATION EXECUTED.**

La decisione umana è stata eseguita senza introdurre nuove authority, senza attivare DOS-A1 e senza promuovere runtime reali. Restano invariati i confini ecosystem-first.
