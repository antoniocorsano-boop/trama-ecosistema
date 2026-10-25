# Contextual Copilot — Reusable Embedding Intent Adapter

**Data:** 2026-10-25  
**Repository:** `antoniocorsano-boop/trama-ecosistema`  
**Baseline:** `main@f5549b8a9cbbcd40752f8aa85183b3db23faf0ce`  
**Core baseline:** `@trama/contextual-copilot-core@0.3.0`  
**Downstream osservato:** `registro-docente@38b7f0dd874806aaf56dd0ecef7e93d01ce34039`  
**Stato:** DESIGN MATERIALIZED · HUMAN DESIGN REVIEW PENDING · NO IMPLEMENTATION AUTHORIZED

## 1. Intento

Creare un adapter condiviso, riusabile e provider-neutral che implementi il contratto `IntentPort` del Contextual Copilot Core 0.3 usando embedding forniti dal consumer.

L'obiettivo è consentire a più applicazioni TRAMA — inizialmente Registro Docente e successivamente Docente OS — di interpretare semanticamente il testo libero del docente senza duplicare il motore di ranking e senza spostare provider, endpoint, configurazione o authority dentro il Core condiviso.

Il package deve supportare entrambi i percorsi del Core:

- `IntentPort.resolve()` per selezionare fra azioni già autorizzate;
- `IntentPort.discover()` per riconoscere intenzioni non ancora eseguibili, come `PREPARE`, senza trasformarle in authority.

## 2. Problema osservato

Il Core 0.3 ha ora separato correttamente discovery e execution authorization, ma non include per scelta alcun motore concreto di interpretazione semantica.

Nel Registro Docente esiste già una infrastruttura embedding locale qualificata:

- `getEmbedding(text, config, context)`;
- provider locale vincolato a loopback;
- data-flow guard;
- cache in memoria;
- cosine similarity già usata da LIB-05A per `query -> LibrarySource`.

Quella infrastruttura è verticale al Registro e non deve essere copiata dentro Docente OS né importata nel Core.

Serve quindi un livello intermedio condiviso:

```text
consumer app
  └─ local embed(text)
       ↓
@trama/contextual-copilot-intent-embedding
       ↓
IntentPort.resolve() / IntentPort.discover()
       ↓
@trama/contextual-copilot-core
```

## 3. Invarianti non negoziabili

1. Il package è separato da `@trama/contextual-copilot-core`.
2. Il Core 0.3 non viene modificato per introdurre SDK, modelli o provider embedding.
3. Il package non conosce Registro Docente, Docente OS, Arena o altri tipi verticali.
4. Il package non crea capability e non amplia l'insieme di azioni ricevuto dal Core.
5. `resolve()` può classificare soltanto action id presenti nell'input `ResolvedAction[]`.
6. `discover()` può classificare soltanto action id presenti nell'input `IntentActionCandidate[]`.
7. Un match semantico non equivale mai ad autorizzazione.
8. Il package non effettua dispatch, persistence, mutation o provider authorization.
9. Il package espone `mode: 'local'` e non implementa alcun percorso remoto.
10. Il consumer fornisce la funzione `embed(text)`; il package non conosce endpoint, API key, model name o transport.
11. Il consumer fornisce gli esempi linguistici degli intenti; il package non incorpora lessico verticale o action id specifici.
12. Nessun keyword parser parallelo viene introdotto.
13. Nessun vector index persistente, RAG, chunking o retrieval di documenti entra nel package.
14. LIB-05A resta concettualmente separato: retrieval di fonti e intent classification possono riusare lo stesso provider embedding ma non condividono authority o score.
15. Errori tecnici dell'embedding non devono essere mascherati come `NO_INTENT_MATCH`.

## 4. Approcci considerati

### A. Adapter solo nel Registro Docente

Implementare direttamente un `IntentPort` in `registro-docente` sopra `getEmbedding()`.

**Vantaggi**
- minimo lavoro iniziale;
- accesso immediato al provider locale già presente.

