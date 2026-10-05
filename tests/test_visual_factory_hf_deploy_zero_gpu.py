import importlib.util
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location(
    "deploy_visual_factory_hf_space",
    ROOT / "scripts" / "deploy_visual_factory_hf_space.py",
)
module = importlib.util.module_from_spec(SPEC)
assert SPEC.loader is not None
SPEC.loader.exec_module(module)


class ZeroGpuDeploymentPolicyTests(unittest.TestCase):
    def test_space_is_created_directly_on_zero_gpu(self):
        kwargs = module.space_create_kwargs()
        self.assertEqual(kwargs["space_hardware"], "zero-a10g")
        self.assertEqual(kwargs["space_sdk"], "gradio")
        self.assertTrue(kwargs["private"])
        self.assertTrue(kwargs["exist_ok"])

    def test_free_personal_identity_is_allowed_only_in_its_namespace(self):
        module.validate_free_only_identity(
            {"name": "antonio-corsano1303", "type": "user", "isPro": False},
            "antonio-corsano1303/studio-atlas-visual-factory",
        )

    def test_pro_identity_is_rejected_to_prevent_paid_overquota(self):
        with self.assertRaisesRegex(ValueError, "FREE_ONLY_ACCOUNT_REQUIRED"):
            module.validate_free_only_identity(
                {"name": "antonio-corsano1303", "type": "user", "isPro": True},
                "antonio-corsano1303/studio-atlas-visual-factory",
            )

    def test_foreign_namespace_is_rejected(self):
        with self.assertRaisesRegex(ValueError, "HF_SPACE_NAMESPACE_MISMATCH"):
            module.validate_free_only_identity(
                {"name": "antonio-corsano1303", "type": "user", "isPro": False},
                "someone-else/studio-atlas-visual-factory",
            )


if __name__ == "__main__":
    unittest.main()
