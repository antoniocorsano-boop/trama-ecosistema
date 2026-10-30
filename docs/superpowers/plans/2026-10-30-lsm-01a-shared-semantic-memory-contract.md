# LSM-01A Shared Semantic Memory Contract Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** creare un package shared provider-neutral che definisca e validi proiezioni, richieste e hit della memoria semantica locale senza introdurre storage, rete, modello o authority applicativa.

**Architecture:** nuovo package `@trama/contextual-copilot-semantic-memory@0.1.0`, autonomo dal Core a runtime, con tipi TypeScript e validatori JavaScript puri. Il package descrive l'envelope cross-app e i fail-closed invariants; il runtime Termux e i consumer saranno incrementi separati.

**Tech Stack:** ESM JavaScript, TypeScript declaration file, Node `node:test`, Python `unittest` per distribution receipt, npm pack offline.

**Spec:** `docs/superpowers/specs/2026-10-30-contextual-copilot-local-semantic-memory-design.md`

## Global Constraints

- Nessuna dipendenza runtime da SQLite, `sqlite-vec`, HTTP, `fetch`, provider, modello o consumer verticale.
- Nessuna classe `STUDENT_PERSONAL`, `STUDENT_SENSITIVE`, `INSTITUTIONAL`, `UNKNOWN` o `AMBIGUOUS` può essere rappresentata come data class ammessa v1.
- `canonicalRef`, identity sorgente e `revision` sono obbligatori per ogni projection.
- Metadata limitati a string-to-string e copiati difensivamente.
- No-match è rappresentato da `hits: []`; i validatori non trasformano failure tecniche in no-match.
- Il package non modifica `@trama/contextual-copilot-core` e non crea capability, policy o dispatch.
- Package surface distribuibile: `README.md`, `index.d.ts`, `package.json`, `src/index.js`.
- Consumer mode: `vendored-file-package`; nessuna rete necessaria a build/runtime del package.

## Review Focus

- Projection con classification vietata: deve essere rifiutata prima di qualunque uso downstream.
- Metadata con valori non stringa o chiavi/prototipi anomali: devono essere rifiutati o normalizzati senza prototype pollution.
- Identità/revision vuote o whitespace-only: devono fallire, non produrre un oggetto apparentemente valido.
- Search `limit` fuori range e namespace vuoti/duplicati: comportamento deterministico e bounded.
- Hit restituito con score non finito o data class non richiesta: validazione fail-closed.

---

### Task 1: Package contract e projection validator

**Files:**
- Create: `shared/contextual-copilot-semantic-memory/package.json`
- Create: `shared/contextual-copilot-semantic-memory/index.d.ts`
- Create: `shared/contextual-copilot-semantic-memory/src/index.js`
- Create: `shared/contextual-copilot-semantic-memory/test/projection-contract.test.mjs`

**Interfaces:**
- Produces: `SEMANTIC_MEMORY_DATA_CLASSES`, `validateSemanticMemoryProjection(input)` e i tipi `SemanticMemoryProjectionV1`, `SemanticMemoryDataClass`.

- [ ] **Step 1: scrivere il RED del package/projection**

Aggiungere test che richiedano:

```js
const valid = validateSemanticMemoryProjection({
  schema: 'trama.semantic-memory-projection/v1',
  sourceAppId: 'registro-docente',
  sourceType: 'professional-memory-entry',
  sourceId: 'memory-1',
  revision: '2026-10-30T20:00:00Z:abc123',
  namespace: 'registro/professional-memory',
  text: 'Preferisce schede operative sintetiche.',
  dataClass: 'TEACHER_PROFESSIONAL',
  canonicalRef: 'registro://professional-memory/memory-1',
  updatedAt: '2026-10-30T20:00:00Z',
  metadata: { category: 'format-preference' }
});
```

Assert: output frozen/copiato difensivamente; data class vietate, campi identity vuoti, metadata non stringa e testo vuoto sono rifiutati.

- [ ] **Step 2: eseguire il RED**

Run: `node --test shared/contextual-copilot-semantic-memory/test/projection-contract.test.mjs`  
Expected: FAIL perché package/validator non esistono.

- [ ] **Step 3: implementare package minimo e `validateSemanticMemoryProjection(input)`**

Firma:

```ts
export function validateSemanticMemoryProjection(input: unknown): SemanticMemoryProjectionV1;
```