**Svantaggi**
- duplica il ranking quando Docente OS adotterà il Core;
- rende il comportamento semantico dipendente dal primo consumer;
- crea drift fra prodotti.

**Decisione:** scartato.

### B. Package shared separato dal Core con `embed()` iniettato — scelto

Nuovo package provider-neutral sotto `shared/` che implementa `IntentPort` e riceve dal consumer:

- una funzione `embed(text)`;
- un catalogo di esempi per action id;
- configurazione strettamente algoritmica, non di provider.

**Vantaggi**
- riuso reale fra Registro e Docente OS;
- Core resta piccolo e provider-neutral;
- il consumer conserva il controllo del confine dati;
- testabilità elevata con embedding fake;
- nessun SDK esterno nel package condiviso.

**Svantaggi**
- introduce un secondo package condiviso da distribuire e qualificare;
- richiede una receipt/versione propria.

**Decisione:** approvato come direzione.

### C. Factory embedding dentro `@trama/contextual-copilot-core`

**Vantaggi**
- un solo package da distribuire.

**Svantaggi**
- mescola authority orchestration e strategia semantica concreta;
- aumenta superficie runtime e responsabilità del Core;
- rende più difficile introdurre in futuro adapter alternativi.

**Decisione:** scartato.

## 5. Collocazione e package proposto

Percorso:

```text
shared/contextual-copilot-intent-embedding/
```

Package:

```text
@trama/contextual-copilot-intent-embedding
```

Factory principale:

```ts
createEmbeddingIntentPort(...)
```

Il nome del package rende esplicita la strategia concreta. Un eventuale futuro adapter non embedding potrà vivere in un package distinto senza alterare il Core.

## 6. API pubblica proposta

### 6.1 Embedding function iniettata

```ts
export type IntentEmbeddingFunction = (
  text: string
) => Promise<readonly number[]>
```

Il package non riceve configurazione di rete o provider.

### 6.2 Catalogo intenti

```ts
export interface IntentExampleSet {
  actionId: string
  examples: readonly string[]
}
```

Il catalogo è consumer-owned perché gli action id e il linguaggio docente possono variare fra applicazioni.

Requisiti:

- `actionId` non vuoto;
- almeno un esempio non vuoto;
- action id duplicati rifiutati;
- esempi normalizzati soltanto per whitespace, senza stemming o keyword rules verticali.

### 6.3 Opzioni algoritmiche

```ts
export interface EmbeddingIntentPortOptions {
  embed: IntentEmbeddingFunction
  intents: readonly IntentExampleSet[]
  minSimilarity?: number
  minMargin?: number
}
```

Default proposti:

- `minSimilarity`: valore conservativo da fissare tramite test sintetici, non copiato automaticamente dalla soglia LIB-05A;
- `minMargin`: margine minimo fra primo e secondo match per evitare classificazioni ambigue.

I default devono essere documentati e versionati. Non devono essere presentati come confidence probabilistica.

### 6.4 Factory

```ts
export function createEmbeddingIntentPort(
  options: EmbeddingIntentPortOptions
): IntentPort
```

L'oggetto restituito deve dichiarare:

```ts
mode: 'local'
```

ed implementare sia `resolve()` sia `discover()`.

### 6.5 Dipendenza dal contratto Core

Il package deve dipendere dal Core soltanto per la superficie tipologica pubblica, non per il runtime di ranking.

Proposta:

```json
{
  "peerDependencies": {
    "@trama/contextual-copilot-core": "^0.3.0"
  }
}
```

La dichiarazione TypeScript può usare `import type` per `IntentPort`, `IntentMatch`, `ResolvedAction` e `IntentActionCandidate`; il runtime JavaScript non deve importare codice dal Core.

Conseguenze:

- un solo contratto canonico dei tipi di intent;
- nessuna duplicazione strutturale dei tipi Core;
- nessuna dipendenza runtime aggiuntiva;
- conformance test contro l'exact Core 0.3 qualificato.

Se il packaging vendored dimostra che `peerDependencies` introduce attrito non necessario, il piano può sostituirlo con una dependency locale esplicita, ma non può duplicare i tipi Core nel nuovo package.

