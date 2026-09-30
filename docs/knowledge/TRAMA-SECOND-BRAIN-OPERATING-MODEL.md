# TRAMA Second Brain — Operating Model

Stato: IMPLEMENTATION CANDIDATE / READ-ONLY / NO NEW AUTHORITY

## Decisione

Non creare un'altra knowledge base parallela.

La soluzione canonica è completare ciò che TRAMA aveva già definito con CC2-F1/E e ADR-015:

Authority layer -> Control Center observation -> ProjectContextSnapshot -> Context Pack -> persona/agente.

La chat resta un'interfaccia. Non è lo stato tecnico.

## Quattro strati

1. Authority layer — ADR, contratti, STATUS, ROADMAP, repository di dominio.
2. Observation layer — Control Center: gate, evidenze, dipendenze, freshness, maturity.
3. Memory layer — KnowledgeEvent: decisioni, recovery, vincoli, rejection, failure learning, supersession.
4. Context layer — Context Pack piccolo e verificabile per capability o soggetto.

## Protocollo obbligatorio per nuove sessioni

Prima di ricostruire un tema dalla conversazione:

1. identificare il subject/capability;
2. leggere il Context Pack;
3. applicare **ecosystem-first bootstrap**: se il tema riguarda runtime, agenti, connector, adapter, automazione o Control Center, recuperare prima i confini Arena/Atlas/Docente OS, lo stato DOS-A1 e la roadmap cross-ecosystem pertinente;
4. verificare solo i fatti volatili necessari;
5. risalire alle fonti canoniche per decisioni/evidenze forti;
6. dopo lavoro significativo registrare un KnowledgeEvent se altrimenti la decisione resterebbe solo in chat.

### Ecosystem-first bootstrap

Il bootstrap NON deve partire dallo strumento tecnico più vicino al task. Deve partire dal dominio e dal flusso che danno senso al task.

Ordine minimo per capability runtime/agentiche:

```text
TRAMA invariants
-> Arena / Atlas / Docente OS boundaries
-> workflow di ecosistema
-> Control Center / evidence state
-> connector / adapter / runtime detail
```

Riferimento normativo: `TRAMA-ADR-019`.

Questo ordine è obbligatorio per ridurre il rischio di ottimizzazione locale: un lavoro tecnicamente corretto sul runtime può essere architetturalmente errato se perde il ruolo degli altri prodotti.

## Runtime introdotto

Questa tranche materializza:

- source manifest fail-closed;
- Project Knowledge Events;
- schema ProjectContextSnapshot;
- schema Context Pack;
- builder deterministico read-only;
- Context Pack generator;
- test di provenance, exact-head recovery e negative knowledge;
- workflow CI.

## Stato live e limite esplicito

Il builder usa control-center/data/ecosystem-snapshot.json come proiezione corrente.

Non inventa PR remote, workflow remoti o exact head non presenti nelle fonti locali. Finché il collector remoto non è version-bound, ProjectContextSnapshot.status resta PARTIAL.

Questa è una garanzia: una memoria incompleta ma verificabile è preferibile a una memoria completa sintetica.

## Caso Atlas Percorsi

Il recupero di TRAMA PR #96 è registrato come KnowledgeEvent source-bound con exact head:

dfb5b106708bee88016907c13ee0d104c093e7ca

Il Context Pack atlas-percorsi deve permettere a una nuova sessione di scoprire immediatamente:

- che PR #96 contiene il pacchetto G1 recuperato;
- quale exact head leggere;
- che l'assunzione fixed-eight dei Percorsi studente è stata invalidata;
- quali fonti governano il lavoro.

## Negative knowledge

Il sistema conserva esplicitamente anche ciò che NON va ripetuto.

Primo esempio canonico:

- non usare chat history o memoria dell'assistente come fonte tecnica di stato.

## Regola di aggiornamento

Una modifica significativa deve aggiornare almeno uno fra:

- fonte autorevole di dominio;
- KnowledgeEvent;
- source binding;
- Control Center snapshot derivato.

