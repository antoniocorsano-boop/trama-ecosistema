export const SEMANTIC_MEMORY_DATA_CLASSES = Object.freeze([
  'PUBLIC_APP',
  'TEACHER_PROFESSIONAL',
  'CURRICOLO',
  'AGGREGATED_NON_IDENTIFIABLE'
]);

const DATA_CLASS_SET = new Set(SEMANTIC_MEMORY_DATA_CLASSES);
const PROJECTION_SCHEMA = 'trama.semantic-memory-projection/v1';

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

export function validateSemanticMemoryProjection(input) {
  const value = requireRecord(input);
  if (value.schema !== PROJECTION_SCHEMA) {
    throw new TypeError(`schema must equal ${PROJECTION_SCHEMA}`);
  }

  const dataClass = requireNonBlankString(value.dataClass, 'dataClass');
  if (!DATA_CLASS_SET.has(dataClass)) {
    throw new TypeError(`dataClass is not allowed: ${dataClass}`);
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
    dataClass,
    canonicalRef: requireNonBlankString(value.canonicalRef, 'canonicalRef'),
    updatedAt: requireNonBlankString(value.updatedAt, 'updatedAt'),
    ...(value.metadata === undefined ? {} : { metadata: copyMetadata(value.metadata) })
  };

  return Object.freeze(output);
}