## 7. Motore semantico condiviso

Entrambi i metodi usano lo stesso motore interno:

```ts
rankMessageAgainstActions({
  message,
  actions,
  catalog,
  embed
})
```

Sequenza proposta:

1. validare messaggio, action set e catalogo;
2. restringere il catalogo agli action id presenti nell'input ricevuto dal Core;
3. escludere action senza esempi configurati;
4. se non restano candidate, restituire `[]`;
5. ottenere embedding del messaggio;
6. ottenere embedding degli esempi delle sole candidate;
7. validare ogni vettore:
   - array non vuoto;
   - componenti tutte finite;
   - dimensione coerente con il vettore del messaggio;
   - norma non zero;
8. un output embedding tecnicamente invalido provoca errore del port, non `[]`;
9. calcolare cosine similarity fra messaggio e ciascun esempio;
10. per ogni action usare il miglior similarity score fra i suoi esempi;
11. scartare score sotto `minSimilarity`;
12. ordinare score desc, poi action id asc come ordine locale stabile;
13. se esistono almeno due match sopra soglia e i primi due sono troppo vicini (`delta < minMargin`), degradare a `[]`;
14. restituire `IntentMatch[]` con action id e score finito.

Il Core resta responsabile del filtering finale, del tie-break con priority e dell'authority.

## 8. Perché "best example" e non centroid/prototype persistente

Per v0.1 si usa il miglior esempio per action anziché costruire un centroid persistente.

Motivazioni:

- nessun indice o stato persistente;
- esempi leggibili e revisionabili;
- nessun problema di compatibilità fra dimensioni/modelli dopo cambio provider;
- test deterministici più semplici;
- cache eventuale delegata all'implementazione `embed()` del consumer.

Un prototype/centroid precomputato può essere valutato in una versione futura se emergono problemi reali di latenza.

## 9. No-match vs errore tecnico

Il package deve distinguere semanticamente due classi di esito.

### No-match valido → `[]`

- messaggio vuoto quando il port viene usato fuori dal Core;
- nessuna action con esempi configurati;
- tutti gli score sotto `minSimilarity`;
- primo e secondo match sopra soglia ma troppo vicini secondo `minMargin`.

### Errore tecnico → eccezione propagata al Core

- `embed()` rifiuta/fallisce;
- embedding vuoto quando era richiesto un vettore;
- dimensioni incoerenti;
- componenti `NaN` / `Infinity`;
- norma zero;
- forma del vettore non valida.

L'errore non viene convertito in `[]`: il Core deve poter produrre `INTENT_RESOLUTION_FAILED` o `INTENT_DISCOVERY_FAILED` e distinguere un guasto del motore da un vero `NO_INTENT_MATCH`.

## 10. Sicurezza e privacy

Il package è deliberatamente cieco alla rete.

Non contiene:

- `fetch()`;
- SDK provider;
- API key;
- URL;
- retry di rete;
- fallback remoto;
- persistenza;
- telemetria.

La funzione `embed()` è il boundary del consumer. È responsabilità del consumer passarne una coerente con il proprio data-flow policy.

Per il primo consumer Registro Docente, il wrapper dovrà essere **local-only** e rifiutare configurazioni diverse dal provider locale prima di costruire il port.

La modalità `mode: 'local'` significa che il testo viene elaborato entro il boundary locale dichiarato dal consumer. Un consumer non può iniettare un embedding remoto e continuare a rappresentare il port come locale: questo deve essere esplicitamente vietato dal contratto downstream e dai test di integrazione.

## 11. Ownership degli esempi linguistici

Gli esempi non appartengono al Core né al package embedding.

Ogni consumer possiede il proprio catalogo action-specific perché:

- gli action id sono consumer-specifici;
- il lessico docente può differire per superficie;
- il catalogo deve poter evolvere senza bump del motore condiviso.

Esempio Registro, puramente illustrativo e non ancora implementato:

