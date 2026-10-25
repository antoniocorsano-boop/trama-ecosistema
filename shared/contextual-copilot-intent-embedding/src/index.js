const DEFAULT_MIN_SIMILARITY = 0.75;
const DEFAULT_MIN_MARGIN = 0.08;

function normalizeWhitespace(value) {
  return value.trim().replace(/\s+/g, ' ');
}

function validateThreshold(name, value, minimum, maximum) {
  if (!Number.isFinite(value) || value < minimum || value > maximum) {
    throw new TypeError(`${name} must be finite and within [${minimum}, ${maximum}]`);
  }
  return value;
}

function snapshotCatalog(intents) {
  if (!Array.isArray(intents)) {
    throw new TypeError('intents must be an array');
  }

  const catalog = new Map();

  for (const intent of intents) {
    if (!intent || typeof intent.actionId !== 'string') {
      throw new TypeError('actionId must be a non-empty string');
    }

    const actionId = normalizeWhitespace(intent.actionId);
    if (!actionId) {
      throw new TypeError('actionId must be a non-empty string');
    }
    if (catalog.has(actionId)) {
      throw new TypeError(`duplicate actionId: ${actionId}`);
    }
    if (!Array.isArray(intent.examples) || intent.examples.length === 0) {
      throw new TypeError(`examples must contain at least one non-empty example for ${actionId}`);
    }

    const examples = intent.examples.map((example) => {
      if (typeof example !== 'string') {
        throw new TypeError(`example must be a string for ${actionId}`);
      }
      const normalized = normalizeWhitespace(example);
      if (!normalized) {
        throw new TypeError(`example must be non-empty for ${actionId}`);
      }
      return normalized;
    });

    catalog.set(actionId, Object.freeze(examples));
  }

  return catalog;
}

function cosineSimilarity(left, right) {
  let dot = 0;
  let leftNorm = 0;
  let rightNorm = 0;

  for (let index = 0; index < left.length; index += 1) {
    dot += left[index] * right[index];
    leftNorm += left[index] * left[index];
    rightNorm += right[index] * right[index];
  }

  return dot / (Math.sqrt(leftNorm) * Math.sqrt(rightNorm));
}

async function rankMessageAgainstActions({
  message,
  actions,
  catalog,
  embed,
  minSimilarity,
  minMargin,
}) {
  if (typeof message !== 'string' || !message.trim()) {
    return [];
  }
  if (!Array.isArray(actions) || actions.length === 0) {
    return [];
  }

  const eligibleIds = new Set();
  for (const action of actions) {
    if (action && typeof action.id === 'string' && catalog.has(action.id)) {
      eligibleIds.add(action.id);
    }
  }

  if (eligibleIds.size === 0) {
    return [];
  }

  const messageVector = await embed(message);
  const matches = [];

  for (const [actionId, examples] of catalog) {
    if (!eligibleIds.has(actionId)) {
      continue;
    }

    let bestScore = -Infinity;
    for (const example of examples) {
      const exampleVector = await embed(example);
      const score = cosineSimilarity(messageVector, exampleVector);
      if (score > bestScore) {
        bestScore = score;
      }
    }

    if (bestScore >= minSimilarity) {
      matches.push({ actionId, score: bestScore });
    }
  }

  matches.sort((left, right) => (
    (right.score - left.score) || left.actionId.localeCompare(right.actionId)
  ));

  if (
    matches.length >= 2
    && (matches[0].score - matches[1].score) < minMargin
  ) {
    return [];
  }

  return matches;
}

export function createEmbeddingIntentPort(options) {
  if (!options || typeof options !== 'object') {
    throw new TypeError('options are required');
  }
  if (typeof options.embed !== 'function') {
    throw new TypeError('embed must be a function');
  }

  const minSimilarity = validateThreshold(
    'minSimilarity',
    options.minSimilarity ?? DEFAULT_MIN_SIMILARITY,
    -1,
    1,
  );
  const minMargin = validateThreshold(
    'minMargin',
    options.minMargin ?? DEFAULT_MIN_MARGIN,
    0,
    2,
  );
  const catalog = snapshotCatalog(options.intents);

  const rank = (input) => rankMessageAgainstActions({
    message: input?.message,
    actions: input?.actions,
    catalog,
    embed: options.embed,
    minSimilarity,
    minMargin,
  });

  return Object.freeze({
    mode: 'local',
    resolve: rank,
    discover: rank,
  });
}
