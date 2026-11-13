import sys
import unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from af07_lexical_review import expected_scene, review_transcript, words

class LexicalReviewTests(unittest.TestCase):
    def test_scope_matches_reviewed_edit(self):
        self.assertTrue(expected_scene(1)["text"].startswith("La città perfetta."))
        for i in range(2,6):
            p=expected_scene(i)
            self.assertEqual(p["scope"],"BODY_ONLY")
            self.assertFalse(p["text"].startswith(p["canonical_title"]+"."))
        with self.assertRaises(ValueError):
            expected_scene(6)

    def test_match_never_approves_audio(self):
        r=review_transcript(5,expected_scene(5)["text"].upper())
        self.assertEqual(r["status"],"LEXICAL_MATCH_REVIEW_REQUIRED")
        for k in ("recognition_executed","pronunciation_verified","timing_verified","audio_approved","published"):
            self.assertIs(r[k],False)

    def test_substitution(self):
        r=review_transcript(5,expected_scene(5)["text"].replace("sistemi","site"))
        self.assertEqual(r["status"],"LEXICAL_MISMATCH_REVIEW_REQUIRED")
        self.assertEqual(r["differences"][0]["expected_words"],["sistemi"])
        self.assertEqual(r["differences"][0]["observed_words"],["site"])

    def test_deletion_and_insertion(self):
        text=expected_scene(5)["text"]
        for modified in (text.replace("Deve aiutarle.",""),text+" Fine."):
            r=review_transcript(5,modified)
            self.assertTrue(r["differences"])
            self.assertFalse(r["audio_approved"])

    def test_numbers_and_accents_not_silently_equated(self):
        text=expected_scene(4)["text"]
        self.assertTrue(review_transcript(4,text.replace("AX-118","OX anno anno"))["differences"])
        self.assertNotEqual(words("è"),words("e"))
        self.assertEqual(words("L’ultima"),words("l'ultima"))
        self.assertEqual(words("AX-118"),words("AX 118"))

    def test_missing_transcript_fails_closed(self):
        for text in (None,"","..."):
            r=review_transcript(3,text)
            self.assertEqual(r["status"],"TRANSCRIPT_MISSING")
            self.assertFalse(r["audio_approved"])

if __name__=="__main__":
    unittest.main()
