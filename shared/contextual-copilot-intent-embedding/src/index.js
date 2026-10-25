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

  void minSimilarity;
  void minMargin;
  void catalog;

  return Object.freeze({
    mode: 'local',
    async resolve() {
      return [];
    },
    async discover() {
      return [];
    },
  });
}
