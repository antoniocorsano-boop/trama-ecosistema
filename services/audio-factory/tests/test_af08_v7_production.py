import tempfile, unittest, wave
from pathlib import Path
from af08_v7_production import scene_plan, assemble, lexical_difference, PAUSE_FRAMES
class V7ProductionTests(unittest.TestCase):
    def test_exact_script_and_spoken_layer(self):
        scenes=scene_plan()
        self.assertEqual([x["scene"] for x in scenes],list(range(1,6)))
        self.assertIn("AX-118",scenes[2]["canonical_text"])
        self.assertIn("a iks centodiciotto",scenes[2]["spoken_text"])
        for i in (0,1,3,4):
            self.assertEqual(scenes[i]["canonical_text"],scenes[i]["spoken_text"])
    def test_assembly_preserves_frames(self):
        with tempfile.TemporaryDirectory() as d:
            d=Path(d); paths=[]
            for i in range(5):
                p=d/f"{i}.wav"; paths.append(p)
                with wave.open(str(p),"wb") as w:
                    w.setnchannels(1); w.setsampwidth(2); w.setframerate(24000)
                    w.writeframes(bytes([i+1,0])*100)
            out=d/"montage.wav"; report=assemble(paths,out)
            with wave.open(str(out),"rb") as f:
                pcm=f.readframes(f.getnframes())
            self.assertEqual(len(pcm),2*(500+4*PAUSE_FRAMES))
            for i,s in enumerate(report["scenes"]):
                self.assertEqual(pcm[2*s["start_frame"]:2*s["end_frame"]],bytes([i+1,0])*100)
            with self.assertRaises(ValueError): assemble(paths[:4],d/"invalid.wav")
    def test_lexical_comparison(self):
        self.assertEqual(lexical_difference("Una frase.","Una frase"),[])
        self.assertTrue(lexical_difference("a iks","ai ci si"))
    def test_source_tamper_rejected(self):
        with tempfile.TemporaryDirectory() as d:
            p=Path(d)/"script.md"; p.write_text("tampered")
            with self.assertRaises(ValueError): scene_plan(p)
