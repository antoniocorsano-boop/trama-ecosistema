import sys,unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from af07r_selective_direction import plan,lexical
class SelectiveDirectionTests(unittest.TestCase):
    def test_exact_three(self):
        p=plan()
        self.assertEqual([x["id"] for x in p],["S4U1","S4U2","S5U2"])
        self.assertTrue(all(x["speaker_id"]==0 and not x["prosody_applied"] for x in p))
        self.assertEqual(p[0]["spoken"],p[0]["canonical"].replace("AX-118","a iks centodiciotto"))
        self.assertTrue(all(x["spoken"]==x["canonical"] for x in p[1:]))
    def test_sigla(self):
        self.assertEqual(lexical("a iks centodiciotto"),lexical("AX-118"))
        self.assertNotEqual(lexical("a iks centodiciotto"),lexical("Iox anno anno"))
        self.assertNotEqual(lexical("sistemi"),lexical("sesti"))

    def test_rejected_letter_sequence(self):
        self.assertNotEqual(lexical("ai ci si centodiciotto"),lexical("AX-118"))
        self.assertNotEqual(lexical("ai ci si 118"),lexical("AX-118"))
        self.assertEqual(lexical("a iks 118"),lexical("AX-118"))
        self.assertEqual(lexical("a ics centodiciotto"),lexical("AX-118"))
