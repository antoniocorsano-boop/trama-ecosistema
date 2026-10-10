# DOS-M5-02 — Docente OS L5 adoption evidence

**Stato:** DRAFT / EVIDENCE_READY / HUMAN_REVIEW_PENDING  
**Data:** 7 ottobre 2026  
**Ambito:** Docente OS product maturity  
**Contratto:** `docs/qualification/DOS-M5-00-evidence-contract.md`  
**Authority effect:** NONE  
**Production effect:** NONE  
**DOS-A1:** RUNTIME_DEFERRED

## 1. Obiettivo

Produrre la receipt read-only richiesta per `ADOPTION_EVIDENCE`, dimostrando uso reale, ripetuto e coerente di Docente OS nel lavoro docente senza tracking studente, analytics comportamentali aggiuntivi o mutazioni create per ottenere L5.

Il dossier non promuove L5. La classificazione tecnica può diventare `EVIDENCE_READY`, ma `ADOPTION_EVIDENCE` non diventa evidenza canonica finché la Human Review non conferma ammissibilità, positive binding, minimizzazione e assenza di doppio conteggio.

## 2. Baseline canonica

Baseline TRAMA di apertura:

- repository: `antoniocorsano-boop/trama-ecosistema`;
- ref: `main`;
- exact head: `dd8bfab5032137a8591c209004bbd643bf23e8cd`;
- DOS-M5-00: `CONTRACT_APPROVED / HUMAN_REVIEW_PASS / INTEGRATED`.

Baseline prodotto qualificata:

- repository: `antoniocorsano-boop/docente-os-2026-27`;
- ref qualificato: `develop`;
- product head L4: `39bce05fa2e87f3746ee3b6dcd7433065cb2d876`;
- runtime canary L4: PASS;
- `confirmedLevel = 4`;
- next target: `5`.

Le occasioni di adozione riportate qui sono storiche e precedono la formalizzazione di DOS-M5-00. Il contratto `ADOPTION_EVIDENCE` non impone che esse siano post-L4; impone invece origine professionale reale, positive binding verificabile, separazione da synthetic use e privacy minimization.

Di conseguenza queste occasioni possono concorrere a DOS-M5-02 ma **non** possono essere riutilizzate come checkpoint post-L4 di DOS-M5-01.

## 3. Metodo read-only

La verifica è stata eseguita esclusivamente in lettura sul datastore Beta già esistente.

Sono state osservate le superfici necessarie alla classificazione:

- `teaching_sessions`;
- `teaching_session_registration_receipts`;
- `teaching_session_evidence_receipts`;
- `teacher_workspace_settings`;
- `workspace_memberships`;
- `workspaces`;
- `timetable_versions`;
- metadata auth usati transitoriamente solo per distinguere account tecnici/synthetic da account professionali.

Nessuna query ha creato, modificato o cancellato record.

### 3.1 Positive actor binding

L'attore che ha registrato le sessioni candidate risulta positivamente collegato al normale contesto docente perché, sul medesimo account/workspace:

- esiste un profilo docente persistito;
- esiste un contesto scuola persistito;
- il ruolo nel workspace è `OWNER`;
- il workspace è posseduto dallo stesso account;
- risultano 5 `teaching_sessions` su 4 date professionali distinte;
- risultano 4 registration receipt associate alle sessioni;
- l'account synthetic esplicitamente identificabile nel medesimo datastore non presenta `teaching_sessions`.

La receipt non conserva email, user ID, workspace ID, nomi del docente o della scuola.

Questa classificazione non deriva dalla sola assenza di marker E2E: usa caratteristiche positive persistite del profilo docente e del workspace, insieme alla receipt dell'evento di dominio.

### 3.2 Minimizzazione dei binding

Per ogni occasione ammessa il `positiveBindingRef` è una forma SHA-256 minimizzata e stabile derivata transitoriamente dalla coppia:

`teaching_session.id + registration_receipt.registration_key`

