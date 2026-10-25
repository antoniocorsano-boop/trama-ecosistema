# LIB-04A — Shared Contextual Copilot Request & Intent Contract

**Data:** 2026-10-25  
**Repository:** `antoniocorsano-boop/trama-ecosistema`  
**Baseline:** `main@85a01142d90c30da9b4fbbc339a92d1457bb04b3`  
**Pacchetto:** `@trama/contextual-copilot-core`  
**Predecessore:** CORE-DIST-01 / `@trama/contextual-copilot-core@0.1.0`  
**Origine:** audit LIB end-to-end in `registro-docente`, PR #53  
**Decisione umana:** APPROVED 2026-10-25  
**Stato:** IMPLEMENTATION AUTHORIZED · NO MERGE · NO DEPLOY

## 1. Intento

Chiudere il gap fra azioni contestuali già risolte dal Core e un vero ingresso conversazionale condiviso.

Il docente deve poter esprimere un messaggio libero come «usa questa fonte per preparare l'attività» senza costringere ogni consumer a costruire un parser locale. Il Core deve interpretare il messaggio soltanto entro il perimetro di azioni già dichiarate, ammesse dalla policy e compatibili con privacy e modalità generativa.

LIB-04A non costruisce UI, chat persistente o generazione. Introduce il contratto headless che i presentation adapter potranno consumare.

## 2. Principio di autorità

L'ordine resta invariato:

```text
Policy > capability dichiarate dal consumer > stato > intent/semantica > preferenze
```

L'intent resolver è un **narrowing layer**. Può ordinare o selezionare un sottoinsieme delle azioni già ammesse; non può introdurre nuove azioni, capability, permessi o authority.

## 3. Approcci considerati

### A. Parser testuale specifico nel Registro

Respinto. Duplicava nel consumer una responsabilità già assegnata al Contextual Copilot Core e avrebbe creato vocabolari divergenti fra prodotti.

### B. Riutilizzare `SemanticPort.rank()` passando implicitamente il messaggio

Respinto. Il contratto attuale di ranking riceve solo `context` e `actions`; sovraccaricarlo con stato implicito renderebbe opaca la semantica e romperebbe la separazione fra ranking contestuale e interpretazione dell'intento.

### C. `CopilotRequest` + `IntentPort` opzionale — scelto

Il Core riceve un request esplicito e provider-neutral. Un `IntentPort` opzionale, locale o remoto, restituisce score solo per action id. Il Core filtra ogni output contro le azioni già autorizzate e degrada deterministicamente quando il port manca, è vietato dalla privacy o fallisce.

Questo mantiene il Core riusabile e lascia il modello concreto di classificazione fuori dal dominio condiviso.

## 4. Contratti pubblici

### 4.1 CopilotRequest

```ts
export interface CopilotRequest {
  context: ContextSnapshot
  message: string
  allowedCapabilities: readonly CapabilityId[]
}
```

Regole:

- `message` deve essere una stringa non vuota dopo trim;
- `allowedCapabilities` contiene solo capability note;
- `allowedCapabilities` è un ulteriore limite e non può ampliare `context.capabilities`;
- il Core preserva il messaggio come input semantico ma non lo persiste;
- il consumer è responsabile di costruire `context.privacy` in modo coerente con tutti i materiali inclusi nella richiesta corrente.

### 4.2 IntentPort

```ts
export interface IntentMatch {
  actionId: string
  score: number
}

export interface IntentPort {
  mode: 'local' | 'remote'
  resolve(input: {
    context: ContextSnapshot
    message: string
    actions: readonly ResolvedAction[]
  }): Promise<readonly IntentMatch[]>
}
```

Il port non riceve registry o authority aggiuntiva. Gli unici action id utili sono quelli presenti in `actions`.

### 4.3 Risoluzione

```ts
export interface CopilotRequestResolution {
  status: 'RESOLVED' | 'UNRESOLVED'
  reason:
    | 'INTENT_RESOLVED'
    | 'NO_ALLOWED_ACTIONS'
    | 'INTENT_PORT_UNAVAILABLE'
    | 'REMOTE_PROVIDER_NOT_AUTHORIZED'
    | 'PROTECTED_DATA_REMOTE_DENIED'
    | 'INTENT_RESOLUTION_FAILED'
    | 'NO_INTENT_MATCH'
  actions: readonly ResolvedAction[]
}
```

`actions` è sempre composto esclusivamente da azioni già ammesse dal normale resolver del Core e ulteriormente limitate da `allowedCapabilities`.

## 5. `resolveRequest()`

