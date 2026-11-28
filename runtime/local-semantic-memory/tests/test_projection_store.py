import sys, tempfile, unittest
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))


def projection(rev='r1', text='alpha', data_class='TEACHER_PROFESSIONAL'):
    return {
        'schema':'trama.semantic-memory-projection/v1',
        'sourceAppId':'registro','sourceType':'library','sourceId':'1',
        'revision':rev,'namespace':'registro/library','title':'T','text':text,
        'dataClass':data_class,'canonicalRef':'registro://library/1',
        'updatedAt':'2026-10-30T20:00:00Z','metadata':{'kind':'note'}
    }

def upsert_req(p, expected):
    return {'schema':'trama.semantic-memory-upsert-request/v1','projection':p,'expectedRevision':expected}

def remove_req(expected): return {'schema':'trama.semantic-memory-remove-request/v1','source':{'sourceAppId':'registro','sourceType':'library','sourceId':'1'},'expectedRevision':expected}

class ProjectionStoreTests(unittest.TestCase):
    def setUp(self):
        from storage import ProjectionStore
        self.td = tempfile.TemporaryDirectory(); self.store = ProjectionStore(Path(self.td.name)/'m.sqlite3')
    def tearDown(self): self.td.cleanup()

    def test_create_replay_replace_and_conflicts(self):
        from contracts import RevisionConflictError
        self.assertEqual(self.store.upsert(upsert_req(projection(), None))['status'], 'inserted')
        with self.assertRaises(RevisionConflictError): self.store.upsert(upsert_req(projection('r2'), None))
        self.assertEqual(self.store.upsert(upsert_req(projection(), 'r1'))['status'], 'unchanged')
        self.assertEqual(self.store.upsert(upsert_req(projection('r2','beta'), 'r1'))['status'], 'replaced')
        self.assertEqual(self.store.get_projection(('registro','library','1'))['revision'], 'r2')
        with self.assertRaises(RevisionConflictError): self.store.upsert(upsert_req(projection('r3'), 'r1'))
        self.assertEqual(self.store.get_projection(('registro','library','1'))['revision'], 'r2')

    def test_same_revision_different_payload_is_conflict(self):
        from contracts import RevisionConflictError
        self.store.upsert(upsert_req(projection(), None))
        with self.assertRaises(RevisionConflictError): self.store.upsert(upsert_req(projection('r1','changed'), 'r1'))

    def test_remove_is_cas_safe(self):
        from contracts import RevisionConflictError
        self.assertEqual(self.store.remove(remove_req(None))['status'], 'absent')
        self.store.upsert(upsert_req(projection(), None))
        with self.assertRaises(RevisionConflictError): self.store.remove(remove_req('wrong'))
        self.assertIsNotNone(self.store.get_projection(('registro','library','1')))
        self.assertEqual(self.store.remove(remove_req('r1'))['status'], 'removed')
        self.assertIsNone(self.store.get_projection(('registro','library','1')))

    def test_denied_data_class_is_rejected_before_insert(self):
        from contracts import ValidationError
        with self.assertRaises(ValidationError): self.store.upsert(upsert_req(projection(data_class='STUDENT_PERSONAL'), None))
        self.assertEqual(self.store.list_indexable(), [])

    def test_commit_indexed_unchanged_returns_complete_contract_receipt(self):
        self.store.upsert(upsert_req(projection(), None))
        receipt = self.store.commit_indexed(upsert_req(projection(), 'r1'), [], [])
        self.assertEqual(receipt['schema'], 'trama.semantic-memory-upsert-receipt/v1')
        self.assertEqual(receipt['status'], 'unchanged')
        self.assertEqual(receipt['source'], {'sourceAppId':'registro','sourceType':'library','sourceId':'1'})
        self.assertEqual(receipt['revision'], 'r1')

    def test_index_refresh_failure_rolls_back_projection(self):
        self.store.upsert(upsert_req(projection(), None))
        with self.assertRaises(RuntimeError):
            self.store.commit_indexed(upsert_req(projection('r2','beta'), 'r1'),
                [{'chunk_id':'c1','ordinal':0,'text':'beta','text_hash':'h'}],
                [{'chunk_id':'c1','model_id':'m','dimensions':2,'embedding':b'1234'}],
                before_commit=lambda conn: (_ for _ in ()).throw(RuntimeError('boom')))
        self.assertEqual(self.store.get_projection(('registro','library','1'))['revision'], 'r1')

if __name__ == '__main__': unittest.main()
