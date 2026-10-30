import assert from 'node:assert/strict';
import test from 'node:test';

import {
  validateSemanticMemoryProjection,
  validateSemanticMemoryUpsertRequest
} from '../src/index.js';

function projection(sourceAppId, sourceType, sourceId, revision) {
  return {
    schema: 'trama.semantic-memory-projection/v1',
    sourceAppId,
    sourceType,
    sourceId,
    revision,
    namespace: sourceAppId === 'registro-docente' ? 'registro/professional-memory' : 'docente-os/materials',
    text: sourceAppId === 'registro-docente'
      ? 'Preferisce schede operative sintetiche.'
      : 'Materiale per la conduzione della lezione.',
    dataClass: 'TEACHER_PROFESSIONAL',
    canonicalRef: `${sourceAppId}://${sourceType}/${sourceId}`,
    updatedAt: '2026-10-30T20:00:00Z'
  };
}

test('the same projection contract validates Registro and Docente OS without app configuration', () => {
  const registro = validateSemanticMemoryProjection(
    projection('registro-docente', 'professional-memory-entry', 'memory-1', 'rev-z')
  );
  const docente = validateSemanticMemoryProjection(
    projection('docente-os', 'material', 'material-1', 'rev-a')
  );
  assert.equal(registro.sourceAppId, 'registro-docente');
  assert.equal(docente.sourceAppId, 'docente-os');
});

test('expectedRevision remains opaque across arbitrary revision labels', () => {
  const output = validateSemanticMemoryUpsertRequest({
    schema: 'trama.semantic-memory-upsert-request/v1',
    projection: projection('registro-docente', 'professional-memory-entry', 'memory-1', 'rev-a'),
    expectedRevision: 'rev-z'
  });
  assert.equal(output.expectedRevision, 'rev-z');
  assert.equal(output.projection.revision, 'rev-a');
});
