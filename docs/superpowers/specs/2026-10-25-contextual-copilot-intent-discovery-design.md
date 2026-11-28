# Contextual Copilot — Intent Discovery before Execution Authorization

**Data:** 2026-10-25  
**Repository:** `antoniocorsano-boop/trama-ecosistema`  
**Baseline:** `main@8c47c34048acc943a1f4a2067b29629eb880e7ef`  
**Downstream osservato:** `antoniocorsano-boop/registro-docente@72a7413ec8f764b7711592919d6ebcb430b18df3`  
**Pacchetto corrente:** `@trama/contextual-copilot-core@0.2.0`  
**Stato:** DESIGN APPROVED · IMPLEMENTATION PLAN READY · NO PRODUCT CODE AUTHORIZED

## 1. Intento

Separare in modo esplicito due concetti che oggi sono accoppiati nel Contextual Copilot Core:

1. **capire cosa il docente sta chiedendo**;
2. **stabilire se quella azione è attualmente autorizzata ed eseguibile**.

La separazione deve consentire a un `IntentPort` locale di riconoscere, per esempio, che «trasforma questa fonte in un'attività» corrisponde a `PREPARE`, anche quando il consumer corrente è configurato con `generativeMode: 'none'` e quindi `PREPARE` non è ancora eseguibile.

Il riconoscimento dell'intento non deve mai produrre authority, effettuare dispatch, abilitare provider, concedere consenso remoto o trasformare un'azione vietata in un'azione eseguibile.

## 2. Problema osservato

Il Core 0.2.0 implementa correttamente il principio di narrowing: `resolveRequest()` risolve prima le azioni ammesse da `resolveActions()` e soltanto dopo invoca `IntentPort` sul sottoinsieme rimasto.

Nel consumer Registro Docente questo produce un gap preciso:

- il Core locale è costruito con `generativeMode: 'none'`;
- `PREPARE` e `SUMMARIZE` richiedono generative AI;
- vengono quindi esclusi prima dell'interpretazione del messaggio;
- il testo libero non può essere riconosciuto semanticamente come richiesta di `PREPARE`, anche se l'esecuzione di `PREPARE` è già disponibile più avanti attraverso un handoff governato separato con classificazione privacy, provider disclosure e consenso one-shot.

Il problema non è quindi «manca una policy permissiva», ma «manca un contratto di discovery semanticamente leggibile che non equivalga ad autorizzazione».

## 3. Invarianti non negoziabili

1. `IntentPort` resta un **narrowing layer**, mai una sorgente di authority.
2. `resolveActions()` conserva la semantica attuale: restituisce soltanto azioni attualmente ammesse.
3. `resolveRequest()` conserva la semantica attuale e resta backward-compatible nel comportamento.
4. `dispatch()` conserva i gate di policy e human confirmation esistenti.
5. Nessun intento scoperto può essere eseguito direttamente dal nuovo contratto.
6. `INSTITUTIONAL_DECISION` non diventa discoverable come scorciatoia conversazionale.
7. Un Intent Port remoto resta soggetto ai guardrail remoti prima di ricevere messaggio o contesto.
8. Un Intent Port locale può interpretare il messaggio senza autorizzare trasferimenti remoti successivi.
9. Il consumer continua a dichiarare esplicitamente `allowedCapabilities`; la discovery non può ampliarle.
10. Il Core condiviso resta provider-neutral e non importa embedding, modelli o SDK verticali.
11. La nuova superficie deve essere **additiva**: non si cambia il contratto di `IntentPort.resolve()` già pubblicato in 0.2.0.

## 4. Approcci considerati

### A. Rendere `resolveRequest()` più permissivo

Scartato.

Far arrivare a `IntentPort.resolve()` anche azioni attualmente negate e poi restituirle nello stesso `CopilotRequestResolution` confonderebbe «riconosciuta» con «autorizzata». Aumenterebbe il rischio che UI o consumer trattino un match semantico come azione disponibile.

### B. Modificare `generativeMode: 'none'` nel consumer Registro

Scartato.

