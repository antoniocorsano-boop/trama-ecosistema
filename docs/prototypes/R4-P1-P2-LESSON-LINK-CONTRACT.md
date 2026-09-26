# R4-P1/P2 — Contratto governato materiale → lezione

Status: **PROPOSED / HUMAN REVIEW REQUIRED / NO_RUNTIME**

Base esatta: `743fe2595f55afca074adc998ca597e5a8b67d98` (R4-P1/P1 integrato su `main`).

## 1. Scopo

P2 definisce il confine governato tra una bozza/materiale accettato nell'Officina materiali e il suo collegamento a una lezione di Docente OS. Non abilita ancora alcuna scrittura cross-product, database, storage, autenticazione, pubblicazione Atlas o runtime DOS-A1.

Il risultato di P2 è un contratto verificabile e una ricevuta simulabile, non un'integrazione operativa.

## 2. Principio teacher-first

Il collegamento nasce esclusivamente da un'azione esplicita del docente su una revisione immutabile e identificabile della bozza. Ricerca Atlas, adattamento, generazione, anteprima o proposta editoriale non implicano il collegamento alla lezione.

Il docente può sempre:

- collegare il materiale alla lezione;
- sostituirlo prima della conferma;
- annullare senza effetti esterni;
- mantenere il materiale non collegato;
- proporre separatamente il materiale per la pubblicazione Atlas.

## 3. Input minimo del collegamento

`LessonMaterialLinkIntent v1`:

```json
{
  "contractVersion": "1",
  "workItemId": "WORK-P1-001",
  "lessonRef": "LESSON:LOCAL-FIXTURE-001",
  "materialRef": "MATERIAL:WORK-P1-001",
  "materialRevisionRef": "MATERIALREV:WORK-P1-001:R2",
  "materialFingerprint": "sha256:fixture-p2-r2",
  "sourceRef": "ATLAS:FIX-ATLAS-001",
  "license": "CC BY 4.0",
  "teacherDecision": "LINK",
  "clientRequestId": "LINKREQ-P2-001"
}
```

Regole:

1. `teacherDecision` deve essere `LINK` ed essere conseguenza di una conferma percepibile del docente.
2. `workItemId`, `materialRef`, `materialRevisionRef`, `materialFingerprint` e `lessonRef` sono obbligatori.
3. `materialRevisionRef` identifica una revisione immutabile del materiale; `materialFingerprint` consente di verificarne l'identità di contenuto. Una modifica materiale produce una nuova revisione/fingerprint anche quando `workItemId` resta invariato.
4. Provenienza e licenza note devono essere conservate indipendentemente dal canale sorgente. Per materiale derivato da Atlas, `sourceRef` e `license` sono obbligatori. Per altre fonti governate si conserva il rispettivo riferimento/licenza quando disponibili. `null` è ammesso soltanto quando provenienza o licenza non sono applicabili o non sono note secondo il contratto sorgente; non significa «non Atlas».
5. `clientRequestId` è stabile per la stessa decisione logica sulla stessa revisione immutabile e costituisce la chiave di idempotenza del futuro adapter.
6. Nessun campo autorizza pubblicazione, persistenza, validità della lezione, approvazione curricolare o visibilità studente.

## 4. Ricevuta di collegamento

P2 distingue l'intento dalla ricevuta. Nel prototipo la ricevuta è esclusivamente simulata:

`LessonMaterialLinkReceipt v1`:

```json
{
  "contractVersion": "1",
  "clientRequestId": "LINKREQ-P2-001",
  "linkReceiptId": "LINKREC-P2-001",
  "workItemId": "WORK-P1-001",
  "lessonRef": "LESSON:LOCAL-FIXTURE-001",
  "materialRef": "MATERIAL:WORK-P1-001",
  "materialRevisionRef": "MATERIALREV:WORK-P1-001:R2",
  "materialFingerprint": "sha256:fixture-p2-r2",
  "outcome": "LINK_SIMULATED_NO_RUNTIME",
  "publicationState": "NOT_PROPOSED"
}
```

La ricevuta attesta esclusivamente l'esito della decisione di collegamento per quella revisione immutabile del materiale. Non certifica validità della lezione, approvazione curricolare, pubblicazione, persistenza o scrittura in Docente OS. Una futura ricevuta runtime richiederà un adapter separato e una nuova autorizzazione governata.

## 5. Macchina degli stati P2

Transizioni ammesse:

- `PREVIEW → LINK_CONFIRMATION_REQUIRED`
- `LINK_CONFIRMATION_REQUIRED → LINK_SIMULATED_NO_RUNTIME`
- `LINK_CONFIRMATION_REQUIRED → PREVIEW` per annullamento
- `LINK_SIMULATED_NO_RUNTIME → LINK_SIMULATED_NO_RUNTIME` per retry della stessa decisione sulla stessa `materialRevisionRef`/`materialFingerprint` con lo stesso `clientRequestId`

