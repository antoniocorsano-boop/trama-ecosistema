import copy, json, unittest
from scripts.validate_or07_shared_capability_layer import load_matrix,materialize_invalid,qualify_matrix,validate_case

class Or07SharedCapabilityLayerTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.matrix=load_matrix()
        cls.base={k:copy.deepcopy(v) for k,v in cls.matrix.items() if k!="invalid"}

    def case_with_product(self,product):
        case=copy.deepcopy(self.base)
        case["request"]["caller"]["product"]=product
        return case

    def test_valid_fixture_passes(self):
        self.assertEqual(validate_case(self.base),[])

    def test_two_fake_adapters_are_semantically_equivalent(self):
        outputs=[a["result"]["output"] for a in self.base["adapters"]]
        self.assertEqual(outputs[0],outputs[1])
        self.assertNotEqual(self.base["adapters"][0]["providerId"],self.base["adapters"][1]["providerId"])

    def test_governed_new_product_callers_are_registered(self):
        for product in ("REGISTRO_DOCENTE","STUDIO_ATLAS"):
            with self.subTest(product=product):
                self.assertNotIn("SC-11",validate_case(self.case_with_product(product)))

    def test_unregistered_product_callers_fail_closed(self):
        for product in ("OTHER_GOVERNED","UNKNOWN_PRODUCT"):
            with self.subTest(product=product):
                self.assertIn("SC-11",validate_case(self.case_with_product(product)))

    def test_all_negative_fixtures_fail_closed(self):
        self.assertGreaterEqual(len(self.matrix["invalid"]),8)
        for item in self.matrix["invalid"]:
            with self.subTest(item=item["id"]):
                errors=validate_case(materialize_invalid(self.base,item))
                self.assertTrue(errors)
                for code in item["expect"]:
                    self.assertIn(code,errors)

    def test_matrix_qualification_passes(self):
        self.assertTrue(qualify_matrix(self.matrix)["pass"])

    def test_canonical_serialization_is_deterministic(self):
        a=json.dumps(self.base,ensure_ascii=False,sort_keys=True,separators=(",",":"))
        b=json.dumps(copy.deepcopy(self.base),ensure_ascii=False,sort_keys=True,separators=(",",":"))
        self.assertEqual(a,b)

if __name__=="__main__":
    unittest.main()
