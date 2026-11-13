"""Offline narrative direction tests, using the exact Missione 118 V5 source."""
import copy
import json
import sys
import unittest
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from narrative_direction import compile_direction, digest, SPEAKER, MODEL

FIXTURES = Path(__file__).parent / "fixtures"

class NarrativeDirectionTests(unittest.TestCase):
    def setUp(self):
        raw = json.loads((FIXTURES / "missione118_v5_continuous.json").read_text(encoding="utf-8"))
        self.source = {k: raw[k] for k in ("source_sha", "entrypoint_sha256", "scenes")}
        self.directions = json.loads((FIXTURES / "missione118_v5_directions.json").read_text(encoding="utf-8"))

    def test_exact_canonical_text_five_scenes(self):
        plan = compile_direction(self.source, self.directions)
        self.assertEqual(len(plan["requests"]), 5)
        self.assertEqual(plan["text_sha256"], "437db14c64dfb695a07f36841974de417d9a72740f65c565ddd86a205a006a9d")
        for scene, request in zip(self.source["scenes"], plan["requests"]):
            self.assertEqual(request["text"], scene["title"] + ". " + scene["text"])
            self.assertEqual(request["text_sha256"], digest(request["text"]))

    def test_one_fixed_speaker_different_directions(self):
        p = compile_direction(self.source, self.directions)
        self.assertEqual(p["model_id"], MODEL)
        self.assertEqual({r["speaker"] for r in p["requests"]}, {SPEAKER})
        self.assertEqual({r["language"] for r in p["requests"]}, {"Italian"})
        self.assertEqual(len({r["instruct"] for r in p["requests"]}), 5)
        self.assertEqual(p["requests"][-1]["post_scene_pause_ms"], 0)

    def test_no_authority_or_personal_voice(self):
        p = compile_direction(self.source, self.directions)
        for key in ("personal_voice_input_allowed", "voice_cloning_allowed", "audio_generation_authorized", "published"):
            self.assertIs(p[key], False)
        self.assertEqual(p["qualification"], "CANDIDATE_NOT_ACOUSTICALLY_QUALIFIED")
        self.assertEqual(p["compute_mode"], "FREE_ONLY")

    def test_reject_extra_input_and_bad_direction(self):
        for extra in ({"speaker":"other"}, {"reference_audio":"private.wav"}, {"compute_mode":"PAID"}):
            with self.assertRaisesRegex(ValueError, "INVALID_SOURCE"):
                compile_direction(dict(self.source, **extra), self.directions)
        with self.assertRaisesRegex(ValueError, "UNKNOWN_DIRECTION"):
            compile_direction(self.source, dict(self.directions, **{"1":"arbitrary instruction"}))
        with self.assertRaisesRegex(ValueError, "DIRECTION_COVERAGE"):
            compile_direction(self.source, {"1":"wonder"})

    def test_reject_reordered_scenes(self):
        changed = copy.deepcopy(self.source)
        changed["scenes"].reverse()
        with self.assertRaisesRegex(ValueError, "INVALID_SCENE_ORDER"):
            compile_direction(changed, self.directions)

    def test_deterministic_and_revision_sensitive(self):
        a = compile_direction(self.source, self.directions)
        self.assertEqual(a, compile_direction(self.source, self.directions))
        changed = copy.deepcopy(self.source)
        changed["scenes"][0]["text"] += " Una frase."
        self.assertNotEqual(a["text_sha256"], compile_direction(changed, self.directions)["text_sha256"])

if __name__ == "__main__":
    unittest.main()