Nessuna decisione importante deve rimanere solo nella chat.

## Fase successiva

Il prossimo incremento deve aggiungere un collector remoto read-only e version-bound per repository, PR e workflow dichiarati. Il collector deve aggiornare una RepositoryObservation derivata, non le authority dei domini.

Solo dopo quel collector il ProjectContextSnapshot potrà dichiarare CURRENT invece di PARTIAL.


## Protocollo di consolidamento documentale governato

Una ricerca, analisi o decisione significativa non è considerata stabilmente consolidata soltanto perché compare in una chat o in un commento di PR.

Quando il lavoro produce un riferimento riusabile, il ciclo documentale è:

1. **distillare** il risultato nel documento autorevole o fondante appropriato;
2. **collegare** il documento a una decisione registrata quando esiste un confine ADR/governance;
3. **registrare** il riferimento in `docs/knowledge/governed-document-registry.json` quando è fondante, normativo o necessario alla continuità;
4. dichiarare nel registro i **subject**, le dipendenze e gli **updateTriggers** che indicano quando il documento deve essere rivalutato;
5. eseguire la Governance CI, che verifica automaticamente esistenza, unicità, dipendenze e decisionRef;
6. aggiornare un KnowledgeEvent soltanto quando il significato duraturo deve entrare anche nella memoria operativa del Project Knowledge.

Il registro documentale è un **indice**, non una nuova authority. L'autorità resta nel documento/fonte di dominio indicato e nelle decisioni esistenti.

### Regola anti-orfano

Un documento fondante non deve esistere senza:
- identificatore stabile;
- percorso canonico;
- subject;
- stato;
- dipendenze dichiarate;
- trigger di aggiornamento;
- decisionRef quando applicabile.

### Regola anti-duplicazione

Prima di creare un nuovo documento:
1. cercare nel governed document registry;
2. aggiornare un riferimento esistente quando il perimetro semantico coincide;
3. creare un nuovo documento solo se introduce un contratto, una decisione o un dominio distinto.

### Automazione

Il validatore:
`scripts/validate_governed_document_registry.py`

è parte della Governance CI e deve fallire se:
- un file registrato non esiste;
- ID o path sono duplicati;
- una dipendenza documentale è inesistente;
- un ADR registrato punta a una decisione assente dal decision register;
- un documento fondante risulta orfano.

Questo rende la costruzione documentale parte del processo di sviluppo, non un'attività separata affidata alla memoria della conversazione.
## Documentation closure gate

A significant work item is not operationally complete until its durable knowledge has been closed into the project knowledge system.

The closure check SHALL ask:

1. Did the work produce a reusable architectural, strategic, contractual, process, design or validation result?
2. If yes, does an existing canonical document already own that subject?
3. If yes, update that document rather than create a duplicate.
4. If no, create the smallest appropriate canonical document.
5. If the document is foundational, normative or continuity-critical, register it in the Governed Document Registry.
6. If it changes execution order or portfolio direction, update the canonical roadmap/plan.
7. If it changes a governed decision boundary, update or create the appropriate decision record.
8. If future sessions need the result for continuity, ensure its subjects/updateTriggers make it retrievable by Project Knowledge / Session Bootstrap.
9. Run the relevant deterministic validators before considering the documentation closed.

A chat summary, pull-request description, review comment or assistant memory is not sufficient durable closure.

### Closure states

- `NOT_APPLICABLE` — no reusable durable knowledge was created;
- `UPDATED_EXISTING` — an existing canonical reference was updated;
- `CREATED_AND_REGISTERED` — a new canonical reference was created and indexed;
- `BLOCKED` — durable knowledge exists but cannot yet be canonically placed or validated.

A workstream with closure state `BLOCKED` may continue technically when safe, but SHALL be reported as documentation debt and SHALL NOT be described as fully consolidated.

### Process ownership

The person requesting the work is not responsible for remembering this gate. It is part of the TRAMA development process and should be applied by the working agent/process whenever a significant reusable result is produced.

