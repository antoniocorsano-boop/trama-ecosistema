from __future__ import annotations
import hashlib, struct
from chunking import chunk_projection_text
from contracts import RebuildRequiredError, validate_upsert_request

class SemanticIndexer:
    def __init__(self, store, embedder):
        self.store=store; self.embedder=embedder
    def _chunk_rows(self,p):
        rows=[]
        for ordinal,text in enumerate(chunk_projection_text(p['text'])):
            th=hashlib.sha256(text.encode('utf-8')).hexdigest()
            raw='\x1f'.join((p['sourceAppId'],p['sourceType'],p['sourceId'],p['revision'],str(ordinal),th)).encode()
            cid=hashlib.sha256(raw).hexdigest()
            rows.append({'chunk_id':cid,'ordinal':ordinal,'text':text,'text_hash':th})
        return rows
    def _mark_rebuild(self, expected, actual):
        self.store.set_meta('rebuild_required', f'{expected}->{actual}')
        raise RebuildRequiredError('embedding model or dimensions changed; rebuild required')
    def upsert(self, request):
        # Validation + CAS preflight happen before any embedding call.
        pre=self.store.preflight_upsert(request)
        if pre['status']=='unchanged':
            p=pre['projection']; return {'schema':'trama.semantic-memory-upsert-receipt/v1','status':'unchanged','source':{'sourceAppId':p['sourceAppId'],'sourceType':p['sourceType'],'sourceId':p['sourceId']},'revision':p['revision']}
        p=pre['projection']; chunks=self._chunk_rows(p)
        vectors=[]; signature=None
        for ch in chunks:
            result=self.embedder.embed(ch['text'])
            current=(result.model_id,result.dimensions)
            if signature is None: signature=current
            elif signature != current: self._mark_rebuild(signature,current)
            vectors.append({'chunk_id':ch['chunk_id'],'model_id':result.model_id,'dimensions':result.dimensions,
                            'embedding':struct.pack('<'+'f'*result.dimensions,*result.vector)})
        existing=self.store.index_signature()
        if signature and existing and signature != existing:
            self._mark_rebuild(existing,signature)
        receipt=self.store.commit_indexed(request,chunks,vectors,
                                          model_id=signature[0] if signature else (existing[0] if existing else None),
                                          dimensions=signature[1] if signature else (existing[1] if existing else None))
        self.store.delete_meta('rebuild_required')
        return receipt
    def remove(self, request):
        return self.store.remove(request)
    def health(self):
        rebuild=self.store.get_meta('rebuild_required')
        sig=self.store.index_signature()
        return {'schema':'trama.semantic-memory-health/v1','status':'rebuild-required' if rebuild else 'ready',
                'protocolVersion':1,'modelId':sig[0] if sig else None,'dimensions':sig[1] if sig else None,
                'indexRevision':self.store.index_revision()}
