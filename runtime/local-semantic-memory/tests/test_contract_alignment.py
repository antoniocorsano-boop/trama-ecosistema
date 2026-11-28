import sys, tempfile, unittest
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

class ContractAlignmentTests(unittest.TestCase):
    def projection(self, **overrides):
        p={'schema':'trama.semantic-memory-projection/v1','sourceAppId':'app','sourceType':'doc','sourceId':'1','revision':'r1','namespace':'n1','title':'Title','text':'text','dataClass':'TEACHER_PROFESSIONAL','canonicalRef':'app://doc/1','updatedAt':'2026-10-30T20:00:00Z','metadata':{'x':'y'}}
        p.update(overrides); return p
    def test_expected_revision_is_required_and_nonblank(self):
        from contracts import validate_upsert_request, ValidationError
        with self.assertRaises(ValidationError): validate_upsert_request({'schema':'trama.semantic-memory-upsert-request/v1','projection':self.projection()})
        with self.assertRaises(ValidationError): validate_upsert_request({'schema':'trama.semantic-memory-upsert-request/v1','projection':self.projection(),'expectedRevision':'   '})
    def test_projection_text_and_optional_title_are_nonblank(self):
        from contracts import validate_projection, ValidationError
        with self.assertRaises(ValidationError): validate_projection(self.projection(text='   '))
        with self.assertRaises(ValidationError): validate_projection(self.projection(title=''))
    def test_remove_uses_nested_source_ref(self):
        from contracts import validate_remove_request
        r=validate_remove_request({'schema':'trama.semantic-memory-remove-request/v1','source':{'sourceAppId':'app','sourceType':'doc','sourceId':'1'},'expectedRevision':None})
        self.assertEqual(r['source']['sourceId'],'1')
    def test_search_scope_arrays_must_be_nonempty(self):
        from contracts import validate_search_request, ValidationError
        base={'schema':'trama.semantic-memory-search-request/v1','query':' q ','namespaces':[' n1 ','n1'],'allowedDataClasses':['TEACHER_PROFESSIONAL'],'limit':5}
        out=validate_search_request(base); self.assertEqual(out['query'],'q'); self.assertEqual(out['namespaces'],('n1',))
        with self.assertRaises(ValidationError): validate_search_request({**base,'namespaces':[]})
        with self.assertRaises(ValidationError): validate_search_request({**base,'allowedDataClasses':[]})
    def test_health_matches_shared_contract(self):
        from storage import ProjectionStore
        from indexer import SemanticIndexer
        class E: pass
        with tempfile.TemporaryDirectory() as td:
            h=SemanticIndexer(ProjectionStore(Path(td)/'m.sqlite3'),E()).health()
            self.assertEqual(h['protocolVersion'],1); self.assertIsInstance(h['indexRevision'],str); self.assertTrue(h['indexRevision'])

if __name__=='__main__': unittest.main()
