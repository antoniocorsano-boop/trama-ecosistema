# R4-P1/P2 — Contratto governato materiale → lezione

Status: **PROPOSED / HUMAN REVIEW REQUIRED / NO_RUNTIME**

Base esatta: `743fe2595f55afca074adc998ca597e5a8b67d98` (R4-P1/P1 integrato su `main`).

## 1. Scopo

P2 definisce il confine governato tra una bozza/materiale accettato nell'Officina materiali e il suo collegamento a una lezione di Docente OS. Non abilita ancora alcuna scrittura cross-product, database, storage, autenticazione, pubblicazione Atlas o runtime DOS-A1.

Il risultato di P2 è un contratto verificabile e una ricevuta simulabile, non un'integrazione operativa.

## 2. Principio teacher-first

Il collegamento nasce esclusivamente da un'azione esplicita del docente su una bozza in stato idoneo. Ricerca Atlas, adattamento, generazione, anteprima o proposta editoriale non implicano il collegamento alla lezione.

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
  "sourceRef": "ATLAS:FIX-ATLAS-001",
  "license": "CC BY 4.0",
  "teacherDecision": "LINK",
  "clientRequestId": "LINKREQ-P2-001"
}
```

Regole:

1. `teacherDecision` deve essere `LINK` ed essere conseguenza di una conferma percepibile del docente.
2. `workItemId`, `materialRef` e `lessonRef` sono obbligatori.
3. `sourceRef` e `license` sono obbligatori quando il materiale deriva da Atlas; sono `null` per un materiale originale privo di fonte esterna.
4. `clientRequestId` è stabile per la stessa decisione logica e costituisce la chiave di idempotenza del futuro adapter.
5. Nessun campo autorizza pubblicazione o visibilità studente.

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
  "outcome": "LINK_SIMULATED_NO_RUNTIME",
  "publicationState": "NOT_PROPOSED"
}
```

La ricevuta non equivale a persistenza in Docente OS. Una futura ricevuta runtime richiederà un adapter separato e una nuova autorizzazione governata.

## 5. Macchina degli stati P2

Transizioni ammesse:

- `PREVIEW → LINK_CONFIRMATION_REQUIRED`
- `LINK_CONFIRMATION_REQUIRED → LINK_SIMULATED_NO_RUNTIME`
- `LINK_CONFIRMATION_REQUIRED → PREVIEW` per annullamento
- `LINK_SIMULATED_NO_RUNTIME → LINK_SIMULATED_NO_RUNTIME` per retry con lo stesso `clientRequestId`

Transizioni vietate:

- `PREVIEW → LINKED_RUNTIME`
- `LINK_SIMULATED_NO_RUNTIME → PUBLISHED`
- qualunque collegamento implicito prodotto da ricerca, adattamento, rigenerazione o proposta editoriale.

## 6. Idempotenza

La stessa coppia logica `lessonRef + materialRef + teacherDecision=LINK` conserva lo stesso `clientRequestId`. Una ripetizione non crea una seconda ricevuta logica.

Una sostituzione reale del materiale genera invece un nuovo intento e richiede una nuova conferma docente.

## 7. Separazione da Atlas

Il collegamento alla lezione e la proposta di pubblicazione sono assi indipendenti:

- un materiale può essere collegato senza essere proposto per Atlas;
- un materiale può essere proposto per Atlas senza che P2 lo consideri pubblicato;
- una proposta Atlas non può modificare retroattivamente il consenso al collegamento;
- `publicationRequestId` non sostituisce `clientRequestId` del collegamento.

## 8. Feedback percepibile

Ogni decisione deve mostrare almeno:

- cosa sta per accadere;
- quale lezione riceverebbe il materiale;
- quale materiale viene collegato;
- esito della simulazione;
- dichiarazione esplicita `NO_RUNTIME`;
- azione successiva disponibile.

Il feedback non può dipendere soltanto da colore, icona o toast effimero.

## 9. Privacy e dati

P2 non introduce dati personali degli studenti, account studente, analytics, tracking o telemetria. Gli identificatori del prototipo sono fixture tecniche non personali.

## 10. Confini invarianti

Restano invariati:

- Arena conserva autorità curricolare e approvazione;
- Atlas conserva il ruolo di pubblicazione/navigazione/materiali secondo i contratti governati;
- Docente OS resta teacher-first;
- nessuna approvazione automatica;
- nessuna scrittura cross-product in P2;
- `DOS-A1 = RUNTIME_DEFERRED`;
- P1 non viene riaperto o reinterpretato.

## 11. Criteri di accettazione P2

P2 può avanzare solo se una revisione exact-head verifica:

- **P2-E1** — conferma docente esplicita prima del collegamento;
- **P2-E2** — `lessonRef`, `materialRef`, `workItemId` ispezionabili;
- **P2-E3** — provenienza/licenza conservate quando applicabili;
- **P2-E4** — `clientRequestId` idempotente;
- **P2-E5** — ricevuta distinta dall'intento;
- **P2-E6** — nessuna scrittura runtime;
- **P2-E7** — collegamento e pubblicazione restano indipendenti;
- **P2-E8** — annullamento senza effetti;
- **P2-E9** — feedback percepibile anche su smartphone;
- **P2-E10** — nessun dato personale studente o tracking.

## 12. Fuori ambito

Sono esplicitamente fuori da P2:

- adapter reale verso Docente OS;
- persistenza del collegamento;
- storage del materiale;
- pubblicazione Atlas reale;
- autorizzazione studente;
- sincronizzazione automatica;
- attivazione DOS-A1.

Qualunque elemento fuori ambito richiede uno slice governato successivo.