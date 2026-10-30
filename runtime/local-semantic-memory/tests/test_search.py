import sys, tempfile, unittest
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

class MapEmbedder:
    def __init__(self): self.calls=0; self.model='m1'; self.dims=2
    def embed(self,text):
        from embedding import EmbeddingResult
        self.calls += 1
        t=text.lower()
        if 'alpha' in t: v=(1.0,0.0)
        elif 'beta' in t: v=(0.0,1.0)
        elif 'both' in t: v=(1.0,1.0)
        else: v=(0.5,0.5)
        return EmbeddingResult(v,self.model,self.dims)

def projection(i,text,ns='n1',dc='TEACHER_PROFESSIONAL'):
    return {'schema':'trama.semantic-memory-projection/v1','sourceAppId':'app','sourceType':'doc','sourceId':str(i),'revision':'r1','namespace':ns,'text':text,'dataClass':dc,'canonicalRef':f'app://doc/{i}','updatedAt':'2026-10-30T20:00:00Z','metadata':{'i':str(i)}}
def req(p): return {'schema':'trama.semantic-memory-upsert-request/v1','projection':p,'expectedRevision':None}
def search_req(query='alpha',namespaces=('n1',),classes=('TEACHER_PROFESSIONAL',),limit=5):
    return {'schema':'trama.semantic-memory-search-request/v1','query':query,'namespaces':list(namespaces),'allowedDataClasses':list(classes),'limit':limit}

class SearchTests(unittest.TestCase):
    def setUp(self):
        from storage import ProjectionStore
        from indexer import SemanticIndexer
        from search import SemanticSearchService
        self.td=tempfile.TemporaryDirectory(); self.store=ProjectionStore(Path(self.td.name)/'m.sqlite3'); self.emb=MapEmbedder(); self.idx=SemanticIndexer(self.store,self.emb); self.search=SemanticSearchService(self.store,self.emb)
    def tearDown(self): self.td.cleanup()
    def seed(self):
        self.idx.upsert(req(projection(1,'alpha text','n1')))
        self.idx.upsert(req(projection(2,'beta text','n1')))
        self.idx.upsert(req(projection(3,'alpha other','n2','CURRICOLO')))

    def test_empty_query_and_no_candidates_do_not_embed(self):
        self.assertEqual(self.search.search(search_req(query='   '))['hits'],[]); self.assertEqual(self.emb.calls,0)
        self.assertEqual(self.search.search(search_req(query='alpha',namespaces=('missing',)))['hits'],[]); self.assertEqual(self.emb.calls,0)

    def test_filters_limit_and_order(self):
        self.seed(); before=self.emb.calls
        out=self.search.search(search_req('alpha',limit=1))
        self.assertEqual(len(out['hits']),1); self.assertEqual(out['hits'][0]['sourceId'],'1'); self.assertEqual(self.emb.calls,before+1)
        out2=self.search.search(search_req('alpha',namespaces=('n2',),classes=('CURRICOLO',),limit=5))
        self.assertEqual([h['sourceId'] for h in out2['hits']],['3'])

    def test_hit_shape_and_finite_score(self):
        import math
        self.seed(); h=self.search.search(search_req('both'))['hits'][0]
        for k in ('sourceAppId','sourceType','sourceId','revision','namespace','canonicalRef','chunkId','text','score','dataClass','metadata'): self.assertIn(k,h)
        self.assertTrue(math.isfinite(h['score']))

    def test_invalid_limit_and_dimension_mismatch_are_errors(self):
        from contracts import ValidationError, RebuildRequiredError
        with self.assertRaises(ValidationError): self.search.search(search_req(limit=21))
        self.seed(); self.emb.dims=3
        with self.assertRaises(RebuildRequiredError): self.search.search(search_req('alpha'))

if __name__=='__main__': unittest.main()
