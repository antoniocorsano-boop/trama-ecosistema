import assert from 'node:assert/strict';
import test from 'node:test';

import {
  SEMANTIC_MEMORY_DATA_CLASSES,
  validateSemanticMemoryProjection
} from '../src/index.js';

const validProjection = () => ({
  schema: 'trama.semantic-memory-projection/v1',
  sourceAppId: 'registro-docente',
  sourceType: 'professional-memory-entry',
  sourceId: 'memory-1',
  revision: '2026-10-30T20:00:00Z:abc123',
  namespace: 'registro/professional-memory',
  title: 'Preferenze professionali',
  text: 'Preferisce schede operative sintetiche.',
  dataClass: 'TEACHER_PROFESSIONAL',
  canonicalRef: 'registro://professional-memory/memory-1',
  updatedAt: '2026-10-30T20:00:00Z',
  metadata: { category: 'format-preference' }
});

test('exports the exact v1 semantic-memory data-class allowlist', () => {
  assert.deepEqual([...SEMANTIC_MEMORY_DATA_CLASSES], [
    'PUBLIC_APP',
    'TEACHER_PROFESSIONAL',
    'CURRICOLO',
    'AGGREGATED_NON_IDENTIFIABLE'
  ]);
});

test('validates and defensively freezes an allowed projection', () => {
  const input = validProjection();
  const output = validateSemanticMemoryProjection(input);

  assert.deepEqual(output, input);
  assert.notEqual(output, input);
  assert.notEqual(output.metadata, input.metadata);
  assert.equal(Object.isFrozen(output), true);
  assert.equal(Object.isFrozen(output.metadata), true);

  input.text = 'changed after validation';
  input.metadata.category = 'changed';
  assert.equal(output.text, 'Preferisce schede operative sintetiche.');
  assert.equal(output.metadata.category, 'format-preference');
});

test('rejects prohibited or unknown privacy classes', () => {
  for (const dataClass of [
    'STUDENT_PERSONAL',
    'STUDENT_SENSITIVE',
    'INSTITUTIONAL',
    'UNKNOWN',
    'AMBIGUOUS',
    'CURRICULUM'
  ]) {
    assert.throws(
      () => validateSemanticMemoryProjection({ ...validProjection(), dataClass }),
      /dataClass/i,
      dataClass
    );
  }
});

test('rejects blank identity, revision, text and canonical provenance fields', () => {
  for (const field of [
    'sourceAppId',
    'sourceType',
    'sourceId',
    'revision',
    'namespace',
    'text',
    'canonicalRef',
    'updatedAt'
  ]) {
    assert.throws(
      () => validateSemanticMemoryProjection({ ...validProjection(), [field]: '   ' }),
      new RegExp(field, 'i'),
      field
    );
  }
});

test('rejects metadata that is not a plain string-to-string record', () => {
  assert.throws(
    () => validateSemanticMemoryProjection({ ...validProjection(), metadata: { count: 2 } }),
    /metadata/i
  );
  assert.throws(
    () => validateSemanticMemoryProjection({ ...validProjection(), metadata: [] }),
    /metadata/i
  );
  assert.throws(
    () => validateSemanticMemoryProjection({ ...validProjection(), metadata: Object.create({ polluted: 'yes' }) }),
    /metadata/i
  );
});
