import test from 'node:test';
import assert from 'node:assert/strict';
import { createEmbeddingIntentPort } from '../src/index.js';

function validOptions(overrides = {}) {
  return {
    embed: async () => [1, 0],
    intents: [
      {
        actionId: 'review-source',
        examples: ['valuta questa fonte'],
      },
    ],
    ...overrides,
  };
}

test('factory exposes a local IntentPort with resolve and discover', () => {
  const port = createEmbeddingIntentPort(validOptions());

  assert.equal(port.mode, 'local');
  assert.equal(typeof port.resolve, 'function');
  assert.equal(typeof port.discover, 'function');
});

test('factory rejects missing or invalid embedding function', () => {
  assert.throws(() => createEmbeddingIntentPort(validOptions({ embed: null })), /embed/i);
  assert.throws(() => createEmbeddingIntentPort(validOptions({ embed: 'not-a-function' })), /embed/i);
});

test('factory rejects invalid or duplicate intent catalog entries', () => {
  assert.throws(
    () => createEmbeddingIntentPort(validOptions({ intents: [{ actionId: '   ', examples: ['x'] }] })),
    /actionId/i,
  );
  assert.throws(
    () => createEmbeddingIntentPort(validOptions({ intents: [{ actionId: 'review-source', examples: ['   '] }] })),
    /example/i,
  );
  assert.throws(
    () => createEmbeddingIntentPort(validOptions({ intents: [
      { actionId: 'review-source', examples: ['uno'] },
      { actionId: 'review-source', examples: ['due'] },
    ] })),
    /duplicate/i,
  );
});

test('factory validates algorithmic thresholds', () => {
  for (const minSimilarity of [NaN, Infinity, -1.01, 1.01]) {
    assert.throws(() => createEmbeddingIntentPort(validOptions({ minSimilarity })), /minSimilarity/i);
  }
  for (const minMargin of [NaN, Infinity, -0.01, 2.01]) {
    assert.throws(() => createEmbeddingIntentPort(validOptions({ minMargin })), /minMargin/i);
  }

  assert.doesNotThrow(() => createEmbeddingIntentPort(validOptions({ minSimilarity: -1, minMargin: 0 })));
  assert.doesNotThrow(() => createEmbeddingIntentPort(validOptions({ minSimilarity: 1, minMargin: 2 })));
});