```ts
[
  {
    actionId: 'review-source',
    examples: [
      'può servire per questa UDA?',
      'valuta questa fonte nel contesto della lezione'
    ]
  },
  {
    actionId: 'link-source-to-uda',
    examples: [
      'collegalo a questa UDA',
      'associa questa fonte alla lezione di oggi'
    ]
  },
  {
    actionId: 'prepare-from-source',
    examples: [
      'trasformalo in un’attività',
      'prepara una proposta didattica da questa fonte'
    ]
  }
]
```

Gli esempi devono restare dati di configurazione/test del consumer, non parser a regole.

## 12. Primo vertical slice downstream previsto

Dopo integrazione del package shared, Registro Docente potrà avere un task separato che:

1. vendorizza la distribution exact-SHA del nuovo package;
2. costruisce un wrapper `embedLocalIntentText()` sopra l'Embedding Service esistente;
3. rifiuta `config.provider !== 'local'` e `config.enabled !== true`;
4. crea `createEmbeddingIntentPort()` con catalogo locale REVIEW/LINK/PREPARE;
5. inietta il port nel Contextual Copilot Core;
6. usa `discoverRequestIntent()` sul testo del Composer;
7. se scopre PREPARE, apre il `LibraryProposalPanel` esistente;
8. non invoca direttamente il provider generativo;
9. conserva classification, provider disclosure e consenso one-shot nel proposal flow già qualificato;
10. continua a usare i gate esistenti per LINK e ogni write.

`SUMMARIZE` resta fuori dal primo vertical slice operativo finché non esiste un handoff governato equivalente. Può essere aggiunto al catalogo soltanto quando il consumer possiede un percorso reale e qualificato per gestirlo.

## 13. Interazione con LIB-05A

LIB-05A e IntentPort condividono soltanto la possibile dipendenza dall'Embedding Service locale del consumer.

Restano separati:

```text
LIB-05A:
query -> LibrarySource ranking

Intent adapter:
message -> intended action ranking
```

Non si sommano i punteggi.
Non si riusa la soglia LIB-05A automaticamente.
Non si persiste un indice condiviso.
Non si usa il relevance resolver LIB-03B per inferire intenti.

## 14. TDD previsto per il package shared

Il primo RED deve dimostrare che il package non esiste ancora e che un consumer non può costruire un IntentPort embedding condiviso.

### Contract tests minimi

1. factory restituisce `mode: 'local'` e implementa `resolve` + `discover`;
2. `resolve()` vede soltanto action id presenti nell'input;
3. `discover()` vede soltanto action id presenti nell'input;
4. action id presenti nel catalogo ma assenti dall'input non possono comparire in output;
5. best-example similarity ordina correttamente due action;
6. score sotto soglia → `[]`;
7. gap sotto `minMargin` → `[]`;
8. vettori con dimensioni diverse → eccezione;
9. `NaN` / `Infinity` → eccezione;
10. norma zero → eccezione;
11. embedding function che fallisce → eccezione propagata al Core;
12. il Core traduce la failure in `INTENT_RESOLUTION_FAILED` / `INTENT_DISCOVERY_FAILED`;
13. catalogo duplicato o invalido rifiutato alla costruzione;
14. input action array e catalogo non vengono mutati;
15. nessun `fetch`, provider SDK o storage dependency nel runtime package;
16. package surface e distribution receipt riproducibili.

### Core conformance test

Con il package collegato al Core 0.3 in test:

- `resolveRequest()` può classificare soltanto azioni autorizzate;
- `discoverRequestIntent()` può riconoscere PREPARE con `generativeMode: 'none'`;
- `DISCOVERED PREPARE` non produce dispatch;
- `INSTITUTIONAL_DECISION` e `WRITE_EXTERNAL` restano esclusi dal Core prima del port;
- failure tecnica dell'adapter resta distinguibile da `NO_INTENT_MATCH`.

## 15. Distribution e versioning

Il package deve avere versionamento indipendente dal Core.

Prima versione proposta:

```text
@trama/contextual-copilot-intent-embedding@0.1.0
```

