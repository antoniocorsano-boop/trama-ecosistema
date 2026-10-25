import test from 'node:test';
import assert from 'node:assert/strict';
import { createEmbeddingIntentPort } from '../src/index.js';

test('factory exposes a local IntentPort with resolve and discover', () => {
  const port = createEmbeddingIntentPort({
    embed: async () => [1, 0],
    intents: [
      {
        actionId: 'review-source',
        examples: ['valuta questa fonte'],
      },
    ],
  });

  assert.equal(port.mode, 'local');
  assert.equal(typeof port.resolve, 'function');
  assert.equal(typeof port.discover, 'function');
});