La receipt pubblica soltanto il prefisso non personale `pb-ts-...`; gli identificatori originali non sono riportati nel dossier.

### 3.3 Separazione synthetic

La verifica esclude come prova di adozione:

- canary DOS-M4;
- E2E e browser automation;
- account tecnici/synthetic identificabili;
- fixture e seed;
- record privi di positive binding;
- page view e access log;
- conteggi aggregati non classificati.

Le due occasioni ammesse hanno inoltre provenance di dominio priva di marker `e2e`, `canary`, `fixture`, `seed` o `test`.

## 4. Adoption occasion AE1

```yaml
occasionId: DOS-M5-02-AE1
classification: HUMAN_REAL_USE
professionalDate: 2026-09-21
observedAt: 2026-10-07
domainEventType: teaching_session/PROJECTED_OCCURRENCE
positiveBindingRef: pb-ts-5fbd9132019889415c697f42
productBaselineRef: 39bce05fa2e87f3746ee3b6dcd7433065cb2d876
historicalRuntimeRef: null
registrationReceipt: true
boundToTimetableVersion: true
boundToTimetableSlot: true
plannedMinutes: 60
actualMinutes: 120
provenanceItems: 7
evidenceReceipt: true
linkedObservations: 1
syntheticMarkerInProvenance: false
studentTracking: none
verdict: ADMISSIBLE
```

### Motivazione

AE1 è un evento di dominio persistito del normale workflow docente. È collegato a versione e slot di orario, ha durata effettiva registrata, registration receipt distinta, evidence receipt e una osservazione collegata. L'attore è positivamente bound al profilo docente/workspace professionale descritto al §3.1.

L'exact deploy storico attivo il 21 settembre non viene ricostruito né inventato: la prova è bound al periodo professionale, all'evento persistito e alla sua receipt. Il product head L4 è riportato come baseline corrente di qualificazione, non come affermazione sul binario storico della data dell'evento.

## 5. Adoption occasion AE2

```yaml
occasionId: DOS-M5-02-AE2
classification: HUMAN_REAL_USE
professionalDate: 2026-09-25
observedAt: 2026-10-07
domainEventType: teaching_session/PROJECTED_OCCURRENCE
positiveBindingRef: pb-ts-be6662b5fa83292f6613617b
productBaselineRef: 39bce05fa2e87f3746ee3b6dcd7433065cb2d876
historicalRuntimeRef: null
registrationReceipt: true
boundToTimetableVersion: true
boundToTimetableSlot: true
plannedMinutes: 60
actualMinutes: 60
provenanceItems: 4
evidenceNotePresent: true
syntheticMarkerInProvenance: false
studentTracking: none
verdict: ADMISSIBLE
```

### Motivazione

AE2 è indipendente da AE1: data professionale e `positiveBindingRef` sono distinti. Anche AE2 nasce dal workflow `PROJECTED_OCCURRENCE`, è collegato a versione e slot di orario, ha durata effettiva e registration receipt propria; è inoltre presente evidenza professionale persistita senza pubblicarne il testo.

Come per AE1, il runtime storico non viene inferito. La prova resta riesaminabile tramite il binding minimizzato e la query read-only sul datastore Beta.

## 6. Verifica della soglia DOS-M5-00

| Requisito | Evidenza | Stato |
| --- | --- | --- |
| almeno 2 occasioni `HUMAN_REAL_USE` | AE1 + AE2 | PASS |
| `positiveBindingRef` distinti | `pb-ts-5fbd...` / `pb-ts-be66...` | PASS |
| eventi professionali persistiti distinti | 21/09 / 25/09 | PASS |
| workflow significativo | registrazione `teaching_session` da projected occurrence | PASS |
| ripetizione in occasioni professionali distinte | stesso workflow su due date distinte | PASS |
| separazione synthetic | positive actor binding + exclusion dei record synthetic | PASS |
| nessun doppio conteggio | una sessione/receipt per occasione | PASS |
| read-only | nessuna mutazione datastore | PASS |
| student tracking | none | PASS |
| PII nella receipt | nessuna | PASS |
| Human Review finale | non ancora eseguita | PENDING |

