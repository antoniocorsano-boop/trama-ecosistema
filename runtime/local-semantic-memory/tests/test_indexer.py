import sys, tempfile, threading, unittest
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

def projection(rev='r1', text='alpha', data_class='TEACHER_PROFESSIONAL'):
    return {'schema':'trama.semantic-memory-projection/v1','sourceAppId':'registro','sourceType':'library','sourceId':'1','revision':rev,'namespace':'registro/library','title':'T','text':text,'dataClass':data_class,'canonicalRef':'registro://library/1','updatedAt':'2026-10-30T20:00:00Z','metadata':{'kind':'note'}}
def upsert_req(p, expected): return {'schema':'trama.semantic-memory-upsert-request/v1','projection':p,'expectedRevision':expected}
def remove_req(expected): return {'schema':'trama.semantic-memory-remove-request/v1','source':{'sourceAppId':'registro','sourceType':'library','sourceId':'1'},'expectedRevision':expected}

class FakeEmbedder:
    def __init__(self, model='m1', dims=3): self.model=model; self.dims=dims; self.calls=0; self.fail=False
    def embed(self,text):
        from embedding import EmbeddingResult
        self.calls += 1
        if self.fail: raise RuntimeError('embed fail')
        base=float((sum(text.encode()) % 7)+1)
        return EmbeddingResult(tuple(base+i for i in range(self.dims)), self.model, self.dims)

class IndexerTests(unittest.TestCase):
    def setUp(self):
        from storage import ProjectionStore
        from indexer import SemanticIndexer
        self.td=tempfile.TemporaryDirectory(); self.store=ProjectionStore(Path(self.td.name)/'m.sqlite3'); self.emb=FakeEmbedder(); self.idx=SemanticIndexer(self.store,self.emb)
    def tearDown(self): self.td.cleanup()
    def test_denied_and_conflict_do_not_embed(self):
        from contracts import ValidationError, RevisionConflictError
        with self.assertRaises(ValidationError): self.idx.upsert(upsert_req(projection(data_class='STUDENT_PERSONAL'),None))
        self.assertEqual(self.emb.calls,0)
        self.idx.upsert(upsert_req(projection(),None)); calls=self.emb.calls
        with self.assertRaises(RevisionConflictError): self.idx.upsert(upsert_req(projection('r2','beta'),'wrong'))
        self.assertEqual(self.emb.calls,calls)
    def test_unchanged_does_not_reembed_and_replace_is_atomic(self):
        self.assertEqual(self.idx.upsert(upsert_req(projection(),None))['status'],'inserted')
        calls=self.emb.calls
        self.assertEqual(self.idx.upsert(upsert_req(projection(),'r1'))['status'],'unchanged')
        self.assertEqual(self.emb.calls,calls)
        self.assertEqual(self.idx.upsert(upsert_req(projection('r2','beta'),'r1'))['status'],'replaced')
        self.assertEqual(self.store.get_projection(('registro','library','1'))['revision'],'r2')
        self.assertGreater(self.store.count_vectors(),0)
    def test_embedding_failure_leaves_previous_projection(self):
        self.idx.upsert(upsert_req(projection(),None)); self.emb.fail=True
        with self.assertRaises(RuntimeError): self.idx.upsert(upsert_req(projection('r2','beta'),'r1'))
        self.assertEqual(self.store.get_projection(('registro','library','1'))['revision'],'r1')
    def test_model_or_dimension_change_requires_rebuild_without_write(self):
        from contracts import RebuildRequiredError
        self.idx.upsert(upsert_req(projection(),None)); old_count=self.store.count_vectors()
        self.emb.model='m2'
        with self.assertRaises(RebuildRequiredError): self.idx.upsert(upsert_req(projection('r2','beta'),'r1'))
        self.assertEqual(self.store.get_projection(('registro','library','1'))['revision'],'r1')
        self.assertEqual(self.store.count_vectors(),old_count)
        self.assertEqual(self.idx.health()['status'],'rebuild-required')
    def test_remove_cascades_vectors(self):
        self.idx.upsert(upsert_req(projection(),None)); self.assertGreater(self.store.count_vectors(),0)
        self.assertEqual(self.idx.remove(remove_req('r1'))['status'],'removed')
        self.assertEqual(self.store.count_vectors(),0)
    def test_empty_index_can_adopt_new_embedding_signature_without_rebuild(self):
        self.idx.upsert(upsert_req(projection(),None))
        self.assertEqual(self.idx.remove(remove_req('r1'))['status'],'removed')
        self.assertEqual(self.store.count_vectors(),0)
        self.assertIsNone(self.store.index_signature())
        self.emb.model='m2'
        receipt=self.idx.upsert(upsert_req(projection('r2','beta'),None))
        self.assertEqual(receipt['status'],'inserted')
        self.assertEqual(self.idx.health()['status'],'ready')
        self.assertEqual(self.store.index_signature(),('m2',3))
    def test_concurrent_first_writes_recheck_signature_inside_write_transaction(self):
        from storage import ProjectionStore
        from indexer import SemanticIndexer
        from contracts import RebuildRequiredError
        class BarrierStore(ProjectionStore):
            def __init__(self,path):
                super().__init__(path); self._signature_barrier=threading.Barrier(2); self._signature_calls=0; self._signature_lock=threading.Lock()
            def index_signature(self):
                with self._signature_lock:
                    self._signature_calls += 1; call=self._signature_calls
                if call <= 2:
                    value=super().index_signature(); self._signature_barrier.wait(timeout=3); return value
                return super().index_signature()
        def source_projection(source_id):
            p=projection(); p['sourceId']=source_id; p['canonicalRef']=f'registro://library/{source_id}'; return p
        store=BarrierStore(Path(self.td.name)/'race.sqlite3')
        idx1=SemanticIndexer(store,FakeEmbedder('m1',2)); idx2=SemanticIndexer(store,FakeEmbedder('m2',3)); outcomes=[]
        def run(idx,request):
            try: outcomes.append(('ok',idx.upsert(request)))
            except Exception as exc: outcomes.append(('err',exc))
        a=threading.Thread(target=run,args=(idx1,upsert_req(source_projection('a'),None))); b=threading.Thread(target=run,args=(idx2,upsert_req(source_projection('b'),None)))
        a.start(); b.start(); a.join(); b.join()
        self.assertEqual(sum(1 for kind,_ in outcomes if kind=='ok'),1)
        self.assertEqual(sum(1 for kind,exc in outcomes if kind=='err' and isinstance(exc,RebuildRequiredError)),1)
        self.assertEqual(store.count_vectors(),1)
        with store._connection() as c:
            signatures=c.execute('SELECT DISTINCT model_id,dimensions FROM vectors').fetchall()
        self.assertEqual(len(signatures),1)

if __name__=='__main__': unittest.main()