Distribution contract analogo al Core:

- package manifest;
- public type surface;
- runtime source;
- README;
- deterministic SHA-256 receipt;
- source commit e distribution commit immutabili;
- consumer vendoring verificabile byte-per-byte.

Il Core resta `0.3.x` se non richiede modifiche.

## 16. Gate di qualificazione

Fase shared package:

1. design approvato;
2. implementation plan separato;
3. TDD RED causale;
4. implementazione minima;
5. package tests completi;
6. Core conformance tests;
7. repository governance/security tests;
8. exact-SHA qualification;
9. distribution receipt/digest;
10. review del diff;
11. stop prima del merge per decisione umana.

Solo dopo integrazione shared:

12. task downstream Registro separato;
13. TDD del wrapper local-only e catalogo intents;
14. Composer/discovery wiring minimo;
15. browser qualification reale del percorso REVIEW/LINK/PREPARE;
16. stop prima del merge downstream.

## 17. Non-obiettivi della v0.1

- nessun modello embedding incluso;
- nessun provider remoto;
- nessun endpoint HTTP;
- nessun API key management;
- nessun fallback Gemini;
- nessun keyword parser;
- nessun LLM intent classifier;
- nessun RAG;
- nessun vector database;
- nessun persisted vector index;
- nessun multi-source orchestration;
- nessun hybrid lexical/semantic intent score;
- nessuna modifica a `discoverRequestIntent()` o ai guardrail Core 0.3;
- nessuna UI;
- nessun deploy.

## 18. Failure modes da prevenire

### Intent match trattato come authority

**Rischio:** il consumer usa il primo match direttamente come comando.

**Mitigazione:** il port restituisce soltanto `IntentMatch`; Core continua a filtrare discovery/resolve e dispatch resta separato.

### Consumer remoto mascherato come local

**Rischio:** un consumer passa una funzione embedding remota ma il port dichiara `mode: 'local'`.

**Mitigazione:** il shared package non può verificare la rete; il contratto impone wrapper local-only downstream e test statici/runtime del consumer. Nessun adapter remoto è previsto in v0.1.

### Catalogo troppo aggressivo

**Rischio:** esempi sovrapposti producono falsi positivi.

**Mitigazione:** threshold + ambiguity margin + fail-closed; catalogo versionato/testato dal consumer.

### Errore tecnico mascherato da no-match

**Rischio:** un provider locale guasto appare come se il docente non avesse espresso alcun intento.

**Mitigazione:** output embedding invalido o exception propagano; è il Core a produrre `INTENT_*_FAILED`.

### Coupling al Registro

**Rischio:** action id o copy del Registro entrano nel package.

**Mitigazione:** zero catalogo built-in; esempi passati dal consumer.

### Duplicazione con LIB-05A

**Rischio:** si crea un secondo Embedding Service.

**Mitigazione:** il package riceve `embed()`; il Registro riusa l'infrastruttura esistente.

### Hidden persistence

**Rischio:** cache o prototype persistenti rendono il comportamento dipendente dal modello precedente.

**Mitigazione:** v0.1 stateless; eventuale cache resta nel provider consumer.

## 19. Decisione richiesta

Approvare o richiedere modifiche alla seguente architettura:

- nuovo package separato `@trama/contextual-copilot-intent-embedding@0.1.0`;
- `createEmbeddingIntentPort()` provider-neutral;
- `embed(text)` iniettato dal consumer;
- catalogo di esempi posseduto dal consumer e keyed per action id;
- algoritmo best-example cosine similarity con threshold + ambiguity margin;
- errori embedding propagati al Core e distinti dal no-match;
- dipendenza dal Core solo tipologica/peer, nessun runtime coupling;
- `mode: 'local'`, nessun percorso remoto;
- primo consumer Registro limitato a REVIEW/LINK/PREPARE;
- nessuna modifica al Core 0.3.

Dopo approvazione di questo design, il passo successivo è un implementation plan separato. Nessun codice shared o consumer è autorizzato da questo documento.