import math, sys, unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from af07_acoustic_review import low_energy_runs,pitch_window

class AcousticReviewTests(unittest.TestCase):
    def test_internal_pause_not_edges(self):
        sr=24000
        x=[0.0]*4800+[.1]*4800+[0.0]*4800+[.1]*4800+[0.0]*4800
        self.assertEqual(low_energy_runs(x,sr),[{"start":.4,"end":.6,"seconds":.2}])
    def test_sustained_signal_is_not_silence(self):
        sr=24000
        x=[.1*math.sin(2*math.pi*200*i/sr) for i in range(sr)]
        self.assertEqual(low_energy_runs(x,sr),[])
    def test_no_pitch_is_not_zero_hz(self):
        self.assertIsNone(pitch_window([.1,.2],[0,0],0,.3)["median_f0_hz"])
        self.assertEqual(pitch_window([.1,.2,.3],[200,0,220],0,.4)["median_f0_hz"],210)
        with self.assertRaises(ValueError): pitch_window([.1],[200],1,0)
