import assert from 'node:assert/strict';
import test from 'node:test';

import {
  validateSemanticMemoryHit,
  validateSemanticMemorySearchRequest,
  validateSemanticMemorySearchResponse
} from '../src/index.js';

const requestInput = () => ({
  schema: 'trama.semantic-memory-search-request/v1',
  query: '  progettazione sostenibile  ',
  namespaces: [' registro/library ', 'registro/professional-memory', 'registro/library'],
  allowedDataClasses: ['TEACHER_PROFESSIONAL', 'CURRICOLO'],
  limit: 8
});

const hitInput = (overrides = {}) => ({
  sourceAppId: 'registro-docente',
  sourceType: 'library-source',
  sourceId: 'source-1',
  revision: 'rev-2',
  namespace: 'registro/library',
  canonicalRef: 'registro://library/source-1',
  chunkId: 'chunk-1',
  text: 'Materiale sulla progettazione sostenibile.',
  score: 0.91,
  dataClass: 'TEACHER_PROFESSIONAL',
  metadata: { kind: 'article' },
  ...overrides
});

test('normalizes a bounded search request deterministically', () => {
  const output = validateSemanticMemorySearchRequest(requestInput());
  assert.deepEqual(output, {
    schema: 'trama.semantic-memory-search-request/v1',
    query: 'progettazione sostenibile',
    namespaces: ['registro/library', 'registro/professional-memory'],
    allowedDataClasses: ['TEACHER_PROFESSIONAL', 'CURRICOLO'],
    limit: 8
  });
  assert.equal(Object.isFrozen(output), true);
  assert.equal(Object.isFrozen(output.namespaces), true);
  assert.equal(Object.isFrozen(output.allowedDataClasses), true);
});

test('normalizes whitespace-only query to an empty query without inventing a match', () => {
  const output = validateSemanticMemorySearchRequest({ ...requestInput(), query: '   ' });
  assert.equal(output.query, '');
});

test('rejects empty namespaces, prohibited data classes and out-of-range limits', () => {
  assert.throws(
    () => validateSemanticMemorySearchRequest({ ...requestInput(), namespaces: ['  '] }),
    /namespaces/i
  );
  assert.throws(
    () => validateSemanticMemorySearchRequest({ ...requestInput(), allowedDataClasses: ['STUDENT_PERSONAL'] }),
    /allowedDataClasses/i
  );
  for (const limit of [0, 21, 1.5, NaN]) {
    assert.throws(
      () => validateSemanticMemorySearchRequest({ ...requestInput(), limit }),
      /limit/i
    );
  }
});

test('validates and freezes a semantic hit with finite score and provenance', () => {
  const input = hitInput();
  const output = validateSemanticMemoryHit(input);
  assert.deepEqual(output, input);
  assert.notEqual(output, input);
  assert.notEqual(output.metadata, input.metadata);
  assert.equal(Object.isFrozen(output), true);
  assert.equal(Object.isFrozen(output.metadata), true);
});

test('rejects invalid hit score, identity or provenance', () => {
  for (const score of [NaN, Infinity, -Infinity, '0.9']) {
    assert.throws(() => validateSemanticMemoryHit(hitInput({ score })), /score/i);
  }
  for (const field of ['sourceAppId', 'sourceType', 'sourceId', 'revision', 'namespace', 'canonicalRef', 'chunkId', 'text']) {
    assert.throws(() => validateSemanticMemoryHit(hitInput({ [field]: '   ' })), new RegExp(field, 'i'));
  }
});

test('accepts hits empty as a valid no-match response', () => {
  const output = validateSemanticMemorySearchResponse({
    schema: 'trama.semantic-memory-search-response/v1',
    hits: []
  });
  assert.deepEqual(output, {
    schema: 'trama.semantic-memory-search-response/v1',
    hits: []
  });
  assert.equal(Object.isFrozen(output.hits), true);
});

test('rejects response hits outside request namespace or data-class scope', () => {
  const request = validateSemanticMemorySearchRequest(requestInput());
  assert.throws(
    () => validateSemanticMemorySearchResponse({
      schema: 'trama.semantic-memory-search-response/v1',
      hits: [hitInput({ namespace: 'docente-os/materials' })]
    }, request),
    /namespace/i
  );
  assert.throws(
    () => validateSemanticMemorySearchResponse({
      schema: 'trama.semantic-memory-search-response/v1',
      hits: [hitInput({ dataClass: 'PUBLIC_APP' })]
    }, request),
    /dataClass/i
  );
});
