import importlib.util,unittest
from pathlib import Path
P=Path(__file__).resolve().parents[1]/'scripts/validate_cc_mss_stage_c1.py'
s=importlib.util.spec_from_file_location('c1',P);m=importlib.util.module_from_spec(s);s.loader.exec_module(m)
class T(unittest.TestCase):
 def code(self,f):
  try:return m.evaluate(f)
  except m.E as e:return str(e)
 def test_mutation_surface(self):
  self.assertEqual(self.code({'kind':'operation','data':{'operation':'pr.merge'}}),'MUTATION_SURFACE_FORBIDDEN')
  old=set(m.ALLOWED);m.ALLOWED.add('pr.merge')
  try:self.assertEqual(self.code({'kind':'operation','data':{'operation':'pr.merge'}}),'PASS')
  finally:m.ALLOWED.clear();m.ALLOWED.update(old)
 def test_enrollment(self):self.assertEqual(self.code({'kind':'enrollment','data':{'enrolled':False}}),'UNENROLLED_REPOSITORY')
 def test_pagination(self):self.assertEqual(self.code({'kind':'pagination','data':{'terminal':False,'received':1,'expected':2}}),'INCOMPLETE_PAGINATION')
 def test_session(self):self.assertEqual(self.code({'kind':'session','data':{'anchorStart':'a','anchorEnd':'b'}}),'COLLECTION_INVALIDATED')
 def test_head(self):self.assertEqual(self.code({'kind':'head','data':{'exactHead':'a','observedHead':'b'}}),'HEAD_MISMATCH')
 def test_ci_human(self):self.assertEqual(self.code({'kind':'ci-human','data':{'ci':'PASS','humanApproval':True}}),'CI_IS_NOT_HUMAN_APPROVAL')
 def test_unordered_path_stable(self):
  a={'items':[{'id':'2'},{'id':'1'}]};b={'items':[{'id':'1'},{'id':'2'}]};self.assertEqual(m.digest(a),m.digest(b))
 def test_ordered_path_material(self):
  a={'steps':[{'id':'2'},{'id':'1'}]};b={'steps':[{'id':'1'},{'id':'2'}]};self.assertNotEqual(m.digest(a),m.digest(b))
 def test_digest_binding(self):
  p={'state':'OPEN'};good={'kind':'provenance','data':{'provenanceRefs':['s'],'canonicalizationVersion':m.CANON_VERSION,'payload':p,'payloadDigest':m.digest(p)}}
  self.assertEqual(self.code(good),'PASS');good['data']['payloadDigest']='0'*64;self.assertEqual(self.code(good),'PAYLOAD_DIGEST_MISMATCH')
 def test_version_binding(self):
  p={};f={'kind':'provenance','data':{'provenanceRefs':['s'],'canonicalizationVersion':'wrong','payload':p,'payloadDigest':m.digest(p)}};self.assertEqual(self.code(f),'CANONICALIZATION_VERSION_UNSUPPORTED')
if __name__=='__main__':unittest.main()