Transizioni vietate:

- `PREVIEW → LINKED_RUNTIME`
- `LINK_SIMULATED_NO_RUNTIME → PUBLISHED`
- qualunque collegamento implicito prodotto da ricerca, adattamento, rigenerazione o proposta editoriale.

## 6. Idempotenza e revisione del materiale

La chiave logica di idempotenza è:

`lessonRef + materialRef + materialRevisionRef + materialFingerprint + teacherDecision=LINK`.

Per la stessa tupla il `clientRequestId` resta invariato e una ripetizione non crea una seconda ricevuta logica.

`workItemId` identifica la lavorazione, non una versione immutabile del contenuto e quindi non può essere usato da solo come identità del materiale collegato.

Una modifica materiale — inclusa una rigenerazione o un adattamento che cambia il contenuto — deve produrre una nuova `materialRevisionRef` e un nuovo `materialFingerprint`. Di conseguenza nasce un nuovo intento, un nuovo `clientRequestId` e una nuova conferma esplicita del docente. Un retry tecnico che non modifica il contenuto conserva invece revisione, fingerprint e `clientRequestId`.

## 7. Provenienza e licenza

La provenienza è un attributo del materiale/revisione e non un sinonimo di Atlas.

- materiale Atlas: conserva `sourceRef` Atlas e licenza;
- materiale derivato da altra fonte governata: conserva il riferimento della fonte e la licenza/condizione d'uso prevista dal contratto sorgente;
- materiale originale senza fonte esterna: `sourceRef` può essere `null`; la licenza può essere `null` finché non esiste una decisione editoriale che la definisca;
- assenza di dati non deve cancellare provenance/licenza già note a monte.

P2 non inventa, normalizza arbitrariamente o sostituisce i dati di provenienza ricevuti dal contratto sorgente.

## 8. Separazione da Atlas

Il collegamento alla lezione e la proposta di pubblicazione sono assi indipendenti:

- un materiale può essere collegato senza essere proposto per Atlas;
- un materiale può essere proposto per Atlas senza che P2 lo consideri pubblicato;
- una proposta Atlas non può modificare retroattivamente il consenso al collegamento;
- `publicationRequestId` non sostituisce `clientRequestId` del collegamento;
- una ricevuta di collegamento non costituisce prova di pubblicazione Atlas.

## 9. Feedback percepibile

Ogni decisione deve mostrare almeno:

- cosa sta per accadere;
- quale lezione riceverebbe il materiale;
- quale materiale e quale revisione immutabile vengono collegati;
- esito della simulazione;
- dichiarazione esplicita `NO_RUNTIME`;
- azione successiva disponibile.

Il feedback non può dipendere soltanto da colore, icona o toast effimero.

## 10. Privacy e dati

P2 non introduce dati personali degli studenti, account studente, analytics, tracking o telemetria. Gli identificatori del prototipo sono fixture tecniche non personali.

## 11. Confini invarianti

Restano invariati:

- Arena conserva autorità curricolare e approvazione;
- Atlas conserva il ruolo di pubblicazione/navigazione/materiali secondo i contratti governati;
- Docente OS resta teacher-first;
- nessuna approvazione automatica;
- nessuna scrittura cross-product in P2;
- una ricevuta P2 non attesta validità della lezione né approvazione curricolare;
- `DOS-A1 = RUNTIME_DEFERRED`;
- P1 non viene riaperto o reinterpretato.

## 12. Criteri di accettazione P2

P2 può avanzare solo se una revisione exact-head verifica:

- **P2-E1** — conferma docente esplicita prima del collegamento;
- **P2-E2** — `lessonRef`, `materialRef`, `workItemId`, `materialRevisionRef` e `materialFingerprint` ispezionabili;
- **P2-E3** — provenienza/licenza note conservate indipendentemente dal canale sorgente;
- **P2-E4** — `clientRequestId` idempotente sulla tupla che include revisione/fingerprint immutabili;
- **P2-E5** — ricevuta distinta dall'intento e vincolata alla stessa revisione/fingerprint;
- **P2-E6** — nessuna scrittura runtime;
- **P2-E7** — collegamento e pubblicazione restano indipendenti;
- **P2-E8** — annullamento senza effetti;
- **P2-E9** — feedback percepibile anche su smartphone;
- **P2-E10** — nessun dato personale studente o tracking;
- **P2-E11** — modifica materiale ⇒ nuova revisione/fingerprint, nuovo intento e nuova conferma docente;
- **P2-E12** — la ricevuta non implica validità lezione, approvazione curricolare, persistenza o pubblicazione.

## 13. Fuori ambito

Sono esplicitamente fuori da P2:

- adapter reale verso Docente OS;
- persistenza del collegamento;
- storage del materiale;
- pubblicazione Atlas reale;
- autorizzazione studente;
- sincronizzazione automatica;
- attivazione DOS-A1.

Qualunque elemento fuori ambito richiede uno slice governato successivo.