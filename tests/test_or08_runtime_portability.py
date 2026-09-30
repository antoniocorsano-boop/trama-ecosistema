import copy,json,unittest
from scripts.validate_or08_runtime_portability import base_case,load_matrix,materialize_invalid,qualify_matrix,validate_case

class Or08RuntimePortabilityTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.matrix=load_matrix()
        cls.base=base_case(cls.matrix)

    def test_valid_portability_matrix_passes(self):
        self.assertEqual(validate_case(self.base),[])

    def test_two_distinct_provider_profiles(self):
        providers={a["providerType"] for a in self.base["adapters"]}
        self.assertGreaterEqual(len(providers),2)

    def test_semantic_outputs_match(self):
        semantic=[a["result"]["semantic"] for a in self.base["adapters"]]
        self.assertEqual(semantic[0],semantic[1])

    def test_invalid_matrix_fails_closed(self):
        for item in self.matrix["invalid"]:
            with self.subTest(item=item["id"]):
                errors=validate_case(materialize_invalid(self.base,item))
                self.assertTrue(errors)
                for code in item["expect"]:
                    self.assertIn(code,errors)

    def test_qualification_is_portable_contract(self):
        result=qualify_matrix(self.matrix)
        self.assertTrue(result["pass"])
        self.assertEqual(result["portabilityClass"],"PORTABLE_CONTRACT")

    def test_canonical_request_is_deterministic(self):
        a=json.dumps(self.base["canonicalRequest"],ensure_ascii=False,sort_keys=True,separators=(",",":"))
        b=json.dumps(copy.deepcopy(self.base["canonicalRequest"]),ensure_ascii=False,sort_keys=True,separators=(",",":"))
        self.assertEqual(a,b)

if __name__=="__main__":
    unittest.main()
