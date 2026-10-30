export type SemanticMemoryDataClass =
  | 'PUBLIC_APP'
  | 'TEACHER_PROFESSIONAL'
  | 'CURRICOLO'
  | 'AGGREGATED_NON_IDENTIFIABLE';

export const SEMANTIC_MEMORY_DATA_CLASSES: readonly SemanticMemoryDataClass[];

export interface SemanticMemoryProjectionV1 {
  schema: 'trama.semantic-memory-projection/v1';
  sourceAppId: string;
  sourceType: string;
  sourceId: string;
  revision: string;
  namespace: string;
  title?: string;
  text: string;
  dataClass: SemanticMemoryDataClass;
  canonicalRef: string;
  updatedAt: string;
  metadata?: Readonly<Record<string, string>>;
}

export interface SemanticMemorySearchRequestV1 {
  schema: 'trama.semantic-memory-search-request/v1';
  query: string;
  namespaces: readonly string[];
  allowedDataClasses: readonly SemanticMemoryDataClass[];
  limit: number;
}

export interface SemanticMemoryHitV1 {
  sourceAppId: string;
  sourceType: string;
  sourceId: string;
  revision: string;
  namespace: string;
  canonicalRef: string;
  chunkId: string;
  text: string;
  score: number;
  dataClass: SemanticMemoryDataClass;
  metadata: Readonly<Record<string, string>>;
}

export interface SemanticMemorySearchResponseV1 {
  schema: 'trama.semantic-memory-search-response/v1';
  hits: readonly SemanticMemoryHitV1[];
}

export function validateSemanticMemoryProjection(input: unknown): SemanticMemoryProjectionV1;
export function validateSemanticMemorySearchRequest(input: unknown): SemanticMemorySearchRequestV1;
export function validateSemanticMemoryHit(input: unknown): SemanticMemoryHitV1;
export function validateSemanticMemorySearchResponse(
  input: unknown,
  request?: SemanticMemorySearchRequestV1
): SemanticMemorySearchResponseV1;
