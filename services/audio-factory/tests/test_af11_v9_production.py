import unittest, tempfile
from pathlib import Path
from af11_v9_production import plan, authorization, APPROVED, verified_reuse, captions, REPO, BRANCH, BASE

class AF11Tests(unittest.TestCase):
    def test_plan(self):
        s=plan(); u=[u for row in s for u in row["units"]]
        self.assertEqual(len(s),5); self.assertEqual(len(u),14)
        self.assertEqual([x["id"] for x in u if x["reuse"]],["S3U3","S5U3"])
        self.assertEqual(sum(not x["reuse"] for x in u),12)
        self.assertEqual(u[7]["text"],"Anche una macchina può sbagliare. Come ce ne accorgiamo?")
        self.assertEqual(u[-1]["text"],"Per cambiare il futuro servono tre cose: attenzione, verifica e responsabilità.")
    def test_authorization(self):
        h="a"*40
        e={"number":312,"action":"labeled","repository":{"private":False,"full_name":REPO},"label":{"name":"af11-"+h},"pull_request":{"head":{"sha":h,"ref":BRANCH,"repo":{"full_name":REPO}},"base":{"ref":BASE}}}
        self.assertEqual(authorization(e,"1","pull_request"),h)
        for attempt,event,cred in [("2","pull_request",False),("1","push",False),("1","pull_request",True)]:
            with self.assertRaises(ValueError): authorization(e,attempt,event,cred)
        e["label"]["name"]="af10-"+h
        with self.assertRaises(ValueError): authorization(e,"1","pull_request")
    def test_reuse_fails_closed(self):
        with tempfile.TemporaryDirectory() as d:
            root=Path(d); (root/"A").mkdir()
            (root/"A"/"S3U3.wav").write_bytes(b"bad")
            with self.assertRaisesRegex(ValueError,"APPROVED_AUDIO_DRIFT"): verified_reuse(root)
    def test_captions(self):
        scene={"scene":1,"units":[{"id":"S1U1","text":"Testo."}]}
        row={"timing":[{"id":"S1U1","start_frame":0,"end_frame":24000}]}
        s,t=captions([scene],[row],{"scenes":[{"start_frame":12000}]})
        self.assertIn("00:00:00,500 --> 00:00:01,500",s)
        self.assertEqual(t[0]["start_frame"],12000)
