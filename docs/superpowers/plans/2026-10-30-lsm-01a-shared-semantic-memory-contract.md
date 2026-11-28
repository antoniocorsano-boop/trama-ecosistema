# LSM-01A Shared Semantic Memory Contract Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** creare un package shared provider-neutral che definisca e validi proiezioni, richieste, concorrenza e hit della memoria semantica locale senza introdurre storage, rete, modello o authority applicativa.

**Architecture:** nuovo package `@trama/contextual-copilot-semantic-memory@0.1.0`, autonomo dal Core a runtime, con tipi TypeScript e validatori JavaScript puri. `revision` resta un token opaco; upsert/remove usano `expectedRevision` come confronto ottimistico. Runtime Termux e consumer sono incrementi separati.

**Tech Stack:** ESM JavaScript, TypeScript declaration file, Node `node:test`, Python `unittest` per distribution receipt, npm pack offline.

**Spec:** `docs/superpowers/specs/2026-10-30-contextual-copilot-local-semantic-memory-design.md`

## Global Constraints

- Nessuna dipendenza runtime da SQLite, `sqlite-vec`, HTTP, `fetch`, provider, modello o consumer verticale.
- Data class ammesse esatte: `PUBLIC_APP`, `TEACHER_PROFESSIONAL`, `CURRICOLO`, `AGGREGATED_NON_IDENTIFIABLE`.
- `STUDENT_PERSONAL`, `STUDENT_SENSITIVE`, `INSTITUTIONAL`, `UNKNOWN`, `AMBIGUOUS` non sono rappresentabili come classi ammesse v1.
- `canonicalRef`, identity sorgente e `revision` sono obbligatori per ogni projection.
- `revision` è opaca: il package non la ordina né interpreta temporalmente.
- Upsert/remove esprimono concorrenza tramite `expectedRevision: string | null`.
- Metadata solo string-to-string e copiati difensivamente.
- No-match = `hits: []`; failure tecniche non vengono mascherate.
- Nessuna modifica a `@trama/contextual-copilot-core`; nessuna capability, policy o dispatch introdotti.
- Package surface distribuibile: `README.md`, `index.d.ts`, `package.json`, `src/index.js`.
- Consumer mode: `vendored-file-package`; nessuna rete necessaria a build/runtime del package.

## Review Focus

- Projection con data class vietata: rifiutata prima di qualunque uso downstream.
- Metadata non stringa o oggetti con prototype anomalo: rifiutati senza prototype pollution.
- Identity/revision/canonicalRef whitespace-only: failure.
- `expectedRevision` mancante o di tipo errato: failure; nessun confronto lessicografico o timestamp implicito.
- Search con limit fuori range, score non finito o hit di classe non richiesta: fail-closed.

---

### Task 1: Package contract e projection validator

**Files:**
- Create: `shared/contextual-copilot-semantic-memory/package.json`
- Create: `shared/contextual-copilot-semantic-memory/index.d.ts`
- Create: `shared/contextual-copilot-semantic-memory/src/index.js`
- Create: `shared/contextual-copilot-semantic-memory/test/projection-contract.test.mjs`

**Interfaces:**
- Produces: `SEMANTIC_MEMORY_DATA_CLASSES`, `validateSemanticMemoryProjection(input)` e tipi `SemanticMemoryProjectionV1`, `SemanticMemoryDataClass`.

- [ ] **Step 1: scrivere il RED del package/projection**

Aggiungere un caso valido:

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

Assert: defensive copy/freeze; data class vietate, campi identity/revision/canonicalRef vuoti, testo vuoto e metadata non stringa sono rifiutati. Verificare esplicitamente `CURRICOLO` ammesso e una classe non prevista rifiutata.

- [ ] **Step 2: eseguire RED**

Run: `node --test shared/contextual-copilot-semantic-memory/test/projection-contract.test.mjs`  
Expected: FAIL perché package/validator non esistono.

- [ ] **Step 3: implementare package minimo**

Firma:

```ts
export function validateSemanticMemoryProjection(input: unknown): SemanticMemoryProjectionV1;
```

Allowlist esatta:

```text
PUBLIC_APP
TEACHER_PROFESSIONAL
CURRICOLO
AGGREGATED_NON_IDENTIFIABLE
```

