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

function vectorForScore(score) {
  return [score, Math.sqrt(1 - (score * score))];
}

function vectorEmbed(entries, calls = []) {
  const vectors = new Map(entries);
  return async (text) => {
    calls.push(text);
    if (!vectors.has(text)) {
      throw new Error(`missing fake vector for: ${text}`);
    }
    return vectors.get(text);
  };
}

function action(id) {
  return Object.freeze({ id });
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
    () => createEmbeddingIntentPort(validOptions({ intents: [{ actionId: 'review-source', examples: [] }] })),
    /example/i,
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

for (const method of ['resolve', 'discover']) {
  test(`${method} restricts ranking to supplied action ids and normalized eligible examples`, async () => {
    const calls = [];
    const port = createEmbeddingIntentPort({
      embed: vectorEmbed([
        ['messaggio', [1, 0]],
        ['esempio a', vectorForScore(0.95)],
        ['prepara una attività', vectorForScore(0.80)],
        ['catalog only', vectorForScore(0.99)],
      ], calls),
      intents: [
        { actionId: 'a', examples: ['esempio a'] },
        { actionId: 'b', examples: ['  prepara   una attività  '] },
        { actionId: 'catalog-only', examples: ['catalog only'] },
      ],
      minMargin: 0,
    });

    const matches = await port[method]({
      context: {},
      message: 'messaggio',
      actions: [action('a'), action('a'), action('b')],
    });

    assert.deepEqual(matches.map(({ actionId }) => actionId), ['a', 'b']);
    assert.equal(matches.filter(({ actionId }) => actionId === 'a').length, 1);
    assert.deepEqual(calls, ['messaggio', 'esempio a', 'prepara una attività']);
    assert.equal(calls.includes('catalog only'), false);
  });
}

test('ranking uses the best example score and returns all non-ambiguous survivors in stable order', async () => {
  const port = createEmbeddingIntentPort({
    embed: vectorEmbed([
      ['messaggio', [1, 0]],
      ['a weak', vectorForScore(0.76)],
      ['a strong', vectorForScore(1.00)],
      ['b example', vectorForScore(0.90)],
      ['c example', vectorForScore(0.80)],
    ]),
    intents: [
      { actionId: 'c', examples: ['c example'] },
      { actionId: 'a', examples: ['a weak', 'a strong'] },
      { actionId: 'b', examples: ['b example'] },
    ],
    minMargin: 0,
  });

  const matches = await port.resolve({
    context: {},
    message: 'messaggio',
    actions: [action('c'), action('b'), action('a')],
  });

  assert.deepEqual(matches.map(({ actionId }) => actionId), ['a', 'b', 'c']);
  assert.equal(matches[0].score, 1);
  assert.ok(Math.abs(matches[1].score - 0.90) < 1e-12);
  assert.ok(Math.abs(matches[2].score - 0.80) < 1e-12);
});

test('threshold and ambiguity semantics fail closed at their exact boundaries', async () => {
  const below = createEmbeddingIntentPort({
    embed: vectorEmbed([
      ['messaggio', [1, 0]],
      ['low', vectorForScore(0.70)],
    ]),
    intents: [{ actionId: 'low', examples: ['low'] }],
  });
  assert.deepEqual(await below.resolve({ context: {}, message: 'messaggio', actions: [action('low')] }), []);

  const one = createEmbeddingIntentPort({
    embed: vectorEmbed([
      ['messaggio', [1, 0]],
      ['high', vectorForScore(0.90)],
      ['low', vectorForScore(0.70)],
    ]),
    intents: [
      { actionId: 'high', examples: ['high'] },
      { actionId: 'low', examples: ['low'] },
    ],
  });
  assert.deepEqual(
    (await one.resolve({ context: {}, message: 'messaggio', actions: [action('high'), action('low')] })).map(({ actionId }) => actionId),
    ['high'],
  );

  const ambiguous = createEmbeddingIntentPort({
    embed: vectorEmbed([
      ['messaggio', [1, 0]],
      ['first', vectorForScore(0.90)],
      ['second', vectorForScore(0.85)],
    ]),
    intents: [
      { actionId: 'first', examples: ['first'] },
      { actionId: 'second', examples: ['second'] },
    ],
  });
  assert.deepEqual(
    await ambiguous.resolve({ context: {}, message: 'messaggio', actions: [action('first'), action('second')] }),
    [],
  );

  const equalMargin = createEmbeddingIntentPort({
    embed: vectorEmbed([
      ['messaggio', [1, 0]],
      ['alpha', vectorForScore(0.90)],
      ['beta', vectorForScore(0.90)],
    ]),
    intents: [
      { actionId: 'beta', examples: ['beta'] },
      { actionId: 'alpha', examples: ['alpha'] },
    ],
    minSimilarity: 0.50,
    minMargin: 0,
  });
  assert.deepEqual(
    (await equalMargin.resolve({ context: {}, message: 'messaggio', actions: [action('beta'), action('alpha')] })).map(({ actionId }) => actionId),
    ['alpha', 'beta'],
  );
});

test('cheap no-match cases return before embedding', async () => {
  for (const input of [
    { message: '   ', actions: [action('a')] },
    { message: 'messaggio', actions: [] },
    { message: 'messaggio', actions: [action('unknown')] },
  ]) {
    const calls = [];
    const port = createEmbeddingIntentPort({
      embed: async (text) => {
        calls.push(text);
        return [1, 0];
      },
      intents: [{ actionId: 'a', examples: ['example'] }],
    });

    assert.deepEqual(await port.discover({ context: {}, ...input }), []);
    assert.deepEqual(calls, []);
  }
});

test('invalid message embedding vectors reject instead of becoming no-match', async () => {
  for (const invalidVector of [null, {}, [], [NaN, 0], [Infinity, 0], [0, 0]]) {
    const port = createEmbeddingIntentPort({
      embed: async (text) => (text === 'messaggio' ? invalidVector : [1, 0]),
      intents: [{ actionId: 'a', examples: ['example'] }],
    });

    await assert.rejects(
      port.resolve({ context: {}, message: 'messaggio', actions: [action('a')] }),
      /embedding|vector|finite|norm/i,
    );
  }
});

test('invalid example vectors and dimension mismatch reject the entire call', async () => {
  for (const invalidVector of [null, {}, [], [NaN, 0], [0, 0], [1, 0, 0]]) {
    const port = createEmbeddingIntentPort({
      embed: async (text) => (text === 'messaggio' ? [1, 0] : invalidVector),
      intents: [{ actionId: 'a', examples: ['example'] }],
    });

    await assert.rejects(
      port.discover({ context: {}, message: 'messaggio', actions: [action('a')] }),
      /embedding|vector|finite|norm|dimension/i,
    );
  }
});

test('embedding provider failures propagate unchanged', async () => {
  const sentinel = new Error('LOCAL_EMBEDDING_UNAVAILABLE');
  const port = createEmbeddingIntentPort({
    embed: async () => { throw sentinel; },
    intents: [{ actionId: 'a', examples: ['example'] }],
  });

  await assert.rejects(
    port.resolve({ context: {}, message: 'messaggio', actions: [action('a')] }),
    (error) => error === sentinel,
  );
});

test('catalog snapshot and action inputs remain isolated from consumer mutation', async () => {
  const mutableExamples = ['original example'];
  const mutableCatalog = [{ actionId: 'a', examples: mutableExamples }];
  const calls = [];
  const actions = [{ id: 'a' }];
  const actionsBefore = structuredClone(actions);
  const port = createEmbeddingIntentPort({
    embed: vectorEmbed([
      ['messaggio', [1, 0]],
      ['original example', [1, 0]],
    ], calls),
    intents: mutableCatalog,
  });

  mutableExamples[0] = 'mutated example';
  mutableCatalog[0].actionId = 'mutated-action';

  const matches = await port.resolve({ context: {}, message: 'messaggio', actions });

  assert.deepEqual(matches.map(({ actionId }) => actionId), ['a']);
  assert.deepEqual(calls, ['messaggio', 'original example']);
  assert.deepEqual(actions, actionsBefore);
});

test('cosine similarity remains finite for very large finite vectors', async () => {
  const huge = [1e308, 1e308];
  const port = createEmbeddingIntentPort({
    embed: async () => huge,
    intents: [{ actionId: 'a', examples: ['example'] }],
  });

  const matches = await port.resolve({ context: {}, message: 'messaggio', actions: [action('a')] });

  assert.equal(matches.length, 1);
  assert.equal(matches[0].actionId, 'a');
  assert.ok(Number.isFinite(matches[0].score));
  assert.ok(Math.abs(matches[0].score - 1) < 1e-12);
});

test('very small non-zero finite vectors are valid and produce a finite cosine score', async () => {
  const tiny = [1e-308, 1e-308];
  const port = createEmbeddingIntentPort({
    embed: async () => tiny,
    intents: [{ actionId: 'a', examples: ['example'] }],
  });

  const matches = await port.discover({ context: {}, message: 'messaggio', actions: [action('a')] });

  assert.equal(matches.length, 1);
  assert.ok(Number.isFinite(matches[0].score));
  assert.ok(Math.abs(matches[0].score - 1) < 1e-12);
});
