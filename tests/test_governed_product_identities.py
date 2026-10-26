import copy
import unittest

from scripts.validate_governed_product_identities import (
    is_registered_product,
    load_product_registry,
    registered_product_ids,
    validate_product_registry,
)


EXPECTED_IDS = {
    "ARENA",
    "ATLAS",
    "DOCENTE_OS",
    "REGISTRO_DOCENTE",
    "STUDIO_ATLAS",
    "CONTROL_CENTER",
}

EXPECTED_ROLES = {
    "ARENA": "CURRICOLO_AUTHORITY",
    "ATLAS": "PUBLIC_LEARNER_SURFACE",
    "DOCENTE_OS": "TEACHER_OPERATIONAL",
    "REGISTRO_DOCENTE": "TEACHER_RECORD",
    "STUDIO_ATLAS": "PROFESSIONAL_AUTHORING",
    "CONTROL_CENTER": "READ_ONLY_OBSERVER",
}


class GovernedProductIdentityTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.registry = load_product_registry()

    def test_exact_governed_product_ids_are_registered(self):
        self.assertEqual(registered_product_ids(self.registry), EXPECTED_IDS)

    def test_new_product_identities_are_first_class_and_placeholders_fail_closed(self):
        self.assertTrue(is_registered_product("REGISTRO_DOCENTE", self.registry))
        self.assertTrue(is_registered_product("STUDIO_ATLAS", self.registry))
        self.assertFalse(is_registered_product("OTHER_GOVERNED", self.registry))
        self.assertFalse(is_registered_product("UNKNOWN_PRODUCT", self.registry))

    def test_domain_roles_are_exact_and_aliases_are_forbidden(self):
        products = {p["id"]: p for p in self.registry["products"]}
        self.assertEqual({k: v["domainRole"] for k, v in products.items()}, EXPECTED_ROLES)
        self.assertTrue(all(p["aliasOf"] is None for p in products.values()))

    def test_control_center_is_read_only(self):
        products = {p["id"]: p for p in self.registry["products"]}
        self.assertEqual(products["CONTROL_CENTER"]["controlClass"], "READ_ONLY")

    def test_valid_registry_passes(self):
        self.assertEqual(validate_product_registry(self.registry), [])

    def test_duplicate_id_fails(self):
        data = copy.deepcopy(self.registry)
        data["products"].append(copy.deepcopy(data["products"][0]))
        self.assertIn("duplicateProductId", validate_product_registry(data))

    def test_missing_domain_role_fails(self):
        data = copy.deepcopy(self.registry)
        data["products"][0].pop("domainRole")
        self.assertIn("domainRole", validate_product_registry(data))

    def test_alias_fails(self):
        data = copy.deepcopy(self.registry)
        target = next(p for p in data["products"] if p["id"] == "REGISTRO_DOCENTE")
        target["aliasOf"] = "DOCENTE_OS"
        self.assertIn("aliasOf", validate_product_registry(data))

    def test_writable_control_center_fails(self):
        data = copy.deepcopy(self.registry)
        target = next(p for p in data["products"] if p["id"] == "CONTROL_CENTER")
        target["controlClass"] = "WRITE"
        self.assertIn("controlCenterReadOnly", validate_product_registry(data))

    def test_disabled_shared_capability_caller_fails(self):
        data = copy.deepcopy(self.registry)
        data["products"][0]["sharedCapabilityCaller"] = False
        self.assertIn("sharedCapabilityCaller", validate_product_registry(data))


if __name__ == "__main__":
    unittest.main()