Valori ammessi esatti:

```text
PUBLIC_APP
TEACHER_PROFESSIONAL
CURRICULUM
AGGREGATED_NON_IDENTIFIABLE
```

Non accettare oggetti metadata con valori non stringa. Copiare e congelare projection + metadata.

- [ ] **Step 4: eseguire il GREEN Task 1**

Run: `npm test --prefix shared/contextual-copilot-semantic-memory`  
Expected: PASS.

- [ ] **Step 5: commit**

```bash
git add shared/contextual-copilot-semantic-memory
git commit -m "feat(memory): define semantic projection contract"
```

### Task 2: Search request, hit e response semantics

**Files:**
- Modify: `shared/contextual-copilot-semantic-memory/index.d.ts`
- Modify: `shared/contextual-copilot-semantic-memory/src/index.js`
- Create: `shared/contextual-copilot-semantic-memory/test/search-contract.test.mjs`

**Interfaces:**
- Consumes: `SemanticMemoryDataClass` e validator helpers Task 1.
- Produces: `validateSemanticMemorySearchRequest(input)`, `validateSemanticMemoryHit(input)`, `validateSemanticMemorySearchResponse(input)` e relativi tipi.

- [ ] **Step 1: scrivere RED search/hit**

Testare:

- query whitespace -> request valido ma normalizzato a query vuota solo se il caller vuole short-circuit; il validator non chiama servizi;
- `namespaces` non vuoto, trimmed, deduplicato in ordine stabile;
- `allowedDataClasses` subset dell'allowlist;
- `limit` intero `1..20`;
- score hit finito;
- identity/revision/canonicalRef obbligatorie anche sugli hit;
- response `{ schema: 'trama.semantic-memory-search-response/v1', hits: [] }` valida come no-match;
- hit con data class non compresa in `allowedDataClasses` rifiutato dal validator di response quando riceve la request di riferimento.

- [ ] **Step 2: eseguire RED**

Run: `node --test shared/contextual-copilot-semantic-memory/test/search-contract.test.mjs`  
Expected: FAIL per API mancanti.

- [ ] **Step 3: implementare le API**

Firme:

```ts
export function validateSemanticMemorySearchRequest(input: unknown): SemanticMemorySearchRequestV1;
export function validateSemanticMemoryHit(input: unknown): SemanticMemoryHitV1;
export function validateSemanticMemorySearchResponse(
  input: unknown,
  request?: SemanticMemorySearchRequestV1
): SemanticMemorySearchResponseV1;
```

- [ ] **Step 4: GREEN search**

Run: `npm test --prefix shared/contextual-copilot-semantic-memory`  
Expected: PASS.

- [ ] **Step 5: commit**

```bash
git add shared/contextual-copilot-semantic-memory
git commit -m "feat(memory): validate semantic search envelopes"
```

### Task 3: Health, source ref e receipts di mutazione derivata

**Files:**
- Modify: `shared/contextual-copilot-semantic-memory/index.d.ts`
- Modify: `shared/contextual-copilot-semantic-memory/src/index.js`
- Create: `shared/contextual-copilot-semantic-memory/test/runtime-envelope-contract.test.mjs`

**Interfaces:**
- Produces: `validateSemanticMemorySourceRef`, `validateSemanticMemoryHealth`, `validateSemanticMemoryUpsertReceipt`, `validateSemanticMemoryRemoveReceipt`.

- [ ] **Step 1: scrivere RED**

Richiedere contratti esatti:

```text
trama.semantic-memory-health/v1
trama.semantic-memory-upsert-receipt/v1
trama.semantic-memory-remove-receipt/v1
```

Health deve riportare almeno `status: ready|degraded|rebuild-required`, `protocolVersion: 1`, `modelId`, `dimensions`, `indexRevision`. `dimensions` può essere `null` solo prima del primo indice/modello disponibile.

Upsert receipt deve distinguere `inserted | replaced | unchanged`; remove `removed | absent`; entrambi includono identity e revision pertinente senza contenuto testuale.

- [ ] **Step 2: eseguire RED**

Run: `node --test shared/contextual-copilot-semantic-memory/test/runtime-envelope-contract.test.mjs`  
Expected: FAIL.

- [ ] **Step 3: implementare validator/types**

Nessuna rete o persistenza: soltanto validazione e defensive copy.

- [ ] **Step 4: GREEN completo package**

