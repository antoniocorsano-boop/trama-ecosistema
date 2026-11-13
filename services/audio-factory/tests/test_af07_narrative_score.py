import copy, sys, unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from af07_narrative_score import validate, load
class NarrativeScoreTests(unittest.TestCase):
    def test_canonical_score(self):
        self.assertEqual(validate(*load()),16)
    def test_text_drift(self):
        s,f=load()
        s["scenes"][0]["units"][1]["canonicalText"]+=" Oggi."
        with self.assertRaisesRegex(ValueError,"CANONICAL_TEXT_DRIFT"): validate(s,f)
    def test_invalid_annotation(self):
        s,f=load()
        s["scenes"][0]["units"][0]["emphasis"]=["inesistente"]
        with self.assertRaisesRegex(ValueError,"UNBOUND_ANNOTATION"): validate(s,f)
    def test_no_automatic_approval(self):
        s,f=load()
        s["audioApproved"]=True
        with self.assertRaisesRegex(ValueError,"UNAUTHORIZED_STATUS"): validate(s,f)
    def test_title_scope(self):
        s,f=load()
        s["scenes"][1]["titleSpoken"]=True
        with self.assertRaisesRegex(ValueError,"TITLE_SCOPE"): validate(s,f)
    def test_no_cloning(self):
        s,f=load()
        s["voice"]["cloning"]=True
        with self.assertRaisesRegex(ValueError,"VOICE_POLICY"): validate(s,f)