- [ ] **Step 4: GREEN Task 1**

Run: `npm test --prefix shared/contextual-copilot-semantic-memory`  
Expected: PASS.

- [ ] **Step 5: commit**

```bash
git add shared/contextual-copilot-semantic-memory
git commit -m "feat(memory): define semantic projection contract"
```

### Task 2: Search request, hit e response

**Files:**
- Modify: `shared/contextual-copilot-semantic-memory/index.d.ts`
- Modify: `shared/contextual-copilot-semantic-memory/src/index.js`
- Create: `shared/contextual-copilot-semantic-memory/test/search-contract.test.mjs`

**Interfaces:**
- Consumes: data class e helper Task 1.
- Produces: `validateSemanticMemorySearchRequest`, `validateSemanticMemoryHit`, `validateSemanticMemorySearchResponse`.

- [ ] **Step 1: scrivere RED search/hit**

Testare:

- schema `trama.semantic-memory-search-request/v1`;
- query trimmed; whitespace-only ammessa come input normalizzato a `''` per consentire short-circuit al runtime;
- namespaces non vuoti, trimmed, deduplicati in ordine stabile;
- allowedDataClasses subset dell'allowlist;
- `limit` intero `1..20`;
- score hit finito;
- identity/revision/canonicalRef obbligatorie sugli hit;
- `{ schema: 'trama.semantic-memory-search-response/v1', hits: [] }` è no-match valido;
- response validator con request di riferimento rifiuta hit con namespace/data class fuori scope.

- [ ] **Step 2: eseguire RED**

Run: `node --test shared/contextual-copilot-semantic-memory/test/search-contract.test.mjs`  
Expected: FAIL per API mancanti.

- [ ] **Step 3: implementare API**

```ts
export function validateSemanticMemorySearchRequest(input: unknown): SemanticMemorySearchRequestV1;
export function validateSemanticMemoryHit(input: unknown): SemanticMemoryHitV1;
export function validateSemanticMemorySearchResponse(
  input: unknown,
  request?: SemanticMemorySearchRequestV1
): SemanticMemorySearchResponseV1;
```

- [ ] **Step 4: GREEN Task 2**

Run: `npm test --prefix shared/contextual-copilot-semantic-memory`  
Expected: PASS.

- [ ] **Step 5: commit**

```bash
git add shared/contextual-copilot-semantic-memory
git commit -m "feat(memory): validate semantic search envelopes"
```

### Task 3: CAS request, source ref, health e receipts

**Files:**
- Modify: `shared/contextual-copilot-semantic-memory/index.d.ts`
- Modify: `shared/contextual-copilot-semantic-memory/src/index.js`
- Create: `shared/contextual-copilot-semantic-memory/test/runtime-envelope-contract.test.mjs`

**Interfaces:**
- Produces: validator e tipi per `SemanticMemoryUpsertRequestV1`, `SemanticMemoryRemoveRequestV1`, source ref, health, upsert/remove receipt.

- [ ] **Step 1: scrivere RED CAS/runtime envelopes**

Richiedere:

```ts
interface SemanticMemoryUpsertRequestV1 {
  schema: 'trama.semantic-memory-upsert-request/v1';
  projection: SemanticMemoryProjectionV1;
  expectedRevision: string | null;
}

interface SemanticMemoryRemoveRequestV1 {
  schema: 'trama.semantic-memory-remove-request/v1';
  source: SemanticMemorySourceRefV1;
  expectedRevision: string | null;
}
```

Testare che `expectedRevision` sia obbligatorio anche quando `null`; stringa non vuota quando presente; nessun validator provi a ordinare revisioni.

Schemi receipt/health:

```text
trama.semantic-memory-health/v1
trama.semantic-memory-upsert-receipt/v1
trama.semantic-memory-remove-receipt/v1
```

Health: `status: ready|degraded|rebuild-required`, `protocolVersion: 1`, `modelId`, `dimensions`, `indexRevision`; dimensions può essere `null` prima del primo indice. Upsert: `inserted|replaced|unchanged`; remove: `removed|absent`; receipt senza testo indicizzato.

- [ ] **Step 2: eseguire RED**

Run: `node --test shared/contextual-copilot-semantic-memory/test/runtime-envelope-contract.test.mjs`  
Expected: FAIL.