Nasconderebbe il problema architetturale e rischierebbe di rendere generative action risolvibili prima dei gate specifici già qualificati nel proposal flow. Il consumer non deve fingere una disponibilità generativa globale per consentire soltanto il riconoscimento dell'intento.

### C. Introdurre una fase esplicita di **Intent Discovery** separata da `resolveRequest()` — scelta proposta

Il Core aggiunge un metodo headless dedicato che riconosce l'intenzione entro capability e policy di discovery, ma restituisce soltanto intenti scoperti, non `ResolvedAction` eseguibili.

L'esecuzione continua ad avvenire tramite i contratti esistenti.

## 5. Contratto proposto

### 5.1 Nuova fase policy

Estendere il phase type:

```ts
type PolicyPhase = 'DISCOVER' | 'RESOLVE' | 'DISPATCH'
```

`DISCOVER` significa esclusivamente: «questa azione può essere considerata come possibile intenzione conversazionale in questo consumer e contesto?».

Non significa che l'azione sia disponibile, autorizzata per un provider o dispatchable.

### 5.2 Descriptor per la discovery

Per evitare che la discovery lavori su oggetti il cui nome implichi già autorizzazione, introdurre un descriptor privo di `policy`:

```ts
export interface IntentActionCandidate {
  id: string
  capability: CapabilityId
  label: string
  priority: number
  risk: ActionRisk
  requiresGenerativeAI: boolean
  requiresSemanticSearch: boolean
}
```

Il Core costruisce copie difensive e frozen a partire dalle azioni del registry che superano i gate di discovery.

### 5.3 Evoluzione additiva di IntentPort

`IntentPort.resolve()` resta **esattamente** compatibile con 0.2.0 e continua a ricevere soltanto `ResolvedAction[]` già autorizzate dal percorso normale.

Si aggiunge un metodo opzionale dedicato:

```ts
export interface IntentPort {
  mode: 'local' | 'remote'

  resolve(input: {
    context: ContextSnapshot
    message: string
    actions: readonly ResolvedAction[]
  }): Promise<readonly IntentMatch[]>

  discover?(input: {
    context: ContextSnapshot
    message: string
    actions: readonly IntentActionCandidate[]
  }): Promise<readonly IntentMatch[]>
}
```

Conseguenze:

- un IntentPort 0.2 esistente continua a funzionare senza modifiche con `resolveRequest()`;
- `discoverRequestIntent()` è disponibile soltanto quando il port implementa `discover()`;
- l'assenza di `discover()` non viene mascherata usando impropriamente `resolve()`;
- un futuro adapter locale embedding può implementare sia `resolve()` sia `discover()` riusando lo stesso motore semantico senza confondere gli insiemi di azioni.

### 5.4 Nuovo output

```ts
export interface DiscoveredIntent {
  actionId: string
  capability: CapabilityId
}

export interface CopilotIntentDiscovery {
  status: 'DISCOVERED' | 'UNRESOLVED'
  reason:
    | 'INTENT_DISCOVERED'
    | 'NO_DISCOVERABLE_ACTIONS'
    | 'INTENT_PORT_UNAVAILABLE'
    | 'INTENT_DISCOVERY_UNAVAILABLE'
    | 'REMOTE_PROVIDER_NOT_AUTHORIZED'
    | 'PROTECTED_DATA_REMOTE_DENIED'
    | 'INTENT_DISCOVERY_FAILED'
    | 'NO_INTENT_MATCH'
  intents: readonly DiscoveredIntent[]
}
```

Il Core non espone il punteggio grezzo del provider come authority. L'ordinamento dei match è sufficiente al consumer; soglia/confidenza restano responsabilità dell'IntentPort concreto.

### 5.5 Nuovo metodo

```ts
ContextualCopilotCore.discoverRequestIntent(
  request: CopilotRequest
): Promise<CopilotIntentDiscovery>
```

Sequenza proposta:

1. validare `CopilotRequest` e `ContextSnapshot`;
2. intersecare registry actions con `context.capabilities` e `request.allowedCapabilities`;
3. applicare i core hard guards che non possono essere rilassati;
4. valutare la policy con `phase: 'DISCOVER'`;
5. escludere ogni action che la policy di discovery nega;
6. se non restano candidate → `NO_DISCOVERABLE_ACTIONS`;
7. verificare esistenza di IntentPort e di `intentPort.discover`;
8. verificare accesso al port:
   - locale: ammesso senza trasformarlo in autorizzazione remota;
   - remoto: applicare gli stessi remote access guards del Core prima di trasmettere messaggio/contesto;
9. invocare `intentPort.discover()` con snapshot e candidate descriptor frozen;
10. ignorare action id sconosciuti, fuori candidate set o score non finiti;
11. ordinare score desc, poi priority, poi id;
12. restituire soltanto `actionId + capability` dei match validi;
13. nessun match → `NO_INTENT_MATCH`;
14. errore del port → `INTENT_DISCOVERY_FAILED`;
15. nessuna esecuzione, nessun dispatch, nessuna mutazione.

## 6. Semantica della policy DISCOVER

La policy di discovery deve essere più stretta della semplice presenza nel registry ma distinta dalla disponibilità runtime.

### Deve continuare a negare

- capability non dichiarata dal consumer;
- action fuori da `allowedCapabilities`;
- `INSTITUTIONAL_DECISION`;
- restrizioni verticali/custom policy che il consumer dichiara non discoverable;
- accesso remoto all'IntentPort senza autorizzazione;
- trasmissione remota di `STUDENT_PERSONAL` / `STUDENT_SENSITIVE`.

### Non deve negare soltanto perché

- `generativeMode === 'none'`;
- il provider generativo non è ancora configurato/autorizzato;
- una successiva azione `PROPOSE` richiederà consenso o un handoff governato.

Motivazione: discovery locale non chiama il provider generativo e non esegue l'azione.

### WRITE_EXTERNAL

Per questa prima versione la proposta è conservativa: azioni `WRITE_EXTERNAL` non vengono rese discoverable attraverso il nuovo percorso finché non esiste un contratto esplicito per rappresentare «intent riconosciuto ma operazione esterna indisponibile». Questo non limita i casi Biblioteca attuali.

## 7. Compatibilità e versionamento

- `resolveActions()` invariato.
- `resolveRequest()` invariato nel comportamento osservabile.
- `dispatch()` invariato.
- `IntentPort.resolve()` invariato.
- `SemanticPort` invariato.
- nessuna nuova dipendenza runtime.
- `IntentPort.discover?()` è additivo.
- `discoverRequestIntent()` è additivo.

Questa forma è compatibile con un bump `0.3.0`, soggetto comunque a package tests e distribution audit. Nessun consumer esistente è obbligato a implementare `discover()`.

## 8. Downstream Registro Docente — uso previsto, non ancora autorizzato

Baseline osservato: `registro-docente@72a7413ec8f764b7711592919d6ebcb430b18df3`.

Dopo la qualificazione e distribuzione del Core aggiornato, un blocco downstream separato potrà:

1. vendorizzare l'exact package qualificato;
2. implementare un IntentPort **locale** usando l'infrastruttura embedding già esistente;
3. confrontare il messaggio del docente esclusivamente con descriptor/intent examples delle azioni già dichiarate;
4. usare `discoverRequestIntent()` per riconoscere REVIEW/LINK/PREPARE/SUMMARIZE;
5. per azioni già eseguibili (es. LINK) continuare a usare `resolveRequest()` e i gate esistenti;
6. per PREPARE riconosciuto aprire il proposal handoff già qualificato, senza dispatch generativo automatico;
7. mantenere provider disclosure e consenso one-shot nel punto in cui i dati stanno davvero per attraversare il confine remoto.

LIB-05A resta separato e invariato: `query -> LibrarySource` è retrieval; IntentPort è `message -> intended action`. I due possono riusare lo stesso motore embedding locale ma non devono condividere authority o punteggi.

## 9. Cosa non fare in questa fase