`ContextualCopilotCore` aggiunge:

```ts
resolveRequest(request: CopilotRequest): Promise<CopilotRequestResolution>
```

Sequenza obbligatoria:

1. validare `ContextSnapshot` e request;
2. risolvere le azioni normali del Core, inclusi guardrail generativi, policy e Semantic Port esistente;
3. restringere alle capability presenti anche in `request.allowedCapabilities`;
4. se non restano azioni → `UNRESOLVED / NO_ALLOWED_ACTIONS`;
5. se `IntentPort` manca → `UNRESOLVED / INTENT_PORT_UNAVAILABLE`, mantenendo le azioni deterministiche consentite come fallback presentabile;
6. se `IntentPort.mode = remote`, applicare prima gli stessi guardrail di accesso remoto già usati dal Core;
7. se il port è autorizzato, invocarlo con uno snapshot difensivo e solo le azioni consentite;
8. ignorare action id sconosciuti/non autorizzati e score non finiti;
9. se almeno un match valido esiste → `RESOLVED / INTENT_RESOLVED`, restituendo solo i match validi ordinati per score decrescente, poi priority, poi id;
10. se nessun match valido → `UNRESOLVED / NO_INTENT_MATCH`, con fallback deterministico;
11. se il port lancia errore → `UNRESOLVED / INTENT_RESOLUTION_FAILED`, con fallback deterministico.

## 6. Privacy

Un `IntentPort` remoto è semanticamente un flusso remoto e quindi:

- non viene invocato quando `context.privacy.remoteProviderAllowed = false`;
- non viene invocato con `STUDENT_PERSONAL` o `STUDENT_SENSITIVE`;
- in entrambi i casi il messaggio non attraversa il confine remoto;
- il Core non tenta di riclassificare il testo del messaggio;
- assenza di autorizzazione remota non elimina le azioni locali già consentite: il risultato degrada a `UNRESOLVED` con fallback deterministico.

## 7. Isolamento e immutabilità

`IntentPort` riceve:

- `ContextSnapshot` difensivo/read-only;
- array `actions` frozen;
- stringa `message`;

Tentativi di mutare context o actions non possono ampliare capability o cambiare una chiamata successiva.

## 8. Compatibilità

LIB-04A è backward-compatible:

- `resolveActions()` resta invariato;
- `dispatch()` resta invariato;
- `SemanticPort` resta invariato;
- `IntentPort` è opzionale;
- consumer 0.1 che non usa `resolveRequest()` mantiene comportamento identico.

La nuova superficie pubblica giustifica minor version `0.2.0`.

## 9. Distribuzione

La superficie importabile resta esattamente:

```text
README.md
index.d.ts
package.json
src/index.js
```

`distribution.json` resta fuori dal package e viene aggiornato dopo il commit canonico dei quattro file distribuibili con:

- version `0.2.0`;
- exact source commit;
- SHA-256 dei quattro file;
- `consumerMode = vendored-file-package`;
- nessun registry esterno e nessuna rete richiesta a build/runtime del consumer.

## 10. Verifica

Il gate deve dimostrare almeno:

1. request valido e fallback deterministico senza Intent Port;
2. `allowedCapabilities` restringe ma non amplia il contesto;
3. un Intent Port locale può risolvere un sottoinsieme e ordinarlo;
4. action id inventati o non autorizzati vengono ignorati;
5. errore Intent Port degrada senza alterare authority;
6. Intent Port remoto non riceve messaggio né contesto senza autorizzazione;
7. contesto studente protetto non raggiunge Intent Port remoto;
8. snapshot e azioni passati alle estensioni restano difensivi;
9. `resolveActions()` e `dispatch()` conservano i test precedenti;
10. package surface e distribution manifest restano riproducibili.

## 11. Non-goal LIB-04A

Non rientrano in questo blocco:

- UI composer/chat;
- cronologia conversazionale;
- provider generativo;
- parsing verticale Registro o Docente OS;
- persistenza dei messaggi;
- multi-source orchestration;
- target `activity`;
- semantic retrieval globale;
- `ASK`, `CREATE`, `EXPLAIN` come implementazioni verticali;
- merge, deploy o publish.

## 12. Criterio di uscita

LIB-04A è qualificato quando:

- TDD RED causale è registrato;
- package tests e regressioni Core passano;
- Governance CI passa sullo stesso exact candidate;
- `@trama/contextual-copilot-core@0.2.0` ha manifest di distribuzione coerente con exact source commit e digest;
- nessun consumer è stato ancora aggiornato;
- nessun merge, deploy o publish è stato eseguito.
