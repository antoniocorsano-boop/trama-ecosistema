"""Fail closed if a mandatory offline unittest suite is skipped or incomplete."""
import sys
import unittest

ALLOWED = {
    "tests.test_compute_factory_convergence": 9,
    "tests.test_compute_factory_storie_profile": 8,
    "tests.test_j07_compute_review": 5,
    "tests.test_owned_cpu_j07": 8,
}

def complete(result, expected):
    return (type(expected) is int and expected > 0 and result.testsRun == expected
            and result.wasSuccessful() and not result.skipped
            and not result.expectedFailures and not result.unexpectedSuccesses)

def main(argv):
    if len(argv) != 2 or argv[0] not in ALLOWED or argv[1] != str(ALLOWED[argv[0]]):
        print("mandatory test suite or expected count mismatch", file=sys.stderr)
        return 2
    suite = unittest.defaultTestLoader.loadTestsFromName(argv[0])
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    if not complete(result, ALLOWED[argv[0]]):
        print("CF mandatory qualification incomplete", file=sys.stderr)
        return 1
    return 0

if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
