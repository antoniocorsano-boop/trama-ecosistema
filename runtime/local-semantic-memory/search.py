from __future__ import annotations
import json
from contracts import validate_search_request, RebuildRequiredError
from vector_backend import LinearVectorBackend


def _hit(row, score):
    return {
        'sourceAppId': row['source_app_id'], 'sourceType': row['source_type'], 'sourceId': row['source_id'],
        'revision': row['revision'], 'namespace': row['namespace'], 'canonicalRef': row['canonical_ref'],
        'chunkId': row['chunk_id'], 'text': row['chunk_text'], 'score': float(score),
        'dataClass': row['data_class'], 'metadata': json.loads(row['metadata_json'])
    }


class SemanticSearchService:
    def __init__(self, store, embedder, backend=None):
        self.store = store
        self.embedder = embedder
        self.backend = backend or LinearVectorBackend()

    def search(self, request):
        r = validate_search_request(request)
        if not r['query'].strip():
            return {'schema':'trama.semantic-memory-search-response/v1','hits':[]}
        rows = self.store.rows_for_search(r['namespaces'], r['allowedDataClasses'])
        if not rows:
            return {'schema':'trama.semantic-memory-search-response/v1','hits':[]}
        q = self.embedder.embed(r['query'])
        sig = self.store.index_signature()
        if sig and (q.model_id, q.dimensions) != sig:
            raise RebuildRequiredError('query embedding is incompatible with index')
        if len(q.vector) != q.dimensions:
            raise RebuildRequiredError('query embedding dimensions inconsistent')
        ranked = self.backend.rank(rows, q.vector, model_id=q.model_id, dimensions=q.dimensions, limit=r['limit'])
        return {'schema':'trama.semantic-memory-search-response/v1','hits':[_hit(row, score) for row, score in ranked]}
