"""November 2026 evidence-bound ecosystem graph admission contract.

The proposal is not authority. Only the canonical v0.3 graph may claim realization.
"""
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
GRAPH = ROOT / "governance/access/trama-ecosystem-state-v0.3.json"
PROPOSAL = ROOT / "docs/evidence/ecosystem-state-v0.3-admission-candidates-2026-11-03.json"
RECEIPT = ROOT / "docs/evidence/ecosystem-state-v0.3-admission-receipt-2026-11-03.md"


class EcosystemNovemberAdmissionTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.graph = json.loads(GRAPH.read_text(encoding="utf-8"))
        cls.proposal = json.loads(PROPOSAL.read_text(encoding="utf-8"))
        cls.nodes = {x["id"]: x for x in cls.graph["nodes"]}
        cls.flows = {x["id"]: x for x in cls.graph["flows"]}

    def test_topology_extends_not_replaces_v03(self):
        self.assertEqual(self.graph["schemaVersion"], "trama.ecosystem.state/v0.3")
        self.assertEqual(self.graph["asOf"], "2026-11-03")
        self.assertEqual(len(self.nodes), 18)
        self.assertEqual(len(self.flows), 19)
        self.assertIn("trama_access", self.nodes)
        self.assertIn("arena_to_curricolo_atlas", self.flows)

    def test_three_new_nodes_have_bounded_realization_not_invented_maturity(self):
        expected = {"registro_docente": "REAL", "contextual_copilot_core": "REAL", "local_semantic_memory": "PARTIAL"}
        for node_id, state in expected.items():
            with self.subTest(node=node_id):
                node = self.nodes[node_id]
                self.assertEqual(node["state"], state)
                self.assertEqual(node["targetState"], "REAL")
                self.assertIsNone(node["maturityRef"])
                self.assertTrue(node["evidenceRefs"])
                self.assertTrue(node["authorityRefs"])
                self.assertTrue(node["sourceRefs"])
                self.assertTrue(node["boundary"])
        self.assertEqual(self.nodes["registro_docente"]["authorityOwner"], "registro-docente")
        self.assertEqual(self.nodes["contextual_copilot_core"]["authorityOwner"], "trama")

    def test_three_new_flows_do_not_claim_unproven_integrations(self):
        expected = {
            "registro_docente_to_contextual_copilot_core": ("registro_docente", "contextual_copilot_core", "PARTIAL"),
            "registro_docente_to_local_semantic_memory": ("registro_docente", "local_semantic_memory", "PARTIAL"),
            "docente_os_to_registro_docente": ("docente_os", "registro_docente", "DESIGNED"),
        }
        for flow_id, (source, target, state) in expected.items():
            with self.subTest(flow=flow_id):
                flow = self.flows[flow_id]
                self.assertEqual((flow["from"], flow["to"], flow["state"]), (source, target, state))
                self.assertEqual(flow["targetState"], "REAL")
                self.assertTrue(flow["gap"]["missing"])
                self.assertTrue(flow["authorityRefs"])
                self.assertTrue(flow["nextAllowedIntervention"]["preconditions"] or flow["nextAllowedIntervention"]["forbiddenUntil"])

    def test_protected_boundaries_remain_unchanged(self):
        self.assertEqual(self.nodes["trama_access"]["state"], "PARTIAL")
        self.assertEqual(self.nodes["professional_identity"]["state"], "PARTIAL")
        self.assertEqual(self.flows["gateway_to_trama_access"]["state"], "DESIGNED")
        self.assertEqual(self.flows["trama_access_to_docente_os"]["state"], "DESIGNED")
        self.assertEqual(self.flows["docente_os_to_studio_atlas"]["state"], "DESIGNED")
        self.assertEqual(self.flows["arena_to_curricolo_atlas"]["state"], "REAL")
        self.assertEqual(self.nodes["docente_os"]["maturityRef"], "docente-os")
        self.assertTrue(self.graph["transitionPolicy"]["autoPromotion"] is False)

    def test_retrievable_receipt_and_human_approved_proposal(self):
        self.assertTrue(RECEIPT.is_file(), "missing governed admission receipt")
        receipt_ref = "path:docs/evidence/ecosystem-state-v0.3-admission-receipt-2026-11-03.md"
        for item in list(self.nodes.values()) + list(self.flows.values()):
            if item["id"] in {
                "registro_docente", "contextual_copilot_core", "local_semantic_memory",
                "registro_docente_to_contextual_copilot_core", "registro_docente_to_local_semantic_memory",
                "docente_os_to_registro_docente"
            }:
                self.assertIn(receipt_ref, item["evidenceRefs"], item["id"])
        self.assertEqual(self.proposal["status"], "PROPOSAL_ONLY_NOT_CANONICAL")


if __name__ == "__main__":
    unittest.main()
