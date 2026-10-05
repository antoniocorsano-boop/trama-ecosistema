import datetime as dt
import importlib.util
import json
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "scripts" / "compile_visual_factory_compute_plan.py"

spec = importlib.util.spec_from_file_location("compute_plan", SCRIPT)
module = importlib.util.module_from_spec(spec)
assert spec and spec.loader
spec.loader.exec_module(module)

FIX = ROOT / "fixtures" / "visual-factory-compute"


class ComputePolicyTests(unittest.TestCase):
    def setUp(self):
        self.policy = json.loads((FIX / "policy-free-q4.json").read_text())
        self.now = dt.datetime(2026, 10, 4, 13, 30, tzinfo=dt.timezone.utc)

    def test_free_candidates_only_and_ordered_by_remaining_runs(self):
        snapshot = json.loads((FIX / "snapshot-eligible.json").read_text())
        plan = module.compile_plan(self.policy, snapshot, self.now)
        self.assertEqual(plan["decision"], "PLAN_READY")
        self.assertEqual(
            [x["providerId"] for x in plan["selectedCandidates"]],
            ["owned-k8s-lab", "cloud-credit-a"],
        )
        self.assertNotIn("paid-only", [x["providerId"] for x in plan["selectedCandidates"]])
        excluded = {x["providerId"]: x["reasons"] for x in plan["excludedProviders"]}
        self.assertIn("NOT_ZERO_MARGINAL_COST", excluded["paid-only"])

    def test_no_free_provider_stops(self):
        snapshot = json.loads((FIX / "snapshot-no-free.json").read_text())
        plan = module.compile_plan(self.policy, snapshot, self.now)
        self.assertEqual(plan["decision"], "STOP_NO_FREE_PROVIDER")
        self.assertEqual(plan["selectedCandidates"], [])

    def test_stale_snapshot_stops_before_provider_selection(self):
        snapshot = json.loads((FIX / "snapshot-eligible.json").read_text())
        later = dt.datetime(2026, 10, 4, 15, 0, tzinfo=dt.timezone.utc)
        plan = module.compile_plan(self.policy, snapshot, later)
        self.assertEqual(plan["decision"], "STOP_STALE_ENTITLEMENT_SNAPSHOT")
        self.assertEqual(plan["selectedCandidates"], [])

    def test_skypilot_yaml_contains_only_selected_candidates(self):
        snapshot = json.loads((FIX / "snapshot-eligible.json").read_text())
        plan = module.compile_plan(self.policy, snapshot, self.now)
        rendered = module.render_skypilot_yaml(plan, self.policy)
        self.assertIn("k8s/visual-factory-lab", rendered)
        self.assertIn("gcp", rendered)
        self.assertNotIn("aws", rendered)
        self.assertIn("down: true", rendered)


if __name__ == "__main__":
    unittest.main()