Run: `npm test --prefix shared/contextual-copilot-semantic-memory`  
Expected: PASS.

- [ ] **Step 5: commit**

```bash
git add shared/contextual-copilot-semantic-memory
git commit -m "feat(memory): add local runtime envelope contracts"
```

### Task 4: Cross-app invariants e bounded package

**Files:**
- Create: `shared/contextual-copilot-semantic-memory/test/cross-app-boundary.test.mjs`
- Create: `shared/contextual-copilot-semantic-memory/README.md`
- Create: `tests/test_contextual_copilot_semantic_memory_contract.py`

**Interfaces:**
- Consumes: API Tasks 1-3.
- Produces: prova che lo stesso contratto accetta Registro e Docente OS senza branch applicativi e che il package resta provider-neutral.

- [ ] **Step 1: RED repository-level**

Il test Python deve fallire finché README/surface non dimostrano:

- nessun `fetch(`, SQLite, `sqlite-vec`, provider/model name o endpoint nel runtime package;
- nessun action id verticale;
- package `private: true`, Node >=20;
- `npm pack --dry-run --json` contiene solo i quattro file importabili.

Il test JS deve usare due projection con `sourceAppId` diversi e lo stesso validator senza configurazione specifica.

- [ ] **Step 2: eseguire RED**

Run:

```bash
node --test shared/contextual-copilot-semantic-memory/test/*.test.mjs
python3 -m unittest tests.test_contextual_copilot_semantic_memory_contract -v
```

Expected: repository test RED sulle garanzie ancora mancanti.

- [ ] **Step 3: aggiungere README e bounded-surface guarantees**

README deve dichiarare esplicitamente: derived index, no authority, no storage/network/model, allowed classes, provenance, consumer responsibilities.

- [ ] **Step 4: GREEN**

Run: gli stessi due comandi.  
Expected: PASS.

- [ ] **Step 5: commit**

```bash
git add shared/contextual-copilot-semantic-memory tests/test_contextual_copilot_semantic_memory_contract.py
git commit -m "test(memory): enforce cross-app semantic memory boundary"
```

### Task 5: Distribution receipt exact-SHA e governance qualification

**Files:**
- Create: `shared/contextual-copilot-semantic-memory/distribution.json`
- Create: `tests/test_contextual_copilot_semantic_memory_distribution.py`

**Interfaces:**
- Consumes: package source congelato Tasks 1-4.
- Produces: receipt verificabile per consumo vendorizzato futuro.

- [ ] **Step 1: congelare source commit e scrivere RED receipt**

`EXPECTED_SOURCE_COMMIT` deve essere l'exact commit che contiene i quattro file package definitivi prima della receipt.

Il test richiede:

```text
schemaVersion = trama.contextual-copilot-semantic-memory-distribution/v1
package = @trama/contextual-copilot-semantic-memory@0.1.0
consumerMode = vendored-file-package
networkRequiredAtBuild = false
externalRegistryRequired = false
```

con SHA-256 esatto di `README.md`, `index.d.ts`, `package.json`, `src/index.js`.

- [ ] **Step 2: eseguire RED receipt**

Run: `python3 -m unittest tests.test_contextual_copilot_semantic_memory_distribution -v`  
Expected: FAIL perché receipt assente/stale.

- [ ] **Step 3: creare `distribution.json` dal source freeze**

Non modificare più i quattro file distribuibili dopo il source freeze; se cambiano, creare un nuovo source freeze e aggiornare il test.

- [ ] **Step 4: qualificazione completa**

Run:

```bash
npm test --prefix shared/contextual-copilot-semantic-memory
python3 -m unittest tests.test_contextual_copilot_semantic_memory_contract -v
python3 -m unittest tests.test_contextual_copilot_semantic_memory_distribution -v
python3 -m unittest discover -s tests -v
```

Expected: PASS completo.

- [ ] **Step 5: commit candidate**

```bash
git add shared/contextual-copilot-semantic-memory/distribution.json tests/test_contextual_copilot_semantic_memory_distribution.py
git commit -m "chore(memory): freeze semantic memory distribution receipt"
```

- [ ] **Step 6: aprire/aggiornare Draft PR e fermarsi prima del merge**

Registrare exact head, source freeze, test count e confini. Nessun consumer wiring, runtime Termux, deploy o publish in LSM-01A.