- nessun adapter embedding nel Core;
- nessun modello locale nel package shared;
- nessun hybrid score LIB-03B + embedding;
- nessun RAG/chunking;
- nessun vector index persistente;
- nessun multi-source;
- nessun parser keyword specifico del Registro;
- nessuna modifica al proposal runtime remoto;
- nessun deploy;
- nessun merge automatico.

## 10. TDD previsto per il Core

Il primo RED deve dimostrare precisamente il gap attuale.

### RED causale minimo

Con registry contenente:

- `review` — `REVIEW`, non generativa;
- `prepare` — `PREPARE`, generativa;

contesto con capability `REVIEW` + `PREPARE`, Core con `generativeMode: 'none'`, IntentPort locale che implementa `discover()` e riconosce `prepare`:

- `resolveActions()` deve continuare a restituire solo `review`;
- `resolveRequest()` deve conservare la semantica attuale;
- `discoverRequestIntent()` deve invece poter restituire `PREPARE` come intento scoperto;
- nessun executor viene chiamato;
- nessun provider generativo viene chiamato.

### Test di sicurezza obbligatori

1. capability assente → intent non discoverable;
2. `allowedCapabilities` restringe il candidate set;
3. IntentPort non può inventare action id;
4. `INSTITUTIONAL_DECISION` esclusa;
5. `WRITE_EXTERNAL` esclusa nella prima versione;
6. IntentPort remoto non invocato senza remote authorization;
7. student personal/sensitive non raggiunge IntentPort remoto;
8. IntentPort locale può funzionare senza remote authorization;
9. IntentPort senza `discover()` lascia `resolveRequest()` intatto e restituisce `INTENT_DISCOVERY_UNAVAILABLE` nel nuovo metodo;
10. eccezione di `discover()` degrada fail-closed;
11. input a estensione frozen/defensive;
12. regressioni complete `resolveActions`, `resolveRequest`, `dispatch` verdi;
13. i test 0.2 di `IntentPort.resolve()` restano invariati;
14. package surface e distribution manifest riproducibili.

## 11. Gate di qualificazione

Fase Core:

1. design approvato;
2. implementation plan separato;
3. TDD RED causale;
4. implementazione minima;
5. package tests completi;
6. governance/security tests del repository;
7. exact-SHA qualification;
8. distribution receipt/digest aggiornati;
9. review indipendente;
10. stop prima del merge per decisione umana.

Solo dopo integrazione del Core:

11. design separato dell'IntentPort locale embedding;
12. consumer Registro TDD;
13. browser qualification del comportamento docente reale;
14. stop prima del merge downstream.

## 12. Failure modes da prevenire

- **Authority leak:** UI tratta `DISCOVERED PREPARE` come `PREPARE allowed`.
  - Mitigazione: output discovery non contiene `ResolvedAction` né policy `allowed`.
- **Remote privacy leak:** IntentPort remoto riceve testo prima dei guardrail.
  - Mitigazione: access check prima dell'invocazione di `discover()`.
- **Consumer-specific parser drift:** Registro introduce keyword mapping parallelo.
  - Mitigazione: interpretazione soltanto tramite port condiviso.
- **Provider coupling:** Core importa embedding SDK.
  - Mitigazione: port provider-neutral, zero dipendenze modello.
- **Semantic score becomes authority:** punteggio usato per auto-dispatch.
  - Mitigazione: discovery non espone executor e il Core non dispatcha.
- **Regression 0.2:** `resolveRequest()` o `IntentPort.resolve()` cambiano accidentalmente semantica.
  - Mitigazione: test 0.2 invariati e nuovi test esclusivamente additivi.
- **Fallback improprio:** un port senza `discover()` viene chiamato via `resolve()` con candidate non autorizzate.
  - Mitigazione: vietato dal contratto; discovery fail-closed con reason dedicata.

## 13. Criterio di uscita del design

Il design è stato approvato il 2026-10-25. Il piano esecutivo canonico è:

`docs/superpowers/plans/2026-10-25-contextual-copilot-intent-discovery.md`

L'implementazione resta separata dalla PR docs-only e richiede una decisione esplicita successiva. Fino a tale decisione: **nessun codice prodotto viene modificato**.
