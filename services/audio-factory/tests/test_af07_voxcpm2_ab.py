import sys, unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from af07_voxcpm2_ab import plan, command, TEXT, SEED, IDENTITY

class VoxDesignTests(unittest.TestCase):
    def test_identical_text_and_seed_different_style(self):
        a,b=plan()
        self.assertEqual([a["id"],b["id"]],["A","B"])
        self.assertEqual(a["text"],b["text"])
        self.assertEqual(a["text"],TEXT)
        self.assertEqual(a["seed"],b["seed"])
        self.assertTrue(all(x["instruction"].startswith(IDENTITY) for x in (a,b)))
        self.assertNotEqual(a["instruction"],b["instruction"])
    def test_cpu_only_no_reference(self):
        for x in plan():
            cmd=command("cli","base","acoustic","out.wav",x)
            self.assertIn("--cpu",cmd)
            self.assertEqual(cmd[cmd.index("--seed")+1],str(SEED))
            self.assertTrue(cmd[cmd.index("-t")+1].endswith(TEXT))
            self.assertNotIn("-r",cmd)
            self.assertNotIn("--reference",cmd)
            self.assertFalse(x["reference_audio"])
        with self.assertRaises(ValueError):
            command("cli","base","acoustic","out.wav",{"id":"other"})
