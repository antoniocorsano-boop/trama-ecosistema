export const SEMANTIC_MEMORY_DATA_CLASSES = Object.freeze([
  'PUBLIC_APP',
  'TEACHER_PROFESSIONAL',
  'CURRICOLO',
  'AGGREGATED_NON_IDENTIFIABLE'
]);

const DATA_CLASS_SET = new Set(SEMANTIC_MEMORY_DATA_CLASSES);
const PROJECTION_SCHEMA = 'trama.semantic-memory-projection/v1';
const SEARCH_REQUEST_SCHEMA = 'trama.semantic-memory-search-request/v1';
const SEARCH_RESPONSE_SCHEMA = 'trama.semantic-memory-search-response/v1';

function requireRecord(input, label = 'input') {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new TypeError(`${label} must be an object`);
  }
  return input;
}

function requireNonBlankString(value, field) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new TypeError(`${field} must be a non-blank string`);
  }
  return value;
}

function requireString(value, field) {
  if (typeof value !== 'string') {
    throw new TypeError(`${field} must be a string`);
  }
  return value;
}

function requireAllowedDataClass(value, field = 'dataClass') {
  const dataClass = requireNonBlankString(value, field);
  if (!DATA_CLASS_SET.has(dataClass)) {
    throw new TypeError(`${field} is not allowed: ${dataClass}`);
  }
  return dataClass;
}

function copyMetadata(value) {
  if (value === undefined) return Object.freeze({});
  requireRecord(value, 'metadata');
  const proto = Object.getPrototypeOf(value);
  if (proto !== Object.prototype && proto !== null) {
    throw new TypeError('metadata must be a plain string-to-string record');
  }
  const output = {};
  for (const [key, item] of Object.entries(value)) {
    if (typeof item !== 'string') {
      throw new TypeError('metadata values must be strings');
    }
    output[key] = item;
  }
  return Object.freeze(output);
}

function normalizeUniqueNonBlankStrings(value, field) {
  if (!Array.isArray(value) || value.length === 0) {
    throw new TypeError(`${field} must be a non-empty array`);
  }
  const output = [];
  const seen = new Set();
  for (const item of value) {
    const normalized = requireNonBlankString(item, field).trim();
    if (!seen.has(normalized)) {
      seen.add(normalized);
      output.push(normalized);
    }
  }
  if (output.length === 0) throw new TypeError(`${field} must contain at least one value`);
  return Object.freeze(output);
}

export function validateSemanticMemoryProjection(input) {
  const value = requireRecord(input);
  if (value.schema !== PROJECTION_SCHEMA) {
    throw new TypeError(`schema must equal ${PROJECTION_SCHEMA}`);
  }

  const output = {
    schema: PROJECTION_SCHEMA,
    sourceAppId: requireNonBlankString(value.sourceAppId, 'sourceAppId'),
    sourceType: requireNonBlankString(value.sourceType, 'sourceType'),
    sourceId: requireNonBlankString(value.sourceId, 'sourceId'),
    revision: requireNonBlankString(value.revision, 'revision'),
    namespace: requireNonBlankString(value.namespace, 'namespace'),
    ...(value.title === undefined ? {} : { title: requireNonBlankString(value.title, 'title') }),
    text: requireNonBlankString(value.text, 'text'),
    dataClass: requireAllowedDataClass(value.dataClass),
    canonicalRef: requireNonBlankString(value.canonicalRef, 'canonicalRef'),
    updatedAt: requireNonBlankString(value.updatedAt, 'updatedAt'),
    ...(value.metadata === undefined ? {} : { metadata: copyMetadata(value.metadata) })
  };

  return Object.freeze(output);
}

export function validateSemanticMemorySearchRequest(input) {
  const value = requireRecord(input);
  if (value.schema !== SEARCH_REQUEST_SCHEMA) {
    throw new TypeError(`schema must equal ${SEARCH_REQUEST_SCHEMA}`);
  }
  const query = requireString(value.query, 'query').trim();
  const namespaces = normalizeUniqueNonBlankStrings(value.namespaces, 'namespaces');
  const rawClasses = normalizeUniqueNonBlankStrings(value.allowedDataClasses, 'allowedDataClasses');
  const allowedDataClasses = Object.freeze(rawClasses.map(item => requireAllowedDataClass(item, 'allowedDataClasses')));
  if (!Number.isInteger(value.limit) || value.limit < 1 || value.limit > 20) {
    throw new TypeError('limit must be an integer from 1 to 20');
  }
  return Object.freeze({
    schema: SEARCH_REQUEST_SCHEMA,
    query,
    namespaces,
    allowedDataClasses,
    limit: value.limit
  });
}

export function validateSemanticMemoryHit(input) {
  const value = requireRecord(input);
  if (typeof value.score !== 'number' || !Number.isFinite(value.score)) {
    throw new TypeError('score must be a finite number');
  }
  return Object.freeze({
    sourceAppId: requireNonBlankString(value.sourceAppId, 'sourceAppId'),
    sourceType: requireNonBlankString(value.sourceType, 'sourceType'),
    sourceId: requireNonBlankString(value.sourceId, 'sourceId'),
    revision: requireNonBlankString(value.revision, 'revision'),
    namespace: requireNonBlankString(value.namespace, 'namespace'),
    canonicalRef: requireNonBlankString(value.canonicalRef, 'canonicalRef'),
    chunkId: requireNonBlankString(value.chunkId, 'chunkId'),
    text: requireNonBlankString(value.text, 'text'),
    score: value.score,
    dataClass: requireAllowedDataClass(value.dataClass),
    metadata: copyMetadata(value.metadata)
  });
}

export function validateSemanticMemorySearchResponse(input, request) {
  const value = requireRecord(input);
  if (value.schema !== SEARCH_RESPONSE_SCHEMA) {
    throw new TypeError(`schema must equal ${SEARCH_RESPONSE_SCHEMA}`);
  }
  if (!Array.isArray(value.hits)) {
    throw new TypeError('hits must be an array');
  }
  const validatedRequest = request === undefined ? null : validateSemanticMemorySearchRequest(request);
  const hits = value.hits.map(hit => {
    const validatedHit = validateSemanticMemoryHit(hit);
    if (validatedRequest && !validatedRequest.namespaces.includes(validatedHit.namespace)) {
      throw new TypeError(`hit namespace is outside request scope: ${validatedHit.namespace}`);
    }
    if (validatedRequest && !validatedRequest.allowedDataClasses.includes(validatedHit.dataClass)) {
      throw new TypeError(`hit dataClass is outside request scope: ${validatedHit.dataClass}`);
    }
    return validatedHit;
  });
  return Object.freeze({
    schema: SEARCH_RESPONSE_SCHEMA,
    hits: Object.freeze(hits)
  });
}
