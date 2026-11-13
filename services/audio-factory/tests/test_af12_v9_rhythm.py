import unittest,tempfile,wave,struct
from pathlib import Path
from af12_v9_rhythm import plan,gap,arrange,authorization,REPO,BRANCH,BASE,verified_source
from af11_v9_production import plan as original_plan
from af09_v7_nicola import write_scene

class AF12Tests(unittest.TestCase):
    def test_scope(self):
        s=plan(); units=[u for x in s for u in x["units"]]; old=[u for x in original_plan() for u in x["units"]]
        self.assertEqual(len(s),5);self.assertEqual(len(units),14)
        self.assertEqual([u["id"] for u in units if not u["reuse"]],["S4U3"])
        self.assertEqual([u["id"] for u,v in zip(units,old) if u["text"]!=v["text"]],["S4U3"])
        self.assertEqual(next(u["text"] for u in units if not u["reuse"]),"Poi deve chiedere un controllo.")
    def test_no_negative_pause(self):
        self.assertEqual(gap(500,260,220),20)
        self.assertEqual(gap(500,300,300),0)
    def test_preserve_pcm(self):
        with tempfile.TemporaryDirectory() as d:
            root=Path(d); paths=[]; pcm=bytes(240*2*20)+struct.pack("<h",500)*2400+bytes(240*2*25)
            for i in range(2):
                p=root/f"{i}.wav"; paths.append(p)
                with wave.open(str(p),"wb") as w:
                    w.setnchannels(1);w.setsampwidth(2);w.setframerate(24000);w.writeframes(pcm)
            segs,ev=arrange(paths,[{"id":"a","target_gap_ms":500},{"id":"b","target_gap_ms":0}])
            self.assertEqual(segs[0]["pause_after_ms"],50)
            self.assertEqual(ev[0]["estimated_total_ms"],500)
            out=root/"out.wav";write_scene(paths,segs,out)
            with wave.open(str(out),"rb") as w: self.assertEqual(w.readframes(w.getnframes()),pcm+bytes(50*48)+pcm)
    def test_authorization(self):
        h="a"*40
        e={"number":312,"action":"labeled","repository":{"private":False,"full_name":REPO},"label":{"name":"af12-"+h},"pull_request":{"head":{"sha":h,"ref":BRANCH,"repo":{"full_name":REPO}},"base":{"ref":BASE}}}
        self.assertEqual(authorization(e,"1","pull_request"),h)
        with self.assertRaises(ValueError):authorization(e,"2","pull_request")
        e["label"]["name"]="af11-"+h
        with self.assertRaises(ValueError):authorization(e,"1","pull_request")
    def test_source_fail_closed(self):
        with tempfile.TemporaryDirectory() as d:
            p=Path(d);(p/"receipt.json").write_text("{}");(p/"plan.json").write_text("[]")
            with self.assertRaisesRegex(ValueError,"SOURCE_METADATA_DRIFT"):verified_source(p)
