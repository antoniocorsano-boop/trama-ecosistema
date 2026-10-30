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

export function validateSemanticMemoryProjection(input: unknown): SemanticMemoryProjectionV1;
