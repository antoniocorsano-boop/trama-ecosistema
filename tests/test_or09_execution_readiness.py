import copy,json,unittest
from scripts.validate_or09_execution_readiness import base_case,load_matrix,materialize_invalid,qualify_matrix,validate_case

class Or09ExecutionReadinessTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.matrix=load_matrix()
        cls.base=base_case(cls.matrix)

    def test_valid_readiness_package_passes(self):
        self.assertEqual(validate_case(self.base),[])

    def test_state_stops_before_authorization(self):
        result=qualify_matrix(self.matrix)
        self.assertEqual(result["maxReachableState"],"AWAITING_HUMAN_AUTHORIZATION")
        self.assertFalse(result["runtimeAuthorized"])

    def test_defaults_are_non_live(self):
        self.assertFalse(self.base["liveRuntime"])
        self.assertFalse(self.base["networkEnabled"])
        self.assertFalse(self.base["mutationAuthorized"])
        self.assertEqual(self.base["executionProfile"]["retryPolicy"]["maxRetries"],0)

    def test_negative_fixtures_fail_closed(self):
        for item in self.matrix["invalid"]:
            with self.subTest(item=item["id"]):
                errors=validate_case(materialize_invalid(self.base,item))
                self.assertTrue(errors)
                for code in item["expect"]:
                    self.assertIn(code,errors)

    def test_matrix_qualification_passes(self):
        self.assertTrue(qualify_matrix(self.matrix)["pass"])

    def test_serialization_is_deterministic(self):
        a=json.dumps(self.base,ensure_ascii=False,sort_keys=True,separators=(",",":"))
        b=json.dumps(copy.deepcopy(self.base),ensure_ascii=False,sort_keys=True,separators=(",",":"))
        self.assertEqual(a,b)

if __name__=="__main__":
    unittest.main()