- [ ] **Step 3: implementare validator/types**

Firme minime:

```ts
export function validateSemanticMemoryUpsertRequest(input: unknown): SemanticMemoryUpsertRequestV1;
export function validateSemanticMemoryRemoveRequest(input: unknown): SemanticMemoryRemoveRequestV1;
export function validateSemanticMemorySourceRef(input: unknown): SemanticMemorySourceRefV1;
export function validateSemanticMemoryHealth(input: unknown): SemanticMemoryHealthV1;
export function validateSemanticMemoryUpsertReceipt(input: unknown): SemanticMemoryUpsertReceiptV1;
export function validateSemanticMemoryRemoveReceipt(input: unknown): SemanticMemoryRemoveReceiptV1;
```

- [ ] **Step 4: GREEN Task 3**

Run: `npm test --prefix shared/contextual-copilot-semantic-memory`  
Expected: PASS.

- [ ] **Step 5: commit**

```bash
git add shared/contextual-copilot-semantic-memory
git commit -m "feat(memory): add CAS runtime envelope contracts"
```

### Task 4: Cross-app invariants e bounded package

**Files:**
- Create: `shared/contextual-copilot-semantic-memory/test/cross-app-boundary.test.mjs`
- Create: `shared/contextual-copilot-semantic-memory/README.md`
- Create: `tests/test_contextual_copilot_semantic_memory_contract.py`

**Interfaces:**
- Consumes: API Tasks 1-3.
- Produces: prova cross-app e provider-neutral.

- [ ] **Step 1: scrivere RED repository-level**

Il test deve richiedere:

- nessun `fetch(`, SQLite, `sqlite-vec`, provider/model name, endpoint o action id verticale nel runtime package;
- package `private: true`, Node >=20;
- `npm pack --dry-run --json` limitato ai quattro file importabili;
- due projection con `sourceAppId` diversi passano attraverso lo stesso validator;
- `expectedRevision` funziona come dato opaco e il package non contiene helper di ordinamento revisioni.

- [ ] **Step 2: eseguire RED**

```bash
node --test shared/contextual-copilot-semantic-memory/test/*.test.mjs
python3 -m unittest tests.test_contextual_copilot_semantic_memory_contract -v
```

Expected: RED sulle garanzie mancanti.

- [ ] **Step 3: aggiungere README/boundary**

README deve dichiarare: indice derivato, no authority, no storage/network/model, CAS `expectedRevision`, data class, provenance e responsabilità consumer.

- [ ] **Step 4: GREEN**

Run: stessi comandi.  
Expected: PASS.

- [ ] **Step 5: commit**

```bash
git add shared/contextual-copilot-semantic-memory tests/test_contextual_copilot_semantic_memory_contract.py
git commit -m "test(memory): enforce cross-app semantic memory boundary"
```

### Task 5: Distribution receipt exact-SHA e qualification

**Files:**
- Create: `shared/contextual-copilot-semantic-memory/distribution.json`
- Create: `tests/test_contextual_copilot_semantic_memory_distribution.py`

**Interfaces:**
- Consumes: package source congelato Tasks 1-4.
- Produces: receipt per futuro consumo vendorizzato.

- [ ] **Step 1: congelare source commit e scrivere RED receipt**

Richiedere:

```text
schemaVersion = trama.contextual-copilot-semantic-memory-distribution/v1
package = @trama/contextual-copilot-semantic-memory@0.1.0
consumerMode = vendored-file-package
networkRequiredAtBuild = false
externalRegistryRequired = false
```

con SHA-256 di `README.md`, `index.d.ts`, `package.json`, `src/index.js` e `EXPECTED_SOURCE_COMMIT` uguale al source freeze.

- [ ] **Step 2: RED receipt**

Run: `python3 -m unittest tests.test_contextual_copilot_semantic_memory_distribution -v`  
Expected: FAIL finché receipt assente/stale.

- [ ] **Step 3: creare `distribution.json`**

Dopo il source freeze non modificare i quattro file distribuibili; se cambiano, creare nuovo source freeze.

- [ ] **Step 4: qualification completa**

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

- [ ] **Step 6: Draft PR e stop prima del merge**

Registrare exact head, source freeze, test count e confini. Nessun runtime Termux, consumer wiring, deploy o publish in LSM-01A.
