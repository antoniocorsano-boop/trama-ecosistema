import unittest, tempfile, wave
from pathlib import Path
from af09_v7_nicola import plan,write_scene,compare
from af08_v7_production import scene_plan
class AF09Tests(unittest.TestCase):
    def test_exact_text(self):
        p=plan();self.assertEqual(len(p),5)
        for s,original in zip(p,scene_plan(),strict=True):
            self.assertEqual(s["canonical_text"],original["canonical_text"])
            self.assertEqual(" ".join(x["text"] for x in s["segments"]),original["spoken_text"])
            self.assertEqual(s["segments"][-1]["pause_after_ms"],0)
    def test_no_semantic_normalization(self):
        self.assertEqual(compare("Dopo centodiciassette tentativi","Dopo 117 tentativi"),[])
        self.assertTrue(compare("attenzione, verifica e responsabilità","attenzione, attenzione e responsabilità"))
        self.assertTrue(compare("a iks centodiciotto","ai ci si 118"))
    def test_pcm_preserved(self):
        with tempfile.TemporaryDirectory() as d:
            d=Path(d);paths=[]
            for i in range(2):
                p=d/f"{i}.wav";paths.append(p)
                with wave.open(str(p),"wb") as w:
                    w.setnchannels(1);w.setsampwidth(2);w.setframerate(24000);w.writeframes(bytes([i+1,0])*100)
            seg=[{"id":"a","pause_after_ms":260},{"id":"b","pause_after_ms":0}]
            out=d/"scene.wav";timing=write_scene(paths,seg,out)
            with wave.open(str(out),"rb") as f:pcm=f.readframes(f.getnframes())
            self.assertEqual(pcm,bytes([1,0])*100+bytes(260*48)+bytes([2,0])*100)
            self.assertEqual(timing[1]["start_frame"],100+260*24)
