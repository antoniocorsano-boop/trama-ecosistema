import assert from 'node:assert/strict';
import test from 'node:test';

import {
  validateSemanticMemoryHealth,
  validateSemanticMemoryRemoveReceipt,
  validateSemanticMemoryRemoveRequest,
  validateSemanticMemorySourceRef,
  validateSemanticMemoryUpsertReceipt,
  validateSemanticMemoryUpsertRequest
} from '../src/index.js';

const source = () => ({
  sourceAppId: 'registro-docente',
  sourceType: 'professional-memory-entry',
  sourceId: 'memory-1'
});

const projection = () => ({
  schema: 'trama.semantic-memory-projection/v1',
  ...source(),
  revision: 'a',
  namespace: 'registro/professional-memory',
  text: 'Preferisce schede operative sintetiche.',
  dataClass: 'TEACHER_PROFESSIONAL',
  canonicalRef: 'registro://professional-memory/memory-1',
  updatedAt: '2026-10-30T20:00:00Z'
});

test('validates a source reference as identity only', () => {
  const output = validateSemanticMemorySourceRef(source());
  assert.deepEqual(output, source());
  assert.equal(Object.isFrozen(output), true);
});

test('requires expectedRevision on upsert even when null', () => {
  const create = validateSemanticMemoryUpsertRequest({
    schema: 'trama.semantic-memory-upsert-request/v1',
    projection: projection(),
    expectedRevision: null
  });
  assert.equal(create.expectedRevision, null);

  const replace = validateSemanticMemoryUpsertRequest({
    schema: 'trama.semantic-memory-upsert-request/v1',
    projection: projection(),
    expectedRevision: 'z'
  });
  assert.equal(replace.expectedRevision, 'z');
  assert.equal(replace.projection.revision, 'a');

  assert.throws(
    () => validateSemanticMemoryUpsertRequest({
      schema: 'trama.semantic-memory-upsert-request/v1',
      projection: projection()
    }),
    /expectedRevision/i
  );
  assert.throws(
    () => validateSemanticMemoryUpsertRequest({
      schema: 'trama.semantic-memory-upsert-request/v1',
      projection: projection(),
      expectedRevision: '   '
    }),
    /expectedRevision/i
  );
});

test('requires expectedRevision on remove and never orders revision tokens', () => {
  const output = validateSemanticMemoryRemoveRequest({
    schema: 'trama.semantic-memory-remove-request/v1',
    source: source(),
    expectedRevision: 'rev-z-before-rev-a-is-not-a-question'
  });
  assert.equal(output.expectedRevision, 'rev-z-before-rev-a-is-not-a-question');

  assert.throws(
    () => validateSemanticMemoryRemoveRequest({
      schema: 'trama.semantic-memory-remove-request/v1',
      source: source()
    }),
    /expectedRevision/i
  );
});

test('validates health without exposing indexed content', () => {
  const output = validateSemanticMemoryHealth({
    schema: 'trama.semantic-memory-health/v1',
    status: 'ready',
    protocolVersion: 1,
    modelId: 'embeddinggemma-local',
    dimensions: 768,
    indexRevision: 'idx-17'
  });
  assert.deepEqual(output, {
    schema: 'trama.semantic-memory-health/v1',
    status: 'ready',
    protocolVersion: 1,
    modelId: 'embeddinggemma-local',
    dimensions: 768,
    indexRevision: 'idx-17'
  });

  const empty = validateSemanticMemoryHealth({
    schema: 'trama.semantic-memory-health/v1',
    status: 'degraded',
    protocolVersion: 1,
    modelId: null,
    dimensions: null,
    indexRevision: 'idx-empty'
  });
  assert.equal(empty.modelId, null);
  assert.equal(empty.dimensions, null);

  for (const status of ['unknown', 'broken']) {
    assert.throws(() => validateSemanticMemoryHealth({
      schema: 'trama.semantic-memory-health/v1',
      status,
      protocolVersion: 1,
      modelId: null,
      dimensions: null,
      indexRevision: 'idx-empty'
    }), /status/i);
  }
});

test('validates mutation receipts without indexed text', () => {
  const upsert = validateSemanticMemoryUpsertReceipt({
    schema: 'trama.semantic-memory-upsert-receipt/v1',
    status: 'replaced',
    source: source(),
    revision: 'rev-2'
  });
  assert.deepEqual(upsert.source, source());
  assert.equal(upsert.revision, 'rev-2');
  assert.equal('text' in upsert, false);

  const removed = validateSemanticMemoryRemoveReceipt({
    schema: 'trama.semantic-memory-remove-receipt/v1',
    status: 'removed',
    source: source(),
    revision: 'rev-2'
  });
  assert.equal(removed.revision, 'rev-2');

  const absent = validateSemanticMemoryRemoveReceipt({
    schema: 'trama.semantic-memory-remove-receipt/v1',
    status: 'absent',
    source: source(),
    revision: null
  });
  assert.equal(absent.revision, null);

  for (const status of ['inserted', 'replaced', 'unchanged']) {
    assert.equal(validateSemanticMemoryUpsertReceipt({
      schema: 'trama.semantic-memory-upsert-receipt/v1',
      status,
      source: source(),
      revision: 'rev-1'
    }).status, status);
  }
});
