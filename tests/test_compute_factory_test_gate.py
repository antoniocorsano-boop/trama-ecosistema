import io
import unittest
from scripts.verify_compute_factory_test_gate import complete, main

class GateTests(unittest.TestCase):
    def run_case(self, fn):
        return unittest.TextTestRunner(stream=io.StringIO()).run(unittest.FunctionTestCase(fn))

    def test_complete(self):
        self.assertTrue(complete(self.run_case(lambda: None), 1))

    def test_empty_or_incomplete(self):
        result = self.run_case(lambda: None)
        self.assertFalse(complete(result, 2))
        self.assertFalse(complete(result, 0))

    def test_skip(self):
        def skip():
            raise unittest.SkipTest("missing pinned source")
        self.assertFalse(complete(self.run_case(skip), 1))

    def test_failure(self):
        def fail():
            raise AssertionError("test failure")
        self.assertFalse(complete(self.run_case(fail), 1))

    def test_wrong_suite_or_count(self):
        self.assertEqual(main(["unapproved", "9"]), 2)
        self.assertEqual(main(["tests.test_compute_factory_convergence", "0"]), 2)

    def test_expected_failure(self):
        class X(unittest.TestCase):
            @unittest.expectedFailure
            def test_case(self):
                self.fail("expected")
        result = unittest.TextTestRunner(stream=io.StringIO()).run(
            unittest.defaultTestLoader.loadTestsFromTestCase(X))
        self.assertFalse(complete(result, 1))

if __name__ == "__main__":
    unittest.main()
