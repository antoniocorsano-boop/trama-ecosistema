from __future__ import annotations
import json, math, struct
from contracts import validate_search_request, RebuildRequiredError, StorageError


def _decode(blob, dims):
    if dims <= 0 or len(blob) != dims*4:
        raise StorageError('stored vector dimensions are inconsistent')
    return struct.unpack('<'+'f'*dims, blob)

def _cosine(a,b):
    if len(a) != len(b): raise StorageError('vector dimension mismatch')
    dot=sum(x*y for x,y in zip(a,b)); na=math.sqrt(sum(x*x for x in a)); nb=math.sqrt(sum(y*y for y in b))
    if na == 0.0 or nb == 0.0: return 0.0
    score=dot/(na*nb)
    if not math.isfinite(score): raise StorageError('non-finite cosine score')
    return float(score)

class SemanticSearchService:
    def __init__(self, store, embedder, backend=None):
        self.store=store; self.embedder=embedder; self.backend=backend
    def search(self, request):
        r=validate_search_request(request)
        if not r['query'].strip():
            return {'schema':'trama.semantic-memory-search-response/v1','hits':[]}
        rows=self.store.rows_for_search(r['namespaces'],r['allowedDataClasses'])
        if not rows:
            return {'schema':'trama.semantic-memory-search-response/v1','hits':[]}
        q=self.embedder.embed(r['query'])
        sig=self.store.index_signature()
        if sig and (q.model_id,q.dimensions) != sig:
            raise RebuildRequiredError('query embedding is incompatible with index')
        if len(q.vector) != q.dimensions:
            raise RebuildRequiredError('query embedding dimensions inconsistent')
        hits=[]
        for row in rows:
            dims=int(row['dimensions'])
            if dims != q.dimensions or row['model_id'] != q.model_id:
                raise RebuildRequiredError('stored vector is incompatible with query embedding')
            vec=_decode(row['embedding'],dims); score=_cosine(q.vector,vec)
            hits.append({'sourceAppId':row['source_app_id'],'sourceType':row['source_type'],'sourceId':row['source_id'],
                         'revision':row['revision'],'namespace':row['namespace'],'canonicalRef':row['canonical_ref'],
                         'chunkId':row['chunk_id'],'text':row['chunk_text'],'score':score,'dataClass':row['data_class'],
                         'metadata':json.loads(row['metadata_json'])})
        hits.sort(key=lambda h:(-h['score'],h['sourceAppId'],h['sourceType'],h['sourceId'],h['chunkId']))
        return {'schema':'trama.semantic-memory-search-response/v1','hits':hits[:r['limit']]}
