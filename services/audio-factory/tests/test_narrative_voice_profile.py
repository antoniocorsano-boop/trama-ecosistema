"""Continuity profile is authoring metadata, not an inferred voice identity."""
import unittest
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from narrative_voice_profile import profile_contract, validate_scene_manifest


class ProfileTests(unittest.TestCase):
    def setUp(self):
        self.manifest = {
            "profile_id": "TRAMA_AF03_QWEN3_NATURAL_V1",
            "language": "it-IT",
            "compute_mode": "FREE_ONLY",
            "no_personal_data": True,
            "voice_cloning": False,
            "scenes": [
                {"scene_id": "scene-01", "text": "La città sembrava in perfetto equilibrio, almeno fino a quella sera."},
                {"scene_id": "scene-02", "text": "Poi arrivò una domanda: chi aveva davvero il controllo delle scelte?"},
            ],
        }

    def test_valid_and_stable_profile_without_generation(self):
        plan = validate_scene_manifest(self.manifest)
        profile = plan["voice_profile"]
        self.assertEqual(profile, profile_contract())
        self.assertEqual(profile["style_id"], "natural_narration")
        self.assertFalse(profile["voice_identity_guaranteed"])
        self.assertFalse(plan["audio_generation_authorized"])
        self.assertFalse(plan["continuity_verified"])

    def test_no_paid_privacy_or_cloning(self):
        for key, value in (
            ("compute_mode", "PAID"), ("no_personal_data", False),
            ("voice_cloning", True),
        ):
            with self.subTest(key=key):
                changed = dict(self.manifest, **{key: value})
                with self.assertRaisesRegex(ValueError, "SAFETY_CONSTRAINT"):
                    validate_scene_manifest(changed)

    def test_reject_duplicate_scene(self):
        manifest = dict(self.manifest)
        manifest["scenes"] = [self.manifest["scenes"][0]] * 2
        with self.assertRaisesRegex(ValueError, "DUPLICATE_SCENE_ID"):
            validate_scene_manifest(manifest)

    def test_reject_long_scene(self):
        manifest = dict(self.manifest)
        manifest["scenes"] = [{"scene_id": "scene-01", "text": "x" * 401}]
        with self.assertRaisesRegex(ValueError, "INVALID_SCENE_TEXT"):
            validate_scene_manifest(manifest)