La soglia quantitativa/qualitativa del §7.5 di DOS-M5-00 risulta quindi tecnicamente soddisfatta, ma il dossier resta fail-closed fino alla Human Review.

## 7. Receipt aggregata candidata

```yaml
evidenceType: ADOPTION_EVIDENCE
status: EVIDENCE_READY
humanReview: PENDING
observedPeriod:
  from: 2026-09-21
  to: 2026-09-25
qualificationBaseline:
  productHead: 39bce05fa2e87f3746ee3b6dcd7433065cb2d876
humanRealUseOccasions: 2
distinctProfessionalDates: 2
professionalSurfaces:
  - teaching_sessions
workflow:
  - projected_timetable_occurrence_to_persisted_teaching_session
persistentRealActions: 2
positiveBindingMethod:
  - persisted teacher profile + school context + workspace ownership
  - persisted teaching_session
  - distinct registration receipt
  - SHA-256 minimized event+receipt reference
syntheticExclusionMethod:
  - exclude E2E/canary/test accounts and technical runs
  - reject events without positive actor/domain binding
  - reject fixture/seed/synthetic provenance markers
studentTracking: none
confidence: HIGH_FOR_HUMAN_REAL_USE
historicalRuntimeBinding: NOT_ASSERTED
```

## 8. Confidence e limiti

La confidenza è `HIGH_FOR_HUMAN_REAL_USE` perché entrambe le occasioni combinano:

- attore con profilo docente e contesto scuola persistiti;
- workspace professionale posseduto dallo stesso attore;
- evento di dominio `teaching_session` persistito;
- registration receipt distinta;
- durata effettiva;
- provenance strutturata;
- binding a timetable version/slot;
- date professionali distinte;
- eventi creati prima della formalizzazione di M5 e quindi non costruiti ad hoc per soddisfare DOS-M5-02.

Il dossier non afferma quale exact deploy fosse attivo nelle due date storiche. Questo limite è esplicito e non viene colmato per inferenza.

## 9. Relazione con DOS-M5-01

AE1 e AE2 sono antecedenti alla baseline L4 e pertanto:

- possono concorrere a `ADOPTION_EVIDENCE` secondo DOS-M5-00;
- **non** soddisfano `DOS-M5-01-CP1` o `DOS-M5-01-CP2`, che richiedono checkpoint post-L4;
- non devono essere riciclati come trigger post-L4.

DOS-M5-01 resta indipendentemente `CHECKPOINTS_PENDING` finché non emergono due trigger reali e distinti successivi a L4.

## 10. Criterio di uscita

DOS-M5-02 può diventare `ADOPTION_EVIDENCE_PASS` soltanto quando una Human Review verifica sul medesimo exact head del dossier che:

- AE1 e AE2 sono realmente distinti;
- i due `positiveBindingRef` sono verificabili e privacy-safe;
- il metodo di actor binding è positivo e non basato sulla sola esclusione;
- gli eventi rappresentano normale lavoro docente e non test/canary;
- i limiti sul runtime storico sono dichiarati correttamente;
- nessun dato studente o PII non necessario è pubblicato;
- non vi è doppio conteggio;
- la receipt aggregata è coerente con DOS-M5-00.

Fino a tale review:

**stato = DRAFT / EVIDENCE_READY / HUMAN_REVIEW_PENDING**.

## 11. Confini invariati

DOS-M5-02 non autorizza:

- promozione L5;
- modifica del maturity registry o snapshot;
- promozione Production;
- cambio authority;
- modifica di `DOS-A1`;
- tracking studente;
- nuova analytics pipeline;
- mutazioni del datastore per costruire evidenza;
- riapertura dei fronti PWA/installazione Android;
- nuove capability funzionali di Docente OS.
